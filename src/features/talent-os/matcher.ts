import type { TalentProfileWithSkills, AuditRequirement, FitResult } from './types';

export function findBestFit(
  auditors: TalentProfileWithSkills[],
  requirement: AuditRequirement
): FitResult[] {
  const results: FitResult[] = auditors.map((auditor) => {
    if (auditor.burnout_zone === 'RED') {
      return {
        auditor,
        fitScore: 0,
        matchedSkills: buildSkillMap(auditor, requirement),
        blocked: true,
        blockReason: 'Yorgunluk seviyesi kritik (RED zone)',
      };
    }

    if (!auditor.is_available) {
      return {
        auditor,
        fitScore: 0,
        matchedSkills: buildSkillMap(auditor, requirement),
        blocked: true,
        blockReason: 'Denetci musait degil',
      };
    }

    const matchedSkills = buildSkillMap(auditor, requirement);
    const fitScore = calculateFitScore(matchedSkills, auditor);

    return { auditor, fitScore, matchedSkills, blocked: false };
  });

  return results.sort((a, b) => {
    if (a.blocked && !b.blocked) return 1;
    if (!a.blocked && b.blocked) return -1;
    return b.fitScore - a.fitScore;
  });
}

function buildSkillMap(
  auditor: TalentProfileWithSkills,
  requirement: AuditRequirement
): Record<string, { required: number; actual: number }> {
  const map: Record<string, { required: number; actual: number }> = {};

  for (const [skillName, requiredLevel] of Object.entries(requirement.skills)) {
    const skill = auditor.skills.find((s) => s.skill_name === skillName);
    map[skillName] = {
      required: requiredLevel,
      actual: skill?.proficiency_level ?? 0,
    };
  }

  return map;
}

function calculateFitScore(
  matchedSkills: Record<string, { required: number; actual: number }>,
  auditor: TalentProfileWithSkills
): number {
  const entries = Object.entries(matchedSkills);
  if (entries.length === 0) return 50;

  let totalWeight = 0;
  let weightedScore = 0;

  for (const [, { required, actual }] of entries) {
    const weight = required;
    totalWeight += weight;

    if (actual >= required) {
      weightedScore += weight * 100;
    } else if (actual > 0) {
      weightedScore += weight * ((actual / required) * 80);
    }
  }

  const skillMatch = totalWeight > 0 ? weightedScore / totalWeight : 0;

  let fatigueBonus = 0;
  if (auditor.burnout_zone === 'GREEN') fatigueBonus = 10;
  else if (auditor.burnout_zone === 'AMBER') fatigueBonus = 0;

  const levelBonus = Math.min(auditor.current_level * 2, 10);

  return Math.round(Math.min(skillMatch * 0.8 + fatigueBonus + levelBonus, 100));
}
