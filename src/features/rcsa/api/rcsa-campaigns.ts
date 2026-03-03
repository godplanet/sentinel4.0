import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';

export type RCSACampaignStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED';

export interface RCSACampaign {
  id: string;
  tenant_id: string;
  title: string;
  status: RCSACampaignStatus;
  start_date: string | null;
  end_date: string | null;
  completion_rate: number;
  created_at: string;
  created_by: string;
}

export async function fetchRCSACampaigns(): Promise<RCSACampaign[]> {
  const { data, error } = await supabase
    .from('rcsa_campaigns')
    .select('*')
    .eq('tenant_id', ACTIVE_TENANT_ID)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as RCSACampaign[];
}

export interface CreateRCSACampaignInput {
  title: string;
  startDate?: string;
  endDate?: string;
}

export async function createRCSACampaign(
  input: CreateRCSACampaignInput,
): Promise<RCSACampaign> {
  const { data, error } = await supabase
    .from('rcsa_campaigns')
    .insert({
      tenant_id: ACTIVE_TENANT_ID,
      title: input.title,
      start_date: input.startDate ?? null,
      end_date: input.endDate ?? null,
      status: 'DRAFT',
      completion_rate: 0,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as RCSACampaign;
}

