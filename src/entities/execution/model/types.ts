/**
 * Audit Execution Entity Types
 */

export type WorkpaperStatus = 'draft' | 'review' | 'finalized';

export type ActiveEngagementStatus = 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED';

export interface ActiveEngagement {
  id: string;
  draftEngagementId: string;
  planningEngagementId?: string;
  title: string;
  entityId: string;
  entityName: string;
  auditType: string;
  assignedAuditorIds: string[];
  requiredSkills: string[];
  riskScore: number;
  startDate: string;
  endDate: string;
  status: ActiveEngagementStatus;
  launchedAt: string;
  workpaperIds: string[];
  tenantId: string;
}
export type TestResult = 'pass' | 'fail' | 'na';

export interface WorkpaperComment {
  text: string;
  author_id: string;
  timestamp: string;
}

export interface WorkpaperData {
  type?: string;
  objective?: string;
  scope?: string;
  test_results?: Record<string, TestResult>;
  sample_size?: number;
  exceptions_found?: number;
  conclusion?: string;
  participants?: string[];
  observations?: string[];
  comments?: WorkpaperComment[];
  [key: string]: unknown;
}

export interface Workpaper {
  id: string;
  step_id: string;
  assigned_auditor_id: string | null;
  status: WorkpaperStatus;
  data: WorkpaperData;
  version: number;
  updated_at: string;
}

export interface AuditStep {
  id: string;
  engagement_id: string | null;
  step_code: string;
  title: string;
  description: string | null;
  risk_weight: number;
  required_evidence_types: string[];
  created_at: string;
}

export interface Evidence {
  id: string;
  workpaper_id: string;
  storage_path: string;
  file_name: string;
  file_size_bytes: number;
  sha256_hash: string;
  uploaded_by: string | null;
  uploaded_at: string;
}

export interface WorkpaperFinding {
  id: string;
  workpaper_id: string;
  title: string;
  description: string | null;
  severity: string;
  source_ref: string | null;
  created_at: string;
}

export interface UserPresence {
  user_id: string;
  user_name: string;
  workpaper_id: string;
  last_seen: string;
  cursor_position?: { x: number; y: number };
}
