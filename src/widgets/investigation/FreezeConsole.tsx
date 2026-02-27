import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Snowflake, Play, Check, Loader2, AlertTriangle, Lock,
  Mail, MessageSquare, Server, Database, Hash, ShieldAlert,
} from 'lucide-react';
import clsx from 'clsx';
import type { FreezeStep, InvestigationCase } from '@/features/investigation/types';
import { buildFreezeSteps, executeFreezeProtocol } from '@/features/investigation/FreezeProtocol';

interface FreezeConsoleProps {
  caseData: InvestigationCase;
  onComplete: () => void;
}

const STEP_ICONS: Record<string, typeof Mail> = {
  exchange: Mail,
  slack: MessageSquare,
  ad: Server,
  erp: Database,
  hash: Hash,
  worm: Lock,
};

export function FreezeConsole({ caseData, onComplete }: FreezeConsoleProps) {
  const [steps, setSteps] = useState<FreezeStep[]>(() => buildFreezeSteps(['Ahmet B.']));
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(caseData.status === 'FROZEN');
  const [targets] = useState(['Ahmet B.']);

  const handleStep = useCallback((stepId: string, status: FreezeStep['status'], detail?: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, status, detail: detail || s.detail } : s)),
    );
  }, []);

  const executeFreeze = useCallback(async () => {
    setRunning(true);
    try {
      await executeFreezeProtocol(caseData.id, targets, handleStep);
      setComplete(true);
      onComplete();
    } catch (err) {
      console.error('Freeze failed:', err);
    } finally {
      setRunning(false);
    }
  }, [caseData.id, targets, handleStep, onComplete]);

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Snowflake size={16} className={clsx(
            complete ? 'text-cyan-400' : 'text-slate-500',
          )} />
          <span className="text-xs font-bold text-slate-300">Dijital Dondurma Protokolu</span>
          {complete && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              TAMAMLANDI
            </span>
          )}
        </div>

        {!complete && !running && (
          <button
            onClick={executeFreeze}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-[11px] font-bold rounded-lg hover:bg-red-500 transition-colors"
          >
            <ShieldAlert size={12} />
            DONDURMAYI BASLAT
          </button>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2 mb-3 px-2 py-1.5 bg-slate-900 rounded-lg border border-slate-700">
          <AlertTriangle size={10} className="text-amber-500 shrink-0" />
          <span className="text-[10px] text-slate-400">
            Hedefler: <span className="text-slate-200 font-mono">{targets.join(', ')}</span> -- Tum dijital izler dondurulacak
          </span>
        </div>

        {steps.map((step, i) => {
          const Icon = STEP_ICONS[step.id] || Server;
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: step.status === 'pending' ? 0.4 : 1,
              }}
              transition={{ delay: i * 0.05 }}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all',
                step.status === 'done' && 'bg-emerald-950/30 border-emerald-800/30',
                step.status === 'running' && 'bg-cyan-950/30 border-cyan-700/40',
                step.status === 'error' && 'bg-red-950/30 border-red-800/30',
                step.status === 'pending' && 'bg-slate-900/50 border-slate-800/50',
              )}
            >
              <div className={clsx(
                'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                step.status === 'done' && 'bg-emerald-500/20',
                step.status === 'running' && 'bg-cyan-500/20',
                step.status === 'error' && 'bg-red-500/20',
                step.status === 'pending' && 'bg-slate-700/30',
              )}>
                {step.status === 'done' && <Check size={12} className="text-emerald-400" />}
                {step.status === 'running' && <Loader2 size={12} className="text-cyan-400 animate-spin" />}
                {step.status === 'error' && <AlertTriangle size={12} className="text-red-400" />}
                {step.status === 'pending' && <Icon size={12} className="text-slate-600" />}
              </div>

              <div className="flex-1 min-w-0">
                <span className={clsx(
                  'text-[11px] font-medium block',
                  step.status === 'done' && 'text-emerald-400',
                  step.status === 'running' && 'text-cyan-300',
                  step.status === 'pending' && 'text-slate-500',
                )}>
                  {step.label}
                </span>
                {step.detail && (
                  <span className="text-[9px] text-slate-500 block mt-0.5">{step.detail}</span>
                )}
              </div>

              <span className="text-[9px] text-slate-600 font-mono shrink-0">{step.system}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
