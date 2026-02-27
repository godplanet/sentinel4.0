import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'lucide-react';
import type { ThoughtStep } from '@/features/ai-agents/types';
import { THOUGHT_COLORS, THOUGHT_LABELS } from '@/features/ai-agents/types';

export interface TerminalLine {
  step: ThoughtStep;
  stepNumber: number;
  timestamp: string;
}

interface LiveTerminalProps {
  lines: TerminalLine[];
  isRunning: boolean;
  agentName?: string;
}

export function LiveTerminal({ lines, isRunning, agentName }: LiveTerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines.length]);

  return (
    <div className="rounded-xl border-2 border-slate-800 bg-slate-950 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
        </div>
        <div className="flex items-center gap-1.5 ml-2">
          <Terminal size={12} className="text-slate-500" />
          <span className="text-[11px] font-mono text-slate-400">
            SENTINEL PROBE v2.0 {agentName ? `-- ${agentName}` : '-- Ajan Muhakeme Izi'}
          </span>
        </div>
        {isRunning && (
          <div className="ml-auto flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-mono text-emerald-400">AKTIF</span>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="p-4 h-80 overflow-y-auto font-mono text-xs space-y-1.5">
        {lines.length === 0 && !isRunning && (
          <div className="text-slate-600 text-center py-8">
            <p>$ Bir ajani gorevlendirin veya mevcut calismayi secin...</p>
            <p className="mt-1 text-slate-700">$ _</p>
          </div>
        )}

        {lines.length === 0 && isRunning && (
          <div className="text-emerald-500">
            <p>$ Ajan baslatiliyor...</p>
          </div>
        )}

        <AnimatePresence>
          {lines.map((line, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-2 leading-relaxed"
            >
              <span className="text-slate-600 shrink-0">[{line.timestamp}]</span>
              <span className={`shrink-0 font-bold ${THOUGHT_COLORS[line.step.type]}`}>
                [{THOUGHT_LABELS[line.step.type]}]
              </span>
              <span className={
                line.step.type === 'CONCLUSION'
                  ? line.step.content.includes('BASARILI') || line.step.content.includes('SUCCESS')
                    ? 'text-emerald-300'
                    : 'text-rose-300'
                  : 'text-slate-300'
              }>
                {line.step.content}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {isRunning && lines.length > 0 && (
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="text-emerald-500"
          >
            $ _
          </motion.div>
        )}
      </div>
    </div>
  );
}
