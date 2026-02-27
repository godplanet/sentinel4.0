import { supabase } from '@/shared/api/supabase';
import type { InvestigationCase, DigitalEvidence, EntityRelationship } from './types';

export async function fetchCases(): Promise<InvestigationCase[]> {
  const { data, error } = await supabase
    .from('investigation_cases')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as InvestigationCase[];
}

export async function fetchCaseDetail(caseId: string): Promise<{
  caseData: InvestigationCase;
  evidence: DigitalEvidence[];
  relationships: EntityRelationship[];
}> {
  const [caseRes, evidenceRes, relRes] = await Promise.all([
    supabase.from('investigation_cases').select('*').eq('id', caseId).maybeSingle(),
    supabase.from('digital_evidence').select('*').eq('case_id', caseId).order('created_at', { ascending: true }),
    supabase.from('entity_relationships').select('*').eq('case_id', caseId).order('confidence', { ascending: false }),
  ]);

  if (caseRes.error) throw caseRes.error;
  if (!caseRes.data) throw new Error('Case not found');

  return {
    caseData: caseRes.data as InvestigationCase,
    evidence: (evidenceRes.data || []) as DigitalEvidence[],
    relationships: (relRes.data || []) as EntityRelationship[],
  };
}

export async function createCaseFromTip(tipId: string, title: string, investigator: string): Promise<InvestigationCase> {
  const { data, error } = await supabase
    .from('investigation_cases')
    .insert({
      tip_id: tipId,
      title,
      lead_investigator: investigator,
      status: 'OPEN',
      priority: 'HIGH',
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Failed to create case');
  return data as InvestigationCase;
}
