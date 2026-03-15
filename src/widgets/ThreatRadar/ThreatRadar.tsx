/**
 * Wave 53: ThreatRadar — CTI & Dark Web Monitor Widget
 *
 * Light Mode ana tema, Apple Glassmorphism panel.
 * İç vurgular kırmızı/amber (tehdit renkleri) kullanabilir.
 * Tüm ?./?? korumaları zorunlu — NaN/undefined çökmesi yasak.
 */

import { useCTIDashboard, type DarkwebAlert, type ThreatWithScore } from '@/features/cyber-threats/api';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
 AlertTriangle,
 ChevronDown, ChevronUp,
 Cpu,
 Database,
 Eye, Globe, Key,
 Loader2,
 Lock,
 Radio,
 ShieldAlert,
 TrendingUp,
 Wifi,
} from 'lucide-react';
import { useState } from 'react';

/* ──────────────────────────────────────────────────────────
 Config
 ────────────────────────────────────────────────────────── */

const SEV_STYLE: Record<string, { bar: string; badge: string; text: string }> = {
 CRITICAL: { bar: 'bg-red-600', badge: 'bg-red-100 text-red-800 border-red-200', text: 'text-red-700' },
 HIGH: { bar: 'bg-orange-500', badge: 'bg-orange-100 text-orange-800 border-orange-200', text: 'text-orange-700' },
 MEDIUM: { bar: 'bg-amber-400', badge: 'bg-amber-100 text-amber-800 border-amber-200', text: 'text-amber-700' },
 LOW: { bar: 'bg-blue-400', badge: 'bg-blue-100 text-blue-800 border-blue-200', text: 'text-blue-700' },
 INFORMATIONAL: { bar: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600 border-slate-200', text: 'text-slate-600' },
};

const STATUS_BADGE: Record<string, string> = {
 ACTIVE: 'bg-red-50 text-red-700 border-red-200',
 INVESTIGATING: 'bg-amber-50 text-amber-700 border-amber-200',
 CONTAINED: 'bg-blue-50 text-blue-700 border-blue-200',
 RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
 FALSE_POSITIVE:'bg-slate-50 text-slate-500 border-slate-200',
 NEW: 'bg-red-50 text-red-700 border-red-200',
 VALIDATED: 'bg-amber-50 text-amber-700 border-amber-200',
 ESCALATED: 'bg-rose-50 text-rose-800 border-rose-200',
};

const DW_CATEGORY_ICON: Record<string, typeof Eye> = {
 DATA_LEAK: Database,
 CREDENTIAL_DUMP: Key,
 RANSOMWARE_LISTING: Lock,
 FORUM_MENTION: Globe,
 MARKET_LISTING: TrendingUp,
 BRAND_ABUSE: ShieldAlert,
 EXEC_MENTION: Eye,
};

/* ──────────────────────────────────────────────────────────
 Threat Feed Card
 ────────────────────────────────────────────────────────── */

function ThreatCard({ feed }: { feed: ThreatWithScore }) {
 const [expanded, setExpanded] = useState(false);
 const sev = SEV_STYLE[feed.severity] ?? SEV_STYLE.MEDIUM;
 const statusCls = STATUS_BADGE[feed.status] ?? STATUS_BADGE.ACTIVE;

 return (
 <motion.div
 layout
 className="bg-surface border border-slate-200 rounded-xl shadow-sm overflow-hidden"
 >
 <button
 className="w-full text-left px-4 pt-4 pb-3 flex items-start gap-3"
 onClick={() => setExpanded(e => !e)}
 aria-expanded={expanded}
 >
 <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
 feed.severity === 'CRITICAL' ? 'bg-red-100' : feed.severity === 'HIGH' ? 'bg-orange-100' : 'bg-amber-100'
 )}>
 <Cpu size={15} className={sev.text} />
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex flex-wrap items-center gap-1.5 mb-1">
 <span className={clsx('text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border', sev.badge)}>
 {feed.severity}
 </span>
 <span className={clsx('text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border', statusCls)}>
 {feed.status}
 </span>
 <span className="text-[9px] text-slate-400 font-mono uppercase">{feed.threat_type}</span>
 </div>
 <h4 className="text-sm font-bold text-primary leading-snug">{feed.title}</h4>
 <div className="flex items-center gap-3 mt-1">
 <span className="text-[10px] text-slate-400">{feed.feed_source}</span>
 {feed.mitre_technique && (
 <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
 {feed.mitre_technique}
 </span>
 )}
 <span className={clsx('text-[10px] font-bold ml-auto', sev.text)}>
 Risk: {feed.risk_score ?? '-'}/100
 </span>
 </div>
 </div>
 <div className="shrink-0 text-slate-400 mt-1">
 {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
 </div>
 </button>

 {/* Risk bar */}
 <div className="px-4 pb-3">
 <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
 <motion.div
 className={clsx('h-full rounded-full', sev.bar)}
 initial={{ width: 0 }}
 animate={{ width: `${feed.risk_score ?? 0}%` }}
 transition={{ duration: 0.6, ease: 'easeOut' }}
 />
 </div>
 </div>

 <AnimatePresence>
 {expanded && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 className="overflow-hidden border-t border-slate-100"
 >
 <div className="px-4 py-4 space-y-3">
 <p className="text-xs text-slate-700 leading-relaxed">{feed.description}</p>

 {feed.ioc_value && (
 <div className="flex items-center gap-2 bg-slate-900/5 border border-slate-200 px-3 py-2 rounded-lg">
 <Radio size={11} className="text-slate-400 shrink-0" />
 <span className="text-[10px] font-bold text-slate-500 uppercase">{feed.ioc_type}:</span>
 <span className="text-xs font-mono text-slate-700">{feed.ioc_value}</span>
 </div>
 )}

 {(feed.affected_systems ?? []).length > 0 && (
 <div>
 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Etkilenen Sistemler</p>
 <div className="flex flex-wrap gap-1.5">
 {(feed.affected_systems ?? []).map((s, i) => (
 <span key={i} className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
 {s}
 </span>
 ))}
 </div>
 </div>
 )}

 {feed.threat_actor && (
 <div className="text-xs text-slate-500">
 <span className="font-bold text-slate-600">Tehdit Aktörü: </span>{feed.threat_actor}
 </div>
 )}

 <div className="text-[10px] text-slate-400">
 Güven: %{feed.confidence_score?.toFixed(0) ?? '?'} · Tespit: {new Date(feed.detected_at).toLocaleString('tr-TR')}
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </motion.div>
 );
}

/* ──────────────────────────────────────────────────────────
 Dark Web Alert Card
 ────────────────────────────────────────────────────────── */

function DarkwebCard({ alert }: { alert: DarkwebAlert }) {
 const [expanded, setExpanded] = useState(false);
 const sev = SEV_STYLE[alert.severity] ?? SEV_STYLE.HIGH;
 const statusCls = STATUS_BADGE[alert.status] ?? STATUS_BADGE.NEW;
 const CatIcon = DW_CATEGORY_ICON[alert.category] ?? Eye;

 return (
 <motion.div
 layout
 className={clsx(
 'border rounded-xl shadow-sm overflow-hidden',
 alert.severity === 'CRITICAL'
 ? 'bg-red-50/80 border-red-200'
 : alert.severity === 'HIGH'
 ? 'bg-orange-50/60 border-orange-200'
 : 'bg-surface border-slate-200'
 )}
 >
 <button
 className="w-full text-left px-4 pt-4 pb-3 flex items-start gap-3"
 onClick={() => setExpanded(e => !e)}
 aria-expanded={expanded}
 >
 <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
 alert.severity === 'CRITICAL' ? 'bg-red-200' : 'bg-orange-100'
 )}>
 <CatIcon size={15} className={sev.text} />
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex flex-wrap items-center gap-1.5 mb-1">
 <span className={clsx('text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border', sev.badge)}>
 {alert.severity}
 </span>
 <span className={clsx('text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border', statusCls)}>
 {alert.status}
 </span>
 </div>
 <h4 className="text-sm font-bold text-primary leading-snug">{alert.title}</h4>
 {alert.source_forum && (
 <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
 <Globe size={9} />
 {alert.source_forum}
 {alert.threat_actor_alias && <span className="font-mono"> — {alert.threat_actor_alias}</span>}
 </div>
 )}
 </div>
 {expanded ? <ChevronUp size={14} className="shrink-0 text-slate-400 mt-1" /> : <ChevronDown size={14} className="shrink-0 text-slate-400 mt-1" />}
 </button>

 <AnimatePresence>
 {expanded && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 className="overflow-hidden border-t border-slate-100"
 >
 <div className="px-4 py-4 space-y-3">
 <p className="text-xs text-slate-700 leading-relaxed">{alert.description}</p>

 {alert.evidence_snippet && (
 <div className="bg-slate-900 rounded-lg px-3 py-2.5 text-xs font-mono text-emerald-400 leading-relaxed">
 <div className="text-slate-500 text-[9px] uppercase tracking-widest mb-1">Kanıt Snippet</div>
 {alert.evidence_snippet}
 </div>
 )}

 {(alert.affected_data_types ?? []).length > 0 && (
 <div className="flex flex-wrap gap-1.5">
 {(alert.affected_data_types ?? []).map((t, i) => (
 <span key={i} className="text-[9px] font-bold uppercase bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
 {t}
 </span>
 ))}
 </div>
 )}

 {alert.estimated_records && (
 <div className="text-xs text-slate-600 font-medium">
 Etkilenen Kayıt: <span className="font-black text-red-700">{alert.estimated_records.toLocaleString('tr-TR')}</span>
 </div>
 )}
 <div className="text-[10px] text-slate-400">
 Güven: %{alert.confidence_score?.toFixed(0) ?? '?'} · Tespit: {new Date(alert.detected_at).toLocaleString('tr-TR')}
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </motion.div>
 );
}

/* ──────────────────────────────────────────────────────────
 Ana Widget Export — ThreatRadar
 ────────────────────────────────────────────────────────── */

export function ThreatRadar() {
 const { feeds, alerts, criticals, activethreats, newAlerts, isLoading, isError } = useCTIDashboard();
 const [activeTab, setActiveTab] = useState<'threats' | 'darkweb'>('threats');

 if (isLoading) {
 return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-slate-400 animate-spin" /></div>;
 }
 if (isError) {
 return (
 <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
 <AlertTriangle className="mx-auto w-8 h-8 text-amber-400 mb-2" />
 <p className="text-sm text-amber-800">Tehdit verileri yüklenirken hata oluştu.</p>
 </div>
 );
 }

 return (
 <div className="space-y-5">
 {/* Kritik Alarm Bandı */}
 <AnimatePresence>
 {criticals > 0 && (
 <motion.div
 initial={{ opacity: 0, y: -8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -8 }}
 className="flex items-center gap-3 px-5 py-3.5 bg-red-600 text-white rounded-xl shadow-md"
 >
 <ShieldAlert size={18} className="shrink-0 animate-pulse" />
 <div>
 <span className="font-black text-sm uppercase tracking-wide">KRİTİK TEHDİT ALARMASI</span>
 <span className="text-red-200 text-xs ml-2">— {criticals} kritik tehdit aktif. Acil müdahale gerekiyor.</span>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* İstatistik Şeridi */}
 <div className="flex flex-wrap gap-4 p-4 bg-surface rounded-xl border border-slate-200 shadow-sm">
 {[
 { label: 'Aktif Tehdit', value: activethreats, cls: 'text-red-600' },
 { label: 'Kritik', value: criticals, cls: 'text-red-700' },
 { label: 'Yeni DW Uyarı', value: newAlerts, cls: 'text-orange-600' },
 { label: 'Toplam Feed', value: feeds.length, cls: 'text-slate-700' },
 ].map((s, i) => (
 <div key={i} className="flex items-center gap-3">
 <span className={clsx('text-2xl font-black tabular-nums', s.cls)}>{s.value}</span>
 <span className="text-xs text-slate-500">{s.label}</span>
 {i < 3 && <div className="w-px h-5 bg-slate-200" />}
 </div>
 ))}
 <div className="ml-auto flex items-center gap-1.5 text-[10px] text-red-600 font-bold bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
 <Wifi size={10} />
 Canlı İstihbarat
 </div>
 </div>

 {/* Sekme Geçişi */}
 <div className="flex gap-2">
 {[
 { id: 'threats' as const, label: 'Siber Tehdit Beslemeleri', count: feeds.length, icon: Cpu },
 { id: 'darkweb' as const, label: 'Dark Web Uyarıları', count: alerts.length, icon: Eye },
 ].map(tab => {
 const Icon = tab.icon;
 return (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={clsx(
 'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all',
 activeTab === tab.id
 ? 'bg-slate-900 text-white border-slate-900 shadow-md'
 : 'bg-surface text-slate-600 border-slate-200 hover:border-slate-300'
 )}
 >
 <Icon size={15} />
 {tab.label}
 <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded-full',
 activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
 )}>
 {tab.count}
 </span>
 </button>
 );
 })}
 </div>

 {/* İçerik */}
 <div className="space-y-3">
 {activeTab === 'threats' ? (
 (feeds || []).length === 0
 ? <div className="text-center py-10 text-sm text-slate-500">Aktif tehdit beslemesi bulunmuyor.</div>
 : (feeds || []).map(f => <ThreatCard key={f.id} feed={f} />)
 ) : (
 (alerts || []).length === 0
 ? <div className="text-center py-10 text-sm text-slate-500">Dark web uyarısı bulunmuyor.</div>
 : (alerts || []).map(a => <DarkwebCard key={a.id} alert={a} />)
 )}
 </div>
 </div>
 );
}
