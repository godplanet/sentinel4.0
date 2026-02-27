import { supabase } from '@/shared/api/supabase';
import type { Probe, ProbeLog, ProbeRun, ProbeException, ProbeStats, ExceptionStatus, SeismographPoint } from '../model/types';

export async function fetchProbes(): Promise<Probe[]> {
  const { data, error } = await supabase
    .from('probes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchProbe(id: string): Promise<Probe | null> {
  const { data, error } = await supabase
    .from('probes')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createProbe(probe: Partial<Probe>): Promise<Probe> {
  const { data, error } = await supabase
    .from('probes')
    .insert([probe])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProbe(id: string, updates: Partial<Probe>): Promise<Probe> {
  const { data, error } = await supabase
    .from('probes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProbe(id: string): Promise<void> {
  const { error } = await supabase
    .from('probes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function fetchProbeLogs(probeId: string, limit = 20): Promise<ProbeLog[]> {
  const { data, error } = await supabase
    .from('probe_logs')
    .select('*')
    .eq('probe_id', probeId)
    .order('execution_time', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function createProbeLog(log: Partial<ProbeLog>): Promise<ProbeLog> {
  const { data, error } = await supabase
    .from('probe_logs')
    .insert([log])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchProbeStats(probeId: string, daysBack = 7): Promise<ProbeStats> {
  const { data, error } = await supabase
    .rpc('get_probe_anomaly_stats', {
      probe_uuid: probeId,
      days_back: daysBack,
    });

  if (error) throw error;
  return data?.[0] || {
    total_runs: 0,
    anomaly_runs: 0,
    anomaly_rate: 0,
    avg_execution_ms: 0,
  };
}

export async function fetchProbeRuns(probeId?: string, limit = 50): Promise<ProbeRun[]> {
  let query = supabase
    .from('probe_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit);

  if (probeId) query = query.eq('probe_id', probeId);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchAllProbeRuns(limit = 200): Promise<ProbeRun[]> {
  const { data, error } = await supabase
    .from('probe_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function fetchProbeExceptions(filters?: {
  status?: ExceptionStatus;
  probeId?: string;
  limit?: number;
}): Promise<ProbeException[]> {
  let query = supabase
    .from('probe_exceptions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(filters?.limit || 100);

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.probeId) query = query.eq('probe_id', filters.probeId);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function updateExceptionStatus(
  id: string,
  status: ExceptionStatus,
  notes?: string,
): Promise<void> {
  const updates: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (notes !== undefined) updates.notes = notes;
  if (status === 'REMEDIED' || status === 'FALSE_POSITIVE') {
    updates.resolved_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('probe_exceptions')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export function buildSeismographData(runs: ProbeRun[]): SeismographPoint[] {
  const bucketMap = new Map<string, { exceptions: number; passes: number }>();

  const now = new Date();
  for (let h = 23; h >= 0; h--) {
    const t = new Date(now.getTime() - h * 3600000);
    const key = `${t.getHours().toString().padStart(2, '0')}:00`;
    bucketMap.set(key, { exceptions: 0, passes: 0 });
  }

  for (const run of runs) {
    const d = new Date(run.started_at);
    const key = `${d.getHours().toString().padStart(2, '0')}:00`;
    const bucket = bucketMap.get(key);
    if (bucket) {
      if (run.status === 'FAIL') bucket.exceptions += run.items_found;
      else bucket.passes++;
    }
  }

  return Array.from(bucketMap.entries()).map(([time, vals]) => ({
    time,
    label: time,
    exceptions: vals.exceptions,
    passes: vals.passes,
  }));
}

export async function simulateProbeExecution(probe: Probe): Promise<ProbeLog> {
  const startTime = Date.now();

  let resultData: any = {};
  let isAnomaly = false;
  let anomalyCount = 0;
  let errorMessage: string | undefined;

  try {
    if (probe.query_type === 'SQL') {
      const mockResults = Math.floor(Math.random() * 20);
      resultData = {
        query: probe.query_payload,
        rows_returned: mockResults,
        sample_data: Array.from({ length: Math.min(mockResults, 5) }, (_, i) => ({
          id: i + 1,
          timestamp: new Date().toISOString(),
          value: Math.random() * 100,
        })),
      };
      anomalyCount = mockResults;
      isAnomaly = mockResults > probe.risk_threshold;
    } else if (probe.query_type === 'API') {
      const mockResponseTime = Math.floor(Math.random() * 500);
      resultData = {
        endpoint: probe.query_payload,
        status_code: 200,
        response_time_ms: mockResponseTime,
        data: {
          status: 'success',
          items_checked: Math.floor(Math.random() * 100),
          issues_found: Math.floor(Math.random() * 5),
        },
      };
      anomalyCount = resultData.data.issues_found;
      isAnomaly = anomalyCount > probe.risk_threshold;
    } else {
      resultData = {
        webhook: probe.query_payload,
        triggered: true,
        alerts_sent: Math.floor(Math.random() * 3),
      };
      anomalyCount = resultData.alerts_sent;
      isAnomaly = anomalyCount > probe.risk_threshold;
    }
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : 'Unknown error';
  }

  const executionDuration = Date.now() - startTime;

  const log: Partial<ProbeLog> = {
    probe_id: probe.id,
    execution_time: new Date().toISOString(),
    result_data: resultData,
    is_anomaly: isAnomaly,
    anomaly_count: anomalyCount,
    execution_duration_ms: executionDuration,
    error_message: errorMessage,
  };

  return createProbeLog(log);
}
