/**
 * Root Cause & 5-Whys Analyzer — Ana Sayfa
 * Wave 55: Kök Neden ve 5-Neden Analizi
 *
 * FSD: pages/findings/RootCausePage.tsx
 * Veri: features/root-cause/api.ts → useRootCauses + useWhys
 * Tasarım: %100 Light Mode | Apple Glass | Adım-adım ağaç görünümü
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitMerge, ChevronDown, ChevronRight, AlertTriangle, CheckCircle2,
  Clock, Lightbulb, ShieldAlert, BookOpen, Target, Zap, BadgeCheck, Plus,
} from 'lucide-react';
import clsx from 'clsx';
import {
  useRootCauses,
  useWhys,
  type RootCauseAnalysis,
  type FiveWhysStep,
} from '@/features/root-cause/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SEVERITY_MAP: Record<string, { color: string; bg: string }> = {
  Kritik: { color: 'text-red-700',    bg: 'bg-red-100 border-red-200' },
  Yüksek: { color: 'text-orange-700', bg: 'bg-orange-100 border-orange-200' },
  Orta:   { color: 'text-amber-700',  bg: 'bg-amber-100 border-amber-200' },
  Düşük:  { color: 'text-slate-600',  bg: 'bg-slate-100 border-slate-200' },
};

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  'Taslak':       { label: 'Taslak',       color: 'bg-slate-100 text-slate-600 border-slate-200', icon: Clock },
  'Devam Ediyor': { label: 'Devam Ediyor', color: 'bg-blue-100 text-blue-700 border-blue-200',   icon: GitMerge },
  'Tamamlandı':   { label: 'Tamamlandı',   color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  'Onaylandı':    { label: 'Onaylandı',    color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: BadgeCheck },
};

const CATEGORY_MAP: Record<string, string> = {
  'Operasyonel':  'bg-blue-50 text-blue-600',
  'Sistem/BT':    'bg-purple-50 text-purple-600',
  'İnsan':        'bg-rose-50 text-rose-600',
  'Süreç':        'bg-amber-50 text-amber-700',
  'Dış Etken':    'bg-teal-50 text-teal-600',
  'Yönetim':      'bg-slate-50 text-slate-600',
};

// ─── Step Number Badge ────────────────────────────────────────────────────────

function StepBadge({ n, isRoot }: { n: number; isRoot: boolean }) {
  return (
    <div className={clsx(
      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 border-2',
      isRoot
        ? 'bg-red-500 text-white border-red-600 shadow-md shadow-red-200'
        : 'bg-white text-slate-700 border-slate-300',
    )}>
      {isRoot ? <Target size={13} /> : n}
    </div>
  );
}

// ─── Five-Whys Tree (Ağaç Dalları) ───────────────────────────────────────────

function FiveWhysTree({ analysisId }: { analysisId: string }) {
  const { data: steps, isLoading, error } = useWhys(analysisId);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-6 justify-center text-slate-400">
        <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
        <span className="text-xs">5-Neden adımları yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
        <AlertTriangle size={12} />
        Adımlar yüklenemedi.
      </div>
    );
  }

  if ((steps || []).length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <GitMerge className="w-9 h-9 mx-auto mb-2 opacity-25" />
        <p className="text-xs">Henüz 5-Neden adımı eklenmemiş</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-1">
      {/* Dikey bağlantı çizgisi */}
      <div className="absolute left-4 top-8 bottom-4 w-px bg-gradient-to-b from-slate-200 via-slate-300 to-red-300 z-0" />

      {(steps || []).map((step: FiveWhysStep, idx: number) => {
        const isExpanded = expandedStep === step?.step_number;
        const isRoot = step?.is_root_cause ?? false;

        return (
          <motion.div
            key={step?.id ?? idx}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.07 }}
            className="relative z-10"
          >
            <div
              onClick={() => setExpandedStep(isExpanded ? null : (step?.step_number ?? idx + 1))}
              className={clsx(
                'flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                isRoot
                  ? 'bg-red-50 border-red-200 ring-1 ring-red-200'
                  : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30',
                isExpanded && !isRoot && 'border-indigo-300 bg-indigo-50/50',
              )}
            >
              <StepBadge n={step?.step_number ?? idx + 1} isRoot={isRoot} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {isRoot ? '⚑ Kök Neden' : `Neden ${step?.step_number ?? idx + 1}`}
                  </span>
                  {isExpanded
                    ? <ChevronDown size={12} className="text-slate-400" />
                    : <ChevronRight size={12} className="text-slate-300" />}
                </div>
                <p className={clsx('text-[11px] font-semibold leading-snug mt-0.5', isRoot ? 'text-red-700' : 'text-slate-700')}>
                  {step?.why_question ?? '—'}
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5 line-clamp-2">
                  {step?.answer ?? '—'}
                </p>
              </div>
            </div>

            {/* Genişletilmiş detay */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden ml-11"
                >
                  <div className="border border-slate-200 rounded-xl bg-white p-3 mt-1 space-y-2 text-[11px]">
                    {step?.evidence && (
                      <div className="flex items-start gap-1.5">
                        <BookOpen size={11} className="text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-slate-500 block text-[9px] uppercase">Kanıt</span>
                          <span className="text-slate-600 leading-relaxed">{step.evidence}</span>
                        </div>
                      </div>
                    )}
                    {step?.contributing_factor && (
                      <div className="flex items-start gap-1.5">
                        <Zap size={11} className="text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-slate-500 block text-[9px] uppercase">Katkıda Bulunan Faktör</span>
                          <span className="text-slate-600 leading-relaxed">{step.contributing_factor}</span>
                        </div>
                      </div>
                    )}
                    {step?.ai_suggestion && (
                      <div className="flex items-start gap-1.5 bg-indigo-50 border border-indigo-100 rounded-lg p-2">
                        <Lightbulb size={11} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-indigo-500 block text-[9px] uppercase">AI Öneri</span>
                          <span className="text-indigo-700 leading-relaxed italic">{step.ai_suggestion}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Analysis Card ────────────────────────────────────────────────────────────

function AnalysisCard({
  rca,
  onSelect,
  isSelected,
}: {
  rca: RootCauseAnalysis;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const sev = SEVERITY_MAP[rca?.severity ?? 'Orta'] ?? SEVERITY_MAP['Orta'];
  const st  = STATUS_MAP[rca?.status ?? 'Taslak']   ?? STATUS_MAP['Taslak'];
  const catColor = CATEGORY_MAP[rca?.category ?? 'Operasyonel'] ?? 'bg-slate-50 text-slate-600';
  const StatusIcon = st.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onSelect}
      className={clsx(
        'cursor-pointer rounded-xl border p-4 transition-all',
        'bg-white/70 backdrop-blur-lg shadow-sm',
        isSelected
          ? 'border-indigo-400 ring-2 ring-indigo-100 shadow-lg'
          : 'border-slate-200 hover:border-indigo-200 hover:shadow-md',
      )}
    >
      {/* Başlık + Rozetler */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1', st.color)}>
          <StatusIcon size={8} /> {st.label}
        </span>
        <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border', sev.bg, sev.color)}>
          {rca?.severity ?? 'Orta'}
        </span>
        <span className={clsx('text-[9px] font-medium px-1.5 py-0.5 rounded-full', catColor)}>
          {rca?.category ?? 'Operasyonel'}
        </span>
      </div>

      <h3 className="text-sm font-bold text-slate-800 leading-snug">{rca?.title ?? '—'}</h3>

      {rca?.finding_ref && (
        <div className="text-[10px] font-mono text-indigo-500 mt-0.5">{rca.finding_ref}</div>
      )}

      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
        {rca?.problem_statement ?? ''}
      </p>

      {rca?.root_cause && (
        <div className="mt-2 flex items-start gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5">
          <Target size={10} className="text-red-500 mt-0.5 flex-shrink-0" />
          <span className="text-[10px] font-semibold text-red-700 leading-relaxed line-clamp-2">
            {rca.root_cause}
          </span>
        </div>
      )}

      {rca?.analyst_name && (
        <div className="mt-2 text-[10px] text-slate-400">
          Analist: <span className="font-semibold text-slate-600">{rca.analyst_name}</span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RootCausePage() {
  const { data: analyses, isLoading, error } = useRootCauses();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = (analyses || []).find((a) => a?.id === selectedId) ?? null;

  const stats = {
    total:      (analyses || []).length,
    devam:      (analyses || []).filter((a) => a?.status === 'Devam Ediyor').length,
    tamamlandi: (analyses || []).filter((a) => a?.status === 'Tamamlandı' || a?.status === 'Onaylandı').length,
    kritik:     (analyses || []).filter((a) => a?.severity === 'Kritik').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-sm">
            <GitMerge className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Root Cause & 5-Whys Analyzer</h1>
            <p className="text-xs text-slate-500">Kök Neden Analizi ve 5-Neden Ağacı — GIAS 2025 Uyumlu</p>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          {[
            { label: 'Toplam Analiz', value: stats.total,      icon: GitMerge,    color: 'text-indigo-600' },
            { label: 'Devam Ediyor',  value: stats.devam,      icon: Clock,       color: 'text-blue-600' },
            { label: 'Tamamlandı',    value: stats.tamamlandi, icon: CheckCircle2,color: 'text-emerald-600' },
            { label: 'Kritik',        value: stats.kritik,     icon: ShieldAlert, color: 'text-red-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white/70 backdrop-blur-lg rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
              <Icon size={14} className={clsx(color, 'mb-1')} />
              <div className="text-xl font-black text-slate-800">{value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Body */}
      {isLoading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mr-3" />
          <span className="text-sm">Analizler yükleniyor...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertTriangle size={16} />
          Kök neden analizleri yüklenemedi.
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Sol: Analiz Listesi */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-2">
              <GitMerge size={11} /> Kök Neden Analizleri
            </div>

            {(analyses || []).length === 0 && (
              <div className="text-center py-14 text-slate-400 rounded-2xl border-2 border-dashed border-slate-200 bg-white/40">
                <GitMerge className="w-10 h-10 mx-auto mb-2 opacity-25" />
                <p className="text-sm">Henüz kayıtlı analiz bulunamadı</p>
                <p className="text-xs mt-1 text-slate-300">Bir bulguya bağlı analiz başlatın</p>
              </div>
            )}

            {(analyses || []).map((rca) => (
              <AnalysisCard
                key={rca?.id}
                rca={rca}
                onSelect={() => setSelectedId(rca?.id === selectedId ? null : rca?.id)}
                isSelected={rca?.id === selectedId}
              />
            ))}
          </div>

          {/* Sağ: 5-Neden Ağacı */}
          <div>
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Target size={11} className="text-indigo-500" /> 5-Neden Ağacı
                  </div>

                  {/* Analiz Özet Kartı */}
                  <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200 p-4 shadow-sm mb-4">
                    <h4 className="text-sm font-bold text-slate-800 mb-1">{selected?.title ?? '—'}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {selected?.problem_statement ?? ''}
                    </p>
                    {selected?.corrective_action && (
                      <div className="mt-3 flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
                        <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-[9px] font-bold text-emerald-600 uppercase block">Düzeltici Eylem</span>
                          <span className="text-[11px] text-emerald-700">{selected.corrective_action}</span>
                        </div>
                      </div>
                    )}
                    {selected?.preventive_action && (
                      <div className="mt-2 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-2.5">
                        <ShieldAlert size={12} className="text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-[9px] font-bold text-blue-600 uppercase block">Önleyici Eylem</span>
                          <span className="text-[11px] text-blue-700">{selected.preventive_action}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 5-Neden Ağacı */}
                  <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <FiveWhysTree analysisId={selected.id} />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-64 text-slate-400 rounded-2xl border-2 border-dashed border-slate-200 bg-white/40"
                >
                  <GitMerge className="w-12 h-12 mb-3 opacity-25" />
                  <p className="text-sm font-medium">Soldaki listeden bir analiz seçin</p>
                  <p className="text-xs mt-1">5-Neden ağacı burada görüntülenir</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
