import { Trophy, XCircle, BookOpen, Download, RotateCcw, CheckCircle2, TrendingUp } from 'lucide-react';
import { useExamStore } from '../../store/examStore';
import { ConfettiCanvas } from './ConfettiCanvas';

interface ExamResultProps {
  onRetry?: () => void;
  onBack?: () => void;
}

export function ExamResult({ onRetry, onBack }: ExamResultProps) {
  const exam   = useExamStore((s) => s.exam);
  const result = useExamStore((s) => s.result);
  const questions = useExamStore((s) => s.questions);
  const answers   = useExamStore((s) => s.answers);
  const reset  = useExamStore((s) => s.reset);

  if (!exam || !result) return null;

  const passed = result.passed;
  const scorePercent = Math.round(result.score);
  const circumference = 2 * Math.PI * 44;
  const strokeDash = (result.score / 100) * circumference;

  const handleDownloadCertificate = () => {
    const lines = [
      '═══════════════════════════════════════════════',
      '         SENTINEL GRC — ACADEMY SERTİFİKA      ',
      '═══════════════════════════════════════════════',
      '',
      `Kurs   : ${exam.course.title}`,
      `Sınav  : ${exam.title}`,
      `Skor   : %${scorePercent}`,
      `XP     : +${result.xp_awarded}`,
      `Tarih  : ${new Date().toLocaleDateString('tr-TR', { dateStyle: 'long' })}`,
      '',
      '═══════════════════════════════════════════════',
      'Bu sertifika Sentinel GRC Academy tarafından',
      'otomatik olarak oluşturulmuştur.',
      '═══════════════════════════════════════════════',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `sentinel-academy-certificate-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRetry = () => {
    reset();
    onRetry?.();
  };

  return (
    <>
      {passed && <ConfettiCanvas />}

      <div className="min-h-screen bg-[#070c18] flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            {passed ? (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full
                                bg-emerald-500/10 border border-emerald-500/30 mb-4 mx-auto">
                  <Trophy size={36} className="text-emerald-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Tebrikler!</h1>
                <p className="text-slate-400">Sınavı başarıyla geçtiniz.</p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full
                                bg-rose-500/10 border border-rose-500/30 mb-4 mx-auto">
                  <XCircle size={36} className="text-rose-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Bu Sefer Olmadı</h1>
                <p className="text-slate-400">Geçme notuna ulaşılamadı. Tekrar deneyebilirsiniz.</p>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 md:p-8 mb-6">
            <div className="flex items-center justify-center gap-10 md:gap-16">
              <ScoreGauge
                score={result.score}
                circumference={circumference}
                strokeDash={strokeDash}
                passed={passed}
                passingScore={exam.passing_score}
              />

              <div className="space-y-4">
                <ScoreStat
                  label="Doğru Cevap"
                  value={`${result.correct_count} / ${result.total_questions}`}
                  icon={<CheckCircle2 size={16} className="text-emerald-400" />}
                />
                <ScoreStat
                  label="Geçme Notu"
                  value={`%${exam.passing_score}`}
                  icon={<TrendingUp size={16} className="text-blue-400" />}
                />
                {passed && (
                  <ScoreStat
                    label="Kazanılan XP"
                    value={`+${result.xp_awarded}`}
                    icon={<Trophy size={16} className="text-amber-400" />}
                    highlight
                  />
                )}
              </div>
            </div>
          </div>

          {passed ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center gap-3">
                <Trophy size={20} className="text-amber-400 flex-shrink-0" />
                <p className="text-amber-300 text-sm">
                  <span className="font-semibold">+{result.xp_awarded} XP</span> profil hesabınıza eklendi. Seviye atlamak için XP biriktirmeye devam edin.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadCertificate}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08]
                             text-slate-300 font-medium py-3 text-sm hover:bg-white/[0.05] hover:text-white
                             transition-all duration-150"
                >
                  <Download size={16} />
                  Sertifika İndir
                </button>
                <button
                  onClick={onBack ?? reset}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500
                             text-white font-semibold py-3 text-sm transition-all duration-200
                             shadow-lg shadow-blue-600/20"
                >
                  Kursa Dön
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={16} className="text-blue-400" />
                  <p className="text-sm font-semibold text-white">Çalışma Önerileri</p>
                </div>
                <StudyRecommendations result={result} questions={questions} answers={answers} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onBack ?? reset}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08]
                             text-slate-400 font-medium py-3 text-sm hover:bg-white/[0.05] hover:text-white
                             transition-all duration-150"
                >
                  Materyallere Dön
                </button>
                <button
                  onClick={handleRetry}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500
                             text-white font-semibold py-3 text-sm transition-all duration-200
                             shadow-lg shadow-blue-600/20"
                >
                  <RotateCcw size={15} />
                  Tekrar Dene
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ScoreGauge({
  score,
  circumference,
  strokeDash,
  passed,
  passingScore,
}: {
  score: number;
  circumference: number;
  strokeDash: number;
  passed: boolean;
  passingScore: number;
}) {
  const color = passed ? '#10b981' : '#f43f5e';
  const trackColor = passed ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)';

  return (
    <div className="relative flex-shrink-0">
      <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
        <circle cx="56" cy="56" r="44" fill="none" stroke={trackColor} strokeWidth="8" />
        <circle
          cx="56" cy="56" r="44" fill="none"
          stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - strokeDash}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white leading-none">%{Math.round(score)}</span>
        <span className="text-xs mt-0.5" style={{ color }}>
          {passed ? 'Geçti' : 'Kaldı'}
        </span>
      </div>
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="text-xs text-slate-600">Geçme: %{passingScore}</span>
      </div>
    </div>
  );
}

function ScoreStat({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="text-xs text-slate-500 leading-none mb-0.5">{label}</p>
        <p className={`font-semibold text-sm ${highlight ? 'text-amber-400' : 'text-white'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function StudyRecommendations({
  result,
  questions,
  answers,
}: {
  result: ReturnType<typeof useExamStore>['result'];
  questions: ReturnType<typeof useExamStore>['questions'];
  answers: ReturnType<typeof useExamStore>['answers'];
}) {
  if (!result) return null;

  const wrongItems = result.per_question
    .filter((p) => !p.is_correct)
    .slice(0, 3);

  if (wrongItems.length === 0) {
    return <p className="text-slate-400 text-sm">Tüm sorular incelendi.</p>;
  }

  return (
    <div className="space-y-3">
      {wrongItems.map((item) => {
        const q = questions.find((q) => q.id === item.question_id);
        if (!q) return null;
        const correctOption = q.options.find((o) => o.id === item.correct);
        return (
          <div key={item.question_id} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="text-slate-300 text-xs leading-relaxed mb-2 line-clamp-2">
              {q.question_text}
            </p>
            <div className="flex items-start gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" />
              <p className="text-emerald-400/80 text-xs leading-relaxed">
                {correctOption?.text ?? item.correct}
              </p>
            </div>
            {q.explanation && (
              <p className="mt-2 text-slate-500 text-xs leading-relaxed border-t border-white/[0.05] pt-2">
                {q.explanation}
              </p>
            )}
          </div>
        );
      })}
      {result.per_question.filter((p) => !p.is_correct).length > 3 && (
        <p className="text-slate-600 text-xs text-center">
          +{result.per_question.filter((p) => !p.is_correct).length - 3} yanlış cevap daha var
        </p>
      )}
    </div>
  );
}
