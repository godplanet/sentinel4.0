export type QueryType = 'SQL' | 'API' | 'WEBHOOK';
export type ProbeStatus = 'PASS' | 'FAIL' | 'ERROR' | 'RUNNING';
export type ProbeCategory = 'FRAUD' | 'OPS' | 'COMPLIANCE';
export type ProbeSeverity = 'HIGH' | 'MEDIUM' | 'LOW';
export type ExceptionStatus = 'OPEN' | 'REMEDIED' | 'FALSE_POSITIVE' | 'ESCALATED';

export interface Probe {
  id: string;
  title: string;
  description?: string;
  query_type: QueryType;
  query_payload: string;
  schedule_cron?: string;
  risk_threshold: number;
  target_control_id?: string;
  is_active: boolean;
  last_run_at?: string;
  last_result_status?: ProbeStatus;
  category: ProbeCategory;
  severity: ProbeSeverity;
  created_by?: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProbeLog {
  id: string;
  probe_id: string;
  execution_time: string;
  result_data?: any;
  is_anomaly: boolean;
  anomaly_count: number;
  execution_duration_ms?: number;
  error_message?: string;
  tenant_id: string;
  created_at: string;
}

export interface ProbeRun {
  id: string;
  probe_id: string;
  items_found: number;
  execution_time_ms: number;
  status: 'PASS' | 'FAIL' | 'ERROR';
  run_metadata: Record<string, any>;
  started_at: string;
  completed_at: string;
  tenant_id: string;
  created_at: string;
}

export interface ProbeException {
  id: string;
  run_id: string;
  probe_id: string;
  data_payload: Record<string, any>;
  status: ExceptionStatus;
  assigned_to?: string;
  notes: string;
  resolved_at?: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  probe_title?: string;
  probe_category?: ProbeCategory;
}

export interface ProbeStats {
  total_runs: number;
  anomaly_runs: number;
  anomaly_rate: number;
  avg_execution_ms: number;
  last_anomaly_at?: string;
}

export interface ProbeWithStats extends Probe {
  stats?: ProbeStats;
  recent_logs?: ProbeLog[];
  recent_runs?: ProbeRun[];
}

export interface SeismographPoint {
  time: string;
  label: string;
  exceptions: number;
  passes: number;
}
