import { useState, useMemo } from 'react';
import { Activity, AlertTriangle, Shield, Zap, Clock, Banknote } from 'lucide-react';
import clsx from 'clsx';
import { RiskEngine } from '@/features/risk-engine/calculator';
import type {
  MethodologyConfig,
  FindingRiskInput,
  ShariahVector,
} from '@/features/risk-engine/methodology-types';

interface Props {
  config: MethodologyConfig;
}

const SLIDER_FIELDS: { key: keyof FindingRiskInput; label: string; max: number; step: number }[] = [
  { key: 'impact_financial', label: 'Finansal Etki', max: 5, step: 1 },
  { key: 'impact_legal', label: 'Yasal / Regulatör Etki', max: 5, step: 1 },
  { key: 'impact_reputation', label: 'Itibar Etkisi', max: 5, step: 1 },
  { key: 'impact_operational', label: 'Operasyonel Etki', max: 5, step: 1 },
  { key: 'likelihood_score', label: 'Olasilik', max: 5, step: 1 },
  { key: 'control_effectiveness', label: 'Kontrol Etkinligi', max: 5, step: 1 },
  { key: 'cvss_score', label: 'CVSS Skoru', max: 10, step: 0.1 },
];

const ASSET_LABELS: Record<string, string> = {
  Critical: 'Kritik',
  Major: 'Önemli',
  Minor: 'Düsük',
};

const SHARIAH_OPTIONS: { value: ShariahVector['status']; label: string; desc: string }[] = [
  { value: 'HALAL', label: 'Helal', desc: 'Uyumlu' },
  { value: 'FASID', label: 'Fasid', desc: 'Kusurlu' },
  { value: 'BATIL', label: 'Batil', desc: 'Geçersiz' },
];

const DEFAULT_FINDING: FindingRiskInput = {
  impact_financial: 3,
  impact_legal: 2,
  impact_reputation: 3,
  impact_operational: 2,
  likelihood_score: 3,
  control_effectiveness: 2,
  shariah_impact_score: 1,
  cvss_score: 0,
  asset_criticality: 'Major',
  shariah_vector: { status: 'HALAL', purification_amt: 0, fatwa_ref: '' },
  cyber_vector: { cvss_vector: '', cvss_score: 0, asset_criticality: 'MAJOR' },
  financial_vector: { loss_amount: 0, impact_percent_equity: 0 },
};

export function MethodologySimulator({ config }: Props) {
  const [finding, setFinding] = useState<FindingRiskInput>({ ...DEFAULT_FINDING });

  const result = useMemo(() => {
    const engine = new RiskEngine(config);
    return engine.calculate(finding);
  }, [config, finding]);

  const updateField = (key: string, value: number) => {
    setFinding(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'cvss_score') {
        next.cyber_vector = {
          ...(prev.cyber_vector ?? { cvss_vector: '', cvss_score: 0, asset_criticality: 'MAJOR' }),
          cvss_score: value,
        };
      }
      return next;
    });
  };

  const setShariahStatus = (status: ShariahVector['status']) => {
    setFinding(prev => ({
      ...prev,
      shariah_vector: {
        ...(prev.shariah_vector ?? { status: 'HALAL', purification_amt: 0, fatwa_ref: '' }),
        status,
      },
      shariah_impact_score: status === 'BATIL' ? 5 : status === 'FASID' ? 3 : 1,
    }));
  };

  const setAssetCriticality = (level: 'Critical' | 'Major' | 'Minor') => {
    const cyberLevel = level.toUpperCase() as 'CRITICAL' | 'MAJOR' | 'MINOR';
    setFinding(prev => ({
      ...prev,
      asset_criticality: level,
      cyber_vector: {
        ...(prev.cyber_vector ?? { cvss_vector: '', cvss_score: 0, asset_criticality: 'MAJOR' }),
        asset_criticality: cyberLevel,
      },
    }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 bg-slate-800 text-white flex items-center gap-3">
        <Activity size={18} />
        <div>
          <h3 className="text-sm font-bold">Canli Simülasyon</h3>
          <p className="text-[10px] text-slate-300">Parametreleri degistirin, sonucu aninda görün</p>
        </div>
      </div>

      <div
        className="mx-5 mt-4 rounded-xl p-5 text-center transition-all duration-300"
        style={{ backgroundColor: result.color + '18', borderLeft: `4px solid ${result.color}` }}
      >
        <div className="text-5xl font-black mb-1" style={{ color: result.color }}>
          {result.score.toFixed(1)}
        </div>
        <div className="text-sm font-bold text-slate-700">{result.severity}</div>
        {result.vetoTriggered && (
          <div className="mt-2 flex items-center justify-center gap-1.5 text-xs font-bold text-red-700 bg-red-100 rounded-full px-3 py-1 mx-auto w-fit">
            <AlertTriangle size={12} />
            VETO: {result.vetoReason}
          </div>
        )}
        {result.vetoSource === 'jsonlogic' && (
          <div className="mt-1.5 flex items-center justify-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 rounded-full px-2.5 py-0.5 mx-auto w-fit">
            <Zap size={10} />
            JsonLogic Motor
          </div>
        )}
      </div>

      <div className="p-5 space-y-3">
        {SLIDER_FIELDS.map(({ key, label, max, step }) => {
          const val = (finding[key] as number) ?? 0;
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-600">{label}</span>
                <span className="text-xs font-bold text-slate-800 tabular-nums w-8 text-right">
                  {step < 1 ? val.toFixed(1) : val}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={max}
                step={step}
                value={val}
                onChange={(e) => updateField(key, Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-slate-700"
              />
            </div>
          );
        })}

        <div className="pt-1 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-600 block mb-1.5">
            Ser'i Uyum Durumu
          </span>
          <div className="grid grid-cols-3 gap-2">
            {SHARIAH_OPTIONS.map(({ value, label, desc }) => {
              const isActive = finding.shariah_vector?.status === value;
              const isBatil = value === 'BATIL';
              return (
                <button
                  key={value}
                  onClick={() => setShariahStatus(value)}
                  className={clsx(
                    'text-xs font-semibold py-1.5 rounded-lg border transition-all',
                    isActive && isBatil
                      ? 'bg-red-700 text-white border-red-700 shadow-sm shadow-red-200'
                      : isActive
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  )}
                >
                  <span className="block">{label}</span>
                  <span className={clsx(
                    'block text-[9px] mt-0.5',
                    isActive ? 'opacity-70' : 'text-slate-400'
                  )}>
                    {desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-600 block mb-1">Varlik Kritikligi</span>
          <div className="grid grid-cols-3 gap-2">
            {(['Critical', 'Major', 'Minor'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setAssetCriticality(level)}
                className={clsx(
                  'text-xs font-semibold py-1.5 rounded-lg border transition-colors',
                  finding.asset_criticality === level
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                )}
              >
                {ASSET_LABELS[level]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 pb-4">
        <div className="bg-slate-50 rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-1.5 mb-2">
            <Shield size={12} className="text-slate-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Motor Detayi</span>
          </div>
          <Row label="Agirlikli Etki" value={result.breakdown.weightedImpact.toFixed(4)} />
          <Row label="Olasilik Faktörü" value={result.breakdown.likelihoodFactor.toFixed(4)} />
          <Row label="Kontrol Azaltmasi" value={`-${(result.breakdown.controlReduction * 50).toFixed(1)}%`} />
          <Row label="Varlik Çarpani" value={`x${result.breakdown.assetMultiplier}`} />
          <div className="border-t border-slate-200 pt-1 mt-1">
            <Row label="Ham Skor" value={result.breakdown.rawScore.toFixed(2)} bold />
          </div>
          {result.vetoTriggered && (
            <div className="border-t border-red-200 pt-1 mt-1">
              <Row
                label="Veto Kaynagi"
                value={result.vetoSource === 'jsonlogic' ? 'JsonLogic' : 'Legacy'}
                bold
              />
            </div>
          )}
          {result.sla && (
            <div className="border-t border-blue-200 pt-1 mt-1">
              <div className="flex items-center gap-1 mb-1">
                <Clock size={10} className="text-blue-500" />
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">SLA</span>
              </div>
              <Row label="Takvim Günü" value={`${result.sla.calendar_days} gün`} />
              <Row label="Sprint" value={`${result.sla.sprint_count} sprint`} />
            </div>
          )}
          {result.purificationAmount > 0 && (
            <div className="border-t border-amber-200 pt-1 mt-1">
              <div className="flex items-center gap-1 mb-1">
                <Banknote size={10} className="text-amber-600" />
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Arindirma</span>
              </div>
              <Row label="Arindirma Tutari" value={`${result.purificationAmount.toLocaleString('tr-TR')} TL`} bold />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={clsx('text-[11px]', bold ? 'font-bold text-slate-700' : 'text-slate-500')}>{label}</span>
      <span className={clsx('text-[11px] tabular-nums', bold ? 'font-bold text-slate-800' : 'text-slate-600')}>{value}</span>
    </div>
  );
}
