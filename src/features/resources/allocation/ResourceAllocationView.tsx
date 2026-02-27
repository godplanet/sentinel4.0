import { useState, useEffect } from 'react';
import { supabase } from '@/shared/api/supabase';
import { CalendarCheck, Users, AlertTriangle, TrendingUp, Clock, UserPlus } from 'lucide-react';
import clsx from 'clsx';

interface Engagement {
  id: string;
  title: string;
  status: string;
  start_date: string;
  end_date: string;
  estimated_hours?: number;
  assigned_count?: number;
}

interface AuditorAllocation {
  id: string;
  full_name: string;
  email: string;
  allocated_hours: number;
  capacity_hours: number;
  active_engagements: number;
}

export function ResourceAllocationView() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [auditors, setAuditors] = useState<AuditorAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEngagement, setSelectedEngagement] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [engagementsResult, auditorsResult] = await Promise.all([
        supabase
          .from('audit_engagements')
          .select('*')
          .in('status', ['PLANNED', 'IN_PROGRESS'])
          .order('start_date', { ascending: true }),
        supabase
          .from('auditor_profiles')
          .select('*')
          .order('full_name')
      ]);

      if (engagementsResult.error) throw engagementsResult.error;
      if (auditorsResult.error) throw auditorsResult.error;

      const engagementsWithAssignments = await Promise.all(
        (engagementsResult.data || []).map(async (eng) => {
          const { count } = await supabase
            .from('resource_assignments')
            .select('*', { count: 'exact', head: true })
            .eq('engagement_id', eng.id);

          return {
            ...eng,
            assigned_count: count || 0
          };
        })
      );

      const auditorsWithAllocation = await Promise.all(
        (auditorsResult.data || []).map(async (auditor) => {
          const { data: assignments } = await supabase
            .from('resource_assignments')
            .select('allocated_hours, engagement:audit_engagements!inner(status)')
            .eq('user_id', auditor.id)
            .in('engagement.status', ['PLANNED', 'IN_PROGRESS']);

          const allocatedHours = (assignments || []).reduce(
            (sum, a) => sum + (a.allocated_hours || 0),
            0
          );

          return {
            id: auditor.id,
            full_name: auditor.full_name,
            email: auditor.email,
            allocated_hours: allocatedHours,
            capacity_hours: 160,
            active_engagements: (assignments || []).length
          };
        })
      );

      setEngagements(engagementsWithAssignments);
      setAuditors(auditorsWithAllocation);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUtilizationColor = (allocated: number, capacity: number) => {
    const percent = (allocated / capacity) * 100;
    if (percent >= 100) return 'text-red-600 bg-red-50 border-red-200';
    if (percent >= 80) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (percent >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getUtilizationPercent = (allocated: number, capacity: number) => {
    return Math.round((allocated / capacity) * 100);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Kaynak Tahsisi</h2>
        <p className="text-slate-600 mt-1">
          Denetim atama ve kaynak dağılımı yönetimi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <CalendarCheck className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-600">Aktif Denetimler</p>
              <p className="text-2xl font-bold text-slate-900">{engagements.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Users className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-600">Uygun Kaynak</p>
              <p className="text-2xl font-bold text-slate-900">
                {auditors.filter(a => a.allocated_hours < a.capacity_hours * 0.8).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-600">Aşırı Yüklü</p>
              <p className="text-2xl font-bold text-slate-900">
                {auditors.filter(a => a.allocated_hours >= a.capacity_hours).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-600">Ort. Kullanım</p>
              <p className="text-2xl font-bold text-slate-900">
                {auditors.length > 0
                  ? Math.round((auditors.reduce((sum, a) => sum + a.allocated_hours, 0) / auditors.reduce((sum, a) => sum + a.capacity_hours, 0)) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <CalendarCheck size={18} className="text-blue-600" />
              Atama Bekleyen Denetimler
            </h3>
          </div>
          <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : engagements.length === 0 ? (
              <div className="text-center py-12">
                <CalendarCheck className="mx-auto text-slate-400 mb-4" size={48} />
                <p className="text-slate-600 font-medium">Aktif denetim yok</p>
              </div>
            ) : (
              engagements.map((engagement) => (
                <div
                  key={engagement.id}
                  onClick={() => setSelectedEngagement(engagement.id)}
                  className={clsx(
                    'border rounded-lg p-4 cursor-pointer transition-all',
                    selectedEngagement === engagement.id
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-slate-200 hover:border-blue-300 hover:shadow-sm'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-slate-900 text-sm">{engagement.title}</h4>
                    <span className={clsx(
                      'px-2 py-1 rounded text-xs font-medium',
                      engagement.status === 'IN_PROGRESS'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                    )}>
                      {engagement.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{engagement.estimated_hours || 0}h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={12} />
                      <span>{engagement.assigned_count || 0} atandı</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
                    {new Date(engagement.start_date).toLocaleDateString('tr-TR')} - {new Date(engagement.end_date).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Users size={18} className="text-green-600" />
              Denetçi Kapasite Durumu
            </h3>
          </div>
          <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : auditors.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto text-slate-400 mb-4" size={48} />
                <p className="text-slate-600 font-medium">Denetçi bulunamadı</p>
              </div>
            ) : (
              auditors.map((auditor) => {
                const utilizationPercent = getUtilizationPercent(auditor.allocated_hours, auditor.capacity_hours);
                const colorClass = getUtilizationColor(auditor.allocated_hours, auditor.capacity_hours);

                return (
                  <div
                    key={auditor.id}
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {auditor.full_name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 text-sm">{auditor.full_name}</h4>
                          <p className="text-xs text-slate-500">{auditor.email}</p>
                        </div>
                      </div>
                      <button
                        disabled={!selectedEngagement}
                        className={clsx(
                          'p-2 rounded-lg transition-all',
                          selectedEngagement
                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        )}
                        title="Atama Yap"
                      >
                        <UserPlus size={16} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Kullanım Oranı</span>
                        <span className={clsx('font-bold', colorClass.split(' ')[0])}>
                          {utilizationPercent}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={clsx(
                            'h-full transition-all',
                            utilizationPercent >= 100 ? 'bg-red-500' :
                            utilizationPercent >= 80 ? 'bg-orange-500' :
                            utilizationPercent >= 60 ? 'bg-blue-500' : 'bg-green-500'
                          )}
                          style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{auditor.allocated_hours}h / {auditor.capacity_hours}h</span>
                        <span>{auditor.active_engagements} aktif denetim</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {selectedEngagement && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <CalendarCheck className="text-blue-600" size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">Denetim Seçildi</h4>
              <p className="text-sm text-blue-700">
                Artık bir denetçinin yanındaki <UserPlus size={14} className="inline" /> butonuna tıklayarak atama yapabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
