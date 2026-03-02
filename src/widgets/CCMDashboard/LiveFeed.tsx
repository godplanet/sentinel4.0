import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import clsx from 'clsx';
import type { CCMTransaction } from '@/entities/ccm/types';

interface LiveFeedProps {
  transactions: CCMTransaction[];
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency || 'TRY', maximumFractionDigits: 0 }).format(amount);
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  TRANSFER: { icon: ArrowUpRight, color: 'text-blue-400' },
  PAYMENT: { icon: ArrowDownRight, color: 'text-red-400' },
  WITHDRAWAL: { icon: ArrowDownRight, color: 'text-orange-400' },
  DEPOSIT: { icon: Minus, color: 'text-emerald-400' },
};

export function LiveFeed({ transactions }: LiveFeedProps) {
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[40px_1fr_1fr_100px_80px_60px] gap-2 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800/60">
        <span>Tip</span>
        <span>Kullanici</span>
        <span>Alici</span>
        <span className="text-right">Tutar</span>
        <span className="text-right">Tarih</span>
        <span className="text-right">Saat</span>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {transactions.map((tx, i) => {
          const cfg = TYPE_CONFIG[tx.transaction_type] || TYPE_CONFIG.TRANSFER;
          const Icon = cfg.icon;
          const isSuspicious = tx.metadata && (tx.metadata as Record<string, unknown>).scenario;

          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.015, 0.5) }}
              className={clsx(
                'grid grid-cols-[40px_1fr_1fr_100px_80px_60px] gap-2 px-3 py-2 text-xs items-center border-b border-slate-800/40 hover:bg-slate-800/50 transition-colors',
                isSuspicious && 'bg-red-500/10 border-l-2 border-l-red-500'
              )}
            >
              <div className={clsx('flex items-center justify-center', cfg.color)}>
                <Icon size={14} />
              </div>
              <span className="text-slate-200 font-medium truncate">{tx.user_id}</span>
              <span className="text-slate-400 truncate">{tx.beneficiary}</span>
              <span className={clsx('text-right font-semibold tabular-nums', tx.amount >= 49000 ? 'text-red-400' : 'text-slate-200')}>
                {formatAmount(tx.amount, tx.currency)}
              </span>
              <span className="text-right text-slate-500 tabular-nums">{formatDate(tx.transaction_date)}</span>
              <span className="text-right text-slate-500 tabular-nums">{formatTime(tx.transaction_date)}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
