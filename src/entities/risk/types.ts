// SENTINEL v3.0 DOMAIN TYPES
// Based on GIAS 2024 & BDDK Regulations

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'OBSERVATION';
export type RiskSeverity = RiskLevel;
export type AuditGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface Finding {
  id: string;
  title: string;
  severity: RiskSeverity;
  rootCauseCategory: 'PEOPLE' | 'PROCESS' | 'TECHNOLOGY' | 'EXTERNAL';
  isRepeat: boolean;
}

export interface RiskNode {
  id: string;
  path: string;
  name: string;
  type: 'PROCESS' | 'RISK' | 'CONTROL';

  baseImpact: number;
  volume: number;
  controlEffectiveness: number;

  inherentRiskScore?: number;
  residualRiskScore?: number;

  children?: RiskNode[];
}

export interface ScorecardResult {
  baseScore: number;
  deductions: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    repeatPenalty: number;
  };
  rawScore: number;
  finalScore: number;
  grade: AuditGrade;
  isLimited: boolean;
  limitReason?: string;
}

export type RiskCategory =
  | 'STRATEGIC'
  | 'OPERATIONAL'
  | 'FINANCIAL'
  | 'COMPLIANCE'
  | 'REPUTATIONAL'
  | 'TECHNOLOGY'
  | 'CREDIT'
  | 'MARKET'
  | 'LIQUIDITY'
  | 'OTHER';

export interface RiskLibraryItem {
  id: string;
  tenant_id: string;
  risk_code: string;
  title: string;
  description?: string;
  category: RiskCategory;

  impact_score: number;
  likelihood_score: number;
  inherent_score: number;

  control_effectiveness: number;
  residual_score: number;

  owner_id?: string;
  tags?: string[];
  metadata?: Record<string, any>;

  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreateRiskInput {
  risk_code: string;
  title: string;
  description?: string;
  category: RiskCategory;
  impact_score: number;
  likelihood_score: number;
  control_effectiveness: number;
  tags?: string[];
}

export interface UpdateRiskInput extends Partial<CreateRiskInput> {
  id: string;
}
