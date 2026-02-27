import { supabase } from '@/shared/api/supabase';
import type { NeuralNode, NeuralEdge } from './types';

interface AuditEntity {
  id: string;
  name: string;
  type: string;
  path: string;
  parent_id: string | null;
  risk_score: number;
  velocity_multiplier: number;
  metadata: Record<string, any>;
}

export async function fetchUniverseNeuralData(): Promise<{
  nodes: NeuralNode[];
  edges: NeuralEdge[];
}> {
  try {
    const { data: entities, error } = await supabase
      .from('audit_entities')
      .select('id, name, type, path, parent_id, risk_score, velocity_multiplier, metadata')
      .eq('status', 'Active')
      .order('path', { ascending: true });

    if (error) throw error;

    if (!entities || entities.length === 0) {
      return { nodes: [], edges: [] };
    }

    const nodes: NeuralNode[] = entities.map((entity: AuditEntity) => ({
      id: entity.id,
      label: entity.name,
      type: 'department',
      baseRisk: entity.risk_score || 50,
      effectiveRisk: entity.risk_score || 50,
      contagionImpact: 0,
      metadata: {
        entityType: entity.type,
        path: entity.path,
        velocity: entity.velocity_multiplier || 1.0,
        ...entity.metadata,
      },
    }));

    const edges: NeuralEdge[] = [];
    entities.forEach((entity: AuditEntity) => {
      if (entity.parent_id) {
        const parent = entities.find((e: AuditEntity) => e.id === entity.parent_id);
        if (parent) {
          const dependencyWeight = calculateDependencyWeight(
            entity.type,
            parent.type,
            entity.risk_score || 50
          );

          edges.push({
            id: `${parent.id}-${entity.id}`,
            source: parent.id,
            target: entity.id,
            dependencyWeight,
            type: 'hierarchical',
          });
        }
      }
    });

    return { nodes, edges };
  } catch (error) {
    console.error('Error fetching universe neural data:', error);
    return { nodes: [], edges: [] };
  }
}

function calculateDependencyWeight(
  childType: string,
  parentType: string,
  childRisk: number
): number {
  let baseWeight = 0.5;

  if (parentType === 'HEADQUARTERS') {
    baseWeight = 0.7;
  } else if (parentType === 'GROUP') {
    baseWeight = 0.6;
  } else if (parentType === 'DEPARTMENT') {
    baseWeight = 0.65;
  }

  if (childType === 'PROCESS') {
    baseWeight += 0.15;
  }

  const riskFactor = (childRisk / 100) * 0.2;
  const finalWeight = Math.min(0.95, Math.max(0.3, baseWeight + riskFactor));

  return Number(finalWeight.toFixed(2));
}
