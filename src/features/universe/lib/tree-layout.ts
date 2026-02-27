import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';

export interface LayoutableEntity {
  id: string;
  name: string;
  path: string;
  type: string;
  risk_score: number;
  velocity_multiplier: number;
  risk_velocity?: number;
  shariah_impact?: number;
  esg_impact?: number;
}

export interface LayoutedElements {
  nodes: Node[];
  edges: Edge[];
}

const NODE_WIDTH = 260;
const NODE_HEIGHT = 180;

export const getLayoutedElements = (
  entities: LayoutableEntity[],
  direction: 'TB' | 'LR' = 'TB'
): LayoutedElements => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 80,
    ranksep: 120,
    marginx: 50,
    marginy: 50,
  });

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const pathToId = new Map<string, string>();

  entities.forEach((entity, index) => {
    const nodeId = `entity-${entity.id || index}`;
    pathToId.set(entity.path, nodeId);

    const effectiveRisk = entity.risk_score * (1 + (entity.velocity_multiplier - 1));

    const node: Node = {
      id: nodeId,
      type: 'entityNode',
      position: { x: 0, y: 0 },
      data: {
        id: entity.id,
        name: entity.name,
        type: entity.type,
        risk_score: entity.risk_score,
        velocity_multiplier: entity.velocity_multiplier,
        effective_risk: effectiveRisk,
        path: entity.path,
        risk_velocity: entity.risk_velocity,
        shariah_impact: entity.shariah_impact,
        esg_impact: entity.esg_impact,
      },
    };

    nodes.push(node);
    dagreGraph.setNode(nodeId, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  entities.forEach((entity, index) => {
    const pathParts = entity.path.split('.');

    if (pathParts.length > 1) {
      const parentPath = pathParts.slice(0, -1).join('.');
      const parentId = pathToId.get(parentPath);
      const childId = `entity-${entity.id || index}`;

      if (parentId) {
        const edgeId = `edge-${parentId}-${childId}`;

        const edge: Edge = {
          id: edgeId,
          source: parentId,
          target: childId,
          type: 'smoothstep',
          animated: false,
          style: {
            stroke: '#94a3b8',
            strokeWidth: 2,
          },
          markerEnd: {
            type: 'arrowclosed',
            color: '#94a3b8',
            width: 20,
            height: 20,
          },
        };

        edges.push(edge);
        dagreGraph.setEdge(parentId, childId);
      }
    }
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return {
    nodes: layoutedNodes,
    edges,
  };
};

export const filterEntitiesByRisk = (
  entities: LayoutableEntity[],
  minRisk: number = 0,
  maxRisk: number = 100
): LayoutableEntity[] => {
  return entities.filter((entity) => {
    const effectiveRisk = entity.risk_score * (1 + (entity.velocity_multiplier - 1));
    return effectiveRisk >= minRisk && effectiveRisk <= maxRisk;
  });
};

export const getEntityDepth = (path: string): number => {
  return path.split('.').length;
};

export const filterEntitiesByDepth = (
  entities: LayoutableEntity[],
  maxDepth: number
): LayoutableEntity[] => {
  return entities.filter((entity) => getEntityDepth(entity.path) <= maxDepth);
};
