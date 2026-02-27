/*
  # Finding Hub & Auditee Portal - Comprehensive Schema

  ## Genel Bakış
  Modül 5: Finding Hub & Auditee Portal için eksiksiz veritabanı şeması.
  Bulgu yaşam döngüsü yönetimi, müzakere süreci, aksiyon planları ve
  denetlenen portal entegrasyonu için gerekli tüm yapıları içerir.

  ## Ana Özellikler
  1. **State Machine**: DRAFT → IN_NEGOTIATION → AGREED/DISPUTED → FINAL → REMEDIATED
  2. **Split View Logic**: Müfettiş ve denetlenen arasında eş zamanlı çalışma
  3. **Action Plans**: Denetlenen tarafından oluşturulan aksiyon planları
  4. **Audit Trail**: Tüm değişikliklerin geçmişi
  5. **Sensitive Data Protection**: finding_secrets tablosu

  ## Tablolar
  1. audit_findings: Ana bulgu tablosu (genişletilmiş)
  2. finding_secrets: Hassas bilgiler (RCA, detaylar)
  3. action_plans: Denetlenen aksiyon planları
  4. finding_history: State değişim geçmişi
  5. finding_comments: Müzakere yorumları

  ## RLS Güvenlik
  - Multi-tenant izolasyon
  - Sensitive data protection
*/

-- =====================================================
-- 1. AUDIT_FINDINGS TABLE (GENIŞLETME)
-- =====================================================

-- Mevcut tabloya ek kolonlar ekle
DO $$
BEGIN
  -- State kolonu (yeni state machine için)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'state'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN state text DEFAULT 'DRAFT';
  END IF;

  -- Denetlenen bilgileri
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'auditee_id'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN auditee_id uuid REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'auditee_department'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN auditee_department text;
  END IF;

  -- Müzakere bilgileri
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'negotiation_started_at'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN negotiation_started_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'agreed_at'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN agreed_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'finalized_at'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN finalized_at timestamptz;
  END IF;

  -- Risk scoring
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'impact_score'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN impact_score integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'likelihood_score'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN likelihood_score integer DEFAULT 1;
  END IF;

  -- GIAS 2024 Kategorileri
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'gias_category'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN gias_category text;
  END IF;

  -- Finansal etki
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'financial_impact'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN financial_impact numeric(15,2);
  END IF;
END $$;

-- State constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_finding_state'
  ) THEN
    ALTER TABLE audit_findings ADD CONSTRAINT valid_finding_state 
      CHECK (state IN ('DRAFT', 'IN_NEGOTIATION', 'AGREED', 'DISPUTED', 'FINAL', 'REMEDIATED'));
  END IF;
END $$;

-- =====================================================
-- 2. FINDING_SECRETS TABLE (HASSAS BİLGİLER)
-- =====================================================

CREATE TABLE IF NOT EXISTS finding_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  finding_id uuid NOT NULL REFERENCES audit_findings(id) ON DELETE CASCADE,
  
  -- 5 Whys Root Cause Analysis
  why_1 text,
  why_2 text,
  why_3 text,
  why_4 text,
  why_5 text,
  root_cause_summary text,
  
  -- Detaylı teknik açıklamalar (müfettiş notları)
  internal_notes text,
  technical_details jsonb DEFAULT '{}'::jsonb,
  
  -- Denetlenen görmesin diye
  auditor_only_comments text,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  
  CONSTRAINT unique_finding_secret UNIQUE (finding_id)
);

CREATE INDEX IF NOT EXISTS idx_finding_secrets_finding ON finding_secrets(finding_id);
CREATE INDEX IF NOT EXISTS idx_finding_secrets_tenant ON finding_secrets(tenant_id);

-- =====================================================
-- 3. ACTION_PLANS TABLE (AKSİYON PLANLARI)
-- =====================================================

CREATE TABLE IF NOT EXISTS action_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  finding_id uuid NOT NULL REFERENCES audit_findings(id) ON DELETE CASCADE,
  
  -- Plan bilgileri
  title text NOT NULL,
  description text NOT NULL,
  responsible_person text NOT NULL,
  responsible_person_title text,
  responsible_department text,
  
  -- Tarihler
  target_date date NOT NULL,
  completion_date date,
  
  -- Status
  status text DEFAULT 'DRAFT',
  priority text DEFAULT 'MEDIUM',
  
  -- Progress tracking
  progress_percentage integer DEFAULT 0,
  milestones jsonb DEFAULT '[]'::jsonb,
  
  -- Auditee perspective
  auditee_response text,
  auditee_agreed boolean DEFAULT false,
  auditee_agreed_at timestamptz,
  
  -- Evidence
  evidence_links jsonb DEFAULT '[]'::jsonb,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  
  CONSTRAINT valid_action_status CHECK (status IN ('DRAFT', 'IN_REVIEW', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE')),
  CONSTRAINT valid_action_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  CONSTRAINT valid_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100)
);

CREATE INDEX IF NOT EXISTS idx_action_plans_finding ON action_plans(finding_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_tenant ON action_plans(tenant_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_status ON action_plans(status);
CREATE INDEX IF NOT EXISTS idx_action_plans_target_date ON action_plans(target_date);

-- =====================================================
-- 4. FINDING_HISTORY TABLE (DEĞIŞIM GEÇMİŞİ)
-- =====================================================

CREATE TABLE IF NOT EXISTS finding_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  finding_id uuid NOT NULL REFERENCES audit_findings(id) ON DELETE CASCADE,
  
  -- State değişimi
  previous_state text,
  new_state text NOT NULL,
  
  -- Değişiklik detayları
  change_type text NOT NULL,
  changed_fields jsonb DEFAULT '{}'::jsonb,
  change_description text,
  
  -- Actor
  changed_by uuid REFERENCES auth.users(id),
  changed_by_role text,
  
  -- Timestamp
  changed_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_change_type CHECK (change_type IN (
    'STATE_CHANGE', 'CONTENT_EDIT', 'SEVERITY_CHANGE', 
    'ASSIGNMENT', 'ACTION_PLAN_ADDED', 'COMMENT_ADDED'
  ))
);

CREATE INDEX IF NOT EXISTS idx_finding_history_finding ON finding_history(finding_id);
CREATE INDEX IF NOT EXISTS idx_finding_history_tenant ON finding_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finding_history_changed_at ON finding_history(changed_at DESC);

-- =====================================================
-- 5. FINDING_COMMENTS TABLE (MÜZAKERE YORUMLARI)
-- =====================================================

CREATE TABLE IF NOT EXISTS finding_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  finding_id uuid NOT NULL REFERENCES audit_findings(id) ON DELETE CASCADE,
  
  -- Yorum içeriği
  comment_text text NOT NULL,
  comment_type text DEFAULT 'DISCUSSION',
  
  -- Actor
  author_id uuid NOT NULL REFERENCES auth.users(id),
  author_role text NOT NULL,
  author_name text,
  
  -- Thread
  parent_comment_id uuid REFERENCES finding_comments(id),
  
  -- Attachments
  attachments jsonb DEFAULT '[]'::jsonb,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_deleted boolean DEFAULT false,
  
  CONSTRAINT valid_comment_type CHECK (comment_type IN ('DISCUSSION', 'AGREEMENT', 'DISPUTE', 'CLARIFICATION')),
  CONSTRAINT valid_author_role CHECK (author_role IN ('AUDITOR', 'AUDITEE', 'AUDIT_MANAGER'))
);

CREATE INDEX IF NOT EXISTS idx_finding_comments_finding ON finding_comments(finding_id);
CREATE INDEX IF NOT EXISTS idx_finding_comments_tenant ON finding_comments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finding_comments_author ON finding_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_finding_comments_created ON finding_comments(created_at DESC);

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- State değiştirme fonksiyonu (otomatik history kaydı ile)
CREATE OR REPLACE FUNCTION change_finding_state(
  p_finding_id uuid,
  p_new_state text,
  p_changed_by uuid,
  p_change_description text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_old_state text;
  v_tenant_id uuid;
BEGIN
  -- Mevcut state'i al
  SELECT state, tenant_id INTO v_old_state, v_tenant_id
  FROM audit_findings
  WHERE id = p_finding_id;

  -- State'i güncelle
  UPDATE audit_findings
  SET 
    state = p_new_state,
    negotiation_started_at = CASE WHEN p_new_state = 'IN_NEGOTIATION' THEN now() ELSE negotiation_started_at END,
    agreed_at = CASE WHEN p_new_state = 'AGREED' THEN now() ELSE agreed_at END,
    finalized_at = CASE WHEN p_new_state = 'FINAL' THEN now() ELSE finalized_at END,
    updated_at = now()
  WHERE id = p_finding_id;

  -- History kaydı oluştur
  INSERT INTO finding_history (
    tenant_id, finding_id, previous_state, new_state,
    change_type, changed_by, change_description
  ) VALUES (
    v_tenant_id, p_finding_id, v_old_state, p_new_state,
    'STATE_CHANGE', p_changed_by, p_change_description
  );

  -- Event publish (outbox pattern)
  PERFORM publish_event(
    v_tenant_id,
    'FINDING_STATE_CHANGED',
    'audit_finding',
    p_finding_id,
    jsonb_build_object(
      'previous_state', v_old_state,
      'new_state', p_new_state,
      'changed_by', p_changed_by
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aksiyon planı tamamlanma kontrolü
CREATE OR REPLACE FUNCTION check_action_plan_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Eğer tüm aksiyon planları tamamlandıysa bulguyu remediated yap
  IF NEW.status = 'COMPLETED' THEN
    IF NOT EXISTS (
      SELECT 1 FROM action_plans
      WHERE finding_id = NEW.finding_id
        AND status != 'COMPLETED'
        AND id != NEW.id
    ) THEN
      UPDATE audit_findings
      SET state = 'REMEDIATED'
      WHERE id = NEW.finding_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_action_completion ON action_plans;
CREATE TRIGGER trg_check_action_completion
AFTER UPDATE ON action_plans
FOR EACH ROW
EXECUTE FUNCTION check_action_plan_completion();

-- =====================================================
-- 7. ROW LEVEL SECURITY
-- =====================================================

-- FINDING_SECRETS: Tenant kontrolü
ALTER TABLE finding_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view finding secrets in tenant"
  ON finding_secrets FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create finding secrets"
  ON finding_secrets FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update finding secrets"
  ON finding_secrets FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

-- ACTION_PLANS: Hem müfettiş hem denetlenen görebilir
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view action plans in tenant"
  ON action_plans FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create action plans"
  ON action_plans FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update action plans"
  ON action_plans FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

-- FINDING_HISTORY: Herkes okuyabilir (audit trail)
ALTER TABLE finding_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view finding history in tenant"
  ON finding_history FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

-- FINDING_COMMENTS: Herkes görebilir ve ekleyebilir
ALTER TABLE finding_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view finding comments in tenant"
  ON finding_comments FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
    AND is_deleted = false
  );

CREATE POLICY "Users can create finding comments"
  ON finding_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
    AND author_id = auth.uid()
  );

CREATE POLICY "Users can update own comments"
  ON finding_comments FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
    AND author_id = auth.uid()
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- 8. COMMENTS & DOCUMENTATION
-- =====================================================

COMMENT ON TABLE finding_secrets IS
  'Hassas bulgu bilgileri (5-Whys RCA, müfettiş notları). Sadece auditor role görebilir.';

COMMENT ON TABLE action_plans IS
  'Denetlenen tarafından oluşturulan aksiyon planları. Bulguların düzeltici aksiyonları.';

COMMENT ON TABLE finding_history IS
  'Bulgu değişim geçmişi. Audit trail için tüm state değişimleri kaydedilir.';

COMMENT ON TABLE finding_comments IS
  'Bulgu müzakere yorumları. Müfettiş ve denetlenen arasında iletişim.';

COMMENT ON FUNCTION change_finding_state IS
  'Bulgu state değiştirme. Otomatik history kaydı ve event publishing yapar.';
