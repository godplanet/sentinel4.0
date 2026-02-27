// ============================================================
// Talent OS — JSONB Structure Interfaces
// ============================================================

export interface SkillSnapshotEntry {
  skill_name: string;
  proficiency_level: number;
  earned_xp: number;
  last_updated: string;
}

export interface SkillSnapshot {
  generated_at: string;
  skills: SkillSnapshotEntry[];
  radar_labels: string[];
  radar_values: number[];
}

// ============================================================
// Database Row Types
// ============================================================

export type BurnoutZone = 'GREEN' | 'AMBER' | 'RED';
export type AuditorTitle = 'Junior' | 'Senior' | 'Manager' | 'Expert';
export type CertificationStatus = 'VERIFIED' | 'PENDING' | 'EXPIRED' | 'REVOKED';
export type ReadinessLevel = 'READY_NOW' | 'READY_1_YEAR' | 'READY_2_YEARS' | 'DEVELOPING';
export type KudosCategory = 'EXCELLENCE' | 'TEAMWORK' | 'INNOVATION' | 'MENTORING' | 'INTEGRITY';

export interface TalentProfileRow {
  id: string;
  user_id: string | null;
  full_name: string;
  avatar_url: string | null;
  title: AuditorTitle;
  department: string;
  total_xp: number;
  current_level: number;
  next_level_xp: number;
  fatigue_score: number;
  burnout_zone: BurnoutZone;
  last_audit_date: string | null;
  consecutive_high_stress_projects: number;
  active_hours_last_3_weeks: number;
  travel_load: number;
  is_available: boolean;
  skills_snapshot: SkillSnapshot;
  hourly_rate: number;
  currency: string;
  playbook_contributions: number;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface TalentSkillRow {
  id: string;
  auditor_id: string;
  skill_name: string;
  proficiency_level: number;
  earned_xp: number;
  last_used_date: string | null;
  decay_factor: number;
  effective_proficiency: number | null;
  decay_applied_at: string | null;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface UserCertificationRow {
  id: string;
  user_id: string;
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date: string | null;
  status: CertificationStatus;
  credential_url: string | null;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface SuccessionPlanRow {
  id: string;
  key_position_user_id: string;
  successor_user_id: string;
  readiness_level: ReadinessLevel;
  notes: string | null;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface KudosTransactionRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  amount: number;
  message: string;
  category: KudosCategory;
  tenant_id: string;
  created_at: string;
}

// ============================================================
// QAIP Extension Row Types
// ============================================================

export type QaipReviewType = 'HOT_REVIEW' | 'COLD_REVIEW' | 'EXTERNAL_REVIEW';
export type QaipReviewStatus = 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';

export interface QaipReviewExtendedRow {
  id: string;
  engagement_id: string | null;
  reviewer_id: string | null;
  checklist_id: string | null;
  results: Record<string, 'PASS' | 'FAIL' | 'PARTIAL' | 'N/A'>;
  total_score: number;
  review_type: QaipReviewType;
  status: QaipReviewStatus;
  notes: string | null;
  tenant_id: string;
  completed_at: string | null;
  created_at: string;
}

// ============================================================
// Composite / Joined Types
// ============================================================

export interface TalentProfileWithSkills extends TalentProfileRow {
  skills: TalentSkillRow[];
  certifications: UserCertificationRow[];
}

export interface SuccessionPlanWithProfiles extends SuccessionPlanRow {
  key_position_profile: Pick<TalentProfileRow, 'id' | 'full_name' | 'title' | 'avatar_url'> | null;
  successor_profile: Pick<TalentProfileRow, 'id' | 'full_name' | 'title' | 'avatar_url'> | null;
}

export interface KudosLeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  total_kudos_received: number;
  total_kudos_sent: number;
  top_category: KudosCategory;
}

// ============================================================
// XP & Level Constants
// ============================================================

export const XP_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 500,
  3: 1500,
  4: 3500,
  5: 7000,
} as const;

export const LEVEL_LABELS: Record<number, string> = {
  1: 'Associate',
  2: 'Analyst',
  3: 'Senior Analyst',
  4: 'Lead Auditor',
  5: 'Principal',
} as const;

export const CERTIFICATION_ICONS: Record<string, string> = {
  CISA: '🛡️',
  CIA: '📋',
  CPA: '💼',
  CISM: '🔐',
  CRISC: '⚠️',
  CFE: '🔍',
} as const;

// ============================================================
// Mutation Input Types
// ============================================================

export interface CreateUserCertificationInput {
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string | null;
  credential_url?: string | null;
}

export interface CreateSuccessionPlanInput {
  key_position_user_id: string;
  successor_user_id: string;
  readiness_level: ReadinessLevel;
  notes?: string | null;
}

export interface SendKudosInput {
  receiver_id: string;
  amount: number;
  message: string;
  category: KudosCategory;
}

export interface UpdateSkillSnapshotInput {
  profile_id: string;
  skills: SkillSnapshotEntry[];
}
