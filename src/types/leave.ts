// Leave Request Types
export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'sick' | 'vacation' | 'personal' | 'maternity' | 'paternity' | 'bereavement' | 'other';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'line_manager_approval' | 'head_of_unit_approval' | 'hr_approval' | 'approved' | 'rejected' | 'handover_pending' | 'handover_completed';
  handoverTo?: string;
  handoverNotes?: string;
  comments: LeaveComment[];
  createdAt: string;
  updatedAt: string;
  lineManagerId?: string;
  lineManagerName?: string;
  lineManagerApprovedAt?: string;
  headOfUnitId?: string;
  headOfUnitName?: string;
  headOfUnitApprovedAt?: string;
  hrApprovedBy?: string;
  hrApprovedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface LeaveComment {
  id: string;
  authorId: string;
  authorName: string;
  comment: string;
  createdAt: string;
  isInternal: boolean;
}

export interface LeaveBalance {
  employeeId: string;
  sickDays: number;
  vacationDays: number;
  personalDays: number;
  maternityDays: number;
  paternityDays: number;
  bereavementDays: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

export interface LeavePolicy {
  id: string;
  name: string;
  type: string;
  maxDays: number;
  carryOverDays: number;
  accrualRate: number;
  accrualFrequency: 'monthly' | 'quarterly' | 'annually';
  probationPeriod: number;
  isActive: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveCalendar {
  date: string;
  isWorkingDay: boolean;
  isHoliday: boolean;
  holidayName?: string;
  leaveRequests: LeaveRequest[];
}

// API Response Types
export interface LeaveRequestResponse {
  success: boolean;
  data?: LeaveRequest;
  error?: string;
}

export interface LeaveRequestsResponse {
  success: boolean;
  data?: LeaveRequest[];
  error?: string;
}

export interface LeaveBalanceResponse {
  success: boolean;
  data?: LeaveBalance;
  error?: string;
}

export interface LeavePolicyResponse {
  success: boolean;
  data?: LeavePolicy[];
  error?: string;
}

// Form Types
export interface CreateLeaveRequestForm {
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  handoverTo?: string;
  handoverNotes?: string;
}

export interface UpdateLeaveRequestForm {
  status?: string;
  comments?: string;
  rejectionReason?: string;
}

// Filter and Search Types
export interface LeaveRequestFilters {
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  employeeId?: string;
}

export interface LeaveRequestSearchParams {
  query?: string;
  filters?: LeaveRequestFilters;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
