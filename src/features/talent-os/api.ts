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

export interface TrainingRecord {
  id: string;
  user_id: string;
  training_title: string;
  training_type: string;
  hours: number;
  cpe_credits: number;
  completed_date: string | null;
}

export async function fetchTrainingRecords(): Promise<TrainingRecord[]> {
  const { data } = await supabase
    .from('training_records')
    .select('*')
    .order('completed_date', { ascending: false });
  return (data || []) as TrainingRecord[];
}

export async function upsertTalentSkill(params: {
  auditorId: string;
  skillName: string;
  proficiencyLevel: number;
  tenantId: string;
}): Promise<void> {
  const { data: existing } = await supabase
    .from('talent_skills')
    .select('id')
    .eq('auditor_id', params.auditorId)
    .eq('skill_name', params.skillName)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('talent_skills')
      .update({ proficiency_level: params.proficiencyLevel })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('talent_skills').insert({
      auditor_id: params.auditorId,
      skill_name: params.skillName,
      proficiency_level: params.proficiencyLevel,
      tenant_id: params.tenantId,
    });
    if (error) throw error;
  }
}
