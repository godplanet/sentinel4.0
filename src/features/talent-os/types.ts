export type AuditorTitle = 'Junior' | 'Senior' | 'Manager' | 'Expert';
export type BurnoutZone = 'GREEN' | 'AMBER' | 'RED';
export type ServiceComplexity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TalentProfile {
  id: string;
  user_id: string | null;
  full_name: string;
  avatar_url: string | null;
  title: AuditorTitle;
  department: string;
  total_xp: number;
  current_level: number;
  fatigue_score: number;
  burnout_zone: BurnoutZone;
  last_audit_date: string | null;
  consecutive_high_stress_projects: number;
  active_hours_last_3_weeks: number;
  travel_load: number;
  is_available: boolean;
  hourly_rate: number;
  currency: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface TalentSkill {
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

export interface AuditServiceTemplate {
  id: string;
  service_name: string;
  description: string;
  required_skills: Record<string, number>;
  standard_duration_sprints: number;
  complexity: ServiceComplexity;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface TalentProfileWithSkills extends TalentProfile {
  skills: TalentSkill[];
}

export interface AuditRequirement {
  skills: Record<string, number>;
}

export interface FitResult {
  auditor: TalentProfileWithSkills;
  fitScore: number;
  matchedSkills: Record<string, { required: number; actual: number }>;
  blocked: boolean;
  blockReason?: string;
}

export const SKILL_LABELS: Record<string, string> = {
  Cyber: 'Siber Guvenlik',
  Shariah: 'Islami Finans',
  DataAnalytics: 'Veri Analizi',
  Finance: 'Finans',
  Compliance: 'Uyum',
  RiskMgmt: 'Risk Yonetimi',
};

export const LEVEL_LABELS: Record<number, string> = {
  1: 'Farkindal.',
  2: 'Temel',
  3: 'Uygulayici',
  4: 'Uzman',
  5: 'Usta',
};

export const TITLE_LABELS: Record<AuditorTitle, string> = {
  Junior: 'Junior Denetci',
  Senior: 'Kidemli Denetci',
  Manager: 'Denetim Muduru',
  Expert: 'Uzman Denetci',
};
