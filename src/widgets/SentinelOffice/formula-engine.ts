import type { SheetData } from './types';

const CELL_REF_REGEX = /^[A-Z]\d+$/;

function colToIndex(col: string): number {
  return col.charCodeAt(0) - 65;
}

function getCellKey(col: number, row: number): string {
  return `${String.fromCharCode(65 + col)}${row + 1}`;
}

function resolveCellValue(key: string, cells: SheetData, visited: Set<string>): number {
  if (visited.has(key)) return 0;
  visited.add(key);

  const cell = cells[key];
  if (!cell) return 0;

  if (cell.formula) {
    return evaluateFormula(cell.formula, cells, visited);
  }

  const num = parseFloat(cell.value);
  return isNaN(num) ? 0 : num;
}

function parseRange(rangeStr: string): string[] {
  const parts = rangeStr.split(':');
  if (parts.length !== 2) return [];

  const startCol = colToIndex(parts[0][0]);
  const startRow = parseInt(parts[0].slice(1)) - 1;
  const endCol = colToIndex(parts[1][0]);
  const endRow = parseInt(parts[1].slice(1)) - 1;

  const keys: string[] = [];
  for (let c = startCol; c <= endCol; c++) {
    for (let r = startRow; r <= endRow; r++) {
      keys.push(getCellKey(c, r));
    }
  }
  return keys;
}

function extractArgs(formula: string, fnName: string): string {
  const start = formula.indexOf('(');
  const end = formula.lastIndexOf(')');
  if (start === -1 || end === -1) return '';
  return formula.slice(start + 1, end).trim();
}

export function evaluateFormula(formula: string, cells: SheetData, visited = new Set<string>()): number {
  const expr = formula.startsWith('=') ? formula.slice(1).trim() : formula.trim();
  const upper = expr.toUpperCase();

  if (upper.startsWith('SUM(')) {
    const arg = extractArgs(upper, 'SUM');
    const keys = arg.includes(':') ? parseRange(arg) : arg.split(',').map(s => s.trim());
    return keys.reduce((sum, k) => sum + resolveCellValue(k, cells, new Set(visited)), 0);
  }

  if (upper.startsWith('AVG(') || upper.startsWith('AVERAGE(')) {
    const arg = extractArgs(upper, 'AVG');
    const keys = arg.includes(':') ? parseRange(arg) : arg.split(',').map(s => s.trim());
    if (keys.length === 0) return 0;
    const total = keys.reduce((sum, k) => sum + resolveCellValue(k, cells, new Set(visited)), 0);
    return total / keys.length;
  }

  if (upper.startsWith('MAX(')) {
    const arg = extractArgs(upper, 'MAX');
    const keys = arg.includes(':') ? parseRange(arg) : arg.split(',').map(s => s.trim());
    const values = keys.map(k => resolveCellValue(k, cells, new Set(visited)));
    return values.length > 0 ? Math.max(...values) : 0;
  }

  if (upper.startsWith('MIN(')) {
    const arg = extractArgs(upper, 'MIN');
    const keys = arg.includes(':') ? parseRange(arg) : arg.split(',').map(s => s.trim());
    const values = keys.map(k => resolveCellValue(k, cells, new Set(visited)));
    return values.length > 0 ? Math.min(...values) : 0;
  }

  if (upper.startsWith('COUNT(')) {
    const arg = extractArgs(upper, 'COUNT');
    const keys = arg.includes(':') ? parseRange(arg) : arg.split(',').map(s => s.trim());
    return keys.filter(k => {
      const cell = cells[k];
      return cell && cell.value !== '' && !isNaN(parseFloat(cell.value));
    }).length;
  }

  if (upper.startsWith('IF(')) {
    const arg = extractArgs(upper, 'IF');
    const parts = arg.split(',').map(s => s.trim());
    if (parts.length >= 3) {
      const condStr = parts[0];
      let condResult = false;

      for (const op of ['>=', '<=', '!=', '>', '<', '=']) {
        const idx = condStr.indexOf(op);
        if (idx !== -1) {
          const left = condStr.slice(0, idx).trim();
          const right = condStr.slice(idx + op.length).trim();
          const leftVal = CELL_REF_REGEX.test(left) ? resolveCellValue(left, cells, new Set(visited)) : parseFloat(left);
          const rightVal = CELL_REF_REGEX.test(right) ? resolveCellValue(right, cells, new Set(visited)) : parseFloat(right);

          switch (op) {
            case '>=': condResult = leftVal >= rightVal; break;
            case '<=': condResult = leftVal <= rightVal; break;
            case '!=': condResult = leftVal !== rightVal; break;
            case '>': condResult = leftVal > rightVal; break;
            case '<': condResult = leftVal < rightVal; break;
            case '=': condResult = leftVal === rightVal; break;
          }
          break;
        }
      }

      const resultStr = condResult ? parts[1] : parts[2];
      const resultNum = parseFloat(resultStr);
      return isNaN(resultNum) ? 0 : resultNum;
    }
  }

  let processed = upper;
  const cellRefs = processed.match(/[A-Z]\d+/g) || [];
  for (const ref of cellRefs) {
    const val = resolveCellValue(ref, cells, new Set(visited));
    processed = processed.replace(ref, val.toString());
  }

  try {
    const sanitized = processed.replace(/[^0-9+\-*/().%\s]/g, '');
    if (sanitized.trim() === '') return 0;
    const result = new Function(`return (${sanitized})`)();
    return typeof result === 'number' && isFinite(result) ? result : 0;
  } catch {
    return 0;
  }
}

export function computeAllCells(cells: SheetData): SheetData {
  const computed: SheetData = {};
  for (const key of Object.keys(cells)) {
    const cell = cells[key];
    if (cell.formula) {
      const result = evaluateFormula(cell.formula, cells);
      computed[key] = { ...cell, computed: result };
    } else {
      computed[key] = { ...cell };
    }
  }
  return computed;
}

export function formatCellDisplay(cell: { value: string; formula?: string; computed?: number | string; format?: string }): string {
  if (cell.formula && cell.computed !== undefined) {
    const num = typeof cell.computed === 'number' ? cell.computed : parseFloat(String(cell.computed));
    if (isNaN(num)) return String(cell.computed);

    switch (cell.format) {
      case 'currency': return `₺${num.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
      case 'percent': return `%${(num * 100).toFixed(1)}`;
      case 'number': return num.toLocaleString('tr-TR');
      default: return num.toLocaleString('tr-TR');
    }
  }

  if (cell.format === 'currency' && cell.value) {
    const num = parseFloat(cell.value);
    if (!isNaN(num)) return `₺${num.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
  }
  if (cell.format === 'percent' && cell.value) {
    const num = parseFloat(cell.value);
    if (!isNaN(num)) return `%${(num * 100).toFixed(1)}`;
  }

  return cell.value;
}
