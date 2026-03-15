/**
 * LossDashboard — ORM Loss & Fines Ana Dashboard Widget
 * widgets/LossDashboard/index.tsx (Wave 56)
 *
 * C-Level finansal tablo görünümü · Apple Glassmorphism · %100 Light Mode
 */

import {
 formatTRY,
 useMarkFinePaid,
 useOperationalLosses,
 useOrmKPI,
 useRegulatoryFines,
 useUpdateLossStatus,
 type LossStatus,
 type OperationalLoss, type RegulatoryFine,
} from '@/features/orm-losses/api';
import { AnimatePresence, motion } from 'framer-motion';
import {
 AlertTriangle,
 BadgeDollarSign,
 CheckCircle2,
 ChevronRight,
 FileWarning,
 Loader2,
 Scale,
 TrendingDown
} from 'lucide-react';
import { useState } from 'react';

// ─── Sabitler ─────────────────────────────────────────────────────────────────

const EVENT_TYPE_LABELS: Record<string, string> = {
 INTERNAL_FRAUD: 'İç Hile',
 EXTERNAL_FRAUD: 'Dış Hile',
 EMPLOYMENT_PRACTICES: 'Çalışan Uygulamaları',
 CLIENTS_PRODUCTS: 'Müşteri/Ürün',
 DAMAGE_TO_ASSETS: 'Varlık Hasarı',
 BUSINESS_DISRUPTION: 'İş Kesintisi',
 EXECUTION_DELIVERY: 'İşlem Hatası',
 REGULATORY_NON_COMPLIANCE: 'Mevzuat İhlali',
};

const STATUS_CFG: Record<LossStatus, { bg: string; text: string; border: string; label: string }> = {
 OPEN: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Açık' },
 UNDER_REVIEW: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'İncelemede' },
 PROVISIONED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Karşılıklı' },
 CLOSED: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', label: 'Kapalı' },
 LITIGATED: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Hukuki Süreç' },
};

const FINE_STATUS_CFG: Record<string, { bg: string; text: string; label: string }> = {
 UNPAID: { bg: 'bg-red-100 text-red-700', text: 'text-red-700', label: 'Ödenmedi' },
 PARTIAL: { bg: 'bg-amber-100 text-amber-700', text: 'text-amber-700', label: 'Kısmi Ödeme' },
 PAID: { bg: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-700', label: 'Ödendi' },
 CONTESTED: { bg: 'bg-purple-100 text-purple-700', text: 'text-purple-700', label: 'İtiraz Edildi' },
 WAIVED: { bg: 'bg-slate-100 text-slate-500', text: 'text-slate-500', label: 'İptal' },
};

// ─── Kayıp Satır Bileşeni ─────────────────────────────────────────────────────

function LossRow({ loss, index }: { loss: OperationalLoss; index: number }) {
 const [expanded, setExpanded] = useState(false);
 const updateStatus = useUpdateLossStatus();
 const cfg = STATUS_CFG[loss.status] ?? STATUS_CFG.OPEN;

 const recoveryPct = Math.round(
 ((loss.recovery_amount || 0) + (loss.insurance_recovery || 0)) /
 (loss.gross_loss || 1) * 100
 );

 return (
 <>
 <motion.tr
 initial={{ opacity: 0, y: 4 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.04 }}
 onClick={() => setExpanded(!expanded)}
 className="cursor-pointer hover:bg-slate-50/80 border-b border-slate-100 transition-colors"
 >
 <td className="px-4 py-3">
 <span className="text-[10px] font-mono text-slate-500">{loss.event_code}</span>
 </td>
 <td className="px-4 py-3">
 <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
 {cfg.label}
 </span>
 </td>
 <td className="px-4 py-3">
 <p className="text-xs font-semibold text-slate-700 line-clamp-1 max-w-[180px]">{loss.description}</p>
 <p className="text-[9px] text-slate-400 mt-0.5">{EVENT_TYPE_LABELS[loss.event_type] ?? loss.event_type}</p>
 </td>
 <td className="px-4 py-3 text-right">
 <p className="text-sm font-black text-red-700 tabular-nums">{formatTRY(loss.gross_loss)}</p>
 <p className="text-[9px] text-slate-400">brüt kayıp</p>
 </td>
 <td className="px-4 py-3 text-right">
 <p className="text-sm font-bold text-slate-600 tabular-nums">{formatTRY(loss.net_loss)}</p>
 <p className="text-[9px] text-emerald-600">Kurtarma: {recoveryPct}%</p>
 </td>
 <td className="px-4 py-3 text-center">
 {loss.bddk_reportable && !loss.reported_to_bddk ? (
 <span className="text-[9px] font-black px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full border border-red-200 animate-pulse">
 ⚠ BDDK Bekliyor
 </span>
 ) : loss.bddk_reportable ? (
 <CheckCircle2 size={13} className="text-emerald-500 mx-auto" />
 ) : (
 <span className="text-[10px] text-slate-300">—</span>
 )}
 </td>
 <td className="px-4 py-3">
 <ChevronRight
 size={13}
 className={`text-slate-300 transition-transform ${expanded ? 'rotate-90' : ''}`}
 />
 </td>
 </motion.tr>

 <AnimatePresence>
 {expanded && (
 <tr>
 <td colSpan={7} className="px-4 pb-4">
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3"
 >
 <div className="grid grid-cols-2 gap-3 text-xs">
 {loss.root_cause && (
 <div>
 <p className="font-bold text-slate-500 mb-0.5">Kök Neden</p>
 <p className="text-slate-700">{loss.root_cause}</p>
 </div>
 )}
 {loss.control_failure && (
 <div>
 <p className="font-bold text-slate-500 mb-0.5">Kontrol Başarısızlığı</p>
 <p className="text-slate-700">{loss.control_failure}</p>
 </div>
 )}
 </div>

 {loss.status !== 'CLOSED' && (
 <div className="flex items-center gap-2 pt-1">
 <p className="text-[9px] font-bold text-slate-500">Durum Güncelle:</p>
 {(['UNDER_REVIEW', 'PROVISIONED', 'CLOSED'] as LossStatus[]).map((s) => (
 <button
 key={s}
 onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: loss.id, status: s }); }}
 disabled={updateStatus.isPending}
 className={`text-[9px] font-bold px-2 py-1 rounded-lg border transition-colors
 ${STATUS_CFG[s].bg} ${STATUS_CFG[s].text} ${STATUS_CFG[s].border}
 hover:shadow-sm disabled:opacity-40`}
 >
 {STATUS_CFG[s].label}
 </button>
 ))}
 </div>
 )}
 </motion.div>
 </td>
 </tr>
 )}
 </AnimatePresence>
 </>
 );
}

// ─── Ceza Satır Bileşeni ──────────────────────────────────────────────────────

function FineRow({ fine, index }: { fine: RegulatoryFine; index: number }) {
 const markPaid = useMarkFinePaid();
 const cfg = FINE_STATUS_CFG[fine.status] ?? FINE_STATUS_CFG.UNPAID;

 const daysUntilDeadline = fine.payment_deadline
 ? Math.ceil((new Date(fine.payment_deadline).getTime() - Date.now()) / 86400000)
 : null;

 return (
 <motion.tr
 initial={{ opacity: 0, y: 4 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.04 }}
 className="border-b border-slate-100"
 >
 <td className="px-4 py-3">
 <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
 {fine.regulator}
 </span>
 </td>
 <td className="px-4 py-3">
 <p className="text-xs font-semibold text-slate-700 line-clamp-1 max-w-[220px]">{fine.subject}</p>
 {fine.legal_basis && (
 <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">{fine.legal_basis}</p>
 )}
 </td>
 <td className="px-4 py-3 text-right">
 <p className="text-sm font-black text-red-700 tabular-nums">{formatTRY(fine.fine_amount)}</p>
 </td>
 <td className="px-4 py-3 text-center">
 <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${cfg.bg}`}>
 {cfg.label}
 </span>
 </td>
 <td className="px-4 py-3 text-center">
 {daysUntilDeadline !== null ? (
 <span className={`text-[10px] font-black ${daysUntilDeadline < 10 ? 'text-red-600 animate-pulse' : 'text-slate-600'}`}>
 {daysUntilDeadline < 0 ? 'Geçti!' : `${daysUntilDeadline}g`}
 </span>
 ) : <span className="text-slate-300 text-xs">—</span>}
 </td>
 <td className="px-4 py-3">
 {(fine.status === 'UNPAID' || fine.status === 'PARTIAL') && (
 <button
 onClick={() => markPaid.mutate({ id: fine.id, paid_amount: fine.fine_amount })}
 disabled={markPaid.isPending}
 className="text-[9px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 border border-emerald-200 disabled:opacity-40 transition-colors"
 >
 Ödendi İşaretle
 </button>
 )}
 </td>
 </motion.tr>
 );
}

// ─── Ana LossDashboard ────────────────────────────────────────────────────────

type TabKey = 'LOSSES' | 'FINES';

export function LossDashboard() {
 const [activeTab, setActiveTab] = useState<TabKey>('LOSSES');
 const [filterStatus, setFilterStatus] = useState<string>('ALL');

 const { data: losses = [], isLoading: lossLoading } = useOperationalLosses(
 filterStatus !== 'ALL' ? { status: filterStatus as any } : undefined
 );
 const { data: fines = [], isLoading: fineLoading } = useRegulatoryFines();
 const { data: kpi } = useOrmKPI();

 return (
 <div className="h-full flex flex-col bg-slate-50/50">
 {/* Başlık */}
 <div className="px-4 pt-4 pb-5 bg-white/70 backdrop-blur-lg border-b border-slate-200 shadow-sm">
 <div className="flex items-center gap-3 mb-5">
 <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
 <TrendingDown size={20} className="text-white" />
 </div>
 <div>
 <h1 className="text-xl font-black text-slate-800 tracking-tight">ORM Kayıp Veritabanı</h1>
 <p className="text-xs text-slate-500 mt-0.5">Operasyonel Kayıp & Ceza Takip Sistemi · Wave 56</p>
 </div>
 </div>

 {/* KPI Bant */}
 <div className="grid grid-cols-5 gap-3">
 {[
 { label: 'Toplam Olay', value: kpi?.totalLosses ?? '—', icon: FileWarning, color: 'text-slate-700' },
 { label: 'Brüt Kayıp', value: kpi ? formatTRY(kpi.totalGrossLoss) : '—', icon: TrendingDown, color: 'text-red-600' },
 { label: 'Net Kayıp', value: kpi ? formatTRY(kpi.totalNetLoss) : '—', icon: Scale, color: 'text-orange-600' },
 { label: 'BDDK Bekleyen', value: kpi?.bddkPendingCount ?? '—', icon: AlertTriangle, color: 'text-amber-600' },
 { label: 'Ödenmemiş Ceza', value: kpi ? formatTRY(kpi.unpaidFinesTotal) : '—', icon: BadgeDollarSign, color: 'text-purple-600' },
 ].map(({ label, value, icon: Icon, color }) => (
 <div key={label} className="bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-center">
 <Icon size={15} className={`${color} mx-auto mb-1`} />
 <p className="text-sm font-black text-slate-800 tabular-nums">{value}</p>
 <p className="text-[9px] text-slate-400 font-bold uppercase leading-tight">{label}</p>
 </div>
 ))}
 </div>

 {/* Tab Switcher */}
 <div className="flex gap-1 mt-4">
 {[
 { key: 'LOSSES' as TabKey, label: `Kayıp Olayları (${losses.length})` },
 { key: 'FINES' as TabKey, label: `İdari Cezalar (${fines.length})` },
 ].map(({ key, label }) => (
 <button
 key={key}
 onClick={() => setActiveTab(key)}
 className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
 activeTab === key
 ? 'bg-slate-800 text-white shadow-sm'
 : 'text-slate-600 hover:bg-slate-100'
 }`}
 >
 {label}
 </button>
 ))}

 {activeTab === 'LOSSES' && (
 <div className="ml-auto flex gap-1">
 {['ALL', 'OPEN', 'UNDER_REVIEW', 'PROVISIONED'].map((s) => (
 <button
 key={s}
 onClick={() => setFilterStatus(s)}
 className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold transition-all ${
 filterStatus === s
 ? 'bg-blue-600 text-white'
 : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
 }`}
 >
 {s === 'ALL' ? 'Tümü' : STATUS_CFG[s as LossStatus]?.label ?? s}
 </button>
 ))}
 </div>
 )}
 </div>
 </div>

 {/* Tablo */}
 <div className="flex-1 overflow-auto p-4">
 {activeTab === 'LOSSES' ? (
 lossLoading ? (
 <div className="flex items-center justify-center py-20">
 <Loader2 size={24} className="animate-spin text-slate-400" />
 <span className="ml-2 text-sm text-slate-500">Kayıp olayları yükleniyor…</span>
 </div>
 ) : (
 <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
 <table className="w-full text-left">
 <thead>
 <tr className="bg-slate-50/80 border-b border-slate-200">
 {['Olay Kodu', 'Durum', 'Açıklama', 'Brüt Kayıp', 'Net Kayıp', 'BDDK', ''].map((h) => (
 <th key={h} className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider">
 {h}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {(losses || []).length === 0 ? (
 <tr><td colSpan={7} className="text-center py-12 text-sm text-slate-400">Kayıt bulunamadı.</td></tr>
 ) : (
 (losses || []).map((loss, i) => (
 <LossRow key={loss.id} loss={loss} index={i} />
 ))
 )}
 </tbody>
 </table>
 </div>
 )
 ) : (
 fineLoading ? (
 <div className="flex items-center justify-center py-20">
 <Loader2 size={24} className="animate-spin text-slate-400" />
 <span className="ml-2 text-sm text-slate-500">Cezalar yükleniyor…</span>
 </div>
 ) : (
 <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
 <table className="w-full text-left">
 <thead>
 <tr className="bg-slate-50/80 border-b border-slate-200">
 {['Kurum', 'Konu', 'Tutar', 'Durum', 'Son Tarih', 'Aksiyon'].map((h) => (
 <th key={h} className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-wider">
 {h}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {(fines || []).length === 0 ? (
 <tr><td colSpan={6} className="text-center py-12 text-sm text-slate-400">Kayıt bulunamadı.</td></tr>
 ) : (
 (fines || []).map((fine, i) => (
 <FineRow key={fine.id} fine={fine} index={i} />
 ))
 )}
 </tbody>
 </table>
 </div>
 )
 )}
 </div>
 </div>
 );
}
