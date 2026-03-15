/**
 * Zakat Ledger & Participation ESG Auditor
 * Wave 79: Zekat Defteri ve ESG Uyumu (Yönetişim / Execution)
 *
 * FSD: pages/execution/ZakatLedgerPage.tsx
 * Veri: features/islamic-finance/api/zakat.ts
 * Tasarım: %100 Light Mode | Apple Glass
 */

import {
 useDisbursements,
 useNonCompliantIncome,
 useZakatLedger,
 type CorporateZakatObligation
} from '@/features/islamic-finance/api/zakat';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
 AlertTriangle,
 Archive,
 Ban,
 Calculator,
 CheckCircle2,
 ChevronRight,
 Droplets,
 FileText,
 Gift,
 Receipt,
 Scale,
 ShieldAlert
} from 'lucide-react';
import { useState } from 'react';

// ─── Formatting ─────────────────────────────────────────────────────────────

const formatCurrency = (val: number | null) => {
 const num = val ?? 0;
 if (num >= 1_000_000) return `₺${(num / 1_000_000).toFixed(2)}M`;
 if (num >= 1_000) return `₺${(num / 1_000).toFixed(0)}K`;
 return `₺${num}`;
};

const ZAKAT_STATUS_MAP = {
 'Draft': { color: 'text-slate-600', border: 'border-slate-200', bg: 'bg-slate-50' },
 'Pending Approval': { color: 'text-orange-700', border: 'border-orange-200', bg: 'bg-orange-50' },
 'Approved': { color: 'text-blue-700', border: 'border-blue-200', bg: 'bg-blue-50' },
 'Disbursing': { color: 'text-indigo-700', border: 'border-indigo-200', bg: 'bg-indigo-50' },
 'Paid': { color: 'text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50' },
} as const;

const DISBURSE_STATUS_MAP = {
 'Pending': 'bg-orange-100 text-orange-700',
 'Processing': 'bg-blue-100 text-blue-700',
 'Completed': 'bg-emerald-100 text-emerald-700',
 'Failed': 'bg-red-100 text-red-700',
} as const;


// ─── Zakat Obligation Card ──────────────────────────────────────────────────

function ZakatCard({ item, onSelect, isSelected }: { item: CorporateZakatObligation, onSelect: () => void, isSelected: boolean }) {
 const stColor = ZAKAT_STATUS_MAP[item?.status as keyof typeof ZAKAT_STATUS_MAP] ?? ZAKAT_STATUS_MAP['Draft'];

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
 ? 'border-emerald-400 ring-2 ring-emerald-100 shadow-lg'
 : 'border-slate-200 hover:border-emerald-200 hover:shadow-md'
 )}
 >
 <div className="flex items-start justify-between gap-3 mb-2">
 <div className="flex flex-col gap-1.5 flex-1 pr-6">
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded border border-current', stColor.bg, stColor.color, stColor.border)}>
 {item?.status}
 </span>
 {item?.approved_by_shariah_board && (
 <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 flex items-center gap-1">
 <CheckCircle2 size={9} /> Danışma Kurulu Onaylı
 </span>
 )}
 </div>
 <h3 className="text-sm font-bold text-slate-800 leading-snug truncate">
 {item?.fiscal_year} Kurumsal Zekat Matrahı
 </h3>
 </div>
 <ChevronRight size={14} className={clsx('text-slate-300 flex-shrink-0 mt-5 absolute right-4 transition-transform z-10', isSelected && 'rotate-90')} />
 </div>

 <div className="grid grid-cols-2 gap-2 mt-3 p-2 bg-slate-50/50 rounded-lg border border-slate-100 text-[10px]">
 <div>
 <span className="font-bold text-slate-400 uppercase tracking-wide block mb-0.5">Zekat Tabi Varlık</span>
 <span className="font-mono font-medium text-slate-700">{formatCurrency(item?.eligible_assets)}</span>
 </div>
 <div className="text-right">
 <span className="font-bold text-emerald-500 uppercase tracking-wide block mb-0.5">Hesaplanan Zekat</span>
 <span className="font-mono font-bold text-emerald-700 text-xs">{formatCurrency(item?.calculated_zakat)}</span>
 </div>
 </div>
 </motion.div>
 );
}

// ─── Purification (Arındırma) Panel ─────────────────────────────────────────

function PurificationPanel() {
 const { data: ncis, isLoading } = useNonCompliantIncome();

 if (isLoading) return <div className="text-xs text-slate-400 py-4">Arındırma verileri yükleniyor...</div>;

 if (!ncis || ncis.length === 0) {
 return (
 <div className="text-center py-4 text-emerald-600/60 bg-emerald-50/50 rounded-2xl border border-dashed border-emerald-200/60">
 <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-30" />
 <p className="text-xs font-semibold">Arındırılması gereken gayri-İslami (Non-Compliant) gelir bulunmamaktadır.</p>
 </div>
 );
 }

 return (
 <div className="space-y-3">
 <h4 className="text-xs font-black text-rose-700 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
 <Ban size={13} className="text-rose-500" />
 Şüpheli Gelir Arındırma (Purification)
 </h4>
 {(ncis || []).map((nci, idx) => (
 <div key={nci.id ?? idx} className="bg-rose-50/50 border border-rose-100 rounded-xl p-3 flex flex-col md:flex-row gap-3 items-start justify-between">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className={clsx(
 "text-[9px] font-bold px-1.5 py-0.5 rounded border",
 nci.purification_status === 'Purified' ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
 "bg-rose-100 text-rose-700 border-rose-200"
 )}>
 {nci.purification_status}
 </span>
 <span className="text-[10px] text-slate-500 font-medium">{new Date(nci.detection_date).toLocaleDateString()}</span>
 </div>
 <h5 className="text-xs font-bold text-slate-800">{nci.income_source}</h5>
 <p className="text-[10px] text-slate-600 mt-0.5">{nci.justification}</p>
 </div>
 <div className="text-right whitespace-nowrap">
 <span className="text-[9px] font-bold text-rose-400 uppercase block">Arındırılacak Tutar</span>
 <span className="text-sm font-black text-rose-700 font-mono">{formatCurrency(nci.amount)}</span>
 </div>
 </div>
 ))}
 </div>
 );
}

// ─── Disbursements Panel ────────────────────────────────────────────────────

function DisbursementsPanel({ obligationId }: { obligationId?: string }) {
 const { data: disbursements, isLoading } = useDisbursements();

 if (isLoading) return <div className="text-xs text-slate-400 py-4">Bağış dağıtım verileri yükleniyor...</div>;

 // Filtreleme: Eğer obligationId varsa o yıla ait dağıtımları getir. Yoksa tüm charity listesini getir.
 const filtered = obligationId 
 ? (disbursements || []).filter(d => d.obligation_id === obligationId)
 : disbursements;

 if (!filtered || filtered.length === 0) {
 return (
 <div className="text-center py-4 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
 <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
 <p className="text-xs font-semibold">Bu döneme ait ödeme / bağış kaydı bulunamadı.</p>
 </div>
 );
 }

 return (
 <div className="space-y-3">
 <h4 className="text-xs font-black text-slate-700 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
 <Droplets size={13} className="text-indigo-500" />
 Gerçekleşen Dağıtımlar (Disbursements)
 </h4>
 <div className="space-y-2">
 {(filtered || []).map(d => (
 <div key={d.id} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
 <div>
 <div className="flex items-center gap-1.5 mb-1">
 <span className={clsx("text-[9px] font-bold px-1.5 py-0.5 rounded border border-current", DISBURSE_STATUS_MAP[d.status as keyof typeof DISBURSE_STATUS_MAP])}>
 {d.status}
 </span>
 <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
 {d.fund_type}
 </span>
 </div>
 <div className="text-xs font-bold text-slate-800">{d.beneficiary_name}</div>
 {d.impact_category && <div className="text-[9px] text-slate-500">{d.impact_category}</div>}
 </div>
 <div className="text-right">
 <div className="text-[10px] text-slate-400 mb-0.5">{new Date(d.disbursement_date).toLocaleDateString()}</div>
 <div className="text-xs font-black text-indigo-700 font-mono">{formatCurrency(d.amount)}</div>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ZakatLedgerPage() {
 const { data: obligations, isLoading: loadingObs } = useZakatLedger();
 const [selectedId, setSelectedId] = useState<string | null>(null);

 const selected = (obligations || []).find(o => o.id === selectedId) ?? null;

 const totalZakat = (obligations || []).reduce((acc, o) => acc + (o?.calculated_zakat ?? 0), 0);
 const draftCount = (obligations || []).filter(o => o.status === 'Draft' || o.status === 'Pending Approval').length;

 return (
 <div className="min-h-screen p-4">
 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
 <div className="flex items-center gap-3 mb-1">
 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-teal-900 flex items-center justify-center shadow-sm border border-emerald-900/50">
 <Calculator className="w-5 h-5 text-emerald-100" />
 </div>
 <div>
 <h1 className="text-xl font-black text-slate-900 tracking-tight">Zakat Ledger & Participation ESG</h1>
 <p className="text-xs text-slate-500">Katılım Bankacılığı AAOIFI Zekat Matrahı Hesaplaması ve Gelir Arındırma Defteri</p>
 </div>
 </div>

 <div className="grid grid-cols-3 gap-3 mt-4">
 {[
 { label: 'Yıllık Zekat Yükümlülüğü', value: obligations?.length ?? 0, icon: Archive, color: 'text-slate-700' },
 { label: 'Onay Bekleyenler', value: draftCount, icon: AlertTriangle, color: 'text-orange-600' },
 { label: 'Toplam Hesaplanan Zekat', value: formatCurrency(totalZakat), icon: Gift, color: 'text-emerald-700' },
 ].map(({ label, value, icon: Icon, color }) => (
 <div key={label} className="bg-white/70 backdrop-blur-lg rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
 <Icon size={14} className={clsx(color, 'mb-1')} />
 <div className="text-xl font-black text-slate-800">{value}</div>
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
 </div>
 ))}
 </div>
 </motion.div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
 
 {/* Sol Kolon: Zekat Yılları */}
 <div className="space-y-4">
 <div>
 <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
 <FileText size={11} className="text-emerald-500" /> Kurumsal Zekat Yükümlülükleri
 </div>
 {loadingObs ? (
 <div className="text-xs text-slate-400">Yükleniyor...</div>
 ) : (
 <div className="space-y-2">
 {(obligations || []).map(o => (
 <ZakatCard 
 key={o.id} 
 item={o} 
 onSelect={() => setSelectedId(o.id === selectedId ? null : o.id)} 
 isSelected={o.id === selectedId} 
 />
 ))}
 </div>
 )}
 </div>

 <div className="pt-2">
 <PurificationPanel />
 </div>
 </div>

 {/* Sağ Kolon: Detay ve Dağıtım */}
 <div>
 <AnimatePresence mode="wait">
 {selected ? (
 <motion.div
 key={selected.id}
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 20 }}
 transition={{ duration: 0.2 }}
 className="sticky top-6 space-y-4"
 >
 <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200 p-5 shadow-sm">
 <div className="mb-4">
 <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Scale size={11} /> Matrah Özeti</div>
 <h2 className="text-lg font-black text-slate-800">
 Mali Yıl {selected.fiscal_year}
 </h2>
 <p className="text-xs text-slate-500">Hesaplama Metodu: <strong className="text-slate-700">{selected.calculation_method}</strong> (%{selected.zakat_rate})</p>
 </div>

 <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col gap-2 mb-4 text-xs">
 <div className="flex justify-between items-center border-b border-slate-200 pb-2">
 <span className="text-slate-600 font-medium">Zekata Tabi Toplam Varlıklar</span>
 <span className="font-mono text-slate-800">{formatCurrency(selected.eligible_assets)}</span>
 </div>
 <div className="flex justify-between items-center border-b border-slate-200 pb-2">
 <span className="text-slate-600 font-medium">İndirilecek Yükümlülükler (-)</span>
 <span className="font-mono text-rose-600">-{formatCurrency(selected.deductible_liabilities)}</span>
 </div>
 <div className="flex justify-between items-center pt-1 font-bold">
 <span className="text-slate-800">Net Zekat Matrahı</span>
 <span className="font-mono text-slate-900">{formatCurrency(selected.net_zakat_base)}</span>
 </div>
 <div className="flex justify-between items-center bg-emerald-100/50 p-2 rounded border border-emerald-200 mt-2 font-black">
 <span className="text-emerald-800">Tahakkuk Eden Zekat</span>
 <span className="font-mono text-emerald-700 text-sm">{formatCurrency(selected.calculated_zakat)}</span>
 </div>
 </div>
 </div>

 <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-slate-200 p-5 shadow-sm">
 <DisbursementsPanel obligationId={selected.id} />
 </div>
 </motion.div>
 ) : (
 <motion.div
 key="empty"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="flex flex-col items-center justify-center h-64 text-slate-400 rounded-2xl border-2 border-dashed border-slate-200 bg-white/40 sticky top-6"
 >
 <Calculator className="w-10 h-10 mb-3 opacity-20" />
 <p className="text-sm font-medium">Soldan bir mali dönem seçin</p>
 <p className="text-xs mt-1">AAOIFI zekat matrahı, kesintiler ve dağıtım (bağış) bilgileri burada gösterilir</p>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 </div>
 </div>
 );
}
