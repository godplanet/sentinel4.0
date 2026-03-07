/**
 * Wave 85: Employee Stress & Fraud Correlation Engine — API
 * Tablolar: employee_financial_stress, fraud_triangle_scores, hr_correlation_alerts
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

const TENANT_ID = '11111111-1111-1111-1111-111111111111';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface FinancialStress {
  id: string;
  anon_employee_id: string;
  department: string;
  job_title: string;
  salary_garnishment: boolean;
  credit_score_drop: boolean;
  lifestyle_mismatch: boolean;
  financial_stress_score: number;
}

export interface FraudTriangle {
  id: string;
  anon_employee_id: string;
  pressure_score: number;
  opportunity_score: number;
  rationalization_score: number;
  total_fraud_risk: number;
}

export interface HRCorrelationAlert {
  id: string;
  anon_employee_id: string;
  alert_severity: AlertSeverity;
  fraud_vector: string;
  description: string;
  status: string;
  created_at: string;
}

export interface FraudRadarData {
  stressLogs: FinancialStress[];
  triangleScores: FraudTriangle[];
  alerts: HRCorrelationAlert[];
  averageFraudRisk: number;
  totalCriticalAlerts: number;
}

export function useFraudCorrelationRadar() {
  return useQuery<FraudRadarData>({
    queryKey: ['hr-fraud-radar-data'],
    staleTime: 60_000,
    queryFn: async () => {
      // 1. Stress Logs
      const { data: rawStress, error: e1 } = await supabase
        .from('employee_financial_stress')
        .select('*')
        .eq('tenant_id', TENANT_ID);
      if (e1) {
        console.error('[FraudRadar API] error fetching stress logs:', e1);
        throw e1;
      }

      // 2. Triangle Scores
      const { data: rawScores, error: e2 } = await supabase
        .from('fraud_triangle_scores')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .order('total_fraud_risk', { ascending: false });
      if (e2) {
        console.error('[FraudRadar API] error fetching triangle scores:', e2);
        throw e2;
      }

      // 3. Correlation Alerts
      const { data: rawAlerts, error: e3 } = await supabase
        .from('hr_correlation_alerts')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .order('created_at', { ascending: false });
      if (e3) {
        console.error('[FraudRadar API] error fetching alerts:', e3);
        throw e3;
      }

      const stressLogs = (rawStress ?? []) as FinancialStress[];
      const triangleScores = (rawScores ?? []) as FraudTriangle[];
      const alerts = (rawAlerts ?? []) as HRCorrelationAlert[];

      let sumRisk = 0;
      triangleScores.forEach(s => {
        sumRisk += (s.total_fraud_risk || 0);
      });

      // Bölme Hatası Koruması
      const averageFraudRisk = triangleScores.length > 0 
        ? (sumRisk / (triangleScores.length || 1)) 
        : 0;

      const totalCriticalAlerts = alerts.filter(a => a.alert_severity === 'CRITICAL' && a.status === 'OPEN').length;

      return {
        stressLogs,
        triangleScores,
        alerts,
        averageFraudRisk,
        totalCriticalAlerts
      };
    }
  });
}
