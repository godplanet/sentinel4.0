import { useMemo, useState, useRef, useEffect } from 'react';
import { cn } from '@/shared/utils/cn';
import { ShieldAlert, AlertTriangle, FileText, Download, Target, Activity, CheckCircle2, ChevronDown, FileText as WordIcon } from 'lucide-react';
import { usePublishedReports, useCriticalFindings } from '@/features/reporting/api/useBoardBriefing';
import { exportToWord, exportToForensicPDF } from '@/features/report-editor/utils/export-engine';

export default function ExecutiveDashboardPage() {
  const { data: publishedReports, isLoading: isReportsLoading } = usePublishedReports();
  const { data: criticalFindings, isLoading: isFindingsLoading } = useCriticalFindings();

  // Track which card's export dropdown is open
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loading = isReportsLoading || isFindingsLoading;

  // Derive Heatmap / Score data
  const { score, level, openCritical } = useMemo(() => {
    if (!criticalFindings) return { score: 0, level: 'Düşük Risk', openCritical: 0 };
    
    // Sadece kapanmamışlar
    const openFindings = criticalFindings.filter(f => f.status?.toUpperCase() !== 'CLOSED' && f.status?.toUpperCase() !== 'RESOLVED');
    const openCritCount = openFindings.length;
    
    // Basit Skorlama
    let calculatedScore = 100 - (openCritCount * 5); 
    if (calculatedScore < 0) calculatedScore = 0;
    
    let lvl = 'Yeşil (Düşük Risk)';
    if (calculatedScore < 80) lvl = 'Sarı (Orta Risk)';
    if (calculatedScore < 50) lvl = 'Kırmızı (Kritik Risk)';

    return { score: calculatedScore, level: lvl, openCritical: openCritCount };
  }, [criticalFindings]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center animate-pulse">
          <ShieldAlert className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Kokpit Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Güvenli empty-state haritalama kalkanı (Safe mapping arrays)
  const safeReports = publishedReports || [];
  const safeFindings = (criticalFindings || []).filter(f => f.status?.toUpperCase() !== 'CLOSED' && f.status?.toUpperCase() !== 'RESOLVED');

  return (
    <div className="min-h-screen bg-slate-50 p-5 overflow-y-auto relative">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />
      
      <div className="w-full space-y-5 relative z-10">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <ShieldAlert className="text-indigo-600" size={32} />
              Yönetim Kurulu Kokpiti
            </h1>
            <p className="text-slate-500 mt-2 text-sm">Banka geneli güncel risk panoraması ve yayınlanmış nihai raporlar.</p>
          </div>
          <div className="px-4 py-2 bg-white/70 backdrop-blur-md rounded-xl border border-white/50 shadow-sm flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Sistem Canlı</span>
          </div>
        </header>

        {/* --- PANEL 1: Bank-wide Risk Heatmap / Score --- */}
        <section className="bg-white/70 backdrop-blur-lg border border-white/50 p-5 rounded-3xl shadow-xl">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="text-rose-500" /> Banka Geneli Risk Görünümü
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Banka Sağlık Skoru</span>
              <span className={cn(
                "text-6xl font-black tracking-tighter drop-shadow-sm",
                score >= 80 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-rose-600"
              )}>
                {score}
              </span>
              <span className="text-xs text-slate-400 mt-2 font-medium">100 üzerinden</span>
            </div>

            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col justify-center">
              <span className="text-sm font-bold text-slate-500 mb-4">Risk Dağılımı</span>
              <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${Math.min(openCritical * 10, 80)}%` }} />
                <div className="h-full bg-amber-400 transition-all duration-1000" style={{ width: `20%` }} />
                <div className="h-full bg-emerald-500 flex-1" />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wide">
                <span>Kritik Tolerans Düzeyi</span>
                <span className={openCritical > 5 ? "text-rose-500" : ""}>{level}</span>
              </div>
            </div>

            <div className="p-4 bg-indigo-600 rounded-2xl border border-indigo-500 flex flex-col items-center justify-center text-center shadow-lg shadow-indigo-200 text-white relative overflow-hidden group">
              <Target className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-500/30 group-hover:scale-110 transition-transform duration-500" />
              <span className="text-sm font-bold text-indigo-200 uppercase tracking-wider mb-2 relative z-10">Açık Kritik Bulgu</span>
              <span className="text-6xl font-black tracking-tighter drop-shadow-md relative z-10">
                {openCritical}
              </span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* --- PANEL 2: Recently Published Reports --- */}
          <section className="bg-white/70 backdrop-blur-lg border border-white/50 p-5 rounded-3xl shadow-xl flex flex-col h-[500px]">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="text-indigo-600" /> Nihai Yayınlanmış Raporlar
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded">Salt Okunur</span>
            </h2>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {safeReports.length > 0 ? (
                <div className="space-y-4">
                  {safeReports.map((report) => (
                     <div key={report.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors group">
                       <div className="flex items-start justify-between gap-3">
                         {/* Left: metadata + title + AI summary */}
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2 mb-1">
                             <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded uppercase tracking-widest shadow-sm">
                               {report.status}
                             </span>
                             <span className="text-[10px] text-slate-400 font-medium">
                               {new Date(report.report_date).toLocaleDateString('tr-TR')}
                             </span>
                           </div>
                           <h3 className="text-sm font-bold text-slate-700 mb-1">
                             {typeof report.title === 'string' ? report.title : JSON.stringify(report.title)}
                           </h3>
                           <span className="text-[10px] text-slate-400">Versiyon: {String(report.version)}.0</span>

                           {/* AI Executive Summary */}
                           {report.executive_summary && (
                             <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3">
                               {typeof report.executive_summary === 'string' 
                                 ? report.executive_summary 
                                 : JSON.stringify(report.executive_summary)}
                             </p>
                           )}
                         </div>

                         {/* Right: Export dropdown */}
                         <div className="relative shrink-0" ref={openDropdownId === report.id ? dropdownRef : undefined}>
                           <button
                             onClick={() => setOpenDropdownId(openDropdownId === report.id ? null : report.id)}
                             className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl hover:text-indigo-600 hover:border-indigo-300 shadow-sm transition-all text-xs font-semibold"
                             title="Raporu Dışa Aktar"
                           >
                             <Download size={14} />
                             <span>İndir</span>
                             <ChevronDown size={12} className={cn('transition-transform', openDropdownId === report.id && 'rotate-180')} />
                           </button>

                           {/* Dropdown Menu */}
                           {openDropdownId === report.id && (
                             <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                               <button
                                 onClick={() => {
                                   setOpenDropdownId(null);
                                   exportToWord(report, report.executive_summary || report.title || '');
                                 }}
                                 className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                               >
                                 <WordIcon size={14} className="text-blue-600" />
                                 Word (.docx)
                               </button>
                               <div className="h-px bg-slate-100 mx-3" />
                               <button
                                 onClick={() => {
                                   setOpenDropdownId(null);
                                   exportToForensicPDF(report);
                                 }}
                                 className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                               >
                                 <FileText size={14} className="text-rose-600" />
                                 Adli Mühürlü PDF
                               </button>
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
                  <CheckCircle2 size={48} className="text-slate-300 mb-4" />
                  <h3 className="text-sm font-bold text-slate-600 mb-1">Henüz rapor bulunmamaktadır</h3>
                  <p className="text-xs text-slate-400 text-center">Şu an için yayınlanmış veya kapanmış nihai bir rapor sisteme yansımamıştır.</p>
                </div>
              )}
            </div>
          </section>

          {/* --- PANEL 3: Unclosed Critical Findings Alert --- */}
          <section className="bg-white/70 backdrop-blur-lg border border-white/50 p-5 rounded-3xl shadow-xl flex flex-col h-[500px]">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-rose-600" /> Kritik Bulgu Alarmları
            </h2>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {safeFindings.length > 0 ? (
                <div className="space-y-4">
                  {safeFindings.map((finding) => (
                     <div key={finding.id} className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 hover:border-rose-300 transition-colors flex flex-col gap-2">
                       <div className="flex items-start justify-between">
                          <h3 className="text-sm font-bold text-rose-900 leading-snug pr-4">
                            {typeof finding.title === 'string' ? finding.title : JSON.stringify(finding.title)}
                          </h3>
                          <span className="shrink-0 text-[10px] font-black px-2 py-1 bg-rose-600 text-white rounded-md shadow-sm">
                            {typeof finding.severity === 'string' ? finding.severity : JSON.stringify(finding.severity)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-rose-100/50">
                           <span className="text-[10px] font-semibold text-rose-700 uppercase truncate max-w-[200px]">
                             {typeof (finding.institution || finding.engagement_title) === 'string' 
                               ? (finding.institution || finding.engagement_title) 
                               : JSON.stringify(finding.institution || finding.engagement_title || 'Kurum Bilgisi Yok')}
                           </span>
                           <span className="text-[10px] text-rose-500 bg-rose-100 px-1.5 py-0.5 rounded font-bold">
                             Durum: {typeof finding.status === 'string' ? finding.status : JSON.stringify(finding.status)}
                           </span>
                       </div>
                     </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 border-dashed">
                  <ShieldAlert size={48} className="text-emerald-300 mb-4" />
                  <h3 className="text-sm font-bold text-emerald-700 mb-1">Tebrikler, Açık Kritik Bulgu Yok</h3>
                  <p className="text-xs text-emerald-600/70 text-center">Sistemde takip edilen aktif bir kırmızı kodlu bulgu tespit edilmemiştir.</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
