import { usePlanningStore } from '@/entities/planning/model/store';
import { useWorkpaperStore as useExecutionStore } from '@/entities/execution/model/store';
import { useWorkpaperStore } from '@/entities/workpaper/model/store';
import { supabase } from '@/shared/api/supabase';
import type { ActiveEngagement } from '@/entities/execution/model/types';

const TENANT_ID = '11111111-1111-1111-1111-111111111111';

export interface LaunchEngagementPayload {
  draftEngagementId: string;
  auditorIds: string[];
  planId?: string;
}

export interface LaunchResult {
  success: boolean;
  engagementId: string;
  workpaperCount: number;
  stepCount: number;
  error?: string;
}

const DEFAULT_STEP_CONFIGS = [
  {
    code: 'PLAN-01',
    title: 'Planlama ve Kapsam Belirleme',
    description: 'Denetim amacı, kapsamı ve yaklaşımının belirlenmesi; risk değerlendirmesinin yapılması.',
    risk_weight: 0.2,
  },
  {
    code: 'EXEC-01',
    title: 'Kontrol Testi ve Saha Çalışması',
    description: 'Temel iç kontrollerin tasarım ve operasyonel etkinliğinin test edilmesi.',
    risk_weight: 0.4,
  },
  {
    code: 'RPT-01',
    title: 'Bulgu Derleme ve Raporlama',
    description: 'Tespit edilen bulguların sınıflandırılması, yönetim görüşlerinin alınması ve rapor hazırlanması.',
    risk_weight: 0.4,
  },
];

export async function launchEngagement(
  payload: LaunchEngagementPayload,
): Promise<LaunchResult> {
  const { draftEngagementId, auditorIds, planId } = payload;
  const primaryAuditorId = auditorIds[0] ?? undefined;

  const planningStore = usePlanningStore.getState();
  const draft = planningStore.draftEngagements.find((d) => d.id === draftEngagementId);

  if (!draft) {
    return { success: false, engagementId: '', workpaperCount: 0, stepCount: 0, error: 'Taslak denetim bulunamadı.' };
  }

  const engagementId = crypto.randomUUID();
  const now = new Date().toISOString();
  const startDate = now.slice(0, 10);
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const { error: engError } = await supabase.from('audit_engagements').insert({
    id: engagementId,
    tenant_id: TENANT_ID,
    plan_id: planId ?? null,
    entity_id: draft.universeNodeId,
    title: `${draft.universeNodeName} — Denetim`,
    status: 'IN_PROGRESS',
    audit_type: 'COMPREHENSIVE',
    start_date: startDate,
    end_date: endDate,
    risk_snapshot_score: Math.round(draft.cascadeRisk),
    estimated_hours: 80,
    actual_hours: 0,
  });

  if (engError) {
    return { success: false, engagementId, workpaperCount: 0, stepCount: 0, error: engError.message };
  }

  const stepRows = DEFAULT_STEP_CONFIGS.map((cfg) => ({
    id: crypto.randomUUID(),
    engagement_id: engagementId,
    step_code: cfg.code,
    title: cfg.title,
    description: cfg.description,
  }));

  const { error: stepError } = await supabase.from('audit_steps').insert(stepRows);
  if (stepError) {
    return { success: false, engagementId, workpaperCount: 0, stepCount: 0, error: stepError.message };
  }

  const wpRows = stepRows.map((step) => ({
    id: crypto.randomUUID(),
    step_id: step.id,
    status: 'draft',
    data: {},
  }));

  const { error: wpError } = await supabase.from('workpapers').insert(wpRows);
  if (wpError) {
    return { success: false, engagementId, workpaperCount: 0, stepCount: 0, error: wpError.message };
  }

  const workpaperStore = useWorkpaperStore.getState();
  const { workpapers: newWorkpapers } = workpaperStore.initializeWorkpapersForEngagement(
    engagementId,
    DEFAULT_STEP_CONFIGS,
    primaryAuditorId,
  );

  const activeEngagement: ActiveEngagement = {
    id: engagementId,
    draftEngagementId,
    title: `${draft.universeNodeName} — Denetim`,
    entityId: draft.universeNodeId,
    entityName: draft.universeNodeName,
    auditType: 'COMPREHENSIVE',
    assignedAuditorIds: auditorIds,
    requiredSkills: draft.requiredSkills,
    riskScore: draft.cascadeRisk,
    startDate,
    endDate,
    status: 'ACTIVE',
    launchedAt: now,
    workpaperIds: newWorkpapers.map((wp) => wp.id),
    tenantId: TENANT_ID,
  };

  useExecutionStore.getState().addActiveEngagement(activeEngagement);

  planningStore.removeDraftEngagement(draftEngagementId);

  planningStore.addEngagement({
    tenant_id: TENANT_ID,
    plan_id: planId ?? '',
    entity_id: draft.universeNodeId,
    title: `${draft.universeNodeName} — Denetim`,
    audit_type: 'COMPREHENSIVE',
    start_date: startDate,
    end_date: endDate,
    risk_snapshot_score: Math.round(draft.cascadeRisk),
    estimated_hours: 80,
  });

  return {
    success: true,
    engagementId,
    workpaperCount: newWorkpapers.length,
    stepCount: stepRows.length,
  };
}
