/*
  OOT (Out-of-Office) ve Akademi blokajı — denetçi yoklukları
  Gantt üzerinde izin/eğitim bloklarının gösterilmesi ve atama çakışma kontrolü için.
*/

CREATE TABLE IF NOT EXISTS talent_absences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  user_id uuid NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  absence_type text NOT NULL CHECK (absence_type IN ('LEAVE', 'TRAINING', 'SICK', 'OTHER')),
  reason text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_talent_absences_user_dates ON talent_absences(user_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_talent_absences_tenant ON talent_absences(tenant_id);

ALTER TABLE talent_absences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read talent_absences"
  ON talent_absences FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role full access talent_absences"
  ON talent_absences FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
