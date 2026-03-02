/**
 * Sistem Sağlığı — Gerçek zamanlı Supabase teşhis API'si.
 * Mock latency yok; tüm ölçümler canlı isteklerle yapılır.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

export type DbStatus = 'Operational' | 'Degraded' | 'Down';

export interface DiagnosticResult {
  status: DbStatus;
  latencyMs: number;
  timestamp: string;
  error?: string;
}

export interface SystemDiagnosticsResult extends DiagnosticResult {
  findingCount: number;
  authOk: boolean;
}

const DIAGNOSTICS_QUERY_KEY = ['system-diagnostics'] as const;

/** Veritabanı gecikmesini ölçer: audit_entities'e select id limit 1 atar, süreyi ms döner. */
export async function measureDatabaseLatency(): Promise<number> {
  const start = performance.now();
  const { error } = await supabase.from('audit_entities').select('id').limit(1);
  const latencyMs = Math.round(performance.now() - start);
  if (error) throw error;
  return latencyMs;
}

/** Oturum (Auth) modülünün ayakta olup olmadığını kontrol eder. */
export async function checkAuthSession(): Promise<boolean> {
  const { data, error } = await supabase.auth.getSession();
  if (error) return false;
  return Boolean(data?.session !== undefined || data?.session === null);
}

/** Sistemdeki toplam bulgu sayısını döner (canlı veri kanıtı). */
export async function getFindingCount(): Promise<number> {
  const { count, error } = await supabase
    .from('audit_findings')
    .select('id', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}

function latencyToStatus(latencyMs: number): DbStatus {
  if (latencyMs >= 1000) return 'Down';
  if (latencyMs >= 500) return 'Degraded';
  return 'Operational';
}

/** Tüm teşhisleri tek seferde çalıştırır; hata durumunda sistem çökmez, sonuçta error döner. */
export async function fetchSystemDiagnostics(): Promise<SystemDiagnosticsResult> {
  const timestamp = new Date().toISOString();

  try {
    const [latencyMs, authOk, findingCount] = await Promise.all([
      measureDatabaseLatency(),
      checkAuthSession(),
      getFindingCount(),
    ]);

    const status = latencyToStatus(latencyMs);

    return {
      status,
      latencyMs,
      timestamp,
      findingCount,
      authOk,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Veritabanı bağlantı hatası';
    return {
      status: 'Down',
      latencyMs: -1,
      timestamp,
      findingCount: 0,
      authOk: false,
      error: message,
    };
  }
}

export function useSystemDiagnostics(refetchIntervalMs = 15000) {
  return useQuery({
    queryKey: DIAGNOSTICS_QUERY_KEY,
    queryFn: fetchSystemDiagnostics,
    refetchInterval: refetchIntervalMs,
    staleTime: 5000,
  });
}
