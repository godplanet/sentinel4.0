/**
 * Wave 33: Chaos Lab — chaos_experiments ve chaos_results Supabase API kancaları
 * Tüm istatistiksel hesaplamalarda sıfıra bölünme (total_tests || 1) ile korunur.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type { ChaosScenario, ChaosTestResult, ControlReaction } from './types';

const TENANT_ID = '11111111-1111-1111-1111-111111111111';
const EXP_KEY = ['chaos-experiments'] as const;
const RES_KEY = ['chaos-results'] as const;

/* ────────────────────────────────────────────────────────── */
/* Types                                                       */
/* ────────────────────────────────────────────────────────── */

export interface ChaosExperimentRow {
  id: string;
  title: string;
  scenario: ChaosScenario;
  description: string;
  target_control: string;
  target_table: string;
  injection_count: number;
  injection_amount: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  is_active: boolean;
  created_at: string;
}

export interface ChaosResultRow {
  id: string;
  experiment_id: string | null;
  batch_id: string;
  scenario: string;
  transactions_injected: number;
  total_amount: number;
  control_reaction: ControlReaction;
  detection_time_ms: number;
  alert_triggered: boolean;
  notes: string | null;
  ran_at: string;
}

export interface ChaosStats {
  total_runs: number;
  blocked_count: number;
  detected_count: number;
  missed_count: number;
  success_rate: number;       // (blocked + detected) / (total_runs || 1) * 100
  avg_detection_ms: number;
}

/* ────────────────────────────────────────────────────────── */
/* Queries                                                     */
/* ────────────────────────────────────────────────────────── */

/** Tüm aktif kaos deney konfigürasyonlarını çeker */
export function useChaosExperiments() {
  return useQuery<ChaosExperimentRow[]>({
    queryKey: EXP_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chaos_experiments')
        .select('id, title, scenario, description, target_control, target_table, injection_count, injection_amount, severity, is_active, created_at')
        .eq('tenant_id', TENANT_ID)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ChaosExperimentRow[];
    },
    staleTime: 60_000,
  });
}

/** Son 50 Kaos testi sonucunu çeker */
export function useChaosResults(experimentId?: string) {
  return useQuery<ChaosResultRow[]>({
    queryKey: [...RES_KEY, experimentId ?? 'all'],
    queryFn: async () => {
      let q = supabase
        .from('chaos_results')
        .select('id, experiment_id, batch_id, scenario, transactions_injected, total_amount, control_reaction, detection_time_ms, alert_triggered, notes, ran_at')
        .eq('tenant_id', TENANT_ID)
        .order('ran_at', { ascending: false })
        .limit(50);

      if (experimentId) {
        q = q.eq('experiment_id', experimentId);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as ChaosResultRow[];
    },
    staleTime: 30_000,
  });
}

/**
 * Kaos lab istatistiklerini türetir.
 * SIFIRA BÖLÜNME KORUMALARI: (total_runs || 1) zorunlu.
 */
export function useChaosStats() {
  const { data: results, isLoading } = useChaosResults();

  const stats: ChaosStats = (() => {
    const rows = results ?? [];
    const total_runs = rows.length;
    const blocked_count = rows.filter(r => r.control_reaction === 'BLOCKED').length;
    const detected_count = rows.filter(r => r.control_reaction === 'DETECTED').length;
    const missed_count = rows.filter(r => r.control_reaction === 'MISSED').length;

    // SIFIRA BÖLÜNME: (total_runs || 1)
    const success_rate = Math.round(
      ((blocked_count + detected_count) / (total_runs || 1)) * 100
    );

    const detecting_rows = rows.filter(r => r.detection_time_ms > 0);
    const avg_detection_ms = detecting_rows.length > 0
      ? Math.round(detecting_rows.reduce((s, r) => s + (r.detection_time_ms ?? 0), 0) / (detecting_rows.length || 1))
      : 0;

    return {
      total_runs,
      blocked_count,
      detected_count,
      missed_count,
      success_rate,
      avg_detection_ms,
    };
  })();

  return { stats, isLoading };
}

/* ────────────────────────────────────────────────────────── */
/* Mutations                                                   */
/* ────────────────────────────────────────────────────────── */

/**
 * Kaos testi sonucunu chaos_results tablosuna kaydet.
 * ChaosMonkey.ts'in mevcut akışını bozmadan çağrılabilir.
 */
export async function persistChaosResult(
  experimentId: string | null,
  result: ChaosTestResult,
): Promise<void> {
  try {
    const { error } = await supabase
      .from('chaos_results')
      .insert({
        tenant_id: TENANT_ID,
        experiment_id: experimentId,
        batch_id: result.batchId,
        scenario: result.scenario,
        transactions_injected: result.transactionsInjected ?? 0,
        total_amount: result.totalAmount ?? 0,
        control_reaction: result.controlReaction,
        detection_time_ms: result.detectionTimeMs ?? 0,
        alert_triggered: result.alertTriggered ?? false,
        alert_id: result.alertId ?? null,
      });
    if (error) {
      console.warn('[ChaosLab] persistChaosResult failed silently:', error.message);
    }
  } catch (err) {
    console.warn('[ChaosLab] persistChaosResult exception:', err);
  }
}

/** React Query mutation wrapper: sonucu kaydet ve listeyi invalidate et */
export function usePersistChaosResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ experimentId, result }: { experimentId: string | null; result: ChaosTestResult }) =>
      persistChaosResult(experimentId, result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RES_KEY });
    },
  });
}
