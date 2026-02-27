import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, X, Sparkles, AlertTriangle, Target, TrendingUp, Loader2, Settings } from 'lucide-react';
import { useSentinelAI } from '@/shared/hooks/useSentinelAI';
import { useNavigate } from 'react-router-dom';

interface MatrixDistribution {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
  cellMap: Record<string, number>;
  mode: 'inherent' | 'residual';
}

interface HeatmapInsightPanelProps {
  distribution: MatrixDistribution;
}

interface ParsedInsight {
  summary: string;
  concentrations: string[];
  focusAreas: string[];
  recommendation: string;
}

function parseInsight(raw: string): ParsedInsight {
  const lines = raw.split('\n').filter(Boolean);
  const concentrations: string[] = [];
  const focusAreas: string[] = [];
  let summary = '';
  let recommendation = '';
  let section: 'none' | 'concentration' | 'focus' | 'rec' = 'none';

  for (const line of lines) {
    const trimmed = line.trim();
    const lower = trimmed.toLowerCase();
    if (lower.includes('yogunlasma') || lower.includes('konsantrasyon') || lower.includes('concentration')) {
      section = 'concentration';
      continue;
    }
    if (lower.includes('odak') || lower.includes('focus') || lower.includes('alan')) {
      section = 'focus';
      continue;
    }
    if (lower.includes('oneri') || lower.includes('tavsiye') || lower.includes('recommendation')) {
      section = 'rec';
      continue;
    }

    const cleaned = trimmed.replace(/^[-*\d.)\]]+\s*/, '');
    if (!cleaned) continue;

    if (section === 'concentration') concentrations.push(cleaned);
    else if (section === 'focus') focusAreas.push(cleaned);
    else if (section === 'rec') recommendation += (recommendation ? ' ' : '') + cleaned;
    else if (!summary) summary = cleaned;
    else summary += ' ' + cleaned;
  }

  if (!summary && concentrations.length === 0 && focusAreas.length === 0) {
    summary = raw.slice(0, 200);
  }

  return { summary, concentrations, focusAreas, recommendation };
}

export function HeatmapInsightPanel({ distribution }: HeatmapInsightPanelProps) {
  const [showPanel, setShowPanel] = useState(false);
  const { loading, result, error, configured, generate, reset } = useSentinelAI();
  const navigate = useNavigate();

  const handleAnalyze = useCallback(async () => {
    setShowPanel(true);
    const cellSummary = Object.entries(distribution.cellMap)
      .filter(([, count]) => count > 0)
      .map(([cell, count]) => {
        const [impact, likelihood] = cell.split('-');
        return `Etki:${impact} Olasilik:${likelihood} -> ${count} risk`;
      })
      .join(', ');

    const prompt = `Bu risk isi haritasi dagılımını analiz et:

Mod: ${distribution.mode === 'inherent' ? 'Dogal Risk' : 'Artik Risk'}
Toplam: ${distribution.total} risk
Kritik (15+): ${distribution.critical}
Yuksek (10-14): ${distribution.high}
Orta (5-9): ${distribution.medium}
Dusuk (<5): ${distribution.low}

Hucre dagilimi: ${cellSummary}

Lutfen su formatta yanit ver:
1. YOGUNLASMA ANALIZI: Hangi hucrelerde risk yogunlasmasi var?
2. ODAK ALANLARI: Denetim plani icin 3 kritik odak alani oner.
3. ONERILER: Yonetim kuruluna sunulacak kisa bir stratejik oneri yaz.`;

    await generate(prompt);
  }, [distribution, generate]);

  const parsed = result ? parseInsight(result) : null;

  return (
    <>
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-all shadow-lg shadow-slate-800/20 group"
      >
        <Brain size={16} className={loading ? 'animate-spin' : 'group-hover:scale-110 transition-transform'} />
        <span>Sentinel Analiz</span>
        {loading && <Loader2 size={14} className="animate-spin ml-1" />}
      </button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setShowPanel(false); reset(); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 w-full max-w-2xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Brain size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Sentinel Risk Analizi</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {distribution.mode === 'inherent' ? 'Dogal Risk' : 'Artik Risk'} Matrisi - {distribution.total} risk
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowPanel(false); reset(); }}
                  className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {!configured && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-800">AI Motoru Yapilandirilmamis</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Sentinel AI analizi icin Ayarlar &gt; Cognitive Engine sayfasindan Gemini API anahtarinizi girmeniz gerekiyor.
                      </p>
                      <button
                        onClick={() => navigate('/settings/cognitive-engine')}
                        className="mt-2 flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-900"
                      >
                        <Settings size={12} />
                        Ayarlara Git
                      </button>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
                      <Brain size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-800">Sentinel Analiz Ediyor...</p>
                      <p className="text-xs text-slate-500 mt-1">Risk dagilimi, yogunlasma ve korelasyonlar inceleniyor</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-800">Analiz Hatasi</p>
                      <p className="text-xs text-red-700 mt-1">{error}</p>
                      <button
                        onClick={handleAnalyze}
                        className="mt-2 text-xs font-bold text-red-700 hover:text-red-900"
                      >
                        Tekrar Dene
                      </button>
                    </div>
                  </div>
                )}

                {parsed && !loading && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-4 gap-3">
                      <MiniStat label="Kritik" value={distribution.critical} color="bg-red-600" />
                      <MiniStat label="Yuksek" value={distribution.high} color="bg-orange-500" />
                      <MiniStat label="Orta" value={distribution.medium} color="bg-yellow-500" />
                      <MiniStat label="Dusuk" value={distribution.low} color="bg-emerald-500" />
                    </div>

                    {parsed.summary && (
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <p className="text-sm text-slate-700 leading-relaxed">{parsed.summary}</p>
                      </div>
                    )}

                    {parsed.concentrations.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle size={14} className="text-red-600" />
                          </div>
                          <h3 className="text-sm font-bold text-slate-800">Yogunlasma Analizi</h3>
                        </div>
                        <div className="space-y-2">
                          {parsed.concentrations.map((c, i) => (
                            <div key={i} className="flex items-start gap-2 p-3 bg-red-50/50 rounded-lg border border-red-100">
                              <span className="w-5 h-5 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <p className="text-xs text-slate-700 leading-relaxed">{c}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {parsed.focusAreas.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Target size={14} className="text-blue-600" />
                          </div>
                          <h3 className="text-sm font-bold text-slate-800">Denetim Odak Alanlari</h3>
                        </div>
                        <div className="space-y-2">
                          {parsed.focusAreas.map((f, i) => (
                            <div key={i} className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                              <Target size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-slate-700 leading-relaxed">{f}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {parsed.recommendation && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <TrendingUp size={14} className="text-emerald-600" />
                          </div>
                          <h3 className="text-sm font-bold text-slate-800">Stratejik Oneri</h3>
                        </div>
                        <div className="bg-emerald-50/50 rounded-lg border border-emerald-100 p-4">
                          <p className="text-xs text-slate-700 leading-relaxed italic">{parsed.recommendation}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <Sparkles size={10} />
                        Sentinel Prime tarafindan uretildi
                      </div>
                      <button
                        onClick={handleAnalyze}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Yeniden Analiz Et
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
      <div className={`w-2 h-2 rounded-full ${color} mx-auto mb-1.5`} />
      <p className="text-lg font-black text-slate-900">{value}</p>
      <p className="text-[10px] text-slate-500 font-semibold">{label}</p>
    </div>
  );
}
