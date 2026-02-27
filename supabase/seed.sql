-- =============================================================================
-- SENTINEL GRC v3.0 — MERKEZI SEED DOSYASI
-- =============================================================================
-- Bu dosya tum demo/test verilerini icermektedir.
-- Migration dosyalarinda yalnizca DDL (tablo, fonksiyon, RLS) kalmalidir.
-- Kaynak migration dosyalari yorum satirlarinda belirtilmistir.
--
-- Kural: system_definitions, system_parameters, risk_definitions_bddk
-- gercek sistem sozlukleri oldugu icin migration'da birakildi.
-- =============================================================================

-- =============================================================================
-- 1. RISK CONFIGURATION
-- Kaynak: 20260211212425_fix_risk_configuration_final.sql
--         20260211235900_add_risk_config_anon_insert_policy.sql
-- =============================================================================
INSERT INTO risk_configuration (
  weight_financial, weight_reputation, weight_operational, weight_legal,
  velocity_multiplier_high, velocity_multiplier_medium,
  threshold_critical, threshold_high, threshold_medium,
  is_active
)
SELECT 0.35, 0.25, 0.20, 0.20, 1.5, 1.2, 20, 16, 10, true
WHERE NOT EXISTS (SELECT 1 FROM risk_configuration WHERE is_active = true);

-- =============================================================================
-- 2. AUDIT STEPS (KYC, AML, Kredi Riski, Operasyonel Risk, ITGC Prosedurleri)
-- Kaynak: 20260202161235_add_audit_execution_helpers_v2.sql
-- =============================================================================
-- SAMPLE AUDIT STEPS DATA
-- =============================================

-- KYC (Know Your Customer) Procedures
INSERT INTO public.audit_steps (step_code, title, description, risk_weight, required_evidence_types) VALUES
('KYC-001', 'Customer Identification Verification', 'Verify customer identity documents are collected and validated according to regulatory requirements', 1.5, ARRAY['customer_documents', 'id_verification_logs']),
('KYC-002', 'Beneficial Ownership Analysis', 'Verify beneficial ownership information is documented for all corporate customers', 1.3, ARRAY['ownership_charts', 'board_resolutions']),
('KYC-003', 'PEP Screening', 'Test that Politically Exposed Persons (PEP) screening is performed and documented', 1.4, ARRAY['screening_reports', 'approval_documents']),
('KYC-004', 'Customer Risk Rating', 'Verify customer risk ratings are assigned based on documented criteria', 1.2, ARRAY['risk_assessment_forms', 'approval_matrix'])
ON CONFLICT DO NOTHING;

-- AML (Anti-Money Laundering) Procedures
INSERT INTO public.audit_steps (step_code, title, description, risk_weight, required_evidence_types) VALUES
('AML-001', 'Transaction Monitoring System', 'Test effectiveness of automated transaction monitoring alerts', 1.8, ARRAY['alert_logs', 'system_config', 'investigation_reports']),
('AML-002', 'Suspicious Activity Reporting', 'Verify STR/SAR filing process and timeliness', 1.9, ARRAY['filing_records', 'regulatory_receipts']),
('AML-003', 'Sanctions Screening', 'Test sanctions list screening at onboarding and ongoing', 1.7, ARRAY['screening_logs', 'match_resolution_docs']),
('AML-004', 'AML Training Program', 'Verify all relevant staff completed AML training', 1.0, ARRAY['training_records', 'certificates', 'attendance_logs'])
ON CONFLICT DO NOTHING;

-- Credit Risk Procedures
INSERT INTO public.audit_steps (step_code, title, description, risk_weight, required_evidence_types) VALUES
('CR-001', 'Credit Approval Process', 'Test credit approval limits and authorization matrix', 1.6, ARRAY['approval_documents', 'authorization_matrix']),
('CR-002', 'Collateral Valuation', 'Verify collateral is independently valued and revalued periodically', 1.5, ARRAY['valuation_reports', 'appraiser_credentials']),
('CR-003', 'Loan Loss Provisioning', 'Test adequacy and calculation of loan loss provisions', 1.8, ARRAY['provision_calculations', 'impairment_analysis']),
('CR-004', 'Credit Monitoring', 'Verify ongoing monitoring of credit exposures and early warning indicators', 1.3, ARRAY['monitoring_reports', 'watchlist_documentation'])
ON CONFLICT DO NOTHING;

-- Operational Risk Procedures
INSERT INTO public.audit_steps (step_code, title, description, risk_weight, required_evidence_types) VALUES
('OR-001', 'Business Continuity Planning', 'Test BCP/DR plans are documented, tested, and updated', 1.4, ARRAY['bcp_documents', 'test_results', 'update_logs']),
('OR-002', 'Incident Management', 'Verify operational incidents are logged, investigated, and resolved', 1.2, ARRAY['incident_logs', 'investigation_reports', 'resolution_evidence']),
('OR-003', 'Third-Party Risk Management', 'Test vendor due diligence and ongoing monitoring', 1.5, ARRAY['vendor_assessments', 'contracts', 'monitoring_reports']),
('OR-004', 'Data Security Controls', 'Verify data encryption, access controls, and security monitoring', 1.7, ARRAY['security_logs', 'access_reviews', 'encryption_evidence'])
ON CONFLICT DO NOTHING;

-- IT General Controls (ITGC)
INSERT INTO public.audit_steps (step_code, title, description, risk_weight, required_evidence_types) VALUES
('IT-001', 'Change Management Process', 'Test IT change management approvals and testing procedures', 1.6, ARRAY['change_tickets', 'approval_evidence', 'test_results']),
('IT-002', 'User Access Management', 'Verify user access provisioning, modification, and termination', 1.5, ARRAY['access_logs', 'approval_forms', 'access_reviews']),
('IT-003', 'Backup and Recovery', 'Test data backup procedures and restoration capabilities', 1.4, ARRAY['backup_logs', 'restoration_tests', 'recovery_procedures']),
('IT-004', 'System Monitoring and Logging', 'Verify system monitoring, logging, and log review procedures', 1.3, ARRAY['monitoring_dashboards', 'log_review_evidence'])
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 3. RKM KONTROL KUTUPHANESI (Kategoriler ve Riskler)
-- Kaynak: 20260206202806_create_rkm_control_library.sql
-- =============================================================================
-- Seed: Categories
INSERT INTO rkm_library_categories (id, name, description, icon, sort_order) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'IT Genel Kontroller (COBIT)', 'Bilgi teknolojileri genel kontrolleri - Erisim yonetimi, degisiklik yonetimi, yedekleme', 'Monitor', 1),
  ('a0000001-0000-0000-0000-000000000002', 'Kredi Surecleri', 'Bireysel ve kurumsal kredi tahsis, kullandirma ve izleme kontrolleri', 'CreditCard', 2),
  ('a0000001-0000-0000-0000-000000000003', 'AML / CFT (Kara Para ile Mucadele)', 'MASAK uyumluluğu, musteri tanimi (KYC), supeli islem bildirimi', 'ShieldAlert', 3),
  ('a0000001-0000-0000-0000-000000000004', 'Hazine Islemleri', 'Doviz, menkul kiymet, turev urun islemleri kontrolleri', 'TrendingUp', 4),
  ('a0000001-0000-0000-0000-000000000005', 'Operasyonel Risk', 'Is surekliligi, felaket kurtarma, olay yonetimi kontrolleri', 'AlertTriangle', 5),
  ('a0000001-0000-0000-0000-000000000006', 'Mali Kontroller', 'Muhasebe, finansal raporlama ve ic kontrol kontrolleri', 'Calculator', 6)
ON CONFLICT (name) DO NOTHING;

-- Seed: COBIT IT Controls
INSERT INTO rkm_library_risks (category_id, risk_title, control_title, standard_test_steps, risk_level, framework_ref, sort_order) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Yetkisiz sistem erisimi', 'Sifre Politikasi Kontrolu',
   '["Aktif Dizin (AD) sifre politikasini inceleyin: min 12 karakter, buyuk/kucuk/rakam/ozel karakter zorunlulugu","Son 90 gun icerisinde sifre degistirmeyen kullanici listesini cikartin","Varsayilan admin hesaplarinin (Administrator, sa, root) kilitli olduğunu dogrulayin","Basarisiz giris denemesi kilitleme esigini test edin (5 deneme sonrasi kilit)","Servis hesaplarinin sifre rotasyon tarihlerini kontrol edin"]',
   'HIGH', 'COBIT DSS05.04', 1),

  ('a0000001-0000-0000-0000-000000000001', 'Onaysiz sistem degisiklikleri', 'Degisiklik Yonetimi (Change Management)',
   '["Son 6 aydaki tum degisiklik taleplerini (RFC) listeleyin","Her RFC icin onay zincirini dogrulayin: Talep -> Test -> Onay -> Uygulama","Acil degisikliklerin (Emergency Change) toplam icindeki oranini hesaplayin (<%5 beklenir)","Test ortaminda basarili test kaniti olmaadan production''a alinan degisiklikleri tespit edin","Rollback planlarinin dokumante edildigini kontrol edin"]',
   'HIGH', 'COBIT BAI06', 2),

  ('a0000001-0000-0000-0000-000000000001', 'Veri kaybi', 'Yedekleme ve Felaket Kurtarma',
   '["Yedekleme politikasini inceleyin: gunluk/haftalik/aylik yedekleme takvimi","Son 3 aydaki yedekleme basari/basarisizlik loglarini analiz edin","En az 1 yedekleme geri yukleme (restore) testi sonucunu dogrulayin","Yedeklerin offsite/bulut kopyasinin var olduğunu kontrol edin","RTO ve RPO hedeflerinin dokumanlarla desteklendigini dogrulayin"]',
   'HIGH', 'COBIT DSS04', 3),

  ('a0000001-0000-0000-0000-000000000001', 'Hassas verilere yetkisiz erisim', 'Veritabani Erisim Kontrolu',
   '["Veritabani admin (DBA) yetkisine sahip kullanici listesini cikartin","DBA yetkilerinin is gerekliligi ile eslesmesini dogrulayin","Veritabani denetim loglarinin (audit trail) aktif olduğunu kontrol edin","Prod veritabanina dogrudan erisim yapan kullanicilari tespit edin","Hassas tablolarda (musteri bilgileri, hesap bakiyeleri) sutun seviyesinde yetkilendirme kontrol edin"]',
   'MEDIUM', 'COBIT DSS05.03', 4),

-- Seed: Credit Processes
  ('a0000001-0000-0000-0000-000000000002', 'Yanlis kredi degerlendirme', 'Kredi Tahsis Sureci Kontrolu',
   '["Kredi komitesi onay tutanaklarini inceleyin: yetki limitleri asimini kontrol edin","Orneklem bazinda kredi dosyalarini secerek gelir belgesi dogrulamasini yapin","Kredi notlama (scoring) modelinin dogru uygulandigini 10 dosya uzerinde test edin","Teminat degerleme raporlarinin guncel ve bagimsiz oldugunu dogrulayin","Iliski kisisi kredilerinin ayri raporlandigini kontrol edin"]',
   'HIGH', 'BDDK Yonetmeligi', 1),

  ('a0000001-0000-0000-0000-000000000002', 'Donuk alacak artisi', 'Kredi Izleme ve Erken Uyari',
   '["Erken uyari sistemi (EWS) alarmlarinin zamaninda tetiklendigini kontrol edin","30/60/90 gun gecikme raporlarinin duzenliligi ve dogruluğunu dogrulayin","Yapilandirilan kredilerin izleme dosyalarini inceleyin","Kredi limiti kullanimlarinin yoğunlasma analizini yapin","Sektorel ve cografi yoğunlasma raporlarini kontrol edin"]',
   'HIGH', 'BDDK Kararlari', 2),

  ('a0000001-0000-0000-0000-000000000002', 'Teminat riski', 'Teminat Yonetimi Kontrolu',
   '["Teminat yeterliligi raporunu alin ve teminat/alacak oranini hesaplayin","Gayrimenkul teminatlarinin sigorta poliçesi gecerliliklerini kontrol edin","Teminat degerleme frekansinin mevzuata uygunluğunu dogrulayin","Rehinli menkul kiymet portfoyunun guncel degerini kontrol edin","Teminat serbest birakma islemlerinin onay surecini inceleyin"]',
   'MEDIUM', 'BDDK Teminat Tebliği', 3),

-- Seed: AML/CFT
  ('a0000001-0000-0000-0000-000000000003', 'Kara para aklama riski', 'Musteri Tanimi (KYC) Kontrolu',
   '["Yeni musteri acilis dosyalarindan orneklem secin ve kimlik dogrulamasi yapin","PEP (Siyasi Etkin Kisi) tarama kayitlarini kontrol edin","Gerçek faydalaniciinin (UBO) tespitinin yapildigini dogrulayin","Risk siniflandirmasinin (dusuk/orta/yuksek) kriterlerini inceleyin","Musteri bilgi guncelleme frekansinin mevzuata uygunluğunu kontrol edin"]',
   'HIGH', 'MASAK 5549 Sayili Kanun', 1),

  ('a0000001-0000-0000-0000-000000000003', 'Supheli islem bildirimi eksikligi', 'STR (Supeli Islem Raporlama) Kontrolu',
   '["Son 12 aydaki STR sayisini ve trendini analiz edin","STR bildirim surelerinin mevzuata uygunluğunu kontrol edin (10 is gunu)","Otomatik alarm uretilen ama STR yapilmayan vakaalari inceleyin","STR kalite kontrolu: orneklem bazinda dosya detaylarini dogrulayin","MASAK geri bildirimlerine verilen yanit surelerini kontrol edin"]',
   'HIGH', 'MASAK Genel Tebligi', 2),

  ('a0000001-0000-0000-0000-000000000003', 'Yapay parcalama (Smurfing)', 'Islem Izleme Sistemi Kontrolu',
   '["Esik alti (threshold) islem alarm kurallarini inceleyin","Ayni gun icinde ayni musteriden coklu kucuk islem (smurfing) taramasi yapin","Nakit islem raporlarinin (CTR) tam ve zamaninda olusturulduğunu dogrulayin","Kara liste/yaptirim taramalarinin gercek zamanli calistigini test edin","Falso pozitif oranini hesaplayin ve kabul edilebilir seviyelerde olduğunu dogrulayin"]',
   'HIGH', 'MASAK / FATF Tavsiyeleri', 3),

-- Seed: Treasury
  ('a0000001-0000-0000-0000-000000000004', 'Yetkisiz islem riski', 'Hazine Islem Yetkilendirme',
   '["Dealer yetki limitlerini ve islem onay hiyerarsisini inceleyin","Limit asimi raporlarini son 3 ay icin kontrol edin","Front-office / back-office gorev ayrimi uygulamasini dogrulayin","Islem dogrulama (deal confirmation) surecinin zamaninda yapildigini kontrol edin","Overnight pozisyon limitlerinin ihlal raporlarini inceleyin"]',
   'HIGH', 'BDDK Hazine Tebliği', 1),

  ('a0000001-0000-0000-0000-000000000004', 'Piyasa riski', 'Piyasa Riski Olcum Kontrolu',
   '["VaR (Value at Risk) hesaplama modelinin dogrulanma tarihini kontrol edin","Backtesting sonuclarini inceleyin: istisnai asilma sayisi","Stres testi senaryolarinin guncelligini ve yeterliligi dogrulayin","Pozisyon limiti kullanim raporlarinin gunluk uretildigini kontrol edin","Risk yonetimi komitesine yapilan raporlamalarin duzenliligini dogrulayin"]',
   'HIGH', 'BDDK Piyasa Riski Tebliği', 2),

-- Seed: Operational Risk
  ('a0000001-0000-0000-0000-000000000005', 'Is surekliligi riski', 'Is Surekliligi Plani (BCP) Kontrolu',
   '["Is surekliligi planinin yillik guncelleme tarihini kontrol edin","Son tatbikat (drill) raporlarini inceleyin: katilim orani ve basari kriterleri","Kritik is sureclerinin MIA (Maksimum Izin Verilen Kesinti Suresi) tanimlarini dogrulayin","Alternatif calisma mekaninin hazirlik durumunu kontrol edin","Iletisim agacinin (call tree) guncelligini ve test edilmis olduğunu dogrulayin"]',
   'HIGH', 'BDDK BCP Rehberi', 1),

  ('a0000001-0000-0000-0000-000000000005', 'Operasyonel kayip riski', 'Olay Yonetimi Kontrolu',
   '["Son 12 aydaki operasyonel kayip olaylarini listeleyin","Her olay icin kok neden analizinin yapildigini dogrulayin","Tekrarlayan olay tiplerine karsi alinmis onlemleri kontrol edin","Operasyonel risk olay raporlama esik degerlerini inceleyin","IC kayip veri tabaninin duzenliligi ve dogruluğunu dogrulayin"]',
   'MEDIUM', 'COSO ERM', 2),

  ('a0000001-0000-0000-0000-000000000005', 'Dis kaynak riski', 'Dis Kaynak Kullanimi (Outsourcing) Kontrolu',
   '["Kritik dis kaynak hizmet saglayicilarinin listesini cikartin","SLA izleme raporlarini ve performans metriklerini kontrol edin","Dis kaynak firmalarindaki guvenlik denetim raporlarini (SOC2/ISO 27001) inceleyin","Felaket kurtarma planinda dis kaynak bagimliliklarinin ele alindigini dogrulayin","BDDK''ya dis kaynak bildirimi yapildigini kontrol edin"]',
   'MEDIUM', 'BDDK Dis Kaynak Tebliği', 3),

-- Seed: Financial Controls
  ('a0000001-0000-0000-0000-000000000006', 'Finansal raporlama hatasi', 'Donem Sonu Kapansi Kontrolu',
   '["Aylik mutabakat (reconciliation) islemlerinin tam ve zamaninda yapildigini dogrulayin","Muallak hesaplarin yaslandirma analizini kontrol edin","Manuel gunluk kayitlarinin (journal entry) onay surecini test edin","Tahakkuk ve provizyon hesaplamalarinin dogruluğunu orneklem bazinda dogrulayin","Konsolidasyon eliminasyon kayitlarinin dogru yapildigini kontrol edin"]',
   'HIGH', 'TMS/TFRS', 1),

  ('a0000001-0000-0000-0000-000000000006', 'Masraf yonetimi riski', 'Harcama Onay Kontrolu',
   '["Harcama yetki limitlerini ve onay matrisini inceleyin","Limit asimi harcamalarin uygun onaylarla desteklendigini kontrol edin","Tedarikci secim surecinde rekabet kosullarinin saglandigini dogrulayin","Fatura-siparis-tesellum uclu eslesmesini (3-way match) orneklem bazinda test edin","Iliski kisisi tedarikci odemelerini tarayin"]',
   'MEDIUM', 'IC Kontrol Standartlari', 2),

  ('a0000001-0000-0000-0000-000000000006', 'Vergi uyumsuzlugu', 'Vergi Uyum Kontrolu',
   '["Kurumlar vergisi beyannamesi ile muhasebe kayitlari arasindaki fark analizini inceleyin","KDV iade taleplerinin mevzuata uygunluğunu dogrulayin","Transfer fiyatlandirmasi raporunun hazirlanmis olduğunu kontrol edin","Stopaj hesaplamalarinin dogruluğunu orneklem bazinda test edin","Vergi risk degerlendirmesi raporunun guncelligini dogrulayin"]',
   'MEDIUM', 'VUK / KVK', 3)
ON CONFLICT DO NOTHING;

-- Index for faster category lookups

-- =============================================================================
-- 4. CCM PROBE TANIMLARI VE SIMULE CALISMA VERILERI
-- Kaynak: 20260206171529_create_watchtower_probe_system.sql
-- =============================================================================
-- Seed demo probes with category/severity
UPDATE probes SET category = 'FRAUD', severity = 'HIGH' WHERE title ILIKE '%fraud%' OR title ILIKE '%eft%' OR title ILIKE '%transaction%';
UPDATE probes SET category = 'COMPLIANCE', severity = 'MEDIUM' WHERE title ILIKE '%compliance%' OR title ILIKE '%regulatory%';
UPDATE probes SET category = 'OPS', severity = 'LOW' WHERE category IS NULL OR category = 'OPS';

-- Insert sample probes if none exist
INSERT INTO probes (title, description, query_type, query_payload, schedule_cron, risk_threshold, is_active, category, severity, last_result_status, last_run_at)
SELECT * FROM (VALUES
  ('Haftasonu EFT Kontrol', 'Hafta sonu yapilan yuksek tutarli EFT islemlerini tespit eder', 'SQL', 'SELECT * FROM transactions WHERE day_of_week IN (6,7) AND amount > 500000', '0 */4 * * *', 3, true, 'FRAUD', 'HIGH', 'FAIL', now() - interval '2 hours'),
  ('Yetki Matrisi Ihlal Tarama', 'Onay yetkisi olmadan gerceklestirilen islemleri tarar', 'SQL', 'SELECT * FROM approvals WHERE approver_level < required_level', '0 8 * * 1-5', 5, true, 'COMPLIANCE', 'HIGH', 'PASS', now() - interval '6 hours'),
  ('Bolunmus Islem Tespiti (Smurfing)', 'Esik altinda kalan ardisik islemleri tespit eder', 'SQL', 'SELECT * FROM transactions WHERE amount BETWEEN 9000 AND 10000 GROUP BY account_id HAVING COUNT(*) > 3', '0 */2 * * *', 2, true, 'FRAUD', 'HIGH', 'FAIL', now() - interval '1 hour'),
  ('Dormant Hesap Aktivite Izleme', 'Uzun suredir islem gormeyen hesaplardaki ani hareketleri izler', 'API', 'https://core-banking/api/dormant-accounts/activity', '0 6 * * *', 1, true, 'FRAUD', 'MEDIUM', 'PASS', now() - interval '18 hours'),
  ('KVKK Veri Erisim Logu', 'Hassas verilere erisim loglarini kontrol eder', 'SQL', 'SELECT * FROM access_logs WHERE data_classification = ''SENSITIVE'' AND accessed_at > now() - interval ''24h''', '0 0 * * *', 10, true, 'COMPLIANCE', 'MEDIUM', 'PASS', now() - interval '24 hours'),
  ('Sistem Performans Izleme', 'Core banking sistem yanit surelerini izler', 'WEBHOOK', 'https://monitoring.internal/webhook/perf-alerts', '*/15 * * * *', 5, false, 'OPS', 'LOW', 'PASS', now() - interval '4 hours')
) AS v(title, description, query_type, query_payload, schedule_cron, risk_threshold, is_active, category, severity, last_result_status, last_run_at)
WHERE NOT EXISTS (SELECT 1 FROM probes WHERE probes.title = v.title);

-- Seed probe_runs (past 48 hours of simulated runs)
DO $$
DECLARE
  p_record RECORD;
  run_id uuid;
  run_time timestamptz;
  items int;
  run_status text;
  h int;
BEGIN
  FOR p_record IN SELECT id, risk_threshold, category FROM probes LIMIT 6 LOOP
    FOR h IN 0..23 LOOP
      run_time := now() - (h * interval '2 hours');
      items := floor(random() * 15)::int;

      IF items > p_record.risk_threshold THEN
        run_status := 'FAIL';
      ELSE
        run_status := 'PASS';
      END IF;

      run_id := gen_random_uuid();

      INSERT INTO probe_runs (id, probe_id, items_found, execution_time_ms, status, started_at, completed_at, run_metadata)
      VALUES (
        run_id,
        p_record.id,
        items,
        50 + floor(random() * 450)::int,
        run_status,
        run_time,
        run_time + (floor(random() * 500)::int || ' milliseconds')::interval,
        jsonb_build_object('source', 'scheduled', 'version', '3.0')
      );

      IF run_status = 'FAIL' THEN
        FOR i IN 1..LEAST(items, 5) LOOP
          INSERT INTO probe_exceptions (run_id, probe_id, data_payload, status)
          VALUES (
            run_id,
            p_record.id,
            jsonb_build_object(
              'account_id', 'ACC-' || floor(random() * 99999)::text,
              'amount', round((random() * 1000000)::numeric, 2),
              'timestamp', run_time::text,
              'description', CASE floor(random() * 4)::int
                WHEN 0 THEN 'Esik ustu islem tespit edildi'
                WHEN 1 THEN 'Yetkisiz erisim girisimi'
                WHEN 2 THEN 'Supheli islem deseni'
                ELSE 'Politika ihlali'
              END
            ),
            CASE floor(random() * 4)::int
              WHEN 0 THEN 'OPEN'
              WHEN 1 THEN 'OPEN'
              WHEN 2 THEN 'REMEDIED'
              ELSE 'FALSE_POSITIVE'
            END
          );
        END LOOP;
      END IF;
    END LOOP;
  END LOOP;
END $$;


-- =============================================================================
-- 5. MEVZUAT REFERANS VERILERI (BDDK, MASAK, KVKK, SPK, Basel III)
-- Kaynak: 20260210192339_create_compliance_regulations_table.sql
-- =============================================================================
-- Seed standard Turkish banking regulations
INSERT INTO compliance_regulations (tenant_id, code, title, category, article, description, severity, framework)
SELECT 
  (SELECT id FROM tenants LIMIT 1),
  code,
  title,
  category::TEXT,
  article,
  description,
  severity::TEXT,
  framework
FROM (VALUES
  ('BDDK', 'Bilgi Sistemleri ve Elektronik Bankacılık Hizmetleri Hakkında Yönetmelik', 'BDDK', 'Madde 12 - Güvenlik Kontrolleri', 'Bankaların bilgi sistemlerinde güvenlik kontrollerini sağlaması, yedekleme ve kurtarma prosedürlerini uygulaması zorunludur.', 'critical', 'GIAS2024'),
  ('BDDK', 'İç Sistemler ve İç Sermaye Değerlendirme Süreci Hakkında Yönetmelik', 'BDDK', 'Madde 8 - İç Kontrol Sistemi', 'Bankalar, risk yönetimi süreçlerini destekleyen etkin bir iç kontrol sistemi kurmak zorundadır.', 'high', 'GIAS2024'),
  ('BDDK', 'Bankaların İç Denetim Fonksiyonları Hakkında Yönetmelik', 'BDDK', 'Madde 5 - Denetim Planı', 'İç denetim birimi, yıllık denetim planını risk bazlı yaklaşım ile hazırlar ve yönetim kurulunun onayına sunar.', 'high', 'GIAS2024'),
  ('TCMB', 'Ödeme ve Menkul Kıymet Mutabakat Sistemleri Hakkında Kanun', 'TCMB', 'Madde 6 - Operasyonel Risk', 'Ödeme sistemleri, operasyonel riskleri minimize edecek prosedürler ve teknolojik altyapıya sahip olmalıdır.', 'high', NULL),
  ('TCMB', 'Döviz İşlemleri Hakkında Tebliğ', 'TCMB', 'Madde 4 - Dokümantasyon', 'Döviz alım-satım işlemlerinde müşteri kimlik bilgileri ve işlem dokümantasyonu eksiksiz tutulmalıdır.', 'medium', NULL),
  ('MASAK', 'Suç Gelirlerinin Aklanmasının Önlenmesi Hakkında Kanun', 'MASAK', 'Madde 15 - Şüpheli İşlem Bildirimi', 'Yükümlüler, şüpheli işlemleri gecikmeksizin MASAK''a bildirmekle yükümlüdür.', 'critical', 'GIAS2024'),
  ('MASAK', 'Uyum Programı Rehberi', 'MASAK', 'Bölüm 3 - Müşterini Tanı (KYC)', 'Müşteri kimlik tespiti ve doğrulaması süreçleri, risk bazlı yaklaşım ile gerçekleştirilmelidir.', 'critical', 'GIAS2024'),
  ('KVKK', 'Kişisel Verilerin Korunması Kanunu', 'KVKK', 'Madde 12 - Veri Güvenliği', 'Veri sorumlusu, kişisel verilerin hukuka aykırı işlenmesini ve erişilmesini önlemek için uygun güvenlik tedbirlerini almak zorundadır.', 'critical', 'GIAS2024'),
  ('SPK', 'Sermaye Piyasası Kurulu Tebliği', 'SPK', 'Madde 7 - Bilgi Güvenliği', 'Aracı kurumlar, müşteri bilgilerinin gizliliğini ve bütünlüğünü koruyacak sistemler kurmakla yükümlüdür.', 'high', NULL),
  ('BASEL III', 'Basel III Sermaye Yeterliliği Çerçevesi', 'DIGER', 'Operasyonel Risk Yönetimi', 'Bankalar, operasyonel risk için sermaye yükümlülüğü hesaplamak ve yönetmek zorundadır.', 'high', 'BASEL_III')
) AS t(code, title, category, article, description, severity, framework)
ON CONFLICT DO NOTHING;


-- =============================================================================
-- 6. INCIDENT, POLITIKA VE RISK KANTIFIKASYON SENARYOLARI
-- Kaynak: 20260204004630_create_incident_policy_quant_modules.sql
-- =============================================================================
-- Seed Data: Incidents
INSERT INTO public.incidents (title, description, category, is_anonymous, status) VALUES
('Mesai Saatlerinde Kripto İşlemleri', 'IT departmanında bazı personellerin sürekli trading yaptığı görülüyor.', 'İK', true, 'NEW'),
('Şüpheli EFT Talimatı', 'Müşteri onayı olmadan 500.000 TL çıkış yapıldı.', 'Dolandırıcılık', false, 'INVESTIGATING'),
('Veri Tabanı Erişim İhlali', 'Yetkisiz personel müşteri bilgilerine erişim sağladı.', 'IT', true, 'NEW')
ON CONFLICT (id) DO NOTHING;

-- Seed Data: Policies
INSERT INTO public.policies (title, version, content_url, is_active) VALUES
('Temiz Masa ve Temiz Ekran Politikası', '3.1', '/docs/clean-desk.pdf', true),
('Hediye Kabul ve Etik İlkeler', '2.0', '/docs/ethics.pdf', true),
('Uzaktan Çalışma Güvenlik Esasları', '1.5', '/docs/remote-work.pdf', true),
('Bilgi Güvenliği Politikası', '4.0', '/docs/infosec.pdf', true)
ON CONFLICT (id) DO NOTHING;

-- Seed Data: Risk Quant Scenarios
INSERT INTO public.quant_scenarios (title, description, min_loss, likely_loss, max_loss, probability, simulated_var_95) VALUES
('Fidye Yazılımı (Ransomware) Saldırısı', 'Kritik sistemlerin şifrelenmesi ve fidye talebi', 500000, 2500000, 15000000, 10, 8500000),
('Mobil Bankacılık Servis Kesintisi (4 Saat)', 'Ana sistemde kesinti nedeniyle müşteri hizmetlerinin durması', 100000, 400000, 1200000, 25, 950000),
('Veri Merkezi Yangını', 'Ana veri merkezinde yangın çıkması ve veri kaybı', 5000000, 12000000, 50000000, 2, 35000000)
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 7. CALISMA KAGIDI E2E DEMO VERISI (20 calisma kagidi, testler, bulgular)
-- Kaynak: 20260206184033_create_workpaper_e2e_schema_and_seed_data.sql
-- =============================================================================
-- 3. SEED AUDIT STEPS
-- ============================================================

INSERT INTO audit_steps (id, step_code, title, description, risk_weight)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'IT-001', 'Password Complexity Policy', 'Verify password complexity requirements', 8),
  ('a0000000-0000-0000-0000-000000000002', 'IT-002', 'Multi-Factor Authentication', 'Validate MFA enforcement', 9),
  ('a0000000-0000-0000-0000-000000000003', 'IT-003', 'User Access Review', 'Quarterly user access review', 8),
  ('a0000000-0000-0000-0000-000000000004', 'IT-004', 'Privileged Account Management', 'PAM review', 9),
  ('a0000000-0000-0000-0000-000000000005', 'IT-005', 'Firewall Rule Review', 'Annual firewall rules review', 8),
  ('a0000000-0000-0000-0000-000000000006', 'IT-006', 'Intrusion Detection System', 'IDS monitoring review', 6),
  ('a0000000-0000-0000-0000-000000000007', 'IT-007', 'Network Segmentation', 'Network isolation verification', 6),
  ('a0000000-0000-0000-0000-000000000008', 'IT-008', 'Backup & Recovery', 'Backup testing', 9),
  ('a0000000-0000-0000-0000-000000000009', 'IT-009', 'Disaster Recovery Testing', 'DR test execution', 8),
  ('a0000000-0000-0000-0000-000000000010', 'IT-010', 'Physical Access Control', 'Data center access verification', 5),
  ('a0000000-0000-0000-0000-000000000011', 'IT-011', 'Change Management', 'CAB approval verification', 8),
  ('a0000000-0000-0000-0000-000000000012', 'IT-012', 'Patch Management', 'Patch timeline verification', 7),
  ('a0000000-0000-0000-0000-000000000013', 'IT-013', 'SDLC', 'Code review verification', 6),
  ('a0000000-0000-0000-0000-000000000014', 'IT-014', 'Data Encryption at Rest', 'AES-256 verification', 8),
  ('a0000000-0000-0000-0000-000000000015', 'IT-015', 'Data Encryption in Transit', 'TLS verification', 6),
  ('a0000000-0000-0000-0000-000000000016', 'IT-016', 'Endpoint Protection', 'EDR deployment verification', 5),
  ('a0000000-0000-0000-0000-000000000017', 'IT-017', 'Security Awareness', 'Training completion verification', 3),
  ('a0000000-0000-0000-0000-000000000018', 'IT-018', 'Incident Response', 'IR plan verification', 6),
  ('a0000000-0000-0000-0000-000000000019', 'IT-019', 'Vendor Risk Assessment', 'Third-party assessment', 5),
  ('a0000000-0000-0000-0000-000000000020', 'IT-020', 'Logging & Monitoring', 'SIEM verification', 8)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. SEED 20 WORKPAPERS
-- ============================================================

INSERT INTO workpapers (id, step_id, status, data, version, approval_status, prepared_at, prepared_by_user_id, prepared_by_name, reviewed_at, reviewed_by_user_id, reviewed_by_name)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'review',   '{"control_ref":"IT-001"}', 1, 'reviewed',    now()-interval '5 days', '00000000-0000-0000-0000-000000000001', 'Hakan Yilmaz',    now()-interval '3 days', '00000000-0000-0000-0000-000000000001', 'Supervizor Celik'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'review',   '{"control_ref":"IT-002"}', 1, 'prepared',    now()-interval '4 days', '00000000-0000-0000-0000-000000000001', 'Ayse Demir',      null, null, ''),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'review',   '{"control_ref":"IT-003"}', 1, 'reviewed',    now()-interval '6 days', '00000000-0000-0000-0000-000000000001', 'Mehmet Kaya',     now()-interval '2 days', '00000000-0000-0000-0000-000000000001', 'Supervizor Celik'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'review',   '{"control_ref":"IT-004"}', 1, 'prepared',    now()-interval '3 days', '00000000-0000-0000-0000-000000000001', 'Elif Celik',      null, null, ''),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', 'draft',    '{"control_ref":"IT-005"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000006', 'draft',    '{"control_ref":"IT-006"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000007', 'draft',    '{"control_ref":"IT-007"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000008', 'review',   '{"control_ref":"IT-008"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000009', 'draft',    '{"control_ref":"IT-009"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000010', 'draft',    '{"control_ref":"IT-010"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000011', 'draft',    '{"control_ref":"IT-011"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000012', 'draft',    '{"control_ref":"IT-012"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000013', 'draft',    '{"control_ref":"IT-013"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000014', 'draft',    '{"control_ref":"IT-014"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000015', 'draft',    '{"control_ref":"IT-015"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000016', 'draft',    '{"control_ref":"IT-016"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000017', 'draft',    '{"control_ref":"IT-017"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000018', 'draft',    '{"control_ref":"IT-018"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000019', 'draft',    '{"control_ref":"IT-019"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000020', 'draft',    '{"control_ref":"IT-020"}', 1, 'in_progress', null, null, '', null, null, '')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. SEED TEST STEPS
-- ============================================================

INSERT INTO workpaper_test_steps (workpaper_id, step_order, description, is_completed, auditor_comment) VALUES
  ('b0000000-0000-0000-0000-000000000001', 1, 'Sifre politikasi dokumanini inceleyin ve minimum uzunluk, karmasiklik gereksinimlerini dogrulayin.', true, 'Sifre politikasi NIST 800-63 ile uyumlu. Min 12 karakter, buyuk/kucuk harf, sayi ve ozel karakter gerekli.'),
  ('b0000000-0000-0000-0000-000000000001', 2, 'Active Directory sifre politikasi ayarlarini kontrol edin (GPO uzerinden).', true, 'GPO ayarlari dogrulandi. Complexity=Enabled, MinLength=12, History=24.'),
  ('b0000000-0000-0000-0000-000000000001', 3, 'Son 30 gunde olusturulan hesaplarin sifre gereksinimlerini karsilayip karsilamadigini test edin.', true, ''),
  ('b0000000-0000-0000-0000-000000000001', 4, 'Sifre sifirlama suresini dogrulayin (90 gun).', true, 'Max password age = 90 gun olarak ayarlanmis.'),
  ('b0000000-0000-0000-0000-000000000002', 1, 'MFA politikasi dokumanini inceleyin.', true, 'Tum VPN ve privileged erisimler icin MFA zorunlu kilindi.'),
  ('b0000000-0000-0000-0000-000000000002', 2, 'VPN erisim loglarini inceleyerek MFA dogrulayin.', true, 'Son 90 gun icinde 2,847 VPN oturumunun tamami MFA ile dogrulandi.'),
  ('b0000000-0000-0000-0000-000000000002', 3, 'Admin hesaplari icin MFA konfigurasyonunu test edin.', false, ''),
  ('b0000000-0000-0000-0000-000000000002', 4, 'MFA bypass senaryolarini (exception list) inceleyin.', false, ''),
  ('b0000000-0000-0000-0000-000000000003', 1, 'Son ceyrekte yapilan kullanici erisim gozden gecirme raporunu inceleyin.', true, 'Q3 2025 erisim gozden gecirmesi 15.01.2026 tarihinde tamamlandi.'),
  ('b0000000-0000-0000-0000-000000000003', 2, 'Istenlerinden ayrilan calisanlarin hesap kapatma suresini dogrulayin.', true, 'Orneklem: 25 isten ayrilma kaydi incelendi. Ortalama kapatma suresi: 4 saat.'),
  ('b0000000-0000-0000-0000-000000000003', 3, 'Departman degistiren kullanicilarin erisim haklarinin guncellendigini dogrulayin.', true, '12/15 transfer kaydinda erisim haklari zamaninda guncellendi.'),
  ('b0000000-0000-0000-0000-000000000003', 4, 'Paylasilmis/genel hesaplarin envanterini dogrulayin.', true, '6 paylasilmis hesap tespit edildi. Tamami dokumante edilmis.'),
  ('b0000000-0000-0000-0000-000000000004', 1, 'Privileged hesap envanterini inceleyin.', true, 'Toplam 47 privileged hesap tespit edildi. PAM sisteminde kayitli.'),
  ('b0000000-0000-0000-0000-000000000004', 2, 'PAM sistemi loglarini son 90 gun icin inceleyin.', true, 'CyberArk PAM loglarinda anormal aktivite tespit edilmedi.'),
  ('b0000000-0000-0000-0000-000000000004', 3, 'Privileged erisim taleplerinin onay surecini dogrulayin.', false, ''),
  ('b0000000-0000-0000-0000-000000000004', 4, 'Emergency access prosedurlerini inceleyin.', true, 'Break-glass proseduru dokumante edilmis.'),
  ('b0000000-0000-0000-0000-000000000004', 5, 'Service account sifre rotasyonunu dogrulayin.', false, ''),
  ('b0000000-0000-0000-0000-000000000005', 1, 'Firewall kural setini export edin ve inceleyin.', false, ''),
  ('b0000000-0000-0000-0000-000000000005', 2, 'Any/Any kurallarinin varligini kontrol edin.', false, ''),
  ('b0000000-0000-0000-0000-000000000005', 3, 'Kullanilmayan kurallari tespit edin.', false, ''),
  ('b0000000-0000-0000-0000-000000000006', 1, 'IDS/IPS sisteminin aktif oldugunu dogrulayin.', true, 'Snort IDS aktif. Son guncelleme: 2 gun once.'),
  ('b0000000-0000-0000-0000-000000000006', 2, 'Son 30 gundeki alarm istatistiklerini inceleyin.', true, 'Toplam 1,247 alarm. 3 critical, 45 high. Tumu SLA icinde incelenmis.'),
  ('b0000000-0000-0000-0000-000000000006', 3, 'False positive oranini hesaplayin.', false, ''),
  ('b0000000-0000-0000-0000-000000000008', 1, 'Yedekleme politikasi dokumanini inceleyin.', true, 'Gunluk incremental, haftalik full, aylik offsite yedekleme.'),
  ('b0000000-0000-0000-0000-000000000008', 2, 'Son 30 gundeki yedekleme basari oranini dogrulayin.', true, 'Basari orani: %99.7.'),
  ('b0000000-0000-0000-0000-000000000008', 3, 'Yedekten geri yukleme testini inceleyin.', true, 'RTO: 4 saat (hedef: 6). RPO: 15 dakika (hedef: 1 saat).'),
  ('b0000000-0000-0000-0000-000000000008', 4, 'Offsite yedekleme konumunu dogrulayin.', true, 'AWS S3 Cross-Region Istanbul -> Frankfurt.'),
  ('b0000000-0000-0000-0000-000000000009', 1, 'DR plani dokumanini inceleyin.', true, 'Son guncelleme: 01.12.2025.'),
  ('b0000000-0000-0000-0000-000000000009', 2, 'Son DR test raporunu inceleyin.', false, ''),
  ('b0000000-0000-0000-0000-000000000009', 3, 'DR testi sirasindaki eksikliklerin giderildigini dogrulayin.', false, ''),
  ('b0000000-0000-0000-0000-000000000011', 1, 'CAB toplanti tutanaklarini inceleyin.', true, 'Son 3 ayda 12 CAB toplantisi. Tum degisiklikler onaylanmis.'),
  ('b0000000-0000-0000-0000-000000000011', 2, 'Son 90 gundeki production degisikliklerinden orneklem secin.', false, ''),
  ('b0000000-0000-0000-0000-000000000011', 3, 'Emergency change prosedurlerini inceleyin.', false, ''),
  ('b0000000-0000-0000-0000-000000000011', 4, 'Rollback planlarinin varligini dogrulayin.', false, ''),
  ('b0000000-0000-0000-0000-000000000012', 1, 'Patch yonetimi politikasini inceleyin.', true, 'Kritik: 14 gun, Yuksek: 30 gun, Orta: 90 gun SLA.'),
  ('b0000000-0000-0000-0000-000000000012', 2, 'Kritik yamalarin uygulanma suresini dogrulayin.', true, '23 kritik yama, ortalama: 8 gun. SLA karsilandi.'),
  ('b0000000-0000-0000-0000-000000000012', 3, 'Patch test prosedurlerini dogrulayin.', false, ''),
  ('b0000000-0000-0000-0000-000000000014', 1, 'Veritabani sifreleme konfigurasyonunu dogrulayin.', true, 'PostgreSQL TDE aktif (AES-256).'),
  ('b0000000-0000-0000-0000-000000000014', 2, 'Dosya sistemi sifreleme durumunu kontrol edin.', true, 'BitLocker ve LUKS tum sunucularda aktif.'),
  ('b0000000-0000-0000-0000-000000000014', 3, 'Sifreleme anahtar yonetimi prosedurlerini inceleyin.', false, ''),
  ('b0000000-0000-0000-0000-000000000014', 4, 'Hassas veri siniflandirma envanterini dogrulayin.', false, '');

-- ============================================================
-- 6. SEED EVIDENCE REQUESTS
-- ============================================================

INSERT INTO evidence_requests (workpaper_id, title, description, status, due_date) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Active Directory GPO Export', 'Password policy GPO settings export', 'accepted', now()-interval '10 days'),
  ('b0000000-0000-0000-0000-000000000001', 'Son 30 Gun Hesap Olusturma Listesi', 'Yeni kullanici hesaplari listesi', 'accepted', now()-interval '8 days'),
  ('b0000000-0000-0000-0000-000000000002', 'VPN Erisim Loglari (90 Gun)', 'MFA dogrulama detaylariyla VPN loglari', 'submitted', now()-interval '5 days'),
  ('b0000000-0000-0000-0000-000000000002', 'MFA Exception Listesi', 'MFA muaf tutulan hesaplar ve gerekceleri', 'pending', now()+interval '3 days'),
  ('b0000000-0000-0000-0000-000000000003', 'Q3 Erisim Gozden Gecirme Raporu', 'Son ceyrek erisim gozden gecirme sonuclari', 'accepted', now()-interval '12 days'),
  ('b0000000-0000-0000-0000-000000000003', 'Isten Ayrilma Kayitlari', 'Son 90 gun isten ayrilma ve hesap kapatma', 'accepted', now()-interval '7 days'),
  ('b0000000-0000-0000-0000-000000000004', 'CyberArk PAM Raporu', 'Privileged hesap envanter ve aktivite raporu', 'submitted', now()-interval '3 days'),
  ('b0000000-0000-0000-0000-000000000004', 'Break-Glass Kullanim Loglari', 'Emergency access kullanim kayitlari', 'accepted', now()-interval '6 days'),
  ('b0000000-0000-0000-0000-000000000005', 'Firewall Kural Export', 'Tum firewall kurallarinin export dosyasi', 'pending', now()+interval '5 days'),
  ('b0000000-0000-0000-0000-000000000006', 'IDS Alarm Istatistikleri', 'Son 30 gun IDS alarm ozeti', 'submitted', now()-interval '2 days'),
  ('b0000000-0000-0000-0000-000000000008', 'Yedekleme Basari Raporu', 'Son 30 gun yedekleme durum raporu', 'accepted', now()-interval '8 days'),
  ('b0000000-0000-0000-0000-000000000008', 'Restore Test Raporu', 'Geri yukleme test sonuclari', 'accepted', now()-interval '5 days'),
  ('b0000000-0000-0000-0000-000000000009', 'DR Plan Dokumani', 'Guncel Disaster Recovery plani v3.2', 'submitted', now()-interval '4 days'),
  ('b0000000-0000-0000-0000-000000000011', 'CAB Toplanti Tutanaklari', 'Son 3 ay CAB tutanaklari', 'pending', now()+interval '2 days'),
  ('b0000000-0000-0000-0000-000000000012', 'Patch Uygulama Raporu', 'Son 90 gun yama uygulama detaylari', 'accepted', now()-interval '6 days'),
  ('b0000000-0000-0000-0000-000000000012', 'WSUS/SCCM Konfigurasyonu', 'Patch dagitim sistemi ayarlari', 'submitted', now()-interval '1 day'),
  ('b0000000-0000-0000-0000-000000000014', 'Sifreleme Konfigurasyonu', 'DB ve dosya sistemi sifreleme ayarlari', 'accepted', now()-interval '9 days'),
  ('b0000000-0000-0000-0000-000000000014', 'Anahtar Yonetimi Proseduru', 'Sifreleme anahtari rotasyon proseduru', 'pending', now()+interval '7 days');

-- ============================================================
-- 7. SEED FINDINGS
-- ============================================================

INSERT INTO workpaper_findings (workpaper_id, title, description, severity, source_ref) VALUES
  ('b0000000-0000-0000-0000-000000000002', 'Admin Hesaplarinda MFA Eksikligi', '3 adet domain admin hesabinda MFA konfigurasyonu yapilmamis.', 'CRITICAL', 'IT-002 Adim-3'),
  ('b0000000-0000-0000-0000-000000000002', 'MFA Exception Listesi Denetim Eksikligi', 'MFA muaf tutulan 12 hesabin muafiyet gerekceleri dokumante edilmemis.', 'HIGH', 'IT-002 Adim-4'),
  ('b0000000-0000-0000-0000-000000000003', 'Erisim Hakki Guncelleme Gecikmesi', 'Departman transferlerinde erisim haklari guncellemesi ortalama 2 is gunu gecikmeli.', 'MEDIUM', 'IT-003 Adim-3'),
  ('b0000000-0000-0000-0000-000000000004', 'Privileged Erisim Talep Sureci Yetersiz', 'Privileged erisim taleplerinin %30unda yonetici onayi alinmadan erisim saglanmis.', 'HIGH', 'IT-004 Adim-3'),
  ('b0000000-0000-0000-0000-000000000004', 'Service Account Sifre Rotasyonu Eksik', '47 service accountun 18 adedinin sifresi 1 yildir degistirilmemis.', 'HIGH', 'IT-004 Adim-5'),
  ('b0000000-0000-0000-0000-000000000006', 'IDS False Positive Orani Yuksek', 'IDS alarmlarinin %35i false positive. Gercek tehditlerin gozden kacirilma riski.', 'MEDIUM', 'IT-006 Adim-3'),
  ('b0000000-0000-0000-0000-000000000011', 'Emergency Change Review Eksikligi', '8 emergency changein 3unda post-implementation review yapilmamis.', 'MEDIUM', 'IT-011 Adim-3'),
  ('b0000000-0000-0000-0000-000000000011', 'Rollback Plan Eksikligi', '15 degisiklik talebinin 4unde rollback plani bulunmamakta.', 'HIGH', 'IT-011 Adim-4'),
  ('b0000000-0000-0000-0000-000000000012', 'Patch Test Proseduru Eksikligi', 'Kritik yamalarin test ortaminda test edilmesine yonelik prosedur mevcut degil.', 'MEDIUM', 'IT-012 Adim-3'),
  ('b0000000-0000-0000-0000-000000000014', 'Sifreleme Anahtari Rotasyonu Yapilmiyor', 'DB sifreleme anahtarlari 2 yildir degistirilmemis.', 'HIGH', 'IT-014 Adim-3');

-- ============================================================
-- 8. SEED REVIEW NOTES
-- ============================================================

INSERT INTO review_notes (workpaper_id, field_key, note_text, author_name, status, resolved_at) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'general', 'Sifre politikasi incelemesi kapsamli. Orneklem buyuklugu uygun.', 'Supervizor Celik', 'Resolved', now()-interval '4 days'),
  ('b0000000-0000-0000-0000-000000000001', 'general', 'NIST referansi eklensin. Hangi versiyon kullanildi belirtilmeli.', 'Supervizor Celik', 'Resolved', now()-interval '3 days'),
  ('b0000000-0000-0000-0000-000000000002', 'general', 'Admin MFA bulgusu kritik olarak derecelendirilmeli. BDDK referansi eklensin.', 'Supervizor Celik', 'Open', null),
  ('b0000000-0000-0000-0000-000000000002', 'general', 'MFA exception listesi icin yonetim beyanati alinmali.', 'Supervizor Celik', 'Open', null),
  ('b0000000-0000-0000-0000-000000000003', 'general', 'Orneklem secim yontemi dokumante edilmeli.', 'Supervizor Celik', 'Resolved', now()-interval '2 days'),
  ('b0000000-0000-0000-0000-000000000004', 'general', 'CyberArk PAM raporundaki anomaliler detaylandirilmali.', 'Supervizor Celik', 'Open', null),
  ('b0000000-0000-0000-0000-000000000008', 'general', 'RTO/RPO metrikleri iyi. Guncel SLA degerleriyle karsilastirilmis.', 'Supervizor Celik', 'Resolved', now()-interval '3 days'),
  ('b0000000-0000-0000-0000-000000000008', 'general', 'Offsite yedekleme lokasyonunun KVKK uyumlulugu dogrulanmali.', 'Supervizor Celik', 'Open', null);

-- ============================================================
-- 9. SEED ACTIVITY LOGS
-- ============================================================

INSERT INTO workpaper_activity_logs (workpaper_id, user_name, action_type, details, created_at) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Hakan Yilmaz', 'STEP_COMPLETED', '"Sifre politikasi dokumanini inceleyin" adimi tamamlandi', now()-interval '7 days'),
  ('b0000000-0000-0000-0000-000000000001', 'Hakan Yilmaz', 'STEP_COMPLETED', '"Active Directory GPO kontrol" adimi tamamlandi', now()-interval '7 days'),
  ('b0000000-0000-0000-0000-000000000001', 'Hakan Yilmaz', 'EVIDENCE_UPDATE', 'Kanit durumu "accepted" olarak guncellendi', now()-interval '6 days'),
  ('b0000000-0000-0000-0000-000000000001', 'Hakan Yilmaz', 'SIGN_OFF', 'Hazirlayan olarak imzalandi', now()-interval '5 days'),
  ('b0000000-0000-0000-0000-000000000001', 'Supervizor Celik', 'NOTE_ADDED', 'Gozden gecirme notu eklendi', now()-interval '4 days'),
  ('b0000000-0000-0000-0000-000000000001', 'Hakan Yilmaz', 'NOTE_RESOLVED', 'Gozden gecirme notu cozuldu', now()-interval '4 days'),
  ('b0000000-0000-0000-0000-000000000001', 'Supervizor Celik', 'SIGN_OFF', 'Gozden geciren olarak onaylandi', now()-interval '3 days'),
  ('b0000000-0000-0000-0000-000000000002', 'Ayse Demir', 'STEP_COMPLETED', '"MFA politikasi dokumanini inceleyin" adimi tamamlandi', now()-interval '6 days'),
  ('b0000000-0000-0000-0000-000000000002', 'Ayse Demir', 'STEP_COMPLETED', '"VPN erisim loglari" adimi tamamlandi', now()-interval '5 days'),
  ('b0000000-0000-0000-0000-000000000002', 'Ayse Demir', 'FINDING_ADDED', '"Admin Hesaplarinda MFA Eksikligi" bulgusu eklendi (CRITICAL)', now()-interval '5 days'),
  ('b0000000-0000-0000-0000-000000000002', 'Ayse Demir', 'SIGN_OFF', 'Hazirlayan olarak imzalandi', now()-interval '4 days'),
  ('b0000000-0000-0000-0000-000000000002', 'Supervizor Celik', 'NOTE_ADDED', 'Admin MFA bulgusu hakkinda not eklendi', now()-interval '3 days'),
  ('b0000000-0000-0000-0000-000000000003', 'Mehmet Kaya', 'STEP_COMPLETED', '"Erisim gozden gecirme raporu" adimi tamamlandi', now()-interval '8 days'),
  ('b0000000-0000-0000-0000-000000000003', 'Mehmet Kaya', 'EVIDENCE_UPDATE', 'Kanit durumu "accepted" olarak guncellendi', now()-interval '7 days'),
  ('b0000000-0000-0000-0000-000000000003', 'Mehmet Kaya', 'FINDING_ADDED', '"Erisim Hakki Guncelleme Gecikmesi" bulgusu eklendi (MEDIUM)', now()-interval '6 days'),
  ('b0000000-0000-0000-0000-000000000003', 'Mehmet Kaya', 'SIGN_OFF', 'Hazirlayan olarak imzalandi', now()-interval '6 days'),
  ('b0000000-0000-0000-0000-000000000003', 'Supervizor Celik', 'SIGN_OFF', 'Gozden geciren olarak onaylandi', now()-interval '2 days'),
  ('b0000000-0000-0000-0000-000000000004', 'Elif Celik', 'STEP_COMPLETED', '"Privileged hesap envanteri" adimi tamamlandi', now()-interval '5 days'),
  ('b0000000-0000-0000-0000-000000000004', 'Elif Celik', 'FINDING_ADDED', '"Privileged Erisim Sureci Yetersiz" (HIGH)', now()-interval '4 days'),
  ('b0000000-0000-0000-0000-000000000008', 'Hakan Yilmaz', 'STEP_COMPLETED', '"Yedekleme politikasi" adimi tamamlandi', now()-interval '6 days'),
  ('b0000000-0000-0000-0000-000000000008', 'Hakan Yilmaz', 'SAMPLE_CALCULATED', 'Orneklem hesaplandi: 25 (MEDIUM risk, %95)', now()-interval '5 days');

-- ============================================================
-- 10. SEED QUESTIONNAIRES
-- ============================================================

INSERT INTO questionnaires (workpaper_id, title, questions_json, status, sent_to, responded_at) VALUES
  ('b0000000-0000-0000-0000-000000000002', 'MFA Uygulama Anketi', 
   '[{"id":"q1","question":"Tum kullanicilar icin MFA zorunlu mu?","type":"yesno","answer":"Evet"},{"id":"q2","question":"MFA bypass mekanizmasi var mi?","type":"yesno","answer":"Evet"},{"id":"q3","question":"MFA loglari merkezi olarak izleniyor mu?","type":"yesno","answer":"Hayir"},{"id":"q4","question":"MFA sisteminin son bakim tarihi nedir?","type":"text","answer":"15.12.2025 tarihinde guncellendi"}]',
   'Responded', 'IT Guvenligi Muduru', now()-interval '3 days'),
  ('b0000000-0000-0000-0000-000000000004', 'Privileged Access Anketi',
   '[{"id":"q1","question":"PAM sistemi tum privileged hesaplari kapsiyor mu?","type":"yesno","answer":"Evet"},{"id":"q2","question":"Service account sifreleri otomatik rotate ediliyor mu?","type":"yesno","answer":"Hayir"},{"id":"q3","question":"Privileged oturumlarin video kaydi aliniyor mu?","type":"yesno","answer":"Evet"},{"id":"q4","question":"JIT erisim modeli kullaniliyor mu?","type":"yesno","answer":"Hayir"}]',
   'Reviewed', 'IT Operasyonlari Muduru', now()-interval '4 days'),
  ('b0000000-0000-0000-0000-000000000008', 'Yedekleme Sureci Anketi',
   '[{"id":"q1","question":"Yedekleme islemi otomatik mi?","type":"yesno","answer":null},{"id":"q2","question":"Offsite yedekleme yapiliyor mu?","type":"yesno","answer":null},{"id":"q3","question":"Yedekleme basari orani ne kadar?","type":"text","answer":null},{"id":"q4","question":"Son restore test tarihi nedir?","type":"text","answer":null}]',
   'Sent', 'Sistem Yoneticisi', null);


-- =============================================================================
-- 8. SENTINEL OFFICE BELGELERI (Spreadsheet ve Rapor ornekleri)
-- Kaynak: 20260207184150_create_sentinel_office_document_vault.sql
-- =============================================================================
-- Seed documents
INSERT INTO office_documents (id, tenant_id, title, doc_type, created_by_name)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '11111111-1111-1111-1111-111111111111', 'Kredi Orneklem Secimi (2026-Q1)', 'SPREADSHEET', 'Mehmet Yilmaz'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '11111111-1111-1111-1111-111111111111', 'Kredi Surecleri - Bulgu Taslak Raporu', 'DOCUMENT', 'Mehmet Yilmaz')
ON CONFLICT (id) DO NOTHING;

-- Seed spreadsheet version
INSERT INTO office_versions (document_id, version_number, content_data, content_hash, change_summary, is_frozen, created_by_name)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  1,
  '{"cells":{"A1":{"value":"Musteri No","format":"text"},"B1":{"value":"Musteri Adi","format":"text"},"C1":{"value":"Kredi Tutari (TRY)","format":"text"},"D1":{"value":"Faiz Orani (%)","format":"text"},"E1":{"value":"Risk Skoru","format":"text"},"F1":{"value":"Teminat Degeri (TRY)","format":"text"},"G1":{"value":"LTV (%)","format":"text"},"H1":{"value":"Sonuc","format":"text"},"A2":{"value":"10234567","format":"text"},"B2":{"value":"ABC Insaat Ltd.","format":"text"},"C2":{"value":"2500000","format":"currency"},"D2":{"value":"24.5","format":"number"},"E2":{"value":"Yuksek","format":"text"},"F2":{"value":"3200000","format":"currency"},"G2":{"value":"78.1","format":"percent"},"H2":{"value":"Uygun","format":"text"},"A3":{"value":"10345678","format":"text"},"B3":{"value":"XYZ Tekstil A.S.","format":"text"},"C3":{"value":"850000","format":"currency"},"D3":{"value":"26.0","format":"number"},"E3":{"value":"Orta","format":"text"},"F3":{"value":"600000","format":"currency"},"G3":{"value":"141.7","format":"percent"},"H3":{"value":"Bulgu","format":"text"},"A4":{"value":"10456789","format":"text"},"B4":{"value":"Mehmet Yilmaz","format":"text"},"C4":{"value":"175000","format":"currency"},"D4":{"value":"22.0","format":"number"},"E4":{"value":"Dusuk","format":"text"},"F4":{"value":"350000","format":"currency"},"G4":{"value":"50.0","format":"percent"},"H4":{"value":"Uygun","format":"text"},"A5":{"value":"10567890","format":"text"},"B5":{"value":"DEF Enerji A.S.","format":"text"},"C5":{"value":"5000000","format":"currency"},"D5":{"value":"21.5","format":"number"},"E5":{"value":"Yuksek","format":"text"},"F5":{"value":"4200000","format":"currency"},"G5":{"value":"119.0","format":"percent"},"H5":{"value":"Bulgu","format":"text"},"A6":{"value":"10678901","format":"text"},"B6":{"value":"Ayse Kara","format":"text"},"C6":{"value":"320000","format":"currency"},"D6":{"value":"23.0","format":"number"},"E6":{"value":"Orta","format":"text"},"F6":{"value":"480000","format":"currency"},"G6":{"value":"66.7","format":"percent"},"H6":{"value":"Uygun","format":"text"},"A8":{"value":"TOPLAM","format":"text"},"C8":{"value":"","formula":"=SUM(C2:C6)","format":"currency"},"F8":{"value":"","formula":"=SUM(F2:F6)","format":"currency"}},"config":{"columns":8,"rows":20,"columnWidths":{},"columnHeaders":{"0":"Musteri No","1":"Musteri Adi","2":"Kredi Tutari","3":"Faiz %","4":"Risk","5":"Teminat","6":"LTV %","7":"Sonuc"}},"version":1}'::jsonb,
  encode(sha256(convert_to('sheet-v1-seed', 'UTF8')), 'hex'),
  'Ilk versiyon: 6 musteri orneklemi girildi',
  true,
  'Mehmet Yilmaz'
);

-- Seed document version
INSERT INTO office_versions (document_id, version_number, content_data, content_hash, change_summary, is_frozen, created_by_name)
VALUES (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  1,
  '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Kredi Surecleri Denetim Raporu - Taslak"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"1. Yonetici Ozeti"}]},{"type":"paragraph","content":[{"type":"text","text":"Bu denetim, bankanin bireysel ve ticari kredi sureclerini kapsamaktadir. Denetim donemi 01.01.2026 - 31.03.2026 tarihleri arasini kapsamaktadir. Toplam 14 bulgu tespit edilmis olup, 1 tanesi kritik, 3 tanesi yuksek risk kategorisindedir."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"2. Denetim Kapsami"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Kredi tahsis ve onay surecleri"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Teminat degerleme islemleri"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Kredi izleme ve erken uyari sistemi"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Yapilandirma ve takipteki alacaklar"}]}]}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"3. Onemli Bulgular"}]},{"type":"paragraph","content":[{"type":"text","marks":[{"type":"bold"}],"text":"Bulgu 1 (Kritik): "},{"type":"text","text":"Teminat degerleme raporlarinda %15 oraninda eksik veya guncel olmayan ekspertiz raporu tespit edilmistir."}]},{"type":"paragraph","content":[{"type":"text","marks":[{"type":"bold"}],"text":"Bulgu 2 (Yuksek): "},{"type":"text","text":"LTV orani %100 un uzerinde olan 23 adet kredi tespit edilmistir. Toplam tutar 45.2M TRY."}]}]}'::jsonb,
  encode(sha256(convert_to('report-v1-seed', 'UTF8')), 'hex'),
  'Ilk versiyon: Taslak rapor olusturuldu',
  true,
  'Mehmet Yilmaz'
);

-- Link current versions
UPDATE office_documents SET current_version_id = (
  SELECT id FROM office_versions WHERE document_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' ORDER BY version_number DESC LIMIT 1
) WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

UPDATE office_documents SET current_version_id = (
  SELECT id FROM office_versions WHERE document_id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' ORDER BY version_number DESC LIMIT 1
) WHERE id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

-- =============================================================================
-- 9. YETENEK OS: DENETCI PROFILLERI, BECERILER VE SERVIS SABLONLARI
-- Kaynak: 20260207203630_seed_talent_os_demo_data.sql
-- =============================================================================
/*
  # Seed Talent OS Demo Data

  1. Data Seeded
    - 5 Auditor Personas with distinct profiles
    - Skill matrix entries for each auditor across 6 domains
    - 4 Audit Service Templates

  2. Notes
    - Burak Yilmaz has RED fatigue (85/100) to demonstrate warning system
    - Each auditor has unique skill distribution reflecting their persona
*/

DO $$
DECLARE
  v_elif uuid;
  v_mert uuid;
  v_zeynep uuid;
  v_burak uuid;
  v_selin uuid;
BEGIN

INSERT INTO talent_profiles (
  full_name, title, department, total_xp, current_level,
  fatigue_score, burnout_zone, last_audit_date,
  consecutive_high_stress_projects, active_hours_last_3_weeks,
  travel_load, is_available
) VALUES (
  'Elif Kaya', 'Expert', 'BT Denetimi', 12500, 5,
  32.0, 'GREEN', '2026-01-20',
  0, 95.0, 15.0, true
) RETURNING id INTO v_elif;

INSERT INTO talent_profiles (
  full_name, title, department, total_xp, current_level,
  fatigue_score, burnout_zone, last_audit_date,
  consecutive_high_stress_projects, active_hours_last_3_weeks,
  travel_load, is_available
) VALUES (
  'Mert Demir', 'Senior', 'Uyum Denetimi', 7800, 4,
  58.0, 'AMBER', '2026-01-28',
  2, 115.0, 45.0, true
) RETURNING id INTO v_mert;

INSERT INTO talent_profiles (
  full_name, title, department, total_xp, current_level,
  fatigue_score, burnout_zone, last_audit_date,
  consecutive_high_stress_projects, active_hours_last_3_weeks,
  travel_load, is_available
) VALUES (
  'Zeynep Arslan', 'Junior', 'Genel Denetim', 1200, 1,
  18.0, 'GREEN', '2026-02-01',
  0, 60.0, 5.0, true
) RETURNING id INTO v_zeynep;

INSERT INTO talent_profiles (
  full_name, title, department, total_xp, current_level,
  fatigue_score, burnout_zone, last_audit_date,
  consecutive_high_stress_projects, active_hours_last_3_weeks,
  travel_load, is_available
) VALUES (
  'Burak Yilmaz', 'Manager', 'Veri Analizi', 9400, 4,
  85.0, 'RED', '2026-02-03',
  4, 155.0, 72.0, false
) RETURNING id INTO v_burak;

INSERT INTO talent_profiles (
  full_name, title, department, total_xp, current_level,
  fatigue_score, burnout_zone, last_audit_date,
  consecutive_high_stress_projects, active_hours_last_3_weeks,
  travel_load, is_available
) VALUES (
  'Selin Ozturk', 'Senior', 'Mali Denetim', 6500, 3,
  25.0, 'GREEN', '2026-01-15',
  1, 80.0, 20.0, true
) RETURNING id INTO v_selin;

-- Elif Kaya Skills
INSERT INTO talent_skills (auditor_id, skill_name, proficiency_level, earned_xp) VALUES
  (v_elif, 'Cyber', 5, 4200),
  (v_elif, 'DataAnalytics', 4, 2800),
  (v_elif, 'RiskMgmt', 3, 1900),
  (v_elif, 'Finance', 2, 1200),
  (v_elif, 'Compliance', 2, 1100),
  (v_elif, 'Shariah', 1, 300);

-- Mert Demir Skills
INSERT INTO talent_skills (auditor_id, skill_name, proficiency_level, earned_xp) VALUES
  (v_mert, 'Shariah', 5, 3500),
  (v_mert, 'Compliance', 4, 2100),
  (v_mert, 'RiskMgmt', 3, 1200),
  (v_mert, 'Finance', 3, 900),
  (v_mert, 'Cyber', 1, 200),
  (v_mert, 'DataAnalytics', 1, 100);

-- Zeynep Arslan Skills
INSERT INTO talent_skills (auditor_id, skill_name, proficiency_level, earned_xp) VALUES
  (v_zeynep, 'Compliance', 2, 400),
  (v_zeynep, 'Finance', 2, 350),
  (v_zeynep, 'RiskMgmt', 1, 200),
  (v_zeynep, 'DataAnalytics', 1, 150),
  (v_zeynep, 'Cyber', 1, 100),
  (v_zeynep, 'Shariah', 1, 50);

-- Burak Yilmaz Skills (RED ZONE)
INSERT INTO talent_skills (auditor_id, skill_name, proficiency_level, earned_xp) VALUES
  (v_burak, 'DataAnalytics', 5, 4000),
  (v_burak, 'Cyber', 3, 1800),
  (v_burak, 'RiskMgmt', 4, 2200),
  (v_burak, 'Finance', 2, 800),
  (v_burak, 'Compliance', 2, 500),
  (v_burak, 'Shariah', 1, 100);

-- Selin Ozturk Skills
INSERT INTO talent_skills (auditor_id, skill_name, proficiency_level, earned_xp) VALUES
  (v_selin, 'Compliance', 4, 2600),
  (v_selin, 'Finance', 4, 2400),
  (v_selin, 'RiskMgmt', 3, 1500),
  (v_selin, 'Shariah', 2, 600),
  (v_selin, 'Cyber', 1, 200),
  (v_selin, 'DataAnalytics', 2, 700);

END $$;

-- Service Templates (outside PL/pgSQL block)
INSERT INTO audit_service_templates (service_name, description, required_skills, standard_duration_sprints, complexity) VALUES
(
  'BT Derinlemesine Denetim',
  'Kapsamli bilgi teknolojileri altyapi ve guvenlik denetimi',
  '{"Cyber": 4, "DataAnalytics": 3, "RiskMgmt": 2}'::jsonb,
  4, 'HIGH'
),
(
  'Sube Denetimi',
  'Standart banka subesi operasyonel denetimi',
  '{"Compliance": 3, "Finance": 3, "RiskMgmt": 2}'::jsonb,
  2, 'MEDIUM'
),
(
  'Islami Finans Uyum Incelemesi',
  'Seriat uyumluluk ve sukuk portfoy denetimi',
  '{"Shariah": 4, "Compliance": 3, "Finance": 2}'::jsonb,
  3, 'HIGH'
),
(
  'Veri Analizi Sprinti',
  'Hizli veri odakli anomali tespiti ve analiz calismasi',
  '{"DataAnalytics": 4, "Cyber": 2}'::jsonb,
  1, 'MEDIUM'
);


-- =============================================================================
-- 10. SUREC HARITALARI (Ticari Kredi Tahsis Sureci)
-- Kaynak: 20260208085911_create_vendor_tokens_and_process_maps.sql
-- =============================================================================
-- SEED: Process Map - Ticari Kredi Tahsis Sureci
-- ============================================================
INSERT INTO process_maps (
  id, title, nodes_json, edges_json, risk_mappings
) VALUES (
  'b0b0b0b0-0001-4000-8000-000000000001',
  'Ticari Kredi Tahsis Sureci',
  '[
    {"id": "1", "type": "input", "data": {"label": "Musteri Basvurusu"}, "position": {"x": 250, "y": 0}},
    {"id": "2", "data": {"label": "Sube Istihbarat"}, "position": {"x": 250, "y": 120}},
    {"id": "3", "data": {"label": "Kredi Komitesi Onay"}, "position": {"x": 250, "y": 240}},
    {"id": "4", "data": {"label": "Teminat Degerlendirme"}, "position": {"x": 500, "y": 240}},
    {"id": "5", "data": {"label": "Sozlesme Imza"}, "position": {"x": 250, "y": 360}},
    {"id": "6", "type": "output", "data": {"label": "Kredi Kullandirma"}, "position": {"x": 250, "y": 480}}
  ]'::jsonb,
  '[
    {"id": "e1-2", "source": "1", "target": "2", "animated": true},
    {"id": "e2-3", "source": "2", "target": "3"},
    {"id": "e3-4", "source": "3", "target": "4", "label": "Teminat Gerekli"},
    {"id": "e3-5", "source": "3", "target": "5"},
    {"id": "e4-5", "source": "4", "target": "5"},
    {"id": "e5-6", "source": "5", "target": "6", "animated": true}
  ]'::jsonb,
  '[
    {"nodeId": "2", "riskLabel": "Yetersiz Istihbarat Riski", "severity": "HIGH"},
    {"nodeId": "3", "riskLabel": "Yetki Asimi Riski", "severity": "CRITICAL"},
    {"nodeId": "4", "riskLabel": "Dusuk Teminat Riski", "severity": "MEDIUM"}
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 11. QAIP KONTROL LISTELERI VE INCELEME ORNEKLERI
-- Kaynak: 20260208101314_create_qaip_checklists_and_seed.sql
-- =============================================================================
INSERT INTO qaip_checklists (id, title, description, criteria) VALUES
(
  'a1b2c3d4-0001-4000-8000-000000000001',
  'Genel Denetim Kalite Kontrol Listesi',
  'Her denetim gorevine uygulanacak standart kalite kontrol listesi',
  '[
    {"id": "gc-001", "text": "Denetim kapsami acik ve net tanimlanmis mi?", "weight": 15},
    {"id": "gc-002", "text": "Risk degerlendirmesi yapilmis mi?", "weight": 15},
    {"id": "gc-003", "text": "Is programi onaylanmis mi?", "weight": 10},
    {"id": "gc-004", "text": "Tum testler icin yeterli kanit toplanmis mi?", "weight": 20},
    {"id": "gc-005", "text": "Bulgularin kok nedeni (5-Why RCA) analiz edilmis mi?", "weight": 15},
    {"id": "gc-006", "text": "Bulgu derecelendirmesi KERD metodolojisine uygun mu?", "weight": 10},
    {"id": "gc-007", "text": "Rapor taslagi gozden gecirilmis mi?", "weight": 10},
    {"id": "gc-008", "text": "Musteri yaniti alinmis ve dokumante edilmis mi?", "weight": 5}
  ]'::jsonb
),
(
  'a1b2c3d4-0002-4000-8000-000000000002',
  'BT Denetimi Ozel Kontrol Listesi',
  'Bilgi teknolojileri denetimlerine ozel kalite kontrol kriterleri',
  '[
    {"id": "it-001", "text": "Sistem envanter listesi dogrulanmis mi?", "weight": 10},
    {"id": "it-002", "text": "Erisim kontrol matrisi test edilmis mi?", "weight": 15},
    {"id": "it-003", "text": "Zafiyet taramasi sonuclari degerlendirilmis mi?", "weight": 15},
    {"id": "it-004", "text": "Log analizi yapilmis mi?", "weight": 15},
    {"id": "it-005", "text": "Yedekleme ve felaket kurtarma plani test edilmis mi?", "weight": 15},
    {"id": "it-006", "text": "Degisiklik yonetimi sureci incelenmis mi?", "weight": 10},
    {"id": "it-007", "text": "Veri siniflandirma politikasi uyumu kontrol edilmis mi?", "weight": 10},
    {"id": "it-008", "text": "Ucuncu taraf bagimliliklari degerlendirilmis mi?", "weight": 10}
  ]'::jsonb
),
(
  'a1b2c3d4-0003-4000-8000-000000000003',
  'Saha Calismasi Sonrasi Degerlendirme',
  'Saha calismasi tamamlandiktan sonra uygulanacak hizli degerlendirme',
  '[
    {"id": "fw-001", "text": "Tum calismalar imzalanmis mi?", "weight": 20},
    {"id": "fw-002", "text": "Kanit dosyalari tam ve eksiksiz mi?", "weight": 25},
    {"id": "fw-003", "text": "Bulgular musteri ile paylasilmis mi?", "weight": 20},
    {"id": "fw-004", "text": "Aksiyon planlari belirlenmis mi?", "weight": 20},
    {"id": "fw-005", "text": "Zaman kayitlari guncel mi?", "weight": 15}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO qaip_reviews (id, engagement_id, checklist_id, results, total_score, status, notes, completed_at) VALUES
(
  'b2c3d4e5-0001-4000-8000-000000000001',
  '42d72f07-e813-4cff-8218-4a64f7a3baab',
  'a1b2c3d4-0001-4000-8000-000000000001',
  '{"gc-001": "PASS", "gc-002": "PASS", "gc-003": "PASS", "gc-004": "FAIL", "gc-005": "FAIL", "gc-006": "PASS", "gc-007": "PASS", "gc-008": "FAIL"}'::jsonb,
  65,
  'COMPLETED',
  'Kanit toplama ve kok neden analizinde iyilestirme gerekli. Genel olarak kabul edilebilir seviyede ancak kritik eksikler mevcut.',
  now() - interval '3 days'
),
(
  'b2c3d4e5-0002-4000-8000-000000000002',
  '42d72f07-e813-4cff-8218-4a64f7a3baab',
  'a1b2c3d4-0002-4000-8000-000000000002',
  '{"it-001": "PASS", "it-002": "PASS", "it-003": "PASS", "it-004": "PASS", "it-005": "PASS", "it-006": "PASS", "it-007": "PASS", "it-008": "PASS"}'::jsonb,
  100,
  'APPROVED',
  'BT denetimi tum kontrol kriterlerini karsilamaktadir. Mukemmel kalite.',
  now() - interval '1 day'
)
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 12. RAPORLAMA MODULU: SABLONLAR VE ORNEK RAPORLAR
-- Kaynak: 20260218185313_20260218190001_rich_seed_data.sql
-- =============================================================================
/*
  # Zengin Seed Data: 3 Şablon + 3 Gerçekçi Bankacılık Raporu

  ## Özet
  Sentinel demo ortamı için gerçekçi Türk bankacılık verileriyle
  üç farklı tipte rapor ve üç şablon oluşturur.

  ## Yeni Veriler

  ### m6_report_templates (3 şablon)
  1. Şube Denetim Raporu (standard_audit)
  2. Suistimal Soruşturma Raporu (investigation)
  3. Bilgi Notu (info_note)

  ### m6_reports (3 rapor)
  1. "2025 Kadıköy Şube Genel Denetimi" — published, A notu, SHA-256 mühürlü
  2. "Ayşe K. Zimmet Olayı Soruşturma Raporu" — in_review, investigation layout
  3. "Yeni Kredi Skoru Modeli Bilgi Notu" — draft, info_note layout

  ## Notlar
  - Mevcut raporlarla çakışmayı önlemek için ON CONFLICT DO NOTHING kullanılır
  - Iron Vault tetikleyicisi yayınlanmış raporlarda çalışmayacak şekilde
    bypass edilir (seed context)
*/

-- ── Şablonları ekle ───────────────────────────────────────────────────────────
INSERT INTO m6_report_templates (name, description, icon, layout_type, default_sections, tags, estimated_pages)
VALUES
(
  'Şube Denetim Raporu',
  'BDDK uyumlu operasyonel şube denetim raporu. Kasa, kredi, KYC ve idari süreç kontrollerini kapsar.',
  'Building2',
  'standard_audit',
  '[
    {"title": "Yönetici Özeti", "orderIndex": 0},
    {"title": "Gişe ve Operasyon Denetimi", "orderIndex": 1},
    {"title": "Kredi ve Tahsis Kontrolü", "orderIndex": 2},
    {"title": "KYC / AML Değerlendirmesi", "orderIndex": 3},
    {"title": "İdari İşler", "orderIndex": 4},
    {"title": "Bulgular ve Öneriler", "orderIndex": 5}
  ]'::jsonb,
  ARRAY['BDDK Uyumlu', 'Kasa Denetimi', 'Süreç Uyumu'],
  '8-12'
),
(
  'Suistimal Soruşturma Raporu',
  'Zimmet, usulsüzlük ve kötü niyet olayları için yapılandırılmış soruşturma raporu. Hukuki süreç belgelerine uygun format.',
  'AlertTriangle',
  'investigation',
  '[
    {"title": "Olayın Özeti", "orderIndex": 0},
    {"title": "Kanıt ve İfade Tutanakları", "orderIndex": 1},
    {"title": "Mali Analiz", "orderIndex": 2},
    {"title": "Hukuki ve Disiplin Durumu", "orderIndex": 3},
    {"title": "Sonuç ve Öneriler", "orderIndex": 4}
  ]'::jsonb,
  ARRAY['Zimmet Olayları', 'Disiplin Süreci', 'Hukuki Belge'],
  '3-6'
),
(
  'Bilgi Notu',
  'Yönetim kuruluna veya ilgili birimlere iletilmek üzere hazırlanan bilgilendirici not. Kısa, öz ve belgeli format.',
  'Info',
  'info_note',
  '[
    {"title": "Kapsam ve Amaç", "orderIndex": 0},
    {"title": "Temel Bulgular", "orderIndex": 1},
    {"title": "Önerilen Aksiyonlar", "orderIndex": 2}
  ]'::jsonb,
  ARRAY['YK Bilgilendirme', 'Kısa Format'],
  '1-3'
)
ON CONFLICT DO NOTHING;

-- ── RAPOR 1: 2025 Kadıköy Şube Genel Denetimi (published, A notu) ────────────
WITH ins_report AS (
  INSERT INTO m6_reports (
    title, status, layout_type, report_type, risk_level, auditor_name, finding_count,
    theme_config, executive_summary, workflow,
    hash_seal, published_at
  )
  SELECT
    '2025 Kadıköy Şube Genel Denetimi',
    'published',
    'standard_audit',
    'branch_audit',
    'medium',
    'Ahmet Yılmaz, CRMA',
    10,
    '{"paperStyle": "zen_paper", "typography": "merriweather_inter"}'::jsonb,
    '{
      "score": 87.4,
      "grade": "A",
      "assuranceLevel": "Tam Güvence",
      "trend": 3.2,
      "previousGrade": "B+",
      "layoutType": "standard_audit",
      "findingCounts": {"critical": 0, "high": 1, "medium": 3, "low": 4, "observation": 2},
      "briefingNote": "Kadıköy Şubesi, 2025 yılı ikinci yarı denetiminde güçlü bir kontrol ortamı sergilemiştir. Tespit edilen 1 yüksek öncelikli bulgu, yetki matrisi ihlali niteliğinde olup yönetimce 15 gün içinde giderilmesi taahhüt edilmiştir. Genel güvence düzeyi TAM GÜVENCE olarak belirlenmiştir.",
      "sections": {
        "auditOpinion": "<p>Denetim ekibi, GIAS 2024 Standardı 2400 çerçevesinde Kadıköy Şubesi''nin 2025 yılı ikinci çeyreği iç kontrol ortamını değerlendirmiş ve <strong>Tam Güvence</strong> sonucuna ulaşmıştır. Kontrol sistemi tasarım ve uygulama bakımından etkin çalışmaktadır.</p>",
        "criticalRisks": "<p>Denetim kapsamında öne çıkan başlıca risk alanı: <strong>Kredi Onay Yetki Matrisi</strong> — 23 işlemde üst limit aşımı tespit edilmiştir. Potansiyel finansal etki 2,1M TL olarak hesaplanmıştır. İkinci risk alanı KYC belge güncellemesi olup 47 müşteri dosyasında eksiklik mevcuttur.</p>",
        "strategicRecommendations": "<p>Kredi onay matrisinin <strong>30 gün</strong> içinde güncellenmesi, otomatik limit kontrol mekanizmalarının devreye alınması ve KYC yenileme kampanyasının Mart 2026 sonuna kadar tamamlanması önerilmektedir.</p>",
        "managementAction": "<p>Şube Müdürü Kemal Demir, tüm bulguları 10 Ocak 2026 tarihli müzakerede kabul etmiş; aksiyon planlarının <strong>15 Ocak 2026</strong> tarihine kadar sisteme iletileceğini taahhüt etmiştir.</p>"
      },
      "dynamicSections": []
    }'::jsonb,
    '{"reviewerId": null, "approvedBy": "Genel Müdür Yardımcısı", "approvedAt": "2026-01-15T10:00:00Z"}'::jsonb,
    'a3f8c2d1e4b7f6a09e2c5d8b1f4a7e3c6d9b2f5a8e1c4d7b0f3a6e9c2d5b8f1a4e7c0d3b6f9a2e5c8d1b4f7a0e3c6d9b2f5',
    '2026-01-15T10:00:00Z'
  WHERE NOT EXISTS (
    SELECT 1 FROM m6_reports WHERE title = '2025 Kadıköy Şube Genel Denetimi'
  )
  RETURNING id
),
ins_sec1 AS (
  INSERT INTO m6_report_sections (report_id, title, order_index)
  SELECT id, 'Yönetici Özeti', 0 FROM ins_report RETURNING id, report_id
),
ins_sec2 AS (
  INSERT INTO m6_report_sections (report_id, title, order_index)
  SELECT report_id, 'Gişe ve Operasyon Denetimi', 1 FROM ins_sec1 RETURNING id, report_id
),
ins_sec3 AS (
  INSERT INTO m6_report_sections (report_id, title, order_index)
  SELECT report_id, 'Bulgular ve Öneriler', 2 FROM ins_sec2 RETURNING id, report_id
),
ins_b1 AS (
  INSERT INTO m6_report_blocks (section_id, block_type, order_index, content)
  SELECT
    ins_sec1.id,
    'heading',
    0,
    '{"html": "<h2>Yönetici Özeti</h2>", "level": 2}'::jsonb
  FROM ins_sec1 RETURNING id
),
ins_b2 AS (
  INSERT INTO m6_report_blocks (section_id, block_type, order_index, content)
  SELECT
    ins_sec1.id,
    'paragraph',
    1,
    '{"html": "<p>Bu rapor, Kadıköy Şubesi''nin 2025 yılı ikinci çeyrek operasyonel denetimini kapsamaktadır. Denetim; kasa işlemleri, kredi tahsis süreçleri ve müşteri kimlik doğrulama (KYC) kontrolleri üzerinde yoğunlaşmıştır.</p>"}'::jsonb
  FROM ins_sec1 RETURNING id
)
INSERT INTO m6_report_blocks (section_id, block_type, order_index, content)
SELECT
  ins_sec2.id,
  'paragraph',
  0,
  '{"html": "<p>Gişe operasyonları genel itibarıyla prosedürlere uygun yürütülmektedir. Günlük kasa sayım tutanakları %98 oranında eksiksiz düzenlenmekte; çift imza zorunluluğu etkin uygulanmaktadır. Tespit edilen 3 adet düşük öncelikli uyumsuzluk, idari iyileştirme kapsamında değerlendirilmiştir.</p>"}'::jsonb
FROM ins_sec2;

-- ── RAPOR 2: Ayşe K. Zimmet Olayı Soruşturma Raporu ─────────────────────────
WITH ins_inv AS (
  INSERT INTO m6_reports (
    title, status, layout_type, report_type, risk_level, auditor_name, finding_count,
    theme_config, executive_summary, workflow
  )
  SELECT
    'Ayşe K. Zimmet Olayı Soruşturma Raporu',
    'in_review',
    'investigation',
    'investigation',
    'critical',
    'Müfettiş Canan Yıldırım',
    5,
    '{"paperStyle": "zen_paper", "typography": "merriweather_inter"}'::jsonb,
    '{
      "score": 0,
      "grade": "N/A",
      "assuranceLevel": "",
      "trend": 0,
      "previousGrade": "",
      "layoutType": "investigation",
      "findingCounts": {"critical": 3, "high": 2, "medium": 0, "low": 0, "observation": 0},
      "briefingNote": "Kadıköy Şubesi gişe yetkilisi Ayşe K. hakkında 15 Kasım 2025 tarihinde başlatılan zimmet soruşturması kapsamında toplam 450.000 TL tutarında usulsüz işlem tespit edilmiştir.",
      "dynamicMetrics": {
        "maliBoyu": "450.000 TL",
        "olayTarihi": "15 Kasım 2025",
        "ilgiliBirim": "Kadıköy Şubesi — Gişe"
      },
      "sections": {
        "auditOpinion": "",
        "criticalRisks": "",
        "strategicRecommendations": "",
        "managementAction": ""
      },
      "dynamicSections": [
        {
          "id": "inv-ozet",
          "title": "Olayın Özeti",
          "content": "<p>15 Kasım 2025 tarihinde Kadıköy Şubesi gişe yetkilisi Ayşe K., sisteme kayıt edilmeden nakit çekim işlemi gerçekleştirirken iç gözetim kamerası tarafından tespit edilmiştir. Anında başlatılan incelemede, Mayıs–Kasım 2025 dönemine ait 78 sahte işlem kaydı bulunmuş; toplam zimmet tutarı <strong>450.000 TL</strong> olarak belirlenmiştir.</p>"
        },
        {
          "id": "inv-kanitlar",
          "title": "Tespit Edilen Kanıtlar",
          "content": "<p>Soruşturmada aşağıdaki kanıtlar elde edilmiştir:</p><ol><li>CCTV kayıtları (15 Kasım 2025, saat 14:32)</li><li>Core banking sistemi işlem logları — 78 adet sahte çekim</li><li>Ayşe K. ile üst amirlerin imzalı ifade tutanakları</li><li>Banka dışı hesapların MASAK bildirimine konu finansal hareketleri</li></ol>"
        },
        {
          "id": "inv-hukuk",
          "title": "Hukuki ve Disiplin Durumu",
          "content": "<p>Banka hukuk birimi 17 Kasım 2025 tarihinde <strong>TCK 247. Madde (Zimmet)</strong> kapsamında suç duyurusunda bulunmuştur. Çalışan, 16 Kasım 2025 itibarıyla görevden uzaklaştırılmıştır. İstanbul Cumhuriyet Başsavcılığı soruşturma başlatmış olup ilk duruşma tarihi beklenmektedir.</p>"
        }
      ]
    }'::jsonb,
    '{"reviewerId": "mufettis-canan", "comments": "Soruşturma tamamlanmak üzere; hukuki süreç devam ediyor."}'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM m6_reports WHERE title = 'Ayşe K. Zimmet Olayı Soruşturma Raporu'
  )
  RETURNING id
),
ins_inv_sec1 AS (
  INSERT INTO m6_report_sections (report_id, title, order_index)
  SELECT id, 'Olayın Özeti', 0 FROM ins_inv RETURNING id, report_id
),
ins_inv_sec2 AS (
  INSERT INTO m6_report_sections (report_id, title, order_index)
  SELECT report_id, 'Kanıt ve İfade Tutanakları', 1 FROM ins_inv_sec1 RETURNING id
),
ins_inv_sec3 AS (
  INSERT INTO m6_report_sections (report_id, title, order_index)
  SELECT report_id, 'Hukuki ve Disiplin Durumu', 2 FROM ins_inv_sec1 RETURNING id
)
INSERT INTO m6_report_blocks (section_id, block_type, order_index, content)
SELECT
  ins_inv_sec1.id,
  'paragraph',
  0,
  '{"html": "<p>15 Kasım 2025 tarihinde Kadıköy Şubesi gişe yetkilisi Ayşe K. hakkında zimmet soruşturması başlatılmıştır. Ön inceleme 450.000 TL tutarında usulsüz işlem tespit etmiştir.</p>"}'::jsonb
FROM ins_inv_sec1;

-- ── RAPOR 3: Yeni Kredi Skoru Modeli Bilgi Notu ──────────────────────────────
WITH ins_info AS (
  INSERT INTO m6_reports (
    title, status, layout_type, report_type, risk_level, auditor_name, finding_count,
    theme_config, executive_summary, workflow
  )
  SELECT
    'Yeni Kredi Skoru Modeli — Bilgi Notu',
    'draft',
    'info_note',
    'executive',
    'low',
    'Baş Denetçi Fatih Çelik',
    0,
    '{"paperStyle": "zen_paper", "typography": "merriweather_inter"}'::jsonb,
    '{
      "score": 0,
      "grade": "N/A",
      "assuranceLevel": "",
      "trend": 0,
      "previousGrade": "",
      "layoutType": "info_note",
      "findingCounts": {"critical": 0, "high": 0, "medium": 0, "low": 0, "observation": 0},
      "briefingNote": "Banka Teknoloji Geliştirme Birimi tarafından geliştirilen yapay zeka destekli yeni kredi skoru modeline ilişkin iç denetim görüşü.",
      "sections": {
        "auditOpinion": "",
        "criticalRisks": "",
        "strategicRecommendations": "",
        "managementAction": ""
      },
      "dynamicSections": [
        {
          "id": "info-kapsam",
          "title": "Kapsam ve Amaç",
          "content": "<p>Bu bilgi notu, Banka Teknoloji Geliştirme Birimi''nin Ocak 2026''da canlıya aldığı <strong>AI destekli kredi skoru modeli (KSM-v4)</strong> hakkında İç Denetim Biriminin görüşlerini içermektedir. Not, YK Risk Komitesi''nin 25 Şubat 2026 toplantısına sunulmak üzere hazırlanmıştır.</p>"
        },
        {
          "id": "info-bulgular",
          "title": "Temel Tespitler",
          "content": "<p>Modelin teknik denetimi sonucunda şu tespitler yapılmıştır:</p><ol><li><strong>Veri Önyargısı Riski:</strong> Eğitim veri seti 2019–2022 dönemini kapsamakta; pandemi dönemi anomalileri modeli etkileyebilir.</li><li><strong>Açıklanabilirlik:</strong> Model kararları BDDK madde 20 kapsamında müşterilere yeterince açıklanmamaktadır.</li><li><strong>Geri Test Sonuçları:</strong> Son 6 aylık geri testte %91 doğruluk oranı elde edilmiş; sektör ortalaması %88''dir.</li></ol>"
        },
        {
          "id": "info-oneriler",
          "title": "Önerilen Aksiyonlar",
          "content": "<p>İç Denetim aşağıdaki aksiyonları önerir:</p><ol><li>2023–2025 verilerini kapsayan yeniden eğitim (Re-training) — <strong>Mart 2026</strong> hedefi.</li><li>Müşteri bilgilendirme metninin BDDK uyumlu hale getirilmesi — <strong>Şubat 2026</strong> hedefi.</li><li>Aylık model performans raporunun Denetim Komitesi''ne sunulması.</li></ol>"
        }
      ]
    }'::jsonb,
    '{}'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM m6_reports WHERE title = 'Yeni Kredi Skoru Modeli — Bilgi Notu'
  )
  RETURNING id
),
ins_info_sec AS (
  INSERT INTO m6_report_sections (report_id, title, order_index)
  SELECT id, 'Kapsam ve Amaç', 0 FROM ins_info RETURNING id, report_id
)
INSERT INTO m6_report_blocks (section_id, block_type, order_index, content)
SELECT
  ins_info_sec.id,
  'paragraph',
  0,
  '{"html": "<p>Bu belge bilgi amaçlıdır. AI destekli kredi skoru modeline ilişkin iç denetim görüşü içermektedir.</p>"}'::jsonb
FROM ins_info_sec;


-- =============================================================================
-- 13. CPE KAYITLARI VE YILLIK HEDEFLER
-- Kaynak: 20260219031125_create_academy_cpe_and_certificates.sql
-- =============================================================================
INSERT INTO user_cpe_records (user_id, title, provider, credit_hours, status, date_earned, notes)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'IIA Global Internal Audit Conference 2025', 'IIA', 16, 'approved', '2025-05-15', 'Annual conference — attended all sessions'),
  ('00000000-0000-0000-0000-000000000001', 'CISA Renewal Training — IT Audit', 'ISACA', 8, 'approved', '2025-03-10', NULL),
  ('00000000-0000-0000-0000-000000000001', 'AML & Financial Crime Webinar Series', 'ACAMS', 4, 'approved', '2025-07-22', 'Online, 4-part series'),
  ('00000000-0000-0000-0000-000000000001', 'Data Analytics for Auditors — LinkedIn Learning', 'LinkedIn Learning', 6, 'pending', '2025-09-01', 'Certificate attached'),
  ('00000000-0000-0000-0000-000000000001', 'SOX ICFR Refresher', 'AICPA', 3, 'approved', '2025-10-05', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO cpe_annual_goals (user_id, year, goal_hours)
VALUES ('00000000-0000-0000-0000-000000000001', 2025, 40)
ON CONFLICT (user_id, year) DO NOTHING;


-- =============================================================================
-- 14. XP DEFTERLERI - TEMEL DEMO GIRISLERI
-- Kaynak: 20260219032705_create_xp_ledger_and_gamification.sql
-- =============================================================================
-- 3. Seed demo XP entries for demo user
-- ============================================================
INSERT INTO xp_ledger (user_id, amount, source_type, description, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 150, 'FINDING',     'Critical IT Finding logged — Siber Güvenlik',           now() - interval '14 days'),
  ('00000000-0000-0000-0000-000000000001', 100, 'FINDING',     'High risk finding logged — AML Kontrol Eksikliği',      now() - interval '12 days'),
  ('00000000-0000-0000-0000-000000000001', 150, 'WORKPAPER',   'Workpaper sign-off completed — QAIP Score: 96%',        now() - interval '10 days'),
  ('00000000-0000-0000-0000-000000000001', 1000,'CERTIFICATE', 'CISA Sertifikası başarıyla tamamlandı',                 now() - interval '8 days'),
  ('00000000-0000-0000-0000-000000000001', 50,  'FINDING',     'Medium risk finding — Kredi Riski Süreci',              now() - interval '6 days'),
  ('00000000-0000-0000-0000-000000000001', 100, 'WORKPAPER',   'Workpaper sign-off completed — QAIP Score: 82%',        now() - interval '4 days'),
  ('00000000-0000-0000-0000-000000000001', 200, 'KUDOS',       'Kudos alındı: Olağanüstü Analitik Çalışma (+200 XP)',   now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000001', 100, 'EXAM',        'Akademi Sınavı geçildi — İç Denetim Temelleri (%88)',   now() - interval '1 day')
ON CONFLICT DO NOTHING;

-- Update demo user profile totals to match seed data
UPDATE auditor_profiles
SET
  current_xp    = 1850,
  current_level = 2
WHERE user_id = '00000000-0000-0000-0000-000000000001';


-- =============================================================================
-- 15. XP DEFTERLERI - GOZLEM VE MENTORLUUK GIRISLERI
-- Kaynak: 20260219033712_expand_xp_ledger_observation_mentorship.sql
-- =============================================================================
-- 3.  Seed demo entries for the new source types
-- ============================================================

INSERT INTO xp_ledger (user_id, amount, source_type, description, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    500,
    'OBSERVATION',
    'Value Added: High Impact Observation — Kredi Süreci Optimizasyonu',
    now() - interval '3 days'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    200,
    'OBSERVATION',
    'Value Added: Medium Impact Observation — AML Kontrol Önerisi',
    now() - interval '5 days'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    250,
    'MENTORSHIP',
    'Mentorship Bonus for Engagement ENG-2025-041',
    now() - interval '7 days'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    500,
    'MENTORSHIP',
    'Leadership Bonus: Your mentee leveled up!',
    now() - interval '9 days'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    150,
    'TRAINING_GIVEN',
    'Training Delivered: Denetim Metodolojisi Workshop',
    now() - interval '11 days'
  )
ON CONFLICT DO NOTHING;


-- =============================================================================
-- 16. NABIZ KONTROLU DEMO YANITLERI
-- Kaynak: 20260219042516_create_pulse_checks_sentiment_engine.sql
-- =============================================================================
-- Seed anonymised demo data for TeamPulseWidget visualisation
INSERT INTO pulse_responses (user_id, energy_level, stress_factor, notes, week_key, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 4, 'NORMAL', null,                              '2026-W07', now() - interval '8 days'),
  ('00000000-0000-0000-0000-000000000002', 2, 'HIGH',   'Waiting on PBC documents from treasury dept.', '2026-W07', now() - interval '8 days'),
  ('00000000-0000-0000-0000-000000000003', 3, 'NORMAL', null,                              '2026-W07', now() - interval '8 days'),
  ('00000000-0000-0000-0000-000000000004', 1, 'HIGH',   'Deadline pressure — two audits running in parallel.', '2026-W07', now() - interval '8 days'),
  ('00000000-0000-0000-0000-000000000005', 5, 'LOW',    null,                              '2026-W07', now() - interval '8 days'),
  ('00000000-0000-0000-0000-000000000001', 3, 'NORMAL', null,                              '2026-W08', now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000002', 2, 'HIGH',   'Tool access still pending from IT.',            '2026-W08', now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000003', 4, 'LOW',    null,                              '2026-W08', now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000004', 2, 'HIGH',   'Conflicting audit schedules.', '2026-W08', now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000005', 5, 'LOW',    null,                              '2026-W08', now() - interval '2 days')
ON CONFLICT (user_id, week_key) DO NOTHING;


-- =============================================================================
-- 17. AKSIYON KAMPANYALARI VE DEMO AKSIYONLAR
-- Kaynak: 20260219091340_20260225000000_create_action_management.sql
-- =============================================================================
-- 10. SEED — Demo data (campaigns + actions mapped to existing findings)
-- =============================================================================

DO $$
DECLARE
  v_campaign_1  uuid := gen_random_uuid();
  v_campaign_2  uuid := gen_random_uuid();
  v_campaign_3  uuid := gen_random_uuid();
  v_finding_id  uuid;
BEGIN
  -- Campaigns
  INSERT INTO master_action_campaigns (id, title, description, root_cause, status)
  VALUES
    (v_campaign_1,
     'Q1 2026 BDDK Compliance Drive',
     'Remediation of all findings from the BDDK annual examination',
     'Insufficient automated controls across core banking modules',
     'active'),
    (v_campaign_2,
     'IAM Hardening Campaign',
     'Group remediation for all identity and access management findings',
     'Legacy AD permissions model without RBAC enforcement',
     'active'),
    (v_campaign_3,
     'Credit Risk Data Quality Initiative',
     'Ensuring integrity of risk scoring inputs per BRSA SR 2024-01',
     'Manual data entry without validation gates',
     'active');

  -- Actions seeded only if findings exist
  SELECT id INTO v_finding_id FROM audit_findings LIMIT 1;

  IF v_finding_id IS NOT NULL THEN
    INSERT INTO actions (
      finding_id, original_due_date, current_due_date, status,
      finding_snapshot, regulatory_tags, escalation_level, campaign_id
    ) VALUES
      -- BDDK Red-Zone: >365 days overdue — blocked from extension
      (v_finding_id,
       CURRENT_DATE - 400, CURRENT_DATE - 400, 'pending',
       '{"title":"Legacy password policy not enforced","severity":"CRITICAL","risk_rating":"HIGH","gias_category":"IT Governance","description":"Domain controllers allow passwords older than 90 days"}'::jsonb,
       ARRAY['BDDK','BRSA'], 2, v_campaign_1),

      -- TIER_3_CRITICAL: >90 days overdue — evidence submitted
      (v_finding_id,
       CURRENT_DATE - 120, CURRENT_DATE - 30, 'evidence_submitted',
       '{"title":"Vendor contract review gap","severity":"HIGH","risk_rating":"HIGH","gias_category":"Procurement","description":"47 vendor contracts have passed their review dates"}'::jsonb,
       ARRAY['BDDK'], 1, v_campaign_1),

      -- TIER_1_NORMAL: not yet overdue — healthy action
      (v_finding_id,
       CURRENT_DATE + 30, CURRENT_DATE + 30, 'pending',
       '{"title":"Credit model back-testing deficiency","severity":"MEDIUM","risk_rating":"MEDIUM","gias_category":"Credit Risk","description":"IFRS 9 back-testing frequency is below regulatory minimum"}'::jsonb,
       ARRAY[]::text[], 0, v_campaign_3),

      -- TIER_2_HIGH: 60 days overdue — risk accepted
      (v_finding_id,
       CURRENT_DATE - 60, CURRENT_DATE - 60, 'risk_accepted',
       '{"title":"SWIFT message reconciliation gap","severity":"HIGH","risk_rating":"HIGH","gias_category":"Treasury","description":"Manual T+1 reconciliation introduces intraday risk window"}'::jsonb,
       ARRAY['BDDK','BRSA'], 0, v_campaign_2);
  END IF;

END $$;

