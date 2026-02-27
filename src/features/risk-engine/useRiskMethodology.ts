import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/shared/api/supabase';

export interface RiskConfiguration {
  id: string;
  tenant_id: string;
  weight_financial: number;
  weight_reputation: number;
  weight_operational: number;
  weight_legal: number;
  velocity_multiplier_high: number;
  velocity_multiplier_medium: number;
  threshold_critical: number;
  threshold_high: number;
  threshold_medium: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RiskImpacts {
  financial: number;
  reputation: number;
  operational: number;
  legal: number;
}

export type VelocityLevel = 'high' | 'medium' | 'low';

export interface RiskZone {
  label: string;
  color: string;
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export function computeRiskScore(
  cfg: RiskConfiguration,
  impacts: RiskImpacts,
  likelihood: number,
  velocity: VelocityLevel,
): number {
  const weightedImpact =
    impacts.financial * cfg.weight_financial +
    impacts.reputation * cfg.weight_reputation +
    impacts.operational * cfg.weight_operational +
    impacts.legal * cfg.weight_legal;

  const velocityMultiplier =
    velocity === 'high' ? cfg.velocity_multiplier_high :
    velocity === 'medium' ? cfg.velocity_multiplier_medium : 1.0;

  return Number((weightedImpact * likelihood * velocityMultiplier).toFixed(2));
}

export function determineRiskZone(cfg: RiskConfiguration, score: number): RiskZone {
  if (score >= cfg.threshold_critical) {
    return { label: 'Kritik', color: '#dc2626', level: 'CRITICAL' };
  }
  if (score >= cfg.threshold_high) {
    return { label: 'Yuksek', color: '#f97316', level: 'HIGH' };
  }
  if (score >= cfg.threshold_medium) {
    return { label: 'Orta', color: '#eab308', level: 'MEDIUM' };
  }
  return { label: 'Dusuk', color: '#22c55e', level: 'LOW' };
}

export function useRiskMethodology() {
  const [config, setConfig] = useState<RiskConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('risk_configuration')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (err) {
      setError(err.message);
    } else {
      setConfig(data);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const updateConfig = useCallback(async (
    updates: Partial<Omit<RiskConfiguration, 'id' | 'tenant_id' | 'created_at'>>,
  ): Promise<boolean> => {
    if (!config) return false;
    const { error: err } = await supabase
      .from('risk_configuration')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', config.id);

    if (err) {
      setError(err.message);
      return false;
    }
    setConfig(prev => prev ? { ...prev, ...updates } as RiskConfiguration : null);
    return true;
  }, [config]);

  const calculateScore = useCallback((
    impacts: RiskImpacts,
    likelihood: number,
    velocity: VelocityLevel,
  ): number => {
    if (!config) return 0;
    return computeRiskScore(config, impacts, likelihood, velocity);
  }, [config]);

  const getRiskZone = useCallback((score: number): RiskZone => {
    if (!config) return { label: 'Bilinmiyor', color: '#94a3b8', level: 'LOW' };
    return determineRiskZone(config, score);
  }, [config]);

  return { config, loading, error, updateConfig, calculateScore, getRiskZone, refetch: fetchConfig };
}
