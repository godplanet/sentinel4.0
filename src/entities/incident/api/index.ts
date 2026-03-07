import { supabase } from '@/shared/api/supabase';
import type { Incident, CreateIncidentInput, WhistleblowerTip, SubmitTipInput, IncidentStats } from '../model/types';

// ─── Incidents ────────────────────────────────────────────────────────────────

export async function fetchIncidents(): Promise<Incident[]> {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchIncident(id: string): Promise<Incident | null> {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createIncident(input: CreateIncidentInput): Promise<Incident> {
  const { data, error } = await supabase
    .from('incidents')
    .insert([{
      title: input.title,
      description: input.description,
      category: input.category,
      is_anonymous: input.is_anonymous,
      reporter_id: input.is_anonymous ? null : (input.reporter_id ?? null),
      status: 'NEW',
      tenant_id: '11111111-1111-1111-1111-111111111111',
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateIncident(id: string, updates: Partial<Incident>): Promise<Incident> {
  const { data, error } = await supabase
    .from('incidents')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteIncident(id: string): Promise<void> {
  const { error } = await supabase
    .from('incidents')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ─── Incident Stats (canlı dashboard sayaçları) ──────────────────────────────

export async function fetchIncidentStats(): Promise<IncidentStats> {
  const { data, error } = await supabase
    .from('incidents')
    .select('status, is_anonymous');

  if (error || !data) {
    return { total: 0, open: 0, closed: 0, anonymous: 0 };
  }

  const items = data || [];
  return {
    total: items.length,
    open: items.filter(i => i.status === 'NEW' || i.status === 'INVESTIGATING').length,
    closed: items.filter(i => i.status === 'CLOSED' || i.status === 'RESOLVED').length,
    anonymous: items.filter(i => i.is_anonymous === true).length,
  };
}

export async function getIncidentStats() {
  const { data: incidents } = await supabase
    .from('incidents')
    .select('status, category');

  if (!incidents) return { total: 0, byStatus: {}, byCategory: {} };

  const byStatus = incidents.reduce((acc, inc) => {
    acc[inc.status] = (acc[inc.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byCategory = incidents.reduce((acc, inc) => {
    acc[inc.category] = (acc[inc.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return { total: incidents.length, byStatus, byCategory };
}

// ─── Whistleblower Tips (anonim INSERT, authenticated SELECT) ────────────────

export async function submitWhistleblowerTip(input: SubmitTipInput): Promise<{ tracking_code: string }> {
  const { data, error } = await supabase
    .from('whistleblower_tips')
    .insert([{
      content: input.content,
      channel: input.channel ?? 'WEB',
      triage_category: input.triage_category ?? 'ETHICS_VIOLATION',
      status: 'NEW',
    }])
    .select('tracking_code')
    .single();

  if (error) throw error;
  return { tracking_code: data?.tracking_code ?? '' };
}

export async function fetchWhistleblowerTips(): Promise<WhistleblowerTip[]> {
  const { data, error } = await supabase
    .from('whistleblower_tips')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
