import { useState, useEffect, Fragment } from 'react';
import { actionApi, evidenceApi, logApi, useActionAging, formatAgingMetric } from '@/entities/action';
import type { ActionWithDetails, ActionEvidence, ActionLog } from '@/entities/action';
import { AutoFixButton } from '@/features/action-tracking/AutoFixButton';
import {
  X,
  FileText,
  Upload,
  MessageSquare,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  History,
  Download,
} from 'lucide-react';

interface SuperDrawerProps {
  actionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

type TabType = 'details' | 'evidence' | 'chat';

export function SuperDrawer({ actionId, isOpen, onClose, onUpdate }: SuperDrawerProps) {
  const [action, setAction] = useState<ActionWithDetails | null>(null);
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (actionId && isOpen) {
      loadAction();
    }
  }, [actionId, isOpen]);

  const loadAction = async () => {
    if (!actionId) return;

    try {
      setLoading(true);
      const data = await actionApi.getById(actionId);
      setAction(data);

      const logsData = await logApi.getByAction(actionId);
      setLogs(logsData);
    } catch (error) {
      console.error('Failed to load action:', error);
    } finally {
      setLoading(false);
    }
  };

  const aging = action ? useActionAging(action) : null;

  if (!isOpen || !action) return null;

  const handleClose = () => {
    setActiveTab('details');
    onClose();
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!action) return;

    try {
      await actionApi.update(action.id, { status: newStatus as any });
      await loadAction();
      onUpdate?.();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const handleCloseAction = async () => {
    if (!action) return;

    if (!confirm('Mark this action as closed? This cannot be undone by auditees.')) {
      return;
    }

    try {
      await actionApi.close(action.id);
      await loadAction();
      onUpdate?.();
    } catch (error) {
      console.error('Failed to close action:', error);
      alert('Failed to close action');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="absolute inset-y-0 right-0 max-w-3xl w-full flex">
        <div className="relative w-full bg-white/95 backdrop-blur-xl shadow-2xl">
          {/* Header */}
          <div
            className={`
              px-6 py-4 border-b border-slate-200
              ${aging?.glowClass || ''}
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`
                      w-12 h-12 rounded-lg flex items-center justify-center
                      ${aging?.severity === 'critical' ? 'bg-red-100' :
                        aging?.severity === 'warning' ? 'bg-orange-100' :
                        'bg-blue-100'}
                    `}
                  >
                    <AlertTriangle
                      size={24}
                      className={aging?.severity === 'critical' ? 'text-red-600' :
                        aging?.severity === 'warning' ? 'text-orange-600' :
                        'text-blue-600'}
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900">{action.title}</h2>
                    <p className="text-sm text-slate-600 mt-0.5">
                      Action ID: {action.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-500" />
                    <span className={aging?.color}>
                      Due: {new Date(action.current_due_date).toLocaleDateString()}
                      {aging && aging.operationalOverdue > 0 && (
                        <span className="ml-2 font-semibold">
                          ({formatAgingMetric(aging.operationalOverdue)})
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-slate-500" />
                    <span className="text-slate-600">
                      Age: {aging?.ageFromDetection || 0} days
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200 px-6">
            <div className="flex gap-1">
              {[
                { id: 'details' as const, label: 'Details', icon: FileText },
                { id: 'evidence' as const, label: 'Evidence', icon: Upload, count: action.evidence?.length },
                { id: 'chat' as const, label: 'History', icon: History, count: logs.length },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-3 border-b-2 transition-colors font-medium text-sm
                      ${activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'}
                    `}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs rounded-full font-semibold">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ maxHeight: 'calc(100vh - 250px)' }}>
            {activeTab === 'details' && (
              <DetailsTab action={action} aging={aging} onStatusUpdate={handleStatusUpdate} />
            )}
            {activeTab === 'evidence' && (
              <EvidenceTab action={action} onUpdate={loadAction} />
            )}
            {activeTab === 'chat' && (
              <HistoryTab logs={logs} />
            )}
          </div>

          {/* Footer Actions */}
          <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center justify-between gap-3">
              <AutoFixButton action={action} onSuccess={() => { loadAction(); onUpdate?.(); }} />

              <div className="flex items-center gap-3">
                {action.status !== 'closed' && action.status !== 'risk_accepted' && (
                  <button
                    onClick={handleCloseAction}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <CheckCircle size={18} />
                    <span>Close Action</span>
                  </button>
                )}

                {action.status === 'evidence_uploaded' && (
                  <button
                    onClick={() => handleStatusUpdate('auditor_rejected')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <XCircle size={18} />
                    <span>Reject</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailsTab({ action, aging, onStatusUpdate }: {
  action: ActionWithDetails;
  aging: ReturnType<typeof useActionAging> | null;
  onStatusUpdate: (status: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Finding Snapshot */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <FileText size={16} />
          Original Finding Context (Immutable)
        </h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium text-blue-800">Title:</span>
            <span className="ml-2 text-blue-700">{action.finding_snapshot.title}</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Severity:</span>
            <span className="ml-2 text-blue-700">{action.finding_snapshot.severity}</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Detected:</span>
            <span className="ml-2 text-blue-700">
              {new Date(action.finding_snapshot.created_at).toLocaleDateString()}
            </span>
          </div>
          {action.finding_snapshot.description && (
            <div>
              <span className="font-medium text-blue-800 block mb-1">Description:</span>
              <p className="text-blue-700">{action.finding_snapshot.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Aging Metrics */}
      {aging && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <div className="text-xs text-slate-500 mb-1">Age from Detection</div>
            <div className="text-2xl font-bold text-slate-900">{aging.ageFromDetection}</div>
            <div className="text-xs text-slate-600">days</div>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <div className="text-xs text-slate-500 mb-1">Performance Delay</div>
            <div className={`text-2xl font-bold ${aging.isPerformanceDelayed ? 'text-red-600' : 'text-green-600'}`}>
              {aging.performanceDelay}
            </div>
            <div className="text-xs text-slate-600">days</div>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <div className="text-xs text-slate-500 mb-1">Operational Overdue</div>
            <div className={`text-2xl font-bold ${aging.isOperationallyOverdue ? 'text-red-600' : 'text-green-600'}`}>
              {aging.operationalOverdue}
            </div>
            <div className="text-xs text-slate-600">days</div>
          </div>
        </div>
      )}

      {/* Description */}
      {action.description && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Action Description</h3>
          <p className="text-sm text-slate-600">{action.description}</p>
        </div>
      )}

      {/* Assignment */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Assignment</h3>
        <div className="space-y-2 text-sm">
          {action.assignee_unit_name && (
            <div>
              <span className="font-medium text-slate-600">Unit:</span>
              <span className="ml-2 text-slate-900">{action.assignee_unit_name}</span>
            </div>
          )}
          <div>
            <span className="font-medium text-slate-600">Priority:</span>
            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${
              action.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
              action.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
              action.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {action.priority}
            </span>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Original Due Date</h3>
          <div className="text-sm font-medium text-slate-900">
            {new Date(action.original_due_date).toLocaleDateString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">Used for performance measurement</div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Current Due Date</h3>
          <div className="text-sm font-medium text-slate-900">
            {new Date(action.current_due_date).toLocaleDateString()}
          </div>
          {aging && aging.extensionDays > 0 && (
            <div className="text-xs text-amber-600 mt-1">Extended by {aging.extensionDays} days</div>
          )}
        </div>
      </div>
    </div>
  );
}

function EvidenceTab({ action, onUpdate }: { action: ActionWithDetails; onUpdate: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Evidence Files</h3>
        <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          Upload Evidence
        </button>
      </div>

      {!action.evidence || action.evidence.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
          <Upload className="mx-auto mb-3 text-slate-400" size={48} />
          <p className="text-slate-600">No evidence uploaded yet</p>
          <p className="text-sm text-slate-500 mt-1">Upload files to document remediation</p>
        </div>
      ) : (
        <div className="space-y-3">
          {action.evidence.map((evidence) => (
            <div
              key={evidence.id}
              className="p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-slate-900">{evidence.file_name}</div>
                  {evidence.description && (
                    <p className="text-sm text-slate-600 mt-1">{evidence.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span>Uploaded: {new Date(evidence.created_at).toLocaleDateString()}</span>
                    {evidence.file_size && (
                      <span>Size: {(evidence.file_size / 1024).toFixed(1)} KB</span>
                    )}
                    <span className="font-mono text-slate-400">Hash: {evidence.file_hash.slice(0, 12)}...</span>
                  </div>
                </div>
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                  <Download size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryTab({ logs }: { logs: ActionLog[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Action History</h3>

      {logs.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
          <History className="mx-auto mb-3 text-slate-400" size={48} />
          <p className="text-slate-600">No history yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="p-4 bg-white border border-slate-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="font-medium text-slate-900">{log.event_type.replace(/_/g, ' ').toUpperCase()}</div>
                <div className="text-xs text-slate-500">
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
              {log.description && (
                <p className="text-sm text-slate-600">{log.description}</p>
              )}
              {log.previous_status && log.new_status && (
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded">{log.previous_status}</span>
                  <span className="text-slate-400">→</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{log.new_status}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
