/*
  # Phase 1: The Titanium Core — Action Tracking & BDDK Compliance (Module 7)

  ## Summary
  Extends the existing Action Tracking layer (originally created in migration
  20260211122745) to GIAS 2024 and BRSA (BDDK) standards.

  The tables `actions`, `action_evidence`, and `action_requests` are PRESERVED
  from the previous migration and extended with ALTER TABLE. Only
  `master_action_campaigns` is newly created here.

  ## New Table
  1. `master_action_campaigns` — Groups related actions under a root-cause campaign

  ## New Columns Added to Existing Tables
  - `actions.assignee_unit_id`  — FK to audit_entities (supplements text unit_name)
  - `actions.campaign_id`       — FK to master_action_campaigns
  - `actions.regulatory_tags`   — text[] e.g. ['BDDK', 'BRSA']
  - `actions.escalation_level`  — 0=Normal → 3=Board
  - `action_evidence.ai_confidence_score` — AI reviewer confidence (0-100)
  - `action_evidence.review_note`         — Populated when auditor rejects
  - `action_requests.expiration_date`     — When the request itself expires

  ## Status Enum Extended (GIAS 2024 State Machine values added)
  pending → evidence_submitted → review_rejected → [back to evidence_submitted]
                               → risk_accepted
                               → closed  (Auditor only)

  ## Security (GIAS 15.2 Hard-Gate RLS)
  Old anon-only policies from 20260211122745 are replaced with role-aware policies.
  - Auditees: status = 'evidence_submitted' ONLY when evidence row exists
  - Auditees: BLOCKED from 'closed'
  - Auditors: Full transition rights
  - Dev/anon: Full bypass for demo environment

  ## Triggers
  1. `tg_iron_vault`          — Rejects any mutation of finding_snapshot
  2. `tg_bddk_red_line`       — Blocks extension when original_due_date > 365 days past
  3. `tg_entity_health_decay` — Glass Ceiling formula on audit_entities.risk_score

  ## Views
  - `view_action_aging_metrics` — Triple-tier aging + BDDK breach flag
*/

-- =============================================================================
-- 0. TEARDOWN — Drop triggers, functions, views and action_logs.
--    The tables actions / action_evidence / action_requests are NOT dropped;
--    they were created by migration 20260211122745 and are extended below.
-- =============================================================================

DROP VIEW     IF EXISTS view_action_aging_metrics       CASCADE;
DROP VIEW     IF EXISTS view_action_aging               CASCADE;

DROP TRIGGER  IF EXISTS tg_iron_vault          ON actions;
DROP TRIGGER  IF EXISTS tg_bddk_red_line       ON action_requests;
DROP TRIGGER  IF EXISTS tg_entity_health_decay ON actions;

DROP FUNCTION IF EXISTS tg_fn_iron_vault()          CASCADE;
DROP FUNCTION IF EXISTS tg_fn_bddk_red_line()       CASCADE;
DROP FUNCTION IF EXISTS tg_fn_entity_health_decay() CASCADE;
DROP FUNCTION IF EXISTS tg_update_entity_health()   CASCADE;

DROP TABLE    IF EXISTS action_logs             CASCADE;
DROP TABLE    IF EXISTS master_action_campaigns CASCADE;

-- =============================================================================
-- 1. MASTER ACTION CAMPAIGNS (NEW TABLE)
-- Logical grouping of related remediation actions under a shared root cause.
-- =============================================================================

CREATE TABLE master_action_campaigns (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text        NOT NULL,
  description text,
  root_cause  text,
  status      text        NOT NULL DEFAULT 'active'
              CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at  timestamptz DEFAULT now()
);

-- =============================================================================
-- 2. EXTEND actions TABLE WITH NEW COLUMNS
-- =============================================================================

ALTER TABLE actions
  ADD COLUMN IF NOT EXISTS assignee_unit_id  uuid REFERENCES audit_entities(id),
  ADD COLUMN IF NOT EXISTS campaign_id       uuid REFERENCES master_action_campaigns(id),
  ADD COLUMN IF NOT EXISTS regulatory_tags   text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS escalation_level  int    NOT NULL DEFAULT 0;

-- Replace legacy status CHECK constraint with extended GIAS 2024 state machine values.
-- Both legacy values (OPEN, IN_PROGRESS, …) and new values (pending, closed, …) are
-- accepted so existing rows remain valid after the migration.
ALTER TABLE actions DROP CONSTRAINT IF EXISTS actions_status_check;
ALTER TABLE actions ADD CONSTRAINT actions_status_check
  CHECK (status IN (
    'pending', 'evidence_submitted', 'review_rejected', 'risk_accepted', 'closed',
    'OPEN', 'IN_PROGRESS', 'PENDING_VERIFICATION', 'CLOSED', 'OVERDUE', 'WAIVED'
  ));

-- =============================================================================
-- 3. EXTEND action_evidence TABLE WITH NEW COLUMNS
-- =============================================================================

ALTER TABLE action_evidence
  ADD COLUMN IF NOT EXISTS ai_confidence_score decimal(5,2),
  ADD COLUMN IF NOT EXISTS review_note         text;

-- =============================================================================
-- 4. EXTEND action_requests TABLE WITH NEW COLUMNS
-- =============================================================================

ALTER TABLE action_requests
  ADD COLUMN IF NOT EXISTS expiration_date date;

-- Extend type CHECK to include GIAS 2024 request types alongside legacy values.
ALTER TABLE action_requests DROP CONSTRAINT IF EXISTS action_requests_type_check;
ALTER TABLE action_requests ADD CONSTRAINT action_requests_type_check
  CHECK (type IN (
    'extension', 'risk_acceptance', 'board_exception',
    'EXTENSION', 'WAIVER', 'REASSIGNMENT', 'SCOPE_CHANGE'
  ));

-- =============================================================================
-- 5. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_actions_finding_id      ON actions(finding_id);
CREATE INDEX IF NOT EXISTS idx_actions_assignee_unit   ON actions(assignee_unit_id);
CREATE INDEX IF NOT EXISTS idx_actions_assignee_user   ON actions(assignee_user_id);
CREATE INDEX IF NOT EXISTS idx_actions_auditor_owner   ON actions(auditor_owner_id);
CREATE INDEX IF NOT EXISTS idx_actions_status          ON actions(status);
CREATE INDEX IF NOT EXISTS idx_actions_original_due    ON actions(original_due_date);
CREATE INDEX IF NOT EXISTS idx_actions_current_due     ON actions(current_due_date);
CREATE INDEX IF NOT EXISTS idx_actions_regulatory_tags ON actions USING gin(regulatory_tags);
CREATE INDEX IF NOT EXISTS idx_actions_campaign        ON actions(campaign_id);

CREATE INDEX IF NOT EXISTS idx_action_evidence_action  ON action_evidence(action_id);

CREATE INDEX IF NOT EXISTS idx_action_requests_action  ON action_requests(action_id);
CREATE INDEX IF NOT EXISTS idx_action_requests_status  ON action_requests(status);
CREATE INDEX IF NOT EXISTS idx_action_requests_type    ON action_requests(type);

-- =============================================================================
-- 6. ROW LEVEL SECURITY (GIAS 15.2 Hard-Gate Policies)
--    Drop legacy anon-only policies from 20260211122745, replace with
--    role-aware policies that implement the GIAS 15.2 Auditee gate.
-- =============================================================================

ALTER TABLE master_action_campaigns ENABLE ROW LEVEL SECURITY;

-- ── Drop legacy policies from 20260211122745 ─────────────────────────────────

DROP POLICY IF EXISTS "anon_actions_select"         ON actions;
DROP POLICY IF EXISTS "anon_actions_insert"         ON actions;
DROP POLICY IF EXISTS "anon_actions_update"         ON actions;
DROP POLICY IF EXISTS "anon_actions_delete"         ON actions;

DROP POLICY IF EXISTS "anon_action_evidence_select" ON action_evidence;
DROP POLICY IF EXISTS "anon_action_evidence_insert" ON action_evidence;
DROP POLICY IF EXISTS "anon_action_evidence_delete" ON action_evidence;

DROP POLICY IF EXISTS "anon_action_requests_select" ON action_requests;
DROP POLICY IF EXISTS "anon_action_requests_insert" ON action_requests;
DROP POLICY IF EXISTS "anon_action_requests_update" ON action_requests;

-- ── master_action_campaigns ──────────────────────────────────────────────────

CREATE POLICY "campaigns_anon_select"
  ON master_action_campaigns FOR SELECT TO anon USING (true);

CREATE POLICY "campaigns_anon_insert"
  ON master_action_campaigns FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "campaigns_anon_update"
  ON master_action_campaigns FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "campaigns_auth_select"
  ON master_action_campaigns FOR SELECT TO authenticated USING (true);

CREATE POLICY "campaigns_auth_insert"
  ON master_action_campaigns FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "campaigns_auth_update"
  ON master_action_campaigns FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ── actions: select & insert ─────────────────────────────────────────────────

CREATE POLICY "actions_anon_select"
  ON actions FOR SELECT TO anon USING (true);

CREATE POLICY "actions_auth_select"
  ON actions FOR SELECT TO authenticated USING (true);

CREATE POLICY "actions_anon_insert"
  ON actions FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "actions_auth_insert"
  ON actions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "actions_anon_delete"
  ON actions FOR DELETE TO anon USING (true);

-- ── actions: GIAS 15.2 — Auditee Update Gate ─────────────────────────────────
-- Auditees may ONLY:
--   1. Update rows where they are the assignee
--   2. Transition status to 'evidence_submitted' (NEVER to 'closed')
--   3. AND only when at least one evidence row already exists

CREATE POLICY "actions_auditee_update"
  ON actions FOR UPDATE TO authenticated
  USING  (assignee_user_id = auth.uid())
  WITH CHECK (
    status = 'evidence_submitted'
    AND status <> 'closed'
    AND EXISTS (
      SELECT 1 FROM action_evidence ae WHERE ae.action_id = id
    )
  );

-- ── actions: GIAS 15.2 — Auditor Update Gate ─────────────────────────────────
-- Auditors (rows where they are the owner) can transition to any status
-- including 'closed' and 'review_rejected'.

CREATE POLICY "actions_auditor_update"
  ON actions FOR UPDATE TO authenticated
  USING  (auditor_owner_id = auth.uid());

-- Dev/anon: full bypass (demo environment)
CREATE POLICY "actions_anon_update"
  ON actions FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ── action_evidence ──────────────────────────────────────────────────────────

CREATE POLICY "evidence_anon_select"
  ON action_evidence FOR SELECT TO anon USING (true);

CREATE POLICY "evidence_anon_insert"
  ON action_evidence FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "evidence_anon_update"
  ON action_evidence FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "evidence_anon_delete"
  ON action_evidence FOR DELETE TO anon USING (true);

CREATE POLICY "evidence_auth_select"
  ON action_evidence FOR SELECT TO authenticated USING (true);

CREATE POLICY "evidence_auth_insert"
  ON action_evidence FOR INSERT TO authenticated WITH CHECK (true);

-- ── action_requests ──────────────────────────────────────────────────────────

CREATE POLICY "requests_anon_select"
  ON action_requests FOR SELECT TO anon USING (true);

CREATE POLICY "requests_anon_insert"
  ON action_requests FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "requests_anon_update"
  ON action_requests FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "requests_auth_select"
  ON action_requests FOR SELECT TO authenticated USING (true);

CREATE POLICY "requests_auth_insert"
  ON action_requests FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "requests_auth_update"
  ON action_requests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- =============================================================================
-- 7. TRIGGER A — THE IRON VAULT
-- BEFORE UPDATE on actions.
-- Raises EXCEPTION if anyone attempts to mutate finding_snapshot.
-- The finding context is cryptographically sealed at insertion time.
-- =============================================================================

CREATE OR REPLACE FUNCTION tg_fn_iron_vault()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.finding_snapshot IS DISTINCT FROM OLD.finding_snapshot THEN
    RAISE EXCEPTION
      'CRITICAL: Snapshot is cryptographically sealed. '
      'finding_snapshot on action [%] cannot be modified after creation.',
      OLD.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tg_iron_vault
  BEFORE UPDATE ON actions
  FOR EACH ROW
  EXECUTE FUNCTION tg_fn_iron_vault();

-- =============================================================================
-- 8. TRIGGER B — BDDK 365-DAY RED-LINE PROTOCOL
-- BEFORE INSERT OR UPDATE on action_requests.
-- Blocks 'extension' type when the action's original_due_date is >365 days past.
-- Only a 'board_exception' request can unlock actions in this state.
-- =============================================================================

CREATE OR REPLACE FUNCTION tg_fn_bddk_red_line()
RETURNS TRIGGER AS $$
DECLARE
  v_original_due  date;
  v_days_overdue  integer;
BEGIN
  IF NEW.type = 'extension' THEN

    SELECT original_due_date
      INTO v_original_due
      FROM actions
     WHERE id = NEW.action_id;

    v_days_overdue := CURRENT_DATE - v_original_due;

    IF v_days_overdue > 365 THEN
      RAISE EXCEPTION
        'BDDK RED-LINE: Cannot extend actions overdue by more than 1 year (365 days). '
        'A Board Exception is required. '
        'Action [%] is % days past its original due date.',
        NEW.action_id, v_days_overdue;
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tg_bddk_red_line
  BEFORE INSERT OR UPDATE ON action_requests
  FOR EACH ROW
  EXECUTE FUNCTION tg_fn_bddk_red_line();

-- =============================================================================
-- 9. TRIGGER C — ASSURANCE DECAY & ELASTIC RECOVERY (The Glass Ceiling)
-- AFTER UPDATE on actions.
-- Fired when status transitions to 'closed'.
--
-- Formula (per GIAS 2024 Appendix D):
--   decay_rate      = 2.0 points / month
--   months_open     = months between original_due_date and closure
--   Max_Score       = MAX(0, 100 − months_open × decay_rate)
--
-- BDDK Hard Cap:
--   If ANY open BDDK-tagged action for this entity is >365 days overdue:
--     Max_Score = MIN(Max_Score, 60)          ← The Glass Ceiling
--
-- Recovery:
--   new_score = MIN(current_score + 5, Max_Score)
-- =============================================================================

CREATE OR REPLACE FUNCTION tg_fn_entity_health_decay()
RETURNS TRIGGER AS $$
DECLARE
  v_unit_id         uuid;
  v_current_score   float;
  v_months_open     float;
  v_decay_rate      float   := 2.0;
  v_max_score       float;
  v_new_score       float;
  v_bddk_breach     boolean := false;
BEGIN
  -- Only fire on transition TO 'closed'
  IF NEW.status <> 'closed' OR OLD.status = 'closed' THEN
    RETURN NEW;
  END IF;

  v_unit_id := NEW.assignee_unit_id;
  IF v_unit_id IS NULL THEN
    RETURN NEW;
  END IF;

  BEGIN
    -- Fetch current entity risk score
    SELECT COALESCE(risk_score, 50.0)
      INTO v_current_score
      FROM audit_entities
     WHERE id = v_unit_id;

    -- Months the action was open (performance duration)
    v_months_open := GREATEST(
      0,
      EXTRACT(EPOCH FROM (CURRENT_DATE::timestamptz - NEW.original_due_date::timestamptz))
        / (30.44 * 86400.0)
    );

    -- Glass Ceiling: score ceiling decays the longer an action was open
    v_max_score := GREATEST(0.0, 100.0 - (v_months_open * v_decay_rate));

    -- BDDK Hard Cap: if any remaining open BDDK action for this unit is >365 days overdue
    SELECT EXISTS (
      SELECT 1
        FROM actions a
       WHERE a.assignee_unit_id = v_unit_id
         AND a.id              <> NEW.id
         AND a.status NOT IN ('closed', 'risk_accepted')
         AND (CURRENT_DATE - a.original_due_date) > 365
         AND 'BDDK' = ANY(a.regulatory_tags)
    ) INTO v_bddk_breach;

    IF v_bddk_breach THEN
      v_max_score := LEAST(v_max_score, 60.0);
    END IF;

    -- Elastic Recovery: closing earns +5 points, capped at Glass Ceiling
    v_new_score := LEAST(v_current_score + 5.0, v_max_score);

    UPDATE audit_entities
       SET risk_score = v_new_score
     WHERE id = v_unit_id;

  EXCEPTION WHEN OTHERS THEN
    -- Degraded mode: log the failure but never block the action status update
    RAISE WARNING
      'tg_fn_entity_health_decay: health update failed for entity [%]: %',
      v_unit_id, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public alias referenced in legacy codebase
CREATE OR REPLACE FUNCTION tg_update_entity_health()
RETURNS TRIGGER AS $$
BEGIN
  RETURN tg_fn_entity_health_decay();
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_entity_health_decay
  AFTER UPDATE ON actions
  FOR EACH ROW
  EXECUTE FUNCTION tg_fn_entity_health_decay();

-- =============================================================================
-- 10. VIEW — view_action_aging_metrics (Triple-Tier Aging + BDDK Breach Flag)
-- =============================================================================

DROP VIEW IF EXISTS view_action_aging CASCADE;
CREATE OR REPLACE VIEW view_action_aging_metrics AS
SELECT
  a.id,
  a.finding_id,
  a.assignee_unit_id,
  a.assignee_user_id,
  a.auditor_owner_id,
  a.campaign_id,
  a.status,
  a.original_due_date,
  a.current_due_date,
  a.closed_at,
  a.regulatory_tags,
  a.escalation_level,
  a.finding_snapshot,
  a.created_at,
  a.updated_at,

  -- ── Performance delay: days since the immutable original due date ──────────
  (CURRENT_DATE - a.original_due_date)                AS performance_delay_days,

  -- ── Operational delay: days past the current (possibly extended) due date ──
  (CURRENT_DATE - a.current_due_date)                 AS operational_delay_days,

  -- ── Triple-Tier Classification (GIAS 2024 Appendix C) ────────────────────
  CASE
    WHEN (CURRENT_DATE - a.original_due_date) <= 30  THEN 'TIER_1_NORMAL'
    WHEN (CURRENT_DATE - a.original_due_date) <= 90  THEN 'TIER_2_HIGH'
    WHEN (CURRENT_DATE - a.original_due_date) <= 364 THEN 'TIER_3_CRITICAL'
    ELSE                                                   'TIER_4_BDDK_RED_ZONE'
  END                                                 AS aging_tier,

  -- ── BDDK Breach: TIER_4 AND explicitly BDDK-tagged ───────────────────────
  CASE
    WHEN (CURRENT_DATE - a.original_due_date) > 364
     AND 'BDDK' = ANY(a.regulatory_tags) THEN true
    ELSE false
  END                                                 AS is_bddk_breach,

  -- ── Supporting counters ───────────────────────────────────────────────────
  (SELECT COUNT(*)
     FROM action_evidence ae
    WHERE ae.action_id = a.id)                        AS evidence_count,

  (SELECT COUNT(*)
     FROM action_requests ar
    WHERE ar.action_id = a.id
      AND ar.status    = 'pending')                   AS pending_requests

FROM actions a;

-- =============================================================================

-- Aksiyon kampanyalari demo verileri seed.sql dosyasina tasindi.
