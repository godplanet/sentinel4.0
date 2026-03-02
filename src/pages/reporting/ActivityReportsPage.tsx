/**
 * Faaliyet Raporları Sayfası
 * Geçmiş denetim komitesi sunumları ve faaliyet raporlarının listelenmesi
 */

import { useState } from 'react';
import { PageHeader } from '@/shared/ui';
import {
  FileText,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Eye,
  ChevronRight,
  LayoutGrid,
  List,
} from 'lucide-react';
import clsx from 'clsx';

type ReportStatus = 'ONAYLANDI' | 'INCELEMEDE' | 'TASLAK';
type ReportType = 'FAAALİYET' | 'KOMİTE' | 'BDDK' | 'YÖNETİM';
type ViewMode = 'grid' | 'list';

interface ActivityReport {
  id: string;
  title: string;
  type: ReportType;
  period: string;
  preparedBy: string;
  committee: string;
  status: ReportStatus;
  pageCount: number;
  createdAt: string;
  approvedAt?: string;
  findings: number;
  actions: number;
}

const MOCK_REPORTS: ActivityReport[] = [
  {
    id: 'rpt-001',
    title: '2026 Ocak-Şubat Dönemi Denetim Faaliyet Raporu',
    type: 'FAAALİYET',
    period: 'Ocak-Şubat 2026',
    preparedBy: 'Ayşe Kaya, Baş Denetçi',
    committee: 'Denetim Komitesi',
    status: 'ONAYLANDI',
    pageCount: 47,
    createdAt: '2026-02-15',
    approvedAt: '2026-02-22',
    findings: 14,
    actions: 28,
  },
  {
    id: 'rpt-002',
    title: 'Aralık 2025 Denetim Komitesi Sunumu - Yılsonu Değerlendirmesi',
    type: 'KOMİTE',
    period: 'Aralık 2025',
    preparedBy: 'Mehmet Demir, Denetim Müdürü',
    committee: 'Denetim Komitesi',
    status: 'ONAYLANDI',
    pageCount: 62,
    createdAt: '2025-12-10',
    approvedAt: '2025-12-18',
    findings: 22,
    actions: 41,
  },
  {
    id: 'rpt-003',
    title: '2025 BT Sistemleri Denetimi BDDK Uyum Raporu',
    type: 'BDDK',
    period: 'Kasım-Aralık 2025',
    preparedBy: 'Zeynep Arslan, BT Denetim Uzmanı',
    committee: 'BDDK',
    status: 'ONAYLANDI',
    pageCount: 89,
    createdAt: '2025-11-28',
    approvedAt: '2025-12-05',
    findings: 9,
    actions: 18,
  },
  {
    id: 'rpt-004',
    title: 'Kasım 2025 Dönemi Operasyonel Risk Faaliyet Raporu',
    type: 'FAAALİYET',
    period: 'Kasım 2025',
    preparedBy: 'Ali Yılmaz, Risk Uzmanı',
    committee: 'Risk Komitesi',
    status: 'ONAYLANDI',
    pageCount: 38,
    createdAt: '2025-11-20',
    approvedAt: '2025-11-28',
    findings: 7,
    actions: 15,
  },
  {
    id: 'rpt-005',
    title: 'Ekim 2025 Kredi Denetimi Komite Sunumu',
    type: 'KOMİTE',
    period: 'Ekim 2025',
    preparedBy: 'Fatma Şahin, Kıdemli Denetçi',
    committee: 'Denetim Komitesi',
    status: 'ONAYLANDI',
    pageCount: 55,
    createdAt: '2025-10-22',
    approvedAt: '2025-10-30',
    findings: 11,
    actions: 23,
  },
  {
    id: 'rpt-006',
    title: '2026 Q1 Yönetim Faaliyet Özet Raporu',
    type: 'YÖNETİM',
    period: 'Ocak-Mart 2026 (Taslak)',
    preparedBy: 'Ahmet Koç, Teftiş Başkanı',
    committee: 'Yönetim Kurulu',
    status: 'INCELEMEDE',
    pageCount: 24,
    createdAt: '2026-02-20',
    findings: 6,
    actions: 12,
  },
  {
    id: 'rpt-007',
    title: 'Bireysel Bankacılık Denetimi Taslak Raporu',
    type: 'FAAALİYET',
    period: 'Şubat 2026',
    preparedBy: 'Burak Çelik, Denetçi',
    committee: 'Denetim Komitesi',
    status: 'TASLAK',
    pageCount: 18,
    createdAt: '2026-02-24',
    findings: 4,
    actions: 0,
  },
];

const TYPE_LABELS: Record<ReportType, { label: string; color: string }> = {
  FAAALİYET: { label: 'Faaliyet', color: 'bg-blue-100 text-blue-700' },
  KOMİTE: { label: 'Komite Sunumu', color: 'bg-purple-100 text-purple-700' },
  BDDK: { label: 'BDDK', color: 'bg-red-100 text-red-700' },
  YÖNETİM: { label: 'Yönetim', color: 'bg-amber-100 text-amber-700' },
};

const STATUS_CONFIG: Record<ReportStatus, { label: string; icon: typeof CheckCircle2; color: string }> = {
  ONAYLANDI: { label: 'Onaylandı', icon: CheckCircle2, color: 'text-emerald-600' },
  INCELEMEDE: { label: 'İncelemede', icon: Clock, color: 'text-amber-600' },
  TASLAK: { label: 'Taslak', icon: AlertCircle, color: 'text-slate-400' },
};

export default function ActivityReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const filtered = MOCK_REPORTS.filter((r) => {
    const matchesSearch =
      !searchTerm ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.preparedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || r.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6" style={{ background: '#FDFBF7', minHeight: '100vh' }}>
      <PageHeader
        title="Faaliyet Raporları"
        description="Denetim Komitesi Sunumları ve Dönemsel Faaliyet Raporları"
        icon={FileText}
          action={
          <div className="flex items-center gap-3">
            {/* Görünüm değiştirici */}
            <div className="flex items-center bg-surface/80 backdrop-blur-sm border border-white/60 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all',
                  viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                <LayoutGrid size={14} />
                Kart
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
          </div>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Toplam Rapor', value: MOCK_REPORTS.length, color: 'text-blue-700', bg: 'from-blue-50 to-blue-100/60' },
          { label: 'Onaylanan', value: MOCK_REPORTS.filter(r => r.status === 'ONAYLANDI').length, color: 'text-emerald-700', bg: 'from-emerald-50 to-emerald-100/60' },
          { label: 'İncelemede', value: MOCK_REPORTS.filter(r => r.status === 'INCELEMEDE').length, color: 'text-amber-700', bg: 'from-amber-50 to-amber-100/60' },
          { label: 'Toplam Bulgu', value: MOCK_REPORTS.reduce((s, r) => s + r.findings, 0), color: 'text-red-700', bg: 'from-red-50 to-red-100/60' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.bg} border border-white/60 rounded-xl p-4 backdrop-blur-sm shadow-sm`}
          >
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-slate-600 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-surface/70 backdrop-blur-xl border border-white/40 rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Rapor adı, dönem veya hazırlayan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-surface border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="ALL">Tüm Türler</option>
            <option value="FAAALİYET">Faaliyet</option>
            <option value="KOMİTE">Komite Sunumu</option>
            <option value="BDDK">BDDK</option>
            <option value="YÖNETİM">Yönetim</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-surface border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="ONAYLANDI">Onaylanan</option>
            <option value="INCELEMEDE">İncelemede</option>
            <option value="TASLAK">Taslak</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium ml-auto">
          {filtered.length} / {MOCK_REPORTS.length} rapor
        </div>
      </div>

      {/* Report list/grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <div className="bg-surface/70 backdrop-blur-xl border border-white/40 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-canvas/60">
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wide">Rapor Başlığı</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wide">Tür</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wide">Dönem</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wide">Durum</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wide">Bulgu</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((report) => {
                const statusCfg = STATUS_CONFIG[report.status];
                const StatusIcon = statusCfg.icon;
                const typeCfg = TYPE_LABELS[report.type];
                return (
                  <tr key={report.id} className="hover:bg-canvas/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800 text-sm">{report.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{report.preparedBy}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${typeCfg.color}`}>
                        {typeCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Calendar size={12} />
                        {report.period}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-1.5 text-xs font-semibold ${statusCfg.color}`}>
                        <StatusIcon size={12} />
                        {statusCfg.label}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-bold text-red-600">{report.findings}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

function ReportCard({ report }: { report: ActivityReport }) {
  const statusCfg = STATUS_CONFIG[report.status];
  const StatusIcon = statusCfg.icon;
  const typeCfg = TYPE_LABELS[report.type];

  return (
    <div className="group bg-surface/70 backdrop-blur-xl border border-white/40 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${typeCfg.color}`}>
          {typeCfg.label}
        </span>
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${statusCfg.color}`}>
          <StatusIcon size={12} />
          {statusCfg.label}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-slate-800 leading-snug mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
        {report.title}
      </h3>

      {/* Meta */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
        <Calendar size={11} />
        {report.period}
      </div>
      <div className="text-xs text-slate-500 mb-4 truncate">{report.preparedBy}</div>

      {/* Stats row */}
      <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
        <div className="flex-1 text-center">
          <div className="text-base font-bold text-red-600">{report.findings}</div>
          <div className="text-[10px] text-slate-500">Bulgu</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-base font-bold text-blue-600">{report.actions}</div>
          <div className="text-[10px] text-slate-500">Aksiyon</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-base font-bold text-slate-600">{report.pageCount}</div>
          <div className="text-[10px] text-slate-500">Sayfa</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3">
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-canvas hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-600 transition-all">
          <Eye size={13} />
          Görüntüle
        </button>
        {report.status === 'ONAYLANDI' && (
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-canvas hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-lg text-xs font-semibold text-slate-600 hover:text-emerald-600 transition-all">
            <Download size={13} />
            İndir
          </button>
        )}
        <button className="p-2 bg-canvas hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}
