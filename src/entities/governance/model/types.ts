export interface GovernanceDoc {
  id: string;
  doc_type: 'CHARTER' | 'DECLARATION' | 'MINUTES' | 'POLICY' | 'PROCEDURE';
  title: string;
  version: string | null;
  content_url: string | null;
  approval_status: 'DRAFT' | 'APPROVED' | 'ARCHIVED';
  approved_by: string | null;
  approved_at: string | null;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface AuditorDeclaration {
  id: string;
  user_id: string | null;
  declaration_type: 'INDEPENDENCE' | 'CONFLICT_OF_INTEREST' | 'CODE_OF_CONDUCT';
  period_year: number;
  content: Record<string, any> | null;
  signed_at: string;
  signature_hash: string | null;
  tenant_id: string;
  created_at: string;
}

export interface CreateGovernanceDocInput {
  doc_type: 'CHARTER' | 'DECLARATION' | 'MINUTES' | 'POLICY' | 'PROCEDURE';
  title: string;
  version?: string;
  content_url?: string;
  approval_status?: 'DRAFT' | 'APPROVED' | 'ARCHIVED';
}

export interface CreateDeclarationInput {
  user_id: string;
  declaration_type: 'INDEPENDENCE' | 'CONFLICT_OF_INTEREST' | 'CODE_OF_CONDUCT';
  period_year: number;
  content?: Record<string, any>;
}

export interface GovernanceStats {
  total_docs: number;
  approved_docs: number;
  declarations_this_year: number;
  compliance_rate: number;
}

export interface BoardMember {
  id: string;
  tenant_id: string;
  full_name: string;
  title: string;
  role: string;
  email: string | null;
  phone: string | null;
  appointment_date: string | null;
  term_end_date: string | null;
  is_independent: boolean;
  committees: string[];
  photo_url: string | null;
  bio: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface Stakeholder {
  id: string;
  tenant_id: string;
  name: string;
  type: string;
  organization: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  influence_level: string | null;
  engagement_frequency: string | null;
  last_engagement_date: string | null;
  next_engagement_date: string | null;
  relationship_owner_id: string | null;
  interests: string | null;
  concerns: string | null;
  expectations: string | null;
  communication_channels: string[];
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}
