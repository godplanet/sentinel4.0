import jsonLogic from 'json-logic-js';
import type {
  MethodologyConfig,
  FindingRiskInput,
  RiskCalculationResult,
  SeverityThreshold,
  VetoRule,
} from './methodology-types';

const ASSET_MULTIPLIERS: Record<string, number> = {
  Critical: 1.3,
  CRITICAL: 1.3,
  Major: 1.0,
  MAJOR: 1.0,
  Minor: 0.7,
  MINOR: 0.7,
};

export class RiskEngine {
  private config: MethodologyConfig;

  constructor(config: MethodologyConfig) {
    this.config = config;
  }

  calculate(finding: FindingRiskInput): RiskCalculationResult {
    const { risk_weights, scoring_matrix, severity_thresholds, veto_rules } = this.config;
    const maxImpact = scoring_matrix.impact_max || 5;
    const maxLikelihood = scoring_matrix.likelihood_max || 5;
    const maxControl = scoring_matrix.control_effectiveness_max || 5;

    const weightedImpact =
      (finding.impact_financial / maxImpact) * risk_weights.financial +
      (finding.impact_legal / maxImpact) * risk_weights.legal +
      (finding.impact_reputation / maxImpact) * risk_weights.reputation +
      (finding.impact_operational / maxImpact) * risk_weights.operational;

    const likelihoodFactor = finding.likelihood_score / maxLikelihood;
    const controlReduction = finding.control_effectiveness / maxControl;
    const assetMultiplier = ASSET_MULTIPLIERS[finding.asset_criticality] ?? 1.0;
    const rawScore = weightedImpact * likelihoodFactor * (1 - controlReduction * 0.5) * assetMultiplier * 100;

    let score = Math.min(100, Math.max(0, Number(rawScore.toFixed(2))));
    let vetoTriggered = false;
    let vetoReason: string | null = null;
    let vetoSource: 'jsonlogic' | 'legacy' | null = null;

    const jsonLogicResult = this.evaluateJsonLogicVeto(finding);
    if (jsonLogicResult) {
      score = jsonLogicResult.score;
      vetoTriggered = true;
      vetoReason = jsonLogicResult.reason;
      vetoSource = 'jsonlogic';
    } else {
      for (const rule of veto_rules) {
        if (this.evaluateLegacyVeto(rule, finding)) {
          score = 100;
          vetoTriggered = true;
          vetoReason = rule.reason;
          vetoSource = 'legacy';
          break;
        }
      }
    }

    // ── GIAS Strategic Nexus: Talent Capability Modifier ──────────────────────
    // talent_capability_multiplier is pre-computed by the caller via talent-nexus.ts.
    // Range: 0.8 (strong-team discount) to 1.2 (weak-team penalty).
    // Veto rules always take precedence; the modifier is NOT applied to vetoed scores.
    const rawTalentMultiplier = finding.talent_capability_multiplier;
    const talentMultiplier =
      !vetoTriggered && rawTalentMultiplier !== undefined
        ? Math.min(1.2, Math.max(0.8, rawTalentMultiplier))
        : 1.0;

    if (!vetoTriggered && talentMultiplier !== 1.0) {
      score = Math.min(100, Math.max(0, Number((score * talentMultiplier).toFixed(2))));
    }

    const threshold = this.classifyScore(score, severity_thresholds);
    const severityLabel = threshold?.label ?? 'Bilinmiyor';
    const sla = this.config.sla_config?.[severityLabel] ?? null;
    const purificationAmount = finding.shariah_vector?.purification_amt ?? 0;

    return {
      score,
      severity: severityLabel,
      color: threshold?.color ?? '#94a3b8',
      vetoTriggered,
      vetoReason,
      vetoSource,
      sla,
      purificationAmount,
      breakdown: {
        weightedImpact:   Number(weightedImpact.toFixed(4)),
        likelihoodFactor: Number(likelihoodFactor.toFixed(4)),
        controlReduction: Number(controlReduction.toFixed(4)),
        rawScore:         Number(rawScore.toFixed(2)),
        assetMultiplier,
        talentMultiplier: talentMultiplier !== 1.0 ? talentMultiplier : undefined,
      },
    };
  }

  private evaluateJsonLogicVeto(finding: FindingRiskInput): { score: number; reason: string } | null {
    const { veto_logic } = this.config;
    if (!veto_logic) return null;

    const evalContext = {
      ...finding,
      shariah_vector: finding.shariah_vector ?? { status: 'HALAL', purification_amt: 0, fatwa_ref: '' },
      cyber_vector: finding.cyber_vector ?? { cvss_vector: '', cvss_score: finding.cvss_score ?? 0, asset_criticality: 'MINOR' },
      financial_vector: finding.financial_vector ?? { loss_amount: 0, impact_percent_equity: 0 },
    };

    try {
      const result = jsonLogic.apply(veto_logic as Record<string, unknown>, evalContext);
      if (result !== null && result !== undefined && typeof result === 'number') {
        return {
          score: Math.min(100, Math.max(0, result)),
          reason: this.detectVetoReason(evalContext),
        };
      }
    } catch {
      // JsonLogic evaluation failed, fall through to legacy
    }

    return null;
  }

  private detectVetoReason(ctx: Record<string, unknown>): string {
    const shariah = ctx.shariah_vector as { status?: string } | undefined;
    if (shariah?.status === 'BATIL') return "Ser'i Uyum Ihlali (BATIL)";

    const cyber = ctx.cyber_vector as { cvss_score?: number; asset_criticality?: string } | undefined;
    if (cyber && (cyber.cvss_score ?? 0) >= 9.0 && cyber.asset_criticality === 'CRITICAL') {
      return 'Kritik Siber Zafiyet (CVSS >= 9.0)';
    }

    return 'JsonLogic Veto';
  }

  private evaluateLegacyVeto(rule: VetoRule, finding: FindingRiskInput): boolean {
    const fieldValue = (finding as Record<string, unknown>)[rule.field];
    if (fieldValue === null || fieldValue === undefined) return false;
    const val = Number(fieldValue);
    if (isNaN(val)) return false;

    switch (rule.operator) {
      case '>=': return val >= rule.value;
      case '>':  return val > rule.value;
      case '<=': return val <= rule.value;
      case '<':  return val < rule.value;
      case '==': return val === rule.value;
      case '!=': return val !== rule.value;
      default:   return false;
    }
  }

  private classifyScore(score: number, thresholds: SeverityThreshold[]): SeverityThreshold | null {
    const sorted = [...thresholds].sort((a, b) => b.min - a.min);
    for (const t of sorted) {
      if (score >= t.min && score <= t.max) return t;
    }
    return sorted[sorted.length - 1] ?? null;
  }
}

/**
 * Helper function for calculating finding risk
 * Used by NewFindingModal and other components
 */
export function calculateFindingRisk(
  formData: any,
  riskConfig: any
): {
  calculated_score: number;
  severity: string;
  color_code: string;
  is_veto_triggered: boolean;
  veto_reason: string | null;
  due_date: string | null;
  target_sprints: number;
  breakdown: any;
} {
  // Default config if not provided
  const defaultConfig: MethodologyConfig = {
    risk_weights: {
      financial: riskConfig?.weights?.financial ?? 0.3,
      legal: riskConfig?.weights?.legal ?? 0.25,
      reputation: riskConfig?.weights?.reputation ?? 0.25,
      operational: riskConfig?.weights?.operational ?? 0.2,
    },
    scoring_matrix: {
      impact_max: 5,
      likelihood_max: 5,
      control_effectiveness_max: 5,
    },
    severity_thresholds: [
      { label: 'Kritik', min: riskConfig?.thresholds?.critical ?? 80, max: 100, color: '#dc2626' },
      { label: 'Yüksek', min: riskConfig?.thresholds?.high ?? 60, max: (riskConfig?.thresholds?.critical ?? 80) - 1, color: '#f97316' },
      { label: 'Orta', min: riskConfig?.thresholds?.medium ?? 30, max: (riskConfig?.thresholds?.high ?? 60) - 1, color: '#fbbf24' },
      { label: 'Düşük', min: 0, max: (riskConfig?.thresholds?.medium ?? 30) - 1, color: '#10b981' },
    ],
    veto_rules: [],
  };

  const input: FindingRiskInput = {
    impact_financial: formData.impact_financial ?? 1,
    impact_legal: formData.impact_legal ?? 1,
    impact_reputation: formData.impact_reputation ?? 1,
    impact_operational: formData.impact_operational ?? 1,
    likelihood_score: formData.likelihood_score ?? 3,
    control_effectiveness: formData.control_weakness ?? 3,
    asset_criticality: formData.asset_criticality ?? 'Minor',
    cvss_score: formData.cvss_score ?? 0,
  };

  const engine = new RiskEngine(defaultConfig);
  const result = engine.calculate(input);

  // Calculate due_date from SLA calendar_days
  let due_date: string | null = null;
  if (result.sla?.calendar_days) {
    const dueDateTime = new Date();
    dueDateTime.setDate(dueDateTime.getDate() + result.sla.calendar_days);
    due_date = dueDateTime.toISOString().split('T')[0];
  }

  return {
    calculated_score: result.score,
    severity: result.severity,
    color_code: result.color,
    is_veto_triggered: result.vetoTriggered,
    veto_reason: result.vetoReason,
    due_date,
    target_sprints: result.sla?.sprint_count ?? 1,
    breakdown: result.breakdown,
  };
}
