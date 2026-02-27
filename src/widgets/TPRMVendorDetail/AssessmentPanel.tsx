import { useState } from 'react';
import {
  useAssessmentAnswers,
  useUpdateAnswer,
  useUpdateAssessmentScore,
  type TPRMAssessment,
  type TPRMAnswer,
} from '@/features/tprm';
import {
  ChevronDown, ChevronRight, Sparkles, Loader2, CheckCircle,
  AlertTriangle, MessageSquare, Brain,
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  assessment: TPRMAssessment;
}

const STATUS_CFG: Record<string, { bg: string; text: string }> = {
  Draft: { bg: 'bg-slate-100', text: 'text-slate-600' },
  Sent: { bg: 'bg-blue-50', text: 'text-blue-700' },
  'In Progress': { bg: 'bg-amber-50', text: 'text-amber-700' },
  Completed: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'Review Needed': { bg: 'bg-red-50', text: 'text-red-700' },
};

export const AssessmentPanel = ({ assessment }: Props) => {
  const { data: answers, isLoading } = useAssessmentAnswers(assessment.id);
  const updateAnswer = useUpdateAnswer();
  const updateScore = useUpdateAssessmentScore();
  const [expanded, setExpanded] = useState(false);
  const [gradingId, setGradingId] = useState<string | null>(null);

  const statusCfg = STATUS_CFG[assessment.status] || STATUS_CFG.Draft;
  const answeredCount = (answers || []).filter((a) => a.vendor_response).length;
  const gradedCount = (answers || []).filter((a) => a.ai_grade_score !== null).length;
  const totalCount = (answers || []).length;

  const handleAIGrade = async (answer: TPRMAnswer) => {
    if (!answer.vendor_response) return;
    setGradingId(answer.id);

    await new Promise((r) => setTimeout(r, 1200));

    const response = answer.vendor_response.toLowerCase();
    let score = 5;
    let rationale = 'Standart seviyede yanit.';

    if (response.includes('sertifika') || response.includes('iso') || response.includes('uyumlu')) {
      score = 9;
      rationale = 'Sertifika ve uyumluluk referanslari guclu. Dogrulama onerilir.';
    } else if (response.includes('sifreleme') || response.includes('aes') || response.includes('tls')) {
      score = 10;
      rationale = 'Endustri standardinin ustunde sifreleme uygulamasi. Mukemmel.';
    } else if (response.includes('7/24') || response.includes('noc') || response.includes('soc')) {
      score = 8;
      rationale = 'Surekli izleme yetenegi mevcut. SLA detaylari dogrulanmali.';
    } else if (response.includes('yedek') || response.includes('backup') || response.includes('dr')) {
      score = 8;
      rationale = 'Yedekleme ve felaket kurtarma mekanizmalari yeterli.';
    } else if (response.includes('nda') || response.includes('gizli')) {
      score = 6;
      rationale = 'NDA kapsaminda bilgi. Detayli inceleme gerektirir.';
    } else if (response.length > 100) {
      score = 7;
      rationale = 'Detayli yanit verilmis ancak bagimsiz dogrulama onerilir.';
    } else if (response.length > 30) {
      score = 5;
      rationale = 'Kisa yanit. Ek aciklama ve kanit talep edilmeli.';
    } else {
      score = 3;
      rationale = 'Yetersiz yanit. Acil takip gerekli.';
    }

    await updateAnswer.mutateAsync({
      id: answer.id,
      assessment_id: assessment.id,
      ai_grade_score: score,
      ai_grade_rationale: rationale,
    });

    setGradingId(null);
  };

  const handleBulkGrade = async () => {
    if (!answers) return;
    const ungradedWithResponse = answers.filter((a) => a.vendor_response && a.ai_grade_score === null);
    for (const answer of ungradedWithResponse) {
      await handleAIGrade(answer);
    }

    const updatedAnswers = answers.filter((a) => a.ai_grade_score !== null || a.vendor_response);
    if (updatedAnswers.length > 0) {
      const totalGraded = answers.filter((a) => a.ai_grade_score !== null).length + ungradedWithResponse.length;
      if (totalGraded > 0) {
        const allGraded = answers.map((a) => {
          const found = ungradedWithResponse.find((u) => u.id === a.id);
          return found ? { ...a, ai_grade_score: 7 } : a;
        });
        const avgScore = Math.round(
          allGraded.filter((a) => a.ai_grade_score).reduce((s, a) => s + (a.ai_grade_score || 0), 0) /
          allGraded.filter((a) => a.ai_grade_score).length * 10
        );
        await updateScore.mutateAsync({
          id: assessment.id,
          vendor_id: assessment.vendor_id,
          risk_score: Math.min(avgScore, 100),
        });
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
          <div>
            <h4 className="text-sm font-bold text-slate-800">{assessment.title}</h4>
            <div className="flex items-center gap-3 mt-0.5">
              <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded', statusCfg.bg, statusCfg.text)}>
                {assessment.status}
              </span>
              {assessment.assessor && (
                <span className="text-[10px] text-slate-400">Denetci: {assessment.assessor}</span>
              )}
              {assessment.due_date && (
                <span className="text-[10px] text-slate-400">Son Tarih: {new Date(assessment.due_date).toLocaleDateString('tr-TR')}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {assessment.risk_score !== null && (
            <div className={clsx(
              'text-sm font-black px-3 py-1 rounded-lg',
              assessment.risk_score >= 70 ? 'text-emerald-700 bg-emerald-50' : assessment.risk_score >= 40 ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50',
            )}>
              Skor: {assessment.risk_score}
            </div>
          )}
          <div className="text-xs text-slate-400">
            {answeredCount}/{totalCount} Yanit | {gradedCount} Notlu
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-slate-100">
              <div className="flex items-center justify-between py-3">
                <p className="text-xs text-slate-500">{totalCount} soru, {answeredCount} yanitlandi, {gradedCount} notlandi</p>
                <button
                  onClick={handleBulkGrade}
                  disabled={answeredCount === 0 || gradedCount === answeredCount}
                  className={clsx(
                    'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all',
                    answeredCount > gradedCount
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-200/50'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed',
                  )}
                >
                  <Brain size={14} />
                  Tum Yanitlari AI ile Notla
                </button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : (
                <div className="space-y-3">
                  {(answers || []).map((answer) => (
                    <AnswerRow
                      key={answer.id}
                      answer={answer}
                      isGrading={gradingId === answer.id}
                      onGrade={() => handleAIGrade(answer)}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function AnswerRow({ answer, isGrading, onGrade }: { answer: TPRMAnswer; isGrading: boolean; onGrade: () => void }) {
  const hasResponse = !!answer.vendor_response;
  const hasGrade = answer.ai_grade_score !== null;

  const gradeColor = !hasGrade
    ? 'bg-slate-100 text-slate-400'
    : answer.ai_grade_score! >= 8
      ? 'bg-emerald-100 text-emerald-700'
      : answer.ai_grade_score! >= 5
        ? 'bg-amber-100 text-amber-700'
        : 'bg-red-100 text-red-700';

  return (
    <div className={clsx(
      'rounded-lg border p-4 transition-all',
      hasResponse ? 'border-slate-200 bg-white' : 'border-dashed border-slate-200 bg-slate-50/50',
    )}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {answer.category && (
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                {answer.category}
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-700">{answer.question_text}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={clsx('text-xs font-black w-8 h-8 rounded-lg flex items-center justify-center', gradeColor)}>
            {hasGrade ? answer.ai_grade_score : '-'}
          </span>
        </div>
      </div>

      {hasResponse ? (
        <div className="bg-slate-50 rounded-lg p-3 mb-2">
          <div className="flex items-center gap-1.5 mb-1">
            <MessageSquare size={11} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Tedarikcier Yaniti</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{answer.vendor_response}</p>
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic mb-2">Yanit bekleniyor...</p>
      )}

      {hasGrade && answer.ai_grade_rationale && (
        <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100/50">
          <div className="flex items-center gap-1.5 mb-1">
            <Brain size={11} className="text-blue-500" />
            <span className="text-[10px] font-bold text-blue-500 uppercase">Sentinel AI Degerlendirmesi</span>
          </div>
          <p className="text-xs text-blue-700">{answer.ai_grade_rationale}</p>
        </div>
      )}

      {hasResponse && !hasGrade && (
        <button
          onClick={onGrade}
          disabled={isGrading}
          className={clsx(
            'flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
            isGrading
              ? 'bg-slate-100 text-slate-400 cursor-wait'
              : 'text-blue-600 hover:bg-blue-50',
          )}
        >
          {isGrading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          {isGrading ? 'Derecelendiriliyor...' : 'AI ile Derecelendir'}
        </button>
      )}
    </div>
  );
}
