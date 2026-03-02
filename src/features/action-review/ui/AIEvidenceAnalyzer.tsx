import { motion } from 'framer-motion';
import { Cpu, ShieldCheck, FileText, AlertTriangle, CheckCircle2, Play } from 'lucide-react';
import clsx from 'clsx';
import { useEvidence, type Evidence } from '@/features/action-review/api/useEvidence';

interface Props {
  actionId: string | undefined;
}

export function AIEvidenceAnalyzer({ actionId }: Props) {
  const { evidences, isLoading, analyzeEvidence, analyzeMutation, isAnalyzing } = useEvidence(actionId);
  const items = evidences;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
            <Cpu size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Sentinel Prime AI — Kanıt Analizi</p>
            <p className="text-xs text-slate-500">Yükleniyor…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
          <Cpu size={16} className="text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">Sentinel Prime AI — Kanıt Analizi</p>
          <p className="text-xs text-slate-500">{items.length} dosya analiz edildi</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-surface border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-sm">
          Bu aksiyon için henüz kanıt yüklenmemiş.
        </div>
      ) : (
        items.map((ev, idx) => (
          <EvidenceCard
            key={ev.id}
            evidence={ev}
            index={idx}
            onRunAnalysis={() => analyzeEvidence({ evidenceId: ev.id })}
            isAnalyzing={isAnalyzing && analyzeMutation.variables?.evidenceId === ev.id}
          />
        ))
      )}
    </div>
  );
}

function EvidenceCard({
  evidence,
  index,
  onRunAnalysis,
  isAnalyzing,
}: {
  evidence: Evidence;
  index: number;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
}) {
  const score = evidence.ai_confidence_score ?? 0;
  const hasScore = evidence.ai_confidence_score != null;
  const fileName = evidence.file_name || (evidence.file_url?.split('/').pop() ?? 'dosya');

  const { band, barColor, textColor, bgColor, label, icon: StatusIcon } = getScoreConfig(score);
  const summaryText =
    evidence.ai_analysis_summary ??
    (hasScore
      ? band === 'high'
        ? 'Sentinel Prime yüklenen kanıtı doğruladı. Bulgu anlık görüntüsüyle anlamsal eşleşme güçlüdür. Kanıt kapsamlı ve ilgilidir.'
        : band === 'mid'
          ? 'Kanıt kısmen ilgilidir ancak bulgunun tüm boyutlarını karşılamamaktadır. Ek belge istenebilir.'
          : 'Kanıt, bulguyla yeterli anlamsal ilişki kuramamaktadır. Reddetme önerilir.'
      : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-surface border border-slate-200 rounded-xl overflow-hidden shadow-sm"
    >
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-canvas border border-slate-200 flex items-center justify-center shrink-0">
          <FileText size={16} className="text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">{fileName}</p>
          <p className="text-[11px] text-slate-400 font-mono">
            {new Date(evidence.uploaded_at).toLocaleString('tr-TR')}
          </p>
        </div>
        {hasScore ? (
          <span
            className={clsx(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold',
              bgColor,
              textColor,
            )}
          >
            <StatusIcon size={11} />
            {label}
          </span>
        ) : (
          <button
            type="button"
            onClick={onRunAnalysis}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50"
          >
            <Play size={11} />
            {isAnalyzing ? 'Analiz ediliyor…' : 'Analizi Başlat'}
          </button>
        )}
      </div>

      <div className="px-5 py-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              AI Güven Skoru
            </p>
            {hasScore ? (
              <span className={clsx('text-sm font-black', textColor)}>{score}%</span>
            ) : (
              <span className="text-slate-400 text-sm">—</span>
            )}
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${hasScore ? score : 0}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className={clsx('h-full rounded-full', barColor)}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>0%</span>
            <span className="text-amber-500">40%</span>
            <span className="text-emerald-500">80%</span>
            <span>100%</span>
          </div>
        </div>

        {summaryText && (
          <div
            className={clsx(
              'p-3.5 rounded-lg border flex items-start gap-2.5',
              band === 'high'
                ? 'bg-emerald-50 border-emerald-200'
                : band === 'mid'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-rose-50 border-rose-200',
            )}
          >
            <Cpu
              size={14}
              className={clsx(
                'shrink-0 mt-0.5',
                band === 'high' ? 'text-emerald-600' : band === 'mid' ? 'text-amber-600' : 'text-rose-600',
              )}
            />
            <p
              className={clsx(
                'text-xs leading-relaxed',
                band === 'high' ? 'text-emerald-700' : band === 'mid' ? 'text-amber-700' : 'text-rose-700',
              )}
            >
              {summaryText}
            </p>
          </div>
        )}

        {evidence.file_hash && (
          <div className="bg-canvas border border-slate-200 rounded-lg p-3.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <ShieldCheck size={13} className="text-slate-400" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Bütünlük Mühürü — SHA-256
              </p>
            </div>
            <p className="font-mono text-[11px] text-slate-500 bg-slate-100 p-1.5 rounded break-all leading-relaxed">
              {evidence.file_hash}
            </p>
          </div>
        )}

        {evidence.review_note && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle size={12} className="text-rose-500" />
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-wider">
                Denetçi Ret Notu
              </p>
            </div>
            <p className="text-xs text-rose-700 leading-relaxed">{evidence.review_note}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function getScoreConfig(score: number) {
  if (score >= 80) {
    return {
      band: 'high' as const,
      barColor: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-100',
      label: 'Güçlü Eşleşme',
      icon: CheckCircle2,
    };
  }
  if (score >= 40) {
    return {
      band: 'mid' as const,
      barColor: 'bg-amber-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-100',
      label: 'Kısmi Eşleşme',
      icon: AlertTriangle,
    };
  }
  return {
    band: 'low' as const,
    barColor: 'bg-rose-500',
    textColor: 'text-rose-700',
    bgColor: 'bg-rose-100',
    label: 'Yetersiz',
    icon: AlertTriangle,
  };
}
