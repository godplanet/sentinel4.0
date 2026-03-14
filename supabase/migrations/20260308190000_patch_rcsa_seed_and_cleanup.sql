-- =============================================================================
-- SENTINEL V3.0 — PATCH 2: RCSA Questions Seed + Final Cleanup
-- =============================================================================
-- rcsa_questions schema: (id, tenant_id, campaign_id, text, type, options, weight)
-- Use correct column names from 20260303195000_rcsa_survey_builder.sql
-- =============================================================================

-- 1. SEED rcsa_questions using correct column names
-- First get a valid campaign_id
DO $$
DECLARE
  v_campaign_id uuid;
BEGIN
  SELECT id INTO v_campaign_id FROM public.rcsa_campaigns LIMIT 1;
  
  IF v_campaign_id IS NULL THEN
    RAISE NOTICE 'No rcsa_campaigns found — skipping rcsa_questions seed';
    RETURN;
  END IF;

  INSERT INTO public.rcsa_questions (tenant_id, campaign_id, text, type, options, weight)
  VALUES
    ('11111111-1111-1111-1111-111111111111', v_campaign_id, 'Erişim kontrol prosedürleriniz belgelenmiş mi?', 'BOOLEAN', '["Evet","Hayır"]', 1.5),
    ('11111111-1111-1111-1111-111111111111', v_campaign_id, 'Kullanıcı erişim hakları ne sıklıkta gözden geçirilmektedir?', 'MULTIPLE_CHOICE', '["6 ayda bir","Yıllık","Hiç gözden geçirilmiyor"]', 1.0),
    ('11111111-1111-1111-1111-111111111111', v_campaign_id, 'İş sürekliliği planınız (BCP) mevcut mu?', 'BOOLEAN', '["Evet","Hayır"]', 2.0),
    ('11111111-1111-1111-1111-111111111111', v_campaign_id, 'Son 12 ayda iç denetim bulgusuna maruz kaldınız mı?', 'BOOLEAN', '["Evet","Hayır"]', 1.8),
    ('11111111-1111-1111-1111-111111111111', v_campaign_id, 'KVKK kapsamında veri envanteri oluşturuldu mu?', 'BOOLEAN', '["Evet","Kısmen","Hayır"]', 1.5),
    ('11111111-1111-1111-1111-111111111111', v_campaign_id, 'Anti-money laundering (AML) eğitimi aldınız mı?', 'BOOLEAN', '["Evet","Hayır"]', 1.2)
  ON CONFLICT DO NOTHING;
  RAISE NOTICE 'Seeded % rcsa_questions for campaign %', 6, v_campaign_id;
END $$;

-- 2. Add RLS policy for rcsa_questions anon read (currently authenticated-only)
DROP POLICY IF EXISTS "rcsa_questions_select_anon" ON public.rcsa_questions;
CREATE POLICY "rcsa_questions_select_anon" ON public.rcsa_questions
  FOR SELECT USING (true);

-- 3. Timesheets: skip seed (column mismatch - activity_type/logged_date columns not in schema)
-- INSERT skipped intentionally


-- 4. Verify fix result
SELECT 
  'stakeholders' AS table_name, COUNT(*) AS rows FROM public.stakeholders
UNION ALL
SELECT 'rcsa_questions', COUNT(*) FROM public.rcsa_questions
UNION ALL
SELECT 'tasks', COUNT(*) FROM public.tasks
UNION ALL
SELECT 'risk_taxonomy', COUNT(*) FROM public.risk_taxonomy
UNION ALL
SELECT 'governance_board_meetings', COUNT(*) FROM public.governance_board_meetings
ORDER BY table_name;
