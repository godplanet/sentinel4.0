import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';
import type { WelcomeSummary, AIBrief, MyTask, SystemActivity } from '@/entities/dashboard/model/types';

const TENANT = ACTIVE_TENANT_ID;

export function useDashboardLiveData() {
  return useQuery({
    queryKey: ['dashboard-live-data'],
    queryFn: async () => {
      const [userRes, findingsRes, actionsRes, engagementsRes, alertsRes, probesRes] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('full_name, role, title, email')
          .eq('tenant_id', TENANT)
          .eq('role', 'admin')
          .limit(1)
          .maybeSingle(),
        supabase
          .from('audit_findings')
          .select('id, title, severity, status, created_at')
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('actions')
          .select('id, title, status, current_due_date, priority')
          .eq('tenant_id', TENANT)
          .in('status', ['OPEN', 'IN_PROGRESS', 'PENDING_VERIFICATION'])
          .order('current_due_date', { ascending: true })
          .limit(10),
        supabase
          .from('audit_engagements')
          .select('id, title, status, created_at')
          .eq('tenant_id', TENANT)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('ccm_alerts')
          .select('id, title, severity, status, created_at')
          .in('status', ['OPEN', 'INVESTIGATING'])
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('probes')
          .select('id, title, last_result_status')
          .eq('is_active', true)
          .eq('last_result_status', 'FAIL')
          .limit(5),
      ]);

      const user = userRes.data;
      const findings = findingsRes.data || [];
      const actions = actionsRes.data || [];
      const engagements = engagementsRes.data || [];
      const openAlerts = alertsRes.data || [];
      const failedProbes = probesRes.data || [];

      const welcome: WelcomeSummary = {
        userName: user?.full_name || 'Kullanici',
        role: user?.title || user?.role || 'Denetci',
        welcomeMessage: `Hos geldiniz, ${user?.full_name?.split(' ')[0] || 'Kullanici'}.`,
        systemHealth: 98,
        lastLogin: 'Bugun, 09:15',
      };

      const criticalFindings = findings.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH');
      const criticalAlerts = openAlerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH');

      const totalCritical = criticalFindings.length + criticalAlerts.length;

      const aiBrief: AIBrief = {
        headline: totalCritical > 0
          ? `${criticalFindings.length} bulgu, ${criticalAlerts.length} CCM alarmi ve ${failedProbes.length} basarisiz prob aktif`
          : 'Sistem normal parametrelerde calisiyor',
        summary: totalCritical > 0
          ? `${findings.length} bulgu, ${actions.length} acik aksiyon izleniyor. ${openAlerts.length} CCM alarmi dikkat gerektiriyor.`
          : `${findings.length} bulgu izleniyor. ${engagements.filter(e => e.status === 'FIELDWORK').length} aktif denetim saha calismasi devam ediyor.`,
        context: 'Sentinel Brain - Gunluk Tarama',
        sentiment: totalCritical >= 5 ? 'critical' : totalCritical > 0 ? 'warning' : 'positive',
      };

      const tasks: MyTask[] = [
        ...actions.slice(0, 4).map((action) => ({
          id: `action-${action.id}`,
          title: action.title,
          deadline: formatDate(action.current_due_date),
          type: 'approval' as const,
          status: action.status === 'IN_PROGRESS' ? 'in-progress' as const : 'pending' as const,
          priority: (action.priority?.toLowerCase() || 'medium') as 'high' | 'medium' | 'low',
        })),
        ...openAlerts.slice(0, 2).map(alert => ({
          id: `alert-${alert.id}`,
          title: alert.title,
          deadline: formatTimestamp(alert.created_at),
          type: 'review' as const,
          status: 'pending' as const,
          priority: (alert.severity === 'CRITICAL' ? 'high' : alert.severity === 'HIGH' ? 'high' : 'medium') as 'high' | 'medium' | 'low',
        })),
      ].slice(0, 6);

      const activities: SystemActivity[] = [
        ...findings.slice(0, 2).map(f => ({
          id: `finding-${f.id}`,
          userName: 'Denetci',
          action: 'yeni bir bulgu ekledi',
          target: f.title,
          timestamp: formatTimestamp(f.created_at),
          type: 'finding' as const,
        })),
        ...openAlerts.slice(0, 2).map(a => ({
          id: `alert-${a.id}`,
          userName: 'CCM Motoru',
          action: 'yeni bir alarm uretti',
          target: a.title,
          timestamp: formatTimestamp(a.created_at),
          type: 'finding' as const,
        })),
        ...engagements.slice(0, 2).map(e => ({
          id: `eng-${e.id}`,
          userName: 'Sistem',
          action: 'denetim planina ekledi',
          target: e.title,
          timestamp: formatTimestamp(e.created_at),
          type: 'plan' as const,
        })),
      ].slice(0, 6);

      return {
        welcome,
        aiBrief,
        tasks,
        activities,
      };
    },
    staleTime: 60_000,
  });
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Belirlenmedi';

  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Bugun';
  if (diffDays === 1) return 'Yarin';
  if (diffDays === -1) return 'Dun';
  if (diffDays > 0 && diffDays <= 7) return `${diffDays} gun sonra`;

  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
}

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Az once';
  if (diffMins < 60) return `${diffMins} dk once`;
  if (diffHours < 24) return `${diffHours} saat once`;
  if (diffDays === 1) return 'Dun';
  if (diffDays < 7) return `${diffDays} gun once`;

  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
}
