import { useState, useEffect } from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { Calendar, AlertTriangle, Plus, Edit2, Users, Save } from 'lucide-react';
import { supabase } from '@/shared/api/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

interface AuditEngagement {
  id: string;
  title: string;
  audit_type: 'COMPREHENSIVE' | 'TARGETED' | 'FOLLOW_UP';
  start_date: string;
  end_date: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assigned_auditor_id?: string;
  estimated_hours: number;
  actual_hours?: number;
  entity_id?: string;
  risk_snapshot_score?: number;
}

interface Conflict {
  conflict_engagement_id: string;
  conflict_engagement_name: string;
  conflict_auditor_id: string;
}

export function AnnualPlanner() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Month);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Helper functions - must be defined before usage
  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'COMPREHENSIVE': return '#3b82f6';
      case 'TARGETED': return '#f97316';
      case 'FOLLOW_UP': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PLANNED: 'bg-blue-100 text-blue-700',
      IN_PROGRESS: 'bg-green-100 text-green-700',
      FIELD_WORK: 'bg-purple-100 text-purple-700',
      REPORTING: 'bg-orange-100 text-orange-700',
      COMPLETED: 'bg-slate-100 text-slate-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };

    return (
      <span className={`text-xs px-2 py-1 rounded font-semibold ${colors[status] || 'bg-slate-100 text-slate-700'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const { data: engagements = [], isLoading } = useQuery({
    queryKey: ['audit-engagements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_engagements')
        .select('*')
        .order('start_date');

      if (error) throw error;
      return data as AuditEngagement[];
    },
  });

  const updateEngagement = useMutation({
    mutationFn: async ({ id, start_date, end_date }: { id: string; start_date: string; end_date: string }) => {
      const { error } = await supabase
        .from('audit_engagements')
        .update({ start_date, end_date, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-engagements'] });
    },
  });

  const checkConflicts = async (engagementId: string, startDate: string, endDate: string, auditorIds: string[]) => {
    if (auditorIds.length === 0) return [];

    const { data, error } = await supabase.rpc('detect_scheduling_conflicts', {
      p_engagement_id: engagementId,
      p_start_date: startDate,
      p_end_date: endDate,
      p_auditor_ids: auditorIds,
    });

    if (error) {
      console.error('Error checking conflicts:', error);
      return [];
    }

    return data || [];
  };

  const tasks: Task[] = engagements.map((eng) => ({
    id: eng.id,
    name: eng.title,
    start: new Date(eng.start_date),
    end: new Date(eng.end_date),
    progress: Math.round((eng.actual_hours || 0) / eng.estimated_hours * 100) || 0,
    type: 'task',
    styles: {
      backgroundColor: getTypeColor(eng.audit_type),
      backgroundSelectedColor: getTypeColor(eng.audit_type),
      progressColor: '#1e40af',
      progressSelectedColor: '#1e40af',
    },
  }));

  const handleTaskChange = async (task: Task) => {
    const engagement = engagements.find(e => e.id === task.id);
    if (!engagement) return;

    const startDate = task.start.toISOString().split('T')[0];
    const endDate = task.end.toISOString().split('T')[0];

    const auditorIds = engagement.assigned_auditor_id ? [engagement.assigned_auditor_id] : [];

    if (auditorIds.length > 0) {
      const foundConflicts = await checkConflicts(engagement.id, startDate, endDate, auditorIds);

      if (foundConflicts.length > 0) {
        setConflicts(foundConflicts);
        const confirmUpdate = confirm(
          `WARNING: Scheduling conflict detected!\n\n` +
          `${foundConflicts.length} conflict(s) found with other engagements.\n` +
          `Do you want to proceed anyway?`
        );

        if (!confirmUpdate) {
          return;
        }
      }
    }

    await updateEngagement.mutateAsync({
      id: task.id,
      start_date: startDate,
      end_date: endDate,
    });

    setConflicts([]);
  };

  const handleProgressChange = async (task: Task) => {
    const engagement = engagements.find(e => e.id === task.id);
    if (!engagement) return;

    const actualHours = Math.round((task.progress / 100) * engagement.estimated_hours);

    const { error } = await supabase
      .from('audit_engagements')
      .update({ actual_hours: actualHours })
      .eq('id', task.id);

    if (error) {
      console.error('Error updating progress:', error);
    } else {
      queryClient.invalidateQueries({ queryKey: ['audit-engagements'] });
    }
  };

  const handleTaskClick = (task: Task) => {
    navigate(`/execution/my-engagements/${task.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading audit plan...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Annual Audit Plan
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Drag tasks to reschedule. System will warn about resource conflicts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={ViewMode.Day}>Day</option>
            <option value={ViewMode.Week}>Week</option>
            <option value={ViewMode.Month}>Month</option>
            <option value={ViewMode.Year}>Year</option>
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Engagement
          </button>
        </div>
      </div>

      {/* CONFLICT WARNINGS */}
      {conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">Scheduling Conflicts Detected</h3>
          </div>
          <p className="text-sm text-red-700 mb-3">
            The following conflicts were found with other engagements:
          </p>
          <ul className="space-y-1">
            {conflicts.map((conflict, idx) => (
              <li key={idx} className="text-sm text-red-800">
                • Conflict with: <strong>{conflict.conflict_engagement_name}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* GANTT CHART */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No audit engagements scheduled yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              Create First Engagement
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Gantt
              tasks={tasks}
              viewMode={viewMode}
              onDateChange={handleTaskChange}
              onProgressChange={handleProgressChange}
              onClick={handleTaskClick}
              listCellWidth="200px"
              columnWidth={viewMode === ViewMode.Month ? 60 : viewMode === ViewMode.Week ? 100 : 40}
              barBackgroundColor="#3b82f6"
              barProgressColor="#1e40af"
              barBackgroundSelectedColor="#2563eb"
              rowHeight={50}
              fontSize="14px"
            />
          </div>
        )}
      </div>

      {/* ENGAGEMENT LIST */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-600" />
            All Engagements ({engagements.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Engagement</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Start</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">End</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Est. Hours</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Actual Hours</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {engagements.map((eng) => {
                const progress = Math.round((eng.actual_hours || 0) / eng.estimated_hours * 100) || 0;
                return (
                  <tr
                    key={eng.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/execution/my-engagements/${eng.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{eng.title}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs px-2 py-1 rounded font-semibold text-white"
                        style={{ backgroundColor: getTypeColor(eng.audit_type) }}
                      >
                        {eng.audit_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {new Date(eng.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {new Date(eng.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-slate-700">
                      {eng.estimated_hours}h
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-slate-700">
                      {eng.actual_hours || 0}h
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(eng.status)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-semibold text-slate-700">
                        {eng.risk_snapshot_score?.toFixed(1) || '-'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD ENGAGEMENT MODAL */}
      {showAddModal && (
        <AddEngagementModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            queryClient.invalidateQueries({ queryKey: ['audit-engagements'] });
          }}
        />
      )}
    </div>
  );
}

function AddEngagementModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    audit_type: 'COMPREHENSIVE' as const,
    start_date: '',
    end_date: '',
    estimated_hours: 0,
  });

  const [entities, setEntities] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const { data: entitiesData } = await supabase
        .from('audit_entities')
        .select('id, entity_name')
        .limit(50);

      const { data: plansData } = await supabase
        .from('audit_plans')
        .select('id, plan_name, period_start, period_end')
        .order('period_start', { ascending: false })
        .limit(10);

      setEntities(entitiesData || []);
      setPlans(plansData || []);
      if (plansData && plansData.length > 0) {
        setSelectedPlanId(plansData[0].id);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEntityId || !selectedPlanId) {
      alert('Please select entity and plan');
      return;
    }

    const { error } = await supabase
      .from('audit_engagements')
      .insert([{
        ...formData,
        entity_id: selectedEntityId,
        plan_id: selectedPlanId,
        status: 'PLANNED',
        actual_hours: 0,
        risk_snapshot_score: 0,
      }]);

    if (error) {
      alert('Error creating engagement: ' + error.message);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Add Audit Engagement</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Audit Plan *
            </label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Plan</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.plan_name} ({new Date(plan.period_start).getFullYear()})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Entity *
            </label>
            <select
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Entity</option>
              {entities.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.entity_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Engagement Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Audit Type
            </label>
            <select
              value={formData.audit_type}
              onChange={(e) => setFormData({ ...formData, audit_type: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="COMPREHENSIVE">Comprehensive</option>
              <option value="TARGETED">Targeted</option>
              <option value="FOLLOW_UP">Follow Up</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Estimated Hours
            </label>
            <input
              type="number"
              value={formData.estimated_hours}
              onChange={(e) => setFormData({ ...formData, estimated_hours: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              Create Engagement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
