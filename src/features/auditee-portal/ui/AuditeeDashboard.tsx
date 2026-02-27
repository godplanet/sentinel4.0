import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutList,
  LayoutGrid,
  KanbanSquare,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '@/shared/api/supabase';

interface Finding {
  id: string;
  code?: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  stage: string;
  dueDate: string;
  status: string;
}

type ViewMode = 'list' | 'card' | 'kanban';

export const AuditeeDashboard = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFindings();
  }, []);

  const loadFindings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('audit_findings')
        .select('id, title, severity, process_stage, remediation_date, details')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedFindings: Finding[] = (data || []).map((f) => {
        const code = f.details?.finding_code || `AUD-${f.id.slice(0, 8)}`;
        const stage = f.process_stage || 'SENT_TO_AUDITEE';

        let status = 'Bekleyen';
        if (stage.includes('ACCEPTED')) status = 'Kabul Edildi';
        else if (stage.includes('REJECTED')) status = 'Reddedildi';
        else if (stage.includes('REMEDIATION')) status = 'Giderimde';

        return {
          id: f.id,
          code,
          title: f.title,
          severity: (f.severity?.toUpperCase() || 'MEDIUM') as any,
          stage,
          dueDate: f.remediation_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          status,
        };
      });

      setFindings(formattedFindings);
    } catch (error) {
      console.error('Error loading findings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFindings = useMemo(() => {
    return findings.filter((finding) => {
      const matchesSearch =
        finding.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (finding.code?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesSeverity = selectedSeverity === 'all' || finding.severity === selectedSeverity;
      const matchesStatus = selectedStatus === 'all' || finding.status === selectedStatus;
      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [findings, searchQuery, selectedSeverity, selectedStatus]);

  const statsByStatus = useMemo(() => {
    const stats = {
      total: findings.length,
      pending: findings.filter((f) => f.status === 'Bekleyen').length,
      accepted: findings.filter((f) => f.status === 'Kabul Edildi').length,
      rejected: findings.filter((f) => f.status === 'Reddedildi').length,
    };
    return stats;
  }, [findings]);

  const handleFindingClick = (finding: Finding) => {
    navigate(`/auditee-portal/finding/${finding.id}`);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-600 text-white';
      case 'HIGH':
        return 'bg-orange-600 text-white';
      case 'MEDIUM':
        return 'bg-yellow-600 text-white';
      case 'LOW':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'KRİTİK';
      case 'HIGH':
        return 'YÜKSEK';
      case 'MEDIUM':
        return 'ORTA';
      case 'LOW':
        return 'DÜŞÜK';
      default:
        return severity;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Bekleyen':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'Kabul Edildi':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Reddedildi':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const kanbanColumns = useMemo(() => {
    return [
      {
        id: 'pending',
        title: 'Toplam Atanma',
        findings: findings,
      },
      {
        id: 'reviewing',
        title: 'Bekleyen',
        findings: findings.filter((f) => f.status === 'Bekleyen'),
      },
      {
        id: 'accepted',
        title: 'Kabul Edildi',
        findings: findings.filter((f) => f.status === 'Kabul Edildi'),
      },
      {
        id: 'rejected',
        title: 'Reddedildi',
        findings: findings.filter((f) => f.status === 'Reddedildi'),
      },
    ];
  }, [findings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Bulgular yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Toplam Atanma</div>
              <div className="text-3xl font-bold text-gray-900">{statsByStatus.total}</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Bekleyen</div>
              <div className="text-3xl font-bold text-orange-600">{statsByStatus.pending}</div>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Kabul Edildi</div>
              <div className="text-3xl font-bold text-green-600">{statsByStatus.accepted}</div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Reddedildi</div>
              <div className="text-3xl font-bold text-red-600">{statsByStatus.rejected}</div>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white/80 backdrop-blur-xl rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Bulgu ara..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tüm Seviyeler</option>
              <option value="CRITICAL">Kritik</option>
              <option value="HIGH">Yüksek</option>
              <option value="MEDIUM">Orta</option>
              <option value="LOW">Düşük</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="Bekleyen">Bekleyen</option>
              <option value="Kabul Edildi">Kabul Edildi</option>
              <option value="Reddedildi">Reddedildi</option>
            </select>
          </div>

          <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={clsx(
                'p-2 rounded transition-colors',
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <LayoutList className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={clsx(
                'p-2 rounded transition-colors',
                viewMode === 'card'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={clsx(
                'p-2 rounded transition-colors',
                viewMode === 'kanban'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <KanbanSquare className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white/80 backdrop-blur-xl rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Kod
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Başlık
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Seviye
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Son Tarih
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFindings.map((finding) => (
                  <tr
                    key={finding.id}
                    onClick={() => handleFindingClick(finding)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-600">{finding.code}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{finding.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={clsx(
                          'px-2 py-1 text-xs font-semibold rounded',
                          getSeverityColor(finding.severity)
                        )}
                      >
                        {getSeverityLabel(finding.severity)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(finding.status)}
                        <span className="text-sm text-gray-700">{finding.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(finding.dueDate).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredFindings.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Size atanmış bulgu bulunmamaktadır</p>
            </div>
          )}
        </div>
      )}

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-3 gap-4">
          {filteredFindings.map((finding) => (
            <div
              key={finding.id}
              onClick={() => handleFindingClick(finding)}
              className="bg-white/80 backdrop-blur-xl rounded-lg border border-gray-200 p-6 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {finding.code}
                </span>
                <span
                  className={clsx(
                    'px-2 py-1 text-xs font-semibold rounded',
                    getSeverityColor(finding.severity)
                  )}
                >
                  {getSeverityLabel(finding.severity)}
                </span>
              </div>

              <h3 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2">
                {finding.title}
              </h3>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  {getStatusIcon(finding.status)}
                  <span className="text-sm text-gray-700">{finding.status}</span>
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Calendar className="w-3 h-3" />
                  {new Date(finding.dueDate).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </div>
              </div>
            </div>
          ))}

          {filteredFindings.length === 0 && (
            <div className="col-span-3 text-center py-12 bg-white/80 backdrop-blur-xl rounded-lg border border-gray-200">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Size atanmış bulgu bulunmamaktadır</p>
            </div>
          )}
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-4 gap-4">
          {kanbanColumns.map((column) => (
            <div key={column.id} className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">{column.title}</h3>
                <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded">
                  {column.findings.length}
                </span>
              </div>

              <div className="space-y-3">
                {column.findings.map((finding) => (
                  <div
                    key={finding.id}
                    onClick={() => handleFindingClick(finding)}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-mono text-gray-600">{finding.code}</span>
                      <span
                        className={clsx(
                          'px-2 py-0.5 text-xs font-semibold rounded',
                          getSeverityColor(finding.severity)
                        )}
                      >
                        {finding.severity[0]}
                      </span>
                    </div>

                    <p className="text-sm text-gray-900 font-medium mb-3 line-clamp-2">
                      {finding.title}
                    </p>

                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Calendar className="w-3 h-3" />
                      {new Date(finding.dueDate).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
