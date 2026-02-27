export type IncidentCategory = 'Dolandırıcılık' | 'Etik' | 'IT' | 'İK';

export type IncidentStatus = 'NEW' | 'INVESTIGATING' | 'CLOSED' | 'RESOLVED';

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  reporter_id?: string;
  is_anonymous: boolean;
  status: IncidentStatus;
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
