import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
    attendanceUploads: []
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