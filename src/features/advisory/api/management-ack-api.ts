/**
 * Danışmanlık Yönetim Feragatnamesi API — GIAS 11.1
 *
 * DB Gereksinimleri (advisory_engagements tablosu — zaten mevcut):
 *   management_responsibility_confirmed BOOLEAN DEFAULT FALSE  ← mevcut
 *   management_acknowledged_by TEXT                           ← yeni (opsiyonel)
 *   management_acknowledged_at TIMESTAMPTZ                    ← yeni (opsiyonel)
 *
 *   DDL (eklenecek):
 *   ALTER TABLE advisory_engagements
 *     ADD COLUMN IF NOT EXISTS management_acknowledged_by TEXT,
 *     ADD COLUMN IF NOT EXISTS management_acknowledged_at TIMESTAMPTZ;
 */

import { supabase } from '@/shared/api/supabase';

export interface ManagementAckStatus {
  id: string;
  management_responsibility_confirmed: boolean;
  management_acknowledged_by: string | null;
  management_acknowledged_at: string | null;
  status: string;
}

/** Feragatname durumunu ve imza bilgisini çeker */
export async function fetchAckStatus(engagementId: string): Promise<ManagementAckStatus | null> {
  const { data, error } = await supabase
    .from('advisory_engagements')
    .select(
      'id, management_responsibility_confirmed, management_acknowledged_by, management_acknowledged_at, status',
    )
    .eq('id', engagementId)
    .maybeSingle();

  if (error) throw error;
  return data as ManagementAckStatus | null;
}

/**
 * Yönetimin feragatnameyi elektronik imzayla onaylaması.
 * management_responsibility_confirmed = true ve status = 'FIELDWORK' yazar.
 * GIAS 11.1: İç denetimin karar alıcı olmadığı tescil edilir.
 */
export async function confirmManagementAck(
  engagementId: string,
  acknowledgedBy: string,
): Promise<void> {
  const { error } = await supabase
    .from('advisory_engagements')
    .update({
      management_responsibility_confirmed: true,
      management_acknowledged_by: acknowledgedBy,
      management_acknowledged_at: new Date().toISOString(),
      status: 'FIELDWORK',
    })
    .eq('id', engagementId);

  if (error) throw error;
}
