/**
 * CONFLICT DETECTION ENGINE
 *
 * Prevents double-booking and detects burnout risk.
 *
 * Core Algorithm:
 * 1. Check overlapping engagements (date range intersection)
 * 2. Check auditor fatigue zone from Talent OS
 * 3. Generate warnings: "Auditor has N concurrent audits" + "BURNOUT RISK"
 */

import { supabase } from '@/shared/api/supabase';
import type { BurnoutZone } from '@/features/talent-os/types';

export interface ConflictCheck {
  hasConflict: boolean;
  overlappingEngagements: OverlappingEngagement[];
  fatigueWarning: FatigueWarning | null;
  warnings: string[];
}

export interface OverlappingEngagement {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: string;
  overlap_days: number;
}

export interface FatigueWarning {
  burnout_zone: BurnoutZone;
  fatigue_score: number;
  active_hours_last_3_weeks: number;
  consecutive_high_stress_projects: number;
  message: string;
}

export interface AuditorAvailability {
  auditor_id: string;
  full_name: string;
  title: string;
  is_available: boolean;
  burnout_zone: BurnoutZone;
  conflict_count: number;
  fit_score?: number;
}

/**
 * Main conflict checker
 * Checks for overlapping engagements and fatigue warnings
 */
export async function checkAuditorConflicts(
  auditorId: string,
  startDate: string,
  endDate: string,
  excludeEngagementId?: string
): Promise<ConflictCheck> {
  const warnings: string[] = [];

  // Step 1: Check overlapping engagements
  let query = supabase
    .from('audit_engagements')
    .select('id, title, start_date, end_date, status')
    .eq('assigned_auditor_id', auditorId)
    .not('status', 'in', '(COMPLETED,CANCELLED)')
    .lte('start_date', endDate)
    .gte('end_date', startDate);

  if (excludeEngagementId) {
    query = query.neq('id', excludeEngagementId);
  }

  const { data: overlaps, error: overlapError } = await query;

  if (overlapError) {
    throw new Error(`Failed to check conflicts: ${overlapError.message}`);
  }

  const overlappingEngagements: OverlappingEngagement[] = (overlaps || []).map((eng) => {
    const overlapStart = new Date(Math.max(new Date(eng.start_date).getTime(), new Date(startDate).getTime()));
    const overlapEnd = new Date(Math.min(new Date(eng.end_date).getTime(), new Date(endDate).getTime()));
    const overlapDays = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return {
      id: eng.id,
      title: eng.title,
      start_date: eng.start_date,
      end_date: eng.end_date,
      status: eng.status,
      overlap_days: overlapDays,
    };
  });

  if (overlappingEngagements.length > 0) {
    warnings.push(`Auditor has ${overlappingEngagements.length} concurrent audit${overlappingEngagements.length > 1 ? 's' : ''}.`);
  }

  // Step 2: Check fatigue from Talent OS
  const { data: profile, error: profileError } = await supabase
    .from('talent_profiles')
    .select('fatigue_score, burnout_zone, active_hours_last_3_weeks, consecutive_high_stress_projects')
    .eq('user_id', auditorId)
    .maybeSingle();

  let fatigueWarning: FatigueWarning | null = null;

  if (profile) {
    if (profile.burnout_zone === 'RED') {
      fatigueWarning = {
        burnout_zone: profile.burnout_zone,
        fatigue_score: profile.fatigue_score,
        active_hours_last_3_weeks: profile.active_hours_last_3_weeks,
        consecutive_high_stress_projects: profile.consecutive_high_stress_projects,
        message: '⚠️ BURNOUT RISK - Auditor is in RED zone',
      };
      warnings.push('⚠️ BURNOUT RISK - Auditor is in RED zone');
    } else if (profile.burnout_zone === 'AMBER') {
      fatigueWarning = {
        burnout_zone: profile.burnout_zone,
        fatigue_score: profile.fatigue_score,
        active_hours_last_3_weeks: profile.active_hours_last_3_weeks,
        consecutive_high_stress_projects: profile.consecutive_high_stress_projects,
        message: '⚠️ High fatigue - Auditor is in AMBER zone',
      };
      warnings.push('⚠️ High fatigue - Auditor is in AMBER zone');
    }
  }

  return {
    hasConflict: overlappingEngagements.length > 0 || profile?.burnout_zone === 'RED',
    overlappingEngagements,
    fatigueWarning,
    warnings,
  };
}

/**
 * Get available auditors (no conflicts, GREEN zone preferred)
 * Sorted by: GREEN zone first, then by lowest conflict count
 */
export async function getAvailableAuditors(
  startDate: string,
  endDate: string
): Promise<AuditorAvailability[]> {
  // Get all auditors with their talent profiles
  const { data: auditors, error } = await supabase
    .from('talent_profiles')
    .select('user_id, full_name, title, is_available, burnout_zone, fatigue_score')
    .eq('is_available', true)
    .order('burnout_zone', { ascending: true }); // GREEN < AMBER < RED

  if (error || !auditors) {
    return [];
  }

  const availability: AuditorAvailability[] = [];

  for (const auditor of auditors) {
    if (!auditor.user_id) continue;

    const conflictCheck = await checkAuditorConflicts(auditor.user_id, startDate, endDate);

    availability.push({
      auditor_id: auditor.user_id,
      full_name: auditor.full_name,
      title: auditor.title,
      is_available: auditor.is_available,
      burnout_zone: auditor.burnout_zone,
      conflict_count: conflictCheck.overlappingEngagements.length,
    });
  }

  // Sort: GREEN with 0 conflicts first
  availability.sort((a, b) => {
    if (a.burnout_zone !== b.burnout_zone) {
      const zoneOrder = { GREEN: 0, AMBER: 1, RED: 2 };
      return zoneOrder[a.burnout_zone] - zoneOrder[b.burnout_zone];
    }
    return a.conflict_count - b.conflict_count;
  });

  return availability;
}

/**
 * Smart auditor recommendation
 * Returns best fit auditor with AI scoring (0-100)
 */
export async function suggestAuditorForEngagement(
  startDate: string,
  endDate: string,
  requiredSkills?: Record<string, number>
): Promise<AuditorAvailability[]> {
  const available = await getAvailableAuditors(startDate, endDate);

  // AI Scoring: 100 = perfect
  return available.map((auditor) => {
    let score = 100;

    // Deduct for conflicts
    score -= auditor.conflict_count * 20;

    // Deduct for fatigue
    if (auditor.burnout_zone === 'AMBER') score -= 30;
    if (auditor.burnout_zone === 'RED') score -= 70;

    // Ensure 0-100 range
    score = Math.max(0, Math.min(100, score));

    return { ...auditor, fit_score: score };
  }).sort((a, b) => (b.fit_score || 0) - (a.fit_score || 0));
}

/**
 * Validate assignment (blocks RED zone)
 */
export async function validateEngagementAssignment(
  auditorId: string,
  startDate: string,
  endDate: string
): Promise<{ valid: boolean; blockReason?: string }> {
  const check = await checkAuditorConflicts(auditorId, startDate, endDate);

  if (check.fatigueWarning?.burnout_zone === 'RED') {
    return {
      valid: false,
      blockReason: 'Auditor is in RED burnout zone. Assignment blocked for health protection.',
    };
  }

  return { valid: true };
}

/**
 * Get auditor workload summary
 */
export async function getAuditorConflictSummary(auditorId: string): Promise<{
  active_engagements: number;
  total_hours_committed: number;
  burnout_zone: BurnoutZone;
  can_accept_more: boolean;
}> {
  // Count active engagements
  const { data: engagements, error: engError } = await supabase
    .from('audit_engagements')
    .select('estimated_hours')
    .eq('assigned_auditor_id', auditorId)
    .in('status', ['PLANNING', 'IN_PROGRESS']);

  const activeCount = engagements?.length || 0;
  const totalHours = engagements?.reduce((sum, e) => sum + (e.estimated_hours || 0), 0) || 0;

  // Get burnout zone
  const { data: profile } = await supabase
    .from('talent_profiles')
    .select('burnout_zone')
    .eq('user_id', auditorId)
    .maybeSingle();

  const zone = (profile?.burnout_zone as BurnoutZone) || 'GREEN';

  return {
    active_engagements: activeCount,
    total_hours_committed: totalHours,
    burnout_zone: zone,
    can_accept_more: zone !== 'RED' && activeCount < 3,
  };
}
