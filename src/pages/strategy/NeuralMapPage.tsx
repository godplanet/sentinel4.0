/**
 * Neural Map Page - Risk Contagion Network Visualization
 * Dinamik veri: audit_entities (Denetim Evreni) üzerinden graf; mock veri yok.
 */

import {
 calculateContagion,
 calculateNetworkStats,
 getRiskColor,
 getRiskLevelTR,
 type ContagionResult,
 type NetworkStats,
 type NeuralEdge,
 type NeuralNode,
} from '@/features/neural-map';
import { useNeuralUniverse } from '@/features/neural-map/universe-api';
import { PageHeader } from '@/shared/ui';
import { Background, Controls, Edge, MiniMap, Node, Panel, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Activity, AlertCircle, AlertTriangle, Loader2, Network, RefreshCw, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const NEUTRAL_NODE_COLOR = '#64748b';

export default function NeuralMapPage() {
 const { data: graphData, isLoading, error, isError } = useNeuralUniverse();
 const [contagionResults, setContagionResults] = useState<Map<string, ContagionResult>>(new Map());
 const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
 const [selectedNode, setSelectedNode] = useState<ContagionResult | null>(null);
 const [isSimulating, setIsSimulating] = useState(false);

 const neuralNodes: NeuralNode[] = graphData?.nodes ?? [];
 const neuralEdges: NeuralEdge[] = graphData?.edges ?? [];

 const nodeColor = (risk: number) => {
 if (risk == null || Number.isNaN(risk)) return NEUTRAL_NODE_COLOR;
 return getRiskColor(risk);
 };

 const initialNodes: Node[] = (neuralNodes || []).map((node, idx) => ({
 id: node.id,
 type: 'default',
 position: {
 x: (idx % 3) * 300 + 100,
 y: Math.floor(idx / 3) * 200 + 100,
 },
 data: {
 label: node.label,
 risk: node.baseRisk,
 type: node.type,
 },
 style: {
 background: nodeColor(node.baseRisk),
 color: '#fff',
 border: '2px solid rgba(255,255,255,0.3)',
 borderRadius: '12px',
 padding: '16px',
 fontSize: '14px',
 fontWeight: '600',
 boxShadow: `0 0 20px ${nodeColor(node.baseRisk)}40`,
 width: 180,
 },
 }));

 const initialEdges: Edge[] = (neuralEdges || []).map((edge) => ({
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
 if (graphData && neuralNodes.length > 0 && !isLoading) {
 setNodes(initialNodes);
 setEdges(initialEdges);
 }
 }, [graphData, isLoading]);

 const runSimulation = useCallback(() => {
 if (neuralNodes.length === 0) return;
 setIsSimulating(true);

 setTimeout(() => {
 const results = calculateContagion(neuralNodes, neuralEdges, 3);
 setContagionResults(results);
 setNetworkStats(calculateNetworkStats(results));

 setNodes((prevNodes) =>
 (prevNodes || []).map((node) => {
 const result = results.get(node.id);
 if (result) {
 return {
 ...node,
 data: { ...node.data, risk: result.effectiveRisk },
 style: {
 ...node.style,
 background: nodeColor(result.effectiveRisk),
 boxShadow: `0 0 20px ${nodeColor(result.effectiveRisk)}40`,
 },
 };
 }
 return node;
 })
 );

 setEdges((prevEdges) =>
 (prevEdges || []).map((edge) => {
 const sourceResult = results.get(edge.source);
 if (sourceResult && sourceResult.effectiveRisk >= 70) {
 return {
 ...edge,
 style: {
 ...edge.style,
 stroke: nodeColor(sourceResult.effectiveRisk),
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

 useEffect(() => {
 if (neuralNodes.length > 0 && !isLoading) {
 runSimulation();
 }
 }, [neuralNodes.length, isLoading]);

 const onNodeClick = useCallback(
 (_event: React.MouseEvent, node: Node) => {
 const result = contagionResults.get(node.id);
 if (result) setSelectedNode(result);
 },
 [contagionResults]
 );

 if (isLoading) {
 return (
 <div className="h-screen flex flex-col bg-canvas">
 <PageHeader
 title="Sinir Haritası"
 description="Risk Bulaşma Ağı - Denetim Evreni Hiyerarşisi"
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

 if (isError && error) {
 return (
 <div className="h-screen flex flex-col bg-canvas">
 <PageHeader
 title="Sinir Haritası"
 description="Risk Bulaşma Ağı - Denetim Evreni Hiyerarşisi"
 icon={Network}
 />
 <div className="flex-1 flex items-center justify-center p-5">
 <div className="max-w-md w-full bg-surface border border-red-200 rounded-xl p-4 shadow-sm">
 <div className="flex items-center gap-3 text-red-700 mb-2">
 <AlertCircle className="w-8 h-8 shrink-0" />
 <h3 className="font-semibold text-lg">Veri yüklenemedi</h3>
 </div>
 <p className="text-slate-600 text-sm">
 Denetim evreni (audit_entities) verileri alınırken bir hata oluştu. Lütfen bağlantıyı ve yetkileri
 kontrol edin.
 </p>
 <p className="mt-2 text-xs text-slate-500 font-mono">
 {(error as Error).message}
 </p>
 </div>
 </div>
 </div>
 );
 }

 if (!graphData || neuralNodes.length === 0) {
 return (
 <div className="h-screen flex flex-col bg-canvas">
 <PageHeader
 title="Sinir Haritası"
 description="Risk Bulaşma Ağı - Denetim Evreni Hiyerarşisi"
 icon={Network}
 />
 <div className="flex-1 flex items-center justify-center p-5">
 <div className="text-center text-slate-500">
 <Network className="w-16 h-16 mx-auto mb-4 opacity-40" />
 <p className="font-medium">Henüz denetim evreni kaydı yok</p>
 <p className="text-sm mt-1">Graf görüntülenebilmesi için audit_entities tablosunda kayıt olmalıdır.</p>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="h-screen flex flex-col bg-canvas">
 <PageHeader
 title="Sinir Haritası"
 description="Risk Bulaşma Ağı - Denetim Evreni Hiyerarşisi"
 icon={Network}
 />

 <div className="flex-1 flex gap-4 p-4">
 <div className="flex-1 rounded-xl border border-slate-200 bg-surface shadow-sm overflow-hidden relative">
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
 <Controls className="bg-surface border border-slate-200 rounded-lg shadow-sm" />
 <MiniMap
 className="bg-surface border border-slate-200 rounded-lg shadow-sm"
 nodeColor={(node) => {
 const result = contagionResults.get(node.id);
 return result ? nodeColor(result.effectiveRisk) : NEUTRAL_NODE_COLOR;
 }}
 />

 <Panel position="top-left" className="m-4">
 <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full shadow-sm">
 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
 <span className="text-xs font-semibold text-emerald-700">CANLI SİMÜLASYON</span>
 </div>
 </Panel>

 {networkStats && (
 <Panel position="top-right" className="m-4">
 <div className="bg-surface border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 min-w-[280px]">
 <div className="flex items-center justify-between">
 <h3 className="font-semibold text-primary">Ağ İstatistikleri</h3>
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
 <div className="text-2xl font-bold text-red-900 mt-1">{networkStats.criticalNodes}</div>
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

 {selectedNode && (
 <div className="w-96 bg-surface rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
 <div>
 <div className="flex items-center justify-between mb-2">
 <h3 className="text-lg font-bold text-primary">Birim Detayı</h3>
 <button
 onClick={() => setSelectedNode(null)}
 className="text-slate-400 hover:text-slate-600"
 >
 ✕
 </button>
 </div>
 <p className="text-2xl font-bold text-primary">
 {neuralNodes.find((n) => n.id === selectedNode.nodeId)?.label}
 </p>
 </div>

 <div className="space-y-3">
 <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
 <div className="flex items-center justify-between mb-2">
 <span className="text-sm font-medium text-blue-900">Öz Risk (Temel)</span>
 <Activity className="w-4 h-4 text-blue-600" />
 </div>
 <div className="text-3xl font-bold text-blue-900">{selectedNode.baseRisk.toFixed(1)}</div>
 <div className="text-xs text-blue-700 mt-1">{getRiskLevelTR(selectedNode.baseRisk)}</div>
 </div>

 <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
 <div className="flex items-center justify-between mb-2">
 <span className="text-sm font-medium text-orange-900">Bulaşan Risk</span>
 <TrendingUp className="w-4 h-4 text-orange-600" />
 </div>
 <div className="text-3xl font-bold text-orange-900">
 +{selectedNode.contagionImpact.toFixed(1)}
 </div>
 <div className="text-xs text-orange-700 mt-1">Komşu birimlerden gelen</div>
 </div>

 <div
 className="rounded-lg p-4"
 style={{
 backgroundColor: `${nodeColor(selectedNode.effectiveRisk)}15`,
 }}
 >
 <div className="flex items-center justify-between mb-2">
 <span
 className="text-sm font-medium"
 style={{ color: nodeColor(selectedNode.effectiveRisk) }}
 >
 Etkin Risk (Toplam)
 </span>
 <AlertTriangle
 className="w-4 h-4"
 style={{ color: nodeColor(selectedNode.effectiveRisk) }}
 />
 </div>
 <div
 className="text-3xl font-bold"
 style={{ color: nodeColor(selectedNode.effectiveRisk) }}
 >
 {selectedNode.effectiveRisk.toFixed(1)}
 </div>
 <div className="text-xs mt-1" style={{ color: nodeColor(selectedNode.effectiveRisk) }}>
 {getRiskLevelTR(selectedNode.effectiveRisk)}
 </div>
 </div>
 </div>

 {selectedNode.incomingRisks.length > 0 ? (
 <div>
 <h4 className="text-sm font-semibold text-primary mb-3">
 Risk Kaynakları ({selectedNode.incomingRisks.length})
 </h4>
 <div className="space-y-2 max-h-64 overflow-y-auto">
 {selectedNode.incomingRisks
 .sort((a, b) => b.contributedRisk - a.contributedRisk)
 .map((incoming, idx) => (
 <div key={idx} className="bg-canvas rounded-lg p-3 border border-slate-200">
 <div className="flex items-start justify-between mb-1">
 <span className="text-sm font-medium text-primary">{incoming.sourceLabel}</span>
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
 ) : (
 <div className="text-center py-5 text-slate-500">
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
