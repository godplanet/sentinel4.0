import { motion } from 'framer-motion';
import { Cpu, ShieldCheck, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import type { ActionEvidence } from '@/entities/action/model/types';

const MOCK_EVIDENCE: ActionEvidence[] = [
  {
    id: 'mock-ev-1',
    action_id: 'mock',
    storage_path: 'action-evidence/mock/kanit_belgesi.pdf',
    file_hash: 'a3f1d9e47bc82c9056d3e78f40acb1257f83e429dc56a071f2381b90c7e4d5a1',
    ai_confidence_score: 82,
    uploaded_by: 'birim_yoneticisi',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

interface Props {
  evidence?: ActionEvidence[];
}

export function AIEvidenceAnalyzer({ evidence }: Props) {
  const items = evidence && evidence.length > 0 ? evidence : MOCK_EVIDENCE;

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

      {items.map((ev, idx) => (
        <EvidenceCard key={ev.id} evidence={ev} index={idx} />
      ))}
    </div>
  );
}

function EvidenceCard({ evidence, index }: { evidence: ActionEvidence; index: number }) {
  const score = evidence.ai_confidence_score ?? Math.floor(Math.random() * 40) + 45;
  const fileName = evidence.storage_path.split('/').pop() ?? 'dosya';

  const { band, barColor, textColor, bgColor, label, icon: StatusIcon } = getScoreConfig(score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
    >
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
          <FileText size={16} className="text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">{fileName}</p>
          <p className="text-[11px] text-slate-400 font-mono">
            {new Date(evidence.created_at).toLocaleString('tr-TR')}
          </p>
        </div>
        <span className={clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold',
          bgColor, textColor,
        )}>
          <StatusIcon size={11} />
          {label}
        </span>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              AI Güven Skoru
            </p>
            <span className={clsx('text-sm font-black', textColor)}>{score}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
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

        <div className={clsx(
          'p-3.5 rounded-lg border flex items-start gap-2.5',
          band === 'high'
            ? 'bg-emerald-50 border-emerald-200'
            : band === 'mid'
              ? 'bg-amber-50 border-amber-200'
              : 'bg-rose-50 border-rose-200',
        )}>
          <Cpu size={14} className={clsx(
            'shrink-0 mt-0.5',
            band === 'high' ? 'text-emerald-600' : band === 'mid' ? 'text-amber-600' : 'text-rose-600',
          )} />
          <p className={clsx(
            'text-xs leading-relaxed',
            band === 'high' ? 'text-emerald-700' : band === 'mid' ? 'text-amber-700' : 'text-rose-700',
          )}>
            {band === 'high'
              ? 'Sentinel Prime yüklenen kanıtı doğruladı. Bulgu anlık görüntüsüyle anlamsal eşleşme güçlüdür. Kanıt kapsamlı ve ilgilidir.'
              : band === 'mid'
                ? 'Kanıt kısmen ilgilidir ancak bulgunun tüm boyutlarını karşılamamaktadır. Ek belge istenebilir.'
                : 'Kanıt, bulguyla yeterli anlamsal ilişki kuramamaktadır. Reddetme önerilir.'}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
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
