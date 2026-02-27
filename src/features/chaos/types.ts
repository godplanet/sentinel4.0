export type ChaosScenario =
  | 'SMURFING_TEST'
  | 'ROUND_TRIP_TEST'
  | 'GHOST_PAYROLL_TEST'
  | 'BENFORD_MANIPULATION';

export type ChaosTestStatus =
  | 'IDLE'
  | 'INJECTING'
  | 'WAITING_DETECTION'
  | 'VERIFYING'
  | 'COMPLETED';

export type ControlReaction = 'BLOCKED' | 'DETECTED' | 'MISSED';

export interface ShadowTransaction {
  id: string;
  amount: number;
  currency: string;
  scenario: ChaosScenario;
  is_synthetic: boolean;
  blocked_by_core: boolean;
  source_account: string;
  target_account: string;
  injected_by: string;
  batch_id: string;
  created_at: string;
}

export interface ChaosTestResult {
  batchId: string;
  scenario: ChaosScenario;
  transactionsInjected: number;
  totalAmount: number;
  controlReaction: ControlReaction;
  detectionTimeMs: number;
  alertTriggered: boolean;
  alertId?: string;
  timestamp: string;
}

export interface ChaosStep {
  label: string;
  status: 'pending' | 'running' | 'done' | 'error';
  detail?: string;
}

export const SCENARIO_LABELS: Record<ChaosScenario, string> = {
  SMURFING_TEST: 'Yapilandirma / Smurfing Testi',
  ROUND_TRIP_TEST: 'Dairesel Islem Testi',
  GHOST_PAYROLL_TEST: 'Hayalet Bordro Testi',
  BENFORD_MANIPULATION: 'Benford Manipulasyon Testi',
};

export const SCENARIO_DESCRIPTIONS: Record<ChaosScenario, string> = {
  SMURFING_TEST: 'Birden fazla kucuk islem enjekte ederek yapilandirma (structuring) tespitini test eder.',
  ROUND_TRIP_TEST: 'A->B->C->A seklinde dairesel fon akisi olusturarak tespit kontrollerini test eder.',
  GHOST_PAYROLL_TEST: 'Sahte calisan kaydi olusturarak hayalet calisan tespitini test eder.',
  BENFORD_MANIPULATION: 'Belirli rakam oruntuleri ile fatura enjekte ederek Benford analizini test eder.',
};

export type IaCStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'EXECUTED' | 'FAILED' | 'ROLLED_BACK';

export interface IaCRemediation {
  id: string;
  finding_id: string | null;
  title: string;
  resource_type: string;
  proposed_fix_script: string;
  language: string;
  status: IaCStatus;
  approved_by: string | null;
  executed_at: string | null;
  execution_log: Array<{ step: string; status: string; timestamp: string }>;
  created_at: string;
}
