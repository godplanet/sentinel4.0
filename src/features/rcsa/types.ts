export type RCSAQuestionType = 'TEXT' | 'BOOLEAN' | 'MULTIPLE_CHOICE';

export interface RCSAQuestion {
  id: string;
  tenant_id: string;
  campaign_id: string;
  text: string;
  type: RCSAQuestionType;
  options: string[];
  trigger_finding_if_value: string | null;
  weight: number;
}

export interface RCSAResponse {
  id: string;
  tenant_id: string;
  campaign_id: string;
  question_id: string;
  auditee_id: string;
  answer: string;
  is_finding_triggered: boolean;
  created_at: string;
}

export interface RCSAResponseInput {
  questionId: string;
  answer: string;
  isFindingTriggered: boolean;
}

