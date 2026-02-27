export interface DataSource {
  id: string;
  name: string;
  source_type: string;
  status: 'ACTIVE' | 'OFFLINE' | 'MAINTENANCE';
  last_sync_at: string;
  record_count: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CCMTransaction {
  id: string;
  source_system: string;
  transaction_date: string;
  amount: number;
  currency: string;
  user_id: string;
  beneficiary: string;
  transaction_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CCMAlert {
  id: string;
  rule_triggered: string;
  risk_score: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  evidence_data: Record<string, unknown>;
  related_entity_id: string;
  status: 'OPEN' | 'INVESTIGATING' | 'CONFIRMED' | 'DISMISSED';
  assigned_to: string;
  resolved_at: string | null;
  created_at: string;
}

export interface CCMHRRecord {
  id: string;
  employee_id: string;
  full_name: string;
  status: 'ACTIVE' | 'TERMINATED' | 'ON_LEAVE';
  department: string;
  hire_date: string;
  salary: number;
}

export interface CCMInvoice {
  id: string;
  invoice_id: string;
  vendor_name: string;
  amount: number;
  currency: string;
  created_by: string;
  invoice_date: string;
  description: string;
}

export interface CCMStats {
  totalTransactions: number;
  totalAlerts: number;
  openAlerts: number;
  criticalAlerts: number;
  activeSources: number;
  totalSources: number;
  totalEmployees: number;
  totalInvoices: number;
  processedRows: number;
}

export const RULE_LABELS: Record<string, string> = {
  GHOST_EMPLOYEE: 'Hayalet Calisan',
  STRUCTURING: 'Yapilandirma (Smurfing)',
  BENFORD_VIOLATION: 'Benford Sapma',
  DUPLICATE_PAYMENT: 'Mukerrer Odeme',
  UNUSUAL_HOURS: 'Olagan Disi Saat',
  VELOCITY_SPIKE: 'Hiz Anomalisi',
  ROUND_AMOUNT: 'Yuvarlak Tutar',
  CUSTOM: 'Ozel Kural',
};

export const SEVERITY_LABELS: Record<string, string> = {
  LOW: 'Dusuk',
  MEDIUM: 'Orta',
  HIGH: 'Yuksek',
  CRITICAL: 'Kritik',
};

export const ALERT_STATUS_LABELS: Record<string, string> = {
  OPEN: 'Acik',
  INVESTIGATING: 'Inceleniyor',
  CONFIRMED: 'Dogrulandi',
  DISMISSED: 'Reddedildi',
};
