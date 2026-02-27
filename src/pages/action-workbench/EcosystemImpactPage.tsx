import React from 'react';
import { motion } from 'framer-motion';
import { Network } from 'lucide-react';
import { CampaignManager } from '@/features/autonomous-remediation/ui/CampaignManager';
import { ResurrectionBoard } from '@/widgets/ResurrectionWatch/ui/ResurrectionBoard';
import { AutoFixButton } from '@/features/autonomous-remediation/ui/AutoFixButton';
import { RiskContagionRadar } from '@/features/risk-contagion/ui/RiskContagionRadar';

const EcosystemImpactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
              <Network size={18} className="text-white" />
            </div>
            <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">Module 7 — Phase 5</span>
          </div>
          <h1 className="font-serif text-3xl text-slate-900">
            Macro-Ecosystem Impact &amp; Autonomous Remediation
          </h1>
          <p className="text-sm text-slate-500 font-sans max-w-xl">
            CAE operational view — master campaigns, risk contagion mapping, and automated closure engine.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <CampaignManager />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ResurrectionBoard />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4"
          >
            <div>
              <h3 className="font-sans text-sm font-semibold text-slate-900">Autonomous Remediation Engine</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                One-click edge function dispatch — closes action, generates evidence, seals with system hash.
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Target Action</span>
                <span>ACT-2025-0334</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Target System</span>
                <span>Firewall Management API</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Rule Payload</span>
                <span>BLOCK_EGRESS_8080</span>
              </div>
            </div>
            <AutoFixButton actionId="ACT-2025-0334" label="Execute Auto-Fix" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <RiskContagionRadar />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EcosystemImpactPage;
