import { useState } from 'react';
import {
  Heading1,
  AlignLeft,
  Link2,
  BarChart2,
  Sparkles,
  Plus,
  Search,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  FileText,
  FolderPlus,
  Loader2,
  TableProperties,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useActiveReportStore } from '@/entities/report';
import { useFindingStore } from '@/entities/finding/model/store';
import type { M6BlockType, M6ReportBlock, FindingRefBlock, TextBlock, LiveChartBlock, FinancialGridBlock } from '@/entities/report';
import type { ComprehensiveFinding } from '@/entities/finding/model/types';

interface PaletteItem {
  type: M6BlockType;
  label: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  { type: 'heading', label: 'Başlık', description: 'H1, H2 veya H3 başlık bloğu', icon: Heading1, iconColor: 'text-slate-700', bgColor: 'bg-slate-100' },
  { type: 'paragraph', label: 'Paragraf', description: 'Zengin metin ve açıklama', icon: AlignLeft, iconColor: 'text-slate-600', bgColor: 'bg-slate-50' },
  { type: 'live_chart', label: 'Risk Isı Haritası', description: 'Canlı risk dağılım grafiği', icon: BarChart2, iconColor: 'text-blue-700', bgColor: 'bg-blue-50' },
  { type: 'ai_summary', label: 'AI Özeti', description: 'Sentinel Prime otomatik özet', icon: Sparkles, iconColor: 'text-blue-600', bgColor: 'bg-blue-50' },
  { type: 'financial_grid', label: 'Finansal Tablo', description: 'Excel tarzı düzenlenebilir tablo', icon: TableProperties, iconColor: 'text-emerald-700', bgColor: 'bg-emerald-50' },
];

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700 border border-red-200',
  HIGH: 'bg-orange-100 text-orange-700 border border-orange-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border border-amber-200',
  LOW: 'bg-slate-100 text-slate-600 border border-slate-200',
};

function buildBlock(type: M6BlockType): M6ReportBlock {
  const id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  if (type === 'heading') return { id, type: 'heading', orderIndex: 999, content: { html: '<h2>Yeni Başlık</h2>', level: 2 } } as TextBlock;
  if (type === 'ai_summary') return { id, type: 'ai_summary', orderIndex: 999, content: { html: '<p>Sentinel Prime AI özeti buraya gelecek...</p>' } } as TextBlock;
  if (type === 'live_chart') return { id, type: 'live_chart', orderIndex: 999, content: { chartType: 'severity_distribution', dataSourceFilter: {} } } as LiveChartBlock;
  if (type === 'financial_grid') return {
    id, type: 'financial_grid', orderIndex: 999,
    content: {
      columns: ['Kalem', 'Tutar (TL)', 'Bütçe (TL)'],
      rows: [
        { 'Kalem': 'Gelir', 'Tutar (TL)': '', 'Bütçe (TL)': '' },
        { 'Kalem': 'Gider', 'Tutar (TL)': '', 'Bütçe (TL)': '' },
        { 'Kalem': 'Net', 'Tutar (TL)': '', 'Bütçe (TL)': '' },
      ],
    },
  } as FinancialGridBlock;
  return { id, type: 'paragraph', orderIndex: 999, content: { html: '<p>Yeni paragraf içeriğini buraya yazın...</p>' } } as TextBlock;
}

function buildFindingRefBlock(findingId: string): FindingRefBlock {
  return { id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type: 'finding_ref', orderIndex: 999, content: { findingId, displayStyle: 'full_5c', blindMode: false } };
}

function FindingRow({ finding, alreadyAdded, onAdd }: { finding: ComprehensiveFinding; alreadyAdded: boolean; onAdd: () => void }) {
  const severityKey = (finding.severity || 'LOW').toUpperCase();
  const severityClass = SEVERITY_COLORS[severityKey] ?? SEVERITY_COLORS.LOW;
  const code = finding.finding_code ?? finding.code ?? '';
  return (
    <div className="flex items-start gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-all group">
      <div className="flex-1 min-w-0">
        {code && <span className="text-[10px] font-sans font-semibold text-slate-400 tracking-wide">{code}</span>}
        <p className="text-xs font-sans font-medium text-slate-800 leading-snug line-clamp-2 mt-0.5">{finding.title}</p>
        <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold ${severityClass}`}>{severityKey}</span>
      </div>
      <button
        onClick={onAdd}
        disabled={alreadyAdded}
        title={alreadyAdded ? 'Zaten eklendi' : 'Rapora ekle'}
        className={`flex-shrink-0 mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${alreadyAdded ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700'}`}
      >
        {alreadyAdded ? <Link2 size={12} /> : <Plus size={12} />}
      </button>
    </div>
  );
}

export function BlockPalette() {
  const { activeReport, addBlock, addSection } = useActiveReportStore();
  const findings = useFindingStore((s) => s.findings);
  const [findingsOpen, setFindingsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [sectionDropOpen, setSectionDropOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [addingSectionMode, setAddingSectionMode] = useState(false);
  const [creatingSect, setCreatingSect] = useState(false);

  const sections = activeReport?.sections ?? [];
  const hasSections = sections.length > 0;
  const effectiveSectionId = selectedSectionId || sections[0]?.id || '';
  const selectedSection = sections.find((s) => s.id === effectiveSectionId);

  const alreadyAddedIds = new Set<string>();
  if (activeReport) {
    for (const section of activeReport.sections) {
      for (const block of section.blocks) {
        if (block.type === 'finding_ref') alreadyAddedIds.add((block as FindingRefBlock).content.findingId);
      }
    }
  }

  const filteredFindings = findings.filter((f) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return f.title?.toLowerCase().includes(q) || (f.finding_code ?? f.code ?? '').toLowerCase().includes(q);
  });

  const handleAddBlock = (type: M6BlockType) => {
    if (!effectiveSectionId) return;
    addBlock(effectiveSectionId, buildBlock(type));
  };

  const handleAddFinding = (finding: ComprehensiveFinding) => {
    if (!effectiveSectionId) return;
    addBlock(effectiveSectionId, buildFindingRefBlock(finding.id));
  };

  const handleCreateSection = async () => {
    const title = newSectionTitle.trim() || 'Yeni Bölüm';
    setCreatingSect(true);
    const newId = await addSection(title);
    setCreatingSect(false);
    if (newId) {
      setSelectedSectionId(newId);
      setNewSectionTitle('');
      setAddingSectionMode(false);
    }
  };

  return (
    <aside className="no-print report-block-palette w-full flex-shrink-0 bg-white border-l border-slate-200 overflow-y-auto flex flex-col">
      <div className="p-4 pb-3 border-b border-slate-100">
        <h3 className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Blok Paleti</h3>
        <p className="text-xs font-sans text-slate-400">Tıklayarak rapora blok ekleyin.</p>
      </div>

      {/* Section selector */}
      <div className="px-3 pt-3 pb-2 border-b border-slate-100">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400">Hedef Bölüm</span>
          <button onClick={() => setAddingSectionMode((v) => !v)} className="flex items-center gap-1 text-[10px] font-sans font-semibold text-blue-600 hover:text-blue-700">
            <FolderPlus size={11} /> Yeni Bölüm
          </button>
        </div>

        {addingSectionMode && (
          <div className="mb-2 flex gap-1.5">
            <input
              type="text"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateSection(); if (e.key === 'Escape') setAddingSectionMode(false); }}
              placeholder="Bölüm adı..."
              autoFocus
              className="flex-1 px-2 py-1.5 text-xs font-sans border border-blue-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <button onClick={handleCreateSection} disabled={creatingSect} className="flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-60 flex-shrink-0">
              {creatingSect ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
            </button>
          </div>
        )}

        {!hasSections ? (
          <div className="p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 text-center">
            <p className="text-xs font-sans text-slate-500 mb-2 leading-relaxed">Henüz bölüm yok. Blok eklemek için önce bir bölüm oluşturun.</p>
            <button onClick={() => setAddingSectionMode(true)} className="text-xs font-sans font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              + Bölüm Oluştur
            </button>
          </div>
        ) : (
          <div className="relative">
            <button onClick={() => setSectionDropOpen((v) => !v)} className="w-full flex items-center justify-between px-3 py-2 text-xs font-sans rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors gap-2">
              <span className="truncate text-slate-800 font-medium">{selectedSection?.title ?? sections[0]?.title}</span>
              <ChevronDown size={12} className="text-slate-400 flex-shrink-0" />
            </button>
            {sectionDropOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setSectionDropOpen(false)} />
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-40 max-h-40 overflow-y-auto">
                  {sections.map((s) => (
                    <button key={s.id} onClick={() => { setSelectedSectionId(s.id); setSectionDropOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-sans hover:bg-blue-50 transition-colors ${s.id === effectiveSectionId ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'}`}>
                      {s.title}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Block palette items */}
      <div className="p-3 space-y-1.5">
        {PALETTE_ITEMS.map((item) => (
          <button key={item.type} onClick={() => handleAddBlock(item.type)} disabled={!effectiveSectionId}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all group text-left">
            <span className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${item.bgColor}`}>
              <item.icon size={16} className={item.iconColor} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-sans font-medium text-slate-800 group-hover:text-slate-900">{item.label}</span>
              <span className="block text-xs font-sans text-slate-400 truncate">{item.description}</span>
            </span>
            <Plus size={14} className="flex-shrink-0 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </button>
        ))}
      </div>

      {/* Findings pool */}
      <div className="border-t border-slate-100">
        <button onClick={() => setFindingsOpen((v) => !v)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-2">
            <FileText size={13} className="text-amber-600" />
            <span className="text-xs font-sans font-semibold text-slate-700">Bulgu Havuzu</span>
            <span className="text-[10px] font-sans font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">{findings.length}</span>
          </div>
          {findingsOpen ? <ChevronDown size={13} className="text-slate-400" /> : <ChevronRight size={13} className="text-slate-400" />}
        </button>

        {findingsOpen && (
          <div className="px-3 pb-3">
            <div className="relative mb-2">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Bulgu ara..."
                className="w-full pl-7 pr-3 py-1.5 text-xs font-sans border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" />
            </div>

            {!effectiveSectionId ? (
              <p className="text-center text-xs font-sans text-slate-400 py-4">Önce bir bölüm seçin.</p>
            ) : filteredFindings.length === 0 ? (
              <div className="text-center py-6">
                <AlertTriangle size={20} className="text-slate-200 mx-auto mb-2" />
                <p className="text-xs font-sans text-slate-400">{findings.length === 0 ? 'Henüz bulgu yüklenmedi' : 'Sonuç bulunamadı'}</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredFindings.map((finding) => (
                  <FindingRow key={finding.id} finding={finding} alreadyAdded={alreadyAddedIds.has(finding.id)} onAdd={() => handleAddFinding(finding)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-auto p-3 border-t border-slate-100">
        <p className="text-[10px] font-sans text-slate-400 leading-relaxed">Bloklar sürükle-bırak ile sıralanabilir. Her blok kilitlenebilir ve dondurulabilir.</p>
      </div>
    </aside>
  );
}
