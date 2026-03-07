/**
 * Wave 84: Hunter's Guild Gamification — Supabase Data Layer
 *
 * Hooks for auditor_profiles, auditor_xp_logs, earned_badges.
 *
 * DEFENSIVE PROGRAMMING:
 *   - Mathematically safe Progress calculation: Math.min((total_xp / (xp_to_next_level || 1)) * 100, 100)
 *   - Array mappings safeguarded with `(data ?? [])`
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface AuditorProfile {
  id: string;
  tenant_id: string;
  full_name: string;
  title: string;
  department: string;
  current_level: number;
  total_xp: number;
  xp_to_next_level: number;
  rank_name: string;
}

export interface EarnedBadge {
  id: string;
  auditor_id: string;
  badge_name: string;
  badge_icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  earned_at: string;
}

export interface AuditorXPLog {
  id: string;
  auditor_id: string;
  action_type: string;
  xp_awarded: number;
  description: string;
  awarded_at: string;
}

export interface LeaderboardEntry extends AuditorProfile {
  badges: EarnedBadge[];
}

// ---------------------------------------------------------------------------
// HOOK: Get Leaderboard
// ---------------------------------------------------------------------------
export function useLeaderboard() {
  return useQuery({
    queryKey: ['gamification-leaderboard'],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      // 1. Fetch profiles ordered by XP
      const { data: profiles, error: profErr } = await supabase
        .from('auditor_profiles')
        .select('*')
        .order('total_xp', { ascending: false });

      if (profErr || !profiles) {
        console.error('useLeaderboard: profile query failed', profErr?.message);
        return [];
      }

      // 2. Fetch badges to attach to profiles
      const { data: badges, error: badgeErr } = await supabase
        .from('earned_badges')
        .select('*');

      if (badgeErr) {
         console.warn('Could not fetch badges, continuing with empty array');
      }

      const safeBadges = (badges ?? []) as EarnedBadge[];

      // 3. Map and Join
      return (profiles as AuditorProfile[]).map(prof => ({
        ...prof,
        badges: safeBadges.filter(b => b.auditor_id === prof.id)
      }));
    },
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// HOOK: Get Recent XP Logs (Global Feed)
// ---------------------------------------------------------------------------
export function useGuildActivityLogs(limit = 10) {
  return useQuery({
    queryKey: ['gamification-logs', limit],
    queryFn: async (): Promise<(AuditorXPLog & { auditor: { full_name: string } })[]> => {
      const { data, error } = await supabase
        .from('auditor_xp_logs')
        .select(`
          *,
          auditor:auditor_profiles!inner(full_name)
        `)
        .order('awarded_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('useGuildActivityLogs: query failed', error.message);
        return [];
      }
      return (data ?? []) as any;
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}
