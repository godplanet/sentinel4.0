import { AlertTriangle, Ban, Shield, XCircle } from 'lucide-react';
import { useRiskConstitution } from '@/features/risk-constitution';

interface Props {
  findingCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export function VetoStatusCards({ findingCounts }: Props) {
  const { constitution } = useRiskConstitution();

  if (!constitution) {
    return null;
  }

  const activeVetos = constitution.veto_rules.filter(v => v.enabled);

  if (activeVetos.length === 0) {
    return (
      <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-500/20 rounded-xl">
            <Shield className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Veto Yok</div>
            <div className="text-xs text-slate-400">
              Tüm veto kuralları devre dışı. Normal hesaplama yapılıyor.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const triggeredVetos = activeVetos.filter(veto => {
    if (veto.condition.includes('count_critical') && findingCounts.critical > 0) return true;
    if (veto.condition.includes('count_high') && findingCounts.high > 0) return true;
    return false;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-orange-400" />
        <h3 className="text-lg font-bold text-white">Veto Kuralları</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeVetos.map((veto, idx) => {
          const isTriggered = triggeredVetos.includes(veto);

          return (
            <div
              key={idx}
              className={`
                backdrop-blur-md border rounded-xl p-4 transition-all
                ${isTriggered
                  ? 'bg-red-500/20 border-red-400/50 ring-2 ring-red-400/30'
                  : 'bg-white/5 border-white/10'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`
                    p-2 rounded-lg
                    ${isTriggered ? 'bg-red-500/30' : 'bg-slate-500/20'}
                  `}
                >
                  {isTriggered ? (
                    <XCircle className="w-5 h-5 text-red-400" />
                  ) : (
                    <Ban className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white">{veto.name}</span>
                    {isTriggered && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                        AKTİF
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mb-2">
                    Koşul: <span className="font-mono text-slate-300">{veto.condition}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-slate-400">Maksimum Skor:</span>
                    <span className={`text-lg font-bold ${isTriggered ? 'text-red-400' : 'text-slate-300'}`}>
                      {veto.override_score}
                    </span>
                  </div>
                </div>
              </div>

              {isTriggered && (
                <div className="mt-3 pt-3 border-t border-red-400/20">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-red-400">
                      Bu kural aktif - Skor {veto.override_score} ile sınırlandırıldı
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {triggeredVetos.length > 0 && (
        <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-300">
              <span className="font-bold">{triggeredVetos.length} veto kuralı aktif.</span>
              {' '}Final skor, en düşük veto limitine göre sınırlandırıldı. Kritik bulguları gidermeden not yükseltilmez.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
