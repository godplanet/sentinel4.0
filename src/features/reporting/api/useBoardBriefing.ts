/**
 * Yönetim Kurulu (Board) Briefing — Gerçek veri hook'ları.
 * Mock kullanılmaz; boş dönebilir.
 * GIAS 2024 / BDDK uyumlu raporlama veri katmanı.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

/** Denetim durum dağılımı (audit_engagements.status) */
export interface AuditExecutionStat {
  status: string;
  count: number;
}

export function useAuditExecutionStats() {
  return useQuery({
    queryKey: ['board-briefing', 'audit-execution-stats'],
    queryFn: async (): Promise<AuditExecutionStat[]> => {
      const { data, error } = await supabase
        .from('audit_engagements')
        .select('status');
      if (error) throw error;
      const rows = data ?? [];
      const byStatus = new Map<string, number>();
      for (const row of rows) {
        const s = row.status ?? 'UNKNOWN';
        byStatus.set(s, (byStatus.get(s) ?? 0) + 1);
      }
      return Array.from(byStatus.entries()).map(([status, count]) => ({ status, count }));
    },
    staleTime: 2 * 60 * 1000,
  });
}

/** Kritik/Bordo bulgu (CRITICAL, HIGH) */
export interface CriticalFindingRow {
  id: string;
  title: string;
  severity: string;
  status: string;
  institution?: string;
  engagement_title?: string;
}

export function useCriticalFindings() {
  return useQuery({
    queryKey: ['board-briefing', 'critical-findings'],
    queryFn: async (): Promise<CriticalFindingRow[]> => {
      const { data, error } = await supabase
        .from('audit_findings')
        .select(`
          id,
          title,
          severity,
          status,
          engagement:audit_engagements(
            title,
            audit_entities(name)
          )
        `)
        .in('severity', ['CRITICAL', 'HIGH']);
      if (error) throw error;
      const rows = (data ?? []) as Array<{
        id: string;
        title: string;
        severity: string;
        status: string;
        engagement?: { title?: string; audit_entities?: { name?: string } | null } | null;
      }>;
      return (rows || []).map((r) => ({
        id: r?.id,
        title: r?.title ?? '',
        severity: r?.severity ?? 'HIGH',
        status: r?.status ?? 'DRAFT',
        institution: r?.engagement?.audit_entities?.name ?? r?.engagement?.title ?? undefined,
        engagement_title: r?.engagement?.title ?? undefined,
      }));
    },
    staleTime: 2 * 60 * 1000,
  });
}

/** YK'ya arz edilen eskalasyon (CAE kararı: COMMITTEE_FLAGGED) */
export interface BoardEscalationRow {
  id: string;
  action_id: string;
  action_title: string;
  cae_decision: string;
  justification: string | null;
  triggered_at: string;
  current_due_date: string | null;
  status: string;
  finding_title?: string;
}

export function useBoardEscalations() {
  return useQuery({
    queryKey: ['board-briefing', 'board-escalations'],
    queryFn: async (): Promise<BoardEscalationRow[]> => {
      const { data: logs, error: logErr } = await supabase
        .from('escalation_logs')
        .select('id, action_id, cae_decision, justification, triggered_at')
        .eq('cae_decision', 'COMMITTEE_FLAGGED');
      if (logErr) throw logErr;
      const list = (logs ?? []) as Array<{
        id: string;
        action_id: string;
        cae_decision: string;
        justification: string | null;
        triggered_at: string;
      }>;
      if (list.length === 0) return [];

      const actionIds = (list || []).map((l) => l?.action_id);
      const { data: actions, error: actErr } = await supabase
        .from('actions')
        .select('id, title, current_due_date, status, finding_id, finding_snapshot')
        .in('id', actionIds);
      if (actErr) throw actErr;
      const actionMap = new Map(
        (actions ?? []).map((a: { id: string; title?: string; current_due_date?: string; status?: string; finding_snapshot?: { title?: string } }) => [
          a.id,
          {
            title: a.title ?? '',
            current_due_date: a.current_due_date ?? null,
            status: a.status ?? '',
            finding_title: a.finding_snapshot?.title ?? undefined,
          },
        ])
      );

      return (list || []).map((l) => {
        const act = actionMap.get(l?.action_id);
        return {
          id: l?.id,
          action_id: l?.action_id,
          action_title: act?.title ?? '—',
          cae_decision: l?.cae_decision,
          justification: l?.justification ?? null,
          triggered_at: l?.triggered_at,
          current_due_date: act?.current_due_date ?? null,
          status: act?.status ?? '',
          finding_title: act?.finding_title,
        };
      });
    },
    staleTime: 2 * 60 * 1000,
  });
}
