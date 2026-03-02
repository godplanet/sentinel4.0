/**
 * CCM Anomali paneli — ccm_alerts tablosuna React Query ile bağlanır.
 * useCCMAlerts: OPEN/INVESTIGATING uyarıları tarihe göre azalan listeler.
 * resolveAnomaly: Uyarıyı DISMISSED yapar, resolved_at set eder.
 *
 * DDL: ccm_alerts (id, rule_triggered, risk_score, severity, title, description, status, created_at, ...)
 *      migrations: 20260207210659, 20260211122335
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

export type CCMAlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface CCMAlert {
  id: string;
  rule_id: string;
  alert_title: string;
  alert_description: string;
  severity: CCMAlertSeverity;
  status: string;
  ai_confidence_score: number;
  created_at: string;
  source_system: string;
}

interface DbRow {
  id: string;
  rule_triggered: string;
  risk_score: number;
  severity: string;
  title: string;
  description: string | null;
  status: string;
  evidence_data?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

const QUERY_KEY_PREFIX = 'ccm-alerts';

function mapRowToAlert(row: DbRow): CCMAlert {
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    id: row.id,
    rule_id: row.rule_triggered ?? '',
    alert_title: row.title ?? '',
    alert_description: row.description ?? '',
    severity: (row.severity ?? 'MEDIUM') as CCMAlertSeverity,
    status: row.status ?? 'OPEN',
    ai_confidence_score: Number(row.risk_score ?? 0),
    created_at: row.created_at,
    source_system: (meta.source_system as string) ?? '',
  };
}

async function fetchCCMAlertsForPanel(): Promise<CCMAlert[]> {
  const { data, error } = await supabase
    .from('ccm_alerts')
    .select('id, rule_triggered, risk_score, severity, title, description, status, evidence_data, metadata, created_at')
    .in('status', ['OPEN', 'INVESTIGATING'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapRowToAlert);
}

export interface ResolveAnomalyInput {
  alertId: string;
}

async function resolveAnomalyInDb(input: ResolveAnomalyInput): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('ccm_alerts')
    .update({ status: 'DISMISSED', resolved_at: now, updated_at: now })
    .eq('id', input.alertId);

  if (error) throw error;
}

export function useCCMAlerts() {
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading, refetch } = useQuery({
    queryKey: [QUERY_KEY_PREFIX],
    queryFn: fetchCCMAlertsForPanel,
  });

  const resolveMutation = useMutation({
    mutationFn: resolveAnomalyInDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_PREFIX] });
    },
  });

  return {
    alerts,
    isLoading,
    refetch,
    resolveAnomaly: resolveMutation.mutateAsync,
    resolveMutation,
    isResolving: resolveMutation.isPending,
  };
}
