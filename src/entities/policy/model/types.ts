export interface Policy {
  id: string;
  title: string;
  content_url: string | null;
  version: string | null;
  is_active: boolean;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface PolicyAttestation {
  id: string;
  policy_id: string;
  user_id: string;
  attested_at: string;
  tenant_id: string;
}

export interface CreatePolicyInput {
  title: string;
  content_url?: string;
  version?: string;
  is_active?: boolean;
}

export interface PolicyWithAttestation extends Policy {
  attestation?: PolicyAttestation;
  is_attested: boolean;
}
