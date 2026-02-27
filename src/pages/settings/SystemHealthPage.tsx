import { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/ui/PageHeader';
import { UniversalSeeder, type SeedProgress } from '@/shared/lib/universal-seeder';
import PersonaSwitcher from '@/widgets/PersonaSwitcher';
import {
  Database,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Trash2,
  Package,
  Users,
  FileText,
  Target,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import clsx from 'clsx';

interface TableStat {
  name: string;
  label: string;
  icon: any;
  count: number;
  status: 'healthy' | 'warning' | 'error';
}

export default function SystemHealthPage() {
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [progress, setProgress] = useState<SeedProgress[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    loadTableCounts();
  }, []);

  const loadTableCounts = async () => {
    setLoading(true);
    try {
      const seeder = new UniversalSeeder();
      const counts = await seeder.getTableCounts();
      setTableCounts(counts);
    } catch (error) {
      console.error('Failed to load table counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFactoryReset = async () => {
    setSeeding(true);
    setProgress([]);

    try {
      const seeder = new UniversalSeeder((newProgress) => {
        setProgress([...newProgress]);
      });

      const result = await seeder.runFullSeed();

      if (result.success) {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Factory reset failed:', error);
    } finally {
      setSeeding(false);
      setShowConfirm(false);
    }
  };

  const tableStats: TableStat[] = [
    {
      name: 'audit_entities',
      label: 'Denetim Evreni',
      icon: Target,
      count: tableCounts.audit_entities || 0,
      status: (tableCounts.audit_entities || 0) > 0 ? 'healthy' : 'error',
    },
    {
      name: 'risk_library',
      label: 'Risk Kutuphanesi',
      icon: AlertTriangle,
      count: tableCounts.risk_library || 0,
      status: (tableCounts.risk_library || 0) > 0 ? 'healthy' : 'warning',
    },
    {
      name: 'user_profiles',
      label: 'Kullanicilar',
      icon: Users,
      count: tableCounts.user_profiles || 0,
      status: (tableCounts.user_profiles || 0) > 0 ? 'healthy' : 'warning',
    },
    {
      name: 'audit_engagements',
      label: 'Denetimler',
      icon: Briefcase,
      count: tableCounts.audit_engagements || 0,
      status: (tableCounts.audit_engagements || 0) > 0 ? 'healthy' : 'warning',
    },
    {
      name: 'audit_findings',
      label: 'Bulgular',
      icon: AlertCircle,
      count: tableCounts.audit_findings || 0,
      status: (tableCounts.audit_findings || 0) > 0 ? 'healthy' : 'error',
    },
    {
      name: 'workpapers',
      label: 'Calisma Kagitlari',
      icon: FileText,
      count: tableCounts.workpapers || 0,
      status: (tableCounts.workpapers || 0) > 0 ? 'healthy' : 'warning',
    },
    {
      name: 'action_plans',
      label: 'Aksiyon Planlari',
      icon: Package,
      count: tableCounts.action_plans || 0,
      status: (tableCounts.action_plans || 0) > 0 ? 'healthy' : 'warning',
    },
    {
      name: 'board_members',
      label: 'Yonetim Kurulu',
      icon: Users,
      count: tableCounts.board_members || 0,
      status: (tableCounts.board_members || 0) > 0 ? 'healthy' : 'warning',
    },
    {
      name: 'stakeholders',
      label: 'Paydaslar',
      icon: Users,
      count: tableCounts.stakeholders || 0,
      status: (tableCounts.stakeholders || 0) > 0 ? 'healthy' : 'warning',
    },
    {
      name: 'risk_assessments',
      label: 'Risk Degerlendirme',
      icon: AlertTriangle,
      count: tableCounts.risk_assessments || 0,
      status: (tableCounts.risk_assessments || 0) > 0 ? 'healthy' : 'warning',
    },
    {
      name: 'governance_docs',
      label: 'Yonetisim Dokumanlari',
      icon: FileText,
      count: tableCounts.governance_docs || 0,
      status: (tableCounts.governance_docs || 0) > 0 ? 'healthy' : 'warning',
    },
    {
      name: 'rkm_processes',
      label: 'RKM Surecleri',
      icon: Target,
      count: tableCounts.rkm_processes || 0,
      status: (tableCounts.rkm_processes || 0) > 0 ? 'healthy' : 'warning',
    },
    {
      name: 'rkm_risks',
      label: 'RKM Riskleri',
      icon: AlertTriangle,
      count: tableCounts.rkm_risks || 0,
      status: (tableCounts.rkm_risks || 0) > 0 ? 'healthy' : 'warning',
    },
  ];

  const healthyCount = tableStats.filter(t => t.status === 'healthy').length;
  const warningCount = tableStats.filter(t => t.status === 'warning').length;
  const errorCount = tableStats.filter(t => t.status === 'error').length;

  const overallHealth =
    errorCount > 2 ? 'critical' : warningCount > 3 ? 'warning' : 'healthy';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sistem Sagligi & Veri Yonetimi"
        description="Veritabani durumu ve demo veri yukleme"
        icon={Database}
        action={
          <button
            onClick={loadTableCounts}
            disabled={loading || seeding}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
            Yenile
          </button>
        }
      />

      {/* Overall Health Card */}
      <div
        className={clsx(
          'rounded-xl p-6 border-2',
          overallHealth === 'healthy' && 'bg-green-50 border-green-200',
          overallHealth === 'warning' && 'bg-yellow-50 border-yellow-200',
          overallHealth === 'critical' && 'bg-red-50 border-red-200'
        )}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Sistem Durumu: {overallHealth === 'healthy' && '✅ Saglikli'}
              {overallHealth === 'warning' && '⚠️ Dikkat'}
              {overallHealth === 'critical' && '🔴 Kritik'}
            </h2>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-green-700">
                <CheckCircle className="w-4 h-4" />
                {healthyCount} Saglikli
              </span>
              <span className="flex items-center gap-1 text-yellow-700">
                <AlertTriangle className="w-4 h-4" />
                {warningCount} Uyari
              </span>
              <span className="flex items-center gap-1 text-red-700">
                <XCircle className="w-4 h-4" />
                {errorCount} Hata
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            disabled={seeding}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-semibold"
          >
            <Trash2 className="w-5 h-5" />
            FACTORY RESET
          </button>
        </div>
      </div>

      {/* Persona Switcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PersonaSwitcher />
        </div>
        <div className="lg:col-span-2 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Rol Simülasyonu Aktif
              </h3>
              <p className="text-sm text-slate-700 mb-3">
                Sentinel v3.0 artık 5 farklı kullanıcı rolü simülasyonu yapabilir. Her rol için farklı erişim izinleri ve demo verileri otomatik olarak yüklenir.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-xs font-bold">CAE (Admin)</span>
                <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-bold">Auditor</span>
                <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold">Executive (GMY)</span>
                <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold">Auditee</span>
                <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold">Supplier</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tableStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className={clsx(
                'bg-white rounded-lg border-2 p-6 transition-all',
                stat.status === 'healthy' && 'border-green-200 hover:shadow-lg',
                stat.status === 'warning' && 'border-yellow-200 hover:shadow-lg',
                stat.status === 'error' && 'border-red-200 hover:shadow-lg'
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon
                  className={clsx(
                    'w-8 h-8',
                    stat.status === 'healthy' && 'text-green-600',
                    stat.status === 'warning' && 'text-yellow-600',
                    stat.status === 'error' && 'text-red-600'
                  )}
                />
                {stat.status === 'healthy' && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                {stat.status === 'warning' && (
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                )}
                {stat.status === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
              </div>

              <div className="text-3xl font-bold text-slate-900 mb-2">
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                ) : (
                  stat.count
                )}
              </div>

              <div className="text-sm font-medium text-slate-600">{stat.label}</div>

              {stat.count === 0 && !loading && (
                <div className="mt-3 text-xs text-red-600 font-medium">Veri yok!</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Panel */}
      {seeding && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            Veri Yukleniyor...
          </h3>

          <div className="space-y-3">
            {progress.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {step.status === 'running' && (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                )}
                {step.status === 'completed' && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                {step.status === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
                {step.status === 'pending' && (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                )}

                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900">{step.message}</div>
                  {step.count !== undefined && (
                    <div className="text-xs text-slate-500">{step.count} kayit</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <h3 className="text-xl font-bold text-slate-900">FACTORY RESET</h3>
            </div>

            <p className="text-slate-700 mb-6">
              Bu islem TUM verileri silip demo verileri yukleyecek. Bu islem geri alinamaz!
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Iptal
              </button>
              <button
                onClick={handleFactoryReset}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Eminim, Sil ve Yukle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
