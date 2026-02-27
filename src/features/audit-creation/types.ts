import type { AuditServiceTemplate, FitResult } from '@/features/talent-os/types';

export type EngagementStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED';
export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'CLIENT_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ValidationStatus = 'OPEN' | 'CLIENT_REVIEW' | 'VALIDATED';

export interface AgileEngagement {
  id: string;
  title: string;
  description: string;
  service_template_id: string | null;
  status: EngagementStatus;
  total_sprints: number;
  start_date: string | null;
  end_date: string | null;
  team_members: TeamMember[];
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface AuditSprint {
  id: string;
  engagement_id: string;
  sprint_number: number;
  title: string;
  goal: string;
  start_date: string | null;
  end_date: string | null;
  status: SprintStatus;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface AuditTask {
  id: string;
  sprint_id: string;
  engagement_id: string;
  title: string;
  description: string;
  assigned_to: string | null;
  assigned_name: string;
  status: TaskStatus;
  priority: TaskPriority;
  validation_status: ValidationStatus;
  evidence_links: string[];
  story_points: number;
  xp_awarded: boolean;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  auditor_id: string;
  name: string;
  role: string;
  fitScore?: number;
}

export interface WizardState {
  step: 1 | 2 | 3;
  selectedTemplate: AuditServiceTemplate | null;
  engagementTitle: string;
  engagementDescription: string;
  startDate: string;
  sprintDurationWeeks: number;
  generatedSprints: GeneratedSprint[];
  selectedTeam: TeamMember[];
  fitResults: FitResult[];
}

export interface GeneratedSprint {
  sprint_number: number;
  title: string;
  goal: string;
  start_date: string;
  end_date: string;
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'Yapilacak',
  IN_PROGRESS: 'Devam Ediyor',
  CLIENT_REVIEW: 'Musteri Dogrulama',
  DONE: 'Tamamlandi',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Dusuk',
  MEDIUM: 'Orta',
  HIGH: 'Yuksek',
  CRITICAL: 'Kritik',
};

export const SPRINT_STATUS_LABELS: Record<SprintStatus, string> = {
  PLANNED: 'Planli',
  ACTIVE: 'Aktif',
  COMPLETED: 'Tamamlandi',
};
