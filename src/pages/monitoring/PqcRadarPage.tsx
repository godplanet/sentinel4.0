/**
 * PQC (Post-Quantum Cryptography) Radar & Crypto Inventory
 * Wave 58: Kuantum Sonrası Şifreleme Radarı
 *
 * FSD: pages/monitoring/PqcRadarPage.tsx
 * Veri: features/pqc-radar/api.ts → useCryptoAssets + useTransitionPlans
 * Tasarım: %100 Light Mode | Apple Glass | Algoritma Risk Haritası
 */

import {
 useCryptoAssets,
 usePqcPlans,
 type CryptoAsset,
} from '@/features/pqc-radar/api';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
 Activity,
 AlertTriangle,
 ArrowRight,
 CheckCircle,
 ChevronRight,
 Clock,
 Cpu,
 Database,
 GitCommit,
 Key,
 Lock,
 Server,
 ShieldAlert, ShieldCheck,
 Smartphone,
 Target,
 Zap
} from 'lucide-react';
import { useState } from 'react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const RISK_MAP = {
 'critical': { color: 'text-red-700', bg: 'bg-red-100 border-red-200', icon: AlertTriangle, label: 'Kritik' },
 'high': { color: 'text-orange-700', bg: 'bg-orange-100 border-orange-200', icon: Zap, label: 'Yüksek' },
 'medium': { color: 'text-amber-700', bg: 'bg-amber-100 border-amber-200', icon: Activity, label: 'Orta' },
 'low': { color: 'text-slate-600', bg: 'bg-slate-100 border-slate-200', icon: Lock, label: 'Düşük' },
 'safe': { color: 'text-emerald-700',bg: 'bg-emerald-100 border-emerald-200', icon: ShieldCheck, label: 'Güvenli (PQC)' },
} as const;

const STATUS_MAP = {
 'active': { label: 'Aktif', color: 'bg-slate-100 text-slate-600 border-slate-200' },
 'migrating': { label: 'Geçiş Devam Ediyor', color: 'bg-blue-100 text-blue-700 border-blue-200' },
 'retired': { label: 'Kaldırıldı', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
} as const;

const PLAN_STATUS_MAP = {
 'planning': 'bg-slate-100 text-slate-500',
 'in_progress': 'bg-blue-100 text-blue-600',
 'testing': 'bg-indigo-100 text-indigo-600',
 'completed': 'bg-emerald-100 text-emerald-600',
} as const;

function getContextIcon(context: string | undefined | null) {
 const c = (context || '').toLowerCase();
 if (c.includes('mobil') || c.includes('mobile')) return Smartphone;
 if (c.includes('api') || c.includes('web')) return Server;
 if (c.includes('sunucu') || c.includes('server') || c.includes('veritabanı')) return Database;
 return Key;
}

// ─── Asset Components ────────────────────────────────────────────────────────

function AssetCard({ asset, onSelect, isSelected }: { asset: CryptoAsset, onSelect: () => void, isSelected: boolean }) {
 const risk = RISK_MAP[asset?.quantum_risk as keyof typeof RISK_MAP] ?? RISK_MAP['high'];
 const st = STATUS_MAP[asset?.status as keyof typeof STATUS_MAP] ?? STATUS_MAP['active'];
 const RiskIcon = risk.icon;
 const ContextIcon = getContextIcon(asset?.usage_context);

 return (
 <motion.div
 layout
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 onClick={onSelect}
 className={clsx(
 'cursor-pointer rounded-xl border p-4 transition-all',
 'bg-white/70 backdrop-blur-lg shadow-sm',
 isSelected
 ? 'border-indigo-400 ring-2 ring-indigo-100 shadow-lg'
 : 'border-slate-200 hover:border-indigo-200 hover:shadow-md'
 )}
 >
 <div className="flex items-start justify-between gap-3 mb-3">
 <div className="flex flex-col mb-1 gap-2 w-full pr-6">
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border', st.color)}>
 {st.label}
 </span>
 <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1', risk.bg, risk.color)}>
 <RiskIcon size={9} /> {risk.label}
 </span>
 </div>
 <h3 className="text-sm font-bold text-slate-800 leading-snug truncate pr-2">{asset?.asset_name ?? 'Bilinmeyen Varlık'}</h3>
 </div>
 <ChevronRight size={14} className={clsx('text-slate-300 flex-shrink-0 mt-5 absolute right-4 transition-transform', isSelected && 'rotate-90')} />
 </div>

 <div className="grid grid-cols-2 gap-2 mt-3 p-2 bg-slate-50/50 rounded-lg border border-slate-100">
 <div className="flex items-center gap-2">
 <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center">
 <Cpu size={12} className="text-slate-500" />
 </div>
 <div>
 <div className="text-[9px] font-bold text-slate-400 uppercase">Mevcut Algoritma</div>
 <div className="text-[11px] font-mono text-slate-700 font-semibold">{asset?.algorithm} {asset?.key_size && `(${asset.key_size})`}</div>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center border border-indigo-100">
 <Target size={12} className="text-indigo-500" />
 </div>
 <div>
 <div className="text-[9px] font-bold text-indigo-400 uppercase">Sahip Departman</div>
 <div className="text-[11px] font-mono text-indigo-700 font-semibold truncate">{asset?.owner_dept || 'Belirlenmedi'}</div>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-500">
 <span className="flex items-center gap-1"><ContextIcon size={10} /> {asset?.usage_context || 'Bilinmiyor'}</span>
 {asset?.expiration_date && (
 <span className="flex items-center gap-1"><Clock size={10} /> Bitiş: <span className="font-bold text-slate-600">{new Date(asset.expiration_date).toLocaleDateString()}</span></span>
 )}
 </div>
 </motion.div>
 );
}

// ─── Plan Panel ───────────────────────────────────────────────────────────────

function PlanPanel({ assetId }: { assetId: string }) {
 const { data: plans, isLoading, error } = usePqcPlans();
 const assetPlans = (plans || []).filter((p: any) => p.asset_id === assetId);

 if (isLoading) {
 return (
 <div className="flex items-center gap-2 py-4 justify-center text-slate-400">
 <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
 <span className="text-xs">Geçiş planları yükleniyor...</span>
 </div>
 );
 }

 if (error) {
 return (
 <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
 <AlertTriangle size={12} />
 Planlar yüklenemedi.
 </div>
 );
 }

 if (!assetPlans || assetPlans.length === 0) {
 return (
 <div className="text-center py-5 text-slate-400 bg-white/50 rounded-2xl border border-dashed border-slate-200">
 <GitCommit className="w-8 h-8 mx-auto mb-2 opacity-30" />
 <p className="text-xs">Bu varlık için henüz PQC geçiş planı oluşturulmamış.</p>
 </div>
 );
 }

 return (
 <div className="space-y-4">
 <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
 <GitCommit size={12} className="text-indigo-500" />
 PQC Geçiş Yol Haritası (Transition Roadmap)
 </h4>

 <div className="relative pl-3 space-y-4 before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-gradient-to-b before:from-indigo-200 before:to-transparent">
 {(assetPlans || []).map((plan: any, idx: number) => {
 const stColor = PLAN_STATUS_MAP[plan?.status as keyof typeof PLAN_STATUS_MAP] ?? PLAN_STATUS_MAP['planning'];
 const isDone = plan?.status === 'completed';

 return (
 <motion.div
 key={plan?.id ?? idx}
 initial={{ opacity: 0, x: 10 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: idx * 0.1 }}
 className="relative pl-6"
 >
 <div className={clsx(
 "absolute left-[-5px] top-1.5 w-3 h-3 rounded-full border-2 bg-white",
 isDone ? "border-emerald-500" : "border-indigo-400"
 )} />
 
 <div className={clsx(
 "bg-white/80 border p-3 rounded-xl shadow-sm transition-all",
 isDone ? "border-emerald-100" : "border-slate-200 hover:border-indigo-200"
 )}>
 <div className="flex items-center justify-between gap-2 mb-1">
 <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
 {isDone && <CheckCircle size={10} className="text-emerald-500" />}
 {plan?.target_algorithm ?? 'Hedef Algoritma'}
 </span>
 <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded-full', stColor)}>
 {plan?.status ?? 'Planlandı'}
 </span>
 </div>
 <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
 {plan?.notes ?? 'Açıklama yok'}
 </p>

 <div className="flex items-center gap-3 mt-2 text-[9px] text-slate-400 font-medium">
 {plan?.target_date && <span>Hedef: {new Date(plan.target_date).toLocaleDateString()}</span>}
 {(plan?.budget_usd ?? 0) > 0 && <span>Bütçe: ${(plan.budget_usd).toLocaleString()}</span>}
 {plan?.progress_pct !== undefined && <span>İlerleme: %{plan.progress_pct}</span>}
 </div>
 </div>
 </motion.div>
 );
 })}
 </div>
 </div>
 );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PqcRadarPage() {
 const { data: assets, isLoading } = useCryptoAssets();
 const [selectedId, setSelectedId] = useState<string | null>(null);

 const selected = (assets || []).find(a => a?.id === selectedId) ?? null;

 const stats = {
 total: (assets || []).length,
 kritik: (assets || []).filter((a: any) => a?.quantum_risk === 'critical').length,
 yuksek: (assets || []).filter((a: any) => a?.quantum_risk === 'high').length,
 pqc: (assets || []).filter((a: any) => a?.quantum_risk === 'safe').length,
 };

 return (
 <div className="min-h-screen p-4">
 {/* Header */}
 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
 <div className="flex items-center gap-3 mb-1">
 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center shadow-sm">
 <ShieldAlert className="w-5 h-5 text-indigo-100" />
 </div>
 <div>
 <h1 className="text-xl font-black text-slate-900 tracking-tight">PQC Radar & Crypto Inventory</h1>
 <p className="text-xs text-slate-500">Kuantum Sonrası Şifreleme Radarı ve Algoritma Risk Haritası</p>
 </div>
 </div>

 {/* Dashboard KPI */}
 <div className="grid grid-cols-4 gap-3 mt-4">
 {[
 { label: 'Toplam Varlık', value: stats.total, icon: Database, color: 'text-indigo-600' },
 { label: 'Kritik Risk', value: stats.kritik, icon: AlertTriangle,color: 'text-red-600' },
 { label: 'Yüksek Risk', value: stats.yuksek, icon: Zap, color: 'text-orange-600' },
 { label: 'PQC Uyumlu', value: stats.pqc, icon: ShieldCheck, color: 'text-emerald-600' },
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
 
 {/* Sol Kolon: Envanter Listesi */}
 <div className="space-y-3">
 <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
 <Key size={11} /> Kriptografik Varlık Envanteri
 </div>

 {isLoading && (
 <div className="flex items-center justify-center py-10 text-slate-400">
 <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mr-3" />
 <span className="text-xs">Envanter yükleniyor...</span>
 </div>
 )}

 {!isLoading && (assets || []).length === 0 && (
 <div className="text-center py-12 text-slate-400 rounded-2xl border-2 border-dashed border-slate-200 bg-white/40">
 <Key className="w-8 h-8 mx-auto mb-2 opacity-25" />
 <p className="text-sm">Envanterde varlık bulunamadı.</p>
 </div>
 )}

 {(assets || []).map(asset => (
 <AssetCard 
 key={asset?.id} 
 asset={asset} 
 onSelect={() => setSelectedId(asset?.id === selectedId ? null : asset?.id)} 
 isSelected={asset?.id === selectedId} 
 />
 ))}
 </div>

 {/* Sağ Kolon: Detay ve Planlar */}
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
 {/* Analiz Özeti */}
 <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200 p-5 shadow-sm">
 <h2 className="text-sm font-bold text-slate-800 mb-1">{selected.asset_name}</h2>
 <div className="text-[11px] text-slate-500 mb-4 flex items-center gap-4">
 <span>Sahip: <strong className="text-slate-700">{selected.system_owner}</strong></span>
 <span>Kullanım: <strong className="text-slate-700">{selected.usage_context}</strong></span>
 </div>

 {/* Kuantum Risk Analizi Kutusu */}
 <div className={clsx(
 "rounded-xl p-4 border mt-2 flex flex-col gap-3",
 selected?.quantum_risk === 'critical' ? "bg-red-50 border-red-200" :
 selected?.quantum_risk === 'safe' ? "bg-emerald-50 border-emerald-200" :
 "bg-orange-50 border-orange-200"
 )}>
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Risk Analizi</span>
 </div>

 <div className="flex items-center gap-4">
 <div className="flex-1 bg-white rounded-lg p-2.5 border border-slate-200/60 shadow-sm text-center">
 <div className="text-[9px] text-slate-400 uppercase font-bold mb-0.5">Mevcut</div>
 <div className="text-xs font-mono font-bold text-slate-700">{selected.algorithm}</div>
 {selected.key_size && <div className="text-[9px] text-slate-500">{selected.key_size} bit</div>}
 </div>

 <ArrowRight size={14} className="text-slate-300 flex-shrink-0" />

 <div className="flex-1 bg-indigo-50 rounded-lg p-2.5 border border-indigo-100 shadow-sm text-center">
 <div className="text-[9px] text-indigo-400 uppercase font-bold mb-0.5">Risk Seviyesi</div>
 <div className="text-xs font-mono font-bold text-indigo-700">{RISK_MAP[selected?.quantum_risk as keyof typeof RISK_MAP]?.label || 'Bilinmiyor'}</div>
 <div className="text-[9px] text-indigo-500">Post-Quantum</div>
 </div>
 </div>
 </div>
 </div>

 {/* Plan Panel */}
 <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-slate-200 p-5 shadow-sm">
 <PlanPanel assetId={selected.id} />
 </div>
 </motion.div>
 ) : (
 <motion.div
 key="empty"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="flex flex-col items-center justify-center h-64 text-slate-400 rounded-2xl border-2 border-dashed border-slate-200 bg-white/40"
 >
 <ShieldAlert className="w-10 h-10 mb-3 opacity-20" />
 <p className="text-sm font-medium">Soldan bir kriptografik varlık seçin</p>
 <p className="text-xs mt-1">PQC geçiş yol haritası ve kuantum risk detayları burada görülür</p>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 </div>
 </div>
 );
}
