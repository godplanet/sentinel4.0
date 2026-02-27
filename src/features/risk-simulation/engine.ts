/**
 * Risk Simulation Engine - Shadow Ledger Pattern
 *
 * Performs "soft recalculation" of risk scores using draft constitutions
 * without modifying live data. Results stored in shadow ledger tables.
 */

import { supabase } from '@/shared/api/supabase';
import type { RiskConfiguration, EntityRiskScores, RiskLevel } from '@/entities/risk/engine';
import type {
  SimulationRun,
  SimulationResult,
  EntityData,
  SimulationParams,
  SimulationProgress,
} from './types';

/**
 * Simulation Engine Class
 * Orchestrates shadow ledger operations
 */
export class RiskSimulationEngine {
  private progressCallback?: (progress: SimulationProgress) => void;

  constructor(progressCallback?: (progress: SimulationProgress) => void) {
    this.progressCallback = progressCallback;
  }

  /**
   * Main simulation entry point
   * Creates shadow ledger and runs soft recalculation
   */
  async runSimulation(params: SimulationParams): Promise<SimulationRun> {
    const { name, draftConstitution, metadata = {} } = params;

    try {
      // Step 1: Create simulation run record
      const { data: run, error: runError } = await supabase
        .from('risk_simulation_runs')
        .insert({
          name,
          constitution_snapshot: draftConstitution as any,
          status: 'RUNNING',
          metadata,
          created_by: null, // Will use RLS context
        })
        .select()
        .single();

      if (runError) throw runError;
      if (!run) throw new Error('Failed to create simulation run');

      this.reportProgress(0, 0, 'Fetching entities...');

      // Step 2: Fetch all entities from audit universe
      const entities = await this.fetchAllEntities();

      if (entities.length === 0) {
        await this.failSimulation(run.id, 'No entities found in audit universe');
        throw new Error('No entities found');
      }

      this.reportProgress(0, entities.length, 'Starting simulation...');

      // Step 3: Process each entity (soft recalculation)
      const results: Omit<SimulationResult, 'id' | 'created_at'>[] = [];

      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];

        this.reportProgress(i + 1, entities.length, `Processing ${entity.entity_name}...`);

        const result = await this.simulateEntityRisk(entity, draftConstitution);
        results.push({
          simulation_run_id: run.id,
          ...result,
        });
      }

      // Step 4: Batch insert results into shadow ledger
      const { error: resultsError } = await supabase
        .from('risk_simulation_results')
        .insert(results as any);

      if (resultsError) {
        await this.failSimulation(run.id, resultsError.message);
        throw resultsError;
      }

      // Step 5: Mark simulation as complete
      const { data: completedRun, error: completeError } = await supabase
        .from('risk_simulation_runs')
        .update({
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
        })
        .eq('id', run.id)
        .select()
        .single();

      if (completeError) throw completeError;

      this.reportProgress(entities.length, entities.length, 'Simulation complete!');

      return completedRun as SimulationRun;
    } catch (error) {
      console.error('Simulation failed:', error);
      throw error;
    }
  }

  /**
   * Fetches all entities from audit universe
   */
  private async fetchAllEntities(): Promise<EntityData[]> {
    const { data, error } = await supabase
      .from('audit_entities')
      .select('id, name, path, risk_score, metadata');

    if (error) throw error;

    return (data || []).map((entity: any) => ({
      id: entity.id,
      entity_name: entity.name,
      path: entity.path,
      risk_score: entity.risk_score || 0,
      score_static: entity.metadata?.score_static || entity.risk_score || 0,
      score_strategic: entity.metadata?.score_strategic || 0,
      score_dynamic: entity.metadata?.score_dynamic || 0,
      metadata: entity.metadata || {},
    }));
  }

  /**
   * Simulates risk score for a single entity using draft constitution
   * This is the "soft recalculation" - uses draft rules, doesn't modify live data
   */
  private async simulateEntityRisk(
    entity: EntityData,
    draftConstitution: RiskConfiguration
  ): Promise<Omit<SimulationResult, 'simulation_id' | 'id' | 'created_at'>> {
    const originalScore = entity.risk_score || 0;

    // Reconstruct entity scores
    const scores: EntityRiskScores = {
      score_static: entity.score_static || 0,
      score_strategic: entity.score_strategic || 0,
      score_dynamic: entity.score_dynamic || 0,
      risk_score: originalScore,
    };

    // Calculate simulated score using DRAFT constitution
    const simulatedScore = this.calculateRiskWithDraftConstitution(scores, draftConstitution);

    // Determine risk zones
    const originalZone = this.getRiskZone(originalScore, this.getDefaultThresholds());
    const simulatedZone = this.getRiskZone(simulatedScore, draftConstitution);

    // Calculate delta
    const delta = simulatedScore - originalScore;
    const deltaPercentage = originalScore > 0 ? (delta / originalScore) * 100 : 0;

    // Detect changes
    const zoneChanged = originalZone !== simulatedZone;

    return {
      entity_id: entity.id,
      entity_name: entity.entity_name,
      entity_path: entity.path,
      risk_score_old: Number(originalScore.toFixed(2)),
      risk_score_new: Number(simulatedScore.toFixed(2)),
      delta: Number(delta.toFixed(2)),
      delta_percentage: Number(deltaPercentage.toFixed(2)),
      risk_zone_old: originalZone,
      risk_zone_new: simulatedZone,
      zone_changed: zoneChanged,
      impact_summary: {
        severity_change: this.getSeverityChange(originalZone, simulatedZone),
        threshold_crossed: zoneChanged ? `${originalZone} → ${simulatedZone}` : undefined,
      },
    };
  }

  /**
   * Risk calculation using DRAFT constitution (not the live one)
   * This is the core of the "Shadow Ledger" pattern
   */
  private calculateRiskWithDraftConstitution(
    scores: EntityRiskScores,
    draftConfig: RiskConfiguration
  ): number {
    const {
      score_static = 0,
      score_strategic = 0,
      score_dynamic = 0,
      risk_score = 0,
    } = scores;

    // Control score is inverse (lower is better)
    const score_control = 100 - risk_score;

    const totalWeight =
      draftConfig.weight_inherent +
      draftConfig.weight_strategic +
      draftConfig.weight_control +
      draftConfig.weight_dynamic;

    const weightedScore =
      (score_static * draftConfig.weight_inherent +
        score_strategic * draftConfig.weight_strategic +
        score_control * draftConfig.weight_control +
        score_dynamic * draftConfig.weight_dynamic) /
      totalWeight;

    return Math.max(0, Math.min(100, weightedScore));
  }

  /**
   * Determines risk zone based on thresholds
   */
  private getRiskZone(score: number, config: RiskConfiguration): RiskLevel {
    if (score >= config.threshold_critical) return 'CRITICAL';
    if (score >= config.threshold_high) return 'HIGH';
    if (score >= config.threshold_medium) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Default thresholds for comparison
   */
  private getDefaultThresholds(): RiskConfiguration {
    return {
      weight_inherent: 30,
      weight_strategic: 20,
      weight_control: 40,
      weight_dynamic: 10,
      threshold_critical: 85,
      threshold_high: 70,
      threshold_medium: 50,
    };
  }

  /**
   * Determines severity change direction
   */
  private getSeverityChange(
    oldZone: RiskLevel,
    newZone: RiskLevel
  ): 'upgrade' | 'downgrade' | 'none' {
    const levels: Record<RiskLevel, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    const oldLevel = levels[oldZone];
    const newLevel = levels[newZone];

    if (newLevel > oldLevel) return 'upgrade';
    if (newLevel < oldLevel) return 'downgrade';
    return 'none';
  }

  /**
   * Marks simulation as failed
   */
  private async failSimulation(runId: string, errorMessage: string): Promise<void> {
    await supabase
      .from('risk_simulation_runs')
      .update({
        status: 'FAILED',
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      })
      .eq('id', runId);
  }

  /**
   * Reports progress to callback
   */
  private reportProgress(current: number, total: number, status: string): void {
    if (this.progressCallback) {
      this.progressCallback({
        currentEntity: current,
        totalEntities: total,
        percentage: total > 0 ? (current / total) * 100 : 0,
        status,
      });
    }
  }
}

/**
 * Factory function for creating simulation engine
 */
export function createSimulationEngine(
  progressCallback?: (progress: SimulationProgress) => void
): RiskSimulationEngine {
  return new RiskSimulationEngine(progressCallback);
}
