import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Mail, MessageSquare, FileText, Server,
  ChevronDown, ChevronUp, ShieldCheck, Hash,
} from 'lucide-react';
import clsx from 'clsx';
import type { DigitalEvidence, EvidenceType } from '@/features/investigation/types';
import { EVIDENCE_TYPE_LABELS } from '@/features/investigation/types';

interface EvidenceVaultProps {
  evidence: DigitalEvidence[];
}

const TYPE_ICONS: Record<EvidenceType, typeof Mail> = {
  EMAIL: Mail,
  CHAT: MessageSquare,
  INVOICE: FileText,
  LOG: Server,
};

const TYPE_COLORS: Record<EvidenceType, string> = {
  EMAIL: 'bg-blue-50 text-blue-700 border-blue-200',
  CHAT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  INVOICE: 'bg-amber-50 text-amber-700 border-amber-200',
  LOG: 'bg-slate-50 text-slate-700 border-slate-200',
};

export function EvidenceVault({ evidence }: EvidenceVaultProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (evidence.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-slate-400">
        Henuz dijital kanit bulunmuyor. Dondurma protokolunu baslatın.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {evidence.map((ev) => {
        const Icon = TYPE_ICONS[ev.type as EvidenceType] || Server;
        const isExpanded = expandedId === ev.id;

        return (
          <div
            key={ev.id}
            className={clsx(
              'bg-white border rounded-xl overflow-hidden transition-all',
              ev.locked ? 'border-slate-200' : 'border-amber-300',
            )}
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : ev.id)}
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50/50 transition-colors"
            >
              <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border', TYPE_COLORS[ev.type as EvidenceType])}>
                <Icon size={14} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    {EVIDENCE_TYPE_LABELS[ev.type as EvidenceType]}
                  </span>
                  <span className="text-[10px] text-slate-500">- {ev.source_system}</span>
                  {ev.locked && (
                    <Lock size={10} className="text-emerald-500" />
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate">
                  SHA-256: {ev.hash_sha256.slice(0, 24)}...
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-slate-400">
                  {new Date(ev.timestamp_rfc3161).toLocaleString('tr-TR')}
                </span>
                {isExpanded ? <ChevronUp size={12} className="text-slate-400" /> : <ChevronDown size={12} className="text-slate-400" />}
              </div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 space-y-3 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-4 text-[10px]">
                      <div className="flex items-center gap-1 text-emerald-600">
                        <ShieldCheck size={10} />
                        <span>Butunluk Dogrulanmis</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <Hash size={10} />
                        <span className="font-mono">{ev.hash_sha256}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900 rounded-lg p-3 overflow-auto max-h-64">
                      <pre className="text-[10px] text-emerald-400 font-mono whitespace-pre-wrap">
                        {JSON.stringify(ev.content_snapshot, null, 2)}
                      </pre>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Donduran: {ev.frozen_by}</span>
                      <span>RFC 3161: {new Date(ev.timestamp_rfc3161).toISOString()}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
