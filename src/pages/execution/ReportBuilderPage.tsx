import { PageHeader } from '@/shared/ui/PageHeader';
import clsx from 'clsx';
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Download,
  Edit3,
  FileText,
  FlaskConical,
  Loader2,
  Plus,
  RefreshCw,
  Settings2,
  Trash2,
  Upload,
  Wand2,
  X,
} from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  fetchTemplateWithContent,
  useCreateTemplate,
  useDeletePlaceholder,
  useDeleteTemplate,
  useGeneratedDocuments,
  usePlaceholders,
  useReportTemplates,
  useSaveGeneratedDocument,
  useUpsertPlaceholder,
  testSqlQuery,
} from '@/features/report-builder/api';
import { evaluateFormula, resolveAllFormulas } from '@/features/report-builder/formula-engine';
import { downloadBlob, fileToBase64, generateDocx } from '@/features/report-builder/docx-generator';
import type { ReportTemplate, TemplatePlaceholder } from '@/features/report-builder/types';

type Tab = 'templates' | 'placeholders' | 'generate' | 'history';

const DATA_TYPES = ['text', 'number', 'date'] as const;
const SOURCE_TYPES = ['manual', 'sql', 'formula'] as const;

function UsageGuide() {
  const [open, setOpen] = useState(false);
  const steps = [
    {
      num: '1',
      color: 'blue',
      title: 'Word Şablonu Hazırla',
      desc: 'Microsoft Word\'de raporunuzu hazırlayın. Dinamik olmasını istediğiniz yerlere',
      code: '[[placeholder_adi]]',
      extra: 'formatında etiketler ekleyin. Örnek: [[rapor_tarihi]], [[denetci_adi]], [[bulgu_sayisi]]',
    },
    {
      num: '2',
      color: 'amber',
      title: 'Şablonu Yükle',
      desc: '"Şablonlar" sekmesinde "Yeni Şablon Yükle" butonuna tıklayın, .docx dosyanızı seçin ve kaydedin.',
      code: null,
      extra: null,
    },
    {
      num: '3',
      color: 'violet',
      title: 'Placeholder\'ları Tanımla',
      desc: 'Şablon kartındaki "Placeholder" butonuna basın. Her [[etiket]] için kaynak tipi seçin:',
      code: null,
      extra: null,
      list: [
        { label: 'Manuel', desc: 'Rapor üretilirken elle girilir (tarih, isim, vb.)' },
        { label: 'SQL', desc: 'Veritabanından otomatik çekilir (SELECT COUNT(*) FROM audit_findings)' },
        { label: 'Formül', desc: 'Diğer placeholder\'lardan hesaplanır (addDays(rapor_tarihi, 30))' },
      ],
    },
    {
      num: '4',
      color: 'emerald',
      title: 'Raporu Üret',
      desc: '"Rapor Üret" sekmesine geçin. Manuel alanları doldurun, SQL sorgularını çalıştırın ve "Raporu Üret & İndir" butonuna tıklayın.',
      code: null,
      extra: 'Word dosyası otomatik indirilir ve geçmişe kaydedilir.',
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-600',
    amber: 'bg-amber-500',
    violet: 'bg-violet-600',
    emerald: 'bg-emerald-600',
  };
  const borderMap: Record<string, string> = {
    blue: 'border-blue-100 bg-blue-50',
    amber: 'border-amber-100 bg-amber-50',
    violet: 'border-violet-100 bg-violet-50',
    emerald: 'border-emerald-100 bg-emerald-50',
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
          <BookOpen size={15} className="text-slate-500" />
          Nasıl Kullanılır?
        </div>
        <ChevronDown size={15} className={clsx('text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {steps.map(step => (
              <div key={step.num} className={clsx('border rounded-xl p-3.5', borderMap[step.color])}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={clsx('w-5 h-5 rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0', colorMap[step.color])}>
                    {step.num}
                  </span>
                  <span className="font-bold text-slate-800 text-xs">{step.title}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                {step.code && (
                  <code className="mt-1.5 block text-[11px] bg-white border border-slate-200 px-2 py-1 rounded font-mono text-blue-700">{step.code}</code>
                )}
                {step.extra && <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{step.extra}</p>}
                {step.list && (
                  <ul className="mt-2 space-y-1.5">
                    {step.list.map(item => (
                      <li key={item.label} className="text-[11px] text-slate-600">
                        <span className="font-bold text-slate-700">{item.label}:</span> {item.desc}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 px-3 py-2 bg-slate-900 rounded-lg">
            <p className="text-xs text-slate-300 font-bold mb-1">Formül Referansı</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {[
                { fn: 'addDays(tarih, 10)', desc: '10 gün ekle' },
                { fn: 'addMonths(tarih, 3)', desc: '3 ay ekle' },
                { fn: 'formatDate(tarih, "dd.MM.yyyy")', desc: 'tarih formatla' },
                { fn: 'concat(a, " ", b)', desc: 'birleştir' },
                { fn: 'upper(metin)', desc: 'büyük harf' },
                { fn: 'lower(metin)', desc: 'küçük harf' },
                { fn: 'if(kosul, evet, hayir)', desc: 'koşullu' },
                { fn: 'coalesce(a, b)', desc: 'ilk dolu değer' },
              ].map(f => (
                <span key={f.fn} className="text-[10px]">
                  <code className="text-blue-300 font-mono">{f.fn}</code>
                  <span className="text-slate-500 ml-1">— {f.desc}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportBuilderPage() {
  const [tab, setTab] = useState<Tab>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: templates = [], isLoading: templatesLoading } = useReportTemplates();
  const createTemplate = useCreateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.docx')) { toast.error('Sadece .docx dosyaları desteklenir'); return; }
    setUploadFile(file);
    if (!uploadName) setUploadName(file.name.replace('.docx', ''));
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadName.trim()) { toast.error('Dosya ve isim zorunludur'); return; }
    setIsUploading(true);
    try {
      const base64 = await fileToBase64(uploadFile);
      await createTemplate.mutateAsync({
        name: uploadName.trim(),
        description: uploadDesc.trim() || undefined,
        file_name: uploadFile.name,
        file_content: base64,
      });
      toast.success('Template yüklendi!');
      setUploadOpen(false);
      setUploadName(''); setUploadDesc(''); setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e) {
      toast.error(`Yükleme hatası: ${e instanceof Error ? e.message : 'Bilinmeyen hata'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async (tpl: ReportTemplate) => {
    const full = await fetchTemplateWithContent(tpl.id);
    if (!full?.file_content) { toast.error('Dosya içeriği bulunamadı'); return; }
    const bytes = atob(full.file_content);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    const blob = new Blob([arr], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    downloadBlob(blob, full.file_name ?? `${tpl.name}.docx`);
  };

  const openPlaceholders = (tpl: ReportTemplate) => {
    setSelectedTemplate(tpl);
    setTab('placeholders');
  };

  const openGenerate = (tpl: ReportTemplate) => {
    setSelectedTemplate(tpl);
    setTab('generate');
  };

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'templates', label: 'Şablonlar', icon: FileText },
    { key: 'placeholders', label: 'Placeholder\'lar', icon: Code2 },
    { key: 'generate', label: 'Rapor Üret', icon: Wand2 },
    { key: 'history', label: 'Geçmiş', icon: RefreshCw },
  ];

  return (
    <div className="w-full px-4 py-5 space-y-4 bg-canvas min-h-screen font-sans">
      <PageHeader
        title="Rapor Oluşturucu"
        description="Word şablonlarını yükleyin, placeholder'larla özelleştirin ve raporları otomatik oluşturun"
        icon={FileText}
      />

      {/* Tab Bar */}
      <div className="flex gap-1 border-b border-slate-200 bg-surface rounded-t-xl px-2 pt-2">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-all',
              tab === key
                ? 'border-blue-600 text-blue-700 bg-blue-50'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-b-xl rounded-tr-xl border border-t-0 border-slate-200 shadow-sm min-h-[500px]">

        {/* ── TEMPLATES TAB ── */}
        {tab === 'templates' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-700 text-sm">Yüklü Şablonlar</h2>
              <button
                onClick={() => setUploadOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Upload size={14} /> Yeni Şablon Yükle
              </button>
            </div>

            {/* Upload modal */}
            {uploadOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="fixed inset-0 bg-black/40" onClick={() => setUploadOpen(false)} />
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-slate-800">Word Şablon Yükle</h3>
                    <button onClick={() => setUploadOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Şablon Adı *</label>
                      <input value={uploadName} onChange={e => setUploadName(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="örn. Denetim Raporu" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Açıklama</label>
                      <textarea value={uploadDesc} onChange={e => setUploadDesc(e.target.value)} rows={2}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none" placeholder="İsteğe bağlı açıklama" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Word Dosyası (.docx) *</label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      >
                        {uploadFile ? (
                          <div className="flex items-center justify-center gap-2 text-blue-700 font-semibold text-sm">
                            <FileText size={18} /> {uploadFile.name}
                          </div>
                        ) : (
                          <>
                            <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                            <p className="text-sm text-slate-500">Tıklayın veya sürükleyin</p>
                            <p className="text-xs text-slate-400 mt-1">Sadece .docx desteklenir</p>
                          </>
                        )}
                      </div>
                      <input ref={fileInputRef} type="file" accept=".docx" className="hidden" onChange={handleFileSelect} />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => setUploadOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">İptal</button>
                      <button
                        onClick={handleUpload}
                        disabled={isUploading || !uploadFile || !uploadName.trim()}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors"
                      >
                        {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        {isUploading ? 'Yükleniyor...' : 'Yükle'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {templatesLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-slate-400" size={24} /></div>
            ) : templates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <FileText size={40} className="mb-3 opacity-30" />
                <p className="font-medium text-sm">Henüz şablon yüklenmedi</p>
                <p className="text-xs mt-1 opacity-70">"Yeni Şablon Yükle" ile başlayın</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(tpl => (
                  <div key={tpl.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                        <FileText size={20} className="text-blue-600" />
                      </div>
                      <button
                        onClick={() => { if (window.confirm(`"${tpl.name}" silinsin mi?`)) deleteTemplate.mutateAsync(tpl.id).then(() => { if (selectedTemplate?.id === tpl.id) setSelectedTemplate(null); }); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 rounded transition-all"
                      ><Trash2 size={14} /></button>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1 truncate">{tpl.name}</h3>
                    {tpl.description && <p className="text-xs text-slate-500 mb-2 line-clamp-2">{tpl.description}</p>}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-3">
                      <span className="font-mono">{tpl.file_name}</span>
                      <span>v{tpl.version}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleDownloadTemplate(tpl)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors">
                        <Download size={12} /> İndir
                      </button>
                      <button onClick={() => openPlaceholders(tpl)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors border border-amber-200">
                        <Settings2 size={12} /> Placeholder
                      </button>
                      <button onClick={() => openGenerate(tpl)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors">
                        <Wand2 size={12} /> Üret
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PLACEHOLDERS TAB ── */}
        {tab === 'placeholders' && (
          <PlaceholdersTab
            selectedTemplate={selectedTemplate}
            templates={templates}
            onSelectTemplate={setSelectedTemplate}
          />
        )}

        {/* ── GENERATE TAB ── */}
        {tab === 'generate' && (
          <GenerateTab
            selectedTemplate={selectedTemplate}
            templates={templates}
            onSelectTemplate={setSelectedTemplate}
          />
        )}

        {/* ── HISTORY TAB ── */}
        {tab === 'history' && (
          <HistoryTab
            selectedTemplate={selectedTemplate}
            templates={templates}
            onSelectTemplate={setSelectedTemplate}
          />
        )}
      </div>

      <UsageGuide />
    </div>
  );
}

// ── PlaceholdersTab ────────────────────────────────────────────────────────────
function PlaceholdersTab({
  selectedTemplate, templates, onSelectTemplate,
}: {
  selectedTemplate: ReportTemplate | null;
  templates: ReportTemplate[];
  onSelectTemplate: (t: ReportTemplate) => void;
}) {
  const { data: placeholders = [], isLoading } = usePlaceholders(selectedTemplate?.id ?? '');
  const upsert = useUpsertPlaceholder();
  const deletePh = useDeletePlaceholder();
  const [editing, setEditing] = useState<Partial<TemplatePlaceholder> | null>(null);
  const [sqlTestResult, setSqlTestResult] = useState<{ key: string; result: string; error?: string } | null>(null);
  const [formulaPreview, setFormulaPreview] = useState<{ key: string; result: string } | null>(null);
  const [testingKey, setTestingKey] = useState<string | null>(null);

  const emptyPh = (): Partial<TemplatePlaceholder> => ({
    template_id: selectedTemplate?.id ?? '',
    key: '', label: '', data_type: 'text', source_type: 'manual',
    default_value: '', sql_query: '', formula_expression: '', sort_order: placeholders.length, required: false,
  });

  const save = async () => {
    if (!editing?.key?.trim()) { toast.error('Anahtar (key) zorunludur'); return; }
    if (!selectedTemplate) return;
    try {
      await upsert.mutateAsync({ ...editing, template_id: selectedTemplate.id } as TemplatePlaceholder);
      toast.success(editing.id ? 'Güncellendi' : 'Eklendi');
      setEditing(null);
    } catch (e) {
      toast.error(`Kayıt hatası: ${e instanceof Error ? e.message : 'Hata'}`);
    }
  };

  const testSql = async (ph: Partial<TemplatePlaceholder>) => {
    if (!ph.sql_query?.trim()) { toast.error('SQL sorgusu boş'); return; }
    setTestingKey(ph.key ?? '');
    const r = await testSqlQuery(ph.sql_query);
    setSqlTestResult({ key: ph.key ?? '', ...r });
    setTestingKey(null);
  };

  const previewFormula = (ph: Partial<TemplatePlaceholder>) => {
    if (!ph.formula_expression?.trim()) return;
    const ctx = Object.fromEntries(placeholders.map(p => [p.key, p.default_value ?? '']));
    const result = evaluateFormula(ph.formula_expression, ctx);
    setFormulaPreview({ key: ph.key ?? '', result });
  };

  if (!selectedTemplate) {
    return (
      <div className="p-5">
        <p className="text-sm text-slate-500 mb-3">Placeholder yönetmek için bir şablon seçin:</p>
        <div className="flex flex-wrap gap-2">
          {templates.map(t => (
            <button key={t.id} onClick={() => onSelectTemplate(t)}
              className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100">
              {t.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-700 text-sm">Placeholder Yönetimi</h2>
          <p className="text-xs text-slate-400 mt-0.5">Şablon: <span className="font-semibold text-slate-600">{selectedTemplate.name}</span></p>
        </div>
        <button
          onClick={() => setEditing(emptyPh())}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          <Plus size={14} /> Placeholder Ekle
        </button>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-4">
          <h3 className="font-bold text-blue-800 text-sm">{editing.id ? 'Düzenle' : 'Yeni Placeholder'}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Key * <span className="text-slate-400 font-normal normal-case">([[key]])</span></label>
              <input value={editing.key ?? ''} onChange={e => setEditing(f => ({ ...f, key: e.target.value.replace(/\s/g, '_') }))}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-mono bg-white"
                placeholder="report_date" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Etiket</label>
              <input value={editing.label ?? ''} onChange={e => setEditing(f => ({ ...f, label: e.target.value }))}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
                placeholder="Rapor Tarihi" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Veri Tipi</label>
              <select value={editing.data_type ?? 'text'} onChange={e => setEditing(f => ({ ...f, data_type: e.target.value as 'text' | 'number' | 'date' }))}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white">
                {DATA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Kaynak Tipi</label>
              <select value={editing.source_type ?? 'manual'} onChange={e => setEditing(f => ({ ...f, source_type: e.target.value as 'manual' | 'sql' | 'formula' }))}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white">
                {SOURCE_TYPES.map(t => <option key={t} value={t}>{t === 'manual' ? 'Manuel' : t === 'sql' ? 'SQL Sorgusu' : 'Formül'}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Varsayılan Değer</label>
              <input value={editing.default_value ?? ''} onChange={e => setEditing(f => ({ ...f, default_value: e.target.value }))}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
                placeholder="Opsiyonel" />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="req-check" checked={editing.required ?? false}
                onChange={e => setEditing(f => ({ ...f, required: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-blue-600" />
              <label htmlFor="req-check" className="text-sm text-slate-700 font-medium">Zorunlu alan</label>
            </div>
          </div>

          {/* SQL Input */}
          {editing.source_type === 'sql' && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">SQL Sorgusu</label>
              <div className="flex gap-2">
                <textarea value={editing.sql_query ?? ''} onChange={e => setEditing(f => ({ ...f, sql_query: e.target.value }))} rows={2}
                  className="flex-1 px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-blue-500 bg-white resize-none"
                  placeholder="SELECT column FROM table WHERE id = :param" />
                <button onClick={() => testSql(editing)}
                  disabled={testingKey === editing.key}
                  className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-200 flex items-center gap-1.5 disabled:opacity-40">
                  {testingKey === editing.key ? <Loader2 size={12} className="animate-spin" /> : <FlaskConical size={12} />}
                  Test
                </button>
              </div>
              {sqlTestResult && sqlTestResult.key === editing.key && (
                <div className={clsx('mt-2 px-3 py-2 rounded-lg text-xs font-mono', sqlTestResult.error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')}>
                  {sqlTestResult.error ? `Hata: ${sqlTestResult.error}` : `Sonuç: ${sqlTestResult.result}`}
                </div>
              )}
            </div>
          )}

          {/* Formula Input */}
          {editing.source_type === 'formula' && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                Formül İfadesi <span className="font-normal text-slate-400 normal-case">(addDays, addMonths, concat, upper, lower, if, coalesce)</span>
              </label>
              <div className="flex gap-2">
                <input value={editing.formula_expression ?? ''} onChange={e => setEditing(f => ({ ...f, formula_expression: e.target.value }))}
                  className="flex-1 px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-blue-500 bg-white"
                  placeholder='addDays(report_date, 10)' />
                <button onClick={() => previewFormula(editing)}
                  className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold hover:bg-purple-200 flex items-center gap-1.5">
                  <FlaskConical size={12} /> Önizle
                </button>
              </div>
              {formulaPreview && formulaPreview.key === editing.key && (
                <div className="mt-2 px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-mono">
                  Sonuç: {formulaPreview.result}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => setEditing(null)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50">İptal</button>
            <button onClick={save} disabled={upsert.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-40">
              {upsert.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Kaydet
            </button>
          </div>
        </div>
      )}

      {/* Placeholder list */}
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-400" size={20} /></div>
      ) : placeholders.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-slate-400">
          <Code2 size={32} className="mb-2 opacity-30" />
          <p className="text-sm font-medium">Henüz placeholder yok</p>
          <p className="text-xs mt-1 opacity-70">Word şablonunuza [[key]] formatında placeholder ekleyin</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 text-left">Key</th>
                <th className="px-3 py-2.5 text-left">Etiket</th>
                <th className="px-3 py-2.5 text-center">Tip</th>
                <th className="px-3 py-2.5 text-center">Kaynak</th>
                <th className="px-3 py-2.5 text-left">Varsayılan / Sorgu / Formül</th>
                <th className="px-3 py-2.5 text-center w-10">Z.</th>
                <th className="px-3 py-2.5 text-right w-20">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {placeholders.map(ph => (
                <tr key={ph.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2.5 font-mono text-blue-700 font-semibold text-xs">[[{ph.key}]]</td>
                  <td className="px-3 py-2.5 text-slate-700 text-xs">{ph.label || '—'}</td>
                  <td className="px-3 py-2.5 text-center"><span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">{ph.data_type}</span></td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-bold',
                      ph.source_type === 'manual' ? 'bg-blue-100 text-blue-700' :
                      ph.source_type === 'sql' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-purple-100 text-purple-700'
                    )}>
                      {ph.source_type === 'manual' ? 'Manuel' : ph.source_type === 'sql' ? 'SQL' : 'Formül'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs font-mono text-slate-500 max-w-[200px] truncate">
                    {ph.source_type === 'sql' ? ph.sql_query :
                     ph.source_type === 'formula' ? ph.formula_expression :
                     ph.default_value || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-center text-xs">{ph.required ? '✓' : ''}</td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setEditing({ ...ph })}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors">
                        <Edit3 size={13} />
                      </button>
                      <button onClick={() => deletePh.mutateAsync({ id: ph.id, templateId: ph.template_id }).then(() => toast.success('Silindi'))}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── GenerateTab ────────────────────────────────────────────────────────────────
function GenerateTab({
  selectedTemplate, templates, onSelectTemplate,
}: {
  selectedTemplate: ReportTemplate | null;
  templates: ReportTemplate[];
  onSelectTemplate: (t: ReportTemplate) => void;
}) {
  const { data: placeholders = [] } = usePlaceholders(selectedTemplate?.id ?? '');
  const saveDoc = useSaveGeneratedDocument();
  const [manualValues, setManualValues] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewPayload, setPreviewPayload] = useState<Record<string, string> | null>(null);
  const [sqlResults, setSqlResults] = useState<Record<string, string>>({});
  const [isTestingSql, setIsTestingSql] = useState(false);

  const runSqlPlaceholders = async () => {
    setIsTestingSql(true);
    const results: Record<string, string> = {};
    for (const ph of placeholders.filter(p => p.source_type === 'sql' && p.sql_query)) {
      const r = await testSqlQuery(ph.sql_query!);
      if (!r.error) results[ph.key] = r.result;
    }
    setSqlResults(results);
    setIsTestingSql(false);
    toast.success('SQL sorguları çalıştırıldı');
  };

  const buildPayload = useCallback(() => {
    const base: Record<string, string> = {};
    for (const ph of placeholders) {
      if (ph.source_type === 'manual') base[ph.key] = manualValues[ph.key] ?? ph.default_value ?? '';
      else if (ph.source_type === 'sql') base[ph.key] = sqlResults[ph.key] ?? ph.default_value ?? '';
    }
    return resolveAllFormulas(placeholders, base);
  }, [placeholders, manualValues, sqlResults]);

  const preview = () => setPreviewPayload(buildPayload());

  const generate = async () => {
    if (!selectedTemplate) return;
    setIsGenerating(true);
    try {
      const full = await fetchTemplateWithContent(selectedTemplate.id);
      if (!full?.file_content) throw new Error('Şablon dosyası bulunamadı');
      const payload = buildPayload();
      const blob = await generateDocx(full.file_content, payload);
      const fileName = `${selectedTemplate.name}_${new Date().toISOString().slice(0,10)}.docx`;
      downloadBlob(blob, fileName);
      await saveDoc.mutateAsync({
        template_id: selectedTemplate.id,
        output_file_name: fileName,
        input_payload: manualValues,
        resolved_payload: payload,
      });
      toast.success('Rapor oluşturuldu ve indirildi!');
    } catch (e) {
      toast.error(`Üretim hatası: ${e instanceof Error ? e.message : 'Hata'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!selectedTemplate) {
    return (
      <div className="p-5">
        <p className="text-sm text-slate-500 mb-3">Rapor üretmek için bir şablon seçin:</p>
        <div className="flex flex-wrap gap-2">
          {templates.map(t => (
            <button key={t.id} onClick={() => onSelectTemplate(t)}
              className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100">
              {t.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const manualPhs = placeholders.filter(p => p.source_type === 'manual');
  const sqlPhs = placeholders.filter(p => p.source_type === 'sql');
  const formulaPhs = placeholders.filter(p => p.source_type === 'formula');

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-700 text-sm">Rapor Üret</h2>
          <p className="text-xs text-slate-400 mt-0.5">Şablon: <span className="font-semibold text-slate-600">{selectedTemplate.name}</span></p>
        </div>
        <div className="flex gap-2">
          <button onClick={preview} className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200">
            <ChevronRight size={14} /> Önizle
          </button>
          <button onClick={generate} disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 shadow-sm">
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {isGenerating ? 'Üretiliyor...' : 'Raporu Üret & İndir'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Manual inputs */}
        {manualPhs.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Edit3 size={12} /> Manuel Giriş Alanları
            </h3>
            <div className="space-y-3">
              {manualPhs.map(ph => (
                <div key={ph.key}>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {ph.label || ph.key}
                    {ph.required && <span className="text-red-500 ml-1">*</span>}
                    <span className="font-mono font-normal text-slate-400 ml-1">[[{ph.key}]]</span>
                  </label>
                  <input
                    type={ph.data_type === 'date' ? 'text' : ph.data_type === 'number' ? 'number' : 'text'}
                    value={manualValues[ph.key] ?? ph.default_value ?? ''}
                    onChange={e => setManualValues(v => ({ ...v, [ph.key]: e.target.value }))}
                    placeholder={ph.default_value ?? (ph.data_type === 'date' ? '01.01.2025' : '')}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SQL sources */}
        {sqlPhs.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                <Code2 size={12} /> SQL Kaynakları
              </h3>
              <button onClick={runSqlPlaceholders} disabled={isTestingSql}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700 disabled:opacity-40">
                {isTestingSql ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                Sorgula
              </button>
            </div>
            <div className="space-y-2">
              {sqlPhs.map(ph => (
                <div key={ph.key} className="flex items-center justify-between py-1.5 border-b border-emerald-200/50 last:border-0">
                  <div>
                    <span className="font-mono text-xs font-bold text-emerald-800">[[{ph.key}]]</span>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate max-w-[200px]">{ph.sql_query}</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    {sqlResults[ph.key] ?? '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formula sources */}
        {formulaPhs.length > 0 && (
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <h3 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Wand2 size={12} /> Formül Alanları <span className="font-normal normal-case text-purple-400">(otomatik hesaplanır)</span>
            </h3>
            <div className="space-y-2">
              {formulaPhs.map(ph => {
                const ctx = { ...manualValues, ...sqlResults, ...Object.fromEntries(placeholders.map(p => [p.key, p.default_value ?? ''])) };
                const val = ph.formula_expression ? evaluateFormula(ph.formula_expression, ctx) : '—';
                return (
                  <div key={ph.key} className="flex items-center justify-between py-1.5 border-b border-purple-200/50 last:border-0">
                    <div>
                      <span className="font-mono text-xs font-bold text-purple-800">[[{ph.key}]]</span>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{ph.formula_expression}</p>
                    </div>
                    <span className="text-xs font-semibold text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      {previewPayload && (
        <div className="bg-slate-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Önizleme — Çözümlenmiş Değerler</h3>
            <button onClick={() => setPreviewPayload(null)} className="text-slate-500 hover:text-slate-300"><X size={14} /></button>
          </div>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {Object.entries(previewPayload).map(([k, v]) => (
              <div key={k} className="flex items-center gap-3 py-1 border-b border-slate-800">
                <span className="font-mono text-blue-400 text-xs w-40 shrink-0">[[{k}]]</span>
                <span className="text-emerald-400 text-xs font-mono flex-1 truncate">→ {v || <em className="text-slate-600">boş</em>}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── HistoryTab ─────────────────────────────────────────────────────────────────
function HistoryTab({
  selectedTemplate, templates, onSelectTemplate,
}: {
  selectedTemplate: ReportTemplate | null;
  templates: ReportTemplate[];
  onSelectTemplate: (t: ReportTemplate) => void;
}) {
  const { data: docs = [], isLoading } = useGeneratedDocuments(selectedTemplate?.id ?? '');
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!selectedTemplate) {
    return (
      <div className="p-5">
        <p className="text-sm text-slate-500 mb-3">Geçmişi görüntülemek için bir şablon seçin:</p>
        <div className="flex flex-wrap gap-2">
          {templates.map(t => (
            <button key={t.id} onClick={() => onSelectTemplate(t)}
              className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200">
              {t.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4">
      <h2 className="font-bold text-slate-700 text-sm">Oluşturulan Raporlar — {selectedTemplate.name}</h2>
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-400" size={20} /></div>
      ) : docs.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-slate-400">
          <RefreshCw size={32} className="mb-2 opacity-30" />
          <p className="text-sm font-medium">Henüz oluşturulan rapor yok</p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => (
            <div key={doc.id} className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === doc.id ? null : doc.id)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-blue-500" />
                  <div className="text-left">
                    <p className="font-semibold text-slate-800 text-sm">{doc.output_file_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(doc.created_at).toLocaleString('tr-TR')}</p>
                  </div>
                </div>
                <ChevronDown size={16} className={clsx('text-slate-400 transition-transform', expanded === doc.id && 'rotate-180')} />
              </button>
              {expanded === doc.id && doc.resolved_payload && (
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kullanılan Değerler</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(doc.resolved_payload).map(([k, v]) => (
                      <div key={k} className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
                        <p className="font-mono text-[10px] text-blue-600">[[{k}]]</p>
                        <p className="text-xs text-slate-700 font-medium mt-0.5 truncate">{String(v)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
