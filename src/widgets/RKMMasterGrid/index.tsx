import { useState, useMemo } from 'react';
import {
  Search, Filter, Download, ChevronLeft, ChevronRight,
  SortAsc, SortDesc, Eye, Grid3x3
} from 'lucide-react';
import { exportRKMToExcel } from '@/shared/lib/excel-utils';
import clsx from 'clsx';

interface RkmRow {
  id: string;
  risk_code: string;
  risk_title: string;
  risk_owner: string;
  risk_status: string;
  risk_category: string;
  risk_subcategory: string;
  main_process: string;
  sub_process: string;
  inherent_impact: number;
  inherent_likelihood: number;
  inherent_score: number;
  inherent_rating: string;
  control_type: string;
  control_nature: string;
  control_effectiveness: number;
  residual_impact: number;
  residual_likelihood: number;
  residual_score: number;
  residual_rating: string;
  bddk_reference: string;
  iso27001_reference: string;
  risk_response_strategy: string;
  last_audit_date: string;
  audit_rating: string;
}

const DEMO_DATA: RkmRow[] = Array.from({ length: 30 }, (_, i) => ({
  id: String(i + 1),
  risk_code: `R-${String(i + 1).padStart(3, '0')}`,
  risk_title: ['Kredi Limit Asimi', 'Siber Saldiri', 'Operasyonel Hata', 'Faiz Riski', 'Kur Riski', 'MASAK Uyumsuzluk', 'Veri Sizintisi', 'IT Kesinti', 'Personel Fraud', 'Tedarikci Riski'][i % 10],
  risk_owner: ['Ahmet Y.', 'Zeynep K.', 'Mehmet O.', 'Fatma C.', 'Ali D.'][i % 5],
  risk_status: ['ACTIVE', 'ACTIVE', 'MITIGATED', 'ACTIVE', 'ACCEPTED'][i % 5],
  risk_category: ['Finansal', 'BT', 'Operasyonel', 'Finansal', 'Finansal', 'Uyumluluk', 'BT', 'BT', 'Operasyonel', 'Operasyonel'][i % 10],
  risk_subcategory: ['Kredi', 'Siber', 'Surec', 'Piyasa', 'Kur', 'AML', 'Veri', 'Altyapi', 'Ic Fraud', 'Dis Kaynak'][i % 10],
  main_process: ['Kredi', 'BT Guvenlik', 'Operasyon', 'Hazine', 'Hazine', 'Uyumluluk', 'BT', 'BT', 'IK', 'Satin Alma'][i % 10],
  sub_process: ['Tahsis', 'Firewall', 'EFT', 'Swap', 'FX', 'KYC', 'Backup', 'DC', 'Bordro', 'Sozlesme'][i % 10],
  inherent_impact: [5, 5, 3, 4, 3, 4, 5, 4, 5, 2][i % 10],
  inherent_likelihood: [4, 3, 4, 4, 5, 3, 3, 2, 2, 3][i % 10],
  inherent_score: [20, 15, 12, 16, 15, 12, 15, 8, 10, 6][i % 10],
  inherent_rating: ['Kritik', 'Yuksek', 'Yuksek', 'Kritik', 'Yuksek', 'Yuksek', 'Yuksek', 'Orta', 'Yuksek', 'Orta'][i % 10],
  control_type: ['PREVENTIVE', 'DETECTIVE', 'PREVENTIVE', 'CORRECTIVE', 'PREVENTIVE'][i % 5],
  control_nature: ['AUTOMATED', 'MANUAL', 'AUTOMATED', 'MANUAL', 'AUTOMATED'][i % 5],
  control_effectiveness: [0.7, 0.8, 0.6, 0.5, 0.4, 0.65, 0.75, 0.7, 0.85, 0.7][i % 10],
  residual_impact: [4, 4, 2, 3, 2, 3, 3, 3, 4, 1][i % 10],
  residual_likelihood: [2, 1, 3, 3, 4, 2, 2, 1, 1, 2][i % 10],
  residual_score: [8, 4, 6, 9, 8, 6, 6, 3, 4, 2][i % 10],
  residual_rating: ['Orta', 'Dusuk', 'Orta', 'Orta', 'Orta', 'Orta', 'Orta', 'Dusuk', 'Dusuk', 'Dusuk'][i % 10],
  bddk_reference: ['BDDK 5.1', 'BDDK 8.3', '', 'BDDK 4.2', 'BDDK 4.5', 'BDDK 9.1', 'BDDK 8.7', 'BDDK 8.1', '', ''][i % 10],
  iso27001_reference: ['', 'A.12.6', '', '', '', '', 'A.8.2', 'A.17.1', '', ''][i % 10],
  risk_response_strategy: ['MITIGATE', 'MITIGATE', 'ACCEPT', 'MITIGATE', 'TRANSFER', 'MITIGATE', 'MITIGATE', 'MITIGATE', 'AVOID', 'ACCEPT'][i % 10],
  last_audit_date: `2025-${String(((i * 2) % 12) + 1).padStart(2, '0')}-15`,
  audit_rating: ['SATISFACTORY', 'NEEDS_IMPROVEMENT', 'SATISFACTORY', 'UNSATISFACTORY', 'SATISFACTORY'][i % 5],
}));

type SortDir = 'asc' | 'desc';

const COLUMNS = [
  { key: 'risk_code', label: 'Kod', width: 'w-20' },
  { key: 'risk_title', label: 'Risk Basligi', width: 'w-48' },
  { key: 'risk_owner', label: 'Sahip', width: 'w-24' },
  { key: 'risk_status', label: 'Durum', width: 'w-24' },
  { key: 'risk_category', label: 'Kategori', width: 'w-24' },
  { key: 'main_process', label: 'Surec', width: 'w-24' },
  { key: 'inherent_impact', label: 'D.Etki', width: 'w-16' },
  { key: 'inherent_likelihood', label: 'D.Olas.', width: 'w-16' },
  { key: 'inherent_score', label: 'D.Skor', width: 'w-16' },
  { key: 'inherent_rating', label: 'D.Seviye', width: 'w-20' },
  { key: 'control_type', label: 'K.Tipi', width: 'w-24' },
  { key: 'control_effectiveness', label: 'K.Etk.', width: 'w-16' },
  { key: 'residual_impact', label: 'A.Etki', width: 'w-16' },
  { key: 'residual_likelihood', label: 'A.Olas.', width: 'w-16' },
  { key: 'residual_score', label: 'A.Skor', width: 'w-16' },
  { key: 'residual_rating', label: 'A.Seviye', width: 'w-20' },
  { key: 'bddk_reference', label: 'BDDK', width: 'w-20' },
  { key: 'iso27001_reference', label: 'ISO', width: 'w-20' },
  { key: 'risk_response_strategy', label: 'Strateji', width: 'w-24' },
  { key: 'last_audit_date', label: 'Son Denetim', width: 'w-24' },
  { key: 'audit_rating', label: 'D.Notu', width: 'w-28' },
];

export function RKMMasterGrid({ data = DEMO_DATA }: { data?: RkmRow[] }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('risk_code');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const filtered = useMemo(() => {
    let result = data;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.risk_code.toLowerCase().includes(q) ||
        r.risk_title.toLowerCase().includes(q) ||
        r.risk_owner.toLowerCase().includes(q) ||
        r.risk_category.toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      const aVal = (a as any)[sortKey];
      const bVal = (b as any)[sortKey];
      const cmp = typeof aVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [data, search, sortKey, sortDir]);

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const getRatingColor = (rating: string) => {
    if (rating === 'Kritik') return 'bg-red-100 text-red-700';
    if (rating === 'Yuksek') return 'bg-orange-100 text-orange-700';
    if (rating === 'Orta') return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Kod, baslik, sahip veya kategori ara..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs" />
          </div>
          <span className="text-xs text-slate-500">{filtered.length} kayit</span>
        </div>
        <button
          onClick={() => exportRKMToExcel(filtered)}
          className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700"
        >
          <Download size={14} /> Excel Indir
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {COLUMNS.map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={clsx(
                      'px-2 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-slate-100',
                      col.width
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key && (
                        sortDir === 'asc' ? <SortAsc size={10} /> : <SortDesc size={10} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paged.map(row => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-2 py-2 font-mono text-slate-400">{row.risk_code}</td>
                  <td className="px-2 py-2 font-semibold text-slate-800 truncate max-w-[180px]">{row.risk_title}</td>
                  <td className="px-2 py-2 text-slate-600">{row.risk_owner}</td>
                  <td className="px-2 py-2">
                    <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded',
                      row.risk_status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                      row.risk_status === 'MITIGATED' ? 'bg-green-100 text-green-700' :
                      'bg-amber-100 text-amber-700'
                    )}>{row.risk_status}</span>
                  </td>
                  <td className="px-2 py-2 text-slate-600">{row.risk_category}</td>
                  <td className="px-2 py-2 text-slate-500">{row.main_process}</td>
                  <td className="px-2 py-2 text-center font-bold">{row.inherent_impact}</td>
                  <td className="px-2 py-2 text-center font-bold">{row.inherent_likelihood}</td>
                  <td className="px-2 py-2 text-center font-black">{row.inherent_score}</td>
                  <td className="px-2 py-2">
                    <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded', getRatingColor(row.inherent_rating))}>
                      {row.inherent_rating}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-slate-500">{row.control_type}</td>
                  <td className="px-2 py-2 text-center font-bold">{Math.round(row.control_effectiveness * 100)}%</td>
                  <td className="px-2 py-2 text-center font-bold">{row.residual_impact}</td>
                  <td className="px-2 py-2 text-center font-bold">{row.residual_likelihood}</td>
                  <td className="px-2 py-2 text-center font-black">{row.residual_score}</td>
                  <td className="px-2 py-2">
                    <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded', getRatingColor(row.residual_rating))}>
                      {row.residual_rating}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-slate-400 font-mono">{row.bddk_reference || '-'}</td>
                  <td className="px-2 py-2 text-slate-400 font-mono">{row.iso27001_reference || '-'}</td>
                  <td className="px-2 py-2 text-slate-500">{row.risk_response_strategy}</td>
                  <td className="px-2 py-2 text-slate-500">{row.last_audit_date}</td>
                  <td className="px-2 py-2">
                    <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded',
                      row.audit_rating === 'SATISFACTORY' ? 'bg-green-100 text-green-700' :
                      row.audit_rating === 'UNSATISFACTORY' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    )}>{row.audit_rating}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Sayfa {page + 1} / {totalPages} ({filtered.length} kayit)
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="p-1.5 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50">
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="p-1.5 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
