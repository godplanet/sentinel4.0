/**
 * Resurrection Watch — TanStack React Query Hooks
 * widgets/ResurrectionWatch/api/index.ts (Wave 32 upgrade)
 *
 * Çökme Kalkanları:
 *   - Optional chaining ?.
 *   - Nullish coalescing ?? ve || []
 *   - Tablo yoksa (42P01) graceful degradation
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

// ─── Risk Kabul Tipi (mevcut fetchRiskAcceptances için) ───────────────────────

export interface RiskAcceptanceItem {
  id: string;
  action_id: string;
  finding_title: string;
  risk_description: string;
  justification: string;
  expiration_date: string;
  acceptance_start: string;
  accepted_by: string;
  reviewer_id: string | null;
}

export async function fetchRiskAcceptances(): Promise<RiskAcceptanceItem[]> {
  const { data, error } = await supabase
    .from('actions')
    .select(
      'id, finding_id, finding_snapshot, original_due_date, current_due_date, created_at, assignee_unit_name, responsible_person'
    )
    .eq('status', 'risk_accepted')
    .order('current_due_date', { ascending: true });

  if (error) {
    if (error.code === '42P01') return [];
    throw error;
  }

  return (data ?? []).map((row) => {
    const snapshot = ((row.finding_snapshot ?? {}) as Record<string, unknown>);
    const expiryDate =
      (row.current_due_date as string) ||
      (row.original_due_date as string) ||
      '';

    return {
      id: `ra-${row.id}`,
      action_id: row.id as string,
      finding_title: (snapshot.title as string) ?? 'Bilinmeyen Bulgu',
      risk_description: (snapshot.description as string) ?? '',
      justification: (snapshot.risk_description as string) ?? '',
      expiration_date: expiryDate,
      acceptance_start: (row.created_at as string)?.split('T')[0] ?? '',
      accepted_by:
        (row.responsible_person as string) ||
        (row.assignee_unit_name as string) ||
        'Yönetim',
      reviewer_id: null,
    };
  });
}

// ─── Zombi Bulgu Tipi ──────────────────────────────────────────────────────────

export interface ZombieLog {
  id: string;
  finding_code: string;
  finding_title: string;
  category: string;
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  original_closed_at: string;
  resurface_date: string;
  previous_close_count: number;
  assigned_to: string | null;
  entity_name: string | null;
  notes: string | null;
  status: 'ACTIVE' | 'RESOLVED' | 'MONITORING';
  created_at: string;
}

// ─── Tahminsel Uyarı Tipi ────────────────────────────────────────────────────

export interface PredictiveAlert {
  id: string;
  category: string;
  alert_type: 'RECURRENCE' | 'ESCALATION' | 'TREND' | 'THRESHOLD';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string | null;
  predicted_date: string | null;
  confidence_pct: number | null;
  is_acknowledged: boolean;
  source_data: Record<string, unknown>;
  created_at: string;
}

// ─── Hook: useZombies ─────────────────────────────────────────────────────────

export function useZombies(status?: ZombieLog['status']) {
  return useQuery<ZombieLog[]>({
    queryKey: ['resurrection-logs', status],
    queryFn: async () => {
      let q = supabase
        .from('resurrection_logs')
        .select('*')
        .order('resurface_date', { ascending: false });

      if (status) {
        q = q.eq('status', status);
      }

      const { data, error } = await q;

      if (error) {
        // Tablo henüz migrate edilmemişse graceful degradation
        if (error.code === '42P01') return [];
        throw error;
      }

      return (data ?? []) as ZombieLog[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Hook: useRadar ──────────────────────────────────────────────────────────

export function useRadar(onlyUnacknowledged = true) {
  return useQuery<PredictiveAlert[]>({
    queryKey: ['predictive-alerts', onlyUnacknowledged],
    queryFn: async () => {
      let q = supabase
        .from('predictive_alerts')
        .select('*')
        .order('confidence_pct', { ascending: false });

      if (onlyUnacknowledged) {
        q = q.eq('is_acknowledged', false);
      }

      const { data, error } = await q;

      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }

      return (data ?? []) as PredictiveAlert[];
    },
    staleTime: 1000 * 60 * 3,
  });
}

// ─── Hook: useZombieSummary ──────────────────────────────────────────────────

export interface ZombieSummary {
  totalActive: number;
  criticalCount: number;
  avgCloseCount: number;
  topCategory: string | null;
}

export function useZombieSummary() {
  return useQuery<ZombieSummary>({
    queryKey: ['zombie-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resurrection_logs')
        .select('status, risk_level, category, previous_close_count')
        .eq('status', 'ACTIVE');

      if (error) {
        if (error.code === '42P01') {
          return { totalActive: 0, criticalCount: 0, avgCloseCount: 0, topCategory: null };
        }
        throw error;
      }

      const rows = data ?? [];
      const totalActive = rows.length;
      const criticalCount = rows.filter((r: any) => r?.risk_level === 'CRITICAL').length;

      // Ortalama kapatılma sayısı — SIFIRA BÖLÜNME KORUNMASI: (totalActive || 1)
      const avgCloseCount = Math.round(
        rows.reduce((sum: number, r: any) => sum + (r?.previous_close_count || 0), 0) /
        (totalActive || 1)
      );

      // En sık kategorisi
      const catMap: Record<string, number> = {};
      rows.forEach((r: any) => {
        const c = r?.category ?? 'Diğer';
        catMap[c] = (catMap[c] || 0) + 1;
      });
      const topCategory = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

      return { totalActive, criticalCount, avgCloseCount, topCategory };
    },
    staleTime: 1000 * 60 * 5,
  });
}
