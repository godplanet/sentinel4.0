import { useEffect, useMemo, useState } from 'react';
import {
  RefreshCw,
  AlertCircle,
  Database,
  Lock,
  ShieldAlert,
  CheckCircle2,
  Clock,
  User,
  FileText,
  Target,
  Lightbulb,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import { fetchFindingsByEngagement } from '@/entities/finding/api/supabase-api';
import type { ComprehensiveFinding } from '@/entities/finding/model/types';
import { useFindingStore } from '@/entities/finding/model/store';
import { useActiveReportStore } from '@/entities/report';
import type { FindingRefBlock } from '@/entities/report';

// ─── SHARED HELPERS ────────────────────────────────────────────────────────────

const SEVERITY_BORDER: Record<string, string> = {
  CRITICAL: 'border-l-[5px] border-red-500',
  HIGH: 'border-l-[5px] border-orange-500',
  MEDIUM: 'border-l-[5px] border-amber-400',
  LOW: 'border-l-[5px] border-emerald-500',
  OBSERVATION: 'border-l-[5px] border-slate-400',
};

const SEVERITY_BADGE: Record<string, string> = {
  CRITICAL: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  HIGH: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
  MEDIUM: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  LOW: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  OBSERVATION: 'bg-slate-50 text-slate-600 ring-1 ring-slate-200',
};

const SEVERITY_LABEL: Record<string, string> = {
  CRITICAL: 'Kritik',
  HIGH: 'Yüksek',
  MEDIUM: 'Orta',
  LOW: 'Düşük',
  OBSERVATION: 'Gözlem',
};

const ACTION_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  IN_REVIEW: 'bg-blue-50 text-blue-700',
  APPROVED: 'bg-emerald-50 text-emerald-700',
  IN_PROGRESS: 'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  OVERDUE: 'bg-red-50 text-red-700',
};

const ACTION_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Taslak',
  IN_REVIEW: 'İncelemede',
  APPROVED: 'Onaylandı',
  IN_PROGRESS: 'Devam Ediyor',
  COMPLETED: 'Tamamlandı',
  OVERDUE: 'Gecikmiş',
};

const STATE_LABELS: Record<string, string> = {
  DRAFT: 'Taslak',
  IN_REVIEW: 'Gözden Geçirilıyor',
  NEEDS_REVISION: 'Revizyon Gerekli',
  PUBLISHED: 'Yayınlandı',
  NEGOTIATION: 'Müzakerede',
  PENDING_APPROVAL: 'Onay Bekliyor',
  FOLLOW_UP: 'Takipte',
  CLOSED: 'Kapatıldı',
  FINAL: 'Nihai',
  REMEDIATED: 'Giderildi',
  DISPUTED: 'İtiraz Edildi',
  DISPUTING: 'İtiraz Sürecinde',
};

const stripHtml = (html?: string): string => {
  if (!html) return '';
  const el = document.createElement('div');
  el.innerHTML = html;
  return (el.textContent || el.innerText || '').trim();
};

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr || dateStr === 'TBD') return 'Belirlenmedi';
  try {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const getSeverityBadge = (severity: string): { color: string; label: string } => {
  const upper = severity.toUpperCase();
  switch (upper) {
    case 'CRITICAL': return { color: 'bg-rose-600 text-white', label: 'KRİTİK' };
    case 'HIGH': return { color: 'bg-orange-500 text-white', label: 'YÜKSEK' };
    case 'MEDIUM': return { color: 'bg-amber-500 text-white', label: 'ORTA' };
    case 'LOW': return { color: 'bg-emerald-500 text-white', label: 'DÜŞÜK' };
    case 'OBSERVATION': return { color: 'bg-slate-400 text-white', label: 'GÖZLEM' };
    default: return { color: 'bg-slate-400 text-white', label: severity };
  }
};

// Field extraction helpers that handle both naming conventions
// (Finding interface fields and supabase-api mapped fields)
const getCondition = (f: ComprehensiveFinding): string =>
  stripHtml(f.detection_html ?? (f as any).condition ?? f.description ?? '');

const getCriteria = (f: ComprehensiveFinding): string =>
  stripHtml(f.criteria_text ?? (f as any).criteria ?? '');

const getCause = (f: ComprehensiveFinding): string =>
  stripHtml(f.cause_text ?? (f as any).cause ?? '');

const getImpact = (f: ComprehensiveFinding): string =>
  stripHtml(f.impact_html ?? (f as any).consequence ?? '');

const getRecommendation = (f: ComprehensiveFinding): string =>
  stripHtml(f.recommendation_html ?? (f as any).corrective_action ?? '');

// ─── SECTION LABEL COMPONENT ──────────────────────────────────────────────────

function FieldSection({
  label,
  icon: Icon,
  iconColor,
  content,
}: {
  label: string;
  icon: React.ElementType;
  iconColor: string;
  content: string;
}) {
  if (!content) return null;
  return (
    <div className="py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={11} className={iconColor} />
        <p className="font-sans text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
          {label}
        </p>
      </div>
      <p className="font-serif text-sm text-slate-700 leading-relaxed">{content}</p>
    </div>
  );
}

// ─── DYNAMIC FINDINGS TABLE BLOCK ────────────────────────────────────────────

interface DynamicFindingsBlockProps {
  engagementId?: string;
  onRemove?: () => void;
  readOnly?: boolean;
  filterBySeverity?: string[];
}

export function DynamicFindingsBlock({
  engagementId,
  onRemove,
  readOnly = false,
  filterBySeverity,
}: DynamicFindingsBlockProps) {
  const [findings, setFindings] = useState<ComprehensiveFinding[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFindings = async () => {
    if (!engagementId) {
      setError('Engagement seçilmedi');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFindingsByEngagement(engagementId);
      const filtered =
        filterBySeverity && filterBySeverity.length > 0
          ? data.filter((f) => filterBySeverity.includes(f.severity))
          : data;
      setFindings(filtered);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Bulgular yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFindings();
  }, [engagementId, filterBySeverity?.join(',')]);

  if (!engagementId) {
    return (
      <div className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl p-8 text-center">
        <Database className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-600 mb-2">Veri Kaynağı Bekleniyor</h3>
        <p className="text-sm text-slate-500">
          Bulgular tablosunu görmek için bir engagement seçin.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-2 border-dashed border-rose-300 bg-rose-50 rounded-xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-rose-900 mb-2">Hata Oluştu</h3>
        <p className="text-sm text-rose-700 mb-4">{error}</p>
        <button
          onClick={loadFindings}
          className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="relative report-finding-block print:break-inside-avoid">
      {!readOnly && (
        <div className="flex items-center justify-between mb-4 p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Database className="w-4 h-4" />
              <span className="font-medium">Canlı Veri</span>
            </div>
            {lastUpdated && (
              <span className="text-xs text-blue-600">
                Güncelleme: {lastUpdated.toLocaleTimeString('tr-TR')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadFindings}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Yenileniyor...' : 'Yenile'}
            </button>
            {onRemove && (
              <button
                onClick={onRemove}
                className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-white border border-rose-300 rounded-lg hover:bg-rose-50 transition-colors"
              >
                Kaldır
              </button>
            )}
          </div>
        </div>
      )}

      {loading && !findings.length ? (
        <div className="text-center py-12 bg-white/50 rounded-xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-600 font-medium">Bulgular yükleniyor...</p>
        </div>
      ) : findings.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500 italic">Bu engagement için bulgu bulunamadı</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-100 to-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide border-b border-slate-200">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide border-b border-slate-200">Bulgu</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide border-b border-slate-200">Şiddet</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide border-b border-slate-200">Kök Neden</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide border-b border-slate-200">Öneri</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide border-b border-slate-200">Hedef Tarih</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((finding, index) => {
                const severityBadge = getSeverityBadge(finding.severity);
                const actionTarget = finding.action_plans?.[0]?.target_date;
                return (
                  <tr key={finding.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 border-b border-slate-200">{index + 1}</td>
                    <td className="px-4 py-3 text-sm border-b border-slate-200">
                      <div className="font-semibold text-slate-900">{finding.title}</div>
                      <div className="text-xs text-slate-600 mt-1 line-clamp-2">{getCondition(finding)}</div>
                    </td>
                    <td className="px-4 py-3 text-center border-b border-slate-200">
                      <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${severityBadge.color}`}>
                        {severityBadge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 border-b border-slate-200 max-w-xs">
                      <div className="line-clamp-2">{getCause(finding) || 'Belirtilmedi'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 border-b border-slate-200 max-w-xs">
                      <div className="line-clamp-2">{getRecommendation(finding) || 'Belirtilmedi'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 text-center border-b border-slate-200">
                      {formatDate(actionTarget ?? (finding as any).target_date)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {findings.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>Toplam {findings.length} bulgu</span>
          {filterBySeverity && filterBySeverity.length > 0 && (
            <span className="text-blue-600 font-medium">Filtre: {filterBySeverity.join(', ')}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── DYNAMIC STATISTICS BLOCK ────────────────────────────────────────────────

export function DynamicStatisticsBlock({ engagementId }: { engagementId?: string }) {
  const [findings, setFindings] = useState<ComprehensiveFinding[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!engagementId) return;
    setLoading(true);
    fetchFindingsByEngagement(engagementId)
      .then(setFindings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [engagementId]);

  if (!engagementId) {
    return (
      <div className="text-center p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
        <Database className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-600 font-medium">İstatistik için engagement seçin</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8 bg-white/50 rounded-xl border border-slate-200">
        <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
      </div>
    );
  }

  const stats = {
    critical: findings.filter((f) => f.severity === 'CRITICAL').length,
    high: findings.filter((f) => f.severity === 'HIGH').length,
    medium: findings.filter((f) => f.severity === 'MEDIUM').length,
    low: findings.filter((f) => f.severity === 'LOW').length,
    observation: findings.filter((f) => f.severity === 'OBSERVATION').length,
  };

  return (
    <div className="grid grid-cols-4 gap-4 my-6">
      <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-5 text-center shadow-sm">
        <div className="text-4xl font-bold text-rose-700 mb-1">{stats.critical}</div>
        <div className="text-xs text-rose-600 font-semibold uppercase tracking-wide">Kritik</div>
      </div>
      <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-5 text-center shadow-sm">
        <div className="text-4xl font-bold text-orange-700 mb-1">{stats.high}</div>
        <div className="text-xs text-orange-600 font-semibold uppercase tracking-wide">Yüksek</div>
      </div>
      <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 text-center shadow-sm">
        <div className="text-4xl font-bold text-amber-700 mb-1">{stats.medium}</div>
        <div className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Orta</div>
      </div>
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-5 text-center shadow-sm">
        <div className="text-4xl font-bold text-emerald-700 mb-1">{stats.low}</div>
        <div className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Düşük</div>
      </div>
    </div>
  );
}

// ─── LIVE FINDING REF BLOCK ───────────────────────────────────────────────────
// Rapordaki bir bulguyu TÜM detaylarıyla (5C + aksiyon planları) gösterir.

export function LiveFindingRefBlock({ block }: { block: FindingRefBlock }) {
  const findings = useFindingStore((s) => s.findings);
  const activeReport = useActiveReportStore((s) => s.activeReport);

  const finding = useMemo(
    () => findings.find((f) => f.id === block.content.findingId),
    [findings, block.content.findingId],
  );

  const isPublished = activeReport?.status === 'published';
  const hasSnapshot = Boolean(block.snapshotData);

  if (isPublished && hasSnapshot) {
    return (
      <div className="border border-slate-200 rounded-xl bg-white shadow-sm mb-6 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-100">
          <Lock size={12} className="text-slate-400" />
          <span className="text-xs font-sans text-slate-400 uppercase tracking-wider font-semibold">
            Dondurulmuş Veri — Yayın Anı Fotoğrafı
          </span>
        </div>
        <div className="p-5">
          <p className="font-serif text-base text-slate-500 italic">
            Bu blok yayın anında dondurulmuştur. Canlı bulgu verisi görüntülenemiyor.
          </p>
        </div>
      </div>
    );
  }

  if (!finding) {
    return (
      <div className="flex items-start gap-3 border border-slate-200 rounded-xl bg-white p-5 mb-6 shadow-sm">
        <ShieldAlert size={20} className="text-slate-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-sans text-sm font-semibold text-slate-600">Bulgu Bulunamadı</p>
          <p className="font-sans text-xs text-slate-400 mt-0.5">
            Referans verilen bulgu (
            <span className="font-mono text-xs">{block.content.findingId}</span>) bu rapora ait
            denetimde mevcut değil.
          </p>
        </div>
      </div>
    );
  }

  const severityKey = (finding.severity ?? 'LOW').toUpperCase();
  const borderClass = SEVERITY_BORDER[severityKey] ?? 'border-l-[5px] border-slate-300';
  const badgeClass = SEVERITY_BADGE[severityKey] ?? 'bg-slate-50 text-slate-600 ring-1 ring-slate-200';
  const severityLabel = SEVERITY_LABEL[severityKey] ?? severityKey;
  const stateLabel = STATE_LABELS[finding.state ?? ''] ?? finding.state ?? '';

  const condition = getCondition(finding);
  const criteria = getCriteria(finding);
  const cause = getCause(finding);
  const impact = getImpact(finding);
  const recommendation = getRecommendation(finding);

  const actionPlans = finding.action_plans ?? [];
  const findingCode = finding.finding_code ?? finding.code ?? '';

  const bddk = (finding as any).bddk_deficiency_type;

  return (
    <div
      className={`${borderClass} report-finding-block print:break-inside-avoid border border-slate-200 rounded-r-xl bg-white shadow-sm mb-6 overflow-hidden`}
    >
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-serif text-lg font-bold text-slate-900 leading-snug flex-1">
            {finding.title}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            {finding.impact_score != null && (
              <span className="font-sans text-xs font-medium text-slate-500">
                WIF{' '}
                <span className="font-bold text-slate-900 text-sm">
                  {finding.impact_score.toFixed(1)}
                </span>
              </span>
            )}
            <span
              className={`font-sans text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}
            >
              {severityLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {findingCode && (
            <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {findingCode}
            </span>
          )}
          {stateLabel && (
            <span className="font-sans text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {stateLabel}
            </span>
          )}
          {bddk && (
            <span className="font-sans text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
              BDDK: {bddk}
            </span>
          )}
        </div>
      </div>

      {/* ── 5C FIELDS ───────────────────────────────────────────── */}
      <div className="px-5 border-t border-slate-100">
        <FieldSection
          label="Mevcut Durum (Tespit)"
          icon={Activity}
          iconColor="text-slate-400"
          content={condition}
        />
        <FieldSection
          label="Kriter (Standart / Politika)"
          icon={FileText}
          iconColor="text-blue-400"
          content={criteria}
        />
        <FieldSection
          label="Kök Neden"
          icon={Target}
          iconColor="text-orange-400"
          content={cause}
        />
        <FieldSection
          label="Risk / Etki"
          icon={AlertTriangle}
          iconColor="text-red-400"
          content={impact}
        />
        <FieldSection
          label="Öneri"
          icon={Lightbulb}
          iconColor="text-emerald-500"
          content={recommendation}
        />
      </div>

      {/* ── ACTION PLANS ────────────────────────────────────────── */}
      {actionPlans.length > 0 && (
        <div className="px-5 pt-3 pb-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-1.5 mb-3">
            <CheckCircle2 size={12} className="text-slate-400" />
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Aksiyon Planları ({actionPlans.length})
            </p>
          </div>
          <div className="space-y-3">
            {actionPlans.map((plan, idx) => {
              const statusColor =
                ACTION_STATUS_COLORS[plan.status] ?? 'bg-slate-100 text-slate-600';
              const statusLabel =
                ACTION_STATUS_LABELS[plan.status] ?? plan.status;
              return (
                <div
                  key={plan.id ?? idx}
                  className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-sans text-sm font-semibold text-slate-800 leading-snug flex-1">
                      {plan.title || plan.description}
                    </p>
                    <span
                      className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  {plan.description && plan.title && plan.description !== plan.title && (
                    <p className="font-sans text-xs text-slate-600 leading-relaxed mb-2">
                      {plan.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-2">
                    {plan.responsible_person && (
                      <div className="flex items-center gap-1.5">
                        <User size={11} className="text-slate-400" />
                        <span className="font-sans text-xs text-slate-700 font-medium">
                          {plan.responsible_person}
                          {plan.responsible_person_title && (
                            <span className="text-slate-400 font-normal">
                              {' '}— {plan.responsible_person_title}
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    {plan.target_date && (
                      <div className="flex items-center gap-1.5">
                        <Clock size={11} className="text-slate-400" />
                        <span className="font-sans text-xs text-slate-600">
                          {formatDate(plan.target_date)}
                        </span>
                      </div>
                    )}
                    {plan.progress_percentage != null && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-sans text-xs text-slate-500">
                          %{plan.progress_percentage} tamamlandı
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── AUDITOR NOTES (internal, hidden in blind mode) ───────── */}
      {!block.content.blindMode &&
        (finding.secrets?.internal_notes ||
          finding.secrets?.root_cause_analysis_internal) && (
          <div className="bg-amber-50/50 border-t border-amber-100 px-5 py-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Lock size={11} className="text-amber-500" />
              <p className="font-sans text-[10px] font-bold uppercase tracking-[0.08em] text-amber-600">
                Denetçi İç Notları (Gizli)
              </p>
            </div>
            <p className="font-sans text-sm text-amber-900 leading-relaxed">
              {finding.secrets?.internal_notes ??
                finding.secrets?.root_cause_analysis_internal}
            </p>
          </div>
        )}
    </div>
  );
}
