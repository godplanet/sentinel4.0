/**
 * TranslationPanel — Wave 45: AI Report Translator
 * Rapor bölümlerini Supabase'e kayıtlı çevirilerle gösterir.
 * %100 Light Mode | Apple Glassmorphism | Real Supabase
 */

import { useState } from 'react';
import { Languages, CheckCircle2, Clock, Loader2, Trash2, Plus, RefreshCw, BookOpen } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import {
  useTranslations,
  useTranslateReport,
  useReviewTranslation,
  useDeleteTranslation,
  type SupportedLanguage,
  type ReportTranslation,
} from '@/features/localization/translation-api';

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  tr: '🇹🇷 Türkçe',
  en: '🇬🇧 English',
  ar: '🇸🇦 العربية',
  fr: '🇫🇷 Français',
  de: '🇩🇪 Deutsch',
};

const SECTION_LABELS: Record<string, string> = {
  executive_summary: 'Yönetici Özeti',
  findings:          'Bulgular',
  recommendations:   'Öneriler',
  scope:             'Kapsam',
  manual:            'Manuel',
};

interface TranslationPanelProps {
  reportId: string;
  reportTitle?: string;
}

export function TranslationPanel({ reportId, reportTitle }: TranslationPanelProps) {
  const [targetLang, setTargetLang] = useState<SupportedLanguage>('en');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSourceText, setNewSourceText] = useState('');
  const [newSectionKey, setNewSectionKey] = useState('executive_summary');

  const { data: translations = [], isLoading, refetch } = useTranslations(reportId, targetLang);
  const translateMutation  = useTranslateReport();
  const reviewMutation     = useReviewTranslation();
  const deleteMutation     = useDeleteTranslation();

  const handleTranslate = async () => {
    if (!newSourceText?.trim()) return;
    try {
      await translateMutation.mutateAsync({
        reportId,
        sourceText: newSourceText.trim(),
        sectionKey: newSectionKey,
        targetLang,
      });
      toast.success('Çeviri Supabase\'e kaydedildi.');
      setNewSourceText('');
      setShowAddForm(false);
    } catch (err) {
      toast.error('Çeviri kaydedilemedi: ' + ((err as Error)?.message ?? 'Bilinmeyen hata'));
    }
  };

  const handleReview = async (id: string) => {
    try {
      await reviewMutation.mutateAsync({ id, reviewedBy: 'İç Denetim Ekibi' });
      toast.success('Çeviri onaylandı.');
    } catch {
      toast.error('Onay işlemi başarısız.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu çeviriyi silmek istediğinizden emin misiniz?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Çeviri silindi.');
    } catch {
      toast.error('Silme işlemi başarısız.');
    }
  };

  const reviewedCount   = (translations ?? []).filter(t => t.is_reviewed).length;
  const pendingCount    = (translations ?? []).length - reviewedCount;

  return (
    <div className="bg-white/80 backdrop-blur-lg border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-violet-50 to-blue-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center">
            <Languages size={18} className="text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">AI Rapor Çevirmeni</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {reportTitle ? `«${reportTitle}»` : 'Rapor'} — Wave 45
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language selector */}
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value as SupportedLanguage)}
            className="text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
          >
            {(Object.entries(LANGUAGE_LABELS) as [SupportedLanguage, string][]).map(([code, label]) => (
              code !== 'tr' && <option key={code} value={code}>{label}</option>
            ))}
          </select>

          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="Yenile"
          >
            <RefreshCw size={14} />
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-colors"
          >
            <Plus size={12} />
            Çevir
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-5 py-2.5 bg-white/50 border-b border-slate-100 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
          <CheckCircle2 size={12} />
          {reviewedCount} Onaylı
        </span>
        {pendingCount > 0 && (
          <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
            <Clock size={12} />
            {pendingCount} İncelemede
          </span>
        )}
        <span className="text-slate-400 ml-auto">
          {LANGUAGE_LABELS[targetLang]}
        </span>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="px-5 py-4 bg-violet-50/60 border-b border-violet-100 space-y-3">
          <div className="flex items-center gap-2">
            <select
              value={newSectionKey}
              onChange={(e) => setNewSectionKey(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
            >
              {Object.entries(SECTION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <textarea
            value={newSourceText}
            onChange={(e) => setNewSourceText(e.target.value)}
            rows={3}
            placeholder="Çevrilecek Türkçe metni buraya yazın..."
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleTranslate}
              disabled={!newSourceText?.trim() || translateMutation.isPending}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {translateMutation.isPending
                ? <Loader2 size={12} className="animate-spin" />
                : <Languages size={12} />
              }
              Çevir & Kaydet
            </button>
          </div>
        </div>
      )}

      {/* Translation list */}
      <div className="divide-y divide-slate-100">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 size={16} className="animate-spin text-violet-500" />
              Çeviriler yükleniyor...
            </div>
          </div>
        ) : (translations ?? []).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen size={36} className="text-slate-200 mb-3" />
            <p className="text-sm font-semibold text-slate-600">Bu dil için çeviri bulunamadı</p>
            <p className="text-xs text-slate-400 mt-1">
              Yukarıdaki "Çevir" butonunu kullanarak yeni çeviri ekleyin
            </p>
          </div>
        ) : (
          (translations ?? []).map((t: ReportTranslation) => (
            <TranslationRow
              key={t.id}
              translation={t}
              onReview={() => handleReview(t.id)}
              onDelete={() => handleDelete(t.id)}
              isReviewing={reviewMutation.isPending && reviewMutation.variables?.id === t.id}
              isDeleting={deleteMutation.isPending && deleteMutation.variables === t.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Row component ─────────────────────────────────────────────────────────

function TranslationRow({
  translation: t,
  onReview,
  onDelete,
  isReviewing,
  isDeleting,
}: {
  translation: ReportTranslation;
  onReview: () => void;
  onDelete: () => void;
  isReviewing: boolean;
  isDeleting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={clsx(
      'px-5 py-4 hover:bg-slate-50/70 transition-colors group',
      t.is_reviewed && 'bg-emerald-50/20'
    )}>
      {/* Section + status */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {SECTION_LABELS[t.section_key ?? 'manual'] ?? t.section_key}
          </span>
          {t.is_reviewed ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={9} />
              Onaylı
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              <Clock size={9} />
              İncelemede
            </span>
          )}
          {t.confidence_score && (
            <span className="text-[10px] text-slate-400">
              Güven: {((t.confidence_score ?? 0) * 100).toFixed(1)}%
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {!t.is_reviewed && (
            <button
              onClick={onReview}
              disabled={isReviewing}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-emerald-600 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
            >
              {isReviewing ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle2 size={10} />}
              Onayla
            </button>
          )}
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
          >
            {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
          </button>
        </div>
      </div>

      {/* Source text preview */}
      <p className="text-[11px] text-slate-500 mb-2 italic line-clamp-1">
        TR: {t.source_text?.slice(0, 100) ?? '—'}
      </p>

      {/* Translated text */}
      <p className={clsx(
        'text-sm text-slate-700 leading-relaxed',
        !expanded && 'line-clamp-2'
      )}>
        {t.translated_text}
      </p>

      {(t.translated_text?.length ?? 0) > 120 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[10px] text-violet-600 font-semibold mt-1 hover:underline"
        >
          {expanded ? 'Daha az göster' : 'Tamamını göster'}
        </button>
      )}

      {/* Model + date footer */}
      <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
        <span>{t.translation_model ?? 'AI Model'}</span>
        <span>{new Date(t.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </div>
    </div>
  );
}
