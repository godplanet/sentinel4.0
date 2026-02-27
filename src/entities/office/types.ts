import type { SpreadsheetState } from '@/widgets/SentinelOffice/types';

export interface OfficeDocument {
  id: string;
  tenant_id: string;
  workpaper_id: string | null;
  title: string;
  doc_type: 'SPREADSHEET' | 'DOCUMENT';
  current_version_id: string | null;
  created_by_name: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface OfficeVersion {
  id: string;
  tenant_id: string;
  document_id: string;
  version_number: number;
  content_data: SpreadsheetState | Record<string, unknown>;
  content_hash: string;
  change_summary: string | null;
  is_frozen: boolean;
  created_by_name: string;
  created_at: string;
}

export interface DocumentWithVersion extends OfficeDocument {
  latestVersion: OfficeVersion | null;
}
