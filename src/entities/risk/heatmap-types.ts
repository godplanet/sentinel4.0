export interface RiskDefinition {
  id: string;
  tenant_id: string;
  title: string;
  category: string;
  description?: string;
  base_impact: number;
  base_likelihood: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RiskAssessment {
  id: string;
  tenant_id: string;
  entity_id: string;
  risk_id: string;
  impact: number;
  likelihood: number;
  inherent_risk_score: number;
  control_effectiveness: number;
  residual_score: number;
  justification?: string;
  assessed_by?: string;
  assessed_at: string;
  version_hash?: string;
  created_at: string;
}

export interface AssessmentWithDetails extends RiskAssessment {
  risk_title: string;
  risk_category: string;
  entity_name: string;
  entity_type: string;
}

export interface HeatmapCell {
  impact: number;
  likelihood: number;
  count: number;
  assessments: AssessmentWithDetails[];
}

export interface CreateAssessmentInput {
  entity_id: string;
  risk_id: string;
  impact: number;
  likelihood: number;
  control_effectiveness: number;
  justification?: string;
}
