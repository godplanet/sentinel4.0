import { useTalentPool } from '@/features/talent-os/api/queries';
import { AuditorDetailPanel } from '@/widgets/TalentOS/AuditorDetailPanel';
import { ResourcePoolGrid } from '@/widgets/TalentOS/ResourcePoolGrid';
import clsx from 'clsx';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function ResourcePoolView() {
 const { data: profiles = [], isLoading } = useTalentPool();
 const [selectedId, setSelectedId] = useState<string | null>(null);

 const selectedProfile = profiles.find((p) => p.id === selectedId) || null;

 if (isLoading) {
 return (
 <div className="flex items-center justify-center p-12">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
 </div>
 );
 }

 return (
 <div>
 <div className="mb-3">
 <h2 className="text-xl font-bold text-primary">Kaynak Havuzu</h2>
 <p className="text-sm text-slate-500 mt-1">
 Denetçilerin yetkinlik, kapasite ve yorgunluk durumlarına göre detaylı listesi.
 </p>
 </div>

 <div className="flex gap-4">
 <div className={clsx('flex-1 min-w-0', selectedProfile && 'hidden xl:block max-w-[60%]')}>
 <ResourcePoolGrid
 profiles={profiles}
 selectedId={selectedId}
 onSelect={(id) => setSelectedId(selectedId === id ? null : id)}
 />
 </div>
 <AnimatePresence>
 {selectedProfile && (
 <div className="w-full xl:w-[450px] flex-shrink-0">
 <AuditorDetailPanel
 profile={selectedProfile}
 onClose={() => setSelectedId(null)}
 />
 </div>
 )}
 </AnimatePresence>
 </div>
 </div>
 );
}
