import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

const TENANT_ID = '11111111-1111-1111-1111-111111111111';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DeckType   = 'BOARD_REPORT' | 'AUDIT_COMMITTEE' | 'MANAGEMENT_UPDATE' | 'RISK_REVIEW';
export type DeckStatus = 'draft' | 'ready' | 'presented' | 'archived';
export type SlideType  = 'COVER' | 'EXECUTIVE_SUMMARY' | 'KPI' | 'FINDINGS' | 'RECOMMENDATIONS' | 'CONTENT' | 'CLOSING';

export interface KpiItem {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface PresentationDeck {
  id: string;
  tenant_id: string;
  title: string;
  subtitle: string | null;
  deck_type: DeckType;
  period: string | null;
  status: DeckStatus;
  total_slides: number;
  theme: string;
  generated_by: string;
  engagement_id: string | null;
  presented_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SlideBlock {
  id: string;
  tenant_id: string;
  deck_id: string;
  slide_order: number;
  slide_type: SlideType;
  title: string;
  subtitle: string | null;
  body_content: string | null;
  chart_config: Record<string, unknown> | null;
  kpi_data: KpiItem[] | null;
  speaker_notes: string | null;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Deck Hooks ───────────────────────────────────────────────────────────────

export function useDecks(filters?: { status?: DeckStatus; deck_type?: DeckType }) {
  return useQuery({
    queryKey: ['presentation-decks', TENANT_ID, filters],
    queryFn: async () => {
      let query = supabase
        .from('presentation_decks')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .order('created_at', { ascending: false });

      if (filters?.status)    query = query.eq('status', filters.status);
      if (filters?.deck_type) query = query.eq('deck_type', filters.deck_type);

      const { data, error } = await query;
      if (error) {
        console.error('[Wave 54] Deck listesi alınamadı:', error.message);
        return [] as PresentationDeck[];
      }
      return (data ?? []) as PresentationDeck[];
    },
    staleTime: 30_000,
  });
}

export function useDeckSlides(deckId: string | undefined) {
  return useQuery({
    queryKey: ['slide-blocks', deckId],
    enabled: !!deckId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('slide_blocks')
        .select('*')
        .eq('deck_id', deckId!)
        .order('slide_order', { ascending: true });

      if (error) {
        console.error('[Wave 54] Slaytlar alınamadı:', error.message);
        return [] as SlideBlock[];
      }

      // Optional chaining kalkanı: kpi_data JSON parse
      return (data ?? []).map(row => ({
        ...row,
        kpi_data: (() => {
          try {
            if (typeof row.kpi_data === 'string') return JSON.parse(row.kpi_data ?? '[]') as KpiItem[];
            return (row.kpi_data ?? []) as KpiItem[];
          } catch {
            return [] as KpiItem[];
          }
        })(),
      })) as SlideBlock[];
    },
    staleTime: 30_000,
  });
}

export function useCreateDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Pick<PresentationDeck, 'title' | 'subtitle' | 'deck_type' | 'period' | 'theme'>) => {
      const { data, error } = await supabase
        .from('presentation_decks')
        .insert({ ...payload, tenant_id: TENANT_ID })
        .select()
        .maybeSingle();
      if (error) throw error;
      return data as PresentationDeck;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['presentation-decks'] }),
    onError: (err) => console.error('[Wave 54] Deck oluşturulamadı:', (err as Error)?.message),
  });
}

export function useUpdateDeckStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: DeckStatus }) => {
      const { error } = await supabase
        .from('presentation_decks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['presentation-decks'] }),
  });
}

// ─── Slide Hooks ──────────────────────────────────────────────────────────────

/**
 * useGenerateSlide — Yeni slayt bloğu oluşturur (AI üretimi simülasyonu).
 * Gerçek üretimde Edge Function / OpenAI çağrısı yapılır.
 */
export function useGenerateSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      deckId,
      slideType,
      title,
      bodyContent,
      slideOrder,
    }: {
      deckId: string;
      slideType: SlideType;
      title: string;
      bodyContent?: string;
      slideOrder: number;
    }) => {
      const { data, error } = await supabase
        .from('slide_blocks')
        .insert({
          tenant_id:    TENANT_ID,
          deck_id:      deckId,
          slide_order:  slideOrder,
          slide_type:   slideType,
          title:        title ?? '',
          body_content: bodyContent ?? '',
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      // Update total_slides count on the deck
      await supabase.rpc('increment_deck_slides' as never, { p_deck_id: deckId } as never).maybeSingle().catch(() => {
        // Fallback: manual update
        supabase
          .from('presentation_decks')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', deckId);
      });

      return data as SlideBlock;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['slide-blocks', vars.deckId] });
      qc.invalidateQueries({ queryKey: ['presentation-decks'] });
    },
    onError: (err) => console.error('[Wave 54] Slayt eklenemedi:', (err as Error)?.message),
  });
}

export function useUpdateSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, deckId, ...patch }: Partial<SlideBlock> & { id: string; deckId: string }) => {
      const { error } = await supabase
        .from('slide_blocks')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ['slide-blocks', vars.deckId] }),
  });
}
