import { useState, useEffect } from 'react';
import { UniversalSeeder, SeedProgress } from '@/shared/lib/universal-seeder';
import { supabase } from '@/shared/api/supabase'; // Assuming standard Supabase client path

interface SystemInitState {
  isInitializing: boolean;
  isComplete: boolean;
  error: string | null;
  progress: string;
}

export function useSystemInit() {
  const [state, setState] = useState<SystemInitState>({
    isInitializing: true,
    isComplete: false,
    error: null,
    progress: 'Veritabanı bağlantısı kontrol ediliyor...'
  });

  useEffect(() => {
    let isMounted = true;

    async function initializeSystem() {
      // 1. Bypass check for local development/testing to skip slow checks
      if (import.meta.env.VITE_SKIP_SEED === 'true' || localStorage.getItem('skip_seed') === 'true') {
        if (isMounted) {
          setState({ isInitializing: false, isComplete: true, error: null, progress: '' });
        }
        return;
      }

      try {
        if (isMounted) setState(prev => ({ ...prev, progress: 'Temel veri altyapısı kontrol ediliyor...' }));
        
        // 2. We use a quick fetch to see if core records exist. 
        // We'll check `audit_entities` or `user_profiles` as a proxy for fully seeded system.
        const { count, error } = await supabase
          .from('audit_entities')
          .select('*', { count: 'exact', head: true });

        // 3. Silently continue if there's any network or permission error — 
        //    the app should NOT crash on init. Let the actual pages handle data errors.
        if (error) {
          console.warn('useSystemInit: Could not check DB state, continuing anyway.', error.message);
          if (isMounted) {
            setState({ isInitializing: false, isComplete: true, error: null, progress: '' });
          }
          return;
        }

        // 4. If DB has data (count > 0), mark complete immediately.
        //    This is the NORMAL path for the online Supabase instance (seeded via seed.sql).
        if (count && count > 0) {
          if (isMounted) {
            setState({ isInitializing: false, isComplete: true, error: null, progress: '' });
          }
          return;
        }

        // 5. Data is missing — attempt edge function seed but never crash the app if it fails.
        if (isMounted) setState(prev => ({ ...prev, progress: 'Sistem ilk defa başlatılıyor, demo verileri yükleniyor...' }));
        
        try {
          const seeder = new UniversalSeeder((progressEvents: SeedProgress[]) => {
            if (!isMounted) return;
            const current = progressEvents[progressEvents.length - 1];
            if (current) {
               setState(prev => ({ ...prev, progress: current.message }));
            }
          });

          const result = await seeder.runFullSeed();

          if (!result.success) {
            // Log the error but DO NOT block the UI — seed failures shouldn't crash the app.
            console.warn('useSystemInit: Seed edge function failed, continuing without seed.', result.error);
          }
        } catch (seedErr) {
          // Edge function might be unavailable — log and continue gracefully.
          console.warn('useSystemInit: Seed edge function unreachable, continuing.', seedErr);
        }

        // 6. Always mark complete after seed attempt (success or fail).
        if (isMounted) {
           setState({ isInitializing: false, isComplete: true, error: null, progress: '' });
        }

      } catch (err: any) {
        // Only log unexpected errors, never show them as fatal.
        console.error('System init unexpected error:', err);
        if (isMounted) {
          // Still complete — let individual pages show their own errors.
          setState({ isInitializing: false, isComplete: true, error: null, progress: '' });
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
