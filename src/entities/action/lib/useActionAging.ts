import type { Action, ActionAging } from '../model/types';

interface AgingMetrics {
  ageFromDetection: number;
  performanceDelay: number;
  operationalOverdue: number;
  extensionDays: number;
  isOperationallyOverdue: boolean;
  isPerformanceDelayed: boolean;
  severity: 'normal' | 'warning' | 'critical';
  color: string;
  glowClass: string;
}

export function calculateActionAging(action: Action): AgingMetrics {
  const now = new Date();
  const originalDue = new Date(action.original_due_date);
  const currentDue = new Date(action.current_due_date);
  const findingCreated = new Date(action.finding_snapshot.created_at);

  const ageFromDetection = Math.floor(
    (now.getTime() - findingCreated.getTime()) / (1000 * 60 * 60 * 24)
  );

  const performanceDelay = Math.floor(
    (now.getTime() - originalDue.getTime()) / (1000 * 60 * 60 * 24)
  );

  const operationalOverdue = Math.floor(
    (now.getTime() - currentDue.getTime()) / (1000 * 60 * 60 * 24)
  );

  const extensionDays = Math.floor(
    (currentDue.getTime() - originalDue.getTime()) / (1000 * 60 * 60 * 24)
  );

  const isOperationallyOverdue = operationalOverdue > 0 &&
    !['closed', 'risk_accepted'].includes(action.status);

  const isPerformanceDelayed = performanceDelay > 0 &&
    !['closed', 'risk_accepted'].includes(action.status);

  let severity: 'normal' | 'warning' | 'critical' = 'normal';
  let color = 'text-slate-600';
  let glowClass = '';

  if (isOperationallyOverdue) {
    if (operationalOverdue > 30) {
      severity = 'critical';
      color = 'text-red-700';
      glowClass = 'shadow-[0_0_20px_rgba(239,68,68,0.6)] border-red-500';
    } else if (operationalOverdue > 7) {
      severity = 'warning';
      color = 'text-orange-600';
      glowClass = 'shadow-[0_0_15px_rgba(249,115,22,0.5)] border-orange-400';
    } else {
      severity = 'warning';
      color = 'text-yellow-600';
      glowClass = 'shadow-[0_0_10px_rgba(234,179,8,0.4)] border-yellow-400';
    }
  } else if (operationalOverdue > -7 && operationalOverdue <= 0) {
    severity = 'warning';
    color = 'text-amber-600';
    glowClass = 'border-amber-300';
  }

  return {
    ageFromDetection,
    performanceDelay,
    operationalOverdue,
    extensionDays,
    isOperationallyOverdue,
    isPerformanceDelayed,
    severity,
    color,
    glowClass,
  };
}

export function useActionAging(action: Action): AgingMetrics {
  return calculateActionAging(action);
}

export function formatAgingMetric(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return '1 day';
  if (days === -1) return 'Tomorrow';
  if (days > 0) return `${days} days overdue`;
  return `${Math.abs(days)} days remaining`;
}

export function getAgingColor(aging: Partial<ActionAging>): string {
  if (!aging.is_operationally_overdue) return 'green';

  const overdue = aging.operational_overdue_days || 0;
  if (overdue > 30) return 'red';
  if (overdue > 7) return 'orange';
  return 'yellow';
}
