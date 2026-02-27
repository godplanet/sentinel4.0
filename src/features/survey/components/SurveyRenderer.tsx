import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle2, Circle, AlertCircle, Send } from 'lucide-react';
import type {
  SurveySchema,
  SurveySection,
  SurveyQuestion,
  SurveyQuestionType,
  SurveyAnswers,
  SurveyAnswer,
} from '@/shared/types/survey';
import { computeScore } from '../api';

interface Props {
  schema: SurveySchema;
  templateTitle: string;
  showScore?: boolean;
  onSubmit: (answers: SurveyAnswers, score: number) => Promise<void>;
  onCancel: () => void;
}

const RATING_LABELS: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: 'Yetersiz',    color: 'text-red-400',    bg: 'bg-red-500/20 border-red-500/50 hover:bg-red-500/30' },
  2: { label: 'Gelişmekte',  color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/50 hover:bg-orange-500/30' },
  3: { label: 'Yeterli',     color: 'text-amber-400',  bg: 'bg-amber-500/20 border-amber-500/50 hover:bg-amber-500/30' },
  4: { label: 'İyi',         color: 'text-sky-400',    bg: 'bg-sky-500/20 border-sky-500/50 hover:bg-sky-500/30' },
  5: { label: 'Mükemmel',    color: 'text-emerald-400',bg: 'bg-emerald-500/20 border-emerald-500/50 hover:bg-emerald-500/30' },
};

function scoreForAnswer(q: SurveyQuestion, rawValue: SurveyAnswer['value']): number {
  switch (q.type) {
    case 'RATING':
      return (Number(rawValue) / 5) * q.weight;
    case 'YES_NO':
      return rawValue === true ? q.weight : 0;
    case 'SINGLE_CHOICE': {
      const opt = q.options?.find((o) => o.value === rawValue);
      return opt?.score ?? (rawValue ? q.weight : 0);
    }
    case 'MULTI_CHOICE': {
      const selected = rawValue as string[];
      const total = (q.options ?? []).reduce((s, o) => s + (selected.includes(o.value) ? (o.score ?? 1) : 0), 0);
      return Math.min(total, q.weight);
    }
    case 'TEXT':
      return typeof rawValue === 'string' && rawValue.trim().length > 0 ? q.weight : 0;
    case 'NUMERIC': {
      const min = q.min ?? 0;
      const max = q.max ?? 100;
      return Math.round(((Number(rawValue) - min) / (max - min)) * q.weight);
    }
    default:
      return 0;
  }
}

function RatingQuestion({ question, value, onChange }: {
  question: SurveyQuestion;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-2 mt-3">
      {[1, 2, 3, 4, 5].map((n) => {
        const meta = RATING_LABELS[n];
        const selected = value === n;
        return (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border transition-all
              ${selected ? meta.bg + ' ring-1 ring-offset-1 ring-offset-slate-900 ring-current scale-105' : 'border-white/10 bg-slate-800/40 hover:bg-slate-700/40 hover:border-white/20'}
            `}
          >
            <span className={`text-xl font-black font-mono ${selected ? meta.color : 'text-slate-500'}`}>{n}</span>
            <span className={`text-[9px] font-semibold text-center leading-tight ${selected ? meta.color : 'text-slate-600'}`}>
              {meta.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function YesNoQuestion({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-3 mt-3">
      {[{ v: true, label: 'Evet', cls: 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300' },
        { v: false, label: 'Hayır', cls: 'border-rose-500/50 bg-rose-500/20 text-rose-300' }].map(({ v, label, cls }) => (
        <button
          key={String(v)}
          onClick={() => onChange(v)}
          className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all
            ${value === v ? cls + ' ring-1 ring-offset-1 ring-offset-slate-900' : 'border-white/10 bg-slate-800/40 text-slate-500 hover:text-slate-300 hover:border-white/20'}
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function ChoiceQuestion({ question, value, multi, onChange }: {
  question: SurveyQuestion;
  value: string | string[] | null;
  multi: boolean;
  onChange: (v: string | string[]) => void;
}) {
  const options = question.options ?? [];
  const selected = multi ? (value as string[] ?? []) : (value as string | null);

  const toggle = (optVal: string) => {
    if (multi) {
      const arr = selected as string[];
      onChange(arr.includes(optVal) ? arr.filter((x) => x !== optVal) : [...arr, optVal]);
    } else {
      onChange(optVal);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {options.map((opt) => {
        const isOn = multi ? (selected as string[]).includes(opt.value) : selected === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={`px-4 py-2 rounded-lg border text-sm transition-all
              ${isOn
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 ring-1 ring-sky-500/30'
                : 'bg-slate-800/40 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function QuestionCard({ question, sectionId, answers, onAnswer }: {
  question: SurveyQuestion;
  sectionId: string;
  answers: SurveyAnswers;
  onAnswer: (sectionId: string, questionId: string, answer: SurveyAnswer) => void;
}) {
  const current = answers[sectionId]?.[question.id];
  const rawValue = current?.value ?? null;
  const isAnswered = current !== undefined;

  const handleChange = (rawVal: SurveyAnswer['value']) => {
    onAnswer(sectionId, question.id, {
      question_id: question.id,
      value: rawVal,
      score: scoreForAnswer(question, rawVal),
    });
  };

  return (
    <div className={`rounded-2xl border p-5 transition-colors ${isAnswered ? 'border-white/10 bg-slate-800/30' : 'border-white/6 bg-slate-900/50'}`}>
      <div className="flex items-start gap-3 mb-1">
        <div className={`mt-0.5 flex-shrink-0 ${isAnswered ? 'text-emerald-400' : 'text-slate-600'}`}>
          {isAnswered ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
        </div>
        <div className="flex-1">
          <p className="text-white text-sm font-medium leading-snug">
            {question.text}
            {question.required && <span className="text-rose-400 ml-1">*</span>}
          </p>
          {question.hint && <p className="text-slate-500 text-xs mt-0.5">{question.hint}</p>}
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[9px] text-slate-600 uppercase tracking-widest font-semibold">{question.type.replace('_', ' ')}</span>
            <span className="text-[9px] text-slate-700 font-mono">ağırlık: {question.weight}</span>
          </div>
        </div>
      </div>

      <div className="ml-7">
        {question.type === 'RATING' && (
          <RatingQuestion question={question} value={rawValue as number | null} onChange={handleChange} />
        )}
        {question.type === 'YES_NO' && (
          <YesNoQuestion value={rawValue as boolean | null} onChange={handleChange} />
        )}
        {question.type === 'SINGLE_CHOICE' && (
          <ChoiceQuestion question={question} value={rawValue as string | null} multi={false} onChange={handleChange} />
        )}
        {question.type === 'MULTI_CHOICE' && (
          <ChoiceQuestion question={question} value={rawValue as string[] | null} multi onChange={handleChange} />
        )}
        {question.type === 'TEXT' && (
          <textarea
            value={(rawValue as string) ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Cevabınızı yazın..."
            rows={3}
            className="mt-3 w-full bg-slate-800 border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 resize-none transition-colors"
          />
        )}
        {question.type === 'NUMERIC' && (
          <input
            type="number"
            min={question.min}
            max={question.max}
            value={(rawValue as number) ?? ''}
            onChange={(e) => handleChange(Number(e.target.value))}
            placeholder={`${question.min ?? 0} – ${question.max ?? 100}`}
            className="mt-3 w-32 bg-slate-800 border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500/50 transition-colors"
          />
        )}
      </div>
    </div>
  );
}

export function SurveyRenderer({ schema, templateTitle, showScore = false, onSubmit, onCancel }: Props) {
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [sectionIdx, setSectionIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [direction, setDirection] = useState(1);

  const sections = schema.sections;
  const currentSection = sections[sectionIdx];

  const answeredCount = useMemo(() => {
    let count = 0;
    for (const s of sections) {
      for (const q of s.questions) {
        if (answers[s.id]?.[q.id] !== undefined) count++;
      }
    }
    return count;
  }, [answers, sections]);

  const totalRequired = useMemo(
    () => sections.flatMap((s) => s.questions).filter((q) => q.required).length,
    [sections],
  );

  const answeredRequired = useMemo(() => {
    let count = 0;
    for (const s of sections) {
      for (const q of s.questions) {
        if (q.required && answers[s.id]?.[q.id] !== undefined) count++;
      }
    }
    return count;
  }, [answers, sections]);

  const totalQuestions = sections.reduce((s, sec) => s + sec.questions.length, 0);
  const completionPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const runningScore = showScore ? computeScore(answers, schema) : null;

  const isSectionComplete = (s: SurveySection) =>
    s.questions.filter((q) => q.required).every((q) => answers[s.id]?.[q.id] !== undefined);

  const canSubmit = answeredRequired === totalRequired && !submitting;
  const isLast = sectionIdx === sections.length - 1;

  const handleAnswer = (sId: string, qId: string, answer: SurveyAnswer) => {
    setAnswers((prev) => ({
      ...prev,
      [sId]: { ...(prev[sId] ?? {}), [qId]: answer },
    }));
  };

  const goNext = () => {
    if (!isLast) {
      setDirection(1);
      setSectionIdx((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (sectionIdx > 0) {
      setDirection(-1);
      setSectionIdx((i) => i - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const score = computeScore(answers, schema);
      await onSubmit(answers, score);
    } finally {
      setSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 48 : -48, opacity: 0 }),
    center:               { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d > 0 ? -48 : 48, opacity: 0 }),
  };

  return (
    <div className="flex h-full min-h-[600px] bg-slate-950 rounded-2xl overflow-hidden border border-white/8">
      <div className="w-64 flex-shrink-0 border-r border-white/6 bg-slate-900/80 flex flex-col">
        <div className="p-5 border-b border-white/6">
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Anket</p>
          <h2 className="text-white text-sm font-semibold leading-snug">{templateTitle}</h2>
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500">Tamamlanma</span>
              <span className="text-white font-mono font-semibold">{completionPct}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-sky-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            {showScore && runningScore !== null && (
              <p className="text-[10px] text-amber-400 font-mono">Tahmini: {runningScore} puan</p>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {sections.map((s, i) => {
            const done = isSectionComplete(s);
            const active = i === sectionIdx;
            return (
              <button
                key={s.id}
                onClick={() => { setDirection(i > sectionIdx ? 1 : -1); setSectionIdx(i); }}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-xs
                  ${active ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold border
                  ${done ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : active ? 'border-sky-500/50 text-sky-400' : 'border-slate-700 text-slate-600'}`}>
                  {done ? '✓' : i + 1}
                </div>
                <span className="truncate leading-tight">{s.title}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/6">
          <div className="text-[10px] text-slate-600">
            {answeredRequired}/{totalRequired} zorunlu soru
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSection.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="p-6 space-y-4"
            >
              <div className="mb-6">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
                  Bölüm {sectionIdx + 1} / {sections.length}
                </div>
                <h3 className="text-white text-lg font-semibold">{currentSection.title}</h3>
                {currentSection.description && (
                  <p className="text-slate-400 text-sm mt-1">{currentSection.description}</p>
                )}
              </div>

              {currentSection.questions.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  sectionId={currentSection.id}
                  answers={answers}
                  onAnswer={handleAnswer}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="border-t border-white/6 px-6 py-4 bg-slate-900/60 flex items-center justify-between gap-3">
          <button
            onClick={onCancel}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            İptal
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={goPrev}
              disabled={sectionIdx === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/8 bg-slate-800/40 text-slate-400 text-xs font-medium
                hover:bg-slate-700/40 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Önceki
            </button>

            {isLast ? (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold
                  transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-sky-900/30"
              >
                {submitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                {submitting ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            ) : (
              <button
                onClick={goNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-all"
              >
                Sonraki
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
