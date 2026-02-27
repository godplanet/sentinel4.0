import type { TalentProfileWithSkills } from '@/features/talent-os/types';

export interface AuditorProfile {
  id: string;
  name: string;
  fatigueScore: number;
  skills: string[];
}

export interface AssessmentResult {
  isAllowed: boolean;
  fatigueScore: number;
  missingSkills: string[];
  blockReason: string | null;
}

const FATIGUE_CRITICAL_THRESHOLD = 85;

export function evaluateAssignment(
  auditor: AuditorProfile,
  requiredSkills: string[],
): AssessmentResult {
  const missingSkills = requiredSkills.filter(
    (req) =>
      !auditor.skills.some(
        (s) =>
          s.toLowerCase().includes(req.toLowerCase()) ||
          req.toLowerCase().includes(s.toLowerCase()),
      ),
  );

  if (auditor.fatigueScore > FATIGUE_CRITICAL_THRESHOLD) {
    return {
      isAllowed: false,
      fatigueScore: auditor.fatigueScore,
      missingSkills,
      blockReason: 'FATIGUE_CRITICAL',
    };
  }

  if (missingSkills.length > 0) {
    return {
      isAllowed: false,
      fatigueScore: auditor.fatigueScore,
      missingSkills,
      blockReason: 'SKILL_GAP',
    };
  }

  return {
    isAllowed: true,
    fatigueScore: auditor.fatigueScore,
    missingSkills: [],
    blockReason: null,
  };
}

export type SortMode = 'best_match' | 'best_value';

export interface AllocationResult {
  auditor: TalentProfileWithSkills;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  blocked: boolean;
  blockReason?: string;
  projectedCost: number;
  currency: string;
  valueRatio: number;
}

export interface AllocatorOptions {
  maxFatigueScore?: number;
  topN?: number;
  estimatedHours?: number;
  sortMode?: SortMode;
}

export interface TeamFatigueStats {
  average: number;
  critical: number;
  inGreenZone: number;
}

export interface SkillGap {
  skill: string;
  coveredBy: number;
  totalAuditors: number;
}

function scoreAuditor(
  auditor: TalentProfileWithSkills,
  requiredSkills: string[],
  maxFatigueScore: number,
  estimatedHours: number,
): AllocationResult {
  const auditorSkillNames = auditor.skills.map((s) => s.skill_name.toLowerCase());

  const matched = requiredSkills.filter((req) =>
    auditorSkillNames.some(
      (s) => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s),
    ),
  );
  const missing = requiredSkills.filter(
    (req) =>
      !auditorSkillNames.some(
        (s) => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s),
      ),
  );

  const blocked = auditor.fatigue_score > maxFatigueScore || !auditor.is_available;
  const blockReason = auditor.fatigue_score > maxFatigueScore
    ? `Yorgunluk skoru çok yüksek (${auditor.fatigue_score}/100)`
    : !auditor.is_available
      ? 'Müsait değil'
      : undefined;

  const skillRatio = requiredSkills.length > 0 ? matched.length / requiredSkills.length : 1;
  const skillScore = skillRatio * 70;
  const fatigueHeadroom = Math.max(0, maxFatigueScore - auditor.fatigue_score);
  const fatigueScore = Math.min(20, (fatigueHeadroom / maxFatigueScore) * 20);
  const availabilityScore = auditor.is_available ? 10 : 0;
  const rawMatchScore = Math.round(skillScore + fatigueScore + availabilityScore);
  const matchScore = blocked ? Math.round(rawMatchScore * 0.4) : rawMatchScore;

  const hourlyRate = auditor.hourly_rate ?? 1500;
  const projectedCost = Math.round(hourlyRate * estimatedHours);
  const currency = auditor.currency ?? 'TRY';

  const valueRatio = projectedCost > 0 ? parseFloat((matchScore / projectedCost * 10000).toFixed(4)) : 0;

  return {
    auditor,
    matchScore,
    matchedSkills: matched,
    missingSkills: missing,
    blocked,
    blockReason,
    projectedCost,
    currency,
    valueRatio,
  };
}

export function suggestAuditors(
  requiredSkills: string[],
  allAuditors: TalentProfileWithSkills[],
  options: AllocatorOptions = {},
): AllocationResult[] {
  const {
    maxFatigueScore = 80,
    topN,
    estimatedHours = 0,
    sortMode = 'best_match',
  } = options;

  const results = allAuditors.map((a) =>
    scoreAuditor(a, requiredSkills, maxFatigueScore, estimatedHours),
  );

  results.sort((a, b) => {
    if (a.blocked !== b.blocked) return a.blocked ? 1 : -1;
    if (sortMode === 'best_value') {
      return b.valueRatio - a.valueRatio;
    }
    return b.matchScore - a.matchScore;
  });

  return topN ? results.slice(0, topN) : results;
}

export function formatCost(amount: number, currency = 'TRY'): string {
  if (currency === 'TRY') {
    return `₺${amount.toLocaleString('tr-TR')}`;
  }
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US')}`;
  }
  if (currency === 'EUR') {
    return `€${amount.toLocaleString('de-DE')}`;
  }
  return `${currency} ${amount.toLocaleString()}`;
}

export const HIGH_COST_THRESHOLD_TRY = 100_000;

export function isHighCost(cost: number, currency = 'TRY'): boolean {
  if (currency === 'TRY') return cost > HIGH_COST_THRESHOLD_TRY;
  if (currency === 'USD') return cost > 3000;
  if (currency === 'EUR') return cost > 2800;
  return false;
}

export function getTeamFatigueStats(auditors: TalentProfileWithSkills[]): TeamFatigueStats {
  if (auditors.length === 0) return { average: 0, critical: 0, inGreenZone: 0 };
  const total = auditors.reduce((sum, a) => sum + a.fatigue_score, 0);
  return {
    average: Math.round(total / auditors.length),
    critical: auditors.filter((a) => a.fatigue_score > 80).length,
    inGreenZone: auditors.filter((a) => a.burnout_zone === 'GREEN').length,
  };
}

export function getSkillGaps(auditors: TalentProfileWithSkills[], topN = 5): SkillGap[] {
  const allSkills = new Set(auditors.flatMap((a) => a.skills.map((s) => s.skill_name)));
  const gaps: SkillGap[] = [];

  allSkills.forEach((skill) => {
    const covered = auditors.filter((a) =>
      a.skills.some((s) => s.skill_name === skill && s.proficiency_level >= 3),
    ).length;
    gaps.push({ skill, coveredBy: covered, totalAuditors: auditors.length });
  });

  gaps.sort((a, b) => a.coveredBy - b.coveredBy);
  return gaps.slice(0, topN);
}
