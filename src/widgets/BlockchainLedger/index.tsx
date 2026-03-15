/**
 * BlockchainLedger — Wave 82: Immutable Evidence Vault
 * %100 Light Mode | Apple Glassmorphism | Real Supabase
 */

import {
 useEvidences,
 useVerifyHash,
 type ImmutableEvidence,
} from '@/features/evidence-vault/api/evidence-vault';
import clsx from 'clsx';
import {
 AlertCircle,
 CheckCircle2,
 Cpu,
 FileCheck2,
 FileText,
 Fingerprint,
 Link,
 LockKeyhole,
 Network,
 RefreshCw
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

// ─── Config ───────────────────────────────────────────────────────────────────

const NETWORK_CFG: Record<string, { label: string; color: string; bg: string }> = {
 Ethereum_Quorum: { label: 'ETH Quorum (Private)', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
 Polygon: { label: 'Polygon (Public)', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
 Hyperledger: { label: 'Hyperledger Fabric', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function BlockchainLedger() {
 const [activeTab, setActiveTab] = useState<'evidence' | 'network'>('evidence');

 const { data: evidences = [], isLoading, refetch } = useEvidences();
 const verifyHash = useVerifyHash();

 const handleVerify = async (id: string, currentStatus: boolean) => {
 if (currentStatus) return; // Zaten doğrulanmış
 try {
 await verifyHash.mutateAsync({ id, is_verified: true });
 toast.success('Adli kanıt Blokzincir ağı üzerinden doğrulandı (Verified).');
 } catch {
 toast.error('Doğrulama işlemi başarısız oldu.');
 }
 };

 const verifiedCount = (evidences || []).filter(e => e.is_verified).length;
 const totalCount = evidences.length;

 return (
 <div className="space-y-5">
 {/* KPI Stats Row */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
 <StatCard
 icon={FileCheck2}
 label="Adli Kanıt Kasası"
 value={isLoading ? '…' : String(totalCount)}
 sub="Merkeziyetsiz mühürlü dosya"
 color="slate"
 />
 <StatCard
 icon={CheckCircle2}
 label="Doğrulanmış (Verified)"
 value={isLoading ? '…' : String(verifiedCount)}
 sub="Zincir üstü bütünlük onayı"
 color="emerald"
 />
 <StatCard
 icon={Fingerprint}
 label="SHA-256 İmzaları"
 value={isLoading ? '…' : 'Aktif'}
 sub="Değiştirilemez Hash algoritması"
 color="blue"
 />
 <StatCard
 icon={Network}
 label="Ağ Konsensüsü"
 value={isLoading ? '…' : 'Quorum'}
 sub="PoA (Proof of Authority)"
 color="indigo"
 />
 </div>

 {/* Main panel */}
 <div className="bg-white/90 backdrop-blur-xl border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
 {/* Header */}
 <div className="px-5 py-4 bg-gradient-to-r from-slate-100 to-emerald-50/50 border-b border-slate-200 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center">
 <Link size={18} className="text-white" />
 </div>
 <div>
 <h3 className="text-sm font-bold text-slate-800">Immutable Evidence Vault</h3>
 <p className="text-[11px] text-slate-500 mt-0.5">Blokzincir Tabanlı Değiştirilemez Kanıt Defteri — Wave 82</p>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <div className="flex bg-slate-200/50 rounded-lg p-0.5">
 {(['evidence', 'network'] as const).map(tab => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={clsx(
 'px-3 py-1.5 text-xs font-bold rounded-md transition-all',
 activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
 )}
 >
 {tab === 'evidence' ? 'Kanıt Defteri (Ledger)' : 'Ağ Durumu'}
 </button>
 ))}
 </div>
 <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
 <RefreshCw size={14} />
 </button>
 </div>
 </div>

 {/* 1. Evidence List Tab */}
 {activeTab === 'evidence' && (
 <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
 {isLoading ? (
 <LoadingState label="Blokzincir defteri (Ledger) senkronize ediliyor..." />
 ) : evidences.length === 0 ? (
 <EmptyState icon={FileCheck2} label="Kanıt Bulunmuyor" sub="Deftere kayıtlı herhangi bir adli mühürlü dosya bulunamadı." />
 ) : (
 (evidences || []).map(evidence => (
 <EvidenceRow 
 key={evidence.id} 
 evidence={evidence} 
 onVerify={() => handleVerify(evidence.id, evidence.is_verified)} 
 isVerifying={verifyHash.isPending && (verifyHash.variables as any)?.id === evidence.id} 
 />
 ))
 )}
 </div>
 )}

 {/* 2. Network Mock Tab */}
 {activeTab === 'network' && (
 <div className="p-5 h-[500px] flex items-center justify-center bg-slate-50">
 <div className="text-center">
 <Cpu size={48} className="mx-auto text-indigo-300 mb-4 animate-pulse" />
 <p className="text-base font-bold text-slate-700">Sentinel On-Premise Quorum Network</p>
 <p className="text-sm text-slate-500 mt-2 mb-4">Blok süresi: 5 Saniye · Konsensüs: IBFT · Node Sayısı: 4 (Validators)</p>
 <div className="inline-block border border-emerald-200 bg-emerald-50 text-emerald-700 font-mono text-xs px-3 py-1.5 rounded-lg">
 LATEST_BLOCK: 15501248
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}

// ─── Sub Components ───────────────────────────────────────────────────────────

function EvidenceRow({ evidence: e, onVerify, isVerifying }: { evidence: ImmutableEvidence; onVerify: () => void; isVerifying: boolean }) {
 const netCfg = NETWORK_CFG[e.blockchain_network] ?? { label: e.blockchain_network, color: 'text-slate-600', bg: 'bg-slate-100 border-slate-200' };

 return (
 <div className="px-5 py-5 hover:bg-slate-50 transition-colors">
 <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-5">
 
 {/* Left Info File Name & Type */}
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-2">
 <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
 <FileText size={18} className="text-slate-500" />
 </div>
 <div>
 <p className="text-sm font-bold text-slate-800">{e.evidence_name}</p>
 <p className="text-[11px] text-slate-500 mt-0.5">
 {e.uploader_email} · {(e.file_size_bytes / 1024 / 1024).toFixed(2)} MB · {new Date(e.created_at).toLocaleDateString('tr-TR')}
 </p>
 </div>
 </div>
 
 <div className="mt-3 flex flex-wrap gap-2">
 <span className={clsx('text-[10px] font-bold border px-2 py-0.5 rounded uppercase', netCfg.bg, netCfg.color)}>
 {netCfg.label}
 </span>
 <span className="text-[10px] font-black bg-slate-800 text-white px-2 py-0.5 rounded font-mono uppercase tracking-widest">
 {e.category.replace(/_/g, ' ')}
 </span>
 </div>
 </div>

 {/* Right Info: Hashes & Verification */}
 <div className="xl:w-1/2 bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between">
 <div className="space-y-3 mb-4">
 <div>
 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">
 <LockKeyhole size={10} /> Original File Hash (SHA-256)
 </p>
 <p className="text-[11px] font-mono text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100 break-all select-all">
 {e.original_hash}
 </p>
 </div>
 {e.tx_hash && (
 <div>
 <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1 flex items-center gap-1">
 <Link size={10} /> On-Chain Transaction Hash
 </p>
 <p className="text-[11px] font-mono text-indigo-700 bg-indigo-50 p-1.5 rounded border border-indigo-100 break-all select-all">
 {e.tx_hash}
 </p>
 </div>
 )}
 </div>

 <div className="flex items-center justify-between border-t border-slate-100 pt-3">
 <div className="flex items-center gap-2">
 {e.is_verified ? (
 <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-max">
 <CheckCircle2 size={12} /> DOĞRULANDI (VERIFIED)
 </span>
 ) : (
 <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded w-max">
 <AlertCircle size={12} /> ONAY BEKLİYOR
 </span>
 )}
 {e.ipfs_cid && (
 <span className="text-[10px] font-mono text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
 IPFS: {e.ipfs_cid.substring(0,8)}...
 </span>
 )}
 </div>
 
 {!e.is_verified && (
 <button 
 onClick={onVerify} 
 disabled={isVerifying}
 className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
 >
 {isVerifying ? <RefreshCw size={12} className="animate-spin" /> : <Fingerprint size={12} />}
 Hash Bütünlüğünü Doğrula
 </button>
 )}
 </div>
 </div>

 </div>
 </div>
 );
}

function StatCard({ icon: Icon, label, value, sub, color }: any) {
 const map: Record<string, string> = {
 slate: 'bg-slate-50 border-slate-200 text-slate-600',
 indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600',
 blue: 'bg-blue-50 border-blue-200 text-blue-600',
 emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
 };
 return (
 <div className={clsx('rounded-xl border p-4', map[color])}>
 <div className="flex items-center gap-2 mb-2">
 <Icon size={14} />
 <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{label}</span>
 </div>
 <p className="text-2xl font-black tabular-nums">{value}</p>
 <p className="text-[10px] opacity-70 mt-1 truncate">{sub}</p>
 </div>
 );
}

function LoadingState({ label }: { label: string }) {
 return (
 <div className="flex flex-col items-center justify-center py-16 gap-3 text-sm text-slate-400 h-full">
 <RefreshCw size={24} className="animate-spin text-slate-400" />
 <span>{label}</span>
 </div>
 );
}

function EmptyState({ icon: Icon, label, sub }: { icon: any; label: string; sub: string }) {
 return (
 <div className="flex flex-col items-center justify-center py-16 text-center h-full">
 <Icon size={48} className="text-slate-200 mb-4" />
 <p className="text-base font-bold text-slate-700">{label}</p>
 <p className="text-xs text-slate-400 mt-2 max-w-xs">{sub}</p>
 </div>
 );
}
