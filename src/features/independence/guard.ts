import { supabase } from '@/shared/api/supabase';

export interface ConflictCheckResult {
  allowed: boolean;
  conflict?: {
    engagementEndDate: string;
    coolingOffExpiresAt: string;
    engagementId: string;
  };
}

export async function checkAssignmentValidity(
  auditorId: string,
  entityId: string,
  type: 'ASSURANCE' | 'ADVISORY',
): Promise<ConflictCheckResult> {
  if (type === 'ASSURANCE') {
    const { data, error } = await supabase
      .from('independence_conflict_log')
      .select('id, engagement_id, engagement_end_date, cooling_off_expires_at')
      .eq('auditor_id', auditorId)
      .eq('entity_id', entityId)
      .gte('cooling_off_expires_at', new Date().toISOString().split('T')[0])
      .order('cooling_off_expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      return {
        allowed: false,
        conflict: {
          engagementEndDate: data.engagement_end_date,
          coolingOffExpiresAt: data.cooling_off_expires_at,
          engagementId: data.engagement_id,
        },
      };
    }
  }

  return { allowed: true };
}

export async function logAdvisoryConflict(
  auditorId: string,
  entityId: string,
  engagementId: string,
  engagementEndDate: string,
): Promise<void> {
  const { error } = await supabase
    .from('independence_conflict_log')
    .insert({
      auditor_id: auditorId,
      entity_id: entityId,
      engagement_id: engagementId,
      engagement_end_date: engagementEndDate,
    });
  if (error) throw error;
}
