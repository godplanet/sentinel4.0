/**
 * Wave 42: Board Resolution & E-Voting Deck — API Kancaları
 *
 * Tablolar: board_resolutions, committee_votes
 *
 * ZORUNLU KURAL:
 * - Oy oranı hesaplarında (total_votes || 1) — sıfıra bölünme yasak
 * - Tüm array map'lerinde (data || []).map(...)
 * - Tüm nullable alanlarda ?. ve ??
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

const TENANT_ID = '11111111-1111-1111-1111-111111111111';
const RES_KEY = ['board-resolutions'] as const;
const VOTES_KEY = ['committee-votes'] as const;

/* ────────────────────────────────────────────────────────── */
/* Types                                                       */
/* ────────────────────────────────────────────────────────── */

export type ResolutionStatus = 'OPEN' | 'CLOSED' | 'DEFERRED' | 'WITHDRAWN';
export type ResolutionType = 'APPROVAL' | 'INFORMATION' | 'INSTRUCTION' | 'ACKNOWLEDGEMENT';
export type VoteChoice = 'FOR' | 'AGAINST' | 'ABSTAIN';

export interface BoardResolution {
  id: string;
  title: string;
  description: string;
  resolution_type: ResolutionType;
  status: ResolutionStatus;
  quorum_required: number;
  meeting_date: string | null;
  regulatory_ref: string | null;
  proposed_by: string;
  created_at: string;
}

export interface CommitteeVote {
  id: string;
  resolution_id: string;
  member_name: string;
  member_title: string;
  vote: VoteChoice;
  rationale: string | null;
  voted_at: string;
}

export interface ResolutionWithVotes extends BoardResolution {
  votes: CommitteeVote[];
  for_count: number;
  against_count: number;
  abstain_count: number;
  total_votes: number;
  for_pct: number;    // SIFIRA BÖLÜNME KORUMALII: (total_votes || 1)
  against_pct: number;
  quorum_reached: boolean;
  passed: boolean;
}

/* ────────────────────────────────────────────────────────── */
/* Helper: oy oranı hesapla                                   */
/* ────────────────────────────────────────────────────────── */

function enrichResolution(res: BoardResolution, votes: CommitteeVote[]): ResolutionWithVotes {
  const resVotes = (votes || []).filter(v => v.resolution_id === res.id);
  const for_count = resVotes.filter(v => v.vote === 'FOR').length;
  const against_count = resVotes.filter(v => v.vote === 'AGAINST').length;
  const abstain_count = resVotes.filter(v => v.vote === 'ABSTAIN').length;
  const total_votes = resVotes.length;

  // SIFIRA BÖLÜNME: (total_votes || 1)
  const for_pct = Math.round((for_count / (total_votes || 1)) * 100);
  const against_pct = Math.round((against_count / (total_votes || 1)) * 100);

  const quorum_reached = total_votes >= (res.quorum_required ?? 5);
  const passed = quorum_reached && for_count > against_count;

  return {
    ...res,
    votes: resVotes,
    for_count,
    against_count,
    abstain_count,
    total_votes,
    for_pct,
    against_pct,
    quorum_reached,
    passed,
  };
}

/* ────────────────────────────────────────────────────────── */
/* Queries                                                     */
/* ────────────────────────────────────────────────────────── */

/** Tüm YK kararlarını oylarıyla birlikte çeker */
export function useResolutions() {
  return useQuery<ResolutionWithVotes[]>({
    queryKey: RES_KEY,
    staleTime: 30_000,
    queryFn: async () => {
      const [resRes, voteRes] = await Promise.all([
        supabase
          .from('board_resolutions')
          .select('*')
          .eq('tenant_id', TENANT_ID)
          .order('meeting_date', { ascending: true }),
        supabase
          .from('committee_votes')
          .select('*')
          .eq('tenant_id', TENANT_ID)
          .order('voted_at', { ascending: true }),
      ]);

      if (resRes.error) {
        console.error('[BoardResolutions] fetch error:', resRes.error.message);
        throw resRes.error;
      }
      if (voteRes.error) {
        console.error('[CommitteeVotes] fetch error:', voteRes.error.message);
        throw voteRes.error;
      }

      const resolutions = (resRes.data || []) as BoardResolution[];
      const votes = (voteRes.data || []) as CommitteeVote[];

      return resolutions.map(r => enrichResolution(r, votes));
    },
  });
}

/** Tek karar detayı */
export function useResolutionDetail(id: string | undefined) {
  return useQuery<ResolutionWithVotes | null>({
    queryKey: [...RES_KEY, id],
    enabled: !!id,
    staleTime: 15_000,
    queryFn: async () => {
      if (!id) return null;

      const [resRes, voteRes] = await Promise.all([
        supabase.from('board_resolutions').select('*').eq('id', id).maybeSingle(),
        supabase.from('committee_votes').select('*').eq('resolution_id', id).order('voted_at'),
      ]);

      if (resRes.error) throw resRes.error;
      if (!resRes.data) return null;

      return enrichResolution(resRes.data as BoardResolution, (voteRes.data || []) as CommitteeVote[]);
    },
  });
}

/* ────────────────────────────────────────────────────────── */
/* Mutations                                                   */
/* ────────────────────────────────────────────────────────── */

/** Oy kullan (veya güncelle) */
export function useCastVote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      resolution_id,
      member_name,
      member_title,
      vote,
      rationale,
    }: {
      resolution_id: string;
      member_name: string;
      member_title: string;
      vote: VoteChoice;
      rationale?: string;
    }) => {
      const { error } = await supabase
        .from('committee_votes')
        .upsert(
          {
            tenant_id: TENANT_ID,
            resolution_id,
            member_name,
            member_title,
            vote,
            rationale: rationale ?? null,
            voted_at: new Date().toISOString(),
          },
          { onConflict: 'resolution_id,member_name' },
        );

      if (error) {
        console.error('[useCastVote] upsert error:', error.message);
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RES_KEY });
      qc.invalidateQueries({ queryKey: VOTES_KEY });
    },
  });
}
