export type WorkpaperStatus = 'draft' | 'review' | 'finalized';

export type ApprovalStatus = 'in_progress' | 'prepared' | 'reviewed';

export type TestResult = 'pass' | 'fail' | 'n/a';

export type SamplingMethod = 'JUDGMENTAL' | 'STATISTICAL' | 'CENSUS' | 'ANALYTICAL';

export interface SamplingConfig {
  method: SamplingMethod;
  population_size: number;
  sample_size: number;
  rationale: string;
}

export interface WorkpaperData {
  test_results?: Record<string, TestResult>;
  field_values?: Record<string, string | number | boolean>;
  notes?: string;
  [key: string]: unknown;
}

export interface Workpaper {
  id: string;
  step_id: string;
  assigned_auditor_id?: string;
  status: WorkpaperStatus;
  data: WorkpaperData;
  version: number;
  updated_at: string;
  prepared_by?: string;
  prepared_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  prepared_by_user_id?: string;
  reviewed_by_user_id?: string;
  prepared_by_name?: string;
  reviewed_by_name?: string;
  approval_status?: ApprovalStatus;
  auditor_scratchpad?: string;
  sampling_config?: SamplingConfig;
  total_hours_spent?: number;
}

export interface AuditStep {
  id: string;
  engagement_id?: string;
  step_code: string;
  title: string;
  description?: string;
  risk_weight: number;
  required_evidence_types: string[];
  created_at: string;
}

export interface EvidenceItem {
  id: string;
  workpaper_id: string;
  storage_path: string;
  file_name: string;
  file_size_bytes: number;
  sha256_hash: string;
  uploaded_by?: string;
  uploaded_at: string;
}

export interface WorkpaperFinding {
  id: string;
  workpaper_id: string;
  title: string;
  description?: string;
  severity: string;
  source_ref?: string;
  created_at: string;
}

export interface CreateWorkpaperInput {
  step_id: string;
  assigned_auditor_id?: string;
}

export interface UpdateWorkpaperDataInput {
  workpaper_id: string;
  data: WorkpaperData;
}

export interface UpdateWorkpaperStatusInput {
  workpaper_id: string;
  status: WorkpaperStatus;
}

export interface CreateEvidenceInput {
  workpaper_id: string;
  file_name: string;
  file_size_bytes: number;
  sha256_hash: string;
  storage_path: string;
}

export type ReviewNoteStatus = 'OPEN' | 'RESOLVED';

export interface ReviewNote {
  id: string;
  tenant_id: string;
  workpaper_id: string;
  field_key: string;
  note_text: string;
  author_id?: string;
  status: ReviewNoteStatus;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface CreateReviewNoteInput {
  workpaper_id: string;
  field_key: string;
  note_text: string;
}

export interface ResolveReviewNoteInput {
  note_id: string;
}

export interface SignOffWorkpaperInput {
  workpaper_id: string;
}
