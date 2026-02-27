import {
  Clock,
  Eye,
  CheckCircle,
  FileText,
  AlertTriangle,
  Building2,
  Scale,
  BarChart2,
  User,
  AlertCircle,
  Edit3,
  type LucideIcon,
} from 'lucide-react';
import clsx from 'clsx';

export interface ReportCardData {
  id: string;
  title: string;
  status: string;
  report_type: string | null;
  risk_level: string | null;
  auditor_name: string | null;
  finding_count: number;
  created_at: string;
  executive_summary: any;
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
  archived: { label: 'Arşiv', color: 'bg-slate-200 text-slate-500', icon: FileText },
};

const TYPE_CONFIG: Record<string, { label: string; icon: LucideIcon }> = {
  investigation: { label: 'Soruşturma', icon: AlertTriangle },
  branch_audit: { label: 'Şube Denetimi', icon: Building2 },
  compliance: { label: 'Uyum Raporu', icon: Scale },
  executive: { label: 'Yönetici Sunumu', icon: BarChart2 },
  blank: { label: 'Denetim Raporu', icon: FileText },
};

export function ReportCard({ report, onView, onEdit }: ReportCardProps) {
  const statusCfg = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.draft;
  const StatusIcon = statusCfg.icon;

  const riskLevel = report.risk_level ?? 'medium';
  const riskBadge = RISK_BADGE[riskLevel] ?? RISK_BADGE.medium;
  const stripeClass = RISK_STRIPE[riskLevel] ?? 'border-t-slate-200';

  const typeCfg = TYPE_CONFIG[report.report_type ?? 'blank'] ?? TYPE_CONFIG.blank;
  const TypeIcon = typeCfg.icon;

  const isPublished = report.status === 'published';

  const findingCount =
    report.finding_count ??
    Object.values(report.executive_summary?.findingCounts ?? {}).reduce(
      (a: number, b: unknown) => a + (typeof b === 'number' ? b : 0),
      0,
    );

  return (
    <div
      className={clsx(
        'bg-white rounded-2xl border border-slate-200 border-t-4 overflow-hidden',
        'hover:shadow-lg hover:border-slate-300 transition-all duration-200 flex flex-col',
        stripeClass,
      )}
    >
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

      <div className="px-5 pb-3 flex-1">
        <h3 className="font-sans font-bold text-slate-900 text-sm leading-snug line-clamp-2 mb-1.5">
          {report.title}
        </h3>
        <p className="text-xs font-sans text-slate-400 line-clamp-2">
          {report.executive_summary?.sections?.auditOpinion
            ? report.executive_summary.sections.auditOpinion.slice(0, 80) + '...'
            : 'Taslak rapor — içerik henüz girilmemiş.'}
        </p>
      </div>

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
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex-shrink-0">
            #{report.hash_seal.slice(0, 6)}
          </span>
        )}
      </div>

      <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-2 bg-slate-50/50">
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
              ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-white'
              : 'border-slate-300 text-slate-700 hover:bg-slate-100 bg-white',
          )}
        >
          <Edit3 size={12} />
          Düzenle
        </button>
      </div>
    </div>
  );
}
