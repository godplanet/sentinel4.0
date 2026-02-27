import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Activity } from 'lucide-react';

interface ContagionNode {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;
  border: string;
  bg: string;
  pulse?: boolean;
}

const NODES: ContagionNode[] = [
  {
    id: 'strategic',
    label: 'Cyber Attack Exposure',
    sublabel: 'Strategic Enterprise Risk',
    icon: <AlertTriangle size={18} />,
    color: 'text-[#700000]',
    border: 'border-[#700000]/40',
    bg: 'bg-red-50',
  },
  {
    id: 'control',
    label: 'Network Security Control',
    sublabel: 'Failed Control',
    icon: <Shield size={18} />,
    color: 'text-[#eb0000]',
    border: 'border-[#eb0000]/50',
    bg: 'bg-red-50/70',
    pulse: true,
  },
  {
    id: 'action',
    label: 'Firewall Update Pending',
    sublabel: 'Overdue Action — TIER 4',
    icon: <Activity size={18} />,
    color: 'text-[#700000]',
    border: 'border-[#700000]/60',
    bg: 'bg-red-50',
  },
];

const ArrowLine: React.FC<{ delay?: number }> = ({ delay = 0 }) => (
  <div className="flex flex-col items-center gap-0 my-1">
    <motion.div
      initial={{ scaleY: 0, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="w-px h-8 bg-gradient-to-b from-[#eb0000]/60 to-[#700000]/80 origin-top"
    />
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay + 0.3 }}
      className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#700000]/80"
    />
  </div>
);

export const RiskContagionRadar: React.FC = () => {
  return (
    <div className="bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl p-6 h-full">
      <div className="mb-5">
        <h3 className="font-sans text-sm font-semibold text-slate-900">Risk Contagion Radar</h3>
        <p className="text-xs text-slate-500 mt-0.5">Threat propagation from overdue action to enterprise risk</p>
      </div>

      <div className="flex flex-col items-center gap-0 relative">
        {NODES.map((node, i) => (
          <React.Fragment key={node.id}>
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.25, duration: 0.4 }}
              className="relative w-full max-w-xs"
            >
              {node.pulse && (
                <span className="absolute inset-0 rounded-xl animate-ping opacity-20 bg-red-500 pointer-events-none" />
              )}
              <div className={`relative border-2 ${node.border} ${node.bg} rounded-xl px-4 py-3.5 flex items-center gap-3 shadow-sm`}>
                <div className={`flex-shrink-0 ${node.color}`}>
                  {node.icon}
                </div>
                <div>
                  <p className={`text-sm font-semibold font-sans ${node.color}`}>{node.label}</p>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wide mt-0.5">{node.sublabel}</p>
                </div>
              </div>
            </motion.div>

            {i < NODES.length - 1 && <ArrowLine delay={i * 0.25 + 0.3} />}
          </React.Fragment>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          className="mt-4 w-full max-w-xs"
        >
          <div className="border border-[#700000]/30 bg-[#700000]/5 rounded-xl px-4 py-3">
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-[#700000] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#700000] font-sans">Residual Risk Score Increased</p>
                <p className="text-xs text-slate-600 font-sans mt-0.5">
                  <span className="font-bold text-[#eb0000]">+18 points</span> due to Action Delay
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-3 text-[10px] text-slate-400 font-mono text-center leading-relaxed px-2"
        >
          Contagion vector: ACT-2025-0334 → CTL-NET-042 → RISK-ENT-007
        </motion.div>
      </div>
    </div>
  );
};
