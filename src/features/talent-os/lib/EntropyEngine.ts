import { supabase } from '@/shared/api/supabase';
import type { TalentSkill } from '@/features/talent-os/types';

export type DecayLevel = 'none' | 'mild' | 'severe';

export interface SkillDecayResult {
  skillId: string;
  skillName: string;
  originalScore: number;
  effectiveScore: number;
  daysInactive: number;
  decayLevel: DecayLevel;
}

export interface AuditorDecaySummary {
  auditorId: string;
  skills: SkillDecayResult[];
  hasAnyDecay: boolean;
  severeDecayCount: number;
  mildDecayCount: number;
}

const DECAY_THRESHOLD_MILD   = 180;
const DECAY_THRESHOLD_SEVERE = 365;
const DECAY_MULT_MILD        = 0.9;
const DECAY_MULT_SEVERE      = 0.8;
const MIN_PROFICIENCY        = 1;

function daysSince(dateStr: string | null): number {
  if (!dateStr) return 9999;
  const last = new Date(dateStr).getTime();
  const now  = Date.now();
  return Math.max(0, Math.floor((now - last) / 86_400_000));
}

export function calculateDecay(skill: TalentSkill): SkillDecayResult {
  const daysInactive = daysSince(skill.last_used_date);
  const decayFactor  = skill.decay_factor ?? 0.95;

  let decayMultiplier = 1.0;
  let decayLevel: DecayLevel = 'none';

  if (daysInactive > DECAY_THRESHOLD_SEVERE) {
    decayMultiplier = DECAY_MULT_SEVERE * decayFactor;
    decayLevel = 'severe';
  } else if (daysInactive > DECAY_THRESHOLD_MILD) {
    decayMultiplier = DECAY_MULT_MILD * decayFactor;
    decayLevel = 'mild';
  }

  const effectiveScore = Math.max(
    MIN_PROFICIENCY,
    parseFloat((skill.proficiency_level * decayMultiplier).toFixed(2)),
  );

  return {
    skillId: skill.id,
    skillName: skill.skill_name,
    originalScore: skill.proficiency_level,
    effectiveScore,
    daysInactive,
    decayLevel,
  };
}

export function calculateAuditorDecay(
  auditorId: string,
  skills: TalentSkill[],
): AuditorDecaySummary {
  const decayResults = skills.map(calculateDecay);
  const severeDecayCount = decayResults.filter((r) => r.decayLevel === 'severe').length;
  const mildDecayCount   = decayResults.filter((r) => r.decayLevel === 'mild').length;

  return {
    auditorId,
    skills: decayResults,
    hasAnyDecay: severeDecayCount + mildDecayCount > 0,
    severeDecayCount,
    mildDecayCount,
  };
}

export async function persistDecayResults(
  results: SkillDecayResult[],
): Promise<void> {
  if (results.length === 0) return;

  const now = new Date().toISOString();
  const updates = results
    .filter((r) => r.decayLevel !== 'none')
    .map((r) => ({
      id: r.skillId,
      effective_proficiency: r.effectiveScore,
      decay_applied_at: now,
    }));

  if (updates.length === 0) return;

  for (const update of updates) {
    await supabase
      .from('talent_skills')
      .update({
        effective_proficiency: update.effective_proficiency,
        decay_applied_at: update.decay_applied_at,
      })
      .eq('id', update.id);
  }
}

const AUDIT_TYPE_SKILL_MAP: Record<string, string[]> = {
  COMPREHENSIVE: ['Risk Değerlendirme', 'Kontrol Testi', 'Raporlama', 'Veri Analizi', 'Risk', 'Kontrol'],
  TARGETED:      ['Kontrol Testi', 'IT Denetim', 'Veri Analizi', 'Kontrol'],
  FOLLOW_UP:     ['Raporlama', 'Mülakat Tekniği', 'Raporlama'],
  IT_AUDIT:      ['IT Denetim', 'Siber Güvenlik', 'Veri Analizi'],
  FINANCIAL:     ['Finansal Analiz', 'Kontrol Testi', 'Risk Değerlendirme'],
  COMPLIANCE:    ['Uyum', 'Mevzuat', 'Raporlama'],
};

export async function markSkillsUsedForEngagement(
  auditorId: string,
  auditType: string,
): Promise<void> {
  const relevantSkillNames = AUDIT_TYPE_SKILL_MAP[auditType] ?? AUDIT_TYPE_SKILL_MAP.COMPREHENSIVE;

  const { data: skills } = await supabase
    .from('talent_skills')
    .select('id, skill_name')
    .eq('auditor_id', auditorId);

  if (!skills?.length) return;

  const today = new Date().toISOString().split('T')[0];

  const matchingIds = skills
    .filter((s) =>
      relevantSkillNames.some(
        (req) =>
          s.skill_name.toLowerCase().includes(req.toLowerCase()) ||
          req.toLowerCase().includes(s.skill_name.toLowerCase()),
      ),
    )
    .map((s) => s.id);

  if (matchingIds.length === 0) return;

  await supabase
    .from('talent_skills')
    .update({ last_used_date: today })
    .in('id', matchingIds);
}

export function buildDecayMap(
  summary: AuditorDecaySummary,
): Record<string, SkillDecayResult> {
  const map: Record<string, SkillDecayResult> = {};
  for (const s of summary.skills) {
    map[s.skillName] = s;
  }
  return map;
}
