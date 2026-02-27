/**
 * ALERT ACTION HOOK
 *
 * Converts CCM alerts to audit findings with proper risk mapping
 * Connects continuous monitoring to audit workflow
 */

import { useState } from 'react';
import { supabase } from '@/shared/api/supabase';
import { useRiskConstitution } from '@/features/risk-constitution';

interface CCMAlert {
  id: string;
  rule_triggered: string;
  risk_score: number;
  severity: string;
  evidence_data: any;
  related_entity_id: string;
  status: string;
  created_at: string;
}

interface ConversionResult {
  success: boolean;
  findingId?: string;
  error?: string;
}

export function useAlertAction() {
  const [isConverting, setIsConverting] = useState(false);
  const { calculateRiskScore } = useRiskConstitution();

  const mapSeverityToRiskRating = (severity: string, riskScore: number): string => {
    if (riskScore >= 90) return '5';
    if (riskScore >= 70) return '4';
    if (riskScore >= 40) return '3';
    if (riskScore >= 20) return '2';
    return '1';
  };

  const generateFindingTitle = (alert: CCMAlert): string => {
    const ruleTitles: Record<string, string> = {
      GHOST_EMPLOYEE: 'Ghost Employee Detected',
      STRUCTURING: 'Transaction Structuring Pattern',
      BENFORD_VIOLATION: 'Benford\'s Law Violation',
      HIGH_VALUE: 'High-Value Transaction Anomaly',
      DUPLICATE_PAYMENT: 'Duplicate Payment Detected',
      ROUND_DOLLAR: 'Suspicious Round-Dollar Transaction',
    };

    const baseTitle = ruleTitles[alert.rule_triggered] || 'CCM Anomaly Detected';
    return `${baseTitle} - ${alert.related_entity_id}`;
  };

  const generateFindingDescription = (alert: CCMAlert): string => {
    const evidenceStr = JSON.stringify(alert.evidence_data, null, 2);

    return `
## Anomaly Detection Alert

**Rule Triggered:** ${alert.rule_triggered}
**Risk Score:** ${alert.risk_score}/100
**Severity:** ${alert.severity}
**Entity ID:** ${alert.related_entity_id}
**Detection Date:** ${new Date(alert.created_at).toLocaleString()}

## Evidence Summary

${getEvidenceSummary(alert)}

## Raw Evidence Data

\`\`\`json
${evidenceStr}
\`\`\`

## Recommended Actions

${getRecommendedActions(alert.rule_triggered)}

---
*This finding was auto-generated from CCM Alert ID: ${alert.id}*
    `.trim();
  };

  const getEvidenceSummary = (alert: CCMAlert): string => {
    const data = alert.evidence_data || {};

    switch (alert.rule_triggered) {
      case 'GHOST_EMPLOYEE':
        return `
- **Employee ID:** ${data.employeeId || 'N/A'}
- **Name:** ${data.fullName || 'N/A'}
- **Department:** ${data.department || 'N/A'}
- **Salary:** $${data.salary?.toLocaleString() || 'N/A'}
- **Hire Date:** ${data.hireDate || 'N/A'}
- **Access Log Count:** ${data.accessLogCount || 0} (expected > 0)
        `.trim();

      case 'STRUCTURING':
        return `
- **User ID:** ${data.userId || 'N/A'}
- **Transaction Count:** ${data.count || 'N/A'}
- **Total Amount:** $${data.totalAmount?.toLocaleString() || 'N/A'}
- **Window:** ${data.windowStart || 'N/A'} to ${data.windowEnd || 'N/A'}
- **Pattern:** Multiple transactions below threshold totaling above limit
        `.trim();

      case 'BENFORD_VIOLATION':
        return `
- **Chi-Squared Value:** ${data.chiSquared || 'N/A'}
- **Expected Threshold:** 15.507
- **Deviation:** Significant deviation from Benford's Law distribution
- **Affected Invoices:** ${data.totalInvoices || 'N/A'}
        `.trim();

      default:
        return `See raw evidence data for details.`;
    }
  };

  const getRecommendedActions = (ruleType: string): string => {
    const recommendations: Record<string, string> = {
      GHOST_EMPLOYEE: `
1. Verify employee status with HR department
2. Review recent salary payments to this employee
3. Check if employee has badge access or system logins
4. Investigate manager who approved the hire
5. Consider fraud referral if confirmed as ghost employee
      `.trim(),

      STRUCTURING: `
1. Interview the user about the transaction pattern
2. Review all transactions in the identified window
3. Check if there's a legitimate business reason for multiple small transactions
4. Compare against AML structuring thresholds
5. Consider filing Suspicious Activity Report (SAR) if intentional structuring
      `.trim(),

      BENFORD_VIOLATION: `
1. Analyze invoices with leading digit anomalies
2. Interview AP team about invoice creation process
3. Check for duplicate or manually-created invoices
4. Review vendor master file for suspicious vendors
5. Perform detailed testing on high-risk invoice population
      `.trim(),

      HIGH_VALUE: `
1. Verify transaction is authorized per delegation of authority
2. Confirm beneficiary is a legitimate vendor/employee
3. Review supporting documentation
4. Check if amount exceeds materiality threshold
5. Consider need for enhanced due diligence
      `.trim(),
    };

    return recommendations[ruleType] || `
1. Review the evidence data thoroughly
2. Investigate the root cause of the anomaly
3. Interview relevant stakeholders
4. Document findings in the audit workpaper
5. Determine if corrective action is required
    `.trim();
  };

  const convertAlertToFinding = async (
    alertId: string,
    engagementId?: string
  ): Promise<ConversionResult> => {
    setIsConverting(true);

    try {
      const { data: alert, error: alertError } = await supabase
        .from('ccm_alerts')
        .select('*')
        .eq('id', alertId)
        .single();

      if (alertError || !alert) {
        return { success: false, error: 'Alert not found' };
      }

      const title = generateFindingTitle(alert);
      const description = generateFindingDescription(alert);
      const riskRating = mapSeverityToRiskRating(alert.severity, alert.risk_score);

      const findingData = {
        title,
        description,
        risk_rating: riskRating,
        severity: alert.severity,
        workflow_state: 'DRAFT',
        engagement_id: engagementId || null,
        root_cause: `Automated anomaly detection via CCM rule: ${alert.rule_triggered}`,
        impact: `Risk Score: ${alert.risk_score}/100. Potential financial or compliance impact.`,
        recommendation: getRecommendedActions(alert.rule_triggered),
        management_response: 'Pending management review',
        metadata: {
          source: 'CCM',
          alert_id: alertId,
          rule_triggered: alert.rule_triggered,
          evidence_data: alert.evidence_data,
          auto_generated: true,
          detection_timestamp: alert.created_at,
        },
        created_at: new Date().toISOString(),
      };

      const { data: finding, error: findingError } = await supabase
        .from('audit_findings')
        .insert([findingData])
        .select()
        .single();

      if (findingError || !finding) {
        console.error('Error creating finding:', findingError);
        return { success: false, error: findingError?.message || 'Failed to create finding' };
      }

      await supabase
        .from('ccm_alerts')
        .update({ status: 'CONFIRMED', resolved_at: new Date().toISOString() })
        .eq('id', alertId);

      return { success: true, findingId: finding.id };
    } catch (error: any) {
      console.error('Conversion error:', error);
      return { success: false, error: error.message || 'Unknown error' };
    } finally {
      setIsConverting(false);
    }
  };

  const dismissAlert = async (alertId: string, reason: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('ccm_alerts')
        .update({
          status: 'DISMISSED',
          resolved_at: new Date().toISOString(),
          metadata: { dismissal_reason: reason },
        })
        .eq('id', alertId);

      return !error;
    } catch (error) {
      console.error('Error dismissing alert:', error);
      return false;
    }
  };

  const assignAlert = async (alertId: string, userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('ccm_alerts')
        .update({ assigned_to: userId, status: 'INVESTIGATING' })
        .eq('id', alertId);

      return !error;
    } catch (error) {
      console.error('Error assigning alert:', error);
      return false;
    }
  };

  return {
    convertAlertToFinding,
    dismissAlert,
    assignAlert,
    isConverting,
  };
}
