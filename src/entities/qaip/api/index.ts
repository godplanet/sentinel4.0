import { supabase } from '@/shared/api/supabase';
import type { QAIPChecklist, QAIPReview, CreateQAIPChecklistInput, CreateQAIPReviewInput, QAIPReviewV2, CreateQAIPReviewV2Input, QAIPStats } from '../model/types';

export async function fetchQAIPChecklists(): Promise<QAIPChecklist[]> {
  const { data, error } = await supabase
    .from('qaip_checklists')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchQAIPChecklist(id: string): Promise<QAIPChecklist | null> {
  const { data, error } = await supabase
    .from('qaip_checklists')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createQAIPChecklist(input: CreateQAIPChecklistInput): Promise<QAIPChecklist> {
  const { data, error } = await supabase
    .from('qaip_checklists')
    .insert([{
      title: input.title,
      description: input.description || null,
      criteria: input.criteria,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateQAIPChecklist(id: string, updates: Partial<QAIPChecklist>): Promise<QAIPChecklist> {
  const { data, error } = await supabase
    .from('qaip_checklists')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteQAIPChecklist(id: string): Promise<void> {
  const { error } = await supabase
    .from('qaip_checklists')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function fetchQAIPReviews(filters?: { engagement_id?: string; status?: string }): Promise<QAIPReview[]> {
  let query = supabase.from('qaip_reviews').select('*');

  if (filters?.engagement_id) {
    query = query.eq('engagement_id', filters.engagement_id);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchQAIPReview(id: string): Promise<QAIPReview | null> {
  const { data, error } = await supabase
    .from('qaip_reviews')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createQAIPReview(input: CreateQAIPReviewInput): Promise<QAIPReview> {
  const checklist = await fetchQAIPChecklist(input.checklist_id);
  const totalScore = calculateQAIPScore(input.results, checklist?.criteria || []);

  const { data, error } = await supabase
    .from('qaip_reviews')
    .insert([{
      engagement_id: input.engagement_id || null,
      checklist_id: input.checklist_id,
      results: input.results,
      total_score: totalScore,
      notes: input.notes || null,
      status: 'COMPLETED',
      completed_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateQAIPReview(id: string, updates: Partial<QAIPReview>): Promise<QAIPReview> {
  const { data, error } = await supabase
    .from('qaip_reviews')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

function calculateQAIPScore(results: Record<string, string>, criteria: any[]): number {
  let totalScore = 0;
  let totalWeight = 0;

  criteria.forEach((criterion) => {
    const result = results[criterion.id];
    if (result === 'PASS') {
      totalScore += criterion.weight;
    }
    totalWeight += criterion.weight;
  });

  return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;
}

export async function fetchQAIPReviewsV2(filters?: { target_audit_id?: string; review_type?: 'COLD' | 'HOT' }): Promise<QAIPReviewV2[]> {
  let query = supabase.from('qaip_reviews').select('*');

  if (filters?.target_audit_id) {
    query = query.eq('target_audit_id', filters.target_audit_id);
  }
  if (filters?.review_type) {
    query = query.eq('review_type', filters.review_type);
  }

  const { data, error } = await query.order('review_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createQAIPReviewV2(input: CreateQAIPReviewV2Input): Promise<QAIPReviewV2> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('qaip_reviews')
    .insert([{
      target_audit_id: input.target_audit_id,
      review_type: input.review_type,
      compliance_score: input.compliance_score,
      findings_json: input.findings_json || [],
      reviewer_id: user.id,
      status: 'DRAFT',
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateQAIPReviewV2(id: string, updates: Partial<QAIPReviewV2>): Promise<QAIPReviewV2> {
  const { data, error } = await supabase
    .from('qaip_reviews')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getQAIPStats(): Promise<QAIPStats> {
  const { data, error } = await supabase
    .from('qaip_reviews')
    .select('*')
    .order('review_date', { ascending: false });

  if (error) throw error;

  const reviews = data || [];
  const total_reviews = reviews.length;
  const avg_compliance_score = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.compliance_score, 0) / reviews.length
    : 0;
  const cold_reviews = reviews.filter((r) => r.review_type === 'COLD').length;
  const hot_reviews = reviews.filter((r) => r.review_type === 'HOT').length;

  return {
    total_reviews,
    avg_compliance_score: Math.round(avg_compliance_score),
    cold_reviews,
    hot_reviews,
    recent_reviews: reviews.slice(0, 5),
  };
}
