import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/shared/ui';
import {
  Settings, Save, RotateCcw, Loader2, CheckCircle2, XCircle,
  Sliders, Zap, Palette, Activity, AlertTriangle, ListTree, Calculator, 
  Plus, Trash2, GripVertical, BookOpen, AlertCircle
} from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';
import {
  useRiskMethodology,
  computeRiskScore,
  determineRiskZone,
} from '@/features/risk-engine/useRiskMethodology';
import type { RiskImpacts, VelocityLevel, RiskConfiguration } from '@/features/risk-engine/useRiskMethodology';

// YENİ EKLENDİ: GLOBAL PARAMETRE HAFIZAMIZ
import { useParameterStore } from '@/entities/settings/model/parameter-store';

type WeightKey = 'financial' | 'reputation' | 'operational' | 'legal';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type ActiveTab = 'engine' | 'parameters';

const WEIGHT_META: { key: WeightKey; label: string; color: string }[] = [
  { key: 'financial', label: 'Finansal Etki', color: '#2563eb' },
  { key: 'reputation', label: 'Itibar Etkisi', color: '#f97316' },
  { key: 'operational', label: 'Operasyonel Etki', color: '#059669' },
  { key: 'legal', label: 'Yasal / Regulatif', color: '#dc2626' },
];

const VELOCITY_OPTIONS: { value: VelocityLevel; label: string }[] = [
  { value: 'high', label: 'Yuksek' },
  { value: 'medium', label: 'Orta' },
  { value: 'low', label: 'Dusuk' },
];

export default function MethodologyPage() {
  const { config, loading, updateConfig } = useRiskMethodology();
  
  // SEKME YÖNETİMİ
  const [activeTab, setActiveTab] = useState<ActiveTab>('engine');

  // RİSK MOTORU STATE'LERİ (Orijinal)
  const [weights, setWeights] = useState<Record<WeightKey, number>>({
    financial: 0.3, reputation: 0.25, operational: 0.25, legal: 0.2,
  });
  const [velocityHigh, setVelocityHigh] = useState(1.5);
  const [velocityMedium, setVelocityMedium] = useState(1.2);
  const [thresholdCritical, setThresholdCritical] = useState(20);
  const [thresholdHigh, setThresholdHigh] = useState(15);
  const [thresholdMedium, setThresholdMedium] = useState(10);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const [simImpacts, setSimImpacts] = useState<RiskImpacts>({
    financial: 3, reputation: 2, operational: 2, legal: 2,
  });
  const [simLikelihood, setSimLikelihood] = useState(3);
  const [simVelocity, setSimVelocity] = useState<VelocityLevel>('medium');

  useEffect(() => {
    if (!config) return;
    setWeights({
      financial: Number(config.weight_financial),
      reputation: Number(config.weight_reputation),
      operational: Number(config.weight_operational),
      legal: Number(config.weight_legal),
    });
    setVelocityHigh(Number(config.velocity_multiplier_high));
    setVelocityMedium(Number(config.velocity_multiplier_medium));
    setThresholdCritical(Number(config.threshold_critical));
    setThresholdHigh(Number(config.threshold_high));
    setThresholdMedium(Number(config.threshold_medium));
  }, [config]);

  const draftConfig = useMemo((): RiskConfiguration | null => {
    if (!config) return null;
    return {
      ...config,
      weight_financial: weights.financial,
      weight_reputation: weights.reputation,
      weight_operational: weights.operational,
      weight_legal: weights.legal,
      velocity_multiplier_high: velocityHigh,
      velocity_multiplier_medium: velocityMedium,
      threshold_critical: thresholdCritical,
      threshold_high: thresholdHigh,
      threshold_medium: thresholdMedium,
    };
  }, [config, weights, velocityHigh, velocityMedium, thresholdCritical, thresholdHigh, thresholdMedium]);

  const liveScore = useMemo(() => {
    if (!draftConfig) return 0;
    return computeRiskScore(draftConfig, simImpacts, simLikelihood, simVelocity);
  }, [draftConfig, simImpacts, simLikelihood, simVelocity]);

  const liveZone = useMemo(() => {
    if (!draftConfig) return { label: 'Bilinmiyor', color: '#94a3b8', level: 'LOW' as const };
    return determineRiskZone(draftConfig, liveScore);
  }, [draftConfig, liveScore]);

  const totalWeight = Object.values(weights).reduce((s, v) => s + v, 0);
  const isWeightValid = Math.abs(totalWeight - 1) < 0.01;

  const handleWeightChange = useCallback((key: WeightKey, pctValue: number) => {
    setWeights(prev => {
      const newVal = Math.min(1, Math.max(0, pctValue / 100));
      const others = WEIGHT_META.filter(w => w.key !== key);
      const otherSum = others.reduce((s, w) => s + prev[w.key], 0);
      const remaining = Math.max(0, 1 - newVal);
      const next = { ...prev, [key]: newVal };
      if (otherSum > 0) {
        others.forEach(w => {
          next[w.key] = Number(((prev[w.key] / otherSum) * remaining).toFixed(4));
        });
      } else {
        const share = remaining / others.length;
        others.forEach(w => { next[w.key] = Number(share.toFixed(4)); });
      }
      return next;
    });
    setSaveStatus('idle');
  }, []);

  const handleSave = async () => {
    if (!isWeightValid) return;
    setSaveStatus('saving');
    const ok = await updateConfig({
      weight_financial: weights.financial,
      weight_reputation: weights.reputation,
      weight_operational: weights.operational,
      weight_legal: weights.legal,
      velocity_multiplier_high: velocityHigh,
      velocity_multiplier_medium: velocityMedium,
      threshold_critical: thresholdCritical,
      threshold_high: thresholdHigh,
      threshold_medium: thresholdMedium,
    });
    setSaveStatus(ok ? 'saved' : 'error');
    if (ok) setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const handleReset = () => {
    if (!config) return;
    setWeights({
      financial: Number(config.weight_financial),
      reputation: Number(config.weight_reputation),
      operational: Number(config.weight_operational),
      legal: Number(config.weight_legal),
    });
    setVelocityHigh(Number(config.velocity_multiplier_high));
    setVelocityMedium(Number(config.velocity_multiplier_medium));
    setThresholdCritical(Number(config.threshold_critical));
    setThresholdHigh(Number(config.threshold_high));
    setThresholdMedium(Number(config.threshold_medium));
    setSaveStatus('idle');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-2">
          <XCircle size={40} className="text-red-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Risk konfigurasyonu bulunamadi.</p>
          <p className="text-xs text-slate-400">Seed migration calistirilmis mi kontrol edin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Metodoloji ve Parametreler"
        description="KERD-2026 Anayasasi: Risk Motoru ve Sistem Sınıflandırmaları"
        icon={Settings}
      />

      {/* SEKME NAVİGASYONU */}
      <div className="flex gap-2 border-b border-slate-200">
          <button 
              onClick={() => setActiveTab('engine')}
              className={clsx(
                  "px-6 py-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors",
                  activeTab === 'engine' ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              )}
          >
              <Calculator size={18} /> Risk Motoru (WIF)
          </button>
          <button 
              onClick={() => setActiveTab('parameters')}
              className={clsx(
                  "px-6 py-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors",
                  activeTab === 'parameters' ? "border-indigo-600 text-indigo-700 bg-indigo-50/50" : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              )}
          >
              <ListTree size={18} /> Sınıflandırma ve Parametreler
          </button>
      </div>

      {/* SEKME 1: ORİJİNAL RİSK MOTORU */}
      {activeTab === 'engine' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="lg:col-span-2 space-y-4">
            <WeightsCard weights={weights} totalWeight={totalWeight} isValid={isWeightValid} onChange={handleWeightChange} />
            <VelocityCard high={velocityHigh} medium={velocityMedium} onHighChange={v => { setVelocityHigh(v); setSaveStatus('idle'); }} onMediumChange={v => { setVelocityMedium(v); setSaveStatus('idle'); }} />
            <ThresholdsCard critical={thresholdCritical} high={thresholdHigh} medium={thresholdMedium} onCriticalChange={v => { setThresholdCritical(v); setSaveStatus('idle'); }} onHighChange={v => { setThresholdHigh(v); setSaveStatus('idle'); }} onMediumChange={v => { setThresholdMedium(v); setSaveStatus('idle'); }} />
            <SaveBar status={saveStatus} isValid={isWeightValid} onSave={handleSave} onReset={handleReset} />
          </div>

          <div className="lg:sticky lg:top-20 lg:self-start">
            <SimulatorPanel weights={weights} velocityHigh={velocityHigh} velocityMedium={velocityMedium} liveScore={liveScore} liveZone={liveZone} simImpacts={simImpacts} simLikelihood={simLikelihood} simVelocity={simVelocity} onImpactChange={(k, v) => setSimImpacts(prev => ({ ...prev, [k]: v }))} onLikelihoodChange={setSimLikelihood} onVelocityChange={setSimVelocity} />
          </div>
        </div>
      )}

      {/* SEKME 2: YENİ PARAMETRE YÖNETİMİ (FAZ 3) */}
      {activeTab === 'parameters' && (
         <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <ParameterManagementTab />
         </div>
      )}
    </div>
  );
}

// ============================================================================
// BİLEŞENLER: PARAMETRE YÖNETİMİ (GLOBAL STORE'A BAĞLANDI)
// ============================================================================

function ParameterManagementTab() {
    // DÜZELTME: Artık yerel (sabit) state kullanmıyoruz, Global Hafızayı (Zustand) kullanıyoruz!
    const store = useParameterStore();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ParameterListManager 
                title="GIAS Kategorileri" 
                description="Bulgu formunda seçilebilecek ana denetim standartları."
                items={store.giasCategories} 
                onAdd={(label: string) => store.addGiasCategory(label)}
                onRemove={(id: string) => store.removeGiasCategory(id)}
                icon={<BookOpen className="text-indigo-500" />}
                colorTheme="indigo"
            />
            
            <ParameterListManager 
                title="Kök Neden (RCA) Sınıflandırmaları" 
                description="5-Whys veya Ishikawa analizleri sonucunda atanacak kök neden tipleri."
                items={store.rcaCategories} 
                onAdd={(label: string) => store.addRcaCategory(label)}
                onRemove={(id: string) => store.removeRcaCategory(id)}
                icon={<AlertTriangle className="text-red-500" />}
                colorTheme="red"
            />

            <div className="lg:col-span-2">
                <ParameterListManager 
                    title="Basel Risk Türleri" 
                    description="Bulgu risk ve etki sekmesinde çoklu olarak seçilebilecek risk kategorileri."
                    items={store.riskTypes} 
                    onAdd={(label: string) => store.addRiskType(label)}
                    onRemove={(id: string) => store.removeRiskType(id)}
                    icon={<AlertCircle className="text-violet-500" />}
                    colorTheme="violet"
                />
            </div>
        </div>
    );
}

function ParameterListManager({ title, description, items, onAdd, onRemove, icon, colorTheme }: any) {
    const [newItemLabel, setNewItemLabel] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemLabel.trim()) return;
        
        onAdd(newItemLabel.trim());
        setNewItemLabel('');
        toast.success(`"${newItemLabel.trim()}" başarıyla eklendi.`);
    };

    const handleRemove = (id: string, label: string) => {
        onRemove(id);
        toast.success(`"${label}" listeden silindi.`);
    };

    const getBorderColor = () => {
        if (colorTheme === 'indigo') return 'border-indigo-100 ring-indigo-50';
        if (colorTheme === 'red') return 'border-red-100 ring-red-50';
        if (colorTheme === 'violet') return 'border-violet-100 ring-violet-50';
        return 'border-slate-100 ring-slate-50';
    };

    const getBgColor = () => {
        if (colorTheme === 'indigo') return 'bg-indigo-50/30 border-indigo-100';
        if (colorTheme === 'red') return 'bg-red-50/30 border-red-100';
        if (colorTheme === 'violet') return 'bg-violet-50/30 border-violet-100';
        return 'bg-slate-50/30 border-slate-100';
    };

    const getIconBg = () => {
        if (colorTheme === 'indigo') return 'bg-indigo-100';
        if (colorTheme === 'red') return 'bg-red-100';
        if (colorTheme === 'violet') return 'bg-violet-100';
        return 'bg-slate-100';
    };

    return (
        <div className={`bg-white border rounded-xl shadow-sm flex flex-col h-full ring-1 ring-inset overflow-hidden ${getBorderColor()}`}>
            <div className={`p-5 border-b ${getBgColor()}`}>
                <div className="flex items-center gap-3 mb-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getIconBg()}`}>
                        {icon}
                    </div>
                    <h3 className="text-base font-bold text-slate-800">{title}</h3>
                </div>
                <p className="text-xs text-slate-500 ml-11">{description}</p>
            </div>

            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <form onSubmit={handleAdd} className="flex gap-2">
                    <input 
                        type="text" 
                        value={newItemLabel} 
                        onChange={(e) => setNewItemLabel(e.target.value)}
                        placeholder="Yeni kategori adı yazın..."
                        className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                    <button 
                        type="submit" 
                        disabled={!newItemLabel.trim()}
                        className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={16} /> Ekle
                    </button>
                </form>
            </div>

            <div className="flex-1 p-2 bg-white min-h-[200px] max-h-[300px] overflow-y-auto">
                {items.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm italic">Henüz bir kategori eklenmemiş.</div>
                ) : (
                    <div className="space-y-1">
                        {items.map((item: any) => (
                            <div key={item.id} className="group flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-all">
                                <GripVertical className="text-slate-300 cursor-grab active:cursor-grabbing opacity-50 group-hover:opacity-100" size={16} />
                                <span className="flex-1 text-sm font-semibold text-slate-700">{item.label}</span>
                                <button 
                                    onClick={() => handleRemove(item.id, item.label)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                                    title="Sil"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Toplam {items.length} Kayıt</p>
            </div>
        </div>
    );
}

// ============================================================================
// ORİJİNAL ALT BİLEŞENLER (BİREBİR KORUNMUŞTUR)
// ============================================================================

function WeightsCard({
  weights, totalWeight, isValid, onChange,
}: {
  weights: Record<WeightKey, number>;
  totalWeight: number;
  isValid: boolean;
  onChange: (key: WeightKey, pct: number) => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Sliders size={16} className="text-slate-500" />
          <h2 className="text-sm font-bold text-slate-800">Risk Agirliklari</h2>
        </div>
        <div className={clsx(
          'text-sm font-bold px-3 py-1 rounded-full transition-colors',
          isValid ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700',
        )}>
          {(totalWeight * 100).toFixed(0)}%
        </div>
      </div>

      <div className="space-y-4">
        {WEIGHT_META.map(({ key, label, color }) => {
          const pct = weights[key] * 100;
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs font-semibold text-slate-700">{label}</span>
                </div>
                <span className="text-sm font-bold tabular-nums" style={{ color }}>
                  {pct.toFixed(0)}%
                </span>
              </div>
              <input
                type="range" min={0} max={100} step={1} value={pct}
                onChange={e => onChange(key, Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, ${color} ${pct}%, #e2e8f0 ${pct}%)` }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 bg-slate-50 rounded-lg p-3">
        <code className="text-[11px] text-slate-600 font-mono leading-relaxed block">
          Skor = (F*{(weights.financial * 100).toFixed(0)}% + I*{(weights.reputation * 100).toFixed(0)}% + O*{(weights.operational * 100).toFixed(0)}% + Y*{(weights.legal * 100).toFixed(0)}%)
          {' '}* Olasilik * Hiz Carpani
        </code>
      </div>
    </div>
  );
}

function VelocityCard({
  high, medium, onHighChange, onMediumChange,
}: {
  high: number;
  medium: number;
  onHighChange: (v: number) => void;
  onMediumChange: (v: number) => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={16} className="text-amber-500" />
        <h2 className="text-sm font-bold text-slate-800">Hiz Carpanlari</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">Yuksek Hiz</label>
          <input
            type="number" step={0.1} min={1} max={5} value={high}
            onChange={e => onHighChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">Orta Hiz</label>
          <input
            type="number" step={0.1} min={1} max={5} value={medium}
            onChange={e => onMediumChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>
      </div>
      <p className="text-[10px] text-slate-400 mt-2">Dusuk Hiz carpani sabit 1.0 olarak uygulanir.</p>
    </div>
  );
}

function ThresholdsCard({
  critical, high, medium, onCriticalChange, onHighChange, onMediumChange,
}: {
  critical: number;
  high: number;
  medium: number;
  onCriticalChange: (v: number) => void;
  onHighChange: (v: number) => void;
  onMediumChange: (v: number) => void;
}) {
  const rows = [
    { label: 'Kritik Bolge', color: '#dc2626', value: critical, onChange: onCriticalChange },
    { label: 'Yuksek Bolge', color: '#f97316', value: high, onChange: onHighChange },
    { label: 'Orta Bolge', color: '#eab308', value: medium, onChange: onMediumChange },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Palette size={16} className="text-slate-500" />
        <h2 className="text-sm font-bold text-slate-800">Renk Skalasi (Esik Degerleri)</h2>
      </div>
      <div className="space-y-3">
        {rows.map(({ label, color, value, onChange }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-xs font-semibold text-slate-700 w-24">{label}</span>
            <span className="text-xs text-slate-400">&ge;</span>
            <input
              type="number" step={1} min={0} max={100} value={value}
              onChange={e => onChange(Number(e.target.value))}
              className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-center font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
            <div
              className="flex-1 h-2 rounded-full"
              style={{ background: `linear-gradient(to right, ${color}30, ${color})` }}
            />
          </div>
        ))}
        <div className="flex items-center gap-3 opacity-60">
          <div className="w-3 h-3 rounded-full shrink-0 bg-emerald-500" />
          <span className="text-xs font-semibold text-slate-700 w-24">Dusuk Bolge</span>
          <span className="text-xs text-slate-400">&lt;</span>
          <span className="w-20 px-2 py-1.5 text-xs text-center font-mono text-slate-400">{medium}</span>
          <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-emerald-100 to-emerald-500" />
        </div>
      </div>
    </div>
  );
}

function SaveBar({
  status, isValid, onSave, onReset,
}: {
  status: SaveStatus;
  isValid: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center gap-2">
        {status === 'saved' && <CheckCircle2 size={16} className="text-emerald-600" />}
        {status === 'error' && <XCircle size={16} className="text-red-600" />}
        <span className="text-xs font-semibold text-slate-500">
          {status === 'saved' && 'Kaydedildi'}
          {status === 'error' && 'Kayit hatasi'}
          {status === 'saving' && 'Kaydediliyor...'}
          {status === 'idle' && 'Degisiklikler kaydedilmedi'}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RotateCcw size={14} />
          Sifirla
        </button>
        <button
          onClick={onSave}
          disabled={!isValid || status === 'saving'}
          className={clsx(
            'flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-lg transition-all',
            isValid
              ? 'bg-slate-800 text-white hover:bg-slate-900'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed',
          )}
        >
          {status === 'saving'
            ? <Loader2 size={14} className="animate-spin" />
            : <Save size={14} />}
          Anayasayi Guncelle
        </button>
      </div>
    </div>
  );
}

function SimulatorPanel({
  weights, velocityHigh, velocityMedium,
  liveScore, liveZone,
  simImpacts, simLikelihood, simVelocity,
  onImpactChange, onLikelihoodChange, onVelocityChange,
}: {
  weights: Record<WeightKey, number>;
  velocityHigh: number;
  velocityMedium: number;
  liveScore: number;
  liveZone: { label: string; color: string; level: string };
  simImpacts: RiskImpacts;
  simLikelihood: number;
  simVelocity: VelocityLevel;
  onImpactChange: (key: WeightKey, val: number) => void;
  onLikelihoodChange: (val: number) => void;
  onVelocityChange: (val: VelocityLevel) => void;
}) {
  const activeMultiplier =
    simVelocity === 'high' ? velocityHigh :
    simVelocity === 'medium' ? velocityMedium : 1.0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 bg-slate-800 text-white flex items-center gap-3">
        <Activity size={18} />
        <div>
          <h3 className="text-sm font-bold">Canli Simulasyon</h3>
          <p className="text-[10px] text-slate-300">Parametreleri degistirin, sonucu aninda gorun</p>
        </div>
      </div>

      <div
        className="mx-5 mt-4 rounded-xl p-5 text-center transition-all duration-300"
        style={{ backgroundColor: liveZone.color + '15', borderLeft: `4px solid ${liveZone.color}` }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={liveScore.toFixed(2)}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-4xl font-black tabular-nums"
            style={{ color: liveZone.color }}
          >
            {liveScore.toFixed(2)}
          </motion.div>
        </AnimatePresence>
        <div
          className="mt-1 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold"
          style={{ backgroundColor: liveZone.color + '20', color: liveZone.color }}
        >
          {liveZone.level === 'CRITICAL' && <AlertTriangle size={12} />}
          {liveZone.label}
        </div>
      </div>

      <div className="p-5 space-y-3">
        {WEIGHT_META.map(({ key, label, color }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-600">{label}</span>
              <span className="text-[11px] font-bold tabular-nums" style={{ color }}>
                {simImpacts[key]}
              </span>
            </div>
            <input
              type="range" min={1} max={5} step={1}
              value={simImpacts[key]}
              onChange={e => onImpactChange(key, Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-slate-700"
            />
          </div>
        ))}

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-600">Olasilik</span>
            <span className="text-[11px] font-bold text-slate-800 tabular-nums">{simLikelihood}</span>
          </div>
          <input
            type="range" min={1} max={5} step={1}
            value={simLikelihood}
            onChange={e => onLikelihoodChange(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-slate-700"
          />
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">Risk Hizi</span>
          <div className="grid grid-cols-3 gap-2">
            {VELOCITY_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onVelocityChange(value)}
                className={clsx(
                  'text-xs font-semibold py-1.5 rounded-lg border transition-all',
                  simVelocity === value
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 pb-4">
        <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Hesaplama Detayi
          </span>
          <div className="text-[11px] text-slate-600 font-mono leading-relaxed">
            ({simImpacts.financial}*{(weights.financial * 100).toFixed(0)}%
            {' + '}{simImpacts.reputation}*{(weights.reputation * 100).toFixed(0)}%
            {' + '}{simImpacts.operational}*{(weights.operational * 100).toFixed(0)}%
            {' + '}{simImpacts.legal}*{(weights.legal * 100).toFixed(0)}%)
          </div>
          <div className="text-[11px] font-mono text-slate-600">
            {'* '}{simLikelihood} (Olasilik) * {activeMultiplier} (Hiz)
            {' = '}
            <span className="font-bold" style={{ color: liveZone.color }}>
              {liveScore.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}