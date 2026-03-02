import { supabase } from '@/shared/api/supabase';
import type { CPERecordRow } from '@/shared/types/database.types';

export interface Engagement {
  id: string;
  title: string;
  status: string;
  start_date: string;
  end_date: string;
  estimated_hours?: number;
  assigned_count?: number;
}

export interface AuditorAllocation {
  id: string;
  full_name: string;
  email: string;
  allocated_hours: number;
  capacity_hours: number;
  active_engagements: number;
}

export async function fetchCPERecords(): Promise<CPERecordRow[]> {
  const { data, error } = await supabase
    .from('cpe_records')
    .select('*')
    .order('completion_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchResourceAllocations(): Promise<{ engagements: Engagement[]; auditors: AuditorAllocation[] }> {
  const [engagementsResult, auditorsResult] = await Promise.all([
    supabase
      .from('audit_engagements')
      .select('*')
      .in('status', ['PLANNED', 'IN_PROGRESS'])
      .order('start_date', { ascending: true }),
    supabase
      .from('auditor_profiles')
      .select('user_id, title, department')
      .order('user_id')
  ]);

  if (engagementsResult.error) throw engagementsResult.error;
  if (auditorsResult.error) throw auditorsResult.error;

  const auditorRows = auditorsResult.data || [];
  const userIds = auditorRows.map((r: { user_id: string }) => r.user_id);
  const profilesMap: Record<string, { full_name: string; email: string }> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, full_name, email')
      .in('id', userIds);
    (profiles || []).forEach((p: { id: string; full_name: string; email: string }) => {
      profilesMap[p.id] = { full_name: p.full_name ?? '', email: p.email ?? '' };
    });
  }

  const engagementsWithAssignments = await Promise.all(
    (engagementsResult.data || []).map(async (eng) => {
      const { count, error } = await supabase
        .from('resource_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('engagement_id', eng.id);
      const assigned_count = error ? 0 : (count ?? 0);
      return {
        id: eng.id,
        title: eng.title,
        status: eng.status,
        start_date: eng.start_date,
        end_date: eng.end_date,
        estimated_hours: eng.estimated_hours,
        assigned_count
      } as Engagement;
    })
  );

  const auditorsWithAllocation = await Promise.all(
    auditorRows.map(async (auditor: { user_id: string }) => {
      const { data: assignments, error } = await supabase
        .from('resource_assignments')
        .select('allocated_hours, engagement:audit_engagements!inner(status)')
        .eq('user_id', auditor.user_id)
        .in('engagement.status', ['PLANNED', 'IN_PROGRESS']);
      const list = error ? [] : (assignments || []);
      const allocatedHours = list.reduce(
        (sum: number, a: { allocated_hours?: number }) => sum + (a.allocated_hours || 0),
        0
      );
      const profile = profilesMap[auditor.user_id];

      return {
        id: auditor.user_id,
        full_name: profile?.full_name ?? 'İsimsiz Denetçi',
        email: profile?.email ?? '',
        allocated_hours: allocatedHours,
        capacity_hours: 160,
        active_engagements: list.length
      } as AuditorAllocation;
    })
  );

  return {
    engagements: engagementsWithAssignments,
    auditors: auditorsWithAllocation
  };
}
