// ============================================================================
// MODÜL 5: SENTINEL V3.0 - MASTER FINDING & ACTION TRACKING SCHEMA
// ============================================================================

// --- ENUMS & UNION TYPES ---

export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'OBSERVATION';
export type FindingMainStatus = 'ACIK' | 'KAPALI';
export type FindingProcessStage = 'DRAFT' | 'NEGOTIATION' | 'FOLLOWUP';
export type AuditType = 'SUBE' | 'SUREC_BS' | 'GENEL';

// GIAS 2024 Uyumlu Durumlar
export type FindingState = 
  | 'DRAFT' 
  | 'IN_REVIEW' 
  | 'NEEDS_REVISION' 
  | 'PUBLISHED' 
  | 'NEGOTIATION' 
  | 'PENDING_APPROVAL' 
  | 'FOLLOW_UP' 
  | 'CLOSED' 
  | 'FINAL' 
  | 'REMEDIATED' 
  | 'DISPUTED' 
  | 'DISPUTING';

export type RiskRating = 'HIGH' | 'MEDIUM' | 'LOW';

export type GIASCategory = 
  | 'Operasyonel Risk' 
  | 'Uyum Riski' 
  | 'Finansal Risk' 
  | 'Teknolojik Risk' 
  | 'Yönetişim' 
  | 'İç Kontrol' 
  | 'Risk Yönetimi' 
  | 'BT Güvenliği';

// ------------------------------------------------------------------
// 1. ANA BULGU TABLOSU (audit_findings)
// ------------------------------------------------------------------
export interface Finding {
  id: string;
  tenant_id: string;
  engagement_id: string;
  audit_id?: string;
  workpaper_id?: string;

  // Kimlik
  code: string; // Legacy
  finding_code: string; 
  regulatory_code?: string; 
  title: string;
  severity: FindingSeverity;

  // Durum
  state: FindingState;
  status?: string; // Generic Status string
  main_status?: FindingMainStatus;
  process_stage?: FindingProcessStage;
  audit_type?: AuditType;

  // WIF & Risk Engine
  impact_score?: number;      
  likelihood_score?: number; 
  impact_financial?: number; 
  impact_legal?: number;      
  impact_reputation?: number; 
  impact_operational?: number; 
  control_weakness?: number;    
   
  selected_risk_categories?: string[]; 
   
  // İslami Bankacılık & Özel Riskler
  is_shariah_risk?: boolean;
  shariah_impact?: number;
  requires_income_purification?: boolean;
  is_it_risk?: boolean;
  cvss_score?: number;
  asset_criticality?: 'Minor' | 'Major' | 'Critical';
   
  gias_category?: GIASCategory;
  financial_impact?: number;

  // 5C Zengin Metin Alanları (HTML)
  detection_html?: string;        // Tespit
  criteria_text?: string;         // Kriter
  cause_text?: string;            // Kök Neden
  impact_html?: string;           // Etki
  recommendation_html?: string;   // Öneri
  description?: string;           // Legacy Description

  // RCA (Root Cause Analysis)
  root_cause_analysis?: any;      
  criteria_json?: any[];
  rca_category?: string;          

  // Müfettişin Son Sözü
  auditor_conclusion?: string;    

  // Denetlenen bilgileri
  auditee_id?: string;
  auditee_department?: string;

  // Public Layer (Denetlenen Görünümü)
  description_public?: string;
  risk_rating?: RiskRating;
  assigned_auditee_id?: string;
  published_at?: string;

  // GIAS 2024 Golden Thread
  traceability_token?: string;

  // Tarihler
  negotiation_started_at?: string;
  agreed_at?: string;
  agreement_date?: string;
  finalized_at?: string;
  finding_year?: number;
  closed_at?: string;
  created_at: string;
  updated_at: string;
}

// ------------------------------------------------------------------
// 1.1 HASSAS VERİLER / GİZLİ KATMAN (Finding Secrets)
// ------------------------------------------------------------------
export interface FindingSecret {
  finding_id: string;
  auditor_notes_raw?: Record<string, any>;
  root_cause_analysis_internal?: string;
  detection_methodology?: string;
  
  // RCA Detayları
  rca_details?: {
    method: 'five_whys' | 'fishbone' | 'bowtie';
    five_whys?: string[];
    fishbone?: Record<string, string>;
    bowtie?: Record<string, string>;
  };

  // 5 Why Alanları
  why_1?: string;
  why_2?: string;
  why_3?: string;
  why_4?: string;
  why_5?: string;

  root_cause_summary?: string;
  internal_notes?: string;
  technical_details?: Record<string, any>;
  auditor_only_comments?: string;
  updated_at?: string;
}

// ------------------------------------------------------------------
// 2. GÖZDEN GEÇİRME NOTLARI (review_notes) - GIAS 2024 Uyumlu
// ------------------------------------------------------------------
export type ReviewNoteStatus = 'OPEN' | 'CLEARED' | 'CLOSED';

export interface ReviewNote {
  id: string;
  finding_id: string;
  field_reference?: string; // Hangi alan için yazıldı? (Örn: 'impact_html')
  note_text: string;        // Yöneticinin düzeltme talebi
   
  reviewer_id: string;      // Notu yazan yönetici
  reviewer_name: string;
   
  status: ReviewNoteStatus;
   
  resolution_text?: string; // Hazırlayan müfettişin "Düzelttim" açıklaması
  resolved_at?: string;     // Çözüldüğü tarih
   
  created_at: string;
  updated_at: string;
}

// ------------------------------------------------------------------
// 3. ONAY ZİNCİRİ (finding_signoffs)
// ------------------------------------------------------------------
export type SignOffRole = 'PREPARER' | 'REVIEWER' | 'APPROVER';
export type SignOffStatus = 'PENDING' | 'SIGNED' | 'REJECTED';

export interface FindingSignoff {
  id: string;
  finding_id: string;
  role: SignOffRole;
  user_id: string;
  user_name: string;
  user_title?: string;
  status: SignOffStatus;
  comments?: string;      // Onaylarken/Reddederken düşülen kısa not
  signed_at?: string;
  signature_hash?: string; // Elektronik imza kanıtı
}

// ------------------------------------------------------------------
// 4. AKSİYON PLANLARI VE ERTELEMELER
// ------------------------------------------------------------------
export type ActionPlanStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
export type ActionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type NegotiationState = 'PROPOSED' | 'REJECTED' | 'ACCEPTED';

export interface ActionPlan {
  id: string;
  tenant_id?: string;
  finding_id: string;
  title: string;
  description: string;
  
  // Sorumluluk
  responsible_person: string;
  responsible_person_title?: string;
  responsible_department?: string;
  
  // Zamanlama
  target_date: string;
  original_due_date?: string;
  completion_date?: string;
  
  // Durum
  status: ActionPlanStatus;
  priority?: ActionPriority;
  progress_percentage?: number; 
  extension_count?: number;
  
  // Detaylar
  milestones?: any[];
  plan_details?: Record<string, any>;
  current_state?: NegotiationState;
  
  // Müzakere
  auditor_rejection_reason?: string;
  auditee_response?: string;
  auditee_agreed?: boolean;
  auditee_agreed_at?: string;
  
  evidence_links?: any[];
  
  created_at: string;
  updated_at?: string;
  created_by?: string;
}

export interface ActionPlanExtension {
  id: string;
  action_plan_id: string;
  requested_date: string; 
  reason: string;          
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  auditor_response?: string; 
  created_at: string;
}

// ------------------------------------------------------------------
// 5. YAZIŞMA VE TARİHÇE LOGLARI
// ------------------------------------------------------------------
export type ChangeType = 
  | 'STATE_CHANGE' 
  | 'CONTENT_EDIT' 
  | 'SEVERITY_CHANGE' 
  | 'ASSIGNMENT' 
  | 'ACTION_PLAN_ADDED' 
  | 'COMMENT_ADDED' 
  | 'AI_GENERATION';

export interface FindingHistory {
  id: string;
  tenant_id: string;
  finding_id: string;
  previous_state?: string;
  new_state: string;
  change_type: ChangeType;
  changed_fields?: Record<string, any>;
  change_description?: string;
  changed_by?: string;
  changed_by_role?: string;
  changed_at: string;
}

export type CommentType = 'DISCUSSION' | 'AGREEMENT' | 'DISPUTE' | 'CLARIFICATION' | 'SYSTEM_LOG';
export type AuthorRole = 'AUDITOR' | 'AUDITEE' | 'AUDIT_MANAGER' | 'SYSTEM';

export interface FindingComment {
  id: string;
  tenant_id: string;
  finding_id: string;
  comment_text: string;
  comment_type: CommentType;
  author_id: string;
  author_role: AuthorRole;
  author_name?: string;
  parent_comment_id?: string;
  attachments?: any[];
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

// ============================================================================
// COMPREHENSIVE TYPE (Arayüzde Kullanmak İçin Tüm Verilerin Birleşimi)
// ============================================================================
export interface ComprehensiveFinding extends Finding {
  secrets?: FindingSecret;
  review_notes?: ReviewNote[];          // YENİ: Gözden Geçirme Notları
  sign_offs?: FindingSignoff[];         // YENİ: Onay Zinciri
  action_plans?: (ActionPlan & { extensions?: ActionPlanExtension[] })[];
  history?: FindingHistory[];
  comments?: FindingComment[];
}

// ============================================================================
// DRAFT FINDING — GOLDEN THREAD TRACEABILITY (GIAS 2024)
// ============================================================================

export type DraftFindingStatus = 'DRAFT' | 'PROMOTED';

export interface DraftFinding {
  id: string;
  workpaperId: string;
  testStepId: string;
  testStepTitle: string;
  initialObservation: string;
  traceabilityToken: string;
  status: DraftFindingStatus;
  promotedFindingId?: string;
  createdAt: string;
}

// ============================================================================
// LEGACY (GERİYE DÖNÜK UYUMLULUK İÇİN KORUNAN TİPLER)
// ============================================================================
export type PortalStatus = 'PENDING' | 'AGREED' | 'DISAGREED';
export type WorkflowStage = 'SELF' | 'DELEGATED' | 'MANAGER_REVIEW' | 'SUBMITTED';
export type Priority = 'ACIL' | 'ONCELIKLI' | 'STANDART';

export interface Assignment {
  id: string;
  finding_id: string;
  assignee_id?: string;
  portal_status: PortalStatus;
  workflow_stage: WorkflowStage;
  is_locked: boolean;
  auditee_opinion?: string;
  rejection_reason?: string;
  priority: Priority;
  created_at: string;
  updated_at: string;
}

export type ActionStepStatus = 'OPEN' | 'PENDING_VERIFICATION' | 'CLOSED';

export interface ActionStep {
  id: string;
  assignment_id: string;
  description: string;
  due_date: string;
  completion_date?: string;
  status: ActionStepStatus;
  created_at: string;
}

export interface FindingWithAssignment extends Finding {
  assignment?: Assignment;
  action_steps?: ActionStep[];
}

// --- MEVCUT DOSYAYA EKLENECEK / GÜNCELLENECEK KISIMLAR ---

// 1. Severity Genişletmesi (GIAS 2024 'Observation' eklendi)
export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'OBSERVATION';

// 2. BDDK Özel Tanımları
export type BDDKDeficiencyType = 
  | 'OK'  // Önemli Kontrol Eksikliği (Kritik)
  | 'KD'  // Kayda Değer Kontrol Eksikliği (Yüksek)
  | 'KZ'  // Kontrol Zayıflığı (Orta)
  | null; // Standart modda null olabilir

// 3. Finding Interface Güncellemesi
export interface Finding {
  // ... mevcut alanlar ...
  
  // Denetim Çerçevesi Ayarı
  audit_framework: 'STANDARD' | 'BDDK'; 
  
  // BDDK Özel Alanı
  bddk_deficiency_type?: BDDKDeficiencyType;
  
  // ... diğer alanlar ...
}