import { useRef, useState, useCallback, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Shield,
  AlertTriangle,
  Layers,
  Lock,
  Search,
} from 'lucide-react';
import type { GraphData, GraphNode } from '@/features/risk-graph';

interface RiskNetworkProps {
  graphData: GraphData;
  width?: number;
  height?: number;
}

export function RiskNetwork({
  graphData,
  width = window.innerWidth,
  height = window.innerHeight,
}: RiskNetworkProps) {
  const graphRef = useRef<any>();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
  const [highlightLinks, setHighlightLinks] = useState(new Set<string>());

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node as GraphNode);
  }, []);

  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() * 1.2, 400);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() / 1.2, 400);
    }
  };

  const handleCenterGraph = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
      return;
    }

    const lowerQuery = query.toLowerCase();
    const matchingNodes = graphData.nodes.filter(
      (node) =>
        node.label.toLowerCase().includes(lowerQuery) ||
        node.path.toLowerCase().includes(lowerQuery)
    );

    const nodeIds = new Set(matchingNodes.map((n) => n.id));
    setHighlightNodes(nodeIds);

    const linkIds = new Set(
      graphData.links
        .filter(
          (link) =>
            nodeIds.has(typeof link.source === 'string' ? link.source : link.source.id) ||
            nodeIds.has(typeof link.target === 'string' ? link.target : link.target.id)
        )
        .map((link) => `${link.source}-${link.target}`)
    );
    setHighlightLinks(linkIds);
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'domain':
        return Layers;
      case 'process':
        return Shield;
      case 'risk':
        return AlertTriangle;
      case 'control':
        return Lock;
      default:
        return Shield;
    }
  };

  useEffect(() => {
    if (graphRef.current && graphData.nodes.length > 0) {
      setTimeout(() => {
        handleCenterGraph();
      }, 100);
    }
  }, [graphData]);

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden">
      <div className="absolute top-4 left-4 z-10 flex gap-3">
        <div className="backdrop-blur-xl bg-white/10 rounded-lg border border-white/20 shadow-2xl p-3 flex gap-2">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
            title="Zoom In"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
            title="Zoom Out"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <button
            onClick={handleCenterGraph}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
            title="Center Graph"
          >
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-lg border border-white/20 shadow-2xl p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search nodes..."
              className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64"
            />
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 backdrop-blur-xl bg-white/10 rounded-lg border border-white/20 shadow-2xl p-4">
        <h3 className="text-white font-semibold mb-3 text-sm">Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-500" />
            <span className="text-white/80 text-xs">Domain</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <span className="text-white/80 text-xs">Process</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span className="text-white/80 text-xs">Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="text-white/80 text-xs">Control</span>
          </div>
        </div>
      </div>

      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={width}
        height={height}
        backgroundColor="#0F172A"
        nodeLabel="label"
        nodeRelSize={6}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.label || '';
          const fontSize = 12 / globalScale;
          const nodeSize = node.size || 8;
          const isHighlighted = highlightNodes.has(node.id);

          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);

          if (isHighlighted) {
            ctx.shadowColor = node.color;
            ctx.shadowBlur = 20;
          } else {
            ctx.shadowColor = node.color;
            ctx.shadowBlur = 10;
          }

          ctx.fillStyle = node.color;
          ctx.fill();

          ctx.shadowBlur = 0;
          ctx.strokeStyle = isHighlighted ? '#fff' : 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = isHighlighted ? 2 : 1;
          ctx.stroke();

          if (globalScale > 1.5) {
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillText(label, node.x, node.y + nodeSize + fontSize);
          }
        }}
        linkColor={(link: any) => {
          const linkId = `${link.source}-${link.target}`;
          return highlightLinks.has(linkId)
            ? 'rgba(59, 130, 246, 0.6)'
            : 'rgba(255, 255, 255, 0.2)';
        }}
        linkWidth={(link: any) => {
          const linkId = `${link.source}-${link.target}`;
          return highlightLinks.has(linkId) ? 2 : 1;
        }}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={(link: any) => {
          const linkId = `${link.source}-${link.target}`;
          return highlightLinks.has(linkId) ? 3 : 0;
        }}
        onNodeClick={handleNodeClick}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />

      {selectedNode && (
        <div className="absolute top-0 right-0 w-96 h-full backdrop-blur-xl bg-white/10 border-l border-white/20 shadow-2xl overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = getNodeIcon(selectedNode.type);
                  return <Icon className="h-8 w-8 text-white" />;
                })()}
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedNode.label}</h2>
                  <p className="text-sm text-white/60 font-mono">{selectedNode.path}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-sm font-semibold text-white/80 mb-2">Type</h3>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: selectedNode.color }}
                  />
                  <span className="text-white capitalize">{selectedNode.type}</span>
                </div>
              </div>

              {selectedNode.data?.description && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-sm font-semibold text-white/80 mb-2">Description</h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {selectedNode.data.description}
                  </p>
                </div>
              )}

              {selectedNode.data?.risk_rating && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-sm font-semibold text-white/80 mb-2">Risk Rating</h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedNode.data.risk_rating === 'HIGH'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : selectedNode.data.risk_rating === 'MEDIUM'
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    }`}
                  >
                    {selectedNode.data.risk_rating}
                  </span>
                </div>
              )}

              {selectedNode.data?.inherent_score && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-sm font-semibold text-white/80 mb-2">Risk Scores</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/70 text-sm">Inherent Score</span>
                      <span className="text-white font-semibold">
                        {selectedNode.data.inherent_score}
                      </span>
                    </div>
                    {selectedNode.data.residual_score && (
                      <div className="flex justify-between">
                        <span className="text-white/70 text-sm">Residual Score</span>
                        <span className="text-white font-semibold">
                          {selectedNode.data.residual_score}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-sm font-semibold text-white/80 mb-2">Node Path</h3>
                <div className="flex flex-wrap gap-1">
                  {selectedNode.path.split('.').map((segment, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30 font-mono"
                    >
                      {segment}
                    </span>
                  ))}
                </div>
              </div>

              {selectedNode.data && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-sm font-semibold text-white/80 mb-2">Raw Data</h3>
                  <pre className="text-xs text-white/70 font-mono overflow-x-auto">
                    {JSON.stringify(selectedNode.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 backdrop-blur-xl bg-white/10 rounded-lg border border-white/20 shadow-2xl px-4 py-2">
        <p className="text-white/80 text-sm">
          <span className="font-semibold">{graphData.nodes.length}</span> nodes •{' '}
          <span className="font-semibold">{graphData.links.length}</span> links
        </p>
      </div>
    </div>
  );
}
