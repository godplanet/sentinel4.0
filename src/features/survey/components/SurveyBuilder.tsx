import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Trash2, ChevronUp, ChevronDown, Save, Eye, GripVertical,
  FileText, Settings, LayoutList,
} from 'lucide-react';
import type {
  SurveySchema, SurveySection, SurveyQuestion, SurveyQuestionType,
  SurveyQuestionOption, SurveyModule, SurveyTemplateRow,
} from '@/shared/types/survey';
import { createTemplate, updateTemplate } from '../api';

interface Props {
  initialTitle?: string;
  initialModule?: SurveyModule;
  initialSchema?: SurveySchema;
  templateId?: string;
  onSave?: (template: SurveyTemplateRow) => void;
  onCancel?: () => void;
}

const QUESTION_TYPE_OPTIONS: { value: SurveyQuestionType; label: string; icon: string }[] = [
  { value: 'RATING',        label: 'Derecelendirme (1-5)', icon: '⭐' },
  { value: 'TEXT',          label: 'Açık Metin',           icon: '📝' },
  { value: 'YES_NO',        label: 'Evet / Hayır',         icon: '✅' },
  { value: 'SINGLE_CHOICE', label: 'Tek Seçim',            icon: '🔘' },
  { value: 'MULTI_CHOICE',  label: 'Çoklu Seçim',          icon: '☑️' },
  { value: 'NUMERIC',       label: 'Sayısal',               icon: '🔢' },
];

const MODULE_OPTIONS: SurveyModule[] = ['TALENT', 'QAIP', 'ENGAGEMENT', 'GENERAL'];

function newSection(idx: number): SurveySection {
  return {
    id: `sec-${Date.now()}-${idx}`,
    title: `Bölüm ${idx + 1}`,
    description: '',
    weight: 1,
    questions: [],
  };
}

function newQuestion(sectionIdx: number, qIdx: number): SurveyQuestion {
  return {
    id: `q-${Date.now()}-${sectionIdx}-${qIdx}`,
    text: 'Yeni soru',
    type: 'RATING',
    weight: 1,
    required: true,
    hint: '',
  };
}

const DEFAULT_SCHEMA: SurveySchema = {
  version: '1.0',
  sections: [newSection(0)],
  scoring_method: 'WEIGHTED_AVERAGE',
  pass_threshold: 60,
};

export function SurveyBuilder({ initialTitle = '', initialModule = 'GENERAL', initialSchema, templateId, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [module, setModule] = useState<SurveyModule>(initialModule);
  const [sections, setSections] = useState<SurveySection[]>(initialSchema?.sections ?? DEFAULT_SCHEMA.sections);
  const [scoringMethod, setScoringMethod] = useState(initialSchema?.scoring_method ?? DEFAULT_SCHEMA.scoring_method);
  const [passThreshold, setPassThreshold] = useState(initialSchema?.pass_threshold ?? 60);
  const [selSection, setSelSection] = useState<number>(0);
  const [selQuestion, setSelQuestion] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const section = sections[selSection] ?? null;
  const question = section && selQuestion !== null ? section.questions[selQuestion] ?? null : null;

  const updateSection = useCallback((idx: number, patch: Partial<SurveySection>) => {
    setSections((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }, []);

  const updateQuestion = useCallback((sIdx: number, qIdx: number, patch: Partial<SurveyQuestion>) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sIdx
          ? { ...s, questions: s.questions.map((q, j) => (j === qIdx ? { ...q, ...patch } : q)) }
          : s,
      ),
    );
  }, []);

  const addSection = () => {
    const idx = sections.length;
    setSections((prev) => [...prev, newSection(idx)]);
    setSelSection(idx);
    setSelQuestion(null);
  };

  const removeSection = (idx: number) => {
    setSections((prev) => prev.filter((_, i) => i !== idx));
    setSelSection(Math.max(0, idx - 1));
    setSelQuestion(null);
  };

  const moveSection = (idx: number, dir: -1 | 1) => {
    const next = idx + dir;
    if (next < 0 || next >= sections.length) return;
    setSections((prev) => {
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
    setSelSection(next);
  };

  const addQuestion = () => {
    const qIdx = section?.questions.length ?? 0;
    setSections((prev) =>
      prev.map((s, i) =>
        i === selSection ? { ...s, questions: [...s.questions, newQuestion(selSection, qIdx)] } : s,
      ),
    );
    setSelQuestion(qIdx);
  };

  const removeQuestion = (qIdx: number) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === selSection ? { ...s, questions: s.questions.filter((_, j) => j !== qIdx) } : s,
      ),
    );
    setSelQuestion(null);
  };

  const moveQuestion = (qIdx: number, dir: -1 | 1) => {
    const next = qIdx + dir;
    if (!section || next < 0 || next >= section.questions.length) return;
    setSections((prev) =>
      prev.map((s, i) => {
        if (i !== selSection) return s;
        const arr = [...s.questions];
        [arr[qIdx], arr[next]] = [arr[next], arr[qIdx]];
        return { ...s, questions: arr };
      }),
    );
    setSelQuestion(next);
  };

  const addOption = () => {
    if (!question || selQuestion === null) return;
    const opts = question.options ?? [];
    const newOpt: SurveyQuestionOption = { value: `opt-${opts.length + 1}`, label: `Seçenek ${opts.length + 1}`, score: 1 };
    updateQuestion(selSection, selQuestion, { options: [...opts, newOpt] });
  };

  const updateOption = (oIdx: number, patch: Partial<SurveyQuestionOption>) => {
    if (!question || selQuestion === null) return;
    const opts = (question.options ?? []).map((o, i) => (i === oIdx ? { ...o, ...patch } : o));
    updateQuestion(selSection, selQuestion, { options: opts });
  };

  const removeOption = (oIdx: number) => {
    if (!question || selQuestion === null) return;
    updateQuestion(selSection, selQuestion, { options: (question.options ?? []).filter((_, i) => i !== oIdx) });
  };

  const buildSchema = (): SurveySchema => ({
    version: '1.0',
    sections,
    scoring_method: scoringMethod,
    pass_threshold: passThreshold,
  });

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const schema = buildSchema();
      const result = templateId
        ? await updateTemplate(templateId, { title, module, schema })
        : await createTemplate({ title, module, schema, is_active: true });
      onSave?.(result);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-2xl border border-white/8 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/80 border-b border-white/6">
        <LayoutList className="w-4 h-4 text-sky-400 flex-shrink-0" />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Anket başlığı..."
          className="flex-1 bg-transparent text-white text-sm font-semibold placeholder:text-slate-600 focus:outline-none"
        />
        <select
          value={module}
          onChange={(e) => setModule(e.target.value as SurveyModule)}
          className="bg-slate-800 border border-white/8 rounded-lg px-2 py-1.5 text-slate-300 text-xs focus:outline-none"
        >
          {MODULE_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <button
          onClick={() => setPreviewMode((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
            ${previewMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800/40 text-slate-400 border-white/8 hover:text-white'}`}
        >
          <Eye className="w-3 h-3" />
          JSON
        </button>
        <button
          onClick={handleSave}
          disabled={!title.trim() || saving}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold
            transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-3 h-3" />}
          Kaydet
        </button>
        {onCancel && (
          <button onClick={onCancel} className="text-slate-600 hover:text-slate-400 text-xs transition-colors">
            İptal
          </button>
        )}
      </div>

      {previewMode ? (
        <pre className="flex-1 overflow-auto p-6 text-[11px] text-emerald-300 font-mono bg-slate-950">
          {JSON.stringify(buildSchema(), null, 2)}
        </pre>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <div className="w-52 flex-shrink-0 border-r border-white/6 bg-slate-900/60 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/6">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Bölümler</span>
              <button onClick={addSection} className="w-5 h-5 rounded flex items-center justify-center bg-slate-800 hover:bg-sky-500/20 text-slate-500 hover:text-sky-400 transition-colors">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {sections.map((s, i) => (
                <div
                  key={s.id}
                  className={`group flex items-center gap-1.5 px-2 py-2 rounded-lg cursor-pointer transition-all
                    ${selSection === i ? 'bg-sky-500/15 border border-sky-500/30' : 'hover:bg-slate-800/50 border border-transparent'}`}
                  onClick={() => { setSelSection(i); setSelQuestion(null); }}
                >
                  <GripVertical className="w-3 h-3 text-slate-700 flex-shrink-0" />
                  <span className={`flex-1 text-xs truncate ${selSection === i ? 'text-sky-300' : 'text-slate-400'}`}>{s.title}</span>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100">
                    <button onClick={(e) => { e.stopPropagation(); moveSection(i, -1); }} className="w-4 h-4 flex items-center justify-center text-slate-600 hover:text-white">
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); moveSection(i, 1); }} className="w-4 h-4 flex items-center justify-center text-slate-600 hover:text-white">
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); removeSection(i); }} className="w-4 h-4 flex items-center justify-center text-slate-600 hover:text-rose-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden border-r border-white/6">
            {section ? (
              <>
                <div className="px-4 py-3 border-b border-white/6 bg-slate-900/30">
                  <input
                    value={section.title}
                    onChange={(e) => updateSection(selSection, { title: e.target.value })}
                    className="w-full bg-transparent text-white text-sm font-semibold focus:outline-none placeholder:text-slate-600"
                    placeholder="Bölüm adı..."
                  />
                  <input
                    value={section.description ?? ''}
                    onChange={(e) => updateSection(selSection, { description: e.target.value })}
                    className="w-full bg-transparent text-slate-500 text-xs focus:outline-none placeholder:text-slate-700 mt-0.5"
                    placeholder="Açıklama (isteğe bağlı)..."
                  />
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                  {section.questions.map((q, qi) => (
                    <div
                      key={q.id}
                      onClick={() => setSelQuestion(qi)}
                      className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer border transition-all
                        ${selQuestion === qi ? 'bg-slate-800/60 border-sky-500/30' : 'border-transparent hover:bg-slate-800/30 hover:border-white/8'}`}
                    >
                      <GripVertical className="w-3.5 h-3.5 text-slate-700 flex-shrink-0" />
                      <span className="text-[9px] text-slate-600 flex-shrink-0 w-6 text-center">
                        {QUESTION_TYPE_OPTIONS.find((t) => t.value === q.type)?.icon ?? '?'}
                      </span>
                      <span className="flex-1 text-xs text-slate-300 truncate">{q.text}</span>
                      {q.required && <span className="text-[8px] text-rose-400 font-bold">*</span>}
                      <span className="text-[9px] text-slate-600 font-mono">{q.weight}p</span>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100">
                        <button onClick={(e) => { e.stopPropagation(); moveQuestion(qi, -1); }} className="w-4 h-4 flex items-center justify-center text-slate-600 hover:text-white">
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); moveQuestion(qi, 1); }} className="w-4 h-4 flex items-center justify-center text-slate-600 hover:text-white">
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); removeQuestion(qi); }} className="w-4 h-4 flex items-center justify-center text-slate-600 hover:text-rose-400">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addQuestion}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/10 text-slate-600 hover:text-slate-400 hover:border-white/20 text-xs transition-all mt-2"
                  >
                    <Plus className="w-3 h-3" />
                    Soru Ekle
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
                <div className="text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Bölüm seçin veya ekleyin
                </div>
              </div>
            )}
          </div>

          <div className="w-72 flex-shrink-0 overflow-y-auto bg-slate-900/40">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/6">
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">
                {question ? 'Soru Özellikleri' : 'Şema Ayarları'}
              </span>
            </div>

            <div className="p-4 space-y-4">
              {question && selQuestion !== null ? (
                <>
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Soru Metni</label>
                    <textarea
                      value={question.text}
                      onChange={(e) => updateQuestion(selSection, selQuestion, { text: e.target.value })}
                      rows={2}
                      className="w-full mt-1 bg-slate-800 border border-white/8 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-sky-500/50 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">İpucu (Hint)</label>
                    <input
                      value={question.hint ?? ''}
                      onChange={(e) => updateQuestion(selSection, selQuestion, { hint: e.target.value })}
                      placeholder="İsteğe bağlı..."
                      className="w-full mt-1 bg-slate-800 border border-white/8 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-sky-500/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Tür</label>
                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(selSection, selQuestion, { type: e.target.value as SurveyQuestionType, options: undefined })}
                        className="w-full mt-1 bg-slate-800 border border-white/8 rounded-xl px-2 py-2 text-white text-xs focus:outline-none"
                      >
                        {QUESTION_TYPE_OPTIONS.map((t) => (
                          <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Ağırlık</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={question.weight}
                        onChange={(e) => updateQuestion(selSection, selQuestion, { weight: Number(e.target.value) })}
                        className="w-full mt-1 bg-slate-800 border border-white/8 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="required-chk"
                      checked={question.required}
                      onChange={(e) => updateQuestion(selSection, selQuestion, { required: e.target.checked })}
                      className="accent-sky-500"
                    />
                    <label htmlFor="required-chk" className="text-xs text-slate-400 cursor-pointer">Zorunlu</label>
                  </div>

                  {(question.type === 'NUMERIC' || question.type === 'RATING') && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Min</label>
                        <input type="number" value={question.min ?? ''} onChange={(e) => updateQuestion(selSection, selQuestion, { min: Number(e.target.value) })}
                          className="w-full mt-1 bg-slate-800 border border-white/8 rounded-xl px-3 py-2 text-white text-xs focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Max</label>
                        <input type="number" value={question.max ?? ''} onChange={(e) => updateQuestion(selSection, selQuestion, { max: Number(e.target.value) })}
                          className="w-full mt-1 bg-slate-800 border border-white/8 rounded-xl px-3 py-2 text-white text-xs focus:outline-none" />
                      </div>
                    </div>
                  )}

                  {(question.type === 'SINGLE_CHOICE' || question.type === 'MULTI_CHOICE') && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Seçenekler</label>
                        <button onClick={addOption} className="text-sky-400 hover:text-sky-300 transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {(question.options ?? []).map((opt, oi) => (
                          <div key={oi} className="flex gap-1.5 items-center">
                            <input
                              value={opt.label}
                              onChange={(e) => updateOption(oi, { label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                              placeholder="Seçenek..."
                              className="flex-1 bg-slate-800 border border-white/8 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none"
                            />
                            <input
                              type="number"
                              min={0}
                              value={opt.score ?? 1}
                              onChange={(e) => updateOption(oi, { score: Number(e.target.value) })}
                              className="w-10 bg-slate-800 border border-white/8 rounded-lg px-1.5 py-1.5 text-white text-xs text-center focus:outline-none"
                            />
                            <button onClick={() => removeOption(oi)} className="text-slate-700 hover:text-rose-400 transition-colors">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Skorlama Yöntemi</label>
                    <select
                      value={scoringMethod}
                      onChange={(e) => setScoringMethod(e.target.value as SurveySchema['scoring_method'])}
                      className="w-full mt-1 bg-slate-800 border border-white/8 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                    >
                      <option value="WEIGHTED_AVERAGE">Ağırlıklı Ortalama</option>
                      <option value="SUM">Toplam</option>
                      <option value="MAX_SECTION">Maksimum Bölüm</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Geçme Eşiği (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={passThreshold}
                      onChange={(e) => setPassThreshold(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-800 border border-white/8 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div className="pt-2 border-t border-white/6">
                    <p className="text-[9px] text-slate-500 mb-2">ÖZET</p>
                    <div className="space-y-1 text-[10px] text-slate-500">
                      <div className="flex justify-between"><span>Bölümler</span><span className="text-white font-mono">{sections.length}</span></div>
                      <div className="flex justify-between"><span>Toplam Soru</span><span className="text-white font-mono">{sections.reduce((s, sec) => s + sec.questions.length, 0)}</span></div>
                      <div className="flex justify-between"><span>Zorunlu</span><span className="text-white font-mono">{sections.reduce((s, sec) => s + sec.questions.filter((q) => q.required).length, 0)}</span></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
