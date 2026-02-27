import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Search,
  Ghost,
  Layers,
  BarChart3,
} from 'lucide-react';
import clsx from 'clsx';
import type { CCMAlert } from '@/entities/ccm/types';
import { RULE_LABELS, SEVERITY_LABELS } from '@/entities/ccm/types';
import { updateAlertStatus } from '@/entities/ccm/api';

interface Props {
  alerts: CCMAlert[];
  onStatusChange?: () => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-600 text-white',
  HIGH: 'bg-orange-500 text-white',
  MEDIUM: 'bg-amber-500 text-white',
  LOW: 'bg-blue-500 text-white',
};

const SCORE_COLOR = (s: number) =>
  s >= 80 ? 'text-red-600' : s >= 60 ? 'text-orange-500' : s >= 40 ? 'text-amber-500' : 'text-blue-500';

const RULE_ICONS: Record<string, React.ElementType> = {
  GHOST_EMPLOYEE: Ghost,
  STRUCTURING: Layers,
  BENFORD_VIOLATION: BarChart3,
};

export function RuleAlertFeed({ alerts, onStatusChange }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleInvestigate = async (alertId: string) => {
    setUpdatingId(alertId);
    try {
      await updateAlertStatus(alertId, 'INVESTIGATING');
      onStatusChange?.();
    } finally {
      setUpdatingId(null);
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle size={20} className="text-emerald-600" />
        </div>
        <p className="text-sm font-medium text-slate-600">Aktif alarm bulunamadi</p>
        <p className="text-xs text-slate-400 mt-1">Tum sistemler normal calisiyor</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert, idx) => {
        const isOpen = expandedId === alert.id;
        const RuleIcon = RULE_ICONS[alert.rule_triggered] || AlertTriangle;
        const evidence = alert.evidence_data as Record<string, unknown>;

        return (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
            className={clsx(
              'bg-white border rounded-xl overflow-hidden transition-shadow',
              alert.status === 'INVESTIGATING'
                ? 'border-amber-300 shadow-amber-100/60 shadow-sm'
                : 'border-slate-200 hover:shadow-sm',
            )}
          >
            <button
              onClick={() => setExpandedId(isOpen ? null : alert.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              <div
                className={clsx(
                  'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                  alert.severity === 'CRITICAL'
                    ? 'bg-red-100 text-red-600'
                    : alert.severity === 'HIGH'
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-amber-100 text-amber-600',
                )}
              >
                <RuleIcon size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={clsx('text-xs font-bold px-1.5 py-0.5 rounded', SEVERITY_COLORS[alert.severity])}>
                    {SEVERITY_LABELS[alert.severity] || alert.severity}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {RULE_LABELS[alert.rule_triggered] || alert.rule_triggered}
                  </span>
                  {alert.status === 'INVESTIGATING' && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded animate-pulse">
                      INCELENIYOR
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-900 truncate">{alert.title}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className={clsx('text-xl font-black tabular-nums', SCORE_COLOR(alert.risk_score))}>
                    {alert.risk_score}
                  </div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider">Risk</div>
                </div>
                {isOpen ? (
                  <ChevronUp size={16} className="text-slate-400" />
                ) : (
                  <ChevronDown size={16} className="text-slate-400" />
                )}
              </div>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                    <p className="text-xs text-slate-600 mb-3">{alert.description}</p>

                    {evidence && Object.keys(evidence).length > 0 && (
                      <div className="bg-slate-50 rounded-lg p-3 mb-3">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Kanit Verisi
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {Object.entries(evidence).map(([k, v]) => {
                            if (typeof v === 'object') return null;
                            return (
                              <div key={k} className="flex justify-between text-xs">
                                <span className="text-slate-500">{k}:</span>
                                <span className="font-medium text-slate-800">{String(v)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {alert.status === 'OPEN' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInvestigate(alert.id);
                          }}
                          disabled={updatingId === alert.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                          <Search size={12} />
                          {updatingId === alert.id ? 'Kaydediliyor...' : 'Sorustur'}
                        </button>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {new Date(alert.created_at).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
