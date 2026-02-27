export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type CpeStatus = 'pending' | 'approved' | 'rejected';

export type AssignmentStatus = 'assigned' | 'in_progress' | 'completed' | 'overdue' | 'waived';

export type AssignmentPriority = 'low' | 'normal' | 'high' | 'mandatory';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface AcademyCourse {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  category: string;
  xp_reward: number;
  estimated_duration: number;
  difficulty: CourseDifficulty;
  is_active: boolean;
  thumbnail_url: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface AcademyExam {
  id: string;
  course_id: string;
  title: string;
  description: string;
  passing_score: number;
  time_limit_minutes: number;
  max_attempts: number;
  randomize_questions: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AcademyQuestion {
  id: string;
  exam_id: string;
  question_text: string;
  options: QuestionOption[];
  correct_option_id: string;
  points: number;
  explanation: string | null;
  order_index: number;
  created_at: string;
}

export interface AcademyAttempt {
  id: string;
  exam_id: string;
  user_id: string;
  score: number;
  passed: boolean;
  answers: Record<string, string>;
  started_at: string;
  completed_at: string | null;
  xp_awarded: number;
}

export interface UserCpeRecord {
  id: string;
  user_id: string;
  tenant_id: string;
  title: string;
  provider: string;
  credit_hours: number;
  evidence_url: string | null;
  status: CpeStatus;
  date_earned: string;
  notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrainingAssignment {
  id: string;
  user_id: string;
  course_id: string;
  assigned_by: string;
  tenant_id: string;
  due_date: string | null;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AcademyExamWithCourse extends AcademyExam {
  course: AcademyCourse;
}

export interface AcademyAttemptWithDetails extends AcademyAttempt {
  exam: AcademyExamWithCourse;
}

export interface TrainingAssignmentWithCourse extends TrainingAssignment {
  course: AcademyCourse;
}

export interface AttemptSubmission {
  exam_id: string;
  user_id: string;
  answers: Record<string, string>;
  started_at: string;
}

export interface AttemptResult {
  score: number;
  passed: boolean;
  correct_count: number;
  total_questions: number;
  xp_awarded: number;
  per_question: Array<{
    question_id: string;
    selected: string;
    correct: string;
    is_correct: boolean;
    points: number;
  }>;
}
