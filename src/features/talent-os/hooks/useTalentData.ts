import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/shared/api/supabase';
import type { TalentProfileRow, TalentSkillRow, UserCertificationRow } from '@/shared/types/talent';

export interface TalentProfileEnriched extends TalentProfileRow {
  skills: TalentSkillRow[];
  certifications: UserCertificationRow[];
}

export interface TeamStats {
  avgFatigue: number;
  totalXP: number;
  totalCerts: number;
  availableCount: number;
  topPerformer: string | null;
}

export function useTalentData() {
  const [profiles, setProfiles] = useState<TalentProfileEnriched[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [profilesRes, skillsRes, certsRes] = await Promise.all([
        supabase.from('talent_profiles').select('*').order('current_level', { ascending: false }),
        supabase.from('talent_skills').select('*').order('proficiency_level', { ascending: false }),
        supabase.from('user_certifications').select('*').eq('status', 'VERIFIED'),
      ]);

      if (profilesRes.error) throw profilesRes.error;

      const skillsByAuditor = new Map<string, TalentSkillRow[]>();
      for (const s of (skillsRes.data ?? [])) {
        const list = skillsByAuditor.get(s.auditor_id) ?? [];
        list.push(s as TalentSkillRow);
        skillsByAuditor.set(s.auditor_id, list);
      }

      const certsByUser = new Map<string, UserCertificationRow[]>();
      for (const c of (certsRes.data ?? [])) {
        const list = certsByUser.get(c.user_id) ?? [];
        list.push(c as UserCertificationRow);
        certsByUser.set(c.user_id, list);
      }

      const enriched: TalentProfileEnriched[] = (profilesRes.data ?? []).map((p) => ({
        ...(p as TalentProfileRow),
        skills: skillsByAuditor.get(p.id) ?? [],
        certifications: p.user_id ? (certsByUser.get(p.user_id) ?? []) : [],
      }));

      setProfiles(enriched);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yetenek verileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const teamStats: TeamStats = {
    avgFatigue: profiles.length
      ? Math.round(profiles.reduce((s, p) => s + p.fatigue_score, 0) / profiles.length)
      : 0,
    totalXP: profiles.reduce((s, p) => s + p.total_xp, 0),
    totalCerts: profiles.reduce((s, p) => s + p.certifications.length, 0),
    availableCount: profiles.filter((p) => p.is_available).length,
    topPerformer: profiles.length > 0 ? profiles[0].full_name : null,
  };

  return { profiles, loading, error, refetch: load, teamStats };
}
