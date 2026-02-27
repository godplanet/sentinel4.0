/**
 * REPORT DATA INTEGRATION
 *
 * Fetches live data from engagements and findings for automated report generation.
 * Eliminates manual copy-pasting by providing dynamic data sources.
 */

import { supabase } from '@/shared/api/supabase';

export interface EngagementDetails {
  id: string;
  title: string;
  scope: string;
  start_date: string;
  end_date: string;
  status: string;
  entity_name: string;
  engagement_type: string;
  lead_auditor: string;
}

export interface FindingData {
  id: string;
  title: string;
  description: string;
  risk_rating: string;
  risk_level: string;
  severity: string;
  root_cause: string;
  impact: string;
  recommendation: string;
  management_response: string;
  target_completion_date: string;
  workflow_state: string;
  auditee_name: string;
  created_at: string;
}

export interface ReportStatistics {
  total_findings: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  open_count: number;
  closed_count: number;
  average_days_to_close: number;
}

export interface EngagementReportData {
  engagement_details: EngagementDetails;
  executive_summary: string;
  findings: FindingData[];
  statistics: ReportStatistics;
  generated_at: string;
}

/**
 * Fetch comprehensive report data for an engagement
 */
export async function fetchEngagementReportData(
  engagementId: string
): Promise<EngagementReportData | null> {
  try {
    // Fetch engagement details
    const { data: engagement, error: engagementError } = await supabase
      .from('audit_engagements')
      .select(`
        id,
        title,
        scope,
        start_date,
        end_date,
        status,
        engagement_type,
        entity:audit_universe!inner(title)
      `)
      .eq('id', engagementId)
      .single();

    if (engagementError || !engagement) {
      console.error('Failed to fetch engagement:', engagementError);
      return null;
    }

    // Fetch findings
    const { data: findings, error: findingsError } = await supabase
      .from('audit_findings')
      .select(`
        id,
        title,
        description,
        risk_rating,
        severity,
        root_cause,
        impact,
        recommendation,
        management_response,
        target_completion_date,
        workflow_state,
        created_at
      `)
      .eq('engagement_id', engagementId)
      .order('created_at', { ascending: false });

    if (findingsError) {
      console.error('Failed to fetch findings:', findingsError);
      return null;
    }

    // Calculate statistics
    const stats = calculateStatistics(findings || []);

    // Generate executive summary
    const executiveSummary = generateExecutiveSummary(engagement, findings || [], stats);

    // Format engagement details
    const engagementDetails: EngagementDetails = {
      id: engagement.id,
      title: engagement.title || 'Untitled Engagement',
      scope: engagement.scope || 'Not specified',
      start_date: engagement.start_date || '',
      end_date: engagement.end_date || '',
      status: engagement.status || 'In Progress',
      entity_name: engagement.entity?.title || 'Unknown Entity',
      engagement_type: engagement.engagement_type || 'Internal Audit',
      lead_auditor: 'TBD', // Would come from assignments table
    };

    // Format findings
    const formattedFindings: FindingData[] = (findings || []).map((f) => ({
      id: f.id,
      title: f.title || 'Untitled Finding',
      description: f.description || '',
      risk_rating: f.risk_rating || 'Not Rated',
      risk_level: mapRiskRating(f.risk_rating),
      severity: f.severity || 'Medium',
      root_cause: f.root_cause || 'Not documented',
      impact: f.impact || 'Not documented',
      recommendation: f.recommendation || 'Not documented',
      management_response: f.management_response || 'Pending',
      target_completion_date: f.target_completion_date || 'TBD',
      workflow_state: f.workflow_state || 'DRAFT',
      auditee_name: 'TBD', // Would come from user lookup
      created_at: f.created_at,
    }));

    return {
      engagement_details: engagementDetails,
      executive_summary: executiveSummary,
      findings: formattedFindings,
      statistics: stats,
      generated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching engagement report data:', error);
    return null;
  }
}

/**
 * Calculate statistics from findings
 */
function calculateStatistics(findings: any[]): ReportStatistics {
  const total = findings.length;

  const critical = findings.filter((f) =>
    f.severity === 'Critical' || f.risk_rating === '5'
  ).length;

  const high = findings.filter((f) =>
    f.severity === 'High' || f.risk_rating === '4'
  ).length;

  const medium = findings.filter((f) =>
    f.severity === 'Medium' || f.risk_rating === '3'
  ).length;

  const low = findings.filter((f) =>
    f.severity === 'Low' || ['1', '2'].includes(f.risk_rating)
  ).length;

  const open = findings.filter((f) =>
    f.workflow_state !== 'CLOSED'
  ).length;

  const closed = findings.filter((f) =>
    f.workflow_state === 'CLOSED'
  ).length;

  // Calculate average days to close
  const closedFindings = findings.filter((f) => f.closed_at && f.created_at);
  const avgDays = closedFindings.length > 0
    ? closedFindings.reduce((sum, f) => {
        const created = new Date(f.created_at).getTime();
        const closed = new Date(f.closed_at).getTime();
        return sum + (closed - created) / (1000 * 60 * 60 * 24);
      }, 0) / closedFindings.length
    : 0;

  return {
    total_findings: total,
    critical_count: critical,
    high_count: high,
    medium_count: medium,
    low_count: low,
    open_count: open,
    closed_count: closed,
    average_days_to_close: Math.round(avgDays),
  };
}

/**
 * Generate executive summary
 */
function generateExecutiveSummary(
  engagement: any,
  findings: any[],
  stats: ReportStatistics
): string {
  const entityName = engagement.entity?.title || 'the audited entity';
  const engagementType = engagement.engagement_type || 'Internal Audit';
  const period = `${formatDate(engagement.start_date)} to ${formatDate(engagement.end_date)}`;

  const summary = `
This ${engagementType} engagement of ${entityName} was conducted for the period ${period}.

The audit identified ${stats.total_findings} finding${stats.total_findings !== 1 ? 's' : ''}, including:
- ${stats.critical_count} Critical risk finding${stats.critical_count !== 1 ? 's' : ''}
- ${stats.high_count} High risk finding${stats.high_count !== 1 ? 's' : ''}
- ${stats.medium_count} Medium risk finding${stats.medium_count !== 1 ? 's' : ''}
- ${stats.low_count} Low risk finding${stats.low_count !== 1 ? 's' : ''}

${stats.open_count > 0
  ? `${stats.open_count} finding${stats.open_count !== 1 ? 's' : ''} remain${stats.open_count === 1 ? 's' : ''} open and require management action.`
  : 'All findings have been addressed and closed.'
}

${stats.closed_count > 0 && stats.average_days_to_close > 0
  ? `The average time to close findings was ${stats.average_days_to_close} days.`
  : ''
}

Management has provided responses to all significant findings and committed to implementing corrective actions within agreed timeframes. The audit team will conduct follow-up reviews to verify implementation of agreed action plans.
  `.trim();

  return summary;
}

/**
 * Map risk rating to risk level
 */
function mapRiskRating(rating: string | null): string {
  if (!rating) return 'Not Rated';

  const num = parseInt(rating);
  if (num === 5) return 'Critical';
  if (num === 4) return 'High';
  if (num === 3) return 'Medium';
  if (num <= 2) return 'Low';

  return rating;
}

/**
 * Format date
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return 'TBD';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Fetch list of active engagements for dropdown
 */
export async function fetchActiveEngagements(): Promise<Array<{
  id: string;
  title: string;
  entity_name: string;
  status: string;
}>> {
  const { data, error } = await supabase
    .from('audit_engagements')
    .select(`
      id,
      title,
      status,
      entity:audit_universe!inner(title)
    `)
    .in('status', ['Planning', 'Fieldwork', 'Reporting'])
    .order('start_date', { ascending: false })
    .limit(50);

  if (error || !data) {
    console.error('Failed to fetch engagements:', error);
    return [];
  }

  return data.map((e) => ({
    id: e.id,
    title: e.title || 'Untitled',
    entity_name: e.entity?.title || 'Unknown',
    status: e.status || 'Active',
  }));
}

/**
 * Fetch findings only (for lightweight updates)
 */
export async function fetchEngagementFindings(
  engagementId: string
): Promise<FindingData[]> {
  const { data, error } = await supabase
    .from('audit_findings')
    .select(`
      id,
      title,
      description,
      risk_rating,
      severity,
      root_cause,
      impact,
      recommendation,
      management_response,
      target_completion_date,
      workflow_state,
      created_at
    `)
    .eq('engagement_id', engagementId)
    .order('severity', { ascending: false });

  if (error || !data) {
    console.error('Failed to fetch findings:', error);
    return [];
  }

  return data.map((f) => ({
    id: f.id,
    title: f.title || 'Untitled Finding',
    description: f.description || '',
    risk_rating: f.risk_rating || 'Not Rated',
    risk_level: mapRiskRating(f.risk_rating),
    severity: f.severity || 'Medium',
    root_cause: f.root_cause || 'Not documented',
    impact: f.impact || 'Not documented',
    recommendation: f.recommendation || 'Not documented',
    management_response: f.management_response || 'Pending',
    target_completion_date: f.target_completion_date || 'TBD',
    workflow_state: f.workflow_state || 'DRAFT',
    auditee_name: 'TBD',
    created_at: f.created_at,
  }));
}

/**
 * Generate findings table HTML
 */
export function generateFindingsTableHTML(findings: FindingData[]): string {
  if (findings.length === 0) {
    return '<p class="text-slate-500 italic">No findings to display</p>';
  }

  const getRiskBadgeClass = (level: string): string => {
    switch (level) {
      case 'Critical': return 'bg-red-600 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-amber-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  const tableRows = findings
    .map((finding, index) => `
      <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}">
        <td class="px-4 py-3 text-sm font-medium text-slate-900 border">${index + 1}</td>
        <td class="px-4 py-3 text-sm text-slate-900 border">
          <div class="font-semibold">${finding.title}</div>
          <div class="text-xs text-slate-600 mt-1">${finding.description.substring(0, 100)}${finding.description.length > 100 ? '...' : ''}</div>
        </td>
        <td class="px-4 py-3 text-center border">
          <span class="inline-block px-2 py-1 text-xs font-semibold rounded ${getRiskBadgeClass(finding.risk_level)}">
            ${finding.risk_level}
          </span>
        </td>
        <td class="px-4 py-3 text-sm text-slate-700 border">${finding.root_cause}</td>
        <td class="px-4 py-3 text-sm text-slate-700 border">${finding.recommendation}</td>
        <td class="px-4 py-3 text-sm text-slate-700 border">${finding.management_response}</td>
        <td class="px-4 py-3 text-sm text-slate-700 text-center border">${formatDate(finding.target_completion_date)}</td>
      </tr>
    `)
    .join('');

  return `
    <div class="overflow-x-auto">
      <table class="min-w-full border-collapse border border-slate-300">
        <thead>
          <tr class="bg-slate-200">
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase border">#</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase border">Finding</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase border">Risk</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase border">Root Cause</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase border">Recommendation</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase border">Management Response</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase border">Target Date</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Generate statistics summary HTML
 */
export function generateStatisticsSummaryHTML(stats: ReportStatistics): string {
  return `
    <div class="grid grid-cols-4 gap-4 my-6">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <div class="text-3xl font-bold text-red-700">${stats.critical_count}</div>
        <div class="text-sm text-red-600 font-medium">Critical</div>
      </div>
      <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
        <div class="text-3xl font-bold text-orange-700">${stats.high_count}</div>
        <div class="text-sm text-orange-600 font-medium">High</div>
      </div>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
        <div class="text-3xl font-bold text-amber-700">${stats.medium_count}</div>
        <div class="text-sm text-amber-600 font-medium">Medium</div>
      </div>
      <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <div class="text-3xl font-bold text-green-700">${stats.low_count}</div>
        <div class="text-sm text-green-600 font-medium">Low</div>
      </div>
    </div>
  `;
}
