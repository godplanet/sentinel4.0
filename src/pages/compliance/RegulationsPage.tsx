/**
 * Mevzuat Kütüphanesi Sayfası
 *
 * Özellikler:
 *   • CRUD — Mevzuat ekleme, düzenleme, arşivleme (soft-delete)
 *   • Doküman Yönetimi — PDF, Word, Excel, HTML, vb. yükleme + listeleme + indirme
 *   • Gelişmiş Filtreleme — Kategori, ciddiyet, çerçeve, arama, aktif/pasif toggle
 *   • Gerçek Veri — useQuery + useMutation ile compliance_regulations tablosuna bağlı
 */

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import {
  BookOpen, Search, Plus, Upload, FileText, FileSpreadsheet,
  File, Globe, AlignLeft, Filter, X, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle2, Archive, RotateCcw, Download,
  Trash2, Eye, Edit3, Loader2, AlertCircle, BookMarked,
  Shield, ShieldCheck,
} from 'lucide-react';
import { PageHeader } from '@/shared/ui/PageHeader';
import type {
  ComplianceRegulation,
  RegCategory,
  RegSeverity,
  RegulationFilters,
  CreateRegulationInput,
  RegulationDocument,
} from '@/entities/compliance/api/regulations-api';
import {
  fetchRegulations,
  fetchRegulationStats,
  createRegulation,
  updateRegulation,
  archiveRegulation,
  restoreRegulation,
  uploadRegulationDocument,
  deleteRegulationDocument,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
} from '@/entities/compliance/api/regulations-api';

// ─── Sabitler ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<RegCategory, string> = {
  BDDK: 'BDDK',
  TCMB: 'TCMB',
  MASAK: 'MASAK',
  SPK: 'SPK',
  KVKK: 'KVKK',
  DIGER: 'Diğer',
};

const CATEGORY_COLORS: Record<RegCategory, string> = {
  BDDK: 'bg-blue-50 text-blue-700 border-blue-200',
  TCMB: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MASAK: 'bg-red-50 text-red-700 border-red-200',
  SPK: 'bg-purple-50 text-purple-700 border-purple-200',
  KVKK: 'bg-amber-50 text-amber-700 border-amber-200',
  DIGER: 'bg-slate-50 text-slate-600 border-slate-200',
};

const SEVERITY_LABELS: Record<RegSeverity, string> = {
  critical: 'Kritik',
  high: 'Yüksek',
  medium: 'Orta',
  low: 'Düşük',
};

const SEVERITY_COLORS: Record<RegSeverity, string> = {
  critical: 'bg-red-100 text-red-700 border-red-300',
  high: 'bg-orange-100 text-orange-700 border-orange-300',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-green-100 text-green-700 border-green-200',
};

const ALL_CATEGORIES: RegCategory[] = ['BDDK', 'TCMB', 'MASAK', 'SPK', 'KVKK', 'DIGER'];
const ALL_SEVERITIES: RegSeverity[] = ['critical', 'high', 'medium', 'low'];

// ─── Dosya İkon Yardımcısı ────────────────────────────────────────────────────

function getFileIcon(mimeType: string): React.ReactNode {
  if (mimeType.includes('pdf')) return <FileText size={14} className="text-red-500" />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel'))
    return <FileSpreadsheet size={14} className="text-green-600" />;
  if (mimeType.includes('word') || mimeType.includes('msword'))
    return <FileText size={14} className="text-blue-600" />;
  if (mimeType.includes('html'))
    return <Globe size={14} className="text-orange-500" />;
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint'))
    return <FileText size={14} className="text-orange-600" />;
  if (mimeType.includes('text'))
    return <AlignLeft size={14} className="text-slate-500" />;
  return <File size={14} className="text-slate-400" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Doküman Yükleme Modalı ───────────────────────────────────────────────────

interface UploadModalProps {
  regulation: ComplianceRegulation;
  onClose: () => void;
}

function DocumentUploadModal({ regulation, onClose }: UploadModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, 'pending' | 'done' | 'error'>>({});

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => uploadRegulationDocument(regulation.id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulations'] });
    },
  });

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter((f) => {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      return ALLOWED_EXTENSIONS.split(',').includes(ext) || ALLOWED_MIME_TYPES[f.type];
    });
    setSelectedFiles((prev) => [...prev, ...valid]);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleUploadAll = async () => {
    for (const file of selectedFiles) {
      setUploadProgress((p) => ({ ...p, [file.name]: 'pending' }));
      try {
        await uploadMutation.mutateAsync(file);
        setUploadProgress((p) => ({ ...p, [file.name]: 'done' }));
      } catch {
        setUploadProgress((p) => ({ ...p, [file.name]: 'error' }));
      }
    }
    queryClient.invalidateQueries({ queryKey: ['regulations'] });
  };

  const allDone = selectedFiles.length > 0
    && selectedFiles.every((f) => uploadProgress[f.name] === 'done');

  const docs = regulation.metadata?.documents ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Başlık */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Upload size={16} className="text-blue-600" />
            <div>
              <h2 className="text-sm font-bold text-primary font-sans">Doküman Yönetimi</h2>
              <p className="text-xs text-slate-500 font-sans">{regulation.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Drag & Drop Yükleme Alanı */}
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 font-sans">
              Dosya Yükle
            </p>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={clsx(
                'border-2 border-dashed rounded-xl p-8 cursor-pointer text-center transition-colors',
                dragOver
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-slate-200 hover:border-blue-300 hover:bg-canvas/60',
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_EXTENSIONS}
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <Upload size={28} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-600 font-sans">
                Dosyaları buraya sürükleyin veya tıklayın
              </p>
              <p className="text-xs text-slate-400 mt-1.5 font-sans">
                PDF · Word · Excel · PowerPoint · HTML · Metin dosyaları
              </p>
            </div>
          </div>

          {/* Seçilen Dosyalar */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide font-sans">
                Yüklenecek Dosyalar ({selectedFiles.length})
              </p>
              {selectedFiles.map((f) => {
                const status = uploadProgress[f.name];
                return (
                  <div key={f.name}
                       className="flex items-center gap-3 p-2.5 rounded-lg bg-canvas border border-slate-100">
                    {getFileIcon(f.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate font-sans">{f.name}</p>
                      <p className="text-[10px] text-slate-400 font-sans">{formatFileSize(f.size)}</p>
                    </div>
                    {status === 'pending' && <Loader2 size={14} className="animate-spin text-blue-500" />}
                    {status === 'done' && <CheckCircle2 size={14} className="text-emerald-500" />}
                    {status === 'error' && <AlertCircle size={14} className="text-red-500" />}
                    {!status && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFiles((prev) => prev.filter((x) => x.name !== f.name));
                        }}
                        className="text-slate-300 hover:text-slate-500"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
              <div className="flex justify-end gap-2 pt-1">
                {allDone ? (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors font-sans"
                  >
                    <CheckCircle2 size={12} className="inline mr-1.5" />
                    Tamamlandı — Kapat
                  </button>
                ) : (
                  <button
                    onClick={handleUploadAll}
                    disabled={uploadMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors font-sans"
                  >
                    {uploadMutation.isPending ? (
                      <><Loader2 size={12} className="inline animate-spin mr-1.5" />Yükleniyor...</>
                    ) : (
                      <><Upload size={12} className="inline mr-1.5" />Tümünü Yükle</>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Mevcut Dokümanlar */}
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 font-sans">
              Yüklü Dokümanlar ({docs.length})
            </p>
            {docs.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4 font-sans">
                Henüz doküman yüklenmemiş.
              </p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {docs.map((doc) => (
                  <DocumentRow
                    key={doc.id}
                    doc={doc}
                    regulationId={regulation.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/** Yüklü doküman satırı */
function DocumentRow({
  doc,
  regulationId,
}: {
  doc: RegulationDocument;
  regulationId: string;
}) {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: () => deleteRegulationDocument(regulationId, doc.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['regulations'] }),
  });

  const mimeLabel = ALLOWED_MIME_TYPES[doc.mime_type] ?? doc.mime_type.split('/')[1]?.toUpperCase() ?? '?';

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-surface border border-slate-100 group">
      {getFileIcon(doc.mime_type)}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-700 truncate font-sans">{doc.name}</p>
        <p className="text-[10px] text-slate-400 font-sans">
          {mimeLabel} · {formatFileSize(doc.size_bytes)} ·{' '}
          {new Date(doc.uploaded_at).toLocaleDateString('tr-TR')}
        </p>
      </div>
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <a
          href={doc.public_url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
          title="İndir / Görüntüle"
        >
          <Download size={12} />
        </a>
        <button
          onClick={() => {
            if (confirm(`"${doc.name}" silinsin mi?`)) deleteMutation.mutate();
          }}
          disabled={deleteMutation.isPending}
          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors disabled:opacity-50"
          title="Dokümanı Sil"
        >
          {deleteMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
        </button>
      </div>
    </div>
  );
}

// ─── Mevzuat Ekleme / Düzenleme Modalı ───────────────────────────────────────

interface RegFormModalProps {
  existing?: ComplianceRegulation;
  onClose: () => void;
}

function RegFormModal({ existing, onClose }: RegFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = !!existing;

  const [form, setForm] = useState<CreateRegulationInput>({
    code: existing?.code ?? '',
    title: existing?.title ?? '',
    category: existing?.category ?? 'BDDK',
    article: existing?.article ?? '',
    description: existing?.description ?? '',
    severity: existing?.severity ?? 'medium',
    framework: existing?.framework ?? '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateRegulationInput, string>>>({});

  const createMutation = useMutation({
    mutationFn: () => createRegulation(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulations'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => updateRegulation(existing!.id, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulations'] });
      onClose();
    },
  });

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.code.trim()) e.code = 'Zorunlu alan';
    if (!form.title.trim()) e.title = 'Zorunlu alan';
    if (!form.description.trim()) e.description = 'Zorunlu alan';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    isEdit ? updateMutation.mutate() : createMutation.mutate();
  };

  const isBusy = createMutation.isPending || updateMutation.isPending;
  const serverError = createMutation.error?.message ?? updateMutation.error?.message;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="bg-surface w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <BookMarked size={16} className="text-blue-600" />
            <h2 className="text-sm font-bold text-primary font-sans">
              {isEdit ? 'Mevzuat Düzenle' : 'Yeni Mevzuat Ekle'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {serverError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
              <AlertCircle size={14} className="text-red-600" />
              <p className="text-xs text-red-700 font-sans">{serverError}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Kod *" error={errors.code}>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="BDDK-2023-001"
                className={fieldClass(!!errors.code)}
              />
            </FormField>
            <FormField label="Kategori *">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as RegCategory })}
                className={fieldClass(false)}
              >
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Başlık *" error={errors.title}>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Mevzuat başlığını girin..."
              className={fieldClass(!!errors.title)}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Ciddiyet *">
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value as RegSeverity })}
                className={fieldClass(false)}
              >
                {ALL_SEVERITIES.map((s) => (
                  <option key={s} value={s}>{SEVERITY_LABELS[s]}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Çerçeve (Framework)">
              <input
                value={form.framework ?? ''}
                onChange={(e) => setForm({ ...form, framework: e.target.value })}
                placeholder="GIAS2024, Basel III..."
                className={fieldClass(false)}
              />
            </FormField>
          </div>

          <FormField label="Madde / Referans">
            <input
              value={form.article ?? ''}
              onChange={(e) => setForm({ ...form, article: e.target.value })}
              placeholder="Madde 14/2-c..."
              className={fieldClass(false)}
            />
          </FormField>

          <FormField label="Açıklama *" error={errors.description}>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Mevzuatın içeriğini ve kapsamını açıklayın..."
              className={`${fieldClass(!!errors.description)} resize-none`}
            />
          </FormField>

          <div className="flex justify-end gap-2.5 pt-2">
            <button type="button" onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-canvas transition-colors font-sans">
              İptal
            </button>
            <button type="submit" disabled={isBusy}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 font-sans">
              {isBusy ? <Loader2 size={14} className="inline animate-spin mr-1.5" /> : null}
              {isEdit ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function FormField({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-600 font-sans">{label}</label>
      {children}
      {error && <p className="text-[10px] text-red-500 font-sans">{error}</p>}
    </div>
  );
}

function fieldClass(hasError: boolean) {
  return clsx(
    'w-full rounded-xl border px-3 py-2 text-sm text-slate-700 bg-canvas font-sans',
    'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors',
    hasError ? 'border-red-400' : 'border-slate-200 hover:border-slate-300',
  );
}

// ─── Mevzuat Satırı ───────────────────────────────────────────────────────────

interface RegRowProps {
  reg: ComplianceRegulation;
  onEdit: (r: ComplianceRegulation) => void;
  onUpload: (r: ComplianceRegulation) => void;
}

function RegulationRow({ reg, onEdit, onUpload }: RegRowProps) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const docCount = reg.metadata?.documents?.length ?? 0;

  const archiveMutation = useMutation({
    mutationFn: () => (reg.is_active ? archiveRegulation(reg.id) : restoreRegulation(reg.id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['regulations'] }),
  });

  return (
    <>
      <tr className={clsx(
        'border-b border-slate-100 hover:bg-canvas/50 transition-colors',
        !reg.is_active && 'opacity-60',
      )}>
        {/* Kod */}
        <td className="px-4 py-3">
          <span className="text-xs font-mono font-bold text-slate-700">{reg.code}</span>
        </td>

        {/* Kategori */}
        <td className="px-4 py-3">
          <span className={clsx(
            'inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border font-sans',
            CATEGORY_COLORS[reg.category],
          )}>
            {CATEGORY_LABELS[reg.category]}
          </span>
        </td>

        {/* Başlık */}
        <td className="px-4 py-3 max-w-xs">
          <p className="text-xs font-semibold text-slate-800 font-sans truncate">{reg.title}</p>
          {reg.article && (
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">Madde: {reg.article}</p>
          )}
        </td>

        {/* Ciddiyet */}
        <td className="px-4 py-3">
          <span className={clsx(
            'inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold border font-sans',
            SEVERITY_COLORS[reg.severity],
          )}>
            {SEVERITY_LABELS[reg.severity]}
          </span>
        </td>

        {/* Çerçeve */}
        <td className="px-4 py-3">
          <span className="text-[10px] text-slate-500 font-sans">{reg.framework ?? '—'}</span>
        </td>

        {/* Dokümanlar */}
        <td className="px-4 py-3">
          <button
            onClick={() => onUpload(reg)}
            className={clsx(
              'flex items-center gap-1 text-[10px] font-semibold rounded-md px-2 py-1 transition-colors font-sans',
              docCount > 0
                ? 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
                : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100',
            )}
          >
            <FileText size={10} />
            {docCount} dok.
          </button>
        </td>

        {/* Durum */}
        <td className="px-4 py-3">
          <span className={clsx(
            'text-[10px] font-semibold font-sans',
            reg.is_active ? 'text-emerald-600' : 'text-slate-400',
          )}>
            {reg.is_active ? 'Aktif' : 'Arşiv'}
          </span>
        </td>

        {/* İşlemler */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setExpanded(!expanded)}
              title="Detay"
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <Eye size={13} />
            </button>
            <button
              onClick={() => onEdit(reg)}
              title="Düzenle"
              className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <Edit3 size={13} />
            </button>
            <button
              onClick={() => onUpload(reg)}
              title="Doküman Yükle"
              className="p-1.5 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
            >
              <Upload size={13} />
            </button>
            <button
              onClick={() => archiveMutation.mutate()}
              disabled={archiveMutation.isPending}
              title={reg.is_active ? 'Arşivle' : 'Geri Al'}
              className={clsx(
                'p-1.5 rounded-lg transition-colors disabled:opacity-50',
                reg.is_active
                  ? 'text-slate-400 hover:bg-amber-50 hover:text-amber-600'
                  : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-600',
              )}
            >
              {archiveMutation.isPending
                ? <Loader2 size={13} className="animate-spin" />
                : reg.is_active ? <Archive size={13} /> : <RotateCcw size={13} />
              }
            </button>
          </div>
        </td>
      </tr>

      {/* Genişletilmiş Açıklama */}
      {expanded && (
        <tr className="bg-canvas/50 border-b border-slate-100">
          <td colSpan={8} className="px-6 py-3">
            <p className="text-xs text-slate-600 font-sans leading-relaxed">{reg.description}</p>
            {(reg.metadata?.documents?.length ?? 0) > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {reg.metadata.documents!.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-slate-200
                               text-[10px] text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors font-sans"
                  >
                    {getFileIcon(doc.mime_type)}
                    <span className="truncate max-w-[160px]">{doc.name}</span>
                    <Download size={9} />
                  </a>
                ))}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────

export default function RegulationsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<RegCategory[]>([]);
  const [selectedSeverities, setSelectedSeverities] = useState<RegSeverity[]>([]);
  const [frameworkFilter, setFrameworkFilter] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editTarget, setEditTarget] = useState<ComplianceRegulation | undefined>(undefined);
  const [showFormModal, setShowFormModal] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<ComplianceRegulation | null>(null);

  const filters: RegulationFilters = {
    search: search || undefined,
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    severities: selectedSeverities.length > 0 ? selectedSeverities : undefined,
    framework: frameworkFilter || undefined,
    is_active: showInactive ? undefined : true,
  };

  const { data: regulations = [], isLoading } = useQuery({
    queryKey: ['regulations', filters],
    queryFn: () => fetchRegulations(filters),
    staleTime: 30_000,
  });

  const { data: stats } = useQuery({
    queryKey: ['regulation-stats'],
    queryFn: fetchRegulationStats,
    staleTime: 60_000,
  });

  const toggleCategory = (c: RegCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  };

  const toggleSeverity = (s: RegSeverity) => {
    setSelectedSeverities((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const hasActiveFilters =
    search || selectedCategories.length || selectedSeverities.length || frameworkFilter;

  const clearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedSeverities([]);
    setFrameworkFilter('');
  };

  return (
    <div className="flex flex-col h-full bg-canvas">
      <PageHeader
        title="Mevzuat Kütüphanesi"
        subtitle="Bankacılık mevzuatı, regülasyon dokümanları ve uyum kaynakları"
        icon={BookOpen}
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* İstatistik Kartları */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<BookOpen size={20} className="text-blue-600" />}
              bg="bg-blue-50"
              label="Toplam Mevzuat"
              value={stats?.total ?? '—'}
              sub="Kayıtlı düzenleme"
            />
            <StatCard
              icon={<CheckCircle2 size={20} className="text-emerald-600" />}
              bg="bg-emerald-50"
              label="Aktif"
              value={stats?.active ?? '—'}
              sub="Yürürlükte olan"
            />
            <StatCard
              icon={<AlertTriangle size={20} className="text-red-600" />}
              bg="bg-red-50"
              label="Kritik Seviye"
              value={stats?.critical ?? '—'}
              sub="Yüksek öncelikli"
            />
            <StatCard
              icon={<Archive size={20} className="text-amber-600" />}
              bg="bg-amber-50"
              label="Arşivlenen"
              value={stats?.pending_review ?? '—'}
              sub="Pasife alınan"
            />
          </div>

          {/* Araç Çubuğu */}
          <div className="bg-surface border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              {/* Arama */}
              <div className="relative flex-1 min-w-52">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Kod, başlık veya açıklama ile ara..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-canvas
                             placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent font-sans"
                />
              </div>

              {/* Aktif/Pasif Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setShowInactive(!showInactive)}
                  className={clsx(
                    'w-9 h-5 rounded-full transition-colors relative',
                    showInactive ? 'bg-slate-400' : 'bg-blue-600',
                  )}
                >
                  <div className={clsx(
                    'w-4 h-4 rounded-full bg-surface shadow absolute top-0.5 transition-transform',
                    showInactive ? 'translate-x-4' : 'translate-x-0.5',
                  )} />
                </div>
                <span className="text-xs text-slate-600 font-sans">
                  {showInactive ? 'Tümü' : 'Yalnızca Aktif'}
                </span>
              </label>

              {/* Filtre Butonu */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors font-sans',
                  showFilters || hasActiveFilters
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-canvas border-slate-200 text-slate-600 hover:border-slate-300',
                )}
              >
                <Filter size={13} />
                Filtrele
                {hasActiveFilters && (
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center">
                    {selectedCategories.length + selectedSeverities.length + (search ? 1 : 0) + (frameworkFilter ? 1 : 0)}
                  </span>
                )}
                {showFilters ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>

              <div className="flex items-center gap-2 ml-auto">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-700 hover:bg-canvas border border-slate-200 transition-colors font-sans"
                  >
                    <X size={12} /> Temizle
                  </button>
                )}
                <button
                  onClick={() => { setEditTarget(undefined); setShowFormModal(true); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors font-sans"
                >
                  <Plus size={14} />
                  Yeni Mevzuat
                </button>
              </div>
            </div>

            {/* Genişletilebilir Filtre Paneli */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-4">
                    {/* Kategori Filtresi */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-sans">
                        Kategori
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {ALL_CATEGORIES.map((c) => (
                          <button
                            key={c}
                            onClick={() => toggleCategory(c)}
                            className={clsx(
                              'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors font-sans',
                              selectedCategories.includes(c)
                                ? CATEGORY_COLORS[c]
                                : 'bg-canvas border-slate-200 text-slate-600 hover:border-slate-300',
                            )}
                          >
                            {CATEGORY_LABELS[c]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ciddiyet Filtresi */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-sans">
                        Ciddiyet
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {ALL_SEVERITIES.map((s) => (
                          <button
                            key={s}
                            onClick={() => toggleSeverity(s)}
                            className={clsx(
                              'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors font-sans',
                              selectedSeverities.includes(s)
                                ? SEVERITY_COLORS[s]
                                : 'bg-canvas border-slate-200 text-slate-600 hover:border-slate-300',
                            )}
                          >
                            {SEVERITY_LABELS[s]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Çerçeve Filtresi */}
                    <div className="max-w-xs">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-sans">
                        Çerçeve (Framework)
                      </p>
                      <input
                        type="text"
                        value={frameworkFilter}
                        onChange={(e) => setFrameworkFilter(e.target.value)}
                        placeholder="GIAS2024, Basel III..."
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700
                                   bg-canvas focus:outline-none focus:ring-2 focus:ring-blue-400 font-sans placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tablo */}
          <div className="bg-surface border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-slate-400" />
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide font-sans">
                  Mevzuat Listesi
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-sans">
                {isLoading ? 'Yükleniyor...' : `${regulations.length} kayıt`}
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16 gap-2">
                <Loader2 size={18} className="animate-spin text-blue-500" />
                <span className="text-sm text-slate-500 font-sans">Mevzuatlar yükleniyor...</span>
              </div>
            ) : regulations.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen size={36} className="mx-auto text-slate-200 mb-3" />
                <p className="text-sm font-semibold text-slate-400 font-sans">
                  {hasActiveFilters ? 'Filtreyle eşleşen mevzuat bulunamadı.' : 'Henüz mevzuat kaydı yok.'}
                </p>
                {!hasActiveFilters && (
                  <button
                    onClick={() => { setEditTarget(undefined); setShowFormModal(true); }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors font-sans"
                  >
                    <Plus size={12} className="inline mr-1.5" />
                    İlk Mevzuatı Ekle
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-canvas/60">
                      {['Kod', 'Kategori', 'Başlık', 'Ciddiyet', 'Çerçeve', 'Dokümanlar', 'Durum', 'İşlemler'].map((h) => (
                        <th key={h}
                            className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {regulations.map((reg) => (
                      <RegulationRow
                        key={reg.id}
                        reg={reg}
                        onEdit={(r) => { setEditTarget(r); setShowFormModal(true); }}
                        onUpload={(r) => setUploadTarget(r)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Kategori Renk Açıklaması */}
          <div className="flex flex-wrap items-center gap-3 px-2">
            <span className="text-[10px] text-slate-400 font-sans">Kategoriler:</span>
            {ALL_CATEGORIES.map((c) => (
              <span key={c} className={clsx(
                'inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border font-sans',
                CATEGORY_COLORS[c],
              )}>
                {CATEGORY_LABELS[c]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Modallar */}
      <AnimatePresence>
        {showFormModal && (
          <RegFormModal
            existing={editTarget}
            onClose={() => { setShowFormModal(false); setEditTarget(undefined); }}
          />
        )}
        {uploadTarget && (
          <DocumentUploadModal
            regulation={uploadTarget}
            onClose={() => setUploadTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({
  icon, bg, label, value, sub,
}: {
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: number | string;
  sub: string;
}) {
  return (
    <div className="bg-surface rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-3">
        <div className={clsx('p-2.5 rounded-lg', bg)}>{icon}</div>
        <h3 className="text-xs font-semibold text-slate-600 font-sans">{label}</h3>
      </div>
      <p className="text-2xl font-bold text-primary tabular-nums font-sans">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5 font-sans">{sub}</p>
    </div>
  );
}
