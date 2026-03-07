/**
 * Wave 60: Red Team & BAS Tracker — Supabase Data Layer
 *
 * Hooks for red_team_campaigns + bas_attack_logs tables.
 *
 * DEFENSIVE PROGRAMMING (CONSTITUTIONALLY REQUIRED):
 *   - (campaigns ?? []).map(...)
 *   - ?.field on all nested access
 *   - console.error on all query failures
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type CampaignStatus = 'PLANNED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELED';
export type CampaignType = 'PHISHING' | 'BAS' | 'PEN_TEST' | 'PHYSICAL_BREACH' | 'SOCIAL_ENGINEERING';
export type AttackStatus = 'ATTEMPTED' | 'SUCCESS' | 'BLOCKED' | 'DETECTED' | 'IGNORED';

export interface RedTeamCampaign {
  id: string;
  tenant_id: string;
  campaign_code: string;
  title: string;
  description: string | null;
  campaign_type: CampaignType;
  status: CampaignStatus;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  target_systems: string[];
  start_date: string | null;
  end_date: string | null;
  success_rate: number | null;
  lead_operator: string;
  created_at: string;
  updated_at: string;
}

export interface BasAttackLog {
  id: string;
  tenant_id: string;
  campaign_id: string;
  attack_vector: string;
  target_asset: string;
  status: AttackStatus;
  timestamp: string;
  mitre_tactic: string | null;
  mitre_technique: string | null;
  finding_details: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// HOOK: Get Campaigns
// ---------------------------------------------------------------------------
export function useCampaigns(statusFilter?: CampaignStatus) {
  return useQuery({
    queryKey: ['red-team-campaigns', statusFilter],
    queryFn: async (): Promise<RedTeamCampaign[]> => {
      let q = supabase
        .from('red_team_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter) {
        q = q.eq('status', statusFilter);
      }

      const { data, error } = await q;
      if (error) {
        console.error('useCampaigns: query failed', error.message);
        return [];
      }
      return (data ?? []) as RedTeamCampaign[];
    },
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// HOOK: Get Attack Logs (BAS)
// ---------------------------------------------------------------------------
export function useAttackLogs(campaignId?: string) {
  return useQuery({
    queryKey: ['bas-attack-logs', campaignId],
    enabled: !!campaignId,
    queryFn: async (): Promise<BasAttackLog[]> => {
      if (!campaignId) return [];
      const { data, error } = await supabase
        .from('bas_attack_logs')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('useAttackLogs: query failed', error.message);
        return [];
      }
      return (data ?? []) as BasAttackLog[];
    },
    refetchInterval: 15_000, // Live tracking polling
    staleTime: 5_000,
  });
}

// ---------------------------------------------------------------------------
// MUTATION: Update Campaign Status
// ---------------------------------------------------------------------------
export function useUpdateCampaignStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { campaignId: string; status: CampaignStatus; success_rate?: number }) => {
      const updatePayload: Partial<RedTeamCampaign> = {
        status: payload.status,
        updated_at: new Date().toISOString()
      };
      
      if (payload.status === 'COMPLETED' || payload.status === 'CANCELED') {
        updatePayload.end_date = new Date().toISOString();
      }
      if (payload.status === 'ACTIVE') {
        updatePayload.start_date = new Date().toISOString();
      }
      if (payload.success_rate !== undefined) {
        updatePayload.success_rate = payload.success_rate;
      }

      const { data, error } = await supabase
        .from('red_team_campaigns')
        .update(updatePayload)
        .eq('id', payload.campaignId)
        .select()
        .single();

      if (error) throw error;
      return data as RedTeamCampaign;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['red-team-campaigns'] });
    },
  });
}
