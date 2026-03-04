/**
 * Rapor Kartı — Tek doğru kaynak: public.reports tablosu
 * Sihirli Link, Amend, REVOKED_AMENDED damgası. Mock yok.
 */

import { useState } from 'react';
import {
  Clock, Eye, CheckCircle, FileText, AlertTriangle, Edit3, Link2, BookOpen,
  X, Loader2, ChevronDown, ChevronUp, Copy, Check, FileWarning, Lock, Ban,
  type LucideIcon,
} from 'lucide-react';
import clsx from 'clsx';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  createMagicLink,
  fetchReadReceipts,
  fetchMagicLinks,
} from '../api/magic-link-api';
import { ReportAmendmentModal } from './ReportAmendmentModal';
import { usePersonaStore } from '@/entities/user/model/persona-store';
import type { ReportListItem } from '../api/reports-api';

interface ReportCardProps {
  report: ReportListItem;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  draft: { label: 'Taslak', color: 'bg-slate-100 text-slate-600', icon: Clock },
  review: { label: 'İncelemede', color: 'bg-blue-100 text-blue-700', icon: AlertTriangle },
  published: { label: 'Yayınlandı', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  archived: { label: 'Arşiv', color: 'bg-slate-200 text-slate-500', icon: FileText },
  REVOKED_AMENDED: { label: 'İptal — Zeyilname', color: 'bg-red-100 text-red-700', icon: Ban },
};

/** Sihirli Link + Erişim Logları alt paneli */
function MagicLinkPanel({ reportId }: { reportId: string }) {
  const queryClient = useQueryClient();
  const currentPersona = usePersonaStore((s) => s.currentPersona);
  const [recipientName, setRecipientName] = useState('');
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const { data: readReceipts = [], isLoading: loadingReceipts } = useQuery({
    queryKey: ['read-receipts', reportId],
    queryFn: () => fetchReadReceipts(reportId),
    staleTime: 30_000,
  });

  const { data: magicLinks = [], isLoading: loadingLinks } = useQuery({
    queryKey: ['magic-links', reportId],
    queryFn: () => fetchMagicLinks(reportId),
    staleTime: 30_000,
  });

  const createLinkMutation = useMutation({
    mutationFn: () =>
      createMagicLink({
        reportId,
        recipientName: recipientName.trim() || undefined,
        createdByName: currentPersona ?? 'CAE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['magic-links', reportId] });
      setRecipientName('');
    },
  });

  const handleCopy = (token: string, linkId: string) => {
    const url = `${window.location.origin}/report-view/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLinkId(linkId);
      setTimeout(() => setCopiedLinkId(null), 2000);
    });
  };

  return (
    <div className="px-5 py-4 border-t border-slate-100 bg-canvas/30 space-y-4">
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-sans">
          Sihirli Link Gönder (PDF göndermek yasaktır)
        </p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Alıcı adı (Yön. Krl. Üyesi...)"
            className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-sans
                       text-slate-700 bg-surface focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <button
            onClick={() => createLinkMutation.mutate()}
            disabled={createLinkMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700
                       text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 font-sans"
          >
            {createLinkMutation.isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Link2 size={12} />
            )}
            Link Oluştur
          </button>
        </div>
      </div>

      {(loadingLinks || magicLinks.length > 0) && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-sans">
            Oluşturulan Linkler
          </p>
          {loadingLinks ? (
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <Loader2 size={10} className="animate-spin" /> Yükleniyor...
            </div>
          ) : (
            magicLinks.slice(0, 3).map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between gap-2 py-1"
              >
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-600 font-sans">
                    {link.recipient_name ?? 'İsimsiz alıcı'}
                  </span>
                  <span className="ml-2 font-mono text-[9px] text-slate-400">
                    {link.access_token.slice(0, 16)}...
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(link.access_token, link.id)}
                  className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 transition-colors shrink-0"
                >
                  {copiedLinkId === link.id ? (
                    <><Check size={10} className="text-emerald-500" /> Kopyalandı</>
                  ) : (
                    <><Copy size={10} /> Kopyala</>
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-sans">
          Erişim Logları (Adli Okundu Zırhı)
        </p>
        {loadingReceipts ? (
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <Loader2 size={10} className="animate-spin" /> Log kaydı yükleniyor...
          </div>
        ) : readReceipts.length === 0 ? (
          <p className="text-[10px] text-slate-400 italic font-sans">
            Henüz erişim kaydı yok. Rapor linke tıklandığında log tutulacaktır.
          </p>
        ) : (
          <div className="space-y-1">
            {readReceipts.map((receipt) => (
              <div
                key={receipt.id}
                className="flex items-center gap-2 py-1 border-b border-slate-100 last:border-0"
              >
                <BookOpen size={10} className="text-emerald-500 shrink-0" />
                <p className="text-[10px] text-slate-600 font-sans">
                  <strong>{receipt.reader_name ?? 'Anonim kullanıcı'}</strong>,{' '}
                  <span className="text-slate-500">
                    {new Date(receipt.read_at).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}{' '}
                    saat{' '}
                    {new Date(receipt.read_at).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>{' '}
                  itibarıyla bu raporu okudu.
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ReportCard({ report, onView, onEdit }: ReportCardProps) {
  const statusCfg = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.draft;
  const StatusIcon = statusCfg.icon;

  const isRevoked = report.status === 'REVOKED_AMENDED';
  const isPublished =
    report.status === 'published' || (report.locked_at != null && report.locked_at !== '');
  const isLocked = isPublished;

  const [showMagicPanel, setShowMagicPanel] = useState(false);
  const [amendmentModalOpen, setAmendmentModalOpen] = useState(false);

  const cardBorderClass = isRevoked
    ? 'border-t-red-500'
    : isPublished
      ? 'border-t-emerald-500'
      : 'border-t-slate-200';

  const cardBgClass = isRevoked ? 'bg-red-50/30' : isLocked ? 'bg-emerald-50/30' : 'bg-surface';

  return (
    <div
      className={clsx(
        'rounded-2xl border border-t-4 overflow-hidden flex flex-col transition-all duration-200',
        cardBgClass,
        isRevoked ? 'border-red-200' : isLocked ? 'border-emerald-200' : 'border-slate-200',
        cardBorderClass,
        !isRevoked && 'hover:shadow-lg hover:border-slate-300',
      )}
    >
      {/* Durum + Versiyon */}
      <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-slate-400 flex-shrink-0" />
          {report.engagement_title && (
            <span className="text-xs font-sans text-slate-500 truncate max-w-[140px]" title={report.engagement_title}>
              {report.engagement_title}
            </span>
          )}
          {report.version > 1 && (
            <span className="text-[10px] font-sans text-slate-400">v{report.version}</span>
          )}
        </div>
        <span
          className={clsx(
            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-sans font-semibold flex-shrink-0',
            statusCfg.color,
          )}
        >
          <StatusIcon size={10} />
          {statusCfg.label}
        </span>
      </div>

      {/* Başlık + Açıklama */}
      <div className={clsx('px-5 pb-3 flex-1', isRevoked && 'opacity-75')}>
        <h3
          className={clsx(
            'font-sans font-bold text-primary text-sm leading-snug line-clamp-2 mb-1.5',
            isRevoked && 'line-through text-slate-500',
          )}
        >
          {report.title}
        </h3>
        <p className="text-xs font-sans text-slate-400 line-clamp-2">
          {report.description?.trim()
            ? report.description.slice(0, 100) + (report.description.length > 100 ? '...' : '')
            : 'Taslak rapor — açıklama henüz girilmemiş.'}
        </p>
      </div>

      {/* REVOKED damgası */}
      {isRevoked && (
        <div className="px-5 py-2 bg-red-100/80 border-y border-red-200 flex items-center gap-2">
          <Ban size={14} className="text-red-600 flex-shrink-0" />
          <span className="text-xs font-sans font-semibold text-red-700">
            İPTAL EDİLDİ — ZEYİLNAME YAYINLANDI
          </span>
        </div>
      )}

      {/* Tarih */}
      <div className="px-5 py-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="text-xs font-sans text-slate-500">
          Oluşturulma: {new Date(report.created_at).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
        {isLocked && report.locked_at && (
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-sans">
            <Lock size={10} />
            Mühürlü
          </span>
        )}
      </div>

      {/* Aksiyon Butonları */}
      <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-2 bg-canvas/50">
        <button
          onClick={() => onView(report.id)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-sans font-semibold rounded-lg transition-colors"
        >
          <Eye size={12} />
          Görüntüle
        </button>
        <button
          onClick={() => onEdit(report.id)}
          disabled={isPublished || isRevoked}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 border text-xs font-sans font-semibold rounded-lg transition-colors',
            isPublished || isRevoked
              ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-surface'
              : 'border-slate-300 text-slate-700 hover:bg-slate-100 bg-surface',
          )}
        >
          <Edit3 size={12} />
          Düzenle
        </button>

        {/* GIAS: Düzeltme — sadece yayınlanmış; REVOKED_AMENDED kartında YOK */}
        {isPublished && !isRevoked && (
          <button
            onClick={() => setAmendmentModalOpen(true)}
            title="GIAS: Hata bildir ve düzeltme versiyonu (zeyilname) oluştur"
            className="flex items-center gap-1 px-2.5 py-1.5 border border-amber-300 rounded-lg text-xs font-semibold
                       text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors font-sans"
          >
            <FileWarning size={12} />
            Düzeltme
          </button>
        )}
        {/* Sihirli Link — yalnızca yayınlanmış ve iptal edilmemiş */}
        {isPublished && !isRevoked && (
          <button
            onClick={() => setShowMagicPanel(!showMagicPanel)}
            title="Sihirli Link Gönder / Erişim Logları"
            className={clsx(
              'flex items-center gap-1 px-2.5 py-1.5 border rounded-lg text-xs font-semibold transition-colors font-sans',
              showMagicPanel
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-surface border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600',
            )}
          >
            <Link2 size={12} />
            {showMagicPanel ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>
        )}
      </div>

      {amendmentModalOpen && (
        <ReportAmendmentModal
          reportId={report.id}
          reportTitle={report.title}
          onClose={() => setAmendmentModalOpen(false)}
        />
      )}

      <AnimatePresence>
        {showMagicPanel && isPublished && !isRevoked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <MagicLinkPanel reportId={report.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
