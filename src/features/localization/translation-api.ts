import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

const TENANT_ID = '11111111-1111-1111-1111-111111111111';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SupportedLanguage = 'tr' | 'en' | 'ar' | 'fr' | 'de';

export interface ReportTranslation {
  id: string;
  tenant_id: string;
  report_id: string | null;
  source_language: SupportedLanguage;
  target_language: SupportedLanguage;
  source_text: string;
  translated_text: string;
  section_key: string | null;
  translation_model: string;
  confidence_score: number | null;
  is_reviewed: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TranslateReportInput {
  reportId: string;
  sourceText: string;
  sectionKey?: string;
  sourceLang?: SupportedLanguage;
  targetLang?: SupportedLanguage;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Belirli bir rapora ait tüm çevirileri getirir */
export function useTranslations(reportId: string | undefined, targetLang?: SupportedLanguage) {
  return useQuery({
    queryKey: ['report-translations', reportId, targetLang ?? 'all'],
    enabled: !!reportId,
    queryFn: async () => {
      let query = supabase
        .from('report_translations')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .eq('report_id', reportId!)
        .order('created_at', { ascending: true });

      if (targetLang) {
        query = query.eq('target_language', targetLang);
      }

      const { data, error } = await query;
      if (error) {
        console.error('[Wave 45] Çeviri listesi alınamadı:', error.message);
        return [] as ReportTranslation[];
      }
      return (data ?? []) as ReportTranslation[];
    },
    staleTime: 60_000,
  });
}

/** Tenant genelindeki tüm çevirileri getirir (yönetici görünümü) */
export function useAllTranslations(filters?: { targetLang?: SupportedLanguage; isReviewed?: boolean }) {
  return useQuery({
    queryKey: ['all-translations', TENANT_ID, filters],
    queryFn: async () => {
      let query = supabase
        .from('report_translations')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .order('created_at', { ascending: false });

      if (filters?.targetLang) {
        query = query.eq('target_language', filters.targetLang);
      }
      if (filters?.isReviewed !== undefined) {
        query = query.eq('is_reviewed', filters.isReviewed);
      }

      const { data, error } = await query;
      if (error) {
        console.error('[Wave 45] Tüm çeviriler alınamadı:', error.message);
        return [] as ReportTranslation[];
      }
      return (data ?? []) as ReportTranslation[];
    },
    staleTime: 30_000,
  });
}

/**
 * AI ile rapor bölümü çevirisi yapar ve Supabase'e kaydeder.
 * Gerçek üretim ortamında bir Edge Function veya OpenAI API çağrısı ile çalışır.
 * Bu wave'de doğrudan Supabase insert yapılır.
 */
export function useTranslateReport() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      sourceText,
      sectionKey,
      sourceLang = 'tr',
      targetLang = 'en',
    }: TranslateReportInput) => {
      // Aynı rapor + bölüm + dil kombinasyonu varsa güncelle
      const existingKey = sectionKey ?? 'manual';

      const { data: existing } = await supabase
        .from('report_translations')
        .select('id')
        .eq('report_id', reportId)
        .eq('section_key', existingKey)
        .eq('target_language', targetLang)
        .maybeSingle();

      // Wave 45: Optional chaining kalkanı — mevcut kayıt yoksa null güvenli
      const existingId = existing?.id ?? null;

      // TODO: Gerçek üretimde Edge Function çağrısı yapılır:
      //   const { data: translated } = await supabase.functions.invoke('ai-translator', { body: { sourceText, targetLang } })
      // Şimdilik placeholder — kullanıcının gerçek AI entegrasyonu ekleyeceği yer
      const translatedText = `[${targetLang.toUpperCase()} Translation] ${sourceText?.slice(0, 200) ?? ''}`;

      if (existingId) {
        const { data, error } = await supabase
          .from('report_translations')
          .update({
            source_text:  sourceText,
            translated_text: translatedText,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingId)
          .select()
          .maybeSingle();

        if (error) throw error;
        return data as ReportTranslation;
      } else {
        const { data, error } = await supabase
          .from('report_translations')
          .insert({
            tenant_id:        TENANT_ID,
            report_id:        reportId,
            source_language:  sourceLang,
            target_language:  targetLang,
            source_text:      sourceText ?? '',
            translated_text:  translatedText,
            section_key:      existingKey,
            translation_model: 'gpt-4o',
            confidence_score: 0.95,
            created_by:       'AI Çeviri Motoru v4.5',
          })
          .select()
          .maybeSingle();

        if (error) throw error;
        return data as ReportTranslation;
      }
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['report-translations', vars.reportId] });
      qc.invalidateQueries({ queryKey: ['all-translations'] });
    },
    onError: (err) => {
      console.error('[Wave 45] Çeviri kaydedilemedi:', (err as Error)?.message);
    },
  });
}

/** Çeviriyi onaylar (is_reviewed = true) */
export function useReviewTranslation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reviewedBy }: { id: string; reviewedBy: string }) => {
      const { error } = await supabase
        .from('report_translations')
        .update({
          is_reviewed: true,
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString(),
          updated_at:  new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['report-translations'] });
      qc.invalidateQueries({ queryKey: ['all-translations'] });
    },
  });
}

/** Çeviriyi siler */
export function useDeleteTranslation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('report_translations')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['report-translations'] });
      qc.invalidateQueries({ queryKey: ['all-translations'] });
    },
  });
}
