export interface Dimension {
  id: string;
  label: string;
  weight: number;
}

export interface ImpactLevel {
  level: number;
  label: string;
  [key: string]: string | number;
}

export interface VetoRule {
  id: string;
  name: string;
  condition: string;
  override_score: number;
  enabled: boolean;
}

export interface RiskRange {
  label: string;
  min: number;
  max: number;
  color: string;
}

export interface RiskConstitutionData {
  id: string;
  tenant_id: string;
  is_active: boolean;
  version: string;
  dimensions: Dimension[];
  impact_matrix: ImpactLevel[];
  veto_rules: VetoRule[];
  risk_ranges: RiskRange[];
  created_at: string;
  updated_at: string;
}

export interface ScoreInput {
  dimensionScores: Record<string, number>;
  likelihood: number;
  controlEffectiveness: number;
  context?: Record<string, unknown>;
}

export interface ScoreResult {
  score: number;
  zone: RiskRange | null;
  vetoTriggered: boolean;
  vetoReason: string | null;
  breakdown: {
    weightedImpact: number;
    likelihoodFactor: number;
    controlFactor: number;
  };
}
