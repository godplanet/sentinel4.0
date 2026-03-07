/**
 * Wave 80: Insider Trading & Executive PAD Radar — API
 * Tablolar: personal_account_dealings, restricted_trading_lists, insider_alerts
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

const TENANT_ID = '11111111-1111-1111-1111-111111111111';

export type PADStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TransType = 'BUY' | 'SELL';

export interface PADLog {
  id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  ticker: string;
  company_name: string;
  transaction_type: TransType;
  quantity: number;
  price: number;
  total_value: number;
  trade_date: string;
  status: PADStatus;
}

export interface RestrictedAsset {
  id: string;
  ticker: string;
  company_name: string;
  restriction_reason: string;
  added_by: string;
  is_active: boolean;
}

export interface InsiderAlert {
  id: string;
  pad_id: string;
  employee_name: string;
  ticker: string;
  alert_type: string;
  severity: AlertSeverity;
  description: string;
  status: string;
  created_at: string;
}

export interface PADMonitorData {
  dealings: PADLog[];
  restrictedList: RestrictedAsset[];
  alerts: InsiderAlert[];
  totalFlaggedTransactions: number;
  criticalAlertsCount: number;
}

export function usePADMonitorDashboard() {
  return useQuery<PADMonitorData>({
    queryKey: ['pad-monitor-data'],
    staleTime: 60_000,
    queryFn: async () => {
      // 1. PAD Logs
      const { data: rawPAD, error: e1 } = await supabase
        .from('personal_account_dealings')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .order('trade_date', { ascending: false });
      if (e1) {
        console.error('[PAD API] error fetching dealings:', e1);
        throw e1;
      }

      // 2. Restricted Lists
      const { data: rawRestricted, error: e2 } = await supabase
        .from('restricted_trading_lists')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .eq('is_active', true)
        .order('ticker', { ascending: true });
      if (e2) {
        console.error('[PAD API] error fetching restricted lists:', e2);
        throw e2;
      }

      // 3. Insider Alerts
      const { data: rawAlerts, error: e3 } = await supabase
        .from('insider_alerts')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .order('created_at', { ascending: false });
      if (e3) {
        console.error('[PAD API] error fetching alerts:', e3);
        throw e3;
      }

      const dealings = (rawPAD ?? []) as PADLog[];
      const restrictedList = (rawRestricted ?? []) as RestrictedAsset[];
      const alerts = (rawAlerts ?? []) as InsiderAlert[];

      const totalFlaggedTransactions = dealings.filter(d => d.status === 'FLAGGED').length;
      const criticalAlertsCount = alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'OPEN').length;

      return {
        dealings,
        restrictedList,
        alerts,
        totalFlaggedTransactions,
        criticalAlertsCount
      };
    }
  });
}
