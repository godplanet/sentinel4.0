import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, PanelRightOpen, AlertTriangle, Shield, ShieldAlert, Lock, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import type { ControlRow, TestDesignResult, TestEffectivenessResult } from './types';
import { TOD_OPTIONS, TOE_OPTIONS } from './types';
import { StatusDropdown } from './cells/StatusDropdown';
import { EditableNumber } from './cells/EditableNumber';
import { ProgressBar } from './cells/ProgressBar';

interface WorkpaperGridProps {
  data: ControlRow[];
  onUpdate: (id: string, field: keyof ControlRow, value: any) => void;
  onOpenDrawer: (row: ControlRow) => void;
}

const col = createColumnHelper<ControlRow>();

export function WorkpaperGrid({ data, onUpdate, onOpenDrawer }: WorkpaperGridProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const stats = useMemo(() => {
    const total = data.length;
    const todTested = data.filter(r => r.tod !== 'NOT_STARTED').length;
    const toeTested = data.filter(r => r.toe !== 'NOT_STARTED').length;
    const tested = Math.max(todTested, toeTested);
    const effective = data.filter(r => r.tod === 'EFFECTIVE' && r.toe === 'EFFECTIVE').length;
    const ineffective = data.filter(r => r.tod === 'INEFFECTIVE' || r.toe === 'INEFFECTIVE').length;
    return { total, tested, effective, ineffective };
  }, [data]);

  const columns = useMemo(() => [
    col.accessor('control_id', {
      header: 'Control ID',
      size: 130,
      cell: (info) => {
        const row = info.row.original;
        const RiskIcon = row.risk_level === 'HIGH' ? ShieldAlert : Shield;
        const riskColor = row.risk_level === 'HIGH' ? 'text-red-600' : row.risk_level === 'MEDIUM' ? 'text-amber-500' : 'text-slate-400';
        const isReviewed = row.approval_status === 'reviewed';
        const isPrepared = row.approval_status === 'prepared';
        return (
          <div className="flex items-center gap-2">
            {isReviewed ? (
              <div className="p-1 bg-emerald-100 rounded" title="Tam Onayli">
                <CheckCircle2 size={12} className="text-emerald-600" />
              </div>
            ) : isPrepared ? (
              <div className="p-1 bg-blue-100 rounded" title="Hazirlayan Onayladi">
                <Lock size={12} className="text-blue-600" />
              </div>
            ) : null}
            <code className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2 py-1 rounded">
              {info.getValue()}
            </code>
            <RiskIcon size={14} className={riskColor} />
          </div>
        );
      },
    }),
    col.accessor('title', {
      header: 'Control Title',
      size: 280,
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="group relative">
            <div className="text-sm font-medium text-slate-900 truncate max-w-[260px]">
              {info.getValue()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">{row.category}</div>
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-80 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl pointer-events-none">
              <div className="font-bold mb-1">{info.getValue()}</div>
              <div className="text-slate-300">{row.description}</div>
            </div>
          </div>
        );
      },
    }),
    col.accessor('tod', {
      header: 'Test of Design (ToD)',
      size: 170,
      cell: (info) => (
        <StatusDropdown
          value={info.getValue()}
          options={TOD_OPTIONS}
          onChange={(v) => onUpdate(info.row.original.id, 'tod', v as TestDesignResult)}
        />
      ),
    }),
    col.accessor('toe', {
      header: 'Test of Effectiveness (ToE)',
      size: 180,
      cell: (info) => (
        <StatusDropdown
          value={info.getValue()}
          options={TOE_OPTIONS}
          onChange={(v) => onUpdate(info.row.original.id, 'toe', v as TestEffectivenessResult)}
        />
      ),
    }),
    col.accessor('sample_size', {
      header: 'Sample Size',
      size: 100,
      cell: (info) => (
        <div className="flex justify-center">
          <EditableNumber
            value={info.getValue()}
            onChange={(v) => onUpdate(info.row.original.id, 'sample_size', v)}
          />
        </div>
      ),
    }),
    col.accessor('auditor', {
      header: 'Auditor',
      size: 100,
      enableSorting: false,
      cell: (info) => {
        const auditor = info.getValue();
        return (
          <div className="flex items-center gap-2">
            <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm', auditor.color)}>
              {auditor.initials}
            </div>
            <span className="text-xs text-slate-600 hidden xl:inline">{auditor.name.split(' ')[0]}</span>
          </div>
        );
      },
    }),
    col.display({
      id: 'actions',
      header: '',
      size: 50,
      cell: (info) => (
        <button
          onClick={(e) => { e.stopPropagation(); onOpenDrawer(info.row.original); }}
          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          title="Open details"
        >
          <PanelRightOpen size={16} />
        </button>
      ),
    }),
  ], [onUpdate, onOpenDrawer]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <ProgressBar
          tested={stats.tested}
          total={stats.total}
          effective={stats.effective}
          ineffective={stats.ineffective}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-slate-50 border-b-2 border-slate-200">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className={clsx(
                        'px-4 py-3 text-left text-[11px] font-bold text-slate-600 uppercase tracking-wider select-none',
                        header.column.getCanSort() && 'cursor-pointer hover:text-slate-900',
                        header.id === 'control_id' && 'sticky left-0 z-20 bg-slate-50'
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <ArrowUpDown size={12} className="text-slate-400" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, i) => {
                const rowData = row.original;
                const hasIssue = rowData.tod === 'INEFFECTIVE' || rowData.toe === 'INEFFECTIVE';
                return (
                  <tr
                    key={row.id}
                    className={clsx(
                      'border-b border-slate-100 transition-colors',
                      hasIssue ? 'bg-red-50/40 hover:bg-red-50/70' : i % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/30 hover:bg-slate-50'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                        className={clsx(
                          'px-4 py-2.5',
                          cell.column.id === 'control_id' && 'sticky left-0 z-10 bg-inherit'
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {table.getRowModel().rows.length === 0 && (
          <div className="py-16 text-center">
            <AlertTriangle className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-slate-500 font-medium">No controls match your search</p>
          </div>
        )}
      </div>
    </div>
  );
}

export type { ControlRow, TestDesignResult, TestEffectivenessResult, ApprovalStatus } from './types';
