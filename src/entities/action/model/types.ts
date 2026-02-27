// =============================================================================
// Action Entity — Type Definitions (GIAS 2024 / BDDK Phase 1)
// =============================================================================

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

/**
 * GIAS 2024 State Machine.
 * 'closed' is auditor-only — the auditee hard-gate prevents direct transition.
 */
export type ActionStatus =
  | 'pending'
  | 'evidence_submitted'
  | 'review_rejected'
  | 'risk_accepted'
  | 'closed';

/**
 * Types of governance requests that can be submitted against an action.
 * 'board_exception' is the only path through the BDDK 365-day Red-Line.
 */
export type ActionRequestType =
  | 'extension'
  | 'risk_acceptance'
  | 'board_exception';

export type ActionRequestStatus = 'pending' | 'approved' | 'rejected';

export type CampaignStatus = 'active' | 'completed' | 'cancelled';

/**
 * Triple-Tier Aging Classification (GIAS 2024 Appendix C).
 * Derived from performance_delay_days vs original_due_date.
 */
export type AgingTier =
  | 'TIER_1_NORMAL'        // ≤ 30 days overdue
  | 'TIER_2_HIGH'          // 31–90 days overdue
  | 'TIER_3_CRITICAL'      // 91–364 days overdue
  | 'TIER_4_BDDK_RED_ZONE';// > 364 days overdue — triggers BDDK Red-Line

/**
 * Escalation level of an action.
 */
export type EscalationLevel = 0 | 1 | 2 | 3;
// 0 = Normal | 1 = Senior Auditor | 2 = CAE | 3 = Board

// ---------------------------------------------------------------------------
// Finding Snapshot (The Iron Vault)
// ---------------------------------------------------------------------------

/**
 * Immutable JSONB snapshot of the parent finding at the time of action creation.
 * Protected by the `tg_iron_vault` database trigger — any mutation raises EXCEPTION.
 */
export interface FindingSnapshot {
  finding_id:    string;
  title:         string;
  severity:      string;
  risk_rating:   string;
  gias_category?: string;
  description?:  string;
  created_at?:   string;
}

// ---------------------------------------------------------------------------
// Core Tables
// ---------------------------------------------------------------------------

export interface MasterActionCampaign {
  id:          string;
  title:       string;
  description?: string;
  root_cause?: string;
  status:      CampaignStatus;
  created_at:  string;
}

export interface Action {
  id:                 string;

  // Relationships
  finding_id:         string;
  assignee_unit_id?:  string;      // FK → audit_entities.id
  assignee_user_id?:  string;      // FK → auth.users.id (auditee contact)
  auditor_owner_id?:  string;      // FK → auth.users.id (responsible auditor)
  campaign_id?:       string;      // FK → master_action_campaigns.id

  // Dual Aging Engine
  /** Immutable — used as the BDDK performance benchmark */
  original_due_date:  string;      // date string: 'YYYY-MM-DD'
  /** Mutable — extended via approved action_requests */
  current_due_date:   string;      // date string: 'YYYY-MM-DD'
  closed_at?:         string;

  // GIAS 2024 State Machine
  status:             ActionStatus;

  // Iron Vault — frozen at INSERT, mutation raises DB exception
  finding_snapshot:   FindingSnapshot;

  // BDDK Compliance
  /** e.g. ['BDDK', 'BRSA', 'SPK'] */
  regulatory_tags:    string[];
  escalation_level:   EscalationLevel;

  created_at:         string;
  updated_at:         string;
}

export interface ActionEvidence {
  id:                   string;
  action_id:            string;

  storage_path:         string;
  /** SHA-256 hex digest — integrity seal */
  file_hash:            string;
  /** 0.00–100.00 confidence score from AI document reviewer */
  ai_confidence_score?: number;
  uploaded_by?:         string;
  /** Populated by auditor when rejecting submitted evidence */
  review_note?:         string;

  created_at:           string;
}

export interface ActionRequest {
  id:               string;
  action_id:        string;

  type:             ActionRequestType;
  requested_date?:  string;         // Proposed new due date (extension)
  expiration_date?: string;         // When this request itself expires
  justification:    string;

  status:           ActionRequestStatus;
  reviewer_id?:     string;

  created_at:       string;
}

// ---------------------------------------------------------------------------
// Computed / Derived Types (from view_action_aging_metrics)
// ---------------------------------------------------------------------------

/**
 * Result row from the `view_action_aging_metrics` database view.
 * Includes computed aging tiers and BDDK breach flag.
 */
export interface ActionAgingMetrics extends Action {
  /** Days since original_due_date (BDDK performance metric, can be negative = ahead of schedule) */
  performance_delay_days: number;

  /** Days since current_due_date (operational overdue, can be negative) */
  operational_delay_days: number;

  /** GIAS 2024 Appendix C triple-tier classification */
  aging_tier: AgingTier;

  /**
   * TRUE when aging_tier = TIER_4_BDDK_RED_ZONE AND 'BDDK' is in regulatory_tags.
   * A BDDK Breach means: a board exception is required to extend this action,
   * and the assignee entity's health_score is hard-capped at 60 (Glass Ceiling).
   */
  is_bddk_breach: boolean;

  /** Number of uploaded evidence files */
  evidence_count: number;

  /** Number of pending governance requests */
  pending_requests: number;
}

// ---------------------------------------------------------------------------
// Enriched / Composite Types
// ---------------------------------------------------------------------------

export interface ActionWithDetails extends Action {
  evidence?:  ActionEvidence[];
  requests?:  ActionRequest[];
  aging?:     Partial<ActionAgingMetrics>;
  campaign?:  MasterActionCampaign;
}

// ---------------------------------------------------------------------------
// Input / Mutation Types
// ---------------------------------------------------------------------------

export interface CreateActionInput {
  finding_id:          string;
  finding_snapshot:    FindingSnapshot;
  original_due_date:   string;
  current_due_date:    string;
  assignee_unit_id?:   string;
  assignee_user_id?:   string;
  auditor_owner_id?:   string;
  campaign_id?:        string;
  regulatory_tags?:    string[];
  escalation_level?:   EscalationLevel;
}

export interface UpdateActionInput {
  /** Status transitions validated by GIAS 15.2 RLS policies on the DB */
  status?:            ActionStatus;
  /** Extensions require an approved action_request — the DB trigger enforces this */
  current_due_date?:  string;
  assignee_user_id?:  string;
  assignee_unit_id?:  string;
  auditor_owner_id?:  string;
  escalation_level?:  EscalationLevel;
  campaign_id?:       string;
}

export interface CreateEvidenceInput {
  action_id:           string;
  storage_path:        string;
  file_hash:           string;
  ai_confidence_score?: number;
  uploaded_by?:        string;
}

export interface CreateRequestInput {
  action_id:        string;
  type:             ActionRequestType;
  justification:    string;
  requested_date?:  string;
  expiration_date?: string;
}

// ---------------------------------------------------------------------------
// BDDK Domain Flags (computed client-side)
// ---------------------------------------------------------------------------

/**
 * Runtime flags derived from an action's aging metrics.
 * Used by the UI to render the correct state indicators.
 */
export interface BDDKFlags {
  /** Action is in TIER_4 and tagged as BDDK — board exception required */
  isRedLine:               boolean;
  /** Auditee cannot submit an 'extension' request (DB trigger will block it) */
  extensionBlocked:        boolean;
  /** Entity health score is capped at 60 due to this action */
  glassСeilingActive:      boolean;
  /** Days since original_due_date (positive = overdue) */
  performanceDelayDays:    number;
  /** How many days over the 365-day threshold */
  daysOverRedLine:         number;
}

/**
 * Compute BDDK flags from a metrics row — pure client-side logic.
 */
export function computeBDDKFlags(metrics: Partial<ActionAgingMetrics>): BDDKFlags {
  const delay    = metrics.performance_delay_days ?? 0;
  const isBDDK   = (metrics.regulatory_tags ?? []).includes('BDDK');
  const isTier4  = delay > 364;
  const isRedLine = isTier4 && isBDDK;

  return {
    isRedLine,
    extensionBlocked:   isRedLine,
    glassСeilingActive: isRedLine,
    performanceDelayDays: delay,
    daysOverRedLine:    isRedLine ? delay - 365 : 0,
  };
}

/**
 * Derive a human-readable aging tier label.
 */
export function agingTierLabel(tier: AgingTier): string {
  const labels: Record<AgingTier, string> = {
    TIER_1_NORMAL:        'Normal',
    TIER_2_HIGH:          'High Risk',
    TIER_3_CRITICAL:      'Critical',
    TIER_4_BDDK_RED_ZONE: 'BDDK Red Zone',
  };
  return labels[tier] ?? tier;
}

/**
 * Derive a Tailwind colour class for an aging tier.
 */
export function agingTierColor(tier: AgingTier): string {
  const colors: Record<AgingTier, string> = {
    TIER_1_NORMAL:        'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    TIER_2_HIGH:          'text-amber-400   bg-amber-500/10   border-amber-500/30',
    TIER_3_CRITICAL:      'text-orange-400  bg-orange-500/10  border-orange-500/30',
    TIER_4_BDDK_RED_ZONE: 'text-red-400     bg-red-500/10     border-red-500/30',
  };
  return colors[tier] ?? 'text-slate-400 bg-slate-500/10 border-slate-500/30';
}

/**
 * Derive a status colour class.
 */
export function statusColor(status: ActionStatus): string {
  const colors: Record<ActionStatus, string> = {
    pending:             'text-slate-400   bg-slate-500/10   border-slate-500/30',
    evidence_submitted:  'text-sky-400     bg-sky-500/10     border-sky-500/30',
    review_rejected:     'text-rose-400    bg-rose-500/10    border-rose-500/30',
    risk_accepted:       'text-amber-400   bg-amber-500/10   border-amber-500/30',
    closed:              'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  };
  return colors[status] ?? 'text-slate-400 bg-slate-500/10 border-slate-500/30';
}
