/**
 * Remediation Dossier API — Mevzuat İyileştirme Dosyası
 * audit_findings + actions + action_evidence tablolarından tek bir kapatılmış aksiyon dosyası üretir.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type { ActionEvidence, FindingSnapshot } from '@/entities/action/model/types';

export interface DossierData {
  dossierRef: string;
  generatedAt: string;
  tenantName: string;
  finding: FindingSnapshot & { entity?: string; control?: string };
  originalDueDate: string;
  actualClosureDate: string;
  isBddkBreach: boolean;
  boardExceptionRef?: string;
  evidence: ActionEvidence & { file_name: string };
  auditorName: string;
  auditorUid: string;
  reviewNote: string;
}

interface DbAction {
  id: string;
  finding_id: string;
  original_due_date: string;
  current_due_date: string;
  closed_at: string | null;
  status: string;
  finding_snapshot: FindingSnapshot & { entity?: string; control?: string };
  created_at: string;
}

interface DbEvidence {
  id: string;
  action_id: string;
  storage_path: string;
  file_hash: string;
  ai_confidence_score: number | null;
  review_note: string | null;
  uploaded_by: string | null;
  created_at: string;
}

const BDDK_DAYS = 365;
const QUERY_KEY = ['remediation-dossier'] as const;

function file_name_from_path(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1] || path || 'evidence';
}

export async function fetchDossierData(actionId?: string | null): Promise<DossierData | null> {
  let query = supabase
    .from('actions')
    .select('id, finding_id, original_due_date, current_due_date, closed_at, status, finding_snapshot, created_at')
    .eq('status', 'closed');

  if (actionId) query = query.eq('id', actionId);

  const { data: actions, error: actError } = await query.order('closed_at', { ascending: false }).limit(1);

  if (actError || !actions?.length) return null;

  const action = actions[0] as DbAction;
  const snapshot = action.finding_snapshot;
  if (!snapshot) return null;

  const { data: evidenceRows, error: evError } = await supabase
    .from('action_evidence')
    .select('*')
    .eq('action_id', action.id)
    .limit(1);

  if (evError || !evidenceRows?.length) return null;

  const ev = evidenceRows[0] as DbEvidence;
  const originalDue = action.original_due_date || action.current_due_date;
  const closedAt = action.closed_at || action.created_at;
  const closedDate = closedAt.split('T')[0] ?? closedAt;
  const origDate = new Date(originalDue);
  const closeDate = new Date(closedDate);
  const daysOver = Math.round((closeDate.getTime() - origDate.getTime()) / (1000 * 60 * 60 * 24));
  const isBddkBreach = daysOver > BDDK_DAYS;

  const year = new Date().getFullYear();
  const refNum = String(action.id).slice(0, 8).replace(/-/g, '').toUpperCase();
  const dossierRef = `SEN-DOSSIER-${year}-${refNum}`;

  return {
    dossierRef,
    generatedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
    tenantName: 'Sentinel GRC v3.0 — Tenant',
    finding: {
      finding_id: snapshot.finding_id ?? action.finding_id,
      title: snapshot.title ?? '',
      severity: snapshot.severity ?? 'Medium',
      risk_rating: snapshot.risk_rating ?? 'Medium',
      gias_category: snapshot.gias_category,
      description: snapshot.description,
      created_at: snapshot.created_at ?? action.created_at,
      entity: snapshot.entity,
      control: snapshot.control,
    },
    originalDueDate: originalDue,
    actualClosureDate: closedDate,
    isBddkBreach,
    boardExceptionRef: isBddkBreach ? `BOARD-EXC-${year}-${refNum.slice(0, 4)}` : undefined,
    evidence: {
      id: ev.id,
      action_id: ev.action_id,
      storage_path: ev.storage_path,
      file_hash: ev.file_hash ?? '',
      file_name: file_name_from_path(ev.storage_path),
      ai_confidence_score: ev.ai_confidence_score ?? undefined,
      review_note: ev.review_note ?? undefined,
      uploaded_by: ev.uploaded_by ?? undefined,
      created_at: ev.created_at,
    },
    auditorName: 'Denetçi — Sentinel v3.0',
    auditorUid: '—',
    reviewNote: ev.review_note ?? 'Kanıt incelendi; iyileştirme tamamlandı.',
  };
}

export function useDossierData(actionId?: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, actionId ?? 'latest'],
    queryFn: () => fetchDossierData(actionId),
  });
}
