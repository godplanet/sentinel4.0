import {
  Clock,
  Trophy,
  ShieldCheck,
  BookOpen,
  Target,
  AlertCircle,
  PlayCircle,
  RotateCcw,
} from 'lucide-react';
import { useExamStore } from '../../store/examStore';

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  beginner:     { label: 'Başlangıç',  color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  intermediate: { label: 'Orta',       color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  advanced:     { label: 'İleri',      color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  expert:       { label: 'Uzman',      color: 'text-rose-400 bg-rose-400/10 border-rose-400/30' },
};

interface ExamIntroProps {
  attemptCount: number;
}

export function ExamIntro({ attemptCount }: ExamIntroProps) {
  const exam      = useExamStore((s) => s.exam);
  const questions = useExamStore((s) => s.questions);
  const startExam = useExamStore((s) => s.startExam);

  if (!exam) return null;

  const diff = DIFFICULTY_LABELS[exam.course.difficulty] ?? DIFFICULTY_LABELS.intermediate;
  const attemptsLeft = exam.max_attempts - attemptCount;
  const isBlocked = attemptsLeft <= 0;

  const rules = [
    { icon: Clock,      text: `${exam.time_limit_minutes} dakikalık süre. Süre dolunca sınav otomatik teslim edilir.` },
    { icon: Target,     text: `Geçme notu: %${exam.passing_score}. ${questions.length} sorudan oluşmaktadır.` },
    { icon: ShieldCheck, text: 'Sınav sırasında başka sayfaya geçilmesi önerilmez; cevaplar tarayıcı oturumunda tutulur.' },
    { icon: RotateCcw,  text: `Toplam ${exam.max_attempts} deneme hakkınız var. Kalan: ${attemptsLeft} hak.` },
  ];

  return (
    <div className="min-h-screen bg-[#070c18] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium mb-4"
               style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }}>
            <BookOpen size={12} />
            <span>{exam.course.category.toUpperCase()}</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight leading-snug">
            {exam.title}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-lg mx-auto">
            {exam.course.title}
          </p>

          {exam.course.description && (
            <p className="mt-3 text-slate-500 text-xs leading-relaxed max-w-md mx-auto">
              {exam.course.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatCard
            label="Süre"
            value={`${exam.time_limit_minutes} dk`}
            icon={<Clock size={18} className="text-blue-400" />}
          />
          <StatCard
            label="XP Ödülü"
            value={`+${exam.course.xp_reward}`}
            icon={<Trophy size={18} className="text-amber-400" />}
            highlight
          />
          <StatCard
            label="Geçme Notu"
            value={`%${exam.passing_score}`}
            icon={<Target size={18} className="text-emerald-400" />}
          />
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5 mb-6 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Sınav Kuralları
          </p>
          {rules.map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                <Icon size={15} className="text-slate-500" />
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${diff.color}`}>
            {diff.label} Seviye
          </span>
          <span className="text-slate-500 text-xs">
            {questions.length} soru — {exam.randomize_questions ? 'Karışık sıra' : 'Sabit sıra'}
          </span>
        </div>

        {isBlocked ? (
          <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-400">
            <AlertCircle size={18} className="flex-shrink-0" />
            <p className="text-sm">
              Maksimum deneme sayısına ulaştınız ({exam.max_attempts}/{exam.max_attempts}).
              Bu sınav artık erişime kapalıdır.
            </p>
          </div>
        ) : (
          <button
            onClick={startExam}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-blue-600 hover:bg-blue-500
                       text-white font-semibold py-4 text-base transition-all duration-200
                       shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 active:scale-[0.99]"
          >
            <PlayCircle size={22} />
            Sınava Başla
          </button>
        )}

        {attemptsLeft === 1 && !isBlocked && (
          <p className="mt-3 text-center text-xs text-amber-500/80">
            Son deneme hakkınız. Başlamadan önce materyalleri gözden geçirmeniz önerilir.
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({
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
    <div className={`rounded-xl border p-4 text-center transition-colors
      ${highlight
        ? 'border-amber-500/30 bg-amber-500/5'
        : 'border-white/[0.07] bg-white/[0.03]'
      }`}>
      <div className="flex justify-center mb-2">{icon}</div>
      <p className={`text-xl font-bold mb-0.5 ${highlight ? 'text-amber-400' : 'text-white'}`}>
        {value}
      </p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
