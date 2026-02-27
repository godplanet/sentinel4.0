import { useRef, useState } from 'react';
import { Plus, Trash2, TableProperties } from 'lucide-react';
import { useActiveReportStore } from '@/entities/report';
import type { FinancialGridBlock as FinancialGridBlockType } from '@/entities/report';

interface Props {
  block: FinancialGridBlockType;
  sectionId: string;
  readOnly: boolean;
}

export function FinancialGridBlock({ block, sectionId, readOnly }: Props) {
  const { updateBlock } = useActiveReportStore();
  const { columns, rows } = block.content;

  const saveGrid = (nextColumns: string[], nextRows: Record<string, string>[]) => {
    updateBlock(sectionId, block.id, {
      content: { columns: nextColumns, rows: nextRows },
    });
  };

  const handleCellBlur = (rowIdx: number, col: string, value: string) => {
    const nextRows = rows.map((r, i) => (i === rowIdx ? { ...r, [col]: value } : r));
    saveGrid(columns, nextRows);
  };

  const handleHeaderBlur = (colIdx: number, value: string) => {
    const oldKey = columns[colIdx];
    const newKey = value.trim() || oldKey;
    if (newKey === oldKey) return;
    const nextColumns = columns.map((c, i) => (i === colIdx ? newKey : c));
    const nextRows = rows.map((r) => {
      const entry = { ...r };
      entry[newKey] = entry[oldKey] ?? '';
      delete entry[oldKey];
      return entry;
    });
    saveGrid(nextColumns, nextRows);
  };

  const addRow = () => {
    const blank: Record<string, string> = {};
    columns.forEach((c) => (blank[c] = ''));
    saveGrid(columns, [...rows, blank]);
  };

  const addColumn = () => {
    const newCol = `Sütun ${columns.length + 1}`;
    const nextRows = rows.map((r) => ({ ...r, [newCol]: '' }));
    saveGrid([...columns, newCol], nextRows);
  };

  const removeRow = (idx: number) => {
    saveGrid(columns, rows.filter((_, i) => i !== idx));
  };

  const removeColumn = (colIdx: number) => {
    const key = columns[colIdx];
    const nextCols = columns.filter((_, i) => i !== colIdx);
    const nextRows = rows.map((r) => {
      const entry = { ...r };
      delete entry[key];
      return entry;
    });
    saveGrid(nextCols, nextRows);
  };

  return (
    <div className="my-4 not-prose">
      <div className="flex items-center gap-2 mb-2">
        <TableProperties size={14} className="text-slate-400" />
        <span className="text-xs font-sans font-semibold text-slate-400 uppercase tracking-wider">
          Finansal Tablo
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full border-collapse text-sm font-sans">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              {columns.map((col, ci) => (
                <th
                  key={ci}
                  className="group relative px-4 py-2.5 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0"
                >
                  {readOnly ? (
                    <span>{col}</span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <EditableCell
                        value={col}
                        onBlur={(v) => handleHeaderBlur(ci, v)}
                        className="flex-1 font-semibold text-slate-700 bg-transparent"
                        placeholder="Başlık"
                      />
                      {columns.length > 1 && (
                        <button
                          onClick={() => removeColumn(ci)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 hover:text-red-600 text-slate-400 transition-all flex-shrink-0"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  )}
                </th>
              ))}
              {!readOnly && (
                <th className="px-2 py-2 w-10">
                  <button
                    onClick={addColumn}
                    title="Sütun ekle"
                    className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className={`group border-b border-slate-100 last:border-b-0 ${ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50/40 transition-colors`}
              >
                {columns.map((col, ci) => (
                  <td key={ci} className="px-4 py-2 border-r border-slate-100 last:border-r-0">
                    {readOnly ? (
                      <span className="text-slate-800">{row[col] ?? ''}</span>
                    ) : (
                      <EditableCell
                        value={row[col] ?? ''}
                        onBlur={(v) => handleCellBlur(ri, col, v)}
                        className="w-full text-slate-800"
                        placeholder="—"
                      />
                    )}
                  </td>
                ))}
                {!readOnly && (
                  <td className="px-2 py-2 w-10">
                    <button
                      onClick={() => removeRow(ri)}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:bg-red-100 hover:text-red-600 transition-all"
                    >
                      <Trash2 size={11} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <button
          onClick={addRow}
          className="mt-2 flex items-center gap-1.5 text-xs font-sans font-medium text-slate-500 hover:text-blue-600 transition-colors px-1"
        >
          <Plus size={13} />
          Satır ekle
        </button>
      )}
    </div>
  );
}

interface EditableCellProps {
  value: string;
  onBlur: (value: string) => void;
  className?: string;
  placeholder?: string;
}

function EditableCell({ value, onBlur, className = '', placeholder }: EditableCellProps) {
  const [local, setLocal] = useState(value);
  const ref = useRef<HTMLInputElement>(null);

  const handleBlur = () => {
    if (local !== value) onBlur(local);
  };

  return (
    <input
      ref={ref}
      type="text"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => { if (e.key === 'Enter') ref.current?.blur(); }}
      placeholder={placeholder}
      className={`outline-none bg-transparent border-0 focus:ring-0 text-sm ${className}`}
    />
  );
}
