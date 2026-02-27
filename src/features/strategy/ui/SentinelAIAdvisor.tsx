import { Sparkles, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';
import { useStrategyStore } from '@/entities/strategy/model/store';

export const SentinelAIAdvisor = () => {
  const { goals, objectives } = useStrategyStore();

  // Basit AI Mantığı (Mock Logic)
  const highRiskGoals = goals.filter(g => g.riskAppetite === 'High');
  const unmappedGoals = goals.filter(g => g.linkedAuditObjectives.length === 0);
  const coverageScore = Math.round((objectives.length / (goals.length || 1)) * 100);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-white shadow-xl shadow-indigo-500/20 mb-8">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-indigo-400/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Sol: AI İçgörüsü */}
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/30 shadow-inner">
            <Sparkles className="h-6 w-6 text-yellow-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              Sentinel AI Stratejik Analizi
              <span className="px-2 py-0.5 rounded text-[10px] bg-white/20 font-mono text-indigo-100 border border-white/10">CANLI</span>
            </h3>
            <p className="text-indigo-100 text-sm mt-1 max-w-2xl leading-relaxed">
              {unmappedGoals.length > 0 
                ? `Dikkat: ${unmappedGoals.length} adet Yüksek Öncelikli Kurumsal Hedef henüz herhangi bir denetim faaliyeti ile eşleşmedi. Bu bir stratejik kör nokta yaratıyor.`
                : `Harika! Tüm kurumsal hedefler denetim evreni ile kapsanmış durumda. Odaklanma skoru %${coverageScore} seviyesinde.`
              }
            </p>
          </div>
        </div>

        {/* Sağ: Aksiyon Önerileri */}
        <div className="flex flex-col gap-2 w-full md:w-auto min-w-[280px]">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 border border-white/10 hover:bg-white/15 transition-colors cursor-pointer group">
            <AlertTriangle size={16} className="text-rose-300" />
            <div className="flex-1">
              <p className="text-xs font-bold text-white">Risk Açığı Tespiti</p>
              <p className="text-[10px] text-indigo-200">{highRiskGoals.length} Yüksek Riskli Hedef İzlenmeli</p>
            </div>
            <ArrowRight size={14} className="text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 border border-white/10 hover:bg-white/15 transition-colors cursor-pointer group">
            <TrendingUp size={16} className="text-emerald-300" />
            <div className="flex-1">
              <p className="text-xs font-bold text-white">Trend Analizi</p>
              <p className="text-[10px] text-indigo-200">Sektörel benchmarklara göre %15 sapma</p>
            </div>
            <ArrowRight size={14} className="text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </div>

      </div>
    </div>
  );
};