import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, RefreshCw, Loader2, Skull, TrendingUp, Eye } from 'lucide-react';
import { fetchRiskAcceptances, useZombies, useZombieSummary, useRadar } from '../api/index';

// ─── Yardımcı yardımcılar ────────────────────────────────────────────────────

const now = new Date();

function daysUntilExpiry(expiryDate: string): number {
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - now.getTime()) / 86400000);
}

function consumedPct(startDate: string, expiryDate: string): number {
  const start = new Date(startDate);
  const expiry = new Date(expiryDate);
  const total = expiry.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

const RISK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
  HIGH:     { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  MEDIUM:   { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  LOW:      { bg: 'bg-slate-50',  text: 'text-slate-600',  border: 'border-slate-200' },
};

// ─── Sekme türü ────────────────────────────────────────────────────────────────

type Tab = 'zombies' | 'acceptances' | 'radar';

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────

export const ResurrectionBoard: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<Tab>('zombies');

  const { data: acceptances = [], isLoading: loadingAccept } = useQuery({
    queryKey: ['risk-acceptances'],
    queryFn: fetchRiskAcceptances,
  });
  const { data: zombies = [], isLoading: loadingZombies } = useZombies();
  const { data: summary } = useZombieSummary();
  const { data: alerts = [], isLoading: loadingRadar } = useRadar();

  const isLoading = loadingZombies || loadingAccept || loadingRadar;

  return (
    <div className="bg-surface/70 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl overflow-hidden h-full flex flex-col">
      {/* Başlık */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
            <RefreshCw size={15} className="text-amber-700" />
          </div>
          <div>
            <h3 className="font-sans text-sm font-semibold text-primary">Resurrection Watch</h3>
            <p className="text-xs text-slate-500 mt-0.5">Approved risk acceptances approaching expiration</p>
          </div>
        </div>

        {/* Zombi Özeti Bandı */}
        {summary && summary.totalActive > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
              <p className="text-lg font-black text-red-700">{summary.criticalCount}</p>
              <p className="text-[9px] font-bold text-red-500 uppercase">Kritik Zombi</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-center">
              <p className="text-lg font-black text-amber-700">{summary.totalActive}</p>
              <p className="text-[9px] font-bold text-amber-500 uppercase">Aktif Hortlak</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 text-center">
              <p className="text-lg font-black text-purple-700">{summary.avgCloseCount}x</p>
              <p className="text-[9px] font-bold text-purple-500 uppercase">Ort. Kapatma</p>
            </div>
          </div>
        )}

        {/* Sekmeler */}
        <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
          {[
            { key: 'zombies' as Tab, label: 'Zombi Bulgular', icon: Skull, count: zombies.length },
            { key: 'acceptances' as Tab, label: 'Risk Kabulleri', icon: Clock, count: acceptances.length },
            { key: 'radar' as Tab, label: 'Tahmin Radarı', icon: Eye, count: alerts.length },
          ].map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                activeTab === key
                  ? 'bg-surface text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={11} />
              {label}
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                  activeTab === key ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500'
                }`}>{count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* İçerik */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={20} className="animate-spin mr-2" />
            <span className="text-sm">Yükleniyor...</span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* ─── ZOMBİ BULGULAR ─── */}
            {activeTab === 'zombies' && (
              <motion.div key="zombies" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {zombies.length === 0 ? (
                  <EmptyState icon={Skull} message="Aktif zombi bulgu bulunamadı." />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {zombies.map((z, i) => {
                      const colors = RISK_COLORS[z.risk_level] ?? RISK_COLORS.LOW;
                      return (
                        <motion.div
                          key={z.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.07 }}
                          className={`px-6 py-4 space-y-2 ${colors.bg}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <Skull size={12} className={colors.text} />
                                <span className="text-[10px] font-mono font-bold text-slate-500">{z.finding_code}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${colors.bg} ${colors.text} ${colors.border}`}>
                                  {z.risk_level}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-primary truncate">{z.finding_title}</p>
                            </div>
                            <span className="shrink-0 text-[9px] font-bold px-2 py-1 bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                              {z.previous_close_count}× kapatıldı
                            </span>
                          </div>

                          {z.notes && (
                            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{z.notes}</p>
                          )}

                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>{z.entity_name ?? z.assigned_to ?? '—'}</span>
                            <span>Tespit: {z.resurface_date}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ─── RİSK KABULLERİ ─── */}
            {activeTab === 'acceptances' && (
              <motion.div key="acceptances" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {acceptances.length === 0 ? (
                  <EmptyState icon={RefreshCw} message="Aktif risk kabulü bulunmuyor." />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {acceptances.map((row, i) => {
                      const days = daysUntilExpiry(row.expiration_date ?? '');
                      const pct = consumedPct(row.acceptance_start, row.expiration_date ?? '');
                      const isImminent = days <= 7;
                      const isWarning = days <= 30 && !isImminent;
                      const rowBg = isImminent ? 'bg-red-50/60' : isWarning ? 'bg-amber-50/40' : '';
                      const textColor = isImminent ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-slate-500';
                      const barColor = isImminent ? 'bg-red-400' : isWarning ? 'bg-amber-400' : 'bg-emerald-400';

                      return (
                        <motion.div
                          key={row.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`px-6 py-5 space-y-3 ${rowBg}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-primary font-sans truncate">{row.finding_title}</p>
                              <p className="text-[10px] font-mono text-slate-400 mt-0.5">{row.id} · {row.action_id}</p>
                            </div>
                            {isImminent && (
                              <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold font-sans bg-red-100 text-red-800 border border-red-200 uppercase tracking-wide animate-pulse">
                                <AlertTriangle size={10} />
                                Imminent Resurrection
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-sans leading-relaxed line-clamp-2">
                            {row.risk_description || row.justification}
                          </p>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-sans">
                              <span className="text-slate-400">Accepted risk period consumed</span>
                              <div className={`flex items-center gap-1.5 font-medium ${textColor}`}>
                                <Clock size={11} />
                                <span>{days > 0 ? `${days} days remaining` : 'EXPIRED'}</span>
                              </div>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className={`h-full rounded-full ${barColor}`}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                              <span>Accepted by: {row.accepted_by}</span>
                              <span>Expires: {row.expiration_date}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ─── TAHMİN RADARI ─── */}
            {activeTab === 'radar' && (
              <motion.div key="radar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {alerts.length === 0 ? (
                  <EmptyState icon={Eye} message="Aktif tahminsel uyarı yok." />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {alerts.map((a, i) => {
                      const colors = RISK_COLORS[a.severity] ?? RISK_COLORS.LOW;
                      return (
                        <motion.div
                          key={a.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className={`px-6 py-4 space-y-2 ${colors.bg}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <TrendingUp size={11} className={colors.text} />
                                <span className="text-[9px] font-bold text-slate-400 uppercase">{a.alert_type}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${colors.bg} ${colors.text} ${colors.border}`}>
                                  {a.severity}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-primary line-clamp-2">{a.title}</p>
                            </div>
                            {a.confidence_pct !== null && (
                              <div className="shrink-0 text-right">
                                <p className="text-xl font-black text-slate-800">%{a.confidence_pct}</p>
                                <p className="text-[9px] text-slate-400">güven</p>
                              </div>
                            )}
                          </div>
                          {a.description && (
                            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{a.description}</p>
                          )}
                          {a.predicted_date && (
                            <p className="text-[10px] font-mono text-slate-400">
                              Tahmini tarih: {a.predicted_date} · {a.category}
                            </p>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

// ─── Boş Durum ───────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
      <Icon size={32} className="mb-3 opacity-30" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
