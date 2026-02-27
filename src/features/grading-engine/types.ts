/**
 * SENTINEL v4.0 - ULTIMATE GRADING ENGINE
 * Kısıt Bazlı Kesinti Modeli (Constraint-Based Deduction Model)
 *
 * Rule Source: Sentinel_Infografik.html & User Requirements
 */

export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface FindingSeverityCounts {
  count_critical: number;
  count_high: number;
  count_medium: number;
  count_low: number;
  total: number;
}

export interface DeductionStep {
  severity: string;
  count: number;
  pointsEach: number;
  totalDeduction: number;
  runningScore: number;
  label?: string; // For waterfall chart display
}

export interface CappingResult {
  triggered: boolean;
  reason: string | null;
  cappedFrom: number | null;
  cappedTo: number | null;
  cappedGrade?: string; // Which grade it was capped to
}

/**
 * GRADING CONFIGURATION (The Constitution)
 * This defines the entire grading behavior and can be stored as JSONB in database
 */
export interface GradingConfig {
  base_score: number; // Default: 100

  // Deduction points per severity
  deductions: Record<FindingSeverity, number>;

  // Multipliers for special conditions
  multipliers: {
    repeat_finding: number; // Penalty for recurring findings (e.g., 1.5x)
    sla_breach_monthly: number; // Penalty increase per month over SLA (e.g., 0.1 = 10% per month)
  };

  // Logic gates and constraints
  logic_gates: {
    // Rule: If X findings of severity Y exist, cap grade at Z
    capping: Array<{
      severity: FindingSeverity;
      count_threshold: number; // How many findings trigger the cap?
      max_grade: string; // What's the maximum grade allowed? (e.g., 'C')
    }>;

    // Rule: If finding has any of these tags, automatic fail
    auto_fail_tags: string[]; // e.g., ['fraud', 'cyber-security-breach']
  };

  // Grade scale mapping (score ranges to letter grades)
  grade_scale: Array<{
    grade: string; // A+, A, B, C, D, F
    min_score: number; // Minimum score for this grade
    color: string; // Hex color for UI
    label: string; // Turkish label for display
  }>;
}

/**
 * DEFAULT CONSTITUTION
 * Rule Source: User requirements from Sentinel_Infografik.html
 */
export const DEFAULT_CONSTITUTION: GradingConfig = {
  base_score: 100,

  // Rule: Base deduction points per severity
  deductions: {
    critical: 25, // 25 points per critical finding
    high: 10,     // 10 points per high finding
    medium: 5,    // 5 points per medium finding
    low: 1,       // 1 point per low finding
  },

  // Rule: Multipliers for special conditions
  multipliers: {
    repeat_finding: 1.5,      // Recurring findings get 1.5x penalty
    sla_breach_monthly: 0.1,  // 10% additional penalty per month over SLA
  },

  // Rule: Logic gates
  logic_gates: {
    // Rule: Critical/High finding count thresholds
    capping: [
      {
        severity: 'critical',
        count_threshold: 1, // If 1+ critical finding exists
        max_grade: 'C',     // Maximum grade is C (70-79)
      },
      {
        severity: 'high',
        count_threshold: 3, // If 3+ high findings exist
        max_grade: 'C',     // Maximum grade is C (70-79)
      },
    ],

    // Rule: Auto-fail tags
    auto_fail_tags: [
      'bilgi-guvenligi-ihlali',
      'zimmet',
      'dolandiricilik',
      'fraud',
      'embezzlement',
    ],
  },

  // Rule: Grade scale (sorted by min_score descending)
  grade_scale: [
    { grade: 'A+', min_score: 95, color: '#10b981', label: 'Kusursuz' },
    { grade: 'A',  min_score: 90, color: '#34d399', label: 'Çok İyi' },
    { grade: 'B+', min_score: 85, color: '#60a5fa', label: 'İyi+' },
    { grade: 'B',  min_score: 80, color: '#3b82f6', label: 'İyi' },
    { grade: 'C+', min_score: 75, color: '#fbbf24', label: 'Kabul Edilebilir+' },
    { grade: 'C',  min_score: 70, color: '#f59e0b', label: 'Kabul Edilebilir' },
    { grade: 'D',  min_score: 60, color: '#f97316', label: 'Zayıf' },
    { grade: 'F',  min_score: 0,  color: '#ef4444', label: 'Başarısız' },
  ],
};

export interface GradingResult {
  baseScore: number;
  totalDeductions: number;
  scoreBeforeCapping: number;
  finalScore: number;
  finalGrade: string;
  assuranceOpinion: string;
  assuranceLabel: string;
  color: string; // Grade color from scale
  capping: CappingResult;
  waterfall: DeductionStep[];
  counts: FindingSeverityCounts;
}

export interface EngagementGradingRow {
  id: string;
  title: string;
  final_score: number | null;
  final_grade: string | null;
  assurance_opinion: string | null;
  capping_triggered: boolean;
  capping_reason: string | null;
  risk_weight_factor: number;
  total_deductions: number | null;
  grading_breakdown: DeductionStep[] | null;
}

export interface GroupConsolidationRow {
  tenant_id: string;
  plan_id: string;
  engagement_count: number;
  weighted_average_score: number;
  simple_average_score: number;
  capped_count: number;
  total_risk_weight: number;
  min_score: number;
  max_score: number;
}
