import { supabase } from '@/shared/api/supabase';
import type { Policy, PolicyAttestation, CreatePolicyInput, PolicyWithAttestation } from '../model/types';

export async function fetchPolicies(): Promise<Policy[]> {
  const { data, error } = await supabase
    .from('policies')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchPolicy(id: string): Promise<Policy | null> {
  const { data, error } = await supabase
    .from('policies')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createPolicy(input: CreatePolicyInput): Promise<Policy> {
  const { data, error } = await supabase
    .from('policies')
    .insert([{
      title: input.title,
      content_url: input.content_url || null,
      version: input.version || '1.0',
      is_active: input.is_active ?? true,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePolicy(id: string, updates: Partial<Policy>): Promise<Policy> {
  const { data, error } = await supabase
    .from('policies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePolicy(id: string): Promise<void> {
  const { error } = await supabase
    .from('policies')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function fetchUserAttestations(userId: string): Promise<PolicyAttestation[]> {
  const { data, error } = await supabase
    .from('policy_attestations')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
}

export async function createAttestation(policyId: string, userId: string): Promise<PolicyAttestation> {
  const { data, error } = await supabase
    .from('policy_attestations')
    .insert([{
      policy_id: policyId,
      user_id: userId,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchPoliciesWithAttestations(userId: string): Promise<PolicyWithAttestation[]> {
  const policies = await fetchPolicies();
  const attestations = await fetchUserAttestations(userId);

  const attestationMap = new Map(
    attestations.map(att => [att.policy_id, att])
  );

  return policies.map(policy => ({
    ...policy,
    attestation: attestationMap.get(policy.id),
    is_attested: attestationMap.has(policy.id),
  }));
}

export async function getPolicyStats() {
  const { data: policies } = await supabase
    .from('policies')
    .select('is_active');

  const { data: attestations } = await supabase
    .from('policy_attestations')
    .select('policy_id');

  if (!policies) return { total: 0, active: 0, attestations: 0 };

  return {
    total: policies.length,
    active: policies.filter(p => p.is_active).length,
    attestations: attestations?.length || 0,
  };
}
