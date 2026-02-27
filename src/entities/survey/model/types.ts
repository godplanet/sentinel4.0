export interface Survey {
  id: string;
  title: string;
  description: string | null;
  target_audience: 'AUDITEE' | 'INTERNAL' | 'EXTERNAL';
  form_schema: SurveyQuestion[];
  is_active: boolean;
  tenant_id: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SurveyQuestion {
  id: string;
  type: 'rating' | 'text' | 'choice' | 'multiselect';
  label: string;
  max?: number;
  options?: string[];
  required?: boolean;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  respondent_id: string | null;
  engagement_id: string | null;
  answers: Record<string, any>;
  score: number | null;
  tenant_id: string;
  submitted_at: string;
}

export interface CreateSurveyInput {
  title: string;
  description?: string;
  target_audience: 'AUDITEE' | 'INTERNAL' | 'EXTERNAL';
  form_schema: SurveyQuestion[];
  is_active?: boolean;
}

export interface SubmitSurveyResponseInput {
  survey_id: string;
  engagement_id?: string;
  answers: Record<string, any>;
}

export interface SurveyWithStats extends Survey {
  response_count: number;
  average_score: number | null;
}

export type SurveyAssignmentStatus = 'PENDING' | 'SENT' | 'COMPLETED' | 'EXPIRED';

export interface SurveyAssignment {
  id: string;
  survey_id: string;
  engagement_id: string | null;
  auditee_id: string | null;
  status: SurveyAssignmentStatus;
  triggered_by: string;
  triggered_at: string;
  completed_at: string | null;
  expires_at: string;
  metadata: Record<string, unknown>;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSurveyAssignmentInput {
  survey_id: string;
  engagement_id?: string;
  auditee_id?: string;
  triggered_by?: string;
  metadata?: Record<string, unknown>;
  tenant_id?: string;
}
