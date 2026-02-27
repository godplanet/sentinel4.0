import { useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useExamStore } from '../../store/examStore';
import { fetchExamWithCourse, fetchExamQuestions, fetchUserAttemptCount } from '../../api/examApi';
import { ExamIntro } from './ExamIntro';
import { QuestionViewer } from './QuestionViewer';
import { ExamResult } from './ExamResult';

interface ExamRunnerProps {
  examId: string;
  userId: string;
  onBack?: () => void;
}

export function ExamRunner({ examId, userId, onBack }: ExamRunnerProps) {
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  const phase   = useExamStore((s) => s.phase);
  const setExam = useExamStore((s) => s.setExam);
  const reset   = useExamStore((s) => s.reset);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [exam, questions, attempts] = await Promise.all([
          fetchExamWithCourse(examId),
          fetchExamQuestions(examId),
          fetchUserAttemptCount(examId, userId),
        ]);

        if (cancelled) return;

        if (!exam) {
          setError('Sınav bulunamadı veya erişim kapalı.');
          setLoading(false);
          return;
        }

        const shuffled = exam.randomize_questions
          ? await fetchExamQuestions(examId, true)
          : questions;

        setExam(exam, shuffled);
        setAttemptCount(attempts);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Sınav yüklenirken bir hata oluştu.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
      reset();
    };
  }, [examId, userId, setExam, reset]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070c18] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-blue-500 animate-spin" />
          <p className="text-slate-500 text-sm">Sınav yükleniyor…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#070c18] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center">
          <AlertCircle size={40} className="text-rose-400 mx-auto mb-4" />
          <h2 className="text-white font-semibold text-lg mb-2">Sınav Yüklenemedi</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button
            onClick={onBack}
            className="px-6 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white
                       text-sm font-medium transition-colors"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'intro') {
    return <ExamIntro attemptCount={attemptCount} />;
  }

  if (phase === 'running') {
    return <QuestionViewer userId={userId} />;
  }

  return (
    <ExamResult
      onRetry={() => {
        reset();
        window.location.reload();
      }}
      onBack={onBack}
    />
  );
}

export { ExamIntro } from './ExamIntro';
export { QuestionViewer } from './QuestionViewer';
export { ExamResult } from './ExamResult';
