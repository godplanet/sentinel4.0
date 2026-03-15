/**
 * BaselIVDashboard — Ana Sayfa (Wave 69)
 * features/basel-iv/index.tsx
 *
 * Basel IV RWA Hesaplama Tabloları ve Sermaye Yeterlilik İbresi (Gauge).
 * C-Level · Apple Glassmorphism · %100 Light Mode
 */

import { CapitalAdequacyGauge } from '@/widgets/CapitalAdequacyGauge';
import { AnimatePresence, motion } from 'framer-motion';
import {
 Briefcase, Calculator,
 CheckCircle2,
 Clock,
 Filter,
 ShieldCheck,
 Target
} from 'lucide-react';
import { useState } from 'react';
import {
 formatTRY,
 useRWA,
 type RwaCalculation
} from './api';

// ─── Sabitler ─────────────────────────────────────────────────────────────────

const ASSET_CLASS_LABELS: Record<string, string> = {
 CORPORATE: 'Kurumsal',
 RETAIL: 'Bireysel',
 MORTGAGE: 'İpotekli (Mortgage)',
 SOVEREIGN: 'Ülke / Hazine',
 BANK: 'Banka / Finansal',
 EQUITY: 'Hisse Senedi',
 OTHER: 'Diğer'
};

// ─── RWA Tablosu Satırı ───────────────────────────────────────────────────────

function RwaRow({ row, index }: { row: RwaCalculation; index: number }) {
 const [expanded, setExpanded] = useState(false);

 return (
 <>
 <motion.tr
 initial={{ opacity: 0, y: 5 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: Math.min(index * 0.02, 0.5) }}
 onClick={() => setExpanded(!expanded)}
 className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors cursor-pointer"
 >
 <td className="px-3 py-3">
 <p className="text-[10px] font-black text-slate-700 font-mono tracking-tight">{row.calc_code}</p>
 <p className="text-[9px] text-slate-400 mt-0.5">{new Date(row.calculation_date).toLocaleDateString('tr-TR')}</p>
 </td>
 <td className="px-3 py-3">
 <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
 {ASSET_CLASS_LABELS[row.asset_class] ?? row.asset_class}
 </span>
 </td>
 <td className="px-3 py-3 text-right">
 <span className="text-[11px] font-bold text-slate-700">{formatTRY(row.exposure_amount)}</span>
 </td>
 <td className="px-3 py-3 text-center">
 <span className="text-[10px] font-mono text-slate-500 font-black">%{(row.ccf_pct).toFixed(0)}</span>
 </td>
 <td className="px-3 py-3 text-center">
 <span className="text-[10px] font-mono text-slate-500 font-black">%{(row.risk_weight_pct).toFixed(0)}</span>
 {row.crm_applied && <span className="text-[8px] ml-1 text-emerald-500 font-bold" title="CRM Applied">(CRM)</span>}
 </td>
 <td className="px-3 py-3 text-right">
 <span className="text-sm font-black text-indigo-700 tabular-nums">{formatTRY(row.rwa_amount)}</span>
 </td>
 <td className="px-3 py-3 text-center">
 {row.is_approved ? (
 <CheckCircle2 size={14} className="text-emerald-500 mx-auto" />
 ) : (
 <Clock size={14} className="text-amber-500 mx-auto" />
 )}
 </td>
 </motion.tr>

 <AnimatePresence>
 {expanded && (
 <tr className="bg-slate-50">
 <td colSpan={7} className="px-4 pb-3">
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="pt-2"
 >
 <div className="bg-white rounded-lg border border-slate-200 p-3 flex gap-4 shadow-sm">
 <div className="flex-1">
 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 items-center gap-1 flex">
 <Calculator size={10} /> Basel IV RWA Formülü
 </p>
 <div className="text-[10px] font-mono text-slate-600 bg-slate-100 p-2 rounded border border-slate-200 inline-block">
 EAD ({formatTRY(row.exposure_amount)}) × CCF (%{row.ccf_pct}) × Risk Ağırlığı (%{row.risk_weight_pct}) = <span className="font-bold text-indigo-700">{formatTRY(row.rwa_amount)}</span>
 </div>
 </div>
 {row.crm_applied && row.crm_details && (
 <div className="flex-1 border-l border-slate-100 pl-4">
 <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1">
 <ShieldCheck size={10} /> Kredi Risk Azaltımı (CRM)
 </p>
 <p className="text-[10px] font-semibold text-slate-700 leading-relaxed">{row.crm_details}</p>
 </div>
 )}
 <div className="w-[150px] border-l border-slate-100 pl-4">
 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
 <Target size={10} /> Sorumlu
 </p>
 <p className="text-[10px] font-bold text-slate-700">{row.analyst}</p>
 <p className="text-[9px] text-slate-500 mt-0.5">{row.is_approved ? 'Kontrol Onaylandı' : 'Taslak Halinde'}</p>
 </div>
 </div>
 </motion.div>
 </td>
 </tr>
 )}
 </AnimatePresence>
 </>
 );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────

export function BaselIVDashboard() {
 const [filterClass, setFilterClass] = useState<string>('ALL');

 const { data: calculations = [], isLoading } = useRWA(
 filterClass !== 'ALL' ? { assetClass: filterClass } : undefined
 );
 
 const safeCalcs = calculations || [];

 return (
 <div className="h-full flex flex-col bg-slate-50/50 overflow-auto">
 {/* Header */}
 <div className="px-4 pt-4 pb-4 bg-white/70 backdrop-blur-lg border-b border-slate-200 shadow-sm z-10 flex justify-between items-end">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg shadow-slate-500/20">
 <ShieldCheck size={22} className="text-white" />
 </div>
 <div>
 <h1 className="text-2xl font-black text-slate-800 tracking-tight">Basel IV Capital Adequacy</h1>
 <p className="text-xs text-slate-500 mt-0.5">Sermaye Yeterlilik Rasyosu & Risk Ağırlıklı Varlık (RWA) Modeli · Wave 69</p>
 </div>
 </div>
 </div>

 <div className="p-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
 
 {/* Left: Summary KPIs & Gauge */}
 <div className="xl:col-span-1 flex flex-col gap-4">
 <div className="h-[280px]">
 <CapitalAdequacyGauge period="2026-Q1" />
 </div>
 
 {/* Mini History */}
 <div className="bg-white/70 backdrop-blur-lg border border-slate-200 rounded-2xl shadow-sm p-5">
 <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
 <Filter size={14} className="text-slate-400" /> SYR Tarihçesi
 </h3>
 <div className="space-y-3">
 <div className="flex items-center justify-between py-2 border-b border-slate-100">
 <div>
 <p className="text-[10px] font-black text-slate-600">2026-Q1 (Mevcut)</p>
 <p className="text-[9px] text-slate-400">Piyasa + Kredi + Op.</p>
 </div>
 <span className="text-sm font-black text-emerald-600">%14.19</span>
 </div>
 <div className="flex items-center justify-between py-2 border-b border-slate-100 opacity-60">
 <div>
 <p className="text-[10px] font-black text-slate-600">2025-Q4</p>
 <p className="text-[9px] text-slate-400">Gerçekleşen</p>
 </div>
 <span className="text-sm font-black text-slate-600">%13.79</span>
 </div>
 </div>
 </div>
 </div>

 {/* Right: RWA Calculations Matrix */}
 <div className="xl:col-span-2 flex flex-col">
 <div className="flex items-center justify-between mb-3">
 <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
 <Briefcase size={16} className="text-indigo-500" />
 Alt Portföy RWA Dağılım Matrixi
 </h2>
 <div className="flex gap-1.5 overflow-x-auto pb-1">
 {['ALL', 'CORPORATE', 'RETAIL', 'MORTGAGE', 'SOVEREIGN'].map((s) => (
 <button
 key={s}
 onClick={() => setFilterClass(s)}
 className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
 filterClass === s ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
 }`}
 >
 {s === 'ALL' ? 'Tümü' : ASSET_CLASS_LABELS[s]}
 </button>
 ))}
 </div>
 </div>
 
 <div className="bg-white/70 backdrop-blur-lg border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
 <div className="overflow-x-auto">
 <table className="w-full text-left whitespace-nowrap">
 <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
 <tr>
 {['Hesap Kodu', 'Sınıf', 'EAD (Risk Tutarı)', 'CCF', 'R.A.', 'Hesaplanan RWA', 'Onay'].map((h, i) => (
 <th key={h} className={`px-3 py-3 text-[9px] font-black text-slate-400 uppercase tracking-wider ${i === 2 || i === 5 ? 'text-right' : i === 3 || i === 4 || i === 6 ? 'text-center' : ''}`}>
 {h}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {isLoading ? (
 <tr><td colSpan={7} className="text-center py-20 text-slate-400">RWA Hesaplamaları Bekleniyor...</td></tr>
 ) : safeCalcs.length === 0 ? (
 <tr><td colSpan={7} className="text-center py-20 text-slate-400">Bu sınıfta kayıt bulunamadı.</td></tr>
 ) : (
 (safeCalcs || []).map((c, i) => <RwaRow key={c.id} row={c} index={i} />)
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 
 </div>
 </div>
 );
}
