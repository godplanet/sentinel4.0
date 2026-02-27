import { create } from 'zustand';
import { supabase } from '@/shared/api/supabase';
import type {
  AcademyExamWithCourse,
  AcademyQuestion,
  AttemptResult,
} from '../types';

export type ExamPhase = 'intro' | 'running' | 'submitted';

interface ExamState {
  exam: AcademyExamWithCourse | null;
  questions: AcademyQuestion[];
  answers: Record<string, string>;
  markedForReview: string[];
  currentIndex: number;
  phase: ExamPhase;
  result: AttemptResult | null;
  secondsRemaining: number;
  isSubmitting: boolean;
  submitError: string | null;

  setExam: (exam: AcademyExamWithCourse, questions: AcademyQuestion[]) => void;
  startExam: () => void;
  answerQuestion: (questionId: string, optionId: string) => void;
  toggleMark: (questionId: string) => void;
  navigateTo: (index: number) => void;
  tick: () => void;
  submitExam: (userId: string) => Promise<void>;
  reset: () => void;
}

function gradeAttempt(
  questions: AcademyQuestion[],
  answers: Record<string, string>,
  passingScore: number
): AttemptResult {
  let earnedPoints = 0;
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  const perQuestion = questions.map((q) => {
    const selected = answers[q.id] ?? '';
    const isCorrect = selected === q.correct_option_id;
    if (isCorrect) earnedPoints += q.points;
    return {
      question_id: q.id,
      selected,
      correct: q.correct_option_id,
      is_correct: isCorrect,
      points: q.points,
    };
  });

  const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
  const passed = score >= passingScore;

  return {
    score: Math.round(score * 100) / 100,
    passed,
    correct_count: perQuestion.filter((p) => p.is_correct).length,
    total_questions: questions.length,
    xp_awarded: 0,
    per_question: perQuestion,
  };
}

export const useExamStore = create<ExamState>()((set, get) => ({
  exam: null,
  questions: [],
  answers: {},
  markedForReview: [],
  currentIndex: 0,
  phase: 'intro',
  result: null,
  secondsRemaining: 0,
  isSubmitting: false,
  submitError: null,

  setExam: (exam, questions) =>
    set({
      exam,
      questions,
      answers: {},
      markedForReview: [],
      currentIndex: 0,
      phase: 'intro',
      result: null,
      secondsRemaining: exam.time_limit_minutes * 60,
      isSubmitting: false,
      submitError: null,
    }),

  startExam: () => set({ phase: 'running' }),

  answerQuestion: (questionId, optionId) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: optionId },
    })),

  toggleMark: (questionId) =>
    set((state) => {
      const marked = state.markedForReview;
      return {
        markedForReview: marked.includes(questionId)
          ? marked.filter((id) => id !== questionId)
          : [...marked, questionId],
      };
    }),

  navigateTo: (index) =>
    set((state) => ({
      currentIndex: Math.max(0, Math.min(index, state.questions.length - 1)),
    })),

  tick: () =>
    set((state) => {
      const next = state.secondsRemaining - 1;
      if (next <= 0 && state.phase === 'running') {
        get().submitExam('auto-timeout');
        return { secondsRemaining: 0 };
      }
      return { secondsRemaining: Math.max(0, next) };
    }),

  submitExam: async (userId: string) => {
    const { exam, questions, answers, isSubmitting, phase } = get();
    if (!exam || isSubmitting || phase === 'submitted') return;

    set({ isSubmitting: true, submitError: null });

    const result = gradeAttempt(questions, answers, exam.passing_score);
    const now = new Date().toISOString();

    try {
      const { data } = await supabase
        .from('academy_attempts')
        .insert({
          exam_id: exam.id,
          user_id: userId === 'auto-timeout' ? '00000000-0000-0000-0000-000000000001' : userId,
          score: result.score,
          passed: result.passed,
          answers,
          started_at: now,
          completed_at: now,
        })
        .select('xp_awarded')
        .maybeSingle();

      result.xp_awarded = data?.xp_awarded ?? (result.passed ? exam.course.xp_reward : 0);
    } catch {
      result.xp_awarded = result.passed ? exam.course.xp_reward : 0;
    }

    set({ result, phase: 'submitted', isSubmitting: false });
  },

  reset: () =>
    set({
      exam: null,
      questions: [],
      answers: {},
      markedForReview: [],
      currentIndex: 0,
      phase: 'intro',
      result: null,
      secondsRemaining: 0,
      isSubmitting: false,
      submitError: null,
    }),
}));
