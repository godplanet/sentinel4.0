import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

export interface ExecutiveDashboardRow {
  engagement_title: string;
  finding_id: string;
  finding_title: string;
  finding_severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  finding_year: number;
  agreement_date: string;
  auditee_department: string;
  action_id: string | null;
  action_title: string | null;
  action_description: string | null;
  action_target_date: string | null;
  original_due_date: string | null;
  extension_count: number | null;
  action_status: string | null;
  responsible_person: string | null;
  finding_age_days: number;
  days_overdue: number;
  regulatory_status: string;
  alert_level: 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN';
}

export interface ExecutiveSummary {
  total_findings: number;
  closed_findings: number;
  overdue_findings: number;
  critical_findings: number;
  overdue_1year_plus: number;
  avg_resolution_days: number;
  total_extensions: number;
}

export async function getExecutiveDashboardData(): Promise<ExecutiveDashboardRow[]> {
  const { data, error } = await supabase
    .from('view_executive_dashboard')
    .select('*')
    .order('finding_year', { ascending: false });

  if (error) {
    console.error('Error fetching executive dashboard data:', error);
    return [];
  }

  return data || [];
}

export async function getExecutiveSummary(): Promise<ExecutiveSummary | null> {
  const { data, error } = await supabase
    .from('view_bddk_compliance_summary')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching executive summary:', error);
    return null;
  }

  return data;
}

export interface ActionStatusCount {
  status: string;
  count: number;
}

export interface ActionByYear {
  year: number;
  count: number;
}

export interface ActionBySeverity {
  severity: string;
  count: number;
}

export interface ActionByDepartment {
  department: string;
  count: number;
}

export interface ActionByExtension {
  extension_count: number;
  count: number;
}

export interface RegulatoryStatusCount {
  status: string;
  count: number;
  severity: string;
}

export function calculateActionStatusCounts(data: ExecutiveDashboardRow[]): ActionStatusCount[] {
  const statusMap = new Map<string, number>();

  data.forEach(row => {
    if (row.action_status) {
      const current = statusMap.get(row.action_status) || 0;
      statusMap.set(row.action_status, current + 1);
    }
  });

  return Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    count
  }));
}

export function calculateActionsByYear(data: ExecutiveDashboardRow[]): ActionByYear[] {
  const yearMap = new Map<number, number>();

  data.forEach(row => {
    if (row.action_status && row.action_status !== 'COMPLETED') {
      const current = yearMap.get(row.finding_year) || 0;
      yearMap.set(row.finding_year, current + 1);
    }
  });

  return Array.from(yearMap.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year - b.year);
}

export function calculateActionsBySeverity(data: ExecutiveDashboardRow[]): ActionBySeverity[] {
  const severityMap = new Map<string, number>();

  data.forEach(row => {
    if (row.action_status) {
      const current = severityMap.get(row.finding_severity) || 0;
      severityMap.set(row.finding_severity, current + 1);
    }
  });

  const order = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  return order
    .filter(sev => severityMap.has(sev))
    .map(severity => ({
      severity,
      count: severityMap.get(severity) || 0
    }));
}

export function calculateActionsByDepartment(data: ExecutiveDashboardRow[]): ActionByDepartment[] {
  const deptMap = new Map<string, number>();

  data.forEach(row => {
    if (row.action_status && row.auditee_department) {
      const current = deptMap.get(row.auditee_department) || 0;
      deptMap.set(row.auditee_department, current + 1);
    }
  });

  return Array.from(deptMap.entries())
    .map(([department, count]) => ({ department, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export function calculateActionsByExtension(data: ExecutiveDashboardRow[]): ActionByExtension[] {
  const extMap = new Map<number, number>();

  data.forEach(row => {
    if (row.action_status && row.extension_count !== null) {
      const ext = row.extension_count >= 4 ? 4 : row.extension_count;
      const current = extMap.get(ext) || 0;
      extMap.set(ext, current + 1);
    }
  });

  return [0, 1, 2, 3, 4].map(ext => ({
    extension_count: ext,
    count: extMap.get(ext) || 0
  }));
}

export function calculateRegulatoryStatus(data: ExecutiveDashboardRow[]): RegulatoryStatusCount[] {
  const statusMap = new Map<string, Map<string, number>>();

  data.forEach(row => {
    if (row.action_status && row.action_status !== 'COMPLETED') {
      if (!statusMap.has(row.regulatory_status)) {
        statusMap.set(row.regulatory_status, new Map());
      }
      const severityMap = statusMap.get(row.regulatory_status)!;
      const current = severityMap.get(row.finding_severity) || 0;
      severityMap.set(row.finding_severity, current + 1);
    }
  });

  const result: RegulatoryStatusCount[] = [];
  statusMap.forEach((severityMap, status) => {
    severityMap.forEach((count, severity) => {
      result.push({ status, severity, count });
    });
  });

  return result;
}

export interface AgingBucket {
  bucket: string;
  count: number;
}

export function calculateFindingAging(data: ExecutiveDashboardRow[]): AgingBucket[] {
  const buckets = [
    { label: '0-90 gün', min: 0, max: 90 },
    { label: '90-180 gün', min: 90, max: 180 },
    { label: '180-365 gün', min: 180, max: 365 },
    { label: '1+ yıl', min: 365, max: Infinity }
  ];

  return buckets.map(({ label, min, max }) => ({
    bucket: label,
    count: data.filter(row =>
      row.finding_age_days >= min && row.finding_age_days < max
    ).length
  }));
}

export function calculateActionAging(data: ExecutiveDashboardRow[]): AgingBucket[] {
  const buckets = [
    { label: '0-90 gün', min: 0, max: 90 },
    { label: '90-180 gün', min: 90, max: 180 },
    { label: '180-365 gün', min: 180, max: 365 },
    { label: '1+ yıl', min: 365, max: Infinity }
  ];

  return buckets.map(({ label, min, max }) => ({
    bucket: label,
    count: data.filter(row =>
      (row?.days_overdue || 0) >= min && (row?.days_overdue || 0) < max
    ).length
  }));
}

// ============================================================================
// REACT QUERY HOOKS (Extreme Defensive Programming Layer)
// ============================================================================

export const executiveDashboardKeys = {
  all: ['executiveDashboard'] as const,
  lists: () => [...executiveDashboardKeys.all, 'list'] as const,
  summary: () => [...executiveDashboardKeys.all, 'summary'] as const,
};

export function useExecutiveDashboard() {
  return useQuery({
    queryKey: executiveDashboardKeys.lists(),
    queryFn: async () => {
      const data = await getExecutiveDashboardData();
      return (data || []).map(row => ({
        ...row,
        finding_severity: row?.finding_severity ?? 'LOW',
        action_status: row?.action_status ?? 'OPEN',
        extension_count: row?.extension_count ?? 0,
        days_overdue: row?.days_overdue ?? 0,
        finding_age_days: row?.finding_age_days ?? 0,
        alert_level: row?.alert_level ?? 'GREEN',
        action_title: row?.action_title ?? '',
        engagement_title: row?.engagement_title ?? 'Bilinmeyen Görev',
      }));
    },
  });
}

export function useExecutiveSummary() {
  return useQuery({
    queryKey: executiveDashboardKeys.summary(),
    queryFn: async () => {
      const item = await getExecutiveSummary();
      return {
        total_findings: item?.total_findings || 0,
        closed_findings: item?.closed_findings || 0,
        overdue_findings: item?.overdue_findings || 0,
        critical_findings: item?.critical_findings || 0,
        overdue_1year_plus: item?.overdue_1year_plus || 0,
        avg_resolution_days: item?.avg_resolution_days || 0,
        total_extensions: item?.total_extensions || 0
      };
    },
  });
}

