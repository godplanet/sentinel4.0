/**
 * GreenwashingRadar — Sürdürülebilirlik İhlali İzleme Widget'ı
 * widgets/GreenwashingRadar/index.tsx  (Wave 59)
 *
 * C-Level Apple Glassmorphism tasarım, 100% Light Mode.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, AlertTriangle, ShieldAlert, CheckCircle2, ChevronRight,
  TrendingDown, TrendingUp, DollarSign, Clock, FileSearch,
  Wind, X
} from 'lucide-react';
import {
  useFundAudits, useGreenBonds, useUpdateAuditStatus,
  formatUSD, type EsgFundAudit, type GreenBond
} from '@/features/sustainable-finance/api/green-finance';

// ─── Sabitler ─────────────────────────────────────────────────────────────────

const RISK_CFG = {
  CRITICAL: { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    label: 'Kritik Risk', icon: ShieldAlert },
  HIGH:     { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Yüksek Risk', icon: AlertTriangle },
  MEDIUM:   { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  label: 'Orta Risk',   icon: AlertTriangle },
  LOW:      { bg: 'bg-slate-50',  text: 'text-slate-500',  border: 'border-slate-200',  label: 'Düşük Risk',  icon: CheckCircle2 },
};

const KPI_STATUS_CFG: Record<string, string> = {
  ON_TRACK: 'bg-emerald-100 text-emerald-700',
  DELAYED: 'bg-amber-100 text-amber-700',
  MISSED: 'bg-red-100 text-red-700',
  DATA_UNAVAILABLE: 'bg-slate-100 text-slate-500',
};

// ─── Greenwashing Radar Item Bileşeni ─────────────────────────────────────────

function AuditAlertRow({ audit, bond }: { audit: EsgFundAudit; bond?: GreenBond }) {
  const [expanded, setExpanded] = useState(false);
  const updateStatus = useUpdateAuditStatus();
  const cfg = RISK_CFG[audit.risk_level] ?? RISK_CFG.LOW;
  const kpiCfg = KPI_STATUS_CFG[audit.kpi_status] ?? KPI_STATUS_CFG.DATA_UNAVAILABLE;
  const Icon = cfg.icon;

  // Sıfıra bölünme koruması KESİNLİKLE yapıldı (total_fund || 1)
  const deviationPct = Math.round((audit.deviated_amount / (audit.total_fund || 1)) * 100);

  return (
    <div className={`rounded-xl border mb-2 transition-all hover:shadow-sm ${cfg.bg} ${cfg.border}`}>
      <div
        className="px-4 py-3 cursor-pointer flex items-start gap-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`mt-0.5 p-1.5 rounded-lg bg-white/50 border ${cfg.border} shrink-0`}>
          <Icon size={14} className={cfg.text} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${cfg.bg} ${cfg.text} ${cfg.border} bg-white`}>
              {cfg.label}
            </span>
            <span className="text-[9px] font-mono text-slate-500">{audit.bond_code}</span>
            {bond && (
               <span className="text-[9px] font-bold text-slate-600 truncate max-w-[150px]">{bond.borrower_name}</span>
            )}
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${kpiCfg} ml-auto`}>
              KPI: {audit.kpi_status}
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-1">
            {bond?.project_name ?? 'Fon Denetimi'}
          </p>

          <div className="flex items-center gap-4 mt-1.5">
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <TrendingDown size={11} className="text-red-500" />
              Sapma: <span className="font-bold text-red-700">{formatUSD(audit.deviated_amount)}</span>
            </div>
            <div className={`text-[10px] font-bold ${deviationPct > 0 ? 'text-red-600' : 'text-slate-500'}`}>
              %{deviationPct}
            </div>
            {audit.carbon_footprint_ton && (
              <div className="text-[10px] text-slate-500 flex items-center gap-1 ml-auto">
                <Wind size={11} className="text-emerald-500" />
                {audit.carbon_footprint_ton.toLocaleString()} ton CO2
              </div>
            )}
          </div>
        </div>

        <ChevronRight size={14} className={`text-slate-400 mt-2 shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t overflow-hidden"
            style={{ borderColor: 'var(--tw-border-opacity) ' + cfg.border }}
          >
            <div className="p-4 bg-white/60 space-y-3 text-xs text-slate-700">
              <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                <p className="font-black text-slate-800 mb-1 flex items-center gap-1.5">
                  <FileSearch size={13} className="text-blue-500" />
                  Denetçi Bulgusu ({audit.auditor_name})
                </p>
                <p className="leading-relaxed">{audit.findings}</p>
                {audit.deviation_reason && (
                  <p className="mt-2 text-red-700 font-medium">Sapma Nedeni: {audit.deviation_reason}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                {(['IN_PROGRESS', 'ESCALATED', 'COMPLETED'] as EsgFundAudit['status'][]).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus.mutate({ id: audit.id, status: s })}
                    disabled={updateStatus.isPending || audit.status === s}
                    className={`text-[9px] font-bold px-3 py-1.5 rounded-lg border transition-all
                      ${audit.status === s ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Ana Widget ───────────────────────────────────────────────────────────────

export function GreenwashingRadar() {
  const { data: audits = [], isLoading: auditsLoading } = useFundAudits();
  const { data: bonds = [], isLoading: bondsLoading } = useGreenBonds();

  const bondsMap = new Map((bonds || []).map((b) => [b.id, b]));
  const criticalAudits = (audits || []).filter(a => a.risk_level === 'CRITICAL' || a.risk_level === 'HIGH');
  const otherAudits = (audits || []).filter(a => a.risk_level !== 'CRITICAL' && a.risk_level !== 'HIGH');

  return (
    <div className="bg-white/70 backdrop-blur-lg border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-400/20 border border-emerald-300/30 flex items-center justify-center">
            <Leaf size={16} className="text-emerald-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Greenwashing Radar</h3>
            <p className="text-[10px] text-emerald-200/70 mt-0.5">ESG Tahvil Fon Sapma Tespiti</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-rose-400">{criticalAudits.length}</p>
          <p className="text-[8px] text-emerald-200/50 font-bold tracking-widest">RİSK TESPİTİ</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {auditsLoading || bondsLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
          </div>
        ) : (audits || []).length === 0 ? (
          <div className="text-center py-12">
            <ShieldAlert size={36} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500">Greenwashing bulgusu yok.</p>
          </div>
        ) : (
          <div>
            {criticalAudits.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle size={12} /> Yüksek İhtimal — Aksiyon Gerekiyor
                </p>
                {criticalAudits.map(audit => (
                  <AuditAlertRow key={audit.id} audit={audit} bond={bondsMap.get(audit.bond_id)} />
                ))}
              </div>
            )}

            {otherAudits.length > 0 && (
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 mt-4 ml-1">
                  İzleme Listesi (Düşük Sapmalar)
                </p>
                {otherAudits.map(audit => (
                  <AuditAlertRow key={audit.id} audit={audit} bond={bondsMap.get(audit.bond_id)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
