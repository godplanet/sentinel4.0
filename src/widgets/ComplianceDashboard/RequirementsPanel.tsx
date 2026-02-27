import { useState, useMemo } from 'react';
import {
  useFrameworkRequirements,
  useRequirementMappings,
  type FrameworkRequirement,
  type ControlMapping,
} from '@/features/compliance';
import { MappingModal } from './MappingModal';
import {
  X, Filter, CheckCircle, AlertTriangle, Link2, Plus, Trash2, Loader2,
  ChevronDown, ChevronRight, Shield,
} from 'lucide-react';
import { useDeleteMapping } from '@/features/compliance';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  frameworkId: string;
  frameworkName: string;
  shortCode: string;
  onClose: () => void;
}

const PRIORITY_CFG: Record<string, { bg: string; text: string; dot: string }> = {
  CRITICAL: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  HIGH: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  MEDIUM: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  LOW: { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' },
};

export const RequirementsPanel = ({ frameworkId, frameworkName, shortCode, onClose }: Props) => {
  const { data: requirements, isLoading } = useFrameworkRequirements(frameworkId);
  const reqIds = useMemo(() => (requirements || []).map((r) => r.id), [requirements]);
  const { data: allMappings } = useRequirementMappings(reqIds);
  const deleteMutation = useDeleteMapping();

  const [showGapsOnly, setShowGapsOnly] = useState(false);
  const [expandedReq, setExpandedReq] = useState<string | null>(null);
  const [mappingTarget, setMappingTarget] = useState<FrameworkRequirement | null>(null);

  const mappingsByReq = useMemo(() => {
    const map: Record<string, ControlMapping[]> = {};
    (allMappings || []).forEach((m) => {
      if (!map[m.requirement_id]) map[m.requirement_id] = [];
      map[m.requirement_id].push(m);
    });
    return map;
  }, [allMappings]);

  const filtered = useMemo(() => {
    if (!requirements) return [];
    if (!showGapsOnly) return requirements;
    return requirements.filter((r) => !mappingsByReq[r.id]?.length);
  }, [requirements, showGapsOnly, mappingsByReq]);

  const totalCount = requirements?.length || 0;
  const gapCount = requirements?.filter((r) => !mappingsByReq[r.id]?.length).length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">{frameworkName}</h3>
            <p className="text-xs text-slate-400">
              {shortCode} | {totalCount} gereksinim | {gapCount} acik gap
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGapsOnly(!showGapsOnly)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              showGapsOnly
                ? 'bg-red-100 text-red-700 ring-1 ring-red-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            <Filter size={13} />
            {showGapsOnly ? 'Sadece Gap\'ler' : 'Tumu'}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
            <p className="text-sm font-medium">
              {showGapsOnly ? 'Tum gereksinimler karsilanmis!' : 'Gereksinim bulunamadi'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((req) => {
              const maps = mappingsByReq[req.id] || [];
              const isCovered = maps.length > 0;
              const isExpanded = expandedReq === req.id;
              const pcfg = PRIORITY_CFG[req.priority] || PRIORITY_CFG.MEDIUM;

              return (
                <div key={req.id} className="group">
                  <button
                    onClick={() => setExpandedReq(isExpanded ? null : req.id)}
                    className="w-full text-left px-6 py-3.5 flex items-center gap-3 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="shrink-0">
                      {isExpanded ? (
                        <ChevronDown size={14} className="text-slate-400" />
                      ) : (
                        <ChevronRight size={14} className="text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono font-bold text-slate-700">{req.code}</span>
                        <span className={clsx('flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded', pcfg.bg, pcfg.text)}>
                          <span className={clsx('w-1.5 h-1.5 rounded-full', pcfg.dot)} />
                          {req.priority}
                        </span>
                        {req.category && (
                          <span className="text-[10px] text-slate-400 font-medium">{req.category}</span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-700 truncate">{req.title}</p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {isCovered ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                          <Link2 size={12} />
                          {maps.length} Kontrol
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
                          <AlertTriangle size={12} />
                          Gap
                        </span>
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 pl-12">
                          <p className="text-xs text-slate-500 mb-3 leading-relaxed">{req.description}</p>

                          {maps.length > 0 && (
                            <div className="space-y-2 mb-3">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Eslenen Kontroller</p>
                              {maps.map((m) => (
                                <div
                                  key={m.id}
                                  className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 group/map"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-bold text-slate-600">{m.control_ref}</span>
                                    <span className="text-xs text-slate-500">{m.control_title}</span>
                                    <CoverageTag strength={m.coverage_strength} score={m.match_score} />
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteMutation.mutate(m.id);
                                    }}
                                    className="opacity-0 group-hover/map:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                                  >
                                    <Trash2 size={13} className="text-red-400" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <button
                            onClick={() => setMappingTarget(req)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Plus size={14} />
                            Kontrol Esle
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {mappingTarget && (
        <MappingModal
          requirement={mappingTarget}
          onClose={() => setMappingTarget(null)}
        />
      )}
    </motion.div>
  );
};

function CoverageTag({ strength, score }: { strength: string; score: number }) {
  const cfg =
    strength === 'FULL'
      ? 'bg-emerald-100 text-emerald-700'
      : strength === 'PARTIAL'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-red-100 text-red-700';

  return (
    <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded', cfg)}>
      {strength} %{score}
    </span>
  );
}
