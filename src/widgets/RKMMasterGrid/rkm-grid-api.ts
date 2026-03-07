/**
 * RKM Master Grid — Supabase API (Wave 36 upgrade)
 * widgets/RKMMasterGrid/rkm-grid-api.ts
 *
 * Çökme Kalkanları:
 *   - Optional chaining ?.
 *   - (population_size || 1) sıfıra bölünme koruması
 *   - Tablo yoksa (42P01) graceful degradation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type { RkmRow } from './index';

// ─── Mevcut Hücre Güncelleme (korundu) ───────────────────────────────────────

export interface RkmGridUpdatePayload {
  id: string;
  field: string;
  value: string | number | null;
}

/** rkm_risks tablosundaki tek bir hücreyi günceller. */
export async function updateRkmRiskCell(payload: RkmGridUpdatePayload): Promise<void> {
  const { id, field, value } = payload;
  const { error } = await supabase
    .from('rkm_risks')
    .update({ [field]: value })
    .eq('id', id);
  if (error) throw error;
}

export const COMPUTED_FIELDS = new Set([
  'inherent_score',
  'inherent_rating',
  'control_effectiveness',
  'residual_score',
  'residual_rating',
]);

export function useRkmCellUpdate(queryKey: readonly unknown[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRkmRiskCell,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey as string[] });
    },
  });
}

// ─── Wave 36: useRkmMaster — rkm_master tablosundan veri çekme ───────────────

export function useRkmMaster() {
  return useQuery<RkmRow[]>({
    queryKey: ['rkm-master'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rkm_master')
        .select('*')
        .order('risk_code', { ascending: true });

      if (error) {
        // Tablo henüz migrate edilmemişse graceful degradation
        if (error.code === '42P01') return [];
        throw error;
      }

      // rkm_master kolonlarını RkmRow şemasına map et
      return (data ?? []).map((r: any): RkmRow => ({
        id:                       r.id ?? '',
        risk_code:                r.risk_code ?? '',
        risk_title:               r.risk_title ?? '',
        risk_owner:               r.risk_owner ?? '',
        risk_status:              r.risk_status ?? 'ACTIVE',
        risk_category:            r.risk_category ?? '',
        risk_subcategory:         r.risk_subcategory ?? '',
        main_process:             r.main_process ?? '',
        sub_process:              r.sub_process ?? '',
        inherent_impact:          Number(r.inherent_impact ?? 3),
        inherent_likelihood:      Number(r.inherent_likelihood ?? 3),
        inherent_score:           Number(r.inherent_score ?? 0),
        inherent_rating:          r.inherent_rating ?? 'ORTA',
        control_type:             r.control_type ?? 'PREVENTIVE',
        control_nature:           r.control_nature ?? '',
        control_effectiveness:    Number(r.control_effectiveness ?? 0.6),
        residual_impact:          Number(r.residual_impact ?? 2),
        residual_likelihood:      Number(r.residual_likelihood ?? 2),
        residual_score:           Number(r.residual_score ?? 0),
        residual_rating:          r.residual_rating ?? 'ORTA',
        bddk_reference:           r.bddk_reference ?? '',
        iso27001_reference:       r.iso27001_reference ?? '',
        risk_response_strategy:   r.risk_response_strategy ?? 'MITIGATE',
        last_audit_date:          r.last_audit_date ?? '',
        audit_rating:             r.audit_rating ?? 'NEEDS_IMPROVEMENT',
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Örnekleme Log Tipi ───────────────────────────────────────────────────────

export interface SamplingLogInput {
  workpaper_id?: string | null;
  population_size: number;
  risk_level: 'low' | 'medium' | 'high';
  confidence_level: 90 | 95 | 99;
  expected_error_rate?: number;
  recommended_sample_size: number;
  methodology?: string;
  justification?: string;
  is_full_scope?: boolean;
  sample_indices?: number[];
  created_by?: string;
}

// ─── Wave 36: useSaveSamplingLog — örnekleme sonucunu Supabase'e yaz ─────────

export function useSaveSamplingLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SamplingLogInput) => {
      const { data, error } = await supabase
        .from('sampling_logs')
        .insert({
          workpaper_id:           input.workpaper_id ?? null,
          population_size:        input.population_size,
          risk_level:             input.risk_level,
          confidence_level:       input.confidence_level,
          expected_error_rate:    input.expected_error_rate ?? null,
          recommended_sample_size: input.recommended_sample_size,
          methodology:            input.methodology ?? null,
          justification:          input.justification ?? null,
          is_full_scope:          input.is_full_scope ?? false,
          sample_indices:         input.sample_indices ?? null,
          created_by:             input.created_by ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sampling-logs'] });
    },
  });
}

// ─── Wave 36: useSamplingLogs — geçmiş örneklemeler ─────────────────────────

export function useSamplingLogs(workpaperId?: string | null) {
  return useQuery({
    queryKey: ['sampling-logs', workpaperId],
    queryFn: async () => {
      let q = supabase
        .from('sampling_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (workpaperId) q = q.eq('workpaper_id', workpaperId);

      const { data, error } = await q;
      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }
      return data ?? [];
    },
    staleTime: 1000 * 60 * 2,
  });
}
