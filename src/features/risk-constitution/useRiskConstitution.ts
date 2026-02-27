import { useState, useEffect, useCallback } from 'react';
import { fetchConstitution, updateConstitution } from './api';
import type { RiskConstitutionData, ScoreInput, ScoreResult, VetoRule, Dimension, RiskRange } from './types';

function evaluateCondition(condition: string, ctx: Record<string, unknown>): boolean {
  const parts = condition.split('&&').map(s => s.trim());
  return parts.every(part => {
    const match = part.match(/^(\w+)\s*(>=|<=|==|!=|>|<)\s*(.+)$/);
    if (!match) return false;
    const [, field, op, rawVal] = match;
    const left = ctx[field];
    if (left === undefined) return false;
    const right = rawVal === 'true' ? true : rawVal === 'false' ? false : isNaN(Number(rawVal)) ? rawVal : Number(rawVal);
    switch (op) {
      case '>=': return Number(left) >= Number(right);
      case '<=': return Number(left) <= Number(right);
      case '>': return Number(left) > Number(right);
      case '<': return Number(left) < Number(right);
      case '==': return String(left) === String(right);
      case '!=': return String(left) !== String(right);
      default: return false;
    }
  });
}

function checkVetos(rules: VetoRule[], ctx: Record<string, unknown>): { triggered: boolean; reason: string | null; overrideScore: number } {
  for (const rule of rules) {
    if (!rule.enabled) continue;
    if (evaluateCondition(rule.condition, ctx)) {
      return { triggered: true, reason: rule.name, overrideScore: rule.override_score };
    }
  }
  return { triggered: false, reason: null, overrideScore: 0 };
}

export function computeHybridScore(
  dimensions: Dimension[],
  ranges: RiskRange[],
  vetoRules: VetoRule[],
  input: ScoreInput,
): ScoreResult {
  const ctx: Record<string, unknown> = { ...input.context };
  const veto = checkVetos(vetoRules, ctx);

  if (veto.triggered) {
    const s = veto.overrideScore;
    const zone = ranges.find(r => s >= r.min && s <= r.max) || ranges[0] || null;
    return {
      score: s,
      zone,
      vetoTriggered: true,
      vetoReason: veto.reason,
      breakdown: { weightedImpact: 0, likelihoodFactor: 0, controlFactor: 0 },
    };
  }

  let weightedImpact = 0;
  for (const dim of dimensions) {
    const val = input.dimensionScores[dim.id] ?? 0;
    weightedImpact += val * dim.weight;
  }

  const likelihoodFactor = input.likelihood / 5;
  const controlFactor = 1 - input.controlEffectiveness * 0.15;
  const raw = weightedImpact * likelihoodFactor * controlFactor * 20;
  const score = Math.min(100, Math.max(0, Number(raw.toFixed(1))));

  const sorted = [...ranges].sort((a, b) => b.min - a.min);
  const zone = sorted.find(r => score >= r.min) || ranges[ranges.length - 1] || null;

  return {
    score,
    zone,
    vetoTriggered: false,
    vetoReason: null,
    breakdown: {
      weightedImpact: Number(weightedImpact.toFixed(2)),
      likelihoodFactor: Number(likelihoodFactor.toFixed(2)),
      controlFactor: Number(controlFactor.toFixed(2)),
    },
  };
}

export function useRiskConstitution() {
  const [constitution, setConstitution] = useState<RiskConstitutionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchConstitution();
    if (!data) {
      setError('Anayasa verisi bulunamadi');
    } else {
      setConstitution(data);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (
    updates: Partial<Pick<RiskConstitutionData, 'dimensions' | 'impact_matrix' | 'veto_rules' | 'risk_ranges'>>,
  ): Promise<boolean> => {
    if (!constitution) return false;
    const ok = await updateConstitution(constitution.id, updates);
    if (ok) {
      setConstitution(prev => prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : null);
    }
    return ok;
  }, [constitution]);

  return { constitution, loading, error, save, refetch: load };
}
