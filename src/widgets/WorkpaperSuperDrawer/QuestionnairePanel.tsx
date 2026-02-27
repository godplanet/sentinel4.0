import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Plus, Send, X, CheckCircle2, Clock, AlertTriangle,
  Loader2, Play, Eye, Sparkles,
} from 'lucide-react';
import clsx from 'clsx';
import type {
  Questionnaire, QuestionnaireQuestion, QuestionnaireStatus,
} from '@/entities/workpaper/model/detail-types';

interface QuestionnairePanelProps {
  questionnaires: Questionnaire[];
  loading: boolean;
  onCreateQuestionnaire: (title: string, questions: QuestionnaireQuestion[], sentTo: string) => Promise<void>;
  onSimulateResponse: (questionnaireId: string, questions: QuestionnaireQuestion[]) => Promise<void>;
  onMarkReviewed: (questionnaireId: string) => Promise<void>;
}

const STATUS_CONFIG: Record<QuestionnaireStatus, { label: string; icon: typeof Clock; color: string; bg: string; border: string }> = {
  Sent: { label: 'Gonderildi', icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  Responded: { label: 'Yanitlandi', icon: CheckCircle2, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  Reviewed: { label: 'Incelendi', icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
};

function generateId(): string {
  return crypto.randomUUID();
}

export function QuestionnairePanel({
  questionnaires, loading, onCreateQuestionnaire, onSimulateResponse, onMarkReviewed,
}: QuestionnairePanelProps) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [title, setTitle] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [questions, setQuestions] = useState<QuestionnaireQuestion[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [simulatingId, setSimulatingId] = useState<string | null>(null);

  const addQuestion = (type: 'yesno' | 'text') => {
    setQuestions(prev => [...prev, {
      id: generateId(),
      question: '',
      type,
      answer: null,
    }]);
  };

  const updateQuestion = (idx: number, text: string) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, question: text } : q));
  };

  const removeQuestion = (idx: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !sentTo.trim() || questions.length === 0) return;
    const validQuestions = questions.filter(q => q.question.trim());
    if (validQuestions.length === 0) return;

    setSubmitting(true);
    try {
      await onCreateQuestionnaire(title.trim(), validQuestions, sentTo.trim());
      setTitle('');
      setSentTo('');
      setQuestions([]);
      setShowBuilder(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulate = async (q: Questionnaire) => {
    setSimulatingId(q.id);
    await new Promise(resolve => setTimeout(resolve, 800));

    const answered = q.questions_json.map(question => ({
      ...question,
      answer: question.type === 'yesno'
        ? (Math.random() > 0.3 ? 'Evet' : 'Hayir')
        : 'Ilgili surec uygun sekilde yurutulmektedir. Detaylar ekte sunulmustur.',
    }));

    try {
      await onSimulateResponse(q.id, answered);
    } finally {
      setSimulatingId(null);
    }
  };

  const hasRiskyAnswers = (questions: QuestionnaireQuestion[]): boolean => {
    return questions.some(q => q.type === 'yesno' && q.answer === 'Hayir');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600 mr-2" size={18} />
        <span className="text-xs text-slate-500">Yukleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <ClipboardList size={12} />
          Anketler ({questionnaires.length})
        </h4>
      </div>

      {questionnaires.map((q) => {
        const cfg = STATUS_CONFIG[q.status as QuestionnaireStatus];
        const StatusIcon = cfg.icon;
        const isExpanded = expandedId === q.id;
        const risky = q.status !== 'Sent' && hasRiskyAnswers(q.questions_json);

        return (
          <div
            key={q.id}
            className={clsx(
              'border rounded-xl overflow-hidden transition-all',
              risky ? 'border-red-200 bg-red-50/30' : `${cfg.border} ${cfg.bg}/30`
            )}
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : q.id)}
              className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-white/50 transition-colors"
            >
              <div className={clsx('p-1.5 rounded-lg shrink-0', cfg.bg)}>
                <StatusIcon size={14} className={cfg.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{q.title}</p>
                <p className="text-[10px] text-slate-500">
                  {q.sent_to} - {q.questions_json.length} soru
                </p>
              </div>
              <span className={clsx(
                'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                cfg.bg, cfg.color, cfg.border
              )}>
                {cfg.label}
              </span>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-3.5 pb-3.5 space-y-2.5">
                    {q.questions_json.map((question, idx) => (
                      <div
                        key={question.id}
                        className={clsx(
                          'p-3 rounded-lg border',
                          question.answer === 'Hayir'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-white border-slate-200'
                        )}
                      >
                        <p className="text-xs font-semibold text-slate-700 mb-1.5">
                          {idx + 1}. {question.question}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {question.type === 'yesno' ? 'Evet/Hayir' : 'Metin'}
                          </span>
                          {question.answer ? (
                            <span className={clsx(
                              'text-[11px] font-semibold px-2 py-0.5 rounded',
                              question.answer === 'Hayir'
                                ? 'bg-red-100 text-red-700'
                                : question.answer === 'Evet'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-blue-100 text-blue-700'
                            )}>
                              {question.answer.length > 60
                                ? question.answer.slice(0, 60) + '...'
                                : question.answer
                              }
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Yanit bekleniyor</span>
                          )}
                        </div>
                      </div>
                    ))}

                    {risky && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertTriangle size={14} className="text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-red-800">Sentinel Uyarisi</p>
                          <p className="text-[11px] text-red-700 mt-0.5">
                            "Hayir" yanitlari tespit edildi. Bu kontroller icin bulgu olusturulmasi onerilir.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      {q.status === 'Sent' && (
                        <button
                          onClick={() => handleSimulate(q)}
                          disabled={simulatingId === q.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-white text-[11px] font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
                        >
                          {simulatingId === q.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Play size={12} />
                          )}
                          Debug: Yanit Simulasyonu
                        </button>
                      )}
                      {q.status === 'Responded' && (
                        <button
                          onClick={() => onMarkReviewed(q.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-[11px] font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          <Eye size={12} />
                          Incelendi Isaretle
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {showBuilder ? (
        <div className="border border-blue-200 bg-blue-50/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-blue-600" />
              <span className="text-xs font-bold text-slate-700">Yeni Anket Olustur</span>
            </div>
            <button onClick={() => { setShowBuilder(false); setQuestions([]); setTitle(''); setSentTo(''); }}
              className="p-1 hover:bg-slate-100 rounded transition-colors">
              <X size={12} className="text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Anket Basligi</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="orn. IT Kontrol Anketi"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Gonderilecek Birim</label>
              <input
                type="text"
                value={sentTo}
                onChange={(e) => setSentTo(e.target.value)}
                placeholder="orn. IT Muduru"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            {questions.map((q, idx) => (
              <div key={q.id} className="flex items-start gap-2">
                <span className="text-[10px] font-bold text-slate-400 mt-2.5 w-4 shrink-0">{idx + 1}.</span>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(idx, e.target.value)}
                  placeholder={q.type === 'yesno' ? 'Evet/Hayir sorusu...' : 'Metin sorusu...'}
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <span className={clsx(
                  'shrink-0 text-[9px] font-bold px-1.5 py-2 rounded',
                  q.type === 'yesno' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                )}>
                  {q.type === 'yesno' ? 'E/H' : 'TXT'}
                </span>
                <button
                  onClick={() => removeQuestion(idx)}
                  className="shrink-0 p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => addQuestion('yesno')}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <Plus size={10} />
              Evet/Hayir
            </button>
            <button
              onClick={() => addQuestion('text')}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus size={10} />
              Metin
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !sentTo.trim() || questions.filter(q => q.question.trim()).length === 0 || submitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              Gonder
            </button>
            <button
              onClick={() => { setShowBuilder(false); setQuestions([]); setTitle(''); setSentTo(''); }}
              className="px-4 py-2 text-slate-600 text-xs font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Iptal
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowBuilder(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-xs font-medium text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
        >
          <Plus size={14} />
          Yeni Anket Gonder
        </button>
      )}
    </div>
  );
}
