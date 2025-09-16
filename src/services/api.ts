import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hris-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hris-token');
      localStorage.removeItem('hris-user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  
  updateProfile: async (data: any) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },
  
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/users/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
  
  toggle2FA: async () => {
    const response = await api.post('/users/toggle-2fa');
    return response.data;
  },
};

// Employee API
export const employeeAPI = {
  getAll: async () => {
    const response = await api.get('/employees');
    return response.data;
  },
  
  create: async (employee: any) => {
    const response = await api.post('/employees', employee);
    return response.data;
  },
  
  update: async (id: string, employee: any) => {
    const response = await api.put(`/employees/${id}`, employee);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },
};

// Role API
export const roleAPI = {
  getAll: async () => {
    const response = await api.get('/roles');
    return response.data;
  },
  
  create: async (role: any) => {
    const response = await api.post('/roles', role);
    return response.data;
  },
  
  update: async (id: string, role: any) => {
    const response = await api.put(`/roles/${id}`, role);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },
};

// Permission API
export const permissionAPI = {
  getAll: async () => {
    const response = await api.get('/permissions');
    return response.data;
  },
  
  create: async (permission: any) => {
    const response = await api.post('/permissions', permission);
    return response.data;
  },
  
  update: async (id: string, permission: any) => {
    const response = await api.put(`/permissions/${id}`, permission);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/permissions/${id}`);
    return response.data;
  },
};

// Department API
export const departmentAPI = {
  getAll: async () => {
    const response = await api.get('/departments');
    return response.data;
  },
  
  create: async (department: any) => {
    const response = await api.post('/departments', department);
    return response.data;
  },
  
  update: async (id: string, department: any) => {
    const response = await api.put(`/departments/${id}`, department);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },
};

// Appraisal API
export const appraisalAPI = {
  getAll: async () => {
    const response = await api.get('/appraisals');
    return response.data;
  },
  
  create: async (appraisal: any) => {
    const response = await api.post('/appraisals', appraisal);
    return response.data;
  },
  
  update: async (id: string, appraisal: any) => {
    const response = await api.put(`/appraisals/${id}`, appraisal);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/appraisals/${id}`);
    return response.data;
  },
};

// Leave Request API
export const leaveAPI = {
  getAll: async () => {
    const response = await api.get('/leave-requests');
    return response.data;
  },
  
  create: async (leaveRequest: any) => {
    const response = await api.post('/leave-requests', leaveRequest);
    return response.data;
  },
  
  update: async (id: string, leaveRequest: any) => {
    const response = await api.put(`/leave-requests/${id}`, leaveRequest);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/leave-requests/${id}`);
    return response.data;
  },
};

// Attendance API
export const attendanceAPI = {
  getUploads: async () => {
    const response = await api.get('/attendance-uploads');
    return response.data;
  },
  
  uploadFile: async (fileName: string, totalHours?: number, workingDays?: number) => {
    const response = await api.post('/attendance-uploads', {
      fileName,
      totalHours,
      workingDays,
    });
    return response.data;
  },
};

// Onboarding API
export const onboardingAPI = {
  get: async (employeeId: string) => {
    const response = await api.get(`/onboarding/${employeeId}`);
    return response.data;
  },
  
  update: async (employeeId: string, data: any) => {
    const response = await api.put(`/onboarding/${employeeId}`, data);
    return response.data;
  },
};

// Notification API
export const notificationAPI = {
  getAll: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  
  markAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
};

// Integration API
export const integrationAPI = {
  getAll: async () => {
    const response = await api.get('/integrations');
    return response.data;
  },
  
  update: async (id: string, integration: any) => {
    const response = await api.put(`/integrations/${id}`, integration);
    return response.data;
  },
};

// System API
export const systemAPI = {
  getSettings: async () => {
    const response = await api.get('/system-settings');
    return response.data;
  },
  
  updateSettings: async (settings: any) => {
    const response = await api.put('/system-settings', settings);
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/system/stats');
    return response.data;
  },
  
  createBackup: async () => {
    const response = await api.post('/system/backup');
    return response.data;
  },
  
  enableMaintenance: async () => {
    const response = await api.post('/system/maintenance');
    return response.data;
  },
};

export default api;