/**
 * Iron Vault Sealing API — WORM (Write Once, Read Many) Mühürleme
 *
 * Gerekli DB kolonu (reports tablosu):
 *   ALTER TABLE reports ADD COLUMN IF NOT EXISTS hash_seal TEXT;
 *   ALTER TABLE reports ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
 *   -- status CHECK'e 'PUBLISHED' eklenmiş olmalı
 */

import { supabase } from '@/shared/api/supabase';
import { generateRecordHash, canonicalStringify } from '@/shared/lib/crypto';

export interface ReportSealRow {
  id: string;
  title: string;
  status: string;
  hash_seal: string | null;
  published_at: string | null;
  tiptap_content: Record<string, unknown> | null;
  snapshot_data: Record<string, unknown> | null;
}

/** Mühürlenecek raporun güncel içeriğini çeker. */
export async function fetchReportForSealing(reportId: string): Promise<ReportSealRow | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('id, title, status, hash_seal, published_at, tiptap_content, snapshot_data')
    .eq('id', reportId)
    .maybeSingle();

  if (error) throw error;
  return data as ReportSealRow | null;
}

/**
 * Raporun tüm içeriğini JSON canonical biçiminde hashler,
 * ardından reports tablosuna:
 *   status = 'PUBLISHED'
 *   hash_seal = <SHA-256 hex>
 *   published_at = NOW()
 * kaydını atar.
 *
 * Bu işlem tek yönlüdür — WORM garantisi Supabase RLS politikasıyla desteklenmelidir.
 */
export async function sealReport(report: ReportSealRow): Promise<string> {
  if (report.status === 'PUBLISHED') {
    throw new Error('Bu rapor zaten mühürlenmiş (PUBLISHED). WORM protokolü gereği yeniden mühürleme yasaktır.');
  }

  const contentForHash: Record<string, unknown> = {
    id: report.id,
    title: report.title,
    tiptap_content: report.tiptap_content ?? null,
    snapshot_data: report.snapshot_data ?? null,
  };

  const hash = await generateRecordHash(contentForHash);
  const sealedAt = new Date().toISOString();

  const { error } = await supabase
    .from('reports')
    .update({
      status: 'PUBLISHED',
      hash_seal: hash,
      published_at: sealedAt,
    })
    .eq('id', report.id);

  if (error) throw error;

  return hash;
}

/**
 * Mühür doğrulama — kaydedilen hash ile anlık içerik hash'i karşılaştırır.
 * Adli izlenebilirlik için kullanılır.
 */
export async function verifyReportSeal(report: ReportSealRow): Promise<boolean> {
  if (!report.hash_seal) return false;

  const contentForHash: Record<string, unknown> = {
    id: report.id,
    title: report.title,
    tiptap_content: report.tiptap_content ?? null,
    snapshot_data: report.snapshot_data ?? null,
  };

  const currentHash = await generateRecordHash(contentForHash);
  return currentHash === report.hash_seal;
}

/** CAE onayı bekleyen raporları getirir (mühürlenebilecek olanlar). */
export async function fetchReportsAwaitingPublish(): Promise<ReportSealRow[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('id, title, status, hash_seal, published_at, tiptap_content, snapshot_data')
    .eq('status', 'cae_review')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ReportSealRow[];
}

/** canonicalStringify'ı dışa açıyoruz — UI'daki önizleme için */
export { canonicalStringify };
