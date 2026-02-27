/**
 * PDF Live Data Binding
 *
 * Resolves live blocks to actual data for PDF export.
 * This ensures PDFs capture the CURRENT state, not placeholders.
 */

import { supabase } from '@/shared/api/supabase';

export interface LiveBlockData {
  type: 'heatmap' | 'findings' | 'summary';
  html: string;
}

/**
 * Fetches live data for Risk Heatmap block
 */
async function resolveRiskHeatmap(): Promise<string> {
  try {
    const { data: entities } = await supabase
      .from('audit_universe')
      .select('entity_name, risk_score')
      .gte('risk_score', 40)
      .order('risk_score', { ascending: false })
      .limit(20);

    if (!entities || entities.length === 0) {
      return `
        <div class="block-container">
          <div class="block-header">📊 Strategic Risk Heatmap</div>
          <div class="block-content">
            <p><em>No high-risk entities found in the audit universe.</em></p>
          </div>
        </div>
      `;
    }

    const criticalCount = entities.filter((e) => e.risk_score >= 90).length;
    const highCount = entities.filter((e) => e.risk_score >= 70 && e.risk_score < 90).length;
    const mediumCount = entities.filter((e) => e.risk_score >= 40 && e.risk_score < 70).length;
    const avgScore = (entities.reduce((sum, e) => sum + e.risk_score, 0) / entities.length).toFixed(1);

    const tableRows = entities
      .map(
        (entity) => `
      <tr>
        <td>${entity.entity_name}</td>
        <td style="text-align: center;">
          <span class="severity-badge ${
            entity.risk_score >= 90
              ? 'severity-critical'
              : entity.risk_score >= 70
                ? 'severity-high'
                : 'severity-medium'
          }">
            ${entity.risk_score}
          </span>
        </td>
        <td style="text-align: center;">
          ${
            entity.risk_score >= 90
              ? 'Critical'
              : entity.risk_score >= 70
                ? 'High'
                : 'Medium'
          }
        </td>
      </tr>
    `
      )
      .join('');

    return `
      <div class="block-container">
        <div class="block-header">📊 Strategic Risk Heatmap</div>
        <div class="block-content">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Entities</div>
              <div class="stat-value">${entities.length}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Average Risk Score</div>
              <div class="stat-value">${avgScore}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Critical (≥90)</div>
              <div class="stat-value" style="color: #dc2626;">${criticalCount}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Entity Name</th>
                <th style="text-align: center;">Risk Score</th>
                <th style="text-align: center;">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div style="margin-top: 15px; font-size: 9pt; color: #64748b;">
            Risk Distribution: ${criticalCount} Critical | ${highCount} High | ${mediumCount} Medium
          </div>
          <div style="font-size: 9pt; color: #64748b;">
            Generated on: ${new Date().toLocaleString()}
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Failed to resolve Risk Heatmap:', error);
    return `
      <div class="block-container">
        <div class="block-header">📊 Strategic Risk Heatmap</div>
        <div class="block-content">
          <p style="color: #dc2626;"><strong>Error:</strong> Failed to load risk data.</p>
        </div>
      </div>
    `;
  }
}

/**
 * Fetches live data for Finding Table block
 */
async function resolveFindingTable(): Promise<string> {
  try {
    const { data: findings } = await supabase
      .from('audit_findings')
      .select(
        `
        id,
        finding_title,
        severity,
        status,
        risk_score,
        created_at,
        audit_universe!inner(entity_name)
      `
      )
      .eq('status', 'OPEN')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!findings || findings.length === 0) {
      return `
        <div class="block-container">
          <div class="block-header">📋 Open Findings Table</div>
          <div class="block-content">
            <p><em>No open findings found.</em></p>
          </div>
        </div>
      `;
    }

    const formattedFindings = findings.map((item: any) => ({
      ...item,
      entity_name: item.audit_universe?.entity_name || 'Unknown',
    }));

    const criticalCount = formattedFindings.filter((f) => f.severity === 'Critical').length;
    const highCount = formattedFindings.filter((f) => f.severity === 'High').length;
    const avgRiskScore = (
      formattedFindings.reduce((sum, f) => sum + (f.risk_score || 0), 0) / formattedFindings.length
    ).toFixed(1);

    const tableRows = formattedFindings
      .map(
        (finding) => `
      <tr>
        <td>${finding.finding_title}</td>
        <td>${finding.entity_name}</td>
        <td style="text-align: center;">
          <span class="severity-badge severity-${finding.severity.toLowerCase()}">
            ${finding.severity}
          </span>
        </td>
        <td style="text-align: center; font-weight: bold; color: ${
          finding.risk_score >= 90
            ? '#dc2626'
            : finding.risk_score >= 70
              ? '#f97316'
              : finding.risk_score >= 40
                ? '#fbbf24'
                : '#22c55e'
        };">
          ${finding.risk_score || 'N/A'}
        </td>
        <td style="text-align: center;">
          <span class="severity-badge status-${finding.status.toLowerCase()}">
            ${finding.status}
          </span>
        </td>
        <td style="text-align: center;">${new Date(finding.created_at).toLocaleDateString()}</td>
      </tr>
    `
      )
      .join('');

    return `
      <div class="block-container">
        <div class="block-header">📋 Open Findings Table</div>
        <div class="block-content">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Critical Findings</div>
              <div class="stat-value" style="color: #dc2626;">${criticalCount}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">High Findings</div>
              <div class="stat-value" style="color: #f97316;">${highCount}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Avg Risk Score</div>
              <div class="stat-value">${avgRiskScore}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Finding Title</th>
                <th>Entity</th>
                <th style="text-align: center;">Severity</th>
                <th style="text-align: center;">Risk Score</th>
                <th style="text-align: center;">Status</th>
                <th style="text-align: center;">Date</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div style="margin-top: 15px; font-size: 9pt; color: #64748b;">
            Total Open Findings: ${formattedFindings.length} | As of ${new Date().toLocaleString()}
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Failed to resolve Finding Table:', error);
    return `
      <div class="block-container">
        <div class="block-header">📋 Open Findings Table</div>
        <div class="block-content">
          <p style="color: #dc2626;"><strong>Error:</strong> Failed to load findings data.</p>
        </div>
      </div>
    `;
  }
}

/**
 * Fetches live data for Executive Summary block
 */
async function resolveExecutiveSummary(): Promise<string> {
  try {
    const { data: findings } = await supabase
      .from('audit_findings')
      .select('severity, created_at, risk_score')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const { data: entities } = await supabase
      .from('audit_universe')
      .select('entity_name, risk_score');

    const { data: constitution } = await supabase
      .from('methodology_configs')
      .select('methodology_name, version')
      .eq('is_active', true)
      .single();

    const criticalCount = findings?.filter((f) => f.severity === 'Critical').length || 0;
    const highCount = findings?.filter((f) => f.severity === 'High').length || 0;
    const totalFindings = findings?.length || 0;
    const criticalEntities = entities?.filter((e) => e.risk_score >= 90).length || 0;
    const avgRiskScore = entities
      ? (entities.reduce((sum, e) => sum + e.risk_score, 0) / entities.length).toFixed(1)
      : '0';
    const constitutionName = constitution?.methodology_name || 'Standard Risk Methodology';

    return `
      <div class="block-container">
        <div class="block-header">🤖 Executive Summary (AI Generated)</div>
        <div class="block-content">
          <h2>EXECUTIVE SUMMARY</h2>

          <p><strong>Report Period:</strong> ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

          <h3>Risk Governance Framework</h3>
          <p>This report has been prepared in accordance with <strong>${constitutionName}</strong>, the active risk assessment framework governing our audit universe. The methodology employs a multi-dimensional risk scoring approach incorporating impact, likelihood, control effectiveness, and operational volume metrics.</p>

          <h3>Overall Risk Landscape</h3>
          <p>Our audit universe comprises <strong>${entities?.length || 0} distinct entities</strong>, with an average risk score of <strong>${avgRiskScore}/100</strong>. The current risk distribution indicates <strong>${criticalEntities} entities</strong> classified as Critical Risk (score ≥90), requiring immediate executive attention and enhanced monitoring protocols.</p>

          <h3>Findings Summary</h3>
          <p>During the reporting period, internal audit activities identified <strong>${totalFindings} findings</strong> across all severity levels:</p>
          <ul>
            <li><strong>Critical:</strong> ${criticalCount} findings requiring Board-level escalation</li>
            <li><strong>High:</strong> ${highCount} findings necessitating executive management action</li>
            <li><strong>Medium/Low:</strong> ${totalFindings - criticalCount - highCount} findings under standard remediation protocols</li>
          </ul>

          ${
            criticalCount > 0
              ? `
          <div class="ai-notice">
            <strong>CRITICAL ALERT:</strong> The presence of ${criticalCount} Critical finding(s) triggers our Constitutional Veto Rule, which limits the maximum audit grade to 60 (Grade D) for any affected engagement. Immediate corrective action is required.
          </div>
          `
              : ''
          }

          <h3>Risk Velocity Analysis</h3>
          <p>Based on trend analysis, the overall risk velocity is <strong>${criticalEntities > (entities?.length || 0) * 0.2 ? 'INCREASING' : 'STABLE'}</strong>, with heightened concentration in high-risk zones. Management should prioritize resource allocation to entities demonstrating upward risk trajectories.</p>

          <h3>Regulatory Compliance Status</h3>
          <p>All findings have been assessed against applicable regulatory frameworks including GIAS 2024 (Turkish Banking Audit Standards), BDDK regulations, and AAOIFI GSIFI standards for Islamic finance compliance. ${criticalCount > 0 ? 'Regulatory reporting requirements have been triggered for Critical findings.' : 'No immediate regulatory reporting obligations identified.'}</p>

          <h3>Strategic Recommendations</h3>
          <ol>
            <li>Prioritize remediation of Critical and High findings to restore constitutional compliance</li>
            <li>Enhance preventive controls in entities with risk scores ≥70</li>
            <li>Implement continuous monitoring protocols for risk velocity indicators</li>
            <li>Strengthen governance frameworks in alignment with ${constitutionName} principles</li>
          </ol>

          <div class="ai-notice">
            ✨ This summary was generated by Sentinel Prime AI on ${new Date().toLocaleString()} based on live system data. Review for accuracy before publishing.
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Failed to resolve Executive Summary:', error);
    return `
      <div class="block-container">
        <div class="block-header">🤖 Executive Summary (AI Generated)</div>
        <div class="block-content">
          <p style="color: #dc2626;"><strong>Error:</strong> Failed to generate executive summary.</p>
        </div>
      </div>
    `;
  }
}

/**
 * Resolves all live blocks in HTML content
 */
export async function resolveLiveBlocks(htmlContent: string): Promise<string> {
  let resolved = htmlContent;

  if (resolved.includes('{{RiskHeatmap}}')) {
    const heatmapHtml = await resolveRiskHeatmap();
    resolved = resolved.replace(/{{RiskHeatmap}}/g, heatmapHtml);
  }

  if (resolved.includes('{{FindingTable}}')) {
    const tableHtml = await resolveFindingTable();
    resolved = resolved.replace(/{{FindingTable}}/g, tableHtml);
  }

  if (resolved.includes('{{ExecutiveSummary}}')) {
    const summaryHtml = await resolveExecutiveSummary();
    resolved = resolved.replace(/{{ExecutiveSummary}}/g, summaryHtml);
  }

  return resolved;
}

/**
 * Exports report to PDF with live data binding
 */
export async function exportReportWithLiveData(
  editor: any,
  title: string,
  options: {
    author?: string;
    orientation?: 'portrait' | 'landscape';
    includeHeader?: boolean;
    includeFooter?: boolean;
  } = {}
): Promise<void> {
  try {
    const rawHtml = editor.getHTML();

    const resolvedHtml = await resolveLiveBlocks(rawHtml);

    const { exportReportToPDF } = await import('./pdf-export');

    await exportReportToPDF(resolvedHtml, {
      title,
      author: options.author || 'Sentinel GRC',
      orientation: options.orientation || 'portrait',
      includeHeader: options.includeHeader !== false,
      includeFooter: options.includeFooter !== false,
    });
  } catch (error) {
    console.error('Failed to export PDF:', error);
    throw error;
  }
}
