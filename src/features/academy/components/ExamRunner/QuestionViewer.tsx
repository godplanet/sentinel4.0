import { ChevronLeft, ChevronRight, Flag, SendHorizonal, CheckCircle2, Circle } from 'lucide-react';
import { useExamStore } from '../../store/examStore';
import { useExamTimer } from './useExamTimer';

interface QuestionViewerProps {
  userId: string;
}

export function QuestionViewer({ userId }: QuestionViewerProps) {
  const exam          = useExamStore((s) => s.exam);
  const questions     = useExamStore((s) => s.questions);
  const answers       = useExamStore((s) => s.answers);
  const marked        = useExamStore((s) => s.markedForReview);
  const currentIndex  = useExamStore((s) => s.currentIndex);
  const isSubmitting  = useExamStore((s) => s.isSubmitting);
  const answerQuestion = useExamStore((s) => s.answerQuestion);
  const toggleMark    = useExamStore((s) => s.toggleMark);
  const navigateTo    = useExamStore((s) => s.navigateTo);
  const submitExam    = useExamStore((s) => s.submitExam);

  const { formatted, isCritical, isWarning } = useExamTimer(userId);

  if (!exam || questions.length === 0) return null;

  const question     = questions[currentIndex];
  const isFirst      = currentIndex === 0;
  const isLast       = currentIndex === questions.length - 1;
  const isMarked     = marked.includes(question.id);
  const selectedId   = answers[question.id] ?? null;
  const answeredCount = Object.keys(answers).length;
  const progress     = (answeredCount / questions.length) * 100;

  const timerColor = isCritical
    ? 'text-rose-400'
    : isWarning
    ? 'text-amber-400'
    : 'text-slate-200';

  const timerBorder = isCritical
    ? 'border-rose-500/40 bg-rose-500/10'
    : isWarning
    ? 'border-amber-500/40 bg-amber-500/10'
    : 'border-white/[0.08] bg-white/[0.04]';

  const handleSubmit = () => {
    if (window.confirm('Sınavı teslim etmek istediğinizden emin misiniz?')) {
      submitExam(userId);
    }
  };

  return (
    <div className="min-h-screen bg-[#070c18] flex flex-col">
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#070c18]/95 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <span className="text-white font-semibold text-sm truncate max-w-xs">
                {exam.title}
              </span>
              <span className="text-slate-500 text-xs">
                Soru {currentIndex + 1} / {questions.length}
              </span>
            </div>

            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-mono font-bold
              ${timerBorder} ${timerColor} ${isCritical ? 'animate-pulse' : ''}`}>
              <ClockIcon size={14} />
              {formatted}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap">
              {answeredCount}/{questions.length} yanıtlandı
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-3xl flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 md:p-8 mb-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30
                                   flex items-center justify-center text-blue-400 text-xs font-bold">
                    {currentIndex + 1}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {question.points} puan
                  </span>
                </div>
                <button
                  onClick={() => toggleMark(question.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium
                    transition-colors duration-150 ${
                    isMarked
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                      : 'border-white/[0.08] bg-transparent text-slate-500 hover:text-amber-400 hover:border-amber-500/30'
                  }`}
                >
                  <Flag size={12} />
                  {isMarked ? 'İşaretlendi' : 'İşaretle'}
                </button>
              </div>

              <p className="text-white text-base md:text-lg leading-relaxed font-medium mb-8">
                {question.question_text}
              </p>

              <div className="space-y-3">
                {question.options.map((option) => {
                  const isSelected = selectedId === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => answerQuestion(question.id, option.id)}
                      className={`w-full flex items-center gap-4 rounded-xl border px-4 py-3.5 text-left
                        transition-all duration-150 group
                        ${isSelected
                          ? 'border-blue-500/60 bg-blue-500/10 shadow-md shadow-blue-500/10'
                          : 'border-white/[0.07] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                        }`}
                    >
                      <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
                        transition-colors duration-150
                        ${isSelected
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-slate-600 group-hover:border-slate-400'
                        }`}>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </span>
                      <span className={`text-sm leading-relaxed transition-colors duration-150
                        ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                        <span className={`font-semibold mr-2 ${isSelected ? 'text-blue-400' : 'text-slate-600'}`}>
                          {option.id.toUpperCase()}.
                        </span>
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateTo(currentIndex - 1)}
                disabled={isFirst}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/[0.08]
                           text-slate-400 text-sm font-medium hover:text-white hover:border-white/20
                           transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
                Önceki
              </button>

              <div className="flex-1" />

              {isLast ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500
                             text-white text-sm font-semibold transition-all duration-200
                             shadow-lg shadow-emerald-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <SendHorizonal size={16} />
                  {isSubmitting ? 'Gönderiliyor…' : 'Sınavı Teslim Et'}
                </button>
              ) : (
                <button
                  onClick={() => navigateTo(currentIndex + 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/[0.08]
                             text-slate-400 text-sm font-medium hover:text-white hover:border-white/20
                             transition-colors"
                >
                  Sonraki
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>

          <aside className="lg:w-52 flex-shrink-0">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 sticky top-24">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Soru Listesi
              </p>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-1.5">
                {questions.map((q, i) => {
                  const answered = !!answers[q.id];
                  const isCurrent = i === currentIndex;
                  const isQuestionMarked = marked.includes(q.id);
                  return (
                    <button
                      key={q.id}
                      onClick={() => navigateTo(i)}
                      title={`Soru ${i + 1}${answered ? ' (yanıtlandı)' : ''}${isQuestionMarked ? ' (işaretli)' : ''}`}
                      className={`relative w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-150
                        ${isCurrent
                          ? 'bg-blue-600 text-white ring-2 ring-blue-400/50'
                          : answered
                          ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 hover:bg-emerald-600/30'
                          : 'bg-white/[0.04] text-slate-500 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white'
                        }`}
                    >
                      {i + 1}
                      {isQuestionMarked && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 space-y-1.5">
                <LegendItem color="bg-emerald-600/20 border-emerald-600/30 text-emerald-400" label="Yanıtlandı" />
                <LegendItem color="bg-white/[0.04] border-white/[0.06] text-slate-500" label="Yanıtlanmadı" />
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-slate-500 text-xs">İşaretli</span>
                </div>
              </div>

              {marked.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/[0.06]">
                  <p className="text-xs text-amber-400/80">
                    {marked.length} soru inceleme için işaretlendi
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-4 h-4 rounded text-xs border flex items-center justify-center ${color}`} />
      <span className="text-slate-500 text-xs">{label}</span>
    </div>
  );
}

function ClockIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
