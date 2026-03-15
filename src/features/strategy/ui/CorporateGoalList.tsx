/**
 * SENTINEL GRC v3.0 — Stratejik Hedef Listesi (Supabase Bağlı)
 * =============================================================
 * GIAS 2025 Standard IV — Stratejik Uyum
 *
 * Bu bileşen artık Zustand store yerine doğrudan Supabase'den
 * `useStrategicGoals` hook'u ile veri çeker. Aşırı savunmacı
 * programlama standartları geçerlidir.
 */

import type { RiskAppetite, StrategicGoalDB } from '@/entities/strategy/api/strategy-api';
import { useLinkGoalToUniverse, useStrategicGoals } from '@/entities/strategy/api/strategy-api';
import { useAuditUniverse } from '@/entities/universe/api/universe-api';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import {
 AlertTriangle,
 Calendar,
 ChevronRight,
 Loader2,
 MoreHorizontal,
 Network,
 RefreshCw,
 TrendingUp, User
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

// ─── Yardımcı stiller ─────────────────────────────────────────────────────────

function getRiskBadge(appetite: RiskAppetite | string | null | undefined): string {
 switch (appetite ?? 'Medium') {
 case 'High': return 'bg-rose-100 text-rose-700 border-rose-200';
 case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
 default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
 }
}

// ─── Universe Bağlama Dropdown'u ──────────────────────────────────────────────

interface UniverseLinkDropdownProps {
 goal: StrategicGoalDB;
 onClose: () => void;
}

function UniverseLinkDropdown({ goal, onClose }: UniverseLinkDropdownProps) {
 const { data: hierarchy = [] } = useAuditUniverse();
 const { mutate: linkGoal, isPending } = useLinkGoalToUniverse();

 // Ağacı düzelt: tüm düğümleri flat al
 function flattenHierarchy(nodes: typeof hierarchy, depth = 0): { id: string; name: string; path: string; depth: number }[] {
 const result: { id: string; name: string; path: string; depth: number }[] = [];
 for (const node of (nodes || [])) {
 result.push({
 id: node?.id ?? '',
 name: node?.name ?? '—',
 path: node?.path ?? '',
 depth,
 });
 if ((node?.children || []).length > 0) {
 result.push(...flattenHierarchy(node.children ?? [], depth + 1));
 }
 }
 return result;
 }

 const flatNodes = flattenHierarchy(hierarchy);

 return (
 <div
 className="absolute right-0 top-8 z-30 w-72 rounded-xl shadow-xl overflow-hidden"
 style={{
 background: '#1e293b',
 border: '1px solid rgba(148,163,184,0.15)',
 }}
 >
 <div className="px-3 py-2.5 border-b border-slate-700">
 <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
 Universe Node'una Bağla
 </p>
 <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">{goal.title}</p>
 </div>
 <div className="max-h-56 overflow-y-auto">
 {(flatNodes || []).map((node) => (
 <button
 key={node.id}
 disabled={isPending}
 onClick={() => {
 linkGoal(
 { goal_id: goal.id, universe_node_id: node.id, linked_universe_path: node.path },
 { onSuccess: onClose }
 );
 }}
 className={clsx(
 'w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-white/5 transition-colors',
 goal.universe_node_id === node.id ? 'bg-indigo-500/10' : ''
 )}
 style={{ paddingLeft: `${12 + node.depth * 14}px` }}
 >
 <Network size={11} className="text-slate-500 flex-shrink-0" />
 <span className="text-xs text-slate-300 truncate">{node.name}</span>
 {goal.universe_node_id === node.id && (
 <span className="ml-auto text-[9px] text-indigo-400 font-bold">BAĞLI</span>
 )}
 </button>
 ))}
 {flatNodes.length === 0 && (
 <p className="text-xs text-slate-500 p-3">Denetim evreni boş</p>
 )}
 </div>
 </div>
 );
}

// ─── Ana Bileşen ───────────────────────────────────────────────────────────────

export const CorporateGoalList = () => {
 const [year] = useState(new Date().getFullYear());
 const [openDropdown, setOpenDropdown] = useState<string | null>(null);

 const {
 data: goals,
 isLoading,
 isError,
 error,
 refetch,
 } = useStrategicGoals(year);

 // ─── Loading State ────────────────────────────────────────────────────────
 if (isLoading) {
 return (
 <div className="w-full bg-surface/60 backdrop-blur-xl border border-white/50 rounded-2xl shadow-sm p-12 flex items-center justify-center">
 <Loader2 className="animate-spin text-slate-400" size={28} />
 </div>
 );
 }

 // ─── Error State ──────────────────────────────────────────────────────────
 if (isError) {
 const errMsg = error instanceof Error ? error.message : 'Bilinmeyen veritabanı hatası';
 console.error('[SENTINEL][Strategy] CorporateGoalList fetch error:', error);
 toast.error(`Stratejik hedefler yüklenemedi: ${errMsg}`, { id: 'goals-error' });

 return (
 <div className="w-full bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col items-center text-center">
 <AlertTriangle className="text-red-400 mb-3" size={32} />
 <h4 className="text-sm font-bold text-red-700 mb-1">Stratejik Hedefler Yüklenemedi</h4>
 <p className="text-xs text-red-500 mb-4 max-w-xs">{errMsg}</p>
 <button
 onClick={() => refetch()}
 className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors"
 >
 <RefreshCw size={12} />
 Yeniden Dene
 </button>
 </div>
 );
 }

 // ─── Empty State ──────────────────────────────────────────────────────────
 if (!(goals || []).length) {
 return (
 <div className="w-full bg-surface/60 backdrop-blur-xl border border-white/50 rounded-2xl shadow-sm p-12 text-center text-slate-400">
 <TrendingUp size={32} className="mx-auto mb-3 opacity-30" />
 <p className="text-sm font-medium">Henüz tanımlanmış bir stratejik hedef yok.</p>
 <p className="text-xs text-slate-500 mt-1">{year} yılı için hedef ekleyebilirsiniz.</p>
 </div>
 );
 }

 // ─── Data State ───────────────────────────────────────────────────────────
 return (
 <div className="w-full bg-surface/60 backdrop-blur-xl border border-white/50 rounded-2xl shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-slate-200/60 bg-canvas/50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
 <th className="px-6 py-4">Stratejik Hedef</th>
 <th className="px-6 py-4">Dönem &amp; Sahiplik</th>
 <th className="px-6 py-4 w-48">Risk İştahı</th>
 <th className="px-6 py-4 w-64">İlerleme Durumu</th>
 <th className="px-6 py-4 text-right">Ağırlık</th>
 <th className="px-6 py-4 text-center">Universe</th>
 <th className="px-6 py-4 text-center">İşlem</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {(goals || []).map((goal: StrategicGoalDB) => (
 <motion.tr
 key={goal?.id ?? Math.random()}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="hover:bg-surface/80 transition-colors group cursor-pointer"
 >
 {/* 1. Hedef Başlığı */}
 <td className="px-6 py-4">
 <div className="flex items-start gap-3">
 <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg mt-1">
 <TrendingUp size={18} />
 </div>
 <div>
 <h4 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-indigo-700 transition-colors">
 {goal?.title ?? '—'}
 </h4>
 <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-md">
 {goal?.description ?? 'Açıklama girilmemiş.'}
 </p>
 {/* Universe bağlantısı badge */}
 {goal?.linked_universe_path && (
 <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[9px] bg-indigo-50 text-indigo-600 border border-indigo-100">
 <Network size={8} />
 {goal.linked_universe_path}
 </span>
 )}
 </div>
 </div>
 </td>

 {/* 2. Dönem & Sahip */}
 <td className="px-6 py-4">
 <div className="space-y-1.5">
 <div className="flex items-center gap-2 text-xs text-slate-600">
 <Calendar size={12} className="text-slate-400" />
 <span className="font-medium">{goal?.period_year ?? year}</span>
 </div>
 <div className="flex items-center gap-2 text-xs text-slate-600">
 <User size={12} className="text-slate-400" />
 <span>{goal?.owner ?? 'Atanmamış'}</span>
 </div>
 </div>
 </td>

 {/* 3. Risk İştahı */}
 <td className="px-6 py-4">
 <span className={clsx(
 'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border',
 getRiskBadge(goal?.risk_appetite)
 )}>
 {goal?.risk_appetite ?? 'Medium'} Risk
 </span>
 </td>

 {/* 4. İlerleme */}
 <td className="px-6 py-4">
 <div className="space-y-1.5">
 <div className="flex justify-between text-xs font-semibold">
 <span className="text-slate-600">Gerçekleşme</span>
 <span className="text-indigo-600">{goal?.progress ?? 0}%</span>
 </div>
 <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
 <motion.div
 className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
 initial={{ width: 0 }}
 animate={{ width: `${goal?.progress ?? 0}%` }}
 transition={{ duration: 0.8, ease: 'easeOut' }}
 />
 </div>
 </div>
 </td>

 {/* 5. Ağırlık */}
 <td className="px-6 py-4 text-right">
 <span className="text-sm font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
 %{goal?.weight ?? 10}
 </span>
 </td>

 {/* 6. Universe Bağlama */}
 <td className="px-6 py-4 text-center">
 <div className="relative flex justify-center">
 <button
 onClick={() => setOpenDropdown(openDropdown === goal.id ? null : goal.id)}
 className={clsx(
 'p-1.5 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold',
 goal?.universe_node_id
 ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
 : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
 )}
 title="Universe node'una bağla"
 >
 <Network size={13} />
 {goal?.universe_node_id ? (
 <ChevronRight size={11} />
 ) : (
 <span>Bağla</span>
 )}
 </button>

 {/* Universe Link Dropdown */}
 {openDropdown === goal.id && (
 <UniverseLinkDropdown
 goal={goal}
 onClose={() => setOpenDropdown(null)}
 />
 )}
 </div>
 </td>

 {/* 7. Aksiyon */}
 <td className="px-6 py-4 text-center">
 <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition-all">
 <MoreHorizontal size={18} />
 </button>
 </td>
 </motion.tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
};