import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ForceGraph2D from 'react-force-graph-2d';
import {
  Search, AlertTriangle, Shield, Building2, GraduationCap,
  MapPin, Phone, User, Loader2, Maximize2,
} from 'lucide-react';
import clsx from 'clsx';
import {
  generateSuspicionGraph,
  NODE_COLORS,
  RISK_RING,
} from './investigator-graph-data';
import type { SuspicionGraph, SuspicionNode } from './investigator-graph-data';

interface OsintStep {
  text: string;
  status: 'running' | 'done' | 'flagged';
}

const OSINT_STEPS = (name: string): OsintStep[] => [
  { text: `"${name}" Ticaret Sicil Gazetesi taraniyor...`, status: 'running' },
  { text: 'Sirket kaydi bulundu. Kurulus: 2025-11-01 (Yeni)', status: 'flagged' },
  { text: 'LinkedIn profilleri taranarak calisanlarla eslestiriliyor...', status: 'running' },
  { text: 'Ortak gecmis tespit edildi: Bogazici Uni. + Omega Consulting', status: 'flagged' },
  { text: 'Adres ve telefon capraz kontrolu yapiliyor...', status: 'running' },
  { text: 'Ortak irtibat numarasi tespit edildi. Adres yakinligi: 0.92', status: 'flagged' },
  { text: 'Suphe Grafi olusturuluyor...', status: 'running' },
  { text: 'ANALIZ TAMAMLANDI. Risk Skoru: 87/100', status: 'done' },
];

const CATEGORY_ICONS: Record<SuspicionNode['category'], typeof Shield> = {
  vendor: Building2,
  employee: User,
  university: GraduationCap,
  workplace: Building2,
  address: MapPin,
  phone: Phone,
};

const CATEGORY_LABELS: Record<SuspicionNode['category'], string> = {
  vendor: 'Vendor',
  employee: 'Calisan',
  university: 'Universite',
  workplace: 'Is Yeri',
  address: 'Adres',
  phone: 'Telefon',
};

export function InvestigatorTerminal() {
  const [vendorName, setVendorName] = useState('');
  const [scanning, setScanning] = useState(false);
  const [osintSteps, setOsintSteps] = useState<OsintStep[]>([]);
  const [graphData, setGraphData] = useState<SuspicionGraph | null>(null);
  const [selectedNode, setSelectedNode] = useState<SuspicionNode | null>(null);
  const graphRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width: Math.max(width, 300), height: Math.max(height, 300) });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const runScan = useCallback(async () => {
    if (!vendorName.trim() || scanning) return;
    setScanning(true);
    setGraphData(null);
    setSelectedNode(null);
    setOsintSteps([]);

    const steps = OSINT_STEPS(vendorName.trim());

    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 500));
      setOsintSteps((prev) => [...prev, steps[i]]);
    }

    await new Promise((r) => setTimeout(r, 400));
    const result = generateSuspicionGraph(vendorName.trim());
    setGraphData(result);
    setScanning(false);

    setTimeout(() => {
      graphRef.current?.zoomToFit(400, 40);
    }, 300);
  }, [vendorName, scanning]);

  const forceGraphData = graphData
    ? {
        nodes: graphData.nodes.map((n) => ({ ...n })),
        links: graphData.links.map((l) => ({ ...l })),
      }
    : { nodes: [], links: [] };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} className="text-teal-600" />
          <span className="text-sm font-bold text-slate-900">Sherlock -- OSINT & Cikar Catismasi Tarayicisi</span>
        </div>

        <div className="flex gap-2">
          <input
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runScan()}
            placeholder="Vendor adi girin (ornek: Fraud_Corp Ltd.)..."
            disabled={scanning}
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:opacity-60"
          />
          <button
            onClick={runScan}
            disabled={!vendorName.trim() || scanning}
            className="flex items-center gap-2 px-4 py-2 bg-teal-700 text-white text-xs font-bold rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-40"
          >
            {scanning ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            {scanning ? 'Taraniyor...' : 'Tara'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {osintSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-slate-950 rounded-xl border-2 border-slate-800 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border-b border-slate-800">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[10px] font-mono text-slate-500 ml-2">OSINT TARAMASI</span>
              {scanning && (
                <span className="ml-auto flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">AKTIF</span>
                </span>
              )}
            </div>
            <div className="p-3 max-h-40 overflow-y-auto font-mono text-xs space-y-1">
              {osintSteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-slate-600 shrink-0">[{String(i + 1).padStart(2, '0')}]</span>
                  <span className={clsx(
                    step.status === 'flagged' ? 'text-amber-400' :
                    step.status === 'done' ? 'text-emerald-400' :
                    'text-slate-400',
                  )}>
                    {step.status === 'flagged' && '!! '}
                    {step.text}
                  </span>
                </motion.div>
              ))}
              {scanning && (
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="text-emerald-500"
                >
                  $ _
                </motion.span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {graphData && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          >
            <div
              ref={containerRef}
              className="lg:col-span-2 relative bg-slate-950 rounded-xl border-2 border-slate-800 overflow-hidden"
              style={{ minHeight: 400 }}
            >
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500 bg-slate-900/80 px-2 py-1 rounded">
                  SUPHE GRAFI -- {graphData.nodes.length} dugum, {graphData.links.length} baglanti
                </span>
                <button
                  onClick={() => graphRef.current?.zoomToFit(400, 40)}
                  className="p-1 bg-slate-900/80 rounded hover:bg-slate-800 transition-colors text-slate-400"
                >
                  <Maximize2 size={12} />
                </button>
              </div>

              <ForceGraph2D
                ref={graphRef}
                graphData={forceGraphData}
                width={dimensions.width}
                height={dimensions.height}
                backgroundColor="#020617"
                nodeRelSize={8}
                linkColor={() => 'rgba(100,116,139,0.35)'}
                linkWidth={(link: any) => Math.max(1, (link.strength || 0.5) * 3)}
                linkDirectionalParticles={2}
                linkDirectionalParticleWidth={2}
                linkDirectionalParticleSpeed={0.005}
                linkLabel={(link: any) => link.label}
                cooldownTicks={80}
                d3AlphaDecay={0.03}
                d3VelocityDecay={0.25}
                onNodeClick={(node: any) => {
                  const found = graphData.nodes.find((n) => n.id === node.id);
                  setSelectedNode(found || null);
                }}
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                  const size = node.category === 'vendor' || node.category === 'employee' ? 10 : 7;
                  const color = NODE_COLORS[node.category as SuspicionNode['category']] || '#94a3b8';
                  const ringColor = RISK_RING[node.risk as SuspicionNode['risk']] || '#94a3b8';

                  if (node.risk === 'critical' || node.risk === 'high') {
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, size + 4, 0, 2 * Math.PI);
                    ctx.fillStyle = ringColor + '20';
                    ctx.fill();
                  }

                  ctx.beginPath();
                  ctx.arc(node.x, node.y, size + 2, 0, 2 * Math.PI);
                  ctx.strokeStyle = ringColor;
                  ctx.lineWidth = 2;
                  ctx.stroke();

                  ctx.beginPath();
                  ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
                  ctx.fillStyle = color;
                  ctx.shadowColor = color;
                  ctx.shadowBlur = 12;
                  ctx.fill();
                  ctx.shadowBlur = 0;

                  const fontSize = Math.max(10 / globalScale, 3);
                  ctx.font = `bold ${fontSize}px sans-serif`;
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'top';
                  ctx.fillStyle = '#e2e8f0';
                  const label = (node.label as string).length > 24
                    ? (node.label as string).slice(0, 22) + '...'
                    : (node.label as string);
                  ctx.fillText(label, node.x, node.y + size + 4);
                }}
              />
            </div>

            <div className="space-y-3">
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Risk Skoru</span>
                  <span className={clsx(
                    'text-lg font-black',
                    graphData.riskScore >= 70 ? 'text-red-600' :
                    graphData.riskScore >= 40 ? 'text-amber-600' :
                    'text-emerald-600',
                  )}>
                    {graphData.riskScore}/100
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${graphData.riskScore}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={clsx(
                      'h-full rounded-full',
                      graphData.riskScore >= 70 ? 'bg-red-500' :
                      graphData.riskScore >= 40 ? 'bg-amber-500' :
                      'bg-emerald-500',
                    )}
                  />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle size={12} className="text-amber-500" />
                  <span className="text-xs font-bold text-slate-700">Analiz Ozeti</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{graphData.summary}</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <span className="text-xs font-bold text-slate-700 mb-2 block">Lejant</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(NODE_COLORS) as SuspicionNode['category'][]).map((cat) => {
                    const Icon = CATEGORY_ICONS[cat];
                    return (
                      <div key={cat} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: NODE_COLORS[cat] }} />
                        <Icon size={10} className="text-slate-400" />
                        <span className="text-[10px] text-slate-600">{CATEGORY_LABELS[cat]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <AnimatePresence>
                {selectedNode && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="bg-white border border-slate-200 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {(() => {
                        const Icon = CATEGORY_ICONS[selectedNode.category];
                        return <Icon size={14} style={{ color: NODE_COLORS[selectedNode.category] }} />;
                      })()}
                      <span className="text-xs font-bold text-slate-900">{selectedNode.label}</span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Kategori</span>
                        <span className="font-medium text-slate-700">{CATEGORY_LABELS[selectedNode.category]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Risk</span>
                        <span className={clsx(
                          'font-bold px-1.5 py-0.5 rounded text-[10px]',
                          selectedNode.risk === 'critical' ? 'bg-red-100 text-red-700' :
                          selectedNode.risk === 'high' ? 'bg-orange-100 text-orange-700' :
                          selectedNode.risk === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600',
                        )}>
                          {selectedNode.risk.toUpperCase()}
                        </span>
                      </div>
                      {selectedNode.detail && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Detay</span>
                          <span className="text-slate-700">{selectedNode.detail}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
