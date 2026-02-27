import { UniverseEntityRow, UniverseNode } from './types';

export const buildUniverseTree = (rows: UniverseEntityRow[]): UniverseNode[] => {
  const nodeMap = new Map<string, UniverseNode>();
  const rootNodes: UniverseNode[] = [];

  rows.forEach(row => {
    nodeMap.set(row.id, {
      ...row,
      children: [],
      stats: {
        totalRiskScore: Math.floor(Math.random() * 100),
        auditGrade: '-',
        lastAuditDate: null,
        findingCount: 0
      },
      computed: {
        depth: row.path.split('.').length - 1,
        isLeaf: true
      }
    });
  });

  rows.forEach(row => {
    const node = nodeMap.get(row.id)!;
    if (row.parent_id && nodeMap.has(row.parent_id)) {
      const parent = nodeMap.get(row.parent_id)!;
      parent.children.push(node);
      parent.computed.isLeaf = false;
    } else {
      rootNodes.push(node);
    }
  });

  return rootNodes;
};

export const aggregateRiskScores = (node: UniverseNode): number => {
  if (node.children.length === 0) {
    return node.stats.totalRiskScore;
  }

  const totalChildScore = node.children.reduce((sum, child) => {
    return sum + aggregateRiskScores(child);
  }, 0);

  const aggregatedScore = Math.round(totalChildScore / node.children.length);
  node.stats.totalRiskScore = aggregatedScore;

  return aggregatedScore;
};
