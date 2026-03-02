/**
 * Neural Map - Risk Contagion Visualization
 * Feature-Sliced Design Public API
 */

export { calculateContagion, getRiskColor, getRiskLevelTR, calculateNetworkStats } from './engine';
export type { NeuralNode, NeuralEdge, ContagionResult, NeuralMapState, NetworkStats } from './types';
