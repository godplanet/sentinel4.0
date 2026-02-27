export interface QAIPChecklist {
  id: string;
  title: string;
  description: string | null;
  criteria: QAIPCriteria[];
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface QAIPCriteria {
  id: string;
  text: string;
  weight: number;
}

export interface QAIPReview {
  id: string;
  engagement_id: string | null;
  reviewer_id: string | null;
  checklist_id: string;
  results: Record<string, string>;
  total_score: number | null;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';
  notes: string | null;
  tenant_id: string;
  completed_at: string | null;
  created_at: string;
}

export interface CreateQAIPChecklistInput {
  title: string;
  description?: string;
  criteria: QAIPCriteria[];
}

export interface CreateQAIPReviewInput {
  engagement_id?: string;
  checklist_id: string;
  results: Record<string, string>;
  notes?: string;
}

export interface QAIPReviewWithDetails extends QAIPReview {
  checklist?: QAIPChecklist;
  reviewer_name?: string;
}

export interface QAIPReviewV2 {
  id: string;
  target_audit_id: string;
  review_type: 'COLD' | 'HOT';
  compliance_score: number;
  findings_json: ReviewFinding[];
  reviewer_id: string;
  review_date: string;
  status: 'DRAFT' | 'FINAL' | 'APPROVED';
  created_at: string;
  updated_at: string;
}

export interface ReviewFinding {
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: string;
  standard_reference?: string;
}

export interface CreateQAIPReviewV2Input {
  target_audit_id: string;
  review_type: 'COLD' | 'HOT';
  compliance_score: number;
  findings_json?: ReviewFinding[];
}

export interface QAIPStats {
  total_reviews: number;
  avg_compliance_score: number;
  cold_reviews: number;
  hot_reviews: number;
  recent_reviews: QAIPReviewV2[];
}
