import { useState, useEffect } from 'react';
import { UniversalSeeder, SeedProgress } from '@/shared/lib/universal-seeder';
import { supabase } from '@/shared/api/supabase';

interface SystemInitState {
  isInitializing: boolean;
  isComplete: boolean;
  error: string | null;
  progress: string;
}

/**
 * Sistem başlatma flag'leri:
 *
 * 1. `skip_seed` (localStorage)  → E2E testleri / dev modunda manuel bypass.
 *    Playwright testleri bu flag'i page.evaluate() içinde set eder.
 *
 * 2. `VITE_SKIP_SEED=true` (env) → CI/CD ortamı için build-time bypass.
 *
 * 3. `sentinel_seeded_flag` (sessionStorage) → Oturum başına bir kez DB sorgusu.
 *    Sayfa yenilendiğinde (F5) sıfırlanan session içinde flag varsa anında complete.
 *    Sekme kapanınca otomatik temizlenir, böylece ilk açılış her zaman kontrol edilir.
 */
const SEEDED_SESSION_KEY = 'sentinel_seeded_flag';

function isInstantBypassActive(): boolean {
  // 1. E2E / dev bypass (localStorage — kalıcı, test sonrası temizlenmez)
  if (
    import.meta.env.VITE_SKIP_SEED === 'true' ||
    localStorage.getItem('skip_seed') === 'true'
  ) {
    return true;
  }

  // 2. Oturum cache'i (sessionStorage — sekme kapanınca otomatik silinir)
  if (sessionStorage.getItem(SEEDED_SESSION_KEY) === 'true') {
    return true;
  }

  return false;
}

function markSessionAsSeeded(): void {
  try {
    sessionStorage.setItem(SEEDED_SESSION_KEY, 'true');
  } catch {
    // Private mode veya storage dolu — sessizce geç
  }
}

export function useSystemInit() {
  const [state, setState] = useState<SystemInitState>({
    isInitializing: true,
    isComplete: false,
    error: null,
    progress: 'Veritabanı bağlantısı kontrol ediliyor...',
  });

  useEffect(() => {
    let isMounted = true;

    async function initializeSystem() {
      // ─── HIZLI BYPASS: Anında tamamlandı ─────────────────────────────────
      if (isInstantBypassActive()) {
        if (isMounted) {
          setState({ isInitializing: false, isComplete: true, error: null, progress: '' });
        }
        return;
      }

      try {
        if (isMounted) {
          setState((prev) => ({ ...prev, progress: 'Temel veri altyapısı kontrol ediliyor...' }));
        }

        // Sadece sayı sorgula — veri çekme
        const { count, error } = await supabase
          .from('audit_entities')
          .select('*', { count: 'exact', head: true });

        if (error && error.code !== '42P01') {
          throw error;
        }

        // DB'de veri var → oturum flag'ini set et, anında tamamla
        if (count && count > 0) {
          markSessionAsSeeded();
          if (isMounted) {
            setState({ isInitializing: false, isComplete: true, error: null, progress: '' });
          }
          return;
        }

        // İlk kez başlatma: seed çalıştır
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            progress: 'Sistem ilk defa başlatılıyor, ana tohum verileri yükleniyor...',
          }));
        }

        const seeder = new UniversalSeeder((progressEvents: SeedProgress[]) => {
          if (!isMounted) return;
          const current = progressEvents[progressEvents.length - 1];
          if (current) {
            setState((prev) => ({ ...prev, progress: current.message }));
          }
        });

        const result = await seeder.runFullSeed();

        if (!result.success) {
          throw new Error('Veri tohumlama edge function çalıştırılamadı.');
        }

        // Seed başarılı → oturum flag'ini set et
        markSessionAsSeeded();

        if (isMounted) {
          setState({ isInitializing: false, isComplete: true, error: null, progress: '' });
        }
      } catch (err: any) {
        console.error('System init error:', err);
        if (isMounted) {
          setState({
            isInitializing: false,
            isComplete: false,
            error: err.message || 'Sistem başlatılırken kritik bir veritabanı hatası oluştu.',
            progress: '',
          });
        }
      }
    }

    initializeSystem();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
