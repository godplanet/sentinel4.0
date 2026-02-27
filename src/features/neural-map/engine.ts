/**
 * Neural Map Contagion Engine
 * Calculates cascading risk propagation through organizational network
 *
 * Algorithm: Recursive Risk Diffusion
 * Formula: Effective Risk = Base Risk + Σ(Neighbor Risk × Dependency Weight × 0.5)
 */

import type { NeuralNode, NeuralEdge, ContagionResult } from './types';

/**
 * Calculate risk contagion for entire network
 * Uses iterative approach to simulate risk spreading
 */
export function calculateContagion(
  nodes: NeuralNode[],
  edges: NeuralEdge[],
  iterations: number = 3
): Map<string, ContagionResult> {
  const results = new Map<string, ContagionResult>();

  // Initialize results with base risks
  nodes.forEach(node => {
    results.set(node.id, {
      nodeId: node.id,
      baseRisk: node.baseRisk,
      incomingRisks: [],
      effectiveRisk: node.baseRisk,
      contagionImpact: 0,
    });
  });

  // Build adjacency map for faster lookups
  const adjacencyMap = buildAdjacencyMap(edges);

  // Iteratively calculate contagion (simulates risk spreading over time)
  for (let iter = 0; iter < iterations; iter++) {
    const currentRisks = new Map<string, number>();

    nodes.forEach(node => {
      const result = results.get(node.id)!;
      const incoming = adjacencyMap.get(node.id) || [];

      let totalContagion = 0;
      const incomingRiskDetails: ContagionResult['incomingRisks'] = [];

      incoming.forEach(({ sourceId, weight }) => {
        const sourceResult = results.get(sourceId);
        if (sourceResult) {
          // Risk contagion formula
          const contributedRisk = sourceResult.effectiveRisk * weight * 0.5;
          totalContagion += contributedRisk;

          incomingRiskDetails.push({
            sourceId,
            sourceLabel: nodes.find(n => n.id === sourceId)?.label || sourceId,
            contributedRisk,
            dependencyWeight: weight,
          });
        }
      });

      const effectiveRisk = Math.min(100, result.baseRisk + totalContagion);

      currentRisks.set(node.id, effectiveRisk);
      result.incomingRisks = incomingRiskDetails;
      result.contagionImpact = totalContagion;
      result.effectiveRisk = effectiveRisk;
    });

    // Update effective risks for next iteration
    currentRisks.forEach((risk, nodeId) => {
      const result = results.get(nodeId)!;
      result.effectiveRisk = risk;
    });
  }

  return results;
}

/**
 * Build adjacency map: nodeId -> incoming edges
 */
function buildAdjacencyMap(edges: NeuralEdge[]): Map<string, Array<{ sourceId: string; weight: number }>> {
  const map = new Map<string, Array<{ sourceId: string; weight: number }>>();

  edges.forEach(edge => {
    if (!map.has(edge.target)) {
      map.set(edge.target, []);
    }
    map.get(edge.target)!.push({
      sourceId: edge.source,
      weight: edge.dependencyWeight,
    });

    // Handle bidirectional edges
    if (edge.bidirectional) {
      if (!map.has(edge.source)) {
        map.set(edge.source, []);
      }
      map.get(edge.source)!.push({
        sourceId: edge.target,
        weight: edge.dependencyWeight,
      });
    }
  });

  return map;
}

/**
 * Get risk color based on effective risk score
 */
export function getRiskColor(risk: number): string {
  if (risk >= 85) return '#dc2626'; // Dark red - Critical
  if (risk >= 70) return '#f97316'; // Orange - High
  if (risk >= 50) return '#eab308'; // Yellow - Medium
  if (risk >= 30) return '#84cc16'; // Light green - Low
  return '#22c55e'; // Green - Minimal
}

/**
 * Get risk level label in Turkish
 */
export function getRiskLevelTR(risk: number): string {
  if (risk >= 85) return 'Kritik';
  if (risk >= 70) return 'Yüksek';
  if (risk >= 50) return 'Orta';
  if (risk >= 30) return 'Düşük';
  return 'Minimal';
}

/**
 * Calculate network-wide risk statistics
 */
export interface NetworkStats {
  averageRisk: number;
  maxRisk: number;
  minRisk: number;
  totalContagion: number;
  criticalNodes: number;
}

export function calculateNetworkStats(results: Map<string, ContagionResult>): NetworkStats {
  const values = Array.from(results.values());

  const risks = values.map(v => v.effectiveRisk);
  const contagions = values.map(v => v.contagionImpact);

  return {
    averageRisk: risks.reduce((a, b) => a + b, 0) / risks.length,
    maxRisk: Math.max(...risks),
    minRisk: Math.min(...risks),
    totalContagion: contagions.reduce((a, b) => a + b, 0),
    criticalNodes: risks.filter(r => r >= 85).length,
  };
}
