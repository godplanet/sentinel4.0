import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/ui';
import { fetchEngagementsList, fetchInvestigations } from '@/entities/planning/api/queries';
import { FileText, Shield, Briefcase, Calendar, TrendingUp, Clock, CheckCircle2, ArrowRight, AlertTriangle, Zap } from 'lucide-react';
import clsx from 'clsx';
import { KanbanBoard } from '@/features/engagement-kanban';
import { AgileEngagementsPage } from '@/pages/execution/AgileEngagementsPage';

type TabKey = 'audits' | 'agile' | 'investigations';

const TABS = [
  { key: 'audits' as TabKey, label: 'Denetimlerim', icon: Briefcase },
  { key: 'agile' as TabKey, label: 'Agile Denetim', icon: Zap },
  { key: 'investigations' as TabKey, label: 'Soruşturmalar', icon: Shield },
];

interface Engagement {
  id: string;
  title: string;
  status: string;
  audit_type: string;
  start_date: string;
  end_date: string;
  estimated_hours?: number;
  risk_snapshot_score?: number;
}

interface Investigation {
  id: string;
  case_number: string;
  title: string;
  status: string;
  severity: string;
  created_at: string;
}

export default function ExecutionConsolidatedPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('audits');
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'audits') {
        const data = await fetchEngagementsList();
        setEngagements(data || []);
      } else if (activeTab === 'investigations') {
        const data = await fetchInvestigations();
        setInvestigations(data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PLANNED: 'bg-blue-100 text-blue-700 border-blue-300',
      IN_PROGRESS: 'bg-orange-100 text-orange-700 border-orange-300',
      REPORTING: 'bg-purple-100 text-purple-700 border-purple-300',
      COMPLETED: 'bg-green-100 text-green-700 border-green-300',
      OPEN: 'bg-red-100 text-red-700 border-red-300',
      ACTIVE: 'bg-orange-100 text-orange-700 border-orange-300',
      CLOSED: 'bg-slate-100 text-slate-700 border-slate-300',
      LEGAL: 'bg-purple-100 text-purple-700 border-purple-300',
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-lg border text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-700 border-slate-300'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <PageHeader
        title="İcra Yönetimi"
        subtitle="Denetim Görevleri ve Soruşturmalar"
        icon={FileText}
      />

      <div className="border-b border-slate-200 bg-white px-6">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all relative',
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'audits' && (
          <div className="p-6">
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Briefcase className="text-blue-600" size={24} />
                    <span className="text-2xl font-bold text-slate-900">{engagements.length}</span>
                  </div>
                  <p className="text-sm text-slate-600">Toplam Görev</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="text-orange-600" size={24} />
                    <span className="text-2xl font-bold text-slate-900">
                      {engagements.filter((e) => e.status === 'IN_PROGRESS').length}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">İcrada</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="text-purple-600" size={24} />
                    <span className="text-2xl font-bold text-slate-900">
                      {engagements.filter((e) => e.status === 'PLANNED').length}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">Planlanmış</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle2 className="text-green-600" size={24} />
                    <span className="text-2xl font-bold text-slate-900">
                      {engagements.filter((e) => e.status === 'COMPLETED').length}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">Tamamlandı</p>
                </div>
              </div>
            </div>

            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                )}
              >
                Liste
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                )}
              >
                Kanban
              </button>
            </div>

            {loading ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12">
                <div className="flex items-center justify-center">
                  <Clock className="animate-spin text-blue-600 mr-2" size={24} />
                  <p className="text-slate-600">Yükleniyor...</p>
                </div>
              </div>
            ) : viewMode === 'kanban' ? (
              <KanbanBoard engagements={engagements} />
            ) : (
              <div className="space-y-4">
                {engagements.map((engagement) => (
                  <button
                    key={engagement.id}
                    onClick={() => navigate(`/execution/my-engagements/${engagement.id}`)}
                    className="w-full bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <Briefcase className="text-white" size={24} />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {engagement.title}
                            </h3>
                            <p className="text-sm text-slate-600">{engagement.audit_type}</p>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(engagement.status)}
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Başlangıç</p>
                          <p className="text-sm font-medium text-slate-900">
                            {new Date(engagement.start_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Bitiş</p>
                          <p className="text-sm font-medium text-slate-900">
                            {new Date(engagement.end_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Tahmini Saat</p>
                          <p className="text-sm font-medium text-slate-900">{engagement.estimated_hours || '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Risk Skoru</p>
                          <p className="text-sm font-medium text-slate-900">
                            {engagement.risk_snapshot_score?.toFixed(0) || '-'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-3 mt-3 border-t border-slate-200">
                      <div className="flex items-center gap-2 text-blue-600">
                        <span className="text-sm font-medium">Detaya Git</span>
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'agile' && (
          <div className="p-6">
            <AgileEngagementsPage />
          </div>
        )}

        {activeTab === 'investigations' && (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Shield size={20} className="text-red-600" />
                Soruşturma Dosyaları
              </h3>
              <p className="text-slate-600 mb-6">
                Gizlilik dereceli soruşturma vakalarının takibi.
              </p>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Clock className="animate-spin text-blue-600 mr-2" size={24} />
                  <p className="text-slate-600">Yükleniyor...</p>
                </div>
              ) : investigations.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="mx-auto text-slate-400 mb-4" size={48} />
                  <p className="text-slate-600">Henüz soruşturma kaydı yok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {investigations.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-4 border border-slate-200 rounded-lg hover:border-red-300 hover:bg-red-50/50 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-mono font-bold rounded">
                              {inv.case_number}
                            </span>
                            {getStatusBadge(inv.status)}
                            <span className={clsx(
                              'px-2 py-1 text-xs font-medium rounded',
                              inv.severity === 'CRITICAL' ? 'bg-red-200 text-red-800' :
                              inv.severity === 'HIGH' ? 'bg-orange-200 text-orange-800' :
                              'bg-yellow-200 text-yellow-800'
                            )}>
                              {inv.severity}
                            </span>
                          </div>
                          <h4 className="font-semibold text-slate-900 mb-1">{inv.title}</h4>
                          <p className="text-xs text-slate-500">
                            Açılış: {new Date(inv.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
