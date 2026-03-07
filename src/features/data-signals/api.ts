import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type { SeismographPoint } from '@/entities/probe/model/types';

const TENANT_ID = '11111111-1111-1111-1111-111111111111';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SignalSeverity = 'critical' | 'high' | 'medium' | 'low';
export type SignalType = 'MACRO_ECONOMIC' | 'CYBER' | 'REGULATORY' | 'MARKET';

export interface ExternalDataSignal {
  id: string;
  tenant_id: string;
  signal_type: SignalType;
  signal_source: string;
  title: string;
  description: string | null;
  signal_strength: number;
  impact_score: number;
  severity: SignalSeverity;
  is_active: boolean;
  triggered_at: string;
  expires_at: string | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface SeismographLog {
  id: string;
  tenant_id: string;
  log_hour: string;
  hour_label: string;
  exceptions: number;
  passes: number;
  signal_strength: number;
  created_at: string;
}

// ─── Data Signals (external_data_signals) ────────────────────────────────────

export function useExternalSignals(filters?: { severity?: SignalSeverity; activeOnly?: boolean }) {
  return useQuery({
    queryKey: ['external-signals', TENANT_ID, filters],
    queryFn: async () => {
      let query = supabase
        .from('external_data_signals')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .order('triggered_at', { ascending: false });

      if (filters?.activeOnly) {
        query = query.eq('is_active', true);
      }
      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }

      const { data, error } = await query;
      if (error) return [] as ExternalDataSignal[];
      return (data ?? []) as ExternalDataSignal[];
    },
    staleTime: 30_000,
    refetchInterval: 60_000, // Auto-refresh every minute
  });
}

export function useCreateSignal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: Pick<ExternalDataSignal, 'signal_type' | 'signal_source' | 'title' | 'description' | 'signal_strength' | 'impact_score' | 'severity'>
    ) => {
      const { data, error } = await supabase
        .from('external_data_signals')
        .insert({ ...payload, tenant_id: TENANT_ID })
        .select()
        .maybeSingle();
      if (error) throw error;
      return data as ExternalDataSignal;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['external-signals'] }),
  });
}

export function useToggleSignal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('external_data_signals')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['external-signals'] }),
  });
}

// ─── Seismograph Logs (seismograph_logs) ─────────────────────────────────────

export function useSeismographLogs(hours = 24) {
  return useQuery({
    queryKey: ['seismograph-logs', TENANT_ID, hours],
    queryFn: async () => {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('seismograph_logs')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .gte('log_hour', since)
        .order('log_hour', { ascending: true });

      if (error) return [] as SeismographLog[];
      const rows = (data ?? []) as SeismographLog[];

      // Convert seismograph_logs to SeismographPoint[], with div-by-zero guard
      return rows.map((row) => ({
        time: row.log_hour,
        label: row.hour_label,
        exceptions: row.exceptions,
        passes: row.passes,
        // Normalised intensity: exceptions / (signal_strength || 1) — Wave 41 guard
        intensity: row.exceptions / (row.signal_strength || 1),
      })) satisfies SeismographPoint[];
    },
    refetchInterval: 30_000, // Real-time feel
    staleTime: 15_000,
  });
}

export function useAppendSeismographLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (log: {
      log_hour: string;
      hour_label: string;
      exceptions: number;
      passes: number;
      signal_strength: number;
    }) => {
      const { error } = await supabase
        .from('seismograph_logs')
        .insert({ ...log, tenant_id: TENANT_ID });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seismograph-logs'] }),
  });
}
