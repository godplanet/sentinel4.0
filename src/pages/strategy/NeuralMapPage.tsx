/**
 * Neural Map Page - Risk Contagion Network Visualization
 * Turkish UI with English code
 */

import { useState, useCallback, useEffect } from 'react';
import { ReactFlow, Node, Edge, Background, Controls, MiniMap, useNodesState, useEdgesState, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Activity, TrendingUp, AlertTriangle, Network, RefreshCw, Loader2 } from 'lucide-react';
import { PageHeader } from '@/shared/ui';
import {
  calculateContagion,
  getRiskColor,
  getRiskLevelTR,
  calculateNetworkStats,
  MOCK_NEURAL_NODES,
  MOCK_NEURAL_EDGES,
  type ContagionResult,
  type NetworkStats,
  type NeuralNode,
  type NeuralEdge,
} from '@/features/neural-map';
import { fetchUniverseNeuralData } from '@/features/neural-map/universe-api';

export default function NeuralMapPage() {
  const [contagionResults, setContagionResults] = useState<Map<string, ContagionResult>>(new Map());
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [selectedNode, setSelectedNode] = useState<ContagionResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [neuralNodes, setNeuralNodes] = useState<NeuralNode[]>([]);
  const [neuralEdges, setNeuralEdges] = useState<NeuralEdge[]>([]);

  useEffect(() => {
    loadUniverseData();
  }, []);

  const loadUniverseData = async () => {
    setIsLoading(true);
    try {
      const { nodes, edges } = await fetchUniverseNeuralData();

      if (nodes.length === 0) {
        setNeuralNodes(MOCK_NEURAL_NODES);
        setNeuralEdges(MOCK_NEURAL_EDGES);
      } else {
        setNeuralNodes(nodes);
        setNeuralEdges(edges);
      }
    } catch (error) {
      console.error('Error loading universe data:', error);
      setNeuralNodes(MOCK_NEURAL_NODES);
      setNeuralEdges(MOCK_NEURAL_EDGES);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert neural nodes to ReactFlow nodes
  const initialNodes: Node[] = neuralNodes.map((node, idx) => ({
    id: node.id,
    type: 'default',
    position: {
      x: (idx % 3) * 300 + 100,
      y: Math.floor(idx / 3) * 200 + 100
    },
    data: {
      label: node.label,
      risk: node.baseRisk,
      type: node.type,
    },
    style: {
      background: getRiskColor(node.baseRisk),
      color: '#fff',
      border: '2px solid rgba(255,255,255,0.3)',
      borderRadius: '12px',
      padding: '16px',
      fontSize: '14px',
      fontWeight: '600',
      boxShadow: `0 0 20px ${getRiskColor(node.baseRisk)}40`,
      width: 180,
    },
  }));

  const initialEdges: Edge[] = neuralEdges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    animated: true,
    style: {
      stroke: '#64748b',
      strokeWidth: 2,
      opacity: 0.6,
    },
    label: `${Math.round(edge.dependencyWeight * 100)}%`,
    labelStyle: {
      fontSize: '10px',
      fill: '#94a3b8',
    },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (neuralNodes.length > 0 && !isLoading) {
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [neuralNodes, neuralEdges, isLoading]);

  // Run contagion simulation
  const runSimulation = useCallback(() => {
    if (neuralNodes.length === 0) return;
    setIsSimulating(true);

    setTimeout(() => {
      const results = calculateContagion(neuralNodes, neuralEdges, 3);
      setContagionResults(results);

      const stats = calculateNetworkStats(results);
      setNetworkStats(stats);

      // Update node colors based on effective risk
      setNodes(prevNodes =>
        prevNodes.map(node => {
          const result = results.get(node.id);
          if (result) {
            return {
              ...node,
              data: { ...node.data, risk: result.effectiveRisk },
              style: {
                ...node.style,
                background: getRiskColor(result.effectiveRisk),
                boxShadow: `0 0 20px ${getRiskColor(result.effectiveRisk)}40`,
              },
            };
          }
          return node;
        })
      );

      // Update edge colors based on source risk
      setEdges(prevEdges =>
        prevEdges.map(edge => {
          const sourceResult = results.get(edge.source);
          if (sourceResult && sourceResult.effectiveRisk >= 70) {
            return {
              ...edge,
              style: {
                ...edge.style,
                stroke: getRiskColor(sourceResult.effectiveRisk),
                strokeWidth: 3,
                opacity: 0.8,
              },
              animated: true,
            };
          }
          return edge;
        })
      );

      setIsSimulating(false);
    }, 800);
  }, [neuralNodes, neuralEdges, setNodes, setEdges]);

  // Run simulation when data loads
  useEffect(() => {
    if (neuralNodes.length > 0 && !isLoading) {
      runSimulation();
    }
  }, [neuralNodes, isLoading]);

  // Handle node click
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    const result = contagionResults.get(node.id);
    if (result) {
      setSelectedNode(result);
    }
  }, [contagionResults]);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-slate-50">
        <PageHeader
          title="Sinir Haritası"
          description="Risk Bulaşma Ağı - Kurumsal Bağımlılıklar ve Domino Etkisi"
          icon={Network}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Ağ verileri yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <PageHeader
        title="Sinir Haritası"
        description="Risk Bulaşma Ağı - Kurumsal Bağımlılıklar ve Domino Etkisi"
        icon={Network}
      />

      <div className="flex-1 flex gap-4 p-4">
        {/* Main Network Canvas */}
        <div className="flex-1 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            className="bg-gradient-to-br from-slate-50 via-white to-slate-100"
          >
            <Background color="#94a3b8" gap={16} />
            <Controls className="bg-white border border-slate-200 rounded-lg shadow-sm" />
            <MiniMap
              className="bg-white border border-slate-200 rounded-lg shadow-sm"
              nodeColor={node => {
                const result = contagionResults.get(node.id);
                return result ? getRiskColor(result.effectiveRisk) : '#94a3b8';
              }}
            />

            {/* Live Badge */}
            <Panel position="top-left" className="m-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full shadow-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-emerald-700">CANLI SİMÜLASYON</span>
              </div>
            </Panel>

            {/* Stats Panel */}
            {networkStats && (
              <Panel position="top-right" className="m-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 min-w-[280px]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Ağ İstatistikleri</h3>
                    <button
                      onClick={runSimulation}
                      disabled={isSimulating}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 text-slate-600 ${isSimulating ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <div className="text-xs text-blue-700 font-medium">Ortalama Risk</div>
                      <div className="text-2xl font-bold text-blue-900 mt-1">
                        {networkStats.averageRisk.toFixed(1)}
                      </div>
                    </div>

                    <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                      <div className="text-xs text-red-700 font-medium">Kritik Birim</div>
                      <div className="text-2xl font-bold text-red-900 mt-1">
                        {networkStats.criticalNodes}
                      </div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                      <div className="text-xs text-orange-700 font-medium">Toplam Bulaşma</div>
                      <div className="text-2xl font-bold text-orange-900 mt-1">
                        {networkStats.totalContagion.toFixed(1)}
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                      <div className="text-xs text-purple-700 font-medium">Max Risk</div>
                      <div className="text-2xl font-bold text-purple-900 mt-1">
                        {networkStats.maxRisk.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>

        {/* Right Sidebar - Node Details */}
        {selectedNode && (
          <div className="w-96 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-slate-900">Birim Detayı</h3>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {neuralNodes.find(n => n.id === selectedNode.nodeId)?.label}
              </p>
            </div>

            {/* Risk Scores */}
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">Öz Risk (Temel)</span>
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-900">
                  {selectedNode.baseRisk.toFixed(1)}
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  {getRiskLevelTR(selectedNode.baseRisk)}
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-orange-900">Bulaşan Risk</span>
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-orange-900">
                  +{selectedNode.contagionImpact.toFixed(1)}
                </div>
                <div className="text-xs text-orange-700 mt-1">
                  Komşu birimlerden gelen
                </div>
              </div>

              <div
                className="rounded-lg p-4"
                style={{
                  backgroundColor: `${getRiskColor(selectedNode.effectiveRisk)}15`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: getRiskColor(selectedNode.effectiveRisk) }}>
                    Etkin Risk (Toplam)
                  </span>
                  <AlertTriangle className="w-4 h-4" style={{ color: getRiskColor(selectedNode.effectiveRisk) }} />
                </div>
                <div className="text-3xl font-bold" style={{ color: getRiskColor(selectedNode.effectiveRisk) }}>
                  {selectedNode.effectiveRisk.toFixed(1)}
                </div>
                <div className="text-xs mt-1" style={{ color: getRiskColor(selectedNode.effectiveRisk) }}>
                  {getRiskLevelTR(selectedNode.effectiveRisk)}
                </div>
              </div>
            </div>

            {/* Incoming Risks */}
            {selectedNode.incomingRisks.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">
                  Risk Kaynakları ({selectedNode.incomingRisks.length})
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedNode.incomingRisks
                    .sort((a, b) => b.contributedRisk - a.contributedRisk)
                    .map((incoming, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 rounded-lg p-3 border border-slate-200"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-sm font-medium text-slate-900">
                            {incoming.sourceLabel}
                          </span>
                          <span className="text-sm font-bold text-orange-600">
                            +{incoming.contributedRisk.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                            <div
                              className="bg-orange-500 h-1.5 rounded-full"
                              style={{ width: `${incoming.dependencyWeight * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-600">
                            {Math.round(incoming.dependencyWeight * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {selectedNode.incomingRisks.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Network className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Bu birime gelen risk bulaşması yok</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
