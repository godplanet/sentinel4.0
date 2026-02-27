import { useRef } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useActiveReportStore } from '@/entities/report';
import type { M6ReportBlock, TextBlock, FindingRefBlock, LiveChartBlock, FinancialGridBlock as FinancialGridBlockType, ReportSection } from '@/entities/report';
import { LiveFindingRefBlock } from '@/features/report-editor/blocks/DynamicFindingsBlock';
import { LiveChartBlockView } from '@/features/report-editor/blocks/RiskHeatmapBlock';
import { TextBlockRenderer } from '@/features/report-editor/blocks/TextBlockRenderer';
import { FinancialGridBlock } from '@/features/report-editor/blocks/FinancialGridBlock';
import { useCollaboration, type CollabContext, type PeerInfo } from '../hooks/useCollaboration';

function warmthToBg(w: number): string {
  const t = w / 10;
  const r = Math.round(255 - 5 * t);
  const g = Math.round(255 - 20 * t);
  const b = Math.round(255 - 60 * t);
  return `rgb(${r},${g},${b})`;
}

function PeerBlockBadge({ peers }: { peers: PeerInfo[] }) {
  if (!peers.length) return null;
  return (
    <div className="absolute -right-2 top-0 flex flex-col gap-1 pointer-events-none">
      {peers.map((peer, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full ring-1 ring-white shadow-sm"
          style={{ backgroundColor: peer.color }}
          title={peer.name}
        />
      ))}
    </div>
  );
}

interface BlockRendererProps {
  block: M6ReportBlock;
  sectionId: string;
  readOnly: boolean;
  collabCtx?: CollabContext;
  peers?: PeerInfo[];
}

function BlockRenderer({ block, sectionId, readOnly, collabCtx, peers = [] }: BlockRendererProps) {
  const blockPeers = peers.filter((p) => p.activeBlockId === block.id);

  const content = (() => {
    switch (block.type) {
      case 'heading':
      case 'paragraph':
      case 'ai_summary':
        return <TextBlockRenderer block={block as TextBlock} sectionId={sectionId} readOnly={readOnly} collabCtx={collabCtx} />;
      case 'finding_ref':
        return <LiveFindingRefBlock block={block as FindingRefBlock} />;
      case 'live_chart':
        return <LiveChartBlockView block={block as LiveChartBlock} />;
      case 'financial_grid':
        return <FinancialGridBlock block={block as FinancialGridBlockType} sectionId={sectionId} readOnly={readOnly} />;
      default:
        return null;
    }
  })();

  return (
    <div id={block.id} className="relative transition-[box-shadow] duration-300 rounded-lg">
      {content}
      <PeerBlockBadge peers={blockPeers} />
    </div>
  );
}

interface SectionViewProps {
  section: ReportSection;
  readOnly: boolean;
  collabCtx: CollabContext;
}

function SectionView({ section, readOnly, collabCtx }: SectionViewProps) {
  return (
    <section
      key={section.id}
      id={`section-${section.id}`}
      className="mb-16 scroll-mt-8"
    >
      <h2 className="font-serif text-3xl font-bold mb-6 text-slate-900 pb-3 border-b border-slate-200">
        {section.title}
      </h2>
      <div>
        {section.blocks
          .slice()
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              sectionId={section.id}
              readOnly={readOnly}
              collabCtx={collabCtx}
              peers={collabCtx.peers}
            />
          ))}
      </div>
    </section>
  );
}

interface VirtualizedSectionsProps {
  sections: ReportSection[];
  readOnly: boolean;
  collabCtx: CollabContext;
  scrollRef: React.RefObject<HTMLElement | null>;
}

function VirtualizedSections({ sections, readOnly, collabCtx, scrollRef }: VirtualizedSectionsProps) {
  const virtualizer = useVirtualizer({
    count: sections.length,
    getScrollElement: () => scrollRef.current as HTMLElement,
    estimateSize: (i) => {
      const section = sections[i];
      const base = 120;
      const blockEst = section.blocks.reduce((acc, b) => {
        if (b.type === 'heading') return acc + 60;
        if (b.type === 'live_chart') return acc + 320;
        if (b.type === 'finding_ref') return acc + 220;
        if (b.type === 'financial_grid') return acc + 200;
        return acc + 110;
      }, 0);
      return base + blockEst;
    },
    overscan: 3,
  });

  return (
    <div
      style={{ height: virtualizer.getTotalSize(), position: 'relative' }}
    >
      {virtualizer.getVirtualItems().map((vItem) => (
        <div
          key={vItem.key}
          data-index={vItem.index}
          ref={virtualizer.measureElement}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${vItem.start}px)`,
          }}
        >
          <SectionView
            section={sections[vItem.index]}
            readOnly={readOnly}
            collabCtx={collabCtx}
          />
        </div>
      ))}
    </div>
  );
}

interface ZenCanvasProps {
  readOnly?: boolean;
  warmth?: number;
  externalCollabCtx?: CollabContext;
}

export function ZenCanvas({ readOnly = false, warmth = 2, externalCollabCtx }: ZenCanvasProps) {
  const { activeReport } = useActiveReportStore();
  const ownCtx = useCollaboration(externalCollabCtx ? '' : (activeReport?.id ?? 'no-report'));
  const collabCtx = externalCollabCtx ?? ownCtx;
  const scrollRef = useRef<HTMLElement | null>(null);

  const paperBg = warmthToBg(warmth);
  const isLocked = activeReport?.status === 'published' || activeReport?.status === 'archived';
  const useVirtual = isLocked;

  if (!activeReport) {
    return (
      <main className="flex-1 bg-slate-100 overflow-y-auto p-6 lg:p-10 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse mx-auto" />
          <p className="text-sm font-sans text-slate-400">Rapor yükleniyor...</p>
        </div>
      </main>
    );
  }

  const sections = activeReport.sections;

  return (
    <main
      ref={scrollRef as React.RefObject<HTMLElement>}
      className="flex-1 bg-slate-100 overflow-y-auto p-6 lg:p-10"
    >
      <div
        className="max-w-4xl mx-auto min-h-[1056px] p-10 lg:p-16 rounded-sm
          shadow-[0_8px_48px_rgba(0,0,0,0.13),0_2px_12px_rgba(0,0,0,0.07)]
          ring-1 ring-slate-200/40 transition-colors duration-300"
        style={{ backgroundColor: paperBg }}
      >
        {useVirtual ? (
          <VirtualizedSections
            sections={sections}
            readOnly={readOnly || isLocked}
            collabCtx={collabCtx}
            scrollRef={scrollRef}
          />
        ) : (
          sections.map((section) => (
            <SectionView
              key={section.id}
              section={section}
              readOnly={readOnly}
              collabCtx={collabCtx}
            />
          ))
        )}

        <div className="mt-16 pt-8 border-t border-slate-200 text-center">
          <p className="text-xs font-sans text-slate-400">
            Son güncelleme:{' '}
            {new Date(activeReport.updatedAt).toLocaleDateString('tr-TR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {activeReport.status === 'published' && activeReport.hashSeal && (
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-4 rounded-lg border border-emerald-200 font-mono shadow-sm">
            <ShieldCheck size={18} className="flex-shrink-0" />
            <span className="break-all">HUKUKİ BÜTÜNLÜK MÜHRÜ (SHA-256): {activeReport.hashSeal}</span>
          </div>
        )}
      </div>
    </main>
  );
}

export type { CollabContext };
