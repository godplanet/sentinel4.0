export interface SuspicionNode {
  id: string;
  label: string;
  category: 'vendor' | 'employee' | 'university' | 'workplace' | 'address' | 'phone';
  risk: 'critical' | 'high' | 'medium' | 'low' | 'neutral';
  detail?: string;
}

export interface SuspicionLink {
  source: string;
  target: string;
  label: string;
  strength: number;
}

export interface SuspicionGraph {
  nodes: SuspicionNode[];
  links: SuspicionLink[];
  summary: string;
  riskScore: number;
}

const VENDOR_GRAPHS: Record<string, SuspicionGraph> = {
  default: {
    nodes: [
      { id: 'v1', label: '', category: 'vendor', risk: 'high', detail: 'Kurulus: 2025-11-01' },
      { id: 'e1', label: 'Mehmet K. (Satin Alma Md.)', category: 'employee', risk: 'critical', detail: 'Onay yetkisi: 500K TL' },
      { id: 'e2', label: 'Ayse T. (Mali Isler)', category: 'employee', risk: 'medium', detail: 'Fatura onay sureci' },
      { id: 'u1', label: 'Bogazici Uni. (2012-2016)', category: 'university', risk: 'neutral', detail: 'Isletme Bolumu' },
      { id: 'w1', label: 'Omega Consulting (2017-2019)', category: 'workplace', risk: 'high', detail: 'Her ikisi de ayni donemde' },
      { id: 'a1', label: 'Levent, Istanbul (Adres)', category: 'address', risk: 'medium', detail: 'Ayni bina, farkli kat' },
      { id: 'p1', label: '+90-532-XXX-4455', category: 'phone', risk: 'high', detail: 'Ortak irtibat numarasi' },
    ],
    links: [
      { source: 'v1', target: 'w1', label: 'Ortak es-calisma', strength: 0.9 },
      { source: 'e1', target: 'w1', label: 'Ayni donem calisti', strength: 0.9 },
      { source: 'v1', target: 'u1', label: 'Mezun', strength: 0.7 },
      { source: 'e1', target: 'u1', label: 'Mezun', strength: 0.7 },
      { source: 'v1', target: 'a1', label: 'Kayitli adres', strength: 0.6 },
      { source: 'e1', target: 'a1', label: 'Ev adresi', strength: 0.6 },
      { source: 'v1', target: 'p1', label: 'Irtibat', strength: 0.8 },
      { source: 'e2', target: 'p1', label: 'Irtibat', strength: 0.8 },
      { source: 'e1', target: 'e2', label: 'Ayni departman', strength: 0.3 },
    ],
    summary: 'YUKSEK RISK: Vendor yetkilisi ve Satin Alma Muduru ayni universite ve ayni sirket gecmisini paylasiyor. Ortak irtibat numarasi tespit edildi.',
    riskScore: 87,
  },
};

export function generateSuspicionGraph(vendorName: string): SuspicionGraph {
  const graph = structuredClone(VENDOR_GRAPHS.default);
  graph.nodes[0].label = vendorName;
  graph.summary = graph.summary.replace('Vendor', vendorName);
  return graph;
}

const NODE_COLORS: Record<SuspicionNode['category'], string> = {
  vendor: '#dc2626',
  employee: '#2563eb',
  university: '#16a34a',
  workplace: '#d97706',
  address: '#7c3aed',
  phone: '#0891b2',
};

const RISK_RING: Record<SuspicionNode['risk'], string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
  neutral: '#94a3b8',
};

export { NODE_COLORS, RISK_RING };
