import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type {
  SoxCampaign, SoxControl, SoxAttestation, SoxIncident,
  SoxOutboxEvent, ControlWithAttestation, CampaignStats,
} from './types';

export function useSoxCampaigns() {
  return useQuery({
    queryKey: ['sox-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sox_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as SoxCampaign[];
    },
  });
}

export function useSoxControls(campaignId: string | undefined) {
  return useQuery({
    queryKey: ['sox-controls', campaignId],
    enabled: !!campaignId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sox_controls')
        .select('*')
        .eq('campaign_id', campaignId!)
        .order('code');
      if (error) throw error;
      return (data || []) as SoxControl[];
    },
  });
}

export function useSoxAttestations(campaignId: string | undefined) {
  return useQuery({
    queryKey: ['sox-attestations', campaignId],
    enabled: !!campaignId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sox_attestations')
        .select('*')
        .eq('campaign_id', campaignId!)
        .order('signed_at', { ascending: false });
      if (error) throw error;
      return (data || []) as SoxAttestation[];
    },
  });
}

export function useSoxIncidents() {
  return useQuery({
    queryKey: ['sox-incidents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sox_incidents')
        .select('*')
        .order('occurred_at', { ascending: false });
      if (error) throw error;
      return (data || []) as SoxIncident[];
    },
  });
}

export function useSoxOutbox() {
  return useQuery({
    queryKey: ['sox-outbox'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sox_outbox_events')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as SoxOutboxEvent[];
    },
  });
}

export function useControlsWithAttestations(campaignId: string | undefined) {
  const { data: controls } = useSoxControls(campaignId);
  const { data: attestations } = useSoxAttestations(campaignId);
  const { data: incidents } = useSoxIncidents();

  return useQuery({
    queryKey: ['sox-controls-enriched', campaignId, controls?.length, attestations?.length, incidents?.length],
    enabled: !!controls && !!attestations && !!incidents,
    queryFn: () => {
      const attMap = new Map<string, SoxAttestation>();
      for (const a of attestations!) attMap.set(a.control_id, a);

      return (controls || []).map((c): ControlWithAttestation => ({
        ...c,
        attestation: attMap.get(c.id) || null,
        incidents: (incidents || []).filter((inc) =>
          inc.control_code === c.code || inc.department === c.department
        ),
      }));
    },
  });
}

export function useCampaignStats(campaignId: string | undefined) {
  const { data: enriched } = useControlsWithAttestations(campaignId);

  return useQuery({
    queryKey: ['sox-campaign-stats', campaignId, enriched?.length],
    enabled: !!enriched,
    queryFn: (): CampaignStats => {
      const items = enriched!;
      const total = items.length;
      const effective = items.filter((c) => c.attestation?.status === 'Effective').length;
      const ineffective = items.filter((c) => c.attestation?.status === 'Ineffective').length;
      const pending = total - effective - ineffective;
      const completionPercent = total > 0 ? Math.round(((effective + ineffective) / total) * 100) : 0;

      const totalWeight = items.reduce((s, c) => s + c.risk_weight, 0);
      const effectiveWeight = items
        .filter((c) => c.attestation?.status === 'Effective')
        .reduce((s, c) => s + c.risk_weight, 0);
      const riskWeightedScore = totalWeight > 0 ? Math.round((effectiveWeight / totalWeight) * 100) : 0;

      const categoryBreakdown: CampaignStats['categoryBreakdown'] = {};
      for (const c of items) {
        if (!categoryBreakdown[c.category]) categoryBreakdown[c.category] = { total: 0, completed: 0, effective: 0 };
        categoryBreakdown[c.category].total++;
        if (c.attestation) categoryBreakdown[c.category].completed++;
        if (c.attestation?.status === 'Effective') categoryBreakdown[c.category].effective++;
      }

      return { total, effective, ineffective, pending, completionPercent, riskWeightedScore, categoryBreakdown };
    },
  });
}

export function useSignAttestation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      campaign_id: string;
      control_id: string;
      attester_name: string;
      status: 'Effective' | 'Ineffective' | 'Not_Tested';
      manager_comment: string;
      ai_challenge: string | null;
      ai_challenge_resolved: boolean;
      snapshot_json: Record<string, unknown>;
      record_hash: string;
    }) => {
      const { data, error } = await supabase
        .from('sox_attestations')
        .insert({
          ...input,
          is_frozen: true,
          signed_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;

      await supabase.from('sox_outbox_events').insert({
        event_type: 'ATTESTATION_SIGNED',
        payload: {
          control_id: input.control_id,
          status: input.status,
          record_hash: input.record_hash,
        },
        status: 'Pending',
      });

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sox-attestations'] });
      qc.invalidateQueries({ queryKey: ['sox-controls-enriched'] });
      qc.invalidateQueries({ queryKey: ['sox-campaign-stats'] });
      qc.invalidateQueries({ queryKey: ['sox-outbox'] });
      qc.invalidateQueries({ queryKey: ['sox-campaigns'] });
    },
  });
}
