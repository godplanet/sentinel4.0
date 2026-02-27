import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';
import type { KPICard } from '@/entities/dashboard/model/types';

const TENANT = ACTIVE_TENANT_ID;

interface DashboardStats {
  entityCount: number;
  assessmentCount: number;
  criticalCount: number;
  highCount: number;
  avgRiskScore: number;
  openAlertCount: number;
  openActionCount: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const [entitiesRes, assessmentsRes, alertsRes, actionsRes] = await Promise.all([
        supabase
          .from('audit_entities')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', TENANT),
        supabase
          .from('risk_assessments')
          .select('inherent_risk_score, residual_score')
          .eq('tenant_id', TENANT),
        supabase
          .from('ccm_alerts')
          .select('id', { count: 'exact', head: true })
          .in('status', ['OPEN', 'INVESTIGATING']),
        supabase
          .from('actions')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', TENANT)
          .in('status', ['OPEN', 'IN_PROGRESS', 'OVERDUE']),
      ]);

      const entityCount = entitiesRes.count ?? 0;
      const assessments = assessmentsRes.data ?? [];
      const assessmentCount = assessments.length;
      const openAlertCount = alertsRes.count ?? 0;
      const openActionCount = actionsRes.count ?? 0;

      let criticalCount = 0;
      let highCount = 0;
      let totalScore = 0;

      for (const a of assessments) {
        const score = a.inherent_risk_score ?? 0;
        totalScore += score;
        if (score >= 15) criticalCount++;
        else if (score >= 10) highCount++;
      }

      const avgRiskScore = assessmentCount > 0
        ? Math.round((totalScore / assessmentCount) * 10) / 10
        : 0;

      return {
        entityCount,
        assessmentCount,
        criticalCount,
        highCount,
        avgRiskScore,
        openAlertCount,
        openActionCount,
      };
    },
    staleTime: 30_000,
  });
}

export function buildKPICards(stats: DashboardStats | undefined): KPICard[] {
  if (!stats) {
    return [
      { id: 'risk-score', label: 'Kurumsal Risk Skoru', value: '-', trend: 'flat', status: 'warning' },
      { id: 'entity-count', label: 'Denetim Evreni', value: '-', trend: 'flat', status: 'success' },
      { id: 'critical-risks', label: 'Kritik Risk Sayisi', value: '-', trend: 'flat', status: 'danger' },
      { id: 'open-alerts', label: 'Acik Alarm', value: '-', trend: 'flat', status: 'warning' },
      { id: 'open-actions', label: 'Acik Aksiyon', value: '-', trend: 'flat', status: 'warning' },
    ];
  }

  const riskStatus: KPICard['status'] =
    stats.avgRiskScore >= 12 ? 'danger' : stats.avgRiskScore >= 8 ? 'warning' : 'success';

  return [
    {
      id: 'risk-score',
      label: 'Ort. Risk Skoru',
      value: String(stats.avgRiskScore),
      trend: stats.avgRiskScore >= 10 ? 'up' : 'down',
      status: riskStatus,
    },
    {
      id: 'entity-count',
      label: 'Denetim Evreni',
      value: `${stats.entityCount} varlik`,
      trend: 'up',
      status: 'success',
    },
    {
      id: 'critical-risks',
      label: 'Kritik Risk',
      value: String(stats.criticalCount),
      trend: stats.criticalCount > 3 ? 'up' : 'down',
      status: stats.criticalCount > 0 ? 'danger' : 'success',
    },
    {
      id: 'open-alerts',
      label: 'CCM Alarm',
      value: String(stats.openAlertCount),
      trend: stats.openAlertCount > 3 ? 'up' : 'flat',
      status: stats.openAlertCount > 3 ? 'danger' : stats.openAlertCount > 0 ? 'warning' : 'success',
    },
    {
      id: 'open-actions',
      label: 'Acik Aksiyon',
      value: String(stats.openActionCount),
      trend: stats.openActionCount > 5 ? 'up' : 'flat',
      status: stats.openActionCount > 5 ? 'danger' : stats.openActionCount > 0 ? 'warning' : 'success',
    },
  ];
}
