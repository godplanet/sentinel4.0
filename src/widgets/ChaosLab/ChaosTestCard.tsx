import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, ShieldCheck, ShieldAlert, ShieldOff, Loader2,
  Play, BarChart3, Clock, AlertTriangle,
} from 'lucide-react';
import clsx from 'clsx';
import { runSmurfingTest } from '@/features/chaos/ChaosMonkey';
import type { ChaosTestResult, ChaosStep, ControlReaction } from '@/features/chaos/types';
import { SCENARIO_LABELS, SCENARIO_DESCRIPTIONS } from '@/features/chaos/types';

const REACTION_CONFIG: Record<ControlReaction, { icon: typeof ShieldCheck; color: string; label: string; bg: string }> = {
  BLOCKED: { icon: ShieldCheck, color: 'text-emerald-600', label: 'ENGELLENDI (Basarili)', bg: 'bg-emerald-50 border-emerald-200' },
  DETECTED: { icon: ShieldAlert, color: 'text-amber-600', label: 'TESPIT EDILDI (Basarili)', bg: 'bg-amber-50 border-amber-200' },
  MISSED: { icon: ShieldOff, color: 'text-red-600', label: 'KACIRILDI (Basarisiz)', bg: 'bg-red-50 border-red-200' },
};

export function ChaosTestCard() {
  const [steps, setSteps] = useState<ChaosStep[]>([]);
  const [result, setResult] = useState<ChaosTestResult | null>(null);
  const [running, setRunning] = useState(false);

  const handleRun = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setResult(null);
    setSteps([]);

    try {
      const outcome = await runSmurfingTest((step) => {
        setSteps((prev) => {
          const idx = prev.findIndex((s) => s.label === step.label);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = step;
            return next;
          }
          return [...prev, step];
        });
      });
      setResult(outcome);
    } catch (err) {
      console.error('Chaos test failed:', err);
      setSteps((prev) => [...prev, { label: 'Test basarisiz oldu', status: 'error', detail: String(err) }]);
    } finally {
      setRunning(false);
    }
  }, [running]);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
            <Zap size={20} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{SCENARIO_LABELS.SMURFING_TEST}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{SCENARIO_DESCRIPTIONS.SMURFING_TEST}</p>
          </div>
          <button
            onClick={handleRun}
            disabled={running}
            className={clsx(
              'ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all',
              running
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-slate-800',
            )}
          >
            {running ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Calisiyor...
              </>
            ) : (
              <>
                <Play size={14} />
                Testi Baslat
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <span className="text-[10px] text-slate-500 block">Islem Sayisi</span>
            <span className="text-lg font-black text-slate-900">10</span>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <span className="text-[10px] text-slate-500 block">Islem Basina</span>
            <span className="text-lg font-black text-slate-900">&lt;5K TL</span>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <span className="text-[10px] text-slate-500 block">Toplam</span>
            <span className="text-lg font-black text-slate-900">&gt;50K TL</span>
          </div>
        </div>

        <AnimatePresence>
          {steps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="overflow-hidden"
            >
              <div className="bg-slate-950 rounded-lg border border-slate-800 p-3 space-y-1.5 font-mono text-xs mb-4">
                {steps.map((step, i) => (
                  <motion.div
                    key={`${step.label}-${i}`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2"
                  >
                    {step.status === 'running' ? (
                      <Loader2 size={12} className="animate-spin text-cyan-400 mt-0.5 shrink-0" />
                    ) : step.status === 'error' ? (
                      <AlertTriangle size={12} className="text-red-400 mt-0.5 shrink-0" />
                    ) : (
                      <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    )}
                    <div>
                      <span className={clsx(
                        step.status === 'running' ? 'text-cyan-400' :
                        step.status === 'error' ? 'text-red-400' :
                        'text-slate-400',
                      )}>
                        {step.label}
                      </span>
                      {step.detail && (
                        <span className="text-slate-500 block">{step.detail}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ChaosResultCard result={result} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChaosResultCard({ result }: { result: ChaosTestResult }) {
  const cfg = REACTION_CONFIG[result.controlReaction];
  const Icon = cfg.icon;

  return (
    <div className={clsx('border rounded-xl p-5', cfg.bg)}>
      <div className="flex items-center gap-3 mb-4">
        <Icon size={24} className={cfg.color} />
        <div>
          <h4 className="text-sm font-bold text-slate-900">Kaos Test Sonucu</h4>
          <span className={clsx('text-xs font-bold', cfg.color)}>{cfg.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white/70 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={12} className="text-slate-400" />
            <span className="text-[10px] text-slate-500">Saldiri</span>
          </div>
          <span className="text-xs font-bold text-slate-900">{SCENARIO_LABELS[result.scenario]}</span>
        </div>

        <div className="bg-white/70 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <BarChart3 size={12} className="text-slate-400" />
            <span className="text-[10px] text-slate-500">Enjeksiyon</span>
          </div>
          <span className="text-xs font-bold text-slate-900">
            {result.transactionsInjected} islem / {result.totalAmount.toLocaleString('tr-TR')} TL
          </span>
        </div>

        <div className="bg-white/70 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock size={12} className="text-slate-400" />
            <span className="text-[10px] text-slate-500">Tespit Suresi</span>
          </div>
          <span className="text-xs font-bold text-slate-900">{result.detectionTimeMs}ms</span>
        </div>

        <div className="bg-white/70 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle size={12} className="text-slate-400" />
            <span className="text-[10px] text-slate-500">Uyari</span>
          </div>
          <span className={clsx('text-xs font-bold', result.alertTriggered ? 'text-emerald-700' : 'text-red-700')}>
            {result.alertTriggered ? `Olusturuldu (#${result.alertId?.slice(0, 8)})` : 'Olusturulmadi'}
          </span>
        </div>
      </div>

      <div className="mt-3 p-2 bg-white/50 rounded-lg">
        <span className="text-[10px] text-slate-500">Batch ID: {result.batchId}</span>
        <span className="text-[10px] text-slate-500 ml-3">Zaman: {new Date(result.timestamp).toLocaleString('tr-TR')}</span>
      </div>
    </div>
  );
}
