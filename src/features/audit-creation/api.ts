import { supabase } from '@/shared/api/supabase';
import type {
  AgileEngagement, AuditSprint, AuditTask,
  GeneratedSprint, TeamMember, TaskStatus, TaskPriority,
  EngagementStatus, ValidationStatus,
} from './types';

export async function fetchAgileEngagements(): Promise<AgileEngagement[]> {
  const { data, error } = await supabase
    .from('audit_engagements_v2')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchAgileEngagement(id: string): Promise<AgileEngagement | null> {
  const { data, error } = await supabase
    .from('audit_engagements_v2')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createAgileEngagement(input: {
  title: string;
  description: string;
  service_template_id: string | null;
  total_sprints: number;
  start_date: string;
  end_date: string;
  team_members: TeamMember[];
}): Promise<AgileEngagement> {
  const { data, error } = await supabase
    .from('audit_engagements_v2')
    .insert({
      title: input.title,
      description: input.description,
      service_template_id: input.service_template_id,
      status: 'PLANNED',
      total_sprints: input.total_sprints,
      start_date: input.start_date,
      end_date: input.end_date,
      team_members: input.team_members,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createSprints(
  engagementId: string,
  sprints: GeneratedSprint[]
): Promise<AuditSprint[]> {
  const rows = sprints.map((s) => ({
    engagement_id: engagementId,
    sprint_number: s.sprint_number,
    title: s.title,
    goal: s.goal,
    start_date: s.start_date,
    end_date: s.end_date,
    status: 'PLANNED' as const,
  }));

  const { data, error } = await supabase
    .from('audit_sprints')
    .insert(rows)
    .select();

  if (error) throw error;
  return data || [];
}

export async function fetchSprints(engagementId: string): Promise<AuditSprint[]> {
  const { data, error } = await supabase
    .from('audit_sprints')
    .select('*')
    .eq('engagement_id', engagementId)
    .order('sprint_number');

  if (error) throw error;
  return data || [];
}

export async function setFirstSprintActive(engagementId: string): Promise<void> {
  const { data: sprints } = await supabase
    .from('audit_sprints')
    .select('id')
    .eq('engagement_id', engagementId)
    .order('sprint_number', { ascending: true })
    .limit(1);

  if (sprints?.length) {
    await supabase
      .from('audit_sprints')
      .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
      .eq('id', sprints[0].id);
  }
}

export async function fetchTasks(engagementId: string): Promise<AuditTask[]> {
  const { data, error } = await supabase
    .from('audit_tasks')
    .select('*')
    .eq('engagement_id', engagementId)
    .order('created_at');

  if (error) throw error;
  return data || [];
}

export async function fetchTasksBySprint(sprintId: string): Promise<AuditTask[]> {
  const { data, error } = await supabase
    .from('audit_tasks')
    .select('*')
    .eq('sprint_id', sprintId)
    .order('created_at');

  if (error) throw error;
  return data || [];
}

export async function createTask(input: {
  sprint_id: string;
  engagement_id: string;
  title: string;
  description?: string;
  story_points?: number;
  priority?: TaskPriority;
  assigned_to?: string | null;
  assigned_name?: string;
}): Promise<AuditTask> {
  const { data, error } = await supabase
    .from('audit_tasks')
    .insert({
      sprint_id: input.sprint_id,
      engagement_id: input.engagement_id,
      title: input.title,
      description: input.description ?? '',
      story_points: input.story_points ?? 1,
      priority: input.priority ?? 'MEDIUM',
      assigned_to: input.assigned_to ?? null,
      assigned_name: input.assigned_name ?? '',
      status: 'TODO',
      validation_status: 'OPEN',
      evidence_links: [],
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<void> {
  const { error } = await supabase
    .from('audit_tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', taskId);

  if (error) throw error;
}

export type TaskUpdatePayload = Partial<{
  title: string;
  description: string;
  priority: TaskPriority;
  story_points: number;
  assigned_to: string | null;
  assigned_name: string;
  validation_status: ValidationStatus;
}>;

export async function updateTask(
  taskId: string,
  payload: TaskUpdatePayload
): Promise<AuditTask> {
  const updates: Record<string, unknown> = {
    ...payload,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('audit_tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('audit_tasks')
    .delete()
    .eq('id', taskId);

  if (error) throw error;
}

/** Engagement durumunu günceller. ACTIVE yapıldığında ilk PLANNED sprint ACTIVE yapılır (tek ACTIVE sprint kuralı). */
export async function updateEngagementStatus(
  engagementId: string,
  status: EngagementStatus
): Promise<void> {
  if (status === 'ACTIVE') {
    const { data: sprints, error: listErr } = await supabase
      .from('audit_sprints')
      .select('id, status')
      .eq('engagement_id', engagementId)
      .order('sprint_number', { ascending: true });

    if (listErr) throw listErr;

    const toActivate = sprints?.find((s) => s.status === 'PLANNED');
    const currentlyActive = sprints?.filter((s) => s.status === 'ACTIVE') ?? [];

    const { error: engErr } = await supabase
      .from('audit_engagements_v2')
      .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
      .eq('id', engagementId);
    if (engErr) throw engErr;

    for (const s of currentlyActive) {
      await supabase
        .from('audit_sprints')
        .update({ status: 'PLANNED', updated_at: new Date().toISOString() })
        .eq('id', s.id);
    }
    if (toActivate) {
      await supabase
        .from('audit_sprints')
        .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
        .eq('id', toActivate.id);
    }
    return;
  }

  const { error } = await supabase
    .from('audit_engagements_v2')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', engagementId);

  if (error) throw error;
}

export async function markTaskXPAwarded(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('audit_tasks')
    .update({ xp_awarded: true })
    .eq('id', taskId);

  if (error) throw error;
}

export async function awardXPToAuditor(
  auditorId: string,
  xpAmount: number
): Promise<void> {
  const { data: profile, error: fetchErr } = await supabase
    .from('talent_profiles')
    .select('total_xp, current_level')
    .eq('id', auditorId)
    .maybeSingle();

  if (fetchErr || !profile) return;

  const newXP = profile.total_xp + xpAmount;
  const newLevel = Math.min(5, Math.max(1, Math.floor(newXP / 3000) + 1));

  const { error } = await supabase
    .from('talent_profiles')
    .update({ total_xp: newXP, current_level: newLevel, updated_at: new Date().toISOString() })
    .eq('id', auditorId);

  if (error) console.error('XP award failed:', error);
}

export async function closeSprint(sprintId: string): Promise<void> {
  const { data: tasks, error: tasksErr } = await supabase
    .from('audit_tasks')
    .select('*')
    .eq('sprint_id', sprintId);

  if (tasksErr) throw tasksErr;

  const healthScore = calculateSprintHealth((tasks || []) as AuditTask[]);
  const GATE_THRESHOLD = 85;

  if (healthScore < GATE_THRESHOLD) {
    throw new Error(
      `BLOCKING: File Health (${healthScore}%) is below threshold (${GATE_THRESHOLD}%). Cannot close sprint.`
    );
  }

  const { error } = await supabase
    .from('audit_sprints')
    .update({ status: 'COMPLETED', updated_at: new Date().toISOString() })
    .eq('id', sprintId);

  if (error) throw error;

  const engagementId = (tasks as AuditTask[])[0]?.engagement_id;
  if (engagementId) {
    const { data: nextSprints } = await supabase
      .from('audit_sprints')
      .select('id')
      .eq('engagement_id', engagementId)
      .eq('status', 'PLANNED')
      .order('sprint_number', { ascending: true })
      .limit(1);
    if (nextSprints?.length) {
      await supabase
        .from('audit_sprints')
        .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
        .eq('id', nextSprints[0].id);
    }
  }
}

function calculateSprintHealth(tasks: AuditTask[]): number {
  const done = tasks.filter((t) => t.status === 'DONE');
  if (done.length === 0) return 0;

  const withEvidence = done.filter(
    (t) => Array.isArray(t.evidence_links) && t.evidence_links.length > 0
  ).length;
  const evidenceScore = Math.round((withEvidence / done.length) * 100);

  const withDescription = done.filter(
    (t) => t.description && t.description.length > 50
  ).length;
  const logicScore = Math.round((withDescription / done.length) * 100);

  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS');
  let cycleScore = 100;
  if (inProgress.length > 0) {
    const now = Date.now();
    const withinLimit = inProgress.filter((t) => {
      const days = Math.abs(now - new Date(t.updated_at || t.created_at).getTime()) / 86_400_000;
      return days <= 5;
    }).length;
    cycleScore = Math.round((withinLimit / inProgress.length) * 100);
  }

  const validated = done.filter((t) => t.validation_status === 'VALIDATED').length;
  const reviewScore = Math.round((validated / done.length) * 100);

  return Math.round(
    evidenceScore * 0.3 + logicScore * 0.3 + cycleScore * 0.2 + reviewScore * 0.2
  );
}
