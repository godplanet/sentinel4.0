export interface CellData {
  value: string;
  formula?: string;
  computed?: number | string;
  format?: 'text' | 'number' | 'currency' | 'percent';
}

export type SheetData = Record<string, CellData>;

export interface SheetConfig {
  columns: number;
  rows: number;
  columnWidths: Record<number, number>;
  columnHeaders: Record<number, string>;
  frozenCols?: number;
}

export interface SpreadsheetState {
  cells: SheetData;
  config: SheetConfig;
  version: number;
}

export interface SmartVariable {
  key: string;
  label: string;
  category: 'audit' | 'finding' | 'risk' | 'date' | 'team';
  resolve: () => string;
}
