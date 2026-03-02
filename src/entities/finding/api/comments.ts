import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';
import type { FindingComment } from '../model/types';

export interface AddCommentInput {
  finding_id: string;
  comment_text: string;
  comment_type?: 'DISCUSSION' | 'AGREEMENT' | 'DISPUTE' | 'CLARIFICATION';
  author_id: string;
  author_role: 'AUDITOR' | 'AUDITEE' | 'AUDIT_MANAGER';
  author_name?: string;
  parent_comment_id?: string;
}

/**
 * Bir bulgudaki tüm aktif (silinmemiş) yorumları finding_comments tablosundan çeker.
 * Müzakere Odası (ChatPanel) tarafından kullanılır.
 */
export async function fetchFindingComments(findingId: string): Promise<FindingComment[]> {
  const { data, error } = await supabase
    .from('finding_comments')
    .select('*')
    .eq('finding_id', findingId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Bir bulgudaki müzakere odasına yeni yorum ekler.
 */
export async function addFindingComment(input: AddCommentInput): Promise<FindingComment> {
  const { data, error } = await supabase
    .from('finding_comments')
    .insert({
      tenant_id: ACTIVE_TENANT_ID,
      finding_id: input.finding_id,
      comment_text: input.comment_text,
      comment_type: input.comment_type ?? 'DISCUSSION',
      author_id: input.author_id,
      author_role: input.author_role,
      author_name: input.author_name ?? '',
      parent_comment_id: input.parent_comment_id ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
