// SENTINEL v3.0 DOMAIN TYPES
// Based on GIAS 2024 & BDDK Regulations

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'OBSERVATION';
export type AuditGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface Finding {
  id: string;
  title: string;
  severity: RiskLevel;
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
