import { useState, useMemo } from 'react';
import {
  FlaskConical, Play, RotateCcw, Download, Settings2,
  TrendingUp, AlertTriangle, CheckCircle2, BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Cell
} from 'recharts';
import { PageHeader } from '@/shared/ui';
import clsx from 'clsx';

interface BacktestPoint {
  id: string;
  name: string;
  predicted: number;
  actual: number;
  deviation: number;
}

interface WeightConfig {
  impact: number;
  likelihood: number;
  volume: number;
  controlEffectiveness: number;
}

const DEFAULT_WEIGHTS: WeightConfig = { impact: 0.4, likelihood: 0.3, volume: 0.15, controlEffectiveness: 0.15 };

function generateBacktestData(weights: WeightConfig, seed: number): BacktestPoint[] {
  const names = [
    'Kredi Riski', 'Piyasa Riski', 'Operasyonel Risk', 'Likidite Riski',
    'BT Riski', 'Uyumluluk Riski', 'Itibar Riski', 'Stratejik Risk',
    'Siber Risk', 'MASAK Riski', 'Faiz Riski', 'Kur Riski',
    'Tedarikci Riski', 'KVKK Riski', 'Fraud Riski', 'Surec Riski',
    'Proje Riski', 'Personel Riski', 'Dis Kaynak Riski', 'Model Riski',
  ];

  return names.map((name, i) => {
    const base = (i * 13 + seed) % 100;
    const predicted = Math.min(100, Math.max(5,
      base * weights.impact + (100 - base) * weights.likelihood * 0.5 +
      (base * 0.3) * weights.volume + (50 - base * 0.2) * weights.controlEffectiveness
    ));
    const noise = ((i * 7 + seed * 3) % 30) - 15;
    const actual = Math.min(100, Math.max(5, predicted + noise));

    return {
      id: String(i + 1),
      name,
      predicted: Math.round(predicted),
      actual: Math.round(actual),
      deviation: Math.round(actual - predicted),
    };
  });
}

export default function RiskLaboratoryPage() {
  const [weights, setWeights] = useState<WeightConfig>(DEFAULT_WEIGHTS);
  const [runCount, setRunCount] = useState(0);

  const data = useMemo(() => generateBacktestData(weights, runCount), [weights, runCount]);

  const stats = useMemo(() => {
    const absDevs = data.map(d => Math.abs(d.deviation));
    const mae = absDevs.reduce((s, d) => s + d, 0) / data.length;
    const withinThreshold = data.filter(d => Math.abs(d.deviation) <= 10).length;
    const accuracy = (withinThreshold / data.length) * 100;
    const maxDev = Math.max(...absDevs);
    const correlation = 1 - (mae / 50);
    return { mae: mae.toFixed(1), accuracy: accuracy.toFixed(0), maxDev, correlation: correlation.toFixed(2) };
  }, [data]);

  const handleWeightChange = (key: keyof WeightConfig, value: number) => {
    setWeights(prev => ({ ...prev, [key]: value }));
  };

  const handleRun = () => setRunCount(c => c + 1);
  const handleReset = () => { setWeights(DEFAULT_WEIGHTS); setRunCount(0); };

  const totalWeight = weights.impact + weights.likelihood + weights.volume + weights.controlEffectiveness;

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <PageHeader
        title="Risk Laboratuvari"
        subtitle="Agirlik geri-test ve tahmin analizi"
        icon={FlaskConical}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <StatBox label="MAE (Ort. Mutlak Hata)" value={stats.mae} color={Number(stats.mae) <= 10 ? 'green' : 'red'} />
          <StatBox label="Dogruluk (+-10 puan)" value={`${stats.accuracy}%`} color={Number(stats.accuracy) >= 70 ? 'green' : 'red'} />
          <StatBox label="Maks. Sapma" value={String(stats.maxDev)} color={stats.maxDev <= 15 ? 'green' : 'red'} />
          <StatBox label="Korelasyon" value={stats.correlation} color={Number(stats.correlation) >= 0.7 ? 'green' : 'red'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Settings2 size={16} className="text-blue-600" />
                Agirlik Konfigurasyonu
              </h3>
              <div className="space-y-4">
                <WeightSlider label="Etki (Impact)" value={weights.impact} onChange={v => handleWeightChange('impact', v)} />
                <WeightSlider label="Olasilik (Likelihood)" value={weights.likelihood} onChange={v => handleWeightChange('likelihood', v)} />
                <WeightSlider label="Hacim (Volume)" value={weights.volume} onChange={v => handleWeightChange('volume', v)} />
                <WeightSlider label="Kontrol Etkinligi" value={weights.controlEffectiveness} onChange={v => handleWeightChange('controlEffectiveness', v)} />

                <div className={clsx(
                  'p-3 rounded-lg text-xs font-semibold text-center',
                  Math.abs(totalWeight - 1) < 0.05 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                )}>
                  Toplam Agirlik: {totalWeight.toFixed(2)}
                  {Math.abs(totalWeight - 1) >= 0.05 && ' (1.00 olmali!)'}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={handleRun} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700">
                  <Play size={14} /> Calistir
                </button>
                <button onClick={handleReset} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
              <BarChart3 size={16} className="text-blue-600" />
              Tahmin vs Gerceklesen (Scatter)
            </h3>
            <p className="text-[10px] text-slate-500 mb-4">
              Diyagonal cizgiye yakin noktalar = iyi tahmin. Kirmizi = yuksek sapma.
            </p>

            <ResponsiveContainer width="100%" height={380}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" dataKey="predicted" name="Tahmin" domain={[0, 100]}
                  stroke="#94a3b8" style={{ fontSize: '11px' }}
                  label={{ value: 'Tahmin Edilen Skor', position: 'bottom', style: { fontSize: '11px' } }}
                />
                <YAxis type="number" dataKey="actual" name="Gerceklesen" domain={[0, 100]}
                  stroke="#94a3b8" style={{ fontSize: '11px' }}
                  label={{ value: 'Gerceklesen Skor', angle: -90, position: 'insideLeft', style: { fontSize: '11px' } }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as BacktestPoint;
                    return (
                      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs">
                        <p className="font-bold text-slate-800">{d.name}</p>
                        <p className="text-slate-500">Tahmin: {d.predicted} | Gercek: {d.actual}</p>
                        <p className={clsx('font-semibold', Math.abs(d.deviation) > 10 ? 'text-red-600' : 'text-green-600')}>
                          Sapma: {d.deviation > 0 ? '+' : ''}{d.deviation}
                        </p>
                      </div>
                    );
                  }}
                />
                <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]} stroke="#94a3b8" strokeDasharray="5 5" />
                <ReferenceLine segment={[{ x: 0, y: 10 }, { x: 90, y: 100 }]} stroke="#e2e8f0" strokeDasharray="3 3" />
                <ReferenceLine segment={[{ x: 10, y: 0 }, { x: 100, y: 90 }]} stroke="#e2e8f0" strokeDasharray="3 3" />
                <Scatter data={data} fill="#3b82f6">
                  {data.map((d, i) => (
                    <Cell key={i} fill={Math.abs(d.deviation) > 15 ? '#ef4444' : Math.abs(d.deviation) > 10 ? '#f59e0b' : '#22c55e'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function WeightSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className="text-xs font-bold text-slate-800">{(value * 100).toFixed(0)}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value * 100}
        onChange={e => onChange(Number(e.target.value) / 100)}
        className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: 'green' | 'red' }) {
  return (
    <div className={clsx(
      'bg-white rounded-xl border p-4',
      color === 'green' ? 'border-green-200' : 'border-red-200'
    )}>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className={clsx('text-2xl font-black mt-1', color === 'green' ? 'text-green-600' : 'text-red-600')}>{value}</p>
    </div>
  );
}
