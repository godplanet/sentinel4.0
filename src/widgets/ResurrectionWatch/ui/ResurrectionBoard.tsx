import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import type { ActionRequest } from '@/entities/action/model/types';

interface RiskAcceptance {
  request: ActionRequest & { finding_title: string; accepted_by: string; risk_description: string; acceptance_start: string };
}

const now = new Date();
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);
const subDays = (d: Date, n: number) => new Date(d.getTime() - n * 86400000);

const toIso = (d: Date) => d.toISOString().split('T')[0];

const MOCK: RiskAcceptance[] = [
  {
    request: {
      id: 'ra-001',
      action_id: 'ACT-2025-0221',
      type: 'risk_acceptance',
      justification: 'Third-party vendor SLA prevents immediate remediation. Risk accepted for defined period pending contract renegotiation.',
      expiration_date: toIso(addDays(now, 4)),
      status: 'approved',
      reviewer_id: 'uid-cae-001',
      created_at: toIso(subDays(now, 86)),
      finding_title: 'Unpatched Legacy Authentication Module',
      accepted_by: 'Chief Audit Executive',
      risk_description: 'Authentication bypass vulnerability in legacy system CTL-AUTH-019',
      acceptance_start: toIso(subDays(now, 86)),
    },
  },
  {
    request: {
      id: 'ra-002',
      action_id: 'ACT-2025-0198',
      type: 'risk_acceptance',
      justification: 'Remediation blocked pending capital project approval. Compensating controls in place. Annual board review scheduled.',
      expiration_date: toIso(addDays(now, 22)),
      status: 'approved',
      reviewer_id: 'uid-cae-001',
      created_at: toIso(subDays(now, 68)),
      finding_title: 'Segregation of Duties — Treasury Operations',
      accepted_by: 'Board Risk Committee',
      risk_description: 'SoD conflict in wire transfer approval chain identified during Q2 audit',
      acceptance_start: toIso(subDays(now, 68)),
    },
  },
  {
    request: {
      id: 'ra-003',
      action_id: 'ACT-2024-0887',
      type: 'risk_acceptance',
      justification: 'Technology refresh programme underway. Risk mitigated by enhanced monitoring. Board exception active.',
      expiration_date: toIso(addDays(now, 57)),
      status: 'approved',
      reviewer_id: 'uid-cae-001',
      created_at: toIso(subDays(now, 33)),
      finding_title: 'End-of-Life Core Banking Infrastructure',
      accepted_by: 'CRO + Board Audit Committee',
      risk_description: 'CBS version 6.2 reached vendor end-of-life. Security patches no longer available.',
      acceptance_start: toIso(subDays(now, 33)),
    },
  },
];

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
  return (
    <div className="bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl overflow-hidden h-full">
      <div className="px-6 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
            <RefreshCw size={15} className="text-amber-700" />
          </div>
          <div>
            <h3 className="font-sans text-sm font-semibold text-slate-900">Resurrection Watch</h3>
            <p className="text-xs text-slate-500 mt-0.5">Approved risk acceptances approaching expiration</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {MOCK.map((row, i) => {
          const days = daysUntilExpiry(row.request.expiration_date ?? '');
          const pct = consumedPct(row.request.acceptance_start, row.request.expiration_date ?? '');
          const isImminent = days <= 7;
          const isWarning = days <= 30 && !isImminent;

          const rowBg = isImminent ? 'bg-red-50/60' : isWarning ? 'bg-amber-50/40' : '';
          const textColor = isImminent ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-slate-500';
          const barColor = isImminent ? 'bg-red-400' : isWarning ? 'bg-amber-400' : 'bg-emerald-400';

          return (
            <motion.div
              key={row.request.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`px-6 py-5 space-y-3 ${rowBg}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 font-sans truncate">{row.request.finding_title}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">{row.request.id} · {row.request.action_id}</p>
                </div>
                {isImminent && (
                  <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold font-sans bg-red-100 text-red-800 border border-red-200 uppercase tracking-wide animate-pulse">
                    <AlertTriangle size={10} />
                    Imminent Resurrection
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 font-sans leading-relaxed line-clamp-2">
                {row.request.risk_description}
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
                  <span>Accepted by: {row.request.accepted_by}</span>
                  <span>Expires: {row.request.expiration_date}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
