export interface RiskWeights {
  financial: number;
  legal: number;
  reputation: number;
  operational: number;
}

export interface ScoringMatrix {
  impact_max: number;
  likelihood_max: number;
  control_effectiveness_max: number;
}

export interface SeverityThreshold {
  label: string;
  min: number;
  max: number;
  color: string;
}

export interface VetoRule {
  id: string;
  field: string;
  operator: '>=' | '>' | '<=' | '<' | '==' | '!=';
  value: number;
  override_severity: string;
  reason: string;
}

export interface SLAEntry {
  calendar_days: number;
  sprint_count: number;
}

export interface ShariahVector {
  status: 'BATIL' | 'FASID' | 'HALAL';
  purification_amt: number;
  fatwa_ref: string;
}

export interface CyberVector {
  cvss_vector: string;
  cvss_score: number;
  asset_criticality: 'CRITICAL' | 'MAJOR' | 'MINOR';
}

export interface FinancialVector {
  loss_amount: number;
  impact_percent_equity: number;
}

export interface FinancialMateriality {
  critical_equity_percent: number;
  high_equity_percent: number;
  medium_equity_percent: number;
}

export interface GradingDeductions {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface CappingRule {
  condition: string;
  field: string;
  operator: '>=' | '>' | '<=' | '<' | '==' | '!=';
  value: number;
  max_score: number;
  reason: string;
}

export interface GradeScaleEntry {
  grade: string;
  min: number;
  max: number;
  opinion: string;
  label: string;
}

export interface GradingRules {
  deductions: GradingDeductions;
  capping: CappingRule[];
  scale: GradeScaleEntry[];
}

export interface MethodologyConfig {
  id: string;
  tenant_id: string;
  version: string;
  is_active: boolean;
  risk_weights: RiskWeights;
  scoring_matrix: ScoringMatrix;
  severity_thresholds: SeverityThreshold[];
  veto_rules: VetoRule[];
  sla_config: Record<string, SLAEntry>;
  veto_logic: unknown | null;
  financial_materiality: FinancialMateriality | null;
  grading_rules: GradingRules | null;
  created_at: string;
  updated_at: string;
}

export type TalentBand = 'WEAK' | 'AVERAGE' | 'STRONG' | 'NO_DATA';

export interface TalentAdjustment {
  multiplier: number;
  teamSkillAvg: number | null;
  band: TalentBand;
  label: string;
  tooltip: string;
  adjustedScore: number;
  domainKeyword: string;
}

export interface FindingRiskInput {
  impact_financial: number;
  impact_legal: number;
  impact_reputation: number;
  impact_operational: number;
  likelihood_score: number;
  control_effectiveness: number;
  shariah_impact_score: number;
  cvss_score: number | null;
  asset_criticality: 'Critical' | 'Major' | 'Minor';
  shariah_vector?: ShariahVector;
  cyber_vector?: CyberVector;
  financial_vector?: FinancialVector;
  talent_capability_multiplier?: number;
}

export interface RiskCalculationResult {
  score: number;
  severity: string;
  color: string;
  vetoTriggered: boolean;
  vetoReason: string | null;
  vetoSource: 'jsonlogic' | 'legacy' | null;
  sla: SLAEntry | null;
  purificationAmount: number;
  talentAdjustment?: TalentAdjustment;
  breakdown: {
    weightedImpact: number;
    likelihoodFactor: number;
    controlReduction: number;
    rawScore: number;
    assetMultiplier: number;
    talentMultiplier?: number;
  };
}
