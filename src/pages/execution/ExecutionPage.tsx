import { useParams, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/shared/ui';
import { AgileBoard } from '@/widgets/AgileBoard';
import { AuditStepsList } from '@/widgets/AuditStepsList';
import { ExecutionGrid } from '@/widgets/ExecutionGrid';
import { LayoutList, LayoutGrid, Table2 } from 'lucide-react';

type ViewMode = 'list' | 'kanban' | 'grid';

export default function ExecutionPage() {
  const { engagementId } = useParams<{ engagementId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const viewMode = (searchParams.get('view') as ViewMode) || 'list';

  const setViewMode = (mode: ViewMode) => {
    setSearchParams({ view: mode });
  };

  if (!engagementId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-600">Engagement ID bulunamadı</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-canvas">
      <PageHeader
        title="Denetim İcrası"
        subtitle="Çalışma kağıtları ve denetim adımlarını yönetin"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-surface border border-slate-200 rounded-lg shadow-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-l-lg ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-canvas'
                }`}
              >
                <LayoutList className="w-4 h-4" />
                Liste
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-l ${
                  viewMode === 'kanban'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'text-slate-700 hover:bg-canvas border-slate-200'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Kanban
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-r-lg border-l ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'text-slate-700 hover:bg-canvas border-slate-200'
                }`}
              >
                <Table2 className="w-4 h-4" />
                İcra Grid
              </button>
            </div>
          </div>
        }
      />

      <div className="flex-1 overflow-hidden">
        <div className="h-full px-6 py-4">
          {viewMode === 'kanban' ? (
            <AgileBoard engagementId={engagementId} />
          ) : viewMode === 'grid' ? (
            <ExecutionGrid />
          ) : (
            <AuditStepsList engagementId={engagementId} />
          )}
        </div>
      </div>
    </div>
  );
}
