import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, ChevronLeft, Database, Server, CreditCard,
  CheckCircle2, Zap, ShieldAlert, Shield, ShieldCheck,
  Activity, AlertTriangle, FileCheck,
} from 'lucide-react';
import clsx from 'clsx';
import type { ProbeCategory, ProbeSeverity } from '@/entities/probe/model/types';

interface ProbeBuilderWizardProps {
  onSave: (config: WizardResult) => void;
  onClose: () => void;
}

export interface WizardResult {
  title: string;
  description: string;
  category: ProbeCategory;
  severity: ProbeSeverity;
  source: string;
  conditions: Condition[];
  action: 'ALERT' | 'FINDING';
  schedule: string;
}

interface Condition {
  field: string;
  operator: string;
  value: string;
}

const SOURCES = [
  { id: 'sap-gl', label: 'SAP Genel Muhasebe', icon: Database, desc: 'GL islemleri ve hesap hareketleri' },
  { id: 'oracle-hr', label: 'Oracle HR', icon: Server, desc: 'Personel ve izin verileri' },
  { id: 'swift', label: 'SWIFT Transactions', icon: CreditCard, desc: 'Uluslararasi para transferleri' },
  { id: 'core-banking', label: 'Core Banking', icon: Database, desc: 'Mevduat, kredi, hesap islemleri' },
  { id: 'card-system', label: 'Kart Islem Sistemi', icon: CreditCard, desc: 'Kredi/banka karti islemleri' },
  { id: 'aml-system', label: 'AML/KYC Sistemi', icon: ShieldAlert, desc: 'Kara para aklama kontrolleri' },
];

const SOURCE_FIELDS: Record<string, string[]> = {
  'sap-gl': ['Amount', 'Account', 'Cost Center', 'Document Type', 'Posting Date', 'User', 'Company Code'],
  'oracle-hr': ['Employee ID', 'Department', 'Leave Days', 'Overtime Hours', 'Salary', 'Grade', 'Manager'],
  'swift': ['Transfer Amount', 'Beneficiary Country', 'Ordering Bank', 'Time', 'Currency', 'Reference'],
  'core-banking': ['Transaction Amount', 'Account Type', 'Branch', 'Channel', 'Time', 'Customer Risk'],
  'card-system': ['Transaction Amount', 'Merchant Category', 'Country', 'Time', 'Card Type', 'POS Entry Mode'],
  'aml-system': ['Alert Score', 'Customer Risk', 'Transaction Count', 'Country Risk', 'PEP Status', 'SAR Filed'],
};

const OPERATORS = ['>', '<', '>=', '<=', '=', '!=', 'CONTAINS', 'IN', 'BETWEEN', 'IS'];

const VALUE_PRESETS: Record<string, string[]> = {
  'Time': ['Weekend', 'After Hours (18:00-08:00)', 'Holiday', 'Last 24h', 'Last 7 days'],
  'Country': ['High Risk', 'Sanctioned', 'FATF Grey List'],
  'Amount': ['500.000', '1.000.000', '5.000.000', '10.000.000'],
};

const CATEGORIES: { id: ProbeCategory; label: string; icon: typeof ShieldAlert; color: string; bg: string }[] = [
  { id: 'FRAUD', label: 'Fraud Detection', icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  { id: 'OPS', label: 'Operations', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { id: 'COMPLIANCE', label: 'Compliance', icon: FileCheck, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
];

const SEVERITIES: { id: ProbeSeverity; label: string; icon: typeof ShieldAlert; color: string; bg: string }[] = [
  { id: 'HIGH', label: 'Yuksek', icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  { id: 'MEDIUM', label: 'Orta', icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  { id: 'LOW', label: 'Dusuk', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
];

const SCHEDULES = [
  { value: '*/15 * * * *', label: 'Her 15 dakika' },
  { value: '0 */1 * * *', label: 'Saatlik' },
  { value: '0 */4 * * *', label: 'Her 4 saat' },
  { value: '0 8 * * 1-5', label: 'Is gunleri sabah 08:00' },
  { value: '0 0 * * *', label: 'Gunluk (Gece yarisi)' },
  { value: '0 0 * * 1', label: 'Haftalik (Pazartesi)' },
];

export function ProbeBuilderWizard({ onSave, onClose }: ProbeBuilderWizardProps) {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProbeCategory>('FRAUD');
  const [severity, setSeverity] = useState<ProbeSeverity>('HIGH');
  const [selectedSource, setSelectedSource] = useState('');
  const [conditions, setConditions] = useState<Condition[]>([{ field: '', operator: '>', value: '' }]);
  const [action, setAction] = useState<'ALERT' | 'FINDING'>('ALERT');
  const [schedule, setSchedule] = useState('0 */4 * * *');

  const fields = SOURCE_FIELDS[selectedSource] || [];

  const addCondition = () => {
    setConditions([...conditions, { field: '', operator: '>', value: '' }]);
  };

  const removeCondition = (index: number) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter((_, i) => i !== index));
    }
  };

  const updateCondition = (index: number, key: keyof Condition, value: string) => {
    setConditions(conditions.map((c, i) => i === index ? { ...c, [key]: value } : c));
  };

  const canProceed = () => {
    if (step === 0) return title.trim() && selectedSource;
    if (step === 1) return conditions.every(c => c.field && c.operator && c.value);
    return true;
  };

  const handleFinish = () => {
    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      severity,
      source: selectedSource,
      conditions,
      action,
      schedule,
    });
  };

  const STEPS = [
    { label: 'Kaynak Secimi', icon: Database },
    { label: 'Kural Motoru', icon: Zap },
    { label: 'Aksiyon', icon: CheckCircle2 },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 border border-blue-500/30 rounded-xl">
              <Zap size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Probe Builder</h2>
              <p className="text-xs text-slate-400">Kod yazmadan izleme kurali olustur</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => {
              const SIcon = s.icon;
              const isActive = step === i;
              const isDone = step > i;
              return (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className={clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all flex-1',
                    isActive ? 'bg-blue-100 text-blue-700' :
                    isDone ? 'bg-emerald-50 text-emerald-700' :
                    'bg-white text-slate-400 border border-slate-200'
                  )}>
                    {isDone ? <CheckCircle2 size={14} /> : <SIcon size={14} />}
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{i + 1}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <ChevronRight size={14} className="text-slate-300 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Probe Adi</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="orn. Haftasonu EFT Kontrol"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Aciklama</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ne izleniyor?"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(c => {
                    const CIcon = c.icon;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setCategory(c.id)}
                        className={clsx(
                          'flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-xs font-bold transition-all',
                          category === c.id ? `${c.bg} ${c.color} border-current` : 'bg-white border-slate-200 text-slate-500'
                        )}
                      >
                        <CIcon size={14} />
                        {c.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {SEVERITIES.map(s => {
                    const SIcon = s.icon;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSeverity(s.id)}
                        className={clsx(
                          'flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-xs font-bold transition-all',
                          severity === s.id ? `${s.bg} ${s.color} border-current` : 'bg-white border-slate-200 text-slate-500'
                        )}
                      >
                        <SIcon size={14} />
                        {s.label}
                      </button>
                    );
                  })}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Veri Kaynagi Sec</label>
                  <div className="grid grid-cols-2 gap-3">
                    {SOURCES.map(src => {
                      const SIcon = src.icon;
                      return (
                        <button
                          key={src.id}
                          onClick={() => setSelectedSource(src.id)}
                          className={clsx(
                            'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all',
                            selectedSource === src.id
                              ? 'bg-blue-50 border-blue-400 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          )}
                        >
                          <div className={clsx(
                            'p-2 rounded-lg',
                            selectedSource === src.id ? 'bg-blue-100' : 'bg-slate-100'
                          )}>
                            <SIcon size={18} className={selectedSource === src.id ? 'text-blue-600' : 'text-slate-400'} />
                          </div>
                          <div>
                            <p className={clsx(
                              'text-sm font-bold',
                              selectedSource === src.id ? 'text-blue-900' : 'text-slate-700'
                            )}>{src.label}</p>
                            <p className="text-[11px] text-slate-500">{src.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-blue-900 mb-1">Kural Motoru</h4>
                  <p className="text-xs text-blue-700">
                    Asagidaki kosullari tanimlayarak hangi islemlerin istisna olarak isaretlenecegini belirleyin.
                  </p>
                </div>

                <div className="space-y-3">
                  {conditions.map((cond, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {i > 0 && (
                        <span className="shrink-0 text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">AND</span>
                      )}
                      <select
                        value={cond.field}
                        onChange={(e) => updateCondition(i, 'field', e.target.value)}
                        className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Alan sec...</option>
                        {fields.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <select
                        value={cond.operator}
                        onChange={(e) => updateCondition(i, 'operator', e.target.value)}
                        className="w-24 px-2 py-2.5 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
                      </select>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={cond.value}
                          onChange={(e) => updateCondition(i, 'value', e.target.value)}
                          placeholder="Deger girin..."
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          list={`presets-${i}`}
                        />
                        {cond.field && VALUE_PRESETS[cond.field] && (
                          <datalist id={`presets-${i}`}>
                            {VALUE_PRESETS[cond.field].map(v => <option key={v} value={v} />)}
                          </datalist>
                        )}
                      </div>
                      {conditions.length > 1 && (
                        <button
                          onClick={() => removeCondition(i)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={addCondition}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  + Kosul Ekle
                </button>

                <div className="bg-slate-900 rounded-xl p-4 mt-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Onizleme (SQL)</p>
                  <pre className="text-xs text-emerald-400 font-mono leading-relaxed">
{`SELECT * FROM ${selectedSource.replace('-', '_')}
WHERE ${conditions.map((c, i) =>
  `${i > 0 ? '  AND ' : '  '}${c.field || '?'} ${c.operator} '${c.value || '?'}'`
).join('\n')};`}
                  </pre>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Istisna Tespit Edildiginde</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setAction('ALERT')}
                      className={clsx(
                        'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all',
                        action === 'ALERT'
                          ? 'bg-amber-50 border-amber-400'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <AlertTriangle size={24} className={action === 'ALERT' ? 'text-amber-600' : 'text-slate-400'} />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Alert Olustur</p>
                        <p className="text-[11px] text-slate-500">Istisna kuyrugunaekle</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setAction('FINDING')}
                      className={clsx(
                        'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all',
                        action === 'FINDING'
                          ? 'bg-red-50 border-red-400'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <ShieldAlert size={24} className={action === 'FINDING' ? 'text-red-600' : 'text-slate-400'} />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Bulgu Olustur</p>
                        <p className="text-[11px] text-slate-500">Otomatik bulgu kaydialus</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Calisma Zamanlama</label>
                  <div className="grid grid-cols-3 gap-2">
                    {SCHEDULES.map(s => (
                      <button
                        key={s.value}
                        onClick={() => setSchedule(s.value)}
                        className={clsx(
                          'px-3 py-2.5 rounded-lg border-2 text-xs font-bold transition-all',
                          schedule === s.value
                            ? 'bg-blue-50 border-blue-400 text-blue-700'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <h4 className="text-sm font-bold text-emerald-900">Probe Ozeti</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div><span className="text-slate-500">Ad:</span> <strong>{title || '-'}</strong></div>
                    <div><span className="text-slate-500">Kategori:</span> <strong>{category}</strong></div>
                    <div><span className="text-slate-500">Kaynak:</span> <strong>{selectedSource || '-'}</strong></div>
                    <div><span className="text-slate-500">Ciddiyet:</span> <strong>{severity}</strong></div>
                    <div><span className="text-slate-500">Kosul:</span> <strong>{conditions.length} kural</strong></div>
                    <div><span className="text-slate-500">Aksiyon:</span> <strong>{action === 'ALERT' ? 'Alert' : 'Bulgu'}</strong></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ChevronLeft size={16} />
            {step > 0 ? 'Geri' : 'Iptal'}
          </button>

          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Devam
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <CheckCircle2 size={16} />
              Probe Olustur
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
