import { supabase } from '@/shared/api/supabase';
import type {
  GovernanceDoc,
  AuditorDeclaration,
  CreateGovernanceDocInput,
  CreateDeclarationInput,
  GovernanceStats,
  BoardMember,
  Stakeholder
} from '../model/types';

export async function fetchGovernanceDocs(filters?: { doc_type?: string; approval_status?: string }): Promise<GovernanceDoc[]> {
  let query = supabase.from('governance_docs').select('*');

  if (filters?.doc_type) {
    query = query.eq('doc_type', filters.doc_type);
  }
  if (filters?.approval_status) {
    query = query.eq('approval_status', filters.approval_status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchGovernanceDoc(id: string): Promise<GovernanceDoc | null> {
  const { data, error } = await supabase
    .from('governance_docs')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createGovernanceDoc(input: CreateGovernanceDocInput): Promise<GovernanceDoc> {
  const { data, error } = await supabase
    .from('governance_docs')
    .insert([{
      doc_type: input.doc_type,
      title: input.title,
      version: input.version || null,
      content_url: input.content_url || null,
      approval_status: input.approval_status || 'DRAFT',
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateGovernanceDoc(id: string, updates: Partial<GovernanceDoc>): Promise<GovernanceDoc> {
  const { data, error } = await supabase
    .from('governance_docs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function approveGovernanceDoc(id: string): Promise<GovernanceDoc> {
  return updateGovernanceDoc(id, {
    approval_status: 'APPROVED',
    approved_at: new Date().toISOString(),
  });
}

export async function deleteGovernanceDoc(id: string): Promise<void> {
  const { error } = await supabase
    .from('governance_docs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function fetchAuditorDeclarations(filters?: { user_id?: string; period_year?: number; declaration_type?: string }): Promise<AuditorDeclaration[]> {
  let query = supabase.from('auditor_declarations').select('*');

  if (filters?.user_id) {
    query = query.eq('user_id', filters.user_id);
  }
  if (filters?.period_year) {
    query = query.eq('period_year', filters.period_year);
  }
  if (filters?.declaration_type) {
    query = query.eq('declaration_type', filters.declaration_type);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createAuditorDeclaration(input: Omit<CreateDeclarationInput, 'user_id'> & { user_id?: string }): Promise<AuditorDeclaration> {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = input.user_id || user?.id || 'demo-user';
  const signatureHash = generateSignatureHash(userId, input.period_year);

  const { data, error } = await supabase
    .from('auditor_declarations')
    .insert([{
      user_id: userId,
      declaration_type: input.declaration_type,
      period_year: input.period_year,
      content: input.content || null,
      signature_hash: signatureHash,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAuditorDeclaration(id: string, updates: Partial<AuditorDeclaration>): Promise<AuditorDeclaration> {
  const { data, error } = await supabase
    .from('auditor_declarations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getGovernanceStats(): Promise<GovernanceStats> {
  const { data: docs } = await supabase
    .from('governance_docs')
    .select('approval_status');

  const currentYear = new Date().getFullYear();
  const { data: declarations } = await supabase
    .from('auditor_declarations')
    .select('period_year')
    .eq('period_year', currentYear);

  const { data: allProfiles } = await supabase
    .from('auditor_profiles')
    .select('user_id');

  const totalDocs = docs?.length || 0;
  const approvedDocs = docs?.filter(d => d.approval_status === 'APPROVED').length || 0;
  const declarationsThisYear = declarations?.length || 0;
  const totalAuditors = allProfiles?.length || 0;
  const complianceRate = totalAuditors > 0 ? (declarationsThisYear / totalAuditors) * 100 : 0;

  return {
    total_docs: totalDocs,
    approved_docs: approvedDocs,
    declarations_this_year: declarationsThisYear,
    compliance_rate: Math.round(complianceRate),
  };
}

function generateSignatureHash(userId: string, year: number): string {
  const input = `${userId}-${year}-${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(12, '0').slice(0, 12);
}

export async function fetchBoardMembers(): Promise<BoardMember[]> {
  const { data, error } = await supabase
    .from('board_members')
    .select('*')
    .order('appointment_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchStakeholders(filters?: { type?: string; influence_level?: string }): Promise<Stakeholder[]> {
  let query = supabase.from('stakeholders').select('*');

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.influence_level) {
    query = query.eq('influence_level', filters.influence_level);
  }

  const { data, error } = await query.order('last_engagement_date', { ascending: false });

  if (error) throw error;
  return data || [];
}
