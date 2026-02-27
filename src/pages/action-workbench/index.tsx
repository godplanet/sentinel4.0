import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/shared/ui';
import { SuperDrawer } from '@/widgets/SuperDrawer';
import { actionApi, agingApi, calculateActionAging, formatAgingMetric } from '@/entities/action';
import type { ActionWithDetails, ActionAging } from '@/entities/action';
import {
  ListTodo,
  Filter,
  Search,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Target,
  Loader2,
  Download,
  CheckSquare,
  MoreHorizontal,
  X,
  BarChart3,
  MessageSquare,
  Mail,
} from 'lucide-react';

type ViewMode = 'operational' | 'governance';
type ViewLayout = 'cards' | 'table' | 'timeline';
type QuickFilter = 'all' | 'my-actions' | 'overdue' | 'critical' | 'due-this-week' | 'pending-review';

export default function ActionWorkbenchPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('operational');
  const [viewLayout, setViewLayout] = useState<ViewLayout>('cards');
  const [actions, setActions] = useState<ActionWithDetails[]>([]);
  const [agingData, setAgingData] = useState<ActionAging[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [actionsData, agingDataResult] = await Promise.all([
        actionApi.getAll(),
        agingApi.getAll(),
      ]);
      setActions(actionsData);
      setAgingData(agingDataResult);
    } catch (error) {
      console.error('Failed to load actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActions = useMemo(() => {
    return actions.filter((action) => {
      const aging = calculateActionAging(action);

      if (filterStatus !== 'all' && action.status !== filterStatus) return false;

      if (quickFilter === 'overdue' && !aging.isOperationallyOverdue) return false;
      if (quickFilter === 'critical' && aging.severity !== 'critical') return false;
      if (quickFilter === 'due-this-week') {
        const daysUntilDue = -aging.operationalOverdue;
        if (daysUntilDue < 0 || daysUntilDue > 7) return false;
      }
      if (quickFilter === 'pending-review') {
        if (!['evidence_uploaded', 'auditor_review'].includes(action.status)) return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          action.title.toLowerCase().includes(query) ||
          action.id.toLowerCase().includes(query) ||
          action.assignee_unit_name?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [actions, filterStatus, quickFilter, searchQuery]);

  const stats = useMemo(() => {
    const now = Date.now();
    const overdueActions = actions.filter((a) => {
      const aging = calculateActionAging(a);
      return aging.isOperationallyOverdue;
    });
    const criticalActions = overdueActions.filter((a) => {
      const aging = calculateActionAging(a);
      return aging.severity === 'critical';
    });

    return {
      total: actions.length,
      pending: actions.filter((a) => a.status === 'pending').length,
      inProgress: actions.filter((a) => a.status === 'in_progress').length,
      review: actions.filter((a) => ['evidence_uploaded', 'auditor_review'].includes(a.status)).length,
      closed: actions.filter((a) => a.status === 'closed').length,
      overdue: overdueActions.length,
      critical: criticalActions.length,
    };
  }, [actions]);

  const handleSelectAll = () => {
    if (selectedIds.size === filteredActions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredActions.map((a) => a.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkAction = async (action: string) => {
    console.log(`Bulk action: ${action} on`, Array.from(selectedIds));
    setSelectedIds(new Set());
    setShowBulkActions(false);
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Title', 'Status', 'Assignee', 'Due Date', 'Overdue Days', 'Age'].join(','),
      ...filteredActions.map((action) => {
        const aging = calculateActionAging(action);
        return [
          action.id,
          `"${action.title}"`,
          action.status,
          action.assignee_unit_name || 'Unassigned',
          new Date(action.current_due_date).toLocaleDateString(),
          aging.operationalOverdue,
          aging.ageFromDetection,
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `actions-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="Action Workbench"
        subtitle="AuditBoard-Style Action Tracking with Dual Aging Metrics"
        icon={ListTodo}
      />

      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-7 gap-3">
          <StatsCard title="Total" value={stats.total} icon={ListTodo} color="blue" />
          <StatsCard title="Pending" value={stats.pending} icon={Clock} color="gray" />
          <StatsCard title="In Progress" value={stats.inProgress} icon={TrendingUp} color="yellow" />
          <StatsCard title="Review" value={stats.review} icon={AlertTriangle} color="orange" />
          <StatsCard title="Closed" value={stats.closed} icon={CheckCircle} color="green" />
          <StatsCard title="Overdue" value={stats.overdue} icon={AlertTriangle} color="red" />
          <StatsCard title="Critical" value={stats.critical} icon={AlertTriangle} color="red" highlight />
        </div>

        {/* Quick Filters Bar */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-700 mr-2">Quick Filters:</span>
            <QuickFilterButton
              active={quickFilter === 'all'}
              onClick={() => setQuickFilter('all')}
              label="All Actions"
            />
            <QuickFilterButton
              active={quickFilter === 'overdue'}
              onClick={() => setQuickFilter('overdue')}
              label="Overdue"
              badge={stats.overdue}
              color="red"
            />
            <QuickFilterButton
              active={quickFilter === 'critical'}
              onClick={() => setQuickFilter('critical')}
              label="Critical"
              badge={stats.critical}
              color="red"
            />
            <QuickFilterButton
              active={quickFilter === 'due-this-week'}
              onClick={() => setQuickFilter('due-this-week')}
              label="Due This Week"
              color="orange"
            />
            <QuickFilterButton
              active={quickFilter === 'pending-review'}
              onClick={() => setQuickFilter('pending-review')}
              label="Pending Review"
              badge={stats.review}
              color="blue"
            />
          </div>
        </div>

        {/* Main Control Panel */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          {/* Dual Tab Header */}
          <div className="flex items-center border-b border-slate-200">
            <button
              onClick={() => setViewMode('operational')}
              className={`
                flex items-center gap-2 px-6 py-4 border-b-2 font-semibold transition-colors
                ${viewMode === 'operational'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-slate-600 hover:text-slate-900'}
              `}
            >
              <Target size={20} />
              <span>Operational View</span>
            </button>

            <button
              onClick={() => setViewMode('governance')}
              className={`
                flex items-center gap-2 px-6 py-4 border-b-2 font-semibold transition-colors
                ${viewMode === 'governance'
                  ? 'border-purple-600 text-purple-600 bg-purple-50'
                  : 'border-transparent text-slate-600 hover:text-slate-900'}
              `}
            >
              <TrendingUp size={20} />
              <span>Governance View</span>
            </button>

            <div className="ml-auto flex items-center gap-2 px-4">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
            <p className="text-sm text-slate-600">
              {viewMode === 'operational' ? (
                <>
                  <span className="font-semibold">Operational View:</span> Current tracking based on approved due dates (including extensions)
                </>
              ) : (
                <>
                  <span className="font-semibold">Governance View:</span> Performance tracking based on original commitments
                </>
              )}
            </p>
          </div>

          {/* Filters & Search */}
          <div className="px-6 py-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by title, ID, or unit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="evidence_uploaded">Evidence Uploaded</option>
              <option value="auditor_review">Under Review</option>
              <option value="closed">Closed</option>
            </select>

            {selectedIds.size > 0 && (
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                <CheckSquare size={18} />
                {selectedIds.size} Selected
              </button>
            )}
          </div>

          {/* Bulk Actions Bar */}
          {showBulkActions && selectedIds.size > 0 && (
            <div className="px-6 py-3 bg-blue-50 border-y border-blue-200 flex items-center gap-3">
              <span className="text-sm font-semibold text-blue-900">Bulk Actions:</span>
              <button
                onClick={() => handleBulkAction('remind')}
                className="px-3 py-1.5 text-sm bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-100 font-medium"
              >
                <Mail size={14} className="inline mr-1" />
                Send Reminder
              </button>
              <button
                onClick={() => handleBulkAction('comment')}
                className="px-3 py-1.5 text-sm bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-100 font-medium"
              >
                <MessageSquare size={14} className="inline mr-1" />
                Add Comment
              </button>
              <button
                onClick={() => handleBulkAction('export')}
                className="px-3 py-1.5 text-sm bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-100 font-medium"
              >
                <Download size={14} className="inline mr-1" />
                Export Selected
              </button>
              <button
                onClick={() => {
                  setSelectedIds(new Set());
                  setShowBulkActions(false);
                }}
                className="ml-auto p-1.5 text-blue-600 hover:text-blue-800"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Actions List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <span className="ml-3 text-slate-600 font-medium">Loading actions...</span>
          </div>
        ) : filteredActions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
            <ListTodo className="mx-auto mb-4 text-slate-400" size={48} />
            <p className="text-lg font-semibold text-slate-700">No actions found</p>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Select All Bar */}
            {filteredActions.length > 0 && (
              <div className="flex items-center justify-between px-4 py-2 bg-white rounded-lg border border-slate-200">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredActions.length && filteredActions.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Select All ({filteredActions.length} actions)
                </label>
                <span className="text-xs text-slate-500">
                  Showing {filteredActions.length} of {actions.length} actions
                </span>
              </div>
            )}

            <div className="grid gap-4">
              {filteredActions.map((action) => (
                <ActionCard
                  key={action.id}
                  action={action}
                  viewMode={viewMode}
                  isSelected={selectedIds.has(action.id)}
                  onSelect={() => handleSelectOne(action.id)}
                  onClick={() => setSelectedActionId(action.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Super Drawer */}
      <SuperDrawer
        actionId={selectedActionId}
        isOpen={!!selectedActionId}
        onClose={() => setSelectedActionId(null)}
        onUpdate={loadData}
      />
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color, highlight }: {
  title: string;
  value: number;
  icon: any;
  color: string;
  highlight?: boolean;
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    gray: 'text-slate-600 bg-slate-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    orange: 'text-orange-600 bg-orange-100',
    red: 'text-red-600 bg-red-100',
    green: 'text-green-600 bg-green-100',
  };

  return (
    <div
      className={`bg-white rounded-lg border p-4 shadow-sm transition-all ${
        highlight ? 'border-red-300 shadow-red-200 ring-2 ring-red-100' : 'border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon size={18} className={colorClasses[color as keyof typeof colorClasses].split(' ')[0]} />
        <span className="text-3xl font-bold text-slate-900">{value}</span>
      </div>
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{title}</div>
    </div>
  );
}

function QuickFilterButton({
  active,
  onClick,
  label,
  badge,
  color = 'blue',
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  badge?: number;
  color?: string;
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-700 border-blue-300',
    red: 'bg-red-100 text-red-700 border-red-300',
    orange: 'bg-orange-100 text-orange-700 border-orange-300',
  };

  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-lg text-sm font-medium transition-all border
        ${active
          ? `${colors[color as keyof typeof colors]} shadow-sm`
          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}
      `}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="ml-1.5 px-1.5 py-0.5 bg-white/60 rounded text-xs font-bold">{badge}</span>
      )}
    </button>
  );
}

function ActionCard({
  action,
  viewMode,
  isSelected,
  onSelect,
  onClick,
}: {
  action: ActionWithDetails;
  viewMode: ViewMode;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
}) {
  const aging = calculateActionAging(action);

  const isOverdue = viewMode === 'operational' ? aging.isOperationallyOverdue : aging.isPerformanceDelayed;
  const delayDays = viewMode === 'operational' ? aging.operationalOverdue : aging.performanceDelay;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('input[type="checkbox"]')) {
      return;
    }
    onClick();
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        w-full p-5 bg-white/90 backdrop-blur-sm rounded-lg border-2 transition-all cursor-pointer
        hover:shadow-lg hover:scale-[1.01]
        ${isSelected ? 'ring-2 ring-blue-500 border-blue-400' : aging.glowClass || 'border-slate-200'}
      `}
    >
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          onClick={(e) => e.stopPropagation()}
          className="mt-1.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />

        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                  ${aging.severity === 'critical' ? 'bg-red-100' :
                    aging.severity === 'warning' ? 'bg-orange-100' :
                    'bg-blue-100'}
                `}
              >
                <AlertTriangle
                  size={20}
                  className={
                    aging.severity === 'critical' ? 'text-red-600' :
                    aging.severity === 'warning' ? 'text-orange-600' :
                    'text-blue-600'
                  }
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-base leading-tight">{action.title}</h3>
                <p className="text-sm text-slate-600 mt-0.5">
                  {action.finding_snapshot.title}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500 mb-1">Age</div>
              <div className="text-2xl font-bold text-slate-900">{aging.ageFromDetection}</div>
              <div className="text-xs text-slate-600">days</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-slate-500" />
              <span className={isOverdue ? 'text-red-600 font-semibold' : 'text-slate-700'}>
                {viewMode === 'operational' ? 'Due' : 'Original'}:{' '}
                {new Date(viewMode === 'operational' ? action.current_due_date : action.original_due_date).toLocaleDateString()}
              </span>
              {isOverdue && (
                <span className="text-red-600 font-bold">({formatAgingMetric(delayDays)})</span>
              )}
            </div>

            {aging.extensionDays > 0 && viewMode === 'governance' && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                <Clock size={12} />
                Extended {aging.extensionDays}d
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{action.assignee_unit_name || 'Unassigned'}</span>
            </div>

            <div
              className={`
                px-2 py-1 rounded text-xs font-semibold uppercase
                ${action.status === 'closed' ? 'bg-green-100 text-green-700' :
                  action.status === 'evidence_uploaded' ? 'bg-blue-100 text-blue-700' :
                  action.status === 'auditor_review' ? 'bg-purple-100 text-purple-700' :
                  'bg-slate-100 text-slate-700'}
              `}
            >
              {action.status.replace(/_/g, ' ')}
            </div>

            {action.evidence && action.evidence.length > 0 && (
              <div className="text-xs text-blue-600 font-medium">
                {action.evidence.length} evidence
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
