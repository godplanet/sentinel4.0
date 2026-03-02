import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import { fetchRiskAcceptances } from '../api/index';

const now = new Date();

function daysUntilExpiry(expiryDate: string): number {
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - now.getTime()) / 86400000);
}

function consumedPct(startDate: string, expiryDate: string): number {
  const start = new Date(startDate);
  const expiry = new Date(expiryDate);
  const total = expiry.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

export const ResurrectionBoard: React.FC = () => {
  const { data: acceptances = [], isLoading } = useQuery({
    queryKey: ['risk-acceptances'],
    queryFn: fetchRiskAcceptances,
  });

  return (
    <div className="bg-surface/70 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl overflow-hidden h-full">
      <div className="px-6 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
            <RefreshCw size={15} className="text-amber-700" />
          </div>
          <div>
            <h3 className="font-sans text-sm font-semibold text-primary">Resurrection Watch</h3>
            <p className="text-xs text-slate-500 mt-0.5">Approved risk acceptances approaching expiration</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <Loader2 size={20} className="animate-spin mr-2" />
          <span className="text-sm">Yükleniyor...</span>
        </div>
      ) : acceptances.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <RefreshCw size={32} className="mb-3 opacity-30" />
          <p className="text-sm font-medium">Aktif risk kabulü bulunmuyor.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {acceptances.map((row, i) => {
            const days = daysUntilExpiry(row.expiration_date ?? '');
            const pct = consumedPct(row.acceptance_start, row.expiration_date ?? '');
            const isImminent = days <= 7;
            const isWarning = days <= 30 && !isImminent;

            const rowBg = isImminent ? 'bg-red-50/60' : isWarning ? 'bg-amber-50/40' : '';
            const textColor = isImminent ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-slate-500';
            const barColor = isImminent ? 'bg-red-400' : isWarning ? 'bg-amber-400' : 'bg-emerald-400';

            return (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`px-6 py-5 space-y-3 ${rowBg}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary font-sans truncate">{row.finding_title}</p>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">{row.id} · {row.action_id}</p>
                  </div>
                  {isImminent && (
                    <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold font-sans bg-red-100 text-red-800 border border-red-200 uppercase tracking-wide animate-pulse">
                      <AlertTriangle size={10} />
                      Imminent Resurrection
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 font-sans leading-relaxed line-clamp-2">
                  {row.risk_description || row.justification}
                </p>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="text-slate-400">Accepted risk period consumed</span>
                    <div className={`flex items-center gap-1.5 font-medium ${textColor}`}>
                      <Clock size={11} />
                      <span>{days > 0 ? `${days} days remaining` : 'EXPIRED'}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${barColor}`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Accepted by: {row.accepted_by}</span>
                    <span>Expires: {row.expiration_date}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
