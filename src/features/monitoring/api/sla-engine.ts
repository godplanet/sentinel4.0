import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';

/** SLA policy row from DB. */
export interface SLAPolicy {
  id: string;
  tenant_id: string;
  severity: string;
  max_delay_days: number;
  target_level: number;
  created_at: string;
}

/** Escalation log row. */
export interface EscalationLog {
  id: string;
  tenant_id: string;
  action_id: string;
  escalation_level: number;
  triggered_at: string;
  cae_decision: 'PENDING' | 'TOLERATED' | 'COMMITTEE_FLAGGED';
  justification: string | null;
  created_at: string;
}

/** Open action row (minimal for SLA check). */
interface OpenActionRow {
  id: string;
  tenant_id: string;
  priority: string;
  current_due_date: string;
  status: string;
}

const CLOSED_STATUSES = ['closed', 'CLOSED', 'risk_accepted'];

/**
 * Geçmiş aksiyonları tarar, sla_policies'e göre gecikmeyi hesaplar.
 * Tavan (target_level = 3, CAE) aşıldıysa escalation_logs'a Level 3 PENDING kayıt atar.
 * Aynı action_id için zaten PENDING kayıt varsa tekrar eklemez.
 */
export async function evaluateSLABreaches(): Promise<{ evaluated: number; escalated: number }> {
  const tenantId = ACTIVE_TENANT_ID;

  const [policiesResult, actionsResult, existingPendingResult] = await Promise.all([
    supabase
      .from('sla_policies')
      .select('id, severity, max_delay_days, target_level')
      .eq('tenant_id', tenantId),
    supabase
      .from('actions')
      .select('id, tenant_id, priority, current_due_date, status')
      .eq('tenant_id', tenantId),
    supabase
      .from('escalation_logs')
      .select('action_id')
      .eq('tenant_id', tenantId)
      .eq('cae_decision', 'PENDING')
      .eq('escalation_level', 3),
  ]);

  if (policiesResult.error) throw policiesResult.error;
  if (actionsResult.error) throw actionsResult.error;
  if (existingPendingResult.error) throw existingPendingResult.error;

  const policies = (policiesResult.data ?? []) as SLAPolicy[];
  const allActions = (actionsResult.data ?? []) as OpenActionRow[];
  const actions = allActions.filter(
    (a) => !CLOSED_STATUSES.includes(a.status)
  );
  const existingPending = new Set(
    (existingPendingResult.data ?? []).map((r: { action_id: string }) => r.action_id)
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const policyBySeverity = new Map<string, SLAPolicy>();
  for (const p of policies) {
    policyBySeverity.set(p.severity, p);
  }

  let escalated = 0;

  for (const action of actions) {
    const due = action.current_due_date ? new Date(action.current_due_date) : null;
    if (!due) continue;
    due.setHours(0, 0, 0, 0);
    const delayDays = Math.max(0, Math.floor((today.getTime() - due.getTime()) / (24 * 60 * 60 * 1000)));

    const policy = policyBySeverity.get(action.priority) ?? policyBySeverity.get('MEDIUM') ?? policyBySeverity.get('LOW');
    if (!policy || policy.target_level !== 3) continue;
    if (delayDays < policy.max_delay_days) continue;
    if (existingPending.has(action.id)) continue;

    const { error } = await supabase.from('escalation_logs').insert({
      tenant_id: tenantId,
      action_id: action.id,
      escalation_level: 3,
      triggered_at: new Date().toISOString(),
      cae_decision: 'PENDING',
      justification: null,
    });
    if (!error) {
      escalated += 1;
      existingPending.add(action.id);
    }
  }

  return { evaluated: actions.length, escalated };
}

/** CAE bekleyen (cae_decision = PENDING) Level 3 eskalasyonları getirir. */
export async function fetchPendingCAEEscalations(): Promise<EscalationLog[]> {
  const { data, error } = await supabase
    .from('escalation_logs')
    .select('*')
    .eq('tenant_id', ACTIVE_TENANT_ID)
    .eq('escalation_level', 3)
    .eq('cae_decision', 'PENDING')
    .order('triggered_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as EscalationLog[];
}

/** Aksiyon özeti (kart gösterimi için). */
export interface ActionSummary {
  id: string;
  title: string | null;
  current_due_date: string | null;
  priority: string | null;
  status: string | null;
}

/** CAE bekleyen eskalasyonlar + ilgili aksiyon özeti. */
export interface PendingEscalationWithAction extends EscalationLog {
  action?: ActionSummary | null;
}

/** PENDING Level 3 eskalasyonları aksiyon bilgisiyle getirir. */
export async function fetchPendingCAEEscalationsWithActions(): Promise<PendingEscalationWithAction[]> {
  const logs = await fetchPendingCAEEscalations();
  if (logs.length === 0) return [];

  const actionIds = [...new Set(logs.map((l) => l.action_id))];
  const { data: actionsData, error } = await supabase
    .from('actions')
    .select('id, title, current_due_date, priority, status')
    .in('id', actionIds);

  if (error) throw error;
  const actionMap = new Map<string, ActionSummary>();
  for (const a of actionsData ?? []) {
    actionMap.set((a as { id: string }).id, a as ActionSummary);
  }

  return logs.map((log) => ({
    ...log,
    action: actionMap.get(log.action_id) ?? null,
  }));
}

export type CAEDecision = 'TOLERATED' | 'COMMITTEE_FLAGGED';

/** CAE kararını kaydeder (TOLERATED veya COMMITTEE_FLAGGED). */
export async function updateEscalationCAEDecision(
  escalationId: string,
  decision: CAEDecision,
  justification?: string
): Promise<EscalationLog> {
  const { data, error } = await supabase
    .from('escalation_logs')
    .update({
      cae_decision: decision,
      justification: justification ?? null,
    })
    .eq('id', escalationId)
    .eq('tenant_id', ACTIVE_TENANT_ID)
    .select('*')
    .single();

  if (error) throw error;
  return data as EscalationLog;
}
