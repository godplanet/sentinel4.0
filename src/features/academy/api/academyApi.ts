import { supabase } from '@/shared/api/supabase';

export interface CourseRow {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  xp_reward: number;
  estimated_duration: number;
  tags: string[];
}

export interface ExamRow {
  id: string;
  title: string;
  course_id: string;
  course_title: string;
  time_limit_minutes: number;
  passing_score: number;
}

export async function fetchAcademyCourses(): Promise<CourseRow[]> {
  const { data, error } = await supabase
    .from('academy_courses')
    .select('id,title,category,difficulty,xp_reward,estimated_duration,tags')
    .eq('is_active', true)
    .limit(20);

  if (error) throw error;
  return (data || []) as CourseRow[];
}

export async function fetchAcademyExams(): Promise<ExamRow[]> {
  const { data, error } = await supabase
    .from('academy_exams')
    .select('id,title,course_id,time_limit_minutes,passing_score,academy_courses(title)')
    .eq('is_active', true)
    .limit(20);

  if (error) throw error;

  return (
    (
      data as unknown as Array<{
        id: string;
        title: string;
        course_id: string;
        time_limit_minutes: number;
        passing_score: number;
        academy_courses: { title: string } | null;
      }>
    ) || []
  ).map((e) => ({
    id: e.id,
    title: e.title,
    course_id: e.course_id,
    course_title: e.academy_courses?.title ?? '',
    time_limit_minutes: e.time_limit_minutes,
    passing_score: e.passing_score,
  }));
}
