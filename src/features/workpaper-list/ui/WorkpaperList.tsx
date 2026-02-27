import { useWorkpaperStore } from '@/entities/workpaper';
import type { Workpaper } from '@/entities/workpaper';

interface WorkpaperListProps {
  engagementId?: string;
  onSelectWorkpaper?: (workpaperId: string) => void;
}

export function WorkpaperList({ onSelectWorkpaper }: WorkpaperListProps) {
  const { workpapers, auditSteps, getStepById, getFindingsByWorkpaper } = useWorkpaperStore();

  const getStatusColor = (status: Workpaper['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'review':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'finalized':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getTestStats = (workpaper: Workpaper) => {
    const results = workpaper.data.test_results || {};
    const total = Object.keys(results).length;
    const passed = Object.values(results).filter((r) => r === 'pass').length;
    const failed = Object.values(results).filter((r) => r === 'fail').length;
    const na = Object.values(results).filter((r) => r === 'n/a').length;
    return { total, passed, failed, na };
  };

  if (workpapers.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500 font-medium">No workpapers created yet</p>
          <p className="text-sm text-gray-400 mt-1">Workpapers will appear here once created</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {workpapers.map((workpaper) => {
        const step = getStepById(workpaper.step_id);
        const stats = getTestStats(workpaper);
        const findings = getFindingsByWorkpaper(workpaper.id);

        return (
          <div
            key={workpaper.id}
            className="bg-white/80 backdrop-blur-xl rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
            onClick={() => onSelectWorkpaper?.(workpaper.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{step?.title || 'Unknown Step'}</h3>
                  {findings.length > 0 && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                      {findings.length} {findings.length === 1 ? 'Finding' : 'Findings'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{step?.step_code}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(workpaper.status)}`}>
                {workpaper.status}
              </span>
            </div>

            {stats.total > 0 && (
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-600">{stats.passed} Passed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-xs text-gray-600">{stats.failed} Failed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <span className="text-xs text-gray-600">{stats.na} N/A</span>
                </div>
              </div>
            )}

            {workpaper.data.notes && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{workpaper.data.notes}</p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <span className="text-xs text-gray-500">
                Updated: {new Date(workpaper.updated_at).toLocaleDateString()}
              </span>
              <span className="text-xs text-gray-500">Version {workpaper.version}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
