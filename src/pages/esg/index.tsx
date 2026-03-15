import { PageHeader } from '@/shared/ui';
import { DataEntryView, PlanetPulse } from '@/widgets/EsgDashboard';
import clsx from 'clsx';
import { Eye, FileInput, Globe } from 'lucide-react';
import { useState } from 'react';

type ViewMode = 'pulse' | 'entry';

export default function EsgPage() {
 const [view, setView] = useState<ViewMode>('pulse');

 return (
 <div className="space-y-4">
 <PageHeader
 title="ESG & Surdurulebilirlik"
 description="Cevre, sosyal ve yonetisim metrikleri - Green Skeptic AI ile greenwashing koruması"
 icon={Globe}
 />

 <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
 <button
 onClick={() => setView('pulse')}
 className={clsx(
 'flex items-center gap-2 flex-1 justify-center px-4 py-2.5 rounded-md text-xs font-bold transition-all',
 view === 'pulse'
 ? 'bg-surface text-slate-800 shadow-sm'
 : 'text-slate-500 hover:text-slate-700',
 )}
 >
 <Eye size={14} />
 Planet Pulse (Liquid Glass)
 </button>
 <button
 onClick={() => setView('entry')}
 className={clsx(
 'flex items-center gap-2 flex-1 justify-center px-4 py-2.5 rounded-md text-xs font-bold transition-all',
 view === 'entry'
 ? 'bg-surface text-slate-800 shadow-sm'
 : 'text-slate-500 hover:text-slate-700',
 )}
 >
 <FileInput size={14} />
 Veri Girisi (Solid-State)
 </button>
 </div>

 {view === 'pulse' && <PlanetPulse />}
 {view === 'entry' && <DataEntryView />}
 </div>
 );
}
