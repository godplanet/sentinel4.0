import { motion } from 'framer-motion';
import {
  Sparkles, ShieldAlert, Shield, ShieldCheck, ShieldOff,
  AlertTriangle, CheckCircle2, ArrowUpRight, Eye, BookOpen,
  ChevronRight, Scale,
} from 'lucide-react';
import clsx from 'clsx';
import type { AIForensicInsight } from '@/shared/api/sentinel-ai';

interface SentinelInsightCardProps {
  insight: AIForensicInsight;
  onAcceptAction: () => void;
  onDismiss: () => void;
}

const RISK_CONFIG: Record<AIForensicInsight['risk_level'], {
  label: string;
  color: string;
  bg: string;
  border: string;
  glow: string;
  icon: typeof ShieldAlert;
}> = {
  CRITICAL: {
    label: 'KRITIK',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-300',
    glow: 'shadow-red-100',
    icon: ShieldOff,
  },
  HIGH: {
    label: 'YUKSEK',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    glow: 'shadow-red-50',
    icon: ShieldAlert,
  },
  MEDIUM: {
    label: 'ORTA',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    glow: 'shadow-amber-50',
    icon: Shield,
  },
  LOW: {
    label: 'DUSUK',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    glow: 'shadow-emerald-50',
    icon: ShieldCheck,
  },
};

const ACTION_CONFIG: Record<AIForensicInsight['suggested_action'], {
  color: string;
  bg: string;
  icon: typeof CheckCircle2;
}> = {
  CREATE_FINDING: { color: 'text-white', bg: 'bg-red-600 hover:bg-red-700', icon: AlertTriangle },
  ESCALATE: { color: 'text-white', bg: 'bg-amber-600 hover:bg-amber-700', icon: ArrowUpRight },
  MONITOR: { color: 'text-white', bg: 'bg-blue-600 hover:bg-blue-700', icon: Eye },
  DISMISS: { color: 'text-slate-700', bg: 'bg-slate-200 hover:bg-slate-300', icon: ShieldCheck },
};

export function SentinelInsightCard({ insight, onAcceptAction, onDismiss }: SentinelInsightCardProps) {
  const riskCfg = RISK_CONFIG[insight.risk_level];
  const RiskIcon = riskCfg.icon;
  const actionCfg = ACTION_CONFIG[insight.suggested_action];
  const ActionIcon = actionCfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      className={clsx(
        'border rounded-xl overflow-hidden shadow-lg',
        riskCfg.border, riskCfg.glow,
      )}
    >
      <div className={clsx('px-4 py-3 flex items-center justify-between', riskCfg.bg)}>
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-white/80 rounded-lg">
            <Sparkles size={14} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Sentinel Prime Analizi</p>
            <p className="text-[10px] text-slate-500">Adli Denetim Yapay Zeka Degerlendirmesi</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={clsx(
            'flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black',
            riskCfg.bg, riskCfg.color,
          )}>
            <RiskIcon size={11} />
            {riskCfg.label}
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-lg">
            <span className="text-[10px] font-bold text-slate-500">Guven:</span>
            <span className={clsx(
              'text-[10px] font-black',
              insight.confidence >= 85 ? 'text-emerald-600' :
              insight.confidence >= 70 ? 'text-amber-600' : 'text-slate-600',
            )}>
              {insight.confidence}%
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white space-y-3">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-700 leading-relaxed">{insight.reasoning}</p>
        </div>

        {insight.red_flags.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <AlertTriangle size={10} />
              Red Flags ({insight.red_flags.length})
            </p>
            <div className="space-y-1">
              {insight.red_flags.map((flag, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5"
                >
                  <ChevronRight size={10} className="mt-0.5 shrink-0" />
                  <span>{flag}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {insight.regulatory_refs.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Scale size={10} />
              Mevzuat Referanslari
            </p>
            <div className="flex flex-wrap gap-1">
              {insight.regulatory_refs.map((ref, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                  <BookOpen size={9} />
                  {ref}
                </span>
              ))}
            </div>
          </div>
        )}

        {insight.next_steps.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Onerilen Adimlar</p>
            <ol className="space-y-1">
              {insight.next_steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="shrink-0 w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[9px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <button
            onClick={onAcceptAction}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all',
              actionCfg.bg, actionCfg.color,
            )}
          >
            <ActionIcon size={13} />
            {insight.suggested_action_label}
          </button>
          <button
            onClick={onDismiss}
            className="px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </motion.div>
  );
}
