import { useMemo } from 'react';
import {
  X,
  GitBranch,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  ChevronRight,
  Hash,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import clsx from 'clsx';
import { useActiveReportStore } from '@/entities/report';
import { useFindingStore } from '@/entities/finding/model/store';
import type { M6Report, FindingRefBlock } from '@/entities/report';
import type { ComprehensiveFinding } from '@/entities/finding/model/types';

interface TraceabilityDrawerProps {
  open?: boolean;
  onClose?: () => void;
  sourceId?: string | null;
}

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  CRITICAL: { label: 'Kritik', color: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-600' },
  HIGH:     { label: 'Yüksek', color: 'text-orange-700', bg: 'bg-orange-50', dot: 'bg-orange-500' },
  MEDIUM:   { label: 'Orta',   color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-400' },
  LOW:      { label: 'Düşük',  color: 'text-green-700', bg: 'bg-green-50', dot: 'bg-green-500' },
};

function SeverityBadge({ severity }: { severity: string }) {
  const cfg = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.MEDIUM;
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-bold', cfg.bg, cfg.color)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function TrendIcon({ trend }: { trend: number }) {
  if (trend > 0) return <TrendingDown size={13} className="text-red-500" />;
  if (trend < 0) return <TrendingUp size={13} className="text-green-500" />;
  return <Minus size={13} className="text-slate-400" />;
}

function ThreadNode({
  icon,
  color,
  label,
  title,
  subtitle,
  isLast = false,
  children,
}: {
  icon: React.ReactNode;
  color: string;
  label: string;
  title: string;
  subtitle?: string;
  isLast?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white', color)}>
          {icon}
        </div>
        {!isLast && <div className="w-px flex-1 bg-slate-200 mt-1" />}
      </div>
      <div className={clsx('flex-1 pb-5', isLast ? '' : '')}>
        <div className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400 mb-0.5">{label}</div>
        <div className="text-sm font-sans font-semibold text-slate-800 leading-tight">{title}</div>
        {subtitle && <div className="text-xs font-sans text-slate-500 mt-0.5">{subtitle}</div>}
        {children && <div className="mt-2">{children}</div>}
      </div>
    </div>
  );
}

function extractFindingIds(report: M6Report): string[] {
  const ids: string[] = [];
  for (const section of report.sections) {
    for (const block of section.blocks) {
      if (block.type === 'finding_ref') {
        ids.push((block as FindingRefBlock).content.findingId);
      }
    }
  }
  return [...new Set(ids)];
}

function GradeCircle({ score, grade }: { score: number; grade: string }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color =
    score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444';

  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} stroke="#e2e8f0" strokeWidth="4" fill="none" />
        <circle
          cx="24" cy="24" r={r}
          stroke={color} strokeWidth="4" fill="none"
          strokeDasharray={`${fill} ${circ - fill}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-sans font-bold text-slate-700">{grade}</span>
        <span className="text-[8px] text-slate-400">{score.toFixed(0)}</span>
      </div>
    </div>
  );
}

export function TraceabilityDrawer({ open, onClose }: TraceabilityDrawerProps) {
  if (open === false) return null;
  const { activeReport } = useActiveReportStore();
  const findings = useFindingStore((s) => s.findings);

  const findingIds = useMemo(() =>
    activeReport ? extractFindingIds(activeReport) : [],
    [activeReport]
  );

  const linkedFindings = useMemo<ComprehensiveFinding[]>(() =>
    findings.filter((f) => findingIds.includes(f.id)),
    [findings, findingIds]
  );

  const severityCounts = useMemo(() => {
    const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    linkedFindings.forEach((f) => {
      const s = f.severity as keyof typeof counts;
      if (s in counts) counts[s]++;
    });
    return counts;
  }, [linkedFindings]);

  const totalActionPlans = useMemo(() =>
    linkedFindings.reduce((sum, f) => sum + (f.action_plans?.length ?? 0), 0),
    [linkedFindings]
  );

  if (!activeReport) return null;

  const es = activeReport.executiveSummary;

  return (
      <div className="flex flex-col h-full bg-white border-l border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                  <GitBranch size={15} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="text-sm font-sans font-bold text-slate-900">Altın İplik</h2>
                  <p className="text-[10px] text-slate-400 font-sans">İzlenebilirlik Zinciri</p>
                </div>
              </div>
              <button
                onClick={() => onClose?.()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-5 border-b border-slate-100 bg-slate-50">
                <div className="flex items-start gap-3">
                  <GradeCircle score={es.score ?? 0} grade={es.grade ?? '—'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-sans text-slate-500 mb-1">Denetim Skoru</p>
                    <p className="text-sm font-sans font-bold text-slate-900 truncate">{activeReport.title}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <TrendIcon trend={es.trend ?? 0} />
                      <span className="text-xs text-slate-500 font-sans">Önceki: {es.previousGrade ?? '—'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{es.briefingNote}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 mt-3">
                  {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
                    <div key={sev} className={clsx('rounded-lg p-2 text-center', SEVERITY_CONFIG[sev].bg)}>
                      <div className={clsx('text-lg font-sans font-bold', SEVERITY_CONFIG[sev].color)}>
                        {severityCounts[sev]}
                      </div>
                      <div className={clsx('text-[9px] font-sans font-semibold', SEVERITY_CONFIG[sev].color)}>
                        {SEVERITY_CONFIG[sev].label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5">
                <p className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400 mb-4">
                  Zincir Haritası
                </p>

                <div className="space-y-0">
                  <ThreadNode
                    icon={<Target size={14} className="text-white" />}
                    color="bg-blue-500"
                    label="Denetim Kapsamı"
                    title={activeReport.title}
                    subtitle={`${activeReport.sections.length} bölüm • ${activeReport.sections.reduce((s, sec) => s + sec.blocks.length, 0)} blok`}
                  >
                    <div className="flex gap-1.5 flex-wrap">
                      {activeReport.sections.map((sec) => (
                        <span
                          key={sec.id}
                          className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-sans font-medium"
                        >
                          {sec.title}
                        </span>
                      ))}
                    </div>
                  </ThreadNode>

                  <ThreadNode
                    icon={<AlertTriangle size={14} className="text-white" />}
                    color="bg-red-500"
                    label="Bulgular"
                    title={`${linkedFindings.length} Bağlantılı Bulgu`}
                    subtitle={`${totalActionPlans} aksiyon planı`}
                  >
                    <div className="space-y-2">
                      {linkedFindings.map((finding) => (
                        <div key={finding.id} className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-xs font-sans font-semibold text-slate-800 line-clamp-2 leading-tight">
                              {finding.title}
                            </span>
                            <SeverityBadge severity={finding.severity} />
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-sans">
                            <Hash size={10} />
                            <span>{finding.code ?? finding.finding_code ?? finding.id.slice(0, 8)}</span>
                            <span>•</span>
                            <span>{finding.state}</span>
                          </div>
                          {(finding.action_plans?.length ?? 0) > 0 && (
                            <div className="mt-1.5 space-y-1">
                              {finding.action_plans.slice(0, 2).map((ap: any, i: number) => (
                                <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-600 font-sans">
                                  <ChevronRight size={9} className="text-slate-300" />
                                  <span className="truncate">{ap.description ?? ap.title ?? 'Aksiyon'}</span>
                                </div>
                              ))}
                              {(finding.action_plans?.length ?? 0) > 2 && (
                                <div className="text-[10px] text-slate-400 font-sans pl-3.5">
                                  +{(finding.action_plans?.length ?? 0) - 2} daha
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      {linkedFindings.length === 0 && (
                        <p className="text-xs text-slate-400 font-sans italic">Henüz bulgu bağlanmadı</p>
                      )}
                    </div>
                  </ThreadNode>

                  <ThreadNode
                    icon={<Shield size={14} className="text-white" />}
                    color="bg-emerald-500"
                    label="Onay Zinciri"
                    title={`Durum: ${stateLabel(activeReport.status)}`}
                    subtitle={activeReport.publishedAt ? `Yayın: ${new Date(activeReport.publishedAt).toLocaleDateString('tr-TR')}` : 'Henüz yayınlanmadı'}
                  />

                  <ThreadNode
                    icon={<FileText size={14} className="text-white" />}
                    color="bg-slate-500"
                    label="İzlenebilirlik Kaydı"
                    title="Bütünlük Mührü"
                    subtitle={activeReport.hashSeal ? activeReport.hashSeal.slice(0, 20) + '…' : 'Henüz imzalanmadı'}
                    isLast
                  >
                    {activeReport.hashSeal && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <CheckCircle2 size={11} className="text-emerald-500" />
                        <span className="text-[10px] text-emerald-600 font-sans font-semibold">SHA-256 doğrulandı</span>
                      </div>
                    )}
                    {!activeReport.hashSeal && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock size={11} className="text-slate-400" />
                        <span className="text-[10px] text-slate-400 font-sans">Yayınlama sonrası oluşturulacak</span>
                      </div>
                    )}
                  </ThreadNode>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 px-5 py-3 border-t border-slate-100 bg-slate-50">
              <p className="text-[10px] text-slate-400 font-sans text-center">
                Son güncelleme: {new Date(activeReport.updatedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
      </div>
  );
}

function stateLabel(status: string): string {
  const map: Record<string, string> = {
    draft: 'Taslak',
    in_review: 'İncelemede',
    cae_review: 'CAE Onayında',
    published: 'Yayında',
    archived: 'Arşiv',
  };
  return map[status] ?? status;
}
