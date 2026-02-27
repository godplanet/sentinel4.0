/**
 * CCM PREDATOR COCKPIT
 *
 * Advanced Continuous Control Monitoring dashboard
 * Features:
 * - Live transaction scanner with Matrix-style terminal
 * - Alert-to-Finding conversion (one-click)
 * - Constitution-linked risk thresholds
 * - Real-time anomaly detection
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Settings,
  ExternalLink,
  Clock,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { PageHeader } from '@/shared/ui';
import { LiveScanner } from '@/features/ccm/components/LiveScanner';
import { useAlertAction, useConstitutionRules } from '@/features/ccm/hooks';
import { supabase } from '@/shared/api/supabase';
import { motion } from 'framer-motion';

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

export default function PredatorCockpit() {
  const [alerts, setAlerts] = useState<CCMAlert[]>([]);
  const [scanResults, setScanResults] = useState<{ total: number; anomalies: number } | null>(
    null
  );
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

  const { convertAlertToFinding, isConverting } = useAlertAction();
  const { getConstitutionSummary, getRiskThresholds } = useConstitutionRules();
  const navigate = useNavigate();

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    const { data } = await supabase
      .from('ccm_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setAlerts(data);
    }
  };

  const handleConvertToFinding = async (alertId: string) => {
    setSelectedAlert(alertId);

    const result = await convertAlertToFinding(alertId);

    if (result.success && result.findingId) {
      navigate(`/execution/findings?id=${result.findingId}`);
    } else {
      alert(`Failed to create finding: ${result.error || 'Unknown error'}`);
    }

    setSelectedAlert(null);
    loadAlerts();
  };

  const constitutionSummary = getConstitutionSummary();
  const thresholds = getRiskThresholds();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'LOW':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'INVESTIGATING':
        return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'DISMISSED':
        return <CheckCircle className="w-4 h-4 text-slate-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatRuleName = (rule: string) => {
    return rule
      .split('_')
      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(' ');
  };

  const stats = {
    totalAlerts: alerts.length,
    openAlerts: alerts.filter((a) => a.status === 'OPEN').length,
    criticalAlerts: alerts.filter((a) => a.severity === 'CRITICAL').length,
    avgRiskScore: Math.round(
      alerts.reduce((sum, a) => sum + a.risk_score, 0) / (alerts.length || 1)
    ),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Predator Cockpit"
        description="Continuous Control Monitoring with AI-Powered Anomaly Detection"
        breadcrumbs={[{ label: 'CCM' }, { label: 'Predator Cockpit' }]}
      />

      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <span className="text-xs text-slate-500">TOTAL</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{stats.totalAlerts}</div>
            <div className="text-xs text-slate-600">Total Alerts</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-amber-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
              <span className="text-xs text-amber-600 font-semibold">OPEN</span>
            </div>
            <div className="text-3xl font-bold text-amber-700">{stats.openAlerts}</div>
            <div className="text-xs text-amber-600">Open Alerts</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <span className="text-xs text-red-600 font-semibold">CRITICAL</span>
            </div>
            <div className="text-3xl font-bold text-red-700">{stats.criticalAlerts}</div>
            <div className="text-xs text-red-600">Critical Issues</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-slate-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-xs text-slate-500">AVG</span>
            </div>
            <div className="text-3xl font-bold text-purple-700">{stats.avgRiskScore}</div>
            <div className="text-xs text-slate-600">Avg Risk Score</div>
          </motion.div>
        </div>

        <LiveScanner
          onAnomalyDetected={(log) => {
            console.log('Anomaly detected:', log);
          }}
          onScanComplete={(results) => {
            setScanResults(results);
            loadAlerts();
          }}
        />

        {scanResults && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Scan Complete</h3>
                <p className="text-sm text-slate-600">
                  Scanned {scanResults.total} transactions. Detected {scanResults.anomalies}{' '}
                  anomalies.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Active Alerts</h2>
              <p className="text-sm text-slate-600">
                Constitutional thresholds: Structuring Limit = {constitutionSummary.structuringLimit}
                , High Value = {constitutionSummary.highValueThreshold}
              </p>
            </div>
            <button
              onClick={loadAlerts}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Rule
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Entity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Severity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Risk Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {alerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No alerts found. Run a scan to detect anomalies.
                    </td>
                  </tr>
                ) : (
                  alerts.map((alert) => (
                    <tr key={alert.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(alert.status)}
                          <span className="text-sm text-slate-700">{alert.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-slate-900">
                          {formatRuleName(alert.rule_triggered)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-700 font-mono">
                          {alert.related_entity_id}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold rounded border ${getSeverityColor(
                            alert.severity
                          )}`}
                        >
                          {alert.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-2 w-20">
                            <div
                              className={`h-2 rounded-full ${
                                alert.risk_score >= 70
                                  ? 'bg-red-500'
                                  : alert.risk_score >= 40
                                  ? 'bg-amber-500'
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${alert.risk_score}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-slate-900">
                            {alert.risk_score}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Clock className="w-3 h-3" />
                          {new Date(alert.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {alert.status === 'OPEN' && (
                            <button
                              onClick={() => handleConvertToFinding(alert.id)}
                              disabled={isConverting && selectedAlert === alert.id}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FileText className="w-3 h-3" />
                              {isConverting && selectedAlert === alert.id
                                ? 'Creating...'
                                : 'Create Finding'}
                            </button>
                          )}
                          {alert.status === 'CONFIRMED' && (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              Converted to Finding
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-2">Risk Constitution Active</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-600">Structuring Limit:</span>
                  <span className="ml-2 font-semibold text-slate-900">
                    {constitutionSummary.structuringLimit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">High Value Threshold:</span>
                  <span className="ml-2 font-semibold text-slate-900">
                    {constitutionSummary.highValueThreshold}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Benford Chi-Squared:</span>
                  <span className="ml-2 font-semibold text-slate-900">
                    {thresholds.benford.chiSquaredCritical}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Configuration Source:</span>
                  <span className="ml-2 font-semibold text-slate-900">
                    {constitutionSummary.source}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate('/settings/risk-constitution')}
                className="mt-3 flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Edit Risk Constitution
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
