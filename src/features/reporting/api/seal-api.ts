/**
 * Nihai Rapor Mühürleme API — WORM (Write Once, Read Many).
 * reports tablosu: status, published_at, locked_at, hash_seal (opsiyonel).
 * Mock kullanılmaz; tüm işlemler Supabase üzerinden.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
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
 * Raporu kilitler: status = 'published', published_at ve locked_at damgası.
 * Hash varsa SHA-256 ile mühürlenir; yoksa sadece status güncellenir.
 */
export async function sealReport(report: ReportSealRow): Promise<string> {
  const published = report.status === 'published';
  if (published && report.hash_seal) {
    throw new Error('Bu rapor zaten mühürlenmiş. WORM protokolü gereği yeniden mühürleme yasaktır.');
  }

  const sealedAt = new Date().toISOString();
  const contentForHash: Record<string, unknown> = {
    id: report.id,
    title: report.title,
    tiptap_content: report.tiptap_content ?? null,
    snapshot_data: report.snapshot_data ?? null,
  };

  let hash: string | null = null;
  try {
    hash = await generateRecordHash(contentForHash);
  } catch {
    hash = null;
  }

  const { data: user } = (await supabase.auth.getUser()).data;
  const updatePayload: Record<string, unknown> = {
    status: 'published',
    published_at: sealedAt,
    locked_at: sealedAt,
    ...(user?.id && { published_by: user.id }),
    ...(user?.id && { locked_by: user.id }),
    updated_at: sealedAt,
  };
  if (hash != null) {
    updatePayload.hash_seal = hash;
  }

  const { error } = await supabase
    .from('reports')
    .update(updatePayload)
    .eq('id', report.id);

  if (error) throw error;

  return hash ?? sealedAt;
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

/** Onay/review aşamasındaki raporları getirir (mühürlenebilecek adaylar). */
export async function fetchReportsAwaitingPublish(): Promise<ReportSealRow[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('id, title, status, hash_seal, published_at, tiptap_content, snapshot_data')
    .in('status', ['review', 'draft'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ReportSealRow[];
}

/** useSealReport — Nihai mühürleme için React Query mutasyonu. */
export function useSealReport(reportId: string | null, options?: { onSuccess?: () => void; onError?: (err: Error) => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!reportId) throw new Error('Rapor ID gerekli.');
      const report = await fetchReportForSealing(reportId);
      if (!report) throw new Error('Rapor bulunamadı.');
      return sealReport(report);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['report-for-seal', reportId] });
      void queryClient.invalidateQueries({ queryKey: ['reports-awaiting-publish'] });
      void queryClient.invalidateQueries({ queryKey: ['reports'] });
      void queryClient.invalidateQueries({ queryKey: ['report', reportId] });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
}

/** canonicalStringify'ı dışa açıyoruz — UI'daki önizleme için */
export { canonicalStringify };

// ─── Wave 40: Snapshot ve Kriptografik İmza Kancaları ──────────────────────

import { useQuery as _useQuery, useMutation as _useMutation, useQueryClient as _useQueryClient } from '@tanstack/react-query';

// ─── Snapshot Tipi ────────────────────────────────────────────────────────────

export interface ReportSnapshot {
  id: string;
  report_id: string;
  snapshot_at: string;
  snapshot_by: string | null;
  title: string;
  status_at_seal: string;
  hash_sha256: string | null;
  is_verified: boolean;
  metadata: Record<string, unknown>;
}

// ─── Kriptografik İmza Tipi ───────────────────────────────────────────────────

export interface CryptographicSignature {
  id: string;
  report_id: string;
  snapshot_id: string | null;
  signer_name: string;
  signer_role: string;
  signer_email: string | null;
  signature_type: 'APPROVAL' | 'DISSENT' | 'REJECTION' | 'SEAL';
  signed_at: string;
  signature_hash: string | null;
  dissent_comment: string | null;
  order_index: number;
}

// ─── Hook: useReportSnapshots ─────────────────────────────────────────────────

export function useReportSnapshots(reportId?: string | null) {
  return _useQuery<ReportSnapshot[]>({
    queryKey: ['report-snapshots', reportId],
    enabled: !!reportId,
    queryFn: async () => {
      if (!reportId) return [];
      const { data, error } = await supabase
        .from('report_snapshots')
        .select('*')
        .eq('report_id', reportId)
        .order('snapshot_at', { ascending: false });
      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }
      return (data ?? []) as ReportSnapshot[];
    },
    staleTime: 1000 * 60 * 10, // Snapshot'lar immutable — uzun cache
  });
}

// ─── Hook: useVerifySeal ──────────────────────────────────────────────────────

export function useVerifySeal(reportId?: string | null) {
  return _useQuery<{
    isSealed: boolean;
    isVerified: boolean;
    hash: string | null;
    sealedAt: string | null;
    snapshotCount: number;
  }>({
    queryKey: ['verify-seal', reportId],
    enabled: !!reportId,
    queryFn: async () => {
      if (!reportId) return { isSealed: false, isVerified: false, hash: null, sealedAt: null, snapshotCount: 0 };

      const { data, error } = await supabase
        .from('report_snapshots')
        .select('hash_sha256, snapshot_at, is_verified')
        .eq('report_id', reportId)
        .order('snapshot_at', { ascending: false })
        .limit(1);

      if (error) {
        if (error.code === '42P01') return { isSealed: false, isVerified: false, hash: null, sealedAt: null, snapshotCount: 0 };
        throw error;
      }

      const latest = (data ?? [])[0];
      if (!latest) return { isSealed: false, isVerified: false, hash: null, sealedAt: null, snapshotCount: 0 };

      const { count } = await supabase
        .from('report_snapshots')
        .select('id', { count: 'exact', head: true })
        .eq('report_id', reportId);

      return {
        isSealed: true,
        isVerified: latest.is_verified ?? !!latest.hash_sha256,
        hash: latest.hash_sha256,
        sealedAt: latest.snapshot_at,
        snapshotCount: count ?? 0,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Hook: useSaveSnapshot ────────────────────────────────────────────────────

/**
 * Mühürleme sonrası snapshot'ı report_snapshots tablosuna kaydeder.
 * Çağrı: sealReport() başarıyla döndükten sonra.
 */
export function useSaveSnapshot() {
  const qc = _useQueryClient();
  return _useMutation({
    mutationFn: async (input: {
      report_id: string;
      title: string;
      content_json: Record<string, unknown>;
      hash_sha256: string | null;
      snapshot_by?: string | null;
      metadata?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase
        .from('report_snapshots')
        .insert({
          report_id:       input.report_id,
          title:           input.title,
          content_json:    input.content_json,
          hash_sha256:     input.hash_sha256 ?? null,
          snapshot_by:     input.snapshot_by ?? null,
          status_at_seal:  'published',
          metadata:        input.metadata ?? {},
        })
        .select()
        .single();

      if (error) throw error;
      return data as ReportSnapshot;
    },
    onSuccess: (_, vars) => {
      void qc.invalidateQueries({ queryKey: ['report-snapshots', vars.report_id] });
      void qc.invalidateQueries({ queryKey: ['verify-seal', vars.report_id] });
    },
  });
}

// ─── Hook: useCryptographicSignatures ─────────────────────────────────────────

export function useCryptographicSignatures(reportId?: string | null) {
  return _useQuery<CryptographicSignature[]>({
    queryKey: ['crypto-signatures', reportId],
    enabled: !!reportId,
    queryFn: async () => {
      if (!reportId) return [];
      const { data, error } = await supabase
        .from('cryptographic_signatures')
        .select('*')
        .eq('report_id', reportId)
        .order('order_index', { ascending: true });
      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }
      return (data ?? []) as CryptographicSignature[];
    },
  });
}
