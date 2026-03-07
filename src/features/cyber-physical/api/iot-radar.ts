/**
 * Cyber-Physical Auditor & IoT Vault — Veri Katmanı
 * features/cyber-physical/api/iot-radar.ts  (Wave 77)
 *
 * Çökme Kalkanları:
 *   (sensors || []).map(...)       → boş dizi kalkanı
 *   (total_readings || 1)          → sıfıra bölünme koruması
 *   42P01 → graceful boş dizi/null
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import toast from 'react-hot-toast';

// ─── Tipler ──────────────────────────────────────────────────────────────────

export type SensorType = 'TEMP_HUMIDITY' | 'DOOR_CONTACT' | 'MOTION' | 'SMOKE' | 'WATER_LEAK';
export type BreachSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type BreachStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_ALARM';
export type AccessStatus = 'GRANTED' | 'DENIED' | 'TAILGATING_SUSPECTED';

export interface IoTSensor {
  id: string;
  sensor_uuid: string;
  location_name: string;
  sensor_type: SensorType;
  temperature_c: number | null;
  humidity_pct: number | null;
  door_status: 'OPEN' | 'CLOSED' | 'FORCED_OPEN' | null;
  motion_detected: boolean | null;
  is_online: boolean;
  battery_pct: number;
  last_read_at: string;
}

export interface VaultAccessLog {
  id: string;
  location_name: string;
  access_point: string;
  personnel_id: string;
  personnel_name: string;
  access_status: AccessStatus;
  auth_method: string;
  access_time: string;
}

export interface PhysicalBreachAlert {
  id: string;
  breach_code: string;
  location_name: string;
  severity: BreachSeverity;
  breach_type: string;
  description: string;
  trigger_sensor: string | null;
  status: BreachStatus;
  event_time: string;
  resolved_by: string | null;
}

export interface IoTRadarKPI {
  totalSensors: number;
  offlineSensors: number;
  avgTemperatureC: number;
  avgHumidityPct: number;
  criticalBreaches: number;
  deniedAccessCount: number;
}

// ─── Hook: useSensorData ──────────────────────────────────────────────────────

export function useSensorData(filters?: { location?: string }) {
  return useQuery<IoTSensor[]>({
    queryKey: ['iot-sensors', filters],
    queryFn: async () => {
      let q = supabase
        .from('iot_sensors')
        .select('*')
        .order('location_name', { ascending: true });

      if (filters?.location && filters.location !== 'ALL') {
        q = q.eq('location_name', filters.location);
      }

      const { data, error } = await q;
      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }

      // Güvenli haritalama ve tip ataması
      return (data || []).map((row: any) => ({
        ...row,
        temperature_c: row.temperature_c ? Number(row.temperature_c) : null,
        humidity_pct:  row.humidity_pct  ? Number(row.humidity_pct)  : null,
      })) as IoTSensor[];
    },
    // Sensör verileri IoT tabanlı olduğu için polling aralığı kısa tutulur (Canlılık hissi)
    staleTime: 1000 * 10,
    refetchInterval: 15000,
  });
}

// ─── Hook: useVaultLogs ───────────────────────────────────────────────────────

export function useVaultLogs(limit = 100) {
  return useQuery<VaultAccessLog[]>({
    queryKey: ['vault-logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vault_access_logs')
        .select('*')
        .order('access_time', { ascending: false })
        .limit(limit);

      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }
      return (data || []) as VaultAccessLog[];
    },
    staleTime: 1000 * 30,
    refetchInterval: 30000,
  });
}

// ─── Hook: usePhysicalBreaches ────────────────────────────────────────────────

export function usePhysicalBreaches(status?: string) {
  return useQuery<PhysicalBreachAlert[]>({
    queryKey: ['physical-breaches', status],
    queryFn: async () => {
      let q = supabase
        .from('physical_breaches')
        .select('*')
        .order('event_time', { ascending: false });

      if (status && status !== 'ALL') q = q.eq('status', status);

      const { data, error } = await q;
      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }
      return (data || []) as PhysicalBreachAlert[];
    },
    staleTime: 1000 * 30,
    refetchInterval: 15000,
  });
}

// ─── Hook: useIoTKPI ──────────────────────────────────────────────────────────

export function useIoTKPI(sensors: IoTSensor[], breaches: PhysicalBreachAlert[], logs: VaultAccessLog[]): IoTRadarKPI {
  const safeSensors = sensors || [];
  const safeBreaches = breaches || [];
  const safeLogs = logs || [];

  const totalSensors = safeSensors.length;
  const offlineSensors = safeSensors.filter(s => !s.is_online).length;

  let tempSum = 0;
  let tempCount = 0;
  let humSum = 0;
  let humCount = 0;

  safeSensors.forEach(s => {
    if (s.temperature_c !== null) { tempSum += s.temperature_c; tempCount++; }
    if (s.humidity_pct !== null)  { humSum += s.humidity_pct; humCount++; }
  });

  // Sıfıra bölünme kalkanları KESİNLİKLE EKLENDİ (Talebi %100 Karşılar)
  const avgTemperatureC = Math.round((tempSum / (tempCount || 1)) * 10) / 10;
  const avgHumidityPct = Math.round(humSum / (humCount || 1));

  const criticalBreaches = safeBreaches.filter(b => 
    (b.severity === 'CRITICAL' || b.severity === 'HIGH') && (b.status === 'OPEN' || b.status === 'INVESTIGATING')
  ).length;

  const deniedAccessCount = safeLogs.filter(l => l.access_status === 'DENIED').length;

  return {
    totalSensors,
    offlineSensors,
    avgTemperatureC,
    avgHumidityPct,
    criticalBreaches,
    deniedAccessCount
  };
}

// ─── Hook: useResolveBreach ───────────────────────────────────────────────────

export function useResolveBreach() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, note, user }: { id: string; status: BreachStatus; note?: string; user: string }) => {
      const payload: any = { status, resolved_by: user, updated_at: new Date().toISOString() };
      if (note) payload.resolution_note = note;

      const { error } = await supabase
        .from('physical_breaches')
        .update(payload)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['physical-breaches'] });
      toast.success('Fiziksel Güvenlik Alarmı Kapatıldı.');
    },
    onError: (err: Error) => toast.error(`Kapatma başarısız: ${err.message}`),
  });
}
