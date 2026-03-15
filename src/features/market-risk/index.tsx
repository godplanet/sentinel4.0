/**
 * MarketRiskPage — Ana Sayfa (Wave 63)
 * features/market-risk/index.tsx
 *
 * HFT/Algo Trading logları (solda) + Spoofing Radarı (sağda)
 * C-Level · Apple Glassmorphism · %100 Light Mode
 */

import { AlgoTradingMonitor } from '@/widgets/AlgoTradingMonitor';
import { motion } from 'framer-motion';
import {
 Activity, BarChart4,
 Clock,
 ShieldAlert,
 Target,
 X,
 Zap
} from 'lucide-react';
import { useState } from 'react';
import {
 formatUSD,
 useAlgoLogs, useMarketAlerts, useMarketRiskKPI,
 type AlgoLog
} from './api';

// ─── HFT Log Satırı ───────────────────────────────────────────────────────────

function HftLogRow({ log, index }: { log: AlgoLog; index: number }) {
 const isBuy = log.side === 'BUY';
 return (
 <motion.tr
 initial={{ opacity: 0, y: 5 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: Math.min(index * 0.02, 0.5) }}
 className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors font-mono text-[9px] ${log.is_canceled ? 'opacity-40' : ''}`}
 >
 <td className="px-3 py-2 text-slate-400">
 {new Date(log.timestamp).toLocaleTimeString('tr-TR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })}
 </td>
 <td className="px-3 py-2 font-black text-slate-700">{log.instrument}</td>
 <td className="px-3 py-2">
 <span className={`px-1 rounded font-bold ${isBuy ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
 {log.side}
 </span>
 </td>
 <td className="px-3 py-2 text-slate-500">{log.order_type}</td>
 <td className="px-3 py-2 text-right font-black text-slate-800">{log.price.toFixed(5)}</td>
 <td className="px-3 py-2 text-right font-semibold text-slate-600">{log.volume.toLocaleString()}</td>
 <td className="px-3 py-2 text-center text-slate-400">{log.algo_strategy_id ?? 'MANUAL'}</td>
 <td className="px-3 py-2 text-right">
 {log.is_canceled ? (
 <span className="text-red-500 font-bold">İPTAL</span>
 ) : (
 <span className={`${log.execution_ms > 10 ? 'text-amber-500' : 'text-emerald-500'}`}>{log.execution_ms}ms</span>
 )}
 </td>
 </motion.tr>
 );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────

export function MarketRiskPage() {
 const [filterInstrument, setFilterInstrument] = useState<string>('ALL');

 const { data: logs = [], isLoading: logsLoading } = useAlgoLogs(
 filterInstrument !== 'ALL' ? { instrument: filterInstrument, limit: 100 } : { limit: 100 }
 );
 const { data: alerts = [] } = useMarketAlerts();
 
 const safeLogs = logs || [];
 const safeAlerts = alerts || [];
 const kpi = useMarketRiskKPI(safeLogs, safeAlerts);

 return (
 <div className="h-full flex flex-col bg-slate-50/50">
 {/* Header */}
 <div className="px-4 pt-4 pb-4 bg-white/70 backdrop-blur-lg border-b border-slate-200 shadow-sm z-10">
 <div className="flex items-center gap-3 mb-4">
 <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-slate-800 flex items-center justify-center shadow-lg shadow-indigo-500/20">
 <BarChart4 size={22} className="text-white" />
 </div>
 <div>
 <h1 className="text-2xl font-black text-slate-800 tracking-tight">Market Risk & Algo-Trading</h1>
 <p className="text-xs text-slate-500 mt-0.5">Gerçek Zamanlı HFT İzleme ve Flash Crash Dedektörü · Wave 63</p>
 </div>
 </div>

 {/* KPI Bant */}
 <div className="grid grid-cols-5 gap-3">
 {[
 { label: 'Son 100 Emir Hacmi', value: formatUSD(kpi.totalVoumeUSD), icon: Activity, color: 'text-indigo-700', bg: 'bg-indigo-50' },
 { label: 'Ortalama Gecikme', value: `${kpi.avgLatencyMs} ms`, icon: Clock, color: 'text-emerald-700', bg: 'bg-emerald-50' },
 { label: 'İptal Oranı', value: `%${kpi.canceledOrderRatio}`, icon: X, color: 'text-rose-600', bg: 'bg-rose-50' },
 { label: 'Piyasa Anomalisi', value: kpi.criticalAlerts, icon: ShieldAlert, color: 'text-red-700', bg: 'bg-red-50' },
 { label: 'Spoofing Şüphesi', value: kpi.spoofingCount, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
 ].map(({ label, value, icon: Icon, color, bg }) => (
 <div key={label} className="bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-center flex flex-col items-center justify-center">
 <div className={`p-1.5 rounded-lg ${bg} mb-1.5`}>
 <Icon size={14} className={color} />
 </div>
 <p className="text-lg font-black text-slate-800 tabular-nums leading-none">{value}</p>
 <p className="text-[9px] text-slate-500 font-bold uppercase leading-tight mt-1">{label}</p>
 </div>
 ))}
 </div>
 </div>

 {/* Main Content */}
 <div className="flex-1 overflow-hidden flex gap-0">
 {/* Left: HFT Order Book / Terminal */}
 <div className="flex-1 overflow-auto bg-slate-100/50 p-4 flex flex-col">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
 <Zap size={14} className="text-amber-500" /> Canlı Emir Akışı (Son 100)
 </h2>
 <div className="flex gap-1.5">
 {['ALL', 'USD/TRY', 'EUR/USD', 'XAU/USD'].map((s) => (
 <button
 key={s}
 onClick={() => setFilterInstrument(s)}
 className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
 filterInstrument === s ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
 }`}
 >
 {s === 'ALL' ? 'Tümü' : s}
 </button>
 ))}
 </div>
 </div>

 <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
 <div className="overflow-x-auto">
 <table className="w-full text-left whitespace-nowrap">
 <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
 <tr>
 {['Zaman', 'Enstrüman', 'Yön', 'Tip', 'Fiyat', 'Hacim', 'Algoritma', 'Gecikme'].map((h, i) => (
 <th key={h} className={`px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-wider ${i >= 4 && i <= 5 ? 'text-right' : i === 7 ? 'text-right' : ''}`}>
 {h}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {logsLoading ? (
 <tr><td colSpan={8} className="text-center py-20 text-slate-400"><div className="animate-pulse">Akış Bekleniyor...</div></td></tr>
 ) : safeLogs.length === 0 ? (
 <tr><td colSpan={8} className="text-center py-20 text-slate-400">Veri bulunamadı.</td></tr>
 ) : (
 (safeLogs || []).map((log, i) => <HftLogRow key={log.id} log={log} index={i} />)
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>

 {/* Right: Market Risk Monitor */}
 <div className="w-[420px] shrink-0 border-l border-slate-200 bg-slate-100/30 p-5 overflow-y-auto">
 <AlgoTradingMonitor />
 </div>
 </div>
 </div>
 );
}
