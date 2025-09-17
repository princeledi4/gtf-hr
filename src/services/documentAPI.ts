import api from './api';
import { Document, DocumentUploadRequest, DocumentApprovalRequest, DocumentFilter, DocumentStats } from '@/types/document';

export const documentAPI = {
  // Get all documents (filtered by user role)
  getAll: async (filters?: DocumentFilter): Promise<Document[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    const response = await api.get(`/documents?${params.toString()}`);
    return response.data;
  },

  // Get documents for a specific employee
  getByEmployee: async (employeeId: string): Promise<Document[]> => {
    const response = await api.get(`/documents/employee/${employeeId}`);
    return response.data;
  },

  // Upload a new document
  upload: async (uploadRequest: DocumentUploadRequest): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', uploadRequest.file);
    formData.append('type', uploadRequest.type);
    if (uploadRequest.message) {
      formData.append('message', uploadRequest.message);
    }
    if (uploadRequest.isRequired !== undefined) {
      formData.append('isRequired', uploadRequest.isRequired.toString());
    }
    if (uploadRequest.expiryDate) {
      formData.append('expiryDate', uploadRequest.expiryDate);
    }
    if (uploadRequest.relatedEntityId) {
      formData.append('relatedEntityId', uploadRequest.relatedEntityId);
    }
    if (uploadRequest.relatedEntityType) {
      formData.append('relatedEntityType', uploadRequest.relatedEntityType);
    }

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Approve or reject a document
  approve: async (documentId: string, approval: DocumentApprovalRequest): Promise<Document> => {
    const response = await api.put(`/documents/${documentId}/approve`, approval);
    return response.data;
  },

  // Download a document
  download: async (documentId: string): Promise<Blob> => {
    const response = await api.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Delete a document
  delete: async (documentId: string): Promise<void> => {
    await api.delete(`/documents/${documentId}`);
  },

  // Get document statistics
  getStats: async (): Promise<DocumentStats> => {
    const response = await api.get('/documents/stats');
    return response.data;
  },

  // Get audit trail for a document
  getAuditTrail: async (documentId: string): Promise<any[]> => {
    const response = await api.get(`/documents/${documentId}/audit`);
    return response.data;
  },

  // Get required documents checklist for onboarding
  getRequiredDocuments: async (): Promise<string[]> => {
    const response = await api.get('/documents/required');
    return response.data;
  },

  // Check document compliance for an employee
  checkCompliance: async (employeeId: string): Promise<any> => {
    const response = await api.get(`/documents/compliance/${employeeId}`);
    return response.data;
  },
};