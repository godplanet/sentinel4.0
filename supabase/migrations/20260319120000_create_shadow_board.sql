-- =============================================================================
-- Wave 83: Shadow Board & AI Strategy Simulator — DDL Only
-- Gölge Yönetim Kurulu ve Strateji Simülatörü
-- =============================================================================

-- Simüle Edilmiş Stratejiler (Simulated Strategies)
CREATE TABLE IF NOT EXISTS simulated_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'
    REFERENCES tenants(id) ON DELETE CASCADE,
  strategy_name text NOT NULL,                 -- Örn: Tarım Kredilerinde Büyüme
  description text NOT NULL,                   -- Stratejinin detayı
  simulation_date date NOT NULL DEFAULT CURRENT_DATE,
  capital_allocation numeric(15,2) DEFAULT 0,  -- Strateji için ayrılan sermaye (Milyon TL)
  status text NOT NULL DEFAULT 'Simulating'
    CHECK (status IN ('Draft', 'Simulating', 'Completed', 'Rejected', 'Approved')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sim_strat_tenant ON simulated_strategies(tenant_id);

ALTER TABLE simulated_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read strategies"   ON simulated_strategies FOR SELECT TO anon   USING (true);
CREATE POLICY "Anon insert strategies" ON simulated_strategies FOR INSERT TO anon   WITH CHECK (true);
CREATE POLICY "Anon update strategies" ON simulated_strategies FOR UPDATE TO anon   USING (true) WITH CHECK (true);
CREATE POLICY "Auth read strategies"   ON simulated_strategies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert strategies" ON simulated_strategies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update strategies" ON simulated_strategies FOR UPDATE TO authenticated USING (true);


-- Strateji Risk Skorları (Strategy Risk Scores)
CREATE TABLE IF NOT EXISTS strategy_risk_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'
    REFERENCES tenants(id) ON DELETE CASCADE,
  strategy_id uuid NOT NULL
    REFERENCES simulated_strategies(id) ON DELETE CASCADE,
  risk_category text NOT NULL,                 -- Örn: NPL Riski, Likidite, Sermaye
  projected_impact numeric(5,2) DEFAULT 0,     -- Etki yüzdesi (Örn: +12.0)
  impact_direction text NOT NULL DEFAULT 'Negative'
    CHECK (impact_direction IN ('Positive', 'Neutral', 'Negative')),
  confidence_score numeric(5,2) DEFAULT 0,     -- AI Tahmin Güveni (0-100)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_strat_scores_tenant ON strategy_risk_scores(tenant_id);
CREATE INDEX IF NOT EXISTS idx_strat_scores_strat  ON strategy_risk_scores(strategy_id);

ALTER TABLE strategy_risk_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read scores"   ON strategy_risk_scores FOR SELECT TO anon   USING (true);
CREATE POLICY "Anon insert scores" ON strategy_risk_scores FOR INSERT TO anon   WITH CHECK (true);
CREATE POLICY "Anon update scores" ON strategy_risk_scores FOR UPDATE TO anon   USING (true) WITH CHECK (true);
CREATE POLICY "Auth read scores"   ON strategy_risk_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert scores" ON strategy_risk_scores FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update scores" ON strategy_risk_scores FOR UPDATE TO authenticated USING (true);


-- AI/Board Avatar Yanıtları (AI Board Responses)
CREATE TABLE IF NOT EXISTS ai_board_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'
    REFERENCES tenants(id) ON DELETE CASCADE,
  strategy_id uuid NOT NULL
    REFERENCES simulated_strategies(id) ON DELETE CASCADE,
  avatar_role text NOT NULL,                   -- Örn: Gölge Risk Komitesi Başkanı, Gölge CFO
  avatar_name text NOT NULL,                   -- Avatarın ismi/kimliği (Örn: 'Sentinel RiskEngine')
  response text,                               -- Dönen metin yanıt
  sentiment text NOT NULL DEFAULT 'Neutral'
    CHECK (sentiment IN ('Positive', 'Neutral', 'Cautious', 'Negative')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_board_tenant ON ai_board_responses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_board_strat  ON ai_board_responses(strategy_id);

ALTER TABLE ai_board_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read responses"   ON ai_board_responses FOR SELECT TO anon   USING (true);
CREATE POLICY "Anon insert responses" ON ai_board_responses FOR INSERT TO anon   WITH CHECK (true);
CREATE POLICY "Anon update responses" ON ai_board_responses FOR UPDATE TO anon   USING (true) WITH CHECK (true);
CREATE POLICY "Auth read responses"   ON ai_board_responses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert responses" ON ai_board_responses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update responses" ON ai_board_responses FOR UPDATE TO authenticated USING (true);
