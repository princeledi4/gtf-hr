export type AppraisalStatus = 'draft' | 'self_assessment' | 'manager_review' | 'hr_review' | 'completed';

export interface AppraisalCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
}

export interface AppraisalResponse {
  criteriaId: string;
  selfScore?: number;
  selfComment?: string;
  managerScore?: number;
  managerComment?: string;
  finalScore: number;
}

export interface Appraisal {
  id: string;
  employeeId: string;
  employeeName: string;
  managerId: string;
  managerName: string;
  cycle: string;
  period: string;
  status: AppraisalStatus;
  criteria: AppraisalCriteria[];
  responses: AppraisalResponse[];
  overallScore: number;
  overallComment: string;
  employeeComment?: string;
  createdAt: string;
  completedAt?: string;
}

export interface AppraisalCycle {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  criteria: AppraisalCriteria[];
}