/**
 * Root Cause & 5-Whys Analyzer — Feature API
 * Wave 55: Kök Neden ve 5-Neden Analizi
 *
 * FSD: features/root-cause/api.ts
 * Savunmacı Programlama: (steps || []).map — her zaman aktif
 * Null koruması: her metin alanında ?. ve ?? operatörleri
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

// ─── Types ──────────────────────────────────────────────────────────────────

export type RcaCategory  = 'Operasyonel' | 'Sistem/BT' | 'İnsan' | 'Süreç' | 'Dış Etken' | 'Yönetim';
export type RcaStatus    = 'Taslak' | 'Devam Ediyor' | 'Tamamlandı' | 'Onaylandı';
export type RcaSeverity  = 'Kritik' | 'Yüksek' | 'Orta' | 'Düşük';

export interface RootCauseAnalysis {
  id: string;
  tenant_id: string;
  finding_id: string | null;
  finding_ref: string;
  title: string;
  problem_statement: string;
  root_cause: string;
  category: RcaCategory;
  severity: RcaSeverity;
  status: RcaStatus;
  analyst_name: string;
  approved_by: string | null;
  approved_at: string | null;
  corrective_action: string;
  preventive_action: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface FiveWhysStep {
  id: string;
  tenant_id: string;
  analysis_id: string;
  step_number: number;
  why_question: string;
  answer: string;
  evidence: string;
  is_root_cause: boolean;
  contributing_factor: string;
  ai_suggestion: string | null;
  created_at: string;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

const RCA_KEY  = ['root-cause-analyses'] as const;
const WHYS_KEY = ['five-whys-steps'] as const;

// ─── RCA Hooks ────────────────────────────────────────────────────────────────

/**
 * Tüm kök neden analizlerini listeler
 */
export function useRootCauses(status?: RcaStatus) {
  return useQuery({
    queryKey: [...RCA_KEY, status ?? 'all'],
    queryFn: async () => {
      let query = supabase
        .from('root_cause_analyses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) {
        console.error('[Wave55] Failed to fetch root_cause_analyses:', error);
        return [] as RootCauseAnalysis[];
      }
      return (data || []) as RootCauseAnalysis[];
    },
    staleTime: 30_000,
  });
}

/**
 * Tek analiz detayı
 */
export function useRootCause(id: string | undefined) {
  return useQuery({
    queryKey: [...RCA_KEY, id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('root_cause_analyses')
        .select('*')
        .eq('id', id!)
        .maybeSingle();

      if (error) {
        console.error('[Wave55] Failed to fetch analysis:', error);
        return null;
      }
      return data as RootCauseAnalysis | null;
    },
    staleTime: 15_000,
  });
}

/**
 * Yeni kök neden analizi oluşturur
 */
export function useCreateAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      title: string;
      problem_statement: string;
      finding_ref?: string;
      category?: RcaCategory;
      severity?: RcaSeverity;
      analyst_name?: string;
    }) => {
      const { data, error } = await supabase
        .from('root_cause_analyses')
        .insert({
          title:             input?.title             ?? '',
          problem_statement: input?.problem_statement ?? '',
          finding_ref:       input?.finding_ref       ?? '',
          category:          input?.category          ?? 'Operasyonel',
          severity:          input?.severity          ?? 'Orta',
          analyst_name:      input?.analyst_name      ?? '',
          status:            'Devam Ediyor',
        })
        .select()
        .single();

      if (error) throw error;
      return data as RootCauseAnalysis;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RCA_KEY });
    },
  });
}

/**
 * Analiz sonucunu günceller (kök neden + düzeltici/önleyici eylem)
 */
export function useUpdateAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      root_cause?: string;
      corrective_action?: string;
      preventive_action?: string;
      status?: RcaStatus;
    }) => {
      const { data, error } = await supabase
        .from('root_cause_analyses')
        .update({
          root_cause:        input?.root_cause        ?? undefined,
          corrective_action: input?.corrective_action ?? undefined,
          preventive_action: input?.preventive_action ?? undefined,
          status:            input?.status            ?? undefined,
          updated_at:        new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;
      return data as RootCauseAnalysis;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RCA_KEY });
    },
  });
}

// ─── 5-Whys Hooks ─────────────────────────────────────────────────────────────

/**
 * Bir analize ait tüm 5-Neden adımlarını getirir
 * Savunmacı: (steps || []).map — her zaman korunur
 */
export function useWhys(analysisId: string | undefined) {
  return useQuery({
    queryKey: [...WHYS_KEY, analysisId],
    enabled: !!analysisId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('five_whys_steps')
        .select('*')
        .eq('analysis_id', analysisId!)
        .order('step_number', { ascending: true });

      if (error) {
        console.error('[Wave55] Failed to fetch five_whys_steps:', error);
        return [] as FiveWhysStep[];
      }
      // Null koruması: her adımın metin alanlarını güvenli hale getir
      return (data || []).map((row: any) => ({
        ...row,
        why_question:        row?.why_question        ?? '',
        answer:              row?.answer              ?? '',
        evidence:            row?.evidence            ?? '',
        contributing_factor: row?.contributing_factor ?? '',
        ai_suggestion:       row?.ai_suggestion       ?? null,
      })) as FiveWhysStep[];
    },
    staleTime: 15_000,
  });
}

/**
 * Bir "Neden" adımı ekler veya günceller (upsert — step_number benzersiz)
 */
export function useUpsertStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      analysis_id: string;
      step_number: number;
      why_question: string;
      answer: string;
      evidence?: string;
      is_root_cause?: boolean;
      contributing_factor?: string;
      ai_suggestion?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('five_whys_steps')
        .upsert(
          {
            analysis_id:         input?.analysis_id         ?? '',
            step_number:         input?.step_number         ?? 1,
            why_question:        input?.why_question        ?? '',
            answer:              input?.answer              ?? '',
            evidence:            input?.evidence            ?? '',
            is_root_cause:       input?.is_root_cause       ?? false,
            contributing_factor: input?.contributing_factor ?? '',
            ai_suggestion:       input?.ai_suggestion       ?? null,
          },
          { onConflict: 'analysis_id,step_number' }
        )
        .select()
        .single();

      if (error) throw error;
      return data as FiveWhysStep;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [...WHYS_KEY, data?.analysis_id] });
    },
  });
}
