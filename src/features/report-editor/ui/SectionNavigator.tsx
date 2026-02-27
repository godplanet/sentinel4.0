import { useState } from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { useActiveReportStore } from '@/entities/report';

export function SectionNavigator() {
  const { activeReport } = useActiveReportStore();
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    activeReport?.sections[0]?.id ?? null,
  );

  const handleSectionClick = (sectionId: string) => {
    setActiveSectionId(sectionId);
    const el = document.getElementById(`section-${sectionId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <aside className="no-print report-section-navigator w-64 flex-shrink-0 bg-white border-r border-slate-200 overflow-y-auto flex flex-col">
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-wider text-slate-400">
          <BookOpen size={13} />
          <span>İçindekiler</span>
        </div>
      </div>

      <nav className="flex-1 py-2">
        {!activeReport ? (
          <div className="px-4 py-8 text-center text-sm font-sans text-slate-400">
            Rapor yükleniyor...
          </div>
        ) : (
          <ul className="space-y-0.5 px-2">
            {activeReport.sections.map((section, idx) => (
              <li key={section.id}>
                <button
                  onClick={() => handleSectionClick(section.id)}
                  className={clsx(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors group',
                    activeSectionId === section.id
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  )}
                >
                  <span
                    className={clsx(
                      'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-sans font-bold',
                      activeSectionId === section.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300',
                    )}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-sm font-sans font-medium truncate leading-tight">
                    {section.title}
                  </span>
                  <ChevronRight
                    size={13}
                    className={clsx(
                      'ml-auto flex-shrink-0 transition-opacity',
                      activeSectionId === section.id ? 'opacity-60' : 'opacity-0 group-hover:opacity-40',
                    )}
                  />
                </button>

                <ul className="mt-0.5 ml-5 pl-3 border-l border-slate-100 space-y-0.5 mb-1">
                  {section.blocks
                    .filter((b) => b.type === 'heading')
                    .slice(0, 3)
                    .map((b) => (
                      <li key={b.id}>
                        <span className="block text-xs font-sans text-slate-400 truncate py-0.5 px-1">
                          {b.type === 'heading' && (b as any).content?.html?.replace(/<[^>]+>/g, '') || 'Başlık'}
                        </span>
                      </li>
                    ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </nav>

      <div className="px-4 py-3 border-t border-slate-100">
        <p className="text-xs font-sans text-slate-400">
          {activeReport?.sections.length ?? 0} bölüm &middot;{' '}
          {activeReport?.sections.reduce((acc, s) => acc + s.blocks.length, 0) ?? 0} blok
        </p>
      </div>
    </aside>
  );
}
