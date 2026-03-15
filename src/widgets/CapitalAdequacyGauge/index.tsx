/**
 * CapitalAdequacyGauge — Sermaye Yeterlilik İbresi ve Özet Widget'ı
 * widgets/CapitalAdequacyGauge/index.tsx (Wave 69)
 *
 * C-Level Apple Glassmorphism tasarım, 100% Light Mode.
 */

import {
 calculateMetrics, formatCompact,
 useCapitalRatio
} from '@/features/basel-iv/api';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, ShieldAlert, ShieldCheck, TrendingUp } from 'lucide-react';

// ─── Gauge Chart Çizimi ───────────────────────────────────────────────────────

function SVG_Gauge({ value, min, buffer, max }: { value: number, min: number, buffer: number, max: number }) {
 // Basit Yarım Daire Gauge
 const radius = 80;
 const stroke = 12;
 const cx = 100;
 const cy = 90;

 // Sınırlar
 const minAngle = (min / max) * 180;
 const targetAngle = ((min + buffer) / max) * 180;
 
 // Değer açısı (taşmaları önle)
 const clampedVal = Math.min(Math.max(value, 0), max);
 const valAngle = (clampedVal / max) * 180;
 
 // SVG Arc hesaplama fonksiyonu
 const describeArc = (x: number, y: number, r: number, startAngle: number, endAngle: number) => {
 const start = polarToCartesian(x, y, r, endAngle);
 const end = polarToCartesian(x, y, r, startAngle);
 const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
 return ["M", start.x, start.y, "A", r, r, 0, largeArcFlag, 0, end.x, end.y].join(" ");
 };

 const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
 var angleInRadians = (angleInDegrees - 180) * Math.PI / 180.0;
 return {
 x: centerX + (radius * Math.cos(angleInRadians)),
 y: centerY + (radius * Math.sin(angleInRadians))
 };
 };

 return (
 <div className="relative w-[200px] h-[110px] mx-auto">
 <svg width="200" height="110" className="drop-shadow-sm">
 {/* Arka plan yolu */}
 <path d={describeArc(cx, cy, radius, 0, 180)} fill="none" stroke="#e2e8f0" strokeWidth={stroke} strokeLinecap="round" />
 
 {/* Tehlike Bölgesi (0 - Min) */}
 <path d={describeArc(cx, cy, radius, 0, minAngle)} fill="none" stroke="#ef4444" strokeWidth={stroke} strokeLinecap="round" />
 
 {/* Tampon Bölgesi (Min - Target) */}
 <path d={describeArc(cx, cy, radius, minAngle, targetAngle)} fill="none" stroke="#f59e0b" strokeWidth={stroke} />
 
 {/* Güvenli Bölge (Target - Max) */}
 <path d={describeArc(cx, cy, radius, targetAngle, 180)} fill="none" stroke="#10b981" strokeWidth={stroke} />

 {/* İbre Çizgisi */}
 <motion.line
 x1={cx} y1={cy}
 x2={cx - (radius - 15) * Math.cos(valAngle * Math.PI / 180)}
 y2={cy - (radius - 15) * Math.sin(valAngle * Math.PI / 180)}
 stroke="#1e293b" strokeWidth="4" strokeLinecap="round"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.5 }}
 />
 {/* Merkez Noktası */}
 <circle cx={cx} cy={cy} r="6" fill="#1e293b" />
 <circle cx={cx} cy={cy} r="2" fill="#ffffff" />
 </svg>
 
 {/* Etiketler */}
 <div className="absolute top-[80px] left-[10px] text-[9px] font-bold text-slate-400">0%</div>
 <div className="absolute top-[80px] right-[10px] text-[9px] font-bold text-slate-400">{max}%</div>
 </div>
 );
}

// ─── Ana Component ────────────────────────────────────────────────────────────

export function CapitalAdequacyGauge({ period }: { period?: string }) {
 const { data: car, isLoading } = useCapitalRatio(period);

 if (isLoading) {
 return (
 <div className="h-full bg-white/70 backdrop-blur-lg border border-slate-200 rounded-2xl flex items-center justify-center animate-pulse">
 <Activity size={32} className="text-slate-300" />
 </div>
 );
 }

 if (!car) {
 return (
 <div className="h-full bg-white/70 backdrop-blur-lg border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
 <ShieldCheck size={40} className="text-slate-300 mb-3" />
 <p className="text-sm font-bold text-slate-500">CAR Raporu Bulunamadı</p>
 <p className="text-[10px] text-slate-400 mt-1">Seçili dönem için sermaye rasyosu verisi yok.</p>
 </div>
 );
 }

 const m = calculateMetrics(car);
 const isDanger = !m.isCompliant;
 const isWarning = m.isCompliant && m.bufferExcessPct < 1.0;

 return (
 <div className="bg-white/70 backdrop-blur-lg border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
 {/* Header */}
 <div className={`px-5 py-4 flex items-center justify-between shadow-inner ${
 isDanger ? 'bg-gradient-to-r from-red-800 to-rose-900' : 
 isWarning ? 'bg-gradient-to-r from-amber-600 to-orange-700' : 
 'bg-gradient-to-r from-slate-800 to-emerald-900'
 }`}>
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
 {isDanger ? <ShieldAlert size={16} className="text-red-200" /> : <ShieldCheck size={16} className="text-emerald-200" />}
 </div>
 <div>
 <h3 className="text-sm font-bold text-white">Sermaye Yeterliliği (SYR)</h3>
 <p className="text-[10px] text-white/70 mt-0.5">Dönem: {car.report_period} · {new Date(car.report_date).toLocaleDateString()}</p>
 </div>
 </div>
 <div className="text-right">
 <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">
 {car.status === 'APPROVED' ? 'ONAYLI' : 'TASLAK'}
 </span>
 </div>
 </div>

 {/* Body: Gauge */}
 <div className="p-5 flex flex-col items-center border-b border-slate-100 bg-slate-50/50">
 <SVG_Gauge value={m.actualRatioPct} min={car.min_required_ratio} buffer={car.capital_buffer_pct} max={25} />
 
 <div className="text-center mt-[-10px] zip-z-10 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
 <p className={`text-2xl font-black tabular-nums tracking-tight ${isDanger ? 'text-red-600' : 'text-emerald-600'}`}>
 %{m.actualRatioPct.toFixed(2)}
 </p>
 <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Gerçekleşen SYR</p>
 </div>

 {isDanger && (
 <p className="text-[10px] font-bold text-red-600 mt-3 flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
 <AlertTriangle size={12} /> Yasal sınırın altına inildi!
 </p>
 )}
 </div>

 {/* Metrikler */}
 <div className="grid grid-cols-2 flex-1 divide-x divide-slate-100 bg-white">
 <div className="p-4 flex flex-col justify-center">
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><TrendingUp size={10}/> Toplam Sermaye (Özkaynak)</p>
 <p className="text-lg font-black text-slate-800">{formatCompact(m.totalCapital)}</p>
 <div className="flex gap-4 mt-2">
 <div>
 <p className="text-[8px] text-slate-400">CET1 (Çekirdek)</p>
 <p className="text-[10px] font-bold text-slate-700">{formatCompact(car.cet1_capital)}</p>
 </div>
 <div>
 <p className="text-[8px] text-slate-400">Tier 2</p>
 <p className="text-[10px] font-bold text-slate-700">{formatCompact(car.tier2_capital)}</p>
 </div>
 </div>
 </div>
 <div className="p-4 flex flex-col justify-center">
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Activity size={10}/> Toplam RWA</p>
 <p className="text-lg font-black text-slate-800">{formatCompact(m.totalRWA)}</p>
 <div className="flex gap-4 mt-2">
 <div>
 <p className="text-[8px] text-slate-400">Kredi Riski</p>
 <p className="text-[10px] font-bold text-slate-700">{formatCompact(car.credit_rwa)}</p>
 </div>
 <div>
 <p className="text-[8px] text-slate-400">Piyasa & Op.</p>
 <p className="text-[10px] font-bold text-slate-700">{formatCompact(car.market_rwa + car.operational_rwa)}</p>
 </div>
 </div>
 </div>
 </div>
 
 {/* Alt Bilgi */}
 <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[9px] font-bold text-slate-500 flex justify-between items-center">
 <span>Yasal Min: %{car.min_required_ratio.toFixed(2)} + Tampon: %{car.capital_buffer_pct.toFixed(2)}</span>
 <span className={m.bufferExcessPct < 0 ? 'text-red-500' : 'text-emerald-600'}>
 Fark: {m.bufferExcessPct > 0 ? '+' : ''}{m.bufferExcessPct.toFixed(2)} Puan
 </span>
 </div>
 </div>
 );
}
