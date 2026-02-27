import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Terminal, CheckCircle2, Loader2, Lock } from 'lucide-react';

type StepStatus = 'pending' | 'running' | 'done';

interface SealStep {
  id: number;
  label: string;
  hashes?: string[];
}

const STEPS: SealStep[] = [
  {
    id: 1,
    label: 'Extracting Findings from Tiptap JSONB...',
    hashes: [
      'a3f8e2c1d9b47056...',
      '7d2c9a4f1e830b65...',
    ],
  },
  {
    id: 2,
    label: 'Applying SHA-256 Cryptographic Seals...',
    hashes: [
      'e5b9c3a7f2d14806f9e2c1a3d7b04856f2e9c1d3a5b7e904',
      'c1a3d7b04856f2e9c1d3a5b7e904e5b9c3a7f2d14806f9e2',
      'f9e2c1d3a5b7e904e5b9c3a7f2d14806c1a3d7b04856f2e9',
    ],
  },
  {
    id: 3,
    label: 'Injecting into Module 7 Action Engine...',
    hashes: [
      'dispatching → action_id: 8f4c-2a1b...',
      'dispatching → action_id: 9d3e-5f2c...',
      'dispatching → action_id: 1b7a-4e9d...',
    ],
  },
  {
    id: 4,
    label: 'Success: Actions Dispatched to Auditees.',
    hashes: [],
  },
];

function generateRollingHash(): string {
  const chars = '0123456789abcdef';
  return Array.from({ length: 48 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export const ReportSealerSimulator: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(['pending', 'pending', 'pending', 'pending']);
  const [currentStep, setCurrentStep] = useState(-1);
  const [rollingHashes, setRollingHashes] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const runSimulation = async () => {
    if (running) return;
    setRunning(true);
    setDone(false);
    setCurrentStep(-1);
    setStepStatuses(['pending', 'pending', 'pending', 'pending']);
    setRollingHashes([]);

    for (let i = 0; i < STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 300));
      setCurrentStep(i);
      setStepStatuses(prev => prev.map((s, idx) => idx === i ? 'running' : s));

      const step = STEPS[i];
      if (step.hashes && step.hashes.length > 0) {
        for (let h = 0; h < step.hashes.length; h++) {
          await new Promise(r => setTimeout(r, 400));
          setRollingHashes(prev => [...prev, generateRollingHash()]);
        }
      }

      await new Promise(r => setTimeout(r, 600));
      setStepStatuses(prev => prev.map((s, idx) => idx === i ? 'done' : s));
    }

    setDone(true);
    setRunning(false);
  };

  return (
    <div className="bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0">
            <Lock size={18} className="text-emerald-700" />
          </div>
          <div>
            <h3 className="font-serif text-slate-900 text-lg leading-snug">
              Module 6 &#8594; 7 Handover: The Iron Vault Sealing
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-sans">
              Cryptographic report publication &amp; action injection protocol
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="space-y-2">
          {STEPS.map((step, i) => {
            const status = stepStatuses[i];
            return (
              <div key={step.id} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  {status === 'done' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    </motion.div>
                  )}
                  {status === 'running' && (
                    <Loader2 size={16} className="text-blue-600 animate-spin" />
                  )}
                  {status === 'pending' && (
                    <div className="w-4 h-4 rounded-full border border-slate-300" />
                  )}
                </div>
                <span className={`text-sm font-sans transition-colors ${
                  status === 'done'
                    ? 'text-slate-700'
                    : status === 'running'
                    ? 'text-blue-700 font-medium'
                    : 'text-slate-400'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <AnimatePresence>
          {rollingHashes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-slate-100 rounded-lg p-3 overflow-hidden max-h-36 overflow-y-auto"
            >
              {rollingHashes.map((hash, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-mono text-[10px] text-emerald-700 leading-5"
                >
                  <span className="text-slate-400 mr-2 select-none">&gt;</span>
                  {hash}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl"
            >
              <ShieldCheck size={22} className="text-emerald-700 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-900 font-sans">Iron Vault Sealed</p>
                <p className="text-xs text-emerald-700 font-sans mt-0.5">
                  3 actions dispatched. Cryptographic integrity confirmed. Module 7 engine active.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={runSimulation}
          disabled={running}
          className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium font-sans transition-all
            bg-white/70 backdrop-blur-md border border-emerald-300 text-emerald-800
            hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-md
            disabled:opacity-60 disabled:cursor-not-allowed
            shadow-sm"
        >
          {running ? (
            <>
              <Loader2 size={16} className="animate-spin text-emerald-700" />
              Sealing in progress...
            </>
          ) : (
            <>
              <Terminal size={16} className="text-emerald-700" />
              Publish Report &amp; Seal Findings
            </>
          )}
        </button>
      </div>
    </div>
  );
};
