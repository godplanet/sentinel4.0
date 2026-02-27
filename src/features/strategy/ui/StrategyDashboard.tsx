import { useState } from 'react';
import { useStrategyStore } from '@/entities/strategy/model/store';
import { AlignmentMap } from './AlignmentMap';
import { CorporateGoalList } from './CorporateGoalList';
import { AddStrategyItemModal } from './AddStrategyItemModal';
import {
  Target, Shield, LayoutGrid, List,
  Activity, PieChart
} from 'lucide-react';
import clsx from 'clsx';

export const StrategyDashboard = () => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [modalType, setModalType] = useState<'goal' | 'objective' | null>(null);

  const { goals, objectives } = useStrategyStore();
  const safeGoals = Array.isArray(goals) ? goals : [];
  const safeObjectives = Array.isArray(objectives) ? objectives : [];
  const avgProgress = safeGoals.length > 0
    ? Math.round(safeGoals.reduce((acc, curr) => acc + (curr?.progress || 0), 0) / safeGoals.length)
    : 0;

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* 1. ÜST BİLGİ KARTLARI (Sentinel v2 Tarzı Özet) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <Target size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Toplam Hedef</p>
            <h3 className="text-2xl font-black text-slate-800">{safeGoals.length}</h3>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Denetim Kapsamı</p>
            <h3 className="text-2xl font-black text-slate-800">{safeObjectives.length}</h3>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Ort. İlerleme</p>
            <h3 className="text-2xl font-black text-slate-800">%{avgProgress}</h3>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <PieChart size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Risk Dağılımı</p>
            <div className="flex gap-1 mt-1">
               <div className="h-2 w-8 bg-rose-400 rounded-full" title="Yüksek" />
               <div className="h-2 w-12 bg-amber-400 rounded-full" title="Orta" />
               <div className="h-2 w-6 bg-emerald-400 rounded-full" title="Düşük" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. KONTROL PANELİ (View Switcher & Actions) */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/40 p-2 rounded-2xl border border-white/60 backdrop-blur-sm">
        
        {/* View Switcher */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl w-full sm:w-auto">
          <button 
            onClick={() => setViewMode('map')}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all flex-1 sm:flex-none justify-center",
              viewMode === 'map' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <LayoutGrid size={16} />
            Hizalama Haritası
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all flex-1 sm:flex-none justify-center",
              viewMode === 'list' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <List size={16} />
            Hedef Listesi
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setModalType('goal')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition-all active:scale-95"
          >
            <Target size={18} className="text-indigo-500" />
            <span className="hidden sm:inline">Yeni</span> Banka Hedefi
            <span className="sm:hidden">Hedef</span>
          </button>
          <button 
            onClick={() => setModalType('objective')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 shadow-lg shadow-indigo-200 rounded-xl text-sm font-bold text-white hover:bg-indigo-700 hover:shadow-indigo-300 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          >
            <Shield size={18} />
            <span className="hidden sm:inline">Yeni</span> Denetim Hedefi
            <span className="sm:hidden">D. Hedefi</span>
          </button>
        </div>
      </div>

      {/* 3. ANA İÇERİK ALANI */}
      <div className="min-h-[600px] transition-all duration-500">
         {viewMode === 'map' ? (
           <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-sm overflow-x-auto">
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