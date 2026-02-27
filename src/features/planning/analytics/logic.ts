import type { AuditEngagement, AuditPlan } from '@/entities/planning';

export interface EngagementAnalytics {
  engagement: AuditEngagement;
  plannedProgress: number;
  actualProgress: number;
  scheduleVariance: number;
  costVariance: number;
  daysDelay: number;
  isDelayed: boolean;
  isOverBudget: boolean;
  performanceIndex: number;
}

export interface PlanAnalytics {
  totalEngagements: number;
  completedEngagements: number;
  inProgressEngagements: number;
  plannedEngagements: number;
  cancelledEngagements: number;

  totalPlannedHours: number;
  totalActualHours: number;
  totalBudgetedHours: number;

  planRealizationRate: number;
  resourceUtilization: number;
  schedulePerformanceIndex: number;
  costPerformanceIndex: number;

  onTimeEngagements: number;
  delayedEngagements: number;
  avgDelayDays: number;

  delayRisks: EngagementAnalytics[];
}

export function calculateEngagementAnalytics(
  engagement: AuditEngagement,
  currentDate: Date = new Date()
): EngagementAnalytics {
  const startDate = new Date(engagement.start_date);
  const endDate = new Date(engagement.end_date);
  const current = currentDate;

  const totalDuration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  const elapsedDuration = (current.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

  let plannedProgress = 0;
  if (current < startDate) {
    plannedProgress = 0;
  } else if (current > endDate) {
    plannedProgress = 100;
  } else {
    plannedProgress = Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));
  }

  let actualProgress = 0;
  switch (engagement.status) {
    case 'PLANNED':
      actualProgress = 0;
      break;
    case 'IN_PROGRESS':
      const hoursProgress = (engagement.actual_hours / engagement.estimated_hours) * 100;
      actualProgress = Math.min(90, hoursProgress);
      break;
    case 'COMPLETED':
      actualProgress = 100;
      break;
    case 'CANCELLED':
      actualProgress = 0;
      break;
  }

  const scheduleVariance = actualProgress - plannedProgress;

  const costVariance = engagement.estimated_hours - engagement.actual_hours;

  const daysDelay = current > endDate && engagement.status !== 'COMPLETED'
    ? Math.floor((current.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const isDelayed = scheduleVariance < -10 || daysDelay > 0;

  const isOverBudget = engagement.actual_hours > engagement.estimated_hours * 1.1;

  const performanceIndex = engagement.estimated_hours > 0
    ? (actualProgress / 100) / (engagement.actual_hours / engagement.estimated_hours)
    : 1;

  return {
    engagement,
    plannedProgress,
    actualProgress,
    scheduleVariance,
    costVariance,
    daysDelay,
    isDelayed,
    isOverBudget,
    performanceIndex: Math.min(2, Math.max(0, performanceIndex)),
  };
}

export function calculatePlanAnalytics(
  plan: AuditPlan,
  engagements: AuditEngagement[],
  currentDate: Date = new Date()
): PlanAnalytics {
  const planEngagements = engagements.filter(e => e.plan_id === plan.id);

  const engagementAnalytics = planEngagements.map(e =>
    calculateEngagementAnalytics(e, currentDate)
  );

  const totalEngagements = planEngagements.length;
  const completedEngagements = planEngagements.filter(e => e.status === 'COMPLETED').length;
  const inProgressEngagements = planEngagements.filter(e => e.status === 'IN_PROGRESS').length;
  const plannedEngagements = planEngagements.filter(e => e.status === 'PLANNED').length;
  const cancelledEngagements = planEngagements.filter(e => e.status === 'CANCELLED').length;

  const totalPlannedHours = planEngagements.reduce((sum, e) => sum + e.estimated_hours, 0);
  const totalActualHours = planEngagements.reduce((sum, e) => sum + e.actual_hours, 0);
  const totalBudgetedHours = totalPlannedHours;

  const planRealizationRate = totalEngagements > 0
    ? (completedEngagements / totalEngagements) * 100
    : 0;

  const resourceUtilization = totalPlannedHours > 0
    ? (totalActualHours / totalPlannedHours) * 100
    : 0;

  const avgPlannedProgress = engagementAnalytics.reduce((sum, a) => sum + a.plannedProgress, 0) / Math.max(1, totalEngagements);
  const avgActualProgress = engagementAnalytics.reduce((sum, a) => sum + a.actualProgress, 0) / Math.max(1, totalEngagements);

  const schedulePerformanceIndex = avgPlannedProgress > 0
    ? avgActualProgress / avgPlannedProgress
    : 1;

  const costPerformanceIndex = totalActualHours > 0
    ? totalPlannedHours / totalActualHours
    : 1;

  const delayedAnalytics = engagementAnalytics.filter(a => a.isDelayed);
  const onTimeEngagements = totalEngagements - delayedAnalytics.length;
  const delayedEngagements = delayedAnalytics.length;

  const avgDelayDays = delayedAnalytics.length > 0
    ? delayedAnalytics.reduce((sum, a) => sum + Math.abs(a.scheduleVariance), 0) / delayedAnalytics.length
    : 0;

  const delayRisks = engagementAnalytics
    .filter(a => a.isDelayed || a.scheduleVariance < -5)
    .sort((a, b) => a.scheduleVariance - b.scheduleVariance)
    .slice(0, 10);

  return {
    totalEngagements,
    completedEngagements,
    inProgressEngagements,
    plannedEngagements,
    cancelledEngagements,

    totalPlannedHours,
    totalActualHours,
    totalBudgetedHours,

    planRealizationRate,
    resourceUtilization,
    schedulePerformanceIndex,
    costPerformanceIndex,

    onTimeEngagements,
    delayedEngagements,
    avgDelayDays,

    delayRisks,
  };
}

export function generateMockProgressData(
  engagements: AuditEngagement[],
  periodStart: string,
  periodEnd: string
): Array<{
  date: string;
  plannedHours: number;
  actualHours: number;
  cumulativePlanned: number;
  cumulativeActual: number;
}> {
  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  const current = new Date();

  const weeks: Date[] = [];
  let weekDate = new Date(start);

  while (weekDate <= end) {
    weeks.push(new Date(weekDate));
    weekDate.setDate(weekDate.getDate() + 7);
  }

  const totalPlannedHours = engagements.reduce((sum, e) => sum + e.estimated_hours, 0);
  const hoursPerWeek = totalPlannedHours / weeks.length;

  const data = weeks.map((weekStart, index) => {
    const isFuture = weekStart > current;

    const plannedHours = hoursPerWeek;

    const actualHours = isFuture
      ? 0
      : plannedHours * (0.7 + Math.random() * 0.5);

    const cumulativePlanned = (index + 1) * hoursPerWeek;
    const cumulativeActual = isFuture
      ? data.slice(0, index).reduce((sum, d) => sum + (d.actualHours || 0), 0)
      : (index + 1) * hoursPerWeek * 0.85;

    return {
      date: weekStart.toISOString().split('T')[0],
      plannedHours: Math.round(plannedHours),
      actualHours: Math.round(actualHours),
      cumulativePlanned: Math.round(cumulativePlanned),
      cumulativeActual: Math.round(cumulativeActual),
    };
  });

  return data;
}

export function getComplianceStatus(score: number): {
  label: string;
  color: string;
  severity: 'success' | 'warning' | 'danger';
} {
  if (score >= 90) {
    return { label: 'Excellent', color: 'text-green-600', severity: 'success' };
  } else if (score >= 75) {
    return { label: 'Good', color: 'text-blue-600', severity: 'success' };
  } else if (score >= 60) {
    return { label: 'Fair', color: 'text-yellow-600', severity: 'warning' };
  } else {
    return { label: 'Poor', color: 'text-red-600', severity: 'danger' };
  }
}
