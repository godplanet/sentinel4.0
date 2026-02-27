import { supabase } from '@/shared/api/supabase';
import type { Incident, CreateIncidentInput } from '../model/types';

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
      reporter_id: input.is_anonymous ? null : input.reporter_id,
      status: 'NEW',
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

  return {
    total: incidents.length,
    byStatus,
    byCategory,
  };
}
