import { motion } from 'framer-motion';
import { Bot, Zap, Shield, FlaskConical } from 'lucide-react';
import clsx from 'clsx';
import type { AIAgent } from '@/features/ai-agents/types';
import { ROLE_LABELS } from '@/features/ai-agents/types';

const ROLE_ICONS = {
  INVESTIGATOR: Shield,
  NEGOTIATOR: Zap,
  CHAOS_MONKEY: FlaskConical,
} as const;

interface AgentCardProps {
  agent: AIAgent;
  selected: boolean;
  onSelect: () => void;
}

export function AgentCard({ agent, selected, onSelect }: AgentCardProps) {
  const Icon = ROLE_ICONS[agent.role] || Bot;
  const isBusy = agent.status === 'BUSY';

  return (
    <motion.button
      onClick={onSelect}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'relative w-full text-left rounded-xl border-2 p-4 transition-all',
        selected
          ? 'border-slate-900 bg-slate-50 shadow-lg'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md',
      )}
    >
      {isBusy && (
        <div className="absolute top-3 right-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
          style={{ backgroundColor: agent.avatar_color }}
        >
          <Icon size={20} />
        </div>
        <div>
          <div className="text-sm font-black text-slate-900">{agent.name}</div>
          <div className="text-[10px] text-slate-500">{agent.codename}</div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-3">
        <span className={clsx(
          'text-[10px] font-bold px-1.5 py-0.5 rounded',
          isBusy ? 'bg-emerald-100 text-emerald-700' :
          agent.status === 'ERROR' ? 'bg-red-100 text-red-700' :
          'bg-slate-100 text-slate-600',
        )}>
          {isBusy ? 'AKTIF' : agent.status === 'ERROR' ? 'HATA' : 'HAZIR'}
        </span>
        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
          {ROLE_LABELS[agent.role]}
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {agent.capabilities.slice(0, 4).map((cap) => (
          <span key={cap} className="text-[9px] font-mono bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded">
            {cap}
          </span>
        ))}
        {agent.capabilities.length > 4 && (
          <span className="text-[9px] text-slate-400">+{agent.capabilities.length - 4}</span>
        )}
      </div>
    </motion.button>
  );
}
