import { useState } from 'react';
import clsx from 'clsx';
import { Zap, Wrench } from 'lucide-react';
import { PageHeader } from '@/shared/ui/PageHeader';
import { ChaosTestCard, FixItCard } from '@/widgets/ChaosLab';

type TabId = 'chaos' | 'fixit';

const TABS: Array<{ id: TabId; label: string; icon: typeof Zap }> = [
  { id: 'chaos', label: 'Kaos Denetimi', icon: Zap },
  { id: 'fixit', label: 'Aktif Iyilestirme (Fix-It)', icon: Wrench },
];

export default function ChaosLabPage() {
  const [tab, setTab] = useState<TabId>('chaos');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kaos Laboratuvari & Aktif Iyilestirme"
        description="Kontrol etkinligini sentetik saldirilarla test edin ve altyapi aciklarina aninda mudahale edin."
      />

      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all',
                tab === t.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              )}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'chaos' && <ChaosTestCard />}
      {tab === 'fixit' && <FixItCard />}
    </div>
  );
}
