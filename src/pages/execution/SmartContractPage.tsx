/**
 * Smart Contract & Digital Asset Ledger Audit
 * Wave 70: Akıllı Sözleşme Denetimi
 *
 * FSD: pages/execution/SmartContractPage.tsx
 * Veri: features/digital-assets/api.ts
 * Tasarım: %100 Light Mode | Apple Glass
 */

import {
 useContracts,
 useVulnerabilities,
 type SmartContract,
} from '@/features/digital-assets/api';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
 Activity,
 AlertTriangle,
 Bug,
 CheckCircle2,
 ChevronRight,
 Code2,
 Cpu,
 GitBranch,
 Hexagon,
 History,
 Layers,
 Network,
 ShieldAlert,
 ShieldCheck
} from 'lucide-react';
import { useState } from 'react';

// ─── Formatting ─────────────────────────────────────────────────────────────

const formatAddress = (addr: string) => {
 if (!addr || addr.length < 12) return addr;
 return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

const SEVERITY_MAP = {
 'Critical': { color: 'text-red-700', bg: 'bg-red-100 border-red-200', icon: ShieldAlert },
 'High': { color: 'text-orange-700', bg: 'bg-orange-100 border-orange-200', icon: AlertTriangle },
 'Medium': { color: 'text-amber-700', bg: 'bg-amber-100 border-amber-200', icon: Activity },
 'Low': { color: 'text-blue-700', bg: 'bg-blue-100 border-blue-200', icon: Bug },
} as const;

const STATUS_MAP = {
 'Open': 'bg-orange-100 text-orange-700 border-orange-200',
 'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
 'Resolved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
 'Accepted Risk': 'bg-slate-100 text-slate-600 border-slate-200',
} as const;

const AUDIT_STATUS_MAP = {
 'Pending': { label: 'Bekliyor', color: 'bg-slate-100 text-slate-600', icon: History },
 'Scanning': { label: 'Taranıyor', color: 'bg-blue-100 text-blue-700 animate-pulse', icon: Activity },
 'Audited': { label: 'Denetlendi', color: 'bg-emerald-100 text-emerald-700', icon: ShieldCheck },
 'Critical Risk': { label: 'Kritik Risk', color: 'bg-red-100 text-red-700', icon: ShieldAlert },
} as const;

// ─── Contract Card ───────────────────────────────────────────────────────────

function ContractCard({ contract, onSelect, isSelected }: { contract: SmartContract, onSelect: () => void, isSelected: boolean }) {
 const st = AUDIT_STATUS_MAP[contract?.audit_status as keyof typeof AUDIT_STATUS_MAP] ?? AUDIT_STATUS_MAP['Pending'];
 const StatusIcon = st.icon;
 const isDanger = contract?.audit_status === 'Critical Risk';

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
 ? 'border-indigo-400 ring-2 ring-indigo-100 shadow-lg'
 : 'border-slate-200 hover:border-indigo-200 hover:shadow-md'
 )}
 >
 {isDanger && (
 <div className="absolute -right-8 -top-8 w-24 h-24 bg-red-400/10 rounded-full blur-xl pointer-events-none" />
 )}

 <div className="flex items-start justify-between gap-3 mb-2">
 <div className="flex flex-col gap-1.5 flex-1 pr-4">
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1', st.color)}>
 <StatusIcon size={10} /> {st.label}
 </span>
 <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-200 bg-white text-slate-600 flex items-center gap-1">
 <Network size={9} /> {contract?.network}
 </span>
 </div>
 <h3 className="text-sm font-bold text-slate-800 leading-snug truncate">{contract?.contract_name ?? 'Bilinmeyen Sözleşme'}</h3>
 </div>
 <ChevronRight size={14} className={clsx('text-slate-300 flex-shrink-0 mt-5 absolute right-4 transition-transform z-10', isSelected && 'rotate-90')} />
 </div>

 <div className="flex items-center gap-4 mt-3 mb-1 text-[10px] text-slate-500 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
 <div className="flex items-center gap-1 border-r border-slate-200 pr-4">
 <Hexagon size={12} className="text-slate-400" />
 <span className="font-mono">{formatAddress(contract?.contract_address)}</span>
 </div>
 <div className="flex items-center gap-1">
 <Cpu size={12} className="text-indigo-400" />
 <span className="font-mono">Solidity {contract?.solidity_version}</span>
 </div>
 </div>
 </motion.div>
 );
}

// ─── Vulnerability Panel ─────────────────────────────────────────────────────

function VulnerabilityPanel({ contractId }: { contractId: string }) {
 const { data: vulns, isLoading, error } = useVulnerabilities(contractId);

 if (isLoading) {
 return (
 <div className="flex items-center gap-2 py-4 justify-center text-slate-400">
 <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
 <span className="text-xs">Zafiyet analizi yükleniyor...</span>
 </div>
 );
 }

 if (error) {
 return (
 <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
 <AlertTriangle size={12} /> Analiz yüklenemedi.
 </div>
 );
 }

 if (!vulns || vulns.length === 0) {
 return (
 <div className="text-center py-4 text-emerald-600/60 bg-emerald-50/50 rounded-2xl border border-dashed border-emerald-200/60">
 <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
 <p className="text-xs font-semibold">Bu akıllı sözleşmede bilinen bir güvenlik zafiyeti bulunamadı.</p>
 <p className="text-[10px] mt-1 text-emerald-600/50">Denetim standartları karşılanmaktadır.</p>
 </div>
 );
 }

 return (
 <div className="space-y-4">
 <h4 className="text-xs font-black text-slate-700 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
 <Bug size={13} className="text-indigo-500" />
 Tespit Edilen Güvenlik Açıkları
 </h4>

 {(vulns || []).map((vuln, idx) => {
 const sev = SEVERITY_MAP[vuln?.severity as keyof typeof SEVERITY_MAP] ?? SEVERITY_MAP['Medium'];
 const stColor = STATUS_MAP[vuln?.status as keyof typeof STATUS_MAP] ?? STATUS_MAP['Open'];
 const SevIcon = sev.icon;

 return (
 <motion.div
 key={vuln?.id ?? idx}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: idx * 0.1 }}
 className="bg-white border rounded-xl shadow-sm relative overflow-hidden"
 >
 {/* Dekoratif Çizgi */}
 <div className={clsx("absolute top-0 left-0 bottom-0 w-1", sev.bg)} />
 
 <div className="p-4">
 <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
 <div className="flex items-center gap-2 w-full sm:w-auto">
 <span className={clsx('text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border', sev.bg, sev.color)}>
 <SevIcon size={9} /> {vuln?.severity}
 </span>
 <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded border border-current', stColor)}>
 {vuln?.status}
 </span>
 </div>
 </div>
 
 <h5 className="text-[12px] font-bold text-slate-800 leading-snug mb-1.5">{vuln?.vulnerability_type}</h5>
 <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
 {vuln?.description}
 </p>

 {vuln?.code_snippet && (
 <div className="mt-2 bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
 <div className="px-3 py-1 bg-slate-800 border-b border-slate-700 text-[9px] text-indigo-300 font-mono flex items-center justify-between">
 <span>code_snippet.sol</span>
 {vuln?.line_number && <span>Line {vuln.line_number}</span>}
 </div>
 <pre className="p-3 text-[10px] text-slate-300 font-mono overflow-x-auto">
 <code>{vuln.code_snippet}</code>
 </pre>
 </div>
 )}

 {vuln?.remediation_plan && (
 <div className="mt-3 text-[10px] bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100 flex gap-2">
 <GitBranch size={12} className="text-indigo-400 flex-shrink-0 mt-0.5" />
 <div className="text-slate-600">
 <strong className="text-indigo-700 font-semibold block mb-0.5">Çözüm Önerisi (Remediation):</strong>
 {vuln.remediation_plan}
 </div>
 </div>
 )}
 </div>
 </motion.div>
 );
 })}
 </div>
 );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SmartContractPage() {
 const { data: contracts, isLoading } = useContracts();
 const [selectedId, setSelectedId] = useState<string | null>(null);

 const selectedContract = (contracts || []).find(c => c?.id === selectedId) ?? null;

 const stats = {
 total: (contracts || []).length,
 critical: (contracts || []).filter(c => c?.audit_status === 'Critical Risk').length,
 audited: (contracts || []).filter(c => c?.audit_status === 'Audited').length,
 avgRisk: Math.round(((contracts || []).reduce((acc, c) => acc + (c?.risk_score ?? 0), 0)) / (Math.max(1, (contracts || []).length))),
 };

 return (
 <div className="min-h-screen p-4">
 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
 <div className="flex items-center gap-3 mb-1">
 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-800 to-slate-900 flex items-center justify-center shadow-sm">
 <Code2 className="w-5 h-5 text-indigo-200" />
 </div>
 <div>
 <h1 className="text-xl font-black text-slate-900 tracking-tight">Smart Contract & Digital Asset Ledger</h1>
 <p className="text-xs text-slate-500">Akıllı Sözleşme Zafiyet (Vulnerability) Tarayıcısı ve Token Envanteri</p>
 </div>
 </div>

 <div className="grid grid-cols-4 gap-3 mt-4">
 {[
 { label: 'Sözleşme Ağı', value: stats.total, icon: Layers, color: 'text-indigo-700' },
 { label: 'Denetlenen', value: stats.audited, icon: CheckCircle2,color: 'text-emerald-600' },
 { label: 'Kritik Riskli',value: stats.critical, icon: ShieldAlert, color: 'text-red-600' },
 { label: 'Ortalama Etki',value: stats.avgRisk, icon: Activity, color: 'text-orange-600' },
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
 
 {/* Sol Kolon: Contract List */}
 <div className="space-y-3">
 <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
 <Hexagon size={11} /> Zincir Üzeri Sözleşmeler (On-Chain)
 </div>

 {isLoading && (
 <div className="flex items-center justify-center py-10 text-slate-400">
 <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-700 rounded-full animate-spin mr-3" />
 <span className="text-xs font-medium">Sözleşmeler yükleniyor...</span>
 </div>
 )}

 {!isLoading && (contracts || []).length === 0 && (
 <div className="text-center py-12 text-slate-400 rounded-2xl border-2 border-dashed border-slate-200 bg-white/40">
 <Code2 className="w-8 h-8 mx-auto mb-2 opacity-25" />
 <p className="text-sm font-medium">Envanterde akıllı sözleşme bulunamadı.</p>
 </div>
 )}

 {(contracts || []).map(contract => (
 <ContractCard 
 key={contract?.id} 
 contract={contract} 
 onSelect={() => setSelectedId(contract?.id === selectedId ? null : contract?.id)} 
 isSelected={contract?.id === selectedId} 
 />
 ))}
 </div>

 {/* Sağ Kolon: Vuln List */}
 <div>
 <AnimatePresence mode="wait">
 {selectedContract ? (
 <motion.div
 key={selectedContract.id}
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 20 }}
 transition={{ duration: 0.2 }}
 className="space-y-4"
 >
 <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200 p-5 shadow-sm">
 <div className="flex items-start justify-between mb-2">
 <div>
 <h2 className="text-base font-black text-slate-900 mb-0.5">{selectedContract.contract_name}</h2>
 <div className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-flex items-center gap-1 font-mono mt-1">
 {selectedContract.contract_address} (Solidity {selectedContract.solidity_version})
 </div>
 </div>
 </div>
 <p className="text-[11px] text-slate-600 mt-2 mb-3 leading-relaxed">
 {selectedContract.description}
 </p>
 <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
 <div>
 <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">AI Risk Skoru (0-100)</span>
 <span className={clsx(
 "text-lg font-black px-3 py-1 rounded-lg border",
 (selectedContract?.risk_score ?? 0) > 75 ? "bg-red-50 text-red-600 border-red-200" :
 (selectedContract?.risk_score ?? 0) > 40 ? "bg-orange-50 text-orange-600 border-orange-200" :
 "bg-emerald-50 text-emerald-600 border-emerald-200"
 )}>
 {selectedContract.risk_score}
 </span>
 </div>
 {/* Deployment */}
 {selectedContract.deployment_date && (
 <div className="text-right">
 <span className="text-[10px] font-bold text-slate-400 uppercase block">Dağıtım (Deployment)</span>
 <span className="text-xs font-bold text-slate-700">{new Date(selectedContract.deployment_date).toLocaleDateString()}</span>
 </div>
 )}
 </div>
 </div>

 <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-slate-200 p-5 shadow-sm">
 <VulnerabilityPanel contractId={selectedContract.id} />
 </div>
 </motion.div>
 ) : (
 <motion.div
 key="empty"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="flex flex-col items-center justify-center h-64 text-slate-400 rounded-2xl border-2 border-dashed border-slate-200 bg-white/40"
 >
 <Code2 className="w-10 h-10 mb-3 opacity-20" />
 <p className="text-sm font-medium">Soldan bir akıllı sözleşme seçin</p>
 <p className="text-xs mt-1">Bağlantılı tokenlar ve zafiyet analiz kodu burada gösterilir</p>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 </div>
 </div>
 );
}
