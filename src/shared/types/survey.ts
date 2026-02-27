// ============================================================
// Survey Engine — JSONB Structure Interfaces
// ============================================================

export type SurveyQuestionType =
  | 'RATING'
  | 'YES_NO'
  | 'MULTI_CHOICE'
  | 'SINGLE_CHOICE'
  | 'TEXT'
  | 'NUMERIC';

export interface SurveyQuestionOption {
  value: string;
  label: string;
  score?: number;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: SurveyQuestionType;
  weight: number;
  required: boolean;
  options?: SurveyQuestionOption[];
  min?: number;
  max?: number;
  hint?: string;
}

export interface SurveySection {
  id: string;
  title: string;
  description?: string;
  weight: number;
  questions: SurveyQuestion[];
}

export interface SurveySchema {
  version: string;
  sections: SurveySection[];
  scoring_method: 'WEIGHTED_AVERAGE' | 'SUM' | 'MAX_SECTION';
  pass_threshold?: number;
  tags?: string[];
}

// ============================================================
// Survey Answers — JSONB Structure Interfaces
// ============================================================

export interface SurveyAnswer {
  question_id: string;
  value: string | number | boolean | string[];
  score: number;
  comment?: string;
}

export interface SurveyAnswers {
  [sectionId: string]: {
    [questionId: string]: SurveyAnswer;
  };
}

// ============================================================
// Database Row Types
// ============================================================

export type SurveyModule = 'TALENT' | 'QAIP' | 'ENGAGEMENT' | 'GENERAL';
export type SurveyAssignmentStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface SurveyTemplateRow {
  id: string;
  title: string;
  module: SurveyModule;
  schema: SurveySchema;
  is_active: boolean;
  created_by: string | null;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface SurveyAssignmentRow {
  id: string;
  template_id: string;
  target_user_id: string;
  evaluator_user_id: string;
  status: SurveyAssignmentStatus;
  due_date: string | null;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface SurveyResponseRow {
  id: string;
  assignment_id: string;
  answers: SurveyAnswers;
  score_total: number;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Composite / Joined Types
// ============================================================

export interface SurveyAssignmentWithTemplate extends SurveyAssignmentRow {
  template: SurveyTemplateRow;
}

export interface SurveyAssignmentWithResponse extends SurveyAssignmentRow {
  response: SurveyResponseRow | null;
}

export interface FullSurveyContext
  extends SurveyAssignmentRow {
  template: SurveyTemplateRow;
  response: SurveyResponseRow | null;
}

// ============================================================
// Mutation Input Types
// ============================================================

export interface CreateSurveyTemplateInput {
  title: string;
  module: SurveyModule;
  schema: SurveySchema;
  is_active?: boolean;
}

export interface CreateSurveyAssignmentInput {
  template_id: string;
  target_user_id: string;
  evaluator_user_id: string;
  due_date?: string | null;
}

export interface SubmitSurveyResponseInput {
  assignment_id: string;
  answers: SurveyAnswers;
  score_total: number;
}
