import type { GradingRules, CappingRule } from '@/features/risk-engine/methodology-types';
import type {
  FindingSeverityCounts,
  DeductionStep,
  CappingResult,
  GradingResult,
  GradingConfig,
  FindingSeverity,
} from './types';
import { DEFAULT_CONSTITUTION } from './types';

const DEFAULT_GRADING_RULES: GradingRules = {
  deductions: { critical: 25, high: 10, medium: 3, low: 1 },
  capping: [
    { condition: 'count_critical >= 1', field: 'count_critical', operator: '>=', value: 1, max_score: 60, reason: 'Kritik bulgu mevcut - Maksimum not D' },
    { condition: 'count_high > 3', field: 'count_high', operator: '>', value: 3, max_score: 69, reason: '3+ Yüksek bulgu - Maksimum not C-' },
  ],
  scale: [
    { grade: 'A+', min: 95, max: 100, opinion: 'TAM_GUVENCE', label: 'Tam Güvence' },
    { grade: 'A',  min: 90, max: 94,  opinion: 'TAM_GUVENCE', label: 'Tam Güvence' },
    { grade: 'B+', min: 85, max: 89,  opinion: 'MAKUL_GUVENCE', label: 'Makul Güvence' },
    { grade: 'B',  min: 80, max: 84,  opinion: 'MAKUL_GUVENCE', label: 'Makul Güvence' },
    { grade: 'C+', min: 75, max: 79,  opinion: 'MAKUL_GUVENCE', label: 'Makul Güvence' },
    { grade: 'C',  min: 70, max: 74,  opinion: 'SINIRLI_GUVENCE', label: 'Sınırlı Güvence' },
    { grade: 'C-', min: 65, max: 69,  opinion: 'SINIRLI_GUVENCE', label: 'Sınırlı Güvence' },
    { grade: 'D',  min: 50, max: 64,  opinion: 'SINIRLI_GUVENCE', label: 'Sınırlı Güvence' },
    { grade: 'E',  min: 25, max: 49,  opinion: 'GUVENCE_YOK', label: 'Güvence Yok' },
    { grade: 'F',  min: 0,  max: 24,  opinion: 'GUVENCE_YOK', label: 'Güvence Yok' },
  ],
};

// SENTINEL V3.0: Veto Flags Interface
export interface VetoFlags {
    hasShariahVeto?: boolean;
    hasCyberVeto?: boolean;
    hasLegalVeto?: boolean;
}

export class GradingCalculator {
  private rules: GradingRules;

  constructor(rules?: GradingRules | null) {
    this.rules = rules ?? DEFAULT_GRADING_RULES;
  }

  // SENTINEL V3.0 UPDATE: calculate method now accepts optional vetoFlags
  calculate(counts: FindingSeverityCounts, vetoFlags?: VetoFlags): GradingResult {
    const baseScore = 100;
    const waterfall = this.buildWaterfall(counts, baseScore);
    const totalDeductions = waterfall.reduce((sum, s) => sum + s.totalDeduction, 0);
    const scoreBeforeCapping = Math.max(0, baseScore - totalDeductions);

    // 1. Check Standard Capping Rules
    let capping = this.applyCapping(counts, scoreBeforeCapping);

    // 2. SENTINEL V3.0 ZERO TOLERANCE OVERRIDE (ACİL DURDURMA)
    // If any veto is triggered, it crushes all other calculations and forces a 0 score (F)
    if (vetoFlags?.hasShariahVeto || vetoFlags?.hasCyberVeto || vetoFlags?.hasLegalVeto) {
        let vetoReason = "Sıfır Tolerans İhlali";
        if (vetoFlags.hasShariahVeto) vetoReason = "Şer'i Uyum İhlali (Sıfır Tolerans)";
        else if (vetoFlags.hasCyberVeto) vetoReason = "Kritik Siber Zafiyet (Sıfır Tolerans)";
        else if (vetoFlags.hasLegalVeto) vetoReason = "Aşırı Yasal Risk (Sıfır Tolerans)";

        capping = {
            triggered: true,
            reason: vetoReason,
            cappedFrom: scoreBeforeCapping,
            cappedTo: 0 // FATALITY
        };
    }

    const finalScore = capping.triggered
      ? Math.min(scoreBeforeCapping, capping.cappedTo ?? scoreBeforeCapping)
      : scoreBeforeCapping;

    const scaleEntry = this.resolveGrade(finalScore);

    return {
      baseScore,
      totalDeductions,
      scoreBeforeCapping,
      finalScore,
      finalGrade: scaleEntry.grade,
      assuranceOpinion: scaleEntry.opinion,
      assuranceLabel: scaleEntry.label,
      capping,
      waterfall,
      counts,
    };
  }

  private buildWaterfall(counts: FindingSeverityCounts, baseScore: number): DeductionStep[] {
    const { deductions } = this.rules;
    const steps: DeductionStep[] = [];
    let running = baseScore;

    const severities: { key: keyof FindingSeverityCounts; label: string; points: number }[] = [
      { key: 'count_critical', label: 'Kritik', points: deductions.critical },
      { key: 'count_high', label: 'Yüksek', points: deductions.high },
      { key: 'count_medium', label: 'Orta', points: deductions.medium },
      { key: 'count_low', label: 'Düşük', points: deductions.low },
    ];

    for (const { key, label, points } of severities) {
      const count = counts[key];
      if (count > 0) {
        const totalDeduction = count * points;
        running = Math.max(0, running - totalDeduction);
        steps.push({
          severity: label,
          count,
          pointsEach: points,
          totalDeduction,
          runningScore: running,
        });
      }
    }

    return steps;
  }

  private applyCapping(counts: FindingSeverityCounts, currentScore: number): CappingResult {
    let lowestCap = Infinity;
    let activeReason: string | null = null;

    for (const rule of this.rules.capping) {
      if (this.evaluateCappingRule(rule, counts) && rule.max_score < lowestCap) {
        lowestCap = rule.max_score;
        activeReason = rule.reason;
      }
    }

    if (lowestCap < Infinity && currentScore > lowestCap) {
      return {
        triggered: true,
        reason: activeReason,
        cappedFrom: currentScore,
        cappedTo: lowestCap,
      };
    }

    return { triggered: false, reason: null, cappedFrom: null, cappedTo: null };
  }

  private evaluateCappingRule(rule: CappingRule, counts: FindingSeverityCounts): boolean {
    const fieldValue = (counts as Record<string, number>)[rule.field] ?? 0;

    switch (rule.operator) {
      case '>=': return fieldValue >= rule.value;
      case '>':  return fieldValue > rule.value;
      case '<=': return fieldValue <= rule.value;
      case '<':  return fieldValue < rule.value;
      case '==': return fieldValue === rule.value;
      case '!=': return fieldValue !== rule.value;
      default:   return false;
    }
  }

  private resolveGrade(score: number): { grade: string; opinion: string; label: string } {
    const sorted = [...this.rules.scale].sort((a, b) => b.min - a.min);
    for (const entry of sorted) {
      if (score >= entry.min && score <= entry.max) {
        return { grade: entry.grade, opinion: entry.opinion, label: entry.label };
      }
    }
    const last = sorted[sorted.length - 1];
    return last
      ? { grade: last.grade, opinion: last.opinion, label: last.label }
      : { grade: 'F', opinion: 'GUVENCE_YOK', label: 'Güvence Yok' };
  }
}

import { KERD_CONSTITUTION, GRADING_THRESHOLDS, TAXONOMY_COLORS, VelocityType } from '@/shared/config/constitution';

export interface EntityGradeInput {
  id: string;
  name: string;
  findings: {
    bordo: number;
    kizil: number;
    turuncu: number;
    sari: number;
    gozlem: number;
    shariah_systemic: number;
  };
  [key: string]: unknown;
}

export interface StrategicRiskInput {
  id?: string;
  name?: string;
  impact: number;
  likelihood: number;
  baseVelocity: number;
  shariah_related?: boolean;
  [key: string]: unknown;
}

type AuditEntity = EntityGradeInput;
type StrategicRisk = StrategicRiskInput;

// 1. Varlık Puanı Hesaplama Motoru (Kısıt Bazlı)
export const calculateEntityGrade = (entity: AuditEntity) => {
  const { SCORING, CAPPING } = KERD_CONSTITUTION;
  
  let rawScore = SCORING.BASE_SCORE;
  rawScore -= (entity.findings.bordo * SCORING.DEDUCTIONS.BORDO);
  rawScore -= (entity.findings.kizil * SCORING.DEDUCTIONS.KIZIL);
  rawScore -= (entity.findings.turuncu * SCORING.DEDUCTIONS.TURUNCU);
  rawScore -= (entity.findings.sari * SCORING.DEDUCTIONS.SARI);
  rawScore += Math.min(entity.findings.gozlem * SCORING.BONUS.GOZLEM_MULTIPLIER, SCORING.BONUS.GOZLEM_MAX);

  let finalScore = rawScore;
  let vetoReason = null;

  if (entity.findings.shariah_systemic > 0) {
    finalScore = CAPPING.SHARIAH_VETO_SCORE;
    vetoReason = "Sistemik Şer'i İhlal";
  } else if (entity.findings.bordo >= CAPPING.CRITICAL_THRESHOLD) {
    finalScore = Math.min(finalScore, CAPPING.CRITICAL_CAP_SCORE);
    vetoReason = "Kritik (Bordo) Tavanı";
  } else if (entity.findings.kizil > CAPPING.HIGH_VOLUME_THRESHOLD) {
    finalScore = Math.min(finalScore, CAPPING.HIGH_VOLUME_CAP_SCORE);
    vetoReason = "Yüksek Hacim (Kızıl) Tavanı";
  }

  let gradeData = GRADING_THRESHOLDS.find(g => finalScore >= g.min) || GRADING_THRESHOLDS[GRADING_THRESHOLDS.length - 1];
  
  let opinion = gradeData.opinion;
  let color = gradeData.color;

  if (finalScore === 0 && vetoReason?.includes("Şer'i")) {
    opinion = 'Batıl (Geçersiz)';
    color = TAXONOMY_COLORS.BORDO;
  }

  return { rawScore, finalScore, vetoReason, grade: gradeData.grade, opinion, color, freq: gradeData.frequency };
};

// 2. Risk Skoru Kinetik Hesaplama Motoru (Hız / Velocity)
export const calculateDynamicRisk = (risk: StrategicRisk, selectedVelocity: VelocityType) => {
  const baseScore = risk.impact * risk.likelihood;
  const speedFactor = KERD_CONSTITUTION.VELOCITY_MULTIPLIERS[selectedVelocity] * risk.baseVelocity;
  const dynamicScore = baseScore * (1 + speedFactor);

  let category = 'Sarı (Düşük)';
  let colorClass = TAXONOMY_COLORS.SARI;

  if (risk.shariah_related) {
    category = 'Bordo (Batıl)'; colorClass = TAXONOMY_COLORS.BORDO;
  } else if (dynamicScore >= 20) {
    category = 'Bordo (Kritik)'; colorClass = TAXONOMY_COLORS.BORDO;
  } else if (dynamicScore >= 15) {
    category = 'Kırmızı (Yüksek)'; colorClass = TAXONOMY_COLORS.KIZIL;
  } else if (dynamicScore >= 8) {
    category = 'Turuncu (Orta)'; colorClass = TAXONOMY_COLORS.TURUNCU;
  }

  return { ...risk, baseScore, dynamicScore, speedFactor, category, colorClass };
};

// ============================================================================
// SENTINEL v4.0 - ULTIMATE GRADING ENGINE
// Constraint-Based Deduction Model (Kısıt Bazlı Kesinti Modeli)
// Rule Source: Sentinel_Infografik.html & User Requirements
// ============================================================================

/**
 * Finding Input Interface
 * Represents a single finding with all attributes needed for grading calculation
 */
export interface FindingInput {
  id: string;
  severity: FindingSeverity; // 'critical' | 'high' | 'medium' | 'low'
  title: string;

  // Special condition flags
  is_repeat?: boolean; // Is this a recurring finding?
  tags?: string[]; // Tags for auto-fail detection

  // Age and SLA tracking
  created_at?: Date | string; // When was the finding created?
  sla_due_date?: Date | string; // When is the response due?
  months_over_sla?: number; // Manual override: how many months overdue?
}

/**
 * ULTIMATE GRADING ENGINE - MAIN CALCULATION FUNCTION
 *
 * This is a pure function that calculates audit grade based on findings.
 * Rule: Start at 100, deduct points for each finding, apply multipliers, then enforce caps.
 *
 * @param findings - Array of findings with severity and attributes
 * @param config - Grading configuration (defaults to DEFAULT_CONSTITUTION)
 * @returns Complete grading result with score, grade, and waterfall breakdown
 */
export function calculateAuditScore(
  findings: FindingInput[],
  config: GradingConfig = DEFAULT_CONSTITUTION
): GradingResult {
  const { base_score, deductions, multipliers, logic_gates, grade_scale } = config;

  // =====================================================
  // STEP 1: INITIALIZE
  // =====================================================
  let currentScore = base_score;
  const waterfall: DeductionStep[] = [];
  const counts: FindingSeverityCounts = {
    count_critical: 0,
    count_high: 0,
    count_medium: 0,
    count_low: 0,
    total: findings.length,
  };

  // Rule: Check for auto-fail tags FIRST (immediate F grade)
  const hasAutoFailTag = findings.some(f =>
    f.tags?.some(tag => logic_gates.auto_fail_tags.includes(tag.toLowerCase()))
  );

  if (hasAutoFailTag) {
    // Rule: Auto-fail - bypass all calculations
    const autoFailReason = findings
      .filter(f => f.tags?.some(tag => logic_gates.auto_fail_tags.includes(tag.toLowerCase())))
      .map(f => f.title)
      .join(', ');

    return {
      baseScore: base_score,
      totalDeductions: base_score, // All points deducted
      scoreBeforeCapping: 0,
      finalScore: 0,
      finalGrade: 'F',
      assuranceOpinion: 'GUVENCE_YOK',
      assuranceLabel: 'Güvence Yok',
      color: '#ef4444',
      capping: {
        triggered: true,
        reason: `Otomatik Başarısızlık: ${autoFailReason}`,
        cappedFrom: base_score,
        cappedTo: 0,
        cappedGrade: 'F',
      },
      waterfall: [],
      counts,
    };
  }

  // =====================================================
  // STEP 2: CALCULATE DEDUCTIONS PER FINDING
  // =====================================================
  const deductionDetails: Array<{
    finding: FindingInput;
    baseDeduction: number;
    multiplier: number;
    finalDeduction: number;
  }> = [];

  for (const finding of findings) {
    // Count by severity
    if (finding.severity === 'critical') counts.count_critical++;
    else if (finding.severity === 'high') counts.count_high++;
    else if (finding.severity === 'medium') counts.count_medium++;
    else if (finding.severity === 'low') counts.count_low++;

    // Rule: Get base deduction for this severity
    let baseDeduction = deductions[finding.severity];

    // Rule: Apply repeat finding multiplier if applicable
    let multiplier = 1.0;
    if (finding.is_repeat) {
      multiplier *= multipliers.repeat_finding;
    }

    // Rule: Apply SLA breach penalty (per month)
    let monthsOverSLA = finding.months_over_sla || 0;

    // Auto-calculate months over SLA if dates provided
    if (!monthsOverSLA && finding.created_at && finding.sla_due_date) {
      const created = new Date(finding.created_at);
      const slaDate = new Date(finding.sla_due_date);
      const now = new Date();

      if (now > slaDate) {
        const monthsDiff = Math.floor(
          (now.getTime() - slaDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
        );
        monthsOverSLA = Math.max(0, monthsDiff);
      }
    }

    if (monthsOverSLA > 0) {
      // Rule: Each month over SLA adds X% penalty
      multiplier *= (1 + (monthsOverSLA * multipliers.sla_breach_monthly));
    }

    // Calculate final deduction for this finding
    const finalDeduction = baseDeduction * multiplier;

    deductionDetails.push({
      finding,
      baseDeduction,
      multiplier,
      finalDeduction,
    });

    // Deduct from score
    currentScore -= finalDeduction;
  }

  // Rule: Score cannot go below 0
  currentScore = Math.max(0, currentScore);

  // =====================================================
  // STEP 3: BUILD WATERFALL (Group by severity)
  // =====================================================
  const severityGroups = {
    critical: deductionDetails.filter(d => d.finding.severity === 'critical'),
    high: deductionDetails.filter(d => d.finding.severity === 'high'),
    medium: deductionDetails.filter(d => d.finding.severity === 'medium'),
    low: deductionDetails.filter(d => d.finding.severity === 'low'),
  };

  let runningScore = base_score;

  for (const [severity, details] of Object.entries(severityGroups)) {
    if (details.length === 0) continue;

    const totalDeduction = details.reduce((sum, d) => sum + d.finalDeduction, 0);
    const avgPointsEach = totalDeduction / details.length;

    runningScore = Math.max(0, runningScore - totalDeduction);

    waterfall.push({
      severity: severity.charAt(0).toUpperCase() + severity.slice(1),
      count: details.length,
      pointsEach: Math.round(avgPointsEach * 100) / 100,
      totalDeduction: Math.round(totalDeduction * 100) / 100,
      runningScore: Math.round(runningScore * 100) / 100,
      label: `${details.length} ${severity} bulgu`,
    });
  }

  const totalDeductions = base_score - currentScore;
  const scoreBeforeCapping = currentScore;

  // =====================================================
  // STEP 4: APPLY CAPPING LOGIC
  // =====================================================
  let cappingResult: CappingResult = {
    triggered: false,
    reason: null,
    cappedFrom: null,
    cappedTo: null,
  };

  // Rule: Check each capping rule
  for (const rule of logic_gates.capping) {
    const countKey = `count_${rule.severity}` as keyof FindingSeverityCounts;
    const actualCount = counts[countKey];

    if (actualCount >= rule.count_threshold) {
      // Rule: This capping rule is triggered
      // Find the max score allowed for this grade
      const gradeEntry = grade_scale.find(g => g.grade === rule.max_grade);

      if (gradeEntry && currentScore > gradeEntry.min_score) {
        // Cap the score to this grade's minimum
        cappingResult = {
          triggered: true,
          reason: `${actualCount} ${rule.severity} bulgu mevcut - Maksimum not ${rule.max_grade}`,
          cappedFrom: currentScore,
          cappedTo: gradeEntry.min_score,
          cappedGrade: rule.max_grade,
        };

        currentScore = gradeEntry.min_score;
        break; // Apply first matching cap only
      }
    }
  }

  const finalScore = currentScore;

  // =====================================================
  // STEP 5: RESOLVE GRADE
  // =====================================================
  const sortedScale = [...grade_scale].sort((a, b) => b.min_score - a.min_score);
  let gradeEntry = sortedScale.find(g => finalScore >= g.min_score);

  if (!gradeEntry) {
    gradeEntry = sortedScale[sortedScale.length - 1]; // Fallback to lowest grade
  }

  // Map to assurance opinion
  const opinionMap: Record<string, string> = {
    'A+': 'TAM_GUVENCE',
    'A': 'TAM_GUVENCE',
    'B+': 'MAKUL_GUVENCE',
    'B': 'MAKUL_GUVENCE',
    'C+': 'SINIRLI_GUVENCE',
    'C': 'SINIRLI_GUVENCE',
    'D': 'SINIRLI_GUVENCE',
    'F': 'GUVENCE_YOK',
  };

  const assuranceOpinion = opinionMap[gradeEntry.grade] || 'SINIRLI_GUVENCE';

  // =====================================================
  // STEP 6: RETURN RESULT
  // =====================================================
  return {
    baseScore: base_score,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    scoreBeforeCapping: Math.round(scoreBeforeCapping * 100) / 100,
    finalScore: Math.round(finalScore * 100) / 100,
    finalGrade: gradeEntry.grade,
    assuranceOpinion,
    assuranceLabel: gradeEntry.label,
    color: gradeEntry.color,
    capping: cappingResult,
    waterfall,
    counts,
  };
}