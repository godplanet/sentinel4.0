import type { DynamicSection, ExecutiveSummarySections, ManagementResponse } from '@/entities/report';
import { useActiveReportStore } from '@/entities/report';
import { DEFAULT_EXECUTIVE_SUMMARY } from '@/entities/report/api/report-api';
import { useReportSummary } from '@/features/report-editor/api/useReportSummary';
import { SmartVariableNode } from '@/features/report-editor/blocks/extensions/SmartVariableNode';
import { FourEyesGate } from '@/features/security/ui/FourEyesGate';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import clsx from 'clsx';
import {
 Banknote,
 Braces,
 Building,
 Calendar,
 ChevronDown,
 Loader2,
 Minus,
 Sparkles,
 TrendingDown,
 TrendingUp,
 UserCheck,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { getWarmthStyle } from '@/shared/utils/warmth';

const GRADE_OPTIONS = ['A+', 'A', 'B+', 'B', 'C', 'D'];
const ASSURANCE_OPTIONS = ['Tam Güvence', 'Kısmi Güvence', 'Güvence Verilmedi'];

const SMART_VARIABLE_DEFS = [
 { id: 'npl_ratio', label: 'NPL Oranı' },
 { id: 'critical_findings_count', label: 'Kritik Bulgu Sayısı' },
 { id: 'total_risk_exposure', label: 'Toplam Risk Maruziyeti' },
];

interface TiptapFieldProps {
 label: string;
 fieldKey: keyof ExecutiveSummarySections;
 content: string;
 placeholder: string;
 readOnly?: boolean;
 onChange: (key: keyof ExecutiveSummarySections, html: string) => void;
}

function TiptapField({ label, fieldKey, content, placeholder, readOnly = false, onChange }: TiptapFieldProps) {
 const { smartVariables } = useActiveReportStore();
 const [varDropOpen, setVarDropOpen] = useState(false);

 const editor = useEditor({
 extensions: [StarterKit, Placeholder.configure({ placeholder }), SmartVariableNode],
 content,
 editable: !readOnly,
 onUpdate: ({ editor: ed }) => { onChange(fieldKey, ed.getHTML()); },
 });

 useEffect(() => {
 if (!editor) return;
 const currentHtml = editor.getHTML();
 if (currentHtml !== content) editor.commands.setContent(content, { emitUpdate: false });
 }, [content, editor]);

 useEffect(() => {
 if (!editor) return;
 editor.setEditable(!readOnly);
 }, [readOnly, editor]);

 const insertVariable = (id: string) => {
 if (!editor) return;
 editor.chain().focus().insertContent({ type: 'smartVariable', attrs: { id } }).run();
 setVarDropOpen(false);
 };

 return (
 <div className="mb-3">
 <div className="flex items-center justify-between mb-2">
 <label className="block text-xs font-sans font-semibold uppercase tracking-widest text-slate-500">
 {label}
 </label>
 {!readOnly && (
 <div className="relative">
 <button
 type="button"
 onClick={() => setVarDropOpen((v) => !v)}
 className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-sans font-medium border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
 >
 <Braces size={12} />
 Değişken Ekle
 <ChevronDown size={11} />
 </button>
 {varDropOpen && (
 <>
 <div className="fixed inset-0 z-10" onClick={() => setVarDropOpen(false)} />
 <div className="absolute right-0 top-full mt-1.5 bg-surface rounded-xl border border-slate-200 shadow-xl z-20 w-52 overflow-hidden">
 <div className="px-3 py-2 border-b border-slate-100">
 <p className="text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider">Canlı Değişkenler</p>
 </div>
 {(SMART_VARIABLE_DEFS || []).map(({ id, label: vLabel }) => (
 <button
 key={id}
 type="button"
 onClick={() => insertVariable(id)}
 className="w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors"
 >
 <p className="text-xs font-sans font-semibold text-blue-700">{vLabel}</p>
 <p className="text-xs font-sans text-slate-500 mt-0.5">{String(smartVariables?.[id] ?? '—')}</p>
 </button>
 ))}
 </div>
 </>
 )}
 </div>
 )}
 </div>
 <div
 className={`min-h-[120px] rounded-xl border px-4 py-3 font-serif text-slate-800 text-sm leading-relaxed transition-colors ${
 readOnly
 ? 'bg-surface/60 border-slate-200 cursor-not-allowed'
 : 'bg-surface border-slate-300 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100'
 }`}
 >
 <EditorContent editor={editor} />
 </div>
 </div>
 );
}

interface DynamicTiptapFieldProps {
 section: DynamicSection;
 index: number;
 readOnly?: boolean;
 onChange: (id: string, html: string) => void;
}

function DynamicTiptapField({ section, index, readOnly = false, onChange }: DynamicTiptapFieldProps) {
 const editor = useEditor({
 extensions: [
 StarterKit,
 Placeholder.configure({ placeholder: `${section.title} içeriğini buraya yazın...` }),
 SmartVariableNode,
 ],
 content: section.content,
 editable: !readOnly,
 onUpdate: ({ editor: ed }) => { onChange(section.id, ed.getHTML()); },
 });

 useEffect(() => {
 if (!editor) return;
 const currentHtml = editor.getHTML();
 if (currentHtml !== section.content) editor.commands.setContent(section.content, { emitUpdate: false });
 }, [section.content, editor]);

 useEffect(() => {
 if (!editor) return;
 editor.setEditable(!readOnly);
 }, [readOnly, editor]);

 const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
 const label = `${romanNumerals[index] ?? index + 1}. ${section.title}`;

 return (
 <div className="mb-3">
 <label className="block text-xs font-sans font-semibold uppercase tracking-widest text-slate-500 mb-2">
 {label}
 </label>
 <div
 className={`min-h-[120px] rounded-xl border px-4 py-3 font-serif text-slate-800 text-sm leading-relaxed transition-colors ${
 readOnly
 ? 'bg-surface/60 border-slate-200 cursor-not-allowed'
 : 'bg-surface border-slate-300 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100'
 }`}
 >
 <EditorContent editor={editor} />
 </div>
 </div>
 );
}

function SkeletonBlock({ lines = 3 }: { lines?: number }) {
 return (
 <div className="mb-3 animate-pulse">
 <div className="h-3 w-24 bg-slate-200 rounded mb-3" />
 <div className="rounded-xl border border-slate-200 bg-canvas px-4 py-3 space-y-2">
 {Array.from({ length: lines }).map((_, i) => (
 <div key={i} className={`h-3 bg-slate-200 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
 ))}
 </div>
 </div>
 );
}

interface ExecutiveSummaryStudioProps {
  readOnly?: boolean;
  warmth?: number;
  nightMode?: boolean;
}

export function ExecutiveSummaryStudio({ readOnly = false, warmth = 20, nightMode = false }: ExecutiveSummaryStudioProps) {
 const reportId = useActiveReportStore((s) => s.activeReport?.id);
 const { activeReport, updateExecutiveSummary, loadReport } = useActiveReportStore();
 const { report: reportFromQuery, generateSummary, isGenerating } = useReportSummary(reportId);

 const es = activeReport?.executiveSummary ?? reportFromQuery?.executiveSummary ?? DEFAULT_EXECUTIVE_SUMMARY;
 const mgmtResponse = activeReport?.executiveSummary?.managementResponse;
 const paperStyle = getWarmthStyle(warmth, nightMode);
 const layoutType = es?.layoutType ?? 'standard_audit';

 const handleManagementResponseChange = useCallback(
 (field: keyof ManagementResponse, value: string) => {
 const current = activeReport?.executiveSummary?.managementResponse ?? {
 providedBy: '',
 responseText: '',
 providedAt: new Date().toISOString().slice(0, 10),
 };
 updateExecutiveSummary({ managementResponse: { ...current, [field]: value } });
 },
 [activeReport, updateExecutiveSummary],
 );

  const handleAIDraft = useCallback(async () => {
    if (!reportId) return;
    const toastId = toast.loading('Sentinel AI Yönetici Özeti hazırlıyor...', { duration: 60000 });
    try {
      const result = await generateSummary({ reportId });

      // AI metnini local store'a hemen uygula (DB başarısız olsa bile)
      if (result?.aiText) {
        const aiHtml = `<p>${(result.aiText || '').replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br />')}</p>`;
        updateExecutiveSummary({
          briefingNote: result.aiText,
          sections: {
            auditOpinion: aiHtml,
            criticalRisks: '',
            strategicRecommendations: '',
            managementAction: '',
          },
        });
      }

      if (result?.dbSaved) {
        await loadReport(reportId);
        toast.success('Yönetici Özeti AI ile üretildi ve kaydedildi.', { id: toastId });
      } else {
        toast.success('Yönetici Özeti AI ile üretildi. (Otomatik kayıt başarısız — manuel kaydet)', {
          id: toastId,
          duration: 6000,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'AI özet üretilemedi.';
      toast.error(msg, { id: toastId, duration: 6000 });
    }
  }, [reportId, generateSummary, loadReport, updateExecutiveSummary]);

 const handleSectionChange = useCallback(
 (key: keyof ExecutiveSummarySections, html: string) => {
 if (!es) return;
 updateExecutiveSummary({ sections: { ...(es?.sections ?? {}), [key]: html } });
 },
 [es, updateExecutiveSummary],
 );

 const handleDynamicSectionChange = useCallback(
 (id: string, html: string) => {
 if (!es) return;
 const updated = (es?.dynamicSections ?? []).map((s) => s.id === id ? { ...s, content: html } : s);
 updateExecutiveSummary({ dynamicSections: updated });
 },
 [es, updateExecutiveSummary],
 );

 const handleDynamicMetricChange = useCallback(
 (key: string, value: string) => {
 if (!es) return;
 updateExecutiveSummary({ dynamicMetrics: { ...(es?.dynamicMetrics ?? {}), [key]: value } });
 },
 [es, updateExecutiveSummary],
 );

 /** Müfettiş kanaati (not override) kaydı — 4 göz onayı sonrası veya bypass’ta DB’ye yazar. */
 const handleSaveOverride = useCallback(() => {
 updateExecutiveSummary({});
 }, [updateExecutiveSummary]);

 const trendPositive = (es?.trend ?? 0) > 0;
 const trendNeutral = (es?.trend ?? 0) === 0;

 /* Rapor Kütüphanesi ile senkron: DB’den gelen değerler öncelikli (Hassas Skor, Not, Risk). */
 const displayScore = activeReport?.precise_score ?? es?.score ?? 0;
 const reportGradeRaw = activeReport?.report_grade ?? es?.grade;
 const displayGrade = GRADE_OPTIONS.find((g) => reportGradeRaw?.startsWith(g)) ?? reportGradeRaw ?? es?.grade ?? 'N/A';
 const prevGradeRaw = activeReport?.previous_grade ?? es?.previousGrade;
 const displayPreviousGrade = GRADE_OPTIONS.find((g) => prevGradeRaw?.startsWith(g)) ?? prevGradeRaw ?? es?.previousGrade ?? 'N/A';
 const displayRiskLevel = activeReport?.risk_level;

 return (
 <div className="min-h-full bg-slate-50 overflow-y-auto py-5 px-4 lg:px-4">
 <div className="max-w-4xl mx-auto">
 <div
          id="executive-summary-content"
          data-report-content="true"
 className="w-full rounded-sm shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] ring-1 ring-black/5 transition-colors duration-300 px-4 lg:px-14 py-10"
 style={{ ...paperStyle, transition: "background-color 0.3s ease" }}
 >
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
 <div>
 <h2 className="font-serif text-2xl font-bold text-primary">Yönetici Özeti Stüdyosu</h2>
 <p className="text-sm text-slate-500 mt-1 font-sans">GIAS 2024 · Standart 2400 uyumlu</p>
 </div>
    {!readOnly && (
        <button
          onClick={handleAIDraft}
          disabled={isGenerating || !reportId}
          className="flex items-center gap-2 bg-indigo-50 text-indigo-600 border border-indigo-100 px-4 py-2.5 rounded-xl hover:bg-indigo-100 hover:border-indigo-200 transition-all font-sans font-bold text-sm shadow-sm disabled:opacity-50 flex-shrink-0"
        >
          {isGenerating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
          {isGenerating ? 'Sentinel AI Analiz Ediyor...' : 'Yapay Zeka ile Oluştur'}
        </button>
      )}
 </div>

 {layoutType !== 'info_note' && (
 <div className="bg-surface/80 rounded-2xl border border-slate-200 p-4 mb-3 shadow-sm">
 <h3 className="text-xs font-sans font-semibold uppercase tracking-widest text-slate-500 mb-4">
 Skor ve Değerlendirme
 </h3>
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
 <div>
 <label className="block text-xs text-slate-500 mb-1">Hassas Skor</label>
 <input
 type="number"
 min={0}
 max={100}
 step={0.1}
 value={displayScore}
 disabled={readOnly}
 onChange={(e) => updateExecutiveSummary({ score: parseFloat(e.target.value) || 0 })}
 className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-sans font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-canvas disabled:cursor-not-allowed bg-surface"
 />
 </div>
 <div>
 <label className="block text-xs text-slate-500 mb-1">Rapor Notu</label>
 <select
 value={displayGrade}
 disabled={readOnly}
 onChange={(e) => updateExecutiveSummary({ grade: e.target.value })}
 className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-sans font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-canvas disabled:cursor-not-allowed bg-surface"
 >
 {(GRADE_OPTIONS || []).map((g) => <option key={g} value={g}>{g}</option>)}
 </select>
 </div>
 <div>
 <label className="block text-xs text-slate-500 mb-1">Önceki Not</label>
 <select
 value={displayPreviousGrade}
 disabled={readOnly}
 onChange={(e) => updateExecutiveSummary({ previousGrade: e.target.value })}
 className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-sans font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-canvas disabled:cursor-not-allowed bg-surface"
 >
 {(GRADE_OPTIONS || []).map((g) => <option key={g} value={g}>{g}</option>)}
 </select>
 </div>
 <div>
 <label className="block text-xs text-slate-500 mb-1">Risk Seviyesi</label>
 <div
 className={clsx(
 'w-full border rounded-lg px-3 py-2 text-sm font-sans font-semibold bg-surface',
 displayRiskLevel === 'high' && 'border-red-200 bg-red-50 text-red-800',
 displayRiskLevel === 'medium' && 'border-amber-200 bg-amber-50 text-amber-800',
 displayRiskLevel === 'low' && 'border-emerald-200 bg-emerald-50 text-emerald-800',
 !displayRiskLevel && 'border-slate-200 text-slate-500',
 )}
 >
 {displayRiskLevel === 'high' ? 'Yüksek' : displayRiskLevel === 'medium' ? 'Orta' : displayRiskLevel === 'low' ? 'Düşük' : '—'}
 </div>
 </div>
 <div>
 <label className="block text-xs text-slate-500 mb-1">Trend (%)</label>
 <div className="relative">
 <input
 type="number"
 step={0.1}
 value={es?.trend ?? 0}
 disabled={readOnly}
 onChange={(e) => updateExecutiveSummary({ trend: parseFloat(e.target.value) || 0 })}
 className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-sans font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-canvas disabled:cursor-not-allowed pr-5 bg-surface"
 />
 <span className="absolute right-2 top-1/2 -translate-y-1/2">
 {trendNeutral ? (
 <Minus size={14} className="text-slate-400" />
 ) : trendPositive ? (
 <TrendingUp size={14} className="text-green-600" />
 ) : (
 <TrendingDown size={14} className="text-red-500" />
 )}
 </span>
 </div>
 </div>
 <div>
 <label className="block text-xs text-slate-500 mb-1">Güvence Seviyesi</label>
 <select
 value={es?.assuranceLevel ?? ''}
 disabled={readOnly}
 onChange={(e) => updateExecutiveSummary({ assuranceLevel: e.target.value })}
 className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-sans font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-canvas disabled:cursor-not-allowed bg-surface"
 >
 {(ASSURANCE_OPTIONS || []).map((a) => <option key={a} value={a}>{a}</option>)}
 </select>
 </div>
 </div>
 {!readOnly && (
 <div className="mt-4 pt-4 border-t border-slate-200">
 <FourEyesGate
 isCritical={true}
 resourceType="REPORT_GRADE"
 resourceId={reportId ?? 'mock-id'}
 actionName={`Override System Grade to ${displayGrade}`}
 payload={{
 grade: displayGrade,
 score: displayScore,
 previousGrade: es?.previousGrade ?? '',
 trend: es?.trend ?? 0,
 assuranceLevel: es?.assuranceLevel ?? '',
 }}
 onExecute={handleSaveOverride}
 children={({ onClick, loading }) => (
 <button
 type="button"
 onClick={onClick}
 disabled={loading}
 className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-xl text-sm font-sans font-semibold transition-colors shadow-sm"
 >
 {loading ? (
 <>Bekleniyor...</>
 ) : (
 <>Kanaat Gerekçesini Kaydet (Görüşü Mühürle)</>
 )}
 </button>
 )}
 />
 </div>
 )}
 </div>
 )}

 {layoutType === 'investigation' && (
 <div className="bg-red-50 rounded-2xl border border-red-200 p-4 mb-3 shadow-sm">
 <h3 className="text-xs font-sans font-semibold uppercase tracking-widest text-red-600 mb-4">
 Soruşturma Temel Bilgileri
 </h3>
 <div className="grid sm:grid-cols-3 gap-4">
 <div>
 <div className="flex items-center gap-1.5 mb-1">
 <Banknote size={12} className="text-red-600" />
 <label className="block text-xs text-red-600 font-sans font-semibold">Mali Boyut / Zarar</label>
 </div>
 <input
 type="text"
 value={es?.dynamicMetrics?.maliBoyu ?? ''}
 disabled={readOnly}
 onChange={(e) => handleDynamicMetricChange('maliBoyu', e.target.value)}
 placeholder="örn: 450.000 TL"
 className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:bg-surface/60 disabled:cursor-not-allowed bg-surface"
 />
 </div>
 <div>
 <div className="flex items-center gap-1.5 mb-1">
 <Calendar size={12} className="text-red-600" />
 <label className="block text-xs text-red-600 font-sans font-semibold">Olay Tarihi</label>
 </div>
 <input
 type="text"
 value={es?.dynamicMetrics?.olayTarihi ?? ''}
 disabled={readOnly}
 onChange={(e) => handleDynamicMetricChange('olayTarihi', e.target.value)}
 placeholder="örn: 15 Kasım 2025"
 className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:bg-surface/60 disabled:cursor-not-allowed bg-surface"
 />
 </div>
 <div>
 <div className="flex items-center gap-1.5 mb-1">
 <Building size={12} className="text-red-600" />
 <label className="block text-xs text-red-600 font-sans font-semibold">İlgili Birim / Personel</label>
 </div>
 <input
 type="text"
 value={es?.dynamicMetrics?.ilgiliBirim ?? ''}
 disabled={readOnly}
 onChange={(e) => handleDynamicMetricChange('ilgiliBirim', e.target.value)}
 placeholder="örn: Kadıköy Şubesi"
 className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:bg-surface/60 disabled:cursor-not-allowed bg-surface"
 />
 </div>
 </div>
 </div>
 )}

 <div className="bg-surface/80 rounded-2xl border border-slate-200 p-4 mb-3 shadow-sm">
 <h3 className="text-xs font-sans font-semibold uppercase tracking-widest text-slate-500 mb-4">
 {layoutType === 'info_note' ? 'Özet' : 'YK Bilgilendirme Notu'}
 </h3>
 <textarea
 value={es?.briefingNote ?? ''}
 disabled={readOnly}
 onChange={(e) => updateExecutiveSummary({ briefingNote: e.target.value })}
 rows={3}
 placeholder={
 layoutType === 'info_note'
 ? 'Bilgi notunun kısa özeti...'
 : "Yönetim Kurulu'na iletilecek kısa özet notu..."
 }
 className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm font-sans text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none disabled:bg-canvas disabled:cursor-not-allowed bg-surface"
 />
 </div>

 <div className="bg-surface/80 rounded-2xl border border-slate-200 p-4 shadow-sm">
 <h3 className="text-xs font-sans font-semibold uppercase tracking-widest text-slate-500 mb-3">
 Detaylı Bölümler
 </h3>

 {isGenerating ? (
 <>
 <SkeletonBlock lines={4} />
 <SkeletonBlock lines={5} />
 <SkeletonBlock lines={4} />
 </>
 ) : (es?.dynamicSections?.length ?? 0) > 0 ? (
 (es?.dynamicSections ?? []).map((section, idx) => (
 <DynamicTiptapField
 key={section.id}
 section={section}
 index={idx}
 readOnly={readOnly}
 onChange={handleDynamicSectionChange}
 />
 ))
 ) : (
 <>
 <TiptapField
 label="I. Denetim Görüşü"
 fieldKey="auditOpinion"
 content={es?.sections?.auditOpinion ?? ''}
 placeholder="Denetim görüşünüzü buraya yazın (GIAS 2400 çerçevesinde)..."
 readOnly={readOnly}
 onChange={handleSectionChange}
 />
 <TiptapField
 label="II. Kritik Risk Alanları"
 fieldKey="criticalRisks"
 content={es?.sections?.criticalRisks ?? ''}
 placeholder="Kritik ve yüksek öncelikli risk tespitlerini açıklayın..."
 readOnly={readOnly}
 onChange={handleSectionChange}
 />
 <TiptapField
 label="III. Stratejik Öneriler"
 fieldKey="strategicRecommendations"
 content={es?.sections?.strategicRecommendations ?? ''}
 placeholder="Yönetime yönelik stratejik tavsiyeler ve aksiyon önerilerini yazın..."
 readOnly={readOnly}
 onChange={handleSectionChange}
 />
 <TiptapField
 label="IV. Yönetim Eylemi ve Taahhütler"
 fieldKey="managementAction"
 content={es?.sections?.managementAction ?? ''}
 placeholder="Yönetimin bulgulara verdiği yanıtlar ve taahhütleri belirtin..."
 readOnly={readOnly}
 onChange={handleSectionChange}
 />
 </>
 )}
 </div>

 {layoutType !== 'info_note' && (
 <div className="bg-surface/80 rounded-2xl border border-slate-200 p-4 mt-3 shadow-sm">
 <div className="flex items-center gap-2 mb-4">
 <UserCheck size={16} className="text-slate-500" />
 <h3 className="text-xs font-sans font-semibold uppercase tracking-widest text-slate-500">
 Yönetim Beyanı (BDDK Gereği)
 </h3>
 </div>
 <div className="grid sm:grid-cols-2 gap-4 mb-4">
 <div>
 <label className="block text-xs text-slate-500 font-sans mb-1">Beyanı Veren Yönetici</label>
 <input
 type="text"
 value={mgmtResponse?.providedBy ?? ''}
 disabled={readOnly}
 onChange={(e) => handleManagementResponseChange('providedBy', e.target.value)}
 placeholder="Ad Soyad – Unvan"
 className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-canvas disabled:cursor-not-allowed bg-surface"
 />
 </div>
 <div>
 <label className="block text-xs text-slate-500 font-sans mb-1">Beyan Tarihi</label>
 <input
 type="date"
 value={mgmtResponse?.providedAt ?? new Date().toISOString().slice(0, 10)}
 disabled={readOnly}
 onChange={(e) => handleManagementResponseChange('providedAt', e.target.value)}
 className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-canvas disabled:cursor-not-allowed bg-surface"
 />
 </div>
 </div>
 <div>
 <label className="block text-xs text-slate-500 font-sans mb-1">Yönetim Beyanı Metni</label>
 <textarea
 value={mgmtResponse?.responseText ?? ''}
 disabled={readOnly}
 onChange={(e) => handleManagementResponseChange('responseText', e.target.value)}
 rows={4}
 placeholder="Denetlenen birim yöneticisinin bulgu ve önerilere ilişkin resmi beyanı..."
 className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm font-sans text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none disabled:bg-canvas disabled:cursor-not-allowed bg-surface"
 />
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
