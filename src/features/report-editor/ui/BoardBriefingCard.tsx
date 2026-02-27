import {
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Download,
  AlertTriangle,
  Info,
  Banknote,
  Calendar,
  Building,
} from 'lucide-react';
import type { M6Report, DynamicSection } from '@/entities/report';

function warmthToBg(w: number): string {
  const t = w / 10;
  const r = Math.round(255 - 5 * t);
  const g = Math.round(255 - 20 * t);
  const b = Math.round(255 - 60 * t);
  return `rgb(${r},${g},${b})`;
}

interface Props {
  report: M6Report;
  warmth?: number;
}

function gradeStyle(grade: string): { bg: string; color: string } {
  if (grade === 'A+' || grade === 'A') return { bg: '#28a745', color: '#fff' };
  if (grade === 'B+' || grade === 'B') return { bg: '#ff960a', color: '#fff' };
  if (grade === 'C') return { bg: '#eb0000', color: '#fff' };
  if (grade === 'D') return { bg: '#700000', color: '#fff' };
  return { bg: '#6b7280', color: '#fff' };
}

function gradeLabel(grade: string): string {
  const map: Record<string, string> = {
    'A+': 'Optimum',
    A: 'Yeterli',
    'B+': 'Gelişime Yakın',
    B: 'Gelişime Açık',
    C: 'Zayıf',
    D: 'Yetersiz',
  };
  return map[grade] ?? grade;
}

function assuranceIcon(level: string) {
  if (level === 'Tam Güvence') return <ShieldCheck size={14} className="inline mr-1" />;
  if (level === 'Kısmi Güvence') return <ShieldAlert size={14} className="inline mr-1" />;
  return <ShieldX size={14} className="inline mr-1" />;
}

function assuranceStyle(level: string): { bg: string; color: string } {
  if (level === 'Tam Güvence') return { bg: '#28a745', color: '#fff' };
  if (level === 'Kısmi Güvence') return { bg: '#ff960a', color: '#fff' };
  return { bg: '#eb0000', color: '#fff' };
}

const FINDING_BADGES = [
  { key: 'critical', label: 'Kritik', bg: '#700000', color: '#fff' },
  { key: 'high', label: 'Yüksek', bg: '#eb0000', color: '#fff' },
  { key: 'medium', label: 'Orta', bg: '#ff960a', color: '#fff' },
  { key: 'low', label: 'Düşük', bg: '#FFD700', color: '#000' },
  { key: 'observation', label: 'Öneri', bg: '#0070c0', color: '#fff' },
] as const;

interface SectionCardProps {
  title: string;
  html: string;
}

function SectionCard({ title, html }: SectionCardProps) {
  return (
    <div className="border-t border-slate-200 pt-6 mt-6">
      <h4 className="font-sans text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">{title}</h4>
      <div
        className="prose prose-sm max-w-none font-serif text-slate-800 leading-relaxed [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

function DynamicSectionCard({ section }: { section: DynamicSection }) {
  return (
    <div className="border-t border-slate-200 pt-6 mt-6">
      <h4 className="font-sans text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
        {section.title}
      </h4>
      <div
        className="prose prose-sm max-w-none font-serif text-slate-800 leading-relaxed [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1"
        dangerouslySetInnerHTML={{ __html: section.content || '<p style="color:#94a3b8">İçerik henüz girilmedi.</p>' }}
      />
    </div>
  );
}

function PageFooter({ report }: { report: M6Report }) {
  return (
    <div className="px-8 py-6 mt-6 border-t border-slate-100 bg-white/40 flex items-center justify-between">
      <p className="text-xs text-slate-400 font-sans">
        Bu belge Sentinel v3.0 tarafından oluşturulmuştur. GIAS 2024 · BDDK Uyumlu.
      </p>
      <div className="flex items-center gap-4">
        <p className="text-xs text-slate-400 font-sans">Rapor ID: {report.id}</p>
        <button
          onClick={() => window.print()}
          className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium text-slate-600 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-colors"
        >
          <Download size={13} />
          PDF İndir
        </button>
      </div>
    </div>
  );
}

function FindingBadgeRow({ findingCounts }: { findingCounts: M6Report['executiveSummary']['findingCounts'] }) {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {FINDING_BADGES.map(({ key, label, bg, color }) => {
        const count = findingCounts[key];
        return (
          <span
            key={key}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-sans font-semibold"
            style={{ backgroundColor: bg, color }}
          >
            <span className="font-bold">{count}</span>
            {label}
          </span>
        );
      })}
    </div>
  );
}

function StandardAuditLayout({ report, warmth }: Props) {
  const { executiveSummary: es, title } = report;
  const currentGradeStyle = gradeStyle(es.grade);
  const prevGradeStyle = gradeStyle(es.previousGrade);
  const assStyle = assuranceStyle(es.assuranceLevel);
  const trendPositive = es.trend > 0;
  const trendNeutral = es.trend === 0;
  const paperBg = warmthToBg(warmth ?? 2);

  return (
    <div
      className="rounded-sm border border-slate-200/60 overflow-hidden shadow-[0_8px_48px_rgba(0,0,0,0.13),0_2px_12px_rgba(0,0,0,0.07)] transition-colors duration-300"
      style={{ backgroundColor: paperBg }}
    >
      <div className="flex items-start justify-between px-8 pt-8 pb-6 border-b border-slate-100">
        <div>
          <p className="text-xs font-sans font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Yönetim Kurulu Bilgilendirme Raporu
          </p>
          <h1 className="font-serif text-2xl font-bold text-slate-900 leading-tight">{title}</h1>
        </div>
        <div
          className="flex-shrink-0 ml-6 rounded-xl px-5 py-3 text-center min-w-[120px]"
          style={{ backgroundColor: currentGradeStyle.bg, color: currentGradeStyle.color }}
        >
          <p className="text-xs font-sans font-semibold uppercase tracking-wider opacity-80 mb-0.5">NOT</p>
          <p className="text-3xl font-serif font-bold leading-none">{es.grade}</p>
          <p className="text-xs font-sans font-semibold uppercase tracking-wider mt-1 opacity-90">
            {gradeLabel(es.grade)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-slate-200/50 border-b border-slate-100">
        <div className="bg-white/70 px-5 py-4 text-center">
          <p className="text-xs text-slate-500 font-sans mb-1">Hassas Skor</p>
          <p className="text-2xl font-bold font-serif text-slate-900">{es.score.toFixed(1)}</p>
          <p className="text-xs text-slate-400 font-sans">/ 100</p>
        </div>
        <div className="bg-white/70 px-5 py-4 text-center">
          <p className="text-xs text-slate-500 font-sans mb-1">Trend</p>
          <div className="flex items-center justify-center gap-1">
            {trendNeutral ? (
              <Minus size={18} className="text-slate-400" />
            ) : trendPositive ? (
              <TrendingUp size={18} className="text-green-600" />
            ) : (
              <TrendingDown size={18} className="text-red-500" />
            )}
            <span className={`text-xl font-bold font-serif ${trendNeutral ? 'text-slate-500' : trendPositive ? 'text-green-700' : 'text-red-600'}`}>
              {trendPositive ? '+' : ''}{es.trend.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">önceki döneme göre</p>
        </div>
        <div className="bg-white/70 px-5 py-4 text-center">
          <p className="text-xs text-slate-500 font-sans mb-1">Önceki Not</p>
          <span
            className="inline-block rounded-lg px-3 py-1 text-lg font-bold font-serif"
            style={{ backgroundColor: prevGradeStyle.bg, color: prevGradeStyle.color }}
          >
            {es.previousGrade}
          </span>
          <p className="text-xs text-slate-400 font-sans mt-1">{gradeLabel(es.previousGrade)}</p>
        </div>
        <div className="bg-white/70 px-5 py-4 text-center">
          <p className="text-xs text-slate-500 font-sans mb-1">Bulgu Sayısı</p>
          <p className="text-2xl font-bold font-serif text-slate-900">
            {Object.values(es.findingCounts).reduce((a, b) => a + b, 0)}
          </p>
          <p className="text-xs text-slate-400 font-sans">toplam bulgu</p>
        </div>
        <div className="bg-white/70 px-5 py-4 text-center">
          <p className="text-xs text-slate-500 font-sans mb-2">Güvence Seviyesi</p>
          <span
            className="inline-flex items-center rounded-lg px-3 py-1 text-xs font-sans font-semibold"
            style={{ backgroundColor: assStyle.bg, color: assStyle.color }}
          >
            {assuranceIcon(es.assuranceLevel)}
            {es.assuranceLevel}
          </span>
        </div>
      </div>

      <div className="px-8 pt-6">
        <div className="border-l-4 border-[#0070c0] bg-blue-50 p-4 rounded-r-xl">
          <p className="text-xs font-sans font-semibold uppercase tracking-widest text-blue-700 mb-2">
            Yönetim Kurulu Bilgilendirme Notu
          </p>
          <p className="font-serif text-slate-800 text-sm leading-relaxed">{es.briefingNote}</p>
        </div>

        <FindingBadgeRow findingCounts={es.findingCounts} />

        {es.dynamicSections && es.dynamicSections.length > 0 ? (
          es.dynamicSections.map((s) => <DynamicSectionCard key={s.id} section={s} />)
        ) : (
          <>
            <SectionCard title="I. Denetim Görüşü" html={es.sections.auditOpinion} />
            <SectionCard title="II. Kritik Risk Alanları" html={es.sections.criticalRisks} />
            <SectionCard title="III. Stratejik Öneriler" html={es.sections.strategicRecommendations} />
            <SectionCard title="IV. Yönetim Eylemi ve Taahhütler" html={es.sections.managementAction} />
          </>
        )}

        {es.managementResponse && (
          <div className="bg-slate-50 border-l-4 border-slate-400 p-4 mt-6 rounded-r-lg">
            <p className="text-xs font-sans font-semibold uppercase tracking-widest text-slate-500 mb-2">
              Yönetim Beyanı ve Taahhüdü
            </p>
            <p className="font-serif text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
              {es.managementResponse.responseText}
            </p>
            {(es.managementResponse.providedBy || es.managementResponse.providedAt) && (
              <p className="text-xs font-sans text-slate-400 mt-3">
                {es.managementResponse.providedBy && <span>{es.managementResponse.providedBy}</span>}
                {es.managementResponse.providedBy && es.managementResponse.providedAt && <span> — </span>}
                {es.managementResponse.providedAt && (
                  <span>
                    {new Date(es.managementResponse.providedAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </p>
            )}
          </div>
        )}

        {report.status === 'published' && report.hashSeal && (
          <div className="mt-6 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-4 rounded-lg border border-emerald-200 font-mono shadow-sm">
            <ShieldCheck size={18} className="flex-shrink-0" />
            <span className="break-all">HUKUKİ BÜTÜNLÜK MÜHRÜ (SHA-256): {report.hashSeal}</span>
          </div>
        )}
      </div>

      <PageFooter report={report} />
    </div>
  );
}

function InvestigationLayout({ report, warmth }: Props) {
  const { executiveSummary: es, title } = report;
  const paperBg = warmthToBg(warmth ?? 2);
  const dm = es.dynamicMetrics ?? {};

  return (
    <div
      className="rounded-sm border border-red-200/60 overflow-hidden shadow-[0_8px_48px_rgba(0,0,0,0.13),0_2px_12px_rgba(0,0,0,0.07)] transition-colors duration-300"
      style={{ backgroundColor: paperBg }}
    >
      <div className="bg-gradient-to-r from-[#700000] to-[#1a0000] px-8 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle size={20} className="text-red-300 flex-shrink-0" />
          <p className="text-xs font-sans font-semibold uppercase tracking-widest text-red-300">
            Soruşturma ve İnceleme Raporu
          </p>
        </div>
        <h1 className="font-serif text-2xl font-bold text-white leading-tight">{title}</h1>
        <p className="text-xs font-sans text-red-300 mt-2 uppercase tracking-wider">
          GİZLİ — SADECE YETKİLİ KİŞİLERE ÖZEL
        </p>
      </div>

      {(dm.maliBoyu || dm.olayTarihi || dm.ilgiliBirim) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-red-900/20 border-b border-red-200">
          <div className="bg-white/90 px-6 py-4">
            <div className="flex items-center gap-2 mb-1">
              <Banknote size={14} className="text-red-600" />
              <p className="text-xs font-sans font-semibold uppercase tracking-wider text-red-600">Mali Boyut / Zarar</p>
            </div>
            <p className="font-serif text-lg font-bold text-slate-900">{dm.maliBoyu || '—'}</p>
          </div>
          <div className="bg-white/90 px-6 py-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={14} className="text-red-600" />
              <p className="text-xs font-sans font-semibold uppercase tracking-wider text-red-600">Olay Tarihi</p>
            </div>
            <p className="font-serif text-lg font-bold text-slate-900">{dm.olayTarihi || '—'}</p>
          </div>
          <div className="bg-white/90 px-6 py-4">
            <div className="flex items-center gap-2 mb-1">
              <Building size={14} className="text-red-600" />
              <p className="text-xs font-sans font-semibold uppercase tracking-wider text-red-600">İlgili Birim / Personel</p>
            </div>
            <p className="font-serif text-lg font-bold text-slate-900">{dm.ilgiliBirim || '—'}</p>
          </div>
        </div>
      )}

      <div className="px-8 pt-6">
        <FindingBadgeRow findingCounts={es.findingCounts} />

        {es.dynamicSections && es.dynamicSections.length > 0 ? (
          es.dynamicSections.map((s) => <DynamicSectionCard key={s.id} section={s} />)
        ) : (
          <SectionCard title="Bulgular ve Tespitler" html={es.sections.auditOpinion} />
        )}

        {es.managementResponse && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-6 rounded-r-lg">
            <p className="text-xs font-sans font-semibold uppercase tracking-widest text-red-600 mb-2">
              Yönetim Yanıtı ve Taahhüdü
            </p>
            <p className="font-serif text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
              {es.managementResponse.responseText}
            </p>
          </div>
        )}

        {report.status === 'published' && report.hashSeal && (
          <div className="mt-6 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-4 rounded-lg border border-emerald-200 font-mono shadow-sm">
            <ShieldCheck size={18} className="flex-shrink-0" />
            <span className="break-all">HUKUKİ BÜTÜNLÜK MÜHRÜ (SHA-256): {report.hashSeal}</span>
          </div>
        )}
      </div>

      <PageFooter report={report} />
    </div>
  );
}

function InfoNoteLayout({ report, warmth }: Props) {
  const { executiveSummary: es, title } = report;
  const paperBg = warmthToBg(warmth ?? 2);

  return (
    <div
      className="rounded-sm border border-slate-200/60 overflow-hidden shadow-[0_8px_48px_rgba(0,0,0,0.13),0_2px_12px_rgba(0,0,0,0.07)] transition-colors duration-300"
      style={{ backgroundColor: paperBg }}
    >
      <div className="flex items-start justify-between px-8 pt-8 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Info size={16} className="text-[#0070c0]" />
            <span className="inline-block px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-sans font-semibold text-[#0070c0] uppercase tracking-widest">
              Bilgi Notu
            </span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-900 leading-tight">{title}</h1>
        </div>
      </div>

      <div className="px-8 pt-6">
        {es.briefingNote && (
          <div className="border-l-4 border-[#0070c0] bg-blue-50 p-4 rounded-r-xl mb-6">
            <p className="text-xs font-sans font-semibold uppercase tracking-widest text-blue-700 mb-2">
              Özet
            </p>
            <p className="font-serif text-slate-800 text-sm leading-relaxed">{es.briefingNote}</p>
          </div>
        )}

        {es.dynamicSections && es.dynamicSections.length > 0 ? (
          es.dynamicSections.map((s) => <DynamicSectionCard key={s.id} section={s} />)
        ) : (
          <SectionCard title="İçerik" html={es.sections.auditOpinion} />
        )}
      </div>

      <PageFooter report={report} />
    </div>
  );
}

export function BoardBriefingCard({ report, warmth = 2 }: Props) {
  const layoutType = report.executiveSummary?.layoutType ?? 'standard_audit';

  return (
    <div className="bg-slate-100 min-h-screen py-8 px-4 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {layoutType === 'investigation' ? (
          <InvestigationLayout report={report} warmth={warmth} />
        ) : layoutType === 'info_note' ? (
          <InfoNoteLayout report={report} warmth={warmth} />
        ) : (
          <StandardAuditLayout report={report} warmth={warmth} />
        )}
      </div>
    </div>
  );
}
