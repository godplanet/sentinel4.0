import { supabase } from '@/shared/api/supabase';
import type { TalentProfile, TalentSkill, AuditServiceTemplate, TalentProfileWithSkills } from './types';

export async function fetchTalentProfiles(): Promise<TalentProfile[]> {
  const { data, error } = await supabase
    .from('talent_profiles')
    .select('*')
    .order('current_level', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchTalentSkills(auditorId?: string): Promise<TalentSkill[]> {
  let query = supabase
    .from('talent_skills')
    .select('*')
    .order('proficiency_level', { ascending: false });

  if (auditorId) {
    query = query.eq('auditor_id', auditorId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchServiceTemplates(): Promise<AuditServiceTemplate[]> {
  const { data, error } = await supabase
    .from('audit_service_templates')
    .select('*')
    .order('service_name');

  if (error) throw error;
  return data || [];
}

export async function fetchProfilesWithSkills(): Promise<TalentProfileWithSkills[]> {
  const [profiles, skills] = await Promise.all([
    fetchTalentProfiles(),
    fetchTalentSkills(),
  ]);

  const skillsByAuditor = new Map<string, TalentSkill[]>();
  for (const skill of skills) {
    const list = skillsByAuditor.get(skill.auditor_id) || [];
    list.push(skill);
    skillsByAuditor.set(skill.auditor_id, list);
  }

  return profiles.map((p) => ({
    ...p,
    skills: skillsByAuditor.get(p.id) || [],
  }));
}

export async function updateHourlyRate(
  auditorId: string,
  hourlyRate: number,
  currency = 'TRY',
): Promise<void> {
  const { error } = await supabase
    .from('talent_profiles')
    .update({ hourly_rate: hourlyRate, currency })
    .eq('id', auditorId);

  if (error) throw error;
}
