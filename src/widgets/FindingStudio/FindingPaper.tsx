import { FileText, Download, Printer, Share2 } from 'lucide-react';
import { SENTINEL_CONSTITUTION } from '@/shared/config/constitution';
import { GlassCard, RiskBadge, EvidenceIndicator } from '@/shared/ui/GlassCard';
import type { ComprehensiveFinding } from '@/entities/finding/model/types';

interface FindingPaperProps {
  finding: ComprehensiveFinding;
}

export function FindingPaper({ finding }: FindingPaperProps) {
  const ui = SENTINEL_CONSTITUTION.UI;

  return (
    <div className="bg-white shadow-2xl min-h-[297mm] w-full relative print:shadow-none print:w-auto">
      
      {/* 1. KAĞIT ÜST BİLGİ & TOOLBAR (YENİ EKLENDİ) */}
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md text-white p-3 flex justify-between items-center rounded-t-lg print:hidden">
          <div className="flex items-center gap-2 text-xs font-mono opacity-70">
              <FileText size={14}/>
              {finding.code}
          </div>
          <div className="flex gap-2">
              <button className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors" title="PDF İndir">
                  <Download size={16}/>
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors" title="Yazdır">
                  <Printer size={16}/>
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors" title="Paylaş">
                  <Share2 size={16}/>
              </button>
          </div>
      </div>

      {/* 2. KAĞIT İÇERİĞİ */}
      <div className="p-[20mm] space-y-8 font-serif text-slate-900">
        
        {/* Başlık Alanı */}
        <div className="border-b-4 border-slate-900 pb-6 mb-8">
            <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">İç Denetim Raporu</span>
                <span className="text-xs font-mono text-slate-400">{new Date(finding.created_at).toLocaleDateString('tr-TR')}</span>
            </div>
            <h1 className="text-3xl font-bold leading-tight text-slate-900 mb-4">{finding.title}</h1>
            
            <div className="flex items-center gap-3">
                <RiskBadge score={finding.impact_score || 0} showLabel={true} />
                <span className="w-px h-4 bg-slate-300"></span>
                <span className="text-sm font-sans font-bold text-slate-600 uppercase">{finding.category}</span>
                <span className="w-px h-4 bg-slate-300"></span>
                <EvidenceIndicator evidenceCount={1} showRequirement={true} />
            </div>
        </div>

        {/* Özet (Executive Summary) */}
        <section>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 font-sans">Yönetici Özeti</h2>
            <p className="text-lg leading-relaxed text-slate-800 font-medium">
                {finding.description}
            </p>
        </section>

        {/* Detaylı Analiz (Condition, Criteria, Cause, Effect) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <section className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 font-sans">Mevcut Durum (Condition)</h3>
                <p className="text-sm leading-relaxed text-slate-700">
                    {finding.detailed_observation || "Detaylı gözlem verisi bulunamadı."}
                </p>
            </section>

            <section className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 font-sans">Olması Gereken (Criteria)</h3>
                <p className="text-sm leading-relaxed text-slate-700">
                    {finding.criteria || "İlgili mevzuat ve prosedür referansları."}
                </p>
            </section>
        </div>

        {/* Kök Neden */}
        <section>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 font-sans flex items-center gap-2">
                Kök Neden Analizi (Root Cause)
            </h2>
            <div className="pl-4 border-l-2 border-indigo-500 py-1">
                <p className="text-base leading-relaxed text-slate-800">
                    {finding.root_cause}
                </p>
            </div>
        </section>

        {/* Etki (Impact) */}
        <section>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 font-sans">Risk ve Etki</h2>
            <p className="text-base leading-relaxed text-slate-800">
                {finding.impact}
            </p>
        </section>

        {/* Öneri (Recommendation) */}
        <section className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100 break-inside-avoid">
            <h2 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-3 font-sans flex items-center gap-2">
                Denetçi Önerisi
            </h2>
            <p className="text-base leading-relaxed text-emerald-900">
                {finding.recommendation}
            </p>
        </section>

      </div>

      {/* Footer */}
      <div className="absolute bottom-0 w-full p-8 border-t border-slate-100 text-center text-[10px] text-slate-400 font-mono uppercase tracking-widest">
          Sentinel v3.0 • Confidential Audit Document • {finding.id}
      </div>
    </div>
  );
}