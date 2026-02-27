export type BankGoalCategory = 'GROWTH' | 'EFFICIENCY' | 'COMPLIANCE' | 'INNOVATION';
export type AuditObjectiveCategory = 'ASSURANCE' | 'ADVISORY' | 'RISK_MANAGEMENT' | 'GOVERNANCE';

export interface BankGoal {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  period_year: number;
  weight: number;
  category: BankGoalCategory;
  owner_executive: string;
  created_at: string;
  updated_at: string;
}

export interface AuditObjective {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  period_year: number;
  category: AuditObjectiveCategory;
  created_at: string;
  updated_at: string;
}

export interface StrategyAlignment {
  id: string;
  tenant_id: string;
  bank_goal_id: string;
  audit_objective_id: string;
  relevance_score: number;
  rationale: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBankGoalInput {
  tenant_id: string;
  title: string;
  description: string;
  period_year: number;
  weight: number;
  category: BankGoalCategory;
  owner_executive: string;
}

export interface CreateAuditObjectiveInput {
  tenant_id: string;
  title: string;
  description: string;
  period_year: number;
  category: AuditObjectiveCategory;
}

export interface CreateAlignmentInput {
  tenant_id: string;
  bank_goal_id: string;
  audit_objective_id: string;
  relevance_score: number;
  rationale: string;
}

export interface StrategicGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  riskAppetite: 'Low' | 'Medium' | 'High';
  linkedAuditObjectives: string[];
}

export interface AuditObjectiveSimple {
  id: string;
  title: string;
  type: 'Assurance' | 'Advisory';
  status: 'On Track' | 'At Risk' | 'Completed';
}

export interface StrategyAlignmentSimple {
  id: string;
  goalId: string;
  objectiveId: string;
  relevance: number;
}
