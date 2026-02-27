/**
 * AUDIT UNIVERSE TAXONOMY API
 * Constitutional integration with ltree-based hierarchy
 */

import { supabase } from '@/shared/api/supabase';
import { SENTINEL_CONSTITUTION, ConstitutionUtils } from '@/shared/config';

export interface TaxonomyEntity {
  id: string;
  tenant_id: string;
  path: string;
  name: string;
  type: 'DOMAIN' | 'PROCESS' | 'SUB_PROCESS' | 'RISK' | 'CONTROL';
  risk_weight: number;
  description: string;
  created_at: string;

  // Computed fields (not in DB)
  depth?: number;
  parent_path?: string;
  children?: TaxonomyEntity[];
  inherent_risk_score?: number;
  risk_zone?: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  risk_color?: string;
}

export interface RiskParams {
  impact: number;
  likelihood: number;
  velocity?: number;
  control_effectiveness?: number;
  transaction_volume?: number;
}

/**
 * Calculate risk scores using Constitutional formula
 */
export function calculateRiskScores(params: RiskParams) {
  const {
    impact,
    likelihood,
    velocity = 1.0,
    control_effectiveness = 0,
    transaction_volume = 0,
  } = params;

  // Constitutional formula: Impact * Likelihood * Velocity
  const inherent = Math.min(
    Math.round(impact * likelihood * velocity),
    SENTINEL_CONSTITUTION.RISK.MAX_SCORE
  );

  // Residual: Inherent * (1 - Control_Effectiveness)
  const residual = Math.min(
    Math.round(inherent * (1 - control_effectiveness)),
    SENTINEL_CONSTITUTION.RISK.MAX_SCORE
  );

  // Determine zone
  let zone: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' = 'GREEN';
  if (residual >= SENTINEL_CONSTITUTION.RISK.ZONES.RED.min) zone = 'RED';
  else if (residual >= SENTINEL_CONSTITUTION.RISK.ZONES.ORANGE.min) zone = 'ORANGE';
  else if (residual >= SENTINEL_CONSTITUTION.RISK.ZONES.YELLOW.min) zone = 'YELLOW';

  const color = ConstitutionUtils.getRiskZoneColor(residual);

  return {
    inherent_risk_score: inherent,
    residual_risk_score: residual,
    risk_zone: zone,
    risk_color: color,
  };
}

/**
 * Enrich taxonomy entity with computed risk scores
 */
function enrichEntity(entity: TaxonomyEntity): TaxonomyEntity {
  // Extract risk params from risk_weight (simplified mapping)
  const impact = Math.min(Math.ceil((entity.risk_weight || 1) / 5), 5);
  const likelihood = Math.min(Math.ceil((entity.risk_weight || 1) / 3), 5);

  const scores = calculateRiskScores({ impact, likelihood });

  return {
    ...entity,
    depth: entity.path ? entity.path.split('.').length : 0,
    parent_path: entity.path ? entity.path.split('.').slice(0, -1).join('.') : undefined,
    ...scores,
  };
}

/**
 * Get all root domains
 */
export async function getRootDomains() {
  const { data, error } = await supabase
    .from('risk_taxonomy')
    .select('*')
    .eq('type', 'DOMAIN')
    .is('path', null)
    .or('path.eq.null,nlevel(path).eq.1')
    .order('name');

  if (error) throw error;
  return (data || []).map(enrichEntity);
}

/**
 * Get direct children of a path
 */
export async function getDirectChildren(parentPath: string) {
  const { data, error } = await supabase
    .from('risk_taxonomy')
    .select('*')
    .like('path', `${parentPath}.%`)
    .order('name');

  if (error) throw error;

  // Filter to direct children only
  const directChildren = (data || []).filter(item => {
    if (!item.path) return false;
    const parts = item.path.split('.');
    const parentParts = parentPath.split('.');
    return parts.length === parentParts.length + 1;
  });

  return directChildren.map(enrichEntity);
}

/**
 * Get entire subtree (all descendants)
 */
export async function getSubtree(rootPath: string) {
  const { data, error } = await supabase
    .from('risk_taxonomy')
    .select('*')
    .or(`path.eq.${rootPath},path.like.${rootPath}.%`)
    .order('path');

  if (error) throw error;
  return (data || []).map(enrichEntity);
}

/**
 * Get entity by ID
 */
export async function getEntityById(id: string) {
  const { data, error } = await supabase
    .from('risk_taxonomy')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return enrichEntity(data);
}

/**
 * Get entity by path
 */
export async function getEntityByPath(path: string) {
  const { data, error } = await supabase
    .from('risk_taxonomy')
    .select('*')
    .eq('path', path)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return enrichEntity(data);
}

/**
 * Search taxonomy
 */
export async function searchTaxonomy(query: string) {
  const { data, error } = await supabase
    .from('risk_taxonomy')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(50);

  if (error) throw error;
  return (data || []).map(enrichEntity);
}

/**
 * Get risk summary by type
 */
export async function getRiskSummaryByType(entityType?: string) {
  let query = supabase
    .from('risk_taxonomy')
    .select('type, risk_weight');

  if (entityType) {
    query = query.eq('type', entityType);
  }

  const { data, error } = await query;

  if (error) throw error;

  const summary = (data || []).reduce((acc, item) => {
    const type = item.type || 'UNKNOWN';
    if (!acc[type]) {
      acc[type] = { count: 0, totalWeight: 0, avgWeight: 0 };
    }
    acc[type].count++;
    acc[type].totalWeight += item.risk_weight || 0;
    return acc;
  }, {} as Record<string, { count: number; totalWeight: number; avgWeight: number }>);

  // Calculate averages
  Object.keys(summary).forEach(type => {
    summary[type].avgWeight = summary[type].totalWeight / summary[type].count;
  });

  return summary;
}

/**
 * Get top risks (constitutional alignment)
 */
export async function getTopRisks(limit = 10) {
  const { data, error } = await supabase
    .from('risk_taxonomy')
    .select('*')
    .eq('type', 'RISK')
    .order('risk_weight', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []).map(enrichEntity);
}

/**
 * Create new taxonomy entity
 */
export async function createEntity(entity: Partial<TaxonomyEntity> & { name: string; type: string }) {
  const { data, error } = await supabase
    .from('risk_taxonomy')
    .insert({
      name: entity.name,
      type: entity.type,
      path: entity.path || null,
      description: entity.description || null,
      risk_weight: entity.risk_weight || 1,
    })
    .select()
    .single();

  if (error) throw error;
  return enrichEntity(data);
}

/**
 * Update taxonomy entity
 */
export async function updateEntity(id: string, updates: Partial<TaxonomyEntity>) {
  const { data, error } = await supabase
    .from('risk_taxonomy')
    .update({
      name: updates.name,
      description: updates.description,
      risk_weight: updates.risk_weight,
      type: updates.type,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return enrichEntity(data);
}

/**
 * Delete taxonomy entity
 */
export async function deleteEntity(id: string) {
  const { error } = await supabase
    .from('risk_taxonomy')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

/**
 * Build hierarchical tree from flat list
 */
export function buildTree(entities: TaxonomyEntity[]): TaxonomyEntity[] {
  const map = new Map<string, TaxonomyEntity>();
  const roots: TaxonomyEntity[] = [];

  // First pass: create map
  entities.forEach(entity => {
    map.set(entity.path, { ...entity, children: [] });
  });

  // Second pass: build tree
  entities.forEach(entity => {
    const node = map.get(entity.path)!;
    if (entity.parent_path && map.has(entity.parent_path)) {
      const parent = map.get(entity.parent_path)!;
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

/**
 * Get breadcrumb trail for an entity
 */
export function getBreadcrumbs(entity: TaxonomyEntity): Array<{ name: string; path: string }> {
  if (!entity.path) return [];

  const parts = entity.path.split('.');
  const breadcrumbs: Array<{ name: string; path: string }> = [];

  for (let i = 0; i < parts.length; i++) {
    const path = parts.slice(0, i + 1).join('.');
    breadcrumbs.push({
      name: parts[i],
      path,
    });
  }

  return breadcrumbs;
}
