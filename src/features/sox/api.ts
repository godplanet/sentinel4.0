/**
 * Feature-Level SOX API — Wave 35: SOX / ICFR & Skeptic Agent
 *
 * FSD: features/sox/api.ts
 * Skeptic Agent itirazları ve SOX kontrol onaylama akışı için hook'lar.
 * Null/undefined'a karşı `?.` kalkanı her map'de aktif.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SkepticChallengeRecord {
  id: string;
  tenant_id: string;
  control_id: string | null;
  control_code: string;
  department: string | null;
  proposed_status: 'Effective' | 'Ineffective' | 'Not_Tested';
  severity: 'warning' | 'critical';
  incident_count: number;
  ai_message: string;
  justification: string;
  resolution: 'Pending' | 'Override' | 'Withdrawn';
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

// ─── Skeptic Challenge Hooks ─────────────────────────────────────────────────

/**
 * Tüm Skeptic Agent itirazlarını listeler (en yeni önce)
 */
export function useSkepticChallenges(resolution?: SkepticChallengeRecord['resolution']) {
  return useQuery({
    queryKey: ['skeptic-challenges', resolution ?? 'all'],
    queryFn: async () => {
      let query = supabase
        .from('skeptic_challenges')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (resolution) query = query.eq('resolution', resolution);

      const { data, error } = await query;
      if (error) {
        console.error('[Wave35] Failed to fetch skeptic_challenges:', error);
        return [] as SkepticChallengeRecord[];
      }
      return (data || []) as SkepticChallengeRecord[];
    },
    staleTime: 30_000,
  });
}

/**
 * Yeni bir Skeptic Agent itirazını kaydeder
 */
export function useCreateSkepticChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      control_code: string;
      control_id?: string | null;
      department?: string | null;
      proposed_status?: 'Effective' | 'Ineffective' | 'Not_Tested';
      severity: 'warning' | 'critical';
      incident_count: number;
      ai_message: string;
    }) => {
      const { data, error } = await supabase
        .from('skeptic_challenges')
        .insert({
          control_code: input?.control_code ?? '',
          control_id: input?.control_id ?? null,
          department: input?.department ?? null,
          proposed_status: input?.proposed_status ?? 'Effective',
          severity: input?.severity ?? 'warning',
          incident_count: input?.incident_count ?? 0,
          ai_message: input?.ai_message ?? '',
          resolution: 'Pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data as SkepticChallengeRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skeptic-challenges'] });
    },
  });
}

/**
 * Bir itirazı çözer — Override (gerekçe ile imzala) veya Withdrawn
 */
export function useResolveSkepticChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      resolution: 'Override' | 'Withdrawn';
      justification: string;
      resolved_by: string;
    }) => {
      const { data, error } = await supabase
        .from('skeptic_challenges')
        .update({
          resolution: input?.resolution,
          justification: input?.justification ?? '',
          resolved_by: input?.resolved_by ?? 'Unknown',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;
      return data as SkepticChallengeRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skeptic-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['sox-campaigns'] });
    },
  });
}

// ─── SOX Feature Helpers  ─────────────────────────────────────────────────────

/**
 * SOX Kontrol genel istatistikleri (öne çıkan tenant metrikleri)
 */
export function useSoxSummaryStats() {
  return useQuery({
    queryKey: ['sox-summary-stats'],
    queryFn: async () => {
      const [campaigns, controls, incidents, challenges] = await Promise.all([
        supabase.from('sox_campaigns').select('status').eq('status', 'Active'),
        supabase.from('sox_controls').select('id, is_key_control'),
        supabase.from('sox_incidents').select('severity').gte(
          'occurred_at',
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        ),
        supabase.from('skeptic_challenges').select('resolution, severity').eq('resolution', 'Pending'),
      ]);

      return {
        activeCampaigns: (campaigns?.data || []).length,
        totalControls: (controls?.data || []).length,
        keyControls: (controls?.data || []).filter((c: any) => c?.is_key_control).length,
        recentIncidents: (incidents?.data || []).length,
        criticalIncidents: (incidents?.data || []).filter((i: any) => i?.severity === 'Critical').length,
        pendingChallenges: (challenges?.data || []).length,
        criticalChallenges: (challenges?.data || []).filter((c: any) => c?.severity === 'critical').length,
      };
    },
    staleTime: 60_000,
  });
}
