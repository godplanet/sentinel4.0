/**
 * ALGORITHMIC SCOPING ENGINE
 * Risk-based audit hour estimation with velocity integration
 * Formula: Hours = Base × RiskMultiplier × VelocityMultiplier
 */

export interface ScopingInput {
  risk_score: number;
  velocity_multiplier?: number;
  entity_type?: string;
  complexity_factors?: {
    transaction_volume?: 'low' | 'medium' | 'high';
    regulatory_complexity?: 'low' | 'medium' | 'high';
    control_maturity?: 'weak' | 'moderate' | 'strong';
  };
}

export interface ScopingResult {
  estimated_hours: number;
  base_hours: number;
  risk_multiplier: number;
  velocity_multiplier: number;
  complexity_adjustment: number;
  calculation_notes: string[];
}

const BASE_HOURS = 100;

const ENTITY_TYPE_MULTIPLIERS: Record<string, number> = {
  DOMAIN: 1.5,
  PROCESS: 1.0,
  SUB_PROCESS: 0.8,
  APPLICATION: 0.6,
  default: 1.0,
};

const COMPLEXITY_FACTORS = {
  transaction_volume: {
    low: 0.8,
    medium: 1.0,
    high: 1.3,
  },
  regulatory_complexity: {
    low: 0.9,
    medium: 1.0,
    high: 1.4,
  },
  control_maturity: {
    weak: 1.3,
    moderate: 1.0,
    strong: 0.8,
  },
};

export function calculateAuditBudget(input: ScopingInput): ScopingResult {
  const notes: string[] = [];

  const baseHours = BASE_HOURS;
  notes.push(`Base hours: ${baseHours}`);

  const riskMultiplier = Math.max(0.5, input.risk_score / 50);
  notes.push(
    `Risk multiplier: ${riskMultiplier.toFixed(2)} (score ${input.risk_score} / 50)`
  );

  let velocityMultiplier = 1.0;
  if (input.velocity_multiplier && input.velocity_multiplier > 1.0) {
    velocityMultiplier = 1.0 + ((input.velocity_multiplier - 1.0) * 0.5);
    notes.push(
      `Velocity adjustment: +${((velocityMultiplier - 1.0) * 100).toFixed(0)}% (deteriorating risk)`
    );
  }

  const entityTypeMultiplier =
    ENTITY_TYPE_MULTIPLIERS[input.entity_type || 'default'] ||
    ENTITY_TYPE_MULTIPLIERS.default;
  if (input.entity_type) {
    notes.push(`Entity type adjustment: ${entityTypeMultiplier}x for ${input.entity_type}`);
  }

  let complexityAdjustment = 1.0;
  if (input.complexity_factors) {
    const { transaction_volume, regulatory_complexity, control_maturity } =
      input.complexity_factors;

    if (transaction_volume) {
      complexityAdjustment *= COMPLEXITY_FACTORS.transaction_volume[transaction_volume];
      notes.push(`Transaction volume (${transaction_volume}): ${COMPLEXITY_FACTORS.transaction_volume[transaction_volume]}x`);
    }
    if (regulatory_complexity) {
      complexityAdjustment *= COMPLEXITY_FACTORS.regulatory_complexity[regulatory_complexity];
      notes.push(`Regulatory complexity (${regulatory_complexity}): ${COMPLEXITY_FACTORS.regulatory_complexity[regulatory_complexity]}x`);
    }
    if (control_maturity) {
      complexityAdjustment *= COMPLEXITY_FACTORS.control_maturity[control_maturity];
      notes.push(`Control maturity (${control_maturity}): ${COMPLEXITY_FACTORS.control_maturity[control_maturity]}x`);
    }
  }

  const estimatedHours = Math.round(
    baseHours *
      riskMultiplier *
      velocityMultiplier *
      entityTypeMultiplier *
      complexityAdjustment
  );

  notes.push(`Final calculation: ${baseHours} × ${riskMultiplier.toFixed(2)} × ${velocityMultiplier.toFixed(2)} × ${entityTypeMultiplier.toFixed(2)} × ${complexityAdjustment.toFixed(2)} = ${estimatedHours} hours`);

  return {
    estimated_hours: Math.max(20, Math.min(500, estimatedHours)),
    base_hours: baseHours,
    risk_multiplier: riskMultiplier,
    velocity_multiplier: velocityMultiplier,
    complexity_adjustment: complexityAdjustment,
    calculation_notes: notes,
  };
}

export function getRiskCategory(score: number): string {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  if (score >= 20) return 'Low';
  return 'Minimal';
}

export function getSuggestedAuditType(
  entityType: string,
  riskScore: number
): string {
  if (riskScore >= 80) return 'COMPREHENSIVE';
  if (riskScore >= 60) return 'TARGETED';
  if (riskScore >= 40) return 'REVIEW';
  if (entityType === 'DOMAIN') return 'GOVERNANCE';
  return 'ADVISORY';
}

export function generateAuditPeriod(
  riskScore: number,
  year: number
): { start_date: string; end_date: string } {
  const quarterMap: Record<string, { month: number; quarter: string }> = {
    Critical: { month: 0, quarter: 'Q1' },
    High: { month: 3, quarter: 'Q2' },
    Medium: { month: 6, quarter: 'Q3' },
    Low: { month: 9, quarter: 'Q4' },
    Minimal: { month: 9, quarter: 'Q4' },
  };

  const category = getRiskCategory(riskScore);
  const { month } = quarterMap[category];

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 2, 28);

  return {
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
  };
}
