/**
 * SENTINEL GRC v3.0 — Auto-QAIP Engine: Sağlık Skoru Dashboard'u
 * ================================================================
 * GIAS 2025 Standard 12.1 — Kalite Güvence ve İyileştirme Programı
 *
 * Bu widget:
 * - useQaipHealth hook'u ile Supabase'den gerçek veri çeker
 * - 4 komponent (Zamanlılık, Onay, Red Oranı, İnceleme) gösterir
 * - GREEN/YELLOW/RED kapı sonucu + "KALINLIK GEÇTİ / BAŞARISIZ" badge
 * - Yeniden hesaplama (refetch) butonu
 */

import type { QaipHealthComponent } from '@/entities/qaip/api/qaip-api';
import { useQaipHealth } from '@/entities/qaip/api/qaip-api';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import {
 Activity,
 AlertTriangle,
 CheckCircle2,
 Loader2,
 Minus,
 RefreshCw,
 TrendingDown,
 TrendingUp,
 XCircle
} from 'lucide-react';

// ─── Yardımcı: Zone renkleri ──────────────────────────────────────────────────

function zoneConfig(zone: 'GREEN' | 'YELLOW' | 'RED' | undefined) {
 switch (zone) {
 case 'GREEN': return { label: 'YEŞİL — Kalite Kapısı Geçildi', color: 'text-emerald-400', bg: 'rgba(4,120,87,0.15)', border: 'rgba(16,185,129,0.25)', Icon: CheckCircle2 };
 case 'YELLOW': return { label: 'SARI — İzleme Gerekiyor', color: 'text-amber-400', bg: 'rgba(146,64,14,0.15)', border: 'rgba(251,191,36,0.25)', Icon: AlertTriangle };
 default: return { label: 'KIRMIZI — Kalite Kapısı Başarısız', color: 'text-red-400', bg: 'rgba(127,29,29,0.15)', border: 'rgba(239,68,68,0.25)', Icon: XCircle };
 }
}

function ScoreBar({ score }: { score: number }) {
 const color = score >= 85 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444';
 return (
 <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
 <motion.div
 className="h-full rounded-full"
 initial={{ width: 0 }}
 animate={{ width: `${Math.min(score, 100)}%` }}
 transition={{ duration: 0.8, ease: 'easeOut' }}
 style={{ backgroundColor: color }}
 />
 </div>
 );
}

function ComponentCard({ comp }: { comp: QaipHealthComponent }) {
 const TrendIcon = (comp?.score ?? 0) >= 85 ? TrendingUp : (comp?.score ?? 0) >= 70 ? Minus : TrendingDown;
 const trendColor = (comp?.score ?? 0) >= 85 ? 'text-emerald-400' : (comp?.score ?? 0) >= 70 ? 'text-amber-400' : 'text-red-400';

 return (
 <div
 className="p-4 rounded-xl"
 style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
 >
 <div className="flex items-center justify-between mb-2">
 <p className="text-xs font-bold text-slate-300">{comp?.label ?? '—'}</p>
 <div className="flex items-center gap-1">
 <TrendIcon size={12} className={trendColor} />
 <span className={clsx('text-sm font-black', trendColor)}>
 {comp?.score ?? 0}
 </span>
 </div>
 </div>
 <ScoreBar score={comp?.score ?? 0} />
 {comp?.gap && (
 <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1">
 <AlertTriangle size={8} className="text-amber-500" />
 {comp.gap}
 </p>
 )}
 <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-600">
 <span>{comp?.raw_passing ?? 0} / {comp?.raw_total ?? 0} geçiyor</span>
 <span className="ml-auto">Ağırlık: %{Math.round((comp?.weight ?? 0) * 100)}</span>
 </div>
 </div>
 );
}

// ─── Ana Widget ───────────────────────────────────────────────────────────────

interface QaipHealthWidgetProps {
 engagementId?: string;
 compact?: boolean;
}

export function QaipHealthWidget({ engagementId, compact = false }: QaipHealthWidgetProps) {
 const { data, isLoading, isError, error, refetch, isFetching } = useQaipHealth(
 engagementId ? { engagement_id: engagementId } : {}
 );

 if (isLoading) {
 return (
 <div
 className="rounded-2xl p-5 flex flex-col items-center justify-center gap-3"
 style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.1)' }}
 >
 <Loader2 size={28} className="animate-spin text-slate-500" />
 <p className="text-xs text-slate-500">Kalite skoru Supabase&apos;den hesaplanıyor...</p>
 </div>
 );
 }

 if (isError) {
 console.error('[SENTINEL][QAIP] Health widget error:', error);
 return (
 <div
 className="rounded-2xl p-6 flex flex-col items-center text-center gap-3"
 style={{ background: 'rgba(127,29,29,0.15)', border: '1px solid rgba(239,68,68,0.2)' }}
 >
 <AlertTriangle size={24} className="text-red-400" />
 <p className="text-sm font-bold text-red-300">QAIP Skoru Hesaplanamadı</p>
 <p className="text-xs text-red-400">
 {error instanceof Error ? error.message : 'Supabase bağlantı hatası'}
 </p>
 <button
 onClick={() => refetch()}
 className="flex items-center gap-1.5 text-xs text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
 >
 <RefreshCw size={11} />
 Yeniden Hesapla
 </button>
 </div>
 );
 }

 const zone = zoneConfig(data?.zone);
 const { Icon: ZoneIcon } = zone;

 return (
 <div
 className="rounded-2xl overflow-hidden"
 style={{
 background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
 border: '1px solid rgba(148,163,184,0.1)',
 }}
 >
 {/* Header */}
 <div
 className="px-6 py-4 flex items-center justify-between"
 style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
 >
 <div className="flex items-center gap-3">
 <div
 className="w-9 h-9 rounded-xl flex items-center justify-center"
 style={{ background: 'rgba(99,102,241,0.2)' }}
 >
 <Activity size={18} className="text-indigo-400" />
 </div>
 <div>
 <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
 GIAS 2025 · Std 12.1 · Auto-QAIP Engine
 </p>
 <h3 className="text-sm font-black text-white">Denetim Kalitesi Skoru</h3>
 </div>
 </div>
 <div className="flex items-center gap-2">
 {data?.source === 'REALTIME' && (
 <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
 CANLI
 </span>
 )}
 <button
 onClick={() => refetch()}
 disabled={isFetching}
 className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
 >
 <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
 </button>
 </div>
 </div>

 {/* Skor Gauging */}
 <div className="px-6 py-5">
 <div className="flex items-center justify-between mb-3">
 <div>
 <div className="flex items-end gap-2">
 <span className="text-5xl font-black text-white">
 {data?.overall ?? 0}
 </span>
 <span className="text-lg text-slate-500 mb-1">/ 100</span>
 </div>
 <div
 className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg"
 style={{ background: zone.bg, border: `1px solid ${zone.border}` }}
 >
 <ZoneIcon size={13} className={zone.color} />
 <span className={clsx('text-xs font-bold', zone.color)}>{zone.label}</span>
 </div>
 </div>

 {/* Kapı sonucu */}
 <div className="text-right">
 {data?.passesGate ? (
 <div className="flex flex-col items-end gap-1">
 <CheckCircle2 size={32} className="text-emerald-400" />
 <p className="text-[10px] text-emerald-400 font-bold uppercase">Kalite Kapısı: GEÇTİ</p>
 </div>
 ) : (
 <div className="flex flex-col items-end gap-1">
 <XCircle size={32} className="text-red-400" />
 <p className="text-[10px] text-red-400 font-bold uppercase">Kalite Kapısı: BAŞARISIZ</p>
 </div>
 )}
 </div>
 </div>

 {/* Ana bar */}
 <ScoreBar score={data?.overall ?? 0} />
 <div className="flex justify-between text-[10px] text-slate-600 mt-1">
 <span>0</span>
 <span>Eşik: 85</span>
 <span>100</span>
 </div>
 </div>

 {/* Komponentler */}
 {!compact && (
 <div className="px-6 pb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
 {(data?.components ?? []).map((comp) => (
 <ComponentCard key={comp?.key ?? Math.random()} comp={comp} />
 ))}
 </div>
 )}

 {/* Footer */}
 <div
 className="px-6 py-3 flex items-center justify-between"
 style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
 >
 <span className="text-[10px] text-slate-600">
 {data?.computed_at ? `Son hesaplama: ${new Date(data.computed_at).toLocaleTimeString('tr-TR')}` : ''}
 </span>
 <span className="text-[10px] text-slate-600">Sentinel GRC v3.0</span>
 </div>
 </div>
 );
}
