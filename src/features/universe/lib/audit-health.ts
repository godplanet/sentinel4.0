import type { AuditEntity, AuditFrequency } from '@/entities/universe/model/types';

export type AuditStatus = 'OVERDUE' | 'UPCOMING' | 'CURRENT' | 'UNKNOWN';

export interface AuditHealthInfo {
  status: AuditStatus;
  daysUntilDue: number | null;
  daysOverdue: number | null;
  statusLabel: string;
  statusColor: string;
  badgeColor: string;
}

const FREQUENCY_MONTHS: Record<AuditFrequency, number> = {
  'Yıllık': 12,
  '2 Yılda Bir': 24,
  '3 Yılda Bir': 36,
  'Sürekli': 12,
};

export function calculateNextAuditDue(
  lastAuditDate: string | null | undefined,
  frequency: string | null | undefined
): string | null {
  if (!lastAuditDate || !frequency) return null;

  const months = FREQUENCY_MONTHS[frequency as AuditFrequency];
  if (!months) return null;

  const last = new Date(lastAuditDate);
  const next = new Date(last);
  next.setMonth(next.getMonth() + months);

  return next.toISOString().split('T')[0];
}

export function getAuditHealth(entity: AuditEntity): AuditHealthInfo {
  const { last_audit_date, audit_frequency, next_audit_due } = entity;

  if (!last_audit_date || !audit_frequency) {
    return {
      status: 'UNKNOWN',
      daysUntilDue: null,
      daysOverdue: null,
      statusLabel: 'Denetim Planlanmamış',
      statusColor: 'text-slate-500',
      badgeColor: 'bg-slate-100 text-slate-600 border-slate-200',
    };
  }

  const dueDate = next_audit_due
    ? new Date(next_audit_due)
    : new Date(calculateNextAuditDue(last_audit_date, audit_frequency) || '');

  const today = new Date();
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'OVERDUE',
      daysUntilDue: null,
      daysOverdue: Math.abs(diffDays),
      statusLabel: 'Gecikmiş',
      statusColor: 'text-red-600',
      badgeColor: 'bg-red-100 text-red-700 border-red-200',
    };
  }

  if (diffDays <= 30) {
    return {
      status: 'UPCOMING',
      daysUntilDue: diffDays,
      daysOverdue: null,
      statusLabel: 'Yaklaşıyor',
      statusColor: 'text-amber-600',
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    };
  }

  return {
    status: 'CURRENT',
    daysUntilDue: diffDays,
    daysOverdue: null,
    statusLabel: 'Güncel',
    statusColor: 'text-emerald-600',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
}

export function formatAuditDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';

  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getFrequencyLabel(frequency: string | null | undefined): string {
  if (!frequency) return '-';
  return frequency;
}

export function calculateCompositeRisk(entity: AuditEntity): number {
  const { risk_operational, risk_it, risk_compliance, risk_financial, risk_score } = entity;

  const components = [risk_operational, risk_it, risk_compliance, risk_financial].filter(
    (r): r is number => r !== null && r !== undefined
  );

  if (components.length === 0) {
    return risk_score || 0;
  }

  const max = Math.max(...components);
  return max;
}

export interface RiskBreakdown {
  operational: number;
  it: number;
  compliance: number;
  financial: number;
  hasData: boolean;
}

export function getRiskBreakdown(entity: AuditEntity): RiskBreakdown {
  const { risk_operational, risk_it, risk_compliance, risk_financial } = entity;

  const hasData = [risk_operational, risk_it, risk_compliance, risk_financial].some(
    (r) => r !== null && r !== undefined
  );

  return {
    operational: risk_operational ?? 0,
    it: risk_it ?? 0,
    compliance: risk_compliance ?? 0,
    financial: risk_financial ?? 0,
    hasData,
  };
}

export const RISK_COMPONENT_LABELS = {
  operational: { label: 'Operasyonel Risk', icon: '⚙️' },
  it: { label: 'BT Riski', icon: '💻' },
  compliance: { label: 'Uyum Riski', icon: '⚖️' },
  financial: { label: 'Finansal Risk', icon: '💰' },
} as const;
