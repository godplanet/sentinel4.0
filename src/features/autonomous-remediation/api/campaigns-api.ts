/**
 * Master Action Campaigns API — Otonom İyileştirme Kampanyaları
 *
 * DDL (mevcut migration: 20260219091340_20260225000000_create_action_management.sql):
 *
 *   CREATE TABLE master_action_campaigns (
 *     id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
 *     title       text        NOT NULL,
 *     description text,
 *     root_cause  text,
 *     status      text        NOT NULL DEFAULT 'active'
 *                 CHECK (status IN ('active', 'completed', 'cancelled')),
 *     created_at  timestamptz DEFAULT now()
 *   );
 *
 *   actions.campaign_id uuid REFERENCES master_action_campaigns(id)
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type { MasterActionCampaign } from '@/entities/action/model/types';

export interface CampaignRow {
  campaign: MasterActionCampaign;
  totalActions: number;
  closedActions: number;
}

const QUERY_KEY = ['master-action-campaigns'] as const;

async function fetchCampaigns(): Promise<CampaignRow[]> {
  const { data: campaigns, error: campError } = await supabase
    .from('master_action_campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (campError) {
    return [];
  }

  if (!campaigns?.length) return [];

  const campaignIds = campaigns.map((c) => c.id);

  const { data: actions, error: actionsError } = await supabase
    .from('actions')
    .select('id, campaign_id, status')
    .in('campaign_id', campaignIds);

  if (actionsError) {
    return campaigns.map((c) => ({
      campaign: c as MasterActionCampaign,
      totalActions: 0,
      closedActions: 0,
    }));
  }

  const byCampaign: Record<string, { total: number; closed: number }> = {};
  for (const id of campaignIds) byCampaign[id] = { total: 0, closed: 0 };

  for (const a of actions || []) {
    const cid = a.campaign_id as string | null;
    if (!cid || !byCampaign[cid]) continue;
    byCampaign[cid].total += 1;
    if (a.status === 'closed') byCampaign[cid].closed += 1;
  }

  return campaigns.map((c) => ({
    campaign: c as MasterActionCampaign,
    totalActions: byCampaign[c.id]?.total ?? 0,
    closedActions: byCampaign[c.id]?.closed ?? 0,
  }));
}

export function useCampaigns() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchCampaigns,
  });
}
