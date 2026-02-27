import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, CheckCircle2, XCircle, Filter,
  ChevronDown, ChevronRight, Loader2, Ban, ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';
import type { ProbeException, ExceptionStatus, Probe } from '@/entities/probe/model/types';
import { analyzeException, type AIForensicInsight } from '@/shared/api/sentinel-ai';
import { SentinelInsightCard } from '@/features/ai-forensic';

interface ExceptionQueueProps {
  exceptions: ProbeException[];
  probes: Probe[];
  loading: boolean;
  onStatusChange: (id: string, status: ExceptionStatus, notes?: string) => void;
  onCreateFinding?: (exception: ProbeException, insight: AIForensicInsight) => void;
}

const STATUS_CONFIG: Record<ExceptionStatus, { label: string; color: string; bg: string; border: string; icon: typeof AlertTriangle }> = {
  OPEN: { label: 'Acik', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle },
  REMEDIED: { label: 'Giderildi', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2 },
  FALSE_POSITIVE: { label: 'Yanlis Alarm', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: XCircle },
  ESCALATED: { label: 'Eskalasyon', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: ArrowUpRight },
};

const FILTER_OPTIONS: (ExceptionStatus | 'ALL')[] = ['ALL', 'OPEN', 'REMEDIED', 'FALSE_POSITIVE', 'ESCALATED'];

export function ExceptionQueue({ exceptions, probes, loading, onStatusChange, onCreateFinding }: ExceptionQueueProps) {
  const [filterStatus, setFilterStatus] = useState<ExceptionStatus | 'ALL'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [insights, setInsights] = useState<Map<string, AIForensicInsight>>(new Map());

  const probeMap = new Map(probes.map(p => [p.id, p]));

  const filtered = filterStatus === 'ALL'
    ? exceptions
    : exceptions.filter(e => e.status === filterStatus);

  const openCount = exceptions.filter(e => e.status === 'OPEN').length;

  const handleAction = (id: string, status: ExceptionStatus) => {
    onStatusChange(id, status, noteText || undefined);
    setNoteText('');
    setExpandedId(null);
  };

  const handleAIAnalyze = async (exc: ProbeException) => {
    setAnalyzingId(exc.id);
    try {
      const probe = probeMap.get(exc.probe_id);
      const insight = await analyzeException(
        exc.data_payload,
        probe?.title,
        probe?.category,
      );
      setInsights(prev => new Map(prev).set(exc.id, insight));
    } catch {
      /* silent */
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleInsightAction = (exc: ProbeException, insight: AIForensicInsight) => {
    switch (insight.suggested_action) {
      case 'CREATE_FINDING':
        onCreateFinding?.(exc, insight);
        handleAction(exc.id, 'ESCALATED');
        break;
      case 'ESCALATE':
        handleAction(exc.id, 'ESCALATED');
        break;
      case 'DISMISS':
        handleAction(exc.id, 'FALSE_POSITIVE');
        break;
      default:
        break;
    }
    setInsights(prev => { const n = new Map(prev); n.delete(exc.id); return n; });
  };

  const dismissInsight = (excId: string) => {
    setInsights(prev => { const n = new Map(prev); n.delete(excId); return n; });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 mr-2" size={20} />
        <span className="text-sm text-slate-500">Istisnalar yukleniyor...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-xl">
            <AlertTriangle size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Istisna Kuyrugu</h3>
            <p className="text-xs text-slate-500">
              {openCount} acik istisna inceleme bekliyor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setFilterStatus(opt)}
                className={clsx(
                  'px-2.5 py-1 text-[10px] font-bold rounded-md transition-all',
                  filterStatus === opt
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {opt === 'ALL' ? 'Tumu' : STATUS_CONFIG[opt].label}
                {opt === 'OPEN' && openCount > 0 && (
                  <span className="ml-1 bg-red-100 text-red-700 px-1 rounded text-[9px]">{openCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center">
          <CheckCircle2 className="mx-auto text-emerald-300 mb-3" size={36} />
          <p className="text-sm text-slate-500 font-medium">Bu kategoride istisna bulunmuyor</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filtered.map((exc) => {
            const cfg = STATUS_CONFIG[exc.status];
            const StatusIcon = cfg.icon;
            const probe = probeMap.get(exc.probe_id);
            const isExpanded = expandedId === exc.id;
            const payload = exc.data_payload;
            const isAnalyzing = analyzingId === exc.id;
            const insight = insights.get(exc.id);

            return (
              <motion.div
                key={exc.id}
                layout
                className="group"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : exc.id)}
                  className="px-6 py-3.5 flex items-center gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                >
                  <div className={clsx('p-1.5 rounded-lg', cfg.bg)}>
                    <StatusIcon size={14} className={cfg.color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {payload.description || 'Istisna tespit edildi'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      {probe && <span className="font-medium text-slate-600">{probe.title}</span>}
                      <span className="text-slate-300">|</span>
                      {payload.account_id && (
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{payload.account_id}</span>
                      )}
                      {payload.amount && (
                        <>
                          <span className="text-slate-300">|</span>
                          <span className="font-bold text-slate-700">
                            {Number(payload.amount).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <span className={clsx(
                    'shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-lg border',
                    cfg.bg, cfg.color, cfg.border
                  )}>
                    {cfg.label}
                  </span>

                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {new Date(exc.created_at).toLocaleDateString('tr-TR')}
                  </span>

                  {isExpanded ? (
                    <ChevronDown size={16} className="text-slate-400 shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="text-slate-400 shrink-0" />
                  )}
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 pt-1 space-y-3 bg-slate-50/50">
                        <div className="bg-slate-900 text-slate-300 font-mono text-xs p-3 rounded-lg overflow-x-auto">
                          <pre>{JSON.stringify(payload, null, 2)}</pre>
                        </div>

                        {exc.notes && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-xs text-amber-800"><strong>Not:</strong> {exc.notes}</p>
                          </div>
                        )}

                        <AnimatePresence>
                          {insight && (
                            <SentinelInsightCard
                              insight={insight}
                              onAcceptAction={() => handleInsightAction(exc, insight)}
                              onDismiss={() => dismissInsight(exc.id)}
                            />
                          )}
                        </AnimatePresence>

                        {exc.status === 'OPEN' && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleAIAnalyze(exc); }}
                                disabled={isAnalyzing || !!insight}
                                className={clsx(
                                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all',
                                  isAnalyzing
                                    ? 'bg-blue-50 text-blue-500 cursor-not-allowed border border-blue-200'
                                    : insight
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                    : 'bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-700 hover:to-slate-800 shadow-sm'
                                )}
                              >
                                {isAnalyzing ? (
                                  <>
                                    <Loader2 size={13} className="animate-spin" />
                                    Sentinel Analiz Ediyor...
                                  </>
                                ) : insight ? (
                                  <>
                                    <CheckCircle2 size={13} />
                                    Analiz Tamamlandi
                                  </>
                                ) : (
                                  <>
                                    <Sparkles size={13} />
                                    AI Analiz Et
                                  </>
                                )}
                              </button>
                            </div>

                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Inceleme notu ekle (opsiyonel)..."
                              rows={2}
                              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAction(exc.id, 'REMEDIED')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                              >
                                <CheckCircle2 size={12} />
                                Giderildi
                              </button>
                              <button
                                onClick={() => handleAction(exc.id, 'FALSE_POSITIVE')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300 transition-colors"
                              >
                                <Ban size={12} />
                                Yanlis Alarm
                              </button>
                              <button
                                onClick={() => handleAction(exc.id, 'ESCALATED')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg hover:bg-amber-200 transition-colors"
                              >
                                <ArrowUpRight size={12} />
                                Eskale Et
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
