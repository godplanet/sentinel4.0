import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Folder,
  AlertTriangle,
  ShieldCheck,
  GripVertical,
  Save,
  RotateCcw,
  Info,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { ProcessNode, RiskNode, ControlNode } from './components/CustomNodes';
import { useProcessGraph, useSaveProcessGraph } from './api';

const NODE_TYPES: NodeTypes = {
  processNode: ProcessNode,
  riskNode: RiskNode,
  controlNode: ControlNode,
};

interface PaletteItem {
  type: string;
  label: string;
  defaultLabel: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  colorClass: string;
  dragBg: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: 'processNode',
    label: 'Süreç',
    defaultLabel: 'Yeni Süreç',
    description: 'İş süreci adımı',
    icon: Folder,
    colorClass: 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300',
    dragBg: 'bg-blue-50',
  },
  {
    type: 'riskNode',
    label: 'Risk',
    defaultLabel: 'Yeni Risk',
    description: 'Risk olayı / tehdit',
    icon: AlertTriangle,
    colorClass: 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300',
    dragBg: 'bg-amber-50',
  },
  {
    type: 'controlNode',
    label: 'Kontrol',
    defaultLabel: 'Yeni Kontrol',
    description: 'Kontrol mekanizması',
    icon: ShieldCheck,
    colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300',
    dragBg: 'bg-emerald-50',
  },
];

const LEGEND = [
  { color: 'bg-blue-400', label: 'Süreç → Süreç bağlantısı' },
  { color: 'bg-amber-400', label: 'Süreç → Risk ilişkisi (kesikli)' },
  { color: 'bg-emerald-400', label: 'Risk → Kontrol mitigasyonu' },
];

const EMPTY_NODES: Node[] = [];
const EMPTY_EDGES: Edge[] = [];

export interface ProcessFlowEditorProps {
  entityId?: string | null;
}

export function ProcessFlowEditor({ entityId = null }: ProcessFlowEditorProps) {
  const { data: graphData, isLoading } = useProcessGraph(entityId);
  const saveMutation = useSaveProcessGraph(entityId);
  const [nodes, setNodes, onNodesChange] = useNodesState(EMPTY_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(EMPTY_EDGES);
  const [mapId, setMapId] = useState<string | null>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!graphData) return;
    setNodes(graphData.nodes.length > 0 ? graphData.nodes : EMPTY_NODES);
    setEdges(graphData.edges.length > 0 ? graphData.edges : EMPTY_EDGES);
    setMapId(graphData.mapId);
  }, [graphData]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            style: { stroke: '#94a3b8', strokeWidth: 1.5 },
          },
          eds,
        ),
      ),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!rfInstance || !reactFlowWrapper.current) return;

      const type = event.dataTransfer.getData('application/reactflow/type');
      const defaultLabel = event.dataTransfer.getData('application/reactflow/label');
      if (!type) return;

      const position = rfInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: defaultLabel || 'Yeni Düğüm' },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [rfInstance, setNodes],
  );

  const onPaletteDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>, item: PaletteItem) => {
      event.dataTransfer.setData('application/reactflow/type', item.type);
      event.dataTransfer.setData('application/reactflow/label', item.defaultLabel);
      event.dataTransfer.effectAllowed = 'move';
    },
    [],
  );

  const handleSave = useCallback(() => {
    saveMutation.mutate(
      { mapId, nodes, edges },
      {
        onSuccess: (savedId) => {
          toast.success('Süreç haritası mühürlendi', {
            style: { background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46' },
          });
          if (!mapId) setMapId(savedId);
        },
        onError: () => {
          toast.error('Kaydetme başarısız. Lütfen tekrar deneyin.');
        },
      },
    );
  }, [mapId, nodes, edges, saveMutation]);

  const handleReset = useCallback(() => {
    if (!confirm('Kanvası veritabanındaki son kaydedilmiş haline sıfırlamak istediğinizden emin misiniz?')) return;
    if (graphData) {
      setNodes(graphData.nodes.length > 0 ? graphData.nodes : EMPTY_NODES);
      setEdges(graphData.edges.length > 0 ? graphData.edges : EMPTY_EDGES);
    } else {
      setNodes(EMPTY_NODES);
      setEdges(EMPTY_EDGES);
    }
  }, [graphData, setNodes, setEdges]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-canvas text-slate-500 text-sm">
        Süreç verisi yükleniyor…
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <aside className="w-52 shrink-0 bg-surface border-r border-slate-200 flex flex-col select-none">
        <div className="px-4 py-3.5 border-b border-slate-100">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Düğüm Paleti</p>
          <p className="text-[9px] text-slate-400 mt-0.5">Kanvasa sürükle &amp; bırak</p>
        </div>

        <div className="p-3 space-y-2 flex-1 overflow-y-auto">
          {PALETTE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.type}
                draggable
                onDragStart={(e) => onPaletteDragStart(e, item)}
                className={clsx(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-bold',
                  'cursor-grab active:cursor-grabbing transition-all hover:shadow-sm',
                  item.colorClass,
                )}
              >
                <GripVertical size={11} className="shrink-0 opacity-40" />
                <Icon size={13} className="shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold leading-none">{item.label}</p>
                  <p className="text-[9px] opacity-60 mt-0.5 leading-none truncate font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-4 py-3 border-t border-slate-100">
          <button
            onClick={() => setShowLegend((v) => !v)}
            className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-slate-700 transition-colors mb-2"
          >
            <Info size={11} />
            Renk Göstergesi
          </button>
          {showLegend && (
            <div className="space-y-1.5">
              {LEGEND.map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <span className={clsx('w-2.5 h-2.5 rounded-full shrink-0', l.color)} />
                  <span className="text-[9px] text-slate-500 leading-snug">{l.label}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-[9px] text-slate-400 leading-relaxed mt-2">
            Düğümleri bağlamak için kaynak noktasından hedef noktasına sürükleyin.
          </p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full min-w-0">
        <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-semibold">
              {nodes.length} düğüm &bull; {edges.length} bağlantı
            </span>
            {saveMutation.isSuccess && (
              <span className="text-[10px] text-emerald-600 font-semibold">✓ Mühürlendi</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-canvas transition-colors"
            >
              <RotateCcw size={11} />
              Sıfırla
            </button>
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-60"
            >
              <Save size={11} />
              {saveMutation.isPending ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        </div>

        <div
          ref={reactFlowWrapper}
          className="flex-1 bg-canvas"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setRfInstance}
            nodeTypes={NODE_TYPES}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            defaultEdgeOptions={{
              type: 'smoothstep',
              style: { stroke: '#94a3b8', strokeWidth: 1.5 },
            }}
            deleteKeyCode="Delete"
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#cbd5e1"
            />
            <Controls className="!bg-surface !border-slate-200/80 !rounded-xl !shadow-sm" />
            <MiniMap
              className="!bg-surface !border-slate-200/80 !rounded-xl !shadow-sm"
              nodeColor={(n) => {
                if (n.type === 'processNode') return '#3b82f6';
                if (n.type === 'riskNode') return '#f59e0b';
                if (n.type === 'controlNode') return '#10b981';
                return '#94a3b8';
              }}
              maskColor="rgba(0,0,0,0.04)"
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
