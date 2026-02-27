import { useEffect, useState } from 'react';
import { findingApi, assignmentApi, type FindingWithAssignment } from '@/entities/finding';
import { AlertCircle, Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface MyAssignmentsProps {
  onSelectFinding?: (finding: FindingWithAssignment) => void;
}

export function MyAssignments({ onSelectFinding }: MyAssignmentsProps) {
  const [findings, setFindings] = useState<FindingWithAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    loadMyAssignments();
  }, []);

  async function loadMyAssignments() {
    setIsLoading(true);
    try {
      const data = await findingApi.getAll();
      setFindings(data.filter(f => f.assignment));
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredFindings = findings.filter((f) => {
    if (filterStatus === 'ALL') return true;
    return f.assignment?.portal_status === filterStatus;
  });

  const stats = {
    total: findings.length,
    pending: findings.filter((f) => f.assignment?.portal_status === 'PENDING').length,
    agreed: findings.filter((f) => f.assignment?.portal_status === 'AGREED').length,
    disagreed: findings.filter((f) => f.assignment?.portal_status === 'DISAGREED').length,
  };

  const severityColors = {
    CRITICAL: 'bg-red-100 text-red-800 border-red-300',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    LOW: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  const severityLabels = {
    CRITICAL: 'Kritik',
    HIGH: 'Yüksek',
    MEDIUM: 'Orta',
    LOW: 'Düşük',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
              <div className="text-sm text-slate-500">Toplam Atama</div>
            </div>
            <AlertCircle className="w-8 h-8 text-slate-400" />
          </div>
        </div>

        <div className="bg-white border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-800">{stats.pending}</div>
              <div className="text-sm text-yellow-700">Bekleyen</div>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-800">{stats.agreed}</div>
              <div className="text-sm text-green-700">Kabul Edildi</div>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-800">{stats.disagreed}</div>
              <div className="text-sm text-red-700">Reddedildi</div>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Atanan Bulgular</h2>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Tüm Durumlar</option>
          <option value="PENDING">Bekleyen</option>
          <option value="AGREED">Kabul Edildi</option>
          <option value="DISAGREED">Reddedildi</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Yükleniyor...</div>
      ) : filteredFindings.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          {filterStatus !== 'ALL' ? 'Bu durumda bulgu yok' : 'Size atanmış bulgu bulunmamaktadır'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFindings.map((finding) => (
            <div
              key={finding.id}
              onClick={() => onSelectFinding?.(finding)}
              className="bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {finding.code}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded border ${
                        severityColors[finding.severity]
                      }`}
                    >
                      {severityLabels[finding.severity]}
                    </span>
                    {finding.assignment && (
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          finding.assignment.priority === 'ACIL'
                            ? 'bg-red-100 text-red-800'
                            : finding.assignment.priority === 'ONCELIKLI'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {finding.assignment.priority}
                      </span>
                    )}
                  </div>

                  <h3 className="font-medium text-slate-900">{finding.title}</h3>

                  {finding.detection_html && (
                    <div
                      className="text-sm text-slate-600 line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: finding.detection_html.substring(0, 200) + '...',
                      }}
                    />
                  )}
                </div>

                {finding.assignment && (
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        finding.assignment.portal_status === 'AGREED'
                          ? 'bg-green-100 text-green-800'
                          : finding.assignment.portal_status === 'DISAGREED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {finding.assignment.portal_status === 'PENDING'
                        ? 'Yanıt Bekliyor'
                        : finding.assignment.portal_status === 'AGREED'
                        ? 'Kabul Edildi'
                        : 'Reddedildi'}
                    </span>
                    {finding.assignment.is_locked && (
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        Kilitli
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
