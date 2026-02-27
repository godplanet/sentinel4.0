import { supabase } from '@/shared/api/supabase';
import type { DataSource, CCMTransaction, CCMAlert, CCMStats, CCMInvoice } from './types';

export async function fetchDataSources(): Promise<DataSource[]> {
  const { data, error } = await supabase
    .from('data_sources')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function fetchRecentTransactions(limit = 50): Promise<CCMTransaction[]> {
  const { data, error } = await supabase
    .from('ccm_transactions')
    .select('*')
    .order('transaction_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function fetchAlerts(): Promise<CCMAlert[]> {
  const { data, error } = await supabase
    .from('ccm_alerts')
    .select('*')
    .order('risk_score', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchInvoices(limit = 100): Promise<CCMInvoice[]> {
  const { data, error } = await supabase
    .from('ccm_invoices')
    .select('*')
    .order('invoice_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function fetchCCMStats(): Promise<CCMStats> {
  const [txRes, alertRes, srcRes, hrRes, invRes] = await Promise.all([
    supabase.from('ccm_transactions').select('id', { count: 'exact', head: true }),
    supabase.from('ccm_alerts').select('id, status, severity'),
    supabase.from('data_sources').select('id, status, record_count'),
    supabase.from('ccm_hr_master').select('id', { count: 'exact', head: true }),
    supabase.from('ccm_invoices').select('id', { count: 'exact', head: true }),
  ]);

  const alerts = alertRes.data || [];
  const sources = srcRes.data || [];
  const totalProcessed = sources.reduce((s, src) => s + (src.record_count || 0), 0);

  return {
    totalTransactions: txRes.count || 0,
    totalAlerts: alerts.length,
    openAlerts: alerts.filter((a) => a.status === 'OPEN').length,
    criticalAlerts: alerts.filter((a) => a.severity === 'CRITICAL').length,
    activeSources: sources.filter((s) => s.status === 'ACTIVE').length,
    totalSources: sources.length,
    totalEmployees: hrRes.count || 0,
    totalInvoices: invRes.count || 0,
    processedRows: totalProcessed,
  };
}

export async function updateAlertStatus(
  alertId: string,
  status: CCMAlert['status']
): Promise<void> {
  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (status === 'CONFIRMED' || status === 'DISMISSED') {
    updates.resolved_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('ccm_alerts')
    .update(updates)
    .eq('id', alertId);

  if (error) throw error;
}
