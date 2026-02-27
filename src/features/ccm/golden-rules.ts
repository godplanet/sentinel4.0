import type { CCMInvoice, CCMTransaction, CCMHRRecord } from '@/entities/ccm/types';
import type {
  BenfordAnalysis,
  BenfordDigitResult,
  StructuringCluster,
  GhostEmployee,
} from './types';

const BENFORD_EXPECTED: Record<number, number> = {
  1: 30.1, 2: 17.6, 3: 12.5, 4: 9.7, 5: 7.9,
  6: 6.7, 7: 5.8, 8: 5.1, 9: 4.6,
};

const CHI_SQUARED_CRITICAL_DF8 = 15.507;

export function sigmoid(z: number, k = 2, threshold = 1.5): number {
  return 100 / (1 + Math.exp(-k * (z - threshold)));
}

function extractLeadingDigit(amount: number): number | null {
  const abs = Math.abs(amount);
  if (abs < 1) return null;
  const str = abs.toString().replace(/^0+\.?/, '');
  const d = parseInt(str[0], 10);
  return d >= 1 && d <= 9 ? d : null;
}

export function analyzeBenford(invoices: CCMInvoice[]): BenfordAnalysis {
  const digitCounts: Record<number, number> = {};
  for (let d = 1; d <= 9; d++) digitCounts[d] = 0;

  let validCount = 0;
  for (const inv of invoices) {
    const digit = extractLeadingDigit(inv.amount);
    if (digit) {
      digitCounts[digit]++;
      validCount++;
    }
  }

  if (validCount === 0) {
    return {
      digits: Array.from({ length: 9 }, (_, i) => ({
        digit: i + 1,
        expected: BENFORD_EXPECTED[i + 1],
        actual: 0,
        count: 0,
        deviation: 0,
      })),
      totalInvoices: 0,
      chiSquared: 0,
      riskScore: 0,
      isAnomaly: false,
    };
  }

  let chiSquared = 0;
  const digits: BenfordDigitResult[] = [];

  for (let d = 1; d <= 9; d++) {
    const expectedPct = BENFORD_EXPECTED[d];
    const actualPct = (digitCounts[d] / validCount) * 100;
    const expectedCount = (expectedPct / 100) * validCount;
    const chiComponent = Math.pow(digitCounts[d] - expectedCount, 2) / expectedCount;
    chiSquared += chiComponent;

    digits.push({
      digit: d,
      expected: expectedPct,
      actual: parseFloat(actualPct.toFixed(1)),
      count: digitCounts[d],
      deviation: parseFloat((actualPct - expectedPct).toFixed(1)),
    });
  }

  const zScore = (chiSquared - CHI_SQUARED_CRITICAL_DF8) / 5;
  const riskScore = Math.min(100, Math.max(0, Math.round(sigmoid(zScore, 1.5, 0))));

  return {
    digits,
    totalInvoices: validCount,
    chiSquared: parseFloat(chiSquared.toFixed(2)),
    riskScore,
    isAnomaly: chiSquared > CHI_SQUARED_CRITICAL_DF8,
  };
}

export function detectStructuring(
  transactions: CCMTransaction[],
  limit = 50000,
  windowHours = 24,
): StructuringCluster[] {
  const byUser = new Map<string, CCMTransaction[]>();
  for (const tx of transactions) {
    const list = byUser.get(tx.user_id) || [];
    list.push(tx);
    byUser.set(tx.user_id, list);
  }

  const clusters: StructuringCluster[] = [];
  const windowMs = windowHours * 60 * 60 * 1000;

  for (const [userId, userTxs] of byUser) {
    const sorted = [...userTxs].sort(
      (a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime(),
    );

    for (let i = 0; i < sorted.length; i++) {
      const windowStart = new Date(sorted[i].transaction_date).getTime();
      const windowEnd = windowStart + windowMs;

      const windowTxs = sorted.filter((tx) => {
        const t = new Date(tx.transaction_date).getTime();
        return t >= windowStart && t <= windowEnd;
      });

      if (windowTxs.length < 2) continue;

      const total = windowTxs.reduce((s, tx) => s + tx.amount, 0);
      const allBelowLimit = windowTxs.every((tx) => tx.amount < limit);

      if (total > limit && allBelowLimit) {
        const alreadyCaptured = clusters.some(
          (c) =>
            c.userId === userId &&
            Math.abs(new Date(c.windowStart).getTime() - windowStart) < windowMs / 2,
        );
        if (alreadyCaptured) continue;

        const zScore = (total - limit) / (limit * 0.1);
        clusters.push({
          userId,
          transactions: windowTxs.map((tx) => ({
            id: tx.id,
            amount: tx.amount,
            date: tx.transaction_date,
          })),
          totalAmount: total,
          count: windowTxs.length,
          windowStart: new Date(windowStart).toISOString(),
          windowEnd: new Date(windowEnd).toISOString(),
          riskScore: Math.min(100, Math.round(sigmoid(zScore, 1.2, 1))),
        });
      }
    }
  }

  return clusters.sort((a, b) => b.riskScore - a.riskScore);
}

export function scanGhostEmployees(
  employees: CCMHRRecord[],
  accessLogs: Array<{ user_id: string }>,
): GhostEmployee[] {
  const logCountByUser = new Map<string, number>();
  for (const log of accessLogs) {
    logCountByUser.set(log.user_id, (logCountByUser.get(log.user_id) || 0) + 1);
  }

  const ghosts: GhostEmployee[] = [];

  for (const emp of employees) {
    if (emp.status !== 'ACTIVE') continue;
    const logCount = logCountByUser.get(emp.employee_id) || 0;
    if (logCount === 0) {
      ghosts.push({
        employeeId: emp.employee_id,
        fullName: emp.full_name,
        department: emp.department,
        salary: emp.salary,
        hireDate: emp.hire_date,
        accessLogCount: 0,
        riskScore: 100,
      });
    }
  }

  return ghosts.sort((a, b) => b.salary - a.salary);
}
