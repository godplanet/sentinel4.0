import { useRef, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import clsx from 'clsx';
import { AgingTierBadge } from '@/entities/action/ui/AgingTierBadge';
import { ActionStatusBadge } from '@/entities/action/ui/ActionStatusBadge';
import { DEPT_ID_TO_NAME } from '@/features/action-analytics/lib/departments';
import type { ActionAgingMetrics } from '@/entities/action/model/types';

const ROW_H = 48;
const col   = createColumnHelper<ActionAgingMetrics>();

const COLUMNS = [
  col.accessor('id', {
    header: 'Aksiyon ID',
    size:   110,
    cell: (i) => (
      <span className="font-mono text-[11px] text-slate-400">
        #{i.getValue().slice(-6)}
      </span>
    ),
  }),
  col.accessor('assignee_unit_id', {
    header: 'Birim',
    size:   158,
    cell: (i) => (
      <span className="text-xs font-medium text-slate-700 truncate block max-w-[148px]">
        {DEPT_ID_TO_NAME[i.getValue() ?? ''] ?? 'Bilinmeyen'}
      </span>
    ),
  }),
  col.accessor((r) => r.finding_snapshot?.title ?? '', {
    id:     'title',
    header: 'Başlık',
    size:   290,
    cell: (i) => (
      <span className="text-xs text-slate-700 line-clamp-1 block max-w-[280px]">
        {i.getValue()}
      </span>
    ),
  }),
  col.accessor('original_due_date', {
    header: 'Orijinal Termin',
    size:   122,
    cell: (i) => (
      <span className="text-xs font-mono text-slate-500">
        {format(new Date(i.getValue()), 'd MMM yyyy', { locale: tr })}
      </span>
    ),
  }),
  col.accessor('current_due_date', {
    header: 'Güncel Termin',
    size:   122,
    cell: (i) => (
      <span className="text-xs font-mono text-slate-500">
        {format(new Date(i.getValue()), 'd MMM yyyy', { locale: tr })}
      </span>
    ),
  }),
  col.accessor('performance_delay_days', {
    header: 'Perf. Gecikme',
    size:   112,
    cell: (i) => {
      const v = i.getValue();
      return (
        <span className={clsx(
          'text-xs font-black font-mono',
          v > 364 ? 'text-[#700000]' :
          v > 90  ? 'text-[#eb0000]' :
          v > 30  ? 'text-[#ff960a]' :
          v > 0   ? 'text-amber-600' : 'text-emerald-600',
        )}>
          {v > 0 ? `+${v}g` : `${v}g`}
        </span>
      );
    },
  }),
  col.accessor('status', {
    header:        'Durum',
    size:          138,
    enableSorting: false,
    cell: (i) => <ActionStatusBadge status={i.getValue()} />,
  }),
  col.accessor('aging_tier', {
    header:        'Yaşlanma',
    size:          148,
    enableSorting: false,
    cell: (i) => (
      <AgingTierBadge
        tier={i.getValue()}
        isBddbBreach={i.row.original.is_bddk_breach}
        overdayDays={i.row.original.operational_delay_days > 0
          ? i.row.original.operational_delay_days
          : undefined}
      />
    ),
  }),
];

interface Props {
  actions: ActionAgingMetrics[];
}

export function VirtualActionGrid({ actions }: Props) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'performance_delay_days', desc: true },
  ]);

  const table = useReactTable({
    data:              actions,
    columns:           COLUMNS,
    state:             { sorting },
    onSortingChange:   setSorting,
    getCoreRowModel:   getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows     = table.getRowModel().rows;
  const bodyRef  = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count:           rows.length,
    getScrollElement: () => bodyRef.current,
    estimateSize:    () => ROW_H,
    overscan:        14,
  });

  const vItems    = virtualizer.getVirtualItems();
  const totalH    = virtualizer.getTotalSize();
  const topPad    = vItems.length > 0 ? vItems[0].start                        : 0;
  const botPad    = vItems.length > 0 ? totalH - vItems[vItems.length - 1].end : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-0.5">
        <p className="text-xs font-bold text-slate-600">
          {actions.length.toLocaleString('tr-TR')} aksiyon
        </p>
        <p className="text-[11px] text-slate-400">
          Sanal ızgara — yalnızca görünür satırlar DOM'da ({vItems.length}/{actions.length})
        </p>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto bg-slate-50 border-b border-slate-200">
          <table className="w-full min-w-[1080px] border-collapse">
            <thead>
              <tr>
                {table.getFlatHeaders().map((h) => (
                  <th
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    style={{ width: h.getSize() }}
                    className={clsx(
                      'px-3 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap select-none',
                      h.column.getCanSort() && 'cursor-pointer hover:text-slate-700 hover:bg-slate-100 transition-colors',
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {h.column.getCanSort() && <SortIcon state={h.column.getIsSorted()} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>

        <div ref={bodyRef} className="overflow-auto" style={{ height: 480 }}>
          <div style={{ height: totalH, position: 'relative' }}>
            <table
              className="w-full min-w-[1080px] border-collapse"
              style={{ position: 'absolute', top: 0, left: 0 }}
            >
              <tbody>
                {topPad > 0 && <tr style={{ height: topPad }}><td colSpan={COLUMNS.length} /></tr>}

                {vItems.map((vr) => {
                  const row    = rows[vr.index];
                  const breach = row.original.is_bddk_breach;
                  return (
                    <tr
                      key={row.id}
                      style={{ height: ROW_H }}
                      className={clsx(
                        'border-b border-slate-100 transition-colors',
                        breach ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-slate-50',
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-3 py-0 align-middle"
                          style={{ width: cell.column.getSize() }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })}

                {botPad > 0 && <tr style={{ height: botPad }}><td colSpan={COLUMNS.length} /></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            {actions.filter((a) => a.is_bddk_breach).length} BDDK ihlali kırmızıyla vurgulandı
          </span>
          <span>Sütun başlığına tıklayarak sıralayın</span>
        </div>
      </div>
    </div>
  );
}

function SortIcon({ state }: { state: false | 'asc' | 'desc' }) {
  if (state === 'asc')  return <ArrowUp   size={10} className="text-blue-600" />;
  if (state === 'desc') return <ArrowDown size={10} className="text-blue-600" />;
  return <ArrowUpDown size={9} className="text-slate-300" />;
}
