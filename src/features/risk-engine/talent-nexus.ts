/**
 * STRATEGIC NEXUS — Talent-Risk Bridge
 *
 * Links the Talent OS (proficiency data) to the Risk Engine so that the
 * Board sees "High Risk" as a product of both market conditions *and*
 * internal audit team capability.
 *
 * Algorithm:
 *   teamSkillAvg < 40  → Talent_Capability_Score = 1.2  (+20% risk)
 *   teamSkillAvg 40–80 → Talent_Capability_Score = 1.0  (neutral)
 *   teamSkillAvg > 80  → Talent_Capability_Score = 0.9  (-10% risk)
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type { TalentAdjustment, TalentBand } from './methodology-types';

export const TALENT_WEAK_THRESHOLD   = 40;
export const TALENT_STRONG_THRESHOLD = 80;
export const TALENT_MULTIPLIER_WEAK   = 1.2;
export const TALENT_MULTIPLIER_STRONG = 0.9;
export const TALENT_MULTIPLIER_NEUTRAL = 1.0;

/**
 * Canonical domain keywords and their normalised labels.
 * Used to map risk_category → skill_name search keyword.
 */
export const DOMAIN_KEYWORD_MAP: Record<string, string> = {
  treasury:    'Treasury',
  hazine:      'Treasury',
  credit:      'Credit',
  kredi:       'Credit',
  cyber:       'Cyber',
  siber:       'Cyber',
  compliance:  'Compliance',
  uyum:        'Compliance',
  finance:     'Finance',
  finans:      'Finance',
  operational: 'Operational',
  operasyon:   'Operational',
  risk:        'Risk',
  shariah:     'Shariah',
  islami:      'Shariah',
};

/** Extracts a domain keyword from a free-text risk category string. */
export function getDomainKeyword(category: string): string {
  const lower = (category ?? '').toLowerCase();
  for (const [key, canonical] of Object.entries(DOMAIN_KEYWORD_MAP)) {
    if (lower.includes(key)) return canonical;
  }
  return (category ?? 'General').split(' ')[0] || 'General';
}

/**
 * Builds a { domainCanonical → avgScore } map from a flat list of
 * talent_skills rows.  Uses `effective_proficiency` (decay-adjusted)
 * when available, falls back to `proficiency_level`.
 */
export function buildDomainAverageMap(
  skills: Array<{ skill_name: string; proficiency_level: number; effective_proficiency: number | null }>,
): Map<string, number> {
  const buckets = new Map<string, number[]>();

  for (const skill of skills) {
    const score = skill.effective_proficiency ?? skill.proficiency_level;
    const domain = getDomainKeyword(skill.skill_name);
    if (!buckets.has(domain)) buckets.set(domain, []);
    buckets.get(domain)!.push(score);
  }

  const averages = new Map<string, number>();
  for (const [domain, scores] of buckets.entries()) {
    averages.set(domain, scores.reduce((s, v) => s + v, 0) / scores.length);
  }
  return averages;
}

/**
 * Given a base score and domain average, computes the full TalentAdjustment
 * descriptor that the Risk Engine and UI consume.
 */
export function computeTalentAdjustment(
  domainKeyword: string,
  baseScore: number,
  domainAvgMap: Map<string, number>,
): TalentAdjustment {
  const normalised = getDomainKeyword(domainKeyword);
  const avg = domainAvgMap.get(normalised) ?? null;

  if (avg === null) {
    return {
      multiplier:    TALENT_MULTIPLIER_NEUTRAL,
      teamSkillAvg:  null,
      band:          'NO_DATA' as TalentBand,
      label:         'Yetenek Verisi Yok',
      tooltip:       `"${normalised}" alanı için ekip verisi bulunamadı. Risk nötr bırakıldı.`,
      adjustedScore: Math.min(100, Math.max(0, baseScore)),
      domainKeyword: normalised,
    };
  }

  let multiplier: number;
  let band: TalentBand;
  let label: string;
  let tooltip: string;

  if (avg < TALENT_WEAK_THRESHOLD) {
    multiplier = TALENT_MULTIPLIER_WEAK;
    band       = 'WEAK';
    label      = `Zayıf Ekip (+%20)`;
    tooltip    = `Yetenek Ayarı: +%20 — Ekip Ort: ${avg.toFixed(0)}/100. Yetersiz yetkinlik, risk artırıldı.`;
  } else if (avg > TALENT_STRONG_THRESHOLD) {
    multiplier = TALENT_MULTIPLIER_STRONG;
    band       = 'STRONG';
    label      = `Güçlü Ekip (-%10)`;
    tooltip    = `Yetenek Ayarı: -%10 — Ekip Ort: ${avg.toFixed(0)}/100. Yüksek yetkinlik, risk azaltıldı.`;
  } else {
    multiplier = TALENT_MULTIPLIER_NEUTRAL;
    band       = 'AVERAGE';
    label      = 'Ortalama Ekip';
    tooltip    = `Yetenek Ayarı: Yok — Ekip Ort: ${avg.toFixed(0)}/100. Yeterli yetkinlik, risk sabit.`;
  }

  const adjustedScore = Math.min(100, Math.max(0, Number((baseScore * multiplier).toFixed(2))));

  return {
    multiplier,
    teamSkillAvg:  Math.round(avg),
    band,
    label,
    tooltip,
    adjustedScore,
    domainKeyword: normalised,
  };
}

/**
 * React Query hook — fetches all talent_skills once and exposes the
 * domain-average map. Stale for 5 minutes (proficiency data is slow-changing).
 */
export function useTalentSkillAverages() {
  return useQuery({
    queryKey: ['talent-nexus-domain-averages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('talent_skills')
        .select('skill_name, proficiency_level, effective_proficiency');

      if (error) return new Map<string, number>();
      return buildDomainAverageMap(
        (data ?? []) as Array<{
          skill_name: string;
          proficiency_level: number;
          effective_proficiency: number | null;
        }>,
      );
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Convenience: given a heatmap cell score (impact × likelihood) and a
 * domain category string, return the talent-adjusted cell score.
 * Returns null if avgMap is not yet loaded.
 */
export function applyTalentToHeatmapScore(
  cellScore: number,
  riskCategory: string,
  avgMap: Map<string, number> | undefined,
): { adjusted: number; adjustment: TalentAdjustment } | null {
  if (!avgMap) return null;
  const adjustment = computeTalentAdjustment(riskCategory, cellScore, avgMap);
  return { adjusted: adjustment.adjustedScore, adjustment };
}
