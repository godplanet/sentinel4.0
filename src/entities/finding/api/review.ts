import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';
import type { FindingSignoff } from '../model/types';

/**
 * ReviewNote, DB'deki finding_comments tablosunda AUDIT_MANAGER rolündeki
 * yorumlar üzerine haritalanır. Bu yaklaşım yeni bir tablo gerektirmez.
 */
export interface ReviewNote {
  id: string;
  finding_id: string;
  field_reference: string;
  note_text: string;
  reviewer_id: string;
  reviewer_name: string;
  status: 'OPEN' | 'CLEARED';
  resolution_text?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Bir bulgudaki tüm inceleme notlarını getirir.
 * finding_comments tablosundaki AUDIT_MANAGER yorumları ReviewNote'a dönüştürülür.
 * is_deleted=true → status='CLEARED' (çözüldü), is_deleted=false → status='OPEN'
 */
export async function fetchReviewNotes(findingId: string): Promise<ReviewNote[]> {
  const { data, error } = await supabase
    .from('finding_comments')
    .select('*')
    .eq('finding_id', findingId)
    .eq('author_role', 'AUDIT_MANAGER')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((c) => ({
    id: c.id,
    finding_id: c.finding_id,
    field_reference: 'Genel',
    note_text: c.comment_text,
    reviewer_id: c.author_id ?? '',
    reviewer_name: c.author_name ?? 'Yönetici',
    status: (c.is_deleted ? 'CLEARED' : 'OPEN') as 'OPEN' | 'CLEARED',
    created_at: c.created_at,
    updated_at: c.updated_at,
  }));
}

/**
 * Yönetici tarafından yeni inceleme notu ekler (AUDIT_MANAGER yorumu olarak).
 */
export async function addReviewNote(
  findingId: string,
  fieldReference: string,
  noteText: string,
  reviewerId: string,
  reviewerName: string
): Promise<ReviewNote> {
  const { data, error } = await supabase
    .from('finding_comments')
    .insert({
      tenant_id: ACTIVE_TENANT_ID,
      finding_id: findingId,
      comment_text: noteText,
      comment_type: 'CLARIFICATION',
      author_id: reviewerId,
      author_role: 'AUDIT_MANAGER',
      author_name: reviewerName,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    finding_id: data.finding_id,
    field_reference: fieldReference,
    note_text: data.comment_text,
    reviewer_id: data.author_id ?? '',
    reviewer_name: data.author_name ?? reviewerName,
    status: 'OPEN',
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Bir inceleme notunu çözüldü olarak işaretler (soft delete).
 */
export async function resolveReviewNote(commentId: string): Promise<void> {
  const { error } = await supabase
    .from('finding_comments')
    .update({ is_deleted: true })
    .eq('id', commentId);

  if (error) throw error;
}

/**
 * Bulgudaki onay zincirini (PREPARER, REVIEWER) finding_signoffs tablosundan getirir.
 * DB'de kayıt varsa status='SIGNED', yoksa sentetik 'PENDING' nesnesi döner.
 */
export async function fetchFindingSignoffs(findingId: string): Promise<FindingSignoff[]> {
  const { data, error } = await supabase
    .from('finding_signoffs')
    .select('*')
    .eq('finding_id', findingId);

  if (error) throw error;

  const existing = data ?? [];
  const roles = ['PREPARER', 'REVIEWER'] as const;

  return roles.map((role) => {
    const record = existing.find((s) => s.role === role);
    if (record) {
      return {
        id: record.id,
        finding_id: record.finding_id,
        role: record.role as typeof role,
        user_id: record.user_id,
        user_name: record.user_name,
        status: 'SIGNED' as const,
        signed_at: record.signed_at,
      };
    }
    return {
      id: `pending-${role}`,
      finding_id: findingId,
      role,
      user_id: '',
      user_name: '',
      status: 'PENDING' as const,
    };
  });
}

/**
 * Müfettiş veya yönetici bulgusunu imzalar / onaylar.
 * UNIQUE(finding_id, role) kısıtı sayesinde upsert güvenlidir.
 */
export async function signFinding(
  findingId: string,
  role: 'PREPARER' | 'REVIEWER' | 'APPROVER',
  userId: string,
  userName: string,
  userTitle?: string
): Promise<void> {
  const { error } = await supabase.from('finding_signoffs').upsert(
    {
      finding_id: findingId,
      tenant_id: ACTIVE_TENANT_ID,
      role,
      user_id: userId,
      user_name: userName,
      user_title: userTitle ?? '',
      signed_at: new Date().toISOString(),
    },
    { onConflict: 'finding_id,role' }
  );

  if (error) throw error;
}
