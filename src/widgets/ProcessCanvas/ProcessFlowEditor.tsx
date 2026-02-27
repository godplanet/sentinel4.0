import { useState, useCallback, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type NodeMouseHandler,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  AlertTriangle, CheckCircle2, CircleDot, Diamond,
  ShieldCheck, GripVertical, X, Trash2,
} from 'lucide-react';
import clsx from 'clsx';
import type { ProcessMap, RiskMapping } from '@/features/process-canvas/types';
import { RiskPinModal } from './RiskPinModal';

interface ProcessFlowEditorProps {
  processMap: ProcessMap;
  onSave: (nodes: Node[], edges: Edge[], riskMappings: RiskMapping[]) => void;
  saving: boolean;
}

const RISK_SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f59e0b',
  MEDIUM: '#3b82f6',
  LOW: '#10b981',
};

const NODE_PALETTE = [
  { type: 'input', label: 'Baslangic', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
  { type: 'default', label: 'Islem Adimi', icon: GripVertical, color: 'text-slate-500 bg-slate-50 border-slate-200' },
  { type: 'decision', label: 'Karar', icon: Diamond, color: 'text-violet-500 bg-violet-50 border-violet-200' },
  { type: 'control', label: 'Kontrol Noktasi', icon: ShieldCheck, color: 'text-amber-500 bg-amber-50 border-amber-200' },
  { type: 'output', label: 'Sonuc', icon: CircleDot, color: 'text-sky-500 bg-sky-50 border-sky-200' },
];

interface ContextMenuState {
  nodeId: string;
  nodeLabel: string;
  x: number;
  y: number;
  hasRisk: boolean;
}

function ProcessStepNode({ data }: { data: { label: string; risk?: RiskMapping } }) {
  const risk = data.risk;
  return (
    <div className={clsx(
      'px-4 py-3 bg-white rounded-xl border-2 shadow-sm min-w-[160px] text-center transition-all',
      risk
        ? risk.severity === 'CRITICAL' ? 'border-red-400 shadow-red-100'
          : risk.severity === 'HIGH' ? 'border-amber-400 shadow-amber-100'
          : 'border-blue-400 shadow-blue-100'
        : 'border-slate-200 hover:border-slate-400',
    )}>
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2" />
      <span className="text-xs font-bold text-slate-700 block">{data.label}</span>
      {risk && (
        <div className="flex items-center justify-center gap-1 mt-1.5">
          <AlertTriangle size={9} style={{ color: RISK_SEVERITY_COLORS[risk.severity] }} />
          <span className="text-[8px] font-bold" style={{ color: RISK_SEVERITY_COLORS[risk.severity] }}>
            {risk.riskLabel}
          </span>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2" />
    </div>
  );
}

function InputNode({ data }: { data: { label: string } }) {
  return (
    <div className="px-4 py-3 bg-emerald-50 border-2 border-emerald-300 rounded-xl shadow-sm min-w-[160px] text-center">
      <CheckCircle2 size={12} className="text-emerald-500 mx-auto mb-1" />
      <span className="text-xs font-bold text-emerald-700">{data.label}</span>
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-400 !w-2 !h-2" />
    </div>
  );
}

function OutputNode({ data }: { data: { label: string } }) {
  return (
    <div className="px-4 py-3 bg-sky-50 border-2 border-sky-300 rounded-xl shadow-sm min-w-[160px] text-center">
      <Handle type="target" position={Position.Top} className="!bg-sky-400 !w-2 !h-2" />
      <CircleDot size={12} className="text-sky-500 mx-auto mb-1" />
      <span className="text-xs font-bold text-sky-700">{data.label}</span>
    </div>
  );
}

function DecisionNode({ data }: { data: { label: string; risk?: RiskMapping } }) {
  const risk = data.risk;
  return (
    <div className={clsx(
      'px-4 py-3 bg-violet-50 border-2 rounded-xl shadow-sm min-w-[160px] text-center transition-all',
      risk ? 'border-red-400 shadow-red-100' : 'border-violet-300 hover:border-violet-400',
    )}>
      <Handle type="target" position={Position.Top} className="!bg-violet-400 !w-2 !h-2" />
      <Diamond size={12} className="text-violet-500 mx-auto mb-1" />
      <span className="text-xs font-bold text-violet-700 block">{data.label}</span>
      {risk && (
        <div className="flex items-center justify-center gap-1 mt-1.5">
          <AlertTriangle size={9} style={{ color: RISK_SEVERITY_COLORS[risk.severity] }} />
          <span className="text-[8px] font-bold" style={{ color: RISK_SEVERITY_COLORS[risk.severity] }}>
            {risk.riskLabel}
          </span>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-violet-400 !w-2 !h-2" />
    </div>
  );
}

function ControlNode({ data }: { data: { label: string; risk?: RiskMapping } }) {
  const risk = data.risk;
  return (
    <div className={clsx(
      'px-4 py-3 bg-amber-50 border-2 rounded-xl shadow-sm min-w-[160px] text-center transition-all',
      risk ? 'border-red-400 shadow-red-100' : 'border-amber-300 hover:border-amber-400',
    )}>
      <Handle type="target" position={Position.Top} className="!bg-amber-400 !w-2 !h-2" />
      <ShieldCheck size={12} className="text-amber-500 mx-auto mb-1" />
      <span className="text-xs font-bold text-amber-700 block">{data.label}</span>
      {risk && (
        <div className="flex items-center justify-center gap-1 mt-1.5">
          <AlertTriangle size={9} style={{ color: RISK_SEVERITY_COLORS[risk.severity] }} />
          <span className="text-[8px] font-bold" style={{ color: RISK_SEVERITY_COLORS[risk.severity] }}>
            {risk.riskLabel}
          </span>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-amber-400 !w-2 !h-2" />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  default: ProcessStepNode,
  input: InputNode,
  output: OutputNode,
  decision: DecisionNode,
  control: ControlNode,
};

export function ProcessFlowEditor({ processMap, onSave, saving }: ProcessFlowEditorProps) {
  const [riskMappings, setRiskMappings] = useState<RiskMapping[]>(processMap.risk_mappings || []);
  const [showPalette, setShowPalette] = useState(true);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [riskPinTarget, setRiskPinTarget] = useState<{ nodeId: string; nodeLabel: string } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const riskMap = useMemo(() => {
    const map: Record<string, RiskMapping> = {};
    riskMappings.forEach((r) => { map[r.nodeId] = r; });
    return map;
  }, [riskMappings]);

  const initialNodes = useMemo(
    () =>
      processMap.nodes_json.map((n) => ({
        ...n,
        data: { ...n.data, risk: riskMap[n.id] },
      })) as Node[],
    [processMap.nodes_json, riskMap],
  );

  const initialEdges = useMemo(
    () => processMap.edges_json as Edge[],
    [processMap.edges_json],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge({ ...params, id: `e${params.source}-${params.target}` }, eds),
      );
    },
    [setEdges],
  );

  const [nodeCount, setNodeCount] = useState(
    Math.max(...processMap.nodes_json.map((n) => parseInt(n.id, 10)).filter((n) => !isNaN(n)), 0) + 1,
  );

  const handleAddNode = useCallback((type: string, label: string) => {
    const newId = String(nodeCount);
    const newNode: Node = {
      id: newId,
      type,
      data: { label: `${label} ${newId}` },
      position: { x: 250 + Math.random() * 100, y: 100 + nodes.length * 80 },
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeCount((c) => c + 1);
  }, [nodeCount, nodes.length, setNodes]);

  const handleNodeContextMenu: NodeMouseHandler = useCallback((event, node) => {
    event.preventDefault();
    const bounds = wrapperRef.current?.getBoundingClientRect();
    if (!bounds) return;
    setContextMenu({
      nodeId: node.id,
      nodeLabel: (node.data as { label: string }).label,
      x: (event as unknown as MouseEvent).clientX - bounds.left,
      y: (event as unknown as MouseEvent).clientY - bounds.top,
      hasRisk: !!riskMap[node.id],
    });
  }, [riskMap]);

  const handlePinRisk = useCallback((mapping: RiskMapping) => {
    setRiskMappings((prev) => {
      const filtered = prev.filter((r) => r.nodeId !== mapping.nodeId);
      return [...filtered, mapping];
    });
    setNodes((nds) =>
      nds.map((n) =>
        n.id === mapping.nodeId
          ? { ...n, data: { ...n.data, risk: mapping } }
          : n,
      ),
    );
    setRiskPinTarget(null);
  }, [setNodes]);

  const handleRemoveRisk = useCallback((nodeId: string) => {
    setRiskMappings((prev) => prev.filter((r) => r.nodeId !== nodeId));
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, risk: undefined } }
          : n,
      ),
    );
    setContextMenu(null);
  }, [setNodes]);

  return (
    <div ref={wrapperRef} className="h-[600px] bg-white border border-slate-200 rounded-xl overflow-hidden relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeContextMenu={handleNodeContextMenu}
        onPaneClick={() => setContextMenu(null)}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-50/50"
        defaultEdgeOptions={{ type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } }}
      >
        <Background gap={20} size={1} color="#e2e8f0" />
        <Controls className="!bg-white !border-slate-200 !rounded-lg !shadow-sm" />
        <MiniMap
          className="!bg-white !border-slate-200 !rounded-lg"
          nodeColor="#cbd5e1"
          maskColor="rgba(0,0,0,0.05)"
        />
      </ReactFlow>

      {showPalette && (
        <div className="absolute top-3 left-3 z-10 bg-white border border-slate-200 rounded-xl shadow-lg p-3 w-44">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dugum Paleti</span>
            <button onClick={() => setShowPalette(false)} className="p-0.5 hover:bg-slate-100 rounded">
              <X size={10} className="text-slate-400" />
            </button>
          </div>
          <div className="space-y-1">
            {NODE_PALETTE.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.type}
                  onClick={() => handleAddNode(item.type, item.label)}
                  className={clsx(
                    'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs font-bold transition-all hover:shadow-sm',
                    item.color,
                  )}
                >
                  <Icon size={12} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
        {!showPalette && (
          <button
            onClick={() => setShowPalette(true)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            + Palet
          </button>
        )}
        <button
          onClick={() => onSave(nodes, edges, riskMappings)}
          disabled={saving}
          className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      {contextMenu && (
        <div
          className="absolute z-20 bg-white border border-slate-200 rounded-lg shadow-xl py-1 min-w-[180px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="px-3 py-1.5 border-b border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{contextMenu.nodeLabel}</span>
          </div>
          {!contextMenu.hasRisk ? (
            <button
              onClick={() => {
                setRiskPinTarget({ nodeId: contextMenu.nodeId, nodeLabel: contextMenu.nodeLabel });
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 transition-colors"
            >
              <AlertTriangle size={12} />
              Risk Bagla
            </button>
          ) : (
            <button
              onClick={() => handleRemoveRisk(contextMenu.nodeId)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={12} />
              Riski Kaldir
            </button>
          )}
        </div>
      )}

      {riskPinTarget && (
        <RiskPinModal
          nodeId={riskPinTarget.nodeId}
          nodeLabel={riskPinTarget.nodeLabel}
          onPin={handlePinRisk}
          onClose={() => setRiskPinTarget(null)}
        />
      )}
    </div>
  );
}
