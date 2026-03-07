/*
  # Wave 80: Insider Trading & Executive PAD Radar

  1. `personal_account_dealings` (PAD) - Personel kişisel hisse senedi işlem beyanları/logları.
  2. `restricted_trading_lists` - Kısıtlı hisse listeleri (Örn: Bankanın kredi/M&A ilişkisinde olduğu firmalar).
  3. `insider_alerts` - Sistem tarafından otomatik üretilen zıtlaşma/içeriden öğrenen ticareti uyarıları.
*/

-- ============================================================
-- 1. personal_account_dealings (PAD)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.personal_account_dealings (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid        NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid,
  employee_id         text        NOT NULL,
  employee_name       text        NOT NULL,
  department          text        NOT NULL,
  ticker              text        NOT NULL, -- Hisse kodu (Örn: THYAO, AAPL)
  company_name        text        NOT NULL,
  transaction_type    text        NOT NULL CHECK (transaction_type IN ('BUY', 'SELL')),
  quantity            integer     NOT NULL,
  price               numeric     NOT NULL,
  total_value         numeric     NOT NULL,
  trade_date          timestamptz NOT NULL,
  declaration_date    timestamptz NOT NULL DEFAULT now(),
  status              text        NOT NULL DEFAULT 'PENDING'
                      CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED')),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pad_tenant ON public.personal_account_dealings(tenant_id);
ALTER TABLE public.personal_account_dealings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pad: auth read"  ON public.personal_account_dealings FOR SELECT TO authenticated USING (true);
CREATE POLICY "pad: auth write" ON public.personal_account_dealings FOR ALL    TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "pad: anon read"  ON public.personal_account_dealings FOR SELECT TO anon          USING (true);
CREATE POLICY "pad: anon write" ON public.personal_account_dealings FOR ALL    TO anon          USING (true) WITH CHECK (true);

-- ============================================================
-- 2. restricted_trading_lists
-- ============================================================
CREATE TABLE IF NOT EXISTS public.restricted_trading_lists (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid        NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid,
  ticker              text        NOT NULL,
  company_name        text        NOT NULL,
  restriction_reason  text        NOT NULL, -- Örn: "M&A Süreci", "Kredi Red Kararı"
  added_by            text        NOT NULL,
  start_date          timestamptz NOT NULL DEFAULT now(),
  end_date            timestamptz,
  is_active           boolean     NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_restricted_tenant_ticker ON public.restricted_trading_lists(tenant_id, ticker) WHERE is_active = true;
ALTER TABLE public.restricted_trading_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "restricted_list: auth read"  ON public.restricted_trading_lists FOR SELECT TO authenticated USING (true);
CREATE POLICY "restricted_list: auth write" ON public.restricted_trading_lists FOR ALL    TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "restricted_list: anon read"  ON public.restricted_trading_lists FOR SELECT TO anon          USING (true);
CREATE POLICY "restricted_list: anon write" ON public.restricted_trading_lists FOR ALL    TO anon          USING (true) WITH CHECK (true);

-- ============================================================
-- 3. insider_alerts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.insider_alerts (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid        NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid,
  pad_id              uuid        NOT NULL REFERENCES public.personal_account_dealings(id) ON DELETE CASCADE,
  employee_name       text        NOT NULL,
  ticker              text        NOT NULL,
  alert_type          text        NOT NULL DEFAULT 'RESTRICTED_LIST_MATCH'
                      CHECK (alert_type IN ('RESTRICTED_LIST_MATCH', 'BLACKOUT_PERIOD_VIOLATION', 'UNUSUAL_VOLUME', 'EXECUTIVE_CONFLICT')),
  severity            text        NOT NULL DEFAULT 'HIGH'
                      CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  description         text        NOT NULL,
  status              text        NOT NULL DEFAULT 'OPEN'
                      CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE')),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_insider_alerts_tenant ON public.insider_alerts(tenant_id);
ALTER TABLE public.insider_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insider_alerts: auth read"  ON public.insider_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "insider_alerts: auth write" ON public.insider_alerts FOR ALL    TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "insider_alerts: anon read"  ON public.insider_alerts FOR SELECT TO anon          USING (true);
CREATE POLICY "insider_alerts: anon write" ON public.insider_alerts FOR ALL    TO anon          USING (true) WITH CHECK (true);
