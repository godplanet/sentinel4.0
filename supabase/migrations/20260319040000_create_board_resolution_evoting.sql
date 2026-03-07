-- =============================================================================
-- Wave 42: Board Resolution & E-Voting Deck — DDL Only (No Seed)
-- API schema: FOR/AGAINST/ABSTAIN votes, OPEN/CLOSED/DEFERRED/WITHDRAWN status
-- =============================================================================

-- Yönetim Kurulu kararları
CREATE TABLE IF NOT EXISTS board_resolutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'
    REFERENCES tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  resolution_type text NOT NULL DEFAULT 'APPROVAL'
    CHECK (resolution_type IN ('APPROVAL', 'INFORMATION', 'INSTRUCTION', 'ACKNOWLEDGEMENT')),
  status text NOT NULL DEFAULT 'OPEN'
    CHECK (status IN ('OPEN', 'CLOSED', 'DEFERRED', 'WITHDRAWN')),
  quorum_required integer NOT NULL DEFAULT 5,
  meeting_date timestamptz,
  regulatory_ref text DEFAULT '',
  proposed_by text NOT NULL DEFAULT '',
  urgency text NOT NULL DEFAULT 'Normal'
    CHECK (urgency IN ('Kritik', 'Yüksek', 'Normal', 'Düşük')),
  category text DEFAULT 'Genel',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_board_resolutions_tenant   ON board_resolutions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_board_resolutions_status   ON board_resolutions(status);
CREATE INDEX IF NOT EXISTS idx_board_resolutions_meeting  ON board_resolutions(meeting_date DESC);

ALTER TABLE board_resolutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read board_resolutions"
  ON board_resolutions FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert board_resolutions"
  ON board_resolutions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update board_resolutions"
  ON board_resolutions FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Auth read board_resolutions"
  ON board_resolutions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert board_resolutions"
  ON board_resolutions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update board_resolutions"
  ON board_resolutions FOR UPDATE TO authenticated USING (true);

-- Komite üye oyları
CREATE TABLE IF NOT EXISTS committee_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'
    REFERENCES tenants(id) ON DELETE CASCADE,
  resolution_id uuid NOT NULL
    REFERENCES board_resolutions(id) ON DELETE CASCADE,
  member_name text NOT NULL,
  member_title text DEFAULT '',
  vote text NOT NULL
    CHECK (vote IN ('FOR', 'AGAINST', 'ABSTAIN')),
  rationale text DEFAULT NULL,
  voted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_committee_votes_resolution ON committee_votes(resolution_id);
CREATE INDEX IF NOT EXISTS idx_committee_votes_tenant     ON committee_votes(tenant_id);
-- Aynı kişi aynı karara bir kez oy kullanabilir (upsert uyumlu)
CREATE UNIQUE INDEX IF NOT EXISTS idx_committee_votes_unique
  ON committee_votes(resolution_id, member_name);

ALTER TABLE committee_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read committee_votes"
  ON committee_votes FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert committee_votes"
  ON committee_votes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon upsert committee_votes"
  ON committee_votes FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Auth read committee_votes"
  ON committee_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert committee_votes"
  ON committee_votes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth upsert committee_votes"
  ON committee_votes FOR UPDATE TO authenticated USING (true);
