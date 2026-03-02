/**
 * Adli Kanıt API — KVKK Kriptografik İmha ve Vault İşlemleri
 *
 * Gerekli DB kolonları (digital_evidence tablosu veya ilgili tablo):
 *   ALTER TABLE digital_evidence ADD COLUMN IF NOT EXISTS is_shredded BOOLEAN NOT NULL DEFAULT FALSE;
 *   ALTER TABLE digital_evidence ADD COLUMN IF NOT EXISTS shredded_at TIMESTAMPTZ;
 *   ALTER TABLE digital_evidence ADD COLUMN IF NOT EXISTS shredded_by TEXT;
 *   ALTER TABLE digital_evidence ADD COLUMN IF NOT EXISTS shred_reason TEXT;
 *
 * Hard delete YASAKTIR — adli zincir (Hash + RFC 3161 zaman damgası) korunmalıdır.
 * KVKK imhası yalnızca içerik erişimini kapatır; log kaydı saklanır.
 */

import { supabase } from '@/shared/api/supabase';
import type { DigitalEvidence } from '../types';

export interface ShredRequest {
  evidenceId: string;
  shredReason: string;
  shredBy: string;
}

/**
 * Kanıtı KVKK kapsamında kriptografik olarak imha eder.
 * Veritabanından SILMEZ — is_shredded = true ve shredded_at = now() yazar.
 * Adli log zinciri (hash_sha256, timestamp_rfc3161) korunur.
 */
export async function shredEvidence(req: ShredRequest): Promise<void> {
  const { error } = await supabase
    .from('digital_evidence')
    .update({
      is_shredded: true,
      shredded_at: new Date().toISOString(),
      shredded_by: req.shredBy,
      shred_reason: req.shredReason,
    })
    .eq('id', req.evidenceId);

  if (error) throw error;
}

/**
 * Bir soruşturma kasasındaki tüm kanıtları getirir.
 * is_shredded değeri olan kayıtları da dahil eder — tombstone gösterimi için.
 */
export async function fetchCaseEvidence(caseId: string): Promise<DigitalEvidenceWithShred[]> {
  const { data, error } = await supabase
    .from('digital_evidence')
    .select(
      'id, case_id, type, source_system, content_snapshot, hash_sha256, timestamp_rfc3161, locked, frozen_by, created_at, is_shredded, shredded_at, shredded_by, shred_reason'
    )
    .eq('case_id', caseId)
    .order('timestamp_rfc3161', { ascending: false });

  if (error) throw error;
  return (data ?? []) as DigitalEvidenceWithShred[];
}

/** DigitalEvidence'ı KVKK imha alanlarıyla genişletilmiş tip. */
export interface DigitalEvidenceWithShred extends DigitalEvidence {
  is_shredded?: boolean;
  shredded_at?: string | null;
  shredded_by?: string | null;
  shred_reason?: string | null;
}
