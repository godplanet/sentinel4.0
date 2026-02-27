import type { UniverseNode } from '../model/types';

export function buildHierarchyFromLTree(flatData: UniverseNode[]): UniverseNode[] {
  const sorted = [...flatData].sort((a, b) => {
    const aDepth = a.path.split('.').length;
    const bDepth = b.path.split('.').length;
    return aDepth !== bDepth ? aDepth - bDepth : a.path.localeCompare(b.path);
  });

  const nodeMap = new Map<string, UniverseNode>();
  const roots: UniverseNode[] = [];

  for (const raw of sorted) {
    const node: UniverseNode = { ...raw, children: [] };
    nodeMap.set(node.path, node);

    const parts = node.path.split('.');
    if (parts.length <= 1) {
      roots.push(node);
    } else {
      const parentPath = parts.slice(0, -1).join('.');
      const parent = nodeMap.get(parentPath);
      if (parent) {
        parent.children = parent.children ?? [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
  }

  return roots;
}

export function flattenTree(nodes: UniverseNode[]): UniverseNode[] {
  const result: UniverseNode[] = [];
  const traverse = (node: UniverseNode): void => {
    result.push(node);
    node.children?.forEach(traverse);
  };
  nodes.forEach(traverse);
  return result;
}
