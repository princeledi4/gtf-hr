import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

// Database file path
const DB_FILE = path.join(__dirname, 'database.json');

// Load database from JSON file
let db = {};
try {
  const data = fs.readFileSync(DB_FILE, 'utf8');
  db = JSON.parse(data);
} catch (error) {
  console.error('Error loading database:', error);
  // Initialize with empty structure if file doesn't exist
  db = {
    users: [],
    roles: [],
    permissions: [],
    departments: [],
    appraisals: [],
    leaveRequests: [],
    timeEntries: [],
    notifications: [],
    integrations: [],
    systemSettings: {},
    onboarding: [],
    attendanceUploads: [],
    documents: [],
    documentAuditLogs: []
  };
}

// Save database to JSON file
const saveDatabase = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error saving database:', error);
  }
};

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Role-based access control middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// AUTH ROUTES
app.post('/api/auth/login', async (req, res) => {
  try {
    const rawEmail = (req.body?.email ?? '').toString();
    const rawPassword = (req.body?.password ?? '').toString();

    const email = rawEmail.trim().toLowerCase();
    const password = rawPassword.trim();

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = db.users.find(u => (u.email || '').toLowerCase() === email);
    if (!user || typeof user.password !== 'string' || user.password.length < 10) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    let validPassword = false;
    try {
      validPassword = await bcrypt.compare(password, user.password);
    } catch (cmpErr) {
      console.error('bcrypt.compare error:', cmpErr);
      // Treat as invalid credentials instead of 500
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login route error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// USER ROUTES
app.get('/api/users/me', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.put('/api/users/me', authenticateToken, (req, res) => {
  const userIndex = db.users.findIndex(u => u.id === req.user.id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  db.users[userIndex] = { ...db.users[userIndex], ...req.body, id: req.user.id };
  saveDatabase();
  const { password: _, ...userWithoutPassword } = db.users[userIndex];
  res.json(userWithoutPassword);
});

app.post('/api/users/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userIndex = db.users.findIndex(u => u.id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(currentPassword, db.users[userIndex].password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.users[userIndex].password = hashedPassword;
    saveDatabase();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/users/toggle-2fa', authenticateToken, (req, res) => {
  const userIndex = db.users.findIndex(u => u.id === req.user.id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  db.users[userIndex].twoFactorEnabled = !db.users[userIndex].twoFactorEnabled;
  saveDatabase();
  res.json({ twoFactorEnabled: db.users[userIndex].twoFactorEnabled });
});

// EMPLOYEE ROUTES
app.get('/api/employees', authenticateToken, requireRole(['hr', 'admin']), (req, res) => {
  const employees = db.users.map(({ password, ...user }) => user);
  res.json(employees);
});

app.post('/api/employees', authenticateToken, requireRole(['hr', 'admin']), async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password || 'defaultPassword123', 10);
    const newEmployee = {
      id: uuidv4(),
      ...req.body,
      password: hashedPassword,
      employeeId: `EMP${String(db.users.length + 1).padStart(3, '0')}`,
      status: 'active',
      twoFactorEnabled: false,
      onboardingStatus: 'pending',
      onboardingProgress: 0,
    };
    
    db.users.push(newEmployee);
    saveDatabase();
    const { password: _, ...employeeWithoutPassword } = newEmployee;
    res.status(201).json(employeeWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/employees/:id', authenticateToken, requireRole(['hr', 'admin']), (req, res) => {
  const userIndex = db.users.findIndex(u => u.id === req.params.id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  db.users[userIndex] = { ...db.users[userIndex], ...req.body, id: req.params.id };
  saveDatabase();
  const { password: _, ...employeeWithoutPassword } = db.users[userIndex];
  res.json(employeeWithoutPassword);
});

app.delete('/api/employees/:id', authenticateToken, requireRole(['hr', 'admin']), (req, res) => {
  const userIndex = db.users.findIndex(u => u.id === req.params.id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  db.users.splice(userIndex, 1);
  saveDatabase();
  res.status(204).send();
});

// ROLE ROUTES
app.get('/api/roles', authenticateToken, requireRole(['admin']), (req, res) => {
  res.json(db.roles);
});

app.post('/api/roles', authenticateToken, requireRole(['admin']), (req, res) => {
  const newRole = {
    id: uuidv4(),
    ...req.body,
    userCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  db.roles.push(newRole);
  saveDatabase();
  res.status(201).json(newRole);
});

app.put('/api/roles/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  const roleIndex = db.roles.findIndex(r => r.id === req.params.id);
  if (roleIndex === -1) {
    return res.status(404).json({ error: 'Role not found' });
  }

  db.roles[roleIndex] = { 
    ...db.roles[roleIndex], 
    ...req.body, 
    id: req.params.id,
    updatedAt: new Date().toISOString(),
  };
  saveDatabase();
  res.json(db.roles[roleIndex]);
});

app.delete('/api/roles/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  const roleIndex = db.roles.findIndex(r => r.id === req.params.id);
  if (roleIndex === -1) {
    return res.status(404).json({ error: 'Role not found' });
  }

  db.roles.splice(roleIndex, 1);
  saveDatabase();
  res.status(204).send();
});

// PERMISSION ROUTES
app.get('/api/permissions', authenticateToken, requireRole(['admin']), (req, res) => {
  res.json(db.permissions);
});

app.post('/api/permissions', authenticateToken, requireRole(['admin']), (req, res) => {
  const newPermission = {
    id: uuidv4(),
    ...req.body,
  };
  
  db.permissions.push(newPermission);
  saveDatabase();
  res.status(201).json(newPermission);
});

app.put('/api/permissions/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  const permissionIndex = db.permissions.findIndex(p => p.id === req.params.id);
  if (permissionIndex === -1) {
    return res.status(404).json({ error: 'Permission not found' });
  }

  db.permissions[permissionIndex] = { ...db.permissions[permissionIndex], ...req.body, id: req.params.id };
  saveDatabase();
  res.json(db.permissions[permissionIndex]);
});

app.delete('/api/permissions/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  const permissionIndex = db.permissions.findIndex(p => p.id === req.params.id);
  if (permissionIndex === -1) {
    return res.status(404).json({ error: 'Permission not found' });
  }

  db.permissions.splice(permissionIndex, 1);
  saveDatabase();
  res.status(204).send();
});

// DEPARTMENT ROUTES
app.get('/api/departments', authenticateToken, requireRole(['hr', 'admin']), (req, res) => {
  res.json(db.departments);
});

app.post('/api/departments', authenticateToken, requireRole(['hr', 'admin']), (req, res) => {
  const newDepartment = {
    id: uuidv4(),
    ...req.body,
    employeeCount: 0,
    createdAt: new Date().toISOString(),
  };
  
  db.departments.push(newDepartment);
  saveDatabase();
  res.status(201).json(newDepartment);
});

app.put('/api/departments/:id', authenticateToken, requireRole(['hr', 'admin']), (req, res) => {
  const deptIndex = db.departments.findIndex(d => d.id === req.params.id);
  if (deptIndex === -1) {
    return res.status(404).json({ error: 'Department not found' });
  }

  db.departments[deptIndex] = { ...db.departments[deptIndex], ...req.body, id: req.params.id };
  saveDatabase();
  res.json(db.departments[deptIndex]);
});

app.delete('/api/departments/:id', authenticateToken, requireRole(['hr', 'admin']), (req, res) => {
  const deptIndex = db.departments.findIndex(d => d.id === req.params.id);
  if (deptIndex === -1) {
    return res.status(404).json({ error: 'Department not found' });
  }

  db.departments.splice(deptIndex, 1);
  saveDatabase();
  res.status(204).send();
});

// APPRAISAL ROUTES
app.get('/api/appraisals', authenticateToken, (req, res) => {
  if (req.user.role === 'employee') {
    const userAppraisals = db.appraisals.filter(a => a.employeeId === req.user.id);
    res.json(userAppraisals);
  } else {
    res.json(db.appraisals);
  }
});

app.post('/api/appraisals', authenticateToken, requireRole(['hr', 'admin']), (req, res) => {
  const newAppraisal = {
    id: uuidv4(),
    ...req.body,
    status: 'draft',
    overallScore: 0,
    overallComment: '',
    employeeComment: '',
    responses: [],
    createdAt: new Date().toISOString(),
  };
  
  db.appraisals.push(newAppraisal);
  saveDatabase();
  res.status(201).json(newAppraisal);
});

app.put('/api/appraisals/:id', authenticateToken, (req, res) => {
  const appraisalIndex = db.appraisals.findIndex(a => a.id === req.params.id);
  if (appraisalIndex === -1) {
    return res.status(404).json({ error: 'Appraisal not found' });
  }

  // Check permissions
  if (req.user.role === 'employee' && db.appraisals[appraisalIndex].employeeId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  db.appraisals[appraisalIndex] = { ...db.appraisals[appraisalIndex], ...req.body, id: req.params.id };
  saveDatabase();
  res.json(db.appraisals[appraisalIndex]);
});

app.delete('/api/appraisals/:id', authenticateToken, requireRole(['hr', 'admin']), (req, res) => {
  const appraisalIndex = db.appraisals.findIndex(a => a.id === req.params.id);
  if (appraisalIndex === -1) {
    return res.status(404).json({ error: 'Appraisal not found' });
  }

  db.appraisals.splice(appraisalIndex, 1);
  saveDatabase();
  res.status(204).send();
});

// LEAVE REQUEST ROUTES
app.get('/api/leave-requests', authenticateToken, (req, res) => {
  if (req.user.role === 'employee') {
    const userRequests = db.leaveRequests.filter(r => r.employeeId === req.user.id);
    res.json(userRequests);
  } else {
    res.json(db.leaveRequests);
  }
});

app.post('/api/leave-requests', authenticateToken, (req, res) => {
  // Find the employee to get their manager information
  const employee = db.users.find(u => u.id === req.user.id);
  const lineManager = employee?.managerId ? db.users.find(u => u.id === employee.managerId) : null;
  const headOfUnit = lineManager?.managerId ? db.users.find(u => u.id === lineManager.managerId) : null;
  
  const newRequest = {
    id: uuidv4(),
    employeeId: req.user.id,
    employeeName: req.user.name,
    ...req.body,
    status: 'line_manager_approval',
    lineManagerId: lineManager?.id,
    lineManagerName: lineManager?.name,
    headOfUnitId: headOfUnit?.id,
    headOfUnitName: headOfUnit?.name,
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  db.leaveRequests.push(newRequest);
  saveDatabase();
  res.status(201).json(newRequest);
});

app.put('/api/leave-requests/:id', authenticateToken, (req, res) => {
  const requestIndex = db.leaveRequests.findIndex(r => r.id === req.params.id);
  if (requestIndex === -1) {
    return res.status(404).json({ error: 'Leave request not found' });
  }

  const request = db.leaveRequests[requestIndex];
  
  // Check permissions based on role and approval level
  if (req.user.role === 'line_manager' && request.status === 'line_manager_approval' && request.lineManagerId === req.user.id) {
    // Line manager can approve/reject
    db.leaveRequests[requestIndex] = { 
      ...request, 
      ...req.body, 
      lineManagerApprovedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } else if (req.user.role === 'head_of_unit' && request.status === 'head_of_unit_approval' && request.headOfUnitId === req.user.id) {
    // Head of unit can approve/reject
    db.leaveRequests[requestIndex] = { 
      ...request, 
      ...req.body, 
      headOfUnitApprovedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } else if (req.user.role === 'hr' && request.status === 'hr_approval') {
    // HR can approve/reject
    db.leaveRequests[requestIndex] = { 
      ...request, 
      ...req.body, 
      hrApprovedBy: req.user.id,
      hrApprovedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } else if (req.user.role === 'admin') {
    // Admin can do anything
    db.leaveRequests[requestIndex] = { 
      ...request, 
      ...req.body, 
      updatedAt: new Date().toISOString()
    };
  } else {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  saveDatabase();
  res.json(db.leaveRequests[requestIndex]);
});

// ATTENDANCE UPLOAD ROUTES
app.get('/api/attendance-uploads', authenticateToken, (req, res) => {
  const userUploads = db.attendanceUploads.filter(upload => upload.employeeId === req.user.id);
  res.json(userUploads);
});

app.post('/api/attendance-uploads', authenticateToken, (req, res) => {
  const newUpload = {
    id: uuidv4(),
    employeeId: req.user.id,
    fileName: req.body.fileName,
    uploadDate: new Date().toISOString(),
    status: 'processed',
    totalHours: req.body.totalHours || 160,
    workingDays: req.body.workingDays || 20,
  };
  
  db.attendanceUploads.push(newUpload);
  saveDatabase();
  res.status(201).json(newUpload);
});

// ONBOARDING ROUTES
app.get('/api/onboarding/:employeeId', authenticateToken, (req, res) => {
  const onboarding = db.onboarding.find(o => o.employeeId === req.params.employeeId);
  if (!onboarding) {
    return res.status(404).json({ error: 'Onboarding record not found' });
  }
  res.json(onboarding);
});

app.put('/api/onboarding/:employeeId', authenticateToken, (req, res) => {
  const onboardingIndex = db.onboarding.findIndex(o => o.employeeId === req.params.employeeId);
  if (onboardingIndex === -1) {
    return res.status(404).json({ error: 'Onboarding record not found' });
  }

  db.onboarding[onboardingIndex] = { ...db.onboarding[onboardingIndex], ...req.body };
  saveDatabase();
  res.json(db.onboarding[onboardingIndex]);
});

// NOTIFICATION ROUTES
app.get('/api/notifications', authenticateToken, (req, res) => {
  const userNotifications = db.notifications.filter(n => n.userId === req.user.id);
  res.json(userNotifications);
});

app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const notificationIndex = db.notifications.findIndex(n => n.id === req.params.id && n.userId === req.user.id);
  if (notificationIndex === -1) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  db.notifications[notificationIndex].read = true;
  saveDatabase();
  res.json(db.notifications[notificationIndex]);
});

// INTEGRATION ROUTES
app.get('/api/integrations', authenticateToken, requireRole(['admin']), (req, res) => {
  res.json(db.integrations);
});

app.put('/api/integrations/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  const integrationIndex = db.integrations.findIndex(i => i.id === req.params.id);
  if (integrationIndex === -1) {
    return res.status(404).json({ error: 'Integration not found' });
  }

  db.integrations[integrationIndex] = { ...db.integrations[integrationIndex], ...req.body, id: req.params.id };
  saveDatabase();
  res.json(db.integrations[integrationIndex]);
});

// SYSTEM SETTINGS ROUTES
app.get('/api/system-settings', authenticateToken, requireRole(['admin']), (req, res) => {
  res.json(db.systemSettings);
});

app.put('/api/system-settings', authenticateToken, requireRole(['admin']), (req, res) => {
  db.systemSettings = { ...db.systemSettings, ...req.body };
  saveDatabase();
  res.json(db.systemSettings);
});

// DOCUMENT ROUTES
app.get('/api/documents', authenticateToken, (req, res) => {
  const { status, type, employeeId } = req.query;
  
  let filteredDocuments = db.documents;
  
  // Filter by user role
  if (req.user.role === 'employee') {
    filteredDocuments = filteredDocuments.filter(doc => doc.employeeId === req.user.id);
  }
  
  // Apply filters
  if (status && status !== 'all') {
    filteredDocuments = filteredDocuments.filter(doc => doc.status === status);
  }
  
  if (type && type !== 'all') {
    filteredDocuments = filteredDocuments.filter(doc => doc.type === type);
  }
  
  if (employeeId) {
    filteredDocuments = filteredDocuments.filter(doc => doc.employeeId === employeeId);
  }
  
  res.json(filteredDocuments);
});

app.get('/api/documents/employee/:employeeId', authenticateToken, (req, res) => {
  const { employeeId } = req.params;
  
  // Check permissions
  if (req.user.role === 'employee' && req.user.id !== employeeId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const employeeDocuments = db.documents.filter(doc => doc.employeeId === employeeId);
  res.json(employeeDocuments);
});

app.post('/api/documents/upload', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const employee = db.users.find(u => u.id === req.user.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const newDocument = {
      id: uuidv4(),
      employeeId: req.user.id,
      employeeName: employee.name,
      type: req.body.type,
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      filePath: req.file.path,
      status: 'pending',
      message: req.body.message || null,
      uploadedAt: new Date().toISOString(),
      isRequired: req.body.isRequired === 'true',
      expiryDate: req.body.expiryDate || null,
      relatedEntityId: req.body.relatedEntityId || null,
      relatedEntityType: req.body.relatedEntityType || null,
    };

    db.documents.push(newDocument);
    
    // Add audit log
    const auditLog = {
      id: uuidv4(),
      documentId: newDocument.id,
      action: 'uploaded',
      performedBy: req.user.id,
      performerName: employee.name,
      timestamp: new Date().toISOString(),
      details: `Document uploaded: ${newDocument.originalFileName}`,
    };
    
    if (!db.documentAuditLogs) {
      db.documentAuditLogs = [];
    }
    db.documentAuditLogs.push(auditLog);
    
    saveDatabase();
    res.status(201).json(newDocument);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.put('/api/documents/:id/approve', authenticateToken, requireRole(['hr', 'admin']), (req, res) => {
  const documentIndex = db.documents.findIndex(d => d.id === req.params.id);
  if (documentIndex === -1) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const { status, rejectionReason } = req.body;
  const approver = db.users.find(u => u.id === req.user.id);
  
  const updates = {
    status,
    ...(status === 'approved' ? {
      approvedBy: req.user.id,
      approverName: approver?.name,
      approvedAt: new Date().toISOString(),
    } : {
      rejectedBy: req.user.id,
      rejectorName: approver?.name,
      rejectedAt: new Date().toISOString(),
      rejectionReason,
    }),
  };

  db.documents[documentIndex] = { ...db.documents[documentIndex], ...updates };
  
  // Add audit log
  const auditLog = {
    id: uuidv4(),
    documentId: req.params.id,
    action: status,
    performedBy: req.user.id,
    performerName: approver?.name,
    timestamp: new Date().toISOString(),
    details: status === 'rejected' ? rejectionReason : 'Document approved',
  };
  
  if (!db.documentAuditLogs) {
    db.documentAuditLogs = [];
  }
  db.documentAuditLogs.push(auditLog);
  
  saveDatabase();
  res.json(db.documents[documentIndex]);
});

app.get('/api/documents/:id/download', authenticateToken, (req, res) => {
  const document = db.documents.find(d => d.id === req.params.id);
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Check permissions
  if (req.user.role === 'employee' && document.employeeId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const filePath = document.filePath;
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Add audit log
  const auditLog = {
    id: uuidv4(),
    documentId: document.id,
    action: 'downloaded',
    performedBy: req.user.id,
    performerName: req.user.name,
    timestamp: new Date().toISOString(),
  };
  
  if (!db.documentAuditLogs) {
    db.documentAuditLogs = [];
  }
  db.documentAuditLogs.push(auditLog);
  saveDatabase();

  res.download(filePath, document.originalFileName);
});

app.delete('/api/documents/:id', authenticateToken, (req, res) => {
  const documentIndex = db.documents.findIndex(d => d.id === req.params.id);
  if (documentIndex === -1) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const document = db.documents[documentIndex];
  
  // Check permissions
  if (req.user.role === 'employee' && document.employeeId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Delete file from filesystem
  if (fs.existsSync(document.filePath)) {
    fs.unlinkSync(document.filePath);
  }

  db.documents.splice(documentIndex, 1);
  
  // Add audit log
  const auditLog = {
    id: uuidv4(),
    documentId: req.params.id,
    action: 'deleted',
    performedBy: req.user.id,
    performerName: req.user.name,
    timestamp: new Date().toISOString(),
  };
  
  if (!db.documentAuditLogs) {
    db.documentAuditLogs = [];
  }
  db.documentAuditLogs.push(auditLog);
  
  saveDatabase();
  res.status(204).send();
});

app.get('/api/documents/stats', authenticateToken, requireRole(['hr', 'admin']), (req, res) => {
  const stats = {
    totalDocuments: db.documents.length,
    pendingApproval: db.documents.filter(d => d.status === 'pending').length,
    approved: db.documents.filter(d => d.status === 'approved').length,
    rejected: db.documents.filter(d => d.status === 'rejected').length,
    expiringSoon: db.documents.filter(d => {
      if (!d.expiryDate) return false;
      const expiry = new Date(d.expiryDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length,
    missingRequired: 0, // Would need to calculate based on employees without required docs
  };
  
  res.json(stats);
});

app.get('/api/documents/required', authenticateToken, (req, res) => {
  const requiredTypes = ['cv', 'ghana_card'];
  res.json(requiredTypes);
});

app.get('/api/documents/compliance/:employeeId', authenticateToken, requireRole(['hr', 'admin']), (req, res) => {
  const { employeeId } = req.params;
  const employeeDocuments = db.documents.filter(d => d.employeeId === employeeId);
  
  const requiredTypes = ['cv', 'ghana_card'];
  const compliance = {
    employeeId,
    requiredDocuments: requiredTypes.length,
    submittedDocuments: employeeDocuments.filter(d => requiredTypes.includes(d.type)).length,
    approvedDocuments: employeeDocuments.filter(d => requiredTypes.includes(d.type) && d.status === 'approved').length,
    isCompliant: requiredTypes.every(type => 
      employeeDocuments.some(d => d.type === type && d.status === 'approved')
    ),
  };
  
  res.json(compliance);
});

app.get('/api/documents/:id/audit', authenticateToken, requireRole(['hr', 'admin']), (req, res) => {
  const documentAuditLogs = (db.documentAuditLogs || []).filter(log => log.documentId === req.params.id);
  res.json(documentAuditLogs);
});

// SYSTEM MANAGEMENT ROUTES
app.get('/api/system/stats', authenticateToken, requireRole(['admin']), (req, res) => {
  res.json({
    totalUsers: db.users.length,
    activeUsers: db.users.filter(u => u.status === 'active').length,
    totalDepartments: db.departments.length,
    totalRoles: db.roles.length,
    systemHealth: 99.9,
    uptime: '99.9%',
    lastBackup: new Date().toISOString(),
  });
});

app.post('/api/system/backup', authenticateToken, requireRole(['admin']), (req, res) => {
  // Mock backup operation
  setTimeout(() => {
    res.json({ 
      message: 'Backup completed successfully',
      timestamp: new Date().toISOString(),
      size: '2.4 GB'
    });
  }, 2000);
});

app.post('/api/system/maintenance', authenticateToken, requireRole(['admin']), (req, res) => {
  // Mock maintenance operation
  res.json({ 
    message: 'Maintenance mode activated',
    estimatedDuration: '30 minutes'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Mock HRIS API is ready!');
  console.log('Available endpoints:');
  console.log('- POST /api/auth/login');
  console.log('- GET /api/users/me');
  console.log('- GET /api/employees');
  console.log('- GET /api/roles');
  console.log('- GET /api/permissions');
  console.log('- GET /api/departments');
  console.log('- GET /api/appraisals');
  console.log('- GET /api/time-entries');
  console.log('- GET /api/notifications');
  console.log('- GET /api/integrations');
  console.log('- GET /api/system-settings');
});