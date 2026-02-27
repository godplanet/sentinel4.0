import { useState } from 'react';
import { PageHeader } from '@/shared/ui';
import { PresidentDashboard, ManagerView } from '@/widgets/SoxDashboard';
import { ShieldCheck, Eye, FileSignature } from 'lucide-react';
import clsx from 'clsx';

type ViewMode = 'president' | 'manager';

export default function SoxPage() {
  const [view, setView] = useState<ViewMode>('president');

  return (
    <div className="space-y-6">
      <PageHeader
        title="SOX / ICFR Uyum Modulu"
        description="Yonetici beyanlari, kontrol etkinlik testleri ve Cryo-Chamber degismezlik kayitlari"
        icon={ShieldCheck}
      />

      <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
        <button
          onClick={() => setView('president')}
          className={clsx(
            'flex items-center gap-2 flex-1 justify-center px-4 py-2.5 rounded-md text-xs font-bold transition-all',
            view === 'president'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700',
          )}
        >
          <Eye size={14} />
          Baskan Gorunumu (Liquid Glass)
        </button>
        <button
          onClick={() => setView('manager')}
          className={clsx(
            'flex items-center gap-2 flex-1 justify-center px-4 py-2.5 rounded-md text-xs font-bold transition-all',
            view === 'manager'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700',
          )}
        >
          <FileSignature size={14} />
          Yonetici Beyani (Solid-State)
        </button>
      </div>

      {view === 'president' && <PresidentDashboard />}
      {view === 'manager' && <ManagerView />}
    </div>
  );
}
