import React from 'react';
import { cn } from '@/shared/utils/cn';
import { CheckCircle2, CircleDashed, Clock, FileUp, ListChecks } from 'lucide-react';

interface Phase5Props {
  finding: any;
  onUpdate: (field: string, value: any) => void;
  isReadOnly?: boolean;
}

export const Phase5Followup: React.FC<Phase5Props> = ({
  finding,
  onUpdate,
  isReadOnly = false
}) => {
  const actions = finding?.action_plans || [];
  
  // SIFIR ÇÖKME (ZERO-CRASH) MATEMATİĞİ: division by zero koruması
  const completedActions = actions.filter((a: any) => a.status === 'COMPLETED').length;
  const progressPct = Math.round((completedActions * 100) / (actions.length || 1));

  return (
    <div className="space-y-4">
      <div className="bg-surface/70 backdrop-blur-lg border border-slate-200/50 rounded-2xl p-4 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
            <circle 
              cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" 
              strokeDasharray={28 * 2 * Math.PI} 
              strokeDashoffset={28 * 2 * Math.PI - (progressPct / 100) * 28 * 2 * Math.PI} 
              className={progressPct === 100 ? "text-emerald-500 transition-all duration-1000" : "text-indigo-500 transition-all duration-1000"} 
            />
          </svg>
          <span className="absolute text-sm font-bold text-slate-800">{progressPct}%</span>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ListChecks size={20} className="text-indigo-600" /> Aksiyon Takibi
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Toplam <strong>{actions.length}</strong> aksiyondan <strong>{completedActions}</strong> kadarı tamamlandı.
          </p>
        </div>
        {progressPct === 100 && (
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 shadow-sm animate-in fade-in zoom-in">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span className="text-emerald-800 text-xs font-bold uppercase tracking-wider">Bulgu Kapatılabilir</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {actions.length === 0 ? (
          <div className="p-5 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-surface/30">
            Henüz bir aksiyon planı bulunmuyor.
          </div>
        ) : (
          actions.map((action: any, idx: number) => {
            const isCompleted = action.status === 'COMPLETED';
            return (
              <div key={action.id || idx} className="bg-surface rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center gap-4 transition-all hover:shadow-md">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {isCompleted ? <CheckCircle2 size={16} className="text-emerald-500" /> : <CircleDashed size={16} className="text-amber-500" />}
                    <h3 className={cn("text-sm font-bold", isCompleted ? "text-slate-500 line-through" : "text-slate-800")}>
                      {action.title || 'İsimsiz Aksiyon'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 pl-6 leading-relaxed line-clamp-2">
                    {action.description || 'Açıklama girilmemiş.'}
                  </p>
                  <div className="flex items-center gap-4 pl-6 mt-3 text-[10px] uppercase font-bold text-slate-400">
                    <span className="flex items-center gap-1"><Clock size={12}/> Vade: {action.due_date || '-'}</span>
                    <span>Sorumlu: {action.owner_name || 'Atanmadı'}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-end border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                  {!isReadOnly ? (
                    <button 
                      onClick={() => {
                        const newActions = actions.map((a: any) => a.id === action.id ? { ...a, status: 'COMPLETED' } : a);
                        onUpdate('action_plans', newActions);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors border border-indigo-200/50"
                    >
                      <FileUp size={14} /> Kanıt Yükle & Kapat
                    </button>
                  ) : (
                    <span className={cn("px-3 py-1 rounded-lg text-xs font-bold", isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                      {isCompleted ? 'TAMAMLANDI' : 'DEVAM EDİYOR'}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
