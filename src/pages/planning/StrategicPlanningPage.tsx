import { useState } from 'react';
import { PageHeader } from '@/shared/ui';
import { UniverseScoring } from '@/widgets/UniverseScoring';
import { PlanAdherence } from '@/widgets/PlanAdherence';
import { RollingPlanBoard } from '@/features/planning/ui/RollingPlanBoard';
import { PlanListView } from '@/features/planning/ui/PlanListView';
import { AnnualPlanView } from '@/features/planning/ui/AnnualPlanView';
import { CCMSignalSimulator } from '@/features/ccm/ui/CCMSignalSimulator';
import { BDDKPackageModal } from '@/features/bddk-export/BDDKPackageModal';
import { fetchEngagementsList, fetchEntitiesSimple, fetchActivePlan } from '@/entities/planning/api/queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import NewEngagementModal from '@/features/planning/ui/NewEngagementModal';
import { usePlanningStore } from '@/entities/planning/model/store';
import toast from 'react-hot-toast';
import {
  LayoutGrid,
  Target,
  GitBranch,
  FileText,
  Plus,
  Eye,
  Edit2,
  Gauge,
  Lock,
  Loader2,
  ShieldAlert,
  List,
  Kanban,
  Calendar,
  CalendarRange,
  Package,
} from 'lucide-react';

type TabId = 'universe' | 'rolling' | 'annual' | 'list' | 'adherence';
type PlanMode = 'mode1_core' | 'mode2_agile';

interface AuditEngagement {
  id: string;
  title: string;
  audit_type: string;
  status: string;
  start_date: string;
  end_date: string;
  assigned_auditor_id?: string;
  entity_id?: string;
  estimated_hours?: number;
  risk_snapshot_score?: number;
}

export default function StrategicPlanningPage() {
  const [activeTab, setActiveTab] = useState<TabId>('rolling');
  const [planMode, setPlanMode] = useState<PlanMode>('mode2_agile');
  const [showAddEngagementModal, setShowAddEngagementModal] = useState(false);
  const [showBDDKModal, setShowBDDKModal] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { closeAuditEngagement } = usePlanningStore();

  const handleCloseEngagement = async (engagementId: string, engagementTitle: string) => {
    setClosingId(engagementId);
    const toastId = toast.loading(`"${engagementTitle}" kapatılıyor — QAIP kontrolü...`);
    try {
      const result = await closeAuditEngagement(engagementId, null);
      toast.dismiss(toastId);

      if (!result.success) {
        toast.error(result.message, { duration: 6000, icon: '🚫' });
        return;
      }

      if (result.gateResult.status === 'WARN') {
        toast(result.message, { icon: '⚠️', duration: 5000 });
      } else {
        toast.success(result.message, { duration: 5000 });
      }

      queryClient.invalidateQueries({ queryKey: ['audit-engagements-list'] });
    } catch {
      toast.dismiss(toastId);
      toast.error('Kapatma işlemi başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setClosingId(null);
    }
  };

  const tabs = [
    { id: 'universe' as const,  label: 'Risk Evreni & Puanlama', icon: Target,        color: 'blue' },
    { id: 'rolling' as const,   label: 'Bimodal Rolling Plan',   icon: GitBranch,     color: 'indigo' },
    { id: 'annual' as const,    label: 'Yıllık Plan',            icon: CalendarRange, color: 'sky' },
    { id: 'list' as const,      label: 'Denetim Listesi',        icon: FileText,      color: 'teal' },
    { id: 'adherence' as const, label: 'Plan Uyumu',             icon: Gauge,         color: 'amber' },
  ];

  const { data: engagements = [], isLoading: loadingEngagements } = useQuery({
    queryKey: ['audit-engagements-list'],
    queryFn: () => fetchEngagementsList(),
    enabled: activeTab === 'list',
  });

  const { data: entities = [] } = useQuery({
    queryKey: ['audit-entities-simple'],
    queryFn: () => fetchEntitiesSimple(),
    enabled: activeTab === 'list' || showAddEngagementModal,
  });

  const { data: activePlan, isLoading: isLoadingPlan } = useQuery({
    queryKey: ['active-audit-plan'],
    queryFn: () => fetchActivePlan(),
    staleTime: 30_000,
  });

  return (
    <div className="min-h-screen bg-canvas">
      <PageHeader
        title="Bimodal Stratejik Planlama"
        description="Risk evreninden Q-Sprint'e — dinamik 3+9 aylık denetim programı"
        icon={LayoutGrid}
        action={
          <button
            onClick={() => setShowBDDKModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-surface/80 backdrop-blur-xl border border-white/20 text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 rounded-xl text-sm font-semibold shadow-sm transition-all duration-150"
            title="BDDK'ya sunulacak yıllık denetim paketi oluştur"
          >
            <Package size={15} />
            BDDK Paketi Oluştur
          </button>
        }
      />

      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-surface/80 backdrop-blur-xl rounded-lg border border-slate-200 p-2 flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg
                  font-semibold text-sm transition-all
                  ${
                    isActive
                      ? tab.color === 'blue'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : tab.color === 'indigo'
                          ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                          : tab.color === 'sky'
                            ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-500/30'
                            : tab.color === 'amber'
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30'
                              : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30'
                      : 'bg-transparent text-slate-600 hover:bg-canvas'
                  }
                `}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-surface/80 backdrop-blur-xl rounded-lg border border-slate-200 overflow-hidden shadow-lg">
          {activeTab === 'universe' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-primary mb-2">Risk Evreni Skorlaması</h2>
                <p className="text-slate-600">
                  Score audit universe entities based on impact and likelihood to drive risk-based planning
                </p>
              </div>
              <UniverseScoring />
            </div>
          )}

          {activeTab === 'rolling' && (
            <div className="flex flex-col">
              {/* Mode Toggle Action Bar */}
              <div className="px-6 py-4 bg-gradient-to-r from-canvas to-surface border-b border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setPlanMode('mode1_core')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                      planMode === 'mode1_core'
                        ? 'bg-surface text-slate-800 shadow-sm border border-slate-200'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <List size={15} />
                    Mode 1: Core Assurance
                  </button>
                  <button
                    onClick={() => setPlanMode('mode2_agile')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                      planMode === 'mode2_agile'
                        ? 'bg-surface text-indigo-700 shadow-sm border border-indigo-200'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Kanban size={15} />
                    Mode 2: Agile Sprints
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-surface border border-slate-200 rounded-lg px-3 py-2">
                    <GitBranch size={12} className="text-slate-400" />
                    3+9 Model
                  </div>
                  <button
                    onClick={() => setShowAddEngagementModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-150"
                  >
                    <Plus size={15} />
                    Yeni Görev
                  </button>
                </div>
              </div>

              {/* Mode Content */}
              <div className="p-6 flex flex-col gap-8">
                {planMode === 'mode1_core' ? (
                  <PlanListView />
                ) : (
                  <>
                    <CCMSignalSimulator />
                    <RollingPlanBoard />
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'annual' && (
            <AnnualPlanView />
          )}

          {activeTab === 'adherence' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-primary mb-2">Plan Uyumu Takibi</h2>
                <p className="text-slate-600">
                  Yıllık denetim planının gerçekleşme oranı, sapma analizi ve performans izleme
                </p>
              </div>
              <PlanAdherence />
            </div>
          )}

          {activeTab === 'list' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-2">Denetim Görevleri Listesi</h2>
                  <p className="text-slate-600">
                    Comprehensive list view of all planned and active audit engagements
                  </p>
                </div>
                <button
                  onClick={() => setShowAddEngagementModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all font-medium"
                >
                  <Plus size={18} />
                  <span>Yeni Denetim Planla</span>
                </button>
              </div>

              {loadingEngagements ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600" />
                  <span className="ml-3 text-slate-600">Loading engagements...</span>
                </div>
              ) : engagements.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="mx-auto mb-4 text-slate-400" size={48} />
                  <p className="text-lg text-slate-600">No audit engagements planned yet</p>
                  <p className="text-sm text-slate-500 mt-1">Click "Yeni Denetim Planla" to add your first engagement</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full">
                    <thead className="bg-surface border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Title</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Start Date</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">End Date</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Est. Hours</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Risk Score</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {engagements.map((engagement, idx) => {
                        const statusColor =
                          engagement.status === 'CLOSED'
                            ? 'bg-slate-200 text-slate-600'
                            : engagement.status === 'FINALIZED'
                              ? 'bg-teal-100 text-teal-700'
                              : engagement.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-700'
                                : engagement.status === 'IN_PROGRESS'
                                  ? 'bg-blue-100 text-blue-700'
                                  : engagement.status === 'PLANNED'
                                    ? 'bg-slate-100 text-slate-700'
                                    : 'bg-amber-100 text-amber-700';
                        const isClosable = ['COMPLETED', 'FINALIZED', 'IN_PROGRESS'].includes(engagement.status);
                        const isBeingClosed = closingId === engagement.id;

                        return (
                          <tr
                            key={engagement.id}
                            className={`hover:bg-indigo-50/30 transition-colors cursor-pointer ${idx % 2 !== 0 ? 'bg-canvas/50' : 'bg-surface'}`}
                            onClick={() => navigate(`/execution/my-engagements/${engagement.id}`)}
                          >
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-800">{engagement.title}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-slate-600">{engagement.audit_type}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${statusColor}`}>
                                {engagement.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {engagement.start_date ? new Date(engagement.start_date).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {engagement.end_date ? new Date(engagement.end_date).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {engagement.estimated_hours || '-'}
                            </td>
                            <td className="px-4 py-3">
                              {engagement.risk_snapshot_score ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 rounded-full overflow-hidden bg-slate-200">
                                    <div
                                      className={`h-full rounded-full ${
                                        engagement.risk_snapshot_score >= 70
                                          ? 'bg-red-500'
                                          : engagement.risk_snapshot_score >= 40
                                            ? 'bg-amber-500'
                                            : 'bg-emerald-500'
                                      }`}
                                      style={{ width: `${engagement.risk_snapshot_score}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-semibold text-slate-700">
                                    {engagement.risk_snapshot_score.toFixed(0)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-slate-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/execution/my-engagements/${engagement.id}`);
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 text-slate-600 hover:bg-canvas rounded transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 size={16} />
                                </button>
                                {isClosable && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCloseEngagement(engagement.id, engagement.title);
                                    }}
                                    disabled={isBeingClosed}
                                    className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-slate-800 text-white rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="GIAS 8.3 — Denetimi Kapat (QAIP kontrolü çalıştır)"
                                  >
                                    {isBeingClosed
                                      ? <Loader2 size={12} className="animate-spin" />
                                      : <Lock size={12} />
                                    }
                                    {isBeingClosed ? '...' : 'Kapat'}
                                  </button>
                                )}
                                {engagement.status === 'CLOSED' && (
                                  <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-400 border border-slate-200 rounded">
                                    <ShieldAlert size={11} />
                                    Kapalı
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {engagements.length > 0 && (
                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  <div>
                    Total: <span className="font-semibold text-primary">{engagements.length}</span> engagements
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>{engagements.filter((e) => e.status === 'IN_PROGRESS').length} In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-500" />
                      <span>{engagements.filter((e) => e.status === 'PLANNED').length} Planned</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{engagements.filter((e) => e.status === 'COMPLETED').length} Completed</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showAddEngagementModal && isLoadingPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl shadow-2xl p-6 max-w-md flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-slate-600 font-medium">Yıllık plan yükleniyor...</p>
          </div>
        </div>
      )}

      {showAddEngagementModal && !isLoadingPlan && activePlan && (
        <NewEngagementModal
          isOpen={showAddEngagementModal}
          onClose={() => setShowAddEngagementModal(false)}
          planId={activePlan.id}
          entities={entities}
        />
      )}

      {showAddEngagementModal && !isLoadingPlan && !activePlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl shadow-2xl p-6 max-w-md">
            <h3 className="text-lg font-bold text-red-600 mb-2">Onaylı Plan Bulunamadı</h3>
            <p className="text-slate-600">
              Denetim görevi oluşturmak için önce onaylanmış bir yıllık plan (APPROVED durumunda) oluşturulmalıdır.
            </p>
            <button
              onClick={() => setShowAddEngagementModal(false)}
              className="mt-4 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors w-full"
            >
              Tamam
            </button>
          </div>
        </div>
      )}

      {/* BDDK Paketi Oluşturma Sihirbazı — Yıllık Denetim Planı'ndan tetiklenir */}
      <BDDKPackageModal
        isOpen={showBDDKModal}
        onClose={() => setShowBDDKModal(false)}
      />
    </div>
  );
}
