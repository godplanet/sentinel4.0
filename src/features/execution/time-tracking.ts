/**
 * TIME TRACKING & BUDGET ROLLUP ENGINE
 *
 * Automatically tracks time and rolls up to engagement level.
 *
 * Flow:
 * 1. logWorkpaperTime() → INSERT into workpaper_time_logs
 * 2. DB Trigger → UPDATE workpapers.total_hours_spent
 * 3. DB Trigger → UPDATE audit_engagements.actual_hours (sum of all workpapers)
 */

import { supabase } from '@/shared/api/supabase';

export interface TimeLogInput {
  workpaper_id: string;
  auditor_id: string;
  hours_logged: number;
  log_date: string;
  description?: string;
  tenant_id: string;
}

export interface TimeLogRecord {
  id: string;
  workpaper_id: string;
  auditor_id: string;
  hours_logged: number;
  log_date: string;
  description: string | null;
  created_at: string;
}

export interface BudgetSummary {
  engagement_id: string;
  title: string;
  estimated_hours: number;
  actual_hours: number;
  variance_hours: number;
  utilization_percent: number;
  budget_status: 'UNDER_BUDGET' | 'ON_BUDGET' | 'OVER_BUDGET';
}

export interface BurnRateAnalysis {
  engagement_id: string;
  days_elapsed: number;
  days_total: number;
  progress_percent: number;
  hours_burned: number;
  hours_budget: number;
  burn_rate: number;
  projected_total_hours: number;
  is_at_risk: boolean;
}

/**
 * Main API: Log time to a workpaper
 * Triggers automatic rollup to engagement.actual_hours
 */
export async function logWorkpaperTime(input: TimeLogInput): Promise<TimeLogRecord> {
  const { data, error } = await supabase
    .from('workpaper_time_logs')
    .insert({
      workpaper_id: input.workpaper_id,
      auditor_id: input.auditor_id,
      hours_logged: input.hours_logged,
      log_date: input.log_date,
      description: input.description || null,
      tenant_id: input.tenant_id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to log time: ${error.message}`);
  }

  // Database triggers will automatically:
  // 1. Update workpapers.total_hours_spent
  // 2. Update audit_engagements.actual_hours

  return data as TimeLogRecord;
}

/**
 * Shortcut: Log time for today
 */
export async function quickLogTime(
  workpaperId: string,
  auditorId: string,
  hours: number,
  tenantId: string,
  description?: string
): Promise<TimeLogRecord> {
  return logWorkpaperTime({
    workpaper_id: workpaperId,
    auditor_id: auditorId,
    hours_logged: hours,
    log_date: new Date().toISOString().split('T')[0],
    description,
    tenant_id: tenantId,
  });
}

/**
 * Get all time logs for a workpaper
 */
export async function getWorkpaperTimeLogs(workpaperId: string): Promise<TimeLogRecord[]> {
  const { data, error } = await supabase
    .from('workpaper_time_logs')
    .select('*')
    .eq('workpaper_id', workpaperId)
    .order('log_date', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch time logs: ${error.message}`);
  }

  return data as TimeLogRecord[];
}

/**
 * Manual rollup trigger (for verification)
 * Usually not needed - DB triggers handle this automatically
 */
export async function rollupWorkpaperTimeToEngagement(engagementId: string): Promise<void> {
  // Query all workpapers for this engagement and sum hours
  const { data: workpapers, error } = await supabase
    .from('workpapers')
    .select('total_hours_spent, step_id')
    .in(
      'step_id',
      supabase
        .from('audit_steps')
        .select('id')
        .eq('engagement_id', engagementId)
    );

  if (error || !workpapers) {
    throw new Error(`Failed to rollup time: ${error?.message}`);
  }

  const totalHours = workpapers.reduce((sum, wp) => sum + (wp.total_hours_spent || 0), 0);

  // Update engagement
  const { error: updateError } = await supabase
    .from('audit_engagements')
    .update({ actual_hours: Math.round(totalHours) })
    .eq('id', engagementId);

  if (updateError) {
    throw new Error(`Failed to update engagement hours: ${updateError.message}`);
  }
}

/**
 * Get budget summary for an engagement
 * Uses the database view engagement_budget_summary
 */
export async function getEngagementBudgetSummary(engagementId: string): Promise<BudgetSummary | null> {
  const { data, error } = await supabase
    .from('engagement_budget_summary')
    .select('*')
    .eq('engagement_id', engagementId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch budget summary: ${error.message}`);
  }

  return data as BudgetSummary | null;
}

/**
 * Get budget summaries for all active engagements
 */
export async function getAllEngagementBudgets(): Promise<BudgetSummary[]> {
  const { data, error } = await supabase
    .from('engagement_budget_summary')
    .select('*')
    .order('title');

  if (error) {
    throw new Error(`Failed to fetch budget summaries: ${error.message}`);
  }

  return data as BudgetSummary[];
}

/**
 * Calculate burn rate and predict overrun
 */
export async function calculateEngagementBurnRate(engagementId: string): Promise<BurnRateAnalysis | null> {
  const { data: engagement, error } = await supabase
    .from('audit_engagements')
    .select('start_date, end_date, estimated_hours, actual_hours')
    .eq('id', engagementId)
    .maybeSingle();

  if (error || !engagement) {
    return null;
  }

  const startDate = new Date(engagement.start_date);
  const endDate = new Date(engagement.end_date);
  const today = new Date();

  const daysTotal = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const progressPercent = Math.min(100, (daysElapsed / daysTotal) * 100);

  const hoursBurned = engagement.actual_hours || 0;
  const hoursBudget = engagement.estimated_hours || 1;
  const burnRate = hoursBurned / Math.max(1, daysElapsed);

  const projectedTotalHours = burnRate * daysTotal;
  const isAtRisk = projectedTotalHours > hoursBudget * 1.1;

  return {
    engagement_id: engagementId,
    days_elapsed: daysElapsed,
    days_total: daysTotal,
    progress_percent: Math.round(progressPercent),
    hours_burned: hoursBurned,
    hours_budget: hoursBudget,
    burn_rate: Math.round(burnRate * 10) / 10,
    projected_total_hours: Math.round(projectedTotalHours),
    is_at_risk: isAtRisk,
  };
}

/**
 * Get time logs for an auditor (timesheet view)
 */
export async function getAuditorTimeLogs(
  auditorId: string,
  startDate: string,
  endDate: string
): Promise<TimeLogRecord[]> {
  const { data, error } = await supabase
    .from('workpaper_time_logs')
    .select('*')
    .eq('auditor_id', auditorId)
    .gte('log_date', startDate)
    .lte('log_date', endDate)
    .order('log_date', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch auditor time logs: ${error.message}`);
  }

  return data as TimeLogRecord[];
}

/**
 * Get total hours logged by auditor in date range
 */
export async function getAuditorTotalHours(
  auditorId: string,
  startDate: string,
  endDate: string
): Promise<number> {
  const { data, error } = await supabase
    .from('workpaper_time_logs')
    .select('hours_logged')
    .eq('auditor_id', auditorId)
    .gte('log_date', startDate)
    .lte('log_date', endDate);

  if (error) {
    return 0;
  }

  return data.reduce((sum, log) => sum + log.hours_logged, 0);
}

/**
 * Delete a time log (with rollback)
 */
export async function deleteTimeLog(logId: string): Promise<void> {
  const { error } = await supabase
    .from('workpaper_time_logs')
    .delete()
    .eq('id', logId);

  if (error) {
    throw new Error(`Failed to delete time log: ${error.message}`);
  }

  // DB triggers will automatically recalculate totals
}
