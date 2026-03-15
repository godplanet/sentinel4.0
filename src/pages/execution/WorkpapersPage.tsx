import { WorkpaperCards } from '@/widgets/WorkpaperCards';
import { WorkpaperKanban } from '@/widgets/WorkpaperKanban';
import { WorkpaperWizard } from '@/features/workpaper-wizard/ui/WorkpaperWizard';
import { useUIStore } from '@/shared/stores/ui-store';
import { PageHeader } from '@/shared/ui';
import { WorkpaperGrid, type ApprovalStatus, type ControlRow } from '@/widgets/WorkpaperGrid';
import clsx from 'clsx';
import { Database, FileText, Filter, LayoutGrid, Kanban, Table2, Loader2, Plus, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useWorkpaperControlSet } from '@/entities/workpaper/api/fetchWorkpaperControlSet';
import { useWorkpaperMappings, type WorkpaperMapping } from '@/entities/workpaper/api/useWorkpaperMappings';

type ViewMode = 'table' | 'cards' | 'kanban';

const CATEGORY_FILTERS = [
 { value: 'ALL', label: 'Tümü' },
 { value: 'Access Control', label: 'Erişim Kontrolü' },
 { value: 'Network Security', label: 'Ağ Güvenliği' },
 { value: 'Business Continuity', label: 'İş Sürekliliği' },
 { value: 'Physical Security', label: 'Fiziksel Güvenlik' },
 { value: 'Change Management', label: 'Değişiklik Yönetimi' },
 { value: 'Data Protection', label: 'Veri Koruma' },
 { value: 'Endpoint Security', label: 'Uç Nokta Güvenliği' },
 { value: 'Governance', label: 'Yönetişim' },
 { value: 'Monitoring', label: 'İzleme' },
];

export default function WorkpapersPage() {
 const [searchTerm, setSearchTerm] = useState('');
 const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
 const [workpaperMap, setWorkpaperMap] = useState<Record<string, WorkpaperMapping>>({});
 const [mappedCount, setMappedCount] = useState(0);
 const [viewMode, setViewMode] = useState<ViewMode>('table');
 const [showWizard, setShowWizard] = useState(false);
 const { openDrawer } = useUIStore();

 const [controls, setControls] = useState<ControlRow[]>([]);
 const { data: controlSetData, isLoading: controlSetLoading } = useWorkpaperControlSet();
 const { data: fetchedMap, isLoading: dbLoading } = useWorkpaperMappings();

 useEffect(() => {
 if (!controlSetData) return;
 const list = fetchedMap
 ? (controlSetData || []).map((c) => {
 const wpInfo = fetchedMap[c.control_id];
 return wpInfo ? { ...c, approval_status: wpInfo.approval_status } : c;
 })
 : controlSetData;
 setControls(list);
 }, [controlSetData, fetchedMap]);

 useEffect(() => {
 if (fetchedMap) {
 setWorkpaperMap(fetchedMap);
 setMappedCount(Object.keys(fetchedMap).length);
 }
 }, [fetchedMap]);

 const filteredControls = useMemo(() => {
 let result = controls;

 if (categoryFilter !== 'ALL') {
      result = (result || []).filter((r) => r.category === categoryFilter);
    }
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'in_progress') {
        result = (result || []).filter((r) => !r.approval_status || r.approval_status === 'in_progress');
      } else {
        result = (result || []).filter((r) => r.approval_status === statusFilter);
      }
    }
    if (riskFilter !== 'ALL') {
      result = (result || []).filter((r) => r.risk_level === riskFilter);
    }

 if (searchTerm) {
 const q = searchTerm.toLowerCase();
 result = (result || []).filter(r =>
 r.control_id.toLowerCase().includes(q) ||
 r.title.toLowerCase().includes(q) ||
 r.category.toLowerCase().includes(q)
 );
 }

 return result;
 }, [controls, searchTerm, categoryFilter]);

 const handleUpdate = useCallback((id: string, field: keyof ControlRow, value: unknown) => {
 setControls(prev => (prev || []).map(row =>
 row.id === id ? { ...row, [field]: value } : row
 ));
 }, []);

 const handleStatusChange = useCallback((workpaperId: string, status: string) => {
 setControls(prev => (prev || []).map(c => {
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

 const handleOpenDrawer = useCallback(
 (row: ControlRow) => {
 openDrawer('WORKPAPER_DETAIL', row.id, {
 row,
 onStatusChange: handleStatusChange,
 });
 },
 [openDrawer, handleStatusChange]
 );

 const handleListSelect = useCallback(
 (workpaperId: string) => {
 const row = controls.find((c) => c.id === workpaperId) ?? null;
 if (row) {
 openDrawer('WORKPAPER_DETAIL', workpaperId, {
 row,
 onStatusChange: handleStatusChange,
 });
 } else {
 const minimalRow: ControlRow = {
 id: workpaperId,
 control_id: workpaperId.slice(0, 8),
 title: 'Çalışma Kağıdı',
 description: '',
 category: 'Unknown',
 tod: 'NOT_STARTED',
 toe: 'NOT_STARTED',
 sample_size: 0,
 auditor: { id: '', name: '-', initials: '-', color: 'bg-slate-400' },
 risk_level: 'MEDIUM',
 approval_status: 'in_progress',
 };
 openDrawer('WORKPAPER_DETAIL', workpaperId, {
 row: minimalRow,
 onStatusChange: handleStatusChange,
 });
 }
 },
 [controls, openDrawer, handleStatusChange]
 );

 return (
 <div className="p-4 space-y-4 bg-canvas min-h-screen">
 <PageHeader
 title="Çalışma Kağıtları"
 description="Kontrol test matrisi ve denetim çalışma kağıtları yönetimi"
 icon={FileText}
 action={
 <div className="flex items-center gap-3">
 {/* Görünüm değiştirici */}
 <div className="flex items-center bg-surface border border-slate-200 rounded-lg p-1 shadow-sm">
 <button
                onClick={() => setViewMode('table')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all',
                  viewMode === 'table' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                <Table2 size={14} />
                Tablo
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all',
                  viewMode === 'cards' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                <LayoutGrid size={14} />
                Kartlar
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all',
                  viewMode === 'kanban' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                <Kanban size={14} />
                Kanban
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

 <div className="bg-surface rounded-xl border border-slate-200 shadow-sm">
 <div className="p-4 border-b border-slate-200">
 <div className="flex items-center gap-4">
 <div className="flex-1 relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
 <input
 type="text"
 placeholder="Kontrolleri ID, başlık veya kategoriye göre ara..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
 />
 </div>

 <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-500" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-surface text-sm font-medium"
              >
                <option value="ALL">Tüm Kategoriler</option>
                {(CATEGORY_FILTERS || []).filter(c => c.value !== 'ALL').map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-surface text-sm font-medium"
              >
                <option value="ALL">Tüm Aşama Durumları</option>
                <option value="in_progress">To Do / In Progress</option>
                <option value="prepared">Prepared</option>
                <option value="reviewed">Reviewed / Done</option>
              </select>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-surface text-sm font-medium"
              >
                <option value="ALL">Risk Seviyesi (Tümü)</option>
                <option value="HIGH">Kritik / Yüksek Risk</option>
                <option value="MEDIUM">Orta Risk</option>
                <option value="LOW">Düşük Risk</option>
              </select>
            </div>

 <div className="flex items-center gap-3">
 <div className="text-sm font-semibold text-slate-600">
 {filteredControls.length} kontrol
 </div>
 {dbLoading ? (
 <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 rounded-lg">
 <Loader2 size={12} className="animate-spin text-blue-500" />
 <span className="text-[10px] font-medium text-blue-600">DB Senkronizasyonu</span>
 </div>
 ) : (
 <div
 className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-lg"
 title={`${mappedCount} kontrol DB'deki çalışma kağıtlarına eşlendi`}
 >
 <Database size={12} className="text-emerald-500" />
 <span className="text-[10px] font-medium text-emerald-600">
 {mappedCount} eşlenmiş
 </span>
 </div>
 )}
 </div>
 </div>
 </div>

 {viewMode === 'table' && (
 <div className="p-4 bg-surface">
 {controlSetLoading ? (
 <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
 <Loader2 size={24} className="animate-spin" />
 <span className="font-medium">Kontrol seti yükleniyor…</span>
 </div>
 ) : (
 <WorkpaperGrid
 data={filteredControls}
 onUpdate={handleUpdate}
 onOpenDrawer={handleOpenDrawer}
 />
 )}
 </div>
 )}
 </div>

 {/* Liste görünümü */}
 {viewMode === 'list' && (
 <div className="bg-surface rounded-xl border border-slate-200 shadow-sm">
 <WorkpaperList onSelectWorkpaper={handleListSelect} />
 </div>
 )}

 <WorkpaperWizard
 isOpen={showWizard}
 onClose={() => setShowWizard(false)}
 auditSteps={[]}
 onCreateWorkpaper={async () => {}}
 />
 </div>
 );
}