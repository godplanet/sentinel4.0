/*
  RCSA Survey Builder Schema

  - rcsa_questions: Questions configured per RCSA campaign.
  - rcsa_responses: Answers submitted by auditees for a given campaign.

  NOTE:
  - DDL only. No seed data is included.
  - Status / type fields use TEXT with CHECK constraints (no ENUM types).
*/

-- =============================================
-- 1. RCSA Questions
-- =============================================

CREATE TABLE IF NOT EXISTS public.rcsa_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  campaign_id uuid NOT NULL REFERENCES public.rcsa_campaigns(id) ON DELETE CASCADE,
  text text NOT NULL,
  type text NOT NULL
    CHECK (type IN ('TEXT', 'BOOLEAN', 'MULTIPLE_CHOICE')),
  options jsonb NOT NULL DEFAULT '[]'::jsonb,         -- e.g. ['Evet','Hayır'] for multiple choice
  trigger_finding_if_value text,                      -- when answer equals this value, auto-finding logic can fire
  weight numeric(6,2) NOT NULL DEFAULT 1.0
);

ALTER TABLE public.rcsa_questions
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_rcsa_questions_tenant_campaign
  ON public.rcsa_questions (tenant_id, campaign_id);

CREATE POLICY "rcsa_questions_select_all"
  ON public.rcsa_questions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "rcsa_questions_insert_all"
  ON public.rcsa_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "rcsa_questions_update_all"
  ON public.rcsa_questions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- =============================================
-- 2. RCSA Responses
-- =============================================

CREATE TABLE IF NOT EXISTS public.rcsa_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  campaign_id uuid NOT NULL REFERENCES public.rcsa_campaigns(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.rcsa_questions(id) ON DELETE CASCADE,
  auditee_id uuid NOT NULL,                          -- iş birimi yöneticisi / cevaplayan
  answer text NOT NULL,
  is_finding_triggered boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rcsa_responses
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_rcsa_responses_tenant_campaign
  ON public.rcsa_responses (tenant_id, campaign_id);

CREATE POLICY "rcsa_responses_select_all"
  ON public.rcsa_responses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "rcsa_responses_insert_all"
  ON public.rcsa_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

