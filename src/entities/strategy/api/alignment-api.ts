import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import { fetchStrategicGoals, fetchAuditObjectivesSimple } from './goals';

export const ALIGNMENT_KEYS = {
  alignments: ['strategy_universe_alignments'] as const,
  goals: ['strategic_goals_full'] as const,
  objectives: ['strategic_objectives_full'] as const,
};

export interface StrategyUniverseAlignment {
  id: string;
  goal_id: string;
  universe_node_id: string;
  alignment_score: number;
}

export async function fetchStrategyAlignments(): Promise<StrategyUniverseAlignment[]> {
  const { data, error } = await supabase
    .from('strategy_universe_alignment')
    .select('*');
    
  if (error) {
    console.error('[SENTINEL] fetchStrategyAlignments error:', error);
    return [];
  }
  return data as StrategyUniverseAlignment[];
}

export function useStrategyAlignments() {
  return useQuery({
    queryKey: ALIGNMENT_KEYS.alignments,
    queryFn: fetchStrategyAlignments,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStrategicGoals() {
  return useQuery({
    queryKey: ALIGNMENT_KEYS.goals,
    queryFn: fetchStrategicGoals,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAuditObjectives() {
  return useQuery({
    queryKey: ALIGNMENT_KEYS.objectives,
    queryFn: fetchAuditObjectivesSimple,
    staleTime: 5 * 60 * 1000,
  });
}
