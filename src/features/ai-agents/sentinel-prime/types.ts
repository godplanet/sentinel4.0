/**
 * Type definitions for Sentinel Prime AI Context System
 */

export interface RiskConstitution {
  id: string;
  methodology_name: string;
  version: string;
  dimension_weights: Record<string, number>;
  grading_scale: GradingScale;
  veto_rules?: Record<string, any>;
  base_score: number;
  updated_at: string;
  is_active: boolean;
}

export interface GradingScale {
  A: { min: number; max: number; color: string };
  B: { min: number; max: number; color: string };
  C: { min: number; max: number; color: string };
  D: { min: number; max: number; color: string };
  F: { min: number; max: number; color: string };
}

export interface UniverseStats {
  totalEntities: number;
  highRiskCount: number;
  criticalRiskCount: number;
  highRiskPercentage: number;
  avgRiskScore: number;
  topRiskyEntities: Array<{
    name: string;
    path: string;
    risk_score: number;
  }>;
}

export interface RecentFindingsStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  openActions: number;
  avgRemediationDays: number;
  pendingResponses: number;
}

export interface CurrentUser {
  id: string;
  email: string;
  role: string;
  department?: string;
  name?: string;
}

export interface SystemContext {
  constitution?: RiskConstitution;
  universeStats?: UniverseStats;
  recentFindings?: RecentFindingsStats;
  currentUser?: CurrentUser;
  timestamp: string;
}

export interface SentinelMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  timestamp: Date;
  functionCall?: {
    name: string;
    arguments: Record<string, any>;
    result?: any;
  };
}

export interface SentinelAction {
  command: string;
  description: string;
  handler: (args: string[]) => Promise<string>;
  requiredRole?: string[];
}

export interface ThinkingStep {
  step: string;
  action: string;
  status: 'loading' | 'complete' | 'error';
  duration?: number;
}
