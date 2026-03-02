import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Braces,
  ChevronDown,
  UserCheck,
  Banknote,
  Calendar,
  Building,
} from 'lucide-react';
import { useActiveReportStore } from '@/entities/report';
import type { ExecutiveSummarySections, ManagementResponse, DynamicSection } from '@/entities/report';
import { SmartVariableNode } from '@/features/report-editor/blocks/extensions/SmartVariableNode';
import { useReportSummary } from '@/features/report-editor/api/useReportSummary';

function warmthToBg(w: number): string {
  const t = w / 10;
  const r = Math.round(255 - 5 * t);
  const g = Math.round(255 - 20 * t);
  const b = Math.round(255 - 60 * t);
  return `rgb(${r},${g},${b})`;
}

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
    if (currentHtml !== content) editor.commands.setContent(content, false);
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
    <div className="mb-6">
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
                  {SMART_VARIABLE_DEFS.map(({ id, label: vLabel }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => insertVariable(id)}
                      className="w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors"
                    >
                      <p className="text-xs font-sans font-semibold text-blue-700">{vLabel}</p>
                      <p className="text-xs font-sans text-slate-500 mt-0.5">{String(smartVariables[id] ?? '—')}</p>
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
    if (currentHtml !== section.content) editor.commands.setContent(section.content, false);
  }, [section.content, editor]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readOnly);
  }, [readOnly, editor]);

  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  const label = `${romanNumerals[index] ?? index + 1}. ${section.title}`;

  return (
    <div className="mb-6">
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
    <div className="mb-6 animate-pulse">
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
}

export function ExecutiveSummaryStudio({ readOnly = false, warmth = 2 }: ExecutiveSummaryStudioProps) {
  const reportId = useActiveReportStore((s) => s.activeReport?.id);
  const { activeReport, updateExecutiveSummary, loadReport } = useActiveReportStore();
  const { report: reportFromQuery, generateSummary, isGenerating } = useReportSummary(reportId);

  const mgmtResponse = activeReport?.executiveSummary?.managementResponse;
  const es = activeReport?.executiveSummary ?? reportFromQuery?.executiveSummary;
  const paperBg = warmthToBg(warmth);
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
    try {
      await generateSummary({ reportId });
      await loadReport(reportId);
    } catch {
      /* toast / error handled by mutation or store */
    }
  }, [reportId, generateSummary, loadReport]);

  const handleSectionChange = useCallback(
    (key: keyof ExecutiveSummarySections, html: string) => {
      if (!es) return;
      updateExecutiveSummary({ sections: { ...es.sections, [key]: html } });
    },
    [es, updateExecutiveSummary],
  );

  const handleDynamicSectionChange = useCallback(
    (id: string, html: string) => {
      if (!es) return;
      const updated = (es.dynamicSections ?? []).map((s) => s.id === id ? { ...s, content: html } : s);
      updateExecutiveSummary({ dynamicSections: updated });
    },
    [es, updateExecutiveSummary],
  );

  const handleDynamicMetricChange = useCallback(
    (key: string, value: string) => {
      if (!es) return;
      updateExecutiveSummary({ dynamicMetrics: { ...(es.dynamicMetrics ?? {}), [key]: value } });
    },
    [es, updateExecutiveSummary],
  );

  if (!es) return null;

  const trendPositive = es.trend > 0;
  const trendNeutral = es.trend === 0;

  return (
    <div className="min-h-full bg-slate-100 overflow-y-auto p-6 lg:p-10">
      <div
        className="max-w-5xl mx-auto rounded-sm shadow-[0_8px_48px_rgba(0,0,0,0.13),0_2px_12px_rgba(0,0,0,0.07)] ring-1 ring-slate-200/40 transition-colors duration-300 px-8 lg:px-14 py-10"
        style={{ backgroundColor: paperBg }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-serif text-2xl font-bold text-primary">Yönetici Özeti Stüdyosu</h2>
            <p className="text-sm text-slate-500 mt-1 font-sans">GIAS 2024 · Standart 2400 uyumlu</p>
          </div>
          {!readOnly && (
            <button
              onClick={handleAIDraft}
              disabled={isGenerating || !reportId}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl text-sm font-sans font-semibold transition-colors shadow-sm flex-shrink-0"
            >
              <Sparkles size={16} />
              {isGenerating ? 'Sentinel Prime Yazıyor...' : 'Yapay Zeka ile Oluştur'}
            </button>
          )}
        </div>

        {layoutType !== 'info_note' && (
          <div className="bg-surface/80 rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
            <h3 className="text-xs font-sans font-semibold uppercase tracking-widest text-slate-500 mb-4">
              Skor ve Değerlendirme
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Güncel Skor</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={es.score}
                  disabled={readOnly}
                  onChange={(e) => updateExecutiveSummary({ score: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-sans font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-canvas disabled:cursor-not-allowed bg-surface"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Not</label>
                <select
                  value={es.grade}
                  disabled={readOnly}
                  onChange={(e) => updateExecutiveSummary({ grade: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-sans font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-canvas disabled:cursor-not-allowed bg-surface"
                >
                  {GRADE_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Önceki Not</label>
                <select
                  value={es.previousGrade}
                  disabled={readOnly}
                  onChange={(e) => updateExecutiveSummary({ previousGrade: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-sans font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-canvas disabled:cursor-not-allowed bg-surface"
                >
                  {GRADE_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Trend (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step={0.1}
                    value={es.trend}
                    disabled={readOnly}
                    onChange={(e) => updateExecutiveSummary({ trend: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-sans font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-canvas disabled:cursor-not-allowed pr-8 bg-surface"
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
                  value={es.assuranceLevel}
                  disabled={readOnly}
                  onChange={(e) => updateExecutiveSummary({ assuranceLevel: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-sans font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-canvas disabled:cursor-not-allowed bg-surface"
                >
                  {ASSURANCE_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {layoutType === 'investigation' && (
          <div className="bg-red-50 rounded-2xl border border-red-200 p-6 mb-6 shadow-sm">
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
                  value={es.dynamicMetrics?.maliBoyu ?? ''}
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
                  value={es.dynamicMetrics?.olayTarihi ?? ''}
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
                  value={es.dynamicMetrics?.ilgiliBirim ?? ''}
                  disabled={readOnly}
                  onChange={(e) => handleDynamicMetricChange('ilgiliBirim', e.target.value)}
                  placeholder="örn: Kadıköy Şubesi"
                  className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:bg-surface/60 disabled:cursor-not-allowed bg-surface"
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-surface/80 rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
          <h3 className="text-xs font-sans font-semibold uppercase tracking-widest text-slate-500 mb-4">
            {layoutType === 'info_note' ? 'Özet' : 'YK Bilgilendirme Notu'}
          </h3>
          <textarea
            value={es.briefingNote}
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

        <div className="bg-surface/80 rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-xs font-sans font-semibold uppercase tracking-widest text-slate-500 mb-6">
            Detaylı Bölümler
          </h3>

          {isGenerating ? (
            <>
              <SkeletonBlock lines={4} />
              <SkeletonBlock lines={5} />
              <SkeletonBlock lines={4} />
            </>
          ) : es.dynamicSections && es.dynamicSections.length > 0 ? (
            es.dynamicSections.map((section, idx) => (
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
                content={es.sections.auditOpinion}
                placeholder="Denetim görüşünüzü buraya yazın (GIAS 2400 çerçevesinde)..."
                readOnly={readOnly}
                onChange={handleSectionChange}
              />
              <TiptapField
                label="II. Kritik Risk Alanları"
                fieldKey="criticalRisks"
                content={es.sections.criticalRisks}
                placeholder="Kritik ve yüksek öncelikli risk tespitlerini açıklayın..."
                readOnly={readOnly}
                onChange={handleSectionChange}
              />
              <TiptapField
                label="III. Stratejik Öneriler"
                fieldKey="strategicRecommendations"
                content={es.sections.strategicRecommendations}
                placeholder="Yönetime yönelik stratejik tavsiyeler ve aksiyon önerilerini yazın..."
                readOnly={readOnly}
                onChange={handleSectionChange}
              />
              <TiptapField
                label="IV. Yönetim Eylemi ve Taahhütler"
                fieldKey="managementAction"
                content={es.sections.managementAction}
                placeholder="Yönetimin bulgulara verdiği yanıtlar ve taahhütleri belirtin..."
                readOnly={readOnly}
                onChange={handleSectionChange}
              />
            </>
          )}
        </div>

        {layoutType !== 'info_note' && (
          <div className="bg-surface/80 rounded-2xl border border-slate-200 p-6 mt-6 shadow-sm">
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
  );
}
