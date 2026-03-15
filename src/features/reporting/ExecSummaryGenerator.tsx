import { findingApi } from '@/entities/finding/api';
import { useSentinelAI } from '@/shared/hooks/useSentinelAI';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
 AlertTriangle,
 Brain,
 CheckCircle2,
 ChevronDown, ChevronUp,
 Copy,
 FileText,
 Loader2,
 Sparkles,
 X
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

interface FindingSummary {
 code: string;
 title: string;
 severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
 category: string;
 department: string;
 financialImpact?: number;
 rootCause?: string;
}

// Silencing static mock in favor of dynamic mapping.
// But we keep the interface intact.

const SEVERITY_CONFIG = {
 CRITICAL: { label: 'Kritik', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
 HIGH: { label: 'Yuksek', bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
 MEDIUM: { label: 'Orta', bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
 LOW: { label: 'Dusuk', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

export function ExecSummaryGenerator() {
 const [showModal, setShowModal] = useState(false);
 const [summary, setSummary] = useState<string | null>(null);
 const [copied, setCopied] = useState(false);
 const [showFindings, setShowFindings] = useState(false);
 const { loading, generate, configured, error } = useSentinelAI();

 const { data: dbFindings, isLoading: isDbLoading } = useQuery({
 queryKey: ['exec-summary-findings'],
 queryFn: findingApi.getAll,
 staleTime: 5 * 60 * 1000,
 });

 const findingsList: FindingSummary[] = useMemo(() => {
 if (!dbFindings) return [];
 return (dbFindings || []).map((f: any) => ({
 code: f.id.slice(0, 8).toUpperCase(),
 title: f.title || 'İsimsiz Bulgu',
 severity: (f.severity?.toUpperCase() || 'MEDIUM') as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
 category: f.gias_category || 'Genel Risk',
 department: f.details?.department || 'Bilinmiyor',
 financialImpact: f.financial_impact || 0,
 rootCause: f.details?.rootCause || 'Kök neden analizi bekleniyor'
 }));
 }, [dbFindings]);

 const criticalCount = (findingsList || []).filter(f => f.severity === 'CRITICAL').length;
 const highCount = (findingsList || []).filter(f => f.severity === 'HIGH').length;
 const totalFinancial = (findingsList || []).reduce((sum, f) => sum + (f.financialImpact || 0), 0);

 const handleGenerate = useCallback(async () => {
 setShowModal(true);
 setSummary(null);

 const findingsSerialized = findingsList
 .map(f => `[${f.severity}] ${f.code} - ${f.title} | Departman: ${f.department} | Kategori: ${f.category}${f.financialImpact ? ` | Finansal Etki: ${(f.financialImpact / 1000000).toFixed(1)}M TL` : ''}${f.rootCause ? ` | Kok Neden: ${f.rootCause}` : ''}`)
 .join('\n');

 const prompt = `Sen Ic Denetim Baskanisin. Asagidaki ${findingsList.length} bulguyu Yonetim Kuruluna sunulmak uzere 2 sayfalik bir Yonetici Ozeti haline getir.

BULGULAR:
${findingsSerialized}

OZET ISTATISTIKLER:
- Toplam Bulgu: ${findingsList.length}
- Kritik: ${criticalCount}
- Yuksek: ${highCount}
- Tahmini Toplam Finansal Etki: ${(totalFinancial / 1000000).toFixed(0)}M TL

FORMAT:
1. GENEL DEGERLENDIRME (2-3 paragraf): Denetim doneminin genel sonucu, kurumsal risk profilindeki degisimler.
2. SISTEMIK RISKLER (maddeler halinde): Birden fazla bulguyu kesen ana temalar ve ortak kok nedenler.
3. STRATEJIK ONERILER (3-5 madde): Yonetim Kurulu aksiyonu gerektiren somut stratejik oneriler.
4. SONUC: Kisa ve kararlilastirici kapani paragrafı.

Ton: Profesyonel, kararsiz degil kesin, veriye dayali. Turkce yaz.`;

 const result = await generate(prompt);
 if (result) setSummary(result);
 }, [generate, criticalCount, highCount, totalFinancial, findingsList]);

 const handleCopy = () => {
 if (summary) {
 navigator.clipboard.writeText(summary);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 }
 };

 return (
 <>
 <button
 onClick={handleGenerate}
 disabled={loading || isDbLoading}
 className="flex items-center gap-2 px-5 py-3 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-all shadow-lg shadow-slate-800/20 group"
 >
 <Brain size={18} className={loading ? 'animate-spin' : 'group-hover:scale-110 transition-transform'} />
 <span>Yonetici Ozeti Olustur</span>
 {(loading || isDbLoading) && <Loader2 size={14} className="animate-spin ml-1" />}
 </button>

 <AnimatePresence>
 {showModal && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
 onClick={() => setShowModal(false)}
 >
 <motion.div
 initial={{ scale: 0.9, y: 30 }}
 animate={{ scale: 1, y: 0 }}
 exit={{ scale: 0.9, y: 30 }}
 transition={{ type: 'spring', damping: 25, stiffness: 300 }}
 className="bg-surface/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 w-full max-w-3xl max-h-[85vh] flex flex-col"
 onClick={e => e.stopPropagation()}
 >
 <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-4 py-5 rounded-t-2xl flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
 <FileText size={20} className="text-blue-400" />
 </div>
 <div>
 <h2 className="text-base font-bold text-white">Yonetim Kurulu Yonetici Ozeti</h2>
 <p className="text-xs text-slate-400 mt-0.5">
 {findingsList.length} bulgu analiz ediliyor
 </p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 {summary && (
 <button
 onClick={handleCopy}
 className="flex items-center gap-1.5 px-3 py-1.5 bg-surface/10 text-white rounded-lg text-xs font-bold hover:bg-surface/20 transition-colors"
 >
 {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
 {copied ? 'Kopyalandi' : 'Kopyala'}
 </button>
 )}
 <button
 onClick={() => setShowModal(false)}
 className="w-8 h-8 bg-surface/10 rounded-lg flex items-center justify-center hover:bg-surface/20 transition-colors"
 >
 <X size={16} className="text-white" />
 </button>
 </div>
 </div>

 <div className="flex-1 overflow-y-auto p-4 space-y-5">
 <div className="grid grid-cols-4 gap-3">
 <SummaryStatCard label="Toplam Bulgu" value={findingsList.length.toString()} color="bg-slate-600" />
 <SummaryStatCard label="Kritik" value={criticalCount.toString()} color="bg-red-600" />
 <SummaryStatCard label="Yuksek" value={highCount.toString()} color="bg-orange-500" />
 <SummaryStatCard label="Finansal Etki" value={`${(totalFinancial / 1000000).toFixed(0)}M`} color="bg-blue-600" />
 </div>

 <button
 onClick={() => setShowFindings(!showFindings)}
 className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-primary transition-colors"
 >
 {showFindings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
 Kaynak Bulgulari {showFindings ? 'Gizle' : 'Goster'} ({findingsList.length})
 </button>

 <AnimatePresence>
 {showFindings && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="overflow-hidden"
 >
 <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
 {(findingsList || []).map(f => {
 const cfg = SEVERITY_CONFIG[f.severity];
 return (
 <div key={f.code} className="flex items-center gap-2 p-2 bg-canvas rounded-lg">
 <div className={clsx('w-2 h-2 rounded-full flex-shrink-0', cfg.dot)} />
 <span className="text-[10px] font-mono text-slate-500 w-24 flex-shrink-0">{f.code}</span>
 <span className="text-xs text-slate-700 flex-1 truncate">{f.title}</span>
 <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded', cfg.bg, cfg.text)}>{cfg.label}</span>
 </div>
 );
 })}
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {!configured && (
 <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
 <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
 <div>
 <p className="text-sm font-semibold text-amber-800">AI Motoru Yapilandirilmamis</p>
 <p className="text-xs text-amber-700 mt-1">
 Ayarlar &gt; Cognitive Engine sayfasindan API anahtarinizi girin.
 </p>
 </div>
 </div>
 )}

 {loading && (
 <div className="flex flex-col items-center justify-center py-16 gap-4">
 <div className="relative">
 <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
 <Brain size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-600" />
 </div>
 <div className="text-center">
 <p className="text-sm font-bold text-slate-800">Yonetici Ozeti Hazirlaniyor...</p>
 <p className="text-xs text-slate-500 mt-1">
 {findingsList.length} bulgu analiz ediliyor, sistemik riskler belirleniyor
 </p>
 </div>
 </div>
 )}

 {error && (
 <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
 <AlertTriangle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
 <div>
 <p className="text-sm font-semibold text-red-800">Olusturma Hatasi</p>
 <p className="text-xs text-red-700 mt-1">{error}</p>
 <button onClick={handleGenerate} className="mt-2 text-xs font-bold text-red-700 hover:text-red-900">Tekrar Dene</button>
 </div>
 </div>
 )}

 {summary && !loading && (
 <div className="bg-surface border border-slate-200 rounded-xl p-4 shadow-sm">
 <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
 <FileText size={16} className="text-slate-600" />
 <h3 className="text-sm font-bold text-slate-800">Yonetim Kuruluna Sunulacak Ozet</h3>
 </div>
 <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed">
 {summary.split('\n').map((line, i) => {
 const trimmed = line.trim();
 if (!trimmed) return <br key={i} />;
 if (trimmed.match(/^\d+\.\s/) || trimmed.match(/^[A-Z\u00C0-\u017F\s]{4,}:/)) {
 return <h4 key={i} className="text-sm font-bold text-primary mt-4 mb-2">{trimmed}</h4>;
 }
 if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
 return (
 <div key={i} className="flex items-start gap-2 ml-2 mb-1">
 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-1.5 flex-shrink-0" />
 <p className="text-xs leading-relaxed">{trimmed.replace(/^[-*]\s*/, '')}</p>
 </div>
 );
 }
 return <p key={i} className="text-xs leading-relaxed mb-2">{trimmed}</p>;
 })}
 </div>
 <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200">
 <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
 <Sparkles size={10} />
 Sentinel Prime tarafindan uretildi
 </div>
 <button
 onClick={handleGenerate}
 className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
 >
 Yeniden Olustur
 </button>
 </div>
 </div>
 )}
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 </>
 );
}

function SummaryStatCard({ label, value, color }: { label: string; value: string; color: string }) {
 return (
 <div className="bg-surface/80 backdrop-blur-sm rounded-xl border border-slate-200/60 p-3 text-center">
 <div className={`w-2 h-2 rounded-full ${color} mx-auto mb-1.5`} />
 <p className="text-lg font-black text-primary">{value}</p>
 <p className="text-[10px] text-slate-500 font-semibold">{label}</p>
 </div>
 );
}
