import { supabase } from '@/shared/api/supabase';
import { fetchTeamTrainingROI } from './trainingRoi';
import { XPEngine } from '@/features/talent-os/lib/XPEngine';
import type { TeamROIRow } from './trainingRoi';

interface AuditorMeta {
  user_id: string;
  full_name: string;
}

export interface EnrichedROIRow extends TeamROIRow {
  auditorName: string;
  isDiminishing: boolean;
}

export async function fetchAuditorMeta(): Promise<AuditorMeta[]> {
  const { data } = await supabase
    .from('auditor_profiles')
    .select('user_id, full_name')
    .limit(100);
  return (data ?? []) as AuditorMeta[];
}

export async function fetchManagerDashboardData(): Promise<EnrichedROIRow[]> {
  const [roiRows, profiles] = await Promise.all([
    fetchTeamTrainingROI(),
    fetchAuditorMeta(),
  ]);

  const nameMap: Record<string, string> = {};
  for (const p of profiles) nameMap[p.user_id] = p.full_name;

  const uniqueUserIds = [...new Set(roiRows.map((r) => r.userId))];
  const drMap: Record<string, boolean> = {};

  await Promise.all(
    uniqueUserIds.map(async (uid) => {
      drMap[uid] = await XPEngine.isDiminishingActive(uid);
    }),
  );

  return roiRows.map((r) => ({
    ...r,
    auditorName: nameMap[r.userId] ?? r.userId.slice(0, 8) + '…',
    isDiminishing: drMap[r.userId] ?? false,
  }));
}
