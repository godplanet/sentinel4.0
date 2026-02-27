import { useState, useRef, useCallback } from 'react';
import {
  Check, MessageSquare, Plus, ChevronDown, ChevronRight,
  Loader2, Calculator, Library, CornerDownLeft, AlertTriangle, FileWarning,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import type { TestStep } from '@/entities/workpaper/model/detail-types';
import { useFindingStore } from '@/entities/finding/model/store';

interface TestStepsPanelProps {
  steps: TestStep[];
  loading: boolean;
  workpaperId?: string;
  onToggleStep: (stepId: string, completed: boolean) => void;
  onUpdateComment: (stepId: string, comment: string) => void;
  onAddStep: (description: string) => void;
  onOpenSampling?: () => void;
  onOpenLibrary?: () => void;
  sampleSize?: number | null;
}

export function TestStepsPanel({
  steps,
  loading,
  workpaperId,
  onToggleStep,
  onUpdateComment,
  onAddStep,
  onOpenSampling,
  onOpenLibrary,
  sampleSize,
}: TestStepsPanelProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<Record<string, string>>({});
  const [newStepText, setNewStepText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [quickText, setQuickText] = useState('');
  const [exceptionStepIds, setExceptionStepIds] = useState<Set<string>>(new Set());
  const [draftingStepId, setDraftingStepId] = useState<string | null>(null);
  const quickRef = useRef<HTMLInputElement>(null);

  const draftFindingFromWorkpaper = useFindingStore((s) => s.draftFindingFromWorkpaper);

  const completed = steps.filter(s => s.is_completed).length;
  const total = steps.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleCommentBlur = (stepId: string) => {
    const val = editingComment[stepId];
    if (val !== undefined) {
      onUpdateComment(stepId, val);
      setEditingComment(prev => {
        const next = { ...prev };
        delete next[stepId];
        return next;
      });
    }
  };

  const handleAddStep = () => {
    if (!newStepText.trim()) return;
    onAddStep(newStepText.trim());
    setNewStepText('');
    setShowAddForm(false);
  };

  const toggleException = useCallback((stepId: string) => {
    setExceptionStepIds(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  }, []);

  const handleDraftFinding = useCallback(
    async (step: TestStep) => {
      if (!workpaperId) {
        toast.error('Workpaper ID bulunamadı.');
        return;
      }
      setDraftingStepId(step.id);
      await new Promise((r) => setTimeout(r, 350));

      const observation =
        editingComment[step.id] ??
        step.auditor_comment ??
        `Test adımı başarısız: ${step.description}`;

      const draft = draftFindingFromWorkpaper(workpaperId, step.description, observation);

      toast.success(
        `İzlenebilirlik bağlantısı kuruldu — Taslak Bulgu oluşturuldu\nToken: ${draft.traceabilityToken}`,
        {
          duration: 4500,
          style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' },
          icon: '🔗',
        },
      );
      setDraftingStepId(null);
    },
    [workpaperId, editingComment, draftFindingFromWorkpaper],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-blue-600 mr-2" size={20} />
        <span className="text-sm text-slate-500">Yukleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Test Ilerleme</span>
          <div className="flex items-center gap-2">
            {sampleSize && (
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                Orneklem: {sampleSize}
              </span>
            )}
            <span className="text-sm font-bold text-slate-900">{completed}/{total}</span>
          </div>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-500',
              pct === 100 ? 'bg-emerald-500' : pct > 50 ? 'bg-blue-500' : 'bg-amber-500'
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onOpenSampling && (
          <button
            onClick={onOpenSampling}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition-colors"
          >
            <Calculator size={14} />
            Orneklem Hesapla
          </button>
        )}
        {onOpenLibrary && (
          <button
            onClick={onOpenLibrary}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white text-slate-700 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            <Library size={14} />
            Kutuphaneden Ekle
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            ref={quickRef}
            type="text"
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && quickText.trim()) {
                onAddStep(quickText.trim());
                setQuickText('');
              }
            }}
            placeholder="Hizli test adimi ekle..."
            className="w-full px-3 py-2 pr-9 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          {quickText.trim() && (
            <button
              onClick={() => {
                onAddStep(quickText.trim());
                setQuickText('');
                quickRef.current?.focus();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-blue-500 hover:text-blue-700"
              title="Ekle (Enter)"
            >
              <CornerDownLeft size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {steps.map((step, idx) => {
          const isExpanded = expandedStep === step.id;
          const commentValue = editingComment[step.id] ?? step.auditor_comment;
          const isException = exceptionStepIds.has(step.id);
          const isDrafting = draftingStepId === step.id;

          return (
            <div
              key={step.id}
              className={clsx(
                'border rounded-xl transition-all duration-200',
                isException
                  ? 'bg-red-950/20 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.1)]'
                  : step.is_completed
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
              )}
            >
              <div className="flex items-start gap-3 p-4">
                <button
                  onClick={() => onToggleStep(step.id, !step.is_completed)}
                  className={clsx(
                    'mt-0.5 shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all',
                    step.is_completed
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-300 hover:border-blue-400'
                  )}
                >
                  {step.is_completed && <Check size={14} strokeWidth={3} />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={clsx(
                      'text-sm leading-relaxed',
                      isException
                        ? 'text-red-200 font-medium'
                        : step.is_completed
                          ? 'text-emerald-800 line-through opacity-70'
                          : 'text-slate-800 font-medium'
                    )}>
                      <span className="text-xs font-bold text-slate-400 mr-2">#{idx + 1}</span>
                      {step.description}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleException(step.id)}
                        title={isException ? 'İstisna işaretini kaldır' : 'İstisna olarak işaretle'}
                        className={clsx(
                          'p-1 rounded-lg transition-all',
                          isException
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                            : 'text-slate-400 hover:text-red-400 hover:bg-red-50'
                        )}
                      >
                        <AlertTriangle size={13} />
                      </button>
                      <button
                        onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                        className="shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                      >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    </div>
                  </div>

                  {step.auditor_comment && !isExpanded && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                      <MessageSquare size={12} />
                      <span className="truncate">{step.auditor_comment}</span>
                    </div>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pl-[52px]">
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Denetci Notu</label>
                  <textarea
                    rows={3}
                    value={commentValue}
                    onChange={(e) => setEditingComment(prev => ({ ...prev, [step.id]: e.target.value }))}
                    onBlur={() => handleCommentBlur(step.id)}
                    placeholder="Test sonuclarini ve gozlemlerinizi buraya yazin..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                  />
                </div>
              )}

              <AnimatePresence>
                {isException && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pl-[52px]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-px flex-1 bg-red-500/20" />
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
                          İstisna Tespit Edildi
                        </span>
                        <div className="h-px flex-1 bg-red-500/20" />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleDraftFinding(step)}
                        disabled={isDrafting || !workpaperId}
                        className={clsx(
                          'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
                          'text-sm font-bold transition-all',
                          'bg-gradient-to-r from-red-600 to-rose-600',
                          'text-white shadow-[0_0_16px_rgba(239,68,68,0.35)]',
                          'hover:from-red-500 hover:to-rose-500 hover:shadow-[0_0_22px_rgba(239,68,68,0.5)]',
                          'disabled:opacity-60 disabled:cursor-not-allowed',
                          'border border-red-500/40',
                        )}
                      >
                        {isDrafting ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            İzlenebilirlik bağlantısı kuruluyor...
                          </>
                        ) : (
                          <>
                            <FileWarning size={15} />
                            Bu İstisna İçin Taslak Bulgu Oluştur
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {showAddForm ? (
        <div className="border border-blue-200 bg-blue-50/30 rounded-xl p-4">
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Yeni Test Adimi</label>
          <textarea
            rows={2}
            value={newStepText}
            onChange={(e) => setNewStepText(e.target.value)}
            placeholder="Test prosedurunu tanimlayin..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white mb-3"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddStep}
              disabled={!newStepText.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Ekle
            </button>
            <button
              onClick={() => { setShowAddForm(false); setNewStepText(''); }}
              className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Iptal
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
        >
          <Plus size={16} />
          Yeni Test Adimi Ekle
        </button>
      )}
    </div>
  );
}
