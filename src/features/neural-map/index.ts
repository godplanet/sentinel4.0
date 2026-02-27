/**
 * Neural Map - Risk Contagion Visualization
 * Feature-Sliced Design Public API
 */

export { calculateContagion, getRiskColor, getRiskLevelTR, calculateNetworkStats } from './engine';
export { MOCK_NEURAL_NODES, MOCK_NEURAL_EDGES } from './data';
export type { NeuralNode, NeuralEdge, ContagionResult, NeuralMapState, NetworkStats } from './types';
