import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Target, CheckCircle2, Loader2, Plus } from 'lucide-react';
import clsx from 'clsx';
import { useWhys, useUpsertStep, type FiveWhysStep } from '@/features/root-cause/api';

// ---------------------------------------------------------------------------
// Why Step — single row in the tree
// ---------------------------------------------------------------------------
interface WhyStepProps {
  step: FiveWhysStep;
  stepIndex: number;
  analysisId: string;
  isLast: boolean;
}

function WhyStepCard({ step, stepIndex, analysisId, isLast }: WhyStepProps) {
  const [localAnswer, setLocalAnswer] = useState(step.answer ?? '');
  const [localEvidence, setLocalEvidence] = useState(step.evidence ?? '');
  const { mutate: upsert, isPending } = useUpsertStep();

  const save = useCallback(() => {
    upsert({
      analysis_id:  analysisId,
      step_number:  step.step_number,
      why_question: step.why_question ?? `Neden #${step.step_number}?`,
      answer:       localAnswer,
      evidence:     localEvidence,
      is_root_cause: isLast,
      contributing_factor: '',
    });
  }, [analysisId, step, localAnswer, localEvidence, isLast, upsert]);

  return (
    <div className="flex items-start gap-3">
      {/* Step number bubble */}
      <div className="shrink-0 flex flex-col items-center gap-1">
        <div className={clsx(
          'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white shadow',
          step.is_root_cause ? 'bg-emerald-600' : 'bg-blue-600'
        )}>
          {stepIndex + 1}
        </div>
        {!isLast && <div className="w-0.5 h-4 bg-blue-200" />}
      </div>

      {/* Step content */}
      <div className="flex-1 mb-3">
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          {step.why_question ?? `Neden #${stepIndex + 1}?`}
        </label>
        <textarea
          rows={2}
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          value={localAnswer}
          onChange={e => setLocalAnswer(e.target.value)}
          onBlur={save}
          placeholder={stepIndex === 0 ? 'İlk neden: Bulgu neden oluştu?' : stepIndex === 4 ? 'Kök neden: En temel sebep nedir?' : `${stepIndex + 1}. seviyedeki neden...`}
        />
        <input
          type="text"
          className="mt-1 w-full px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-400"
          value={localEvidence}
          onChange={e => setLocalEvidence(e.target.value)}
          onBlur={save}
          placeholder="Kanıt / Log referansı (isteğe bağlı)"
        />
        {isPending && (
          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
            <Loader2 size={10} className="animate-spin" /> Kaydediliyor...
          </span>
        )}
      </div>

      {/* Connector arrow */}
      {!isLast && (
        <ChevronDown size={20} className="text-slate-300 mt-6 shrink-0" />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MAIN: FiveWhysTree widget
// ---------------------------------------------------------------------------
interface FiveWhysTreeProps {
  analysisId: string;
  /** How many why levels to show (default 5, max 10) */
  levels?: number;
}

export function FiveWhysTree({ analysisId, levels = 5 }: FiveWhysTreeProps) {
  const { data: steps = [], isLoading } = useWhys(analysisId);
  const { mutate: upsert } = useUpsertStep();

  const safeSteps = (steps ?? []);
  const rootCauseStep = safeSteps.find(s => s.is_root_cause);

  const addLevel = useCallback(() => {
    const nextNum = safeSteps.length + 1;
    if (nextNum > 10) return;
    upsert({
      analysis_id:  analysisId,
      step_number:  nextNum,
      why_question: `Neden #${nextNum}?`,
      answer:       '',
      evidence:     '',
      is_root_cause: false,
      contributing_factor: '',
    });
  }, [analysisId, safeSteps.length, upsert]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-24">
        <Loader2 size={20} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Methodology hint */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 mb-4">
        <strong>Metodoloji:</strong> Her "Neden?" sorusunun cevabı bir sonraki soruyu tetikler.
        5. adımda kök nedene ulaşılır. Her adım onBlur olayında otomatik olarak Supabase'e kaydedilir.
      </div>

      {/* Steps list — (steps ?? []).map */}
      {(safeSteps ?? []).map((step, idx) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <WhyStepCard
            step={step}
            stepIndex={idx}
            analysisId={analysisId}
            isLast={idx === safeSteps.length - 1}
          />
        </motion.div>
      ))}

      {/* Empty state */}
      {safeSteps.length === 0 && (
        <div className="text-center py-6 text-slate-400 text-sm">
          Henüz adım eklenmedi. Aşağıdan ilk "Neden?"i ekleyin.
        </div>
      )}

      {/* Add level button */}
      {safeSteps.length < 10 && (
        <button
          onClick={addLevel}
          className="mt-2 flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors"
        >
          <Plus size={14} />
          Neden Ekle ({safeSteps.length}/{levels})
        </button>
      )}

      {/* Root cause highlight */}
      <AnimatePresence>
        {rootCauseStep?.answer && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 text-emerald-900 font-semibold mb-1 text-sm">
              <Target size={16} />
              Tespit Edilen Kök Neden
            </div>
            <p className="text-sm text-emerald-800">{rootCauseStep.answer}</p>
            {rootCauseStep.evidence && (
              <p className="text-xs text-emerald-600 mt-1">
                📎 {rootCauseStep.evidence}
              </p>
            )}
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 mt-2">
              <CheckCircle2 size={10} />
              Kayıtlı — {new Date(rootCauseStep.created_at).toLocaleDateString('tr-TR')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
