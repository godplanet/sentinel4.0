import { supabase } from '@/shared/api/supabase';
import type { AcademyExamWithCourse, AcademyQuestion } from '../types';

export async function fetchExamWithCourse(
  examId: string
): Promise<AcademyExamWithCourse | null> {
  const { data, error } = await supabase
    .from('academy_exams')
    .select(`
      *,
      course:academy_courses(*)
    `)
    .eq('id', examId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  return data as AcademyExamWithCourse | null;
}

export async function fetchExamQuestions(
  examId: string,
  randomize = false
): Promise<AcademyQuestion[]> {
  const { data, error } = await supabase
    .from('academy_questions')
    .select('*')
    .eq('exam_id', examId)
    .order('order_index', { ascending: true });

  if (error) throw error;
  if (!data) return [];

  const questions = data as AcademyQuestion[];
  if (randomize) {
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
  }
  return questions;
}

export async function fetchUserAttemptCount(
  examId: string,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('academy_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('exam_id', examId)
    .eq('user_id', userId);

  if (error) throw error;
  return count ?? 0;
}

export async function fetchExamsForCourse(courseId: string): Promise<AcademyExamWithCourse[]> {
  const { data, error } = await supabase
    .from('academy_exams')
    .select(`*, course:academy_courses(*)`)
    .eq('course_id', courseId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as AcademyExamWithCourse[];
}
