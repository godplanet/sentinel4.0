import { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/shared/api/supabase';
import { useActiveReportStore } from '@/entities/report';

interface SearchResult {
  block_id: string;
  block_type: string;
  snippet: string;
  section_id: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

interface SearchPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function SearchPalette({ open, onClose }: SearchPaletteProps) {
  const { activeReport } = useActiveReportStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const runSearch = useCallback(
    async (q: string) => {
      if (!q.trim() || !activeReport?.id) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('search_report_blocks', {
          p_query: q.trim(),
          p_report_id: activeReport.id,
        });
        if (!error && data) {
          setResults(data as SearchResult[]);
        } else {
          const q_lower = q.toLowerCase();
          const local: SearchResult[] = [];
          for (const section of activeReport.sections) {
            for (const block of section.blocks) {
              const html = (block.content as any)?.html ?? '';
              if (stripHtml(html).toLowerCase().includes(q_lower)) {
                local.push({
                  block_id: block.id,
                  block_type: block.type,
                  snippet: stripHtml(html).slice(0, 120),
                  section_id: section.id,
                });
              }
            }
          }
          setResults(local.slice(0, 20));
        }
      } finally {
        setLoading(false);
      }
    },
    [activeReport],
  );

  const handleChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(0);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(value), 280);
  };

  const handleSelect = (result: SearchResult) => {
    onClose();
    setTimeout(() => {
      const el = document.getElementById(result.block_id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-blue-400', 'ring-offset-2');
        setTimeout(() => el.classList.remove('ring-2', 'ring-blue-400', 'ring-offset-2'), 2000);
      }
    }, 120);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const BLOCK_TYPE_LABELS: Record<string, string> = {
    heading: 'Başlık',
    paragraph: 'Paragraf',
    ai_summary: 'AI Özeti',
    finding_ref: 'Bulgu',
    live_chart: 'Grafik',
    financial_grid: 'Finansal Tablo',
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[9000] bg-slate-900/30 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-[15%] z-[9001] -translate-x-1/2 w-full max-w-xl"
            onKeyDown={handleKeyDown}
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
                {loading ? (
                  <Loader2 size={18} className="text-slate-400 animate-spin flex-shrink-0" />
                ) : (
                  <Search size={18} className="text-slate-400 flex-shrink-0" />
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder="Rapor içinde ara..."
                  className="flex-1 text-sm font-sans text-slate-900 placeholder-slate-400 bg-transparent outline-none"
                />
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {results.length > 0 && (
                <ul className="max-h-72 overflow-y-auto py-1.5">
                  {results.map((result, idx) => (
                    <li key={result.block_id}>
                      <button
                        onClick={() => handleSelect(result)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                          idx === selectedIndex ? 'bg-blue-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <FileText
                          size={14}
                          className={`flex-shrink-0 mt-0.5 ${idx === selectedIndex ? 'text-blue-500' : 'text-slate-400'}`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className={`text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded ${
                                idx === selectedIndex
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {BLOCK_TYPE_LABELS[result.block_type] ?? result.block_type}
                            </span>
                          </div>
                          <p className="text-xs font-sans text-slate-700 line-clamp-2 leading-relaxed">
                            {result.snippet || '(içerik yok)'}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {query.trim() && !loading && results.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-sm font-sans text-slate-400">Sonuç bulunamadı</p>
                  <p className="text-xs font-sans text-slate-300 mt-1">"{query}" için eşleşme yok</p>
                </div>
              )}

              {!query.trim() && (
                <div className="py-5 text-center">
                  <p className="text-xs font-sans text-slate-400">Blok içeriğinde arama yapmak için yazmaya başlayın</p>
                  <p className="text-xs font-sans text-slate-300 mt-1.5">
                    <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono">↑↓</kbd>{' '}
                    gezin &nbsp;
                    <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono">↵</kbd>{' '}
                    seç &nbsp;
                    <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono">Esc</kbd>{' '}
                    kapat
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
