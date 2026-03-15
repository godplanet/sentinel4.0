/**
 * Wave 49: KRIGaugeBoard — Risk İştahı & KRI İzleme Panosu
 *
 * Light Mode, Apple Glassmorphism, C-Level ciddiyetinde.
 * İbrelerin (gauge) NaN/undefined sonucu çökmesi ?./?? ile korunur.
 * Eşik ihlallerinde sayfanın üst bandı kırmızı alarm moduna geçer.
 */

import { useKRIBoard, type KRICategory, type KRIWithLatest } from '@/features/kri-monitor/api';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
 Activity,
 AlertTriangle,
 Globe,
 Loader2,
 Lock,
 RefreshCw,
 ShieldCheck,
 TrendingDown,
 TrendingUp,
 Zap,
} from 'lucide-react';

/* ──────────────────────────────────────────────────────────
 Kategori Konfigürasyonu
 ────────────────────────────────────────────────────────── */

const CATEGORY_CONFIG: Record<KRICategory, { label: string; icon: typeof Activity; color: string; bg: string }> = {
 CREDIT: { label: 'Kredi Riski', icon: TrendingDown, color: 'text-blue-700', bg: 'bg-blue-50' },
 LIQUIDITY: { label: 'Likidite Riski', icon: Zap, color: 'text-violet-700', bg: 'bg-violet-50' },
 OPERATIONAL: { label: 'Operasyonel Risk', icon: Activity, color: 'text-amber-700', bg: 'bg-amber-50' },
 MARKET: { label: 'Piyasa Riski', icon: TrendingUp, color: 'text-emerald-700',bg: 'bg-emerald-50' },
 COMPLIANCE: { label: 'Uyum Riski', icon: ShieldCheck, color: 'text-teal-700', bg: 'bg-teal-50' },
 CYBER: { label: 'Siber Güvenlik Riski', icon: Lock, color: 'text-rose-700', bg: 'bg-rose-50' },
};

/* ──────────────────────────────────────────────────────────
 Yatay Gauge Çubuğu
 ────────────────────────────────────────────────────────── */

function GaugeBar({ kri }: { kri: KRIWithLatest }) {
 const pct = kri.gauge_pct ?? 0;
 const barColor = kri.breach ? 'bg-red-500' : kri.warning ? 'bg-amber-400' : 'bg-emerald-500';

 return (
 <div className="w-full">
 <div className="flex justify-between text-[10px] text-slate-400 mb-1">
 <span>Hedef: {kri.target_value}{kri.unit === 'PERCENT' ? '%' : ''}</span>
 <span className={clsx('font-bold', kri.breach ? 'text-red-600' : kri.warning ? 'text-amber-600' : 'text-emerald-600')}>
 Güncel: {kri.latest_reading?.reading_value?.toFixed(1) ?? kri.target_value}{kri.unit === 'PERCENT' ? '%' : ''}
 </span>
 <span>Limit: {kri.limit_threshold}{kri.unit === 'PERCENT' ? '%' : ''}</span>
 </div>
 <div className="h-3 rounded-full bg-slate-100 overflow-hidden relative">
 {/* Uyarı eşiği çizgisi */}
 <div
 className="absolute top-0 h-full w-0.5 bg-amber-300 z-10"
 style={{
 left: `${kri.direction === 'LOWER_IS_BETTER'
 ? Math.round(((kri.warning_threshold - kri.target_value) / ((kri.limit_threshold - kri.target_value) || 1)) * 100)
 : Math.round(((kri.warning_threshold - kri.limit_threshold) / ((kri.target_value - kri.limit_threshold) || 1)) * 100)
 }%`,
 }}
 />
 <motion.div
 className={clsx('h-full rounded-full transition-all', barColor)}
 initial={{ width: 0 }}
 animate={{ width: `${Math.min(pct, 100)}%` }}
 transition={{ duration: 0.7, ease: 'easeOut' }}
 />
 </div>
 </div>
 );
}

/* ──────────────────────────────────────────────────────────
 KRI Kart
 ────────────────────────────────────────────────────────── */

function KRICard({ kri }: { kri: KRIWithLatest }) {
 const catConfig = CATEGORY_CONFIG[kri.category] ?? CATEGORY_CONFIG.OPERATIONAL;
 const CatIcon = catConfig.icon;

 const cardBorder = kri.breach
 ? 'border-red-300 bg-red-50/60'
 : kri.warning
 ? 'border-amber-200 bg-amber-50/40'
 : 'border-slate-200 bg-surface';

 const statusLabel = kri.breach ? 'LİMİT İHLALİ' : kri.warning ? 'UYARI' : 'NORMAL';
 const statusColor = kri.breach ? 'text-red-700 bg-red-100 border-red-200' : kri.warning ? 'text-amber-700 bg-amber-100 border-amber-200' : 'text-emerald-700 bg-emerald-100 border-emerald-200';

 return (
 <motion.div
 layout
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 className={clsx('rounded-xl border p-4 shadow-sm transition-colors', cardBorder)}
 >
 {/* Başlık */}
 <div className="flex items-start gap-3 mb-3">
 <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', catConfig.bg)}>
 <CatIcon size={16} className={catConfig.color} />
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-0.5 flex-wrap">
 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{kri.kri_code}</span>
 <span className={clsx('text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border', statusColor)}>
 {statusLabel}
 </span>
 </div>
 <h4 className="text-sm font-bold text-primary leading-tight">{kri.kri_name}</h4>
 </div>
 </div>

 {/* Gauge */}
 <GaugeBar kri={kri} />

 {/* Not */}
 {kri.latest_reading?.note && (
 <p className="text-[11px] text-slate-500 mt-2 leading-relaxed border-l-2 border-amber-300 pl-2">
 {kri.latest_reading.note}
 </p>
 )}

 {/* Son ölçüm zamanı */}
 {kri.latest_reading?.measured_at && (
 <div className="mt-2 text-[10px] text-slate-400">
 Son ölçüm: {new Date(kri.latest_reading.measured_at).toLocaleString('tr-TR')}
 </div>
 )}

 {/* Düzenleyici referans */}
 {kri.regulatory_ref && (
 <div className="mt-2 text-[10px] text-slate-400 truncate">
 <Globe size={9} className="inline mr-1" />{kri.regulatory_ref}
 </div>
 )}
 </motion.div>
 );
}

/* ──────────────────────────────────────────────────────────
 Ana Widget Export
 ────────────────────────────────────────────────────────── */

export function KRIGaugeBoard() {
 const { data: kris, isLoading, isError, hasBreaches } = useKRIBoard();

 /* Kategorilere göre grupla */
 const byCategory = (kris || []).reduce<Record<string, KRIWithLatest[]>>((acc, k) => {
 const cat = k?.category ?? 'OPERATIONAL';
 if (!acc[cat]) acc[cat] = [];
 acc[cat].push(k);
 return acc;
 }, {});

 const warnings = (kris || []).filter(k => k.warning);
 const breaches = (kris || []).filter(k => k.breach);
 const normals = (kris || []).filter(k => !k.warning && !k.breach);

 if (isLoading) {
 return (
 <div className="flex items-center justify-center py-16">
 <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
 </div>
 );
 }

 if (isError) {
 return (
 <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-center">
 <AlertTriangle className="mx-auto w-8 h-8 text-amber-400 mb-2" />
 <p className="text-sm text-amber-800">KRI verileri yüklenirken bir hata oluştu.</p>
 </div>
 );
 }

 return (
 <div className="space-y-5">
 {/* Alarm Bandı — Eşik ihlalinde kırmızıya döner */}
 <AnimatePresence>
 {hasBreaches && (
 <motion.div
 initial={{ opacity: 0, y: -8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -8 }}
 className="flex items-center gap-3 px-5 py-3.5 bg-red-600 text-white rounded-xl shadow-md"
 >
 <AlertTriangle size={18} className="shrink-0 animate-pulse" />
 <div>
 <span className="font-black text-sm uppercase tracking-wide">LİMİT İHLALİ TESPİT EDİLDİ</span>
 <span className="text-red-200 text-xs ml-2">— {breaches.length} KRI limit eşiğini aştı. Acil aksiyon gerekiyor.</span>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Özet İstatistik Şeridi */}
 <div className="flex flex-wrap gap-3 p-4 bg-surface rounded-xl border border-slate-200 shadow-sm">
 {[
 { label: 'Normal', value: normals.length, cls: 'text-emerald-600' },
 { label: 'Uyarı', value: warnings.length, cls: 'text-amber-600' },
 { label: 'İhlal', value: breaches.length, cls: 'text-red-600' },
 { label: 'Toplam', value: kris.length, cls: 'text-slate-700' },
 ].map((s, i) => (
 <div key={i} className="flex items-center gap-3">
 <span className={clsx('text-2xl font-black tabular-nums', s.cls)}>{s.value}</span>
 <span className="text-xs text-slate-500">{s.label}</span>
 {i < 3 && <div className="w-px h-5 bg-slate-200" />}
 </div>
 ))}
 <div className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
 <RefreshCw size={10} />
 Canlı Veri
 </div>
 </div>

 {/* Kategori Bazlı KRI Kartları */}
 {Object.entries(byCategory).map(([cat, items]) => {
 const catConf = CATEGORY_CONFIG[cat as KRICategory] ?? CATEGORY_CONFIG.OPERATIONAL;
 const CatIcon = catConf.icon;
 return (
 <div key={cat}>
 <div className="flex items-center gap-2 mb-3">
 <div className={clsx('w-6 h-6 rounded-lg flex items-center justify-center', catConf.bg)}>
 <CatIcon size={13} className={catConf.color} />
 </div>
 <span className="text-xs font-black text-slate-500 uppercase tracking-wider">{catConf.label}</span>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {(items || []).map(kri => (
 <KRICard key={kri.id} kri={kri} />
 ))}
 </div>
 </div>
 );
 })}
 </div>
 );
}
