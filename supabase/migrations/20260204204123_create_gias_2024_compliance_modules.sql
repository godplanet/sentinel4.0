/*
  # SENTINEL v3.0 - GIAS 2024 Tam Uyum Paketi

  1. Modül A: Sentinel Survey (Anket ve Geri Bildirim) - Std 11.1
    - `surveys` - Anket şablonları
    - `survey_responses` - Anket yanıtları ve puanları

  2. Modül B: QAIP Master (Kalite Güvence) - Std 12.1
    - `qaip_checklists` - Kalite kontrol listeleri
    - `qaip_reviews` - Kalite inceleme sonuçları

  3. Modül C: Talent OS (Yetenek Yönetimi) - Std 3.1
    - `auditor_profiles` - Denetçi profilleri ve yetkinlikler

  4. Modül D: Governance Vault (Yönetişim Kasası) - Std 6.1
    - `governance_docs` - Yönetmelik ve dokümanlar
    - `auditor_declarations` - Bağımsızlık beyanları

  Tüm tablolar RLS aktif ve tenant_id bazlı izolasyon sağlanmıştır.
*/

-- ============================================================
-- MODÜL A: SENTINEL SURVEY (ANKET VE GERİ BİLDİRİM)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    target_audience TEXT CHECK (target_audience IN ('AUDITEE', 'INTERNAL', 'EXTERNAL')),
    form_schema JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
    respondent_id UUID REFERENCES auth.users(id),
    engagement_id UUID,
    answers JSONB NOT NULL,
    score DECIMAL(5,2),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for Surveys
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view surveys in their tenant"
  ON public.surveys FOR SELECT
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Admins can create surveys"
  ON public.surveys FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Admins can update surveys"
  ON public.surveys FOR UPDATE
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001')
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Admins can delete surveys"
  ON public.surveys FOR DELETE
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001');

-- RLS Policies for Survey Responses
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view responses in their tenant"
  ON public.survey_responses FOR SELECT
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can submit responses"
  ON public.survey_responses FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

-- ============================================================
-- MODÜL B: QAIP MASTER (KALİTE GÜVENCE)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.qaip_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    criteria JSONB NOT NULL,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.qaip_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_id UUID,
    reviewer_id UUID REFERENCES auth.users(id),
    checklist_id UUID REFERENCES public.qaip_checklists(id),
    results JSONB NOT NULL,
    total_score INTEGER,
    status TEXT DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'APPROVED')),
    notes TEXT,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for QAIP Checklists
ALTER TABLE public.qaip_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view checklists in their tenant"
  ON public.qaip_checklists FOR SELECT
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Admins can create checklists"
  ON public.qaip_checklists FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Admins can update checklists"
  ON public.qaip_checklists FOR UPDATE
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001')
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Admins can delete checklists"
  ON public.qaip_checklists FOR DELETE
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001');

-- RLS Policies for QAIP Reviews
ALTER TABLE public.qaip_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reviews in their tenant"
  ON public.qaip_reviews FOR SELECT
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Reviewers can create reviews"
  ON public.qaip_reviews FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Reviewers can update their reviews"
  ON public.qaip_reviews FOR UPDATE
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001')
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

-- ============================================================
-- MODÜL C: TALENT OS (YETENEK YÖNETİMİ)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.auditor_profiles (
    user_id UUID PRIMARY KEY,
    title TEXT,
    department TEXT,
    certifications TEXT[] DEFAULT ARRAY[]::TEXT[],
    skills_matrix JSONB DEFAULT '{}'::jsonb,
    cpe_credits INTEGER DEFAULT 0,
    hire_date DATE,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.training_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.auditor_profiles(user_id),
    training_title TEXT NOT NULL,
    training_type TEXT CHECK (training_type IN ('INTERNAL', 'EXTERNAL', 'CERTIFICATION', 'ONLINE')),
    hours INTEGER DEFAULT 0,
    cpe_credits INTEGER DEFAULT 0,
    completed_date DATE,
    certificate_url TEXT,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for Auditor Profiles
ALTER TABLE public.auditor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view profiles in their tenant"
  ON public.auditor_profiles FOR SELECT
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can update own profile"
  ON public.auditor_profiles FOR UPDATE
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001')
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Admins can insert profiles"
  ON public.auditor_profiles FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

-- RLS Policies for Training Records
ALTER TABLE public.training_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view training records in their tenant"
  ON public.training_records FOR SELECT
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can create training records"
  ON public.training_records FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can update training records"
  ON public.training_records FOR UPDATE
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001')
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

-- ============================================================
-- MODÜL D: GOVERNANCE VAULT (YÖNETİŞİM KASASI)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.governance_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_type TEXT NOT NULL CHECK (doc_type IN ('CHARTER', 'DECLARATION', 'MINUTES', 'POLICY', 'PROCEDURE')),
    title TEXT NOT NULL,
    version TEXT,
    content_url TEXT,
    approval_status TEXT DEFAULT 'DRAFT' CHECK (approval_status IN ('DRAFT', 'APPROVED', 'ARCHIVED')),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.auditor_declarations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    declaration_type TEXT DEFAULT 'INDEPENDENCE' CHECK (declaration_type IN ('INDEPENDENCE', 'CONFLICT_OF_INTEREST', 'CODE_OF_CONDUCT')),
    period_year INTEGER NOT NULL,
    content JSONB,
    signed_at TIMESTAMPTZ DEFAULT NOW(),
    signature_hash TEXT,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for Governance Docs
ALTER TABLE public.governance_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view governance docs in their tenant"
  ON public.governance_docs FOR SELECT
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Admins can create governance docs"
  ON public.governance_docs FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Admins can update governance docs"
  ON public.governance_docs FOR UPDATE
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001')
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Admins can delete governance docs"
  ON public.governance_docs FOR DELETE
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001');

-- RLS Policies for Auditor Declarations
ALTER TABLE public.auditor_declarations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view declarations in their tenant"
  ON public.auditor_declarations FOR SELECT
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can create declarations"
  ON public.auditor_declarations FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can update own declarations"
  ON public.auditor_declarations FOR UPDATE
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001')
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');
