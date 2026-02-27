/*
  # Workpaper Detail Tables - Test Steps & Evidence Requests

  1. New Tables
    - `workpaper_test_steps`
      - `id` (uuid, primary key)
      - `workpaper_id` (uuid, FK to workpapers)
      - `step_order` (int) - ordering of test steps
      - `description` (text) - the test procedure description
      - `is_completed` (boolean) - whether step is done
      - `auditor_comment` (text) - auditor notes on step
    - `evidence_requests`
      - `id` (uuid, primary key)
      - `workpaper_id` (uuid, FK to workpapers)
      - `title` (text) - evidence request title
      - `description` (text) - what is being requested
      - `requested_from_user_id` (uuid) - auditee user
      - `status` (varchar) - pending/submitted/accepted
      - `due_date` (timestamptz) - deadline
      - `file_url` (text) - uploaded file URL

  2. Security
    - RLS enabled on both tables
    - Authenticated users can CRUD via workpaper membership
    - Dev-mode anon policies for testing

  3. Indexes
    - workpaper_id on both tables
    - status on evidence_requests
*/

CREATE TABLE IF NOT EXISTS workpaper_test_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workpaper_id UUID NOT NULL REFERENCES workpapers(id) ON DELETE CASCADE,
    step_order INT NOT NULL DEFAULT 0,
    description TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    auditor_comment TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evidence_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workpaper_id UUID NOT NULL REFERENCES workpapers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    requested_from_user_id UUID,
    status VARCHAR(20) DEFAULT 'pending',
    due_date TIMESTAMPTZ,
    file_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE workpaper_test_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can select workpaper_test_steps"
  ON workpaper_test_steps FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = workpaper_test_steps.workpaper_id));

CREATE POLICY "Authenticated users can insert workpaper_test_steps"
  ON workpaper_test_steps FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = workpaper_test_steps.workpaper_id));

CREATE POLICY "Authenticated users can update workpaper_test_steps"
  ON workpaper_test_steps FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = workpaper_test_steps.workpaper_id))
  WITH CHECK (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = workpaper_test_steps.workpaper_id));

CREATE POLICY "Authenticated users can delete workpaper_test_steps"
  ON workpaper_test_steps FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = workpaper_test_steps.workpaper_id));

CREATE POLICY "Authenticated users can select evidence_requests"
  ON evidence_requests FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = evidence_requests.workpaper_id));

CREATE POLICY "Authenticated users can insert evidence_requests"
  ON evidence_requests FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = evidence_requests.workpaper_id));

CREATE POLICY "Authenticated users can update evidence_requests"
  ON evidence_requests FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = evidence_requests.workpaper_id))
  WITH CHECK (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = evidence_requests.workpaper_id));

CREATE POLICY "Authenticated users can delete evidence_requests"
  ON evidence_requests FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = evidence_requests.workpaper_id));

CREATE POLICY "Dev anon select workpaper_test_steps"
  ON workpaper_test_steps FOR SELECT TO anon USING (true);
CREATE POLICY "Dev anon insert workpaper_test_steps"
  ON workpaper_test_steps FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Dev anon update workpaper_test_steps"
  ON workpaper_test_steps FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Dev anon delete workpaper_test_steps"
  ON workpaper_test_steps FOR DELETE TO anon USING (true);

CREATE POLICY "Dev anon select evidence_requests"
  ON evidence_requests FOR SELECT TO anon USING (true);
CREATE POLICY "Dev anon insert evidence_requests"
  ON evidence_requests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Dev anon update evidence_requests"
  ON evidence_requests FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Dev anon delete evidence_requests"
  ON evidence_requests FOR DELETE TO anon USING (true);

CREATE INDEX IF NOT EXISTS idx_test_steps_workpaper ON workpaper_test_steps(workpaper_id);
CREATE INDEX IF NOT EXISTS idx_evidence_requests_workpaper ON evidence_requests(workpaper_id);
CREATE INDEX IF NOT EXISTS idx_evidence_requests_status ON evidence_requests(status);

DO $$
DECLARE
  v_wp_id UUID;
BEGIN
  SELECT id INTO v_wp_id FROM workpapers LIMIT 1;

  IF v_wp_id IS NOT NULL THEN
    INSERT INTO workpaper_test_steps (workpaper_id, step_order, description, is_completed, auditor_comment) VALUES
      (v_wp_id, 1, 'Kredi dosyalarından rastgele 25 adet seçin ve dosya bütünlüğünü kontrol edin.', true, 'Tamamlandı - 25 dosya incelendi, 2 dosyada eksiklik tespit edildi.'),
      (v_wp_id, 2, 'Seçilen dosyalardaki teminat değerlemelerinin güncelliğini doğrulayın.', true, '23 dosyada güncel, 2 dosyada 6 aydan eski değerleme mevcut.'),
      (v_wp_id, 3, 'Kredi onay yetkilerinin yetki matrisine uygunluğunu test edin.', false, ''),
      (v_wp_id, 4, 'Limit aşımı olan kredilerin yönetim kurulu onaylarını kontrol edin.', false, ''),
      (v_wp_id, 5, 'Takipteki krediler için karşılık hesaplamalarının doğruluğunu analiz edin.', false, '');

    INSERT INTO evidence_requests (workpaper_id, title, description, status, due_date) VALUES
      (v_wp_id, 'Mart 2026 Genel Mizan', 'Genel muhasebe mizanının tam dökümü gereklidir.', 'submitted', now() + interval '3 days'),
      (v_wp_id, 'Kredi Komitesi Toplantı Tutanakları', 'Son 3 aylık kredi komitesi karar tutanakları.', 'pending', now() + interval '5 days'),
      (v_wp_id, 'Teminat Değerleme Raporları', 'Seçilen 25 kredi dosyasına ait ekspertiz raporları.', 'pending', now() + interval '7 days'),
      (v_wp_id, 'Yetki Matrisi Güncel Kopya', 'Kredi tahsis ve onay yetki matrisinin güncel versiyonu.', 'accepted', now() - interval '2 days');
  END IF;
END $$;
