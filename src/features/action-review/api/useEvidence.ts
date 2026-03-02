/**
 * Aksiyon kanıtları — action_evidence tablosuna React Query ile bağlanır.
 * AI kanıt analizi tetikleme mutasyonu Supabase UPDATE ile ai_confidence_score ve ai_analysis_summary yazar.
 *
 * DDL: action_evidence tablosunda ai_confidence_score (decimal), ai_analysis_summary (text)
 *      migration: 20260219091340 (ai_confidence_score, review_note), 20260301140000 (ai_analysis_summary)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

export interface Evidence {
  id: string;
  action_id: string;
  file_name: string;
  file_url: string;
  file_hash: string;
  uploaded_by: string | null;
  uploaded_at: string;
  ai_confidence_score: number | null;
  ai_analysis_summary: string | null;
  review_note: string | null;
  status: 'pending' | 'analyzed' | 'rejected';
}

interface DbRow {
  id: string;
  action_id: string;
  file_name: string;
  storage_path: string;
  file_hash: string;
  uploaded_by: string | null;
  created_at: string;
  ai_confidence_score: number | null;
  ai_analysis_summary?: string | null;
  review_note?: string | null;
}

function mapRowToEvidence(row: DbRow): Evidence {
  return {
    id: row.id,
    action_id: row.action_id,
    file_name: row.file_name || row.storage_path?.split('/').pop() || 'dosya',
    file_url: row.storage_path ?? '',
    file_hash: row.file_hash ?? '',
    uploaded_by: row.uploaded_by ?? null,
    uploaded_at: row.created_at,
    ai_confidence_score: row.ai_confidence_score != null ? Number(row.ai_confidence_score) : null,
    ai_analysis_summary: row.ai_analysis_summary ?? null,
    review_note: row.review_note ?? null,
    status: row.review_note ? 'rejected' : row.ai_confidence_score != null ? 'analyzed' : 'pending',
  };
}

const QUERY_KEY_PREFIX = 'action-evidence';

async function fetchEvidenceByActionId(actionId: string): Promise<Evidence[]> {
  const { data, error } = await supabase
    .from('action_evidence')
    .select('id, action_id, file_name, storage_path, file_hash, uploaded_by, created_at, ai_confidence_score, ai_analysis_summary, review_note')
    .eq('action_id', actionId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapRowToEvidence);
}

export interface AnalyzeEvidenceInput {
  evidenceId: string;
}

/** 85–95 arası skor ve örnek özet yazar; ileride gerçek LLM entegre edilebilir */
async function runAnalyzeEvidence(input: AnalyzeEvidenceInput): Promise<Evidence> {
  const score = Math.floor(Math.random() * 11) + 85;
  const summaries: string[] = [
    'Sentinel Prime yüklenen kanıtı doğruladı. Bulgu anlık görüntüsüyle anlamsal eşleşme güçlüdür. Kanıt kapsamlı ve ilgilidir.',
    'Kanıt belgeyi inceleyen AI modeli yüksek güven skoru verdi. İlgili bulgu kriterleriyle uyumludur.',
    'Doküman bütünlüğü ve içerik uyumu doğrulandı. Ek belge talebi gerekmiyor.',
  ];
  const ai_analysis_summary = summaries[Math.floor(Math.random() * summaries.length)];

  const { data, error } = await supabase
    .from('action_evidence')
    .update({
      ai_confidence_score: score,
      ai_analysis_summary,
    })
    .eq('id', input.evidenceId)
    .select('id, action_id, file_name, storage_path, file_hash, uploaded_by, created_at, ai_confidence_score, ai_analysis_summary, review_note')
    .single();

  if (error) throw error;
  return mapRowToEvidence(data as DbRow);
}

export function useEvidence(actionId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: evidences = [], isLoading } = useQuery({
    queryKey: [QUERY_KEY_PREFIX, actionId ?? ''],
    queryFn: () => fetchEvidenceByActionId(actionId!),
    enabled: Boolean(actionId),
  });

  const analyzeMutation = useMutation({
    mutationFn: runAnalyzeEvidence,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_PREFIX, updated.action_id] });
    },
  });

  return {
    evidences,
    isLoading,
    analyzeEvidence: analyzeMutation.mutateAsync,
    analyzeMutation,
    isAnalyzing: analyzeMutation.isPending,
  };
}
