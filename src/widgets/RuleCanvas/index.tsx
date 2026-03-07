/**
 * RuleCanvas — Visual CCM Rule Builder Widget
 * widgets/RuleCanvas/index.tsx  (Wave 52)
 *
 * React Flow tabanlı sürükle-bırak kural tuval editörü.
 * C-Level · Apple Glassmorphism · %100 Light Mode
 *
 * NOT: reactflow paketi zaten package.json'da "reactflow" olarak
 * bulunmaktadır (process-canvas kullanımından). Yoksa: npm i reactflow
 */

import React, { useCallback, useState, useRef } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import {
  Save, Play, Trash2, ZoomIn, Loader2, Plus,
  Zap, TrendingUp, Clock, Activity, Merge, AlertTriangle, Flag, GitMerge,
} from 'lucide-react';
import {
  useNodeCatalog, useSaveRuleGraph,
  type VisualRule, type RFNode, type RFEdge, type RuleNodeCatalog,
} from '@/features/ccm-builder/api/ccm-builder';

// ─── İkon Haritası ────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Zap, TrendingUp, Clock, Activity, Merge, AlertTriangle, Flag, GitMerge,
};

// ─── Renk Haritası ────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, { border: string; bg: string; text: string; header: string }> = {
  purple: { border: 'border-purple-300', bg: 'bg-purple-50',  text: 'text-purple-700', header: 'bg-purple-100' },
  blue:   { border: 'border-blue-300',   bg: 'bg-blue-50',    text: 'text-blue-700',   header: 'bg-blue-100' },
  amber:  { border: 'border-amber-300',  bg: 'bg-amber-50',   text: 'text-amber-700',  header: 'bg-amber-100' },
  orange: { border: 'border-orange-300', bg: 'bg-orange-50',  text: 'text-orange-700', header: 'bg-orange-100' },
  red:    { border: 'border-red-300',    bg: 'bg-red-50',     text: 'text-red-700',    header: 'bg-red-100' },
  slate:  { border: 'border-slate-300',  bg: 'bg-slate-50',   text: 'text-slate-600',  header: 'bg-slate-100' },
};

// ─── Özel Node Bileşeni ───────────────────────────────────────────────────────

function CustomNode({ data }: { data: RFNode['data'] }) {
  const colors = COLOR_MAP[data.color ?? 'slate'] ?? COLOR_MAP.slate;
  const IconComp = ICON_MAP[data.icon ?? ''] ?? Zap;

  return (
    <div className={`rounded-xl border-2 shadow-md min-w-[160px] ${colors.border} ${colors.bg} overflow-hidden`}>
      <div className={`px-3 py-2 flex items-center gap-2 ${colors.header}`}>
        <IconComp size={13} className={colors.text} />
        <span className={`text-[10px] font-bold ${colors.text} uppercase tracking-wide`}>
          {data.subtype?.replace(/_/g, ' ') ?? 'NODE'}
        </span>
      </div>
      <div className="px-3 py-2">
        <p className="text-xs font-semibold text-slate-800 leading-snug">{data.label}</p>
        {data.config && Object.keys(data.config).length > 0 && (
          <div className="mt-1.5 space-y-0.5">
            {Object.entries(data.config).slice(0, 2).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1 text-[9px] font-mono text-slate-500">
                <span className="text-slate-400">{k}:</span>
                <span className="font-bold text-slate-600">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const nodeTypes = { trigger: CustomNode, condition: CustomNode, aggregator: CustomNode, action: CustomNode };

// ─── Kenar Kenar Paneli (Node Ekle) ──────────────────────────────────────────

function NodePalette({
  catalog,
  onAddNode,
}: {
  catalog: RuleNodeCatalog[];
  onAddNode: (n: RuleNodeCatalog) => void;
}) {
  const groups: Record<string, RuleNodeCatalog[]> = {};
  (catalog || []).forEach((n) => {
    const g = n.node_type;
    if (!groups[g]) groups[g] = [];
    groups[g].push(n);
  });

  const groupLabels: Record<string, string> = {
    TRIGGER: '⚡ Tetikleyici',
    CONDITION: '🔍 Koşul',
    AGGREGATOR: '🔀 Mantık Kapısı',
    ACTION: '🚨 Aksiyon',
  };

  return (
    <div className="w-56 shrink-0 bg-white/80 backdrop-blur border-r border-slate-200 overflow-y-auto p-3 space-y-4">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider px-1">Düğüm Paleti</p>

      {Object.entries(groups).map(([group, nodes]) => (
        <div key={group}>
          <p className="text-[9px] font-black text-slate-400 uppercase mb-2 px-1">
            {groupLabels[group] ?? group}
          </p>
          <div className="space-y-1.5">
            {(nodes || []).map((n) => {
              const colors = COLOR_MAP[n.color_scheme] ?? COLOR_MAP.slate;
              const IconComp = ICON_MAP[n.icon ?? ''] ?? Zap;
              return (
                <button
                  key={n.id}
                  onClick={() => onAddNode(n)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border ${colors.border} ${colors.bg}
                    hover:shadow-sm transition-all group text-left`}
                >
                  <IconComp size={12} className={colors.text} />
                  <span className={`text-[10px] font-semibold ${colors.text} leading-tight`}>{n.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Ana RuleCanvas ───────────────────────────────────────────────────────────

interface RuleCanvasProps {
  rule?: VisualRule | null;
  onSaved?: (savedRule: VisualRule) => void;
}

export function RuleCanvas({ rule, onSaved }: RuleCanvasProps) {
  const { data: catalog = [] } = useNodeCatalog();
  const saveRule = useSaveRuleGraph();

  const parseNodes = (r: VisualRule | null | undefined): Node[] =>
    (r?.nodes_json || []).map((n) => ({
      id:       n.id,
      type:     n.type,
      position: n.position,
      data:     n.data,
    }));

  const parseEdges = (r: VisualRule | null | undefined): Edge[] =>
    (r?.edges_json || []).map((e) => ({
      id:     e.id,
      source: e.source,
      target: e.target,
    }));

  const [nodes, setNodes, onNodesChange] = useNodesState(parseNodes(rule));
  const [edges, setEdges, onEdgesChange] = useEdgesState(parseEdges(rule));
  const [ruleName, setRuleName] = useState(rule?.name ?? 'Yeni Kural');
  const [ruleCode, setRuleCode] = useState(rule?.rule_code ?? `VR-${Date.now().toString(36).toUpperCase()}`);
  const [category, setCategory] = useState<VisualRule['category']>(rule?.category ?? 'AML');
  const [severity, setSeverity] = useState<VisualRule['severity']>(rule?.severity ?? 'HIGH');
  const nodeCountRef = useRef(nodes.length);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleAddNode = useCallback((catalogNode: RuleNodeCatalog) => {
    nodeCountRef.current++;
    const newNode: Node = {
      id:       `n${nodeCountRef.current}-${Date.now()}`,
      type:     catalogNode.node_type.toLowerCase() as RFNode['type'],
      position: { x: 100 + (nodeCountRef.current % 4) * 200, y: 100 + Math.floor(nodeCountRef.current / 4) * 150 },
      data: {
        label:    catalogNode.label,
        subtype:  catalogNode.node_subtype,
        icon:     catalogNode.icon ?? undefined,
        color:    catalogNode.color_scheme,
        config:   {},
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const handleSave = async () => {
    await saveRule.mutateAsync({
      ruleId:   rule?.id ?? null,
      rule_code: ruleCode,
      name:     ruleName,
      category,
      severity,
      // (nodes || []) ve (edges || []) kalkanı
      nodes: (nodes || []).map((n): RFNode => ({
        id:       n.id,
        type:     n.type as RFNode['type'],
        position: n.position,
        data:     n.data as RFNode['data'],
      })),
      edges: (edges || []).map((e): RFEdge => ({
        id:     e.id,
        source: e.source,
        target: e.target,
      })),
    });
  };

  return (
    <div className="flex h-full bg-slate-50/50">
      {/* Palet */}
      <NodePalette catalog={catalog} onAddNode={handleAddNode} />

      {/* Tuval */}
      <div className="flex-1 flex flex-col">
        {/* Araç Çubuğu */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur border-b border-slate-200">
          <input
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
            className="text-sm font-bold text-slate-800 bg-transparent border-b-2 border-blue-300 focus:border-blue-500 outline-none px-1 min-w-[200px]"
            placeholder="Kural Adı"
          />
          <input
            value={ruleCode}
            onChange={(e) => setRuleCode(e.target.value)}
            className="text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200 rounded px-2 py-1 focus:outline-none w-32"
            placeholder="VR-AML-001"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as VisualRule['category'])}
            className="text-[10px] px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none"
          >
            {['AML','FRAUD','OPERATIONAL','REGULATORY','BENFORD','STRUCTURING'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as VisualRule['severity'])}
            className="text-[10px] px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none"
          >
            {['CRITICAL','HIGH','MEDIUM','LOW'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => { setNodes([]); setEdges([]); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Trash2 size={11} /> Temizle
            </button>
            <button
              onClick={handleSave}
              disabled={saveRule.isPending}
              className="flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              {saveRule.isPending
                ? <><Loader2 size={11} className="animate-spin" /> Kaydediliyor…</>
                : <><Save size={11} /> Kaydet</>
              }
            </button>
          </div>
        </div>

        {/* React Flow Tuval */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-slate-50"
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />
            <Controls className="bg-white border border-slate-200 rounded-xl shadow-sm" />
            <MiniMap
              className="bg-white border border-slate-200 rounded-xl shadow-sm"
              nodeStrokeWidth={2}
              pannable
              zoomable
            />
            <Panel position="top-right" className="text-[9px] text-slate-400 font-mono">
              {nodes.length} düğüm · {edges.length} bağlantı
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
