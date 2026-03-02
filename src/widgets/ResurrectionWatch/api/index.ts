import { supabase } from '@/shared/api/supabase';

/**
 * ResurrectionBoard için "risk_accepted" statüsündeki aksiyonları getirir.
 * finding_snapshot JSONB alanından bulgu başlığı ve risk açıklaması alınır.
 * current_due_date → vade sonu (expiration_date)
 * created_at → kabulün başlangıç tarihi (acceptance_start)
 */
export interface RiskAcceptanceItem {
  id: string;
  action_id: string;
  finding_title: string;
  risk_description: string;
  justification: string;
  expiration_date: string;
  acceptance_start: string;
  accepted_by: string;
  reviewer_id: string | null;
}

export async function fetchRiskAcceptances(): Promise<RiskAcceptanceItem[]> {
  const { data, error } = await supabase
    .from('actions')
    .select(
      'id, finding_id, finding_snapshot, original_due_date, current_due_date, created_at, assignee_unit_name, responsible_person'
    )
    .eq('status', 'risk_accepted')
    .order('current_due_date', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const snapshot = (row.finding_snapshot ?? {}) as Record<string, unknown>;
    const expiryDate =
      (row.current_due_date as string) ||
      (row.original_due_date as string) ||
      '';

    return {
      id: `ra-${row.id}`,
      action_id: row.id as string,
      finding_title: (snapshot.title as string) ?? 'Bilinmeyen Bulgu',
      risk_description: (snapshot.description as string) ?? '',
      justification: (snapshot.risk_description as string) ?? '',
      expiration_date: expiryDate,
      acceptance_start: (row.created_at as string)?.split('T')[0] ?? '',
      accepted_by:
        (row.responsible_person as string) ||
        (row.assignee_unit_name as string) ||
        'Yönetim',
      reviewer_id: null,
    };
  });
}
