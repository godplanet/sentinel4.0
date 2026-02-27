import { useState, useCallback, useMemo, useEffect } from 'react';
import { PageHeader } from '@/shared/ui';
import { WorkpaperGrid, type ControlRow, type ApprovalStatus } from '@/widgets/WorkpaperGrid';
import { WorkpaperSuperDrawer } from '@/widgets/WorkpaperSuperDrawer';
import { WorkpaperList } from '@/features/workpaper-list/ui/WorkpaperList';
import { WorkpaperWizard } from '@/features/workpaper-wizard/ui/WorkpaperWizard';
import { FileText, Search, Filter, Database, Loader2, LayoutGrid, List, Plus } from 'lucide-react';
import { supabase } from '@/shared/api/supabase';
import clsx from 'clsx';

type ViewMode = 'table' | 'list';

const CATEGORY_FILTERS = [
  'All',
  'Access Control',
  'Network Security',
  'Business Continuity',
  'Physical Security',
  'Change Management',
  'Data Protection',
  'Endpoint Security',
  'Governance',
  'Monitoring',
];

interface WorkpaperMapping {
  id: string;
  approval_status: ApprovalStatus;
}

export default function WorkpapersPage() {
  const [controls, setControls] = useState<ControlRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [drawerRow, setDrawerRow] = useState<ControlRow | null>(null);
  const [activeWorkpaperId, setActiveWorkpaperId] = useState<string | null>(null);
  const [workpaperMap, setWorkpaperMap] = useState<Record<string, WorkpaperMapping>>({});
  const [dbLoading, setDbLoading] = useState(true);
  const [mappedCount, setMappedCount] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    loadWorkpaperMappings();
  }, []);

  const loadWorkpaperMappings = async () => {
    try {
      setDbLoading(true);
      const { data, error } = await supabase
        .from('workpapers')
        .select('id, approval_status, data');

      if (error) throw error;
      if (!data) return;

      const map: Record<string, WorkpaperMapping> = {};
      for (const wp of data) {
        const controlRef = (wp.data as Record<string, unknown> | null)?.control_ref as string | undefined;
        if (controlRef) {
          map[controlRef] = {
            id: wp.id,
            approval_status: (wp.approval_status as ApprovalStatus) || 'in_progress',
          };
        }
      }

      setWorkpaperMap(map);
      setMappedCount(Object.keys(map).length);

      setControls(prev => prev.map(c => {
        const wpInfo = map[c.control_id];
        return wpInfo
          ? { ...c, approval_status: wpInfo.approval_status }
          : c;
      }));
    } catch {
      setWorkpaperMap({});
    } finally {
      setDbLoading(false);
    }
  };

  const filteredControls = useMemo(() => {
    let result = controls;

    if (categoryFilter !== 'All') {
      result = result.filter(r => r.category === categoryFilter);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(r =>
        r.control_id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [controls, searchTerm, categoryFilter]);

  const handleUpdate = useCallback((id: string, field: keyof ControlRow, value: unknown) => {
    setControls(prev => prev.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    ));
  }, []);

  const handleOpenDrawer = useCallback((row: ControlRow) => {
    const wpInfo = workpaperMap[row.control_id];
    setDrawerRow(row);
    setActiveWorkpaperId(wpInfo?.id || null);
  }, [workpaperMap]);

  const handleStatusChange = useCallback((workpaperId: string, status: string) => {
    setControls(prev => prev.map(c => {
      const wpInfo = workpaperMap[c.control_id];
      if (wpInfo?.id === workpaperId) {
        return { ...c, approval_status: status as ApprovalStatus };
      }
      return c;
    }));

    const entry = Object.entries(workpaperMap).find(([, v]) => v.id === workpaperId);
    if (entry) {
      setWorkpaperMap(prev => ({
        ...prev,
        [entry[0]]: { ...prev[entry[0]], approval_status: status as ApprovalStatus },
      }));
    }
  }, [workpaperMap]);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Çalışma Kağıtları"
        description="Kontrol test matrisi ve denetim çalışma kağıtları yönetimi"
        icon={FileText}
        action={
          <div className="flex items-center gap-3">
            {/* Görünüm değiştirici */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setViewMode('table')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all',
                  viewMode === 'table' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                <LayoutGrid size={14} />
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all',
                  viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                <List size={14} />
                Liste
              </button>
            </div>
            {/* Yeni Çalışma Kağıdı */}
            <button
              onClick={() => setShowWizard(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-md"
            >
              <Plus size={15} />
              Yeni Çalışma Kağıdı
            </button>
          </div>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search controls by ID, title, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-500" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium"
              >
                {CATEGORY_FILTERS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold text-slate-600">
                {filteredControls.length} controls
              </div>
              {dbLoading ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 rounded-lg">
                  <Loader2 size={12} className="animate-spin text-blue-500" />
                  <span className="text-[10px] font-medium text-blue-600">DB Sync</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-lg" title={`${mappedCount} controls mapped to workpapers in DB`}>
                  <Database size={12} className="text-emerald-500" />
                  <span className="text-[10px] font-medium text-emerald-600">{mappedCount} mapped</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {viewMode === 'table' && (
          <div className="p-4">
            <WorkpaperGrid
              data={filteredControls}
              onUpdate={handleUpdate}
              onOpenDrawer={handleOpenDrawer}
            />
          </div>
        )}
      </div>

      {/* Liste görünümü */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <WorkpaperList onSelectWorkpaper={(id) => setActiveWorkpaperId(id)} />
        </div>
      )}

      <WorkpaperSuperDrawer
        row={drawerRow}
        workpaperId={activeWorkpaperId}
        onClose={() => setDrawerRow(null)}
        onStatusChange={handleStatusChange}
      />

      <WorkpaperWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        auditSteps={[]}
        onCreateWorkpaper={async () => {}}
      />
    </div>
  );
}
