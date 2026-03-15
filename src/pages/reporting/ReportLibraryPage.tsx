import type { ReportListItem } from '@/features/reporting/api/reports-api';
import { useReports } from '@/features/reporting/api/reports-api';
import { ReportCard } from '@/features/reporting/ui/ReportCard';
import { ReportFilterSidebar, type ReportFilters } from '@/features/reporting/ui/ReportFilterSidebar';
import { TemplateSelectorModal } from '@/features/reporting/ui/TemplateSelectorModal';
import clsx from 'clsx';
import {
 AlertCircle,
 AlertTriangle,
 Award,
 CheckCircle,
 ChevronLeft,
 ChevronRight,
 Clock,
 Eye,
 FileEdit,
 FileText,
 Gauge,
 History,
 LayoutGrid,
 List,
 Loader2,
 Plus, Search,
 Sparkles,
 Tag
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const DEFAULT_FILTERS: ReportFilters = {
 year: 'Tüm Yıllar',
 status: 'all',
 riskBand: 'all',
};

export type ReportLibraryTab = 'all' | 'draft' | 'review' | 'published';

const TABS: { id: ReportLibraryTab; label: string; icon: typeof LayoutGrid }[] = [
 { id: 'all', label: 'Tümü', icon: LayoutGrid },
 { id: 'draft', label: 'Taslaklar', icon: FileEdit },
 { id: 'review', label: 'İncelemede', icon: Eye },
 { id: 'published', label: 'Yayınlananlar', icon: CheckCircle },
];

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const STATUS_META: Record<string, { label: string; color: string }> = {
 draft: { label: 'Taslak', color: 'bg-slate-100 text-slate-600' },
 review: { label: 'İncelemede', color: 'bg-blue-100 text-blue-700' },
 published: { label: 'Yayınlandı', color: 'bg-emerald-100 text-emerald-700' },
 archived: { label: 'Arşiv', color: 'bg-slate-200 text-slate-500' },
 revoked_amended: { label: 'İptal — Zeyilname', color: 'bg-red-100 text-red-700' },
};

const RISK_META: Record<string, { label: string; color: string }> = {
 high: { label: 'Yüksek', color: 'text-red-700 bg-red-50 border-red-200' },
 medium: { label: 'Orta', color: 'text-amber-800 bg-amber-50 border-amber-200' },
 low: { label: 'Düşük', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
};

function StatusBadge({ status }: { status: string }) {
 const s = status.toLowerCase();
 const meta = STATUS_META[s] ?? { label: status, color: 'bg-slate-100 text-slate-500' };
 return (
 <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-sans font-semibold', meta.color)}>
 {meta.label}
 </span>
 );
}

function GradeBadge({ grade }: { grade: string | null | undefined }) {
 if (!grade) return null;
 const isA = grade.startsWith('A');
 const isC = grade.startsWith('C');
 return (
 <span
 className={clsx(
 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-sans font-semibold border',
 isA ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
 isC ? 'bg-amber-50 border-amber-200 text-amber-800' :
 'bg-slate-100 border-slate-200 text-slate-700',
 )}
 >
 <Award size={10} />
 {grade}
 </span>
 );
}

interface ListRowProps {
 report: ReportListItem;
 onView: (id: string) => void;
 onEdit: (id: string) => void;
 index: number;
 isSelected: boolean;
 onSelect: (id: string) => void;
}

function ListRow({ report, onView, onEdit, index, isSelected, onSelect }: ListRowProps) {
 const status = (report.status ?? 'draft').toLowerCase();
 const isRevoked = status === 'revoked_amended';
 const isPublished = status === 'published';
 const riskMeta = report.risk_level ? RISK_META[report.risk_level] : null;
 const isEven = index % 2 === 0;

 return (
 <tr
 role="button"
 tabIndex={0}
 onClick={() => onSelect(report.id)}
 onKeyDown={(e) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault();
 onSelect(report.id);
 }
 }}
 className={clsx(
 'group border-b border-slate-100 transition-colors cursor-pointer',
 isEven ? 'bg-white' : 'bg-slate-50/80',
 isSelected && 'bg-blue-50 ring-1 ring-inset ring-blue-200',
 !isSelected && 'hover:bg-blue-50/50',
 isRevoked && 'opacity-70',
 )}
 >
 {/* Rapor Adı & Türü */}
 <td className="py-3 pl-5 pr-3 min-w-[260px] max-w-[340px]">
 <div className="flex flex-col gap-1">
 {report.report_type && (
 <span className="inline-flex items-center gap-1 text-[10px] font-sans font-semibold text-violet-700 bg-violet-50 border border-violet-200/80 rounded-md px-1.5 py-0.5 w-fit">
 <Tag size={9} />
 {report.report_type}
 </span>
 )}
 <span
 className={clsx(
 'text-sm font-sans font-semibold text-primary leading-snug',
 isRevoked && 'line-through text-slate-400',
 )}
 >
 {report.title}
 </span>
 {report.description && (
 <span className="text-[11px] text-slate-400 font-sans leading-tight line-clamp-1">
 {report.description}
 </span>
 )}
 </div>
 </td>

 {/* Denetim */}
 <td className="py-3 px-3 min-w-[160px] max-w-[220px]">
 <span className="text-xs font-sans text-slate-600 line-clamp-2">
 {report.engagement_title ?? <span className="text-slate-300">—</span>}
 </span>
 </td>

 {/* Risk & Not */}
 <td className="py-3 px-3 whitespace-nowrap">
 <div className="flex flex-col gap-1.5">
 {report.precise_score != null && (
 <span className="inline-flex items-center gap-1 text-[11px] font-sans font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200 rounded-md px-1.5 py-0.5 w-fit">
 <Gauge size={10} />
 {report.precise_score.toFixed(1)}
 </span>
 )}
 <GradeBadge grade={report.report_grade} />
 {report.previous_grade && (
 <span className="inline-flex items-center gap-1 text-[10px] font-sans text-slate-500 w-fit">
 <History size={9} />
 Önceki: {report.previous_grade.startsWith('A') ? 'A' : report.previous_grade.startsWith('B') ? 'B' : 'C'}
 </span>
 )}
 {riskMeta && (
 <span className={clsx('inline-flex items-center gap-1 text-[10px] font-sans font-semibold border rounded-md px-1.5 py-0.5 w-fit', riskMeta.color)}>
 <AlertTriangle size={9} />
 {riskMeta.label}
 </span>
 )}
 </div>
 </td>

 {/* Bulgu */}
 <td className="py-3 px-3 whitespace-nowrap text-center">
 {report.findings_count > 0 ? (
 <span className="inline-flex items-center gap-1 text-[11px] font-sans font-semibold text-amber-800 bg-amber-50 rounded-full px-2 py-0.5">
 <AlertTriangle size={10} />
 {report.findings_count}
 </span>
 ) : (
 <span className="text-slate-300 text-xs">—</span>
 )}
 </td>

 {/* Durum */}
 <td className="py-3 px-3 whitespace-nowrap">
 <StatusBadge status={report.status} />
 </td>

 {/* Tarih */}
 <td className="py-3 px-3 whitespace-nowrap text-xs text-slate-500 font-sans">
 <div className="flex items-center gap-1">
 <Clock size={11} className="text-slate-400" />
 {new Date(report.published_at ?? report.updated_at ?? report.created_at).toLocaleDateString('tr-TR', {
 day: 'numeric', month: 'short', year: 'numeric',
 })}
 </div>
 </td>

 {/* İşlemler */}
 <td className="py-3 pl-2 pr-5 whitespace-nowrap">
 <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
 <button
 type="button"
 onClick={(e) => {
 e.stopPropagation();
 onView(report.id);
 }}
 className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-sans font-semibold rounded-lg transition-colors"
 >
 <Eye size={11} />
 Görüntüle
 </button>
 <button
 type="button"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(report.id);
 }}
 disabled={isPublished || isRevoked}
 className={clsx(
 'flex items-center gap-1 px-2.5 py-1.5 border text-xs font-sans font-semibold rounded-lg transition-colors',
 isPublished || isRevoked
 ? 'border-slate-200 text-slate-300 cursor-not-allowed'
 : 'border-slate-300 text-slate-600 hover:bg-slate-100',
 )}
 >
 <FileEdit size={11} />
 Düzenle
 </button>
 </div>
 </td>
 </tr>
 );
}

export default function ReportLibraryPage() {
 const navigate = useNavigate();
 const [searchParams, setSearchParams] = useSearchParams();
 const { reports, isLoading, error, refetch } = useReports();
 const [templateModalOpen, setTemplateModalOpen] = useState(false);
 const [filters, setFilters] = useState<ReportFilters>(DEFAULT_FILTERS);
 const [search, setSearch] = useState('');
 const [activeTab, setActiveTab] = useState<ReportLibraryTab>('all');
 /* Görünüm URL'den: menüden ilk açılışta param yok = kart; listeden geri dönünce ?view=list = liste */
 const viewMode = searchParams.get('view') === 'list' ? 'list' : 'grid';
 const setViewMode = (mode: 'grid' | 'list') => {
 setSearchParams(mode === 'grid' ? {} : { view: 'list' }, { replace: true });
 };
 const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
 const [currentPage, setCurrentPage] = useState(1);
 const [itemsPerPage, setItemsPerPage] = useState(25);

 const statusCounts = useMemo(() => {
 const counts: Record<string, number> = {};
 reports.forEach((r) => {
 const s = (r.status ?? 'draft').toLowerCase();
 counts[s] = (counts[s] ?? 0) + 1;
 });
 return counts;
 }, [reports]);

 const tabCounts = useMemo(() => ({
 all: reports.length,
 draft: statusCounts.draft ?? 0,
 review: statusCounts.review ?? 0,
 published: (statusCounts.published ?? 0) + (statusCounts.archived ?? 0),
 }), [reports.length, statusCounts]);

 const filteredReports = useMemo(() => {
 return (reports || []).filter((r) => {
 const status = (r.status ?? 'draft').toLowerCase();
 if (activeTab !== 'all') {
 if (activeTab === 'published' && status !== 'published' && status !== 'archived') return false;
 if (activeTab !== 'published' && status !== activeTab) return false;
 }
 if (filters.status !== 'all' && status !== filters.status.toLowerCase()) return false;
 if (filters.year !== 'Tüm Yıllar') {
 const year = new Date(r.created_at).getFullYear().toString();
 if (year !== filters.year) return false;
 }
 if (filters.riskBand !== 'all' && r.engagement_risk_score != null) {
 const score = Number(r.engagement_risk_score);
 if (filters.riskBand === 'high' && score < 70) return false;
 if (filters.riskBand === 'medium' && (score < 40 || score >= 70)) return false;
 if (filters.riskBand === 'low' && score >= 40) return false;
 }
 if (filters.riskBand !== 'all' && r.engagement_risk_score == null) return false;
 if (search.trim()) {
 const q = search.toLowerCase();
 const inTitle = r.title.toLowerCase().includes(q);
 const inDesc = (r.description ?? '').toLowerCase().includes(q);
 const inEng = (r.engagement_title ?? '').toLowerCase().includes(q);
 if (!inTitle && !inDesc && !inEng) return false;
 }
 return true;
 });
 }, [reports, filters, search, activeTab]);

 const totalPages = Math.max(1, Math.ceil(filteredReports.length / itemsPerPage));
 const safePage = Math.min(currentPage, totalPages);
 const startIdx = (safePage - 1) * itemsPerPage;
 const endIdx = Math.min(startIdx + itemsPerPage, filteredReports.length);
 const paginatedReports = filteredReports.slice(startIdx, endIdx);

 const handlePageChange = (page: number) => {
 setCurrentPage(Math.max(1, Math.min(page, totalPages)));
 };
 const handleItemsPerPageChange = (n: number) => {
 setItemsPerPage(n);
 setCurrentPage(1);
 };
 const handleTabChange = (tab: ReportLibraryTab) => {
 setActiveTab(tab);
 setCurrentPage(1);
 };
 const handleView = (id: string) => navigate(`/reporting/zen-editor/${id}`);
 const handleEdit = (id: string) => navigate(`/reporting/zen-editor/${id}`);

 /* Sayfa numarası listesi (max 7 görünür) */
 const pageNumbers = useMemo(() => {
 if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
 const pages: (number | null)[] = [];
 const near = new Set([1, totalPages, safePage - 1, safePage, safePage + 1].filter((p) => p >= 1 && p <= totalPages));
 let prev: number | null = null;
 Array.from(near).sort((a, b) => a - b).forEach((p) => {
 if (prev !== null && p - prev > 1) pages.push(null);
 pages.push(p);
 prev = p;
 });
 return pages;
 }, [totalPages, safePage]);

 return (
 <div className="flex flex-col h-full bg-canvas">
 {/* ── Başlık + Sekmeler + Arama ── */}
 <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm px-4 py-5 print:hidden">
 <div className="flex items-center justify-between gap-4 flex-wrap">
 <div className="flex items-center gap-3">
 <div className="p-2.5 bg-slate-100 rounded-xl shadow-inner">
 <FileText size={20} className="text-slate-600" />
 </div>
 <div>
 <h1 className="font-sans font-bold text-primary text-xl leading-tight">
 Rapor Kütüphanesi
 </h1>
 <p className="text-sm font-sans text-slate-500 mt-0.5">
 Tüm denetim raporları, taslaklar ve mühürlü belgeler
 </p>
 </div>
 </div>
 <button
 onClick={() => setTemplateModalOpen(true)}
 className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-sans font-semibold text-sm shadow-md hover:shadow-lg transition-all"
 >
 <Plus size={18} />
 Yeni Rapor Oluştur
 </button>
 </div>

 {/* Sekmeler */}
 <div className="mt-5 flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80 w-fit">
 {TABS.map((tab) => {
 const count = tabCounts[tab.id];
 const isActive = activeTab === tab.id;
 const Icon = tab.icon;
 return (
 <button
 key={tab.id}
 onClick={() => handleTabChange(tab.id)}
 className={clsx(
 'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-sans font-semibold transition-all',
 isActive
 ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80'
 : 'text-slate-600 hover:bg-white/60 hover:text-slate-800',
 )}
 >
 <Icon size={16} className="shrink-0" />
 {tab.label}
 <span className={clsx('min-w-[1.25rem] inline-flex justify-center items-center px-1.5 py-0.5 rounded-full text-xs font-bold', isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200/80 text-slate-600')}>
 {count}
 </span>
 </button>
 );
 })}
 </div>

 {/* Arama + Görünüm Toggle */}
 <div className="mt-4 flex items-center gap-3 flex-wrap">
 <div className="relative flex-1 min-w-[200px] max-w-xl">
 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
 <input
 type="text"
 value={search}
 onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
 placeholder="Rapor ara (başlık, açıklama, denetim adı)"
 className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-sans text-slate-700 placeholder-slate-400 bg-surface focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors"
 />
 </div>

 {/* Görünüm Toggle */}
 <div className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200 gap-0.5">
 <button
 onClick={() => setViewMode('list')}
 className={clsx(
 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-sans font-semibold transition-all',
 viewMode === 'list'
 ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
 : 'text-slate-500 hover:text-slate-700',
 )}
 title="Liste görünümü"
 >
 <List size={14} />
 Liste
 </button>
 <button
 onClick={() => setViewMode('grid')}
 className={clsx(
 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-sans font-semibold transition-all',
 viewMode === 'grid'
 ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
 : 'text-slate-500 hover:text-slate-700',
 )}
 title="Kart görünümü"
 >
 <LayoutGrid size={14} />
 Kart
 </button>
 </div>
 </div>
 </div>

 {/* ── İçerik alanı ── */}
 <div className="flex flex-1 overflow-hidden">
 <div className="print:hidden">
 <ReportFilterSidebar
 filters={filters}
 onChange={(f) => { setFilters(f); setCurrentPage(1); }}
 statusCounts={statusCounts}
 totalCount={reports.length}
 />
 </div>

 <main className="flex flex-col flex-1 overflow-hidden">
 <div className="flex-1 overflow-y-auto p-4">
 {error && (
 <div className="mb-4 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-sans">
 <AlertCircle size={16} className="flex-shrink-0" />
 {typeof error === 'string' ? error : (error as Error)?.message ?? String(error)}
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
 <p className="text-sm font-sans text-slate-400 mb-4 max-w-xs">
 {search || filters.status !== 'all'
 ? 'Filtreleri değiştirmeyi veya arama terimini güncellemeyi deneyin.'
 : 'İlk raporunuzu bir şablonla oluşturmak için aşağıdaki butona tıklayın.'}
 </p>
 {!search && filters.status === 'all' && (
 <>
 <div className="flex flex-col sm:flex-row items-center gap-3">
 <button
 onClick={() => refetch()}
 disabled={isLoading}
 className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-sans font-medium text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
 >
 <Loader2 size={14} className={isLoading ? 'animate-spin' : ''} />
 Listeyi yenile
 </button>
 <button
 onClick={() => setTemplateModalOpen(true)}
 className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-sans font-semibold text-sm"
 >
 <Plus size={15} />
 Yeni Rapor Oluştur
 </button>
 </div>
 <p className="text-xs font-sans text-slate-400 mt-4 max-w-sm">
 Seed verisi yüklediyseniz ve hâlâ boşsa:{' '}
 <code className="bg-slate-100 px-1 rounded text-slate-600">supabase db reset</code>{' '}
 ile veritabanını sıfırlayıp seed'i tekrar çalıştırın.
 </p>
 </>
 )}
 </div>
 ) : (
 <>
 {/* Sonuç sayısı satırı */}
 <div className="flex items-center justify-between gap-4 mb-4">
 <p className="text-sm font-sans text-slate-500">
 <span className="font-semibold text-slate-700">{filteredReports.length}</span> rapordan{' '}
 <span className="font-semibold text-slate-700">{startIdx + 1}–{endIdx}</span> arası gösteriliyor
 </p>
 </div>

 {/* ── LİSTE görünümü ── */}
 {viewMode === 'list' && (
 <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-surface">
 <table className="w-full text-left">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-200">
 <th className="py-3 pl-5 pr-3 text-[11px] font-sans font-semibold uppercase tracking-widest text-slate-500">Rapor Adı & Türü</th>
 <th className="py-3 px-3 text-[11px] font-sans font-semibold uppercase tracking-widest text-slate-500">Denetim</th>
 <th className="py-3 px-3 text-[11px] font-sans font-semibold uppercase tracking-widest text-slate-500">Risk & Not</th>
 <th className="py-3 px-3 text-[11px] font-sans font-semibold uppercase tracking-widest text-slate-500 text-center">Bulgu</th>
 <th className="py-3 px-3 text-[11px] font-sans font-semibold uppercase tracking-widest text-slate-500">Durum</th>
 <th className="py-3 px-3 text-[11px] font-sans font-semibold uppercase tracking-widest text-slate-500">Tarih</th>
 <th className="py-3 pl-2 pr-5 text-[11px] font-sans font-semibold uppercase tracking-widest text-slate-500">İşlemler</th>
 </tr>
 </thead>
 <tbody>
 {(paginatedReports || []).map((report, index) => (
 <ListRow
 key={report.id}
 report={report}
 onView={handleView}
 onEdit={handleEdit}
 index={index}
 isSelected={selectedReportId === report.id}
 onSelect={(id) => setSelectedReportId((prev) => (prev === id ? null : id))}
 />
 ))}
 </tbody>
 </table>
 </div>
 )}

 {/* ── KART görünümü ── */}
 {viewMode === 'grid' && (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 {(paginatedReports || []).map((report) => (
 <ReportCard
 key={report.id}
 report={report}
 onView={handleView}
 onEdit={handleEdit}
 />
 ))}
 </div>
 )}
 </>
 )}
 </div>

 {/* ── Sayfalama barı ── */}
 {filteredReports.length > 0 && (
 <div className="flex-shrink-0 border-t border-slate-200 bg-surface/90 backdrop-blur-sm px-4 py-3">
 <div className="flex items-center justify-between gap-4 flex-wrap">
 {/* Sol: kayıt bilgisi */}
 <p className="text-xs font-sans text-slate-500 whitespace-nowrap">
 Toplam <span className="font-semibold text-slate-700">{filteredReports.length}</span> kayıttan{' '}
 <span className="font-semibold text-slate-700">{startIdx + 1}–{endIdx}</span> arası gösteriliyor
 </p>

 {/* Orta: sayfa numaraları */}
 <div className="flex items-center gap-1">
 <button
 onClick={() => handlePageChange(safePage - 1)}
 disabled={safePage === 1}
 className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
 >
 <ChevronLeft size={14} />
 </button>

 {(pageNumbers || []).map((p, i) =>
 p === null ? (
 <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">…</span>
 ) : (
 <button
 key={p}
 onClick={() => handlePageChange(p)}
 className={clsx(
 'w-8 h-8 flex items-center justify-center rounded-lg text-sm font-sans font-semibold transition-colors border',
 safePage === p
 ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
 : 'border-slate-200 text-slate-600 hover:bg-slate-100',
 )}
 >
 {p}
 </button>
 )
 )}

 <button
 onClick={() => handlePageChange(safePage + 1)}
 disabled={safePage === totalPages}
 className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
 >
 <ChevronRight size={14} />
 </button>
 </div>

 {/* Sağ: sayfa başı seçici */}
 <div className="flex items-center gap-2">
 <span className="text-xs font-sans text-slate-500 whitespace-nowrap">Sayfa başı:</span>
 <select
 value={itemsPerPage}
 onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
 className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-sans font-semibold text-slate-700 bg-surface focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
 >
 {(ITEMS_PER_PAGE_OPTIONS || []).map((n) => (
 <option key={n} value={n}>{n}</option>
 ))}
 </select>
 </div>
 </div>
 </div>
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
