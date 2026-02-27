import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Loader2, ArrowRight, CheckCircle2, Copy, Zap,
  Database, ShieldAlert, Shield, ShieldCheck, Clock, Code2,
  ChevronDown, ChevronUp, AlertTriangle,
} from 'lucide-react';
import clsx from 'clsx';
import { generateProbeFromText, type AIProbeConfig } from '@/shared/api/sentinel-ai';
import type { ProbeCategory, ProbeSeverity } from '@/entities/probe/model/types';

interface TextToRulePanelProps {
  onCreateProbe: (config: AIProbeConfig) => void;
}

const CATEGORY_STYLE: Record<ProbeCategory, { label: string; color: string; bg: string }> = {
  FRAUD: { label: 'Fraud', color: 'text-red-600', bg: 'bg-red-100' },
  OPS: { label: 'Operations', color: 'text-blue-600', bg: 'bg-blue-100' },
  COMPLIANCE: { label: 'Compliance', color: 'text-teal-600', bg: 'bg-teal-100' },
};

const SEVERITY_STYLE: Record<ProbeSeverity, { label: string; color: string; bg: string; icon: typeof ShieldAlert }> = {
  HIGH: { label: 'Yuksek', color: 'text-red-600', bg: 'bg-red-100', icon: ShieldAlert },
  MEDIUM: { label: 'Orta', color: 'text-amber-600', bg: 'bg-amber-100', icon: Shield },
  LOW: { label: 'Dusuk', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: ShieldCheck },
};

const QUICK_PROMPTS = [
  { label: 'Cift odemeleri yakala', icon: '2x' },
  { label: 'Haftasonu islemleri izle', icon: 'WE' },
  { label: 'Bolunmus islem tespiti', icon: '$/' },
  { label: 'Gorev ayriligi ihlali bul', icon: 'SoD' },
  { label: 'KVKK veri erisim kontrolu', icon: 'KV' },
  { label: 'Sahte tedarikci taramasi', icon: 'VN' },
];

export function TextToRulePanel({ onCreateProbe }: TextToRulePanelProps) {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<AIProbeConfig | null>(null);
  const [showSQL, setShowSQL] = useState(false);
  const [created, setCreated] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const THINKING_STEPS = [
    'Dogal dil isleniyor...',
    'Sema haritasi cikartiliyor...',
    'Risk desenleri taranıyor...',
    'SQL kurali olusturuluyor...',
    'Sentinel Prime dogruluyor...',
  ];

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setThinkingStep(prev => {
          if (prev < THINKING_STEPS.length - 1) return prev + 1;
          return prev;
        });
      }, 500);
      return () => clearInterval(interval);
    }
    setThinkingStep(0);
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (!input.trim() || isGenerating) return;
    setIsGenerating(true);
    setResult(null);
    setCreated(false);
    setShowSQL(false);

    try {
      const config = await generateProbeFromText(input.trim());
      setResult(config);
    } catch {
      /* silent */
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreate = () => {
    if (result) {
      onCreateProbe(result);
      setCreated(true);
    }
  };

  const handleQuickPrompt = (text: string) => {
    setInput(text);
    setResult(null);
    setCreated(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-xl">
            <Sparkles size={18} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Yapay Zeka ile Kural Olustur</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Ne izlemek istediginizi dogal dilde yazin, Sentinel Prime kurali otomatik olusturur
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="orn. &quot;Cift odemeleri yakala&quot; veya &quot;Haftasonu yapilan yuksek tutarli islemleri izle&quot;"
            rows={2}
            className="w-full px-4 py-3 pr-28 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-slate-50"
          />
          <button
            onClick={handleGenerate}
            disabled={!input.trim() || isGenerating}
            className={clsx(
              'absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all',
              isGenerating
                ? 'bg-blue-100 text-blue-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-sm'
            )}
          >
            {isGenerating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            {isGenerating ? 'Dusunuyor' : 'Olustur'}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map(qp => (
            <button
              key={qp.label}
              onClick={() => handleQuickPrompt(qp.label)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-all"
            >
              <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-1 py-0.5 rounded">{qp.icon}</span>
              {qp.label}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Zap size={16} className="text-blue-500" />
                  </motion.div>
                  <span className="text-xs font-bold text-slate-700">Sentinel Prime Analiz Ediyor</span>
                </div>
                <div className="space-y-1.5">
                  {THINKING_STEPS.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: i <= thinkingStep ? 1 : 0.3, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-2 text-xs"
                    >
                      {i < thinkingStep ? (
                        <CheckCircle2 size={12} className="text-emerald-500" />
                      ) : i === thinkingStep ? (
                        <Loader2 size={12} className="animate-spin text-blue-500" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-slate-300" />
                      )}
                      <span className={i <= thinkingStep ? 'text-slate-700' : 'text-slate-400'}>{step}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-3"
            >
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-2 mb-2">
                  <Sparkles size={14} className="text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-900 leading-relaxed italic">
                    "{result.reasoning}"
                  </p>
                </div>
                <p className="text-[10px] text-blue-600 font-bold text-right">-- Sentinel Prime</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{result.title}</h4>
                  <div className="flex items-center gap-1.5">
                    <span className={clsx(
                      'text-[9px] font-bold px-2 py-0.5 rounded-md',
                      CATEGORY_STYLE[result.category].bg,
                      CATEGORY_STYLE[result.category].color,
                    )}>
                      {CATEGORY_STYLE[result.category].label}
                    </span>
                    {(() => {
                      const sev = SEVERITY_STYLE[result.severity];
                      const SIcon = sev.icon;
                      return (
                        <span className={clsx(
                          'inline-flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 rounded-md',
                          sev.bg, sev.color,
                        )}>
                          <SIcon size={9} />
                          {sev.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{result.description}</p>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Database size={12} />
                    <span className="font-mono">{result.source}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock size={12} />
                    <span className="font-mono">{result.schedule_cron}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <AlertTriangle size={12} />
                    <span>Esik: {result.risk_threshold}</span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => setShowSQL(!showSQL)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <Code2 size={12} />
                    SQL Onizleme
                    {showSQL ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  <AnimatePresence>
                    {showSQL && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 bg-slate-900 rounded-lg p-3 relative group">
                          <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed">
                            {result.query_payload}
                          </pre>
                          <button
                            onClick={() => navigator.clipboard.writeText(result.query_payload)}
                            className="absolute top-2 right-2 p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Copy size={12} className="text-slate-300" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {created ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-200">
                    <CheckCircle2 size={16} />
                    Probe Olusturuldu
                  </div>
                ) : (
                  <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl text-sm font-bold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/15"
                  >
                    <CheckCircle2 size={16} />
                    Kabul Et ve Probe Olustur
                  </button>
                )}
                <button
                  onClick={() => { setResult(null); setCreated(false); inputRef.current?.focus(); }}
                  className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Yeniden Dene
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
