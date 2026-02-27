export interface AuditEngagementRow {
  id: string;
  tenant_id: string;
  plan_id: string;
  entity_id: string;
  title: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'REPORTING' | 'COMPLETED' | 'CANCELLED';
  audit_type: string;
  start_date: string;
  end_date: string;
  actual_start_date?: string;
  actual_end_date?: string;
  assigned_auditor_id?: string;
  strategic_objective_ids?: string[];
  risk_snapshot_score?: number;
  estimated_hours?: number;
  actual_hours?: number;
  progress_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface InvestigationRow {
  id: string;
  case_number: string;
  title: string;
  status: string;
  severity: string;
  created_at: string;
}

export interface AuditEntityRow {
  id: string;
  name: string;
  risk_score?: number;
  entity_type?: string;
  path?: string;
}

export interface AuditPlanRow {
  id: string;
  tenant_id: string;
  title: string;
  period_start: string;
  period_end: string;
  status: 'DRAFT' | 'APPROVED' | 'LOCKED';
  version: number;
  created_at: string;
  updated_at: string;
}

export interface AuditFindingRow {
  id: string;
  tenant_id?: string;
  engagement_id?: string;
  code?: string;
  finding_code?: string;
  title: string;
  severity: string;
  state: string;
  status?: string;
  main_status?: string;
  gias_category?: string;
  auditee_department?: string;
  impact_score?: number;
  likelihood_score?: number;
  financial_impact?: number;
  details?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SystemParameterRow {
  key: string;
  value: any;
  description: string;
  category: string;
}

export interface CPERecordRow {
  id: string;
  user_id: string;
  activity_name: string;
  cpe_points: number;
  completion_date: string;
}

export interface RkmProcessRow {
  id: string;
  process_code: string;
  process_name: string;
  description: string;
  path: string;
  level: number;
}

export interface RkmRiskRow {
  id: string;
  main_process: string;
  residual_rating: string;
  risk_code?: string;
  risk_name?: string;
}

export interface UserProfileRow {
  user_id: string;
  email: string;
  full_name?: string;
  role: string;
  department?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SystemIntegrationRow {
  id: string;
  integration_type: string;
  integration_name: string;
  is_enabled: boolean;
  config_payload?: Record<string, any>;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export type {
  SurveyTemplateRow,
  SurveyAssignmentRow,
  SurveyResponseRow,
  SurveySchema,
  SurveySection,
  SurveyQuestion,
  SurveyAnswer,
  SurveyAnswers,
  SurveyModule,
  SurveyAssignmentStatus,
  SurveyAssignmentWithTemplate,
  SurveyAssignmentWithResponse,
  FullSurveyContext,
  CreateSurveyTemplateInput,
  CreateSurveyAssignmentInput,
  SubmitSurveyResponseInput,
} from './survey';

export type {
  TalentProfileRow,
  TalentSkillRow,
  UserCertificationRow,
  SuccessionPlanRow,
  KudosTransactionRow,
  QaipReviewExtendedRow,
  SkillSnapshot,
  SkillSnapshotEntry,
  TalentProfileWithSkills,
  SuccessionPlanWithProfiles,
  KudosLeaderboardEntry,
  BurnoutZone,
  AuditorTitle,
  CertificationStatus,
  ReadinessLevel,
  KudosCategory,
  QaipReviewType,
  QaipReviewStatus,
  CreateUserCertificationInput,
  CreateSuccessionPlanInput,
  SendKudosInput,
  UpdateSkillSnapshotInput,
} from './talent';
