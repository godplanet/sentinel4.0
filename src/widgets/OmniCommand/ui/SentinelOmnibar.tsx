import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Inbox,
  Terminal,
  LayoutGrid,
  Network,
  Zap,
  ShieldCheck,
  ArrowRight,
  Command,
} from 'lucide-react';

interface OmniResult {
  id: string;
  category: 'Portals' | 'Quick Actions';
  label: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  action?: () => void;
  badge?: string;
}

const RESULTS: OmniResult[] = [
  {
    id: 'auditee-inbox',
    category: 'Portals',
    label: 'Auditee Inbox',
    description: 'Submit evidence and track your assigned actions',
    icon: <Inbox size={16} />,
    href: '/auditee-portal',
  },
  {
    id: 'auditor-cc',
    category: 'Portals',
    label: 'Auditor Command Center',
    description: 'Super Drawer, AI validation, and evidence review',
    icon: <Terminal size={16} />,
    href: '/auditor-workbench',
  },
  {
    id: 'governance-wb',
    category: 'Portals',
    label: 'Governance Workbench',
    description: 'Virtual action matrix and dual aging analytics',
    icon: <LayoutGrid size={16} />,
    href: '/governance-workbench',
  },
  {
    id: 'ecosystem-impact',
    category: 'Portals',
    label: 'Ecosystem Impact',
    description: 'Auto-Fix engine, master campaigns, risk contagion',
    icon: <Network size={16} />,
    href: '/ecosystem-impact',
  },
  {
    id: 'trigger-autofix',
    category: 'Quick Actions',
    label: 'Trigger Auto-Fix',
    description: 'Dispatch autonomous remediation to a target system',
    icon: <Zap size={16} />,
    href: '/ecosystem-impact',
    badge: 'AI',
  },
  {
    id: 'seal-report',
    category: 'Quick Actions',
    label: 'Seal Report (Module Bridge)',
    description: 'Publish report and inject actions into Module 7 engine',
    icon: <ShieldCheck size={16} />,
    href: '/actions',
    badge: 'CRYPTO',
  },
];

export const SentinelOmnibar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleKeydown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setOpen(prev => !prev);
      setQuery('');
      setHighlighted(0);
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [handleKeydown]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = query.trim()
    ? RESULTS.filter(r =>
        r.label.toLowerCase().includes(query.toLowerCase()) ||
        r.description.toLowerCase().includes(query.toLowerCase()) ||
        r.category.toLowerCase().includes(query.toLowerCase())
      )
    : RESULTS;

  const categories = Array.from(new Set(filtered.map(r => r.category)));

  const handleSelect = (result: OmniResult) => {
    setOpen(false);
    if (result.action) {
      result.action();
    } else if (result.href) {
      navigate(result.href);
    }
  };

  const handleArrowKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && filtered[highlighted]) {
      handleSelect(filtered[highlighted]);
    }
  };

  let globalIdx = 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[9999] flex items-start justify-center pt-[15vh]"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl mx-4 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
              <Search size={18} className="text-slate-400 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setHighlighted(0); }}
                onKeyDown={handleArrowKey}
                placeholder="Search portals, actions, modules..."
                className="flex-1 bg-transparent text-slate-900 text-base placeholder-slate-400 outline-none font-sans"
              />
              <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono text-slate-500">
                ESC
              </kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-slate-400 font-sans">
                  No results for &ldquo;{query}&rdquo;
                </div>
              ) : (
                categories.map(cat => {
                  const catItems = filtered.filter(r => r.category === cat);
                  return (
                    <div key={cat} className="mb-1">
                      <p className="px-5 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-sans">
                        {cat}
                      </p>
                      {catItems.map(result => {
                        const idx = globalIdx++;
                        const isHigh = highlighted === idx;
                        return (
                          <button
                            key={result.id}
                            onClick={() => handleSelect(result)}
                            onMouseEnter={() => setHighlighted(idx)}
                            className={`w-full flex items-center gap-4 px-5 py-3 text-left transition-colors ${
                              isHigh ? 'bg-slate-100' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                              isHigh
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {result.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-900 font-sans">
                                  {result.label}
                                </span>
                                {result.badge && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-slate-900 text-white tracking-wide">
                                    {result.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 font-sans truncate">{result.description}</p>
                            </div>
                            {isHigh && <ArrowRight size={14} className="text-slate-400 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-slate-200 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-sans">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono">↑↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono">↵</kbd>
                  open
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-sans">
                <Command size={10} />
                <span>K to toggle</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
