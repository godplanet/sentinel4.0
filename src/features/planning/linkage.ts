/**
 * UNIVERSE TO ENGAGEMENT LINKAGE
 * Batch creation of audit engagements from universe entities
 */

import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';
import type { AuditEntity } from '@/entities/universe/model/types';
import type { AuditEngagement } from '@/entities/planning/model/types';
import {
  calculateAuditBudget,
  getSuggestedAuditType,
  generateAuditPeriod,
  type ScopingInput,
} from './scoping';

const TENANT_ID = ACTIVE_TENANT_ID;

export interface BulkCreationInput {
  entity_ids: string[];
  plan_id: string;
  year: number;
  audit_type_override?: string;
  assigned_auditor_id?: string;
}

export interface BulkCreationResult {
  success: boolean;
  created_count: number;
  engagements: AuditEngagement[];
  errors: Array<{ entity_id: string; error: string }>;
  summary: {
    total_hours: number;
    avg_risk_score: number;
    by_audit_type: Record<string, number>;
    by_risk_category: Record<string, number>;
  };
}

export async function createEngagementsFromEntities(
  input: BulkCreationInput
): Promise<BulkCreationResult> {
  const result: BulkCreationResult = {
    success: false,
    created_count: 0,
    engagements: [],
    errors: [],
    summary: {
      total_hours: 0,
      avg_risk_score: 0,
      by_audit_type: {},
      by_risk_category: {},
    },
  };

  try {
    const { data: entities, error: fetchError } = await supabase
      .from('audit_entities')
      .select('*')
      .in('id', input.entity_ids);

    if (fetchError) {
      throw new Error(`Failed to fetch entities: ${fetchError.message}`);
    }

    if (!entities || entities.length === 0) {
      throw new Error('No entities found');
    }

    const engagementsToCreate = [];
    let totalRisk = 0;

    for (const entity of entities as AuditEntity[]) {
      try {
        const riskScore = entity.risk_score || 50;
        const velocityMultiplier = entity.velocity_multiplier || 1.0;

        const scopingInput: ScopingInput = {
          risk_score: riskScore,
          velocity_multiplier: velocityMultiplier,
          entity_type: entity.type,
        };

        const scopingResult = calculateAuditBudget(scopingInput);

        const auditType = input.audit_type_override || getSuggestedAuditType(entity.type, riskScore);

        const { start_date, end_date } = generateAuditPeriod(riskScore, input.year);

        const engagement = {
          tenant_id: TENANT_ID,
          plan_id: input.plan_id,
          entity_id: entity.id,
          title: `${input.year} ${auditType} - ${entity.name}`,
          audit_type: auditType,
          status: 'PLANNED',
          start_date,
          end_date,
          risk_snapshot_score: riskScore,
          estimated_hours: scopingResult.estimated_hours,
          actual_hours: 0,
          assigned_auditor_id: input.assigned_auditor_id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        engagementsToCreate.push(engagement);
        totalRisk += riskScore;

        const riskCategory = scopingResult.calculation_notes[0] || 'Medium';
        result.summary.by_audit_type[auditType] =
          (result.summary.by_audit_type[auditType] || 0) + 1;
        result.summary.by_risk_category[riskCategory] =
          (result.summary.by_risk_category[riskCategory] || 0) + 1;
        result.summary.total_hours += scopingResult.estimated_hours;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        result.errors.push({
          entity_id: entity.id,
          error: errorMessage,
        });
      }
    }

    if (engagementsToCreate.length === 0) {
      throw new Error('No valid engagements to create');
    }

    const { data: created, error: insertError } = await supabase
      .from('audit_engagements')
      .insert(engagementsToCreate)
      .select();

    if (insertError) {
      throw new Error(`Failed to create engagements: ${insertError.message}`);
    }

    result.success = true;
    result.created_count = created?.length || 0;
    result.engagements = created as AuditEngagement[];
    result.summary.avg_risk_score = totalRisk / entities.length;

    return result;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Bulk creation failed:', errorMessage);
    throw error;
  }
}

export async function getAuditableEntities(filters?: {
  min_risk_score?: number;
  entity_types?: string[];
  exclude_audited_in_year?: number;
}): Promise<AuditEntity[]> {
  let query = supabase
    .from('audit_entities')
    .select('*')
    .eq('tenant_id', TENANT_ID)
    .order('risk_score', { ascending: false });

  if (filters?.min_risk_score) {
    query = query.gte('risk_score', filters.min_risk_score);
  }

  if (filters?.entity_types && filters.entity_types.length > 0) {
    query = query.in('type', filters.entity_types);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch auditable entities: ${error.message}`);
  }

  let entities = (data || []) as AuditEntity[];

  if (filters?.exclude_audited_in_year) {
    const { data: recentEngagements } = await supabase
      .from('audit_engagements')
      .select('entity_id')
      .gte('start_date', `${filters.exclude_audited_in_year}-01-01`)
      .lte('end_date', `${filters.exclude_audited_in_year}-12-31`);

    const auditedEntityIds = new Set(
      recentEngagements?.map((e) => e.entity_id) || []
    );
    entities = entities.filter((e) => !auditedEntityIds.has(e.id));
  }

  return entities;
}

export async function getDefaultPlanId(): Promise<string> {
  const currentYear = new Date().getFullYear();

  const { data: existingPlan } = await supabase
    .from('audit_plans')
    .select('id')
    .eq('year', currentYear)
    .eq('tenant_id', TENANT_ID)
    .maybeSingle();

  if (existingPlan) {
    return existingPlan.id;
  }

  const { data: newPlan, error } = await supabase
    .from('audit_plans')
    .insert({
      tenant_id: TENANT_ID,
      year: currentYear,
      title: `Annual Audit Plan ${currentYear}`,
      status: 'DRAFT',
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error || !newPlan) {
    throw new Error('Failed to create default plan');
  }

  return newPlan.id;
}
