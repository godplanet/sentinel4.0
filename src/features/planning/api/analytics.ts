import { supabase } from '@/shared/api/supabase';

export interface PlanComplianceMetrics {
  total_audits: number;
  completed_audits: number;
  in_progress_audits: number;
  overdue_audits: number;
  completion_rate: number;
  risk_coverage_score: number;
}

export interface AuditByType {
  audit_type: string;
  count: number;
}

export interface OverdueAudit {
  id: string;
  title: string;
  end_date: string;
  status: string;
  assigned_lead: string | null;
  days_overdue: number;
}

export async function getPlanComplianceMetrics(): Promise<PlanComplianceMetrics> {
  const { data: audits, error } = await supabase
    .from('audit_engagements')
    .select('status, end_date');

  if (error) throw error;

  const total = audits?.length || 0;
  const completed = audits?.filter(a => a.status === 'COMPLETED').length || 0;
  const inProgress = audits?.filter(a => a.status === 'FIELDWORK' || a.status === 'REPORTING').length || 0;

  const now = new Date();
  const overdue = audits?.filter(a => {
    if (a.status === 'COMPLETED') return false;
    const endDate = new Date(a.end_date);
    return endDate < now;
  }).length || 0;

  return {
    total_audits: total,
    completed_audits: completed,
    in_progress_audits: inProgress,
    overdue_audits: overdue,
    completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    risk_coverage_score: 78,
  };
}

export async function getAuditsByType(): Promise<AuditByType[]> {
  const { data, error } = await supabase
    .from('audit_engagements')
    .select('audit_type');

  if (error) throw error;

  const typeCounts: Record<string, number> = {};
  data?.forEach(audit => {
    const type = audit.audit_type || 'UNKNOWN';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  return Object.entries(typeCounts).map(([type, count]) => ({
    audit_type: type,
    count,
  }));
}

export async function getOverdueAudits(): Promise<OverdueAudit[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('audit_engagements')
    .select('id, title, end_date, status, assigned_lead')
    .neq('status', 'COMPLETED')
    .lt('end_date', now)
    .order('end_date', { ascending: true })
    .limit(10);

  if (error) throw error;

  return (data || []).map(audit => {
    const endDate = new Date(audit.end_date);
    const nowDate = new Date();
    const diffTime = Math.abs(nowDate.getTime() - endDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      ...audit,
      days_overdue: diffDays,
    };
  });
}
