/**
 * SustainableFinance — Ana Sayfa (Wave 59)
 * features/sustainable-finance/index.tsx
 *
 * Sürdürülebilir Finansman KPI'ları ve Yeşil Tahvil Portföyü İzleme.
 * C-Level · Apple Glassmorphism · %100 Light Mode
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, Globe, Wind, Droplets, TrendingUp, AlertTriangle,
  BadgeDollarSign, Award, ChevronRight, CheckCircle2, Factory,
  Recycle, ScanLine, ArrowUpRight
} from 'lucide-react';
import {
  useGreenBonds, useGreenFinanceKPI,
  formatUSD, type GreenBond
} from './api/green-finance';
import { GreenwashingRadar } from '@/widgets/GreenwashingRadar';

// ─── Sabitler ─────────────────────────────────────────────────────────────────

const SECTOR_ICONS: Record<string, React.ElementType> = {
  RENEWABLE_ENERGY: Wind,
  CLEAN_TRANSPORT: TrendingUp,
  GREEN_BUILDINGS: Factory,
  SUSTAINABLE_WATER: Droplets,
  CIRCULAR_ECONOMY: Recycle,
  POLLUTION_PREVENTION: Leaf,
};

const SECTOR_LABELS: Record<string, string> = {
  RENEWABLE_ENERGY: 'Yenilenebilir Enerji',
  CLEAN_TRANSPORT: 'Temiz Ulaşım',
  GREEN_BUILDINGS: 'Yeşil Binalar',
  SUSTAINABLE_WATER: 'Sürdürülebilir Su',
  CIRCULAR_ECONOMY: 'Döngüsel Ekonomi',
  POLLUTION_PREVENTION: 'Kirlilik Önleme',
};

const SPO_CFG: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'SPO Bekliyor' },
  ALIGNMENT_CONFIRMED: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Uyum Onaylandı' },
  DEVIATION_DETECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'SPO Sapması!' },
  WITHDRAWN: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Geri Çekildi' },
};

// ─── Tahvil Satırı ────────────────────────────────────────────────────────────

function BondCard({ bond }: { bond: GreenBond }) {
  const Icon = SECTOR_ICONS[bond.sector] ?? Globe;
  const spo = SPO_CFG[bond.spo_status] ?? SPO_CFG.PENDING;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
            <Icon size={18} className="text-slate-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${spo.bg} ${spo.text}`}>
                {spo.label}
              </span>
              <span className="text-[9px] font-mono text-slate-400">{bond.instrument_code}</span>
            </div>
            <p className="text-sm font-bold text-slate-800 truncate">{bond.project_name}</p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">{bond.borrower_name}</p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-lg font-black text-slate-800 tabular-nums">{formatUSD(bond.amount_issued)}</p>
          <div className="flex items-center justify-end gap-1 text-[9px] font-bold text-emerald-600">
            <TrendingDown size={10} /> {bond.esg_premium_bps} bps Greenium
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
         <div>
            <p className="text-[9px] text-slate-400 uppercase font-bold mb-0.5">Sektör</p>
            <p className="text-xs text-slate-700 font-semibold">{SECTOR_LABELS[bond.sector]}</p>
         </div>
         <div>
            <p className="text-[9px] text-slate-400 uppercase font-bold mb-0.5">Bağımsız Denetçi (SPO)</p>
            <p className="text-xs text-slate-700 font-semibold">{bond.spo_provider ?? 'Belirtilmedi'}</p>
         </div>
         <div className="col-span-2">
            <p className="text-[9px] text-slate-400 uppercase font-bold mb-0.5">KPI Hedefi</p>
            <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
              {bond.kpi_target ?? 'Yok'}
            </p>
         </div>
      </div>
    </motion.div>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────

export function SustainableFinance() {
  const [filterSector, setFilterSector] = useState<string>('ALL');

  const { data: bonds = [], isLoading } = useGreenBonds(
    filterSector !== 'ALL' ? { sector: filterSector } : undefined
  );
  const { data: kpi } = useGreenFinanceKPI();

  const filteredBonds = bonds || [];

  return (
    <div className="h-full flex flex-col bg-slate-50/50">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 bg-white/70 backdrop-blur-lg border-b border-slate-200 shadow-sm z-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Leaf size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Sustainable Finance</h1>
            <p className="text-xs text-slate-500 mt-0.5">Yeşil Kredi & Tahvil Portföyü · Greenwashing Denetimi · Wave 59</p>
          </div>
        </div>

        {/* C-Level KPI Bant */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Yeşil Portföy',  value: kpi ? formatUSD(kpi.totalIssued) : '—', icon: BadgeDollarSign, color: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: 'Aktif Tahvil',   value: kpi?.totalBonds ?? '—',                 icon: Award,           color: 'text-teal-700',    bg: 'bg-teal-50' },
            { label: 'Ort. Greenium',  value: `${kpi?.avgPremiumBps ?? 0} bps`,       icon: TrendingDown,    color: 'text-blue-700',    bg: 'bg-blue-50' },
            { label: 'Fon Sapması',    value: kpi ? formatUSD(kpi.totalDeviated) : '—',icon: ArrowUpRight,    color: 'text-rose-600',    bg: 'bg-rose-50' },
            { label: 'Kritik İhlal',   value: kpi?.criticalAudits ?? '—',             icon: AlertTriangle,   color: 'text-red-700',     bg: 'bg-red-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-center flex flex-col items-center justify-center">
              <div className={`p-1.5 rounded-lg ${bg} mb-1.5`}>
                <Icon size={14} className={color} />
              </div>
              <p className="text-base font-black text-slate-800 tabular-nums">{value}</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase leading-tight mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex gap-0">
        {/* Left: Green Bonds Portfolio */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">İhraç Edilen Yeşil Tahviller / Krediler</h2>
            <div className="flex gap-1.5">
               {['ALL', 'RENEWABLE_ENERGY', 'GREEN_BUILDINGS', 'CLEAN_TRANSPORT'].map((s) => (
                 <button
                   key={s}
                   onClick={() => setFilterSector(s)}
                   className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                     filterSector === s ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                   }`}
                 >
                   {s === 'ALL' ? 'Tümü' : SECTOR_LABELS[s]}
                 </button>
               ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : filteredBonds.length === 0 ? (
            <div className="text-center py-16 bg-white/50 rounded-2xl border border-dashed border-slate-300">
               <Globe size={40} className="text-slate-300 mx-auto mb-3" />
               <p className="text-sm font-semibold text-slate-500">Seçili sektöre ait tahvil bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
               {filteredBonds.map(bond => (
                 <BondCard key={bond.id} bond={bond} />
               ))}
            </div>
          )}
        </div>

        {/* Right: Greenwashing Radar Panel */}
        <div className="w-[360px] shrink-0 border-l border-slate-200 bg-slate-100/30 p-5 overflow-y-auto">
           <GreenwashingRadar />
        </div>
      </div>
    </div>
  );
}
