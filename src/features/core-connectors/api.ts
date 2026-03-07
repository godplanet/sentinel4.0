/**
 * Core Banking API Connectors — Veri Katmanı
 * features/core-connectors/api.ts  (Wave 44)
 *
 * Çökme Kalkanları:
 *   (pipelines || []).map(...)
 *   duration_ms / (duration_ms || 1)
 *   42P01 → graceful boş dizi
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import toast from 'react-hot-toast';

// ─── Tipler ──────────────────────────────────────────────────────────────────

export interface ExternalPipeline {
  id: string;
  pipeline_code: string;
  name: string;
  description: string | null;
  system_source: string;
  target_table: string;
  schedule_cron: string | null;
  is_active: boolean;
  sync_type: 'PULL' | 'PUSH' | 'BIDIRECTIONAL';
  data_format: 'JSON' | 'CSV' | 'XML' | 'FIXED_LENGTH';
  auth_type: 'API_KEY' | 'OAUTH2' | 'MTLS' | 'SFTP' | 'DB_LINK';
  endpoint_url: string | null;
  last_success_at: string | null;
  last_error_at: string | null;
  last_error_msg: string | null;
  record_count: number;
  created_at: string;
  updated_at: string;
}

export interface SyncLog {
  id: string;
  pipeline_id: string;
  pipeline_code: string;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'PARTIAL' | 'CANCELLED';
  records_fetched: number;
  records_written: number;
  records_failed: number;
  error_code: string | null;
  error_detail: string | null;
  triggered_by: 'SCHEDULER' | 'MANUAL' | 'WEBHOOK' | 'API';
  triggered_user: string | null;
  metadata: Record<string, unknown>;
}

// ─── Hook: usePipelines ───────────────────────────────────────────────────────

export function usePipelines(onlyActive = false) {
  return useQuery<ExternalPipeline[]>({
    queryKey: ['core-pipelines', onlyActive],
    queryFn: async () => {
      let q = supabase
        .from('external_data_pipelines')
        .select('*')
        .order('system_source', { ascending: true })
        .order('name', { ascending: true });

      if (onlyActive) q = q.eq('is_active', true);

      const { data, error } = await q;
      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }
      // (pipelines || []) kalkanı
      return (data || []) as ExternalPipeline[];
    },
    staleTime: 1000 * 30, // 30 sn — pipeline durumu sık değişebilir
  });
}

// ─── Hook: useSyncLogs ────────────────────────────────────────────────────────

export function useSyncLogs(pipelineId?: string | null, limit = 20) {
  return useQuery<SyncLog[]>({
    queryKey: ['sync-logs', pipelineId, limit],
    queryFn: async () => {
      let q = supabase
        .from('core_sync_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(limit);

      if (pipelineId) q = q.eq('pipeline_id', pipelineId);

      const { data, error } = await q;
      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }
      return (data || []) as SyncLog[];
    },
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30, // Her 30 sn'de aktif logları güncelle
  });
}

// ─── Hook: usePipelineSummary ─────────────────────────────────────────────────

export interface PipelineSummary {
  total: number;
  active: number;
  inactive: number;
  successLast24h: number;
  failedLast24h: number;
  totalRecordsToday: number;
}

export function usePipelineSummary() {
  return useQuery<PipelineSummary>({
    queryKey: ['pipeline-summary'],
    queryFn: async () => {
      const [pipelines, logs] = await Promise.all([
        supabase.from('external_data_pipelines').select('is_active, record_count'),
        supabase
          .from('core_sync_logs')
          .select('status, records_written')
          .gte('started_at', new Date(Date.now() - 86400000).toISOString()),
      ]);

      if (pipelines.error?.code === '42P01' || logs.error?.code === '42P01') {
        return { total: 0, active: 0, inactive: 0, successLast24h: 0, failedLast24h: 0, totalRecordsToday: 0 };
      }
      if (pipelines.error) throw pipelines.error;
      if (logs.error) throw logs.error;

      const pRows = pipelines.data || [];
      const lRows = logs.data || [];

      return {
        total:              pRows.length,
        active:             pRows.filter((p: any) => p?.is_active).length,
        inactive:           pRows.filter((p: any) => !p?.is_active).length,
        successLast24h:     lRows.filter((l: any) => l?.status === 'SUCCESS').length,
        failedLast24h:      lRows.filter((l: any) => l?.status === 'FAILED').length,
        // Sıfıra bölünme koruması gerekmez ancak || 0 ile NaN engellenir
        totalRecordsToday:  lRows.reduce((s: number, l: any) => s + (l?.records_written || 0), 0),
      };
    },
    staleTime: 1000 * 60,
  });
}

// ─── Hook: useTriggerSync ─────────────────────────────────────────────────────

export function useTriggerSync() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (pipeline: ExternalPipeline) => {
      // Yeni log kaydı oluştur (RUNNING durumunda)
      const { data, error } = await supabase
        .from('core_sync_logs')
        .insert({
          pipeline_id:   pipeline.id,
          pipeline_code: pipeline.pipeline_code,
          started_at:    new Date().toISOString(),
          status:        'RUNNING',
          triggered_by:  'MANUAL',
          records_fetched: 0,
          records_written: 0,
          records_failed:  0,
        })
        .select()
        .single();

      if (error) throw error;

      // Simüle edilmiş gecikme (gerçek ortamda Edge Function / webhook tetiklenir)
      await new Promise<void>((res) => setTimeout(res, 1500));

      // Log'u SUCCESS olarak güncelle (gerçek bağlantı olmadan simülasyon)
      const completedAt = new Date().toISOString();
      const durationMs = 1500;

      await supabase
        .from('core_sync_logs')
        .update({
          status:          'SUCCESS',
          completed_at:    completedAt,
          duration_ms:     durationMs,
          records_fetched: pipeline.record_count,
          records_written: pipeline.record_count,
        })
        .eq('id', (data as SyncLog).id);

      // Pipeline last_success_at güncelle
      await supabase
        .from('external_data_pipelines')
        .update({ last_success_at: completedAt, updated_at: completedAt })
        .eq('id', pipeline.id);

      return data as SyncLog;
    },
    onSuccess: (_, pipeline) => {
      void qc.invalidateQueries({ queryKey: ['sync-logs'] });
      void qc.invalidateQueries({ queryKey: ['core-pipelines'] });
      void qc.invalidateQueries({ queryKey: ['pipeline-summary'] });
      toast.success(`${pipeline.name} senkronizasyonu tamamlandı.`);
    },
    onError: (err: Error, pipeline) => {
      toast.error(`${pipeline.name}: ${err.message ?? 'Senkronizasyon başarısız.'}`);
    },
  });
}

// ─── Hook: useTogglePipeline ──────────────────────────────────────────────────

export function useTogglePipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('external_data_pipelines')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['core-pipelines'] });
      void qc.invalidateQueries({ queryKey: ['pipeline-summary'] });
    },
    onError: (err: Error) => {
      toast.error(`Durum değiştirilemedi: ${err.message}`);
    },
  });
}
