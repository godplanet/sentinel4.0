import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, CheckCircle2, AlertTriangle, Zap, TrendingUp, Eye } from 'lucide-react';
import clsx from 'clsx';

interface AIAnomalyPanelProps {
  onCreateProbe: (suggestion: AISuggestion) => void;
}

export interface AISuggestion {
  id: string;
  title: string;
  description: string;
  pattern: string;
  confidence: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  suggestedQuery: string;
  detectedCount: number;
}

const MOCK_SUGGESTIONS: AISuggestion[] = [
  {
    id: 'ai-1',
    title: 'Bolunmus Islem Deseni (Smurfing)',
    description: 'Son 24 saatte, 3 farkli musterinin esik degerinin hemen altinda ardisik islemler gerceklestirdigi tespit edildi. Bu pattern, yapilandirma (smurfing) aktivitesine isaret ediyor olabilir.',
    pattern: 'Split Transaction Detection',
    confidence: 94,
    severity: 'HIGH',
    suggestedQuery: "SELECT account_id, COUNT(*) as tx_count, SUM(amount) as total\nFROM transactions\nWHERE amount BETWEEN 9000 AND 10000\n  AND created_at > now() - interval '24h'\nGROUP BY account_id\nHAVING COUNT(*) > 3;",
    detectedCount: 7,
  },
  {
    id: 'ai-2',
    title: 'Mesai Disi Yetkilendirme Anomalisi',
    description: 'Normal calisma saatleri disinda (22:00-06:00) yuksek tutarli onaylarin %340 arttigi gozlemlendi. Yetkilendirme matrisinin bypass edildigi islemler mevcut.',
    pattern: 'Off-Hours Authorization Spike',
    confidence: 87,
    severity: 'HIGH',
    suggestedQuery: "SELECT approver_id, COUNT(*) as approval_count, AVG(amount) as avg_amount\nFROM approvals\nWHERE EXTRACT(HOUR FROM approved_at) NOT BETWEEN 8 AND 18\n  AND amount > 100000\n  AND approved_at > now() - interval '7d'\nGROUP BY approver_id;",
    detectedCount: 12,
  },
  {
    id: 'ai-3',
    title: 'Dormant Hesap Reaktivasyon Dalgasi',
    description: '6 aydan uzun suredir islem gormeyen 5 hesapta ani aktivite tespiti. Hesaplarin tamami farkli subelerde acilmis ancak ayni IP adresinden erisiyor.',
    pattern: 'Dormant Account Reactivation',
    confidence: 78,
    severity: 'MEDIUM',
    suggestedQuery: "SELECT a.account_id, a.last_activity_date, t.amount, t.ip_address\nFROM accounts a\nJOIN transactions t ON a.id = t.account_id\nWHERE a.last_activity_date < now() - interval '180 days'\n  AND t.created_at > now() - interval '48h';",
    detectedCount: 5,
  },
];

export function AIAnomalyPanel({ onCreateProbe }: AIAnomalyPanelProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [createdIds, setCreatedIds] = useState<Set<string>>(new Set());

  const handleScan = async () => {
    setIsScanning(true);
    setScanComplete(false);
    setSuggestions([]);

    await new Promise(r => setTimeout(r, 3000));

    setSuggestions(MOCK_SUGGESTIONS);
    setIsScanning(false);
    setScanComplete(true);
  };

  const handleCreate = (suggestion: AISuggestion) => {
    onCreateProbe(suggestion);
    setCreatedIds(prev => new Set(prev).add(suggestion.id));
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 border border-blue-500/30 rounded-xl">
              <Sparkles size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sentinel AI Anomali Tarama</h3>
              <p className="text-xs text-slate-400 mt-0.5">Yapay zeka islem akisini analiz eder ve supheli desenleri tespit eder</p>
            </div>
          </div>

          <button
            onClick={handleScan}
            disabled={isScanning}
            className={clsx(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
              isScanning
                ? 'bg-blue-500/20 text-blue-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/20'
            )}
          >
            {isScanning ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Taraniyor...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                AI Tarama Baslat
              </>
            )}
          </button>
        </div>

        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Zap size={20} className="text-blue-400" />
                  </motion.div>
                  <div>
                    <p className="text-sm font-bold text-blue-300">Sentinel Prime Analiz Ediyor...</p>
                    <p className="text-xs text-blue-400/70 mt-0.5">Islem akisi, zaman desenleri ve davranis anomalileri taraniyoor</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {['Islem desenleri analiz ediliyor', 'Zaman serisi anomali tespiti', 'Davranis profili karsilastirmasi'].map((text, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.8 }}
                      className="flex items-center gap-2 text-xs text-slate-400"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
                        className="w-1.5 h-1.5 rounded-full bg-blue-400"
                      />
                      {text}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {scanComplete && suggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400">
                {suggestions.length} supheli desen tespit edildi
              </span>
            </div>

            {suggestions.map((sg, i) => {
              const isExpanded = expandedId === sg.id;
              const isCreated = createdIds.has(sg.id);

              return (
                <motion.div
                  key={sg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={clsx(
                    'border rounded-xl overflow-hidden transition-all',
                    sg.severity === 'HIGH' ? 'border-red-500/30 bg-red-500/5' :
                    sg.severity === 'MEDIUM' ? 'border-amber-500/30 bg-amber-500/5' :
                    'border-blue-500/30 bg-blue-500/5'
                  )}
                >
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : sg.id)}
                    className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle size={14} className={
                            sg.severity === 'HIGH' ? 'text-red-400' :
                            sg.severity === 'MEDIUM' ? 'text-amber-400' : 'text-blue-400'
                          } />
                          <h4 className="text-sm font-bold text-white">{sg.title}</h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{sg.description}</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <TrendingUp size={11} className="text-blue-400" />
                            <span className="text-xs font-black text-white">{sg.confidence}%</span>
                          </div>
                          <p className="text-[9px] text-slate-500">Guven</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-red-400">{sg.detectedCount}</p>
                          <p className="text-[9px] text-slate-500">Tespit</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3">
                          <div className="bg-slate-900/80 rounded-lg p-3">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Onerilen SQL</p>
                            <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap">{sg.suggestedQuery}</pre>
                          </div>
                          <div className="flex items-center gap-2">
                            {isCreated ? (
                              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold">
                                <CheckCircle2 size={14} />
                                Probe Olusturuldu
                              </div>
                            ) : (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleCreate(sg); }}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg text-xs font-bold hover:from-blue-700 hover:to-cyan-700 transition-all"
                              >
                                <Zap size={14} />
                                Bu Monitor'u Olustur
                              </button>
                            )}
                            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 text-slate-400 rounded-lg text-xs font-bold hover:bg-white/10 transition-colors">
                              <Eye size={14} />
                              Detay
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}

        {!isScanning && !scanComplete && (
          <div className="text-center py-8">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block"
            >
              <div className="w-16 h-16 mx-auto bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles size={28} className="text-blue-400" />
              </div>
            </motion.div>
            <p className="text-sm font-medium text-slate-400">AI tarama ile supheli desenleri otomatik tespit edin</p>
            <p className="text-xs text-slate-500 mt-1">Islem akisi, zaman desenleri ve davranis anomalilerini analiz eder</p>
          </div>
        )}
      </div>
    </div>
  );
}
