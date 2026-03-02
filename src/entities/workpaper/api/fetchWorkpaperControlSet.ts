/**
 * Çalışma Kağıtları (Akıllı Çalışma Kağıtları) grid verisi.
 * workpapers + audit_steps birleştirilerek ControlRow[] döner.
 * FSD: Veri entities katmanında; UI doğrudan supabase çağırmaz.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type { ControlRow } from '@/widgets/WorkpaperGrid';
import type { TestDesignResult, TestEffectivenessResult, ApprovalStatus } from '@/widgets/WorkpaperGrid';

const AUDITOR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function pickColor(index: number): string {
  return AUDITOR_COLORS[index % AUDITOR_COLORS.length];
}

interface WorkpaperRow {
  id: string;
  approval_status: string | null;
  data: Record<string, unknown> | null;
  assigned_auditor_id: string | null;
  prepared_by_name: string | null;
  audit_steps: { step_code: string; title: string; description: string | null } | null;
}

export async function fetchWorkpaperControlSet(): Promise<ControlRow[]> {
  const { data: rows, error } = await supabase
    .from('workpapers')
    .select(
      `
      id,
      approval_status,
      data,
      assigned_auditor_id,
      prepared_by_name,
      audit_steps(step_code, title, description)
    `
    )
    .order('id');

  if (error) throw error;
  const list = (rows ?? []) as WorkpaperRow[];

  return list.map((wp, index) => {
    const rawStep = wp.audit_steps;
    const step = Array.isArray(rawStep) ? rawStep[0] : rawStep;
    const d = (wp.data ?? {}) as Record<string, unknown>;
    const controlRef = (d.control_ref as string) || step?.step_code || `CTL-${index + 1}`;
    const category = (d.category as string) || 'Governance';
    const riskLevel = ((d.risk_level as string) || 'MEDIUM') as 'HIGH' | 'MEDIUM' | 'LOW';
    const tod = (d.tod as TestDesignResult) || 'NOT_STARTED';
    const toe = (d.toe as TestEffectivenessResult) || 'NOT_STARTED';
    const sampleSize = typeof d.sample_size === 'number' ? d.sample_size : 20;

    const auditorId = wp.assigned_auditor_id ?? '';
    const auditorName =
      (wp.prepared_by_name && wp.prepared_by_name.trim() !== '')
        ? wp.prepared_by_name
        : (wp.assigned_auditor_id ? 'Müfettiş' : 'Atanmadı');

    return {
      id: wp.id,
      control_id: controlRef,
      title: step?.title ?? controlRef,
      description: step?.description ?? '',
      category,
      tod,
      toe,
      sample_size: sampleSize,
      auditor: {
        id: auditorId,
        name: auditorName,
        initials: getInitials(auditorName),
        color: pickColor(index),
      },
      risk_level: riskLevel,
      approval_status: (wp.approval_status as ApprovalStatus) || 'in_progress',
    } satisfies ControlRow;
  });
}

export const WORKPAPER_CONTROL_SET_KEY = ['workpaper-control-set'] as const;

export function useWorkpaperControlSet() {
  return useQuery({
    queryKey: WORKPAPER_CONTROL_SET_KEY,
    queryFn: fetchWorkpaperControlSet,
  });
}
