export interface TestStep {
  id: string;
  workpaper_id: string;
  step_order: number;
  description: string;
  is_completed: boolean;
  auditor_comment: string;
  created_at: string;
  updated_at: string;
}

export type EvidenceRequestStatus = 'pending' | 'submitted' | 'accepted';

export interface EvidenceRequest {
  id: string;
  workpaper_id: string;
  title: string;
  description: string;
  requested_from_user_id: string | null;
  status: EvidenceRequestStatus;
  due_date: string | null;
  file_url: string;
  created_at: string;
  updated_at: string;
}

export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface WorkpaperFindingRow {
  id: string;
  workpaper_id: string;
  title: string;
  description: string | null;
  severity: FindingSeverity;
  source_ref: string | null;
  created_at: string;
}

export interface CreateWorkpaperFindingInput {
  workpaper_id: string;
  title: string;
  description?: string;
  severity: FindingSeverity;
  source_ref?: string;
}

export type ReviewNoteStatus = 'Open' | 'Resolved';

export interface ReviewNote {
  id: string;
  workpaper_id: string;
  note_text: string;
  status: ReviewNoteStatus;
  author_name: string;
  author_id: string | null;
  created_at: string;
  resolved_at: string | null;
}

export type ActivityActionType =
  | 'STATUS_CHANGE'
  | 'SIGN_OFF'
  | 'UNSIGN'
  | 'FILE_UPLOAD'
  | 'NOTE_ADDED'
  | 'NOTE_RESOLVED'
  | 'FINDING_ADDED'
  | 'STEP_COMPLETED'
  | 'EVIDENCE_UPDATE'
  | 'QUESTIONNAIRE_SENT'
  | 'SAMPLE_CALCULATED';

export interface ActivityLog {
  id: string;
  workpaper_id: string;
  user_id: string | null;
  user_name: string;
  action_type: ActivityActionType;
  details: string;
  created_at: string;
}

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type ConfidenceLevel = 90 | 95;

export interface SamplingResult {
  populationSize: number;
  riskLevel: RiskLevel;
  confidenceLevel: ConfidenceLevel;
  sampleSize: number;
}

export interface ProcedureItem {
  id: string;
  category: string;
  title: string;
  description: string;
  tags: string[];
  created_at: string;
}

export type QuestionnaireStatus = 'Sent' | 'Responded' | 'Reviewed';

export interface QuestionnaireQuestion {
  id: string;
  question: string;
  type: 'yesno' | 'text';
  answer: string | null;
  options?: string[];
}

export interface Questionnaire {
  id: string;
  workpaper_id: string;
  title: string;
  questions_json: QuestionnaireQuestion[];
  status: QuestionnaireStatus;
  sent_to: string;
  created_at: string;
  responded_at: string | null;
}
