/**
 * OOT (Out-of-Office) ve Akademi blokajı — denetçi yoklukları
 *
 * DDL GEREKSİNİMİ (henüz yoksa migration'da oluşturulmalı):
 *
 * CREATE TABLE IF NOT EXISTS talent_absences (
 *   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *   tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
 *   user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 *   start_date date NOT NULL,
 *   end_date date NOT NULL,
 *   absence_type text NOT NULL CHECK (absence_type IN ('LEAVE', 'TRAINING', 'SICK', 'OTHER')),
 *   reason text,
 *   created_at timestamptz DEFAULT now()
 * );
 * CREATE INDEX idx_talent_absences_user_dates ON talent_absences(user_id, start_date, end_date);
 *
 * RLS: authenticated read for tenant.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

export type AbsenceType = 'LEAVE' | 'TRAINING' | 'SICK' | 'OTHER';

export interface AuditorAbsence {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  absence_type: AbsenceType;
  reason: string | null;
}

export async function fetchAuditorAbsences(
  fromDate: string,
  toDate: string
): Promise<AuditorAbsence[]> {
  const { data, error } = await supabase
    .from('talent_absences')
    .select('id, user_id, start_date, end_date, absence_type, reason')
    .lte('start_date', toDate)
    .gte('end_date', fromDate)
    .order('start_date');

  if (error) {
    if (error.code === '42P01') return [];
    throw error;
  }
  return (data ?? []) as AuditorAbsence[];
}

export function useAuditorAbsences(fromDate: string, toDate: string) {
  return useQuery({
    queryKey: ['talent-absences', fromDate, toDate],
    queryFn: () => fetchAuditorAbsences(fromDate, toDate),
    enabled: Boolean(fromDate && toDate),
  });
}

export function getAbsenceLabel(type: AbsenceType): string {
  switch (type) {
    case 'LEAVE':
      return 'İzinli';
    case 'TRAINING':
      return 'Eğitimde';
    case 'SICK':
      return 'Hastalık';
    default:
      return 'Yokluk';
  }
}
