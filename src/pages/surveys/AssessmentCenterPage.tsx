import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, CheckCircle2, Clock, Users, Plus, X,
  Calendar, AlertCircle, Star, Wrench, ChevronRight,
} from 'lucide-react';
import { fetchAllAssignments, submitResponse, fetchTemplates } from '@/features/survey/api';
import { SurveyRenderer } from '@/features/survey/components/SurveyRenderer';
import { SurveyBuilder } from '@/features/survey/components/SurveyBuilder';
import type { FullSurveyContext, SurveyAnswers, SurveyTemplateRow } from '@/shared/types/survey';

type Tab = 'pending' | 'completed' | 'team';

const MODULE_COLORS: Record<string, string> = {
  TALENT:     'bg-sky-500/20 text-sky-300 border-sky-500/30',
  QAIP:       'bg-violet-500/20 text-violet-300 border-violet-500/30',
  ENGAGEMENT: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  GENERAL:    'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

const STATUS_CONFIG = {
  PENDING:     { label: 'Bekliyor',    cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  IN_PROGRESS: { label: 'Devam Ediyor', cls: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  COMPLETED:   { label: 'Tamamlandı',  cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  CANCELLED:   { label: 'İptal',       cls: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
};

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-rose-400';
  return (
    <div className={`flex items-center gap-1 ${color}`}>
      <Star className="w-3 h-3" />
      <span className="text-sm font-bold font-mono">{Math.round(score)}</span>
    </div>
  );
}

function AssignmentCard({
  ctx,
  onClick,
}: {
  ctx: FullSurveyContext;
  onClick: () => void;
}) {
  const status = STATUS_CONFIG[ctx.status] ?? STATUS_CONFIG.PENDING;
  const moduleColor = MODULE_COLORS[ctx.template.module] ?? MODULE_COLORS.GENERAL;
  const isActionable = ctx.status === 'PENDING' || ctx.status === 'IN_PROGRESS';
  const overdue = ctx.due_date && new Date(ctx.due_date) < new Date() && ctx.status !== 'COMPLETED';

  return (
    <motion.div
      layout
      whileHover={isActionable ? { y: -2 } : {}}
      className={`relative rounded-2xl border p-5 transition-all ${
        isActionable
          ? 'bg-slate-900/70 border-white/10 hover:border-sky-500/30 cursor-pointer hover:shadow-lg hover:shadow-sky-900/10'
          : 'bg-slate-900/40 border-white/6 opacity-80'
      }`}
      onClick={isActionable ? onClick : undefined}
    >
      {overdue && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-rose-500/20 border border-rose-500/30 rounded-full px-2 py-0.5">
          <AlertCircle className="w-3 h-3 text-rose-400" />
          <span className="text-[9px] text-rose-400 font-semibold">Gecikmiş</span>
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${moduleColor}`}>
          <ClipboardList className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white text-sm font-semibold truncate">{ctx.template.title}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold uppercase tracking-wide ${moduleColor}`}>
              {ctx.template.module}
            </span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${status.cls}`}>
              {status.label}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Users className="w-3 h-3" />
          <span className="truncate text-slate-400">
            {ctx.template.schema?.sections?.length ?? 0} bölüm ·{' '}
            {ctx.template.schema?.sections?.reduce((s, sec) => s + sec.questions.length, 0) ?? 0} soru
          </span>
        </div>
        {ctx.due_date && (
          <div className={`flex items-center gap-2 text-xs ${overdue ? 'text-rose-400' : 'text-slate-500'}`}>
            <Calendar className="w-3 h-3" />
            <span>Son tarih: {new Date(ctx.due_date).toLocaleDateString('tr-TR')}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/6">
        {ctx.response ? (
          <ScoreBadge score={ctx.response.score_total} />
        ) : (
          <span className="text-[10px] text-slate-600">Yanıt yok</span>
        )}
        {isActionable && (
          <div className="flex items-center gap-1 text-sky-400 text-xs font-medium">
            <span>Başla</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        )}
        {ctx.status === 'COMPLETED' && ctx.response && (
          <div className="text-[10px] text-slate-500">
            {ctx.response.submitted_at
              ? new Date(ctx.response.submitted_at).toLocaleDateString('tr-TR')
              : ''}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  const messages: Record<Tab, { icon: React.ReactNode; text: string; sub: string }> = {
    pending:   { icon: <Clock className="w-10 h-10 opacity-30" />, text: 'Bekleyen anket yok', sub: 'Yeni bir görevlendirme geldiğinde burada görünür.' },
    completed: { icon: <CheckCircle2 className="w-10 h-10 opacity-30" />, text: 'Henüz tamamlanan yok', sub: 'Tamamladığınız anketler burada listelenir.' },
    team:      { icon: <Users className="w-10 h-10 opacity-30" />, text: 'Ekip değerlendirmesi yok', sub: 'Denetçi olarak atandığınız anketler burada görünür.' },
  };
  const m = messages[tab];
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
      {m.icon}
      <p className="text-sm font-medium mt-3">{m.text}</p>
      <p className="text-xs mt-1 opacity-70">{m.sub}</p>
    </div>
  );
}

export default function AssessmentCenterPage() {
  const [tab, setTab] = useState<Tab>('pending');
  const [contexts, setContexts] = useState<FullSurveyContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCtx, setActiveCtx] = useState<FullSurveyContext | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllAssignments();
      setContexts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (answers: SurveyAnswers, score: number) => {
    if (!activeCtx) return;
    await submitResponse({ assignment_id: activeCtx.id, answers, score_total: score });
    setSubmitted(activeCtx.id);
    setActiveCtx(null);
    await load();
  };

  const filtered = contexts.filter((c) => {
    if (tab === 'pending')   return c.status === 'PENDING' || c.status === 'IN_PROGRESS';
    if (tab === 'completed') return c.status === 'COMPLETED';
    if (tab === 'team')      return true;
    return false;
  });

  const pendingCount   = contexts.filter((c) => c.status === 'PENDING' || c.status === 'IN_PROGRESS').length;
  const completedCount = contexts.filter((c) => c.status === 'COMPLETED').length;

  const TABS: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'pending',   label: 'Bekleyen',     icon: <Clock className="w-3.5 h-3.5" />,        count: pendingCount },
    { id: 'completed', label: 'Tamamlanan',   icon: <CheckCircle2 className="w-3.5 h-3.5" />, count: completedCount },
    { id: 'team',      label: 'Ekip Görünümü',icon: <Users className="w-3.5 h-3.5" />,        count: contexts.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-800 font-bold text-lg">Değerlendirme Merkezi</h2>
          <p className="text-slate-500 text-sm mt-0.5">Anket görevlendirmelerinizi yönetin</p>
        </div>
        <button
          onClick={() => setShowBuilder(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-all border border-white/10"
        >
          <Wrench className="w-3.5 h-3.5" />
          Anket Oluştur
        </button>
      </div>

      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700"
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          Anket başarıyla gönderildi!
        </motion.div>
      )}

      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-sm">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.icon}
            {t.label}
            {t.count !== undefined && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                tab === t.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-rose-500 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((ctx) => (
              <AssignmentCard
                key={ctx.id}
                ctx={ctx}
                onClick={() => setActiveCtx(ctx)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {activeCtx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <SurveyRenderer
                schema={activeCtx.template.schema}
                templateTitle={activeCtx.template.title}
                showScore={false}
                onSubmit={handleSubmit}
                onCancel={() => setActiveCtx(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBuilder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="w-full max-w-5xl h-[85vh] flex flex-col"
            >
              <SurveyBuilder
                onSave={async () => { setShowBuilder(false); await load(); }}
                onCancel={() => setShowBuilder(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
