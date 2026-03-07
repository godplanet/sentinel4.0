/**
 * Wave 39: Traceability Golden Thread — useGoldenThread hook
 *
 * golden_thread_view'den tek bir action'ın tam izlenebilirlik zincirini çeker:
 * Action → Finding → Audit Program → Engagement → Plan Period
 *
 * Tüm hiyerarşik alanlarda `?.` (optional chaining) zorunludur.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

const GT_KEY = 'golden-thread';

export interface GoldenThreadRow {
  /** Action katmanı */
  action_id: string;
  action_title: string;
  action_status: string;
  due_date: string | null;
  regulatory_tags: string[];
  finding_snapshot: Record<string, string> | null;

  /** Finding katmanı (snapshot'tan) */
  finding_id: string | null;
  finding_title: string | null;
  finding_severity: string | null;
  finding_gias_category: string | null;
  finding_description: string | null;

  /** Workpaper katmanı */
  program_id: string | null;
  program_title: string | null;
  program_type: string | null;

  /** Universe katmanı */
  engagement_id: string | null;
  engagement_title: string | null;
  audit_type: string | null;
  scope_statement: string | null;
  engagement_risk_rating: string | null;

  /** Strategy katmanı */
  plan_period_id: string | null;
  plan_period_title: string | null;
  plan_year: number | null;
  strategic_objective: string | null;

  /** Assignee */
  assignee_unit_id: string | null;
  action_created_at: string;
}

/** Tek bir action'ın Golden Thread verilerini çeker */
export function useGoldenThread(actionId: string | undefined) {
  return useQuery<GoldenThreadRow | null>({
    queryKey: [GT_KEY, actionId],
    enabled: !!actionId,
    staleTime: 60_000,
    queryFn: async () => {
      if (!actionId) return null;
      const { data, error } = await supabase
        .from('golden_thread_view')
        .select('*')
        .eq('action_id', actionId)
        .maybeSingle();

      if (error) {
        // VIEW henüz migrate edilmediyse sessiz fallback
        console.warn('[GoldenThread] golden_thread_view query failed:', error.message);
        return null;
      }
      return (data ?? null) as GoldenThreadRow | null;
    },
  });
}

/** Son N aksiyon için golden thread listesini çeker */
export function useGoldenThreadList(limit = 20) {
  return useQuery<GoldenThreadRow[]>({
    queryKey: [GT_KEY, 'list', limit],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('golden_thread_view')
        .select('*')
        .order('action_created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.warn('[GoldenThread] useGoldenThreadList failed:', error.message);
        return [];
      }
      return (data ?? []) as GoldenThreadRow[];
    },
  });
}
