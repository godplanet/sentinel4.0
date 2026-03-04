import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useReports } from '@/features/reporting/api/reports-api';
import type { ReportListItem } from '@/features/reporting/api/reports-api';
import { TemplateSelectorModal } from '@/features/reporting/ui/TemplateSelectorModal';
import { ReportFilterSidebar, type ReportFilters } from '@/features/reporting/ui/ReportFilterSidebar';
import { ReportCard } from '@/features/reporting/ui/ReportCard';

const DEFAULT_FILTERS: ReportFilters = {
  year: 'Tüm Yıllar',
  status: 'all',
};

export default function ReportLibraryPage() {
  const navigate = useNavigate();
  const { reports, isLoading, error } = useReports();
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>(DEFAULT_FILTERS);
  const [search, setSearch] = useState('');

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach((r) => {
      const s = r.status ?? 'draft';
      counts[s] = (counts[s] ?? 0) + 1;
    });
    return counts;
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (filters.status !== 'all' && r.status !== filters.status) return false;
      if (filters.year !== 'Tüm Yıllar') {
        const year = new Date(r.created_at).getFullYear().toString();
        if (year !== filters.year) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const inTitle = r.title.toLowerCase().includes(q);
        const inDesc = (r.description ?? '').toLowerCase().includes(q);
        const inEng = (r.engagement_title ?? '').toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inEng) return false;
      }
      return true;
    });
  }, [reports, filters, search]);

  const handleView = (id: string) => navigate(`/reporting/zen-editor/${id}`);
  const handleEdit = (id: string) => navigate(`/reporting/zen-editor/${id}`);

  return (
    <div className="flex flex-col h-full bg-canvas">
      <div className="flex-shrink-0 bg-surface border-b border-slate-200 px-6 py-4 print:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <FileText size={18} className="text-slate-600" />
            </div>
            <div>
              <h1 className="font-sans font-bold text-primary text-lg leading-tight">
                Rapor Kütüphanesi
              </h1>
              <p className="text-xs font-sans text-slate-500 mt-0.5">
                Tüm denetim raporları, taslaklar ve yayımlanmış belgeler (reports)
              </p>
            </div>
          </div>

          <button
            onClick={() => setTemplateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-sans font-semibold text-sm shadow-sm"
          >
            <Plus size={15} />
            Yeni Rapor Oluştur
          </button>
        </div>

        <div className="mt-4 relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rapor ara... (başlık, açıklama, denetim adı)"
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-sans text-slate-700 placeholder-slate-400 bg-surface focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="print:hidden">
          <ReportFilterSidebar
            filters={filters}
            onChange={setFilters}
            statusCounts={statusCounts}
            totalCount={reports.length}
          />
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-sans">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="text-slate-400 animate-spin" />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles size={28} className="text-slate-300" />
              </div>
              <h3 className="text-base font-sans font-semibold text-slate-700 mb-2">
                {search || filters.status !== 'all'
                  ? 'Arama kriterlerine uyan rapor bulunamadı'
                  : 'Henüz rapor yok'}
              </h3>
              <p className="text-sm font-sans text-slate-400 mb-6 max-w-xs">
                {search || filters.status !== 'all'
                  ? 'Filtreleri değiştirmeyi veya arama terimini güncellemeyi deneyin.'
                  : 'İlk raporunuzu bir şablonla oluşturmak için aşağıdaki butona tıklayın.'}
              </p>
              {!search && filters.status === 'all' && (
                <button
                  onClick={() => setTemplateModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-sans font-semibold text-sm"
                >
                  <Plus size={15} />
                  Yeni Rapor Oluştur
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs font-sans text-slate-400 mb-4">
                {filteredReports.length} rapor gösteriliyor
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onView={handleView}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      <TemplateSelectorModal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
      />
    </div>
  );
}
