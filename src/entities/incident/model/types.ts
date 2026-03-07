export type IncidentCategory = 'Dolandırıcılık' | 'Etik' | 'IT' | 'İK';

export type IncidentStatus = 'NEW' | 'INVESTIGATING' | 'CLOSED' | 'RESOLVED';

export type WhistleblowerTriageCategory = 'CRITICAL_FRAUD' | 'ETHICS_VIOLATION' | 'HR_CULTURE' | 'IT_SECURITY' | 'SPAM';

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  reporter_id?: string | null;
  is_anonymous: boolean;
  status: IncidentStatus;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateIncidentInput {
  title: string;
  description: string;
  category: IncidentCategory;
  is_anonymous: boolean;
  reporter_id?: string;
}

// Whistleblower Portal — whistleblower_tips tablosuyla eşleşir
export interface WhistleblowerTip {
  id: string;
  tracking_code: string;
  content: string;
  channel: 'WEB' | 'TOR_ONION' | 'SIGNAL_MOCK';
  submitted_at: string;
  ai_credibility_score: number;
  triage_category: WhistleblowerTriageCategory;
  status: 'NEW' | 'INVESTIGATING' | 'ESCALATED' | 'DISMISSED' | 'CLOSED';
  assigned_unit?: string | null;
  reviewer_notes?: string | null;
  created_at: string;
}

export interface SubmitTipInput {
  content: string;
  channel?: 'WEB' | 'TOR_ONION' | 'SIGNAL_MOCK';
  triage_category?: WhistleblowerTriageCategory;
}

export interface IncidentStats {
  total: number;
  open: number;
  closed: number;
  anonymous: number;
}
