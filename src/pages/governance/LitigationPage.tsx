/**
 * Litigation & Penalty Prediction Engine
 * Wave 75: Dava ve Ceza Tahmin Motoru (Yönetişim)
 *
 * FSD: pages/governance/LitigationPage.tsx
 * Veri: features/litigation/api.ts
 * Tasarım: %100 Light Mode | Apple Glass
 */

import {
 useInvestigations,
 useLegalCases,
 usePenalties,
 type LegalCase,
 type RegulatoryInvestigation
} from '@/features/litigation/api';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
 Activity,
 AlertOctagon,
 AlertTriangle,
 Bookmark,
 Briefcase,
 CheckCircle2,
 ChevronRight,
 Gavel,
 Scale,
 ShieldAlert,
 TrendingDown
} from 'lucide-react';
import { useState } from 'react';

// ─── Formatting ─────────────────────────────────────────────────────────────

const formatCurrency = (val: number | null) => {
 const num = val ?? 0;
 if (num >= 1_000_000) return `₺${(num / 1_000_000).toFixed(2)}M`;
 if (num >= 1_000) return `₺${(num / 1_000).toFixed(0)}K`;
 return `₺${num}`;
};

const CASE_STATUS_MAP = {
 'Açık': { color: 'text-orange-700', border: 'border-orange-200' },
 'Derhal Çözüldü': { color: 'text-emerald-700', border: 'border-emerald-200' },
 'Karara Bağlandı': { color: 'text-blue-700', border: 'border-blue-200' },
 'Temyiz (İstinaf)': { color: 'text-amber-700', border: 'border-amber-200' },
 'Kapalı': { color: 'text-slate-600', border: 'border-slate-200' },
} as const;

const INVESTIGATION_STATUS_MAP = {
 'Ön İnceleme': { color: 'text-blue-700', border: 'border-blue-200' },
 'İncelemede': { color: 'text-orange-700', border: 'border-orange-200' },
 'Savunma Aşamasında': { color: 'text-amber-700', border: 'border-amber-200' },
 'Karara Bağlandı': { color: 'text-indigo-700', border: 'border-indigo-200' },
 'İptal Edildi': { color: 'text-emerald-700', border: 'border-emerald-200' },
} as const;


// ─── Legal Case Card ────────────────────────────────────────────────────────

function CaseCard({ item, onSelect, isSelected }: { item: LegalCase, onSelect: () => void, isSelected: boolean }) {
 const stColor = CASE_STATUS_MAP[item?.status as keyof typeof CASE_STATUS_MAP] ?? CASE_STATUS_MAP['Açık'];

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
 ? 'border-red-400 ring-2 ring-red-100 shadow-lg'
 : 'border-slate-200 hover:border-red-200 hover:shadow-md'
 )}
 >
 <div className="flex items-start justify-between gap-3 mb-2">
 <div className="flex flex-col gap-1.5 flex-1 pr-6">
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded border border-current bg-white/50', stColor.color, stColor.border)}>
 {item?.status}
 </span>
 <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-200 bg-white text-slate-600 flex items-center gap-1">
 <Gavel size={9} /> {item?.case_type}
 </span>
 </div>
 <h3 className="text-sm font-bold text-slate-800 leading-snug truncate">{item?.plaintiff} vs. {item?.defendant}</h3>
 </div>
 <ChevronRight size={14} className={clsx('text-slate-300 flex-shrink-0 mt-5 absolute right-4 transition-transform z-10', isSelected && 'rotate-90')} />
 </div>

 <div className="flex items-center justify-between mt-3 mb-1 text-[10px] text-slate-500 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
 <div className="flex flex-col gap-0.5">
 <span className="font-bold text-[9px] uppercase tracking-wider text-slate-400">Dosya / Mahkeme</span>
 <span className="font-medium text-slate-700">{item?.case_number} | {item?.court}</span>
 </div>
 <div className="flex flex-col gap-0.5 text-right">
 <span className="font-bold text-[9px] uppercase tracking-wider text-red-400">Talep Edilen</span>
 <span className="font-mono font-bold text-red-600 border-b border-red-200/50 pb-0.5">{formatCurrency(item?.claimed_amount)}</span>
 </div>
 </div>
 </motion.div>
 );
}

// ─── Investigation Card ─────────────────────────────────────────────────────

function InvestigationCard({ item, onSelect, isSelected }: { item: RegulatoryInvestigation, onSelect: () => void, isSelected: boolean }) {
 const stColor = INVESTIGATION_STATUS_MAP[item?.status as keyof typeof INVESTIGATION_STATUS_MAP] ?? INVESTIGATION_STATUS_MAP['İncelemede'];

 return (
 <motion.div
 layout
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 onClick={onSelect}
 className={clsx(
 'cursor-pointer rounded-xl border p-4 transition-all relative overflow-hidden',
 'bg-slate-50/70 backdrop-blur-lg shadow-sm',
 isSelected
 ? 'border-orange-400 ring-2 ring-orange-100 shadow-lg'
 : 'border-slate-200 hover:border-orange-200 hover:shadow-md'
 )}
 >
 <div className="flex items-start justify-between gap-3 mb-2">
 <div className="flex flex-col gap-1.5 flex-1 pr-6">
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded border border-current bg-white/50', stColor.color, stColor.border)}>
 {item?.status}
 </span>
 <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-200 bg-white text-slate-600 flex items-center gap-1 uppercase">
 <AlertOctagon size={9} className="text-orange-500" /> {item?.regulator}
 </span>
 </div>
 <h3 className="text-sm font-bold text-slate-800 leading-snug truncate">Soruşturma: {item?.subject}</h3>
 </div>
 <ChevronRight size={14} className={clsx('text-slate-300 flex-shrink-0 mt-5 absolute right-4 transition-transform z-10', isSelected && 'rotate-90')} />
 </div>

 <div className="flex items-center justify-between mt-3 mb-1 text-[10px] text-slate-500 bg-white/60 p-2 rounded-lg border border-slate-100">
 <div className="flex flex-col gap-0.5">
 <span className="font-bold text-[9px] uppercase tracking-wider text-slate-400">Başmüfettiş</span>
 <span className="font-medium text-slate-700 flex items-center gap-1">
 <Briefcase size={10} /> {item?.investigator_lead ?? 'Atanmadı'}
 </span>
 </div>
 <div className="flex flex-col gap-0.5 text-right">
 <span className="font-bold text-[9px] uppercase tracking-wider text-slate-400">İnceleme Tarihi</span>
 <span className="font-medium text-slate-700">{new Date(item?.investigation_date).toLocaleDateString()}</span>
 </div>
 </div>
 </motion.div>
 );
}

// ─── Penalty Predictor Panel ────────────────────────────────────────────────

function PenaltyPredictorPanel({ referenceId }: { referenceId: string }) {
 const { data: penalties, isLoading, error } = usePenalties(referenceId);

 if (isLoading) {
 return (
 <div className="flex items-center gap-2 py-5 justify-center text-slate-400">
 <div className="w-4 h-4 border-2 border-red-300 border-t-red-700 rounded-full animate-spin" />
 <span className="text-xs">AI Risk Motoru çalışıyor...</span>
 </div>
 );
 }

 if (error) {
 return (
 <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
 <AlertTriangle size={12} /> Tahminleme motoru API hatası.
 </div>
 );
 }

 if (!penalties || penalties.length === 0) {
 return (
 <div className="text-center py-4 text-emerald-600/60 bg-emerald-50/50 rounded-2xl border border-dashed border-emerald-200/60">
 <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
 <p className="text-xs font-semibold">Bu dosya için henüz AI tahminlemesi (Provision) çıkarılmamış.</p>
 <p className="text-[10px] mt-1 text-emerald-600/50">Risksiz kabul ediliyor.</p>
 </div>
 );
 }

 return (
 <div className="space-y-4">
 <h4 className="text-xs font-black text-slate-800 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
 <TrendingDown size={13} className="text-red-500" />
 Ceza & Karşılık (Provision) Tahmini
 </h4>

 {(penalties || []).map((pred, idx) => {
 const prob = Math.round(pred?.predicted_loss_prob ?? 0);
 const isHighRisk = prob > 50;
 const confidence = Math.round(pred?.ai_confidence ?? 0);

 return (
 <motion.div
 key={pred?.id ?? idx}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: idx * 0.1 }}
 className="bg-white border rounded-xl shadow-sm relative overflow-hidden p-4"
 >
 {/* Risk Bar in BG */}
 <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100">
 <motion.div 
 initial={{ width: 0 }}
 animate={{ width: `${prob}%` }}
 className={clsx("h-full", isHighRisk ? "bg-red-500" : "bg-orange-400")}
 />
 </div>
 
 <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mt-2">
 <div className="flex-1">
 <div className="flex items-end gap-3 mb-3">
 <div>
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Kaybetme Olasılığı</div>
 <div className={clsx("text-3xl font-black tracking-tighter", isHighRisk ? "text-red-600" : "text-orange-600")}>
 %{prob}
 </div>
 </div>
 <div className="pb-1">
 <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
 <Activity size={9} /> AI Güven Skoru
 </div>
 <div className="text-xs font-bold text-slate-700 border px-1.5 py-0.5 rounded-md bg-slate-100 inline-block">% {confidence}</div>
 </div>
 </div>

 {pred?.risk_factors && pred.risk_factors.length > 0 && (
 <div className="mb-3">
 <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Risk Faktörleri</div>
 <ul className="flex flex-wrap gap-1.5">
 {(pred.risk_factors || []).map((rf, i) => (
 <li key={i} className="text-[10px] font-medium text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded flex items-center gap-1">
 <AlertTriangle size={9} /> {rf}
 </li>
 ))}
 </ul>
 </div>
 )}

 {pred?.mitigation_strategy && (
 <div className="text-[10px] bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 text-emerald-800">
 <strong className="text-emerald-700 font-bold block mb-0.5">Savunma Stratejisi:</strong>
 {pred.mitigation_strategy}
 </div>
 )}
 </div>

 {/* Tutar Paneli */}
 <div className="md:w-1/3 bg-red-50/50 border border-red-100 rounded-xl p-3 flex flex-col justify-center text-right">
 <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider mb-1 flex items-center justify-end gap-1">
 Ayrılacak Karşılık <ShieldAlert size={10} />
 </span>
 <span className="text-xl font-black text-red-700 font-mono tracking-tight leading-none">
 {formatCurrency(pred?.predicted_penalty_amount)}
 </span>
 <span className="text-[8px] text-red-400/80 font-medium mt-2 leading-tight">
 IFRS 9 ve UFRS 37 uyumlu karşılık / provision bütçesi.
 </span>
 </div>
 </div>
 
 </motion.div>
 );
 })}
 </div>
 );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LitigationPage() {
 const { data: cases, isLoading: loadingCases } = useLegalCases();
 const { data: investigations, isLoading: loadingInv } = useInvestigations();
 
 const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
 const [selectedInvId, setSelectedInvId] = useState<string | null>(null);

 const totalExposure = (cases || []).reduce((acc, c) => acc + (c?.claimed_amount ?? 0), 0);
 const activeCasesCount = (cases || []).filter(c => c?.status !== 'Kapalı' && c?.status !== 'Karara Bağlandı').length;
 const activeInvCount = (investigations || []).filter(i => i?.status !== 'İptal Edildi' && i?.status !== 'Karara Bağlandı').length;

 const handleSelectCase = (id: string) => {
 setSelectedCaseId(id === selectedCaseId ? null : id);
 setSelectedInvId(null);
 };
 const handleSelectInv = (id: string) => {
 setSelectedInvId(id === selectedInvId ? null : id);
 setSelectedCaseId(null);
 };

 const hasSelection = selectedCaseId !== null || selectedInvId !== null;

 return (
 <div className="min-h-screen p-4">
 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
 <div className="flex items-center gap-3 mb-1">
 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-800 to-rose-900 flex items-center justify-center shadow-sm border border-red-900/50">
 <Scale className="w-5 h-5 text-red-100" />
 </div>
 <div>
 <h1 className="text-xl font-black text-slate-900 tracking-tight">Litigation & Penalty Prediction</h1>
 <p className="text-xs text-slate-500">Dava, Düzenleyici Kurum Soruşturmaları ve AI Karşılık (Provision) Motoru</p>
 </div>
 </div>

 <div className="grid grid-cols-3 gap-3 mt-4">
 {[
 { label: 'Aktif Davalar', value: activeCasesCount, icon: Gavel, color: 'text-rose-700' },
 { label: 'Açık Soruşturmalar',value: activeInvCount, icon: AlertOctagon, color: 'text-orange-600' },
 { label: 'Toplam Risk (Talep)',value: formatCurrency(totalExposure), icon: ShieldAlert, color: 'text-red-700' },
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
 
 {/* Sol Kolon: Listeler */}
 <div className="space-y-4">
 
 {/* Investigations (Soruşturmalar) - Üstte */}
 <div>
 <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
 <AlertOctagon size={11} className="text-orange-500" /> Kurum Soruşturmaları
 </div>
 {loadingInv && <div className="text-xs text-slate-400 py-4 pl-2">Yükleniyor...</div>}
 {!loadingInv && (investigations || []).length === 0 && (
 <div className="text-xs text-slate-400 py-4 pl-2 font-medium italic">Aktif soruşturma bulunamadı.</div>
 )}
 <div className="space-y-2">
 {(investigations || []).map(inv => (
 <InvestigationCard 
 key={inv.id} 
 item={inv} 
 onSelect={() => handleSelectInv(inv.id)} 
 isSelected={inv.id === selectedInvId} 
 />
 ))}
 </div>
 </div>

 {/* Legal Cases (Davalar) - Altta */}
 <div>
 <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
 <Gavel size={11} className="text-red-500" /> Aktif Davalar
 </div>
 {loadingCases && <div className="text-xs text-slate-400 py-4 pl-2">Yükleniyor...</div>}
 {!loadingCases && (cases || []).length === 0 && (
 <div className="text-xs text-slate-400 py-4 pl-2 font-medium italic">Dava kaydı bulunamadı.</div>
 )}
 <div className="space-y-2">
 {(cases || []).map(c => (
 <CaseCard 
 key={c.id} 
 item={c} 
 onSelect={() => handleSelectCase(c.id)} 
 isSelected={c.id === selectedCaseId} 
 />
 ))}
 </div>
 </div>
 </div>

 {/* Sağ Kolon: Penalty Predictor Paneli */}
 <div>
 <AnimatePresence mode="wait">
 {hasSelection ? (
 <motion.div
 key={selectedCaseId || selectedInvId || 'selected'}
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 20 }}
 transition={{ duration: 0.2 }}
 className="sticky top-6"
 >
 <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200 p-5 shadow-sm">
 {/* Başlık: Ne seçildiyse onu okuyoruz */}
 {selectedCaseId && (
 <div className="mb-4">
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Gavel size={11} /> Dava Dosyası Özeti</div>
 <h2 className="text-sm font-black text-slate-800">
 {cases?.find(c => c.id === selectedCaseId)?.plaintiff} vs. {cases?.find(c => c.id === selectedCaseId)?.defendant}
 </h2>
 </div>
 )}
 {selectedInvId && (
 <div className="mb-4">
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><AlertOctagon size={11} /> Soruşturma Özeti</div>
 <h2 className="text-sm font-black text-slate-800">
 {investigations?.find(i => i.id === selectedInvId)?.regulator} - {investigations?.find(i => i.id === selectedInvId)?.subject}
 </h2>
 </div>
 )}

 <PenaltyPredictorPanel referenceId={(selectedCaseId || selectedInvId)!} />
 </div>
 </motion.div>
 ) : (
 <motion.div
 key="empty"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="flex flex-col items-center justify-center h-64 text-slate-400 rounded-2xl border-2 border-dashed border-slate-200 bg-white/40 sticky top-6"
 >
 <Bookmark className="w-10 h-10 mb-3 opacity-20" />
 <p className="text-sm font-medium">Soldan bir dava dosyası veya soruşturma seçin</p>
 <p className="text-xs mt-1">AI tabanlı olası ceza / bütçe karşılığı tahmini burada gösterilir</p>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 </div>
 </div>
 );
}
