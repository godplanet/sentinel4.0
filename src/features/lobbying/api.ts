/**
 * Wave 81: Regulatory Lobbying AI (Auto-Responder) — Supabase Data Layer
 *
 * Hooks for regulatory_drafts and bank_feedback_reports tables.
 *
 * DEFENSIVE PROGRAMMING:
 *   - report_text fallback: `(report_text || 'Rapor hazırlanıyor...')` applied directly in the UI.
 *   - Array mappings safeguarded with `(data ?? [])`
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface RegulatoryDraft {
  id: string;
  tenant_id: string;
  regulator_name: string;
  draft_title: string;
  publication_date: string;
  deadline_date: string;
  status: 'OPEN' | 'RESPONDED' | 'CLOSED';
}

export interface BankFeedbackReport {
  id: string;
  tenant_id: string;
  draft_id: string;
  report_title: string;
  report_text: string | null;
  generated_by_ai: boolean;
  approval_status: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'SUBMITTED';
  updated_at: string;
}

// ---------------------------------------------------------------------------
// HOOK: Get Drafts
// ---------------------------------------------------------------------------
export function useRegulatoryDrafts() {
  return useQuery({
    queryKey: ['regulatory-drafts'],
    queryFn: async (): Promise<RegulatoryDraft[]> => {
      const { data, error } = await supabase
        .from('regulatory_drafts')
        .select('*')
        .order('deadline_date', { ascending: true });

      if (error) {
        console.error('useRegulatoryDrafts: query failed', error.message);
        return [];
      }
      return (data ?? []) as RegulatoryDraft[];
    },
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// HOOK: Get Feedbacks (By Draft ID)
// ---------------------------------------------------------------------------
export function useFeedbackReports(draftId?: string) {
  return useQuery({
    queryKey: ['feedback-reports', draftId],
    queryFn: async (): Promise<BankFeedbackReport[]> => {
      let q = supabase
        .from('bank_feedback_reports')
        .select('*')
        .order('updated_at', { ascending: false });

      if (draftId) {
        q = q.eq('draft_id', draftId);
      }

      const { data, error } = await q;

      if (error) {
        console.error('useFeedbackReports: query failed', error.message);
        return [];
      }
      return (data ?? []) as BankFeedbackReport[];
    },
    enabled: !!draftId || draftId === undefined, // Allow fetching all if undefined
    staleTime: 60_000,
  });
}
