/**
 * Field Agent API — Wave 29: Saha Notları & Sesli Ajan
 * Supabase bağlantıları: scribbles + field_notes tablolarla konuşur.
 *
 * FSD: features/field-agent/api.ts
 * Tüm diziler `(data || []).map` ile korunur.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type { VoiceFindingDraft } from './types';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Scribble {
  id: string;
  tenant_id: string | null;
  content: string;
  linked_context: string;
  is_processed: boolean;
  extracted_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface FieldNote {
  id: string;
  tenant_id: string | null;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  location: string;
  audio_source: boolean;
  confidence: number;
  transcript: string | null;
  status: 'draft' | 'submitted' | 'converted' | 'dismissed';
  converted_finding_id: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Query Keys ─────────────────────────────────────────────────────────────

const SCRIBBLES_KEY = ['scribbles'] as const;
const FIELD_NOTES_KEY = ['field-notes'] as const;

// ─── Scribble Hooks ─────────────────────────────────────────────────────────

/**
 * Son 20 scribble kaydını listeler (en yeni önce)
 */
export function useScribbles() {
  return useQuery({
    queryKey: SCRIBBLES_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scribbles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('[Wave29] Failed to fetch scribbles:', error);
        return [] as Scribble[];
      }
      return (data || []) as Scribble[];
    },
    staleTime: 30_000,
  });
}

/**
 * Yeni bir scribble notu kaydeder
 */
export function useSaveNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      content: string;
      linkedContext: string;
      isProcessed?: boolean;
      extractedData?: Record<string, unknown> | null;
    }) => {
      const { data, error } = await supabase
        .from('scribbles')
        .insert({
          content: params?.content ?? '',
          linked_context: params?.linkedContext ?? '',
          is_processed: params?.isProcessed ?? false,
          extracted_data: params?.extractedData ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Scribble;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCRIBBLES_KEY });
    },
  });
}

// ─── Field Note Hooks ────────────────────────────────────────────────────────

/**
 * Saha notlarını listeler (en yeni önce, status filtresiyle)
 */
export function useFieldNotes(status?: FieldNote['status']) {
  return useQuery({
    queryKey: [...FIELD_NOTES_KEY, status ?? 'all'],
    queryFn: async () => {
      let query = supabase
        .from('field_notes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) {
        console.error('[Wave29] Failed to fetch field_notes:', error);
        return [] as FieldNote[];
      }
      return (data || []) as FieldNote[];
    },
    staleTime: 30_000,
  });
}

/**
 * Voice-to-Note: VoiceFindingDraft'ı field_notes tablosuna kaydeder
 * (localStorage yerine gerçek Supabase entegrasyonu)
 */
export function useSaveFieldNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (draft: VoiceFindingDraft & { transcript?: string }) => {
      const { data, error } = await supabase
        .from('field_notes')
        .insert({
          title: draft?.title ?? 'Adsız Saha Notu',
          description: draft?.description ?? '',
          severity: draft?.severity ?? 'medium',
          category: draft?.category ?? 'Genel',
          location: draft?.location ?? '',
          audio_source: draft?.audioSource ?? false,
          confidence: draft?.confidence ?? 0.75,
          transcript: draft?.transcript ?? null,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return data as FieldNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FIELD_NOTES_KEY });
    },
  });
}

/**
 * Saha notu durumunu günceller (örn: draft → submitted)
 */
export function useUpdateFieldNoteStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      status: FieldNote['status'];
      convertedFindingId?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('field_notes')
        .update({
          status: params?.status,
          converted_finding_id: params?.convertedFindingId ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;
      return data as FieldNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FIELD_NOTES_KEY });
    },
  });
}
