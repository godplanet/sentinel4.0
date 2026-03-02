/**
 * Rapor Kartı — Sihirli Link + Adli Okundu Zırhı
 *
 * BDDK gizlilik kuralı: Raporlar PDF olarak mail ile GÖNDERİLEMEZ.
 * Bunun yerine token tabanlı "Sihirli Link" mekanizması kullanılır.
 * Erişim logları: "Görmedim" bahanesi adli delille çürütülür.
 */

import { useState } from 'react';
import {
  Clock, Eye, CheckCircle, FileText, AlertTriangle, Building2,
  Scale, BarChart2, User, AlertCircle, Edit3, Link2, BookOpen,
  X, Loader2, ChevronDown, ChevronUp, Copy, Check,
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
import { usePersonaStore } from '@/entities/user/model/persona-store';

export interface ReportCardData {
  id: string;
  title: string;
  status: string;
  report_type: string | null;
  risk_level: string | null;
  auditor_name: string | null;
  finding_count: number;
  created_at: string;
  executive_summary: Record<string, unknown>;
  hash_seal: string | null;
}

interface ReportCardProps {
  report: ReportCardData;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}

const RISK_STRIPE: Record<string, string> = {
  critical: 'border-t-[#700000]',
  high: 'border-t-[#eb0000]',
  medium: 'border-t-[#ff960a]',
  low: 'border-t-[#FFD700]',
};

const RISK_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-[#700000]', label: 'Kritik Risk' },
  high: { bg: 'bg-red-50', text: 'text-red-600', label: 'Yüksek Risk' },
  medium: { bg: 'bg-orange-50', text: 'text-orange-600', label: 'Orta Risk' },
  low: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Düşük Risk' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  draft: { label: 'Taslak', color: 'bg-slate-100 text-slate-600', icon: Clock },
  in_review: { label: 'İncelemede', color: 'bg-amber-100 text-amber-700', icon: Eye },
  cae_review: { label: 'CAE Onayı', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
  published: { label: 'Yayınlandı', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  PUBLISHED: { label: 'Yayınlandı', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  archived: { label: 'Arşiv', color: 'bg-slate-200 text-slate-500', icon: FileText },
};

const TYPE_CONFIG: Record<string, { label: string; icon: LucideIcon }> = {
  investigation: { label: 'Soruşturma', icon: AlertTriangle },
  branch_audit: { label: 'Şube Denetimi', icon: Building2 },
  compliance: { label: 'Uyum Raporu', icon: Scale },
  executive: { label: 'Yönetici Sunumu', icon: BarChart2 },
  blank: { label: 'Denetim Raporu', icon: FileText },
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
      {/* Yeni Link Oluştur */}
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

      {/* Mevcut Linkler */}
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

      {/* Erişim Logları — Adli Okundu Zırhı */}
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

  const riskLevel = report.risk_level ?? 'medium';
  const riskBadge = RISK_BADGE[riskLevel] ?? RISK_BADGE.medium;
  const stripeClass = RISK_STRIPE[riskLevel] ?? 'border-t-slate-200';

  const typeCfg = TYPE_CONFIG[report.report_type ?? 'blank'] ?? TYPE_CONFIG.blank;
  const TypeIcon = typeCfg.icon;

  const isPublished =
    report.status === 'published' || report.status === 'PUBLISHED';

  const [showMagicPanel, setShowMagicPanel] = useState(false);

  const findingCount =
    report.finding_count ??
    Object.values(
      (report.executive_summary as Record<string, Record<string, unknown>>)?.findingCounts ?? {}
    ).reduce((a: number, b: unknown) => a + (typeof b === 'number' ? b : 0), 0);

  return (
    <div
      className={clsx(
        'bg-surface rounded-2xl border border-slate-200 border-t-4 overflow-hidden',
        'hover:shadow-lg hover:border-slate-300 transition-all duration-200 flex flex-col',
        stripeClass,
      )}
    >
      {/* Tür + Durum */}
      <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <TypeIcon size={14} className="text-slate-400 flex-shrink-0" />
          <span className="text-xs font-sans text-slate-500 font-medium">{typeCfg.label}</span>
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

      {/* Başlık + Özet */}
      <div className="px-5 pb-3 flex-1">
        <h3 className="font-sans font-bold text-primary text-sm leading-snug line-clamp-2 mb-1.5">
          {report.title}
        </h3>
        <p className="text-xs font-sans text-slate-400 line-clamp-2">
          {(report.executive_summary as Record<string, Record<string, string>>)?.sections?.auditOpinion
            ? String((report.executive_summary as Record<string, Record<string, string>>).sections.auditOpinion).slice(0, 80) + '...'
            : 'Taslak rapor — içerik henüz girilmemiş.'}
        </p>
      </div>

      {/* Denetçi + Tarih */}
      <div className="px-5 py-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-sans text-slate-500 min-w-0">
          <User size={12} className="flex-shrink-0 text-slate-400" />
          <span className="truncate">{report.auditor_name ?? 'Denetçi'}</span>
        </div>
        <span className="text-xs font-sans text-slate-400 flex-shrink-0">
          {new Date(report.created_at).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </div>

      {/* Bulgu Sayısı + Hash */}
      <div className="px-5 py-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <AlertCircle size={12} className="text-red-400" />
            <span className="text-xs font-sans text-slate-600 font-medium">
              {findingCount} Bulgu
            </span>
          </div>
          <span
            className={clsx(
              'inline-block px-2 py-0.5 rounded text-[11px] font-sans font-semibold',
              riskBadge.bg,
              riskBadge.text,
            )}
          >
            {riskBadge.label}
          </span>
        </div>

        {isPublished && report.hash_seal && (
          <span
            title={`SHA-256: ${report.hash_seal}`}
            className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex-shrink-0 cursor-help"
          >
            #{report.hash_seal.slice(0, 6)}
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
          disabled={isPublished}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 border text-xs font-sans font-semibold rounded-lg transition-colors',
            isPublished
              ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-surface'
              : 'border-slate-300 text-slate-700 hover:bg-slate-100 bg-surface',
          )}
        >
          <Edit3 size={12} />
          Düzenle
        </button>

        {/* Sihirli Link Butonu — yalnızca yayınlanmış raporlarda */}
        {isPublished && (
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

      {/* Sihirli Link + Erişim Logları Paneli */}
      <AnimatePresence>
        {showMagicPanel && isPublished && (
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
