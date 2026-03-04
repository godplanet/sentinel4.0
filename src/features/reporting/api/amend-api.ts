/**
 * GIAS Sıfır Hata (Errors & Omissions) — Revoke & Amend API
 * Mühürlenmiş raporda tespit edilen hatalar için düzeltme versiyonu (zeyilname) oluşturur.
 * Eski rapor silinmez; REVOKED_AMENDED damgası ile arşive alınır.
 * Mock kullanılmaz; tüm işlemler Supabase RPC ile tek transaction'da yapılır.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

export interface AmendReportParams {
  reportId: string;
  amendmentNote: string;
}

/**
 * RPC: report_amend_revoke_and_clone
 * - Eski raporun status'ünü REVOKED_AMENDED yapar
 * - Yeni rapor kaydı (clone) + tüm report_blocks kopyalanır
 * - Yeni rapor: version = eski + 1, parent_report_id = eski id, status = draft, amendment_note
 */
export async function amendReport(params: AmendReportParams): Promise<string> {
  const { data: user } = (await supabase.auth.getUser()).data;

  const { data, error } = await supabase.rpc('report_amend_revoke_and_clone', {
    p_report_id: params.reportId,
    p_amendment_note: params.amendmentNote.trim(),
    p_created_by: user?.id ?? null,
  });

  if (error) throw error;
  const newId = typeof data === 'string' ? data : (data != null && typeof (data as { id?: string }).id === 'string' ? (data as { id: string }).id : null);
  if (!newId) throw new Error('Düzeltme sonrası rapor ID alınamadı.');

  return newId;
}

/**
 * useAmendReport — Düzeltme yayınla mutasyonu.
 * Başarıda yeni rapor ID döner; UI'da /reporting/zen-editor/{newId} yönlendirmesi yapılır.
 */
export function useAmendReport(options?: {
  onSuccess?: (newReportId: string) => void;
  onError?: (err: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: AmendReportParams) => amendReport(params),
    onSuccess: (newReportId, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['reports'] });
      void queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
      void queryClient.invalidateQueries({ queryKey: ['report', newReportId] });
      void queryClient.invalidateQueries({ queryKey: ['reports-awaiting-publish'] });
      options?.onSuccess?.(newReportId);
    },
    onError: options?.onError,
  });
}
