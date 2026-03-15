/**
 * ExternalAssuranceBoard — Sürekli Denetim ve Regülatör Paylaşım Panosu
 * widgets/ExternalAssuranceBoard/index.tsx (Wave 86)
 *
 * C-Level Apple Glassmorphism tasarım, 100% Light Mode.
 * SADECE SALT OKUNUR (Read-Only) VERİLER GÖSTERİLİR.
 */

import {
 useAssuranceReports, useSharedDossiers,
 type ContinuousAssuranceReport, type SharedDossier
} from '@/features/regulator-portal/api';
import { motion } from 'framer-motion';
import {
 Activity,
 AlertTriangle,
 Bookmark,
 Briefcase,
 CheckCircle2,
 Download,
 FileSearch,
 FileText,
 HelpCircle,
 Lock,
 ShieldCheck
} from 'lucide-react';
import React from 'react';

// ─── Sabitler ─────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ElementType> = {
 CREDIT_RISK: Briefcase,
 LIQUIDITY: Activity,
 MARKET_RISK: Activity,
 OPERATIONAL_RISK: AlertTriangle,
 IT_SECURITY: ShieldCheck,
 COMPLIANCE: CheckCircle2
};

const STATUS_CFG = {
 GREEN: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2, label: 'Uygun' },
 AMBER: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: HelpCircle, label: 'Riskli' },
 RED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: AlertTriangle, label: 'Kritik İhlal' }
};

const ACCESS_LEVEL_BADGES: Record<string, string> = {
 PUBLIC: 'bg-slate-100 text-slate-600 border-slate-200',
 CONFIDENTIAL: 'bg-indigo-50 text-indigo-700 border-indigo-200',
 STRICTLY_CONFIDENTIAL: 'bg-rose-50 text-rose-700 border-rose-200'
};

// ─── Paylaşılan Dosya Kartı (Shared Dossier) ──────────────────────────────────

function DossierCard({ dossier, index }: { dossier: SharedDossier; index: number }) {
 const badgeClass = ACCESS_LEVEL_BADGES[dossier.access_level] ?? ACCESS_LEVEL_BADGES.PUBLIC;

 return (
 <motion.div
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: Math.min(index * 0.05, 0.3) }}
 className="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all group"
 >
 <div className="flex items-start justify-between mb-3">
 <div className="flex items-center gap-2">
 <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
 <FileText size={16} />
 </div>
 <div>
 <p className="text-[10px] font-black text-slate-400 font-mono leading-tight">{dossier.dossier_code}</p>
 <div className="flex items-center gap-1.5 mt-0.5">
 <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${badgeClass}`}>
 {dossier.access_level.replace('_', ' ')}
 </span>
 <span className="text-[8px] text-slate-400 uppercase tracking-widest bg-slate-50 px-1 py-0.5 rounded">
 {dossier.dossier_type.replace('_', ' ')}
 </span>
 </div>
 </div>
 </div>
 
 {/* Read-Only İndirme Butonu (Süs) */}
 <button className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Dosyayı İndir">
 <Download size={14} />
 </button>
 </div>
 
 <h4 className="text-xs font-bold text-slate-800 leading-snug line-clamp-2 min-h-[32px]">{dossier.title}</h4>
 {dossier.description && (
 <p className="text-[10px] text-slate-500 mt-1.5 line-clamp-2 italic">"{dossier.description}"</p>
 )}
 
 <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
 <p className="text-[9px] text-slate-400 font-medium">Paylaşım: {new Date(dossier.shared_date).toLocaleDateString('tr-TR')}</p>
 {dossier.expires_at ? (
 <p className="text-[9px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-1">
 <Activity size={10}/> Bitiş: {new Date(dossier.expires_at).toLocaleDateString()}
 </p>
 ) : (
 <p className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
 <Activity size={10}/> Süresiz
 </p>
 )}
 </div>
 </motion.div>
 );
}

// ─── Güvence Raporu Satırı (Continuous Assurance) ──────────────────────────────────

function ReportRow({ report, index }: { report: ContinuousAssuranceReport; index: number }) {
 const cfg = STATUS_CFG[report.status] ?? STATUS_CFG.GREEN;
 const Icon = CATEGORY_ICONS[report.category] ?? FileText;

 return (
 <motion.div
 initial={{ opacity: 0, y: 5 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: Math.min(index * 0.05, 0.4) }}
 className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-300 transition-all mb-2"
 >
 <div className="flex items-center gap-3">
 <div className={`p-2 rounded-lg ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
 <Icon size={14} />
 </div>
 <div>
 <p className="text-xs font-bold text-slate-800 leading-tight">{report.title}</p>
 <div className="flex items-center gap-2 mt-1">
 <span className="text-[9px] font-mono text-slate-400">{report.report_code}</span>
 <span className="w-1 h-1 rounded-full bg-slate-300" />
 <span className="text-[9px] text-slate-500">{new Date(report.generated_at).toLocaleDateString('tr-TR')}</span>
 </div>
 </div>
 </div>
 
 <div className="flex items-center gap-4 border-l border-slate-100 pl-4 py-1">
 <div className="text-center w-12">
 <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Bulgu</p>
 <p className={`text-[11px] font-black ${report.findings_count > 0 ? 'text-rose-600' : 'text-slate-600'}`}>{report.findings_count}</p>
 </div>
 <div className="text-center w-16">
 <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Skor</p>
 <p className={`text-[11px] font-black ${cfg.text}`}>%{report.assurance_score_pct.toFixed(1)}</p>
 </div>
 
 {/* Salt Okunur İnceleme Butonu */}
 <button className="flex items-center gap-1 text-[9px] font-bold px-2.5 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors border border-slate-200 rounded-lg">
 <FileSearch size={10} /> İncele
 </button>
 </div>
 </motion.div>
 );
}

// ─── ExternalAssuranceBoard Ana Widget ──────────────────────────────────────────────

export function ExternalAssuranceBoard() {
 const { data: reports = [], isLoading: reportsLoading } = useAssuranceReports();
 const { data: dossiers = [], isLoading: dossiersLoading } = useSharedDossiers();

 return (
 <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 h-full">
 
 {/* Sol Taraf: Continuous Assurance Reports (Sürekli Denetim Sonuçları) */}
 <div className="bg-white/70 backdrop-blur-lg border border-slate-200 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
 <div className="px-5 py-4 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-between rounded-t-2xl shadow-inner">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
 <ShieldCheck size={16} className="text-indigo-300" />
 </div>
 <div>
 <h3 className="text-sm font-bold text-white">Sürekli Güvence Raporları</h3>
 <p className="text-[10px] text-slate-300/70 mt-0.5">Dış Regülatör Paylaşımı (Read-Only)</p>
 </div>
 </div>
 </div>
 
 <div className="p-4 flex-1 overflow-y-auto bg-slate-50/50">
 {reportsLoading ? (
 <div className="space-y-2">
 {[1,2,3].map(i => <div key={i} className="h-16 bg-white/50 border border-slate-100 rounded-xl animate-pulse" />)}
 </div>
 ) : (reports || []).length === 0 ? (
 <div className="text-center py-10">
 <FileSearch size={32} className="text-slate-300 mx-auto mb-2" />
 <p className="text-xs font-semibold text-slate-500">Yayınlanmış güvence raporu bulunmuyor.</p>
 </div>
 ) : (
 <div>
 {(reports || []).map((r, i) => <ReportRow key={r.id} report={r} index={i} />)}
 </div>
 )}
 </div>
 </div>

 {/* Sağ Taraf: Shared Dossiers (Dış Denetçilerle Paylaşılan Klasörler) */}
 <div className="bg-white/70 backdrop-blur-lg border border-slate-200 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
 <div className="px-5 py-4 bg-gradient-to-r from-slate-800 to-indigo-900 flex items-center justify-between rounded-t-2xl shadow-inner">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
 <Bookmark size={16} className="text-emerald-300" />
 </div>
 <div>
 <h3 className="text-sm font-bold text-white">Guest Vault (Dossiers)</h3>
 <p className="text-[10px] text-slate-300/70 mt-0.5">Resmi Denetim Evrakları & İlgili Belgeler</p>
 </div>
 </div>
 <div className="text-right">
 <span className="text-[9px] font-bold text-white/50 bg-black/20 px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-widest flex items-center gap-1">
 <Lock size={10} /> SALT OKUNUR
 </span>
 </div>
 </div>

 <div className="p-4 flex-1 overflow-y-auto bg-slate-50/50">
 {dossiersLoading ? (
 <div className="grid grid-cols-2 gap-4">
 {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/50 border border-slate-100 rounded-xl animate-pulse" />)}
 </div>
 ) : (dossiers || []).length === 0 ? (
 <div className="text-center py-12">
 <Bookmark size={32} className="text-slate-300 mx-auto mb-2" />
 <p className="text-xs font-semibold text-slate-500">Bu kurumla paylaşılan evrak bulunmuyor.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {(dossiers || []).map((d, i) => <DossierCard key={d.id} dossier={d} index={i} />)}
 </div>
 )}
 </div>
 </div>

 </div>
 );
}
