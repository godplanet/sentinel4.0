/**
 * Neural Map Type Definitions
 * Risk contagion network data structures
 */

export interface NeuralNode {
  id: string;
  label: string;
  type: 'department' | 'process' | 'system' | 'entity';
  baseRisk: number; // 0-100 inherent risk score
  effectiveRisk: number; // After contagion calculation
  contagionImpact: number; // Additional risk from neighbors
  metadata?: {
    headcount?: number;
    budget?: number;
    criticalSystems?: string[];
  };
}

export interface NeuralEdge {
  id: string;
  source: string;
  target: string;
  dependencyWeight: number; // 0-1 (how much target depends on source)
  type: 'operational' | 'data' | 'financial' | 'regulatory';
  bidirectional?: boolean;
}

export interface ContagionResult {
  nodeId: string;
  baseRisk: number;
  incomingRisks: Array<{
    sourceId: string;
    sourceLabel: string;
    contributedRisk: number;
    dependencyWeight: number;
  }>;
  effectiveRisk: number;
  contagionImpact: number;
}

export interface NeuralMapState {
  nodes: NeuralNode[];
  edges: NeuralEdge[];
  contagionResults: Map<string, ContagionResult>;
  selectedNodeId?: string;
  simulationRunning: boolean;
}
