export interface RiskPosition {
  x: number;
  y: number;
  date: string;
}

export interface EntityWithVelocity {
  id: string;
  name: string;
  type: string;
  risk_score: number | null;
  risk_velocity_score: number | null;
  last_position: RiskPosition | null;
  current_position: RiskPosition | null;
}

export interface CometPoint {
  id: string;
  name: string;
  type: string;
  cx: number;
  cy: number;
  px: number;
  py: number;
  velocity: number;
  riskScore: number;
  direction: 'worsening' | 'improving' | 'stable';
}

export interface KRIConfig {
  id: string;
  tenant_id: string;
  source_system: string;
  kri_name: string;
  threshold_value: number;
  impact_axis: 'LIKELIHOOD' | 'IMPACT';
  impact_weight: number;
  is_active: boolean;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CreateKRIInput {
  source_system: string;
  kri_name: string;
  threshold_value: number;
  impact_axis: 'LIKELIHOOD' | 'IMPACT';
  impact_weight: number;
  description?: string;
}

export interface UpdateKRIInput extends Partial<CreateKRIInput> {
  is_active?: boolean;
}
