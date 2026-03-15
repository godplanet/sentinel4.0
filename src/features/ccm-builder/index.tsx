/**
 * CCM Builder — Ana Sayfa
 * features/ccm-builder/index.tsx (Wave 52)
 *
 * Kural listesi + RuleCanvas editörü yan yana
 * C-Level · %100 Light Mode · Apple Glassmorphism
 */

import { RuleCanvas } from '@/widgets/RuleCanvas';
import { motion } from 'framer-motion';
import {
 AlertTriangle,
 BarChart3,
 CheckCircle2,
 ChevronRight,
 Cpu,
 Edit3,
 Loader2,
 Plus, Wifi, WifiOff,
} from 'lucide-react';
import { useState } from 'react';
import {
 useRuleStats,
 useToggleRule,
 useVisualRules,
 type VisualRule,
} from './api/ccm-builder';

// ─── Sabitler ─────────────────────────────────────────────────────────────────

const SEV_CFG: Record<string, { bg: string; text: string; border: string }> = {
 CRITICAL: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
 HIGH: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
 MEDIUM: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
 LOW: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200' },
};

const CAT_COLORS: Record<string, string> = {
 AML: 'bg-red-100 text-red-700',
 FRAUD: 'bg-purple-100 text-purple-700',
 STRUCTURING: 'bg-orange-100 text-orange-700',
 BENFORD: 'bg-teal-100 text-teal-700',
 REGULATORY: 'bg-blue-100 text-blue-700',
 OPERATIONAL: 'bg-slate-100 text-slate-600',
};

// ─── Kural Kart Bileşeni ──────────────────────────────────────────────────────

function RuleCard({
 rule,
 isSelected,
 onSelect,
}: {
 rule: VisualRule;
 isSelected: boolean;
 onSelect: (r: VisualRule) => void;
}) {
 const toggle = useToggleRule();
 const sevCfg = SEV_CFG[rule.severity] ?? SEV_CFG.LOW;

 return (
 <motion.div
 initial={{ opacity: 0, y: 4 }}
 animate={{ opacity: 1, y: 0 }}
 onClick={() => onSelect(rule)}
 className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:shadow-sm
 ${isSelected ? 'border-blue-400 ring-2 ring-blue-100 bg-blue-50/50' : `${sevCfg.bg} ${sevCfg.border}`}
 ${!rule.is_active ? 'opacity-60' : ''}`}
 >
 <div className="flex items-start justify-between gap-2 mb-2">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
 <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${CAT_COLORS[rule.category] ?? CAT_COLORS.OPERATIONAL}`}>
 {rule.category}
 </span>
 <span className={`text-[8px] font-black ${sevCfg.text}`}>{rule.severity}</span>
 <span className="text-[8px] font-mono text-slate-400">v{rule.version}</span>
 </div>
 <p className="text-[11px] font-bold text-slate-800 leading-snug line-clamp-2">{rule.name}</p>
 </div>

 <button
 onClick={(e) => {
 e.stopPropagation();
 toggle.mutate({ id: rule.id, is_active: !rule.is_active });
 }}
 disabled={toggle.isPending}
 className="shrink-0 mt-0.5"
 title={rule.is_active ? 'Duraklat' : 'Etkinleştir'}
 >
 {rule.is_active
 ? <Wifi size={13} className="text-emerald-500" />
 : <WifiOff size={13} className="text-slate-300" />
 }
 </button>
 </div>

 <div className="flex items-center justify-between">
 <div className="flex items-center gap-1 text-[9px] text-slate-500">
 <BarChart3 size={9} />
 <span>{rule.nodes_json?.length ?? 0} düğüm</span>
 </div>
 <ChevronRight size={11} className="text-slate-300" />
 </div>
 </motion.div>
 );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────

export function CCMBuilderPage() {
 const [selectedRule, setSelectedRule] = useState<VisualRule | null>(null);
 const [isCreatingNew, setIsCreatingNew] = useState(false);

 const { data: rules = [], isLoading } = useVisualRules();
 const { data: stats } = useRuleStats();

 const handleNewRule = () => {
 setSelectedRule(null);
 setIsCreatingNew(true);
 };

 const showCanvas = isCreatingNew || !!selectedRule;

 return (
 <div className="h-full flex flex-col bg-slate-50/50">
 {/* Başlık */}
 <div className="px-6 pt-6 pb-4 bg-white/70 backdrop-blur-lg border-b border-slate-200 shadow-sm">
 <div className="flex items-center justify-between gap-3 mb-4">
 <div className="flex items-center gap-3">
 <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
 <Cpu size={20} className="text-white" />
 </div>
 <div>
 <h1 className="text-xl font-black text-slate-800 tracking-tight">Visual CCM Rule Builder</h1>
 <p className="text-xs text-slate-500 mt-0.5">Görsel Sürükle-Bırak CCM Kural Editörü · Wave 52</p>
 </div>
 </div>
 <button
 onClick={handleNewRule}
 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm transition-colors"
 >
 <Plus size={14} /> Yeni Kural
 </button>
 </div>

 {/* KPI */}
 <div className="grid grid-cols-4 gap-3">
 {[
 { label: 'Toplam Kural', value: stats?.total ?? '—', icon: Cpu, color: 'text-slate-700' },
 { label: 'Aktif', value: stats?.active ?? '—', icon: CheckCircle2, color: 'text-emerald-600' },
 { label: 'Kritik', value: stats?.critical ?? '—', icon: AlertTriangle, color: 'text-red-600' },
 { label: 'AML Kuralları', value: stats?.categoryBreakdown?.AML ?? '—', icon: Edit3, color: 'text-purple-600' },
 ].map(({ label, value, icon: Icon, color }) => (
 <div key={label} className="bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-center">
 <Icon size={15} className={`${color} mx-auto mb-1`} />
 <p className="text-lg font-black text-slate-800">{value}</p>
 <p className="text-[9px] text-slate-400 font-bold uppercase">{label}</p>
 </div>
 ))}
 </div>
 </div>

 {/* İçerik */}
 <div className="flex-1 overflow-hidden flex">
 {/* Sol: Kural Listesi */}
 <div className="w-64 shrink-0 border-r border-slate-200 bg-white/60 backdrop-blur overflow-y-auto p-4 space-y-2">
 <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-3">Kayıtlı Kurallar</p>

 {isLoading ? (
 <div className="flex items-center justify-center py-12">
 <Loader2 size={18} className="animate-spin text-slate-400" />
 </div>
 ) : (rules || []).length === 0 ? (
 <p className="text-xs text-slate-400 text-center py-5">Henüz kural yok.</p>
 ) : (
 (rules || []).map((rule) => (
 <RuleCard
 key={rule.id}
 rule={rule}
 isSelected={selectedRule?.id === rule.id}
 onSelect={(r) => { setSelectedRule(r); setIsCreatingNew(false); }}
 />
 ))
 )}
 </div>

 {/* Sağ: Tuval veya Boş Durum */}
 <div className="flex-1 overflow-hidden">
 {showCanvas ? (
 <RuleCanvas
 key={selectedRule?.id ?? 'new'}
 rule={selectedRule}
 onSaved={(saved) => setSelectedRule(saved)}
 />
 ) : (
 <div className="flex flex-col items-center justify-center h-full text-center">
 <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 border border-purple-200 flex items-center justify-center mb-4">
 <Cpu size={28} className="text-purple-600" />
 </div>
 <h3 className="text-base font-bold text-slate-700 mb-2">Kural Seç veya Yeni Oluştur</h3>
 <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
 Sol panelden mevcut bir CCM kuralını düzenle veya "Yeni Kural" butonu ile sıfırdan görsel kural tasarla.
 </p>
 <button
 onClick={handleNewRule}
 className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm transition-colors"
 >
 <Plus size={14} /> Yeni Kural Oluştur
 </button>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
