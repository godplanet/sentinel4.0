/**
 * SENTINEL GRC v3.0 — Forensic Evidence Vault: Supabase API Katmanı
 * ==================================================================
 * GIAS 2025 Standard 14.3 — Soruşturma Kanıt Yönetimi
 *
 * Bu katman entities/investigation/api/ altında yer alır (FSD mimarisi).
 * Tablolar:
 *   - digital_evidence (hash_sha256, locked, frozen_by)
 *   - Supabase Storage bucket: 'evidence-vault'
 *
 * Forensic Vault prensibi:
 *   - Yükleme: Dosya Storage'a gider → SHA-256 hash hesaplanır → digital_evidence'a yazılır
 *   - Görüntüleme: "Değiştirilemez (Immutable)" rozeti gösterilir (locked=true)
 *   - Silme: Yasak — yalnızca "FROZEN" statü
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import toast from 'react-hot-toast';

// ─── Tür Tanımları ─────────────────────────────────────────────────────────────

export type EvidenceType = 'EMAIL' | 'CHAT' | 'LOG' | 'INVOICE' | 'FILE' | 'SCREENSHOT';

export interface DigitalEvidence {
  id: string;
  case_id: string;
  type: EvidenceType;
  source_system: string;
  content_snapshot: Record<string, unknown>;
  hash_sha256: string;
  timestamp_rfc3161: string;
  locked: boolean;
  frozen_by: string | null;
  created_at: string;
  // Storage alanı (view join ile)
  storage_path?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  mime_type?: string | null;
  uploaded_by?: string | null;
}

export interface UploadEvidenceInput {
  case_id: string;
  file: File;
  evidence_type?: EvidenceType;
  source_system?: string;
  uploaded_by?: string;
}

export interface UploadEvidenceResult {
  evidence: DigitalEvidence;
  storage_path: string;
  public_url: string;
}

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const EVIDENCE_KEYS = {
  list: (caseId: string) => ['evidence', caseId] as const,
  item: (id: string) => ['evidence-item', id] as const,
};

// ─── SHA-256 Hash Hesaplama ───────────────────────────────────────────────────

export async function computeFileSha256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ─── Kanıt Listesi Sorgulama ──────────────────────────────────────────────────

export async function fetchCaseEvidence(caseId: string): Promise<DigitalEvidence[]> {
  if (!caseId?.trim()) return [];

  const { data, error } = await supabase
    .from('digital_evidence')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[SENTINEL][Evidence] Kanıt listesi sorgusu başarısız:', error);
    throw error;
  }

  return (data ?? []) as DigitalEvidence[];
}

export function useCaseEvidence(caseId: string | null) {
  return useQuery({
    queryKey: EVIDENCE_KEYS.list(caseId ?? ''),
    enabled: !!caseId,
    queryFn: () => fetchCaseEvidence(caseId!),
    staleTime: 30_000,
  });
}

// ─── Forensic Vault: Dosya Yükleme + Hash Kaydı ──────────────────────────────
// Adım 1: SHA-256 hash hesapla
// Adım 2: Supabase Storage'a yükle
// Adım 3: digital_evidence tablosuna yaz (atomik)

export async function uploadEvidence(input: UploadEvidenceInput): Promise<UploadEvidenceResult> {
  const { case_id, file, evidence_type = 'FILE', source_system = 'UPLOAD', uploaded_by = '' } = input;

  // ── 1. SHA-256 Hash ──────────────────────────────────────────────────────
  const hash_sha256 = await computeFileSha256(file);

  // ── 2. Storage Bucket Yükleme ────────────────────────────────────────────
  const timestamp = Date.now();
  const safeFileName = file?.name?.replace(/[^a-zA-Z0-9._-]/g, '_') ?? `evidence_${timestamp}`;
  const storagePath = `${case_id}/${timestamp}_${safeFileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('evidence-vault')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false, // Immutable — üzerine yazma yasak
      contentType: file?.type ?? 'application/octet-stream',
    });

  if (uploadError) {
    console.error('[SENTINEL][Evidence] Storage yükleme hatası:', uploadError);
    throw uploadError;
  }

  const storage_path = uploadData?.path ?? storagePath;

  // Public URL al
  const { data: urlData } = supabase.storage.from('evidence-vault').getPublicUrl(storage_path);
  const public_url = urlData?.publicUrl ?? '';

  // ── 3. digital_evidence Kaydı ────────────────────────────────────────────
  const rfc3161_timestamp = new Date().toISOString();
  const { data: evidenceRow, error: dbError } = await supabase
    .from('digital_evidence')
    .insert({
      case_id,
      type: evidence_type,
      source_system,
      content_snapshot: {
        file_name: file?.name ?? '',
        file_size: file?.size ?? 0,
        mime_type: file?.type ?? '',
        storage_path,
        public_url,
        uploaded_by: uploaded_by ?? '',
        sha256: hash_sha256,
      },
      hash_sha256,
      timestamp_rfc3161: rfc3161_timestamp,
      locked: true,         // Forensic: yükleme anında kilitlenir
      frozen_by: uploaded_by ?? 'system',
    })
    .select()
    .single();

  if (dbError) {
    console.error('[SENTINEL][Evidence] Kanıt kaydı DB hatası:', dbError);
    // Storage'a yüklendi ama DB yazmadı — Storage'dan geri al
    await supabase.storage.from('evidence-vault').remove([storage_path]).catch(() => {});
    throw dbError;
  }

  return {
    evidence: evidenceRow as DigitalEvidence,
    storage_path,
    public_url,
  };
}

export function useUploadEvidence(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UploadEvidenceInput) => uploadEvidence(input),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: EVIDENCE_KEYS.list(caseId) });
      toast.success(
        `Kanıt yüklendi ve mühürlendi: SHA-256 ${result?.evidence?.hash_sha256?.slice(0, 12) ?? ''}...`,
        {
          icon: '🔒',
          duration: 5000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155',
            maxWidth: '400px',
          },
        }
      );
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      console.error('[SENTINEL][Evidence] Yükleme mutation hatası:', err);
      toast.error(`Kanıt yüklenemedi: ${msg}`, {
        style: { background: '#7f1d1d', color: '#fef2f2', border: '1px solid #991b1b' },
      });
    },
  });
}

// ─── Kanıt Dondurma (Freeze) ──────────────────────────────────────────────────

export async function freezeEvidence(evidenceId: string, frozenBy: string): Promise<void> {
  const { error } = await supabase
    .from('digital_evidence')
    .update({ locked: true, frozen_by: frozenBy })
    .eq('id', evidenceId)
    .eq('locked', false); // Zaten kilitliyse no-op

  if (error) {
    console.error('[SENTINEL][Evidence] Dondurma hatası:', error);
    throw error;
  }
}

export function useFreezeEvidence(caseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ evidenceId, frozenBy }: { evidenceId: string; frozenBy: string }) =>
      freezeEvidence(evidenceId, frozenBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVIDENCE_KEYS.list(caseId) });
      toast.success('Kanıt adli protokol kapsamında donduruldu 🔐');
    },
    onError: (err) => {
      toast.error(`Dondurma başarısız: ${err instanceof Error ? err.message : 'Hata'}`);
    },
  });
}

// ─── Storage URL ──────────────────────────────────────────────────────────────

export function getEvidencePublicUrl(storagePath: string | null | undefined): string | null {
  if (!storagePath) return null;
  const { data } = supabase.storage.from('evidence-vault').getPublicUrl(storagePath);
  return data?.publicUrl ?? null;
}
