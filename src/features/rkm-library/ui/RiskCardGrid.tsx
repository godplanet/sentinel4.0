import { Shield, TrendingUp, AlertTriangle, ArrowRight, Edit2, Trash2, Zap } from 'lucide-react';
import type { RiskLibraryItem } from '@/entities/risk/types';

interface RiskCardGridProps {
  risks: RiskLibraryItem[];
  onEdit: (risk: RiskLibraryItem) => void;
  onDelete: (id: string) => void;
}

export function RiskCardGrid({ risks, onEdit, onDelete }: RiskCardGridProps) {
  const getRiskZone = (score: number) => {
    if (score >= 85)
      return {
        label: 'KRİTİK',
        color: 'bg-red-500',
        bgColor: 'from-red-50/80 to-red-100/60',
        borderColor: 'border-red-200',
        neonClass: 'neon-border-blue',
      };
    if (score >= 70)
      return {
        label: 'YÜKSEK',
        color: 'bg-amber-500',
        bgColor: 'from-amber-50/80 to-amber-100/60',
        borderColor: 'border-amber-200',
        neonClass: 'neon-border-orange',
      };
    if (score >= 50)
      return {
        label: 'ORTA',
        color: 'bg-yellow-500',
        bgColor: 'from-yellow-50/80 to-yellow-100/60',
        borderColor: 'border-yellow-200',
        neonClass: 'neon-border-emerald',
      };
    return {
      label: 'DÜŞÜK',
      color: 'bg-emerald-500',
      bgColor: 'from-emerald-50/80 to-emerald-100/60',
      borderColor: 'border-emerald-200',
      neonClass: 'neon-border-emerald',
    };
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      STRATEGIC: 'Stratejik',
      OPERATIONAL: 'Operasyonel',
      FINANCIAL: 'Finansal',
      COMPLIANCE: 'Uyum',
      REPUTATIONAL: 'İtibar',
      TECHNOLOGY: 'Teknoloji',
      CREDIT: 'Kredi',
      MARKET: 'Piyasa',
      LIQUIDITY: 'Likidite',
      OTHER: 'Diğer',
    };
    return labels[category] || category;
  };

  if (risks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center glass-card">
        <Shield size={72} className="text-slate-300 mb-5" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Risk Bulunamadı</h3>
        <p className="text-sm text-slate-600 max-w-md">
          Henüz risk eklenmedi veya arama kriterlerinizle eşleşen risk yok. AI Risk Sihirbazı ile
          yeni bir risk ekleyin.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {risks.map((risk) => {
        const inherentZone = getRiskZone(risk.inherent_score);
        const residualZone = getRiskZone(risk.residual_score);
        const riskReduction =
          risk.inherent_score > 0
            ? ((risk.inherent_score - risk.residual_score) / risk.inherent_score) * 100
            : 0;

        return (
          <div key={risk.id} className={`relative ${inherentZone.neonClass} group`}>
            <div className="relative z-10 glass-card p-6 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <code className="text-xs font-bold text-slate-700 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/50">
                      {risk.risk_code}
                    </code>
                    <span className="text-xs font-bold text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-lg">
                      {getCategoryLabel(risk.category)}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-tight">
                    {risk.title}
                  </h3>
                  {risk.description && (
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {risk.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div
                  className={`bg-gradient-to-br ${inherentZone.bgColor} border-2 ${inherentZone.borderColor} rounded-xl p-4 text-center`}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    <TrendingUp size={14} className="text-red-600" />
                    <span className="text-xs font-bold text-slate-600">İçsel</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1.5 tabular-nums">
                    {risk.inherent_score.toFixed(1)}
                  </div>
                  <div
                    className={`text-xs font-bold px-2 py-1 rounded-lg ${inherentZone.color} text-white inline-block`}
                  >
                    {inherentZone.label}
                  </div>
                </div>

                <div
                  className={`bg-gradient-to-br ${residualZone.bgColor} border-2 ${residualZone.borderColor} rounded-xl p-4 text-center`}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    <AlertTriangle size={14} className="text-amber-600" />
                    <span className="text-xs font-bold text-slate-600">Artık</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1.5 tabular-nums">
                    {risk.residual_score.toFixed(1)}
                  </div>
                  <div
                    className={`text-xs font-bold px-2 py-1 rounded-lg ${residualZone.color} text-white inline-block`}
                  >
                    {residualZone.label}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 border-2 border-emerald-200 rounded-xl p-3.5 text-center mb-4">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Zap size={14} className="text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700">Risk Azaltma</span>
                </div>
                <div className="text-2xl font-bold text-emerald-700 tabular-nums">
                  {riskReduction.toFixed(1)}%
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-slate-400" />
                  <div className="flex-1">
                    <div className="text-xs text-slate-600 font-medium">Kontrol Etkinliği</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1.5 w-16 rounded-full bg-slate-200/80 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                          style={{ width: `${risk.control_effectiveness * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700 tabular-nums">
                        {(risk.control_effectiveness * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(risk)}
                    className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-all hover:scale-110"
                    title="Düzenle"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(risk.id)}
                    className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-all hover:scale-110"
                    title="Sil"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {risk.tags && risk.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-200/50 mt-3">
                  {risk.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-slate-100/80 text-slate-600 rounded-md font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {risk.tags.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-slate-100/80 text-slate-600 rounded-md font-medium">
                      +{risk.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
