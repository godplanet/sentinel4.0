import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network, User, Building, Landmark, Hash, Info, X,
} from 'lucide-react';
import clsx from 'clsx';
import type { EntityRelationship, NodeType, RelationType } from '@/features/investigation/types';
import { RELATION_LABELS, NODE_TYPE_LABELS } from '@/features/investigation/types';

interface LinkAnalysisProps {
  relationships: EntityRelationship[];
}

interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  connections: number;
}

interface GraphLink {
  source: string;
  target: string;
  relationType: RelationType;
  confidence: number;
  evidenceRef: string | null;
}

const NODE_COLORS: Record<NodeType, string> = {
  PERSON: '#ef4444',
  VENDOR: '#f59e0b',
  COMPANY: '#3b82f6',
  ACCOUNT: '#6b7280',
};

const RELATION_COLORS: Record<RelationType, string> = {
  SHARED_ADDRESS: '#ef4444',
  SAME_IP: '#f97316',
  TRANSFER: '#eab308',
  SHARED_PHONE: '#ec4899',
  OWNERSHIP: '#3b82f6',
  APPROVAL: '#8b5cf6',
};

const NODE_ICONS: Record<NodeType, typeof User> = {
  PERSON: User,
  VENDOR: Building,
  COMPANY: Landmark,
  ACCOUNT: Hash,
};

function buildGraph(relationships: EntityRelationship[]): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodeMap = new Map<string, GraphNode>();
  const links: GraphLink[] = [];

  for (const rel of relationships) {
    if (!nodeMap.has(rel.source_node)) {
      nodeMap.set(rel.source_node, {
        id: rel.source_node,
        label: rel.source_node,
        type: rel.source_type,
        connections: 0,
      });
    }
    if (!nodeMap.has(rel.target_node)) {
      nodeMap.set(rel.target_node, {
        id: rel.target_node,
        label: rel.target_node,
        type: rel.target_type,
        connections: 0,
      });
    }

    nodeMap.get(rel.source_node)!.connections++;
    nodeMap.get(rel.target_node)!.connections++;

    links.push({
      source: rel.source_node,
      target: rel.target_node,
      relationType: rel.relation_type,
      confidence: rel.confidence,
      evidenceRef: rel.evidence_ref,
    });
  }

  return { nodes: Array.from(nodeMap.values()), links };
}

export function LinkAnalysis({ relationships }: LinkAnalysisProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 450 });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedLink, setSelectedLink] = useState<GraphLink | null>(null);

  const { nodes, links } = useMemo(() => buildGraph(relationships), [relationships]);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: Math.max(entry.contentRect.height, 400),
        });
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const nodeRelations = useMemo(() => {
    if (!selectedNode) return [];
    return relationships.filter(
      (r) => r.source_node === selectedNode.id || r.target_node === selectedNode.id,
    );
  }, [selectedNode, relationships]);

  const handleNodeClick = useCallback((node: { id?: string | number }) => {
    const found = nodes.find((n) => n.id === node.id);
    setSelectedNode(found || null);
    setSelectedLink(null);
  }, [nodes]);

  const handleLinkClick = useCallback((link: { relationType?: RelationType; confidence?: number; evidenceRef?: string | null; source?: unknown; target?: unknown }) => {
    setSelectedLink(link as GraphLink);
    setSelectedNode(null);
  }, []);

  const paintNode = useCallback((node: { id?: string | number; type?: NodeType; connections?: number; x?: number; y?: number }, ctx: CanvasRenderingContext2D) => {
    const x = node.x || 0;
    const y = node.y || 0;
    const radius = 6 + (node.connections || 0) * 1.5;
    const color = NODE_COLORS[node.type as NodeType] || '#6b7280';
    const isSelected = selectedNode?.id === node.id;

    if (isSelected) {
      ctx.beginPath();
      ctx.arc(x, y, radius + 6, 0, 2 * Math.PI);
      ctx.fillStyle = color + '30';
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#334155';
    ctx.fillText(String(node.id || ''), x, y + radius + 4);
  }, [selectedNode]);

  const paintLink = useCallback((link: { source?: { x?: number; y?: number }; target?: { x?: number; y?: number }; relationType?: RelationType; confidence?: number }, ctx: CanvasRenderingContext2D) => {
    const src = link.source as { x?: number; y?: number } | undefined;
    const tgt = link.target as { x?: number; y?: number } | undefined;
    if (!src?.x || !src?.y || !tgt?.x || !tgt?.y) return;

    const color = RELATION_COLORS[link.relationType as RelationType] || '#94a3b8';
    const width = 1 + ((link.confidence || 50) / 50);

    ctx.beginPath();
    ctx.moveTo(src.x, src.y);
    ctx.lineTo(tgt.x, tgt.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();

    const mx = (src.x + tgt.x) / 2;
    const my = (src.y + tgt.y) / 2;
    ctx.font = '8px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    ctx.fillText(
      RELATION_LABELS[link.relationType as RelationType] || '',
      mx, my - 6,
    );
  }, []);

  if (relationships.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-slate-400">
        <Network size={16} className="mr-2" />
        Henuz iliski verisi bulunmuyor.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {(Object.entries(NODE_COLORS) as [NodeType, string][]).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-slate-500">{NODE_TYPE_LABELS[type]}</span>
          </div>
        ))}
        <div className="h-3 w-px bg-slate-200 mx-1" />
        {(Object.entries(RELATION_COLORS) as [RelationType, string][]).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1">
            <div className="w-4 h-0.5 rounded" style={{ backgroundColor: color }} />
            <span className="text-[9px] text-slate-400">{RELATION_LABELS[type]}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div ref={containerRef} className="xl:col-span-2 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden relative" style={{ minHeight: 450 }}>
          <ForceGraph2D
            width={dimensions.width}
            height={dimensions.height}
            graphData={{ nodes, links }}
            nodeCanvasObject={paintNode as never}
            linkCanvasObject={paintLink as never}
            onNodeClick={handleNodeClick as never}
            onLinkClick={handleLinkClick as never}
            cooldownTicks={80}
            linkDirectionalArrowLength={4}
            linkDirectionalArrowRelPos={0.8}
            d3AlphaDecay={0.03}
            d3VelocityDecay={0.3}
            enableZoomInteraction={true}
            enablePanInteraction={true}
          />
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {selectedNode && (
              <motion.div
                key={`node-${selectedNode.id}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-white border border-slate-200 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = NODE_ICONS[selectedNode.type];
                      return <Icon size={14} style={{ color: NODE_COLORS[selectedNode.type] }} />;
                    })()}
                    <span className="text-sm font-bold text-slate-900">{selectedNode.label}</span>
                  </div>
                  <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full border" style={{
                    color: NODE_COLORS[selectedNode.type],
                    borderColor: NODE_COLORS[selectedNode.type] + '40',
                    backgroundColor: NODE_COLORS[selectedNode.type] + '10',
                  }}>
                    {NODE_TYPE_LABELS[selectedNode.type]}
                  </span>
                  <span className="text-[10px] text-slate-500">{selectedNode.connections} baglanti</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500">Iliskiler</span>
                  {nodeRelations.map((r) => {
                    const otherNode = r.source_node === selectedNode.id ? r.target_node : r.source_node;
                    return (
                      <div key={r.id} className="p-2 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: RELATION_COLORS[r.relation_type] }} />
                          <span className="text-[10px] font-medium text-slate-700">{otherNode}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[9px] text-slate-500">{RELATION_LABELS[r.relation_type]}</span>
                          <span className="text-[9px] font-mono text-slate-400">%{r.confidence}</span>
                        </div>
                        {r.evidence_ref && (
                          <span className="text-[9px] text-slate-400 block mt-0.5">{r.evidence_ref}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {selectedLink && (
              <motion.div
                key="link-detail"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-white border border-slate-200 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">Baglanti Detayi</span>
                  <button onClick={() => setSelectedLink(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div><span className="text-slate-500">Tur:</span> <span className="font-medium text-slate-700">{RELATION_LABELS[selectedLink.relationType]}</span></div>
                  <div><span className="text-slate-500">Guven:</span> <span className="font-mono font-bold text-slate-700">%{selectedLink.confidence}</span></div>
                  {selectedLink.evidenceRef && (
                    <div><span className="text-slate-500">Kanit:</span> <span className="text-slate-700">{selectedLink.evidenceRef}</span></div>
                  )}
                </div>
              </motion.div>
            )}

            {!selectedNode && !selectedLink && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-slate-200 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Info size={14} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">Sherlock Insight</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Grafik uzerinde bir dugum veya baglantiya tiklayarak detaylari goruntuleyebilirsiniz.
                  Kirmizi cizgiler yuksek risk iliskilerini, kalin cizgiler yuksek guven seviyesini gosterir.
                </p>
                <SherlockInsights relationships={relationships} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function SherlockInsights({ relationships }: { relationships: EntityRelationship[] }) {
  const insights = useMemo(() => {
    const results: string[] = [];
    const sameIp = relationships.filter((r) => r.relation_type === 'SAME_IP');
    if (sameIp.length >= 2) {
      const nodes = [...new Set(sameIp.flatMap((r) => [r.source_node, r.target_node]))];
      const persons = nodes.filter((_, i) => {
        const rel = sameIp.find((r) => r.source_node === nodes[i] || r.target_node === nodes[i]);
        return rel && (rel.source_type === 'PERSON' || rel.target_type === 'PERSON');
      });
      const vendors = nodes.filter((_, i) => {
        const rel = sameIp.find((r) => r.source_node === nodes[i] || r.target_node === nodes[i]);
        return rel && (rel.source_type === 'VENDOR' || rel.target_type === 'VENDOR');
      });
      if (persons.length > 0 && vendors.length > 0) {
        results.push(`Sherlock: ${persons[0]} ve ${vendors[0]} ayni IP adresinden sisteme erisim saglamis.`);
      }
    }

    const shared = relationships.filter((r) => r.relation_type === 'SHARED_ADDRESS' || r.relation_type === 'SHARED_PHONE');
    for (const s of shared) {
      results.push(`Sherlock: ${s.source_node} ile ${s.target_node} arasinda ${RELATION_LABELS[s.relation_type].toLowerCase()} tespit edildi.`);
    }

    const ownership = relationships.filter((r) => r.relation_type === 'OWNERSHIP' && r.confidence > 90);
    for (const o of ownership) {
      results.push(`Sherlock: ${o.source_node}, ${o.target_node} uzerinde dogrudan sahiplik baglantisi mevcut (%${o.confidence}).`);
    }

    return results.slice(0, 4);
  }, [relationships]);

  if (insights.length === 0) return null;

  return (
    <div className="mt-3 space-y-1.5">
      <span className="text-[10px] font-bold text-amber-600">Otomatik Tespitler</span>
      {insights.map((insight, i) => (
        <div key={i} className={clsx(
          'p-2 rounded-lg text-[10px] leading-relaxed',
          'bg-amber-50 border border-amber-200 text-amber-800',
        )}>
          {insight}
        </div>
      ))}
    </div>
  );
}
