export type DocumentType = 'cv' | 'certificate' | 'ghana_card' | 'dependent_details' | 'medical_certificate' | 'allowance_proof' | 'other';

export type DocumentStatus = 'pending' | 'approved' | 'rejected';

export interface Document {
  id: string;
  employeeId: string;
  employeeName: string;
  type: DocumentType;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  status: DocumentStatus;
  message?: string;
  uploadedAt: string;
  approvedBy?: string;
  approverName?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectorName?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  isRequired: boolean;
  expiryDate?: string;
  relatedEntityId?: string; // For leave requests or allowance claims
  relatedEntityType?: 'leave_request' | 'allowance_claim';
}

export interface DocumentUploadRequest {
  type: DocumentType;
  file: File;
  message?: string;
  isRequired?: boolean;
  expiryDate?: string;
  relatedEntityId?: string;
  relatedEntityType?: 'leave_request' | 'allowance_claim';
}

export interface DocumentApprovalRequest {
  status: DocumentStatus;
  rejectionReason?: string;
}

export interface DocumentFilter {
  status?: DocumentStatus;
  type?: DocumentType;
  employeeId?: string;
  isRequired?: boolean;
  expiryDateFrom?: string;
  expiryDateTo?: string;
}

export interface DocumentStats {
  totalDocuments: number;
  pendingApproval: number;
  approved: number;
  rejected: number;
  expiringSoon: number;
  missingRequired: number;
}

export const DOCUMENT_TYPES: Record<DocumentType, { label: string; description: string; required: boolean }> = {
  cv: { label: 'CV/Resume', description: 'Current curriculum vitae or resume', required: true },
  certificate: { label: 'Certificates', description: 'Educational or professional certificates', required: false },
  ghana_card: { label: 'Ghana Card', description: 'National identification card', required: true },
  dependent_details: { label: 'Dependent Details', description: 'Information about dependents', required: false },
  medical_certificate: { label: 'Medical Certificate', description: 'Medical documentation for leave', required: false },
  allowance_proof: { label: 'Allowance Proof', description: 'Supporting documents for allowance claims', required: false },
  other: { label: 'Other Documents', description: 'Miscellaneous documents', required: false },
};

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/jpg',
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface DocumentAuditLog {
  id: string;
  documentId: string;
  action: 'uploaded' | 'approved' | 'rejected' | 'downloaded' | 'deleted';
  performedBy: string;
  performerName: string;
  timestamp: string;
  details?: string;
  ipAddress?: string;
}