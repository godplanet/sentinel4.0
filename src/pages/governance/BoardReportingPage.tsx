/**
 * Yönetim Kurulu (Board) Raporlama — C-Level iPad Sunumu.
 * 4 sekmeli Executive Panel; mock yok, tüm veri Supabase'den.
 * GIAS 2024 / BDDK uyumlu.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/ui';
import {
  ClipboardCheck,
  AlertTriangle,
  ArrowUpCircle,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  ChevronRight,
  Vote,
} from 'lucide-react';
import clsx from 'clsx';
import {
  useAuditExecutionStats,
  useCriticalFindings,
  useBoardEscalations,
  type AuditExecutionStat,
  type CriticalFindingRow,
  type BoardEscalationRow,
} from '@/features/reporting/api/useBoardBriefing';
import { ResolutionDeck } from '@/widgets/ResolutionDeck';
import { useResolutions } from '@/features/board-voting/api';

type TabId = 'execution' | 'findings' | 'escalations' | 'qaip' | 'resolutions';

const TABS: { id: TabId; label: string; shortLabel: string; icon: typeof ClipboardCheck }[] = [
  { id: 'execution',   label: 'İcra ve Güvence',                                         shortLabel: 'İcra',       icon: ClipboardCheck },
  { id: 'findings',   label: 'Önemli (Kritik, Yüksek Seviyeli) Bulgular',               shortLabel: 'Bulgular',   icon: AlertTriangle },
  { id: 'escalations', label: 'YK Eskalasyonları',                                       shortLabel: 'Eskalasyonlar', icon: ArrowUpCircle },
  { id: 'qaip',       label: 'QAIP ve Bağımsızlık',                                     shortLabel: 'QAIP',       icon: ShieldCheck },
  { id: 'resolutions', label: 'E-Oylama & Kararlar',                                    shortLabel: 'Kararlar',   icon: Vote },
];

const STATUS_LABELS: Record<string, string> = {
  PLANNED: 'Planlandı',
  IN_PROGRESS: 'Devam Ediyor',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
};

function ExecutionTab() {
  const { data: stats = [], isLoading, isError } = useAuditExecutionStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-6 text-center">
        <p className="text-sm text-amber-800">Denetim istatistikleri yüklenirken bir hata oluştu.</p>
      </div>
    );
  }
  if (stats.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-8 text-center">
        <ClipboardCheck className="mx-auto w-10 h-10 text-slate-300 mb-3" />
        <p className="text-sm text-slate-600">Bu dönem için raporlanacak denetim icra verisi bulunmamaktadır.</p>
      </div>
    );
  }

  const total = stats.reduce((s, x) => s + x.count, 0);
  const completed = stats.find((s) => s.status === 'COMPLETED')?.count ?? 0;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-5 py-4 flex flex-wrap items-center justify-between gap-4">
        <span className="text-sm font-medium text-slate-600">Toplam denetim</span>
        <span className="text-2xl font-bold text-slate-800">{total}</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">Tamamlanma oranı</span>
          <span className={clsx(
            'text-lg font-bold tabular-nums',
            completionRate >= 80 ? 'text-emerald-600' : completionRate >= 50 ? 'text-amber-600' : 'text-slate-700'
          )}>
            %{completionRate}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat: AuditExecutionStat) => (
          <div
            key={stat.status}
            className="rounded-xl border border-slate-200 bg-surface p-5 shadow-sm"
          >
            <div className="text-2xl font-bold text-slate-800 tracking-tight">
              {stat.count}
            </div>
            <div className="text-sm text-slate-600 mt-0.5">
              {STATUS_LABELS[stat.status] ?? stat.status}
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${total ? (stat.count / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FindingsTab() {
  const navigate = useNavigate();
  const { data: findings = [], isLoading, isError } = useCriticalFindings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-6 text-center">
        <p className="text-sm text-amber-800">Kritik bulgular yüklenirken bir hata oluştu.</p>
      </div>
    );
  }
  if (findings.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-8 text-center">
        <CheckCircle2 className="mx-auto w-10 h-10 text-emerald-400 mb-3" />
        <p className="text-sm text-slate-600 font-medium">
          Bu dönem için raporlanacak kritik bulgu bulunmamaktadır.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {findings.map((f: CriticalFindingRow) => (
        <button
          type="button"
          key={f.id}
          onClick={() => navigate(`/execution/findings/${f.id}`)}
          className={clsx(
            'group w-full text-left rounded-xl border p-5 shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            f.severity === 'CRITICAL'
              ? 'border-red-300 bg-red-50/90 hover:bg-red-50'
              : 'border-rose-200 bg-rose-50/80 hover:bg-rose-50'
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={clsx(
                    'text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded',
                    f.severity === 'CRITICAL' ? 'bg-red-200 text-red-900' : 'bg-rose-200 text-rose-900'
                  )}
                >
                  {f.severity}
                </span>
                <span className="text-xs text-slate-500">{f.status}</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 leading-snug">
                {f.title}
              </h3>
              {(f.institution ?? f.engagement_title) && (
                <p className="text-sm text-slate-600 mt-1">
                  {f.institution ?? f.engagement_title}
                </p>
              )}
            </div>
            <span className="flex-shrink-0 text-slate-400 group-hover:text-blue-600 transition-colors" aria-hidden>
              <ChevronRight size={20} />
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 group-hover:text-blue-600 transition-colors">Detay için tıklayın</p>
        </button>
      ))}
    </div>
  );
}

function EscalationsTab() {
  const { data: escalations = [], isLoading, isError } = useBoardEscalations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-6 text-center">
        <p className="text-sm text-amber-800">Eskalasyon verileri yüklenirken bir hata oluştu.</p>
      </div>
    );
  }
  if (escalations.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-8 text-center">
        <ArrowUpCircle className="mx-auto w-10 h-10 text-slate-300 mb-3" />
        <p className="text-sm text-slate-600 font-medium">
          Başdenetçi tarafından kurula arz edilen aksiyon gecikmesi bulunmamaktadır.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-surface overflow-hidden shadow-sm">
      <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10">
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Aksiyon</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Hedef Tarih</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Durum</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Tetiklenme</th>
            </tr>
          </thead>
          <tbody>
            {escalations.map((e: BoardEscalationRow) => (
              <tr key={e.id} className="border-b border-slate-100 last:border-0">
                <td className="py-3 px-4">
                  <div className="font-medium text-slate-800">{e.action_title}</div>
                  {e.finding_title && (
                    <div className="text-xs text-slate-500 mt-0.5">{e.finding_title}</div>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-600">
                  {e.current_due_date
                    ? new Date(e.current_due_date).toLocaleDateString('tr-TR')
                    : '—'}
                </td>
                <td className="py-3 px-4 text-slate-600">{e.status || '—'}</td>
                <td className="py-3 px-4 text-slate-600">
                  {new Date(e.triggered_at).toLocaleDateString('tr-TR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const INDEPENDENCE_STATEMENT = `
İç Denetim Birimi, görevini yerine getirirken bağımsızlık ve tarafsızlık ilkelerine uygun hareket etmektedir. Yönetim Kurulu ve Genel Müdürlük ile doğrudan raporlama hattı korunmakta; denetim kapsamı, kaynakları ve çalışma programı müdahaleye açık olmayacak şekilde yapılandırılmıştır. GIAS 2024 ve BDDK düzenlemeleri çerçevesinde objektif değerlendirme ve mesleki özen gösterilmektedir.
`.trim();

function QaipTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-surface p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-800 mb-3">İç Denetim Bağımsızlık Beyanı</h3>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {INDEPENDENCE_STATEMENT}
        </p>
      </div>
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-emerald-900">QAIP Durumu</h3>
          <p className="text-sm text-emerald-800 mt-1">
            Kalite Güvence ve İyileştirme Programı (QAIP) kapsamında değerlendirmeler yürütülmekte olup, bağımsızlık ve etik kurallara uyum periyodik olarak gözden geçirilmektedir.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BoardReportingPage() {
  const [activeTab, setActiveTab] = useState<TabId>('execution');

  const { data: executionStats = [] } = useAuditExecutionStats();
  const { data: criticalFindings = [] } = useCriticalFindings();
  const { data: escalations = [] } = useBoardEscalations();
  const { data: resolutions = [] } = useResolutions();

  const totalEngagements = executionStats.reduce((s, x) => s + x.count, 0);
  const criticalCount = criticalFindings.length;
  const escalationCount = escalations.length;
  const openResolutionCount = (resolutions || []).filter(r => r?.status === 'OPEN').length;

  return (
    <div className="min-h-screen bg-canvas w-full">
      <div className="w-full px-4 py-6">
        <div className="sticky top-0 z-20 bg-canvas/95 backdrop-blur-md border-b border-slate-200 -mx-4 px-4 pt-2 pb-4">
          <PageHeader
            title="Yönetim Kurulu Raporlama"
            description="YK'ya sunulan icra özeti, kritik bulgular ve eskalasyonlar — C-Level panel"
            badge="GIAS 2024 / BDDK"
          />

          <div className="flex flex-wrap items-center gap-4 mt-4 py-3 px-4 rounded-xl bg-surface border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Denetim</span>
              <span className="text-lg font-bold text-slate-800 tabular-nums">{totalEngagements}</span>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Kritik bulgu</span>
              <span className={clsx('text-lg font-bold tabular-nums', criticalCount ? 'text-red-600' : 'text-slate-700')}>
                {criticalCount}
              </span>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">YK eskalasyonu</span>
              <span className={clsx('text-lg font-bold tabular-nums', escalationCount ? 'text-amber-600' : 'text-slate-700')}>
                {escalationCount}
              </span>
            </div>
          </div>

          <div className="border-b border-slate-200 bg-surface rounded-t-xl overflow-hidden mt-4">
            <div className="flex flex-wrap gap-0">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const count =
                  tab.id === 'execution' ? totalEngagements
                  : tab.id === 'findings' ? criticalCount
                  : tab.id === 'escalations' ? escalationCount
                  : tab.id === 'resolutions' ? openResolutionCount
                  : null;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="board-panel"
                    id={`tab-${tab.id}`}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50/50'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                    )}
                  >
                    <Icon size={18} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                    {count !== null && count > 0 && (
                      <span
                        className={clsx(
                          'min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center',
                          isActive ? 'bg-blue-200 text-blue-800' : 'bg-slate-200 text-slate-700'
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          id="board-panel"
          className="rounded-b-xl border border-t-0 border-slate-200 bg-surface shadow-sm p-6 min-h-[320px] w-full"
        >
          {activeTab === 'execution'   && <ExecutionTab />}
          {activeTab === 'findings'     && <FindingsTab />}
          {activeTab === 'escalations'  && <EscalationsTab />}
          {activeTab === 'qaip'         && <QaipTab />}
          {activeTab === 'resolutions'  && <ResolutionDeck />}
        </div>
      </div>
    </div>
  );
}
