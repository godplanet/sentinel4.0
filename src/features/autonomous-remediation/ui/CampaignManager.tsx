import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle2, Loader2, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import type { MasterActionCampaign } from '@/entities/action/model/types';

interface CampaignRow {
  campaign: MasterActionCampaign;
  totalActions: number;
  closedActions: number;
}

const MOCK_CAMPAIGNS: CampaignRow[] = [
  {
    campaign: {
      id: 'cmp-001',
      title: 'Q3 Firewall Remediation Program',
      description: 'Enterprise-wide network perimeter hardening',
      root_cause: 'Systematic neglect of periodic firewall rule reviews across all business units, compounded by absence of automated change-management controls.',
      status: 'active',
      created_at: '2025-06-01T00:00:00Z',
    },
    totalActions: 50,
    closedActions: 31,
  },
  {
    campaign: {
      id: 'cmp-002',
      title: 'BDDK AML Deficiency Closure',
      description: 'Regulatory-mandated AML control remediation',
      root_cause: 'Insufficient transaction monitoring thresholds set during 2022 system migration. Root cause confirmed via forensic investigation INV-2024-009.',
      status: 'active',
      created_at: '2025-07-15T00:00:00Z',
    },
    totalActions: 28,
    closedActions: 11,
  },
];

export const CampaignManager: React.FC = () => {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>(MOCK_CAMPAIGNS);
  const [executing, setExecuting] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const handleMassExecute = async (campaignId: string) => {
    if (executing) return;
    setExecuting(campaignId);
    await new Promise(r => setTimeout(r, 1800));
    setCampaigns(prev =>
      prev.map(c =>
        c.campaign.id === campaignId
          ? { ...c, closedActions: c.totalActions }
          : c
      )
    );
    setDone(campaignId);
    setExecuting(null);
    toast.success('Central evidence submitted. All 50 linked actions updated.', { duration: 4500 });
  };

  return (
    <div className="bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl overflow-hidden h-full">
      <div className="px-6 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
            <Target size={16} className="text-slate-700" />
          </div>
          <div>
            <h3 className="font-sans text-sm font-semibold text-slate-900">Master Action Campaigns</h3>
            <p className="text-xs text-slate-500 mt-0.5">{campaigns.length} active programs</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {campaigns.map(row => {
          const pct = Math.round((row.closedActions / row.totalActions) * 100);
          const isExec = executing === row.campaign.id;
          const isDone = done === row.campaign.id;

          return (
            <div key={row.campaign.id} className="px-6 py-5 space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 font-sans">{row.campaign.title}</p>
                <p className="text-xs text-slate-500 font-serif italic leading-relaxed mt-1 line-clamp-2">
                  {row.campaign.root_cause}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500 font-sans">
                  <span>{row.closedActions} / {row.totalActions} actions closed</span>
                  <span className="font-medium text-slate-700">{pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full transition-colors ${
                      pct === 100 ? 'bg-emerald-500' : pct > 50 ? 'bg-amber-400' : 'bg-slate-400'
                    }`}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {isDone ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-xs text-emerald-700 font-sans font-medium"
                  >
                    <CheckCircle2 size={14} />
                    All {row.totalActions} actions updated to evidence_submitted
                  </motion.div>
                ) : (
                  <motion.button
                    key="btn"
                    onClick={() => handleMassExecute(row.campaign.id)}
                    disabled={!!executing}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium font-sans transition-all
                      bg-white/70 backdrop-blur-md border border-slate-300 text-slate-700
                      hover:bg-slate-50 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isExec ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-slate-500" />
                        Submitting central evidence...
                      </>
                    ) : (
                      <>
                        <Upload size={13} />
                        Submit Central Evidence
                      </>
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
