import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ShieldAlert, Calendar, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import clsx from 'clsx';
import type { ActionAgingMetrics } from '@/entities/action/model/types';
import { DEPT_ID_TO_NAME } from '../lib/departments';

interface Props {
  actions:         ActionAgingMetrics[];
  onSelectAction?: (a: ActionAgingMetrics) => void;
}

export function BDDKWatchlist({ actions, onSelectAction }: Props) {
  const breaches = actions
    .filter((a) => a.is_bddk_breach)
    .sort((a, b) => b.performance_delay_days - a.performance_delay_days);

  if (breaches.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-5 py-3.5 bg-emerald-50 border border-emerald-200 rounded-xl"
      >
        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
        <p className="text-sm font-bold text-emerald-700">
          Sıfır Düzenleyici İhlal — Tüm aksiyonlar BDDK 365 gün eşiğinin altında
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden border border-[#700000]/30 shadow-lg"
    >
      <div className="bg-[#700000] px-5 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <AlertTriangle size={15} className="text-white/90 animate-pulse shrink-0" />
          <p className="text-[13px] font-black text-white tracking-wide uppercase">
            BDDK Düzenleyici İhlali Tespit Edildi — {breaches.length} Aksiyon &gt;365 Gün Vadesi Aşıldı
          </p>
        </div>
        <span className="shrink-0 px-3 py-1 bg-white/20 border border-white/30 rounded-full text-[11px] font-black text-white">
          {breaches.length} İhlal
        </span>
      </div>

      <div className="bg-[#700000]/[0.03] max-h-44 overflow-y-auto">
        {breaches.slice(0, 15).map((a, idx) => (
          <BreachRow
            key={a.id}
            action={a}
            index={idx}
            onSelect={onSelectAction}
          />
        ))}
      </div>

      {breaches.length > 15 && (
        <div className="px-5 py-2 border-t border-[#700000]/10 bg-[#700000]/[0.03]">
          <p className="text-xs font-bold text-[#700000]">
            +{breaches.length - 15} ek ihlal alt tabloda görüntüleniyor
          </p>
        </div>
      )}
    </motion.div>
  );
}

function BreachRow({
  action,
  index,
  onSelect,
}: {
  action:   ActionAgingMetrics;
  index:    number;
  onSelect?: (a: ActionAgingMetrics) => void;
}) {
  const dept     = DEPT_ID_TO_NAME[action.assignee_unit_id ?? ''] ?? 'Bilinmeyen';
  const overLine = Math.max(0, action.performance_delay_days - 365);

  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.025 }}
      onClick={() => onSelect?.(action)}
      className={clsx(
        'flex items-center gap-4 px-5 py-3 border-b border-[#700000]/10 last:border-0',
        'hover:bg-[#700000]/[0.06] transition-colors',
        onSelect && 'cursor-pointer',
      )}
    >
      <div className="w-7 h-7 rounded-lg bg-[#700000]/10 border border-[#700000]/25 flex items-center justify-center shrink-0">
        <ShieldAlert size={13} className="text-[#700000]" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 truncate">
          {action.finding_snapshot?.title}
        </p>
        <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-500">
          <span className="flex items-center gap-1"><Building2 size={10} />{dept}</span>
          <span className="flex items-center gap-1">
            <Calendar size={10} />
            {format(new Date(action.original_due_date), 'd MMM yyyy', { locale: tr })}
          </span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-black text-[#700000]">{action.performance_delay_days}g</p>
        {overLine > 0 && (
          <p className="text-[10px] font-bold text-rose-600">+{overLine}g sınırı aştı</p>
        )}
      </div>
    </motion.div>
  );
}
