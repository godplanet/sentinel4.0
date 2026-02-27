import { supabase } from '@/shared/api/supabase';

// ============================================================
// Kirkpatrick Level 4 — ROI / Results
// Measures whether a course actually improved on-the-job performance.
//
// Method:
//   1. Find when the user first passed an exam for `courseId`.
//   2. Query xp_ledger for WORKPAPER entries with matching `skill_id`.
//   3. Split into PRE and POST cohorts based on the training date.
//   4. Use XP amount as a QAIP quality proxy:
//        amount = 150  →  QAIP > 90  (Exceptional)
//        amount = 100  →  QAIP 70–90 (Satisfactory)
//   5. ROI_Score = ((post_avg − pre_avg) / pre_avg) * 100
// ============================================================

export interface TrainingROIResult {
  userId:            string;
  courseId:          string;
  skillId:           string;
  trainingDate:      string | null;
  preAvgScore:       number;
  postAvgScore:      number;
  roiScore:          number;
  sampleSizePre:     number;
  sampleSizePost:    number;
  isSignificant:     boolean;
  label:             'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'INSUFFICIENT_DATA';
}

export interface TeamROIRow {
  userId:       string;
  courseId:     string;
  courseTitle:  string;
  skillId:      string;
  trainingDate: string | null;
  roiScore:     number;
  label:        TrainingROIResult['label'];
  sampleSize:   number;
}

const MIN_SAMPLES_FOR_SIGNIFICANCE = 3;
const POSITIVE_THRESHOLD           = 5;
const NEGATIVE_THRESHOLD           = -5;

function xpAmountToQaipProxy(amount: number): number {
  if (amount >= 150) return 92;
  if (amount >= 100) return 80;
  if (amount > 0)    return 70;
  return 0;
}

export async function calculateTrainingROI(
  userId:   string,
  courseId: string,
  skillId:  string,
): Promise<TrainingROIResult> {
  const base: Omit<TrainingROIResult, 'label'> = {
    userId,
    courseId,
    skillId,
    trainingDate:   null,
    preAvgScore:    0,
    postAvgScore:   0,
    roiScore:       0,
    sampleSizePre:  0,
    sampleSizePost: 0,
    isSignificant:  false,
  };

  const { data: attempt } = await supabase
    .from('academy_attempts')
    .select('completed_at')
    .eq('user_id', userId)
    .eq('passed', true)
    .order('completed_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!attempt?.completed_at) {
    return { ...base, label: 'INSUFFICIENT_DATA' };
  }

  const trainingDate = attempt.completed_at as string;

  const { data: workpapers } = await supabase
    .from('xp_ledger')
    .select('amount, created_at')
    .eq('user_id', userId)
    .eq('source_type', 'WORKPAPER')
    .eq('skill_id', skillId)
    .order('created_at', { ascending: true });

  if (!workpapers?.length) {
    return { ...base, trainingDate, label: 'INSUFFICIENT_DATA' };
  }

  const pre  = workpapers.filter((w) => w.created_at <  trainingDate);
  const post = workpapers.filter((w) => w.created_at >= trainingDate);

  const avg = (arr: typeof workpapers) =>
    arr.length === 0
      ? 0
      : arr.reduce((s, w) => s + xpAmountToQaipProxy(w.amount as number), 0) / arr.length;

  const preAvg  = avg(pre);
  const postAvg = avg(post);

  let roiScore = 0;
  if (preAvg > 0) {
    roiScore = Math.round(((postAvg - preAvg) / preAvg) * 100 * 10) / 10;
  } else if (postAvg > 0) {
    roiScore = 100;
  }

  const isSignificant =
    pre.length  >= MIN_SAMPLES_FOR_SIGNIFICANCE &&
    post.length >= MIN_SAMPLES_FOR_SIGNIFICANCE;

  let label: TrainingROIResult['label'] = 'NEUTRAL';
  if (!isSignificant || (pre.length + post.length < 2)) {
    label = 'INSUFFICIENT_DATA';
  } else if (roiScore > POSITIVE_THRESHOLD) {
    label = 'POSITIVE';
  } else if (roiScore < NEGATIVE_THRESHOLD) {
    label = 'NEGATIVE';
  }

  return {
    userId,
    courseId,
    skillId,
    trainingDate,
    preAvgScore:    Math.round(preAvg  * 10) / 10,
    postAvgScore:   Math.round(postAvg * 10) / 10,
    roiScore,
    sampleSizePre:  pre.length,
    sampleSizePost: post.length,
    isSignificant,
    label,
  };
}

// ──────────────────────────────────────────────────────────────
// Team-level aggregate: one row per user × course × skill
// ──────────────────────────────────────────────────────────────

interface AttemptRow {
  user_id:      string;
  completed_at: string;
  exam: { course: { id: string; title: string } } | null;
}

export async function fetchTeamTrainingROI(): Promise<TeamROIRow[]> {
  const { data: attempts } = await supabase
    .from('academy_attempts')
    .select(`
      user_id,
      completed_at,
      exam:academy_exams(
        course:academy_courses(id, title)
      )
    `)
    .eq('passed', true)
    .order('completed_at', { ascending: true });

  if (!attempts?.length) return [];

  const seen = new Set<string>();
  const unique: AttemptRow[] = [];

  for (const a of attempts as AttemptRow[]) {
    const courseId = a.exam?.course?.id;
    if (!courseId) continue;
    const key = `${a.user_id}::${courseId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(a);
  }

  const { data: skills } = await supabase
    .from('xp_ledger')
    .select('user_id, skill_id')
    .eq('source_type', 'WORKPAPER')
    .not('skill_id', 'is', null);

  const userSkillMap: Record<string, string[]> = {};
  for (const s of (skills ?? []) as { user_id: string; skill_id: string }[]) {
    if (!s.skill_id) continue;
    const arr = userSkillMap[s.user_id] ?? [];
    if (!arr.includes(s.skill_id)) arr.push(s.skill_id);
    userSkillMap[s.user_id] = arr;
  }

  const results: TeamROIRow[] = [];

  await Promise.all(
    unique.map(async (a) => {
      const courseId    = a.exam?.course?.id     ?? '';
      const courseTitle = a.exam?.course?.title  ?? '';
      const skillIds    = userSkillMap[a.user_id] ?? [];

      if (skillIds.length === 0) {
        results.push({
          userId:       a.user_id,
          courseId,
          courseTitle,
          skillId:      '',
          trainingDate: a.completed_at,
          roiScore:     0,
          label:        'INSUFFICIENT_DATA',
          sampleSize:   0,
        });
        return;
      }

      const roi = await calculateTrainingROI(a.user_id, courseId, skillIds[0]);
      results.push({
        userId:       a.user_id,
        courseId,
        courseTitle,
        skillId:      skillIds[0],
        trainingDate: roi.trainingDate,
        roiScore:     roi.roiScore,
        label:        roi.label,
        sampleSize:   roi.sampleSizePre + roi.sampleSizePost,
      });
    }),
  );

  return results.sort((a, b) => b.roiScore - a.roiScore);
}
