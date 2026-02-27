// ============================================================================
// DOMAIN LOGIC: RISK ENGINE (Basel IV & GIAS 2024)
// ============================================================================

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'OBSERVATION';

export interface RiskInput {
  baseImpact: number; // 1-5
  volume: number;     // Transaction Volume
  controlEffectiveness: number; // 0.0 - 1.0
}

export interface RiskOutput {
  inherentRisk: number;
  residualRisk: number;
  riskLevel: RiskLevel;
}

const CONSTANTS = {
  MIN_VOLUME_MULTIPLIER: 2,
} as const;

/**
 * Calculates Risk based on Impact * ln(Volume) * (1 - Control)
 */
export const calculateRisk = (input: RiskInput): RiskOutput => {
  const volumeMultiplier = Math.log(Math.max(input.volume, CONSTANTS.MIN_VOLUME_MULTIPLIER));
  const inherentRisk = input.baseImpact * volumeMultiplier;
  const residualRisk = inherentRisk * (1 - input.controlEffectiveness);

  let riskLevel: RiskLevel = 'LOW';
  if (residualRisk > 12) riskLevel = 'CRITICAL';
  else if (residualRisk > 8) riskLevel = 'HIGH';
  else if (residualRisk > 4) riskLevel = 'MEDIUM';

  return {
    inherentRisk: Number(inherentRisk.toFixed(2)),
    residualRisk: Number(residualRisk.toFixed(2)),
    riskLevel
  };
};
