import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, AlertTriangle, ChevronRight, ChevronLeft, CheckCircle2,
  Zap, Shield, Target, BarChart3
} from 'lucide-react';
import clsx from 'clsx';

interface AdHocRiskData {
  title: string;
  description: string;
  category: string;
  owner: string;
  impact: number;
  likelihood: number;
  volume: number;
  controlDescription: string;
  controlEffectiveness: number;
  mitigationPlan: string;
}

interface AdHocRiskWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AdHocRiskData) => Promise<void>;
  engagementId?: string;
}

const STEPS = [
  { key: 'identify', label: 'Tanimlama', icon: AlertTriangle },
  { key: 'assess', label: 'Degerlendirme', icon: Target },
  { key: 'control', label: 'Kontrol', icon: Shield },
  { key: 'review', label: 'Ozet', icon: CheckCircle2 },
];

const CATEGORIES = ['Operasyonel', 'Finansal', 'BT', 'Uyumluluk', 'Itibar', 'Stratejik'];

export function AdHocRiskWizard({ isOpen, onClose, onSubmit }: AdHocRiskWizardProps) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<AdHocRiskData>({
    title: '', description: '', category: 'Operasyonel', owner: '',
    impact: 3, likelihood: 3, volume: 3,
    controlDescription: '', controlEffectiveness: 0.5,
    mitigationPlan: '',
  });

  const riskScore = form.impact * form.likelihood;
  const residualScore = Math.round(riskScore * (1 - form.controlEffectiveness));

  const canProceed = () => {
    switch (step) {
      case 0: return form.title.trim().length > 0;
      case 1: return true;
      case 2: return true;
      case 3: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await onSubmit(form);
      onClose();
    } catch (err) {
      console.error('Failed to create ad-hoc risk:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap size={22} className="text-white" />
              <div>
                <h2 className="text-lg font-bold text-white">Ad-Hoc Risk Tanimlama</h2>
                <p className="text-xs text-orange-200">Saha calismasi sirasinda hizli risk kaydi</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30">
              <X size={16} className="text-white" />
            </button>
          </div>

          <div className="flex items-center gap-1 px-6 py-3 bg-slate-50 border-b border-slate-200">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.key} className="flex items-center gap-1 flex-1">
                  <div className={clsx(
                    'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
                    i < step ? 'bg-green-500 text-white' :
                    i === step ? 'bg-orange-500 text-white' :
                    'bg-slate-200 text-slate-400'
                  )}>
                    {i < step ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                  </div>
                  <span className={clsx('text-[10px] font-semibold whitespace-nowrap', i === step ? 'text-orange-600' : 'text-slate-400')}>
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && <div className={clsx('flex-1 h-px mx-1', i < step ? 'bg-green-400' : 'bg-slate-200')} />}
                </div>
              );
            })}
          </div>

          <div className="flex-1 overflow-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {step === 0 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Risk Basligi <span className="text-red-500">*</span></label>
                      <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg text-sm" placeholder="Tespit edilen risk" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Aciklama</label>
                      <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg text-sm min-h-[80px]" placeholder="Risk detaylari..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Kategori</label>
                        <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg text-sm">
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Risk Sahibi</label>
                        <input type="text" value={form.owner} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg text-sm" placeholder="Sorumlu kisi" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <ScoreSlider label="Etki" value={form.impact} onChange={v => setForm(p => ({ ...p, impact: v }))} />
                    <ScoreSlider label="Olasilik" value={form.likelihood} onChange={v => setForm(p => ({ ...p, likelihood: v }))} />
                    <ScoreSlider label="Hacim" value={form.volume} onChange={v => setForm(p => ({ ...p, volume: v }))} />

                    <div className={clsx(
                      'p-4 rounded-lg border-2 text-center',
                      riskScore >= 15 ? 'bg-red-50 border-red-200' :
                      riskScore >= 10 ? 'bg-orange-50 border-orange-200' :
                      riskScore >= 5 ? 'bg-yellow-50 border-yellow-200' :
                      'bg-green-50 border-green-200'
                    )}>
                      <p className="text-xs font-medium text-slate-500">Dogal Risk Skoru</p>
                      <p className="text-3xl font-black mt-1">{riskScore}</p>
                      <p className="text-xs text-slate-500 mt-1">Etki ({form.impact}) x Olasilik ({form.likelihood})</p>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Mevcut Kontrol</label>
                      <textarea value={form.controlDescription} onChange={e => setForm(p => ({ ...p, controlDescription: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg text-sm min-h-[60px]" placeholder="Kontrol aciklamasi..." />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-slate-700">Kontrol Etkinligi</label>
                        <span className="text-sm font-bold text-blue-600">{Math.round(form.controlEffectiveness * 100)}%</span>
                      </div>
                      <input type="range" min={0} max={100} value={form.controlEffectiveness * 100}
                        onChange={e => setForm(p => ({ ...p, controlEffectiveness: Number(e.target.value) / 100 }))}
                        className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Iyilestirme Plani</label>
                      <textarea value={form.mitigationPlan} onChange={e => setForm(p => ({ ...p, mitigationPlan: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg text-sm min-h-[60px]" placeholder="Onerilen aksiyon plani..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="bg-slate-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-slate-500">Dogal Risk</p>
                        <p className="text-2xl font-black text-slate-800">{riskScore}</p>
                      </div>
                      <div className={clsx('rounded-lg p-4 text-center',
                        residualScore >= 15 ? 'bg-red-50' : residualScore >= 10 ? 'bg-orange-50' : residualScore >= 5 ? 'bg-yellow-50' : 'bg-green-50'
                      )}>
                        <p className="text-xs text-slate-500">Artik Risk</p>
                        <p className="text-2xl font-black">{residualScore}</p>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                      <SummaryRow label="Risk Basligi" value={form.title} />
                      <SummaryRow label="Kategori" value={form.category} />
                      <SummaryRow label="Risk Sahibi" value={form.owner || '-'} />
                      <SummaryRow label="Dogal Risk" value={`${riskScore} (E:${form.impact} x O:${form.likelihood})`} />
                      <SummaryRow label="Kontrol Etkinligi" value={`${Math.round(form.controlEffectiveness * 100)}%`} />
                      <SummaryRow label="Artik Risk" value={String(residualScore)} />
                    </div>
                    {form.description && (
                      <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <p className="text-[10px] text-slate-500 font-medium mb-1">Aciklama</p>
                        <p className="text-xs text-slate-700">{form.description}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 rounded-b-2xl flex items-center justify-between">
            <button
              onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
              className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium text-sm"
            >
              <ChevronLeft size={14} />
              {step > 0 ? 'Geri' : 'Iptal'}
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-1 px-5 py-2 bg-orange-500 text-white rounded-lg font-semibold text-sm hover:bg-orange-600 disabled:bg-slate-400"
              >
                Ileri <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 disabled:bg-slate-400"
              >
                {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={14} />}
                Riski Kaydet
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ScoreSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const labels = ['', 'Cok Dusuk', 'Dusuk', 'Orta', 'Yuksek', 'Cok Yuksek'];
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-sm font-bold text-blue-600">{value} - {labels[value]}</span>
      </div>
      <input type="range" min={1} max={5} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600" />
      <div className="flex justify-between text-[9px] text-slate-400 mt-1">
        {labels.slice(1).map(l => <span key={l}>{l}</span>)}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-semibold text-slate-800">{value}</span>
    </div>
  );
}
