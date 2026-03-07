/**
 * Wave 80: Insider Trading & Executive PAD Radar (PADMonitor)
 * Apple Glassmorphism stili, %100 Light Mode, Null (?. || []) guard'lı.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert, TrendingDown, TrendingUp, AlertTriangle, FileText,
  Building2, ArrowRightLeft, Lock, Loader2, Info
} from 'lucide-react';
import clsx from 'clsx';
import {
  usePADMonitorDashboard,
  type PADLog,
  type RestrictedAsset,
  type InsiderAlert,
  type PADStatus,
  type AlertSeverity
} from '@/features/insider-trading/api';

/* ──────────────────────────────────────────────────────────
   Config & Mappings
   ────────────────────────────────────────────────────────── */

const STATUS_COLORS: Record<PADStatus, string> = {
  PENDING: 'bg-slate-100 text-slate-700 border-slate-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-orange-50 text-orange-700 border-orange-200',
  FLAGGED: 'bg-red-50 text-red-700 border-red-300',
};

const SEVERITY_COLORS: Record<AlertSeverity, string> = {
  LOW: 'text-blue-500 bg-blue-50 border-blue-200',
  MEDIUM: 'text-amber-600 bg-amber-50 border-amber-200',
  HIGH: 'text-orange-600 bg-orange-50 border-orange-200',
  CRITICAL: 'text-red-700 bg-red-50 border-red-300',
};

function formatCurrency(val: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);
}

/* ──────────────────────────────────────────────────────────
   Components
   ────────────────────────────────────────────────────────── */

function PADLogRow({ log }: { log: PADLog }) {
  const isBuy = log.transaction_type === 'BUY';
  return (
    <div className={clsx(
      'flex items-center justify-between p-3 rounded-xl border mb-2 transition-all hover:bg-slate-50',
      log.status === 'FLAGGED' ? 'bg-red-50/30 border-red-100' : 'bg-surface border-slate-100'
    )}>
      <div className="flex items-center gap-3">
        <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center shrink-0 border', isBuy ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-orange-50 border-orange-100 text-orange-600')}>
          {isBuy ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
        </div>
        <div>
          <div className="font-bold text-sm text-primary flex items-center gap-2">
            {log.employee_name}
          </div>
          <div className="text-xs text-slate-500">{log.department}</div>
        </div>
      </div>

      <div className="text-right">
        <div className="font-mono text-sm font-bold text-slate-800">{log.ticker} • {log.quantity.toLocaleString('tr-TR')} Adet</div>
        <div className="text-xs text-slate-500">{formatCurrency(log.total_value)} @ {log.price}</div>
      </div>

      <div className="w-24 text-right">
        <span className={clsx('px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider', STATUS_COLORS[log.status])}>
          {log.status === 'FLAGGED' ? 'İHLAL' : log.status}
        </span>
      </div>
    </div>
  );
}

function RestrictedAssetCard({ asset }: { asset: RestrictedAsset }) {
  return (
    <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-2 opacity-5">
        <Lock size={60} />
      </div>
      <div className="flex items-start justify-between mb-2">
        <div className="font-black text-primary font-mono bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200">{asset.ticker}</div>
        <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
          <Building2 size={12} /> {asset.added_by}
        </div>
      </div>
      <div className="text-xs font-bold text-slate-700 mb-1">{asset.company_name}</div>
      <p className="text-[10px] text-slate-500 font-medium leading-relaxed bg-white/50 p-2 rounded-lg border border-slate-100 line-clamp-2 group-hover:line-clamp-none transition-all">
        {asset.restriction_reason}
      </p>
    </div>
  );
}

function AlertCard({ alert }: { alert: InsiderAlert }) {
  const isCritical = alert.severity === 'CRITICAL';
  return (
    <motion.div
       initial={{ opacity: 0, scale: 0.95 }}
       animate={{ opacity: 1, scale: 1 }}
       className={clsx(
         'p-4 rounded-xl border relative overflow-hidden',
         isCritical ? 'bg-red-50/50 border-red-200' : 'bg-surface border-slate-200'
       )}
    >
      {isCritical && <div className="absolute right-0 top-0 w-2 h-full bg-red-500"></div>}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {isCritical ? <ShieldAlert size={16} className="text-red-600 animate-pulse" /> : <AlertTriangle size={16} className="text-orange-500" />}
          <h4 className="font-bold text-sm text-primary">{alert.employee_name} <span className="text-slate-400 font-normal">({alert.ticker})</span></h4>
        </div>
        <span className={clsx('px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded border', SEVERITY_COLORS[alert.severity])}>
          {alert.severity}
        </span>
      </div>
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">{alert.alert_type.replace(/_/g, ' ')}</div>
      <p className={clsx('text-xs font-medium leading-relaxed p-2.5 rounded-lg', isCritical ? 'bg-red-100/50 text-red-900 border border-red-100' : 'bg-slate-50 text-slate-700')}>
        {alert.description}
      </p>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────
   Main Widget Export
   ────────────────────────────────────────────────────────── */

export function PADMonitor() {
  const { data, isLoading, isError } = usePADMonitorDashboard();
  const [activeTab, setActiveTab] = useState<'ALERTS' | 'PAD' | 'RESTRICTED'>('ALERTS');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 rounded-xl border border-red-200 bg-red-50 flex items-center gap-3">
        <AlertTriangle className="text-red-500 w-6 h-6" />
        <p className="text-red-800 text-sm">Insider Trading uyarısı: Veriler alınırken bir hata oluştu veya yetki bulunmuyor.</p>
      </div>
    );
  }

  const { dealings, restrictedList, alerts, criticalAlertsCount, totalFlaggedTransactions } = data;

  return (
    <div className="space-y-6">
      
      {/* Overview Banner (Apple Glass) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-700/50">
        <div className="absolute right-0 top-0 opacity-[0.05] pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <ShieldAlert size={280} />
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowRightLeft className="text-blue-400" />
              <h2 className="text-xl font-bold tracking-tight">Insider Trading & PAD Radar</h2>
            </div>
            <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
              Personel hisse senedi işlemleri (Personal Account Dealing), içeriden öğrenen ticaret şüpheleri ve kısıtlı işlem listesi ihlalleri izleme merkezi.
            </p>
          </div>

          <div className="flex gap-6">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 min-w-[120px]">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Kısıtlı Varlık</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-200">{restrictedList.length}</span>
                <span className="text-xs text-slate-500">Hisse</span>
              </div>
            </div>

            <div className="bg-red-900/20 p-4 rounded-xl border border-red-500/30 min-w-[120px]">
              <div className="text-[10px] text-red-400 uppercase tracking-widest font-bold mb-1">Kritik Alarm</div>
              <div className="flex items-baseline gap-2">
                <span className={clsx('text-3xl font-black', criticalAlertsCount > 0 ? 'text-red-400 animate-pulse' : 'text-slate-200')}>
                  {criticalAlertsCount}
                </span>
                <span className="text-xs text-red-500/50">Açık</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="bg-surface border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Tab Header */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 px-2 pt-2">
          <button
            onClick={() => setActiveTab('ALERTS')}
            className={clsx(
              'px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors',
              activeTab === 'ALERTS' ? 'border-red-500 text-red-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            )}
          >
            <AlertTriangle size={16} /> Çakışma Alarmları ({criticalAlertsCount})
          </button>
          <button
            onClick={() => setActiveTab('PAD')}
            className={clsx(
              'px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors',
              activeTab === 'PAD' ? 'border-blue-500 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            )}
          >
            <ArrowRightLeft size={16} /> Personel İşlemleri (PAD)
            {totalFlaggedTransactions > 0 && <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[10px] ml-1">{totalFlaggedTransactions} İhlal</span>}
          </button>
          <button
            onClick={() => setActiveTab('RESTRICTED')}
            className={clsx(
              'px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors',
              activeTab === 'RESTRICTED' ? 'border-amber-500 text-amber-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            )}
          >
            <Lock size={16} /> Restricted Trading List ({restrictedList.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5">
          {activeTab === 'ALERTS' && (
            <div className="space-y-4">
               {alerts.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-sm">
                   <ShieldAlert size={48} className="text-emerald-100 mb-2" />
                   Bekleyen çakışma (insider trading) alarmı bulunmuyor.
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {(alerts || []).map(alert => <AlertCard key={alert.id} alert={alert} />)}
                 </div>
               )}
            </div>
          )}

          {activeTab === 'PAD' && (
            <div>
              <div className="flex items-center justify-between mb-4 bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800">
                <div className="flex items-center gap-2 font-medium">
                  <Info size={16} /> Aktif personel hisse senedi şahsi hesap işlem beyanları listelenmektedir.
                </div>
              </div>
              <div className="max-h-[500px] overflow-y-auto pr-2 space-y-1">
                {(dealings || []).map(log => <PADLogRow key={log.id} log={log} />)}
                {dealings.length === 0 && <div className="text-center py-10 text-slate-400 text-sm">Beyan kaydı yok.</div>}
              </div>
            </div>
          )}

          {activeTab === 'RESTRICTED' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {(restrictedList || []).map(asset => <RestrictedAssetCard key={asset.id} asset={asset} />)}
              </div>
              {restrictedList.length === 0 && <div className="text-center py-10 text-slate-400 text-sm">Kısıtlı hisse senedi (Restricted List) bulunmuyor.</div>}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
