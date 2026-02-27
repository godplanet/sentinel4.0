export type TipChannel = 'WEB' | 'TOR_ONION' | 'SIGNAL_MOCK';
export type TriageCategory = 'CRITICAL_FRAUD' | 'HR_CULTURE' | 'SPAM';
export type TipStatus = 'NEW' | 'INVESTIGATING' | 'ESCALATED' | 'DISMISSED' | 'CLOSED';

export interface WhistleblowerTip {
  id: string;
  tracking_code: string;
  content: string;
  attachments_url: string | null;
  channel: TipChannel;
  submitted_at: string;
  ai_credibility_score: number;
  triage_category: TriageCategory;
  status: TipStatus;
  assigned_unit: string | null;
  reviewer_notes: string | null;
  created_at: string;
}

export interface TipAnalysis {
  id: string;
  tip_id: string;
  specificity_index: number;
  evidence_density: number;
  emotional_score: number;
  extracted_entities: ExtractedEntities;
  analyzed_at: string;
}

export interface ExtractedEntities {
  names: string[];
  dates: string[];
  amounts: string[];
  ibans: string[];
  invoice_numbers?: string[];
  departments?: string[];
  keywords_matched: string[];
  emotional_markers?: string[];
  notes?: string;
}

export interface TriageScore {
  total: number;
  specificity: number;
  evidence: number;
  emotion: number;
  category: TriageCategory;
  entities: ExtractedEntities;
}

export interface TipSubmission {
  content: string;
  channel: TipChannel;
  attachments_url?: string;
}

export const CHANNEL_LABELS: Record<TipChannel, string> = {
  WEB: 'Web Portal',
  TOR_ONION: 'Tor Onion',
  SIGNAL_MOCK: 'Signal (Guvenli)',
};

export const CATEGORY_LABELS: Record<TriageCategory, string> = {
  CRITICAL_FRAUD: 'Kritik Suistimal',
  HR_CULTURE: 'IK / Kultur',
  SPAM: 'Dusuk Oncelik / Spam',
};

export const STATUS_LABELS: Record<TipStatus, string> = {
  NEW: 'Yeni',
  INVESTIGATING: 'Inceleniyor',
  ESCALATED: 'Eskalasyon',
  DISMISSED: 'Reddedildi',
  CLOSED: 'Kapandi',
};

export type CaseStatus = 'OPEN' | 'FROZEN' | 'CLOSED';
export type CasePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type EvidenceType = 'EMAIL' | 'CHAT' | 'LOG' | 'INVOICE';
export type NodeType = 'PERSON' | 'VENDOR' | 'COMPANY' | 'ACCOUNT';
export type RelationType = 'SHARED_ADDRESS' | 'SAME_IP' | 'TRANSFER' | 'SHARED_PHONE' | 'OWNERSHIP' | 'APPROVAL';

export interface InvestigationCase {
  id: string;
  tip_id: string | null;
  title: string;
  lead_investigator: string;
  status: CaseStatus;
  priority: CasePriority;
  created_at: string;
  updated_at: string;
}

export interface DigitalEvidence {
  id: string;
  case_id: string;
  type: EvidenceType;
  source_system: string;
  content_snapshot: Record<string, unknown>;
  hash_sha256: string;
  timestamp_rfc3161: string;
  locked: boolean;
  frozen_by: string;
  created_at: string;
}

export interface EntityRelationship {
  id: string;
  case_id: string;
  source_node: string;
  source_type: NodeType;
  target_node: string;
  target_type: NodeType;
  relation_type: RelationType;
  evidence_ref: string | null;
  confidence: number;
  created_at: string;
}

export interface FreezeStep {
  id: string;
  label: string;
  system: string;
  status: 'pending' | 'running' | 'done' | 'error';
  detail?: string;
}

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  OPEN: 'Acik',
  FROZEN: 'Donduruldu',
  CLOSED: 'Kapandi',
};

export const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  EMAIL: 'E-Posta',
  CHAT: 'Mesajlasma',
  LOG: 'Sistem Logu',
  INVOICE: 'Fatura',
};

export const RELATION_LABELS: Record<RelationType, string> = {
  SHARED_ADDRESS: 'Ortak Adres',
  SAME_IP: 'Ayni IP',
  TRANSFER: 'Para Transferi',
  SHARED_PHONE: 'Ortak Telefon',
  OWNERSHIP: 'Sahiplik',
  APPROVAL: 'Onay Yetkisi',
};

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  PERSON: 'Kisi',
  VENDOR: 'Tedarikci',
  COMPANY: 'Sirket',
  ACCOUNT: 'Hesap/IP',
};

export type VaultAccessStatus = 'PENDING' | 'UNLOCKED' | 'DENIED' | 'EXPIRED';
export type VaultRole = 'CAE' | 'DEPUTY' | 'MANAGER';
export type InterrogationStatus = 'IN_PROGRESS' | 'COMPLETED' | 'SIGNED';
export type ContradictionSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface VaultApproval {
  role: VaultRole;
  name: string;
  approved_at: string;
}

export interface VaultAccessRequest {
  id: string;
  case_id: string;
  requested_by: string;
  approvals: VaultApproval[];
  required_approvals: number;
  status: VaultAccessStatus;
  created_at: string;
  updated_at: string;
  unlocked_at: string | null;
}

export interface TranscriptLine {
  speaker: 'INTERVIEWER' | 'SUSPECT';
  text: string;
  ts: string;
}

export interface ContradictionFlag {
  id: string;
  claim: string;
  evidence_type: EvidenceType;
  evidence_source: string;
  evidence_detail: string;
  severity: ContradictionSeverity;
  detected_at: string;
}

export interface InterrogationLog {
  id: string;
  case_id: string;
  session_number: number;
  suspect_name: string;
  interviewer_name: string;
  transcript: TranscriptLine[];
  ai_contradiction_flags: ContradictionFlag[];
  status: InterrogationStatus;
  started_at: string;
  completed_at: string | null;
}

export const VAULT_ROLE_LABELS: Record<VaultRole, string> = {
  CAE: 'Denetim Baskani (CAE)',
  DEPUTY: 'Denetim Baskan Yardimcisi',
  MANAGER: 'Inceleme Muduru',
};

export const VAULT_ROLE_NAMES: Record<VaultRole, string> = {
  CAE: 'Dr. Ayse Yilmaz',
  DEPUTY: 'Murat Demir',
  MANAGER: 'Elif K.',
};

export const CONTRADICTION_SEVERITY_LABELS: Record<ContradictionSeverity, string> = {
  CRITICAL: 'Kritik Celiskir',
  HIGH: 'Yuksek',
  MEDIUM: 'Orta',
  LOW: 'Dusuk',
};
