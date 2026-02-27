import clsx from 'clsx';
import type { ActionStatus } from '../model/types';

const STATUS_CONFIG: Record<ActionStatus, { label: string; classes: string }> = {
  pending: {
    label: 'Beklemede',
    classes: 'bg-slate-100 text-slate-700 border-slate-300',
  },
  evidence_submitted: {
    label: 'Kanıt Yüklendi',
    classes: 'bg-sky-100 text-sky-800 border-sky-300',
  },
  review_rejected: {
    label: 'Reddedildi',
    classes: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  risk_accepted: {
    label: 'Risk Kabul',
    classes: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  closed: {
    label: 'Kapatıldı',
    classes: 'bg-[#28a745]/10 text-[#28a745] border-[#28a745]/30',
  },
};

interface Props {
  status: ActionStatus;
  className?: string;
}

export function ActionStatusBadge({ status, className }: Props) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide',
        cfg.classes,
        className,
      )}
    >
      {cfg.label}
    </span>
  );
}
