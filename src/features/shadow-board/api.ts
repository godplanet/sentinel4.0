/**
 * Shadow Board & AI Strategy Simulator API
 * Wave 83: Gölge Yönetim Kurulu Simülatörü
 *
 * FSD: features/shadow-board/api.ts
 * Fallbacks: avatar?.response ?? 'Yanıt Bekleniyor'
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

// ─── Types ──────────────────────────────────────────────────────────────────

export type StrategyStatus = 'Draft' | 'Simulating' | 'Completed' | 'Rejected' | 'Approved';
export type ImpactDirection = 'Positive' | 'Neutral' | 'Negative';
export type AvatarSentiment = 'Positive' | 'Neutral' | 'Cautious' | 'Negative';

export interface SimulatedStrategy {
  id: string;
  tenant_id: string;
  strategy_name: string;
  description: string;
  simulation_date: string;
  capital_allocation: number | null;
  status: StrategyStatus;
  created_at: string;
  updated_at: string;
}

export interface StrategyRiskScore {
  id: string;
  tenant_id: string;
  strategy_id: string;
  risk_category: string;
  projected_impact: number | null;
  impact_direction: ImpactDirection;
  confidence_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface AIBoardResponse {
  id: string;
  tenant_id: string;
  strategy_id: string;
  avatar_role: string;
  avatar_name: string;
  response: string | null;
  sentiment: AvatarSentiment;
  created_at: string;
  updated_at: string;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

const TENANT_ID     = '11111111-1111-1111-1111-111111111111';
const STRAT_KEY     = ['simulated-strategies', TENANT_ID] as const;
const SCORES_KEY    = ['strategy-risk-scores', TENANT_ID] as const;
const RESPONSES_KEY = ['ai-board-responses', TENANT_ID] as const;

// ─── API Hooks ────────────────────────────────────────────────────────────────

export function useStrategies() {
  return useQuery({
    queryKey: STRAT_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('simulated_strategies')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Wave83] Failed to fetch simulated_strategies:', error);
        return [] as SimulatedStrategy[];
      }
      
      return ((data as any[]) || []).map(s => ({
        ...s,
        capital_allocation: s?.capital_allocation ?? 0,
      })) as SimulatedStrategy[];
    },
    staleTime: 30_000,
  });
}

export function useRiskScores(strategyId?: string) {
  return useQuery({
    queryKey: [...SCORES_KEY, strategyId],
    enabled: !!strategyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategy_risk_scores')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .eq('strategy_id', strategyId!)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Wave83] Failed to fetch strategy_risk_scores:', error);
        return [] as StrategyRiskScore[];
      }
      
      return ((data as any[]) || []).map(r => ({
        ...r,
        projected_impact: r?.projected_impact ?? 0,
        confidence_score: r?.confidence_score ?? 0,
      })) as StrategyRiskScore[];
    },
    staleTime: 30_000,
  });
}

export function useBoardResponses(strategyId?: string) {
  return useQuery({
    queryKey: [...RESPONSES_KEY, strategyId],
    enabled: !!strategyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_board_responses')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .eq('strategy_id', strategyId!)
        .order('created_at', { ascending: true }); // Sohbet akışı için ASC

      if (error) {
        console.error('[Wave83] Failed to fetch ai_board_responses:', error);
        return [] as AIBoardResponse[];
      }
      
      return ((data as any[]) || []).map(a => ({
        ...a,
        // ZORUNLU KORUMA MADDESI (Wave 83)
        response: a?.response ?? 'Yanıt Bekleniyor',
      })) as AIBoardResponse[];
    },
    staleTime: 15_000,
  });
}
