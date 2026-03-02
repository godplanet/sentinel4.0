/**
 * Gizli Soruşturma Dört Göz İlkesi API — GIAS Multi-Signature
 *
 * DB Gereksinimleri (investigation_cases tablosuna eklenecek):
 *
 *   ALTER TABLE investigation_cases
 *     ADD COLUMN IF NOT EXISTS cae_approved_at    TIMESTAMPTZ,
 *     ADD COLUMN IF NOT EXISTS cae_approved_by    TEXT,
 *     ADD COLUMN IF NOT EXISTS legal_approved_at  TIMESTAMPTZ,
 *     ADD COLUMN IF NOT EXISTS legal_approved_by  TEXT,
 *     ADD COLUMN IF NOT EXISTS is_stealth_mode    BOOLEAN DEFAULT FALSE,
 *     ADD COLUMN IF NOT EXISTS worm_sealed_at     TIMESTAMPTZ,
 *     ADD COLUMN IF NOT EXISTS worm_hash          TEXT;
 *
 *   Status akışı:
 *     OPEN → (CAE onayı) → PENDING_LEGAL → (Legal onayı) → SEALED
 */

import { supabase } from '@/shared/api/supabase';

export interface CaseApprovalStatus {
  id: string;
  status: string;
  is_stealth_mode: boolean;
  cae_approved_at: string | null;
  cae_approved_by: string | null;
  legal_approved_at: string | null;
  legal_approved_by: string | null;
  worm_sealed_at: string | null;
  worm_hash: string | null;
}

/** Dava onay durumunu veritabanından çeker */
export async function fetchCaseApprovalStatus(caseId: string): Promise<CaseApprovalStatus | null> {
  const { data, error } = await supabase
    .from('investigation_cases')
    .select(
      'id, status, is_stealth_mode, cae_approved_at, cae_approved_by, legal_approved_at, legal_approved_by, worm_sealed_at, worm_hash',
    )
    .eq('id', caseId)
    .maybeSingle();

  if (error) throw error;
  return data as CaseApprovalStatus | null;
}

/**
 * CAE onayını veritabanına yazar.
 * Status → PENDING_LEGAL geçer. Legal onayı beklenir.
 */
export async function approveByCae(caseId: string, approverName: string): Promise<void> {
  const { error } = await supabase
    .from('investigation_cases')
    .update({
      cae_approved_at: new Date().toISOString(),
      cae_approved_by: approverName,
      status: 'PENDING_LEGAL',
    })
    .eq('id', caseId);

  if (error) throw error;
}

/**
 * Baş Hukuk Müşaviri onayını yazar.
 * Her iki onay tamamlandığında rapor WORM ile mühürlenir.
 * SHA-256 hash, rapor verisinin JSON string'inden browser crypto.subtle ile üretilir.
 */
export async function approveByLegal(
  caseId: string,
  approverName: string,
  reportPayload: string,
): Promise<{ hash: string }> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(reportPayload));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const wormHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  const { error } = await supabase
    .from('investigation_cases')
    .update({
      legal_approved_at: new Date().toISOString(),
      legal_approved_by: approverName,
      status: 'SEALED',
      worm_sealed_at: new Date().toISOString(),
      worm_hash: wormHash,
    })
    .eq('id', caseId);

  if (error) throw error;
  return { hash: wormHash };
}
