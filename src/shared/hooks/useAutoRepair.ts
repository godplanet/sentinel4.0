/**
 * AUTO-REPAIR HOOK — KALICI DB MİMARİSİ (Wave 41+)
 *
 * Edge Function üzerinden auto-repair/reseed mantığı KALDIRILDI.
 * Kalıcı DB mimarisinde veritabanı her zaman hazır kabul edilir.
 * Seed yalnızca `npx supabase db reset --linked` ile yapılır.
 */

export interface AutoRepairState {
  isChecking: boolean;
  isRepairing: boolean;
  needsRepair: boolean;
  error: string | null;
}

export function useAutoRepair(): AutoRepairState {
  // Kalıcı DB mimarisinde repair gerekmez — her zaman hazır.
  return {
    isChecking: false,
    isRepairing: false,
    needsRepair: false,
    error: null,
  };
}
