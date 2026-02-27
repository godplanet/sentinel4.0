export interface AdvisoryRequest {
  id: string;
  requester_id: string | null;
  department_id: string | null;
  title: string;
  problem_statement: string;
  desired_outcome: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  department_name?: string;
}

export interface AdvisoryEngagement {
  id: string;
  request_id: string | null;
  title: string;
  scope_limitations: string;
  management_responsibility_confirmed: boolean;
  start_date: string | null;
  target_date: string | null;
  status: 'PLANNING' | 'FIELDWORK' | 'DRAFTING' | 'COMPLETED';
  methodology: 'PROCESS_DESIGN' | 'WORKSHOP' | 'INVESTIGATION' | null;
  created_at: string;
}

export interface AdvisoryInsight {
  id: string;
  engagement_id: string | null;
  title: string;
  observation: string;
  recommendation: string;
  impact_level: 'STRATEGIC' | 'OPERATIONAL' | 'FINANCIAL';
  management_response: string | null;
  status: 'DRAFT' | 'SHARED' | 'ACCEPTED' | 'NOTED';
  created_at: string;
}

export interface IndependenceConflict {
  id: string;
  auditor_id: string | null;
  entity_id: string | null;
  engagement_id: string | null;
  engagement_end_date: string;
  cooling_off_expires_at: string;
  created_at: string;
}
