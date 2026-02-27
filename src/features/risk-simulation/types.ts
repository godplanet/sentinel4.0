/**
 * Risk Simulation Types - Time-Travel Risk Simulator
 *
 * Shadow Ledger Pattern: Simulate risk changes without modifying live data
 */

import type { RiskConfiguration, RiskLevel } from '@/entities/risk/engine';

export interface SimulationRun {
  id: string;
  name: string;
  constitution_snapshot: RiskConfiguration;
  created_by?: string;
  created_at: string;
  completed_at?: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  metadata: Record<string, any>;
  error_message?: string;
}

export interface SimulationResult {
  id: string;
  simulation_run_id: string;
  entity_id: string;
  entity_name: string;
  entity_path?: string;
  risk_score_old: number;
  risk_score_new: number;
  delta: number;
  delta_percentage?: number;
  risk_zone_old: RiskLevel;
  risk_zone_new: RiskLevel;
  zone_changed: boolean;
  impact_summary?: {
    components_changed?: string[];
    threshold_crossed?: string;
    severity_change?: 'upgrade' | 'downgrade' | 'none';
  };
  created_at?: string;
}

export interface SimulationImpactSummary {
  simulation_run_id: string;
  total_entities: number;
  entities_changed: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  avg_score_change: number;
  avg_percentage_change: number;
}

export interface EntityData {
  id: string;
  entity_name: string;
  path?: string;
  risk_score: number;
  score_static?: number;
  score_strategic?: number;
  score_dynamic?: number;
  metadata?: Record<string, any>;
}

export interface SimulationParams {
  name: string;
  draftConstitution: RiskConfiguration;
  metadata?: Record<string, any>;
}

export interface SimulationProgress {
  currentEntity: number;
  totalEntities: number;
  percentage: number;
  status: string;
}
