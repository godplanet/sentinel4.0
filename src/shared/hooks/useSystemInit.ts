/**
 * Sistem Başlatma Hook'u — Kalıcı DB (Persistent DB) Mimarisi
 *
 * Wave 41+ itibarıyla frontend'in veritabanı tohumlama sorumluluğu KALDIRILDI.
 * Seed işlemleri yalnızca `supabase/seed.sql` + `npx supabase db reset --linked`
 * aracılığıyla sunucu tarafında yapılmaktadır.
 *
 * Bu hook artık sadece auth/state yüklemelerini tamamlayarak anında
 * `isComplete: true` döndürür. Hiçbir DB kontrolü veya Edge Function çağrısı
 * yapılmaz.
 */

export interface SystemInitState {
  isInitializing: boolean;
  isComplete: boolean;
  error: string | null;
  progress: string;
}

export function useSystemInit(): SystemInitState {
  // Kalıcı DB mimarisinde init anında tamamlanmış sayılır.
  return {
    isInitializing: false,
    isComplete: true,
    error: null,
    progress: '',
  };
}
