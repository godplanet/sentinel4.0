/**
 * CONSTITUTIONAL RISK ENGINE
 * Validates and calculates risk scores according to SENTINEL_CONSTITUTION
 */

import { SENTINEL_CONSTITUTION, ConstitutionUtils } from '@/shared/config';

export interface RiskInput {
  impact: number;
  likelihood: number;
  velocity?: number;
  control_effectiveness?: number;
  transaction_volume?: number;
}

export interface RiskOutput {
  inherent_risk_score: number;
  residual_risk_score: number;
  risk_zone: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  risk_color: string;
  risk_label: string;
  formula_breakdown: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate risk inputs against Constitutional scales
 */
export function validateRiskInputs(input: RiskInput): ValidationResult {
  const errors: string[] = [];

  // Impact validation (1-5)
  if (input.impact < 1 || input.impact > 5) {
    errors.push(`Impact must be between 1 and 5 (got ${input.impact})`);
  }
  if (!Number.isInteger(input.impact)) {
    errors.push('Impact must be an integer');
  }

  // Likelihood validation (1-5)
  if (input.likelihood < 1 || input.likelihood > 5) {
    errors.push(`Likelihood must be between 1 and 5 (got ${input.likelihood})`);
  }
  if (!Number.isInteger(input.likelihood)) {
    errors.push('Likelihood must be an integer');
  }

  // Velocity validation (0.8-1.5)
  if (input.velocity !== undefined) {
    if (input.velocity < 0.8 || input.velocity > 1.5) {
      errors.push(`Velocity must be between 0.8 and 1.5 (got ${input.velocity})`);
    }
  }

  // Control effectiveness validation (0-1)
  if (input.control_effectiveness !== undefined) {
    if (input.control_effectiveness < 0 || input.control_effectiveness > 1) {
      errors.push(`Control effectiveness must be between 0 and 1 (got ${input.control_effectiveness})`);
    }
  }

  // Transaction volume validation (>= 0)
  if (input.transaction_volume !== undefined) {
    if (input.transaction_volume < 0) {
      errors.push(`Transaction volume must be >= 0 (got ${input.transaction_volume})`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate risk score using Constitutional formula
 * Formula: Impact × Likelihood × Velocity
 * Residual: Inherent × (1 - Control_Effectiveness)
 */
export function calculateConstitutionalRisk(input: RiskInput): RiskOutput {
  // Validate inputs
  const validation = validateRiskInputs(input);
  if (!validation.valid) {
    throw new Error(`Invalid risk inputs: ${validation.errors.join(', ')}`);
  }

  // Extract parameters with defaults
  const {
    impact,
    likelihood,
    velocity = 1.0,
    control_effectiveness = 0,
    transaction_volume = 0,
  } = input;

  // Calculate inherent risk (base formula)
  let inherent = impact * likelihood * velocity;

  // Add volume adjustment if significant
  if (transaction_volume > 0) {
    const volumeMultiplier = Math.log(1 + transaction_volume / 10000);
    inherent = inherent * (1 + volumeMultiplier * 0.1);
  }

  // Cap at MAX_SCORE
  inherent = Math.min(inherent, SENTINEL_CONSTITUTION.RISK.MAX_SCORE);

  // Calculate residual risk
  const residual = inherent * (1 - control_effectiveness);

  // Determine risk zone
  const zones = SENTINEL_CONSTITUTION.RISK.ZONES;
  let zone: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' = 'GREEN';

  if (residual >= zones.RED.min) {
    zone = 'RED';
  } else if (residual >= zones.ORANGE.min) {
    zone = 'ORANGE';
  } else if (residual >= zones.YELLOW.min) {
    zone = 'YELLOW';
  } else {
    zone = 'GREEN';
  }

  // Get color from Constitution
  const color = ConstitutionUtils.getRiskZoneColor(residual);
  const label = zones[zone].label;

  // Build formula breakdown for transparency
  const breakdown = `${impact} × ${likelihood} × ${velocity.toFixed(2)}${
    control_effectiveness > 0 ? ` × (1 - ${control_effectiveness.toFixed(2)})` : ''
  } = ${residual.toFixed(2)}`;

  return {
    inherent_risk_score: Math.round(inherent * 10) / 10,
    residual_risk_score: Math.round(residual * 10) / 10,
    risk_zone: zone,
    risk_color: color,
    risk_label: label,
    formula_breakdown: breakdown,
  };
}

/**
 * Get risk scale definitions from Constitution
 */
export function getRiskScales() {
  return {
    impact: {
      label: 'Impact',
      min: 1,
      max: 5,
      descriptions: {
        1: 'Insignificant - Minimal impact',
        2: 'Minor - Small financial or operational impact',
        3: 'Moderate - Noticeable impact on operations',
        4: 'Major - Significant financial or reputational damage',
        5: 'Critical - Catastrophic impact on organization',
      },
    },
    likelihood: {
      label: 'Likelihood',
      min: 1,
      max: 5,
      descriptions: {
        1: 'Rare - Less than once per 5 years',
        2: 'Unlikely - Once per 2-5 years',
        3: 'Possible - Once per year',
        4: 'Likely - Multiple times per year',
        5: 'Almost Certain - Monthly or more frequent',
      },
    },
    velocity: {
      label: 'Velocity Multiplier',
      min: 0.8,
      max: 1.5,
      step: 0.1,
      descriptions: {
        0.8: 'Slow - Risk materializes over years',
        1.0: 'Normal - Standard risk velocity',
        1.2: 'Fast - Risk materializes in months',
        1.4: 'Very Fast - Risk materializes in weeks',
        1.5: 'Instantaneous - Immediate impact',
      },
    },
    control_effectiveness: {
      label: 'Control Effectiveness',
      min: 0,
      max: 1,
      step: 0.05,
      descriptions: {
        0: 'No controls',
        0.25: 'Weak controls',
        0.5: 'Moderate controls',
        0.75: 'Strong controls',
        0.9: 'Very strong controls',
        1.0: 'Perfect controls (theoretical)',
      },
    },
  };
}

/**
 * Get all risk zones with their definitions
 */
export function getRiskZones() {
  return SENTINEL_CONSTITUTION.RISK.ZONES;
}

/**
 * Calculate risk matrix position (for heatmap)
 */
export function getRiskMatrixPosition(impact: number, likelihood: number): {
  x: number;
  y: number;
  zone: string;
} {
  return {
    x: likelihood,
    y: impact,
    zone: calculateConstitutionalRisk({ impact, likelihood }).risk_zone,
  };
}

/**
 * Batch calculate risks for multiple entities
 */
export function batchCalculateRisks(inputs: RiskInput[]): RiskOutput[] {
  return inputs.map(input => calculateConstitutionalRisk(input));
}

/**
 * Calculate aggregate risk for a branch (children roll-up)
 */
export function aggregateBranchRisk(childRisks: number[]): {
  max: number;
  avg: number;
  weighted_avg: number;
  count: number;
} {
  if (childRisks.length === 0) {
    return { max: 0, avg: 0, weighted_avg: 0, count: 0 };
  }

  const max = Math.max(...childRisks);
  const sum = childRisks.reduce((a, b) => a + b, 0);
  const avg = sum / childRisks.length;

  // Weighted average (higher risks get more weight)
  const weights = childRisks.map(r => Math.pow(r, 2));
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const weightedAvg = childRisks.reduce((sum, risk, i) =>
    sum + (risk * weights[i] / weightSum), 0
  );

  return {
    max: Math.round(max * 10) / 10,
    avg: Math.round(avg * 10) / 10,
    weighted_avg: Math.round(weightedAvg * 10) / 10,
    count: childRisks.length,
  };
}

/**
 * Get neon glow CSS class based on risk zone
 */
export function getNeonGlowClass(zone: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED'): string {
  const glowMap = {
    GREEN: 'shadow-[0_0_15px_rgba(34,197,94,0.6)]',
    YELLOW: 'shadow-[0_0_15px_rgba(234,179,8,0.6)]',
    ORANGE: 'shadow-[0_0_15px_rgba(249,115,22,0.6)]',
    RED: 'shadow-[0_0_15px_rgba(239,68,68,0.6)]',
  };
  return glowMap[zone];
}

/**
 * Get pulse animation class for critical risks
 */
export function getPulseClass(zone: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED'): string {
  if (zone === 'RED') {
    return 'animate-pulse';
  }
  return '';
}
