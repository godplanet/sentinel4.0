import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Search, Check, Loader2, Library, ChevronRight, Download,
  Monitor, CreditCard, ShieldAlert, TrendingUp, AlertTriangle, Calculator,
} from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '@/shared/api/supabase';

interface LibraryCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
}

interface LibraryRisk {
  id: string;
  category_id: string;
  risk_title: string;
  control_title: string;
  standard_test_steps: string[];
  risk_level: string;
  framework_ref: string;
}

interface ProcedureLibraryPanelProps {
  open: boolean;
  onClose: () => void;
  onAddStep: (description: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Monitor, CreditCard, ShieldAlert, TrendingUp, AlertTriangle, Calculator,
};

const CATEGORY_COLORS: Record<number, { bg: string; text: string; activeBg: string }> = {
  1: { bg: 'bg-sky-50', text: 'text-sky-700', activeBg: 'bg-sky-100' },
  2: { bg: 'bg-amber-50', text: 'text-amber-700', activeBg: 'bg-amber-100' },
  3: { bg: 'bg-rose-50', text: 'text-rose-700', activeBg: 'bg-rose-100' },
  4: { bg: 'bg-teal-50', text: 'text-teal-700', activeBg: 'bg-teal-100' },
  5: { bg: 'bg-orange-50', text: 'text-orange-700', activeBg: 'bg-orange-100' },
  6: { bg: 'bg-emerald-50', text: 'text-emerald-700', activeBg: 'bg-emerald-100' },
};

function getCatStyle(order: number) {
  return CATEGORY_COLORS[order] || { bg: 'bg-slate-50', text: 'text-slate-700', activeBg: 'bg-slate-100' };
}

export function ProcedureLibraryPanel({ open, onClose, onAddStep }: ProcedureLibraryPanelProps) {
  const [categories, setCategories] = useState<LibraryCategory[]>([]);
  const [risks, setRisks] = useState<LibraryRisk[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [imported, setImported] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [catRes, riskRes] = await Promise.all([
        supabase.from('rkm_library_categories').select('*').order('sort_order'),
        supabase.from('rkm_library_risks').select('*').order('sort_order'),
      ]);
      const cats = (catRes.data || []) as LibraryCategory[];
      const rks = (riskRes.data || []) as LibraryRisk[];
      setCategories(cats);
      setRisks(rks);
      if (cats.length > 0 && !activeCategory) {
        setActiveCategory(cats[0].id);
      }
    } catch {
      setCategories([]);
      setRisks([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    if (open) {
      loadData();
      setSelected(new Set());
    }
  }, [open, loadData]);

  const filteredRisks = risks.filter((r) => {
    if (activeCategory && r.category_id !== activeCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.risk_title.toLowerCase().includes(q) ||
        r.control_title.toLowerCase().includes(q) ||
        r.framework_ref.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleSelection = (riskId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(riskId)) next.delete(riskId);
      else next.add(riskId);
      return next;
    });
  };

  const handleImport = () => {
    const toImport = risks.filter((r) => selected.has(r.id));
    let stepCount = 0;
    toImport.forEach((r) => {
      const steps = Array.isArray(r.standard_test_steps) ? r.standard_test_steps : [];
      steps.forEach((step: string) => {
        onAddStep(step);
        stepCount++;
      });
    });
    setImported((prev) => {
      const next = new Set(prev);
      selected.forEach((id) => next.add(id));
      return next;
    });
    setSelected(new Set());
    if (stepCount > 0) {
      setTimeout(onClose, 400);
    }
  };

  const selectedCount = selected.size;
  const totalSteps = risks
    .filter((r) => selected.has(r.id))
    .reduce((sum, r) => sum + (Array.isArray(r.standard_test_steps) ? r.standard_test_steps.length : 0), 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[110]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="fixed inset-y-8 inset-x-8 md:inset-y-12 md:inset-x-24 lg:inset-x-48 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[110] flex flex-col overflow-hidden"
          >
            <div className="shrink-0 px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl">
                  <Library size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Standart Kontrol Kutuphanesi</h3>
                  <p className="text-xs text-white/60">
                    {categories.length} kategori, {risks.length} kontrol proseduru
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X size={18} className="text-white/60" />
              </button>
            </div>

            <div className="flex flex-1 min-h-0">
              <div className="w-56 shrink-0 border-r border-slate-200 bg-slate-50/50 overflow-y-auto py-3">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-blue-600" size={20} />
                  </div>
                ) : (
                  <div className="space-y-0.5 px-2">
                    {categories.map((cat) => {
                      const isActive = activeCategory === cat.id;
                      const style = getCatStyle(cat.sort_order);
                      const IconComp = ICON_MAP[cat.icon] || Library;
                      const count = risks.filter((r) => r.category_id === cat.id).length;

                      return (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.id)}
                          className={clsx(
                            'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all text-xs',
                            isActive
                              ? `${style.activeBg} ${style.text} font-bold shadow-sm`
                              : 'text-slate-600 hover:bg-slate-100'
                          )}
                        >
                          <IconComp size={14} className="shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="truncate block leading-tight">{cat.name}</span>
                          </div>
                          <span className={clsx(
                            'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                            isActive ? 'bg-white/60' : 'bg-slate-200 text-slate-500'
                          )}>
                            {count}
                          </span>
                          {isActive && <ChevronRight size={12} className="shrink-0 opacity-50" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col min-w-0">
                <div className="shrink-0 px-5 py-3 border-b border-slate-200 bg-white">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Kontrol veya risk ara... (orn: sifre, kredi, MASAK)"
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="animate-spin text-blue-600 mr-2" size={18} />
                      <span className="text-xs text-slate-500">Yukleniyor...</span>
                    </div>
                  ) : filteredRisks.length === 0 ? (
                    <div className="text-center py-16">
                      <Library className="mx-auto text-slate-300 mb-3" size={36} />
                      <p className="text-sm text-slate-500 font-medium">Sonuc bulunamadi</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredRisks.map((risk) => {
                        const isSelected = selected.has(risk.id);
                        const isImported = imported.has(risk.id);
                        const steps = Array.isArray(risk.standard_test_steps) ? risk.standard_test_steps : [];

                        return (
                          <div
                            key={risk.id}
                            onClick={() => !isImported && toggleSelection(risk.id)}
                            className={clsx(
                              'group border rounded-xl p-4 transition-all cursor-pointer',
                              isImported
                                ? 'bg-emerald-50/50 border-emerald-200 opacity-60 cursor-default'
                                : isSelected
                                  ? 'bg-blue-50 border-blue-300 shadow-sm shadow-blue-100'
                                  : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-sm'
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className={clsx(
                                'mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                                isImported
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : isSelected
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-slate-300 group-hover:border-blue-400'
                              )}>
                                {(isSelected || isImported) && <Check size={12} strokeWidth={3} />}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold text-slate-800">{risk.control_title}</span>
                                  <span className={clsx(
                                    'text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                                    risk.risk_level === 'HIGH' ? 'bg-red-100 text-red-700' :
                                    risk.risk_level === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                                    'bg-green-100 text-green-700'
                                  )}>
                                    {risk.risk_level}
                                  </span>
                                  {risk.framework_ref && (
                                    <span className="text-[9px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                      {risk.framework_ref}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 mb-2">{risk.risk_title}</p>

                                <div className="space-y-1">
                                  {steps.slice(0, 3).map((step: string, i: number) => (
                                    <div key={i} className="flex items-start gap-1.5 text-[10px] text-slate-600">
                                      <span className="shrink-0 w-4 h-4 rounded bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400 mt-0.5">
                                        {i + 1}
                                      </span>
                                      <span className="leading-relaxed line-clamp-1">{step}</span>
                                    </div>
                                  ))}
                                  {steps.length > 3 && (
                                    <span className="text-[10px] text-blue-500 font-medium ml-5">
                                      +{steps.length - 3} adim daha
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {selectedCount > 0 && (
                  <div className="shrink-0 px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between">
                    <div className="text-xs text-slate-600">
                      <span className="font-bold text-blue-700">{selectedCount}</span> kontrol secildi
                      {' / '}
                      <span className="font-bold text-slate-800">{totalSteps}</span> test adimi aktarilacak
                    </div>
                    <button
                      onClick={handleImport}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <Download size={14} />
                      Aktar ({totalSteps} adim)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
