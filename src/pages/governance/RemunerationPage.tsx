/**
 * Executive Remuneration & Clawback Tracker (Yönetişim)
 * Wave 65: Üst Yönetim Ücretlendirme İzleyicisi
 *
 * FSD: pages/governance/RemunerationPage.tsx
 * Veri: features/remuneration/api.ts → useBonuses + useClawbacks
 * Tasarım: %100 Light Mode | Apple Glass | Yönetim Kurulu ciddiyeti
 */

import {
 useBonuses,
 useClawbacks,
 type ExecutiveBonus,
} from '@/features/remuneration/api';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
 AlertOctagon,
 AlertTriangle,
 Award,
 Briefcase,
 CheckCircle2,
 ChevronRight, DollarSign,
 Scale,
 ShieldAlert,
 Target,
 TrendingDown,
 Wallet
} from 'lucide-react';
import { useState } from 'react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const RATING_MAP = {
 'A+': { color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-200' },
 'A': { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
 'B+': { color: 'text-blue-700', bg: 'bg-blue-100 border-blue-200' },
 'B': { color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
 'C+': { color: 'text-orange-700', bg: 'bg-orange-100 border-orange-200' },
 'C': { color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
 'C-': { color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
 'D': { color: 'text-red-700', bg: 'bg-red-100 border-red-300' },
} as const;

const BONUS_STATUS_MAP = {
 'Taslak': { label: 'Taslak', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: Target },
 'Tahakkuk Edildi': { label: 'Tahakkuk Edildi', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Wallet },
 'Kısmen Ödendi': { label: 'Kısmen Ödendi', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: DollarSign },
 'Ödendi': { label: 'Ödendi', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
 'İptal Edildi (Clawback)': { label: 'İptal Edildi (Clawback)', color: 'bg-red-100 text-red-700 border-red-200', icon: TrendingDown },
} as const;

const CLAWBACK_STATUS_MAP = {
 'İncelemede': 'bg-orange-100 text-orange-700',
 'Karara Bağlandı': 'bg-blue-100 text-blue-700',
 'Tahsil Edildi': 'bg-emerald-100 text-emerald-700',
 'Hukuki Süreçte': 'bg-red-100 text-red-700',
} as const;

// Sayı formatlayıcı: 1250000 -> 1.25M
const formatCurrency = (val: number | null) => {
 const num = val ?? 0;
 if (num >= 1_000_000) return `₺${(num / 1_000_000).toFixed(2)}M`;
 if (num >= 1_000) return `₺${(num / 1_000).toFixed(0)}K`;
 return `₺${num}`;
};

// ─── Bonus Card ──────────────────────────────────────────────────────────────

function BonusCard({ bonus, onSelect, isSelected }: { bonus: ExecutiveBonus, onSelect: () => void, isSelected: boolean }) {
 const rating = RATING_MAP[bonus?.risk_adjusted_rating as keyof typeof RATING_MAP] ?? RATING_MAP['B'];
 const st = BONUS_STATUS_MAP[bonus?.status as keyof typeof BONUS_STATUS_MAP] ?? BONUS_STATUS_MAP['Taslak'];
 const StatusIcon = st.icon;

 const isClawback = bonus?.status === 'İptal Edildi (Clawback)';

 return (
 <motion.div
 layout
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 onClick={onSelect}
 className={clsx(
 'cursor-pointer rounded-xl border p-4 transition-all relative overflow-hidden',
 'bg-white/70 backdrop-blur-lg shadow-sm',
 isSelected
 ? 'border-indigo-400 ring-2 ring-indigo-100 shadow-lg'
 : 'border-slate-200 hover:border-indigo-200 hover:shadow-md'
 )}
 >
 {/* İptal edilen primler için arkada hafif kırmızı mesh */}
 {isClawback && (
 <div className="absolute -right-10 -top-10 w-32 h-32 bg-red-50 rounded-full blur-2xl opacity-60 z-0 pointer-events-none" />
 )}

 <div className="relative z-10 flex items-start justify-between gap-3 mb-3">
 <div className="flex flex-col mb-1 gap-2 w-full pr-6">
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1', st.color)}>
 <StatusIcon size={10} /> {st.label}
 </span>
 <span className={clsx('text-[10px] font-black px-2 py-0.5 rounded-full border', rating.bg, rating.color)}>
 Rating: {bonus?.risk_adjusted_rating}
 </span>
 </div>
 <div>
 <h3 className="text-sm font-bold text-slate-800 leading-snug truncate pr-2">{bonus?.executive_name ?? 'Bilinmeyen Yönetici'}</h3>
 <div className="text-[10px] text-slate-500 font-medium truncate">{bonus?.title} ({bonus?.department})</div>
 </div>
 </div>
 <ChevronRight size={14} className={clsx('text-slate-300 flex-shrink-0 mt-5 absolute right-4 transition-transform z-10', isSelected && 'rotate-90')} />
 </div>

 <div className="relative z-10 grid grid-cols-3 gap-2 mt-3 p-2 bg-slate-50/50 rounded-lg border border-slate-100">
 <div>
 <div className="text-[9px] font-bold text-slate-400 uppercase">Sabit Maaş</div>
 <div className="text-xs font-mono text-slate-700 font-semibold">{formatCurrency(bonus?.base_salary)}</div>
 </div>
 <div>
 <div className="text-[9px] font-bold text-indigo-400 uppercase">Hak Edilen Prim</div>
 <div className={clsx("text-xs font-mono font-bold", isClawback ? "text-slate-400 line-through" : "text-indigo-700")}>
 {formatCurrency(bonus?.awarded_bonus)}
 </div>
 </div>
 <div>
 <div className="text-[9px] font-bold text-orange-500 uppercase flex items-center gap-0.5">
 Ertelenen <ShieldAlert size={8} />
 </div>
 <div className={clsx("text-xs font-mono font-bold", (bonus?.deferred_amount ?? 0) > 0 ? "text-orange-600" : "text-slate-400")}>
 {formatCurrency(bonus?.deferred_amount)}
 </div>
 </div>
 </div>
 </motion.div>
 );
}

// ─── Clawback Panel ──────────────────────────────────────────────────────────

function ClawbackPanel({ bonusId }: { bonusId: string }) {
 const { data: clawbacks, isLoading, error } = useClawbacks(bonusId);

 if (isLoading) {
 return (
 <div className="flex items-center gap-2 py-4 justify-center text-slate-400">
 <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
 <span className="text-xs">Clawback olayları yükleniyor...</span>
 </div>
 );
 }

 if (error) {
 return (
 <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
 <AlertTriangle size={12} />
 Olaylar yüklenemedi.
 </div>
 );
 }

 if (!clawbacks || clawbacks.length === 0) {
 return (
 <div className="text-center py-4 text-emerald-600/60 bg-emerald-50/50 rounded-2xl border border-dashed border-emerald-200/60">
 <Award className="w-8 h-8 mx-auto mb-2 opacity-30" />
 <p className="text-xs font-semibold">Bu prim paketi için geri çağırma (Clawback) olayı tetiklenmemiştir.</p>
 <p className="text-[10px] mt-1 text-emerald-600/50">Risk-odaklı performans standartlara uygundur.</p>
 </div>
 );
 }

 return (
 <div className="space-y-4">
 <h4 className="text-xs font-black text-red-700 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
 <AlertOctagon size={13} className="text-red-500" />
 Clawback / Malus Olayları
 </h4>

 {(clawbacks || []).map((cb, idx) => {
 const stColor = CLAWBACK_STATUS_MAP[cb?.recovery_status as keyof typeof CLAWBACK_STATUS_MAP] ?? CLAWBACK_STATUS_MAP['İncelemede'];

 return (
 <motion.div
 key={cb?.id ?? idx}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: idx * 0.1 }}
 className="bg-red-50/30 border border-red-100 p-4 rounded-xl shadow-sm relative overflow-hidden"
 >
 {/* Dekoratif Çizgi */}
 <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-orange-400" />
 
 <div className="flex items-start justify-between gap-3 mb-2">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1.5">
 <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-current', stColor)}>
 {cb?.recovery_status ?? 'İncelemede'}
 </span>
 <span className="text-[10px] text-slate-500 font-medium">Olay Tarihi: {cb?.trigger_date ?? 'Bilinmiyor'}</span>
 </div>
 <h5 className="text-[11px] font-bold text-slate-800 leading-snug">{cb?.trigger_event ?? 'Tanımsız Olay'}</h5>
 </div>
 <div className="text-right">
 <div className="text-[9px] font-bold text-red-400 uppercase">İptal / İade Tutarı</div>
 <div className="text-base font-black text-red-600 font-mono">-{formatCurrency(cb?.clawback_amount)}</div>
 </div>
 </div>

 <p className="text-[11px] text-slate-600 leading-relaxed bg-white/60 p-2.5 rounded-lg border border-red-50">
 <strong className="text-slate-700 block mb-0.5">Gerekçe:</strong>
 {cb?.justification ?? 'Gerekçe belirtilmemiş.'}
 </p>

 {cb?.board_resolution_ref && (
 <div className="mt-2.5 flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
 <Scale size={11} className="text-slate-400" /> YK Kararı: <span className="text-slate-700">{cb.board_resolution_ref}</span>
 </div>
 )}
 </motion.div>
 );
 })}
 </div>
 );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RemunerationPage() {
 const { data: bonuses, isLoading } = useBonuses();
 const [selectedId, setSelectedId] = useState<string | null>(null);

 const selected = (bonuses || []).find(b => b?.id === selectedId) ?? null;

 // Güvenli hesaplamalar (bonus?.amount ?? 0)
 const stats = {
 total: (bonuses || []).length,
 clawbacks: (bonuses || []).filter(b => b?.status === 'İptal Edildi (Clawback)').length,
 totalBonus: (bonuses || []).reduce((acc, b) => acc + (b?.awarded_bonus ?? 0), 0),
 deferred: (bonuses || []).reduce((acc, b) => acc + (b?.deferred_amount ?? 0), 0),
 };

 return (
 <div className="min-h-screen p-4">
 {/* Header */}
 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
 <div className="flex items-center gap-3 mb-1">
 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-black flex items-center justify-center shadow-sm">
 <Briefcase className="w-5 h-5 text-amber-200" />
 </div>
 <div>
 <h1 className="text-xl font-black text-slate-900 tracking-tight">Executive Remuneration & Clawback Tracker</h1>
 <p className="text-xs text-slate-500">Üst Yönetim Ücretlendirme Havuzu ve Risk-Odaklı Prim İptal (Malus) İzleyicisi — GIAS 2025</p>
 </div>
 </div>

 {/* Dashboard KPI */}
 <div className="grid grid-cols-4 gap-3 mt-4">
 {[
 { label: 'Yönetici Havuzu', value: stats.total, icon: Briefcase, color: 'text-slate-700' },
 { label: 'Verilen Toplam Prim', value: formatCurrency(stats.totalBonus), icon: DollarSign, color: 'text-emerald-700' },
 { label: 'Ertelenen Prim (Risk)',value: formatCurrency(stats.deferred), icon: AlertTriangle, color: 'text-orange-600' },
 { label: 'Clawback Vakası', value: stats.clawbacks, icon: TrendingDown, color: 'text-red-600' },
 ].map(({ label, value, icon: Icon, color }) => (
 <div key={label} className="bg-white/70 backdrop-blur-lg rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
 <Icon size={14} className={clsx(color, 'mb-1')} />
 <div className="text-xl font-black text-slate-800">{value}</div>
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
 </div>
 ))}
 </div>
 </motion.div>

 {/* Content */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
 
 {/* Sol Kolon: Prim Havuzu Listesi */}
 <div className="space-y-3">
 <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
 <Award size={11} /> Üst Yönetim Prim Havuzu
 </div>

 {isLoading && (
 <div className="flex items-center justify-center py-10 text-slate-400">
 <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin mr-3" />
 <span className="text-xs font-medium">Prim kayıtları yükleniyor...</span>
 </div>
 )}

 {!isLoading && (bonuses || []).length === 0 && (
 <div className="text-center py-12 text-slate-400 rounded-2xl border-2 border-dashed border-slate-200 bg-white/40">
 <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-25" />
 <p className="text-sm font-medium">Envanterde prim kaydı bulunamadı.</p>
 </div>
 )}

 {(bonuses || []).map(bonus => (
 <BonusCard 
 key={bonus?.id} 
 bonus={bonus} 
 onSelect={() => setSelectedId(bonus?.id === selectedId ? null : bonus?.id)} 
 isSelected={bonus?.id === selectedId} 
 />
 ))}
 </div>

 {/* Sağ Kolon: Detay ve Clawback (Malus) */}
 <div>
 <AnimatePresence mode="wait">
 {selected ? (
 <motion.div
 key={selected.id}
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 20 }}
 transition={{ duration: 0.2 }}
 className="space-y-4"
 >
 {/* Yönetici Özeti */}
 <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200 p-5 shadow-sm">
 <div className="flex items-start justify-between mb-3">
 <div>
 <h2 className="text-base font-black text-slate-900 mb-0.5">{selected.executive_name}</h2>
 <div className="text-xs text-slate-500 font-medium">
 {selected.title} <span className="text-slate-300 mx-1">|</span> {selected.department}
 </div>
 </div>
 <div className="text-right">
 <div className="text-[10px] font-bold text-slate-400 uppercase">Performans Yılı</div>
 <div className="text-sm font-black text-slate-700">{selected.performance_year}</div>
 </div>
 </div>

 <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between mb-2">
 <div>
 <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Risk Uyarlanmış Not (RAR)</span>
 <span className={clsx(
 "text-lg font-black px-3 py-1 rounded-lg border",
 RATING_MAP[selected?.risk_adjusted_rating as keyof typeof RATING_MAP]?.bg,
 RATING_MAP[selected?.risk_adjusted_rating as keyof typeof RATING_MAP]?.color
 )}>
 {selected.risk_adjusted_rating}
 </span>
 </div>
 {/* Hak ediş */}
 {selected.vesting_date && (
 <div className="text-right">
 <span className="text-[10px] font-bold text-slate-400 uppercase block">Hak Ediş (Vesting) Tarihi</span>
 <span className="text-xs font-bold text-slate-700">{new Date(selected.vesting_date).toLocaleDateString()}</span>
 </div>
 )}
 </div>
 </div>

 {/* Clawback Panel (Sadece olay varsa kırmızı, yoksa yeşil boşluk) */}
 <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-slate-200 p-5 shadow-sm">
 <ClawbackPanel bonusId={selected.id} />
 </div>
 </motion.div>
 ) : (
 <motion.div
 key="empty"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="flex flex-col items-center justify-center h-64 text-slate-400 rounded-2xl border-2 border-dashed border-slate-200 bg-white/40"
 >
 <Scale className="w-10 h-10 mb-3 opacity-20" />
 <p className="text-sm font-medium">Soldan bir yönetici prim paketi seçin</p>
 <p className="text-xs mt-1">Geri çağırma (Clawback) vakaları ve malus detayları burada görülür</p>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 </div>
 </div>
 );
}
