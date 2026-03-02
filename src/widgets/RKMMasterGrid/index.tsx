import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Download, ChevronLeft, ChevronRight,
  SortAsc, SortDesc, Check,
} from 'lucide-react';
import { exportRKMToExcel } from '@/shared/lib/excel-utils';
import { fetchRkmRisksForGrid } from '@/entities/rkm/api';
import { useRkmCellUpdate, COMPUTED_FIELDS } from './rkm-grid-api';
import clsx from 'clsx';

// ─── Tipler ──────────────────────────────────────────────────────────────────

export interface RkmRow {
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

type CellValue = string | number;

// ─── Kolon yapısı ─────────────────────────────────────────────────────────────

type EditType = 'text' | 'select' | 'number' | 'date' | 'readonly';

interface ColumnDef {
  key: keyof RkmRow;
  label: string;
  width: string;
  editType: EditType;
  options?: string[];
}

const COLUMNS: ColumnDef[] = [
  { key: 'risk_code',              label: 'Kod',         width: 'w-20',  editType: 'text' },
  { key: 'risk_title',             label: 'Risk Başlığı', width: 'w-48', editType: 'text' },
  { key: 'risk_owner',             label: 'Sahip',       width: 'w-24',  editType: 'text' },
  { key: 'risk_status',            label: 'Durum',       width: 'w-24',  editType: 'select',
    options: ['ACTIVE', 'MITIGATED', 'ACCEPTED', 'TRANSFERRED', 'ARCHIVED'] },
  { key: 'risk_category',          label: 'Kategori',    width: 'w-24',  editType: 'text' },
  { key: 'main_process',           label: 'Süreç',       width: 'w-24',  editType: 'text' },
  { key: 'inherent_impact',        label: 'D.Etki',      width: 'w-16',  editType: 'select',
    options: ['1', '2', '3', '4', '5'] },
  { key: 'inherent_likelihood',    label: 'D.Olas.',     width: 'w-16',  editType: 'select',
    options: ['1', '2', '3', '4', '5'] },
  { key: 'inherent_score',         label: 'D.Skor',      width: 'w-16',  editType: 'readonly' },
  { key: 'inherent_rating',        label: 'D.Seviye',    width: 'w-20',  editType: 'readonly' },
  { key: 'control_type',           label: 'K.Tipi',      width: 'w-24',  editType: 'select',
    options: ['PREVENTIVE', 'DETECTIVE', 'CORRECTIVE', 'DIRECTIVE'] },
  { key: 'control_effectiveness',  label: 'K.Etk.',      width: 'w-16',  editType: 'readonly' },
  { key: 'residual_impact',        label: 'A.Etki',      width: 'w-16',  editType: 'select',
    options: ['1', '2', '3', '4', '5'] },
  { key: 'residual_likelihood',    label: 'A.Olas.',     width: 'w-16',  editType: 'select',
    options: ['1', '2', '3', '4', '5'] },
  { key: 'residual_score',         label: 'A.Skor',      width: 'w-16',  editType: 'readonly' },
  { key: 'residual_rating',        label: 'A.Seviye',    width: 'w-20',  editType: 'readonly' },
  { key: 'bddk_reference',         label: 'BDDK',        width: 'w-20',  editType: 'text' },
  { key: 'iso27001_reference',     label: 'ISO',         width: 'w-20',  editType: 'text' },
  { key: 'risk_response_strategy', label: 'Strateji',    width: 'w-24',  editType: 'select',
    options: ['MITIGATE', 'ACCEPT', 'TRANSFER', 'AVOID'] },
  { key: 'last_audit_date',        label: 'Son Denetim', width: 'w-24',  editType: 'date' },
  { key: 'audit_rating',           label: 'D.Notu',      width: 'w-28',  editType: 'select',
    options: ['SATISFACTORY', 'NEEDS_IMPROVEMENT', 'UNSATISFACTORY'] },
];

type SortDir = 'asc' | 'desc';

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────

const GRID_QUERY_KEY = ['rkm-risks'] as const;

export function RKMMasterGrid({ data: externalData }: { data?: RkmRow[] }) {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: GRID_QUERY_KEY,
    queryFn: fetchRkmRisksForGrid,
    enabled: externalData === undefined,
  });

  const sourceData = externalData ?? fetchedData ?? [];
  const [localData, setLocalData] = useState<RkmRow[] | undefined>(undefined);

  useEffect(() => {
    setLocalData(sourceData.length ? sourceData : undefined);
  }, [sourceData.length, sourceData]);

  const rows: RkmRow[] = (localData ?? sourceData) as RkmRow[];

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof RkmRow>('risk_code');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(0);
  const pageSize = 15;

  // Editing state: "rowId:colKey" -> true
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  // "rowId:colKey" -> saved (animasyon için)
  const [savedCell, setSavedCell] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  const cellMutation = useRkmCellUpdate(GRID_QUERY_KEY);

  const filtered = useMemo(() => {
    let result = rows;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        r.risk_code.toLowerCase().includes(q) ||
        r.risk_title.toLowerCase().includes(q) ||
        r.risk_owner.toLowerCase().includes(q) ||
        r.risk_category.toLowerCase().includes(q),
      );
    }
    result = [...result].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const cmp =
        typeof aVal === 'number' && typeof bVal === 'number'
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [rows, search, sortKey, sortDir]);

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleSort = (key: keyof RkmRow) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  // Hücreye çift tıkla → edit moduna gir
  const startEdit = useCallback((rowId: string, col: ColumnDef, current: CellValue) => {
    if (col.editType === 'readonly' || COMPUTED_FIELDS.has(col.key)) return;
    setEditingCell(`${rowId}:${col.key}`);
    setEditValue(String(current ?? ''));
    setTimeout(() => (inputRef.current as HTMLElement | null)?.focus(), 50);
  }, []);

  // Kaydet
  const commitEdit = useCallback(
    (rowId: string, col: ColumnDef) => {
      const cellKey = `${rowId}:${col.key}`;
      setEditingCell(null);

      const numericFields = new Set([
        'inherent_impact', 'inherent_likelihood', 'inherent_volume',
        'residual_impact', 'residual_likelihood',
        'control_design_rating', 'control_operating_rating',
      ]);

      const parsedValue: string | number = numericFields.has(col.key)
        ? Number(editValue)
        : editValue;

      // Optimistic update
      setLocalData((prev) => {
        const base = prev ?? externalData ?? [];
        return base.map((r) =>
          r.id === rowId ? { ...r, [col.key]: parsedValue } : r,
        );
      });

      // Veritabanı güncelle
      cellMutation.mutate(
        { id: rowId, field: col.key, value: parsedValue },
        {
          onSuccess: () => {
            setSavedCell(cellKey);
            setTimeout(() => setSavedCell(null), 1500);
          },
          onError: () => {
            setLocalData(undefined);
          },
        },
      );
    },
    [editValue, cellMutation, externalData],
  );

  const getRatingColor = (rating: string) => {
    if (rating === 'Kritik' || rating === 'KRİTİK') return 'bg-red-100 text-red-700';
    if (rating === 'Yuksek' || rating === 'YÜKSEK') return 'bg-orange-100 text-orange-700';
    if (rating === 'Orta'   || rating === 'ORTA')   return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  if (externalData === undefined && isLoading) {
    return (
      <div className="flex items-center justify-center py-16 bg-surface rounded-xl border border-slate-200">
        <p className="text-slate-500">RKM verileri yükleniyor…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Kod, başlık, sahip veya kategori ara…"
              className="w-full pl-9 pr-4 py-2 bg-surface border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <span className="text-xs text-slate-500">{filtered.length} kayıt</span>
          <span className="text-xs text-slate-400 hidden md:block">
            💡 Düzenlemek için hücreye çift tıklayın
          </span>
        </div>
        <button
          onClick={() => exportRKMToExcel(filtered)}
          className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700"
        >
          <Download size={14} /> Excel İndir
        </button>
      </div>

      {/* Tablo */}
      <div className="bg-surface rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead className="bg-canvas border-b border-slate-200">
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={clsx(
                      'px-2 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-slate-100',
                      col.width,
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key && (
                        sortDir === 'asc' ? <SortAsc size={10} /> : <SortDesc size={10} />
                      )}
                      {col.editType !== 'readonly' && (
                        <span className="text-blue-300 text-[8px] font-normal normal-case ml-0.5" title="Düzenlenebilir">✏</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paged.map((row) => (
                <tr key={row.id} className="hover:bg-canvas/80 transition-colors">
                  {COLUMNS.map((col) => {
                    const cellKey = `${row.id}:${col.key}`;
                    const isEditing = editingCell === cellKey;
                    const isSaved = savedCell === cellKey;
                    const rawValue = row[col.key];

                    return (
                      <td
                        key={col.key}
                        className={clsx(
                          'px-1 py-1 relative',
                          col.editType !== 'readonly' && 'cursor-pointer group',
                        )}
                        onDoubleClick={() => startEdit(row.id, col, rawValue)}
                      >
                        {isEditing ? (
                          /* ── Düzenleme modu ── */
                          col.editType === 'select' && col.options ? (
                            <select
                              ref={inputRef as React.RefObject<HTMLSelectElement>}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => commitEdit(row.id, col)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitEdit(row.id, col);
                                if (e.key === 'Escape') setEditingCell(null);
                              }}
                              className="w-full px-1.5 py-1 border-2 border-blue-400 rounded text-[11px] bg-white shadow-md outline-none"
                              autoFocus
                            >
                              {col.options.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              ref={inputRef as React.RefObject<HTMLInputElement>}
                              type={col.editType === 'number' ? 'number' : col.editType === 'date' ? 'date' : 'text'}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => commitEdit(row.id, col)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitEdit(row.id, col);
                                if (e.key === 'Escape') setEditingCell(null);
                              }}
                              className="w-full px-1.5 py-1 border-2 border-blue-400 rounded text-[11px] bg-white shadow-md outline-none"
                              autoFocus
                            />
                          )
                        ) : (
                          /* ── Görüntüleme modu ── */
                          <CellDisplay
                            col={col}
                            row={row}
                            rawValue={rawValue}
                            isSaved={isSaved}
                            getRatingColor={getRatingColor}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 bg-canvas border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Sayfa {page + 1} / {totalPages} ({filtered.length} kayıt)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 bg-surface border border-slate-300 rounded hover:bg-canvas disabled:opacity-50"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 bg-surface border border-slate-300 rounded hover:bg-canvas disabled:opacity-50"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Hücre Görüntü Bileşeni ───────────────────────────────────────────────────

function CellDisplay({
  col, row, rawValue, isSaved, getRatingColor,
}: {
  col: ColumnDef;
  row: RkmRow;
  rawValue: CellValue;
  isSaved: boolean;
  getRatingColor: (r: string) => string;
}) {
  const baseClass = clsx(
    'flex items-center gap-1 min-h-[22px] px-1 rounded',
    col.editType !== 'readonly' && 'group-hover:bg-blue-50/60 group-hover:ring-1 group-hover:ring-blue-200',
    isSaved && 'bg-emerald-50 ring-1 ring-emerald-300',
  );

  const content = (() => {
    switch (col.key) {
      case 'risk_code':
        return <span className="font-mono text-slate-400">{rawValue}</span>;

      case 'risk_title':
        return <span className="font-semibold text-slate-800 truncate max-w-[180px]">{rawValue}</span>;

      case 'risk_status':
        return (
          <span className={clsx(
            'text-[9px] font-bold px-1.5 py-0.5 rounded',
            rawValue === 'ACTIVE'    ? 'bg-blue-100 text-blue-700' :
            rawValue === 'MITIGATED' ? 'bg-green-100 text-green-700' :
            'bg-amber-100 text-amber-700',
          )}>
            {rawValue}
          </span>
        );

      case 'inherent_rating':
      case 'residual_rating':
        return (
          <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded', getRatingColor(String(rawValue)))}>
            {rawValue}
          </span>
        );

      case 'audit_rating':
        return (
          <span className={clsx(
            'text-[9px] font-bold px-1.5 py-0.5 rounded',
            rawValue === 'SATISFACTORY'    ? 'bg-green-100 text-green-700' :
            rawValue === 'UNSATISFACTORY'  ? 'bg-red-100 text-red-700' :
            'bg-amber-100 text-amber-700',
          )}>
            {rawValue}
          </span>
        );

      case 'control_effectiveness':
        return <span className="font-bold">{Math.round(Number(rawValue) * 100)}%</span>;

      case 'inherent_score':
      case 'residual_score':
        return <span className="font-black">{Number(rawValue).toFixed ? Number(rawValue).toFixed(1) : rawValue}</span>;

      case 'inherent_impact':
      case 'inherent_likelihood':
      case 'residual_impact':
      case 'residual_likelihood':
        return <span className="font-bold text-center w-full">{rawValue}</span>;

      case 'bddk_reference':
      case 'iso27001_reference':
        return <span className="text-slate-400 font-mono">{rawValue || '—'}</span>;

      default:
        return <span className="text-slate-600">{rawValue}</span>;
    }
  })();

  return (
    <div className={baseClass}>
      {content}
      {isSaved && (
        <span className="ml-auto flex-shrink-0 animate-in fade-in duration-200">
          <Check size={10} className="text-emerald-500" />
        </span>
      )}
    </div>
  );
}
