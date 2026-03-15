import { useGapAnalysis } from '@/entities/compliance/api/regulations-api';
import { useFrameworkCoverage } from '@/features/compliance/api/useFrameworks';
import { PageHeader } from '@/shared/ui/PageHeader';
import { AlertTriangle, CheckCircle, Loader2, Target, TrendingUp } from 'lucide-react';

export default function GapAnalysisPage() {
 const { data: gap, isLoading: gapLoading } = useGapAnalysis();
 const { data: frameworks = [], isLoading: fwLoading } = useFrameworkCoverage();

 const isLoading = gapLoading || fwLoading;

 return (
 <div className="flex flex-col h-full bg-canvas">
 <PageHeader
 title="Gap Analizi"
 subtitle="Uyum açıkları ve iyileştirme planları"
 icon={Target}
 />

 <div className="flex-1 p-4 overflow-auto">
 <div className="w-full px-4 sm:px-6 lg:px-6">

 {/* Metrik Kartları */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
 <MetricCard
 icon={AlertTriangle}
 iconBg="bg-red-50"
 iconColor="text-red-600"
 title="Kritik Gap"
 value={isLoading ? '—' : String(gap?.criticalGaps ?? 0)}
 subtitle="Acil aksiyon gerekli"
 />
 <MetricCard
 icon={Target}
 iconBg="bg-amber-50"
 iconColor="text-amber-600"
 title="Orta Öncelik"
 value={isLoading ? '—' : String(gap?.mediumPriorityGaps ?? 0)}
 subtitle="Planlama gerekli"
 />
 <MetricCard
 icon={CheckCircle}
 iconBg="bg-green-50"
 iconColor="text-green-600"
 title="Kapatılan"
 value={isLoading ? '—' : String(gap?.closedThisYear ?? 0)}
 subtitle="Bu yıl"
 />
 <MetricCard
 icon={TrendingUp}
 iconBg="bg-blue-50"
 iconColor="text-blue-600"
 title="İlerleme"
 value={isLoading ? '—' : `%${gap?.coveragePct ?? 0}`}
 subtitle="Kapatma oranı"
 />
 </div>

 {/* Çerçeve Bazlı Gap Tablosu */}
 <div className="bg-surface rounded-xl shadow-sm border border-slate-200 overflow-hidden">
 <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
 <div>
 <h2 className="text-lg font-bold text-slate-800">Çerçeve Bazlı Uyum Durumu</h2>
 <p className="text-sm text-slate-500 mt-0.5">
 Gerçek zamanlı kontrol eşleşme verileri — Supabase
 </p>
 </div>
 {isLoading && <Loader2 className="animate-spin text-slate-400" size={20} />}
 </div>

 {frameworks.length === 0 && !isLoading ? (
 <div className="py-16 text-center">
 <AlertTriangle className="mx-auto text-slate-300 mb-3" size={40} />
 <p className="text-sm font-semibold text-slate-600">Henüz Çerçeve Kaydı Yok</p>
 <p className="text-xs text-slate-400 mt-1">
 Migration uygulandıktan sonra seed verileri görünecek.
 </p>
 </div>
 ) : (
 <div className="divide-y divide-slate-100">
 {(frameworks || []).map((fw) => {
 const pct = Number(fw.coverage_pct ?? 0);
 const barColor =
 pct >= 80 ? 'bg-emerald-500'
 : pct >= 50 ? 'bg-amber-500'
 : 'bg-red-500';

 return (
 <div key={fw.framework_id} className="px-6 py-4 flex items-center gap-4">
 <div className="w-28 shrink-0">
 <p className="text-xs font-bold text-slate-800 truncate">{fw.short_code || fw.name}</p>
 <p className="text-[10px] text-slate-500">{fw.authority}</p>
 </div>

 <div className="flex-1">
 <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
 <span>{fw.covered_requirements} / {fw.total_requirements} gereksinim karşılandı</span>
 <span className="font-bold">{pct}%</span>
 </div>
 <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
 <div
 className={`h-full rounded-full transition-all duration-700 ${barColor}`}
 style={{ width: `${pct}%` }}
 />
 </div>
 </div>

 <div className="w-20 text-right shrink-0">
 <p className="text-lg font-black text-slate-800">{fw.gap_count}</p>
 <p className="text-[10px] text-slate-400 uppercase">Açık Gap</p>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>

 </div>
 </div>
 </div>
 );
}

// ─── Metrik Kart ─────────────────────────────────────────────────────────────

function MetricCard({
 icon: Icon,
 iconBg,
 iconColor,
 title,
 value,
 subtitle,
}: {
 icon: React.ElementType;
 iconBg: string;
 iconColor: string;
 title: string;
 value: string;
 subtitle: string;
}) {
 return (
 <div className="bg-surface rounded-xl p-4 shadow-sm border border-slate-200">
 <div className="flex items-center gap-3 mb-4">
 <div className={`p-3 ${iconBg} rounded-lg`}>
 <Icon className={`w-6 h-6 ${iconColor}`} />
 </div>
 <h3 className="font-semibold text-slate-700">{title}</h3>
 </div>
 <p className="text-3xl font-bold text-primary">{value}</p>
 <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
 </div>
 );
}
