import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '@/shared/api/supabase';
import { TemplateSelectorModal } from '@/features/reporting/ui/TemplateSelectorModal';
import { ReportFilterSidebar, type ReportFilters } from '@/features/reporting/ui/ReportFilterSidebar';
import { ReportCard, type ReportCardData } from '@/features/reporting/ui/ReportCard';

const DEFAULT_FILTERS: ReportFilters = {
  year: 'Tüm Yıllar',
  reportType: 'all',
  riskLevel: 'all',
  status: 'all',
};

export default function ReportLibraryPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>(DEFAULT_FILTERS);
  const [search, setSearch] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('m6_reports')
      .select(
        'id, title, status, report_type, risk_level, auditor_name, finding_count, created_at, executive_summary, hash_seal',
      )
      .order('created_at', { ascending: false });
    if (err) {
      setError(err.message);
    } else {
      setReports((data ?? []) as ReportCardData[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach((r) => {
      const t = r.report_type ?? 'blank';
      counts[t] = (counts[t] ?? 0) + 1;
    });
    return counts;
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (filters.reportType !== 'all') {
        const type = r.report_type ?? 'blank';
        if (type !== filters.reportType) return false;
      }
      if (filters.riskLevel !== 'all') {
        if ((r.risk_level ?? 'medium') !== filters.riskLevel) return false;
      }
      if (filters.status !== 'all') {
        if (r.status !== filters.status) return false;
      }
      if (filters.year !== 'Tüm Yıllar') {
        const year = new Date(r.created_at).getFullYear().toString();
        if (year !== filters.year) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const inTitle = r.title.toLowerCase().includes(q);
        const inAuditor = (r.auditor_name ?? '').toLowerCase().includes(q);
        if (!inTitle && !inAuditor) return false;
      }
      return true;
    });
  }, [reports, filters, search]);

  const handleView = (id: string) => navigate(`/reporting/zen-editor/${id}`);
  const handleEdit = (id: string) => navigate(`/reporting/zen-editor/${id}`);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4 print:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <FileText size={18} className="text-slate-600" />
            </div>
            <div>
              <h1 className="font-sans font-bold text-slate-900 text-lg leading-tight">
                Rapor Kütüphanesi
              </h1>
              <p className="text-xs font-sans text-slate-500 mt-0.5">
                Tüm denetim raporları, taslaklar ve yayımlanmış belgeler
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
            placeholder="Rapor ara... (başlık, açıklama, denetçi)"
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-sans text-slate-700 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="print:hidden">
          <ReportFilterSidebar
            filters={filters}
            onChange={setFilters}
            typeCounts={typeCounts}
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

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="text-slate-400 animate-spin" />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles size={28} className="text-slate-300" />
              </div>
              <h3 className="text-base font-sans font-semibold text-slate-700 mb-2">
                {search || filters.reportType !== 'all' || filters.status !== 'all'
                  ? 'Arama kriterlerine uyan rapor bulunamadı'
                  : 'Henüz rapor yok'}
              </h3>
              <p className="text-sm font-sans text-slate-400 mb-6 max-w-xs">
                {search || filters.reportType !== 'all' || filters.status !== 'all'
                  ? 'Filtreleri değiştirmeyi veya arama terimini güncellemeyi deneyin.'
                  : 'İlk raporunuzu bir şablonla oluşturmak için aşağıdaki butona tıklayın.'}
              </p>
              {!search && filters.reportType === 'all' && filters.status === 'all' && (
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
