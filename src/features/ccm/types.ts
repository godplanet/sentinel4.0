export interface BenfordDigitResult {
  digit: number;
  expected: number;
  actual: number;
  count: number;
  deviation: number;
}

export interface BenfordAnalysis {
  digits: BenfordDigitResult[];
  totalInvoices: number;
  chiSquared: number;
  riskScore: number;
  isAnomaly: boolean;
}

export interface StructuringCluster {
  userId: string;
  transactions: Array<{ id: string; amount: number; date: string }>;
  totalAmount: number;
  count: number;
  windowStart: string;
  windowEnd: string;
  riskScore: number;
}

export interface GhostEmployee {
  employeeId: string;
  fullName: string;
  department: string;
  salary: number;
  hireDate: string;
  accessLogCount: number;
  riskScore: number;
}

export interface AnomalyScanResult {
  benford: BenfordAnalysis;
  structuring: StructuringCluster[];
  ghosts: GhostEmployee[];
  alertsGenerated: number;
  scanTimestamp: string;
}
