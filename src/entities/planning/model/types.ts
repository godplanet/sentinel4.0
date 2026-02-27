export type PlanStatus = 'DRAFT' | 'APPROVED' | 'LOCKED';

export type EngagementStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FINALIZED' | 'CLOSED' | 'CANCELLED';

export type AuditType = 'COMPREHENSIVE' | 'TARGETED' | 'FOLLOW_UP';

export interface AuditPlan {
  id: string;
  tenant_id: string;
  title: string;
  period_start: string;
  period_end: string;
  status: PlanStatus;
  version: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  approved_at?: string;
  approved_by?: string;
}

export interface AuditEngagement {
  id: string;
  tenant_id: string;
  plan_id: string;
  entity_id: string;
  title: string;
  status: EngagementStatus;
  audit_type: AuditType;
  start_date: string;
  end_date: string;
  actual_start_date?: string;
  actual_end_date?: string;
  assigned_auditor_id?: string;
  strategic_objective_ids?: string[];
  risk_snapshot_score: number;
  estimated_hours: number;
  actual_hours: number;
  progress_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePlanInput {
  title: string;
  period_start: string;
  period_end: string;
  tenant_id: string;
}

export interface CreateEngagementInput {
  plan_id: string;
  entity_id: string;
  title: string;
  audit_type: AuditType;
  start_date: string;
  end_date: string;
  risk_snapshot_score: number;
  estimated_hours?: number;
  tenant_id: string;
}

export interface UpdateEngagementDatesInput {
  engagement_id: string;
  start_date: string;
  end_date: string;
}

export type RiskVelocity = 'HIGH' | 'MEDIUM' | 'LOW';

export interface DraftEngagement {
  id: string;
  universeNodeId: string;
  universeNodeName: string;
  cascadeRisk: number;
  requiredSkills: string[];
  addedAt: string;
  baseRisk: number;
  velocity: RiskVelocity;
  shariah: boolean;
  esg: boolean;
  isCCMTriggered?: boolean;
}
