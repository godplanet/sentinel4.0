import { supabase } from '@/shared/api/supabase';
import { fetchInvoices, fetchRecentTransactions } from '@/entities/ccm/api';
import type { CCMHRRecord } from '@/entities/ccm/types';
import { analyzeBenford, detectStructuring, scanGhostEmployees } from './golden-rules';
import type { AnomalyScanResult } from './types';

async function fetchActiveEmployees(): Promise<CCMHRRecord[]> {
  const { data, error } = await supabase
    .from('ccm_hr_master')
    .select('*')
    .eq('status', 'ACTIVE');
  if (error) throw error;
  return data || [];
}

async function fetchRecentAccessLogs(days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await supabase
    .from('ccm_access_logs')
    .select('user_id')
    .gte('event_timestamp', since.toISOString());
  if (error) throw error;
  return data || [];
}

function deriveSeverity(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= 90) return 'CRITICAL';
  if (score >= 75) return 'HIGH';
  if (score >= 50) return 'MEDIUM';
  return 'LOW';
}

export async function runAnomalyScan(): Promise<AnomalyScanResult> {
  const [invoices, transactions, employees, accessLogs] = await Promise.all([
    fetchInvoices(500),
    fetchRecentTransactions(500),
    fetchActiveEmployees(),
    fetchRecentAccessLogs(30),
  ]);

  const benford = analyzeBenford(invoices);
  const structuring = detectStructuring(transactions);
  const ghosts = scanGhostEmployees(employees, accessLogs);

  return {
    benford,
    structuring,
    ghosts,
    alertsGenerated: 0,
    scanTimestamp: new Date().toISOString(),
  };
}

export async function persistScanAlerts(result: AnomalyScanResult): Promise<number> {
  const { data: existingAlerts } = await supabase
    .from('ccm_alerts')
    .select('id, rule_triggered, related_entity_id')
    .eq('status', 'OPEN');

  const existingSet = new Set(
    (existingAlerts || []).map(
      (a) => `${a.rule_triggered}::${a.related_entity_id || ''}`,
    ),
  );

  let count = 0;

  if (result.benford.isAnomaly) {
    const key = 'BENFORD_VIOLATION::';
    if (!existingSet.has(key)) {
      const top = result.benford.digits
        .filter((d) => Math.abs(d.deviation) > 5)
        .sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));

      await supabase.from('ccm_alerts').insert({
        rule_triggered: 'BENFORD_VIOLATION',
        risk_score: result.benford.riskScore,
        severity: deriveSeverity(result.benford.riskScore),
        title: `Benford Yasasi Ihlali - ${result.benford.totalInvoices} Fatura`,
        description: `Chi-kare: ${result.benford.chiSquared}. En buyuk sapma: Rakam ${top[0]?.digit} (${(top[0]?.deviation ?? 0) > 0 ? '+' : ''}${top[0]?.deviation}%)`,
        evidence_data: {
          digits: result.benford.digits,
          chiSquared: result.benford.chiSquared,
          totalInvoices: result.benford.totalInvoices,
        },
        status: 'OPEN',
      });
      count++;
    }
  }

  for (const cluster of result.structuring) {
    const key = `STRUCTURING::${cluster.userId}`;
    if (!existingSet.has(key)) {
      await supabase.from('ccm_alerts').insert({
        rule_triggered: 'STRUCTURING',
        risk_score: cluster.riskScore,
        severity: deriveSeverity(cluster.riskScore),
        title: `Yapilandirma Tespiti - ${cluster.userId}`,
        description: `${cluster.count} islem, toplam ${cluster.totalAmount.toLocaleString('tr-TR')} TL - her biri esik altinda`,
        evidence_data: {
          userId: cluster.userId,
          transactions: cluster.transactions,
          totalAmount: cluster.totalAmount,
        },
        related_entity_id: cluster.userId,
        status: 'OPEN',
      });
      count++;
    }
  }

  for (const ghost of result.ghosts) {
    const key = `GHOST_EMPLOYEE::${ghost.employeeId}`;
    if (!existingSet.has(key)) {
      await supabase.from('ccm_alerts').insert({
        rule_triggered: 'GHOST_EMPLOYEE',
        risk_score: ghost.riskScore,
        severity: 'CRITICAL',
        title: `Hayalet Calisan - ${ghost.fullName}`,
        description: `Aktif bordro: ${ghost.salary.toLocaleString('tr-TR')} TL/ay. Son 30 gunde sifir erisim kaydi.`,
        evidence_data: {
          employeeId: ghost.employeeId,
          salary: ghost.salary,
          department: ghost.department,
        },
        related_entity_id: ghost.employeeId,
        status: 'OPEN',
      });
      count++;
    }
  }

  return count;
}
