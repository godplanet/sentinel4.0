import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Maximize2, Minimize2, Save, Cloud, CloudOff, Plus, Trash2,
  Table2, Download, Calculator, Loader2, Check,
} from 'lucide-react';
import clsx from 'clsx';
import type { SheetData, SpreadsheetState, CellData, SheetConfig } from './types';
import { computeAllCells, formatCellDisplay } from './formula-engine';
import { useSheetAutoSave, useCryoSave } from './useSheetAutoSave';

interface SentinelSheetsProps {
  workpaperId: string | null;
  documentId?: string | null;
  initialData?: SpreadsheetState | null;
  onFullScreen?: () => void;
  isFullScreen?: boolean;
}

const DEFAULT_CONFIG: SheetConfig = {
  columns: 8,
  rows: 20,
  columnWidths: {},
  columnHeaders: {},
};

function createDefaultState(): SpreadsheetState {
  return {
    cells: {},
    config: { ...DEFAULT_CONFIG },
    version: 1,
  };
}

function getColLabel(index: number): string {
  return String.fromCharCode(65 + index);
}

function getCellKey(col: number, row: number): string {
  return `${getColLabel(col)}${row + 1}`;
}

export function SentinelSheets({ workpaperId, documentId, initialData, onFullScreen, isFullScreen }: SentinelSheetsProps) {
  const [state, setState] = useState<SpreadsheetState>(initialData || createDefaultState());
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedRange, setSelectedRange] = useState<Set<string>>(new Set());
  const [manualSaved, setManualSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const legacySave = useSheetAutoSave(workpaperId && !documentId ? workpaperId : null, {
    table: 'workpapers',
    column: 'spreadsheet_data',
    delay: 30000,
  });

  const cryoSave = useCryoSave({
    documentId: documentId || null,
    createdByName: 'Denetci',
    delay: 30000,
  });

  const autoSave = documentId ? cryoSave.save : legacySave.save;
  const saveNow = documentId
    ? (data: any) => cryoSave.saveNow(data as Record<string, unknown>)
    : legacySave.saveNow;
  const saving = documentId ? cryoSave.saving : legacySave.saving;
  const lastSaved = documentId ? cryoSave.lastSaved : legacySave.lastSaved;

  const computedCells = useMemo(() => computeAllCells(state.cells), [state.cells]);

  const updateCell = useCallback((key: string, value: string) => {
    setState(prev => {
      const isFormula = value.startsWith('=');
      const newCells = {
        ...prev.cells,
        [key]: {
          value: isFormula ? '' : value,
          formula: isFormula ? value : undefined,
          format: prev.cells[key]?.format || 'text',
        },
      };
      const newState = { ...prev, cells: newCells, version: prev.version + 1 };
      autoSave(newState);
      return newState;
    });
  }, [autoSave]);

  const handleCellClick = useCallback((key: string) => {
    setActiveCell(key);
    setSelectedRange(new Set([key]));
  }, []);

  const handleCellDoubleClick = useCallback((key: string) => {
    setEditingCell(key);
    const cell = state.cells[key];
    setEditValue(cell?.formula || cell?.value || '');
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [state.cells]);

  const commitEdit = useCallback(() => {
    if (editingCell && editValue !== undefined) {
      updateCell(editingCell, editValue);
    }
    setEditingCell(null);
    setEditValue('');
  }, [editingCell, editValue, updateCell]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editingCell) {
        commitEdit();
        if (activeCell) {
          const col = activeCell.charCodeAt(0) - 65;
          const row = parseInt(activeCell.slice(1)) - 1;
          if (row + 1 < state.config.rows) {
            const nextKey = getCellKey(col, row + 1);
            setActiveCell(nextKey);
            setSelectedRange(new Set([nextKey]));
          }
        }
      } else if (activeCell) {
        handleCellDoubleClick(activeCell);
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (editingCell) commitEdit();
      if (activeCell) {
        const col = activeCell.charCodeAt(0) - 65;
        const row = parseInt(activeCell.slice(1)) - 1;
        const nextCol = e.shiftKey ? Math.max(0, col - 1) : Math.min(state.config.columns - 1, col + 1);
        const nextKey = getCellKey(nextCol, row);
        setActiveCell(nextKey);
        setSelectedRange(new Set([nextKey]));
      }
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      if (!editingCell && activeCell) {
        updateCell(activeCell, '');
      }
    } else if (!editingCell && activeCell && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      setEditingCell(activeCell);
      setEditValue(e.key);
      setTimeout(() => inputRef.current?.focus(), 0);
    }

    if (!editingCell && activeCell) {
      const col = activeCell.charCodeAt(0) - 65;
      const row = parseInt(activeCell.slice(1)) - 1;
      let nextCol = col;
      let nextRow = row;

      if (e.key === 'ArrowUp') nextRow = Math.max(0, row - 1);
      if (e.key === 'ArrowDown') nextRow = Math.min(state.config.rows - 1, row + 1);
      if (e.key === 'ArrowLeft') nextCol = Math.max(0, col - 1);
      if (e.key === 'ArrowRight') nextCol = Math.min(state.config.columns - 1, col + 1);

      if (nextCol !== col || nextRow !== row) {
        e.preventDefault();
        const nextKey = getCellKey(nextCol, nextRow);
        setActiveCell(nextKey);
        setSelectedRange(new Set([nextKey]));
      }
    }
  }, [editingCell, activeCell, state.config, commitEdit, handleCellDoubleClick, updateCell]);

  const handleAddRow = useCallback(() => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, rows: prev.config.rows + 1 },
    }));
  }, []);

  const handleAddColumn = useCallback(() => {
    if (state.config.columns >= 26) return;
    setState(prev => ({
      ...prev,
      config: { ...prev.config, columns: prev.config.columns + 1 },
    }));
  }, [state.config.columns]);

  const handleManualSave = useCallback(async () => {
    await saveNow(state);
    setManualSaved(true);
    setTimeout(() => setManualSaved(false), 2000);
  }, [saveNow, state]);

  const handleExportCSV = useCallback(() => {
    const { columns, rows } = state.config;
    const lines: string[] = [];

    const headers = Array.from({ length: columns }, (_, i) =>
      state.config.columnHeaders[i] || getColLabel(i)
    );
    lines.push(headers.join(','));

    for (let r = 0; r < rows; r++) {
      const row: string[] = [];
      for (let c = 0; c < columns; c++) {
        const key = getCellKey(c, r);
        const cell = computedCells[key];
        if (cell) {
          const display = formatCellDisplay(cell);
          row.push(display.includes(',') ? `"${display}"` : display);
        } else {
          row.push('');
        }
      }
      lines.push(row.join(','));
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workpaper-${workpaperId || 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.config, computedCells, workpaperId]);

  const formulaBarValue = useMemo(() => {
    if (!activeCell) return '';
    const cell = state.cells[activeCell];
    return cell?.formula || cell?.value || '';
  }, [activeCell, state.cells]);

  return (
    <div className={clsx('flex flex-col bg-white', isFullScreen ? 'fixed inset-0 z-[200]' : 'h-full')}>
      <div className="shrink-0 bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Table2 size={16} className="text-emerald-600" />
          <span className="text-sm font-bold text-slate-800">Sentinel Sheets</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">BETA</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mr-1">
            {saving ? (
              <>
                <Cloud size={12} className="animate-pulse text-blue-500" />
                <span>Kaydediliyor...</span>
              </>
            ) : lastSaved ? (
              <>
                <Cloud size={12} className="text-green-500" />
                <span>{lastSaved.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
              </>
            ) : (
              <>
                <CloudOff size={12} />
                <span>Kaydedilmedi</span>
              </>
            )}
          </div>

          <button
            onClick={handleExportCSV}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            title="CSV Indir"
          >
            <Download size={14} />
          </button>

          <button
            onClick={handleManualSave}
            disabled={saving}
            className={clsx(
              'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
              manualSaved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : manualSaved ? <Check size={12} /> : <Save size={12} />}
            {manualSaved ? 'Kaydedildi' : 'Kaydet'}
          </button>

          {onFullScreen && (
            <button
              onClick={onFullScreen}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
              title={isFullScreen ? 'Kucult' : 'Tam Ekran'}
            >
              {isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          )}
        </div>
      </div>

      <div className="shrink-0 bg-slate-50 border-b border-slate-200 px-4 py-1.5 flex items-center gap-2">
        <div className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono font-bold text-slate-700 min-w-[48px] justify-center">
          {activeCell || '--'}
        </div>
        <Calculator size={12} className="text-slate-400" />
        <input
          type="text"
          value={formulaBarValue}
          onChange={(e) => {
            if (activeCell) {
              setEditingCell(activeCell);
              setEditValue(e.target.value);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && editingCell) {
              commitEdit();
            }
          }}
          placeholder="Hucre degeri veya formul (=SUM, =AVG, =IF...)"
          className="flex-1 text-xs px-2 py-1 border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 font-mono"
        />
      </div>

      <div
        ref={tableRef}
        className="flex-1 overflow-auto"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <table className="border-collapse min-w-full">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="w-10 min-w-[40px] bg-slate-100 border border-slate-200 text-[10px] text-slate-500 font-medium p-0" />
              {Array.from({ length: state.config.columns }, (_, i) => (
                <th
                  key={i}
                  className="bg-slate-100 border border-slate-200 text-[10px] text-slate-600 font-semibold px-2 py-1.5 min-w-[100px] text-center select-none"
                  style={{ width: state.config.columnWidths[i] || 120 }}
                >
                  {state.config.columnHeaders[i] || getColLabel(i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: state.config.rows }, (_, rowIdx) => (
              <tr key={rowIdx} className="group">
                <td className="bg-slate-50 border border-slate-200 text-[10px] text-slate-500 font-medium text-center px-1 py-0.5 select-none sticky left-0 z-[5]">
                  {rowIdx + 1}
                </td>
                {Array.from({ length: state.config.columns }, (_, colIdx) => {
                  const key = getCellKey(colIdx, rowIdx);
                  const cell = computedCells[key];
                  const isActive = activeCell === key;
                  const isEditing = editingCell === key;
                  const isSelected = selectedRange.has(key);

                  return (
                    <td
                      key={key}
                      onClick={() => handleCellClick(key)}
                      onDoubleClick={() => handleCellDoubleClick(key)}
                      className={clsx(
                        'border border-slate-200 px-1.5 py-0 text-xs relative h-7',
                        isActive && !isEditing && 'ring-2 ring-blue-500 ring-inset bg-blue-50/30',
                        isSelected && !isActive && 'bg-blue-50/20',
                        !isActive && !isSelected && 'hover:bg-slate-50',
                        cell?.formula && 'text-blue-700',
                      )}
                    >
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.stopPropagation();
                              commitEdit();
                            }
                            if (e.key === 'Escape') {
                              e.stopPropagation();
                              setEditingCell(null);
                              setEditValue('');
                            }
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              e.stopPropagation();
                              commitEdit();
                              const nextCol = e.shiftKey ? Math.max(0, colIdx - 1) : Math.min(state.config.columns - 1, colIdx + 1);
                              const nextKey = getCellKey(nextCol, rowIdx);
                              setActiveCell(nextKey);
                              setSelectedRange(new Set([nextKey]));
                            }
                          }}
                          className="absolute inset-0 w-full h-full px-1.5 text-xs font-mono bg-white border-none outline-none ring-2 ring-blue-500 z-20"
                        />
                      ) : (
                        <span className="block truncate font-mono text-[11px] leading-7">
                          {cell ? formatCellDisplay(cell) : ''}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="shrink-0 bg-slate-50 border-t border-slate-200 px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddRow}
            className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600 transition-colors"
          >
            <Plus size={10} />
            Satir
          </button>
          <button
            onClick={handleAddColumn}
            className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600 transition-colors"
          >
            <Plus size={10} />
            Sutun
          </button>
        </div>

        <div className="text-[10px] text-slate-400">
          {state.config.rows} x {state.config.columns}
          {Object.keys(state.cells).length > 0 && (
            <span className="ml-2">
              {Object.keys(state.cells).filter(k => state.cells[k]?.value || state.cells[k]?.formula).length} hucre dolu
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
