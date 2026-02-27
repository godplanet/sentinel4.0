export interface SoxCampaign {
  id: string;
  tenant_id: string;
  title: string;
  period: string;
  status: 'Draft' | 'Active' | 'Closed' | 'Archived';
  start_date: string | null;
  end_date: string | null;
  total_controls: number;
  completed_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SoxControl {
  id: string;
  tenant_id: string;
  campaign_id: string;
  code: string;
  description: string;
  category: 'Operational' | 'IT' | 'Financial' | 'Compliance';
  risk_weight: number;
  assigned_to: string | null;
  department: string | null;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually';
  is_key_control: boolean;
  created_at: string;
}

export interface SoxAttestation {
  id: string;
  tenant_id: string;
  campaign_id: string;
  control_id: string;
  attester_name: string;
  status: 'Effective' | 'Ineffective' | 'Not_Tested';
  manager_comment: string | null;
  ai_challenge: string | null;
  ai_challenge_resolved: boolean;
  snapshot_json: Record<string, unknown>;
  record_hash: string;
  signed_at: string;
  is_frozen: boolean;
}

export interface SoxIncident {
  id: string;
  tenant_id: string;
  department: string;
  control_code: string | null;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string | null;
  occurred_at: string;
}

export interface SoxOutboxEvent {
  id: string;
  tenant_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  status: 'Pending' | 'Processed' | 'Failed';
  created_at: string;
  processed_at: string | null;
}

export interface ControlWithAttestation extends SoxControl {
  attestation: SoxAttestation | null;
  incidents: SoxIncident[];
}

export interface CampaignStats {
  total: number;
  effective: number;
  ineffective: number;
  pending: number;
  completionPercent: number;
  riskWeightedScore: number;
  categoryBreakdown: Record<string, { total: number; completed: number; effective: number }>;
}

export interface SkepticChallenge {
  triggered: boolean;
  incidentCount: number;
  incidents: SoxIncident[];
  message: string;
  severity: 'warning' | 'critical';
}
