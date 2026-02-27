import { useStrategyStore } from '@/entities/strategy/model/store';
import { CorporateGoalCard } from './CorporateGoalCard';
import { AuditObjectiveCard } from './AuditObjectiveCard';
import { GitMerge, FileText } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

// SVG Çizim Mantığı için Yardımcı Bileşen
const ConnectionLines = ({ activeGoalId, goals, objectives }: { activeGoalId: string | null, goals: any[], objectives: any[] }) => {
  if (!activeGoalId) return null;

  const activeGoalIndex = goals.findIndex(g => g.id === activeGoalId);
  const activeGoal = goals[activeGoalIndex];
  
  if (!activeGoal || activeGoalIndex === -1) return null;

  // Hangi hedefler bağlı?
  const connectedIndices = objectives
    .map((obj, idx) => activeGoal.linkedAuditObjectives.includes(obj.id) ? idx : -1)
    .filter(idx => idx !== -1);

  if (connectedIndices.length === 0) return null;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ minHeight: '600px' }}>
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#6366f1" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {connectedIndices.map(objIdx => {
        // Basit Y koordinat hesaplaması (Kart yüksekliği ~200px + boşluk varsayımı)
        const startY = 120 + (activeGoalIndex * 220); 
        const endY = 120 + (objIdx * 140);
        
        return (
          <path
            key={objIdx}
            d={`M 350 ${startY} C 500 ${startY}, 500 ${endY}, 650 ${endY}`} 
            // M=Start (Sol kolon sonu), C=Bezier Control Points, End (Sağ kolon başı)
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            className="animate-draw-line"
            strokeDasharray="10"
          />
        );
      })}
    </svg>
  );
};

export const AlignmentMap = () => {
  const { goals, objectives } = useStrategyStore();
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);

  // Mock Engagement Data (Normalde Planning Store'dan gelir)
  const mockEngagements = [
    { title: 'Şube Operasyonları Denetimi', type: 'Süreç', status: 'Planlandı' },
    { title: 'Kredi Tahsis Süreci', type: 'Risk', status: 'Devam Ediyor' },
    { title: 'Bilgi Güvenliği Sızma Testi', type: 'IT', status: 'Tamamlandı' },
    { title: 'Alternatif Dağıtım Kanalları', type: 'Süreç', status: 'Planlandı' },
  ];

  return (
    <div className="w-full relative">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <GitMerge size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">360° Stratejik Uyum Matrisi</h3>
            <p className="text-xs text-slate-500">Fare ile hedeflerin üzerine gelerek bağlantıları keşfedin.</p>
          </div>
        </div>
      </div>

      <div className="relative grid grid-cols-12 gap-8 min-w-[1200px] min-h-[600px]">
        
        {/* SVG BACKGROUND LAYER */}
        <div className="absolute inset-0 pointer-events-none">
           {/* Bu katman, CSS grid ile tam oturması için manuel ayar gerektirebilir. 
               Şimdilik görsel etki için basit bir overlay kullanıyoruz. */}
           <ConnectionLines activeGoalId={activeGoalId} goals={goals} objectives={objectives} />
        </div>

        {/* KOLON 1: KURUMSAL HEDEFLER */}
        <div className="col-span-4 space-y-6 z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded border border-slate-200">KAYNAK</span>
            <h4 className="text-sm font-bold text-slate-700">Kurumsal Stratejik Hedefler</h4>
          </div>
          <div className="space-y-6">
            {goals.map((goal) => (
              <div
                key={goal.id} 
                onMouseEnter={() => setActiveGoalId(goal.id)}
                onMouseLeave={() => setActiveGoalId(null)}
                className={clsx(
                  "cursor-pointer transition-all duration-300 transform relative", 
                  activeGoalId && activeGoalId !== goal.id ? "opacity-30 scale-95 blur-[1px]" : "hover:scale-105 z-20"
                )}
              >
                <CorporateGoalCard goal={goal} />
                
                {/* Active Indicator Dot */}
                {activeGoalId === goal.id && (
                  <div className="absolute -right-3 top-1/2 w-4 h-4 bg-indigo-500 rounded-full border-4 border-white shadow-lg animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* KOLON 2: İÇ DENETİM HEDEFLERİ */}
        <div className="col-span-4 space-y-4 z-10 mt-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded border border-indigo-100">KÖPRÜ</span>
            <h4 className="text-sm font-bold text-slate-700">İç Denetim Hedefleri</h4>
          </div>
          <div className="space-y-4">
            {objectives.map((obj) => {
               const isConnected = activeGoalId 
                 ? goals.find(g => g.id === activeGoalId)?.linkedAuditObjectives.includes(obj.id)
                 : false;

               return (
                 <div 
                   key={obj.id}
                   className={clsx(
                     "transition-all duration-500 ease-out relative",
                     isConnected 
                       ? "scale-105 shadow-[0_0_30px_rgba(99,102,241,0.2)] ring-1 ring-indigo-500 rounded-xl z-20 bg-white" 
                       : activeGoalId ? "opacity-30 translate-x-4 blur-[1px]" : ""
                   )}
                 >
                   {isConnected && (
                      <div className="absolute -left-3 top-1/2 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white" />
                   )}
                   <AuditObjectiveCard objective={obj} />
                   {isConnected && (
                      <div className="absolute -right-3 top-1/2 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                   )}
                 </div>
               )
            })}
          </div>
        </div>

        {/* KOLON 3: DENETİM GÖREVLERİ (İCRA) */}
        <div className="col-span-4 space-y-4 z-10 mt-24">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded border border-emerald-100">SONUÇ</span>
            <h4 className="text-sm font-bold text-slate-700">Denetim Görevleri (İcra)</h4>
          </div>
          <div className="space-y-3">
            {mockEngagements.map((eng, idx) => (
              <div 
                key={idx}
                className={clsx(
                  "p-4 rounded-xl border bg-white/80 backdrop-blur-md flex items-center gap-3 shadow-sm transition-all duration-500",
                  activeGoalId ? "border-emerald-200 shadow-emerald-100 translate-x-[-5px]" : "border-slate-200"
                )}
              >
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
                  <FileText size={18} />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-800 leading-tight">{eng.title}</h5>
                  <div className="flex gap-2 mt-1.5">
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 border border-slate-200">{eng.type}</span>
                    <span className={clsx("text-[10px] px-1.5 py-0.5 rounded font-medium", 
                      eng.status === 'Tamamlandı' ? 'bg-emerald-100 text-emerald-700' : 
                      eng.status === 'Devam Ediyor' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    )}>
                      {eng.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};