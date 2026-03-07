/**
 * CryptoInventory — Wave 58: PQC (Post-Quantum Cryptography) Radar
 * %100 Light Mode | Apple Glassmorphism | Real Supabase
 */

import { useState } from 'react';
import {
  ShieldHumbug, LockKeyhole, Server, Network, ShieldAlert,
  Activity, CheckCircle2, AlertTriangle, RefreshCw, Layers,
  ChevronRight, Fingerprint, Calendar
} from 'lucide-react';
import clsx from 'clsx';
import {
  useCryptoAssets,
  usePqcPlans,
  type CryptoAsset,
  type PqcTransitionPlan,
  type QuantumRisk,
  type AssetStatus,
} from '@/features/pqc-radar/api';

// ─── Config ───────────────────────────────────────────────────────────────────

const RISK_CFG: Record<QuantumRisk, { label: string; color: string; bg: string }> = {
  critical: { label: 'Kritik Risk', color: 'text-red-700',      bg: 'bg-red-50 border-red-200' },
  high:     { label: 'Yüksek Risk', color: 'text-orange-700',   bg: 'bg-orange-50 border-orange-200' },
  medium:   { label: 'Orta Risk',   color: 'text-amber-700',    bg: 'bg-amber-50 border-amber-200' },
  low:      { label: 'Düşük Risk',  color: 'text-slate-600',    bg: 'bg-slate-50 border-slate-200' },
  safe:     { label: 'Kuantum Güvenli', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
};

const STATUS_CFG: Record<AssetStatus, { label: string; icon: typeof CheckCircle2; color: string }> = {
  active:    { label: 'Aktif',    icon: Activity,      color: 'text-emerald-500' },
  migrating: { label: 'Geçişte',  icon: RefreshCw,     color: 'text-blue-500' },
  retired:   { label: 'Emekli',   icon: ShieldHumbug,  color: 'text-slate-400' },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function CryptoInventory() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'plans'>('inventory');
  const [selectedRisk, setSelectedRisk] = useState<QuantumRisk | ''>('');

  const { data: assets = [], isLoading: assetsLoading, refetch: refetchAssets } = useCryptoAssets(selectedRisk ? { risk: selectedRisk } : undefined);
  const { data: plans = [],  isLoading: plansLoading } = usePqcPlans();

  // Aggregated Stats
  const totalAssets = assets.length;
  const criticalCount = assets.filter(a => a.quantum_risk === 'critical').length;
  const safeCount = assets.filter(a => a.quantum_risk === 'safe').length;
  const safePct = totalAssets > 0 ? Math.round((safeCount / totalAssets) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* KPI Stats Row (Client-Side Aggregation for UX) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={LockKeyhole}
          label="Kripto Varlık"
          value={String(totalAssets)}
          sub="Envanterdeki toplam anahtar/algoritma"
          color="slate"
        />
        <StatCard
          icon={ShieldAlert}
          label="Kritik PQC Riski"
          value={String(criticalCount)}
          sub="Shor algoritmasına savunmasız"
          color="red"
        />
        <StatCard
          icon={ShieldHumbug}
          label="Kuantum Güvenli"
          value={`${safePct}%`}
          sub={`${safeCount} varlık AES-256/Kyber vb.`}
          color="emerald"
        />
        <StatCard
          icon={Activity}
          label="Aktif Geçiş Planı"
          value={String(plans.filter(p => p.status === 'in_progress' || p.status === 'testing').length)}
          sub="PQC transformasyon süreci"
          color="blue"
        />
      </div>

      {/* Main panel */}
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-100 to-indigo-50/50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Network size={18} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Kriptografik Envanter & PQC Radar</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Post-Quantum Cryptography Geçiş Haritası — Wave 58</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-200/50 rounded-lg p-0.5">
              {(['inventory', 'plans'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    'px-3 py-1.5 text-xs font-bold rounded-md transition-all',
                    activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {tab === 'inventory' ? 'Algoritma Haritası' : 'Geçiş Planları'}
                </button>
              ))}
            </div>
            <button onClick={() => refetchAssets()} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Filters (Inventory Tab only) */}
        {activeTab === 'inventory' && (
          <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Risk Filtresi:</span>
            <FilterBadge active={selectedRisk === ''} onClick={() => setSelectedRisk('')} label="Tümü" color="slate" />
            <FilterBadge active={selectedRisk === 'critical'} onClick={() => setSelectedRisk('critical')} label="Kritik" color="red" />
            <FilterBadge active={selectedRisk === 'high'} onClick={() => setSelectedRisk('high')} label="Yüksek" color="orange" />
            <FilterBadge active={selectedRisk === 'medium'} onClick={() => setSelectedRisk('medium')} label="Orta" color="amber" />
            <FilterBadge active={selectedRisk === 'safe'} onClick={() => setSelectedRisk('safe')} label="Güvenli" color="emerald" />
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {assetsLoading ? (
              <LoadingState label="Kriptografik varlıklar taranıyor..." />
            ) : assets.length === 0 ? (
              <EmptyState icon={LockKeyhole} label="Varlık bulunamadı" sub="Bu risk seviyesinde veya envanterde kayıt yok." />
            ) : (
              assets.map(asset => <AssetRow key={asset.id} asset={asset} />)
            )}
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto bg-slate-50/30">
            {plansLoading ? (
              <LoadingState label="Geçiş planları yükleniyor..." />
            ) : plans.length === 0 ? (
              <EmptyState icon={Layers} label="Plan bulunamadı" sub="PQC geçişi için henüz yol haritası oluşturulmamış." />
            ) : (
              plans.map(plan => <PlanRow key={plan.id} plan={plan} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub Components ───────────────────────────────────────────────────────────

function AssetRow({ asset: a }: { asset: CryptoAsset }) {
  const rCfg = RISK_CFG[a.quantum_risk];
  const sCfg = STATUS_CFG[a.status];
  const StatusIcon = sCfg.icon;

  return (
    <div className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border', rCfg.bg, rCfg.color)}>
        <Fingerprint size={16} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className={clsx('text-[10px] font-bold border px-2 py-0.5 rounded-full', rCfg.bg, rCfg.color)}>
             {rCfg.label}
          </span>
          <span className="text-[10px] font-black bg-slate-800 text-white px-2 py-0.5 rounded font-mono">
            {a.algorithm}{a.key_size ? `-${a.key_size}` : ''}
          </span>
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {a.usage_context}
          </span>
        </div>
        <p className="text-sm font-bold text-slate-800">{a.asset_name}</p>
        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
          <span>{a.owner_dept ?? 'Sahipsiz'}</span>
          {a.expiration_date && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar size={10} /> Son Kullanım: {new Date(a.expiration_date).toLocaleDateString('tr-TR')}
              </span>
            </>
          )}
        </p>
      </div>

      <div className={clsx('flex items-center gap-1.5 text-[11px] font-bold shrink-0', sCfg.color)}>
        <StatusIcon size={14} className={a.status === 'migrating' ? 'animate-spin' : ''} /> {sCfg.label}
      </div>
    </div>
  );
}

function PlanRow({ plan: p }: { plan: PqcTransitionPlan }) {
  const assetName = p.asset?.asset_name ?? 'Bilinmeyen Varlık';
  const currentAlgo = p.asset ? `${p.asset.algorithm}${p.asset.key_size ? `-${p.asset.key_size}` : ''}` : '?';

  return (
    <div className="px-5 py-4 hover:bg-white transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-1 mb-1">
            <Server size={10} /> PQC Geçiş Planı
          </span>
          <h4 className="text-sm font-bold text-slate-800">{assetName}</h4>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
            Hedef: {new Date(p.target_date).toLocaleDateString('tr-TR')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
        <div className="flex-1 text-center">
          <p className="text-[9px] uppercase font-bold text-slate-400 mb-1">Mevcut Algoritma</p>
          <p className="text-xs font-mono font-bold text-red-600 bg-red-50 py-1 rounded">{currentAlgo}</p>
        </div>
        <ChevronRight size={16} className="text-slate-300 shrink-0" />
        <div className="flex-1 text-center">
          <p className="text-[9px] uppercase font-bold text-indigo-400 mb-1">Hedef Algoritma</p>
          <p className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 py-1 rounded">{p.target_algorithm}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">İlerleme: %{p.progress_pct}</span>
          <span className="text-[10px] font-bold text-slate-400">{p.status.replace('_', ' ').toUpperCase()}</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${p.progress_pct}%` }}
          />
        </div>
        {p.notes && (
          <p className="text-[10px] text-slate-500 mt-2 italic border-l-2 border-indigo-200 pl-2">
            {p.notes}
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  const map: Record<string, string> = {
    slate:   'bg-slate-50 border-slate-200 text-slate-600',
    red:     'bg-red-50 border-red-200 text-red-600',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    blue:    'bg-blue-50 border-blue-200 text-blue-600',
  };
  return (
    <div className={clsx('rounded-xl border p-4', map[color])}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} />
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{label}</span>
      </div>
      <p className="text-2xl font-black tabular-nums">{value}</p>
      <p className="text-[10px] opacity-70 mt-1">{sub}</p>
    </div>
  );
}

function FilterBadge({ active, onClick, label, color }: any) {
  const map: Record<string, string> = {
    slate:   'text-slate-600 hover:bg-slate-100',
    red:     'text-red-700 hover:bg-red-100',
    orange:  'text-orange-700 hover:bg-orange-100',
    amber:  'text-amber-700 hover:bg-amber-100',
    emerald: 'text-emerald-700 hover:bg-emerald-100',
  };
  const activeMap: Record<string, string> = {
    slate:   'bg-slate-200 font-bold',
    red:     'bg-red-100 font-bold',
    orange:  'bg-orange-100 font-bold',
    amber:  'bg-amber-100 font-bold',
    emerald: 'bg-emerald-100 font-bold',
  };

  return (
    <button
      onClick={onClick}
      className={clsx(
        'px-3 py-1 text-[11px] rounded transition-colors shrink-0',
        active ? activeMap[color] : map[color]
      )}
    >
      {label}
    </button>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-16 gap-2 text-sm text-slate-400">
      <RefreshCw size={16} className="animate-spin text-indigo-400" />{label}
    </div>
  );
}

function EmptyState({ icon: Icon, label, sub }: { icon: any; label: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon size={36} className="text-slate-200 mb-3" />
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
}
