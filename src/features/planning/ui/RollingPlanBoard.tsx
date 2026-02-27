import { Lock, Database, Info } from 'lucide-react';
import { usePlanningStore } from '@/entities/planning/model/store';
import { PlanCard } from './PlanCard';

export function RollingPlanBoard() {
  const backlog = usePlanningStore((s) => s.backlog);
  const qSprint = usePlanningStore((s) => s.qSprint);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 9-Month Dynamic Backlog */}
      <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200/60 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
              <Database size={15} className="text-slate-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">9-Month Dynamic Pool</h2>
              <p className="text-xs text-slate-500 font-medium">Tentative Backlog</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-full px-2.5 py-1 shadow-sm">
            {backlog.length} görev
          </span>
        </div>

        <div className="flex flex-col gap-3 min-h-[320px]">
          {backlog.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-14 gap-2.5 text-center bg-white rounded-xl border border-dashed border-slate-200">
              <Info size={28} className="text-slate-300" />
              <p className="text-sm text-slate-400 font-medium">Havuz boş</p>
              <p className="text-xs text-slate-400 max-w-[180px]">Risk evreninden düğüm ekleyerek havuzu doldurun.</p>
            </div>
          ) : (
            backlog.map((item) => (
              <PlanCard key={item.id} engagement={item} isBacklog />
            ))
          )}
        </div>
      </div>

      {/* 3-Month Locked Q-Sprint */}
      <div className="bg-indigo-50/30 p-6 rounded-2xl border border-indigo-100 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 shadow-md shadow-indigo-200 flex items-center justify-center">
              <Lock size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-indigo-900">3-Month Locked Sprint</h2>
              <p className="text-xs text-indigo-500 font-medium">Q-Sprint — aktif çeyrek</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 border border-indigo-200 rounded-full px-2.5 py-1">
            {qSprint.length} görev
          </span>
        </div>

        <div className="flex flex-col gap-3 min-h-[320px]">
          {qSprint.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-14 gap-2.5 text-center bg-white/60 rounded-xl border border-dashed border-indigo-200">
              <Lock size={28} className="text-indigo-200" />
              <p className="text-sm text-indigo-400 font-medium">Sprint boş</p>
              <p className="text-xs text-indigo-400 max-w-[180px]">Havuzdan görev çekerek sprint'i doldurun.</p>
            </div>
          ) : (
            qSprint.map((item) => (
              <PlanCard key={item.id} engagement={item} isBacklog={false} />
            ))
          )}
        </div>

        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
          <Lock size={12} className="text-amber-500 mt-0.5 shrink-0" />
          <span>
            Q-Sprint kilitli çeyrektir. Değişiklikler Denetim Komitesi onayı gerektirir.
          </span>
        </div>
      </div>
    </div>
  );
}
