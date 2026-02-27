import { motion } from 'framer-motion';
import {
  Target, GitBranch, ShieldAlert, XCircle, ArrowRight, Building2,
} from 'lucide-react';
import clsx from 'clsx';
import type { ActionAgingMetrics } from '@/entities/action/model/types';

interface ThreadNode {
  id: string;
  icon: React.ElementType;
  label: string;
  sublabel: string;
  color: string;
  bg: string;
  ring: string;
}

function buildThread(action: ActionAgingMetrics): ThreadNode[] {
  const snapshot = action.finding_snapshot;
  return [
    {
      id: 'strategic-obj',
      icon: Target,
      label: 'Stratejik Hedef',
      sublabel: 'Operasyonel Sürdürülebilirlik & Uyum',
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      ring: 'ring-blue-200',
    },
    {
      id: 'business-proc',
      icon: GitBranch,
      label: 'İş Süreci',
      sublabel: 'Birim Kontrol & Onay Mekanizmaları',
      color: 'text-violet-700',
      bg: 'bg-violet-50',
      ring: 'ring-violet-200',
    },
    {
      id: 'key-risk',
      icon: ShieldAlert,
      label: 'Temel Risk',
      sublabel: snapshot?.gias_category
        ? `${snapshot.gias_category} — ${snapshot.severity} Seviye`
        : `${snapshot?.severity ?? 'HIGH'} Seviye Uyum Riski`,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      ring: 'ring-amber-200',
    },
    {
      id: 'failed-control',
      icon: XCircle,
      label: 'Başarısız Kontrol',
      sublabel: snapshot?.title ?? 'Tanımlanmış Kontrol Mekanizması',
      color: 'text-rose-700',
      bg: 'bg-rose-50',
      ring: 'ring-rose-200',
    },
    {
      id: 'assignee-unit',
      icon: Building2,
      label: 'Sorumlu Birim',
      sublabel: action.assignee_unit_id
        ? `Birim ID: ${action.assignee_unit_id.slice(0, 8)}...`
        : 'Atanmış Birim',
      color: 'text-slate-700',
      bg: 'bg-slate-50',
      ring: 'ring-slate-200',
    },
  ];
}

interface Props {
  action: ActionAgingMetrics;
}

export function TraceabilityGoldenThread({ action }: Props) {
  const nodes = buildThread(action);

  return (
    <div className="space-y-3">
      <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">
        İzlenebilirlik Altın İpi — Risk Kökeni Haritası
      </div>

      <div className="flex flex-col gap-0">
        {nodes.map((node, idx) => {
          const Icon = node.icon;
          const isLast = idx === nodes.length - 1;

          return (
            <div key={node.id}>
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.07 }}
                className={clsx(
                  'flex items-center gap-4 p-4 rounded-xl border bg-white',
                  'border-slate-200 hover:border-slate-300 transition-colors',
                )}
              >
                <div className={clsx(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ring-2',
                  node.bg,
                  node.ring,
                )}>
                  <Icon size={18} className={node.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-0.5">
                    {node.label}
                  </p>
                  <p className={clsx('text-sm font-semibold truncate', node.color)}>
                    {node.sublabel}
                  </p>
                </div>
                {!isLast && (
                  <div className="text-slate-300 shrink-0">
                    <ArrowRight size={14} />
                  </div>
                )}
              </motion.div>

              {!isLast && (
                <div className="flex justify-center my-1">
                  <div className="w-px h-4 border-l-2 border-dashed border-slate-200" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-4 bg-[#FDFBF7] border border-slate-200 rounded-xl">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
          Düzenleyici Etiketler
        </p>
        <div className="flex flex-wrap gap-2">
          {action.regulatory_tags.length > 0 ? (
            action.regulatory_tags.map((tag) => (
              <span
                key={tag}
                className={clsx(
                  'px-2.5 py-1 rounded-lg text-xs font-bold border',
                  tag === 'BDDK'
                    ? 'bg-[#700000]/10 text-[#700000] border-[#700000]/30'
                    : 'bg-slate-100 text-slate-700 border-slate-200',
                )}
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400">Etiket yok</span>
          )}
        </div>
      </div>
    </div>
  );
}
