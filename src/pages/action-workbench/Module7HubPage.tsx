import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Inbox,
  Terminal,
  LayoutGrid,
  Network,
  Command,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { ReportSealerSimulator } from '@/features/module-bridge/ui/ReportSealerSimulator';

interface ZoneCard {
  id: string;
  number: string;
  label: string;
  tagline: string;
  description: string;
  route: string;
  icon: React.ReactNode;
  accent: string;
  accentText: string;
}

const ZONES: ZoneCard[] = [
  {
    id: 'frontline',
    number: '01',
    label: 'The Frontline',
    tagline: 'Auditee Portal',
    description: 'Frictionless evidence submission. Auditees upload, annotate, and track their assigned remediation actions in a clean, guided interface.',
    route: '/auditee-portal',
    icon: <Inbox size={22} />,
    accent: 'border-sky-200 hover:border-sky-400',
    accentText: 'text-sky-700',
  },
  {
    id: 'command',
    number: '02',
    label: 'The Command Center',
    tagline: 'Auditor Workbench',
    description: 'Super Drawer & AI Validation. Full forensic review tooling with AI evidence analysis, traceability threads, and auditor decision bars.',
    route: '/auditor-workbench',
    icon: <Terminal size={22} />,
    accent: 'border-slate-200 hover:border-slate-400',
    accentText: 'text-slate-700',
  },
  {
    id: 'truth',
    number: '03',
    label: 'The Truth Table',
    tagline: 'Governance Workbench',
    description: 'Virtual Matrix & Dual Aging. Board-level accountability view with BDDK compliance heatmap and aging-tier analytics.',
    route: '/governance-workbench',
    icon: <LayoutGrid size={22} />,
    accent: 'border-amber-200 hover:border-amber-400',
    accentText: 'text-amber-700',
  },
  {
    id: 'neural',
    number: '04',
    label: 'The Neural Link',
    tagline: 'Ecosystem Impact',
    description: 'Auto-Fix & Master Campaigns. Autonomous remediation engine, risk contagion radar, and expiring risk acceptance tracking.',
    route: '/ecosystem-impact',
    icon: <Network size={22} />,
    accent: 'border-emerald-200 hover:border-emerald-400',
    accentText: 'text-emerald-700',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
};

const Module7HubPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8 md:p-12">
      <div className="max-w-7xl mx-auto space-y-12">

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <span className="font-mono text-xs text-slate-500 tracking-widest uppercase">Sentinel v3.0 — Module 7</span>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl text-slate-900 leading-tight max-w-3xl">
            Action Tracking &amp; Governance
          </h1>
          <p className="text-base text-slate-500 font-sans max-w-2xl leading-relaxed">
            The Titanium Core is active. Select your operational zone.
          </p>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/70 backdrop-blur-md border border-slate-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-sans">
              <Command size={12} className="text-slate-400" />
              <kbd className="font-mono text-slate-600 text-xs">K</kbd>
              <span>to open Omni-Search</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {ZONES.map((zone, i) => (
            <motion.button
              key={zone.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              onClick={() => navigate(zone.route)}
              className={`group relative text-left bg-white/70 backdrop-blur-md border-2 ${zone.accent} shadow-sm rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className={`w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center ${zone.accentText}`}>
                    {zone.icon}
                  </div>
                  <span className="font-mono text-xs text-slate-300 font-bold">{zone.number}</span>
                </div>

                <div>
                  <p className={`text-xs font-semibold uppercase tracking-widest mb-1 font-sans ${zone.accentText}`}>
                    {zone.tagline}
                  </p>
                  <h3 className="font-serif text-xl text-slate-900 leading-snug">{zone.label}</h3>
                </div>

                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  {zone.description}
                </p>

                <div className={`flex items-center gap-1.5 text-xs font-medium font-sans transition-all opacity-0 group-hover:opacity-100 ${zone.accentText}`}>
                  Enter Zone
                  <ChevronRight size={13} />
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-baseline gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest px-2">
              Module Bridge — Live Showcase
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div>
              <ReportSealerSimulator />
            </div>
            <div className="bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">Legal Record</p>
                <h3 className="font-serif text-xl text-slate-900">Official Remediation Dossier</h3>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  A print-ready, cryptographically-attested A4 legal document chronicling the full remediation lifecycle —
                  finding genesis, aging record, evidence trail, BDDK breach declarations, and auditor sign-off.
                </p>
                <div className="pt-1 space-y-1.5">
                  {['SHA-256 evidence integrity seals', 'Board exception records', 'Digital auditor signature', '@media print A4 rendering'].map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-slate-600 font-sans">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => navigate('/dossier-demo')}
                className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium font-sans
                  bg-white/70 backdrop-blur-md border border-slate-300 text-slate-700
                  hover:bg-slate-50 hover:border-slate-400 hover:shadow-md transition-all shadow-sm"
              >
                Open Dossier Demo
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-4 border-t border-slate-200"
        >
          <p className="font-mono text-[10px] text-slate-400 text-center tracking-wide">
            Sentinel GRC v3.0 — Module 7: Action Tracking &amp; Governance &nbsp;|&nbsp;
            Phases 1–6 Complete &nbsp;|&nbsp; GIAS 2024 Compliant &nbsp;|&nbsp; BDDK Certified Architecture
          </p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Module7HubPage;
