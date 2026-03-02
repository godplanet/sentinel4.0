/**
 * Neural Map – Denetim Evreni (audit_entities) tabanlı dinamik graf verisi.
 * Ltree path ile hiyerarşik düğüm ve kenar üretimi.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type { NeuralNode, NeuralEdge } from './types';

/** Supabase audit_entities satırı (Neural Map için) */
export interface AuditEntityRow {
  id: string;
  name: string;
  type: string;
  path: string;
  parent_id: string | null;
  risk_score: number | null;
  velocity_multiplier: number | null;
  metadata?: Record<string, unknown> | null;
}

const QUERY_KEY = ['neural-universe'] as const;

/**
 * audit_entities tablosundan tüm kayıtları çeker (id, name, path, type, risk_score vb.).
 * Hata durumunda throw eder; UI'da hata ekranı gösterilmeli.
 */
export async function fetchAuditEntitiesForNeural(): Promise<AuditEntityRow[]> {
  const { data, error } = await supabase
    .from('audit_entities')
    .select('id, name, type, path, parent_id, risk_score, velocity_multiplier, metadata')
    .order('path', { ascending: true });

  if (error) throw error;
  return (data ?? []) as AuditEntityRow[];
}

/**
 * Ltree path ile hiyerarşik kenar üretir.
 * Örn: path "hq.retail.cards" → parent path "hq.retail" → ilgili entity'den bu entity'ye Edge.
 */
function buildEdgesFromPathHierarchy(
  entities: AuditEntityRow[],
  pathToEntity: Map<string, AuditEntityRow>
): NeuralEdge[] {
  const edges: NeuralEdge[] = [];
  const seen = new Set<string>();

  for (const entity of entities) {
    const pathStr = typeof entity.path === 'string' ? entity.path : String(entity.path ?? '');
    const segments = pathStr.split('.').filter(Boolean);
    if (segments.length < 2) continue;

    const parentPath = segments.slice(0, -1).join('.');
    const parent = pathToEntity.get(parentPath);
    if (!parent) continue;

    const edgeId = `${parent.id}-${entity.id}`;
    if (seen.has(edgeId)) continue;
    seen.add(edgeId);

    const dependencyWeight = calculateDependencyWeight(
      entity.type,
      parent.type,
      typeof entity.risk_score === 'number' ? entity.risk_score : 50
    );

    edges.push({
      id: edgeId,
      source: parent.id,
      target: entity.id,
      dependencyWeight,
      type: 'hierarchical',
    });
  }

  return edges;
}

function calculateDependencyWeight(
  childType: string,
  parentType: string,
  childRisk: number
): number {
  let baseWeight = 0.5;
  if (parentType === 'HOLDING' || parentType === 'HEADQUARTERS') baseWeight = 0.7;
  else if (parentType === 'GROUP') baseWeight = 0.6;
  else if (parentType === 'DEPARTMENT' || parentType === 'BANK') baseWeight = 0.65;
  if (childType === 'PROCESS') baseWeight += 0.15;
  const riskFactor = (childRisk / 100) * 0.2;
  return Math.min(0.95, Math.max(0.3, baseWeight + riskFactor));
}

/**
 * audit_entities listesini React Flow / Neural Map için Node[] ve Edge[] formatına dönüştürür.
 * Edge mantığı: ltree path parçalama (path.split('.')) ile üst düğüm bulunur.
 */
export function buildGraphFromEntities(entities: AuditEntityRow[]): {
  nodes: NeuralNode[];
  edges: NeuralEdge[];
} {
  const pathToEntity = new Map<string, AuditEntityRow>();
  for (const e of entities) {
    const pathStr = typeof e.path === 'string' ? e.path : String(e.path ?? '');
    pathToEntity.set(pathStr, e);
  }

  const nodes: NeuralNode[] = entities.map((entity) => {
    const risk = typeof entity.risk_score === 'number' ? entity.risk_score : 50;
    const velocity = typeof entity.velocity_multiplier === 'number' ? entity.velocity_multiplier : 1.0;
    return {
      id: entity.id,
      label: entity.name,
      type: mapEntityTypeToNodeType(entity.type),
      baseRisk: Math.min(100, Math.max(0, risk)),
      effectiveRisk: Math.min(100, Math.max(0, risk)),
      contagionImpact: 0,
      metadata: {
        entityType: entity.type,
        path: entity.path,
        velocity,
        ...(entity.metadata ?? {}),
      },
    };
  });

  const edges = buildEdgesFromPathHierarchy(entities, pathToEntity);
  return { nodes, edges };
}

function mapEntityTypeToNodeType(entityType: string): NeuralNode['type'] {
  const upper = String(entityType).toUpperCase();
  if (upper === 'PROCESS') return 'process';
  if (upper === 'SYSTEM' || upper === 'IT_ASSET') return 'system';
  if (['HOLDING', 'BANK', 'GROUP', 'UNIT', 'BRANCH', 'DEPARTMENT', 'HEADQUARTERS', 'SUBSIDIARY'].includes(upper)) {
    return 'department';
  }
  return 'entity';
}

export interface NeuralUniverseResult {
  nodes: NeuralNode[];
  edges: NeuralEdge[];
}

/**
 * React Query hook: Denetim Evreni verisini çeker ve Neural Map için nodes/edges üretir.
 * Hata durumunda error state döner; UI'da hata ekranı gösterin.
 */
export function useNeuralUniverse() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<NeuralUniverseResult> => {
      const entities = await fetchAuditEntitiesForNeural();
      return buildGraphFromEntities(entities);
    },
  });
}
