import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import clsx from 'clsx';
import type { CCMAlert } from '@/entities/ccm/types';
import { RULE_LABELS, SEVERITY_LABELS, ALERT_STATUS_LABELS } from '@/entities/ccm/types';

interface AlertPanelProps {
  alerts: CCMAlert[];
}

const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  CRITICAL: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  HIGH: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  MEDIUM: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  LOW: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
};

function AlertCard({ alert }: { alert: CCMAlert }) {
  const [expanded, setExpanded] = useState(false);
  const colors = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.MEDIUM;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={clsx('border rounded-lg overflow-hidden', colors.border)}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className={clsx('w-full flex items-center gap-3 p-3 text-left', colors.bg)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={clsx('w-2 h-2 rounded-full flex-shrink-0', colors.dot)} />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 truncate">{alert.title}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={clsx('text-[10px] font-bold uppercase', colors.text)}>
                {SEVERITY_LABELS[alert.severity]}
              </span>
              <span className="text-[10px] text-slate-400">|</span>
              <span className="text-[10px] text-slate-500">
                {RULE_LABELS[alert.rule_triggered] || alert.rule_triggered}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-center">
            <div className={clsx('text-lg font-black', alert.risk_score >= 80 ? 'text-red-600' : alert.risk_score >= 60 ? 'text-orange-600' : 'text-amber-600')}>
              {alert.risk_score}
            </div>
            <div className="text-[9px] text-slate-400 -mt-0.5">RISK</div>
          </div>
          <span className={clsx(
            'text-[10px] font-bold px-2 py-0.5 rounded-full',
            alert.status === 'OPEN' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
          )}>
            {ALERT_STATUS_LABELS[alert.status]}
          </span>
          {expanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 bg-white border-t border-slate-100 space-y-2">
              <p className="text-xs text-slate-600 leading-relaxed">{alert.description}</p>

              <div className="bg-slate-50 rounded-lg p-3">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Kanit Detaylari</h5>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(alert.evidence_data).map(([key, value]) => (
                    <div key={key} className="text-[11px]">
                      <span className="text-slate-400">{key.replace(/_/g, ' ')}:</span>{' '}
                      <span className="font-semibold text-slate-700">
                        {Array.isArray(value) ? (value as string[]).join(', ') : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function AlertPanel({ alerts }: AlertPanelProps) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <Shield size={32} className="mb-2" />
        <p className="text-sm">Aktif alarm bulunamadi</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <AlertCard key={alert.id} alert={alert} />
      ))}
    </div>
  );
}
