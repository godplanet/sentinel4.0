/*
 * SENTINEL RISK ENGINE (v3.0)
 * Unified risk calculation engine combining v2 and v3 logic
 * Location: entities/risk/engine.ts (FSD Architecture)
 */

import { supabase } from '@/shared/api/supabase';

// ============================================================================
// TYPES
// ============================================================================

export interface RiskConfiguration {
  weight_inherent: number;
  weight_strategic: number;
  weight_control: number;
  weight_dynamic: number;
  threshold_critical: number;
  threshold_high: number;
  threshold_medium: number;
  last_updated?: string;
}

export interface EntityRiskScores {
  score_static?: number;
  score_strategic?: number;
  score_dynamic?: number;
  risk_score?: number; // Computed total
}

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type RiskTrend = 'INCREASING' | 'DECREASING' | 'STABLE';

export interface RiskAssessment {
  totalScore: number;
  level: RiskLevel;
  trend: RiskTrend;
  components: {
    static: number;
    strategic: number;
    control: number;
    dynamic: number;
  };
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: RiskConfiguration = {
  weight_inherent: 30,      // Statik risk ağırlığı (%)
  weight_strategic: 20,     // Stratejik uyum ağırlığı (%)
  weight_control: 40,       // Kontrol etkinliği ağırlığı (%)
  weight_dynamic: 10,       // Dinamik sinyaller ağırlığı (%)
  threshold_critical: 85,   // Kritik risk eşiği
  threshold_high: 70,       // Yüksek risk eşiği
  threshold_medium: 50,     // Orta risk eşiği
};

// ============================================================================
// RISK ENGINE CLASS (Singleton)
// ============================================================================

class RiskEngine {
  private static instance: RiskEngine;
  private config: RiskConfiguration = DEFAULT_CONFIG;
  private previousScores: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): RiskEngine {
    if (!RiskEngine.instance) {
      RiskEngine.instance = new RiskEngine();
    }
    return RiskEngine.instance;
  }

  // --------------------------------------------------------------------------
  // CONFIGURATION MANAGEMENT
  // --------------------------------------------------------------------------

  async loadConfiguration(): Promise<RiskConfiguration> {
    try {
      const { data, error } = await supabase
        .from('risk_parameters')
        .select('param_key, param_value')
        .eq('is_active', true);

      if (error) throw error;

      if (data && data.length > 0) {
        const config: Partial<RiskConfiguration> = {};
        data.forEach(param => {
          config[param.param_key as keyof RiskConfiguration] = Number(param.param_value);
        });
        this.config = { ...DEFAULT_CONFIG, ...config };
      } else {
        // Initialize database with defaults
        await this.saveConfiguration(DEFAULT_CONFIG);
      }

      return this.config;
    } catch (error) {
      console.error('Failed to load risk configuration:', error);
      return DEFAULT_CONFIG;
    }
  }

  async saveConfiguration(config: Partial<RiskConfiguration>): Promise<void> {
    try {
      const updates = Object.entries(config).map(([key, value]) => ({
        param_key: key,
        param_value: value,
        is_active: true,
        updated_by: 'system',
      }));

      const { error } = await supabase
        .from('risk_parameters')
        .upsert(updates, {
          onConflict: 'param_key',
        });

      if (error) throw error;

      this.config = { ...this.config, ...config };
    } catch (error) {
      console.error('Failed to save risk configuration:', error);
      throw error;
    }
  }

  getConfiguration(): RiskConfiguration {
    return { ...this.config };
  }

  // --------------------------------------------------------------------------
  // RISK CALCULATION (TRI-HYBRID MODEL)
  // --------------------------------------------------------------------------

  /**
   * Calculates total risk score using weighted average formula:
   * Total = (static × w1 + strategic × w2 + control × w3 + dynamic × w4) / 100
   *
   * This is the v2 "Tri-Hybrid" model adapted for v3.
   */
  calculateTotalRisk(scores: EntityRiskScores): number {
    const {
      score_static = 0,
      score_strategic = 0,
      score_dynamic = 0,
    } = scores;

    // Control score is inverse (lower is better)
    const score_control = 100 - (scores.risk_score || 0);

    const totalWeight =
      this.config.weight_inherent +
      this.config.weight_strategic +
      this.config.weight_control +
      this.config.weight_dynamic;

    const weightedScore =
      (score_static * this.config.weight_inherent +
        score_strategic * this.config.weight_strategic +
        score_control * this.config.weight_control +
        score_dynamic * this.config.weight_dynamic) /
      totalWeight;

    return Math.max(0, Math.min(100, weightedScore));
  }

  /**
   * Determines risk level based on configured thresholds
   */
  getRiskLevel(score: number): RiskLevel {
    if (score >= this.config.threshold_critical) return 'CRITICAL';
    if (score >= this.config.threshold_high) return 'HIGH';
    if (score >= this.config.threshold_medium) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Detects risk trend by comparing with previous score
   */
  getRiskTrend(currentScore: number, previousScore: number): RiskTrend {
    const TREND_THRESHOLD = 5; // Points difference to consider trend

    if (currentScore - previousScore >= TREND_THRESHOLD) return 'INCREASING';
    if (previousScore - currentScore >= TREND_THRESHOLD) return 'DECREASING';
    return 'STABLE';
  }

  /**
   * Performs full risk assessment for an entity
   */
  assessRisk(entityId: string, scores: EntityRiskScores, previousScore?: number): RiskAssessment {
    const totalScore = this.calculateTotalRisk(scores);
    const level = this.getRiskLevel(totalScore);
    const trend = previousScore !== undefined
      ? this.getRiskTrend(totalScore, previousScore)
      : 'STABLE';

    return {
      totalScore: Number(totalScore.toFixed(2)),
      level,
      trend,
      components: {
        static: scores.score_static || 0,
        strategic: scores.score_strategic || 0,
        control: 100 - (scores.risk_score || 0),
        dynamic: scores.score_dynamic || 0,
      },
    };
  }

  // --------------------------------------------------------------------------
  // ENTITY OPERATIONS
  // --------------------------------------------------------------------------

  /**
   * Updates risk scores for a specific entity
   */
  async updateEntityRisk(
    entityId: string,
    scores: Partial<EntityRiskScores>
  ): Promise<void> {
    try {
      // Fetch current entity
      const { data: entity, error: fetchError } = await supabase
        .from('audit_entities')
        .select('risk_score, metadata')
        .eq('id', entityId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!entity) throw new Error('Entity not found');

      // Merge scores
      const currentScores: EntityRiskScores = {
        score_static: entity.metadata?.score_static || 0,
        score_strategic: entity.metadata?.score_strategic || 0,
        score_dynamic: entity.metadata?.score_dynamic || 0,
        risk_score: entity.risk_score || 0,
      };

      const updatedScores = { ...currentScores, ...scores };
      const totalRisk = this.calculateTotalRisk(updatedScores);

      // Store previous score for trend detection
      const previousScore = entity.risk_score || 0;
      this.previousScores.set(entityId, previousScore);

      // Update entity
      const { error: updateError } = await supabase
        .from('audit_entities')
        .update({
          risk_score: totalRisk,
          metadata: {
            ...entity.metadata,
            score_static: updatedScores.score_static,
            score_strategic: updatedScores.score_strategic,
            score_dynamic: updatedScores.score_dynamic,
          },
        })
        .eq('id', entityId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Failed to update entity risk:', error);
      throw error;
    }
  }

  /**
   * Recalculates all entity risk scores (used after config changes)
   */
  async recalculateAllRisks(): Promise<number> {
    try {
      const { data: entities, error } = await supabase
        .from('audit_entities')
        .select('id, risk_score, metadata');

      if (error) throw error;
      if (!entities) return 0;

      let updated = 0;

      for (const entity of entities) {
        const scores: EntityRiskScores = {
          score_static: entity.metadata?.score_static || 0,
          score_strategic: entity.metadata?.score_strategic || 0,
          score_dynamic: entity.metadata?.score_dynamic || 0,
          risk_score: entity.risk_score || 0,
        };

        const totalRisk = this.calculateTotalRisk(scores);

        // Only update if score changed
        if (Math.abs(totalRisk - (entity.risk_score || 0)) > 0.01) {
          await supabase
            .from('audit_entities')
            .update({ risk_score: totalRisk })
            .eq('id', entity.id);

          updated++;
        }
      }

      return updated;
    } catch (error) {
      console.error('Failed to recalculate risks:', error);
      throw error;
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const riskEngine = RiskEngine.getInstance();
export default riskEngine;
