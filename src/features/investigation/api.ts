import { supabase } from '@/shared/api/supabase';
import type { WhistleblowerTip, TipAnalysis, TipSubmission, TipStatus } from './types';
import { analyzeTip, getAutoAssignment } from './TriageEngine';

export async function submitTip(submission: TipSubmission): Promise<{ trackingCode: string }> {
  const analysis = analyzeTip(submission.content);

  const autoUnit = getAutoAssignment(analysis.total, analysis.category);

  const { data: tip, error: tipError } = await supabase
    .from('whistleblower_tips')
    .insert({
      content: submission.content,
      channel: submission.channel,
      attachments_url: submission.attachments_url || null,
      ai_credibility_score: analysis.total,
      triage_category: analysis.category,
      status: analysis.total > 80 ? 'INVESTIGATING' : 'NEW',
      assigned_unit: autoUnit,
    })
    .select('tracking_code')
    .maybeSingle();

  if (tipError) throw tipError;
  if (!tip) throw new Error('Failed to create tip');

  return { trackingCode: tip.tracking_code };
}

export async function fetchTips(): Promise<WhistleblowerTip[]> {
  const { data, error } = await supabase
    .from('whistleblower_tips')
    .select('*')
    .order('ai_credibility_score', { ascending: false });

  if (error) throw error;
  return (data || []) as WhistleblowerTip[];
}

export async function fetchTipWithAnalysis(tipId: string): Promise<{
  tip: WhistleblowerTip;
  analysis: TipAnalysis | null;
}> {
  const [tipRes, analysisRes] = await Promise.all([
    supabase.from('whistleblower_tips').select('*').eq('id', tipId).maybeSingle(),
    supabase.from('tip_analysis').select('*').eq('tip_id', tipId).maybeSingle(),
  ]);

  if (tipRes.error) throw tipRes.error;
  if (!tipRes.data) throw new Error('Tip not found');

  return {
    tip: tipRes.data as WhistleblowerTip,
    analysis: analysisRes.data as TipAnalysis | null,
  };
}

export async function updateTipStatus(tipId: string, status: TipStatus, notes?: string): Promise<void> {
  const update: Record<string, unknown> = { status };
  if (notes) update.reviewer_notes = notes;

  const { error } = await supabase
    .from('whistleblower_tips')
    .update(update)
    .eq('id', tipId);

  if (error) throw error;
}

export async function lookupTipByCode(trackingCode: string): Promise<WhistleblowerTip | null> {
  const { data, error } = await supabase
    .from('whistleblower_tips')
    .select('id, tracking_code, status, triage_category, submitted_at, ai_credibility_score')
    .eq('tracking_code', trackingCode)
    .maybeSingle();

  if (error) throw error;
  return data as WhistleblowerTip | null;
}
