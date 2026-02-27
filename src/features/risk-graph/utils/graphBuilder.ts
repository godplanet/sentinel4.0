export interface GraphNode {
  id: string;
  label: string;
  type: 'domain' | 'process' | 'risk' | 'control';
  color: string;
  size: number;
  path: string;
  data?: any;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const NODE_COLORS = {
  domain: '#6B7280',
  process: '#3B82F6',
  risk: '#EF4444',
  control: '#10B981',
};

const NODE_SIZES = {
  domain: 12,
  process: 10,
  risk: 8,
  control: 6,
};

export function inferNodeType(path: string, data?: any): GraphNode['type'] {
  if (data?.entity_type === 'CONTROL' || data?.type === 'CONTROL') {
    return 'control';
  }
  if (data?.entity_type === 'RISK' || data?.type === 'RISK') {
    return 'risk';
  }

  const depth = path.split('.').length;

  if (depth === 1) {
    return 'domain';
  } else if (depth === 2) {
    return 'process';
  } else if (depth >= 3) {
    return 'risk';
  }

  return 'process';
}

export function buildGraphFromTree(flatNodes: any[]): GraphData {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const nodeMap = new Map<string, GraphNode>();

  flatNodes.forEach((node) => {
    const path = node.path || node.ltree_path || node.id;
    if (!path) return;

    const pathStr = typeof path === 'string' ? path : String(path);
    const type = inferNodeType(pathStr, node);

    const graphNode: GraphNode = {
      id: pathStr,
      label: node.name || node.title || pathStr.split('.').pop() || pathStr,
      type,
      color: NODE_COLORS[type],
      size: NODE_SIZES[type],
      path: pathStr,
      data: node,
    };

    nodes.push(graphNode);
    nodeMap.set(pathStr, graphNode);
  });

  nodes.forEach((node) => {
    const pathParts = node.path.split('.');

    if (pathParts.length > 1) {
      const parentPath = pathParts.slice(0, -1).join('.');

      if (nodeMap.has(parentPath)) {
        links.push({
          source: parentPath,
          target: node.id,
        });
      }
    }
  });

  return { nodes, links };
}

export function buildGraphFromRisksAndControls(
  risks: any[],
  controls: any[]
): GraphData {
  const allNodes = [...risks, ...controls];
  return buildGraphFromTree(allNodes);
}

export function addControlLinks(
  graphData: GraphData,
  controlMappings: Array<{ risk_id: string; control_id: string }>
): GraphData {
  const additionalLinks: GraphLink[] = controlMappings.map((mapping) => ({
    source: mapping.risk_id,
    target: mapping.control_id,
  }));

  return {
    nodes: graphData.nodes,
    links: [...graphData.links, ...additionalLinks],
  };
}

export function filterGraphByType(
  graphData: GraphData,
  types: GraphNode['type'][]
): GraphData {
  const filteredNodes = graphData.nodes.filter((node) =>
    types.includes(node.type)
  );
  const nodeIds = new Set(filteredNodes.map((n) => n.id));

  const filteredLinks = graphData.links.filter(
    (link) =>
      nodeIds.has(typeof link.source === 'string' ? link.source : link.source.id) &&
      nodeIds.has(typeof link.target === 'string' ? link.target : link.target.id)
  );

  return {
    nodes: filteredNodes,
    links: filteredLinks,
  };
}

export function searchNodes(
  graphData: GraphData,
  query: string
): GraphNode[] {
  const lowerQuery = query.toLowerCase();
  return graphData.nodes.filter(
    (node) =>
      node.label.toLowerCase().includes(lowerQuery) ||
      node.path.toLowerCase().includes(lowerQuery)
  );
}
