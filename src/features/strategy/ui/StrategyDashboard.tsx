import { fetchAuditObjectivesSimple, fetchStrategicGoals } from '@/entities/strategy/api/goals';
import { useStrategyStore } from '@/entities/strategy/model/store';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import {
 Activity,
 FileText,
 LayoutGrid, List,
 Loader2,
 PieChart,
 Shield,
 Target
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { AddStrategyItemModal } from './AddStrategyItemModal';
import { AlignmentMap } from './AlignmentMap';
import { CorporateGoalList } from './CorporateGoalList';

export const StrategyDashboard = () => {
 const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
 const [modalType, setModalType] = useState<'goal' | 'objective' | null>(null);

 const { goals, objectives, setGoals, setObjectives } = useStrategyStore();

 const { data, isLoading } = useQuery({
 queryKey: ['strategy-dashboard'],
 queryFn: async () => {
 const [goalsData, objectivesData] = await Promise.all([
 fetchStrategicGoals(),
 fetchAuditObjectivesSimple(),
 ]);
 return { goals: goalsData, objectives: objectivesData };
 },
 });

 useEffect(() => {
 if (data) {
 setGoals(data.goals);
 setObjectives(data.objectives);
 }
 }, [data, setGoals, setObjectives]);

 const safeGoals = Array.isArray(goals) ? goals : [];
 const safeObjectives = Array.isArray(objectives) ? objectives : [];
 const avgProgress = safeGoals.length > 0
 ? Math.round((safeGoals || []).reduce((acc, curr) => acc + (curr?.progress || 0), 0) / safeGoals.length)
 : 0;

 if (isLoading) {
 return (
 <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
 <Loader2 size={32} className="animate-spin" />
 <p className="text-sm font-medium">Stratejik hedefler yükleniyor...</p>
 </div>
 );
 }

 return (
 <div className="flex flex-col gap-5 w-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
 
 {/* 1. ÜST BİLGİ KARTLARI */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {[
   { label: 'Toplam Hedef', value: safeGoals.length, icon: Target, bg: 'bg-indigo-100', color: 'text-indigo-600' },
   { label: 'Denetim Kapsamı', value: safeObjectives.length, icon: Shield, bg: 'bg-emerald-100', color: 'text-emerald-600' },
   { label: 'Ort. İlerleme', value: `%${avgProgress}`, icon: Activity, bg: 'bg-blue-100', color: 'text-blue-600' },
   { label: 'Risk Dağılımı', value: null, icon: PieChart, bg: 'bg-amber-100', color: 'text-amber-600' },
 ].map(({ label, value, icon: Icon, bg, color }) => (
   <div key={label} className="bg-surface/60 backdrop-blur-md px-3 py-2.5 rounded-xl border border-white/50 shadow-sm flex items-center gap-3">
     <div className={clsx('p-1.5 rounded-lg flex-shrink-0', bg)}>
       <Icon size={16} className={color} />
     </div>
     <div className="min-w-0">
       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-tight">{label}</p>
       {value !== null ? (
         <h3 className="text-lg font-black text-slate-800 leading-tight">{value}</h3>
       ) : (
         <div className="flex gap-1 mt-0.5">
           <div className="h-1.5 w-6 bg-rose-400 rounded-full" title="Yüksek" />
           <div className="h-1.5 w-9 bg-amber-400 rounded-full" title="Orta" />
           <div className="h-1.5 w-5 bg-emerald-400 rounded-full" title="Düşük" />
         </div>
       )}
     </div>
   </div>
 ))}
 </div>

 {/* 2. KONTROL PANELİ */}
 <div className="flex flex-wrap items-center gap-2 bg-surface/40 px-3 py-2 rounded-xl border border-white/60 backdrop-blur-sm">
 {/* View Switcher */}
 <div className="flex bg-slate-100/80 p-0.5 rounded-lg">
 <button
   onClick={() => setViewMode('map')}
   className={clsx(
     'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all',
     viewMode === 'map' ? 'bg-surface text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
   )}
 >
   <LayoutGrid size={13} />Hizalama Haritası
 </button>
 <button
   onClick={() => setViewMode('list')}
   className={clsx(
     'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all',
     viewMode === 'list' ? 'bg-surface text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
   )}
 >
   <List size={13} />Hedef Listesi
 </button>
 </div>

 {/* Action Buttons */}
 <div className="flex gap-2 ml-auto">
 <button
   onClick={() => setModalType('goal')}
   className="flex items-center gap-1.5 px-3.5 py-1.5 bg-surface border border-slate-200 shadow-sm rounded-lg text-xs font-bold text-slate-700 hover:border-indigo-200 hover:text-indigo-600 transition-all active:scale-95"
 >
   <Target size={13} className="text-indigo-500" />Yeni Banka Hedefi
 </button>
 <button
   onClick={() => setModalType('objective')}
   className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 shadow-sm shadow-indigo-200 rounded-lg text-xs font-bold text-white hover:bg-indigo-700 transition-all active:scale-95"
 >
   <Shield size={13} />Yeni Denetim Hedefi
 </button>
 </div>
 </div>

 {/* 3. ANA İÇERİK ALANI */}
 <div className="min-h-[600px] transition-all duration-500">
 {safeGoals.length === 0 && safeObjectives.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed border-slate-200 bg-canvas/50">
 <FileText size={48} className="text-slate-300 mb-4" />
 <p className="text-slate-600 font-semibold">Kayıt bulunamadı.</p>
 <p className="text-sm text-slate-500 mt-1">Banka hedefi veya denetim hedefi ekleyerek başlayın.</p>
 </div>
 ) : viewMode === 'map' ? (
 <div className="bg-surface/40 backdrop-blur-xl border border-white/50 p-5 rounded-3xl shadow-sm overflow-x-auto">
 <AlignmentMap />
 </div>
 ) : (
 <CorporateGoalList />
 )}
 </div>

 {/* MODAL */}
 <AddStrategyItemModal 
 isOpen={!!modalType} 
 type={modalType || 'goal'} 
 onClose={() => setModalType(null)} 
 />
 </div>
 );
};