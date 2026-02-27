export interface EsgFramework {
  id: string;
  tenant_id: string;
  name: string;
  version: string | null;
  category: 'Environmental' | 'Social' | 'Governance' | 'Integrated';
  is_active: boolean;
  created_at: string;
}

export interface EsgMetricDefinition {
  id: string;
  tenant_id: string;
  framework_id: string;
  code: string;
  name: string;
  pillar: 'E' | 'S' | 'G';
  unit: string;
  data_type: 'Number' | 'Boolean' | 'Currency' | 'Percentage';
  target_value: number | null;
  target_direction: 'below' | 'above' | 'equal' | null;
  created_at: string;
}

export interface EsgDataPoint {
  id: string;
  tenant_id: string;
  metric_id: string;
  period: string;
  value: number;
  previous_value: number | null;
  evidence_url: string | null;
  evidence_description: string | null;
  submitted_by: string;
  department: string | null;
  ai_validation_status: 'Pending' | 'Validated' | 'Flagged' | 'Override';
  ai_notes: string | null;
  ai_confidence: number | null;
  snapshot_json: Record<string, unknown>;
  record_hash: string;
  is_frozen: boolean;
  signed_at: string | null;
  created_at: string;
}

export interface EsgSocialMetric {
  id: string;
  tenant_id: string;
  period: string;
  total_employees: number;
  women_total: number;
  women_management: number;
  women_board: number;
  gender_pay_gap_pct: number;
  training_hours_per_employee: number;
  employee_turnover_pct: number;
  workplace_injuries: number;
  community_investment_try: number;
  created_at: string;
}

export interface EsgGreenAsset {
  id: string;
  tenant_id: string;
  period: string;
  total_loan_portfolio_try: number;
  green_loans_try: number;
  green_bonds_try: number;
  taxonomy_aligned_pct: number;
  transition_finance_try: number;
  created_at: string;
}

export interface EnrichedDataPoint extends EsgDataPoint {
  metric: EsgMetricDefinition;
}

export interface GreenSkepticResult {
  triggered: boolean;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  flags: string[];
  confidence: number;
}

export interface EsgPillarSummary {
  pillar: 'E' | 'S' | 'G';
  totalMetrics: number;
  validated: number;
  flagged: number;
  pending: number;
  avgConfidence: number;
  onTarget: number;
}
