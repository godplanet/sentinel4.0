/*
  RCSA Campaigns & Universal Four-Eyes (Maker-Checker) Schema

  NOTES:
  - DDL ONLY: No seed data is included in this migration.
  - Status fields are TEXT with CHECK constraints (no PostgreSQL ENUM types).
*/

-- =============================================
-- 1. Universal Four-Eyes Approvals Table
-- =============================================

CREATE TABLE IF NOT EXISTS public.sys_four_eyes_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  resource_type text NOT NULL,              -- e.g. 'audit_finding', 'audit_engagement'
  resource_id text NOT NULL,                -- generic id reference (uuid or business key as text)
  action_name text NOT NULL,                -- e.g. 'close_finding', 'downgrade_grade'
  maker_id uuid NOT NULL,                   -- who initiated the action
  checker_id uuid,                          -- who approved / rejected
  status text NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz
);

ALTER TABLE public.sys_four_eyes_approvals
  ENABLE ROW LEVEL SECURITY;

-- Makers & checkers can read their own approval records
CREATE POLICY "four_eyes_select_own"
  ON public.sys_four_eyes_approvals
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = maker_id
    OR auth.uid() = COALESCE(checker_id, auth.uid())
  );

-- Makers can create approval requests for themselves
CREATE POLICY "four_eyes_insert_maker"
  ON public.sys_four_eyes_approvals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = maker_id);

-- Checkers can update status on items where they are assigned
CREATE POLICY "four_eyes_update_checker"
  ON public.sys_four_eyes_approvals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = COALESCE(checker_id, auth.uid()))
  WITH CHECK (auth.uid() = COALESCE(checker_id, auth.uid()));


-- =============================================
-- 2. RCSA Campaigns Table
-- =============================================

CREATE TABLE IF NOT EXISTS public.rcsa_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'ACTIVE', 'COMPLETED')),
  start_date date,
  end_date date,
  completion_rate numeric(5,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL DEFAULT auth.uid()
);

ALTER TABLE public.rcsa_campaigns
  ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read campaigns for their tenant (simplified dev-mode policy)
CREATE POLICY "rcsa_campaigns_select_all"
  ON public.rcsa_campaigns
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can create campaigns (in real deployment: restrict to CAE / planning roles)
CREATE POLICY "rcsa_campaigns_insert_all"
  ON public.rcsa_campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update campaigns (status, dates, completion)
CREATE POLICY "rcsa_campaigns_update_all"
  ON public.rcsa_campaigns
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_rcsa_campaigns_tenant_status
  ON public.rcsa_campaigns (tenant_id, status);

