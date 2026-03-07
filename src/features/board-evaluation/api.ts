/**
 * Wave 71: BoD Evaluation & Skill Matrix — Supabase Data Layer
 *
 * Hooks for board_members, skill_evaluations, and board_effectiveness_scores tables.
 *
 * DEFENSIVE PROGRAMMING:
 *   - Zero-division risk specifically addressed with `(member_count || 1)`
 *   - Array mappings safeguarded with `(data ?? [])`
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface BoardMember {
  id: string;
  tenant_id: string;
  full_name: string;
  role_title: string;
  appointment_date: string | null;
  is_independent: boolean;
  status: 'ACTIVE' | 'RESIGNED' | 'SUSPENDED';
}

export interface SkillEvaluation {
  id: string;
  tenant_id: string;
  member_id: string;
  skill_category: string;
  score: number;
  evaluator_note: string | null;
  evaluation_year: number;
}

export interface BoardEffectivenessScore {
  id: string;
  tenant_id: string;
  evaluation_period: string;
  category: string;
  average_score: number;
  findings: string | null;
}

// ---------------------------------------------------------------------------
// HOOK: Get Board Members
// ---------------------------------------------------------------------------
export function useBoardMembers() {
  return useQuery({
    queryKey: ['board-members'],
    queryFn: async (): Promise<BoardMember[]> => {
      const { data, error } = await supabase
        .from('board_members')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) {
        console.error('useBoardMembers: query failed', error.message);
        return [];
      }
      return (data ?? []) as BoardMember[];
    },
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// HOOK: Get Skill Evaluations (All or by Member)
// ---------------------------------------------------------------------------
export function useSkillEvaluations(memberId?: string) {
  return useQuery({
    queryKey: ['skill-evaluations', memberId],
    queryFn: async (): Promise<SkillEvaluation[]> => {
      let q = supabase
        .from('skill_evaluations')
        .select('*')
        .order('skill_category', { ascending: true });

      if (memberId) {
        q = q.eq('member_id', memberId);
      }

      const { data, error } = await q;

      if (error) {
        console.error('useSkillEvaluations: query failed', error.message);
        return [];
      }
      return (data ?? []) as SkillEvaluation[];
    },
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// HOOK: Get Board Effectiveness Scores
// ---------------------------------------------------------------------------
export function useBoardEffectiveness() {
  return useQuery({
    queryKey: ['board-effectiveness'],
    queryFn: async (): Promise<BoardEffectivenessScore[]> => {
      const { data, error } = await supabase
        .from('board_effectiveness_scores')
        .select('*')
        .order('category', { ascending: true });

      if (error) {
        console.error('useBoardEffectiveness: query failed', error.message);
        return [];
      }
      return (data ?? []) as BoardEffectivenessScore[];
    },
    staleTime: 60_000,
  });
}
