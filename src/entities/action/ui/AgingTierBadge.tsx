import clsx from 'clsx';
import { AlertTriangle } from 'lucide-react';
import type { AgingTier } from '../model/types';

const TIER_CONFIG: Record<
  AgingTier,
  { label: string; bg: string; text: string; border: string }
> = {
  TIER_1_NORMAL: {
    label: 'Normal',
    bg: 'bg-[#28a745]/10',
    text: 'text-[#28a745]',
    border: 'border-[#28a745]/30',
  },
  TIER_2_HIGH: {
    label: 'Yüksek Risk',
    bg: 'bg-[#FFD700]/20',
    text: 'text-amber-800',
    border: 'border-[#FFD700]/50',
  },
  TIER_3_CRITICAL: {
    label: 'Kritik',
    bg: 'bg-[#ff960a]/15',
    text: 'text-[#ff960a]',
    border: 'border-[#ff960a]/40',
  },
  TIER_4_BDDK_RED_ZONE: {
    label: 'BDDK Kırmızı',
    bg: 'bg-[#eb0000]/10',
    text: 'text-[#eb0000]',
    border: 'border-[#eb0000]/40',
  },
};

interface Props {
  tier: AgingTier;
  isBddbBreach?: boolean;
  overdayDays?: number;
  className?: string;
}

export function AgingTierBadge({
  tier,
  isBddbBreach = false,
  overdayDays,
  className,
}: Props) {
  const cfg = TIER_CONFIG[tier] ?? TIER_CONFIG.TIER_1_NORMAL;
  const isRedZone = tier === 'TIER_4_BDDK_RED_ZONE';

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide',
        cfg.bg,
        cfg.text,
        cfg.border,
        isRedZone && isBddbBreach && 'border-[#700000] bg-[#700000]/10 text-[#700000]',
        className,
      )}
    >
      {isBddbBreach && (
        <AlertTriangle
          size={10}
          className="animate-pulse shrink-0"
          strokeWidth={2.5}
        />
      )}
      {cfg.label}
      {overdayDays !== undefined && overdayDays > 0 && (
        <span className="ml-0.5 font-mono">+{overdayDays}g</span>
      )}
    </span>
  );
}
