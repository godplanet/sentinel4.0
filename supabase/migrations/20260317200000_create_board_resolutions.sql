/*
  # Wave 42: Board Resolution & E-Voting Deck
  
  ## Yeni Tablolar
  1. `board_resolutions`  — YK karar gündem maddeleri
  2. `committee_votes`     — Her üyenin bireysel oyu
  
  ## Kural
  - Yalnızca yapısal DDL. Veri → seed.sql
*/

-- ============================================================
-- 1. board_resolutions — Karar Gündemleri
-- ============================================================
CREATE TABLE IF NOT EXISTS public.board_resolutions (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid        NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid,
  title               text        NOT NULL DEFAULT '',
  description         text        NOT NULL DEFAULT '',
  resolution_type     text        NOT NULL DEFAULT 'APPROVAL'
                      CHECK (resolution_type IN ('APPROVAL','INFORMATION','INSTRUCTION','ACKNOWLEDGEMENT')),
  status              text        NOT NULL DEFAULT 'OPEN'
                      CHECK (status IN ('OPEN','CLOSED','DEFERRED','WITHDRAWN')),
  quorum_required     integer     NOT NULL DEFAULT 5,
  meeting_date        timestamptz,
  regulatory_ref      text,
  proposed_by         text        NOT NULL DEFAULT '',
  created_by          uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_board_resolutions_tenant ON public.board_resolutions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_board_resolutions_status ON public.board_resolutions(status);
CREATE INDEX IF NOT EXISTS idx_board_resolutions_meeting ON public.board_resolutions(meeting_date DESC);

ALTER TABLE public.board_resolutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "board_resolutions: auth read"
  ON public.board_resolutions FOR SELECT TO authenticated USING (true);
CREATE POLICY "board_resolutions: auth write"
  ON public.board_resolutions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "board_resolutions: anon read"
  ON public.board_resolutions FOR SELECT TO anon USING (true);
CREATE POLICY "board_resolutions: anon insert"
  ON public.board_resolutions FOR INSERT TO anon WITH CHECK (true);

-- ============================================================
-- 2. committee_votes — Bireysel Oylar
-- ============================================================
CREATE TABLE IF NOT EXISTS public.committee_votes (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid        NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid,
  resolution_id   uuid        NOT NULL REFERENCES public.board_resolutions(id) ON DELETE CASCADE,
  member_name     text        NOT NULL DEFAULT '',
  member_title    text        NOT NULL DEFAULT '',
  vote            text        NOT NULL DEFAULT 'ABSTAIN'
                  CHECK (vote IN ('FOR','AGAINST','ABSTAIN')),
  rationale       text,
  voted_at        timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_committee_votes_resolution ON public.committee_votes(resolution_id);
CREATE INDEX IF NOT EXISTS idx_committee_votes_tenant     ON public.committee_votes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_committee_votes_vote       ON public.committee_votes(vote);

-- UNIQUE: Her üye bir kararı yalnızca bir kez oylayabilir
CREATE UNIQUE INDEX IF NOT EXISTS idx_committee_votes_unique_member
  ON public.committee_votes(resolution_id, member_name);

ALTER TABLE public.committee_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "committee_votes: auth read"
  ON public.committee_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "committee_votes: auth write"
  ON public.committee_votes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "committee_votes: anon read"
  ON public.committee_votes FOR SELECT TO anon USING (true);
CREATE POLICY "committee_votes: anon insert"
  ON public.committee_votes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "committee_votes: anon update"
  ON public.committee_votes FOR UPDATE TO anon USING (true) WITH CHECK (true);
