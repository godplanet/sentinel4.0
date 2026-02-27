import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Loader2, CheckCircle2, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';

type Phase = 'idle' | 'phase1' | 'phase2' | 'success';

const MOCK_RESPONSE = {
  status: 'OK',
  action_id: 'ACT-2025-0334',
  target_system: 'Firewall Management API',
  payload_dispatched: true,
  rule_applied: 'BLOCK_EGRESS_8080',
  evidence_ref: 'EVD-SYSTEM-GENERATED-0012',
  file_hash: 'SYSTEM_GENERATED_HASH',
  timestamp: new Date().toISOString(),
};

interface AutoFixButtonProps {
  actionId?: string;
  label?: string;
}

export const AutoFixButton: React.FC<AutoFixButtonProps> = ({
  actionId = 'ACT-2025-0334',
  label = 'Execute Auto-Fix',
}) => {
  const [phase, setPhase] = useState<Phase>('idle');

  const handleFix = async () => {
    if (phase !== 'idle') return;
    setPhase('phase1');
    await new Promise(r => setTimeout(r, 1500));
    setPhase('phase2');
    await new Promise(r => setTimeout(r, 1500));
    setPhase('success');
    toast.success('Auto-Fix executed. Action closed & evidence sealed.', { duration: 4000 });
  };

  const reset = () => setPhase('idle');

  const phaseLabel: Record<Phase, string> = {
    idle: label,
    phase1: 'Initiating Edge Function...',
    phase2: 'Executing API Payload to Target System...',
    success: 'Remediation Complete',
  };

  return (
    <div className="space-y-4">
      <motion.button
        onClick={phase === 'success' ? reset : handleFix}
        disabled={phase === 'phase1' || phase === 'phase2'}
        whileTap={{ scale: 0.97 }}
        className={`relative flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold font-sans transition-all w-full overflow-hidden
          ${phase === 'success'
            ? 'bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100'
            : 'border border-transparent text-white hover:shadow-lg hover:shadow-amber-200/50'
          }
          disabled:opacity-70 disabled:cursor-not-allowed shadow-sm`}
        style={phase !== 'success' ? {
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0ea5e9 50%, #f59e0b 100%)',
        } : undefined}
      >
        {(phase === 'phase1' || phase === 'phase2') && (
          <Loader2 size={16} className="animate-spin" />
        )}
        {phase === 'idle' && <Zap size={16} className="text-amber-300" />}
        {phase === 'success' && <CheckCircle2 size={16} className="text-emerald-600" />}
        <span>{phaseLabel[phase]}</span>
        {phase === 'success' && (
          <span className="text-xs font-normal text-emerald-600 ml-1">(click to reset)</span>
        )}
      </motion.button>

      <AnimatePresence>
        {phase === 'success' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-100 rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Terminal size={13} className="text-slate-500" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">System API Response</span>
              </div>
              <pre className="font-mono text-[10px] text-slate-700 leading-relaxed overflow-x-auto">
                {JSON.stringify({ ...MOCK_RESPONSE, action_id: actionId }, null, 2)}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
