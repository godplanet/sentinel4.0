import { useEffect, useState } from 'react';
import { supabase } from '@/shared/api/supabase';
import { forceReseedViaEdge } from '@/shared/lib/universal-seeder';

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
    progress: 'Sistem kontrol ediliyor...'
  });

  useEffect(() => {
    let mounted = true;

    const safeComplete = () => {
      if (mounted) {
        setState({ isInitializing: false, isComplete: true, error: null, progress: '' });
      }
    };

    const timeout = setTimeout(() => {
      console.warn('[SystemInit] Timeout reached – forcing app render');
      safeComplete();
    }, 12000);

    const checkAndInit = async () => {
      try {
        console.log('[SystemInit] Checking database state...');

        const { count, error: checkError } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true });

        if (!mounted) return;

        const isEmpty = checkError || count === 0;
        console.log('[SystemInit] Database empty?', isEmpty, 'User count:', count);

        if (isEmpty) {
          setState({
            isInitializing: true,
            isComplete: false,
            error: null,
            progress: 'Sistem Onarılıyor ve Veriler Yükleniyor...'
          });

          if (!mounted) return;
          setState(prev => ({ ...prev, progress: 'Veritabanı Temizleniyor (Nuclear Wipe)...' }));

          await new Promise(resolve => setTimeout(resolve, 500));

          if (!mounted) return;
          setState(prev => ({ ...prev, progress: 'Sentinel Katılım Bankası Yükleniyor...' }));

          await forceReseedViaEdge();

          if (!mounted) return;
          console.log('[SystemInit] Force reseed complete!');
        } else {
          console.log('[SystemInit] Database already populated, skipping seed');
        }

        clearTimeout(timeout);
        safeComplete();
      } catch (error) {
        console.error('[SystemInit] FATAL ERROR:', error);
        clearTimeout(timeout);
        if (!mounted) return;
        setState({
          isInitializing: false,
          isComplete: true,
          error: error instanceof Error ? error.message : 'Unknown error',
          progress: ''
        });
      }
    };

    checkAndInit();

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, []);

  return state;
}
