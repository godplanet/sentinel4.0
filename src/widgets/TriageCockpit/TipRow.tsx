import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronUp, Shield, Eye, Radio,
  User, Calendar, Hash, Banknote, FileText,
  AlertTriangle, Tag,
} from 'lucide-react';
import clsx from 'clsx';
import type { WhistleblowerTip, TipAnalysis } from '@/features/investigation/types';
import {
  CHANNEL_LABELS, CATEGORY_LABELS, STATUS_LABELS,
} from '@/features/investigation/types';

interface TipRowProps {
  tip: WhistleblowerTip;
  analysis: TipAnalysis | null;
  onStatusChange: (tipId: string, status: string) => void;
}

const CHANNEL_ICONS: Record<string, typeof Shield> = {
  WEB: Shield,
  TOR_ONION: Eye,
  SIGNAL_MOCK: Radio,
};

const CATEGORY_COLORS: Record<string, string> = {
  CRITICAL_FRAUD: 'bg-red-100 text-red-700 border-red-200',
  HR_CULTURE: 'bg-amber-100 text-amber-700 border-amber-200',
  SPAM: 'bg-slate-100 text-slate-500 border-slate-200',
};

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  INVESTIGATING: 'bg-amber-100 text-amber-700',
  ESCALATED: 'bg-red-100 text-red-700',
  DISMISSED: 'bg-slate-100 text-slate-500',
  CLOSED: 'bg-emerald-100 text-emerald-700',
};

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-slate-500">{label}</span>
        <span className={clsx('text-[10px] font-bold', color)}>{value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={clsx('h-full rounded-full', color.replace('text-', 'bg-'))}
        />
      </div>
    </div>
  );
}

export function TipRow({ tip, analysis, onStatusChange }: TipRowProps) {
  const [expanded, setExpanded] = useState(false);
  const isCritical = tip.ai_credibility_score > 80;
  const ChannelIcon = CHANNEL_ICONS[tip.channel] || Shield;

  return (
    <div className={clsx(
      'bg-white border rounded-xl overflow-hidden transition-all',
      isCritical ? 'border-red-200 shadow-sm shadow-red-100' : 'border-slate-200',
    )}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50/50 transition-colors"
      >
        <div className={clsx(
          'relative w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-black text-sm',
          tip.ai_credibility_score > 80
            ? 'bg-red-100 text-red-700'
            : tip.ai_credibility_score > 40
              ? 'bg-amber-100 text-amber-700'
              : 'bg-slate-100 text-slate-500',
        )}>
          {Math.round(tip.ai_credibility_score)}
          {isCritical && (
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-400">{tip.tracking_code}</span>
            <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded border', CATEGORY_COLORS[tip.triage_category])}>
              {CATEGORY_LABELS[tip.triage_category as keyof typeof CATEGORY_LABELS]}
            </span>
            <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded', STATUS_COLORS[tip.status])}>
              {STATUS_LABELS[tip.status as keyof typeof STATUS_LABELS]}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 line-clamp-1">{tip.content}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 text-slate-400">
            <ChannelIcon size={12} />
            <span className="text-[10px]">{CHANNEL_LABELS[tip.channel as keyof typeof CHANNEL_LABELS]}</span>
          </div>
          <span className="text-[10px] text-slate-400">
            {new Date(tip.submitted_at).toLocaleDateString('tr-TR')}
          </span>
          {expanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
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
            <div className="px-4 pb-4 space-y-4 border-t border-slate-100 pt-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <span className="text-[10px] font-bold text-slate-500 block mb-1.5">Bildirim Icerigi</span>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{tip.content}</p>
              </div>

              {analysis && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-500">AI Analiz Skorlari</span>
                    <ScoreBar label="Ozgulluk (Specificity)" value={analysis.specificity_index} color="text-blue-600" />
                    <ScoreBar label="Kanit Yogunlugu (Evidence)" value={analysis.evidence_density} color="text-emerald-600" />
                    <ScoreBar label="Duygusal Kararsizlik (Emotion)" value={analysis.emotional_score} color="text-red-500" />
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <span className="text-[10px] text-slate-500">Formul: (0.5 x Ozgulluk) + (0.3 x Kanit) - (0.2 x Duygu)</span>
                      <span className="text-xs font-bold text-slate-900 block mt-0.5">
                        = ({(0.5 * analysis.specificity_index).toFixed(1)}) + ({(0.3 * analysis.evidence_density).toFixed(1)}) - ({(0.2 * analysis.emotional_score).toFixed(1)}) = {tip.ai_credibility_score.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500">Cikarilan Varliklar</span>
                    <EntityList icon={User} label="Isimler" items={analysis.extracted_entities?.names} />
                    <EntityList icon={Calendar} label="Tarihler" items={analysis.extracted_entities?.dates} />
                    <EntityList icon={Banknote} label="Tutarlar" items={analysis.extracted_entities?.amounts} />
                    <EntityList icon={Hash} label="IBAN" items={analysis.extracted_entities?.ibans} />
                    <EntityList icon={FileText} label="Fatura No" items={analysis.extracted_entities?.invoice_numbers} />
                    <EntityList icon={Tag} label="Anahtar Kelimeler" items={analysis.extracted_entities?.keywords_matched} />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] text-slate-500 mr-2">Durum Degistir:</span>
                {(['NEW', 'INVESTIGATING', 'ESCALATED', 'DISMISSED', 'CLOSED'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => onStatusChange(tip.id, s)}
                    className={clsx(
                      'text-[10px] font-bold px-2 py-1 rounded transition-all',
                      tip.status === s
                        ? STATUS_COLORS[s] + ' ring-1 ring-offset-1 ring-current'
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100',
                    )}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
                {tip.assigned_unit && (
                  <span className="ml-auto text-[10px] text-slate-400 flex items-center gap-1">
                    <AlertTriangle size={10} />
                    Atanan Birim: <strong className="text-slate-600">{tip.assigned_unit}</strong>
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EntityList({ icon: Icon, label, items }: { icon: typeof User; label: string; items?: string[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="flex items-start gap-2">
      <Icon size={12} className="text-slate-400 mt-0.5 shrink-0" />
      <div>
        <span className="text-[10px] text-slate-400 block">{label}</span>
        <div className="flex flex-wrap gap-1 mt-0.5">
          {items.map((item, i) => (
            <span key={i} className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
