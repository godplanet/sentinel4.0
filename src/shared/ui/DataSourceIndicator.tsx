import { useState, useEffect } from 'react';
import { Database, Wifi, WifiOff, HardDrive } from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '@/shared/api/supabase';

type DataSource = 'supabase' | 'localStorage' | 'checking';

export function DataSourceIndicator({ compact = false }: { compact?: boolean }) {
  const [source, setSource] = useState<DataSource>('checking');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const { error } = await supabase.from('methodology_configs').select('id').limit(1);
      setSource(error ? 'localStorage' : 'supabase');
    } catch {
      setSource('localStorage');
    }
  };

  if (source === 'checking') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 text-slate-400">
        <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
        {!compact && <span className="text-[10px] font-medium">Baglanti kontrol ediliyor...</span>}
      </div>
    );
  }

  const isSupabase = source === 'supabase';

  return (
    <div className={clsx(
      'flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all',
      isSupabase ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
    )}>
      <div className={clsx(
        'w-2 h-2 rounded-full',
        isSupabase ? 'bg-green-500' : 'bg-amber-500'
      )} />
      {isSupabase ? <Database size={12} /> : <HardDrive size={12} />}
      {!compact && (
        <span className="text-[10px] font-semibold">
          {isSupabase ? 'Supabase' : 'localStorage'}
        </span>
      )}
    </div>
  );
}
