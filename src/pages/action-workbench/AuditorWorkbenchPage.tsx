import { useActions } from '@/entities/action/api/action-api';
import type { ActionAgingMetrics } from '@/entities/action/model/types';
import { ActionStatusBadge } from '@/entities/action/ui/ActionStatusBadge';
import { AgingTierBadge } from '@/entities/action/ui/AgingTierBadge';
import { ActionSuperDrawer } from '@/widgets/action-super-drawer/ui/ActionSuperDrawer';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Clock3, Eye, Loader2, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

export default function AuditorWorkbenchPage() {
 const [openAction, setOpenAction] = useState<ActionAgingMetrics | null>(null);
 const { data: actions = [], isLoading } = useActions();

 const bddkActions = (actions || []).filter((a) => a.is_bddk_breach);
 const normalActions = (actions || []).filter((a) => !a.is_bddk_breach);

 return (
 <div className="min-h-screen bg-[#FDFBF7] p-5">
 <div className="max-w-4xl mx-auto">
 <motion.div
 initial={{ opacity: 0, y: -8 }}
 animate={{ opacity: 1, y: 0 }}
 className="mb-4"
 >
 <div className="flex items-center gap-3 mb-2">
 <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
 <ShieldAlert size={20} className="text-white" />
 </div>
 <div>
 <h1 className="text-2xl font-black text-primary">Denetçi Komuta Merkezi</h1>
 <p className="text-sm text-slate-500">Action Super Drawer — Faz 3 Test Görünümü</p>
 </div>
 </div>
 </motion.div>

 <div className="space-y-4">
 {isLoading ? (
 <div className="flex items-center justify-center p-12">
 <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
 </div>
 ) : (
 <>
 {bddkActions.length > 0 && (
 <>
 <SectionLabel label="Kritik BDDK İhlalleri" />
 {(bddkActions || []).map((action) => (
 <ActionTestCard
 key={action.id}
 action={action}
 onOpen={() => setOpenAction(action)}
 badge={
 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#700000] text-white">
 <AlertTriangle size={11} className="animate-pulse" />
 BDDK İhlali Aktif
 </span>
 }
 />
 ))}
 </>
 )}

 {normalActions.length > 0 && (
 <div className="mt-8">
 <SectionLabel label="Aksiyonlar" />
 {(normalActions || []).map((action) => (
 <ActionTestCard
 key={action.id}
 action={action}
 onOpen={() => setOpenAction(action)}
 badge={
 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
 <CheckCircle2 size={11} />
 Normal Aksiyon
 </span>
 }
 />
 ))}
 </div>
 )}

 {actions.length === 0 && (
 <div className="p-5 text-center text-sm font-medium text-slate-500 bg-surface rounded-xl border border-slate-200">
 Şu an için atanmış bir aksiyon bulunmamaktadır.
 </div>
 )}
 </>
 )}
 </div>

 <div className="mt-8 p-5 bg-surface border border-slate-200 rounded-xl shadow-sm">
 <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
 Bileşen Referans Rehberi
 </p>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-600">
 {[
 { label: 'ForensicTimeline', path: 'shared/ui/ForensicTimeline' },
 { label: 'AuditorDecisionBar', path: 'features/action-review/ui/AuditorDecisionBar' },
 { label: 'AIEvidenceAnalyzer', path: 'features/action-review/ui/AIEvidenceAnalyzer' },
 { label: 'TraceabilityGoldenThread', path: 'features/action-review/ui/TraceabilityGoldenThread' },
 { label: 'ActionSuperDrawer', path: 'widgets/action-super-drawer/ui/ActionSuperDrawer' },
 { label: 'ActionStatusBadge', path: 'entities/action/ui/ActionStatusBadge' },
 ].map(({ label, path }) => (
 <div key={label} className="font-mono bg-canvas border border-slate-200 rounded-lg px-3 py-2">
 <p className="font-bold text-slate-700">{label}</p>
 <p className="text-slate-400 text-[10px] mt-0.5 truncate">src/{path}</p>
 </div>
 ))}
 </div>
 </div>
 </div>

 {openAction && (
 <ActionSuperDrawer
 action={openAction}
 isOpen={!!openAction}
 onClose={() => setOpenAction(null)}
 onDecision={(v) => {
 console.log('Decision:', v);
 setOpenAction(null);
 }}
 />
 )}
 </div>
 );
}

function SectionLabel({ label }: { label: string }) {
 return (
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
 {label}
 </p>
 );
}

function ActionTestCard({
 action,
 onOpen,
 badge,
}: {
 action: ActionAgingMetrics;
 onOpen: () => void;
 badge: React.ReactNode;
}) {
 const snapshot = action.finding_snapshot;
 return (
 <motion.div
 initial={{ opacity: 0, y: 6 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-surface border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
 >
 <div className="flex items-start justify-between gap-4 mb-4">
 <div className="flex-1 min-w-0">
 <div className="flex flex-wrap items-center gap-2 mb-2">
 {badge}
 <ActionStatusBadge status={action.status} />
 <AgingTierBadge
 tier={action.aging_tier}
 isBddbBreach={action.is_bddk_breach}
 overdayDays={action.operational_delay_days > 0 ? action.operational_delay_days : undefined}
 />
 </div>
 <h3 className="text-sm font-bold text-slate-800 line-clamp-2">
 {snapshot?.title}
 </h3>
 </div>
 </div>

 <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
 <span className="flex items-center gap-1">
 <Clock3 size={11} />
 Son: {action.current_due_date}
 </span>
 <span>{action.evidence_count} kanıt dosyası</span>
 <span className="inline-flex items-center gap-1">
 <CheckCircle2 size={11} />
 {action.regulatory_tags.join(', ')}
 </span>
 </div>

 <button
 onClick={onOpen}
 className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
 >
 <Eye size={14} />
 Super Drawer'ı Aç
 </button>
 </motion.div>
 );
}
