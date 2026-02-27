/**
 * FINDING WORKFLOW NOTIFICATIONS & NAGGING BOT
 *
 * Automated notification system:
 * 1. Trigger notifications when findings are issued
 * 2. Nag auditees when responses are overdue
 * 3. Escalate to managers when severely overdue
 */

import { supabase } from '@/shared/api/supabase';
import type { FindingWorkflowState } from './workflow';

export type NotificationType =
  | 'FINDING_ISSUED'
  | 'FINDING_OVERDUE'
  | 'FINDING_ESCALATED'
  | 'FINDING_VALIDATED'
  | 'FINDING_CLOSED'
  | 'FINDING_RESPONSE_RECEIVED'
  | 'ACTION_PLAN_DUE';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SystemNotification {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  related_finding_id: string | null;
  related_entity_id: string | null;
  is_read: boolean;
  is_escalated: boolean;
  priority: NotificationPriority;
  action_url: string | null;
  tenant_id: string;
  created_at: string;
  read_at: string | null;
}

export interface OverdueFinding {
  id: string;
  title: string;
  workflow_state: FindingWorkflowState;
  response_due_date: string;
  auditee_id: string;
  days_overdue: number;
}

/**
 * Create a notification for a user
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  tenantId: string,
  options?: {
    findingId?: string;
    entityId?: string;
    priority?: NotificationPriority;
    actionUrl?: string;
  }
): Promise<string | null> {
  const { data, error } = await supabase.rpc('create_finding_notification', {
    p_user_id: userId,
    p_notification_type: type,
    p_title: title,
    p_message: message,
    p_finding_id: options?.findingId || null,
    p_priority: options?.priority || 'MEDIUM',
    p_action_url: options?.actionUrl || null,
    p_tenant_id: tenantId,
  });

  if (error) {
    console.error('Failed to create notification:', error);
    return null;
  }

  return data as string;
}

/**
 * Trigger notification when finding is issued to management
 */
export async function notifyFindingIssued(
  findingId: string,
  findingTitle: string,
  auditeeId: string,
  dueDate: string,
  tenantId: string
): Promise<void> {
  const dueDateFormatted = new Date(dueDate).toLocaleDateString();

  await createNotification(
    auditeeId,
    'FINDING_ISSUED',
    'Action Required: New Finding',
    `Please provide management response for Finding: "${findingTitle}". Due: ${dueDateFormatted}`,
    tenantId,
    {
      findingId,
      priority: 'HIGH',
      actionUrl: `/findings/${findingId}`,
    }
  );
}

/**
 * Trigger notification when finding is validated
 */
export async function notifyFindingValidated(
  findingId: string,
  findingTitle: string,
  auditeeId: string,
  tenantId: string
): Promise<void> {
  await createNotification(
    auditeeId,
    'FINDING_VALIDATED',
    'Finding Validated',
    `Your response for "${findingTitle}" has been validated. Action plan is now active.`,
    tenantId,
    {
      findingId,
      priority: 'MEDIUM',
      actionUrl: `/findings/${findingId}`,
    }
  );
}

/**
 * Trigger notification when finding is closed
 */
export async function notifyFindingClosed(
  findingId: string,
  findingTitle: string,
  auditeeId: string,
  tenantId: string
): Promise<void> {
  await createNotification(
    auditeeId,
    'FINDING_CLOSED',
    'Finding Closed',
    `Finding "${findingTitle}" has been closed. All action items completed.`,
    tenantId,
    {
      findingId,
      priority: 'LOW',
      actionUrl: `/findings/${findingId}`,
    }
  );
}

/**
 * Get all overdue findings
 */
export async function getOverdueFindings(): Promise<OverdueFinding[]> {
  const { data, error } = await supabase.from('overdue_findings').select('*');

  if (error) {
    console.error('Failed to fetch overdue findings:', error);
    return [];
  }

  return data as OverdueFinding[];
}

/**
 * THE NAGGING BOT
 * Send overdue notifications to auditees
 */
export async function sendOverdueNotifications(): Promise<{
  sent: number;
  escalated: number;
}> {
  const overdueFindings = await getOverdueFindings();
  let sent = 0;
  let escalated = 0;

  for (const finding of overdueFindings) {
    const daysOverdue = finding.days_overdue;
    const isEscalated = daysOverdue > 7; // Escalate if more than 7 days overdue

    const priority: NotificationPriority = daysOverdue > 14 ? 'CRITICAL' : daysOverdue > 7 ? 'HIGH' : 'MEDIUM';

    const title = isEscalated
      ? '⚠️ CRITICAL: Finding Response SEVERELY Overdue'
      : 'Reminder: Finding Response Overdue';

    const message = isEscalated
      ? `Finding "${finding.title}" is ${daysOverdue} days overdue. This has been escalated to management.`
      : `Finding "${finding.title}" is ${daysOverdue} days overdue. Please provide your response as soon as possible.`;

    // Get finding details to get tenant_id
    const { data: findingData } = await supabase
      .from('audit_findings')
      .select('engagement_id')
      .eq('id', finding.id)
      .single();

    if (!findingData) continue;

    // Get tenant_id from engagement
    const { data: engagementData } = await supabase
      .from('audit_engagements')
      .select('tenant_id')
      .eq('id', findingData.engagement_id)
      .single();

    if (!engagementData) continue;

    await createNotification(
      finding.auditee_id,
      'FINDING_OVERDUE',
      title,
      message,
      engagementData.tenant_id,
      {
        findingId: finding.id,
        priority,
        actionUrl: `/findings/${finding.id}`,
      }
    );

    sent++;

    // If escalated, also notify the manager
    if (isEscalated) {
      // Find manager (you would need to implement this based on your org structure)
      // For now, we'll mark the notification as escalated
      const { error: escalateError } = await supabase
        .from('system_notifications')
        .update({ is_escalated: true })
        .eq('related_finding_id', finding.id)
        .eq('notification_type', 'FINDING_OVERDUE');

      if (!escalateError) {
        escalated++;
      }
    }
  }

  return { sent, escalated };
}

/**
 * Get unread notifications for a user
 */
export async function getUserNotifications(
  userId: string,
  unreadOnly: boolean = false
): Promise<SystemNotification[]> {
  let query = supabase
    .from('system_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }

  return data as SystemNotification[];
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('user_notification_counts')
    .select('unread_count')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return 0;

  return data.unread_count || 0;
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase.rpc('mark_notification_read', {
    p_notification_id: notificationId,
  });

  if (error) {
    console.error('Failed to mark notification as read:', error);
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('system_notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Failed to mark all as read:', error);
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('system_notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('Failed to delete notification:', error);
  }
}

/**
 * Check for overdue findings on page load (the nagging check)
 * Returns list of overdue findings that need attention
 */
export async function checkOverdueFindingsOnLoad(): Promise<{
  overdueCount: number;
  criticalCount: number;
  findings: OverdueFinding[];
}> {
  const findings = await getOverdueFindings();

  const criticalFindings = findings.filter((f) => f.days_overdue > 7);

  return {
    overdueCount: findings.length,
    criticalCount: criticalFindings.length,
    findings,
  };
}

/**
 * Auto-run nagging bot (call this from a cron job or scheduled task)
 */
export async function runNaggingBot(): Promise<void> {
  console.log('Running Nagging Bot...');
  const result = await sendOverdueNotifications();
  console.log(`Nagging Bot: Sent ${result.sent} notifications, escalated ${result.escalated}`);
}

/**
 * Get notification badge count (for UI)
 */
export async function getNotificationBadge(userId: string): Promise<{
  total: number;
  critical: number;
}> {
  const { data, error } = await supabase
    .from('user_notification_counts')
    .select('unread_count, critical_count')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return { total: 0, critical: 0 };
  }

  return {
    total: data.unread_count || 0,
    critical: data.critical_count || 0,
  };
}
