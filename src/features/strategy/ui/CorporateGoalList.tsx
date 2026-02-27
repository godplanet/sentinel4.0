import { useStrategyStore } from '@/entities/strategy/model/store';
import { MoreHorizontal, TrendingUp, User, Calendar } from 'lucide-react';
import clsx from 'clsx';

export const CorporateGoalList = () => {
  const { goals } = useStrategyStore();

  const getRiskBadge = (appetite: string) => {
    switch (appetite) {
      case 'High': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="w-full bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/60 bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <th className="px-6 py-4">Stratejik Hedef</th>
              <th className="px-6 py-4">Dönem & Sahiplik</th>
              <th className="px-6 py-4 w-48">Risk İştahı</th>
              <th className="px-6 py-4 w-64">İlerleme Durumu</th>
              <th className="px-6 py-4 text-right">Ağırlık</th>
              <th className="px-6 py-4 text-center">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {goals.map((goal) => (
              <tr 
                key={goal.id} 
                className="hover:bg-white/80 transition-colors group cursor-pointer"
              >
                {/* 1. Hedef Başlığı */}
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg mt-1">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-indigo-700 transition-colors">
                        {goal.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-md">
                        {goal.description || 'Açıklama girilmemiş.'}
                      </p>
                    </div>
                  </div>
                </td>

                {/* 2. Dönem & Sahip */}
                <td className="px-6 py-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Calendar size={12} className="text-slate-400" />
                      <span className="font-medium">{goal.period_year || 2026}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <User size={12} className="text-slate-400" />
                      <span>{goal.owner || 'Atanmamış'}</span>
                    </div>
                  </div>
                </td>

                {/* 3. Risk İştahı */}
                <td className="px-6 py-4">
                  <span className={clsx(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                    getRiskBadge(goal.riskAppetite)
                  )}>
                    {goal.riskAppetite} Risk
                  </span>
                </td>

                {/* 4. İlerleme */}
                <td className="px-6 py-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Gerçekleşme</span>
                      <span className="text-indigo-600">{goal.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" 
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* 5. Ağırlık */}
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                    %{goal.weight || 10}
                  </span>
                </td>

                {/* 6. Aksiyon */}
                <td className="px-6 py-4 text-center">
                  <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition-all">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {goals.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <p>Henüz tanımlanmış bir stratejik hedef yok.</p>
          </div>
        )}
      </div>
    </div>
  );
};