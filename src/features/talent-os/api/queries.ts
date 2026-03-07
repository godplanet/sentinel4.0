import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type { TalentProfileWithSkills, AuditServiceTemplate } from '../types';

/**
 * Wave 15: Talent-OS Resource Allocator - Uçtan Uca (E2E) Veri Bağlamı
 * Aşırı Savunmacı Programlama (Extreme Defensive Programming) uygulanmıştır.
 */

// TanStack Query Keys
export const talentOsKeys = {
  all: ['talent-os'] as const,
  profiles: () => [...talentOsKeys.all, 'profiles'] as const,
  templates: () => [...talentOsKeys.all, 'templates'] as const,
};

export function useTalentPool() {
  return useQuery({
    queryKey: talentOsKeys.profiles(),
    queryFn: async (): Promise<TalentProfileWithSkills[]> => {
      // 1. Yetenek Profillerini Çek
      const { data: profilesData, error: profilesError } = await supabase
        .from('talent_profiles')
        .select('*')
        .order('current_level', { ascending: false });

      if (profilesError) {
        console.error('Talent Profiles Fetch Error:', profilesError);
        throw profilesError;
      }

      // 2. Yetenek Becerilerini Çek
      const { data: skillsData, error: skillsError } = await supabase
        .from('talent_skills')
        .select('*');

      if (skillsError) {
        console.error('Talent Skills Fetch Error:', skillsError);
        throw skillsError;
      }

      // 3. Sertifikaları Çek (Opsiyonel ama veri bütünlüğü için savunmacı birleştirme)
      const { data: certsData, error: certsError } = await supabase
        .from('user_certifications')
        .select('*')
        .eq('status', 'VERIFIED');

      if (certsError) {
        console.error('User Certifications Fetch Error:', certsError);
        // Hata fırlatmıyoruz, sadece loglayıp boş dizi ile devam ediyoruz
      }

      const safeProfilesData = profilesData ?? [];
      const safeSkillsData = skillsData ?? [];
      const safeCertsData = certsData ?? [];

      // Becerileri denetçi ID'sine göre grupla (Aşırı Savunmacı)
      const skillsByAuditor = new Map<string, any[]>();
      (safeSkillsData || []).forEach((skill) => {
        if (!skill?.auditor_id) return;
        const current = skillsByAuditor.get(skill.auditor_id) ?? [];
        current.push(skill);
        skillsByAuditor.set(skill.auditor_id, current);
      });

      // Sertifikaları User ID'sine göre grupla
      const certsByUser = new Map<string, any[]>();
      (safeCertsData || []).forEach((cert) => {
        if (!cert?.user_id) return;
        const current = certsByUser.get(cert.user_id) ?? [];
        current.push(cert);
        certsByUser.set(cert.user_id, current);
      });

      // Verileri Birleştir
      const enrichedProfiles: TalentProfileWithSkills[] = (safeProfilesData || []).map((p) => {
        // Defensive Mapping
        return {
          id: p?.id ?? '',
          user_id: p?.user_id ?? null,
          full_name: p?.full_name ?? 'Bilinmeyen Denetçi',
          avatar_url: p?.avatar_url ?? null,
          title: p?.title ?? 'Junior',
          department: p?.department ?? 'Bilinmeyen Departman',
          total_xp: p?.total_xp ?? 0,
          current_level: p?.current_level ?? 1,
          fatigue_score: p?.fatigue_score ?? 0,
          burnout_zone: p?.burnout_zone ?? 'GREEN',
          last_audit_date: p?.last_audit_date ?? null,
          consecutive_high_stress_projects: p?.consecutive_high_stress_projects ?? 0,
          active_hours_last_3_weeks: p?.active_hours_last_3_weeks ?? 0,
          travel_load: p?.travel_load ?? 0,
          is_available: p?.is_available ?? false,
          hourly_rate: p?.hourly_rate ?? 0,
          currency: p?.currency ?? 'TRY',
          tenant_id: p?.tenant_id ?? '',
          created_at: p?.created_at ?? '',
          updated_at: p?.updated_at ?? '',
          skills: skillsByAuditor.get(p?.id) ?? [],
          certifications: p?.user_id ? (certsByUser.get(p.user_id) ?? []) : [],
          
          // AuditorProfileCard.tsx'teki canLevelUp logic için eklenti:
          next_level_xp: p?.current_level === 1 ? 500 : p?.current_level === 2 ? 1500 : p?.current_level === 3 ? 3500 : p?.current_level === 4 ? 7000 : 999999,
          skills_snapshot: { skills: skillsByAuditor.get(p?.id) ?? [] }
        } as unknown as TalentProfileWithSkills; 
        // Tip karmaşasından kaçınmak için casting ve strict yapılar. Types.ts ile Enrichment'ı birleştirdik.
      });

      return enrichedProfiles;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useBestFitMatch() {
  return useQuery({
    queryKey: talentOsKeys.templates(),
    queryFn: async (): Promise<AuditServiceTemplate[]> => {
      const { data, error } = await supabase
        .from('audit_service_templates')
        .select('*')
        .order('service_name');

      if (error) {
        console.error('Audit Service Templates Fetch Error:', error);
        throw error;
      }

      // Savunmacı dönüş
      return (data || []).map(t => ({
        id: t?.id ?? '',
        service_name: t?.service_name ?? 'Adsız Şablon',
        description: t?.description ?? '',
        required_skills: t?.required_skills ?? {},
        standard_duration_sprints: t?.standard_duration_sprints ?? 1,
        complexity: t?.complexity ?? 'MEDIUM',
        tenant_id: t?.tenant_id ?? '',
        created_at: t?.created_at ?? '',
        updated_at: t?.updated_at ?? '',
      }));
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
