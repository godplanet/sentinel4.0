-- =============================================================================
-- SENTINEL GRC v3.0 — MERKEZI SEED DOSYASI
-- =============================================================================
-- Bu dosya tum demo/test verilerini icermektedir.
-- Migration dosyalarinda yalnizca DDL (tablo, fonksiyon, RLS) kalmalidir.
-- Kaynak migration dosyalari yorum satirlarinda belirtilmistir.
--
-- Kural: system_definitions, system_parameters, risk_definitions_bddk
-- gercek sistem sozlukleri oldugu icin migration'da birakildi.
--
-- SEED YUKLEME (terminal):
--   Tam sifirlama + migration + seed:  npx supabase db reset
--   Sadece seed (DB zaten var):        npx supabase db seed
-- =============================================================================

-- pgcrypto uzaktan Supabase ortamında extensions şemasında kurulu

-- =============================================================================
-- 0. KÖK VERİLER (ROOT ENTITIES)
-- Sentinel Katılım Bankacılığı Konseptli Tam Veri Seti
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 0.1. TENANT
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.tenants (id, name, type, environment)
VALUES ('11111111-1111-1111-1111-111111111111', 'Sentinel Katılım Bankası A.Ş.', 'HEAD_OFFICE', 'PROD')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 0.2. AUTH USERS (Supabase Auth - sisteme giriş yapabilmek için)
-- Tüm şifreler: 123456
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000001','authenticated','authenticated','cae@sentinelbank.com.tr',        extensions.crypt('123456',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"full_name":"Dr. Hasan Aksoy"}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000002','authenticated','authenticated','vpcae@sentinelbank.com.tr',      extensions.crypt('123456',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"full_name":"Fatma Erdem"}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000003','authenticated','authenticated','chief.auditor@sentinelbank.com.tr',extensions.crypt('123456',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"full_name":"Murat Şen"}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000004','authenticated','authenticated','auditor@sentinelbank.com.tr',    extensions.crypt('123456',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"full_name":"Elif Yıldız"}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000005','authenticated','authenticated','junior@sentinelbank.com.tr',     extensions.crypt('123456',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"full_name":"Canan Arslan"}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000006','authenticated','authenticated','shariah@sentinelbank.com.tr',    extensions.crypt('123456',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"full_name":"Prof. Dr. Yusuf Aydın"}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000007','authenticated','authenticated','dk.baskan@sentinelbank.com.tr',  extensions.crypt('123456',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"full_name":"Kemal Öztürk"}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000008','authenticated','authenticated','yk.uye@sentinelbank.com.tr',    extensions.crypt('123456',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"full_name":"Ayşe Demir"}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000009','authenticated','authenticated','gm@sentinelbank.com.tr',        extensions.crypt('123456',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"full_name":"Mehmet Karaca"}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000010','authenticated','authenticated','gmy@sentinelbank.com.tr',       extensions.crypt('123456',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"full_name":"Ali Rıza Koç"}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000011','authenticated','authenticated','sube.mudur@sentinelbank.com.tr', extensions.crypt('123456',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"full_name":"Burak Yılmaz"}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000012','authenticated','authenticated','it.mudur@sentinelbank.com.tr',  extensions.crypt('123456',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"full_name":"Zeynep Kılıç"}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000013','authenticated','authenticated','fon.mudur@sentinelbank.com.tr', extensions.crypt('123456',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"full_name":"Hüseyin Çelik"}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000014','authenticated','authenticated','vendor@techpartner.com.tr',     extensions.crypt('123456',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{"full_name":"Onur Tekin"}',now(),now())
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 0.3. USER PROFILES
-- Roller: admin, auditor, auditee, guest, executive, cae, gmy, vendor
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.user_profiles (id, tenant_id, full_name, email, role, department, title) VALUES
  ('00000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','Dr. Hasan Aksoy',       'cae@sentinelbank.com.tr',        'cae',       'Teftiş Kurulu',                      'Teftiş Kurulu Başkanı (CAE)'),
  ('00000000-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','Fatma Erdem',            'vpcae@sentinelbank.com.tr',      'auditor',   'Teftiş Kurulu',                      'Teftiş Kurulu Başkan Yardımcısı'),
  ('00000000-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111','Murat Şen',             'chief.auditor@sentinelbank.com.tr','auditor',  'Teftiş Kurulu',                      'Baş Müfettiş'),
  ('00000000-0000-0000-0000-000000000004','11111111-1111-1111-1111-111111111111','Elif Yıldız',            'auditor@sentinelbank.com.tr',    'auditor',   'Teftiş Kurulu — BT Denetimi',        'Müfettiş'),
  ('00000000-0000-0000-0000-000000000005','11111111-1111-1111-1111-111111111111','Canan Arslan',           'junior@sentinelbank.com.tr',     'auditor',   'Teftiş Kurulu',                      'Müfettiş Yardımcısı'),
  ('00000000-0000-0000-0000-000000000006','11111111-1111-1111-1111-111111111111','Prof. Dr. Yusuf Aydın',  'shariah@sentinelbank.com.tr',    'executive', 'Danışma Komitesi (Şeri Kurul)',       'Danışma Komitesi Üyesi'),
  ('00000000-0000-0000-0000-000000000007','11111111-1111-1111-1111-111111111111','Kemal Öztürk',           'dk.baskan@sentinelbank.com.tr',  'executive', 'Denetim Komitesi',                    'Denetim Komitesi Başkanı'),
  ('00000000-0000-0000-0000-000000000008','11111111-1111-1111-1111-111111111111','Ayşe Demir',             'yk.uye@sentinelbank.com.tr',     'executive', 'Yönetim Kurulu',                      'Yönetim Kurulu Üyesi'),
  ('00000000-0000-0000-0000-000000000009','11111111-1111-1111-1111-111111111111','Mehmet Karaca',          'gm@sentinelbank.com.tr',         'executive', 'Genel Müdürlük',                      'Genel Müdür'),
  ('00000000-0000-0000-0000-000000000010','11111111-1111-1111-1111-111111111111','Ali Rıza Koç',           'gmy@sentinelbank.com.tr',        'gmy',       'Genel Müdür Yardımcılığı',            'GMY — Kredi ve Operasyon'),
  ('00000000-0000-0000-0000-000000000011','11111111-1111-1111-1111-111111111111','Burak Yılmaz',           'sube.mudur@sentinelbank.com.tr', 'auditee',   'Kadıköy Şubesi',                     'Şube Müdürü'),
  ('00000000-0000-0000-0000-000000000012','11111111-1111-1111-1111-111111111111','Zeynep Kılıç',           'it.mudur@sentinelbank.com.tr',   'auditee',   'Bilgi Teknolojileri Grup Başkanlığı', 'BT Altyapı Müdürü'),
  ('00000000-0000-0000-0000-000000000013','11111111-1111-1111-1111-111111111111','Hüseyin Çelik',          'fon.mudur@sentinelbank.com.tr',  'auditee',   'Katılım Fonları ve Portföy Yönetimi', 'Katılım Fonları Yöneticisi'),
  ('00000000-0000-0000-0000-000000000014','11111111-1111-1111-1111-111111111111','Onur Tekin',             'vendor@techpartner.com.tr',      'vendor',    'Dış Kaynak — TechPartner A.Ş.',       'Proje Yöneticisi')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 0.3b. DENETÇİ PROFİLLERİ (auditor_profiles) — Kaynak tahsisi ve çakışma testi
-- user_profiles ile 1:1 (user_id = user_profiles.id). En az 5 denetçi; listeleme API'si bu tabloyu kullanır.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.auditor_profiles (user_id, tenant_id, title, department, hire_date, cpe_credits, skills_matrix) VALUES
  ('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Teftiş Kurulu Başkanı (CAE)',           'Teftiş Kurulu',              '2020-03-01', 120, '{"leadership":5,"risk":5,"compliance":5}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Teftiş Kurulu Başkan Yardımcısı',        'Teftiş Kurulu',              '2021-06-15', 90,  '{"risk":5,"compliance":4,"finance":4}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Baş Müfettiş',                           'Teftiş Kurulu',              '2019-01-10', 150, '{"it_audit":4,"operational":5,"finance":4}'::jsonb),
  ('00000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'BT Denetçisi (IT Auditor)',              'Teftiş Kurulu — BT Denetimi', '2022-02-01', 75,  '{"it_audit":5,"cybersecurity":4,"compliance":3}'::jsonb),
  ('00000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Finansal Denetçi (Financial Auditor)',    'Teftiş Kurulu',              '2023-04-01', 45,  '{"finance":5,"risk":4,"compliance":4}'::jsonb)
ON CONFLICT (user_id) DO UPDATE SET
  title = EXCLUDED.title,
  department = EXCLUDED.department,
  updated_at = now();

-- ─────────────────────────────────────────────────────────────────────────────
-- 0.4. DENETİM EVRENİ (AUDIT ENTITIES) — Ltree Hiyerarşisi
-- entity_type ENUM: HOLDING, BANK, GROUP, UNIT, PROCESS, BRANCH, DEPARTMENT,
--                   HEADQUARTERS, SUBSIDIARY, VENDOR, IT_ASSET
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.audit_entities (id, tenant_id, name, type, risk_score, velocity_multiplier, path, metadata) VALUES
  -- Kök
  ('e0000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','Sentinel Katılım Bankası A.Ş.','HOLDING',55,1.0,'hq',
   '{"findings_summary":{"bordo":0,"kizil":1,"turuncu":2,"sari":3,"gozlem":2,"shariah_systemic":0},"weight":1.0}'::jsonb),

  -- Genel Müdürlük Birimleri
  ('e0000000-0000-0000-0000-000000000010','11111111-1111-1111-1111-111111111111','Risk Yönetimi Müdürlüğü',       'DEPARTMENT',62,1.1,'hq.risk_yonetimi',
   '{"findings_summary":{"bordo":0,"kizil":0,"turuncu":1,"sari":2,"gozlem":1,"shariah_systemic":0},"weight":1.1}'::jsonb),
  ('e0000000-0000-0000-0000-000000000011','11111111-1111-1111-1111-111111111111','Uyum ve MASAK Birimi',           'DEPARTMENT',70,1.2,'hq.uyum_masak',
   '{"findings_summary":{"bordo":0,"kizil":1,"turuncu":1,"sari":1,"gozlem":0,"shariah_systemic":0},"weight":1.2}'::jsonb),
  ('e0000000-0000-0000-0000-000000000012','11111111-1111-1111-1111-111111111111','Hazine Müdürlüğü',              'DEPARTMENT',58,1.0,'hq.hazine',
   '{"findings_summary":{"bordo":0,"kizil":0,"turuncu":1,"sari":1,"gozlem":2,"shariah_systemic":0},"weight":1.0}'::jsonb),
  ('e0000000-0000-0000-0000-000000000013','11111111-1111-1111-1111-111111111111','Kredi Tahsis Müdürlüğü',        'DEPARTMENT',72,1.1,'hq.kredi_tahsis',
   '{"findings_summary":{"bordo":0,"kizil":1,"turuncu":1,"sari":2,"gozlem":1,"shariah_systemic":0},"weight":1.1}'::jsonb),

  -- Katılım Esaslı Ürün/Süreçler
  ('e0000000-0000-0000-0000-000000000020','11111111-1111-1111-1111-111111111111','Murabaha Süreci',               'PROCESS',65,1.0,'hq.katilim.murabaha',
   '{"findings_summary":{"bordo":0,"kizil":0,"turuncu":1,"sari":1,"gozlem":1,"shariah_systemic":0},"weight":1.0}'::jsonb),
  ('e0000000-0000-0000-0000-000000000021','11111111-1111-1111-1111-111111111111','Müşaraka ve Mudaraba',           'PROCESS',60,1.0,'hq.katilim.musaraka_mudaraba',
   '{"findings_summary":{"bordo":0,"kizil":0,"turuncu":0,"sari":2,"gozlem":1,"shariah_systemic":0},"weight":1.0}'::jsonb),
  ('e0000000-0000-0000-0000-000000000022','11111111-1111-1111-1111-111111111111','Teverruk İşlemleri',             'PROCESS',78,1.3,'hq.katilim.teverruk',
   '{"findings_summary":{"bordo":0,"kizil":1,"turuncu":1,"sari":0,"gozlem":0,"shariah_systemic":0},"weight":1.3}'::jsonb),
  ('e0000000-0000-0000-0000-000000000023','11111111-1111-1111-1111-111111111111','Sukuk İhracı',                   'PROCESS',55,1.0,'hq.katilim.sukuk',
   '{"findings_summary":{"bordo":0,"kizil":0,"turuncu":0,"sari":1,"gozlem":2,"shariah_systemic":0},"weight":1.0}'::jsonb),
  ('e0000000-0000-0000-0000-000000000024','11111111-1111-1111-1111-111111111111','Katılma Hesapları (Havuz Yönetimi)','PROCESS',68,1.1,'hq.katilim.havuz',
   '{"findings_summary":{"bordo":0,"kizil":0,"turuncu":2,"sari":1,"gozlem":0,"shariah_systemic":0},"weight":1.1}'::jsonb),
  ('e0000000-0000-0000-0000-000000000025','11111111-1111-1111-1111-111111111111','Kar/Zarar Dağıtım Süreci',       'PROCESS',74,1.2,'hq.katilim.kar_zarar',
   '{"findings_summary":{"bordo":0,"kizil":1,"turuncu":0,"sari":1,"gozlem":1,"shariah_systemic":0},"weight":1.2}'::jsonb),

  -- BT Varlıkları ve Süreçleri
  ('e0000000-0000-0000-0000-000000000030','11111111-1111-1111-1111-111111111111','Bilgi Teknolojileri Grup Başkanlığı','GROUP',88,1.4,'hq.it',
   '{"findings_summary":{"bordo":1,"kizil":1,"turuncu":1,"sari":0,"gozlem":1,"shariah_systemic":0},"weight":1.4}'::jsonb),
  ('e0000000-0000-0000-0000-000000000031','11111111-1111-1111-1111-111111111111','Core Banking (Temel Bankacılık DB)','IT_ASSET',92,1.5,'hq.it.core_banking',
   '{"findings_summary":{"bordo":1,"kizil":1,"turuncu":0,"sari":0,"gozlem":0,"shariah_systemic":0},"weight":1.5}'::jsonb),
  ('e0000000-0000-0000-0000-000000000032','11111111-1111-1111-1111-111111111111','Mobil Şube API Gateway',          'IT_ASSET',80,1.2,'hq.it.mobil_api',
   '{"findings_summary":{"bordo":0,"kizil":1,"turuncu":0,"sari":1,"gozlem":0,"shariah_systemic":0},"weight":1.2}'::jsonb),
  ('e0000000-0000-0000-0000-000000000033','11111111-1111-1111-1111-111111111111','Veri Merkezi (Disaster Recovery)', 'IT_ASSET',75,1.1,'hq.it.dr_center',
   '{"findings_summary":{"bordo":0,"kizil":0,"turuncu":1,"sari":1,"gozlem":1,"shariah_systemic":0},"weight":1.1}'::jsonb),
  ('e0000000-0000-0000-0000-000000000034','11111111-1111-1111-1111-111111111111','SWIFT Altyapısı',                'IT_ASSET',85,1.3,'hq.it.swift',
   '{"findings_summary":{"bordo":0,"kizil":1,"turuncu":0,"sari":0,"gozlem":1,"shariah_systemic":0},"weight":1.3}'::jsonb),

  -- Şubeler
  ('e0000000-0000-0000-0000-000000000040','11111111-1111-1111-1111-111111111111','Kadıköy Şubesi',                 'BRANCH',67,1.0,'hq.sube.kadikoy',
   '{"findings_summary":{"bordo":0,"kizil":1,"turuncu":1,"sari":1,"gozlem":1,"shariah_systemic":0},"weight":1.0}'::jsonb),
  ('e0000000-0000-0000-0000-000000000041','11111111-1111-1111-1111-111111111111','Şişli Şubesi',                   'BRANCH',52,1.0,'hq.sube.sisli',
   '{"findings_summary":{"bordo":0,"kizil":0,"turuncu":0,"sari":2,"gozlem":2,"shariah_systemic":0},"weight":1.0}'::jsonb),

  -- İştirakler
  ('e0000000-0000-0000-0000-000000000050','11111111-1111-1111-1111-111111111111','Sentinel Katılım Portföy A.Ş. (İştirak)','SUBSIDIARY',48,1.0,'hq.istirak.portfoy',
   '{"findings_summary":{"bordo":0,"kizil":0,"turuncu":0,"sari":1,"gozlem":3,"shariah_systemic":0},"weight":1.0}'::jsonb),
  ('e0000000-0000-0000-0000-000000000051','11111111-1111-1111-1111-111111111111','Sentinel Katılım Teknoloji A.Ş. (İştirak)','SUBSIDIARY',56,1.0,'hq.istirak.teknoloji',
   '{"findings_summary":{"bordo":0,"kizil":0,"turuncu":1,"sari":1,"gozlem":1,"shariah_systemic":0},"weight":1.0}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 0.5. DENETİM PLANI
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.audit_plans (id, tenant_id, title, period_start, period_end, status, created_by, approved_at, approved_by)
VALUES (
  'd0000000-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  '2026 Yılı Genel Denetim Planı',
  '2026-01-01', '2026-12-31', 'APPROVED',
  '00000000-0000-0000-0000-000000000001',
  '2025-12-20'::timestamptz,
  '00000000-0000-0000-0000-000000000007'
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 0.6. DENETİM GÖREVLERİ (4 Engagement)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.audit_engagements (id, tenant_id, plan_id, entity_id, title, status, audit_type, start_date, end_date, assigned_auditor_id, risk_snapshot_score, estimated_hours, actual_hours) VALUES
  -- ENG-1: Katılım Fonları Kar Dağıtım Denetimi
  ('42d72f07-e813-4cff-8218-4a64f7a3baab',
   '11111111-1111-1111-1111-111111111111','d0000000-0000-0000-0000-000000000001',
   'e0000000-0000-0000-0000-000000000025',
   'Katılım Fonları Kar Dağıtım Denetimi','IN_PROGRESS','COMPREHENSIVE',
   '2026-02-01','2026-04-15',
   '00000000-0000-0000-0000-000000000003', 74, 320, 185),

  -- ENG-2: Kritik BT Sistemleri Sızma Testi ve Erişim Denetimi
  ('42d72f07-e813-4cff-8218-4a64f7a3baac',
   '11111111-1111-1111-1111-111111111111','d0000000-0000-0000-0000-000000000001',
   'e0000000-0000-0000-0000-000000000031',
   'Kritik BT Sistemleri Sızma Testi ve Erişim Denetimi','IN_PROGRESS','TARGETED',
   '2026-01-15','2026-03-31',
   '00000000-0000-0000-0000-000000000004', 92, 280, 210),

  -- ENG-3: Kadıköy Şube Operasyon Denetimi
  ('42d72f07-e813-4cff-8218-4a64f7a3baad',
   '11111111-1111-1111-1111-111111111111','d0000000-0000-0000-0000-000000000001',
   'e0000000-0000-0000-0000-000000000040',
   'Kadıköy Şube Operasyon Denetimi','PLANNED','COMPREHENSIVE',
   '2026-04-01','2026-05-15',
   '00000000-0000-0000-0000-000000000003', 67, 200, 0),

  -- ENG-4: Teverruk API Şeri Uyum İncelemesi
  ('42d72f07-e813-4cff-8218-4a64f7a3baae',
   '11111111-1111-1111-1111-111111111111','d0000000-0000-0000-0000-000000000001',
   'e0000000-0000-0000-0000-000000000022',
   'Teverruk API Şeri Uyum İncelemesi','IN_PROGRESS','TARGETED',
   '2026-02-15','2026-04-30',
   '00000000-0000-0000-0000-000000000005', 78, 180, 95)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 0.7. BULGULAR (Findings — 4 çeşitlendirilmiş bulgu)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.audit_findings (id, engagement_id, title, severity, status, state, details, impact_score, likelihood_score, gias_category, financial_impact) VALUES
  -- F-1 (CRITICAL / IT): Core Banking Privilege Escalation
  ('f0000000-0000-0000-0000-000000000001',
   '42d72f07-e813-4cff-8218-4a64f7a3baac',
   'Core Banking DB''de Yetki Genişlemesi (Privilege Escalation)',
   'CRITICAL','FINAL','FINAL',
   '{"condition":"Veritabanı admin yetkisine sahip 3 servis hesabı, uygulama katmanını atlayarak doğrudan prod DB''ye SQL erişimi sağlamaktadır.","criteria":"BDDK Bilgi Sistemleri Yönetmeliği Md. 12 ve CIS Benchmark PostgreSQL 15 — Ayrıcalıklı Hesap Yönetimi","cause":"2024 migrasyon projesi sırasında geçici olarak verilen DBA yetkileri geri alınmamıştır.","consequence":"Yetkisiz veri değişikliği, müşteri bakiye manipülasyonu ve denetim izinin (audit trail) devre dışı bırakılması riski.","recommendation":"1) Servis hesap yetkilerini derhal RBAC modeline geçirin. 2) PAM çözümü ile oturum kaydı başlatın. 3) 30 gün içinde tüm DBA erişimlerini gözden geçirin."}'::jsonb,
   5, 4, 'Teknolojik Risk', 8500000),

  -- F-2 (HIGH / Şeri Risk): Teverruk Zaman Uyumsuzluğu
  ('f0000000-0000-0000-0000-000000000002',
   '42d72f07-e813-4cff-8218-4a64f7a3baae',
   'Teverruk İşlemlerinde Dijital Vekalet Saatleri ile Emtia Alım-Satım Saatleri Arasında Uyumsuzluk',
   'HIGH','FINAL','IN_NEGOTIATION',
   '{"condition":"Teverruk API logları incelendiğinde, 147 işlemde dijital vekaletnamenin emtia alım-satım işleminden sonra zaman damgası aldığı tespit edilmiştir (ortalama 12 dakika gecikme).","criteria":"AAOIFI Şeri Standardı No. 30 — Teverruk İşlemlerinde Kronolojik Sıra Zorunluluğu
ON CONFLICT DO NOTHING;
 Danışma Komitesi 2025/07 sayılı kararı","cause":"API gateway''de kuyruk (queue) mekanizmasının bulut sağlayıcı kaynaklı gecikmesi ve zaman senkronizasyonu eksikliği.","consequence":"Şeri uyumsuzluk riski — işlemlerin fıkhi geçerliliği tartışmaya açıktır. Gelir tanınmasının (revenue recognition) raporlama dışı bırakılması gerekebilir.","recommendation":"1) API gateway''e NTP tabanlı atomik zaman senkronizasyonu ekleyin. 2) İşlem sıralamasını garanti eden idempotent kuyruk mekanizmasına geçin. 3) Danışma Komitesi ile geriye dönük fetva değerlendirmesi yapın."}'::jsonb,
   4, 3, 'Uyum Riski', 3200000),

  -- F-3 (HIGH / Operasyon): Kasa Limit Aşımı
  ('f0000000-0000-0000-0000-000000000003',
   '42d72f07-e813-4cff-8218-4a64f7a3baab',
   'Kadıköy Şubesi Kasa Sayımında Limit Aşımı ve Zeyilname Eksikliği',
   'HIGH','DRAFT','DRAFT',
   '{"condition":"Kadıköy Şubesi kasa sayımında 3 farklı günde BDDK belirlenen kasa limiti olan 2.000.000 TL aşılmış; aşım tutarı toplamda 1.450.000 TL''dir. Limit aşımına ilişkin zeyilname düzenlenmemiştir.","criteria":"BDDK Şube Operasyon Yönetmeliği Md. 18 — Kasa Limiti; İç Yönerge Bölüm 4.3 — Kasa Limit Aşım Prosedürü","cause":"Bankamatik nakit ikmallerinin gecikmesi nedeniyle kasada fazla nakit tutulmuş, şube müdürü zeyilname prosedürünü uygulamamıştır.","consequence":"BDDK idari para cezası riski (150.000-500.000 TL arası); sigorta kapsamı dışı kayıp riski.","recommendation":"1) ATM nakit ikmal takvimini güncelleyin. 2) Kasa limiti otomatik uyarı sistemini devreye alın. 3) Şube personeline prosedür eğitimi verin."}'::jsonb,
   3, 4, 'Operasyonel Risk', 1450000),

  -- F-4 (MEDIUM / Uyum-MASAK): UBO Belge Gecikmesi
  ('f0000000-0000-0000-0000-000000000004',
   '42d72f07-e813-4cff-8218-4a64f7a3baab',
   'Tüzel Müşteri Açılışlarında Gerçek Faydalanıcı (UBO) Belgesinin Sisteme Yüklenmesinde Gecikme',
   'MEDIUM','FINAL','REMEDIATED',
   '{"condition":"Son 6 ayda açılan 234 tüzel müşteri hesabının 41 adedinde (%17,5) UBO belgesi müşteri açılışından 15+ iş günü sonra sisteme yüklenmiştir. 8 hesapta belge hâlâ eksiktir.","criteria":"5549 Sayılı MASAK Kanunu Md. 3; MASAK Genel Tebliği Sıra No: 19 — Gerçek Faydalanıcının Tespiti","cause":"Şubelerin UBO formunu fiziksel olarak aldığı ancak dijitalleştirme sürecini geciktirdiği tespit edilmiştir. Merkezi takip mekanizması bulunmamaktadır.","consequence":"MASAK tarafından idari yaptırım riski; regülatör denetimde olumsuz bulgu olasılığı.","recommendation":"1) UBO belgesi sisteme yüklenmeden hesap aktifleştirilmesini engelleyen sistem kısıtlaması ekle. 2) Haftalık eksik belge raporu oluşturup şubelere otomatik hatırlatma gönder."}'::jsonb,
   2, 3, 'Uyum Riski', 0)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 0.7.1. DEMO BAĞIMSIZLIK BEYANLARI (IRON GATE SEED VERİSİ)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.independence_declarations (engagement_id, auditor_id, status, signed_at, ip_address, declaration_text) VALUES
  -- ENG-1 (SIGNED)
  ('42d72f07-e813-4cff-8218-4a64f7a3baab', '00000000-0000-0000-0000-000000000003', 'signed', now() - interval '15 days', '192.168.1.100', 'GIAS 2025 Standart 2.1 uyarınca çıkar çatışmam bulunmamaktadır.'),
  -- ENG-2 (PENDING) -> E2E Test bu engagement için ("Kritik BT Sistemleri Sızma Testi ve Erişim Denetimi" - assigned to Elif Yıldız: 004) çalışacak
  ('42d72f07-e813-4cff-8218-4a64f7a3baac', '00000000-0000-0000-0000-000000000004', 'pending', null, null, null),
  -- ENG-4 (SIGNED)
  ('42d72f07-e813-4cff-8218-4a64f7a3baae', '00000000-0000-0000-0000-000000000005', 'signed', now() - interval '2 days', '192.168.1.104', 'GIAS 2025 Standart 2.1 uyarınca çıkar çatışmam bulunmamaktadır.')
ON CONFLICT (engagement_id, auditor_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 0.8. BULGU GİZLİ KATMANI (Finding Secrets — 5 Why RCA)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.finding_secrets (tenant_id, finding_id, why_1, why_2, why_3, why_4, why_5, root_cause_summary, internal_notes, created_by) VALUES
  ('11111111-1111-1111-1111-111111111111','f0000000-0000-0000-0000-000000000001',
   'Neden 3 servis hesabının hâlâ DBA yetkisi var?','Çünkü 2024 migrasyon projesi sonrası yetki geri alma süreci işletilmemiş.','Çünkü proje kapanış kontrol listesinde yetki gözden geçirme adımı yoktu.','Çünkü değişiklik yönetimi prosedüründe proje sonrası temizlik (decommission) aşaması tanımlı değildi.','Çünkü CAB süreçleri operasyonel değişiklikler için tasarlanmış, proje bazlı geçici yetkileri kapsamıyor.',
   'Kök neden: Proje yaşam döngüsüne entegre edilmemiş yetersiz yetki yönetimi prosedürü.',
   'Müfettiş notu: CyberArk PAM kayıtlarında bu hesaplarla son 6 ayda 347 oturum açıldığı görülmüştür. Acil önlem gereklidir.',
   '00000000-0000-0000-0000-000000000004'),
  ('11111111-1111-1111-1111-111111111111','f0000000-0000-0000-0000-000000000002',
   'Neden vekalet zaman damgası emtia işleminden sonra?','Çünkü API gateway kuyruğunda bulut sağlayıcı kaynaklı gecikme yaşanıyor.','Çünkü NTP senkronizasyonu API katmanında değil yalnızca sunucu seviyesinde yapılıyor.','Çünkü Şeri uyum gereksinimleri sistem mimarisi tasarımında dikkate alınmamış.','Çünkü teknoloji ekibi ile Danışma Komitesi arasında düzenli iletişim mekanizması bulunmuyor.',
   'Kök neden: Şeri gereksinimler ile teknoloji mimarisi arasındaki kopukluk.',
   'Danışma Komitesi üyesi Prof. Aydın ile yapılan görüşmede retroaktif fetvanın mümkün olabileceği ancak bunun 147 işlem için ayrı ayrı değerlendirilmesi gerektiği ifade edilmiştir.',
   '00000000-0000-0000-0000-000000000005')
ON CONFLICT (finding_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 0.9. AKSİYON PLANLARI
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.action_plans (tenant_id, finding_id, title, description, responsible_person, responsible_person_title, responsible_department, target_date, status, priority, progress_percentage, created_by) VALUES
  -- F-1 Aksiyonu: BT Müdürüne
  ('11111111-1111-1111-1111-111111111111','f0000000-0000-0000-0000-000000000001',
   'DBA Yetki Revizyonu ve PAM Entegrasyonu',
   '1) 3 servis hesabının DBA yetkisini 7 gün içinde kaldır. 2) CyberArk PAM ile tüm DB oturumlarını kayıt altına al. 3) Çeyreklik erişim gözden geçirme prosedürünü oluştur.',
   'Zeynep Kılıç','BT Altyapı Müdürü','Bilgi Teknolojileri Grup Başkanlığı',
   '2026-04-15','IN_PROGRESS','CRITICAL',35,
   '00000000-0000-0000-0000-000000000004'),

  -- F-2 Aksiyonu: İş birimine + Danışma Komitesine
  ('11111111-1111-1111-1111-111111111111','f0000000-0000-0000-0000-000000000002',
   'Teverruk API Zaman Senkronizasyonu ve Retroaktif Fetva Süreci',
   '1) API gateway NTP atomik senkronizasyon geliştirmesini tamamla. 2) Danışma Komitesi ile 147 işlem için retroaktif değerlendirme başlat. 3) Şeri uyum test otomasyon kural setini güncelle.',
   'Hüseyin Çelik','Katılım Fonları Yöneticisi','Katılım Fonları ve Portföy Yönetimi',
   '2026-05-30','DRAFT','HIGH',10,
   '00000000-0000-0000-0000-000000000005'),

  -- F-3 Aksiyonu: Şube Müdürüne
  ('11111111-1111-1111-1111-111111111111','f0000000-0000-0000-0000-000000000003',
   'Kasa Limiti Kontrol Mekanizması ve Personel Eğitimi',
   '1) Kasa limiti otomatik uyarı sistemini core banking üzerinde devreye al. 2) ATM nakit ikmal takvimini güncelle. 3) Şube personeline kasa yönetimi eğitimi ver.',
   'Burak Yılmaz','Şube Müdürü','Kadıköy Şubesi',
   '2026-05-01','DRAFT','HIGH',0,
   '00000000-0000-0000-0000-000000000003'),

  -- F-4 Aksiyonu: Uyum birimine
  ('11111111-1111-1111-1111-111111111111','f0000000-0000-0000-0000-000000000004',
   'UBO Belge Yönetimi Sistem Kısıtlaması',
   '1) Hesap aktifleştirilmesi için UBO belgesi zorunlu kontrolü ekle. 2) Haftalık eksik belge raporu oluşturup şubelere otomatik hatırlatma gönder.',
   'Ali Rıza Koç','GMY — Kredi ve Operasyon','Genel Müdür Yardımcılığı',
   '2026-04-30','IN_REVIEW','MEDIUM',20,
   '00000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 0.10. BULGU YORUMLARI
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.finding_comments (tenant_id, finding_id, comment_text, comment_type, author_id, author_role, author_name) VALUES
  ('11111111-1111-1111-1111-111111111111','f0000000-0000-0000-0000-000000000001',
   'Servis hesap yetkilerinin kaldırılması için BT Altyapı Müdürlüğü''ne resmi yazı gönderilmiştir. 7 günlük süre başlamıştır.',
   'DISCUSSION','00000000-0000-0000-0000-000000000004','AUDITOR','Elif Yıldız'),
  ('11111111-1111-1111-1111-111111111111','f0000000-0000-0000-0000-000000000001',
   'Yetkilerin kaldırılması operasyonel bir risk yaratabilir
ON CONFLICT DO NOTHING;
 geçiş planı ile birlikte hareket edilmesini talep ediyoruz.',
   'DISPUTE','00000000-0000-0000-0000-000000000012','AUDITEE','Zeynep Kılıç'),
  ('11111111-1111-1111-1111-111111111111','f0000000-0000-0000-0000-000000000002',
   'Danışma Komitesi toplantısı 15 Mart''a alındı. 147 işlem için ayrı ayrı değerlendirme yapılacak.',
   'CLARIFICATION','00000000-0000-0000-0000-000000000006','AUDIT_MANAGER','Prof. Dr. Yusuf Aydın'),
  ('11111111-1111-1111-1111-111111111111','f0000000-0000-0000-0000-000000000004',
   'Eksik UBO belgelerine ilişkin şubelere 2. hatırlatma yazısı gönderildi.',
   'DISCUSSION','00000000-0000-0000-0000-000000000003','AUDITOR','Murat Şen')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 0.11. BULGU TARİHÇESİ
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.finding_history (tenant_id, finding_id, previous_state, new_state, change_type, change_description, changed_by, changed_by_role) VALUES
  ('11111111-1111-1111-1111-111111111111','f0000000-0000-0000-0000-000000000001','DRAFT','IN_REVIEW','STATE_CHANGE','Bulgu müfettiş tarafından incelemeye gönderildi.','00000000-0000-0000-0000-000000000004','AUDITOR'),
  ('11111111-1111-1111-1111-111111111111','f0000000-0000-0000-0000-000000000001','IN_REVIEW','FINAL','STATE_CHANGE','Bulgu CAE tarafından yayınlandı.','00000000-0000-0000-0000-000000000001','AUDITOR'),
  ('11111111-1111-1111-1111-111111111111','f0000000-0000-0000-0000-000000000002','DRAFT','IN_REVIEW','STATE_CHANGE','Şeri uyum bulgusu incelemeye alındı.','00000000-0000-0000-0000-000000000005','AUDITOR'),
  ('11111111-1111-1111-1111-111111111111','f0000000-0000-0000-0000-000000000002','IN_REVIEW','IN_NEGOTIATION','STATE_CHANGE','Bulgu Danışma Komitesi ile müzakereye açıldı.','00000000-0000-0000-0000-000000000001','AUDITOR'),
  ('11111111-1111-1111-1111-111111111111','f0000000-0000-0000-0000-000000000004','DRAFT','REMEDIATED','STATE_CHANGE','UBO bulgusu takibe alındı.','00000000-0000-0000-0000-000000000003','AUDITOR')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 0.12. BULGU ONAY ZİNCİRİ (Finding Signoffs)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.finding_signoffs (finding_id, tenant_id, role, user_id, user_name, user_title, comments) VALUES
  ('f0000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','PREPARER',
   '00000000-0000-0000-0000-000000000004','Elif Yıldız','Müfettiş','Bulgu hazırlandı ve kanıtlarla desteklendi.'),
  ('f0000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','REVIEWER',
   '00000000-0000-0000-0000-000000000003','Murat Şen','Baş Müfettiş','Gözden geçirildi
ON CONFLICT DO NOTHING;
 şiddet derecesi CRITICAL olarak onaylandı.'),
  ('f0000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','APPROVER',
   '00000000-0000-0000-0000-000000000001','Dr. Hasan Aksoy','Teftiş Kurulu Başkanı (CAE)','Son onay verildi. Yayın için uygun.')
ON CONFLICT (finding_id, role) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 0.13. YÖNETİM KURULU ESKALASYON MASASI
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.escalations (id, tenant_id, finding_id, status, escalation_level, reason, created_by) VALUES
  -- Escalation 1: Core Banking Privilege Escalation (IT) -> YK'ya eskalasyon
  ('c0000000-0000-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111',
   'f0000000-0000-0000-0000-000000000001',
   'ESCALATED_TO_BOARD',
   'BOARD_OF_DIRECTORS',
   'Core Banking sistemindeki DBA yetkileri derhal geri alınmadığı için siber güvenlik riski YK seviyesinde kabul edilemez boyutlara ulaşmıştır.',
   '00000000-0000-0000-0000-000000000001'), -- CAE (Hasan Aksoy)

  -- Escalation 2: Teverruk Uyumsuzluğu (Şeri Risk) -> Denetim Komitesine / Şeri Kurula
  ('c0000000-0000-0000-0000-000000000002',
   '11111111-1111-1111-1111-111111111111',
   'f0000000-0000-0000-0000-000000000002',
   'REVIEWING',
   'AUDIT_COMMITTEE',
   '147 Teverruk işlemindeki API zafiyeti nedeniyle oluşan şeri uyumsuzluk için Danışma Komitesi retroaktif şeri fetva değerlendirmesi yapmalıdır.',
   '00000000-0000-0000-0000-000000000002') -- VP CAE (Fatma Erdem)
ON CONFLICT (finding_id) DO NOTHING;

INSERT INTO public.escalation_logs (escalation_id, tenant_id, actor_id, action_type, notes, created_at) VALUES
  -- Logs for Escalation 1
  ('c0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'CREATED', 'Eskalasyon başlatıldı. Acil müdahale gerektiriyor.', now() - interval '3 days'),
  ('c0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'LEVEL_CHANGED', 'İlgili iş biriminin aksiyon almaması sebebiyle konu Yönetim Kuruluna taşınmıştır.', now() - interval '2 days'),
  ('c0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000007', 'NOTE_ADDED', 'Denetim Komitesi YK sunumu için rapor bekliyor.', now() - interval '1 day'),
  
  -- Logs for Escalation 2
  ('c0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'CREATED', 'Şeri Kurul incelemesi talep edildi.', now() - interval '5 days'),
  ('c0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000006', 'STATUS_CHANGED', 'Danışma Komitesi dosyayı incelemeye aldı.', now() - interval '1 day')
ON CONFLICT DO NOTHING;

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
WHERE NOT EXISTS (SELECT 1 FROM risk_configuration WHERE is_active = true)
ON CONFLICT DO NOTHING;


-- =============================================================================
-- 1b. RISK CONSTITUTION v3 (Anayasa — Birim Karnesi / Not Cetveli / Veto)
-- Kaynak: src/features/risk-constitution/default-constitution.ts ile uyumlu
-- =============================================================================
INSERT INTO public.risk_constitution_v3 (tenant_id, is_active, version, dimensions, impact_matrix, veto_rules, risk_ranges)
SELECT
  '11111111-1111-1111-1111-111111111111'::uuid,
  true,
  '1.0',
  '[]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '[
    {"label":"A","min":80,"max":100,"color":"#22c55e"},
    {"label":"B","min":60,"max":79,"color":"#eab308"},
    {"label":"C","min":40,"max":59,"color":"#f97316"},
    {"label":"D","min":20,"max":39,"color":"#ef4444"},
    {"label":"E","min":0,"max":19,"color":"#991b1b"}
  ]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.risk_constitution_v3 WHERE tenant_id = '11111111-1111-1111-1111-111111111111'::uuid AND is_active = true)
ON CONFLICT DO NOTHING;


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
WHERE NOT EXISTS (SELECT 1 FROM probes WHERE probes.title = v.title)
ON CONFLICT DO NOTHING;


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
-- 4. SEED 20 WORKPAPERS (Akıllı Çalışma Kağıtları grid için tam veri)
-- data: control_ref, tod, toe, sample_size, category, risk_level (grid test için)
-- assigned_auditor_id: grid Auditor sütunu için
-- ============================================================

INSERT INTO workpapers (id, step_id, assigned_auditor_id, status, data, version, approval_status, prepared_at, prepared_by_user_id, prepared_by_name, reviewed_at, reviewed_by_user_id, reviewed_by_name)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'review',   '{"control_ref":"IT-001","tod":"EFFECTIVE","toe":"EFFECTIVE","sample_size":25,"category":"Access Control","risk_level":"HIGH"}'::jsonb, 1, 'reviewed',    now()-interval '5 days', '00000000-0000-0000-0000-000000000004', 'Elif Yıldız',    now()-interval '3 days', '00000000-0000-0000-0000-000000000003', 'Murat Şen'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'review',   '{"control_ref":"IT-002","tod":"EFFECTIVE","toe":"NOT_STARTED","sample_size":40,"category":"Access Control","risk_level":"HIGH"}'::jsonb, 1, 'prepared',    now()-interval '4 days', '00000000-0000-0000-0000-000000000004', 'Elif Yıldız',      null, null, ''),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'review',   '{"control_ref":"IT-003","tod":"EFFECTIVE","toe":"EFFECTIVE","sample_size":30,"category":"Access Control","risk_level":"HIGH"}'::jsonb, 1, 'reviewed',    now()-interval '6 days', '00000000-0000-0000-0000-000000000003', 'Murat Şen',     now()-interval '2 days', '00000000-0000-0000-0000-000000000001', 'Dr. Hasan Aksoy'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'review',   '{"control_ref":"IT-004","tod":"EFFECTIVE","toe":"INEFFECTIVE","sample_size":20,"category":"Access Control","risk_level":"HIGH"}'::jsonb, 1, 'prepared',    now()-interval '3 days', '00000000-0000-0000-0000-000000000004', 'Elif Yıldız',      null, null, ''),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'draft',    '{"control_ref":"IT-005","tod":"NOT_STARTED","toe":"NOT_STARTED","sample_size":15,"category":"Network Security","risk_level":"HIGH"}'::jsonb, 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000005', 'draft',    '{"control_ref":"IT-006","tod":"EFFECTIVE","toe":"NOT_STARTED","sample_size":28,"category":"Network Security","risk_level":"MEDIUM"}'::jsonb, 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000005', 'draft',    '{"control_ref":"IT-007","tod":"NOT_STARTED","toe":"NOT_STARTED","sample_size":12,"category":"Network Security","risk_level":"MEDIUM"}'::jsonb, 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000004', 'review',   '{"control_ref":"IT-008","tod":"EFFECTIVE","toe":"EFFECTIVE","sample_size":18,"category":"Business Continuity","risk_level":"HIGH"}'::jsonb, 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000005', 'draft',    '{"control_ref":"IT-009","tod":"NOT_STARTED","toe":"NOT_STARTED","sample_size":10,"category":"Business Continuity","risk_level":"HIGH"}'::jsonb, 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000005', 'draft',    '{"control_ref":"IT-010","tod":"NOT_STARTED","toe":"NOT_STARTED","sample_size":22,"category":"Physical Security","risk_level":"LOW"}'::jsonb, 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000004', 'draft',    '{"control_ref":"IT-011","tod":"NOT_STARTED","toe":"NOT_STARTED","sample_size":35,"category":"Change Management","risk_level":"HIGH"}'::jsonb, 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000005', 'draft',    '{"control_ref":"IT-012","tod":"NOT_STARTED","toe":"NOT_STARTED","sample_size":20,"category":"Change Management","risk_level":"MEDIUM"}'::jsonb, 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000005', 'draft',    '{"control_ref":"IT-013","tod":"NOT_STARTED","toe":"NOT_STARTED","sample_size":14,"category":"Change Management","risk_level":"MEDIUM"}'::jsonb, 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000004', 'draft',    '{"control_ref":"IT-014","tod":"NOT_STARTED","toe":"NOT_STARTED","sample_size":30,"category":"Data Protection","risk_level":"HIGH"}'::jsonb, 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000005', 'draft',    '{"control_ref":"IT-015","tod":"NOT_STARTED","toe":"NOT_STARTED","sample_size":16,"category":"Data Protection","risk_level":"MEDIUM"}'::jsonb, 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000005', 'draft',    '{"control_ref":"IT-016","tod":"NOT_STARTED","toe":"NOT_STARTED","sample_size":24,"category":"Endpoint Security","risk_level":"LOW"}'::jsonb, 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000005', 'draft',    '{"control_ref":"IT-017","tod":"NOT_STARTED","toe":"NOT_STARTED","sample_size":50,"category":"Governance","risk_level":"LOW"}'::jsonb, 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000004', 'draft',    '{"control_ref":"IT-018","tod":"NOT_STARTED","toe":"NOT_STARTED","sample_size":18,"category":"Monitoring","risk_level":"MEDIUM"}'::jsonb, 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000005', 'draft',    '{"control_ref":"IT-019","tod":"NOT_STARTED","toe":"NOT_STARTED","sample_size":12,"category":"Governance","risk_level":"LOW"}'::jsonb, 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000004', 'draft',    '{"control_ref":"IT-020","tod":"NOT_STARTED","toe":"NOT_STARTED","sample_size":36,"category":"Monitoring","risk_level":"HIGH"}'::jsonb, 1, 'in_progress', null, null, '', null, null, '')
ON CONFLICT (id) DO UPDATE SET
  assigned_auditor_id = EXCLUDED.assigned_auditor_id,
  data = EXCLUDED.data,
  approval_status = EXCLUDED.approval_status,
  prepared_by_user_id = EXCLUDED.prepared_by_user_id,
  prepared_by_name = EXCLUDED.prepared_by_name,
  reviewed_by_user_id = EXCLUDED.reviewed_by_user_id,
  reviewed_by_name = EXCLUDED.reviewed_by_name;

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
  ('b0000000-0000-0000-0000-000000000014', 4, 'Hassas veri siniflandirma envanterini dogrulayin.', false, '')
ON CONFLICT DO NOTHING;


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
  ('b0000000-0000-0000-0000-000000000014', 'Anahtar Yonetimi Proseduru', 'Sifreleme anahtari rotasyon proseduru', 'pending', now()+interval '7 days')
ON CONFLICT DO NOTHING;


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
  ('b0000000-0000-0000-0000-000000000014', 'Sifreleme Anahtari Rotasyonu Yapilmiyor', 'DB sifreleme anahtarlari 2 yildir degistirilmemis.', 'HIGH', 'IT-014 Adim-3')
ON CONFLICT DO NOTHING;


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
  ('b0000000-0000-0000-0000-000000000008', 'general', 'Offsite yedekleme lokasyonunun KVKK uyumlulugu dogrulanmali.', 'Supervizor Celik', 'Open', null)
ON CONFLICT DO NOTHING;


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
  ('b0000000-0000-0000-0000-000000000008', 'Hakan Yilmaz', 'SAMPLE_CALCULATED', 'Orneklem hesaplandi: 25 (MEDIUM risk, %95)', now()-interval '5 days')
ON CONFLICT DO NOTHING;


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
   'Sent', 'Sistem Yoneticisi', null)
ON CONFLICT DO NOTHING;



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
)
ON CONFLICT DO NOTHING;


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
)
ON CONFLICT DO NOTHING;


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
)
ON CONFLICT DO NOTHING;



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
        "managementAction": "<p>Şube Müdürü Kemal Demir, tüm bulguları 10 Ocak 2026 tarihli müzakerede kabul etmiş
ON CONFLICT DO NOTHING;
 aksiyon planlarının <strong>15 Ocak 2026</strong> tarihine kadar sisteme iletileceğini taahhüt etmiştir.</p>"
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
  '{"html": "<p>Gişe operasyonları genel itibarıyla prosedürlere uygun yürütülmektedir. Günlük kasa sayım tutanakları %98 oranında eksiksiz düzenlenmekte
ON CONFLICT DO NOTHING;
 çift imza zorunluluğu etkin uygulanmaktadır. Tespit edilen 3 adet düşük öncelikli uyumsuzluk, idari iyileştirme kapsamında değerlendirilmiştir.</p>"}'::jsonb
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
          "content": "<p>15 Kasım 2025 tarihinde Kadıköy Şubesi gişe yetkilisi Ayşe K., sisteme kayıt edilmeden nakit çekim işlemi gerçekleştirirken iç gözetim kamerası tarafından tespit edilmiştir. Anında başlatılan incelemede, Mayıs–Kasım 2025 dönemine ait 78 sahte işlem kaydı bulunmuş
ON CONFLICT DO NOTHING;
 toplam zimmet tutarı <strong>450.000 TL</strong> olarak belirlenmiştir.</p>"
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
          "content": "<p>Modelin teknik denetimi sonucunda şu tespitler yapılmıştır:</p><ol><li><strong>Veri Önyargısı Riski:</strong> Eğitim veri seti 2019–2022 dönemini kapsamakta
ON CONFLICT DO NOTHING;
 pandemi dönemi anomalileri modeli etkileyebilir.</li><li><strong>Açıklanabilirlik:</strong> Model kararları BDDK madde 20 kapsamında müşterilere yeterince açıklanmamaktadır.</li><li><strong>Geri Test Sonuçları:</strong> Son 6 aylık geri testte %91 doğruluk oranı elde edilmiş; sektör ortalaması %88''dir.</li></ol>"
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
  v_tenant_id   uuid := '11111111-1111-1111-1111-111111111111';
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
      tenant_id, finding_id, title, original_due_date, current_due_date, status,
      finding_snapshot, regulatory_tags, escalation_level, campaign_id
    ) VALUES
      (v_tenant_id, v_finding_id, 'Legacy password policy enforcement',
       CURRENT_DATE - 400, CURRENT_DATE - 400, 'pending',
       '{"title":"Legacy password policy not enforced","severity":"CRITICAL","risk_rating":"HIGH","gias_category":"IT Governance","description":"Domain controllers allow passwords older than 90 days"}'::jsonb,
       ARRAY['BDDK','BRSA'], 2, v_campaign_1),

      (v_tenant_id, v_finding_id, 'Vendor contract review remediation',
       CURRENT_DATE - 120, CURRENT_DATE - 30, 'evidence_submitted',
       '{"title":"Vendor contract review gap","severity":"HIGH","risk_rating":"HIGH","gias_category":"Procurement","description":"47 vendor contracts have passed their review dates"}'::jsonb,
       ARRAY['BDDK'], 1, v_campaign_1),

      (v_tenant_id, v_finding_id, 'Credit model back-testing fix',
       CURRENT_DATE + 30, CURRENT_DATE + 30, 'pending',
       '{"title":"Credit model back-testing deficiency","severity":"MEDIUM","risk_rating":"MEDIUM","gias_category":"Credit Risk","description":"IFRS 9 back-testing frequency is below regulatory minimum"}'::jsonb,
       ARRAY[]::text[], 0, v_campaign_3),

      (v_tenant_id, v_finding_id, 'SWIFT reconciliation gap closure',
       CURRENT_DATE - 60, CURRENT_DATE - 60, 'risk_accepted',
       '{"title":"SWIFT message reconciliation gap","severity":"HIGH","risk_rating":"HIGH","gias_category":"Treasury","description":"Manual T+1 reconciliation introduces intraday risk window"}'::jsonb,
       ARRAY['BDDK','BRSA'], 0, v_campaign_2);
  END IF;

END $$;

-- =============================================================================
-- 18. UI ENRICHMENT DATA (STRATEGY & FINDING DETAILS)
-- Katılım Bankacılığı konseptli zenginleştirme verisi.
-- Tüm kayıtlar ON CONFLICT DO NOTHING ile güvenli şekilde tekrar çalıştırılabilir.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 18.1 AKTİF METODOLOJİ KONFİGÜRASYONU (KERD Anayasası)
-- Puanlama skalası A-D, Aksiyon SLA süreleri ve iş akışı parametrelerini içerir.
-- -----------------------------------------------------------------------------
INSERT INTO public.methodology_configs (
  id,
  tenant_id,
  version,
  is_active,
  risk_weights,
  scoring_matrix,
  severity_thresholds,
  veto_rules,
  sla_config,
  created_by
) VALUES (
  'b4000000-0000-0000-0000-000000000001'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'KERD-2026-v1.0',
  true,
  -- Risk ağırlıkları: BDDK BRSy uyumlu dağılım
  '{"financial": 0.35, "operational": 0.20, "legal": 0.20, "reputation": 0.25}'::jsonb,
  -- Puanlama matrisi: Etki/Olasılık 1-5 skalası, Denetim Notu A-D
  '{
    "impact_max": 5,
    "likelihood_max": 5,
    "control_effectiveness_max": 5,
    "four_eyes_required": true,
    "grading_scale": {
      "A": {"min": 85, "max": 100, "label": "Düzeltme Gerektirmez",   "color": "#22c55e"},
      "B": {"min": 70, "max": 84,  "label": "İyileştirme Önerilir",  "color": "#eab308"},
      "C": {"min": 55, "max": 69,  "label": "Kontrol Zayıflığı",      "color": "#f97316"},
      "D": {"min": 0,  "max": 54,  "label": "Kritik Kontrol Eksikliği","color": "#ef4444"}
    }
  }'::jsonb,
  -- Şiddet eşikleri: BDDK özel CRITICAL/HIGH/MEDIUM/LOW sınırları
  '[
    {"label": "CRITICAL", "min": 20, "max": 25, "color": "#dc2626"},
    {"label": "HIGH",     "min": 15, "max": 19, "color": "#ea580c"},
    {"label": "MEDIUM",   "min": 10, "max": 14, "color": "#ca8a04"},
    {"label": "LOW",      "min": 0,  "max": 9,  "color": "#16a34a"}
  ]'::jsonb,
  -- Veto kuralları: Şer'i ve BDDK ihlallerinde yükseltme zorunluluğu
  '[
    {
      "condition": "shariah_violation",
      "veto_level": "CAE",
      "description": "Şer''i ihlal tespit edildiğinde CAE onayı zorunludur
ON CONFLICT DO NOTHING;
 Danışma Komitesi bilgilendirilir"
    },
    {
      "condition": "regulatory_breach",
      "veto_level": "AUDIT_COMMITTEE",
      "description": "BDDK BRSy ihlallerinde Denetim Komitesi bildirim zorunludur (72 saat içinde)"
    },
    {
      "condition": "critical_it_finding",
      "veto_level": "CAE",
      "description": "Kritik BT bulgularında aksiyon planı 7 iş günü içinde CAE''ye sunulmalıdır"
    }
  ]'::jsonb,
  -- SLA konfigürasyonu: İş akışı, onay matrisi ve risk limit parametreleri
  '{
    "CRITICAL": {"days": 7,  "escalation_level": "CAE"},
    "HIGH":     {"days": 14, "escalation_level": "DIRECTOR"},
    "MEDIUM":   {"days": 30, "escalation_level": "MANAGER"},
    "LOW":      {"days": 60, "escalation_level": "SENIOR_AUDITOR"},
    "four_eyes": true,
    "auto_escalation": true,
    "force_evidence": true,
    "approval_matrix": {
      "low":      "SENIOR_AUDITOR",
      "medium":   "MANAGER",
      "high":     "DIRECTOR",
      "critical": "CAE"
    },
    "risk_limits": {
      "operational": "UNIT_MANAGER",
      "tactical":    "GROUP_HEAD",
      "strategic":   "BOARD"
    }
  }'::jsonb,
  '00000000-0000-0000-0000-000000000001'::uuid
) ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 18.2 STRATEJİK BANKA HEDEFLERİ (strategic_bank_goals)
-- Katılım Bankacılığı 2026 Stratejik Planı hedefleri
-- -----------------------------------------------------------------------------
INSERT INTO public.strategic_bank_goals
  (id, tenant_id, title, description, period_year, weight, category, owner_executive, progress, risk_appetite, linked_audit_objective_ids)
VALUES
  (
    'b1000000-0000-0000-0000-000000000001'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Sürdürülebilir Katılım Finansmanı (Yeşil Sukuk)',
    'Yeşil Sukuk ihracı ve sürdürülebilir finansman araçları aracılığıyla katılım bankacılığı portföyünü çeşitlendirip büyütmek
ON CONFLICT DO NOTHING;
 yeşil sukuk hacmini 2026 sonuna kadar %25 artırmak. BDDK Sürdürülebilir Finans Tebliği kapsamında raporlama yükümlülükleri yerine getirilecektir.',
    2026, 85, 'COMPLIANCE', 'Mehmet Karaca (Genel Müdür)',
    25, 'High', ARRAY['b2000000-0000-0000-0000-000000000001'::uuid]
  ),
  (
    'b1000000-0000-0000-0000-000000000002'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Dijital Teverruk Otomasyonu',
    'Teverruk işlemlerinin (organized tawarruq) uçtan uca dijitalleştirilmesi; manuel onay süreçlerini %80 azaltarak müşteri başvurusundan akid imzasına kadar geçen süreyi 4 saate indirmek.',
    2026, 90, 'INNOVATION', 'Ali Rıza Koç (GMY — Kredi ve Operasyon)',
    40, 'Medium', ARRAY['b2000000-0000-0000-0000-000000000002'::uuid]
  ),
  (
    'b1000000-0000-0000-0000-000000000003'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Katılım Fonu Portföy Büyümesi',
    'Katılım Fonu ürün gamını genişleterek (Altın Katılım, Döviz Katılım, Vadeli Katılım) toplam katılım fonu hacmini 2026 yılsonuna kadar %30 büyütmek ve kurumsal katılımcı sayısını 500''e çıkarmak.',
    2026, 80, 'GROWTH', 'Hüseyin Çelik (Katılım Fonları Yöneticisi)',
    15, 'Medium', ARRAY['b2000000-0000-0000-0000-000000000003'::uuid]
  ),
  (
    'b1000000-0000-0000-0000-000000000004'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Şube Operasyonel Mükemmelliyet Programı',
    'Tüm şube süreçlerinin SLA hedefleri dahilinde yürütülmesini sağlamak; Lean metodolojisi ile süreç israfını %35 azaltmak ve müşteri şikayet sayısını yıllık %20 düşürmek.',
    2026, 70, 'EFFICIENCY', 'Burak Yılmaz (Şube Müdürü)',
    55, 'Low', '{}'
  ),
  (
    'b1000000-0000-0000-0000-000000000005'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'BDDK BT Denetimi Uyum Yol Haritası',
    'BDDK BT Denetimi rehberi (Aralık 2023) gerekliliklerini 2026 yılsonuna kadar tam olarak karşılamak; BT Risk değerlendirme süreçlerini ISO 27001:2022 ile uyumlandırmak.',
    2026, 95, 'COMPLIANCE', 'Zeynep Kılıç (BT Altyapı Müdürü)',
    70, 'High', ARRAY['b2000000-0000-0000-0000-000000000004'::uuid]
  )
ON CONFLICT (id) DO UPDATE SET
  progress = EXCLUDED.progress,
  risk_appetite = EXCLUDED.risk_appetite,
  linked_audit_objective_ids = EXCLUDED.linked_audit_objective_ids;

-- -----------------------------------------------------------------------------
-- 18.3 STRATEJİK DENETİM HEDEFLERİ (strategic_audit_objectives)
-- İç Denetim Birimi 2026 Stratejik Denetim Hedefleri
-- -----------------------------------------------------------------------------
INSERT INTO public.strategic_audit_objectives
  (id, tenant_id, title, description, period_year, category, type, status)
VALUES
  (
    'b2000000-0000-0000-0000-000000000001'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Yeşil Sukuk İhracı Uyum Denetimi',
    'Yeşil Sukuk ihraç süreçlerinin BDDK Sürdürülebilir Finans Tebliği ve IIFM standartlarına uygunluğunun denetlenmesi
ON CONFLICT DO NOTHING;
 çevre etkisi raporlamasının doğruluğunun ve şer''i uyumunun teyit edilmesi.',
    2026, 'ASSURANCE', 'Assurance', 'On Track'
  ),
  (
    'b2000000-0000-0000-0000-000000000002'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Dijital Teverruk API Şer''i Kontrol Danışmanlığı',
    'Teverruk otomasyonu geliştirme sürecinde kontrol tasarımı konusunda danışmanlık sağlamak; API akışlarının Danışma Kurulu onaylı şer''i kurallara uygunluğunu güvence altına almak.',
    2026, 'ADVISORY', 'Advisory', 'On Track'
  ),
  (
    'b2000000-0000-0000-0000-000000000003'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Katılım Fonu Piyasa ve Likidite Riski Değerlendirmesi',
    'Katılım Fonu portföy büyüme stratejisine eşlik eden piyasa riski ve likidite riskini değerlendirmek; BDDK SYR yönetmeliği kapsamındaki risk ağırlıklı varlıkların doğru sınıflandırıldığını denetlemek.',
    2026, 'RISK_MANAGEMENT', 'Assurance', 'At Risk'
  ),
  (
    'b2000000-0000-0000-0000-000000000004'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'BT Altyapısı Kurumsal Yönetişim Denetimi',
    'BDDK BT Denetimi rehberi gerekliliklerine uyum çerçevesinde BT yönetişim yapısını ve ayrıcalıklı erişim yönetimini denetlemek; f0000000-0000-0000-0000-000000000001 bulgusuna yönelik aksiyon planının etkinliğini izlemek.',
    2026, 'GOVERNANCE', 'Assurance', 'On Track'
  )
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type,
  status = EXCLUDED.status;

-- -----------------------------------------------------------------------------
-- 18.4 STRATEJİK HIZALAMA MATRİSİ (strategy_alignment_matrix)
-- Banka hedefleri ile denetim hedeflerinin hizalanması
-- -----------------------------------------------------------------------------
INSERT INTO public.strategy_alignment_matrix
  (id, tenant_id, bank_goal_id, audit_objective_id, relevance_score, rationale)
VALUES
  (
    'a0000000-0000-0000-0000-000000000011'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'b1000000-0000-0000-0000-000000000001'::uuid,
    'b2000000-0000-0000-0000-000000000001'::uuid,
    0.95,
    'Yeşil Sukuk hedefi doğrudan uyum denetimini gerektirir
ON CONFLICT DO NOTHING;
 şer''i uyum ve BDDK tebliği kontrolü kritik öneme sahiptir.'
  ),
  (
    'a0000000-0000-0000-0000-000000000012'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'b1000000-0000-0000-0000-000000000002'::uuid,
    'b2000000-0000-0000-0000-000000000002'::uuid,
    0.90,
    'Dijital Teverruk otomasyonu geliştirilirken şer''i kontrol tasarımına danışmanlık verilmesi zorunludur.'
  ),
  (
    'a0000000-0000-0000-0000-000000000013'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'b1000000-0000-0000-0000-000000000003'::uuid,
    'b2000000-0000-0000-0000-000000000003'::uuid,
    0.85,
    'Portföy büyümesi piyasa riskini artırmaktadır; bağımsız risk değerlendirmesi yönetim kuruluna güvence sağlar.'
  ),
  (
    'a0000000-0000-0000-0000-000000000014'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'b1000000-0000-0000-0000-000000000005'::uuid,
    'b2000000-0000-0000-0000-000000000004'::uuid,
    0.98,
    'BDDK BT Uyum Yol Haritası ile BT Yönetişim Denetimi birebir örtüşmektedir; kritik BT bulgusunun kapatılması her iki hedef için de önceliklidir.'
  )
ON CONFLICT (bank_goal_id, audit_objective_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 18.5 EK BULGU TARİHÇESİ (finding_history)
-- f0000000-0000-0000-0000-000000000001 için içerik düzenleme kayıtları
-- (STATE_CHANGE kayıtları 0.11 bölümünde zaten mevcut)
-- -----------------------------------------------------------------------------
INSERT INTO public.finding_history
  (tenant_id, finding_id, previous_state, new_state, change_type, change_description, changed_by, changed_by_role)
VALUES
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'f0000000-0000-0000-0000-000000000001'::uuid,
    'DRAFT', 'DRAFT', 'CONTENT_EDIT',
    'Mali etki tutarı güncellendi: 2.5M TL → 4.8M TL. Sistem yöneticisi loglarından elde edilen kanıt revize edildi.',
    '00000000-0000-0000-0000-000000000004'::uuid,
    'AUDITOR'
  ),
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'f0000000-0000-0000-0000-000000000001'::uuid,
    'DRAFT', 'DRAFT', 'CONTENT_EDIT',
    'Kök neden analizi (RCA) tamamlandı
ON CONFLICT DO NOTHING;
 "Ayrıcalıklı Erişim Yönetimi" kontrol kategorisine sınıflandırıldı.',
    '00000000-0000-0000-0000-000000000003'::uuid,
    'AUDIT_MANAGER'
  ),
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'f0000000-0000-0000-0000-000000000001'::uuid,
    'IN_REVIEW', 'IN_REVIEW', 'COMMENT_ADDED',
    'Baş Müfettiş tarafından inceleme notu eklendi: Privilege escalation kanıtları yeterli bulundu.',
    '00000000-0000-0000-0000-000000000003'::uuid,
    'AUDIT_MANAGER'
  ),
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'f0000000-0000-0000-0000-000000000001'::uuid,
    'DRAFT', 'DRAFT', 'SEVERITY_CHANGE',
    'Şiddet derecesi HIGH''dan CRITICAL''e yükseltildi. 90 günlük erişim logu analizi sonucunda 47 yetkisiz sorgu tespit edildi.',
    '00000000-0000-0000-0000-000000000004'::uuid,
    'AUDITOR'
  )
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 18.6 EK BULGU YORUMLARI (finding_comments)
-- f0000000-0000-0000-0000-000000000001: Denetçi–BT Müdürü teknik müzakere
-- -----------------------------------------------------------------------------
INSERT INTO public.finding_comments
  (tenant_id, finding_id, comment_text, comment_type, author_id, author_role, author_name)
VALUES
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'f0000000-0000-0000-0000-000000000001'::uuid,
    'Zeynep Hanım, veritabanı yetki matrisini (DB_AUTH_MATRIX_2026.xlsx) ve son 90 günün ayrıcalıklı kullanıcı erişim loglarını acil olarak göndermenizi talep ediyoruz. Yasal süre: 3 iş günü.',
    'DISCUSSION',
    '00000000-0000-0000-0000-000000000004'::uuid,
    'AUDITOR',
    'Elif Yıldız'
  ),
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'f0000000-0000-0000-0000-000000000001'::uuid,
    'Elif Hanım, yetki matrisi ve 90 günlük tüm ayrıcalıklı erişim logları ekte sunulmaktadır. Ayrıca söz konusu servis hesabının yetki yükseltme işleminin yazılım güncellemesi sonrası otomatik gerçekleştiğini belirtmek isteriz
ON CONFLICT DO NOTHING;
 kasıt söz konusu değildir.',
    'CLARIFICATION',
    '00000000-0000-0000-0000-000000000012'::uuid,
    'AUDITEE',
    'Zeynep Kılıç'
  ),
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'f0000000-0000-0000-0000-000000000001'::uuid,
    'Loglar incelendi. 47 ayrı sorgu kaydı tespit edildi; bunların 12''si mesai saatleri dışında gerçekleşmiştir. "Otomatik güncelleme" iddiası logtaki zaman damgaları ile çelişmektedir. Bulgunun CRITICAL şiddet derecesi korunacaktır.',
    'DISPUTE',
    '00000000-0000-0000-0000-000000000004'::uuid,
    'AUDITOR',
    'Elif Yıldız'
  ),
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'f0000000-0000-0000-0000-000000000001'::uuid,
    'Dört Göz İlkesi kapsamında inceleme tamamlandı. Privilege escalation kanıtları yeterli ve ikna edicidir. Aksiyon planının 7 iş günü içinde sunulmasını ve servis hesabının derhal devre dışı bırakılmasını emrediyorum.',
    'AGREEMENT',
    '00000000-0000-0000-0000-000000000003'::uuid,
    'AUDIT_MANAGER',
    'Murat Şen'
  )
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 18.7 EK BULGU ONAYLARI (finding_signoffs)
-- f0000000-0000-0000-0000-000000000003 (Kasa Sayımı) için onay zinciri başlatma
-- (f0000000...001 için tüm imzalar 0.12 bölümünde zaten mevcuttur)
-- -----------------------------------------------------------------------------
INSERT INTO public.finding_signoffs
  (finding_id, tenant_id, role, user_id, user_name, user_title, comments)
VALUES
  (
    'f0000000-0000-0000-0000-000000000003'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'PREPARER',
    '00000000-0000-0000-0000-000000000005'::uuid,
    'Canan Arslan',
    'Müfettiş Yardımcısı',
    'Kasa sayım tutanakları ve banka kayıtları karşılaştırmalı olarak hazırlandı. 127.500 TL tutarında aşım tespit edilmiştir.'
  ),
  (
    'f0000000-0000-0000-0000-000000000003'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'REVIEWER',
    '00000000-0000-0000-0000-000000000002'::uuid,
    'Fatma Erdem',
    'Teftiş Kurulu Başkan Yardımcısı',
    'Belgesel kanıtlar yerindedir. Şube yönetimiyle müzakere süreci başlatılabilir.'
  )
ON CONFLICT (finding_id, role) DO NOTHING;

-- =============================================================================
-- 19. REHBERLİK HİZMETLERİ (ADVISORY) — UI ZENGİNLEŞTİRME VERİLERİ
--
--  KURAL: Bu blok SADECE advisory_requests, advisory_engagements ve
--         advisory_insights tablolarını besler. Gerçek üretim tablolarına
--         dokunulmaz; yalnızca UI gösterimi ve geliştirme testi amaçlıdır.
--
--  Bağımlılıklar:
--    Tenant : 11111111-1111-1111-1111-111111111111
--    Entity  : e0000000-0000-0000-0000-000000000011 (Uyum ve MASAK Birimi)
--              e0000000-0000-0000-0000-000000000022 (Teverruk İşlemleri)
--              e0000000-0000-0000-0000-000000000013 (Kredi Tahsis Müdürlüğü)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 19.1 DANIŞMANLIK TALEPLERİ (advisory_requests)
-- requester_id → NULL bırakılır (auth.users FK ihlali önlenir)
-- department_id → mevcut audit_entities id'lerine referans verilir
-- -----------------------------------------------------------------------------
INSERT INTO public.advisory_requests
  (id, requester_id, department_id, title, problem_statement, desired_outcome, status, created_at)
VALUES
  (
    'ad100000-0000-0000-0000-000000000001'::uuid,
    NULL,
    'e0000000-0000-0000-0000-000000000011'::uuid,
    'MASAK Şüpheli İşlem Bildirim Sürecinin Yeniden Tasarımı',
    'Mevcut STR/SAR sürecimizde manuel adımlar fazla olmakta, bildirim süreleri zaman zaman MASAK yönetmeliğindeki 10 günlük sınırı aşmaktadır. Süreçte otomasyon açığı ve yetki belirsizlikleri tespit edilmiştir.',
    'Tüm şüpheli işlem bildirim adımlarının sisteme entegre edilmesi, otomatik limit kontrollerinin devreye alınması ve müdür onay akışının GIAS 2024 standardına uygun biçimde tasarlanması beklenmektedir.',
    'APPROVED',
    NOW() - INTERVAL '45 days'
  ),
  (
    'ad100000-0000-0000-0000-000000000002'::uuid,
    NULL,
    'e0000000-0000-0000-0000-000000000022'::uuid,
    'Teverruk İşlemlerinde Şeri Uyum Kontrol Çerçevesi',
    'Danışma Kurulunun son denetiminde teverruk işlemlerinde sözleşme tarihlerinin geç tescil edildiği ve commodity broker seçiminde bağımsızlık ilkesinin zaman zaman ihlal edildiği gözlemlenmiştir.',
    'Şeri denetim kontrol listesinin otomasyona alınması, broker seçim kriterleri matrisinin oluşturulması ve aylık Danışma Kurulu doğrulama raporunun tasarlanması.',
    'PENDING',
    NOW() - INTERVAL '12 days'
  ),
  (
    'ad100000-0000-0000-0000-000000000003'::uuid,
    NULL,
    'e0000000-0000-0000-0000-000000000013'::uuid,
    'Kredi Tahsis Sürecinde Yetki Matrisi Güncelleme Rehberliği',
    'Kredi komitesi yetki limitleri 3 yıldır güncellenmemiş
ON CONFLICT DO NOTHING;
 artan kredi hacimleri ile yetki sınırları çakışmaktadır. Bu durum müzahir imza eksiklikleri yaratmakta ve denetim bulgularına yol açmaktadır.',
    'Güncel kredi büyüklükleri ile uyumlu yetki matrisinin tasarlanması, tek taraflı onay riskinin ortadan kaldırılması.',
    'APPROVED',
    NOW() - INTERVAL '30 days'
  )
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 19.2 DANIŞMANLIK GÖREVLERİ (advisory_engagements)
-- Her biri onaylanmış bir advisory_requests kaydına bağlıdır.
-- management_responsibility_confirmed: 1. görev TRUE (feragatname verildi),
--   2. görev FALSE (henüz e-imza bekleniyor — GIAS 11.1 hard-gate testi için)
-- -----------------------------------------------------------------------------
INSERT INTO public.advisory_engagements
  (id, request_id, title, scope_limitations, management_responsibility_confirmed,
   start_date, target_date, status, methodology, created_at)
VALUES
  (
    'ae100000-0000-0000-0000-000000000001'::uuid,
    'ad100000-0000-0000-0000-000000000001'::uuid,
    'MASAK STR Süreç Yeniden Tasarımı',
    'Bu danışmanlık kapsamı
ON CONFLICT DO NOTHING;
 mevcut STR akışının haritalanması, otomasyon fırsatlarının belirlenmesi ve taslak süreç önerisinin sunulmasıyla sınırlıdır. Uygulama ve yazılım geliştirme kapsam dışındadır. Tüm nihai karar sorumluluğu Uyum Birimi Müdürüne aittir.',
    true,
    (NOW() - INTERVAL '35 days')::date,
    (NOW() + INTERVAL '10 days')::date,
    'FIELDWORK',
    'PROCESS_DESIGN',
    NOW() - INTERVAL '35 days'
  ),
  (
    'ae100000-0000-0000-0000-000000000002'::uuid,
    'ad100000-0000-0000-0000-000000000003'::uuid,
    'Kredi Yetki Matrisi Danışmanlık Projesi',
    'Bu görev; mevcut kredi yetki matrisinin analizi, sektör kıyaslaması ve önerilen yeni matrisin komite onayına sunulması aşamalarını kapsamaktadır. İç denetim birimi nihai matris tasarımında oy hakkı kullanmaz.',
    false,
    (NOW() - INTERVAL '20 days')::date,
    (NOW() + INTERVAL '25 days')::date,
    'PLANNING',
    'WORKSHOP',
    NOW() - INTERVAL '20 days'
  )
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 19.3 DANIŞMANLIK GÖZLEMLERİ (advisory_insights)
-- "Bulgu" değil "Gözlem" dili — GIAS 2024 dil ayrımına uygun.
-- -----------------------------------------------------------------------------
INSERT INTO public.advisory_insights
  (id, engagement_id, title, observation, recommendation,
   impact_level, management_response, status, created_at)
VALUES
  (
    'a1100000-0000-0000-0000-000000000001'::uuid,
    'ae100000-0000-0000-0000-000000000001'::uuid,
    'Bildirim Süresinde Gecikme Riski',
    'Mevcut iş akışında şüpheli işlem tespitinden MASAK bildirim formunun tamamlanmasına kadar ortalama 8,4 iş günü geçmektedir. MASAK Yönetmeliği Md. 5 uyarınca sınır 10 gündür
ON CONFLICT DO NOTHING;
 operasyonel yoğunluk dönemlerinde bu süre aşılma riski taşımaktadır.',
    'Tespit, Ön İnceleme, Onay ve Bildirim adımlarının sisteme entegre edilmesi; her aşamaya otomatik SLA alarmı eklenmesi. Yetki matrisinin çift imza mekanizmasına geçirilmesi önerilmektedir.',
    'OPERATIONAL',
    'Otomasyon projesinin Q3 2026 bütçe planlamasına alınması gündemimize taşındı. Geçici çözüm olarak haftalık kontrol listesi devreye alındı.',
    'ACCEPTED',
    NOW() - INTERVAL '25 days'
  ),
  (
    'a1100000-0000-0000-0000-000000000002'::uuid,
    'ae100000-0000-0000-0000-000000000001'::uuid,
    'Yetki Belirsizliği — Ön İnceleme Sorumluluğu',
    'STR formlarının ön incelemesinin kimin tarafından yapılacağı yazılı prosedürde net olarak belirtilmemiştir. Sözlü teamüle göre işlem yapıcı uzman ile uyum sorumlusu arasında fiili çakışma gözlemlenmiştir.',
    'Ön inceleme görevinin RACI matrisi ile net biçimde atanması; prosedürün 30 gün içinde revize edilerek dijital onay zincirine alınması.',
    'OPERATIONAL',
    NULL,
    'SHARED',
    NOW() - INTERVAL '18 days'
  ),
  (
    'a1100000-0000-0000-0000-000000000003'::uuid,
    'ae100000-0000-0000-0000-000000000001'::uuid,
    'Broker Bağımsızlığı Kontrol Eksikliği',
    'Teverruk işlemlerinde kullanılan 3 brokerdan ikisinin aynı holding bünyesinde olduğu görülmüştür. Danışma Kurulu kılavuzlarına göre commodity brokerlerin birbirinden bağımsız olması zorunludur.',
    'Broker bağımsızlık beyanının her işlem öncesi alınması; alternatif broker havuzunun en az 5 bağımsız kuruma genişletilmesi. Danışma Kurulunun broker onay listesini yıllık gözden geçirmesi.',
    'STRATEGIC',
    'Hukuk ve Danışma Kurulu ortak çalışması başlatıldı. Broker havuzu genişletme süreci Q2 2026 da tamamlanacak.',
    'ACCEPTED',
    NOW() - INTERVAL '10 days'
  )
ON CONFLICT DO NOTHING;

-- =============================================================================
-- ÇEVİK GÖREVLER (AGILE) — audit_engagements_v2, audit_sprints, audit_tasks
-- Test: /execution/agile ve /execution/agile/:id sayfaları
-- =============================================================================

INSERT INTO public.audit_engagements_v2 (
  id, tenant_id, title, description, service_template_id, status,
  total_sprints, start_date, end_date, team_members
) VALUES
  (
    'a1000000-0000-0000-0000-000000000001'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'BT Altyapı ve Güvenlik Denetimi',
    'Kritik BT sistemleri, erişim yönetimi ve sızma testi kapsamında çevik denetim.',
    NULL,
    'ACTIVE',
    3,
    '2026-02-01'::date,
    '2026-04-30'::date,
    '[]'::jsonb
  ),
  (
    'a1000000-0000-0000-0000-000000000002'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Katılım Fonları Kar Dağıtım Denetimi',
    'Havuz yönetimi ve kar/zarar dağıtım süreçlerinin denetimi.',
    NULL,
    'PLANNED',
    2,
    '2026-03-01'::date,
    '2026-05-15'::date,
    '[]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_sprints (
  id, engagement_id, tenant_id, sprint_number, title, goal, start_date, end_date, status
) VALUES
  (
    'b1000000-0000-0000-0000-000000000001'::uuid,
    'a1000000-0000-0000-0000-000000000001'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    1,
    'Sprint 1 — Keşif ve Kapsam',
    'BT varlık envanteri ve erişim matrisi çıkarılması.',
    '2026-02-01'::date,
    '2026-02-14'::date,
    'COMPLETED'
  ),
  (
    'b1000000-0000-0000-0000-000000000002'::uuid,
    'a1000000-0000-0000-0000-000000000001'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    2,
    'Sprint 2 — Test ve Kanıt',
    'Erişim testleri ve kanıt toplama.',
    '2026-02-15'::date,
    '2026-02-28'::date,
    'ACTIVE'
  ),
  (
    'b1000000-0000-0000-0000-000000000003'::uuid,
    'a1000000-0000-0000-0000-000000000002'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    1,
    'Sprint 1 — Planlama',
    'Havuz ve dağıtım süreç dokümanlarının toplanması.',
    '2026-03-01'::date,
    '2026-03-14'::date,
    'PLANNED'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_tasks (
  id, sprint_id, engagement_id, tenant_id, title, description,
  assigned_to, assigned_name, status, priority, validation_status, story_points
) VALUES
  (
    'c1000000-0000-0000-0000-000000000001'::uuid,
    'b1000000-0000-0000-0000-000000000001'::uuid,
    'a1000000-0000-0000-0000-000000000001'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'BT varlık envanteri çıkar',
    'Tüm sunucu, veritabanı ve ağ cihazlarının listesi ve sahiplik matrisi.',
    NULL,
    '',
    'DONE',
    'HIGH',
    'VALIDATED',
    5
  ),
  (
    'c1000000-0000-0000-0000-000000000002'::uuid,
    'b1000000-0000-0000-0000-000000000001'::uuid,
    'a1000000-0000-0000-0000-000000000001'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Erişim matrisi ve yetki listesi',
    'Domain, uygulama ve DB erişim yetkilerinin dokümantasyonu.',
    NULL,
    '',
    'DONE',
    'HIGH',
    'VALIDATED',
    3
  ),
  (
    'c1000000-0000-0000-0000-000000000003'::uuid,
    'b1000000-0000-0000-0000-000000000002'::uuid,
    'a1000000-0000-0000-0000-000000000001'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Core Banking DB yetki testi',
    'Servis hesaplarının yetki seviyesinin test edilmesi ve kanıtlanması.',
    NULL,
    '',
    'IN_PROGRESS',
    'CRITICAL',
    'OPEN',
    8
  ),
  (
    'c1000000-0000-0000-0000-000000000004'::uuid,
    'b1000000-0000-0000-0000-000000000002'::uuid,
    'a1000000-0000-0000-0000-000000000001'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'PAM kayıtlarının incelenmesi',
    'Son 6 ay PAM oturum loglarının örnekleme ile kontrolü.',
    NULL,
    '',
    'TODO',
    'MEDIUM',
    'OPEN',
    5
  ),
  (
    'c1000000-0000-0000-0000-000000000005'::uuid,
    'b1000000-0000-0000-0000-000000000003'::uuid,
    'a1000000-0000-0000-0000-000000000002'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Havuz süreç dokümanlarını topla',
    'Katılım hesapları havuz yönetimi prosedürleri ve akış şemaları.',
    NULL,
    '',
    'TODO',
    'MEDIUM',
    'OPEN',
    3
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- RAUNT 1 — ETKİ ANALİZİ, RKM ZAMAN MAKİNESİ VE INLINE GRID TEST VERİLERİ
-- Test: Kaskad Yıkım Kalkanı, RKM Tarihçe sekmesi, RKMMasterGrid inline düzenleme
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. DENETİM EVRENİ (audit_entities) — HQ.RETAIL / HQ.IT Ltree Hiyerarşisi
-- Root hq (e00...001) ve hq.it (e00...030) zaten mevcut; retail ve alt dallar eklenir.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.audit_entities (id, tenant_id, name, type, risk_score, velocity_multiplier, path, metadata) VALUES
  ('e0000000-0000-0000-0000-000000000100','11111111-1111-1111-1111-111111111111','Bireysel Bankacılık',              'GROUP',  58, 1.0, 'hq.retail',           '{}'::jsonb),
  ('e0000000-0000-0000-0000-000000000101','11111111-1111-1111-1111-111111111111','Kredi Kartları Operasyonu',         'PROCESS',62, 1.1, 'hq.retail.cards',    '{}'::jsonb),
  ('e0000000-0000-0000-0000-000000000102','11111111-1111-1111-1111-111111111111','Murabaha Tahsis Süreci',            'PROCESS',68, 1.1, 'hq.retail.murabaha', '{}'::jsonb),
  ('e0000000-0000-0000-0000-000000000103','11111111-1111-1111-1111-111111111111','Siber Güvenlik',                    'PROCESS',85, 1.3, 'hq.it.cyber',        '{}'::jsonb),
  ('e0000000-0000-0000-0000-000000000104','11111111-1111-1111-1111-111111111111','Sistem Altyapısı',                  'PROCESS',78, 1.2, 'hq.it.infra',        '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. RKM SÜREÇLERİ (rkm_processes) — entity_id ile evren düğümlerine bağlı
-- entity_id: migration 20260301000003 ile rkm_processes tablosuna eklenir.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.rkm_processes (id, tenant_id, path, level, process_code, process_name, process_type, entity_id) VALUES
  ('ac000001-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','raunt.retail.murabaha', 3, 'RAUNT-MUR', 'Murabaha Tahsis Süreci', 'PRIMARY',  'e0000000-0000-0000-0000-000000000102'::uuid),
  ('ac000001-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','raunt.retail.cards',    3, 'RAUNT-CRD', 'Kredi Kartları Operasyonu', 'PRIMARY', 'e0000000-0000-0000-0000-000000000101'::uuid),
  ('ac000001-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111','raunt.it.cyber',        3, 'RAUNT-CYB', 'Siber Güvenlik', 'PRIMARY',            'e0000000-0000-0000-0000-000000000103'::uuid),
  ('ac000001-0000-0000-0000-000000000004','11111111-1111-1111-1111-111111111111','raunt.it.infra',        3, 'RAUNT-INF', 'Sistem Altyapısı', 'PRIMARY',           'e0000000-0000-0000-0000-000000000104'::uuid)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. RKM RİSKLERİ (rkm_risks) — Inline Grid testi için 10+ risk
-- Katılım bankacılığı terminolojisi; risk_level yerine inherent_rating (generated) kullanılır.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.rkm_risks (
  id, tenant_id, process_id, risk_code, risk_title, risk_description, risk_owner, risk_status,
  main_process, sub_process, risk_category, inherent_impact, inherent_likelihood, inherent_volume,
  control_design_rating, control_operating_rating, residual_impact, residual_likelihood,
  control_type, control_nature, bddk_reference, risk_response_strategy, last_audit_date, audit_rating
) VALUES
  ('ad000002-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','ac000001-0000-0000-0000-000000000001','RAUNT-R-001','Emtia teyit belgelerinin eksik alınması','Murabaha işlemlerinde emtia alım-satım teyit belgelerinin zamanında ve eksiksiz dosyalanmaması riski.','Hüseyin Çelik','ACTIVE','Murabaha Tahsis','Teyit Belgeleri','Uyum Riski',4,4,3, 4,4, 3,2, 'PREVENTIVE','MANUAL','BDDK 5.1','MITIGATE','2025-11-15','NEEDS_IMPROVEMENT'),
  ('ad000002-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','ac000001-0000-0000-0000-000000000001','RAUNT-R-002','Kâr/Zarar paylaşım havuzlarında hesaplama hatası','Katılma hesapları havuzunda kar/zarar dağıtım formülünün yanlış uygulanması veya veri giriş hatası.','Hüseyin Çelik','ACTIVE','Murabaha Tahsis','Havuz Hesaplama','Finansal Risk',5,3,4, 3,3, 2,2, 'DETECTIVE','AUTOMATED','BDDK 9.1','MITIGATE','2025-10-01','SATISFACTORY'),
  ('ad000002-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111','ac000001-0000-0000-0000-000000000001','RAUNT-R-003','Murabaha vade uyumsuzluğu','Sözleşme vadesi ile emtia teslim tarihi arasında şeri uyumsuzluk.','Hüseyin Çelik','ACTIVE','Murabaha Tahsis','Vade Yönetimi','Uyum Riski',3,3,2, 4,4, 2,1, 'PREVENTIVE','MANUAL',NULL,'ACCEPT','2025-09-20','SATISFACTORY'),
  ('ad000002-0000-0000-0000-000000000004','11111111-1111-1111-1111-111111111111','ac000001-0000-0000-0000-000000000002','RAUNT-R-004','Kartlı ödeme sisteminde dolandırıcılık','Yetkisiz kart kullanımı ve fraud tespit gecikmesi.','Burak Yılmaz','ACTIVE','Kredi Kartları','Ödeme Güvenliği','Operasyonel Risk',4,3,4, 4,4, 3,2, 'DETECTIVE','AUTOMATED','BDDK 8.3','MITIGATE','2025-11-01','NEEDS_IMPROVEMENT'),
  ('ad000002-0000-0000-0000-000000000005','11111111-1111-1111-1111-111111111111','ac000001-0000-0000-0000-000000000002','RAUNT-R-005','Müşteri verisi sızıntısı (kart bilgileri)','Kart sahibi PII ve işlem verilerinin yetkisiz erişime açık olması.','Burak Yılmaz','ACTIVE','Kredi Kartları','Veri Koruma','Teknoloji Riski',5,2,3, 4,4, 2,1, 'PREVENTIVE','AUTOMATED','BDDK 8.7','MITIGATE','2025-10-15','SATISFACTORY'),
  ('ad000002-0000-0000-0000-000000000006','11111111-1111-1111-1111-111111111111','ac000001-0000-0000-0000-000000000003','RAUNT-R-006','API uç noktalarında yetkisiz erişim (BOLA)','Broken Object Level Authorization: API ile başka müşteri/kayıt erişimi.','Zeynep Kılıç','ACTIVE','Siber Güvenlik','API Güvenliği','Teknoloji Riski',5,4,4, 3,3, 3,3, 'PREVENTIVE','AUTOMATED','BDDK 8.3','MITIGATE','2025-12-01','UNSATISFACTORY'),
  ('ad000002-0000-0000-0000-000000000007','11111111-1111-1111-1111-111111111111','ac000001-0000-0000-0000-000000000003','RAUNT-R-007','Zafiyet taraması gecikmesi','Kritik CVE''lerin patch''lenmesinde gecikme.','Zeynep Kılıç','ACTIVE','Siber Güvenlik','Yama Yönetimi','Teknoloji Riski',4,4,3, 4,3, 3,2, 'CORRECTIVE','HYBRID','ISO27001 A.12.6','MITIGATE','2025-11-20','NEEDS_IMPROVEMENT'),
  ('ad000002-0000-0000-0000-000000000008','11111111-1111-1111-1111-111111111111','ac000001-0000-0000-0000-000000000003','RAUNT-R-008','İnsider tehdidi (ayrıcalıklı hesap kötüye kullanımı)','Dahili kullanıcıların yetkili erişimlerini kötüye kullanması.','Zeynep Kılıç','ACTIVE','Siber Güvenlik','Erişim Yönetimi','Operasyonel Risk',5,2,3, 4,4, 2,1, 'DETECTIVE','AUTOMATED',NULL,'MITIGATE','2025-10-10','SATISFACTORY'),
  ('ad000002-0000-0000-0000-000000000009','11111111-1111-1111-1111-111111111111','ac000001-0000-0000-0000-000000000004','RAUNT-R-009','Sunucu kesintisi (tek nokta arızası)','Kritik sunucularda tek nokta arızası ve yedekleme yetersizliği.','Zeynep Kılıç','ACTIVE','Sistem Altyapısı','Kullanılabilirlik','Teknoloji Riski',4,3,4, 4,4, 3,2, 'PREVENTIVE','AUTOMATED','BDDK 8.1','MITIGATE','2025-09-15','SATISFACTORY'),
  ('ad000002-0000-0000-0000-000000000010','11111111-1111-1111-1111-111111111111','ac000001-0000-0000-0000-000000000004','RAUNT-R-010','Yedekleme ve kurtarma testi eksikliği','DR testlerinin periyodik yapılmaması.','Zeynep Kılıç','MITIGATED','Sistem Altyapısı','DR/BCP','Teknoloji Riski',3,3,2, 5,5, 1,1, 'DETECTIVE','MANUAL','BDDK 8.1','MITIGATE','2025-12-10','SATISFACTORY'),
  ('ad000002-0000-0000-0000-000000000011','11111111-1111-1111-1111-111111111111','ac000001-0000-0000-0000-000000000003','RAUNT-R-011','Şifre politikası zayıflığı','Zayıf parola kuralları ve MFA eksikliği.','Zeynep Kılıç','ACTIVE','Siber Güvenlik','Kimlik Doğrulama','Teknoloji Riski',4,4,3, 3,3, 3,3, 'PREVENTIVE','AUTOMATED','BDDK 8.3','MITIGATE','2025-11-05','NEEDS_IMPROVEMENT')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. RKM ZAMAN MAKİNESİ (rkm_risk_versions) — 2 risk için geçmiş snapshot simülasyonu
-- RAUNT-R-006 ve RAUNT-R-007 için 5 gün önceki versiyon; snapshot'ta risk seviyesi LOW.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.rkm_risk_versions (id, risk_id, tenant_id, version_number, snapshot, changed_by, change_summary, created_at) VALUES
  ('ae000003-0000-0000-0000-000000000001','ad000002-0000-0000-0000-000000000006','11111111-1111-1111-1111-111111111111', 1,
   '{"risk_code":"RAUNT-R-006","risk_title":"API uç noktalarında yetkisiz erişim (BOLA)","risk_status":"ACTIVE","inherent_impact":2,"inherent_likelihood":2,"inherent_rating":"DÜŞÜK","residual_impact":1,"residual_likelihood":1,"residual_rating":"DÜŞÜK","control_design_rating":4,"control_operating_rating":4,"risk_category":"Teknoloji Riski","risk_owner":"Zeynep Kılıç"}'::jsonb,
   'Sistem', 'Geçmiş snapshot — risk seviyesi düşük (LOW) iken kayıt', (now() - INTERVAL '5 days')),
  ('ae000003-0000-0000-0000-000000000002','ad000002-0000-0000-0000-000000000007','11111111-1111-1111-1111-111111111111', 1,
   '{"risk_code":"RAUNT-R-007","risk_title":"Zafiyet taraması gecikmesi","risk_status":"ACTIVE","inherent_impact":2,"inherent_likelihood":2,"inherent_rating":"DÜŞÜK","residual_impact":2,"residual_likelihood":1,"residual_rating":"DÜŞÜK","control_design_rating":4,"control_operating_rating":4,"risk_category":"Teknoloji Riski","risk_owner":"Zeynep Kılıç"}'::jsonb,
   'Sistem', 'Geçmiş snapshot — risk seviyesi düşük (LOW) iken kayıt', (now() - INTERVAL '5 days'))
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. DENETİM GÖREVLERİ (audit_engagements) — Murabaha ve Siber Güvenlik entity'lerine bağlı
-- Etki analizinde "açık bulgu" sayısı için engagement → finding bağı gerekir.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.audit_engagements (id, tenant_id, plan_id, entity_id, title, status, audit_type, start_date, end_date, assigned_auditor_id, risk_snapshot_score, estimated_hours, actual_hours) VALUES
  ('52d72f07-e813-4cff-8218-4a64f7a3ba01','11111111-1111-1111-1111-111111111111','d0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000102','Murabaha Tahsis ve Havuz Denetimi (Raunt 1)','IN_PROGRESS','COMPREHENSIVE','2026-02-10','2026-04-30','00000000-0000-0000-0000-000000000003', 68, 120, 45),
  ('52d72f07-e813-4cff-8218-4a64f7a3ba02','11111111-1111-1111-1111-111111111111','d0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000103','Siber Güvenlik ve API Denetimi (Raunt 1)','IN_PROGRESS','TARGETED','2026-02-15','2026-05-15','00000000-0000-0000-0000-000000000004', 85, 160, 60)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. AÇIK BULGULAR (audit_findings) — Kaskad silme uyarısı için OPEN / devam eden statü
-- status NOT IN ('CLOSED','REMEDIATED','ARCHIVED') olan 3–4 bulgu.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.audit_findings (id, engagement_id, title, severity, status, state, details, impact_score, likelihood_score, gias_category, financial_impact) VALUES
  ('f1000000-0000-0000-0000-000000000001','52d72f07-e813-4cff-8218-4a64f7a3ba01','Murabaha emtia teyit belgelerinde eksiklik','HIGH','FINAL','IN_NEGOTIATION','{"condition":"Örneklemde 12 işlemde teyit belgesi 5+ iş günü gecikmeli.","criteria":"İç prosedür MRB-02.","recommendation":"Belge giriş süresini 3 iş günü ile sınırlayın."}'::jsonb, 4, 3, 'Uyum Riski', 250000),
  ('f1000000-0000-0000-0000-000000000002','52d72f07-e813-4cff-8218-4a64f7a3ba01','Havuz kar/zarar dağıtımında manuel müdahale riski','MEDIUM','DRAFT','DRAFT','{"condition":"Havuz hesaplama modülünde manuel düzeltme yetkisi geniş.","recommendation":"Yetki daraltma ve onay zinciri."}'::jsonb, 3, 3, 'Finansal Risk', 0),
  ('f1000000-0000-0000-0000-000000000003','52d72f07-e813-4cff-8218-4a64f7a3ba02','API BOLA zafiyeti (yetkisiz kayıt erişimi)','CRITICAL','FINAL','IN_NEGOTIATION','{"condition":"Test sırasında başka müşteri kaydına erişim tespit edildi.","criteria":"OWASP API Security.","recommendation":"Object-level yetkilendirme ve test."}'::jsonb, 5, 4, 'Teknolojik Risk', 1200000),
  ('f1000000-0000-0000-0000-000000000004','52d72f07-e813-4cff-8218-4a64f7a3ba02','Kritik yama gecikmesi (CVE-2025-xxxx)','HIGH','FINAL','IN_NEGOTIATION','{"condition":"90+ gün açık kalan kritik CVE.","recommendation":"Yama penceresini 30 güne düşürün."}'::jsonb, 4, 4, 'Teknolojik Risk', 500000)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. TEST: İZİN VE ÇAKIŞMA SENARYOSU (Gantt UX / ConflictWarningCard / Kaynak Tahsisi)
-- Denetçi: Murat Şen (00000000-0000-0000-0000-000000000003) — 0.3b auditor_profiles ile listelenir.
-- talent_absences: Aynı denetçi bugünden 5 günlük LEAVE (Gantt’ta gri izin bloğu).
-- audit_engagements: Aynı denetçi assigned_auditor_id ile örtüşen tarihlerde (ayın 10–20’si) 2 görev → çakışma uyarısı.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.talent_absences (id, tenant_id, user_id, start_date, end_date, absence_type, reason) VALUES
  ('a1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000003', CURRENT_DATE, (CURRENT_DATE + INTERVAL '4 days')::date, 'LEAVE', 'Test: İzin ve çakışma senaryosu için 5 günlük izin')
ON CONFLICT (id) DO NOTHING;

-- Aynı plan içinde (plan_id, entity_id) benzersiz; entity 032 ve 033 kullanıldı. Aynı denetçi (003) iki görevde → çakışma.
INSERT INTO public.audit_engagements (id, tenant_id, plan_id, entity_id, title, status, audit_type, start_date, end_date, assigned_auditor_id, risk_snapshot_score, estimated_hours, actual_hours) VALUES
  ('62d72f07-e813-4cff-8218-4a64f7a3ba01', '11111111-1111-1111-1111-111111111111', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000032', 'Çakışma Testi Görev A (10-20)', 'IN_PROGRESS', 'TARGETED', (date_trunc('month', CURRENT_DATE)::date + 9), (date_trunc('month', CURRENT_DATE)::date + 19), '00000000-0000-0000-0000-000000000003', 70, 80, 20),
  ('62d72f07-e813-4cff-8218-4a64f7a3ba02', '11111111-1111-1111-1111-111111111111', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000033', 'Çakışma Testi Görev B (10-20)', 'PLANNED', 'TARGETED', (date_trunc('month', CURRENT_DATE)::date + 9), (date_trunc('month', CURRENT_DATE)::date + 19), '00000000-0000-0000-0000-000000000003', 65, 60, 0)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 8. CCM ALARMLARI (ccm_alerts) — Canlı Tehdit / Siber Anomali Seed (İcraat 6.2)
-- AI Anomali Panelinde listelenir; status OPEN/INVESTIGATING.
-- Şema: 20260207210659 (metadata yok; rule_triggered CHECK: ... CUSTOM)
-- =============================================================================
INSERT INTO public.ccm_alerts (id, rule_triggered, risk_score, severity, title, description, evidence_data, status) VALUES
  (
    'c1000000-0000-0000-0000-000000000001',
    'UNUSUAL_HOURS',
    98,
    'CRITICAL',
    'Gece Yarısı Şüpheli Fon Transferi',
    'Saat 03:15''te uyuyan bir müşteri hesabından peş peşe 5 adet yüksek tutarlı Swift çıkışı denendi. AI Güven Skoru: %98. Kaynak: Core Banking DB.',
    '{}'::jsonb,
    'OPEN'
  ),
  (
    'c1000000-0000-0000-0000-000000000002',
    'CUSTOM',
    85,
    'HIGH',
    'Teverruk API Yetkisiz Erişim',
    'Emtia doğrulama servisine (API Gateway) yetkisiz IP bloklarından (BOLA saldırısı) erişim girişimi tespit edildi.',
    '{}'::jsonb,
    'INVESTIGATING'
  ),
  (
    'c1000000-0000-0000-0000-000000000003',
    'CUSTOM',
    82,
    'HIGH',
    'Murabaha Tahsis Limit Aşımı',
    'Bireysel Krediler modülünde, onay yetkisi olmayan bir kullanıcı (Gişe yetkilisi) tarafından limit üstü Murabaha tahsisi onaylanmaya çalışıldı.',
    '{}'::jsonb,
    'OPEN'
  ),
  (
    'c1000000-0000-0000-0000-000000000004',
    'CUSTOM',
    65,
    'MEDIUM',
    'Veritabanı Yığın Veri Çekimi (Data Exfiltration)',
    'Müşteri Master tablosundan son 10 dakika içinde normalin 40 katı büyüklüğünde SELECT sorgusu çalıştırıldı.',
    '{}'::jsonb,
    'OPEN'
  )
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- SLA Policies (sla_escalation_engine) — CAE tavan, adil SLA motoru
-- -----------------------------------------------------------------------------
INSERT INTO public.sla_policies (tenant_id, severity, max_delay_days, target_level)
VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'CRITICAL', 7,  3),
  ('11111111-1111-1111-1111-111111111111'::uuid, 'HIGH',     14, 3),
  ('11111111-1111-1111-1111-111111111111'::uuid, 'MEDIUM',   30, 3),
  ('11111111-1111-1111-1111-111111111111'::uuid, 'LOW',      60, 3)
ON CONFLICT (tenant_id, severity) DO NOTHING;

-- =============================================================================
-- THE GRAND SEED — C-Level Demo (Sıfır Mock Kuralı)
-- Strateji, Denetim Evreni, Görevler, Bulgular, Aksiyonlar, Eskalasyon, CCM, Raporlar
-- =============================================================================

-- -----------------------------------------------------------------------------
-- G1. EK STRATEJİK BANKA HEDEFLERİ (Dijital Kanallar, Siber Güvenlik)
-- -----------------------------------------------------------------------------
INSERT INTO public.strategic_bank_goals
  (id, tenant_id, title, description, period_year, weight, category, owner_executive, progress, risk_appetite, linked_audit_objective_ids)
VALUES
  (
    'b1000000-0000-0000-0000-000000000006'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Dijital Kanallarda Büyüme',
    'Mobil ve internet bankacılığı kanallarında müşteri sayısını ve işlem hacmini 2026 sonuna kadar %40 artırmak
ON CONFLICT DO NOTHING;
 BDDK Dijital Bankacılık rehberine tam uyum.',
    2026, 88, 'GROWTH', 'Genel Müdür Yardımcısı — Dijital Kanallar',
    35, 'Medium', '{}'
  ),
  (
    'b1000000-0000-0000-0000-000000000007'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Siber Güvenlik Olgunluğunun Artırılması',
    'BDDK BT Denetimi ve siber direnç rehberi kapsamında SIEM/SOC olgunluk seviyesini yükseltmek; yıllık sızma testi ve olay müdahale tatbikatlarını tamamlamak.',
    2026, 92, 'COMPLIANCE', 'BT Güvenlik Müdürü',
    50, 'High', '{}'
  )
ON CONFLICT (id) DO UPDATE SET progress = EXCLUDED.progress, risk_appetite = EXCLUDED.risk_appetite;

-- -----------------------------------------------------------------------------
-- G2. EK DENETİM GÖREVLERİ (2026 Hazine, Kredi Tahsis)
-- -----------------------------------------------------------------------------
INSERT INTO public.audit_engagements (id, tenant_id, plan_id, entity_id, title, status, audit_type, start_date, end_date, assigned_auditor_id, risk_snapshot_score, estimated_hours, actual_hours) VALUES
  ('52d72f07-e813-4cff-8218-4a64f7a3baf1', '11111111-1111-1111-1111-111111111111', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000012', '2026 Hazine Süreçleri Denetimi', 'IN_PROGRESS', 'COMPREHENSIVE', '2026-01-10', '2026-04-30', '00000000-0000-0000-0000-000000000003', 72, 240, 120),
  ('52d72f07-e813-4cff-8218-4a64f7a3baf2', '11111111-1111-1111-1111-111111111111', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000013', 'Kredi Tahsis Denetimi', 'COMPLETED', 'COMPREHENSIVE', '2025-09-01', '2025-11-30', '00000000-0000-0000-0000-000000000004', 68, 200, 195)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- G3. EK BULGULAR (SWIFT Maker-Checker CRITICAL, Kredi Teminat HIGH)
-- -----------------------------------------------------------------------------
INSERT INTO public.audit_findings (id, engagement_id, title, severity, status, state, details, impact_score, likelihood_score, gias_category, financial_impact) VALUES
  (
    'f8000000-0000-0000-0000-000000000001',
    '52d72f07-e813-4cff-8218-4a64f7a3baf1',
    'SWIFT Mesajlarında Çift Onay (Maker-Checker) İhlali',
    'CRITICAL', 'FINAL', 'FINAL',
    '{"condition":"Hazine işlemlerinde SWIFT MT103/MT202 mesajlarının bir kısmında tek yetkili ile gönderim yapıldığı
ON CONFLICT DO NOTHING;
 BDDK Ödeme Sistemleri rehberinde zorunlu maker-checker kuralı ihlal edilmiştir.","criteria":"BDDK Ödeme ve Menkul Kıymet Mutabakat Sistemleri; SWIFT CSP Kontrol Listesi","cause":"Acil işlem taleplerinde bypass prosedürü kötüye kullanılmış.","consequence":"Operasyonel risk, dolandırıcılık ve regülatör yaptırım riski.","recommendation":"Tüm SWIFT çıkışlarında zorunlu çift onay; bypass için CAE onayı ve loglama."}'::jsonb,
    5, 4, 'Operasyonel Risk', 12000000
  ),
  (
    'f8000000-0000-0000-0000-000000000002',
    '52d72f07-e813-4cff-8218-4a64f7a3baf2',
    'Kredi Teminat Girişlerinde Gecikme',
    'HIGH', 'FINAL', 'IN_NEGOTIATION',
    '{"condition":"Ticari kredi dosyalarında teminat değerleme ve sistem girişi ortalama 18 iş günü gecikmeli; 42 dosyada teminat güncellemesi 30+ gün aşılmış.","criteria":"BDDK Kredi Yönetimi rehberi; İç Kredi Politikası Bölüm 5 — Teminat Takibi","cause":"Teknik ekip yetersizliği ve önceliklendirme eksikliği.","consequence":"Kredi riski ölçümünde hata; yetersiz teminat nedeniyle kayıp riski.","recommendation":"Teminat güncelleme SLA (15 iş günü); otomasyon ve haftalık raporlama."}'::jsonb,
    4, 3, 'Kredi Riski', 2800000
  )
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- G4. AKSİYONLAR (Gecikmiş due_date — OVERDUE)
-- -----------------------------------------------------------------------------
INSERT INTO public.actions (
  id, tenant_id, finding_id, finding_snapshot, title, description,
  original_due_date, current_due_date, status, priority
) VALUES
  (
    'a8000000-0000-0000-0000-000000000001'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'f8000000-0000-0000-0000-000000000001'::uuid,
    '{"title":"SWIFT Mesajlarında Çift Onay (Maker-Checker) İhlali","severity":"CRITICAL","gias_category":"Operasyonel Risk"}'::jsonb,
    'SWIFT Maker-Checker zorunluluğunun sistemde etkinleştirilmesi',
    'Tüm SWIFT çıkış mesajları için ikinci onay (checker) rolü tanımlanacak
ON CONFLICT DO NOTHING;
 bypass sadece CAE onayı ile ve loglanacak.',
    (CURRENT_DATE - 45), (CURRENT_DATE - 20), 'OVERDUE', 'CRITICAL'
  ),
  (
    'a8000000-0000-0000-0000-000000000002'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'f8000000-0000-0000-0000-000000000002'::uuid,
    '{"title":"Kredi Teminat Girişlerinde Gecikme","severity":"HIGH","gias_category":"Kredi Riski"}'::jsonb,
    'Teminat güncelleme SLA ve otomasyon projesi',
    '15 iş günü SLA tanımı; haftalık eksik teminat raporu ve Kredi Yönetim Sistemi entegrasyonu.',
    (CURRENT_DATE - 60), (CURRENT_DATE - 15), 'OVERDUE', 'HIGH'
  )
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- G5. ESKALASYON KAYITLARI (CAE kararı: COMMITTEE_FLAGGED — YK'ya raporlanmış)
-- -----------------------------------------------------------------------------
INSERT INTO public.sla_escalation_logs (id, tenant_id, action_id, escalation_level, cae_decision, justification, triggered_at) VALUES
  ('e8000000-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'a8000000-0000-0000-0000-000000000001'::uuid, 3, 'COMMITTEE_FLAGGED', 'Kritik SWIFT kontrolü gecikmesi
ON CONFLICT DO NOTHING;
 Denetim Komitesi ve Yönetim Kuruluna bilgilendirme yapıldı. Takip raporu bir sonraki YK toplantısında sunulacak.', (CURRENT_TIMESTAMP - INTERVAL '10 days')),
  ('e8000000-0000-0000-0000-000000000002'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'a8000000-0000-0000-0000-000000000002'::uuid, 3, 'COMMITTEE_FLAGGED', 'Kredi teminat aksiyonu SLA ihlali; CAE kararı ile YK raporuna çekildi. Hazine ve Kredi birimleri ortak aksiyon planı sunacak.', (CURRENT_TIMESTAMP - INTERVAL '5 days'))
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- G6. CCM ALARMLARI (Açık — Gece Limit Dışı EFT, Aynı IP Çoklu Başarısız Giriş)
-- -----------------------------------------------------------------------------
INSERT INTO public.ccm_alerts (id, rule_triggered, risk_score, severity, title, description, evidence_data, status) VALUES
  ('c1000000-0000-0000-0000-000000000005', 'UNUSUAL_HOURS', 94, 'CRITICAL', 'Gece 03:00''te Limit Dışı EFT', 'Saat 03:12''te tek seferde 2.5M TL EFT işlemi gerçekleştirilmiştir. Günlük tek işlem limiti 1M TL. Kaynak: Core Banking.', '{}'::jsonb, 'OPEN'),
  ('c1000000-0000-0000-0000-000000000006', 'CUSTOM', 88, 'HIGH', 'Aynı IP''den Çoklu Başarısız Giriş', 'Aynı IP adresinden (10.128.x.x) son 15 dakikada 47 başarısız oturum açma denemesi tespit edildi. Olası brute-force veya kimlik bilgisi doldurma.', '{}'::jsonb, 'OPEN')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- G7. RAPORLAR (public.reports — Rapor Kütüphanesi tek kaynağı)
-- created_by, published_by, locked_by = NULL (auth.users FK yok; seed her ortamda çalışsın)
-- -----------------------------------------------------------------------------
INSERT INTO public.reports (id, tenant_id, engagement_id, title, description, status, theme_config, layout_type, created_by, published_at, published_by, locked_at, locked_by) VALUES
  (
    'd8000000-0000-0000-0000-000000000001'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '42d72f07-e813-4cff-8218-4a64f7a3baab'::uuid,
    '2026 Q1 Katılım Fonları Kar Dağıtım Denetim Raporu',
    'Katılım Fonları kar dağıtım süreçlerinin BDDK ve şeri uyum çerçevesinde denetim sonuçları. Mühürlü nihai rapor.',
    'published',
    '{"mode": "neon", "accent": "blue", "layout": "standard"}'::jsonb,
    'standard',
    NULL,
    (CURRENT_TIMESTAMP - INTERVAL '7 days'),
    NULL,
    (CURRENT_TIMESTAMP - INTERVAL '7 days'),
    NULL
  ),
  (
    'd8000000-0000-0000-0000-000000000002'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '42d72f07-e813-4cff-8218-4a64f7a3baac'::uuid,
    'Kritik BT Sistemleri Sızma Testi — Taslak Rapor',
    'Sızma testi ve ayrıcalıklı erişim denetimi taslak raporu
ON CONFLICT DO NOTHING;
 CAE incelemesi bekleniyor.',
    'draft',
    '{"mode": "neon", "accent": "blue", "layout": "standard"}'::jsonb,
    'standard',
    NULL,
    NULL, NULL, NULL, NULL
  ),
  (
    'd8000000-0000-0000-0000-000000000003'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '42d72f07-e813-4cff-8218-4a64f7a3baad'::uuid,
    'Kadıköy Şubesi 2025 Yılı İkinci Yarı Operasyon Denetim Raporu',
    'Kadıköy Şubesi operasyonel süreçlerinin kapsamlı denetimi. Kredi onay matrisi, KYC ve nakit yönetimi kapsam dahilinde.',
    'review',
    '{"mode": "neon", "accent": "blue", "layout": "standard"}'::jsonb,
    'standard',
    NULL,
    NULL, NULL, NULL, NULL
  )
ON CONFLICT (id) DO NOTHING;

-- G7b. report_blocks — Rapor editöründe görünecek bloklar (reports tablosuna bağlı)
INSERT INTO public.report_blocks (id, tenant_id, report_id, position_index, parent_block_id, depth_level, block_type, content) VALUES
  ('d9000000-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'd8000000-0000-0000-0000-000000000001'::uuid, 0, NULL, 0, 'heading', '{"text": "Yönetici Özeti", "level": 1}'::jsonb),
  ('d9000000-0000-0000-0000-000000000002'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'd8000000-0000-0000-0000-000000000001'::uuid, 1, NULL, 0, 'paragraph', '{"text": "Katılım fonları kar dağıtım süreçleri BDDK ve şeri uyum çerçevesinde incelenmiş olup genel kontrol ortamı güçlü bulunmuştur. Tespit edilen iyileştirme alanları yönetimce kabul edilmiş ve aksiyon planları oluşturulmuştur."}'::jsonb),
  ('d9000000-0000-0000-0000-000000000003'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'd8000000-0000-0000-0000-000000000002'::uuid, 0, NULL, 0, 'heading', '{"text": "Sızma Testi Kapsam ve Metodoloji", "level": 1}'::jsonb),
  ('d9000000-0000-0000-0000-000000000004'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'd8000000-0000-0000-0000-000000000002'::uuid, 1, NULL, 0, 'paragraph', '{"text": "Kritik BT sistemlerine yönelik sızma testi ve ayrıcalıklı erişim denetimi CAE incelemesi beklemektedir. Taslak rapor iç denetim ekibi tarafından hazırlanmıştır."}'::jsonb),
  ('d9000000-0000-0000-0000-000000000005'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'd8000000-0000-0000-0000-000000000003'::uuid, 0, NULL, 0, 'heading', '{"text": "Denetim Görüşü", "level": 1}'::jsonb),
  ('d9000000-0000-0000-0000-000000000006'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'd8000000-0000-0000-0000-000000000003'::uuid, 1, NULL, 0, 'paragraph', '{"text": "Kadıköy Şubesi 2025 yılı ikinci yarı operasyon denetimi incelemede olup Yönetim Kurulu sunumuna hazırlanmaktadır."}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- G7c. ZENGİN DEMO RAPORLARI (report_type, report_grade ile — migration sonrası)
-- -----------------------------------------------------------------------------
INSERT INTO public.reports (id, tenant_id, engagement_id, title, description, status, theme_config, layout_type, created_by, published_at, published_by, locked_at, locked_by, report_type, report_grade) VALUES
  ('d8000000-0000-0000-0000-000000000004'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '42d72f07-e813-4cff-8218-4a64f7a3baac'::uuid, '2026 Siber Güvenlik Sızma Testi Raporu', 'Kritik BT altyapısına yönelik sızma testi ve zafiyet taraması sonuçları. Gelişim alanları tespit edildi.', 'published', '{"mode": "neon", "accent": "blue", "layout": "standard"}'::jsonb, 'standard', NULL, (CURRENT_TIMESTAMP - INTERVAL '5 days'), NULL, (CURRENT_TIMESTAMP - INTERVAL '5 days'), NULL, 'Bilgi Sistemleri', 'C (Gelişim Alanı)'),
  ('d8000000-0000-0000-0000-000000000005'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '42d72f07-e813-4cff-8218-4a64f7a3baab'::uuid, 'Bireysel Krediler Tahsis Süreci Denetimi', 'Bireysel kredi tahsis süreçlerinin politika ve limit uyumluluğu denetimi. CAE incelemesi bekleniyor.', 'review', '{"mode": "neon", "accent": "blue", "layout": "standard"}'::jsonb, 'standard', NULL, NULL, NULL, NULL, NULL, 'Süreç Denetimi', NULL),
  ('d8000000-0000-0000-0000-000000000006'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '42d72f07-e813-4cff-8218-4a64f7a3baae'::uuid, 'Hazine Türev İşlemleri İncelemesi', 'Türev ürünler ve hedge işlemlerinin BDDK ve kurumsal politika uyumu. Güçlü kontrol ortamı tespit edildi.', 'published', '{"mode": "neon", "accent": "blue", "layout": "standard"}'::jsonb, 'standard', NULL, (CURRENT_TIMESTAMP - INTERVAL '14 days'), NULL, (CURRENT_TIMESTAMP - INTERVAL '14 days'), NULL, 'İnceleme/Soruşturma', 'A (Güçlü)'),
  ('d8000000-0000-0000-0000-000000000007'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '42d72f07-e813-4cff-8218-4a64f7a3baad'::uuid, 'Şube Operasyonları 1. Çeyrek Denetim Raporu', 'Şube operasyonları, nakit yönetimi ve müşteri işlemleri kapsamında taslak rapor.', 'draft', '{"mode": "neon", "accent": "blue", "layout": "standard"}'::jsonb, 'standard', NULL, NULL, NULL, NULL, NULL, 'İç Denetim Raporu', NULL),
  ('d8000000-0000-0000-0000-000000000008'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '42d72f07-e813-4cff-8218-4a64f7a3baab'::uuid, 'Eski Suistimal Raporu (İptal)', 'Hata ve eksiklik nedeniyle geçersiz kılındı
ON CONFLICT DO NOTHING;
 zeyilname yayımlandı.', 'REVOKED_AMENDED', '{"mode": "neon", "accent": "blue", "layout": "standard"}'::jsonb, 'standard', NULL, (CURRENT_TIMESTAMP - INTERVAL '90 days'), NULL, NULL, NULL, 'İnceleme/Soruşturma', NULL),
  ('d8000000-0000-0000-0000-000000000009'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '42d72f07-e813-4cff-8218-4a64f7a3baae'::uuid, 'KYC ve Müşteri Tanıma Uyum Denetimi', 'Müşteri tanıma ve KYC süreçlerinin 5549 sayılı Kanun ve BDDK düzenlemelerine uyumu. Yeterli kontrol ortamı.', 'published', '{"mode": "neon", "accent": "blue", "layout": "standard"}'::jsonb, 'standard', NULL, (CURRENT_TIMESTAMP - INTERVAL '3 days'), NULL, (CURRENT_TIMESTAMP - INTERVAL '3 days'), NULL, 'Uyum Denetimi', 'B (Yeterli)')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- G7d. RAPORLAR — Hassas Skor, Önceki Not, Risk Seviyesi (migration 20260312000000 sonrası)
-- -----------------------------------------------------------------------------
UPDATE public.reports SET precise_score = 85.5, previous_grade = 'A (Güçlü)', risk_level = 'low'   WHERE id = 'd8000000-0000-0000-0000-000000000001'::uuid;
UPDATE public.reports SET precise_score = 72.0, previous_grade = 'B (Yeterli)', risk_level = 'high'  WHERE id = 'd8000000-0000-0000-0000-000000000002'::uuid;
UPDATE public.reports SET precise_score = 78.0, previous_grade = 'B (Yeterli)', risk_level = 'medium' WHERE id = 'd8000000-0000-0000-0000-000000000003'::uuid;
UPDATE public.reports SET precise_score = 68.5, previous_grade = 'C (Gelişim Alanı)', risk_level = 'high'  WHERE id = 'd8000000-0000-0000-0000-000000000004'::uuid;
UPDATE public.reports SET precise_score = 81.0, previous_grade = NULL, risk_level = 'medium' WHERE id = 'd8000000-0000-0000-0000-000000000005'::uuid;
UPDATE public.reports SET precise_score = 92.0, previous_grade = 'A (Güçlü)', risk_level = 'low'   WHERE id = 'd8000000-0000-0000-0000-000000000006'::uuid;
UPDATE public.reports SET precise_score = 65.0, previous_grade = NULL, risk_level = 'medium' WHERE id = 'd8000000-0000-0000-0000-000000000007'::uuid;
UPDATE public.reports SET precise_score = NULL, previous_grade = NULL, risk_level = 'high'  WHERE id = 'd8000000-0000-0000-0000-000000000008'::uuid;
UPDATE public.reports SET precise_score = 79.5, previous_grade = 'B (Yeterli)', risk_level = 'low'   WHERE id = 'd8000000-0000-0000-0000-000000000009'::uuid;


-- =============================================================================
-- SEED: Sentinel Task Command — task_lists & sentinel_tasks (Wave 11)
-- Bağımlılık sırası: task_lists önce, sentinel_tasks sonra (FK: list_id)
-- =============================================================================

-- ── Akıllı Listeler ───────────────────────────────────────────────────────────
INSERT INTO public.task_lists (id, name, icon, color, is_smart, smart_filter, sort_order) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Günüm',       '☀️',  '#f59e0b', TRUE,  '{"is_my_day": true}'::JSONB,      0),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Önemli',      '⭐',  '#ef4444', TRUE,  '{"is_important": true}'::JSONB,   1),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'Planlı',      '📅',  '#6366f1', TRUE,  '{"has_due_date": true}'::JSONB,   2),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'Tüm Görevler','📋', '#64748b', TRUE,  '{}'::JSONB,                        3),
  ('aaaaaaaa-0000-0000-0000-000000000005', 'Denetim',     '🔍',  '#0891b2', FALSE, '{}'::JSONB,                        4),
  ('aaaaaaaa-0000-0000-0000-000000000006', 'Kişisel',     '👤',  '#8b5cf6', FALSE, '{}'::JSONB,                        5)
ON CONFLICT (id) DO NOTHING;

-- ── Görevler (Basit + Bağlamsal / Linked) ─────────────────────────────────────
INSERT INTO public.sentinel_tasks
  (title, notes, list_id, is_important, is_my_day, due_date, status, linked_entity_type, linked_entity_id, linked_entity_label, sort_order)
VALUES
  -- Günlük / Kişisel görevler
  ('Ekip toplantısı için ajanda hazırla',      'Haftalık denetim koordinasyon toplantısı saat 10:00', 'aaaaaaaa-0000-0000-0000-000000000006', FALSE, TRUE,  '2026-03-07', 'pending',   NULL,         NULL,                                   NULL,                0),
  ('BDDK raporunu Genel Müdür''e ilet',         'Q1 denetim faaliyet raporu son hali gönderilecek',   'aaaaaaaa-0000-0000-0000-000000000005', TRUE,  TRUE,  '2026-03-07', 'pending',   NULL,         NULL,                                   NULL,                1),
  ('CPE eğitim modülünü tamamla',              'IIA Türkiye — Risk Odaklı Denetim sertifikası',      'aaaaaaaa-0000-0000-0000-000000000006', FALSE, FALSE, '2026-03-14', 'pending',   NULL,         NULL,                                   NULL,                2),
  ('Ekip performans değerlendirmesini doldur', NULL,                                                  'aaaaaaaa-0000-0000-0000-000000000006', FALSE, FALSE, '2026-03-10', 'pending',   NULL,         NULL,                                   NULL,                3),
  ('VPN erişim iznini yenile',                 'IT Güvenlik portalından talep açılacak',              'aaaaaaaa-0000-0000-0000-000000000006', FALSE, FALSE, NULL,          'completed', NULL,         NULL,                                   NULL,                4),
  -- Bağlamsal / Denetim Görevi (linked_entity)
  ('Kredi riski çalışma kağıdını tamamla',     'Örnekleme testi tamamlandı, sonuçlar girilecek',     'aaaaaaaa-0000-0000-0000-000000000005', TRUE,  TRUE,  '2026-03-08', 'pending',   'workpaper',  '00000000-0000-0000-0000-000000000101',  'WP-2026-KRD-01',    0),
  ('Bulgu B-2024-047 aksiyon planını gözden geçir','Aksiyon sahibi yanıt süresini aştı',             'aaaaaaaa-0000-0000-0000-000000000005', TRUE,  FALSE, '2026-03-09', 'pending',   'finding',    '00000000-0000-0000-0000-000000000201',  'B-2024-047',        1),
  ('IT denetimi kanıtlarını yükle',            'Supabase Storage''a 3 log dosyası yüklenecek',        'aaaaaaaa-0000-0000-0000-000000000005', FALSE, TRUE,  '2026-03-07', 'pending',   'workpaper',  '00000000-0000-0000-0000-000000000102',  'WP-2026-IT-03',     2),
  ('Şube denetimi son raporunu imzala',        'CAE imzası bekleniyor',                               'aaaaaaaa-0000-0000-0000-000000000005', TRUE,  FALSE, '2026-03-11', 'pending',   'engagement', '00000000-0000-0000-0000-000000000301',  'ENG-2026-SUB-01',   3),
  ('Planlama matrisini güncelle',              NULL,                                                   'aaaaaaaa-0000-0000-0000-000000000005', FALSE, FALSE, '2026-03-15', 'pending',   NULL,         NULL,                                   NULL,                4)
ON CONFLICT DO NOTHING;


-- =============================================================================
-- SEED: Grand Purge — Migration'lardan taşınan statik referans verileri
-- Bağımlılık sırası: system_definitions → system_parameters → storage.buckets
-- =============================================================================

-- ── system_definitions: Risk seviyeleri (20260202204014'ten taşındı) ──────────
INSERT INTO public.system_definitions (category, code, label, color, sort_order) VALUES
  ('RISK_LEVEL', 'CRITICAL',    'Kritik',  '#dc2626', 1),
  ('RISK_LEVEL', 'HIGH',        'Yüksek',  '#ea580c', 2),
  ('RISK_LEVEL', 'MEDIUM',      'Orta',    '#f59e0b', 3),
  ('RISK_LEVEL', 'LOW',         'Düşük',   '#10b981', 4),
  ('RISK_LEVEL', 'OBSERVATION', 'Gözlem',  '#3b82f6', 5)
ON CONFLICT (tenant_id, category, code) DO NOTHING;

-- ── system_definitions: Bulgu durum tanımları (20260202204014'ten taşındı) ────
INSERT INTO public.system_definitions (category, code, label, color, sort_order) VALUES
  ('FINDING_STATE', 'DRAFT',           'Taslak',               '#64748b', 1),
  ('FINDING_STATE', 'IN_NEGOTIATION',  'Müzakerede',           '#f59e0b', 2),
  ('FINDING_STATE', 'AGREED',          'Üzerinde Anlaşıldı',   '#3b82f6', 3),
  ('FINDING_STATE', 'DISPUTED',        'İtiraz Edildi',        '#ef4444', 4),
  ('FINDING_STATE', 'FINAL',           'Kesinleşti',           '#8b5cf6', 5),
  ('FINDING_STATE', 'REMEDIATED',      'Düzeltildi',           '#10b981', 6)
ON CONFLICT (tenant_id, category, code) DO NOTHING;

-- ── system_parameters: Varsayılan sistem parametreleri (20260205182132'ten taşındı) ──
INSERT INTO public.system_parameters (key, value, description, category) VALUES
  ('risk_weights',            '{"impact": 50, "likelihood": 50}'::jsonb,                                    'Default risk calculation weights',          'risk'),
  ('grading_thresholds',      '{"A": 90, "B": 80, "C": 70, "D": 60, "F": 0}'::jsonb,                      'Audit grading thresholds',                  'grading'),
  ('finding_severity_points', '{"CRITICAL": 25, "HIGH": 15, "MEDIUM": 10, "LOW": 5, "OBSERVATION": 2}'::jsonb, 'Points deducted per finding severity',  'grading'),
  ('auto_assign_rules',       '{"enabled": false, "load_balance": true}'::jsonb,                           'Automatic workpaper assignment rules',       'workflow'),
  ('notification_settings',   '{"email_enabled": true, "slack_enabled": false}'::jsonb,                    'System notification preferences',           'notifications')
ON CONFLICT (key) DO NOTHING;

-- ── storage.buckets: Evidence Vault bucket (20260308000000'dan taşındı) ───────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evidence-vault',
  'evidence-vault',
  false,
  52428800,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public          = false,
  file_size_limit = 52428800;

-- ── Wave 13: Strategy & Universe Alignment (Neural Map) ─────────
INSERT INTO public.strategy_universe_alignment (id, goal_id, universe_node_id, alignment_score) VALUES
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000012', 100), -- Yeşil Sukuk -> Hazine
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000011', 80),  -- Yeşil Sukuk -> Uyum ve MASAK
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000100', 100), -- Dijital Teverruk -> Bireysel Bankacılık
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000102', 90),  -- Dijital Teverruk -> Murabaha
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000100', 95),  -- Dijital Kanallar -> Bireysel Bankacılık
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000101', 85),  -- Dijital Kanallar -> Kredi Kartları
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000103', 100), -- Siber Güvenlik -> Siber Güvenlik Process
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000010', 80)   -- Siber Güvenlik -> Risk Yönetimi
ON CONFLICT (goal_id, universe_node_id) DO NOTHING;

-- ── 20260206165647_create_workpaper_detail_tables.sql Seed Data ──
DO $$
DECLARE
  v_wp_id UUID;
BEGIN
  SELECT id INTO v_wp_id FROM workpapers LIMIT 1;

  IF v_wp_id IS NOT NULL THEN
    INSERT INTO workpaper_test_steps (workpaper_id, step_order, description, is_completed, auditor_comment) VALUES
      (v_wp_id, 1, 'Kredi dosyalarından rastgele 25 adet seçin ve dosya bütünlüğünü kontrol edin.', true, 'Tamamlandı - 25 dosya incelendi, 2 dosyada eksiklik tespit edildi.'),
      (v_wp_id, 2, 'Seçilen dosyalardaki teminat değerlemelerinin güncelliğini doğrulayın.', true, '23 dosyada güncel, 2 dosyada 6 aydan eski değerleme mevcut.'),
      (v_wp_id, 3, 'Kredi onay yetkilerinin yetki matrisine uygunluğunu test edin.', false, ''),
      (v_wp_id, 4, 'Limit aşımı olan kredilerin yönetim kurulu onaylarını kontrol edin.', false, ''),
      (v_wp_id, 5, 'Takipteki krediler için karşılık hesaplamalarının doğruluğunu analiz edin.', false, '');

    INSERT INTO evidence_requests (workpaper_id, title, description, status, due_date) VALUES
      (v_wp_id, 'Mart 2026 Genel Mizan', 'Genel muhasebe mizanının tam dökümü gereklidir.', 'submitted', now() + interval '3 days'),
      (v_wp_id, 'Kredi Komitesi Toplantı Tutanakları', 'Son 3 aylık kredi komitesi karar tutanakları.', 'pending', now() + interval '5 days'),
      (v_wp_id, 'Teminat Değerleme Raporları', 'Seçilen 25 kredi dosyasına ait ekspertiz raporları.', 'pending', now() + interval '7 days'),
      (v_wp_id, 'Yetki Matrisi Güncel Kopya', 'Kredi tahsis ve onay yetki matrisinin güncel versiyonu.', 'accepted', now() - interval '2 days');
  END IF;
END $$;

-- ── 20260206174056_add_workpaper_findings_and_signoff.sql Seed Data ──
DO $$
DECLARE
  v_wp_id UUID;
BEGIN
  SELECT id INTO v_wp_id FROM workpapers LIMIT 1;

  IF v_wp_id IS NOT NULL THEN
    INSERT INTO workpaper_findings (workpaper_id, title, description, severity, source_ref) VALUES
      (v_wp_id, 'Eksik Teminat Değerlemesi', '2 kredi dosyasında teminat değerlemesinin 6 aydan eski olduğu tespit edilmiştir. BDDK düzenlemelerine göre yıllık güncelleme zorunludur.', 'HIGH', 'Test Step 2'),
      (v_wp_id, 'Dosya Eksikliği', 'İncelenen 25 dosyanın 2 tanesinde zorunlu kredi başvuru formlarının eksik olduğu görülmüştür.', 'MEDIUM', 'Test Step 1');
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- G8. BOARD BRIEFING İÇİN KABUL EDİLEN RİSKLER (WAIVED) SENARYOSU
-- -----------------------------------------------------------------------------
INSERT INTO public.audit_findings (id, engagement_id, title, severity, status, state, details, impact_score, likelihood_score, gias_category, financial_impact) VALUES
  (
    'f8000000-0000-0000-0000-000000000003',
    '52d72f07-e813-4cff-8218-4a64f7a3baf1',
    'Legacy Sistem Sunucu Versiyonu',
    'MEDIUM', 'FINAL', 'FINAL',
    '{"condition":"Hazine tarafında kullanılan legacy raporlama modülünde 10 yıllık sunucu versiyonu kullanılmaktadır.","recommendation":"Sunucu versiyonunun acilen güncellenmesi gerekmektedir."}'::jsonb,
    3, 3, 'Teknolojik Risk', 0
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.actions (
  id, tenant_id, finding_id, finding_snapshot, title, description,
  original_due_date, current_due_date, status, priority
) VALUES
  (
    'a8000000-0000-0000-0000-000000000003'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'f8000000-0000-0000-0000-000000000003'::uuid,
    '{"title":"Legacy Sistem Sunucu Versiyonu","severity":"MEDIUM","gias_category":"Teknolojik Risk"}'::jsonb,
    'Sunucu yükseltme maliyeti nedeniyle risk kabulü',
    'Yönetim Kurulu kararı ile sistemin 2 yıl sonra tamamen yenilenmesi planlandığından, mevcut sunucu riski kabul edilmiştir.',
    (CURRENT_DATE - 30), (CURRENT_DATE - 30), 'WAIVED', 'MEDIUM'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 15. TALENT-OS USER MAPPINGS AND CERTIFICATIONS
-- =============================================================================
-- Update talent_profiles with matching user_ids for certifications to work
UPDATE talent_profiles SET user_id = '00000000-0000-0000-0000-000000000004' WHERE full_name = 'Elif Kaya';
UPDATE talent_profiles SET user_id = '00000000-0000-0000-0000-000000000003' WHERE full_name = 'Mert Demir';
UPDATE talent_profiles SET user_id = '00000000-0000-0000-0000-000000000005' WHERE full_name = 'Zeynep Arslan';
UPDATE talent_profiles SET user_id = '00000000-0000-0000-0000-000000000010' WHERE full_name = 'Burak Yilmaz';
UPDATE talent_profiles SET user_id = '00000000-0000-0000-0000-000000000011' WHERE full_name = 'Selin Ozturk';

-- Insert realistic certifications
INSERT INTO user_certifications (id, user_id, name, issuer, status, issue_date, expiry_date, credential_url) VALUES 
(gen_random_uuid(), '00000000-0000-0000-0000-000000000004', 'CIA (Certified Internal Auditor)', 'IIA', 'VERIFIED', '2020-05-15', '2026-05-15', 'https://credential.net/cia'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000004', 'CISA (Certified Information Systems Auditor)', 'ISACA', 'VERIFIED', '2021-08-20', '2027-08-20', 'https://credential.net/cisa'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000003', 'CRISC (Certified in Risk and Information Systems Control)', 'ISACA', 'VERIFIED', '2019-11-10', '2025-11-10', 'https://credential.net/crisc'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000003', 'SMMM (Serbest Muhasebeci Mali Müşavir)', 'TÜRMOB', 'VERIFIED', '2018-04-05', '2030-01-01', 'https://credential.net/smmm'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000005', 'CFE (Certified Fraud Examiner)', 'ACFE', 'VERIFIED', '2022-09-30', '2026-09-30', 'https://credential.net/cfe'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000010', 'SPK Düzey 3 Lisansı', 'SPL', 'VERIFIED', '2017-02-14', '2030-01-01', 'https://credential.net/spk'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000010', 'TKBB Sertifikası', 'TKBB', 'VERIFIED', '2023-01-20', '2028-01-20', 'https://credential.net/tkbb'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000011', 'CIA (Certified Internal Auditor)', 'IIA', 'VERIFIED', '2016-10-10', '2026-10-10', 'https://credential.net/cia2')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 16. CCM (PREDATOR COCKPIT) SEED DATA
-- =============================================================================

INSERT INTO ccm_alerts (id, rule_triggered, risk_score, severity, title, description, status, evidence_data, related_entity_id) VALUES
(gen_random_uuid(), 'UNUSUAL_HOURS', 95, 'CRITICAL', 'Gece Yarısı Yetkisiz Şifre Değişikliği ve Giriş', 'Normal çalışma saatleri dışında (03:15 AM) kritik finans modülüne admin girişi ve şifre değişikliği tespit edildi.', 'OPEN', '{"ip": "192.168.1.105", "action": "password_reset", "time": "03:15:00"}', 'USR-0992'),
(gen_random_uuid(), 'BENFORD_VIOLATION', 88, 'HIGH', 'Benford Kanununa Uymayan Şüpheli Ters Bakiye', 'Tedarikçi ödemelerinde (SAP_ERP) baş harf dağılımı Benford Kanunu beklentilerinden %45 sapma gösterdi. Suni olarak bölünmüş (Structuring) işlemler?', 'OPEN', '{"chi_square": 156.4, "p_value": 0.0001, "expected_1": "30%", "actual_1": "11%"}', 'VND-3011'),
(gen_random_uuid(), 'GHOST_EMPLOYEE', 92, 'CRITICAL', 'Hayalet Çalışan Maaş Ödemesi (Ghost Employee)', 'T24 Core Banking üzerinden pasif statüdeki/işten ayrılmış bir personele düzenli maaş ödemesi çıkışı tespit edildi.', 'INVESTIGATING', '{"employee_id": "HR-9921", "status": "TERMINATED", "salary_paid": 45000}', 'HR-9921'),
(gen_random_uuid(), 'DUPLICATE_PAYMENT', 75, 'MEDIUM', 'Mükerrer Fatura Ödemesi', 'Aynı gün içinde aynı tedarikçiye kuruşu kuruşuna eşit iki farklı ödeme çıkışı.', 'OPEN', '{"amount": 125000.50, "vendor": "TechSupply A.Ş.", "tx_1": "TXN-881", "tx_2": "TXN-882"}', 'VND-1055'),
(gen_random_uuid(), 'STRUCTURING', 85, 'HIGH', 'Şüpheli Yapılandırma (Smurfing)', 'Kimlik bildirimi eşiğinin (50,000 TL) hemen altında (49,850 TL) arka arkaya 4 adet yapılandırılmış transfer işlemi.', 'OPEN', '{"threshold": 50000, "tx_count": 4, "total_amount": 199400}', 'CUST-8812')
ON CONFLICT DO NOTHING;

INSERT INTO ccm_transactions (id, source_system, transaction_date, amount, currency, user_id, beneficiary, transaction_type) VALUES
(gen_random_uuid(), 'SAP_ERP', (CURRENT_TIMESTAMP - interval '2 hours'), 49850.00, 'TRY', 'USR-109', 'CUST-8812', 'TRANSFER'),
(gen_random_uuid(), 'SAP_ERP', (CURRENT_TIMESTAMP - interval '3 hours'), 49800.00, 'TRY', 'USR-109', 'CUST-8812', 'TRANSFER'),
(gen_random_uuid(), 'SAP_ERP', (CURRENT_TIMESTAMP - interval '4 hours'), 49900.00, 'TRY', 'USR-109', 'CUST-8812', 'TRANSFER'),
(gen_random_uuid(), 'T24', (CURRENT_TIMESTAMP - interval '1 day'), 125000.50, 'TRY', 'SYS-AUTO', 'TechSupply A.Ş.', 'PAYMENT'),
(gen_random_uuid(), 'T24', (CURRENT_TIMESTAMP - interval '1 day'), 125000.50, 'TRY', 'SYS-AUTO', 'TechSupply A.Ş.', 'PAYMENT'),
(gen_random_uuid(), 'HR_SYSTEM', (CURRENT_TIMESTAMP - interval '5 days'), 45000.00, 'TRY', 'HR-ADMIN', 'HR-9921', 'PAYMENT')
ON CONFLICT DO NOTHING;


-- =============================================================================
-- 17. WAVE 17: SHARIAH RULINGS (AAOIFI STANDARDS FATWA-GPT RAG MOTORU)
-- =============================================================================

INSERT INTO public.shariah_rulings (id, standard_no, standard_name, section, article_no, text, ruling, risk_level, keywords, "references") VALUES
('a0000000-0000-0000-0000-000000000001', '8', 'Murabaha', 'Geçerlilik Şartları', '2/1/3', 'Kurum, emtiayı (varlığı) müşteriye satmadan önce mülkiyetine almalı ve fiili veya hükmi zilyetliği ele geçirmelidir. Mülkiyetten önce satış, akdi batıl (geçersiz) kılar.', 'mandatory', 'critical', '{"mülkiyet", "zilyetlik", "emtia", "satış", "batıl", "geçersiz"}', '{"Hadis: ''Sahip olmadığın şeyi satma'' (Tirmizi 1232)"}'),
('a0000000-0000-0000-0000-000000000002', '8', 'Murabaha', 'Satın Alma Vaadi', '3/1', 'Müşterinin tek taraflı satın alma vaadi (va''d), çoğunluk görüşüne göre vaad vereni bağlar. Kurum, müşteri haklı sebep olmaksızın vaadinden dönerse fiili zararlarının tazminini talep edebilir.', 'permissible', 'medium', '{"vaad", "va''d", "bağlayıcı", "ihlal", "zarar", "tazminat"}', '{"İslam Fıkıh Akademisi Kararı 40-41"}'),
('a0000000-0000-0000-0000-000000000003', '8', 'Murabaha', 'Risk ve Sorumluluk', '4/2', 'Kurum, satın alma ile müşteriye teslimat arasındaki dönemde emtiaya ilişkin tüm riskleri üstlenir. Bu, tahribat, ayıp veya piyasa fiyat dalgalanmasını içerir.', 'mandatory', 'high', '{"risk", "sorumluluk", "tahribat", "ayıp", "fiyat dalgalanması"}', '{}'),
('a0000000-0000-0000-0000-000000000004', '8', 'Murabaha', 'Fiyat Bileşimi', '5/3/1', 'Satış fiyatı açıkça belirtilmelidir
ON CONFLICT DO NOTHING;
 maliyet fiyatı artı kar marjından oluşur. Gizli masraflar veya belirsiz maliyet unsurları, şeffaflık gereksinimini (garar) ihlal eder.', 'mandatory', 'high', '{"fiyat", "maliyet", "kar", "marj", "şeffaflık", "garar", "açıklama"}', '{}'),

('a0000000-0000-0000-0000-000000000005', '30', 'Teverruk', 'Organize Teverruk', '2/2', 'Organize Teverruk (Teverruk Munazzam), emtia asıl satıcıya geri dönerse veya kurum tüm zinciri düzenlerse CAİZ DEĞİLDİR. Bu, faiz yasağını dolanmak için bir hukuki hile (hile) teşkil eder.', 'prohibited', 'critical', '{"organize teverruk", "munazzam", "yasaklanmış", "hile", "faiz", "dolanma", "döngüsel"}', '{"İİT Fıkıh Akademisi Kararı 179 (19/5)"}'),
('a0000000-0000-0000-0000-000000000006', '30', 'Teverruk', 'Klasik Teverruk', '3/1', 'Klasik Teverruk şu şartlarda caizdir: (1) müşteri emtiayı bağımsız olarak tedarik eder, (2) gerçek zilyetliği ele geçirir ve (3) kurumsal düzenleme olmaksızın üçüncü tarafa satar. Kurum ikinci satışa dahil olmamalıdır.', 'permissible', 'low', '{"klasik", "bağımsız", "zilyetlik", "üçüncü taraf", "caiz"}', '{}'),

('a0000000-0000-0000-0000-000000000007', '17', 'Sukuk', 'Varlık Mülkiyeti', '2/1/1', 'Sukuk sahipleri, dayanak varlıkların GERÇEK ve ORANTILI mülkiyetine sahip olmalıdır. Gerçek risk paylaşımı olmaksızın hükmi veya nominal mülkiyet caiz değildir. Varlıklar şer''i uyumlu ve tanımlanabilir olmalıdır.', 'mandatory', 'critical', '{"sukuk", "mülkiyet", "gerçek", "orantılı", "hükmi", "risk paylaşımı", "varlıklar"}', '{"AAOIFI Şer''i Standart No. 17"}'),
('a0000000-0000-0000-0000-000000000008', '17', 'Sukuk', 'İtfa Koşulları', '4/3', 'İhraççı, vade sonunda anapara tutarını garanti edemez. Piyasa değeri veya net varlık değeri üzerinden satın alma taahhüdü (va''d) caizdir, ancak nominal değer üzerinden garantili geri alım, sukuku bir borç enstrümanına (Faiz) dönüştürür.', 'prohibited', 'critical', '{"itfa", "garanti", "anapara", "geri alım", "nominal değer", "borç", "faiz"}', '{}'),
('a0000000-0000-0000-0000-000000000009', '17', 'Sukuk', 'Kar Dağıtımı', '5/2', 'Kar dağıtımı, dayanak varlıkların fiili performansını yansıtmalıdır. Varlık performansına bağlı olmayan önceden belirlenmiş sabit getiriler, konvansiyonel faize (Riba al-Nesie) benzediği için yasaktır.', 'prohibited', 'critical', '{"kar", "dağıtım", "sabit", "getiri", "önceden belirlenmiş", "faiz", "riba"}', '{}'),

('a0000000-0000-0000-0000-000000000010', '9', 'İcara', 'Mülkiyet ve Bakım', '3/1/2', 'Kiraya veren (kurum), kiralanan varlığın mülkiyetini elinde tutmalı ve büyük bakım maliyetlerini üstlenmelidir. Mülkiyet unvanını korurken mülkiyet risklerini kiracıya devretmek caiz değildir.', 'mandatory', 'high', '{"icara", "kiraya veren", "mülkiyet", "bakım", "büyük onarımlar", "kiracı"}', '{}'),
('a0000000-0000-0000-0000-000000000011', '9', 'İcara', 'Kira Belirleme', '4/5', 'Kira tutarları sabit veya değişken (kıyaslamalı) olabilir, ancak faiz oranlarına (LIBOR, SOFR) bağlanamaz çünkü bu faiz riski yaratır. Varlık performansına dayalı alternatif kıyaslamalar kabul edilebilir.', 'prohibited', 'high', '{"kira", "sabit", "değişken", "kıyaslama", "libor", "faiz", "riba"}', '{}'),
('a0000000-0000-0000-0000-000000000012', '9', 'İcara', 'İcara Müntehiye Bi''t-Temlik', '6/1', 'Mülkiyet devri ile sonuçlanan kiralama (İcara Müntehiye Bi''t-Temlik), mülkiyet devrinin şu yollarla gerçekleşmesi halinde caizdir: (1) son ödeme sonrası hibe, (2) sembolik/piyasa değerinde satış veya (3) kademeli mülkiyet devri. Sıfır maliyetle otomatik devir hoş karşılanmaz.', 'permissible', 'low', '{"mülkiyete dönüşen kiralama", "müntehiye bi''t-temlik", "mülkiyet devri", "hibe", "satış"}', '{}'),

('a0000000-0000-0000-0000-000000000013', '13', 'Mudarebe', 'Kar Paylaşım Oranı', '2/1/4', 'Kar, fiili karın BİR YÜZDESI olarak paylaşılmalıdır, sabit bir tutar olarak değil. Yatırımcıya (Rabbü''l-Mal) sabit getiri garantisi veren herhangi bir şart, sözleşmeyi geçersiz kılar ve onu faize dönüştürür.', 'mandatory', 'critical', '{"mudarebe", "kar paylaşımı", "yüzde", "sabit getiri", "garanti", "faiz"}', '{}'),
('a0000000-0000-0000-0000-000000000014', '13', 'Mudarebe', 'Zarar Paylaşımı', '3/2', 'Mali zararlar, yöneticinin (Müdarib) ihmali veya sözleşme ihlalinden kaynaklanmadıkça, tamamen sermaye sağlayıcı (Rabbü''l-Mal) tarafından karşılanır. Müdarib sadece zamanını ve emeğini kaybeder.', 'mandatory', 'high', '{"zarar", "sermaye sağlayıcı", "rabbü''l-mal", "müdarib", "ihmal", "ihlal"}', '{}'),

('a0000000-0000-0000-0000-000000000015', '0', 'Genel Yasaklar', 'Riba (Faiz)', 'GEN-1', 'Ribanın (faiz) tüm şekilleri kesinlikle yasaktır; bunlar: (1) Riba al-Fadl (takasdaki fazlalık), (2) Riba al-Nesie (borç üzerindeki faiz) ve (3) gerçek risk paylaşımı olmaksızın anapara artı önceden belirlenmiş getiriyi garanti eden sözleşme şartlarıdır.', 'prohibited', 'critical', '{"riba", "faiz", "tefecilik", "yasak", "borç", "fazlalık"}', '{"Kuran 2:275", "Hadis Sahih Müslim 1598"}'),
('a0000000-0000-0000-0000-000000000016', '0', 'Genel Yasaklar', 'Garar (Aşırı Belirsizlik)', 'GEN-2', 'Aşırı belirsizlik içeren sözleşmeler (Garar Fahiş) batıldır. Bu şunları içerir: tanımsız fiyat, belirsiz teslimat, var olmayan malların satışı veya muğlak sözleşme şartları. Küçük belirsizlik (Garar Yesir) tolere edilir.', 'prohibited', 'high', '{"garar", "belirsizlik", "tanımsız", "muğlak", "batıl", "var olmayan"}', '{}'),
('a0000000-0000-0000-0000-000000000017', '0', 'Genel Yasaklar', 'Meysir (Kumar)', 'GEN-3', 'Kumara benzeyen spekülatif sözleşmeler (Meysir) yasaktır. Bu, kazancın dayanak ekonomik faaliyetten veya gerçek ticaretten ziyade tamamen şansa dayalı olduğu türevleri içerir.', 'prohibited', 'critical', '{"meysir", "kumar", "spekülasyon", "türevler", "şans"}', '{}')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- WAVE 19 SEED: BDDK Uyum Raporu (Zen Editor & AI Copilot Test Data)
-- ============================================================================
INSERT INTO public.reports (
  id,
  tenant_id,
  title,
  status,
  engagement_id,
  theme_config,
  executive_summary,
  created_at,
  updated_at
) VALUES (
  'b0000000-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  '2026 Q1 BDDK Kredi Riski Konsolide Denetim Raporu',
  'draft',
  NULL,
  '{"paperStyle": "zen_paper", "typography": "merriweather_inter"}',
  '{
    "score": 68.5,
    "grade": "C+",
    "assuranceLevel": "Sınırlı Güvence (Limited Assurance)",
    "trend": -5.2,
    "previousGrade": "B-",
    "findingCounts": {"critical": 2, "high": 5, "medium": 12, "low": 4, "observation": 1},
    "briefingNote": "BDDK 5411 sayılı kanun 43. madde kapsamında yapılan konsolide risk değerlendirmesi sonucunda, NPL oranlarında artış ve teminatlandırma süreçlerinde yapısal zafiyetler tespit edilmiştir.",
    "sections": {
      "auditOpinion": "Kurumun kredi tahsis süreçleri genel olarak BDDK rasyolarıyla uyumlu olsa da, Yüksek Riskli Portföy sınıflandırmasında ciddi gecikmeler yaşanmaktadır.",
      "criticalRisks": "1. Organize Teverruk işlemlerinde fıkhi uyumsuzluk riski.\n2. Teminat değerlemelerinde bağımsız denetim eksikliği.",
      "strategicRecommendations": "Risk iştahı tablosunun acilen güncellenmesi ve sorunlu krediler için erken uyarı sisteminin (EWS) devreye alınması.",
      "managementAction": "Yönetim kurulu kararı ile risk komitesinin toplanma frekansı artırılmıştır."
    }
  }',
  now(),
  now()
) ON CONFLICT DO NOTHING;


INSERT INTO public.report_blocks (
  id,
  tenant_id,
  report_id,
  position_index,
  parent_block_id,
  depth_level,
  block_type,
  content
) VALUES 
-- SECTION 1: YÖNETİCİ ÖZETİ
('b0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'b0000000-0000-0000-0000-000000000001', 0, NULL, 0, 'heading', '{"text": "1. Yönetici Özeti ve Temel Bulgular", "level": 1}'),
('b0000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'b0000000-0000-0000-0000-000000000001', 1, 'b0000000-0000-0000-0000-000000000002', 1, 'paragraph', '{"html": "Bu rapor, <b>Bankacılık Düzenleme ve Denetleme Kurumu (BDDK)</b> 5411 sayılı Bankacılık Kanunu uyarınca, bankanın konsolide kredi riski, piyasa riski ve operasyonel risk profillerinin bağımsız bir değerlendirmesini sunmaktadır. İnceleme dönemi 1 Ocak 2026 - 31 Mart 2026 tarihlerini kapsamaktadır."}'),
('b0000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'b0000000-0000-0000-0000-000000000001', 2, 'b0000000-0000-0000-0000-000000000002', 1, 'paragraph', '{"html": "<p><b>Sentinel Copilot Analizi:</b> Önceki çeyreğe kıyasla sorunlu kredi (NPL) oranlarında kritik bir artış gözlemlenmiştir. Kurumun strese dayanıklılık testleri (Stress Test) senaryoları mevcut ekonomik dalgalanmaları kapsamakta yetersiz kalmıştır. 2 adet kritik bulgu tespit edilmiştir.</p>"}'),

-- SECTION 2: BULGU ANALİZİ (Live Finding Blocks)
('b0000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'b0000000-0000-0000-0000-000000000001', 3, NULL, 0, 'heading', '{"text": "2. Riske Maruz Değer (VaR) ve Kritik Bulgular", "level": 1}'),
('b0000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'b0000000-0000-0000-0000-000000000001', 4, 'b0000000-0000-0000-0000-000000000005', 1, 'paragraph', '{"html": "Aşağıdaki tablolar, BDDK denetimi sırasında Sentinel Anomaly Motoru tarafından tespit edilen doğrudan bulguları canlı olarak listelemektedir."}'),
('b0000000-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'b0000000-0000-0000-0000-000000000001', 5, 'b0000000-0000-0000-0000-000000000005', 1, 'finding_ref', '{"findingId": "FIN-2026-BDDK-01", "displayMode": "full_card", "kerdData": {"score": 98.5, "severity": "CRITICAL", "exposure": 45000000}, "title": "Teminat Değerleme Uzmanlarında Bağımsızlık İhlali", "finding_type": "Kredi Riski", "status": "open"}'),
('b0000000-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'b0000000-0000-0000-0000-000000000001', 6, 'b0000000-0000-0000-0000-000000000005', 1, 'finding_ref', '{"findingId": "FIN-2026-BDDK-02", "displayMode": "compact_row", "kerdData": {"score": 75.0, "severity": "HIGH", "exposure": 12000000}, "title": "Türev İşlemlerde (Swap) Kur Riski Limit Aşımı", "finding_type": "Piyasa Riski", "status": "action_plan_submitted"}'),

-- SECTION 3: EKLER VE FİNANSAL TABLOLAR
('b0000000-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'b0000000-0000-0000-0000-000000000001', 7, NULL, 0, 'heading', '{"text": "3. Finansal Dayanak ve Matris", "level": 1}'),
('b0000000-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', 'b0000000-0000-0000-0000-000000000001', 8, 'b0000000-0000-0000-0000-000000000009', 1, 'table', '{"dataset": [{"Aylar": "Ocak", "NPL": "3.1%", "CAR": "15.4%"}, {"Aylar": "Şubat", "NPL": "3.3%", "CAR": "15.2%"}, {"Aylar": "Mart", "NPL": "3.42%", "CAR": "14.9%"}], "title": "2026 İlk Çeyrek Sermaye Yeterlilik (CAR) ve Sorunlu Kredi (NPL) Gelişimi"}'),
('b0000000-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111', 'b0000000-0000-0000-0000-000000000001', 9, 'b0000000-0000-0000-0000-000000000009', 1, 'paragraph', '{"html": "<b>Müfettişin Notu:</b> Sermaye Yeterlilik Rasyosundaki (CAR) düşüş yasal sınıfın (minimum %12) hala üzerindedir ancak trend endişe vericidir."}')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- WAVE 20: PBC REQUESTS SEED DATA
-- =============================================================================
INSERT INTO public.pbc_requests (id, engagement_id, title, description, requested_from, assigned_to, status, priority, due_date) VALUES
  ('c0000000-0000-0000-0000-000000000001', '42d72f07-e813-4cff-8218-4a64f7a3baab', 'Kredi Tahsis Dosyaları', 'Son 3 ay içinde onaylanan 50 milyon TL üzeri ticari kredilerin komite karar tutanakları.', 'Ticari Krediler Tahsis Bölümü', '00000000-0000-0000-0000-000000000010', 'PENDING', 'HIGH', '2026-05-01'),
  ('c0000000-0000-0000-0000-000000000002', '42d72f07-e813-4cff-8218-4a64f7a3baab', 'Hazine Onay Dekontları', 'Şubat 2026 dönemine ait günlük hazine işlem dekontları ve swift mesajları.', 'Hazine Operasyonları', '00000000-0000-0000-0000-000000000013', 'IN_PROGRESS', 'CRITICAL', '2026-04-25'),
  ('c0000000-0000-0000-0000-000000000003', '42d72f07-e813-4cff-8218-4a64f7a3baac', 'Mizan ve Muavin Defterler', '2025 Yılsonu itibarıyla mizan dökümü ve IT harcamaları muavin defteri.', 'Mali İşler', '00000000-0000-0000-0000-000000000012', 'SUBMITTED', 'MEDIUM', '2026-04-20')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.pbc_evidence (id, pbc_request_id, file_name, file_path, file_size_bytes, uploaded_by) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'mizan_2025_son.pdf', 'evidence/c0000000-0000-0000-0000-000000000003/mizan_2025_son.pdf', 1048576, '00000000-0000-0000-0000-000000000012')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 21: WHISTLEBLOWER PORTAL — İhbar Uçları (Bankacılık Bağlamı)
-- =============================================================================

-- incidents tablosunu doğru tenant_id ile güncelle
UPDATE public.incidents
SET tenant_id = '11111111-1111-1111-1111-111111111111'
WHERE tenant_id = '00000000-0000-0000-0000-000000000000';

-- Ek bankacılık bağlamı ihbar olayları (doğru tenant ile)
INSERT INTO public.incidents (title, description, category, is_anonymous, status, tenant_id) VALUES
  ('Kredi Tahsisinde Usulsüzlük Şüphesi', 'Kurumsal kredi komitesinde onay almadan 2.5M TL tutar tahsis edildiği gözlemlenmiştir. İlgili yönetici süreçleri atlamış görünüyor.', 'Dolandırıcılık', true, 'INVESTIGATING', '11111111-1111-1111-1111-111111111111'),
  ('Müşteri Verisi Yetkisiz Erişim', 'Sistemde yetkisi olmayan bir çalışanın 500+ müşteri hesabını sorguladığı log kayıtlarından tespit edilmiştir.', 'IT', true, 'NEW', '11111111-1111-1111-1111-111111111111'),
  ('Çalışanlar Arası Mobbing İddiası', 'Kadıköy Şubesinde bir müfettiş tarafından yapılan sistematik baskı ve dışlama iddiaları mevcuttur.', 'İK', false, 'INVESTIGATING', '11111111-1111-1111-1111-111111111111'),
  ('MASAK Bildirimi Atlandı', 'Eşik değerin üzerindeki bir işlem için gerekli MASAK bildirimi yapılmamış. Yasal zorunluluk ihlali söz konusu.', 'Dolandırıcılık', true, 'RESOLVED', '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- Wave 21: Whistleblower Tips (anonim portal üzerinden gelen ihbarlar)
INSERT INTO public.whistleblower_tips (tracking_code, content, channel, ai_credibility_score, triage_category, status, assigned_unit)
VALUES
  (
    'WB-2026-CRIT-001',
    'Hazine Müdürlüğü''nde gerçekleştirilen repo işlemlerinde belgelenmeyen kayıt dışı komisyon ödemeleri tespit ettim. İşlem tarihleri: Ocak-Mart 2026. Tahmini tutar: 850.000 TL. Yetkilendirme belgelerinde imzalar tutarsız.',
    'WEB',
    94.5,
    'CRITICAL_FRAUD',
    'INVESTIGATING',
    'Mali Suçlar Araştırma Birimi'
  ),
  (
    'WB-2026-ETIK-002',
    'Bir üst yöneticinin, rakip firmadan iş teklifi aldıktan sonra banka müşterilerinin portföy bilgilerini o firmaya sızdırdığına dair ciddi şüphelerim var. İlgili kişi son 2 haftadır KVKK kapsamındaki verilerle yoğun şekilde çalışıyor.',
    'WEB',
    78.2,
    'ETHICS_VIOLATION',
    'NEW',
    'Hukuk ve Uyum Birimi'
  ),
  (
    'WB-2026-IK-003',
    'Performans değerlendirme sürecinde belirli bir gruba sistemli olarak düşük puan verildiğini gösteren e-postalara ulaştım. Bu durum terfilerini engellemek amacıyla yapılandırılmış görünüyor.',
    'WEB',
    62.0,
    'HR_CULTURE',
    'NEW',
    NULL
  ),
  (
    'WB-2026-IT-004',
    'Core Banking sisteminde bir açık tespit ettim. API katmanında object-level yetkilendirme kontrolü eksik
ON CONFLICT DO NOTHING;
 herhangi bir hesap numarasıyla müşteri bakiyelerine erişilebiliyor. CVE benzeri kritik bir güvenlik açığı.',
    'TOR_ONION',
    88.7,
    'IT_SECURITY',
    'ESCALATED',
    'Bilgi Güvenliği ve Siber Risk'
  ),
  (
    'WB-2026-MASAK-005',
    'Birden fazla müşterinin 49.900 TL tutarda art arda işlem gerçekleştirdiğini gördüm. Yapılandırma (smurfing) gibi görünen bu işlemler için MASAK bildirimi yapılmadı. İşlem tarihleri: Şubat 2026 başı.',
    'WEB',
    71.3,
    'CRITICAL_FRAUD',
    'INVESTIGATING',
    'MASAK Uyum Birimi'
  )
ON CONFLICT (tracking_code) DO NOTHING;



-- ============================================================
-- Wave 22 Seed: Bankacılık Stres Testi Senaryoları
-- ============================================================

INSERT INTO simulation_scenarios (id, title, description, type, severity, quarter_slot, parameters) VALUES
  (
    '11111111-2200-0000-0000-000000000001',
    'Enflasyon Şoku',
    'TCMB faiz koridorunun 500 baz puan yükseltilmesi. Kredi maliyetleri ve operasyonel gider baskısı simüle edilmektedir.',
    'MACRO',
    'HIGH',
    0.25,
    '{"inflation_rate": 0.62, "interest_rate_shock": 5.0, "gdp_impact": -0.03}'
  ),
  (
    '11111111-2200-0000-0000-000000000002',
    'BDDK Regülasyon Daralması',
    'Sermaye yeterlilik oranı (SYO) minimum eşiğinin %12''den %16''ya çıkarılması zorunluluğu. Bankaların kredi hacimlerini kısması beklenmektedir.',
    'REGULATORY',
    'CRITICAL',
    0.50,
    '{"capital_adequacy_min": 0.16, "credit_growth_cap": -0.08, "provision_increase": 0.15}'
  ),
  (
    '11111111-2200-0000-0000-000000000003',
    'Likidite Krizi',
    'Repo piyasalarında ani likidite daralması. Kısa vadeli borçlanma maliyetleri kritik eşiği geçmektedir.',
    'LIQUIDITY',
    'CRITICAL',
    0.50,
    '{"liquidity_coverage_ratio": 0.92, "short_term_funding_stress": 0.25, "interbank_spread": 3.5}'
  ),
  (
    '11111111-2200-0000-0000-000000000004',
    'Döviz Kuru Baskısı',
    'USD/TRY kurunda %30 değer kaybı senaryosu. Döviz açık pozisyonları ve yabancı para kredilerde temerrüt riski artmaktadır.',
    'MACRO',
    'HIGH',
    0.75,
    '{"usd_try_shock": 0.30, "fx_position_impact": 0.18, "export_credit_benefit": 0.05}'
  ),
  (
    '11111111-2200-0000-0000-000000000005',
    'Kredi Temerrüt Dalgası',
    'KGF destekli kredilerde temerrüt oranının %3.5''ten %9.2''ye yükselmesi. Takipteki alacak karşılıklarının artırılması gerekmektedir.',
    'CREDIT',
    'CRITICAL',
    1.00,
    '{"npl_ratio": 0.092, "provision_coverage": 0.85, "loan_loss_rate": 0.065}'
  )
ON CONFLICT (id) DO NOTHING;

-- Senaryo Etki Vektörleri (Entity Tipi Bazında Risk Delta'ları)
INSERT INTO scenario_impacts (scenario_id, entity_type, base_score_delta, total_assets_delta, notes) VALUES
  -- Enflasyon Şoku
  ('11111111-2200-0000-0000-000000000001', '*',         8.5,  -0.03, 'Genel enflasyon etkisi'),
  ('11111111-2200-0000-0000-000000000001', 'BANK',      12.0, -0.05, 'Faiz marjı sıkışması + mevduat maliyeti artışı'),
  ('11111111-2200-0000-0000-000000000001', 'INSURANCE',  6.0, -0.02, 'Hasar artış etkisi'),
  -- BDDK Regülasyon Daralması
  ('11111111-2200-0000-0000-000000000002', '*',         15.0, -0.08, 'Sermaye tamponu artışı zorundası'),
  ('11111111-2200-0000-0000-000000000002', 'BANK',      22.0, -0.12, 'Kredi durdurma + SYO baskısı + provizyon artışı'),
  ('11111111-2200-0000-0000-000000000002', 'LEASING',   18.0, -0.09, 'Fonlama maliyeti + kira portföyü değer kaybı'),
  -- Likidite Krizi
  ('11111111-2200-0000-0000-000000000003', '*',         18.0, -0.11, 'Likidite tampon zorunluluğu'),
  ('11111111-2200-0000-0000-000000000003', 'BANK',      25.0, -0.15, 'LCR altında işlem yasağı riski'),
  -- Döviz Kuru Baskısı
  ('11111111-2200-0000-0000-000000000004', '*',         10.0, -0.06, 'FX açık pozisyon etkisi'),
  ('11111111-2200-0000-0000-000000000004', 'BANK',      16.0, -0.09, 'Kur riskli kredi stoku + swap maliyeti'),
  ('11111111-2200-0000-0000-000000000004', 'INSURANCE',  7.0, -0.03, 'Dövizli hasar portföyü değer kaybı'),
  -- Kredi Temerrüt Dalgası
  ('11111111-2200-0000-0000-000000000005', '*',         20.0, -0.14, 'Genel kredi kalitesi bozulması'),
  ('11111111-2200-0000-0000-000000000005', 'BANK',      30.0, -0.18, 'Yüksek NPL → provizyon zorunluluğu → SYO düşüşü'),
  ('11111111-2200-0000-0000-000000000005', 'LEASING',   22.0, -0.15, 'KGF portföyü + takip edilen kira alacakları')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- WAVE 25 SEED: Autonomous Remediation — Otonom Onarım Kampanyaları
-- =============================================================================

-- 1. Master Action Campaigns (bankacılık bağlamında gerçek kampanyalar)
INSERT INTO public.master_action_campaigns (id, title, description, root_cause, status) VALUES
  (
    'c1000000-0000-0000-0000-000000000001',
    'Şifre Politikası Merkezi Güncelleme Kampanyası',
    'BDDK 5411 md.73 kapsamında sistemdeki 12-karakterden kısa şifrelerle faaliyet gösteren 47 servis hesabının politikaya uygun hale getirilmesi.',
    'Merkezi IAM politikasının dağıtık sisteme yayılmaması sonucu eski konfigurasyon çakışması.',
    'active'
  ),
  (
    'c1000000-0000-0000-0000-000000000002',
    'Firewall Kural Seti Uyum Kampanyası',
    'Core Banking ağında tespit edilen 23 yetkisiz açık port (0.0.0.0/0 kuralları) için otomatik kural iptali ve uyumlu ACL dağıtımı.',
    'DevOps ekibinin deployment sürecinde manual port açma alışkanlığı ve review gate eksikliği.',
    'active'
  ),
  (
    'c1000000-0000-0000-0000-000000000003',
    'Müşteri Verisi Maskeleme Kampanyası (KVKK)',
    'Prodüksiyon ortamındaki 6 analytics dashboard''ında TC Kimlik No ve IBAN bilgilerinin maskelenmemiş görüntülenmesi bulgusunun düzeltilmesi.',
    'Analytic katmanında prod replikasının maskeleme pipeline''ından geçirilmeden kullanılması.',
    'active'
  ),
  (
    'c1000000-0000-0000-0000-000000000004',
    'Kritik API Erişim Hakları Temizleme Kampanyası',
    'Ayrılan 18 çalışanın hâlâ aktif olan API anahtarlarının ve OAuth token''larının iptali.',
    'Offboarding süreci ile IAM entegrasyonunda otomasyon eksikliği. Manuel HR → IT bildirimi.',
    'completed'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. Auto Fix Log geçmiş kayıtları
INSERT INTO public.auto_fix_logs (
  id, tenant_id, campaign_id, fix_type, target_system, status,
  initiated_by, result_summary, duration_ms, started_at, completed_at
) VALUES
  (
    'f1000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'c1000000-0000-0000-0000-000000000004',
    'access_revoke',
    'API Gateway (Kong)',
    'success',
    'sentinel-autofix-agent',
    '18 API anahtarı başarıyla iptal edildi. Affected consumer sayısı: 0.',
    2340,
    NOW() - INTERVAL '3 days' + INTERVAL '09:12:00',
    NOW() - INTERVAL '3 days' + INTERVAL '09:12:02'
  ),
  (
    'f1000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'c1000000-0000-0000-0000-000000000001',
    'password_policy',
    'LDAP / Active Directory',
    'running',
    'sentinel-autofix-agent',
    NULL,
    NULL,
    NOW() - INTERVAL '2 hours',
    NULL
  ),
  (
    'f1000000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'c1000000-0000-0000-0000-000000000002',
    'firewall_rule',
    'Checkpoint Firewall Cluster',
    'failed',
    'sentinel-autofix-agent',
    NULL,
    NULL,
    NOW() - INTERVAL '1 day',
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Wave 23 Seed: TPRM Tedarikçi ve Değerlendirme Verileri
-- ============================================================

INSERT INTO tprm_vendors (id, name, category, risk_tier, criticality_score, status, contact_person, email, contract_start, contract_end, country, data_access_level, notes) VALUES
  (
    'aaaa0001-ffff-0000-0000-000000000001',
    'SistemOdası Bulut Sağlayıcısı A.Ş.',
    'Bulut Altyapısı',
    'Tier 1',
    94,
    'Active',
    'Murat Bulut',
    'murat.bulut@sistemodasi.com.tr',
    '2023-01-01',
    '2026-12-31',
    'Türkiye',
    'Full',
    'Core Banking altyapısının %80i bu tedarikçi üzerinde çalışmaktadır. BDDK denetim kapsamında en kritik tedarikçi.'
  ),
  (
    'aaaa0001-ffff-0000-0000-000000000002',
    'DataGuard Siber Güvenlik Ltd.',
    'Siber Güvenlik',
    'Tier 1',
    88,
    'Under Review',
    'Selin Demir',
    's.demir@dataguard.com.tr',
    '2024-03-01',
    '2027-02-28',
    'Türkiye',
    'Full',
    'SOC hizmetleri ve sızma testi kapsamıyla kritik bağımlılık. Sözleşme yenileme sürecinde.'
  ),
  (
    'aaaa0001-ffff-0000-0000-000000000003',
    'SwiftNet Ödeme Sistemleri',
    'Ödeme İşlemleri',
    'Tier 1',
    82,
    'Active',
    'Ahmet Çelik',
    'a.celik@swiftnet.com',
    '2022-07-01',
    '2025-06-30',
    'Almanya',
    'Limited',
    'Uluslararası SWIFT entegrasyon partneri. Sözleşme yenilenmesi gerekmekte.'
  ),
  (
    'aaaa0001-ffff-0000-0000-000000000004',
    'DocuSign TR Belge Yönetimi',
    'Dijital İmza',
    'Tier 2',
    61,
    'Active',
    'Zeynep Koç',
    'zeynep.koc@docusigntr.com',
    '2023-09-01',
    '2026-08-31',
    'Türkiye',
    'Limited',
    'Sözleşme ve onay süreçlerinde kullanılmakta.'
  ),
  (
    'aaaa0001-ffff-0000-0000-000000000005',
    'SafeHR İnsan Kaynakları Yazılımı',
    'İnsan Kaynakları',
    'Tier 2',
    55,
    'Active',
    'Emre Yıldız',
    'e.yildiz@safehr.com',
    '2024-01-01',
    '2026-12-31',
    'Türkiye',
    'Limited',
    'Personel verisine sınırlı erişim. KVKK uyumluluk denetimi yapılacak.'
  ),
  (
    'aaaa0001-ffff-0000-0000-000000000006',
    'CleanOffice Temizlik Hizm.',
    'Tesis Yönetimi',
    'Tier 3',
    18,
    'Active',
    'Hasan Kaya',
    'hasan@cleanoffice.com',
    '2025-01-01',
    '2025-12-31',
    'Türkiye',
    'None',
    'Fiziksel tesis erişimi var ancak sistem erişimi yok.'
  )
ON CONFLICT (id) DO NOTHING;

-- Tedarikçi Değerlendirmeleri
INSERT INTO tprm_assessments (id, vendor_id, title, status, risk_score, due_date, assessor) VALUES
  ('bbbb0001-ffff-0000-0000-000000000001', 'aaaa0001-ffff-0000-0000-000000000001', 'SistemOdası 2026 Yıllık BDDK Uyumluluk Denetimi', 'In Progress', NULL, '2026-03-31', 'Denetim Komitesi'),
  ('bbbb0001-ffff-0000-0000-000000000002', 'aaaa0001-ffff-0000-0000-000000000001', 'SistemOdası 2025 BCP/DR Testi', 'Completed', 72, '2025-09-30', 'BT Risk Ekibi'),
  ('bbbb0001-ffff-0000-0000-000000000003', 'aaaa0001-ffff-0000-0000-000000000002', 'DataGuard Sızma Testi Sonuç Değerlendirmesi', 'Review Needed', NULL, '2026-04-15', 'Bilgi Güvenliği Birimi'),
  ('bbbb0001-ffff-0000-0000-000000000004', 'aaaa0001-ffff-0000-0000-000000000003', 'SwiftNet AML & Fraud Kontrol Gözden Geçirme', 'Sent', NULL, '2026-05-01', 'Uyum Müdürü'),
  ('bbbb0001-ffff-0000-0000-000000000005', 'aaaa0001-ffff-0000-0000-000000000004', 'DocuSign KVKK Uyumluluk Anketi', 'Completed', 88, '2025-12-15', 'Hukuk Departmanı')
ON CONFLICT (id) DO NOTHING;

-- Değerlendirme Soruları (SistemOdası 2026 için)
INSERT INTO tprm_assessment_answers (assessment_id, question_text, category) VALUES
  ('bbbb0001-ffff-0000-0000-000000000001', 'Tedarikçinin ISO 27001 sertifikası güncel mi? Son denetim tarihini ve sertifikayı paylaşınız.', 'Bilgi Güvenliği'),
  ('bbbb0001-ffff-0000-0000-000000000001', 'SLA çerçevesinde sistem kesinti süresi (downtime) son 12 ayda kaç saatti? Raporlayınız.', 'Hizmet Sürekliliği'),
  ('bbbb0001-ffff-0000-0000-000000000001', 'BDDK Bulut Bilişim Yönetmeliği kapsamında veri yerelleştirme (data residency) uyumluluğu nasıl sağlanmaktadır?', 'Regülasyon'),
  ('bbbb0001-ffff-0000-0000-000000000001', 'Tedarikçinin alt yüklenicileri (sub-processors) kimlerdir ve bunlara uygulanan güvenlik kontrolleri nelerdir?', 'Tedarik Zinciri')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- WAVE 24 SEED: ESG & PLANET PULSE (Çevresel, Sosyal, Yönetişim)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- ESG-1. FRAMEWORKS (Raporlama Çerçeveleri)
-- ---------------------------------------------------------------------------
INSERT INTO public.esg_frameworks (id, tenant_id, name, version, category, is_active) VALUES
  ('e1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'GRI Standards (Katılım Bankası)', '2021', 'Integrated', true),
  ('e1000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'EU Taxonomy (Çevre)', '2022', 'Environmental', true),
  ('e1000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'TCFD Finansal İklim', '2023', 'Environmental', true),
  ('e1000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'UN SDG Hedefleri', '2030', 'Integrated', true)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- ESG-2. METRIC DEFINITIONS (GRI, EU Taxonomy, TCFD metrikleri)
-- ---------------------------------------------------------------------------
INSERT INTO public.esg_metric_definitions
  (id, tenant_id, framework_id, code, name, pillar, unit, data_type, target_value, target_direction)
VALUES
  -- ÇEVRE (E) Metrikleri
  ('e2000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'e1000000-0000-0000-0000-000000000001',
   'GRI 305-1', 'Kapsam 1 Sera Gazı Emisyonu (Doğrudan)', 'E', 'tCO2e', 'Number', 12000, 'below'),
  ('e2000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'e1000000-0000-0000-0000-000000000001',
   'GRI 305-2', 'Kapsam 2 Sera Gazı Emisyonu (Satın Alınan Enerji)', 'E', 'tCO2e', 'Number', 8000, 'below'),
  ('e2000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'e1000000-0000-0000-0000-000000000001',
   'GRI 302-1', 'Toplam Enerji Tüketimi', 'E', 'MWh', 'Number', 45000, 'below'),
  ('e2000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'e1000000-0000-0000-0000-000000000001',
   'GRI 303-5', 'Su Tüketimi', 'E', 'm³', 'Number', 15000, 'below'),
  ('e2000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'e1000000-0000-0000-0000-000000000002',
   'EU-TAX-GAR', 'Yeşil Varlık Oranı (GAR)', 'E', '%', 'Percentage', 35, 'above'),
  -- SOSYAL (S) Metrikleri
  ('e2000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'e1000000-0000-0000-0000-000000000001',
   'GRI 405-2', 'Cinsiyet Ücret Farklılığı', 'S', '%', 'Percentage', 5, 'below'),
  ('e2000000-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'e1000000-0000-0000-0000-000000000001',
   'GRI 404-1', 'Çalışan Başına Eğitim Saati', 'S', 'saat', 'Number', 40, 'above'),
  ('e2000000-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'e1000000-0000-0000-0000-000000000001',
   'GRI 403-9', 'İş Kazası Sayısı', 'S', 'adet', 'Number', 0, 'equal'),
  -- YÖNETİŞİM (G) Metrikleri
  ('e2000000-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'e1000000-0000-0000-0000-000000000001',
   'GRI 205-3', 'Doğrulanan Yolsuzluk Vakası', 'G', 'adet', 'Number', 0, 'equal'),
  ('e2000000-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', 'e1000000-0000-0000-0000-000000000001',
   'GRI 419-1', 'Mevzuat İhlali Cezası', 'G', 'TRY', 'Currency', 0, 'equal'),
  ('e2000000-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111', 'e1000000-0000-0000-0000-000000000003',
   'TCFD-RISK', 'İklim Riski Limiti Kullanım Oranı', 'G', '%', 'Percentage', 80, 'below')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- ESG-3. DATA POINTS (Gerçek Q1 2026 Veri Noktaları — Cryo-Chamber)
-- ---------------------------------------------------------------------------
INSERT INTO public.esg_data_points
  (id, tenant_id, metric_id, period, value, previous_value, submitted_by, department,
   ai_validation_status, ai_notes, ai_confidence, snapshot_json, record_hash, is_frozen)
VALUES
  -- KAPSAM 1 (GRI 305-1): Şüpheli artış → Flagged
  ('e3000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'e2000000-0000-0000-0000-000000000001', '2026-Q1', 13450, 11200,
   'İklim ve Sürdürülebilirlik Ekibi', 'Kurumsal Yönetim',
   'Flagged',
   'UYARI: Kapsam 1 emisyonları bir önceki çeyreğe göre %20.1 artmıştır. BDDK/TCFD limit eşiği olan %15 aşılmıştır. Araç filosu büyümesi ve şube genişlemesi raporlanmış olmakla birlikte, yakıt tüketimi belgeleri doğrulanamamıştır. Lütfen yükleme belgelerini paylaşın.',
   62, '{"scope": "direct_combustion", "fleet_growth": "+8_percent", "branches_newly_opened": 3}',
   'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8', false),

  -- KAPSAM 2 (GRI 305-2): Hedefte → Validated
  ('e3000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'e2000000-0000-0000-0000-000000000002', '2026-Q1', 7320, 7850,
   'Enerji Yönetim Birimi', 'İdari İşler',
   'Validated',
   'Satın alınan elektrik emisyonu hedef altında. Yenilenebilir enerji anlaşması (PPA) etkisi doğrulandı.',
   91, '{"ppa_kwh": 12000000, "renewable_pct": 48, "grid_factor": "0.61"}',
   'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9', true),

  -- ENERJİ TÜKETİMİ (GRI 302-1)
  ('e3000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   'e2000000-0000-0000-0000-000000000003', '2026-Q1', 41200, 44100,
   'Enerji Yönetim Birimi', 'İdari İşler',
   'Validated',
   'Enerji tasarrufu projesi (LED dönüşümü ve BMS sistemi) sonucunda hedef altında kaldı.',
   88, '{"led_conversion_branches": 45, "bms_savings_mwh": 2900}',
   'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0', true),

  -- SU TÜKETİMİ (GRI 303-5)
  ('e3000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
   'e2000000-0000-0000-0000-000000000004', '2026-Q1', 14200, 15800,
   'İdari İşler', 'İdari İşler',
   'Validated', null, 85,
   '{"source": "ISKI_invoice", "recycling_pct": 12}',
   'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1', true),

  -- YEŞİL VARLIK ORANI (EU-TAX-GAR): Flagged (hedefin altında)
  ('e3000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111',
   'e2000000-0000-0000-0000-000000000005', '2026-Q1', 28.4, 24.1,
   'Sürdürülebilir Finans', 'Hazine & Yatırım',
   'Flagged',
   'UYARI: GAR %28.4 ile AB Taksonomisi hedefi olan %35 altında. İklim uyumlu finansman büyümesi ivme kazanmış olmakla birlikte Transition Finance sınıflandırması yetersiz kalmaktadır.',
   55, '{"taxonomy_eligible_eur": 1240000000, "total_portfolio_eur": 4365000000}',
   'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2', false),

  -- CİNSİYET ÜCRET FARKI (GRI 405-2): Hedefte → Validated
  ('e3000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111',
   'e2000000-0000-0000-0000-000000000006', '2026-Q1', 4.2, 5.8,
   'İnsan Kaynakları', 'İnsan Kaynakları',
   'Validated',
   '2025 maaş denge projesi sonuçlarına göre cinsiyet ücret uçurumu hedef altına düşmüştür.',
   93, '{"methodology": "ILO_equal_pay", "audit_firm": "PwC_HR_Advisory"}',
   'f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3', true),

  -- EĞİTİM SAATİ (GRI 404-1): Hedefte → Validated
  ('e3000000-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111',
   'e2000000-0000-0000-0000-000000000007', '2026-Q1', 47.3, 38.2,
   'İnsan Kaynakları', 'İnsan Kaynakları',
   'Validated', null, 90,
   '{"digital_training_pct": 68, "mandatory_compliance_hrs": 12}',
   'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4', true),

  -- İŞ KAZASI (GRI 403-9): Hedefte sıfır → Validated
  ('e3000000-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111',
   'e2000000-0000-0000-0000-000000000008', '2026-Q1', 0, 1,
   'İş Sağlığı ve Güvenliği', 'İnsan Kaynakları',
   'Validated', null, 99,
   '{}', 'b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5', true),

  -- YOLSUZLUK VAKASI (GRI 205-3)
  ('e3000000-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111',
   'e2000000-0000-0000-0000-000000000009', '2026-Q1', 0, 0,
   'İç Denetim', 'Risk ve Uyum',
   'Validated', null, 98,
   '{}', 'c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', true),

  -- MEVZUAT CEZASI (GRI 419-1)
  ('e3000000-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111',
   'e2000000-0000-0000-0000-000000000010', '2026-Q1', 125000, 0,
   'Hukuk', 'Risk ve Uyum',
   'Flagged',
   'UYARI: 125,000 TRY BDDK idari para cezası — KVKK veri işleme ihlali nedeniyle. Önceki dönemde hiç ceza yoktu. Aksiyon planı hazırlanmış, KVKK uyumu için EDP güncelleniyor.',
   78, '{"ceza_tipi": "KVKK_ihlali", "aksiyonlar": "EDP_guncellemesi", "son_tarih": "2026-06-30"}',
   'd0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7', false),

  -- İKLİM RİSKİ KULLANIM (TCFD-RISK)
  ('e3000000-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111',
   'e2000000-0000-0000-0000-000000000011', '2026-Q1', 62.3, 58.1,
   'Risk Yönetimi', 'Risk ve Uyum',
   'Validated',
   'İklim senaryosu analizleri (RCP 2.6 / RCP 4.5) güncellenmiş ve limit eşiği altında görülmektedir.',
   84, '{"scenario_rcp26_loss": "2.1B_TRY", "scenario_rcp45_loss": "5.8B_TRY"}',
   'e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8', true)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- ESG-4. SOCIAL METRICS (HR Trend Verileri — 4 Çeyrek)
-- ---------------------------------------------------------------------------
INSERT INTO public.esg_social_metrics
  (id, tenant_id, period, total_employees, women_total, women_management, women_board,
   gender_pay_gap_pct, training_hours_per_employee, employee_turnover_pct, workplace_injuries, community_investment_try)
VALUES
  ('e4000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   '2025-Q2', 4820, 2168, 621, 3, 5.8, 34.2, 9.4, 1, 2800000),
  ('e4000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   '2025-Q3', 4890, 2201, 638, 3, 5.5, 36.8, 8.9, 0, 3200000),
  ('e4000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   '2025-Q4', 4950, 2228, 652, 3, 5.1, 40.5, 8.2, 1, 3500000),
  ('e4000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
   '2026-Q1', 5020, 2284, 681, 4, 4.2, 47.3, 7.8, 0, 4100000)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- ESG-5. GREEN ASSETS (Yeşil Varlık Oranı — GAR Trend)
-- ---------------------------------------------------------------------------
INSERT INTO public.esg_green_assets
  (id, tenant_id, period, total_loan_portfolio_try, green_loans_try, green_bonds_try, taxonomy_aligned_pct, transition_finance_try)
VALUES
  ('e5000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   '2025-Q2', 42000000000, 8400000000, 3200000000, 24.1, 1500000000),
  ('e5000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   '2025-Q3', 44500000000, 9500000000, 3800000000, 25.8, 1800000000),
  ('e5000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   '2025-Q4', 46800000000, 11200000000, 4500000000, 27.1, 2100000000),
  ('e5000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
   '2026-Q1', 48200000000, 12900000000, 5800000000, 28.4, 2500000000)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 27. DELPHI ENGINE — Natural Language Queries & AI Generated Probes
-- =============================================================================

INSERT INTO public.delphi_queries (id, tenant_id, input_text, status, created_at) VALUES
  ('d7000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'Sistemdeki hareketsiz kullanıcıları bul', 'ACCEPTED', NOW() - INTERVAL '5 days'),
  ('d7000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'Çift ödemeleri yakala ve alarm üret', 'ACCEPTED', NOW() - INTERVAL '4 days'),
  ('d7000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   'Haftasonu yapılan yüksek tutarlı işlemleri izle', 'ACCEPTED', NOW() - INTERVAL '3 days'),
  ('d7000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
   'KVKK kapsamında toplu veri erişimi taraması yap', 'GENERATED', NOW() - INTERVAL '2 days'),
  ('d7000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111',
   'Sahte tedarikçi kayıtlarını tespit et', 'PENDING', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.generated_probes (id, tenant_id, query_id, title, description, category, severity, source, query_payload, schedule_cron, risk_threshold, reasoning, status, created_at) VALUES
  (
    'e7000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'd7000000-0000-0000-0000-000000000001',
    'Hareketsiz Hesap Aktivasyon Alarmı',
    '6 aydan uzun süredir işlem görmeyen hesaplardaki ani aktiviteleri izler. Hesap devralma (account takeover) ve kara para aklama riski açısından kritik kontrol.',
    'FRAUD',
    'HIGH',
    'core_banking',
    'SELECT a.id, a.account_number, a.last_activity_date,
  t.amount, t.channel, t.ip_address, t.created_at as reactivation_date,
  (now() - a.last_activity_date) as dormancy_period
FROM accounts a
JOIN transactions t ON a.id = t.account_id
WHERE a.last_activity_date < now() - interval ''180 days''
  AND t.created_at > now() - interval ''48h''
ORDER BY t.amount DESC
ON CONFLICT DO NOTHING;
',
    '0 6 * * *',
    2,
    'Uzun süre hareketsiz kalan hesapların aniden aktive edilmesi, hesap devralma (account takeover) veya para aklama amacıyla kullanıma işaret edebilir. Özellikle farklı IP adresleri veya cihazlardan erişim durumunda risk artar. MASAK rehberine göre şüpheli işlem göstergesidir.',
    'DEPLOYED',
    NOW() - INTERVAL '5 days'
  ),
  (
    'e7000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'd7000000-0000-0000-0000-000000000002',
    'Mükerrer Ödeme Tespiti',
    'Aynı fatura numarasına veya tutara sahip tekrar eden ödemeleri tespit eder. 24 saatlik zaman penceresi içinde benzer işlemleri tarar.',
    'FRAUD',
    'HIGH',
    'sap_gl',
    'SELECT t1.id, t1.invoice_id, t1.amount, t1.vendor_id, t1.posting_date
FROM transactions t1
INNER JOIN transactions t2
  ON t1.invoice_id = t2.invoice_id
  AND t1.amount = t2.amount
  AND t1.id != t2.id
  AND t1.posting_date BETWEEN t2.posting_date - interval ''24h''
    AND t2.posting_date + interval ''24h''
WHERE t1.posting_date > now() - interval ''30 days''
ORDER BY t1.posting_date DESC;',
    '0 */4 * * *',
    1,
    'Mükerrer ödeme tespiti için aynı fatura numarası + aynı tutar + 24 saat penceresi kombinasyonunu kullanıyorum. BDDK yönetmeliği gereği her bankanın bu kontrolü çalıştırması zorunludur.',
    'DEPLOYED',
    NOW() - INTERVAL '4 days'
  ),
  (
    'e7000000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'd7000000-0000-0000-0000-000000000003',
    'Mesai Dışı İşlem İzleyici',
    'Haftasonu, resmi tatil ve mesai saatleri dışında gerçekleştirilen yüksek tutarlı işlemleri tespit eder. İç dolandırıcılık ve yetkisiz erişim göstergesi.',
    'FRAUD',
    'HIGH',
    'core_banking',
    'SELECT id, account_id, amount, channel, created_at,
  EXTRACT(DOW FROM created_at) as day_of_week,
  EXTRACT(HOUR FROM created_at) as hour_of_day
FROM transactions
WHERE (
  EXTRACT(DOW FROM created_at) IN (0, 6)
  OR EXTRACT(HOUR FROM created_at) NOT BETWEEN 8 AND 18
)
AND amount > 100000
AND created_at > now() - interval ''7 days''
ORDER BY amount DESC;',
    '0 8 * * 1-5',
    3,
    'Mesai dışı işlemler fraud göstergelerinin başında gelir. Özellikle yüksek tutarlı işlemlerin normal çalışma saatleri dışında yapılması, yetkisiz erişim veya iç dolandırıcılık işaretleridir. MASAK rehberine göre bu bir şüpheli işlem göstergesidir.',
    'ACCEPTED',
    NOW() - INTERVAL '3 days'
  ),
  (
    'e7000000-0000-0000-0000-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'd7000000-0000-0000-0000-000000000004',
    'Hassas Veri Erişim Denetimi',
    'Yüksek gizlilik seviyeli verilere yapılan toplu erişimleri izler ve anomalileri raporlar. KVKK Madde 12 uyum kontrolü.',
    'COMPLIANCE',
    'MEDIUM',
    'core_banking',
    'SELECT user_id, resource_type, resource_id,
  action, ip_address, user_agent, created_at
FROM access_logs
WHERE data_classification IN (''SENSITIVE'', ''HIGHLY_SENSITIVE'')
  AND created_at > now() - interval ''24h''
  AND (
    action = ''EXPORT''
    OR action = ''BULK_READ''
    OR EXTRACT(HOUR FROM created_at) NOT BETWEEN 8 AND 18
  )
ORDER BY created_at DESC;',
    '0 0 * * *',
    5,
    'KVKK Madde 12 gereği veri sorumlusu, kişisel verilere yetkisiz erişimi tespit etmekle yükümlüdür. Toplu veri çekme (bulk export), hassas veri erişimi ve mesai dışı erişimler özellikle izlenmelidir.',
    'PENDING',
    NOW() - INTERVAL '2 days'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 26 SEED: Regulatory Export — BDDK Dosya Paketleri
-- =============================================================================
INSERT INTO public.regulatory_dossiers (id, dossier_ref, title, type, status, notes, exported_at) VALUES
  (
    'fd000000-0000-0000-0000-000000000001',
    'BDDK-2026-Q1-001',
    'BDDK 2026 Q1 Bilgi Sistemleri Denetim Paketi',
    'BDDK',
    'SUBMITTED',
    'BANKACILIK KANUNU 5411 md.28 kapsamında çeyreklik BT ve Bilgi Sistemleri denetim rapor paketi.',
    NOW() - INTERVAL '10 days'
  ),
  (
    'fd000000-0000-0000-0000-000000000002',
    'BDDK-2026-KRD-002',
    'BDDK 2026 Kredi Prosedürleri Murabaha Uyumluluk Paketi',
    'BDDK',
    'GENERATED',
    'Murabaha tahsis süreçlerinde tespit edilen bulgulara ait kanıt ve iyileştirme dosya paketi.',
    NOW() - INTERVAL '3 days'
  ),
  (
    'fd000000-0000-0000-0000-000000000003',
    'MASAK-2026-AML-003',
    'MASAK 2026 AML Risk Değerlendirme Dosyası',
    'MASAK',
    'DRAFT',
    'Mali Suçları Araştırma Kurulu için hazırlanan yıllık AML risk değerlendirme dosyası.',
    NULL
  ),
  (
    'fd000000-0000-0000-0000-000000000004',
    'KVKK-2026-001',
    'KVKK 2026 Kişisel Veri Envanter Dosyası',
    'KVKK',
    'APPROVED',
    'KVK Kurulu talebiyle hazırlanan veri envanter ve işleme faaliyetleri kayıt dosyası.',
    NOW() - INTERVAL '30 days'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.export_logs (id, dossier_id, action, status, metadata) VALUES
  (
    'ef000000-0000-0000-0000-000000000001',
    'fd000000-0000-0000-0000-000000000001',
    'GENERATE',
    'SUCCESS',
    '{"steps": 4, "duration_ms": 7800, "file_size_kb": 2430}'::jsonb
  ),
  (
    'ef000000-0000-0000-0000-000000000002',
    'fd000000-0000-0000-0000-000000000001',
    'SUBMIT',
    'SUCCESS',
    '{"recipient": "BDDK e-Devlet Portal", "ref_no": "BDDK-2026-Q1-001"}'::jsonb
  ),
  (
    'ef000000-0000-0000-0000-000000000003',
    'fd000000-0000-0000-0000-000000000002',
    'GENERATE',
    'SUCCESS',
    '{"steps": 4, "duration_ms": 8200}'::jsonb
  ),
  (
    'ef000000-0000-0000-0000-000000000004',
    'fd000000-0000-0000-0000-000000000004',
    'GENERATE',
    'SUCCESS',
    '{"steps": 3, "duration_ms": 5100}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 29 SEED: Scribble & Field Agent — Saha Notları
-- =============================================================================

INSERT INTO public.scribbles (id, content, linked_context, is_processed, extracted_data) VALUES
  (
    'fc000000-0000-0000-0000-000000000001',
    'Kasa dairesinde kamera açısı kör noktada. Saat 09:00-12:00 arası müşteri girişi kayıt altına alınmıyor. Şube müdürü durumu biliyor ancak iş emri açılmamış.',
    'Fiziksel Güvenlik Denetimi',
    true,
    '{"severity": "HIGH", "category": "Güvenlik Sistemleri", "finding_extracted": true}'::jsonb
  ),
  (
    'fc000000-0000-0000-0000-000000000002',
    'IT departmanında sunucu odasına giriş için yalnızca şifre yeterli, kart okuyucu devrede değil. Kapı çoğu zaman aralık bırakılıyor.',
    'BT & Bilgi Sistemleri Denetimi',
    true,
    '{"severity": "CRITICAL", "category": "IT Altyapısı", "finding_extracted": true}'::jsonb
  ),
  (
    'fc000000-0000-0000-0000-000000000003',
    'Müşteri dosyaları çoğunda onay imzası eksik, birden fazla işlemde tespit edildi, Hazine birimi özellikle etkilenmiş görünüyor.',
    'Kredi Uyum Denetimi',
    false,
    null
  ),
  (
    'fc000000-0000-0000-0000-000000000004',
    'Acil çıkış kapısının önünde malzeme deposundan gelen kutular var. KVKK ve iş güvenliği açısından tescilli bir ihlal.',
    'Fiziksel Güvenlik Denetimi',
    false,
    null
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.field_notes (
  id, title, description, severity, category, location,
  audio_source, confidence, transcript, status
) VALUES
  (
    'ff000000-0000-0000-0000-000000000001',
    'Kasa Dairesi Kamera Kör Noktası',
    'Kasa dairesinde kamera açısı kör noktada bulundu. Saat 09:00-12:00 arası müşteri girişi kayıt altına alınmıyor. Şube müdürü durumu biliyor ancak iş emri açılmamış.',
    'high',
    'Güvenlik Sistemleri',
    'Kasa Dairesi',
    true,
    0.87,
    'Kasa dairesinde kamera açısı kör noktada. Saat dokuz ile onikiler arası müşteri girişi kayıt altına alınmıyor.',
    'submitted'
  ),
  (
    'ff000000-0000-0000-0000-000000000002',
    'Sunucu Odası Erişim Kartı Kontrolü Yok',
    'IT departmanında sunucu odasına giriş için yalnızca şifre yeterli, biyometrik kart okuyucu devrede değil. Fiziksel erişim logu tutulmuyor.',
    'critical',
    'IT Altyapısı',
    'IT Departmanı — Sunucu Odası',
    true,
    0.92,
    'IT departmanında sunucu odasına giriş için yalnızca şifre yeterli. Kart okuyucu devrede değil.',
    'draft'
  ),
  (
    'ff000000-0000-0000-0000-000000000003',
    'Yangın Söndürücü Tüpü Bakım Süresi Geçmiş',
    'Şube koridorundaki yangın söndürücü tüpünün bakım etiketi 14 ay önce tarihli. Yenilenmesi gerekiyor. Yangın güvenliği yönetmeliği kapsamında kritik ihlal.',
    'critical',
    'Yangın Güvenliği',
    'Şube Ana Koridor',
    true,
    0.95,
    'Şube koridorundaki yangın söndürücü tüpünün bakım süresi geçmiş, 14 ay önce tarihli.',
    'draft'
  ),
  (
    'ff000000-0000-0000-0000-000000000004',
    'Kasa Sayım Çift İmza Eksikliği',
    'Kasa sayım işleminde çift imza kuralına uyulmamış. Birden fazla günde tek yetkili kişi tarafından sayım yapıldığı kayıtlarda görülüyor.',
    'high',
    'Yetkilendirme',
    'Kasa',
    false,
    0.78,
    null,
    'converted'
  ),
  (
    'ff000000-0000-0000-0000-000000000005',
    'Arşiv Odası Yangın Alarm Testi Yapılmamış',
    'Arşiv odasındaki yangın alarmının en son test edilme tarihi 2 yılı aşıyor. BDDK Bilgi Sistemleri Yönetmeliği kapsamında periyodik test zorunluluğu ihlali.',
    'high',
    'Yangın Güvenliği',
    'Arşiv Odası B-3',
    false,
    0.85,
    null,
    'draft'
  )
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- Wave 30 Seed: Compliance Mapper — BDDK & ISO 27001 Çerçeveleri
-- ============================================================

-- Çerçeveler
INSERT INTO compliance_frameworks (tenant_id, id, name, short_code, version, description, authority, effective_date, status) VALUES
  ('11111111-1111-1111-1111-111111111111',
    'cccc0001-cfff-0000-0000-000000000001',
    'BDDK Denetim Çerçevesi',
    'BDDK',
    '2024',
    'Bankacılık Düzenleme ve Denetleme Kurumu iç denetim ve uyum çerçevesi',
    'BDDK',
    '2024-01-01',
    'ACTIVE'
  ),
  ('11111111-1111-1111-1111-111111111111',
    'cccc0001-cfff-0000-0000-000000000002',
    'ISO/IEC 27001:2022',
    'ISO27001',
    '2022',
    'Bilgi Güvenliği Yönetim Sistemi uluslararası standardı',
    'ISO',
    '2022-10-25',
    'ACTIVE'
  ),
  ('11111111-1111-1111-1111-111111111111',
    'cccc0001-cfff-0000-0000-000000000003',
    'Kişisel Verilerin Korunması Kanunu',
    'KVKK',
    '6698',
    'Türkiye kişisel veri işleme ve koruma mevzuatı',
    'KVKK',
    '2016-04-07',
    'ACTIVE'
  )
ON CONFLICT (id) DO NOTHING;

-- BDDK Gereksinimleri (Madde 14 ve ilgili maddeler)
INSERT INTO framework_requirements (tenant_id, id, framework_id, code, title, description, category, priority) VALUES
  ('11111111-1111-1111-1111-111111111111',
    'dddd0001-fef0-0000-0000-000000000001',
    'cccc0001-cfff-0000-0000-000000000001',
    'BDDK-14.1',
    'İç Denetim Bağımsızlığı',
    'İç denetim birimi, yönetim kuruluna bağlı olarak bağımsız biçimde çalışmalı
ON CONFLICT DO NOTHING;
 denetçiler denetledikleri faaliyetlerden sorumlu olmamalıdır.',
    'Kurumsal Yönetim',
    'CRITICAL'
  ),
  ('11111111-1111-1111-1111-111111111111',
    'dddd0001-fef0-0000-0000-000000000002',
    'cccc0001-cfff-0000-0000-000000000001',
    'BDDK-14.2',
    'Denetim Kapsamı ve Planlaması',
    'Yıllık denetim planı risk odaklı metodoloji ile hazırlanmalı ve yönetim kurulunca onaylanmalıdır.',
    'Denetim Planlaması',
    'CRITICAL'
  ),
  ('11111111-1111-1111-1111-111111111111',
    'dddd0001-fef0-0000-0000-000000000003',
    'cccc0001-cfff-0000-0000-000000000001',
    'BDDK-14.3',
    'Bulgu Takip ve Kapatma',
    'Tespit edilen bulgular kayıt altına alınmalı, aksiyon planıyla takip edilmeli ve zamanında kapatılmalıdır.',
    'Bulgu Yönetimi',
    'HIGH'
  ),
  ('11111111-1111-1111-1111-111111111111',
    'dddd0001-fef0-0000-0000-000000000004',
    'cccc0001-cfff-0000-0000-000000000001',
    'BDDK-14.4',
    'Denetim Raporlaması',
    'Denetim bulguları ve sonuçları yönetim kuruluna periyodik raporlarla iletilmelidir.',
    'Raporlama',
    'HIGH'
  ),
  ('11111111-1111-1111-1111-111111111111',
    'dddd0001-fef0-0000-0000-000000000005',
    'cccc0001-cfff-0000-0000-000000000001',
    'BDDK-14.5',
    'Denetçi Nitelikleri',
    'İç denetim personeli mesleki yeterlilik, deneyim ve sürekli eğitim gerekliliklerini karşılamalıdır.',
    'İnsan Kaynakları',
    'MEDIUM'
  ),
  -- ISO 27001 A.8 — Varlık Yönetimi
  ('11111111-1111-1111-1111-111111111111',
    'dddd0001-fef0-0000-0000-000000000006',
    'cccc0001-cfff-0000-0000-000000000002',
    'ISO-A.8.1',
    'Varlık Envanteri ve Sınıflandırma',
    'Kuruluş, bilgi varlıklarını tanımlamalı, sınıflandırmalı ve envanter altına almalıdır. Gizlilik, bütünlük ve erişilebilirlik düzeyleri belirlenmelidir.',
    'Varlık Yönetimi',
    'HIGH'
  ),
  ('11111111-1111-1111-1111-111111111111',
    'dddd0001-fef0-0000-0000-000000000007',
    'cccc0001-cfff-0000-0000-000000000002',
    'ISO-A.8.2',
    'Bilgi Etiketleme',
    'Varlıklar sınıflandırma düzeyine göre etiketlenmeli; etiketleme prosedürleri uygulanmalıdır.',
    'Varlık Yönetimi',
    'MEDIUM'
  ),
  ('11111111-1111-1111-1111-111111111111',
    'dddd0001-fef0-0000-0000-000000000008',
    'cccc0001-cfff-0000-0000-000000000002',
    'ISO-A.8.3',
    'Taşınabilir Ortam Yönetimi',
    'USB, disk gibi taşınabilir ortamların kullanımı ve imhası politika çerçevesinde yönetilmelidir.',
    'Varlık Yönetimi',
    'MEDIUM'
  ),
  ('11111111-1111-1111-1111-111111111111',
    'dddd0001-fef0-0000-0000-000000000009',
    'cccc0001-cfff-0000-0000-000000000002',
    'ISO-A.9.1',
    'Erişim Kontrol Politikası',
    'Bilgi varlıklarına erişim iş gereksinimine ve en az yetki prensibine dayalı politikayla kontrol edilmelidir.',
    'Erişim Kontrolü',
    'CRITICAL'
  ),
  ('11111111-1111-1111-1111-111111111111',
    'dddd0001-fef0-0000-0000-000000000010',
    'cccc0001-cfff-0000-0000-000000000002',
    'ISO-A.12.1',
    'Operasyonel Prosedürler ve Sorumluluklar',
    'Bilgi işlem tesisi operasyonları için belgelenmiş prosedürler ve sorumluluklar tanımlanmalıdır.',
    'Operasyon Güvenliği',
    'HIGH'
  ),
  -- KVKK
  ('11111111-1111-1111-1111-111111111111',
    'dddd0001-fef0-0000-0000-000000000011',
    'cccc0001-cfff-0000-0000-000000000003',
    'KVKK-4',
    'Veri İşleme İlkeleri',
    'Kişisel veriler hukuka ve dürüstlük kurallarına uygun, belirli ve meşru amaçlarla, sınırlı ve ölçülü biçimde işlenmelidir.',
    'Veri İşleme',
    'CRITICAL'
  ),
  ('11111111-1111-1111-1111-111111111111',
    'dddd0001-fef0-0000-0000-000000000012',
    'cccc0001-cfff-0000-0000-000000000003',
    'KVKK-12',
    'Veri Güvenliği Tedbirleri',
    'Veri sorumlusu, kişisel verilerin yetkisiz işlenmesini önlemek için gerekli teknik ve idari tedbirleri almalıdır.',
    'Veri Güvenliği',
    'CRITICAL'
  )
ON CONFLICT (id) DO NOTHING;

-- Örnek Kontrol-Gereksinim Eşleşmeleri (seed bazlı, gerçek mapping'ler UI üzerinden yapılır)
INSERT INTO control_requirement_mappings (requirement_id, control_ref, control_title, coverage_strength, match_score, notes) VALUES
  (
    'dddd0001-fef0-0000-0000-000000000001', 'CTRL-GOV-001', 'Yönetim Kurulu İç Denetim Talimatı', 'FULL', 95, 'Talimat belgesi bağımsızlık ilkesini tam karşılamaktadır.'),
  (
    'dddd0001-fef0-0000-0000-000000000002', 'CTRL-AUD-001', 'Yıllık Risk Odaklı Denetim Planı', 'FULL', 92, 'Plan metodoloji dokümanına uygun hazırlanmaktadır.'),
  (
    'dddd0001-fef0-0000-0000-000000000003', 'CTRL-FND-001', 'Bulgu Kayıt ve Takip Sistemi', 'PARTIAL', 75, 'Takip sistemi mevcut ancak otomatik hatırlatma eksik.'),
  (
    'dddd0001-fef0-0000-0000-000000000006', 'CTRL-IT-001', 'BT Varlık Envanteri Prosedürü', 'PARTIAL', 70, 'Ağ varlıkları dahil ancak bulut varlıkları eksik.'),
  (
    'dddd0001-fef0-0000-0000-000000000009', 'CTRL-IT-002', 'Erişim Yönetimi Politikası', 'FULL', 88, 'IAM sistemi ile entegre, en az yetki prensibi uygulanmaktadır.'),
  (
    'dddd0001-fef0-0000-0000-000000000011', 'CTRL-KVKK-001', 'Kişisel Veri İşleme Envanteri', 'PARTIAL', 68, 'Envanter mevcut ancak departman bazlı gözden geçirme beklenmekte.')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- WAVE 31 SEED: Advisory & Consulting Workspace
-- =============================================================================

-- Advisory engagements (bağlı görevler)
INSERT INTO public.advisory_engagements (id, request_id, title, scope_limitations, management_responsibility_confirmed, start_date, target_date, status, methodology) VALUES
  (
    'ae000000-0000-0000-0000-000000000001',
    NULL,
    'Yeni Kredi Kartı Ürünü Lansmanı Uyum Danışmanlığı',
    'Bu danışmanlık yalnızca BDDK 5411 ve 6493 sayılı ödeme hizmetleri kanunu kapsamındaki uyum süreçlerini kapsar. Kredi riski analizi ve fiyatlandırma modeli bu kapsam dışındadır.',
    true,
    '2026-03-01',
    '2026-05-31',
    'FIELDWORK',
    'PROCESS_DESIGN'
  ),
  (
    'ae000000-0000-0000-0000-000000000002',
    NULL,
    'KOBİ Kredileri Teminat Değerleme Süreci Tasarımı',
    'Teminat değerleme sürecinin uçtan uca haritalanması ve iç kontrol noktalarının belirlenmesi. Hukuki danışmanlık kapsamı dışındadır.',
    false,
    NULL,
    '2026-06-15',
    'PLANNING',
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- Advisory services seed
INSERT INTO public.advisory_services (id, tenant_id, engagement_id, title, service_type, description, regulatory_ref, estimated_hours, fee_basis, status, deliverable) VALUES
  (
    'af000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'ae000000-0000-0000-0000-000000000001',
    'BDDK 6493 Ödeme Hizmetleri Uyum Yol Haritası',
    'GAP_ANALYSIS',
    'Yeni kredi kartı ürününün BDDK 6493 sayılı kanun gereksinimleriyle uyumunu ölçen gap analizi ve action plan hazırlanması.',
    'BDDK 6493 md.12, 18, 23',
    80,
    'INTERNAL',
    'IN_PROGRESS',
    'Gap Analiz Raporu + Kapatma Planı (Excel + PDF)'
  ),
  (
    'af000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'ae000000-0000-0000-0000-000000000001',
    'Ürün Lansmanı Uyum Çalıştayı',
    'RISK_WORKSHOP',
    'Pazarlama, Hukuk ve Operasyon ekipleriyle yapılacak uyum çalıştayı. GIAS 11.1 kapsamında yönetim sorumluluğu bilgilendirmesi dahil.',
    'GIAS 2024 Std.11.1',
    16,
    'INTERNAL',
    'APPROVED',
    'Çalıştay Tutanağı + Katılımcı Listesi'
  ),
  (
    'af000000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'ae000000-0000-0000-0000-000000000002',
    'Teminat Değerleme Akış Şeması Tasarımı',
    'PROCESS_DESIGN',
    'BANKA iç yönetmeliği ve BDDK Kredi Riski Yönetimi Rehberi esaslarına göre teminat değerleme sürecinin uçtan uca haritalanması.',
    'BDDK Kredi Riski Yönetimi Rehberi 2023',
    40,
    'INTERNAL',
    'SCOPING',
    'Swim-lane akış diyagramı + kontrol matrisi'
  )
ON CONFLICT (id) DO NOTHING;

-- Advisory canvas blocks için Engagement 1'e başlangıç blokları
INSERT INTO public.advisory_canvas_blocks (id, engagement_id, block_type, text_content, position_index) VALUES
  ('cb000000-0000-0000-0000-000000000001', 'ae000000-0000-0000-0000-000000000001', 'process',  'Mevcut kredi kartı başvuru süreci analiz edilir', 0),
  ('cb000000-0000-0000-0000-000000000002', 'ae000000-0000-0000-0000-000000000001', 'decision', 'Mevcut süreç BDDK 6493 ile uyumlu mu?', 1),
  ('cb000000-0000-0000-0000-000000000003', 'ae000000-0000-0000-0000-000000000001', 'note',     'Uyumsuz adımlar raporlanacak, aksiyon planına alınacak', 2),
  ('cb000000-0000-0000-0000-000000000004', 'ae000000-0000-0000-0000-000000000001', 'process',  'Yeni uyumlu süreç tasarlanır ve onay alınır', 3)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Wave 32 Seed: Resurrection Watch — Zombi Bulgu Senaryoları
-- ============================================================

INSERT INTO resurrection_logs (id, finding_code, finding_title, category, risk_level, original_closed_at, resurface_date, previous_close_count, assigned_to, entity_name, notes, status) VALUES
  (
    'eeee0001-fef0-0000-0000-000000000001',
    'M6-KRD-2024-042',
    'KGF Destekli Kredilerde Temerrüt Risk Kontrolü Eksikliği',
    'KREDİ RİSKİ',
    'CRITICAL',
    '2024-06-15',
    '2026-01-20',
    2,
    'Kredi Risk Yönetim Birimi',
    'Katılım Bankası A.Ş.',
    'Geçen yıl Haziran''da kapatılan bulgu, Q1 2026 portföy incelemesinde tekrar tespit edildi. KGF limitlerinin yeniden aşıldığı görülmektedir.',
    'ACTIVE'
  ),
  (
    'eeee0001-fef0-0000-0000-000000000002',
    'BT-SEC-2024-017',
    'Core Banking API Katmanında Nesne Düzeyi Yetkilendirme Açığı',
    'BT GÜVENLİĞİ',
    'CRITICAL',
    '2024-09-01',
    '2026-02-10',
    1,
    'Bilgi Güvenliği Birimi',
    'Dijital Bankacılık Platformu',
    'Eylül 2024''te yamalar uygulandı ve bulgu kapatıldı. Şubat 2026 sızma testinde yama regresyonu tespit edildi — açık yeniden aktif.',
    'ACTIVE'
  ),
  (
    'eeee0001-fef0-0000-0000-000000000003',
    'OP-MASAK-2023-008',
    'MASAK Bildirim Sürelerinde Gecikme (Şüpheli İşlem Bildirimi)',
    'OPERASYONEL',
    'HIGH',
    '2023-12-31',
    '2026-01-05',
    3,
    'MASAK Uyum Birimi',
    'Yurt İçi Çeviri İşlemleri',
    'Bulgu 3. kez hortladı. Sistem iyileştirme tamamlamadan kapatılmış. Şı defa bütçe onayı ve sistem geliştirme kararı alınmalı.',
    'ACTIVE'
  ),
  (
    'eeee0001-fef0-0000-0000-000000000004',
    'KVKK-VER-2025-003',
    'Üçüncü Taraf ile Veri Paylaşım Sözleşmesi Eksikliği',
    'KVKK / UYUM',
    'HIGH',
    '2025-04-20',
    '2026-02-28',
    1,
    'Hukuk ve Uyum Departmanı',
    'Dijital Pazarlama Hizmetleri',
    'KVKK denetiminde kapatılmış ancak sözleşme yenileme sürecinde tekrar tespit edildi.',
    'MONITORING'
  ),
  (
    'eeee0001-fef0-0000-0000-000000000005',
    'BDDK-LIK-2024-011',
    'Likidite Yönetim Politikasında Stres Testi Metodoloji Açığı',
    'LİKİDİTE RİSKİ',
    'MEDIUM',
    '2024-08-12',
    '2026-03-01',
    1,
    'Risk Yönetim Merkezi',
    'Hazine Departmanı',
    'BDDK denetimine hazırlık kapsamında yeniden incelemede metodoloji eksikliği tespit edildi.',
    'ACTIVE'
  )
ON CONFLICT (id) DO NOTHING;

-- Tahminsel Uyarılar (Predictive Alerts)
INSERT INTO predictive_alerts (id, category, alert_type, severity, title, description, predicted_date, confidence_pct, source_data) VALUES
  (
    'ffff0001-ffda-0000-0000-000000000001',
    'KREDİ RİSKİ',
    'RECURRENCE',
    'CRITICAL',
    'KGF Kredilerinde Tekerrür Riski — Q2 2026',
    'Mevcut trend analizine göre KGF bulgularının Q2 2026''da 3. kez tekerrür etme olasılığı %78. Acil sistem kontrol denetimi önerilir.',
    '2026-06-01',
    78,
    '{"source": "ResurrectionWatch", "finding_code": "M6-KRD-2024-042", "history_count": 2}'
  ),
  (
    'ffff0001-ffda-0000-0000-000000000002',
    'BT GÜVENLİĞİ',
    'RECURRENCE',
    'CRITICAL',
    'API Güvenlik Yaması Regresyon Riski — Q3 2026',
    'Geçmiş veri: yamalar regresyona uğruyor. Yeni yazılım sürümlerinde benzer açıkların tekrar çıkma olasılığı %65.',
    '2026-07-15',
    65,
    '{"source": "ResurrectionWatch", "finding_code": "BT-SEC-2024-017"}'
  ),
  (
    'ffff0001-ffda-0000-0000-000000000003',
    'OPERASYONEL',
    'ESCALATION',
    'HIGH',
    'MASAK Yaptırım Riski Eşiği Aşılıyor',
    '3. tekerrür sonrası BDDK/MASAK yaptırım sürecinin başlatılma riski yüksek. Acil iyileştirme paketi hazırlanmalı.',
    '2026-04-30',
    82,
    '{"source": "ResurrectionWatch", "finding_code": "OP-MASAK-2023-008", "escalation_risk": true}'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 33. CHAOS LAB — Kaos Deneyleri ve Sonuçları
-- =============================================================================

INSERT INTO public.chaos_experiments (id, tenant_id, title, scenario, description, target_control, target_table, injection_count, injection_amount, severity, is_active) VALUES
  (
    'ce000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Yapilandirma / Smurfing Testi',
    'SMURFING_TEST',
    'MASAK esiginin (10.000 TL) altında kalan ardısık işlemler enjekte edilerek CCM anomali motorunun smurfing tespiti test edilir.',
    'CCM Anomali Motoru — STRUCTURING kuralı',
    'shadow_transactions',
    10,
    4800,
    'HIGH',
    true
  ),
  (
    'ce000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Kredi Onay Limitini Gizlice Devre Dışı Bırakma Testi',
    'CREDIT_LIMIT_BYPASS',
    'Kredi onay limit kontrolünü atlatmaya çalışan sentetik işlemler enjekte edilerek limit bypass korumasının etkinliği test edilir.',
    'Kredi Onay Kontrol Katmanı — limit_check middleware',
    'shadow_transactions',
    5,
    750000,
    'CRITICAL',
    true
  ),
  (
    'ce000000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'Dairesel İşlem (Round-Trip) Testi',
    'ROUND_TRIP_TEST',
    'A→B→C→A şeklinde dairesel fon akışı oluşturarak kara para aklama tespit kontrollerinin etkinliği ölçülür.',
    'MASAK Şüpheli İşlem Dedektörü',
    'shadow_transactions',
    3,
    95000,
    'HIGH',
    true
  ),
  (
    'ce000000-0000-0000-0000-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'Hayalet Bordro Testi',
    'GHOST_PAYROLL_TEST',
    'Sahte çalışan kaydı ve ilişkili maaş ödemesi oluşturarak İK-Muhasebe entegrasyon kontrollerinin etkinliği test edilir.',
    'HR-GL Mutabakat Kontrol Motoru',
    'shadow_transactions',
    1,
    28500,
    'MEDIUM',
    true
  ),
  (
    'ce000000-0000-0000-0000-000000000005',
    '11111111-1111-1111-1111-111111111111',
    'Hareketsiz Hesap Devralma Testi',
    'DORMANT_ACCOUNT_HIJACK',
    '180 gün+ hareketsiz hesaplarda ani aktivasyon senaryosu oluşturularak hesap devralma (account takeover) tespit kontrolü test edilir.',
    'Core Banking Hareketsiz Hesap Monitörü',
    'shadow_transactions',
    1,
    45000,
    'HIGH',
    false
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.chaos_results (id, tenant_id, experiment_id, batch_id, scenario, transactions_injected, total_amount, control_reaction, detection_time_ms, alert_triggered, notes, ran_at) VALUES
  (
    'cf000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'ce000000-0000-0000-0000-000000000001',
    'batch-smurfing-001',
    'SMURFING_TEST',
    10, 48000, 'DETECTED', 1247, true,
    'CCM motoru 10 işlemi 1.2sn içinde tespit etti ve STRUCTURING uyarısı oluşturdu.',
    NOW() - INTERVAL '7 days'
  ),
  (
    'cf000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'ce000000-0000-0000-0000-000000000001',
    'batch-smurfing-002',
    'SMURFING_TEST',
    10, 47500, 'MISSED', 0, false,
    'İkinci test turunda kontrol tetiklenmedi. Eşik değeri gözden geçirilmeli.',
    NOW() - INTERVAL '3 days'
  ),
  (
    'cf000000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'ce000000-0000-0000-0000-000000000002',
    'batch-creditbypass-001',
    'CREDIT_LIMIT_BYPASS',
    5, 3750000, 'BLOCKED', 340, false,
    'Kredi limit kontrolü başarıyla devreye girdi. Tüm işlemler limit aşımı gerekçesiyle reddedildi.',
    NOW() - INTERVAL '5 days'
  ),
  (
    'cf000000-0000-0000-0000-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'ce000000-0000-0000-0000-000000000003',
    'batch-roundtrip-001',
    'ROUND_TRIP_TEST',
    3, 285000, 'DETECTED', 2103, true,
    'Dairesel fon akışı 2.1sn içinde tespit edildi. İlgili hesaplar uyarı listesine alındı.',
    NOW() - INTERVAL '10 days'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 34 SEED: Academy, CPE Tracker & Exam Runner — CIA/CISA Eğitimleri
-- =============================================================================

-- 1. academy_courses — CIA ve CISA sertifika kursları
INSERT INTO public.academy_courses (id, tenant_id, title, description, category, xp_reward, estimated_duration, difficulty, is_active, tags) VALUES
  (
    'ac000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'CIA Part I: Temel İç Denetim Bilgisi',
    'IIA CIA Part I sınavına hazırlık: iç denetimin özellikleri, bağımsızlık, yetki, sorumluluk ve kalite güvence süreçleri.',
    'CIA Sertifika',
    500,
    480,
    'intermediate',
    true,
    ARRAY['CIA', 'IIA', 'iç denetim', 'sertifika']
  ),
  (
    'ac000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'CIA Part II: Uygulama Bilgisi',
    'Risk yönetimi, kontrol, yönetişim ve denetim icrasını kapsayan CIA Part II sınav hazırlık kursu.',
    'CIA Sertifika',
    650,
    600,
    'advanced',
    true,
    ARRAY['CIA', 'risk yönetimi', 'kontrol', 'yönetişim']
  ),
  (
    'ac000000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'CISA: Bilgi Sistemleri Denetimi',
    'ISACA CISA sertifikası için BT denetimi, kontrol ve güvence süreçleri. Bankacılık BT altyapısına özgü örnekler.',
    'CISA Sertifika',
    700,
    720,
    'expert',
    true,
    ARRAY['CISA', 'ISACA', 'BT denetimi', 'siber güvenlik']
  ),
  (
    'ac000000-0000-0000-0000-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'GIAS 2024 Standartları Uyum Eğitimi',
    'Global İç Denetim Standartları 2024 — tüm iç denetçiler için zorunlu temel bilgilendirme. Katılım Bankası bağlamı ile.',
    'Zorunlu Eğitim',
    200,
    120,
    'beginner',
    true,
    ARRAY['GIAS', 'standartlar', 'zorunlu', 'IIA']
  ),
  (
    'ac000000-0000-0000-0000-000000000005',
    '11111111-1111-1111-1111-111111111111',
    'Bankacılık Düzenleyici Çerçeve (BDDK 5411)',
    'Bankacılık Kanunu 5411 kapsamında iç denetim yükümlülükleri, raporlama ve uyum gereksinimleri.',
    'Düzenleyici Uyum',
    300,
    180,
    'intermediate',
    true,
    ARRAY['BDDK', 'bankacılık kanunu', 'uyum', '5411']
  )
ON CONFLICT (id) DO NOTHING;

-- 2. academy_exams — Her kurs için bir sınav
INSERT INTO public.academy_exams (id, course_id, title, description, passing_score, time_limit_minutes, max_attempts, randomize_questions, is_active) VALUES
  (
    'ae100000-0000-0000-0000-000000000001',
    'ac000000-0000-0000-0000-000000000001',
    'CIA Part I Yeterlilik Sınavı',
    'CIA Part I: Temel İç Denetim Bilgisi yeterlilik değerlendirme sınavı.',
    70, 60, 3, true, true
  ),
  (
    'ae100000-0000-0000-0000-000000000002',
    'ac000000-0000-0000-0000-000000000003',
    'CISA Temel BT Denetim Sınavı',
    'CISA hazırlık modülü — BT kontrolleri ve denetim süreçleri.',
    75, 90, 2, true, true
  ),
  (
    'ae100000-0000-0000-0000-000000000003',
    'ac000000-0000-0000-0000-000000000004',
    'GIAS 2024 Farkındalık Testi',
    '2024 GIAS standartları zorunlu farkındalık değerlendirmesi.',
    80, 30, 5, false, true
  )
ON CONFLICT (id) DO NOTHING;

-- 3. academy_questions — CIA Part I sınavı için örnek sorular
INSERT INTO public.academy_questions (id, exam_id, question_text, options, correct_option_id, points, explanation, order_index) VALUES
  (
    'af000000-0000-0000-0000-000000000001',
    'ae100000-0000-0000-0000-000000000001',
    'GIAS 2024''e göre iç denetim biriminin birincil amacı aşağıdakilerden hangisidir?',
    '[{"id":"A","text":"Hata ve usulsüzlükleri tespit etmek"},{"id":"B","text":"Kuruma değer katmak ve faaliyetlerini geliştirmek"},{"id":"C","text":"Yönetim kuruluna raporlamak"},{"id":"D","text":"Finansal tabloları onaylamak"}]',
    'B',
    10,
    'GIAS 2024 Standart 1: İç denetim birimi, "kurumun hedeflerine ulaşmasına yardımcı olmak için sistematik, disiplinli ve risk odaklı bir yaklaşımla kuraca değer katar ve iyileştirir."',
    1
  ),
  (
    'af000000-0000-0000-0000-000000000002',
    'ae100000-0000-0000-0000-000000000001',
    'İç denetim faaliyetinin "bağımsızlığı" için en kritik gereksinim hangisidir?',
    '[{"id":"A","text":"Denetçilerin ayrı bir binada çalışması"},{"id":"B","text":"İç denetim biriminin doğrudan yönetim kuruluna veya eşdeğerine raporlaması"},{"id":"C","text":"Tüm denetçilerin CIA sertifikasına sahip olması"},{"id":"D","text":"Bilgi teknolojileri bölümünden bütçe almaması"}]',
    'B',
    10,
    'GIAS Standart 1100: İç denetim birimi bağımsız olmalı
ON CONFLICT DO NOTHING;
 İAE (İç Denetim Yöneticisi) yönetim kuruluna veya eşdeğerine raporlamalıdır.',
    2
  ),
  (
    'af000000-0000-0000-0000-000000000003',
    'ae100000-0000-0000-0000-000000000001',
    'Aşağıdakilerden hangisi bir iç denetim bulgusunun zorunlu bileşeni DEĞİLDİR?',
    '[{"id":"A","text":"Kriter (Standart/Politika)"},{"id":"B","text":"Durum (Gözlemlenen)"},{"id":"C","text":"Neden (Kök Sebep)"},{"id":"D","text":"Yönetim Kurulu İmzası"}]',
    'D',
    10,
    'Bulgu bileşenleri: Kriter, Durum, Etki ve Neden. Yönetim kurulu imzası standart bir bulgu bileşeni değildir.',
    3
  ),
  (
    'af000000-0000-0000-0000-000000000004',
    'ae100000-0000-0000-0000-000000000002',
    'IT General Controls (ITGC) kapsamında aşağıdakilerden hangisi birincil kontrol kategorisidir?',
    '[{"id":"A","text":"Müşteri hizmetleri kalitesi"},{"id":"B","text":"Erişim kontrolü ve kimlik yönetimi"},{"id":"C","text":"Pazarlama veri analitiği"},{"id":"D","text":"İnsan kaynakları planlaması"}]',
    'B',
    10,
    'ITGC dört temel kategorisi: Erişim yönetimi, Değişim yönetimi, Operasyon yönetimi ve Program geliştirme. Erişim kontrolü en kritik ITGC alanıdır.',
    1
  ),
  (
    'af000000-0000-0000-0000-000000000005',
    'ae100000-0000-0000-0000-000000000003',
    'GIAS 2024''ün önceki IPPF sürümünden temel farkı nedir?',
    '[{"id":"A","text":"Risk tabanlı denetim kaldırıldı"},{"id":"B","text":"Denetim planlaması isteğe bağlı hale getirildi"},{"id":"C","text":"Hem güvence hem danışmanlık faaliyetleri için tek entegre çerçeve"},{"id":"D","text":"Tüm denetçilerin hukuk diplomasına sahip olması zorunlu"}]',
    'C',
    10,
    'GIAS 2024, IPPF''in yerini alarak güvence ve danışmanlık hizmetleri için tek, entegre bir standartlar seti sunmaktadır.',
    1
  )
ON CONFLICT (id) DO NOTHING;

-- 4. user_cpe_records — Örnek CPE kayıtları (gerçekçi bankacılık eğitimleri)
INSERT INTO public.user_cpe_records (id, user_id, tenant_id, title, provider, credit_hours, status, date_earned, notes) VALUES
  (
    'ff000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'IIA Türkiye — Risk Odaklı Denetim Zirvesi',
    'IIA Türkiye',
    8.0,
    'approved',
    '2026-02-15',
    '2 günlük konferans, 8 CPE saati. Belge no: IIA-TR-2026-0215'
  ),
  (
    'ff000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'ISACA — CISA Review Webinar (BT Kontrolleri)',
    'ISACA Online',
    4.0,
    'approved',
    '2026-01-20',
    'Online webinar. CPE No: ISACA-WEB-2026-047'
  ),
  (
    'ff000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'BDDK Uyum Konferansı — Katılım Bankacılığı',
    'TKBB',
    6.0,
    'pending',
    '2026-03-05',
    'Belge yüklendi, onay bekleniyor.'
  )
ON CONFLICT (id) DO NOTHING;

-- 5. cpe_annual_goals — Demo kullanıcı için 2026 hedefi
INSERT INTO public.cpe_annual_goals (id, user_id, year, goal_hours) VALUES
  (
    'cf000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    2026,
    40
  )
ON CONFLICT (user_id, year) DO NOTHING;

-- =============================================================================
-- WAVE 35 SEED: SOX / ICFR & Skeptic Agent — Şüpheci İtiraz Kayıtları
-- =============================================================================

INSERT INTO public.skeptic_challenges (
  id, control_code, department, proposed_status, severity,
  incident_count, ai_message, justification, resolution
) VALUES
  (
    'fc350000-0000-0000-0000-000000000001',
    'SOX-FIN-001',
    'Hazine',
    'Effective',
    'critical',
    3,
    E'SENTINEL SKEPTIC [KRITIK ITIRAZ]\n\nHazine departmaninda son 30 gunde 3 adet olay kaydi tespit edilmistir:\n\n- [Critical] Repo işlemi limit aşımı (2026-03-01)\n- [High] Faiz oranı bildirim gecikmesi (2026-03-05)\n- [High] Teminat eksikliği bildirimi yapılmadı (2026-03-07)\n\nKontrol SOX-FIN-001 icin "Effective" beyani, yukaridaki olaylarla celismektedir.',
    'Olay incelemeleri tamamlandı. Repo limit aşımı operasyonel bir parametre hatasından kaynaklandı, kontrol sürecinde tespit edilip anında düzeltildi. Sistem kayıtları mevcuttur.',
    'Override'
  ),
  (
    'fc350000-0000-0000-0000-000000000002',
    'SOX-IT-003',
    'BT',
    'Effective',
    'critical',
    2,
    E'SENTINEL SKEPTIC [KRITIK ITIRAZ]\n\nBT departmaninda son 30 gunde 2 adet kritik olay kaydi tespit edilmistir:\n\n- [Critical] Yetkisiz erişim girişimi — Active Directory (2026-03-02)\n- [Critical] Sunucu odası fiziksel erişim log kaydı yok (2026-03-06)\n\nKontrol SOX-IT-003 icin "Effective" beyani, yukaridaki olaylarla celismektedir.',
    '',
    'Pending'
  ),
  (
    'fc350000-0000-0000-0000-000000000003',
    'SOX-OPS-002',
    'Operasyon',
    'Effective',
    'warning',
    1,
    E'SENTINEL SKEPTIC [UYARI]\n\nOperasyon departmaninda son 30 gunde 1 adet olay kaydi bulunmaktadir:\n\n- [Medium] Müşteri IBAN doğrulama bypass (2026-03-03)\n\nKontrol SOX-OPS-002 icin "Effective" beyani vermeden once bu olayi degerlendirmeniz onerilmektedir.',
    '',
    'Withdrawn'
  ),
  (
    'fc350000-0000-0000-0000-000000000004',
    'SOX-COM-001',
    'Uyum',
    'Effective',
    'warning',
    2,
    E'SENTINEL SKEPTIC [UYARI]\n\nUyum departmaninda son 30 gunde 2 adet olay kaydi bulunmaktadir:\n\n- [High] FATF Öneri 16 raporlaması gecikti (2026-03-04)\n- [Medium] MASAK şüpheli işlem bildirimi eksik (2026-03-08)\n\nKontrol SOX-COM-001 icin "Effective" beyani vermeden once bu olayi degerlendirmeniz onerilmektedir.',
    '',
    'Pending'
  )
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- Wave 36 Seed: RKM Master Grid & Sampling Logs
-- BDDK standartlarına uygun risk kayıtları
-- ============================================================

INSERT INTO rkm_master (
  id, risk_code, risk_title, risk_owner, risk_status, risk_category, risk_subcategory,
  main_process, sub_process, inherent_impact, inherent_likelihood,
  control_type, control_design_rating, control_operating_rating,
  residual_impact, residual_likelihood,
  bddk_reference, iso27001_reference, risk_response_strategy,
  last_audit_date, audit_rating
) VALUES
  (
    'ffff0001-fff0-0000-0000-000000000001',
    'RKM-KRD-2026-001',
    'Kurumsal Kredi Portföyünde Yoğunlaşma Riski',
    'Kredi Risk Komitesi',
    'ACTIVE',
    'Kredi Riski',
    'Portföy Yoğunlaşma',
    'Kredi Yönetimi',
    'Portföy İzleme',
    4, 4,
    'DETECTIVE', 4, 3,
    2, 3,
    'BDDK-KRK-Md.7', 'ISO-A.8.1',
    'MITIGATE',
    '2025-12-15',
    'NEEDS_IMPROVEMENT'
  ),
  (
    'ffff0001-fff0-0000-0000-000000000002',
    'RKM-BT-2026-001',
    'Core Banking Sistemi Erişim Kontrolü Yetersizliği',
    'Bilgi Güvenliği Birimi',
    'ACTIVE',
    'BT Riski',
    'Erişim Yönetimi',
    'Bilgi Teknolojileri',
    'Kimlik ve Erişim Yönetimi',
    5, 3,
    'PREVENTIVE', 3, 3,
    3, 2,
    'BDDK-BT-Md.12', 'ISO-A.9.1',
    'MITIGATE',
    '2025-11-20',
    'NEEDS_IMPROVEMENT'
  ),
  (
    'ffff0001-fff0-0000-0000-000000000003',
    'RKM-OP-2026-001',
    'MASAK Şüpheli İşlem Bildirim Süreci Zafiyeti',
    'MASAK Uyum Birimi',
    'ACTIVE',
    'Operasyonel Risk',
    'Uyum ve Mevzuat',
    'Mali Suçlarla Mücadele',
    'İşlem İzleme',
    5, 4,
    'DETECTIVE', 4, 3,
    2, 2,
    'MASAK-Md.4', 'ISO-A.12.1',
    'MITIGATE',
    '2026-01-10',
    'SATISFACTORY'
  ),
  (
    'ffff0001-fff0-0000-0000-000000000004',
    'RKM-LIK-2026-001',
    'Kısa Vadeli Likidite Tampon Yetersizliği (LCR)',
    'Hazine ve ALM',
    'ACTIVE',
    'Likidite Riski',
    'Likidite Tampon Yönetimi',
    'Hazine Yönetimi',
    'Likidite İzleme',
    4, 3,
    'PREVENTIVE', 4, 4,
    2, 2,
    'BDDK-LIK-Md.5', '',
    'MITIGATE',
    '2025-10-30',
    'SATISFACTORY'
  ),
  (
    'ffff0001-fff0-0000-0000-000000000005',
    'RKM-KVKK-2026-001',
    'Kişisel Veri İhlaline İlişkin Bildirim Sürecinin Yetersizliği',
    'Hukuk ve Uyum Departmanı',
    'ACTIVE',
    'Yasal / Uyum Riski',
    'KVKK Uyumu',
    'Veri Yönetişimi',
    'Veri İhlali Yönetimi',
    4, 2,
    'CORRECTIVE', 3, 3,
    2, 2,
    '', 'ISO-A.18.1',
    'MITIGATE',
    '2026-02-15',
    'NEEDS_IMPROVEMENT'
  ),
  (
    'ffff0001-fff0-0000-0000-000000000006',
    'RKM-STR-2026-001',
    'Dijital Bankacılık Dönüşüm Projesinde Teknik Borç Birikimi',
    'Dijital Bankacılık Birimi',
    'ACTIVE',
    'Stratejik Risk',
    'Proje Yönetimi',
    'Dijital Dönüşüm',
    'Platform Modernizasyonu',
    3, 4,
    'DIRECTIVE', 3, 3,
    2, 3,
    'BDDK-BT-Md.6', 'ISO-A.14.1',
    'ACCEPT',
    '2025-09-25',
    'NEEDS_IMPROVEMENT'
  )
ON CONFLICT (risk_code) DO NOTHING;

-- Örnekleme Logları (Sampling Wizard geçmiş hesaplamaları)
INSERT INTO sampling_logs (
  id, population_size, risk_level, confidence_level, expected_error_rate,
  recommended_sample_size, methodology, is_full_scope
) VALUES
  (
    'ffff0001-faff-0000-0000-000000000001',
    1200, 'high', 95, 2.5,
    136, 'Attribute Sampling — GIAS 14.1 / BDDK Annex-C', FALSE
  ),
  (
    'ffff0001-faff-0000-0000-000000000002',
    450, 'medium', 95, 0,
    83, 'Attribute Sampling — GIAS 14.1 / BDDK Annex-C', FALSE
  ),
  (
    'ffff0001-faff-0000-0000-000000000003',
    38, 'high', 95, 0,
    38, 'Tam Kapsam Testi (N<50)', TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 37 SEED: Sentinel Office & Document Vault — Bankacılık Belgeleri
-- =============================================================================

-- DOCUMENTS: 3 C-Level banking documents
INSERT INTO office_documents (id, tenant_id, title, doc_type, created_by_name, is_archived)
VALUES
  (
    'f0ffce00-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Kredi Riski Değerlendirme Tablosu — Q1 2026',
    'SPREADSHEET',
    'Dr. Aysun Kaya (Kredi Risk Direktörü)',
    false
  ),
  (
    'f0ffce00-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Yönetim Kurulu Sunumu — ESG & TCFD Uyum Raporu 2026',
    'DOCUMENT',
    'Murat Demir (CFO)',
    false
  ),
  (
    'f0ffce00-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'BDDK Saha Denetimi — Anomali Bulguları Özet Tablosu',
    'SPREADSHEET',
    'Hakan Yıldız (CAE)',
    false
  )
ON CONFLICT (id) DO NOTHING;

-- VERSIONS for doc-1: Kredi Riski Tablosu (Spreadsheet)
INSERT INTO office_versions
  (id, document_id, version_number, content_data, content_hash, change_summary, is_frozen, created_by_name)
VALUES
  (
    'f0ffce01-0000-0000-0000-000000000001',
    'f0ffce00-0000-0000-0000-000000000001',
    1,
    '{
      "cells": {
        "A1": {"value": "Müşteri Adı", "formula": null, "style": {"bold": true}},
        "B1": {"value": "Limit (TRY)", "formula": null, "style": {"bold": true}},
        "C1": {"value": "Kullanım (%)", "formula": null, "style": {"bold": true}},
        "D1": {"value": "NPL Kategorisi", "formula": null, "style": {"bold": true}},
        "E1": {"value": "Teminat Değeri", "formula": null, "style": {"bold": true}},
        "F1": {"value": "Risk Skoru", "formula": null, "style": {"bold": true}},
        "A2": {"value": "Türkiye Petrol A.Ş.", "formula": null},
        "B2": {"value": 125000000, "formula": null},
        "C2": {"value": 0.87, "formula": null},
        "D2": {"value": "İzleme", "formula": null},
        "E2": {"value": 98000000, "formula": null},
        "F2": {"value": null, "formula": "=B2*C2/E2"},
        "A3": {"value": "Mega İnşaat Holding", "formula": null},
        "B3": {"value": 75000000, "formula": null},
        "C3": {"value": 0.94, "formula": null},
        "D3": {"value": "Yakın İzleme (Grup 2)", "formula": null},
        "E3": {"value": 45000000, "formula": null},
        "F3": {"value": null, "formula": "=B3*C3/E3"},
        "A4": {"value": "YeşilNet Teknoloji", "formula": null},
        "B4": {"value": 12000000, "formula": null},
        "C4": {"value": 0.42, "formula": null},
        "D4": {"value": "Normal", "formula": null},
        "E4": {"value": 18000000, "formula": null},
        "F4": {"value": null, "formula": "=B4*C4/E4"},
        "A5": {"value": "Altın Tarım Kooperatifi", "formula": null},
        "B5": {"value": 8500000, "formula": null},
        "C5": {"value": 0.71, "formula": null},
        "D5": {"value": "İzleme", "formula": null},
        "E5": {"value": 15000000, "formula": null},
        "F5": {"value": null, "formula": "=B5*C5/E5"},
        "A6": {"value": "TOPLAM", "formula": null, "style": {"bold": true}},
        "B6": {"value": null, "formula": "=SUM(B2:B5)", "style": {"bold": true}},
        "C6": {"value": null, "formula": "=AVERAGE(C2:C5)", "style": {"bold": true}},
        "F6": {"value": null, "formula": "=AVERAGE(F2:F5)", "style": {"bold": true}}
      },
      "metadata": {"rows": 6, "cols": 6, "lastModified": "2026-03-07T20:00:00Z"}
    }',
    'a1b2c3d4e5f60001',
    'İlk kredi riski tablosu oluşturuldu — 4 müşteri, 6 sütun',
    true,
    'Dr. Aysun Kaya (Kredi Risk Direktörü)'
  ),
  (
    'f0ffce01-0000-0000-0000-000000000002',
    'f0ffce00-0000-0000-0000-000000000001',
    2,
    '{
      "cells": {
        "A1": {"value": "Müşteri Adı", "formula": null, "style": {"bold": true}},
        "B1": {"value": "Limit (TRY)", "formula": null, "style": {"bold": true}},
        "C1": {"value": "Kullanım (%)", "formula": null, "style": {"bold": true}},
        "D1": {"value": "NPL Kategorisi", "formula": null, "style": {"bold": true}},
        "E1": {"value": "Teminat Değeri", "formula": null, "style": {"bold": true}},
        "F1": {"value": "Risk Skoru", "formula": null, "style": {"bold": true}},
        "A2": {"value": "Türkiye Petrol A.Ş.", "formula": null},
        "B2": {"value": 125000000, "formula": null},
        "C2": {"value": 0.87, "formula": null},
        "D2": {"value": "İzleme", "formula": null},
        "E2": {"value": 98000000, "formula": null},
        "F2": {"value": null, "formula": "=B2*C2/E2"},
        "A3": {"value": "Mega İnşaat Holding", "formula": null},
        "B3": {"value": 75000000, "formula": null},
        "C3": {"value": 0.94, "formula": null},
        "D3": {"value": "Yakın İzleme (Grup 2)", "formula": null},
        "E3": {"value": 45000000, "formula": null},
        "F3": {"value": null, "formula": "=B3*C3/E3"},
        "A4": {"value": "YeşilNet Teknoloji", "formula": null},
        "B4": {"value": 12000000, "formula": null},
        "C4": {"value": 0.42, "formula": null},
        "D4": {"value": "Normal", "formula": null},
        "E4": {"value": 18000000, "formula": null},
        "F4": {"value": null, "formula": "=B4*C4/E4"},
        "A5": {"value": "Altın Tarım Kooperatifi", "formula": null},
        "B5": {"value": 8500000, "formula": null},
        "C5": {"value": 0.71, "formula": null},
        "D5": {"value": "İzleme", "formula": null},
        "E5": {"value": 15000000, "formula": null},
        "F5": {"value": null, "formula": "=B5*C5/E5"},
        "A6": {"value": "Denizcilik Taşımacılık Ltd.", "formula": null},
        "B6": {"value": 32000000, "formula": null},
        "C6": {"value": 0.58, "formula": null},
        "D6": {"value": "Normal", "formula": null},
        "E6": {"value": 40000000, "formula": null},
        "F6": {"value": null, "formula": "=B6*C6/E6"},
        "A7": {"value": "TOPLAM", "formula": null, "style": {"bold": true}},
        "B7": {"value": null, "formula": "=SUM(B2:B6)", "style": {"bold": true}},
        "C7": {"value": null, "formula": "=AVERAGE(C2:C6)", "style": {"bold": true}},
        "F7": {"value": null, "formula": "=AVERAGE(F2:F6)", "style": {"bold": true}}
      },
      "metadata": {"rows": 7, "cols": 6, "lastModified": "2026-03-07T22:15:00Z"}
    }',
    'b2c3d4e5f6a70002',
    'Denizcilik Taşımacılık Ltd. portföye eklendi, toplamlar güncellendi',
    true,
    'Dr. Aysun Kaya (Kredi Risk Direktörü)'
  )
ON CONFLICT (id) DO NOTHING;

-- VERSIONS for doc-2: YK Sunumu (Document)
INSERT INTO office_versions
  (id, document_id, version_number, content_data, content_hash, change_summary, is_frozen, created_by_name)
VALUES
  (
    'f0ffce02-0000-0000-0000-000000000001',
    'f0ffce00-0000-0000-0000-000000000002',
    1,
    '{
      "type": "doc",
      "content": [
        {"type": "heading", "attrs": {"level": 1}, "content": [{"type": "text", "text": "Yönetim Kurulu Sunumu — ESG & TCFD Uyum Raporu 2026"}]},
        {"type": "paragraph", "content": [{"type": "text", "text": "Bu sunum, Bankanın 2026 yılı ilk çeyrek ESG ve TCFD uyum durumunu ve Planet Pulse modülü üzerinden izlenen karbon ayak izi verilerini özetlemektedir."}]},
        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "1. Çevre Metrikleri"}]},
        {"type": "paragraph", "content": [{"type": "text", "text": "Kapsam 1 emisyonları 13.450 tCO2e ile hedef eşiği olan 12.000 tCO2e değerini %12 aşmıştır. Kapsam 2 emisyonları ise yenilenebilir enerji anlaşması (PPA) sayesinde hedef altında seyretmektedir (7.320 tCO2e, hedef: 8.000)."}]},
        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "2. Yeşil Varlık Oranı (GAR)"}]},
        {"type": "paragraph", "content": [{"type": "text", "text": "Yeşil kredi ve tahvil portföyümüz 2026-Q1 itibarıyla toplam portföyün %28.4ini oluşturmaktadır. AB Taksonomisi uzun vadeli hedefimiz olan %35e ulaşmak için Transition Finance sınıflandırması hızlandırılacaktır."}]},
        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "3. Sosyal Performans"}]},
        {"type": "paragraph", "content": [{"type": "text", "text": "Çalışan sayısı 5.020e yükselmiş, kadın yönetici oranı %28.6 ile rekor kırmıştır. Cinsiyet ücret uçurumu 2025 maaş denge projesi sonucunda %4.2ye gerilemiştir (HEDEF: <%5)."}]},
        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "4. Yönetişim"}]},
        {"type": "paragraph", "content": [{"type": "text", "text": "KVKK veri işleme ihlali nedeniyle 125.000 TRY idari para cezası uygulanmıştır. EDP güncellemesi ve Veri Koruma Ofisi takviyesi planlanmaktadır. İklim riski limiti kullanım oranı %62.3 ile %80 eşiğinin altındadır."}]},
        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "5. Aksiyon Planı"}]},
        {"type": "bulletList", "content": [
          {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Kapsam 1 için araç filosu elektrifikasyon programı başlatılacak (2026-Q3 hedefi)"}]}]},
          {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "GAR arttırmak için yeşil proje finansmanı birimi kurulacak"}]}]},
          {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "KVKK uyum programı güçlendirilecek, CISO pozisyonu ihdas edilecek"}]}]}
        ]}
      ]
    }',
    'c3d4e5f6a7b80003',
    'YK Sunumu ilk taslak oluşturuldu',
    true,
    'Murat Demir (CFO)'
  )
ON CONFLICT (id) DO NOTHING;

-- VERSIONS for doc-3: BDDK Anomali Özet Tablosu  
INSERT INTO office_versions
  (id, document_id, version_number, content_data, content_hash, change_summary, is_frozen, created_by_name)
VALUES
  (
    'f0ffce03-0000-0000-0000-000000000001',
    'f0ffce00-0000-0000-0000-000000000003',
    1,
    '{
      "cells": {
        "A1": {"value": "Bulgu Kodu", "formula": null, "style": {"bold": true}},
        "B1": {"value": "Açıklama", "formula": null, "style": {"bold": true}},
        "C1": {"value": "Departman", "formula": null, "style": {"bold": true}},
        "D1": {"value": "Önem", "formula": null, "style": {"bold": true}},
        "E1": {"value": "Durum", "formula": null, "style": {"bold": true}},
        "A2": {"value": "BDDK-CCM-001", "formula": null},
        "B2": {"value": "147 SWIFT MT103 işleminde tek yetkili imzası", "formula": null},
        "C2": {"value": "Muhasebe", "formula": null},
        "D2": {"value": "Kritik", "formula": null},
        "E2": {"value": "Açık", "formula": null},
        "A3": {"value": "BDDK-IT-002", "formula": null},
        "B3": {"value": "Core banking erişim yetkisi fazlalığı", "formula": null},
        "C3": {"value": "BT", "formula": null},
        "D3": {"value": "Yüksek", "formula": null},
        "E3": {"value": "İnceleme", "formula": null},
        "A4": {"value": "BDDK-FIN-003", "formula": null},
        "B4": {"value": "Kapsam 1 emisyon hedef aşımı (%12)", "formula": null},
        "C4": {"value": "Kurumsal Yönetim", "formula": null},
        "D4": {"value": "Uyarı", "formula": null},
        "E4": {"value": "Aksiyon Planında", "formula": null},
        "A5": {"value": "BDDK-COM-004", "formula": null},
        "B5": {"value": "GAR hedefi altında (%28.4 / hedef %35)", "formula": null},
        "C5": {"value": "Hazine", "formula": null},
        "D5": {"value": "Uyarı", "formula": null},
        "E5": {"value": "Aksiyon Planında", "formula": null},
        "A6": {"value": "TOPLAM AÇIK", "formula": null, "style": {"bold": true}},
        "E6": {"value": null, "formula": "=COUNTIF(E2:E5,\"Açık\")", "style": {"bold": true}}
      },
      "metadata": {"rows": 6, "cols": 5, "lastModified": "2026-03-07T21:30:00Z"}
    }',
    'd4e5f6a7b8c90004',
    'BDDK saha denetimi anomali bulguları tablosu oluşturuldu',
    true,
    'Hakan Yıldız (CAE)'
  )
ON CONFLICT (id) DO NOTHING;

-- Link current_version_id for Wave 37 docs
UPDATE office_documents SET current_version_id = 'f0ffce01-0000-0000-0000-000000000002'
WHERE id = 'f0ffce00-0000-0000-0000-000000000001';

UPDATE office_documents SET current_version_id = 'f0ffce02-0000-0000-0000-000000000001'
WHERE id = 'f0ffce00-0000-0000-0000-000000000002';

UPDATE office_documents SET current_version_id = 'f0ffce03-0000-0000-0000-000000000001'
WHERE id = 'f0ffce00-0000-0000-0000-000000000003';

-- =============================================================================
-- WAVE 38 SEED: Ultimate Grading Engine — BDDK Derecelendirme Senaryoları
-- =============================================================================

-- 1. Grading Scale — BDDK ve KERD-2026 standartları
INSERT INTO public.grading_scales (id, tenant_id, name, version, is_active, base_score, deduction_config) VALUES
  (
    'ff000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'KERD-2026 Standart Ölçeği',
    '4.0',
    true,
    100,
    '{"critical":25,"high":10,"medium":5,"low":1}'
  ),
  (
    'ff000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'BDDK Basit Ölçeği',
    '2024',
    false,
    100,
    '{"critical":20,"high":8,"medium":4,"low":1}'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. audit_grades — Gerçekçi BDDK derecelendirme sonuçları
INSERT INTO public.audit_grades (
  id, engagement_id, grading_scale_id, tenant_id,
  final_score, final_grade, assurance_opinion,
  base_score, total_deductions, capping_triggered, capping_reason,
  count_critical, count_high, count_medium, count_low, graded_by
)
SELECT
  'af000000-0000-0000-0000-000000000001',
  ae.id,
  'ff000000-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  72.0, 'C', 'SINIRLI_GUVENCE',
  100, 28.0, true, '1 critical bulgu mevcut - Maksimum not C',
  1, 1, 2, 3, 'Kıdemli Denetçi: Ahmet Demir'
FROM public.audit_engagements ae
WHERE ae.tenant_id = '11111111-1111-1111-1111-111111111111'
LIMIT 1
ON CONFLICT (engagement_id) DO NOTHING;

-- 3. grade_history — Not değişim geçmişi
INSERT INTO public.grade_history (id, engagement_id, tenant_id, previous_grade, new_grade, previous_score, new_score, change_reason, changed_by)
SELECT
  'ff000000-0000-0000-0000-000000000001',
  ae.id,
  '11111111-1111-1111-1111-111111111111',
  'D',
  'C',
  62.0,
  72.0,
  'BDDK Uyum Denetimi kapsamında yeniden değerlendirme: 2 kritik bulgu kapatıldı, kalan 1 kritik için kısıtlama uygulandı.',
  'Kıdemli Denetçi: Ahmet Demir'
FROM public.audit_engagements ae
WHERE ae.tenant_id = '11111111-1111-1111-1111-111111111111'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Wave 40 Seed: Cryptographic Report Sealer — Mühürlenmiş Rapor Örnekleri
-- ============================================================

-- Örnek Snapshots (gerçek UUID'ler seed'de hardcoded — gerçek rapor UUID'leri olmadığında kullanılır)
INSERT INTO report_snapshots (
  id, report_id, snapshot_by, content_json, title, status_at_seal, hash_sha256, metadata
) VALUES
  (
    'ffff0001-ffaf-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'kbirim@sentinelab.com.tr',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"2025 Q4 İç Denetim Nihai Raporu mühürlenmiş içeriği."}]}]}',
    '2025 Q4 İç Denetim — Nihai Rapor',
    'published',
    'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    '{"sealed_version": "1.0", "bddk_reference": "BDDK-DEN-2025-Q4", "attestation": "WORM"}'
  ),
  (
    'ffff0001-ffaf-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'denetim.baskani@sentinelab.com.tr',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Kredi Riski Kapsamlı Değerlendirme Raporu mühürlenmiş içeriği."}]}]}',
    'Kredi Riski Kapsamlı Değerlendirme — Q1 2026',
    'published',
    'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
    '{"sealed_version": "1.0", "bddk_reference": "BDDK-KRD-2026-Q1", "attestation": "WORM"}'
  )
ON CONFLICT (id) DO NOTHING;

-- İmzalar
INSERT INTO cryptographic_signatures (
  id, report_id, snapshot_id, signer_name, signer_role, signer_email,
  signature_type, signature_hash, order_index
) VALUES
  (
    'ffff0001-fff0-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'ffff0001-ffaf-0000-0000-000000000001',
    'Dr. Ayşe Kaya',
    'DENETIM_BASKANI',
    'a.kaya@sentinelab.com.tr',
    'APPROVAL',
    'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    1
  ),
  (
    'ffff0001-fff0-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'ffff0001-ffaf-0000-0000-000000000001',
    'Mehmet Yılmaz',
    'RISK_DIREKTORU',
    'm.yilmaz@sentinelab.com.tr',
    'APPROVAL',
    'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
    2
  ),
  (
    'ffff0001-fff0-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'ffff0001-ffaf-0000-0000-000000000001',
    'Fatma Demir',
    'YON_KURULU',
    'f.demir@sentinelab.com.tr',
    'SEAL',
    'e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6',
    3
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 39. GOLDEN THREAD — İzlenebilirlik Altın İpi Seed Verisi
-- =============================================================================
-- Bu seed mevcut 'actions' tablosunda finding_snapshot içeren kayıtların
-- regulatory_tags alanını günceller ve seed denetim yolculuğunu tamamlar.
-- Actions tablosunda önce temsili seed kaydı eklenir (conflict'te güncelleme yapılır).

-- Pilot Action: Kredi Limiti Aşımı İzlenebilirlik Kaydı
INSERT INTO public.actions (
  id,
  tenant_id,
  finding_id,
  title,
  description,
  priority,
  status,
  current_due_date,
  original_due_date,
  regulatory_tags,
  finding_snapshot
) VALUES (
  'a9000000-0000-0000-0000-000000000039',
  '11111111-1111-1111-1111-111111111111',
  'f1000000-0000-0000-0000-000000000001',
  'Kredi Limiti Aşımı Kontrol Açığı — Kapatma Aksiyonu',
  'Belirli kurumsal kredi hesaplarında limit aşımlarının onay sürecindeki kontrol zafiyetinin giderilmesi.',
  'CRITICAL',
  'pending',
  NOW() + INTERVAL '45 days',
  NOW() + INTERVAL '45 days',
  ARRAY['BDDK', 'GIAS-2024', 'Std15.1'],
  jsonb_build_object(
    'finding_id',     'a9000000-fffd-0000-0000-000000000001',
    'title',          'Onaysız Kredi Limiti Aşımı',
    'severity',       'CRITICAL',
    'risk_rating',    'HIGH',
    'gias_category',  'Kredi Riski',
    'description',    'Sistematik onay mekanizması devre dışı bırakılarak limitin üstüne çıkıldığı tespit edildi.',
    'created_at',     to_char(NOW() - INTERVAL '30 days', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  )
) ON CONFLICT (id) DO UPDATE
  SET regulatory_tags   = EXCLUDED.regulatory_tags;

-- İkinci Pilot Action: KVKK Uyum Süreci
INSERT INTO public.actions (
  id,
  tenant_id,
  finding_id,
  title,
  description,
  priority,
  status,
  current_due_date,
  original_due_date,
  regulatory_tags,
  finding_snapshot
) VALUES (
  'a9000000-0000-0000-0000-000000000040',
  '11111111-1111-1111-1111-111111111111',
  'f1000000-0000-0000-0000-000000000002',
  'KVKK Veri Erişim Logu Eksikliği — Kapatma Aksiyonu',
  'Hassas kişisel veri tablolarına erişim loglarının KVKK Madde 12 kapsamında tutulmaması.',
  'HIGH',
  'evidence_submitted',
  NOW() + INTERVAL '20 days',
  NOW() + INTERVAL '20 days',
  ARRAY['KVKK', 'BDDK', 'GIAS-2024'],
  jsonb_build_object(
    'finding_id',     'a9000000-fffd-0000-0000-000000000002',
    'title',          'Kişisel Veri Erişim Logu Eksikliği',
    'severity',       'HIGH',
    'risk_rating',    'HIGH',
    'gias_category',  'Veri Yönetimi',
    'description',    'Hassas kişisel verilere erişim loglarının tutulmaması yasal yükümlülükleri ihlal etmektedir.',
    'created_at',     to_char(NOW() - INTERVAL '15 days', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  )
) ON CONFLICT (id) DO UPDATE
  SET regulatory_tags   = EXCLUDED.regulatory_tags;

-- =============================================================================
-- WAVE 41 SEED: Data Signals & Seismograph
-- =============================================================================

-- 1. external_data_signals — Gerçekçi Türk Bankacılık Sinyalleri
INSERT INTO public.external_data_signals (id, tenant_id, signal_type, signal_source, title, description, signal_strength, impact_score, severity, is_active, triggered_at) VALUES
  (
    'ef000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'MACRO_ECONOMIC',
    'TCMB',
    'TCMB Ani Faiz Artışı Sinyali',
    'Türkiye Cumhuriyet Merkez Bankası, enflasyonla mücadele kapsamında politika faizini 250 baz puan artırdı. Katılım bankalarında Sukuk maliyetleri ve kâr payı oranları kritik düzeyde etkilenebilir.',
    8.5,
    7.2,
    'high',
    true,
    NOW() - INTERVAL '2 hours'
  ),
  (
    'ef000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'CYBER',
    'CERT-TR',
    'Global Siber Fidye Yazılımı Alarmı',
    'CERT-TR, Türk finans sektörüne yönelik organize edilmiş uluslararası fidye yazılımı kampanyası tespit etti. Hedef sistemler: SWIFT, core banking API katmanları.',
    9.8,
    9.5,
    'critical',
    true,
    NOW() - INTERVAL '45 minutes'
  ),
  (
    'ef000000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'REGULATORY',
    'BDDK',
    'BDDK Likidite Karşılama Oranı Revizyonu',
    'BDDK, Katılım Bankaları için LCR (Likidite Karşılama Oranı) alt limitini %80''den %100''e yükseltme tasarısı yayımladı. Yürürlük tarihi: 90 gün.',
    6.0,
    5.8,
    'medium',
    true,
    NOW() - INTERVAL '6 hours'
  ),
  (
    'ef000000-0000-0000-0000-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'MARKET',
    'Bloomberg',
    'Döviz Kuru Volatilite Artışı (USD/TRY)',
    'USD/TRY paritesi son 48 saatte %4.2 değer kaybetti. Döviz pozisyon limitleri ve kur riski yönetimi gözden geçirilmeli.',
    7.1,
    6.4,
    'high',
    true,
    NOW() - INTERVAL '30 minutes'
  ),
  (
    'ef000000-0000-0000-0000-000000000005',
    '11111111-1111-1111-1111-111111111111',
    'REGULATORY',
    'SPK',
    'Sermaye Piyasası Kripto Varlık Düzenlemesi',
    'SPK, bankaların müşterileri adına kripto varlık saklama hizmeti sunmasına izin veren yönetmelik taslağını kamuoyuyla paylaştı.',
    4.5,
    3.2,
    'low',
    false,
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. seismograph_logs — Son 24 saat sismograf verisi (saat başı)
INSERT INTO public.seismograph_logs (id, tenant_id, log_hour, hour_label, exceptions, passes, signal_strength) VALUES
  ('ff000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '23 hours', '01:00', 2, 45, 0.4),
  ('ff000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '22 hours', '02:00', 1, 52, 0.2),
  ('ff000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '21 hours', '03:00', 0, 37, 0.0),
  ('ff000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '20 hours', '04:00', 3, 41, 0.7),
  ('ff000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '19 hours', '05:00', 1, 60, 0.2),
  ('ff000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '18 hours', '06:00', 4, 78, 0.5),
  ('ff000000-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '17 hours', '07:00', 8, 112, 0.7),
  ('ff000000-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '16 hours', '08:00', 12, 145, 0.8),
  ('ff000000-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '15 hours', '09:00', 18, 160, 1.1),
  ('ff000000-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '14 hours', '10:00', 24, 148, 1.6),
  ('ff000000-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '13 hours', '11:00', 31, 155, 2.0),
  ('ff000000-0000-0000-0000-000000000012', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '12 hours', '12:00', 15, 130, 1.2),
  ('ff000000-0000-0000-0000-000000000013', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '11 hours', '13:00', 19, 141, 1.3),
  ('ff000000-0000-0000-0000-000000000014', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '10 hours', '14:00', 22, 138, 1.6),
  ('ff000000-0000-0000-0000-000000000015', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '9 hours',  '15:00', 42, 120, 3.5),
  ('ff000000-0000-0000-0000-000000000016', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '8 hours',  '16:00', 28, 110, 2.5),
  ('ff000000-0000-0000-0000-000000000017', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '7 hours',  '17:00', 16, 98,  1.6),
  ('ff000000-0000-0000-0000-000000000018', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '6 hours',  '18:00', 9,  87,  0.9),
  ('ff000000-0000-0000-0000-000000000019', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '5 hours',  '19:00', 6,  71,  0.8),
  ('ff000000-0000-0000-0000-000000000020', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '4 hours',  '20:00', 11, 65,  1.7),
  ('ff000000-0000-0000-0000-000000000021', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '3 hours',  '21:00', 7,  55,  1.2),
  ('ff000000-0000-0000-0000-000000000022', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '2 hours',  '22:00', 5,  48,  1.0),
  ('ff000000-0000-0000-0000-000000000023', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '1 hour',   '23:00', 3,  40,  0.8)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 42 SEED: Board Resolution & E-Voting Deck
-- =============================================================================

INSERT INTO public.board_resolutions (id, tenant_id, title, description, resolution_type, status, quorum_required, meeting_date, regulatory_ref, proposed_by) VALUES
  (
    'bf000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Bireysel Kredi Tahsis Süreci Revizyonu',
    'BDDK 5411 sayılı Kanun 51. Maddesi ve ilgili Yönetmelik değişiklikleri çerçevesinde, bireysel kredi tahsis sürecinin yeniden yapılandırılması, limit matrisinin güncellenmesi ve otomatik onay mekanizmasının devreye alınması hususlarının karara bağlanması.',
    'APPROVAL',
    'OPEN',
    7,
    NOW() + INTERVAL '3 days',
    'BDDK 5411 md.51
ON CONFLICT DO NOTHING;
 GIAS 2024 Std.8.3',
    'Genel Müdür Yardımcısı — Bireysel Bankacılık'
  ),
  (
    'bf000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'KVKK Veri İşleme Politikası Güncellemesi',
    'Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında hazırlanan güncel veri işleme politikasının ve müşteri aydınlatma metinlerinin Yönetim Kurulu onayına sunulması.',
    'APPROVAL',
    'CLOSED',
    5,
    NOW() - INTERVAL '10 days',
    'KVKK md.10, 12; BDDK Siber Güvenlik Rehberi',
    'Hukuk ve Uyum Direktörü'
  ),
  (
    'bf000000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'İç Denetim Yıllık Planı — 2026',
    'Teftiş Kurulu Başkanlığı tarafından GIAS 2024 standartları çerçevesinde hazırlanan 2026 yılı iç denetim çalışma planının ve risk odaklı önceliklendirme matrisinin YK bilgisine sunulması.',
    'INFORMATION',
    'OPEN',
    5,
    NOW() + INTERVAL '7 days',
    'GIAS 2024 Std.9.1; BDDK İç Denetim Yönetmeliği',
    'Teftiş Kurulu Başkanı (CAE)'
  ),
  (
    'bf000000-0000-0000-0000-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'Operasyonel Risk Çerçevesi Onayı',
    'Basel III operasyonel risk standartları ve BDDK Operasyonel Risk Yönetimi Rehberi esas alınarak revize edilen Operasyonel Risk Politikası ile ölçüm ve izleme metodolojisinin YK onayına sunulması.',
    'APPROVAL',
    'OPEN',
    7,
    NOW() + INTERVAL '14 days',
    'Basel III; BDDK Operasyonel Risk Yönetimi Rehberi 2024',
    'Risk Yönetimi Genel Müdür Yardımcısı'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.committee_votes (id, tenant_id, resolution_id, member_name, member_title, vote, rationale, voted_at) VALUES
  -- Karar 1: Kredi Tahsis Süreci Revizyonu
  ('cf000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'bf000000-0000-0000-0000-000000000001', 'Ahmet Yılmaz', 'Yönetim Kurulu Başkanı', 'FOR', 'Operasyonel verimliliği artıracak, rekabet gücünü güçlendirecektir.', NOW() - INTERVAL '1 hour'),
  ('cf000001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'bf000000-0000-0000-0000-000000000001', 'Fatma Kaya', 'Bağımsız YK Üyesi', 'FOR', 'BDDK uyumluluk açısından gereklidir.', NOW() - INTERVAL '45 minutes'),
  ('cf000001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'bf000000-0000-0000-0000-000000000001', 'Mehmet Demir', 'YK Üyesi', 'AGAINST', 'Uygulama takvimi kısa
ON CONFLICT DO NOTHING;
 etki analizi yetersiz.', NOW() - INTERVAL '30 minutes'),
  ('cf000001-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'bf000000-0000-0000-0000-000000000001', 'Ayşe Çelik', 'Bağımsız YK Üyesi', 'FOR', 'Risk azaltıcı etkileri baskın; destekliyorum.', NOW() - INTERVAL '20 minutes'),
  ('cf000001-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'bf000000-0000-0000-0000-000000000001', 'Hasan Öztürk', 'YK Üyesi', 'ABSTAIN', NULL, NOW() - INTERVAL '15 minutes'),
  -- Karar 2: KVKK (KAPANDI)
  ('cf000002-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'bf000000-0000-0000-0000-000000000002', 'Ahmet Yılmaz', 'Yönetim Kurulu Başkanı', 'FOR', 'Yasal yükümlülük; oybirliğiyle kabul.', NOW() - INTERVAL '10 days'),
  ('cf000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'bf000000-0000-0000-0000-000000000002', 'Fatma Kaya', 'Bağımsız YK Üyesi', 'FOR', 'KVKK uyumluluğu kritik öneme sahiptir.', NOW() - INTERVAL '10 days'),
  ('cf000002-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'bf000000-0000-0000-0000-000000000002', 'Mehmet Demir', 'YK Üyesi', 'FOR', NULL, NOW() - INTERVAL '10 days'),
  ('cf000002-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'bf000000-0000-0000-0000-000000000002', 'Ayşe Çelik', 'Bağımsız YK Üyesi', 'FOR', NULL, NOW() - INTERVAL '10 days'),
  ('cf000002-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'bf000000-0000-0000-0000-000000000002', 'Hasan Öztürk', 'YK Üyesi', 'FOR', NULL, NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Wave 44 Seed: Core Banking API Connectors
-- BDDK uyumlu bankacılık pipeline tanımları ve log örnekleri
-- ============================================================

-- Pipeline Tanımları
INSERT INTO external_data_pipelines (
  id, pipeline_code, name, description, system_source, target_table,
  schedule_cron, is_active, sync_type, data_format, auth_type,
  endpoint_url, last_success_at, record_count
) VALUES
  (
    'ffff0001-fffe-0000-0000-000000000001',
    'MIZAN-DAILY',
    'Mizan Verisi Günlük Aktarımı',
    'Genel Muhasebe Sistemi''nden günlük mizan verilerinin Sentinel analiz tablolarına aktarılması. BDDK Muhasebe Md. 7 kapsamında.',
    'CORE_BANKING',
    'gl_trial_balance',
    '0 6 * * *',
    TRUE,
    'PULL',
    'JSON',
    'API_KEY',
    'https://cbs-api.bankinternal.com/v2/gl/trial-balance',
    now() - INTERVAL '1 hour',
    48320
  ),
  (
    'ffff0001-fffe-0000-0000-000000000002',
    'EFT-INTRADAY',
    'Günlük EFT/Havale Log Çekimi',
    'Gün içi EFT ve havale işlem loglarının gerçek zamanlı izleme için çekilmesi. MASAK uyum takibi doğrudan bu pipeline üzerinden yapılmaktadır.',
    'CORE_BANKING',
    'eft_transactions',
    '*/15 * * * *',
    TRUE,
    'PULL',
    'JSON',
    'OAUTH2',
    'https://cbs-api.bankinternal.com/v2/transactions/eft',
    now() - INTERVAL '12 minutes',
    1240
  ),
  (
    'ffff0001-fffe-0000-0000-000000000003',
    'SWIFT-MT940',
    'SWIFT MT940 Hesap Ekstreleri',
    'Muhabir banka hesap ekstrelerinin SWIFT MT940 formatında SFTP üzerinden çekilmesi ve doğrulanması.',
    'SWIFT',
    'swift_statements',
    '0 7 * * 1-5',
    TRUE,
    'PULL',
    'FIXED_LENGTH',
    'SFTP',
    NULL,
    now() - INTERVAL '18 hours',
    96
  ),
  (
    'ffff0001-fffe-0000-0000-000000000004',
    'KREDI-PORTFOLIO',
    'Kredi Portföy Anlık Görüntüsü',
    'Aktif kredi portföyünün tüm taksit ve vade bilgileriyle birlikte günlük snapshot''ının çekilmesi. Risk skorlama modeli için girdi.',
    'CORE_BANKING',
    'credit_portfolio_snapshot',
    '0 23 * * *',
    TRUE,
    'PULL',
    'CSV',
    'DB_LINK',
    NULL,
    now() - INTERVAL '1 day',
    284910
  ),
  (
    'ffff0001-fffe-0000-0000-000000000005',
    'MIS-RAPORLAMA',
    'MIS Yönetim Raporlama Sistemi Aktarımı',
    'Yönetim Bilgi Sistemi''nden haftalık özet raporların Sentinel''e aktarılması. BDDK raporlama takvimi ile senkronizasyon.',
    'MIS',
    'mis_management_reports',
    '0 8 * * 1',
    TRUE,
    'PULL',
    'XML',
    'API_KEY',
    'https://mis.bankinternal.com/api/reports/weekly',
    now() - INTERVAL '6 days',
    210
  ),
  (
    'ffff0001-fffe-0000-0000-000000000006',
    'KVKK-MASAK-PUSH',
    'KVKK/MASAK Uyumsuzluk Bildirimi',
    'Sentinel''den tespit edilen KVKK ve MASAK ihlallerinin dış uyum sistemine bildirilmesi. Çift yönlü doğrulama dahil.',
    'COMPLIANCE_SYSTEM',
    'compliance_notifications',
    '0 */4 * * *',
    FALSE,
    'PUSH',
    'JSON',
    'MTLS',
    'https://compliance.regulator-api.gov.tr/api/v1/notify',
    NULL,
    0
  )
ON CONFLICT (pipeline_code) DO NOTHING;

-- Senkronizasyon Logları (geçmiş çalıştırmalar)
INSERT INTO core_sync_logs (
  id, pipeline_id, pipeline_code, started_at, completed_at, duration_ms,
  status, records_fetched, records_written, records_failed, triggered_by,
  error_code, error_detail, triggered_user
) VALUES
  -- MIZAN başarılı
  (
    'ffff0001-fff0-0000-0000-000000000001',
    'ffff0001-fffe-0000-0000-000000000001',
    'MIZAN-DAILY',
    now() - INTERVAL '1 hour 5 minutes',
    now() - INTERVAL '1 hour',
    312000,
    'SUCCESS', 48320, 48320, 0, 'SCHEDULER',
    NULL, NULL, NULL
  ),
  -- EFT son çalıştırma
  (
    'ffff0001-fff0-0000-0000-000000000002',
    'ffff0001-fffe-0000-0000-000000000002',
    'EFT-INTRADAY',
    now() - INTERVAL '14 minutes',
    now() - INTERVAL '12 minutes',
    87000,
    'SUCCESS', 1240, 1240, 0, 'SCHEDULER',
    NULL, NULL, NULL
  ),
  -- EFT önceki başarısız çalıştırma
  (
    'ffff0001-fff0-0000-0000-000000000003',
    'ffff0001-fffe-0000-0000-000000000002',
    'EFT-INTRADAY',
    now() - INTERVAL '29 minutes',
    now() - INTERVAL '28 minutes',
    45000,
    'FAILED', 0, 0, 0, 'SCHEDULER',
    'TIMEOUT_502',
    'CBS API gateway timed out (502 Bad Gateway). Yeniden deneme planlandı.',
    NULL
  ),
  -- SWIFT başarılı
  (
    'ffff0001-fff0-0000-0000-000000000004',
    'ffff0001-fffe-0000-0000-000000000003',
    'SWIFT-MT940',
    now() - INTERVAL '18 hours 8 minutes',
    now() - INTERVAL '18 hours',
    451000,
    'SUCCESS', 96, 96, 0, 'SCHEDULER',
    NULL, NULL, NULL
  ),
  -- Kredi portföyü kısmı başarılı
  (
    'ffff0001-fff0-0000-0000-000000000005',
    'ffff0001-fffe-0000-0000-000000000004',
    'KREDI-PORTFOLIO',
    now() - INTERVAL '1 day 12 minutes',
    now() - INTERVAL '1 day',
    720000,
    'PARTIAL', 284910, 284820, 90, 'SCHEDULER',
    'PARTIAL_WRITE',
    '90 kayıt foreign key kısıtlaması nedeniyle yazılamadı. Manuel inceleme gerekiyor.',
    NULL
  ),
  -- Manuel tetikleme
  (
    'ffff0001-fff0-0000-0000-000000000006',
    'ffff0001-fffe-0000-0000-000000000001',
    'MIZAN-DAILY',
    now() - INTERVAL '3 hours',
    now() - INTERVAL '2 hours 50 minutes',
    587000,
    'SUCCESS', 48280, 48280, 0, 'MANUAL',
    NULL, NULL,
    'denetim.baskani@sentinelab.com.tr'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 42 SEED: Board Resolution & E-Voting Deck
-- Yönetim Kurulu Karar ve Oylama Masası — Örnek Oturum Verileri
-- =============================================================================

INSERT INTO public.board_resolutions (
  id, title, description, resolution_type, status,
  quorum_required, meeting_date, regulatory_ref, proposed_by
) VALUES
  (
    'bf420000-0000-0000-0000-000000000001',
    'Kredi Tahsis Süreci Revizyonu — SOX/ICFR Uyumu',
    'Basel IV ve SOX Section 302 kapsamında kurumsal kredi tahsis sürecinin yeniden yapılandırılması ve 4-Göz ilkesine uygun dual-control mekanizmasının zorunlu kılınması.',
    'APPROVAL',
    'OPEN',
    7,
    '2026-03-15T10:00:00+03:00',
    'BDDK 2024/1 Madde 12, SOX S.302',
    'Dr. Mehmet Yıldız — Yönetim Kurulu Başkanı'
  ),
  (
    'bf420000-0000-0000-0000-000000000002',
    'Yıllık Bütçe ve Kaynak Planı — FY2026',
    'İç Denetim Bölümü FY2026 operasyonel bütçesinin onayı ve ek uzman istihdamı kararının YK gündemine alınması.',
    'APPROVAL',
    'OPEN',
    5,
    '2026-03-15T11:30:00+03:00',
    'IIA Practice Advisory 2030-1',
    'CAE Dr. Hasan Aksoy'
  ),
  (
    'bf420000-0000-0000-0000-000000000003',
    'FATF Öneri 16 Raporlaması — Gecikme Gerekçe Kabulü',
    'FATF Öneri 16 kapsamındaki işlem izleme raporlamasındaki 72 saatlik gecikmenin operasyonel sebepleri and gerekçe müzakeresi.',
    'ACKNOWLEDGEMENT',
    'CLOSED',
    5,
    '2026-03-10T09:00:00+03:00',
    'FATF R.16, MASAK 2023/5',
    'Uyum Direktörü Ayşe Kara'
  ),
  (
    'bf420000-0000-0000-0000-000000000004',
    'Siber Güvenlik Altyapısı Modernizasyonu',
    'ISO 27001:2022 ve BDDK BT Risk Yönetimi Tebliği kapsamında Zero-Trust mimarisine geçiş yatırım kararı (₺12.5M bütçe talebi).',
    'APPROVAL',
    'DEFERRED',
    7,
    '2026-03-20T14:00:00+03:00',
    'BDDK BT Risk 2023, ISO 27001:2022',
    'CTO Ahmet Demir'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.committee_votes (
  id, resolution_id, member_name, member_title, vote, rationale, voted_at
) VALUES
  -- Karar 1: Kredi Tahsis — açık oylama
  (
    'cf420000-0000-0000-0000-000000000001',
    'bf420000-0000-0000-0000-000000000001',
    'Dr. Mehmet Yıldız',
    'Yönetim Kurulu Başkanı',
    'FOR',
    'Basel IV uyum zorunluluğu açısından kritik reform. Erteleme riski BDDK yaptırımı doğurabilir.',
    '2026-03-15T10:12:00+03:00'
  ),
  (
    'cf420000-0000-0000-0000-000000000002',
    'bf420000-0000-0000-0000-000000000001',
    'Fatma Çelik',
    'Bağımsız Üye',
    'FOR',
    'Dual kontrol mekanizması kurumsal yönetişim açısından zorunludur.',
    '2026-03-15T10:15:00+03:00'
  ),
  (
    'cf420000-0000-0000-0000-000000000003',
    'bf420000-0000-0000-0000-000000000001',
    'Kemal Öztürk',
    'Risk Komitesi Başkanı',
    'FOR',
    'Revizyon 4-Göz ilkesini güçlendiriyor. Tam destek.',
    '2026-03-15T10:17:00+03:00'
  ),
  (
    'cf420000-0000-0000-0000-000000000004',
    'bf420000-0000-0000-0000-000000000001',
    'Selin Arslan',
    'Bağımsız Üye',
    'ABSTAIN',
    'Teknik detayların Kredi Alt Komitesi tarafından incelenmesini bekliyorum.',
    '2026-03-15T10:19:00+03:00'
  ),
  -- Karar 3: FATF — kapalı oylama
  (
    'cf420000-0000-0000-0000-000000000005',
    'bf420000-0000-0000-0000-000000000003',
    'Dr. Mehmet Yıldız',
    'Yönetim Kurulu Başkanı',
    'FOR',
    'Gerekçe makul, operasyonel nedenler belgelenmiş kabul edildi.',
    '2026-03-10T09:25:00+03:00'
  ),
  (
    'cf420000-0000-0000-0000-000000000006',
    'bf420000-0000-0000-0000-000000000003',
    'Fatma Çelik',
    'Bağımsız Üye',
    'AGAINST',
    '72 saatlik gecikme kural ihlali olarak kayıt altına alınmalıdır.',
    '2026-03-10T09:28:00+03:00'
  ),
  (
    'cf420000-0000-0000-0000-000000000007',
    'bf420000-0000-0000-0000-000000000003',
    'Kemal Öztürk',
    'Risk Komitesi Başkanı',
    'FOR',
    'Sistem kaynaklı gecikme — raporlama altyapısı iyileştirme planı mevcut.',
    '2026-03-10T09:30:00+03:00'
  ),
  (
    'cf420000-0000-0000-0000-000000000008',
    'bf420000-0000-0000-0000-000000000003',
    'Selin Arslan',
    'Bağımsız Üye',
    'FOR',
    NULL,
    '2026-03-10T09:32:00+03:00'
  ),
  (
    'cf420000-0000-0000-0000-000000000009',
    'bf420000-0000-0000-0000-000000000003',
    'Burak Şahin',
    'Uyum Komitesi Üyesi',
    'FOR',
    'Uyum direktörünün sunumu ikna edici.',
    '2026-03-10T09:35:00+03:00'
  )
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- WAVE 45 SEED: AI Report Translator — İngilizce ITGC Çevirileri
-- =============================================================================

INSERT INTO public.report_translations (id, tenant_id, report_id, source_language, target_language, source_text, translated_text, section_key, translation_model, confidence_score, is_reviewed, created_by) VALUES
  (
    'ff000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    (SELECT id FROM public.reports WHERE tenant_id = '11111111-1111-1111-1111-111111111111' LIMIT 1),
    'tr',
    'en',
    'Bu denetim, Bilgi Teknolojileri Genel Kontrolleri (ITGC) kapsamında gerçekleştirilmiştir. Denetim bulgularına göre, erişim kontrolü yönetiminde önemli zafiyetler tespit edilmiştir. Ayrıcalıklı kullanıcı hesaplarının yönetimi yetersiz kalmaktadır.',
    'This audit was conducted within the scope of IT General Controls (ITGC). According to the audit findings, significant deficiencies have been identified in access control management. The management of privileged user accounts remains inadequate.',
    'executive_summary',
    'gpt-4o',
    0.9850,
    true,
    'AI Çeviri Motoru v4.5'
  ),
  (
    'ff000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    (SELECT id FROM public.reports WHERE tenant_id = '11111111-1111-1111-1111-111111111111' LIMIT 1),
    'tr',
    'en',
    'Bulgu 1 — Ayrıcalıklı Erişim Yönetimi (BDDK Rehber Md. 22): Sistem yöneticisi hesaplarının periyodik incelemesi yapılmamaktadır. Önerilen eylem: Üç aylık erişim gözden geçirme süreci oluşturulmalı ve CISO onayına bağlanmalıdır.',
    'Finding 1 — Privileged Access Management (BRSA Guideline Art. 22): Periodic reviews of system administrator accounts are not being conducted. Recommended Action: A quarterly access review process should be established and linked to CISO approval.',
    'findings',
    'gpt-4o',
    0.9720,
    true,
    'AI Çeviri Motoru v4.5'
  ),
  (
    'ff000000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    (SELECT id FROM public.reports WHERE tenant_id = '11111111-1111-1111-1111-111111111111' LIMIT 1),
    'tr',
    'en',
    'Bulgu 2 — Değişim Yönetimi Süreci (ISO 27001 A.14.2.2): Yazılım değişikliklerinin yalnızca %45''i resmi onay prosedürüne tabi tutulmaktadır. Bu oran BDDK beklentileri olan %95''in çok altındadır.',
    'Finding 2 — Change Management Process (ISO 27001 A.14.2.2): Only 45% of software changes are subject to formal approval procedures. This rate is well below the BRSA expectation of 95%.',
    'findings',
    'gpt-4o',
    0.9680,
    false,
    'AI Çeviri Motoru v4.5'
  ),
  (
    'ff000000-0000-0000-0000-000000000004',
    '11111111-1111-1111-1111-111111111111',
    (SELECT id FROM public.reports WHERE tenant_id = '11111111-1111-1111-1111-111111111111' LIMIT 1),
    'tr',
    'en',
    'Genel Sonuç: İç denetim ekibi, bilgi sistemleri kontrol ortamının GIAS 2024 standardı çerçevesinde "Sınırlı Güvence" düzeyinde değerlendirildiğini bildirmektedir. Kritik bulgular 90 gün içinde giderilmeli ve ilerleme CAE''ye raporlanmalıdır.',
    'Overall Conclusion: The internal audit team reports that the information systems control environment is assessed at the "Limited Assurance" level within the framework of GIAS 2024 standards. Critical findings must be remediated within 90 days and progress reported to the CAE.',
    'recommendations',
    'gpt-4o',
    0.9910,
    true,
    'AI Çeviri Motoru v4.5'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 43 SEED: Quantum Risk Graph — risk_edges (Bankacılık Risk İlişkileri)
-- =============================================================================
-- Source/Target IDs reference rkm_master rows inserted in Wave 36 seed:
--   gggg0001-rkm0-0000-0000-000000000001  → Kredi Yoğunlaşma Riski
--   gggg0001-rkm0-0000-0000-000000000002  → Core Banking Erişim Kontrolü
--   gggg0001-rkm0-0000-0000-000000000003  → MASAK Şüpheli İşlem Bildirimi
--   gggg0001-rkm0-0000-0000-000000000004  → LCR Likidite Tampon Yetersizliği
--   gggg0001-rkm0-0000-0000-000000000005  → KVKK Bildirim Süreci
--   gggg0001-rkm0-0000-0000-000000000006  → Dijital Dönüşüm Teknik Borç
-- =============================================================================

INSERT INTO public.risk_edges
  (id, source_id, target_id, relationship_type, weight, description)
VALUES
  -- Kredi Yoğunlaşma → Likidite (nedensellik: büyük kredi bozulması likiditeyi etkiler)
  (
    'edfe0001-0000-0000-0000-000000000001',
    'ffff0001-fff0-0000-0000-000000000001',
    'ffff0001-fff0-0000-0000-000000000004',
    'CAUSAL',
    3.5,
    'Portföy yoğunlaşması kayıpları LCR baskısına yol açabilir'
  ),
  -- Core Banking Erişim → MASAK İzleme (bağımlılık: güvenlik açığı şüpheli işlem tespitini engeller)
  (
    'edfe0001-0000-0000-0000-000000000002',
    'ffff0001-fff0-0000-0000-000000000002',
    'ffff0001-fff0-0000-0000-000000000003',
    'DEPENDENCY',
    2.8,
    'Erişim kontrolü zafiyeti MASAK işlem izleme kalitesini düşürür'
  ),
  -- Dijital Dönüşüm Teknik Borç → Core Banking Erişim (nedensellik: modernizasyon gecikmesi güvenliği artırır)
  (
    'edfe0001-0000-0000-0000-000000000003',
    'ffff0001-fff0-0000-0000-000000000006',
    'ffff0001-fff0-0000-0000-000000000002',
    'ESCALATION',
    2.2,
    'Teknik borç birikimi güncellenmemiş erişim yönetimini tetikler'
  ),
  -- MASAK → Uyum Riski (korelasyon: her ikisi de mevzuat uyum alanında)
  (
    'edfe0001-0000-0000-0000-000000000004',
    'ffff0001-fff0-0000-0000-000000000003',
    'ffff0001-fff0-0000-0000-000000000005',
    'CORRELATED',
    1.9,
    'Uyum zaafiyetleri KVKK ve AML süreçlerini eş zamanlı etkiler'
  ),
  -- Likidite → Kredi Yoğunlaşma (geri döngü: stres ortamında kredi çekilmesi)
  (
    'edfe0001-0000-0000-0000-000000000005',
    'ffff0001-fff0-0000-0000-000000000004',
    'ffff0001-fff0-0000-0000-000000000001',
    'CORRELATED',
    1.5,
    'Likidite kısıtı kredi portföyü kalitesini bozar (geri etki)'
  ),
  -- KVKK → Dijital Dönüşüm (engelleme: veri sınırları dijital büyümeyi kısıtlar)
  (
    'edfe0001-0000-0000-0000-000000000006',
    'ffff0001-fff0-0000-0000-000000000005',
    'ffff0001-fff0-0000-0000-000000000006',
    'DEPENDENCY',
    1.2,
    'KVKK gereksinimleri dijital platform veri mimarisini etkiler'
  ),
  -- Kredi Yoğunlaşma → MASAK (dolaylı: büyük kurumsal müşteri HNW riski)
  (
    'edfe0001-0000-0000-0000-000000000007',
    'ffff0001-fff0-0000-0000-000000000001',
    'ffff0001-fff0-0000-0000-000000000003',
    'CORRELATED',
    1.8,
    'Büyük kurumsal kredi müşterileri AML risk profilini artırır'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 46 SEED: Fraud Fingerprint & Behavior Analytics
-- =============================================================================

-- 1. user_behavior_logs — Anomali İçeren Kullanıcı Davranış Kayıtları
INSERT INTO public.user_behavior_logs (id, tenant_id, user_id, user_name, session_id, event_type, event_category, ip_address, resource_type, resource_id, metadata, risk_score, occurred_at) VALUES
  (
    'bf000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'demo-user-001',
    'Mustafa Kara',
    'sess-alpha-001',
    'BULK_DOWNLOAD',
    'critical',
    '185.220.101.47',
    'customer_data',
    'customer-batch-2026',
    '{"file_count": 1847, "total_mb": 2340, "day_of_week": "Saturday", "hour": 23}',
    91.5,
    NOW() - INTERVAL '2 days' + INTERVAL '23 hours'
  ),
  (
    'bf000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'demo-user-002',
    'Zehra Yıldız',
    'sess-beta-002',
    'LOGIN',
    'suspicious',
    '91.108.4.188',
    NULL,
    NULL,
    '{"country": "RU", "usual_country": "TR", "vpn_detected": true, "distance_km": 2840}',
    78.2,
    NOW() - INTERVAL '6 hours'
  ),
  (
    'bf000000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'demo-user-001',
    'Mustafa Kara',
    'sess-alpha-002',
    'CONFIG_CHANGE',
    'suspicious',
    '185.220.101.47',
    'system_config',
    'auth-policy-001',
    '{"changed_field": "mfa_required", "old_value": true, "new_value": false}',
    85.0,
    NOW() - INTERVAL '1 day' + INTERVAL '2 hours'
  ),
  (
    'bf000000-0000-0000-0000-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'demo-user-003',
    'Ali Özcan',
    'sess-gamma-003',
    'REPORT_VIEW',
    'normal',
    '10.0.0.45',
    'report',
    'report-uuid-xyz',
    '{"report_type": "ITGC", "duration_sec": 245}',
    5.0,
    NOW() - INTERVAL '3 hours'
  ),
  (
    'bf000000-0000-0000-0000-000000000005',
    '11111111-1111-1111-1111-111111111111',
    'demo-user-004',
    'Elif Şahin',
    'sess-delta-004',
    'DATA_EXPORT',
    'suspicious',
    '10.0.0.99',
    'finding',
    NULL,
    '{"export_count": 512, "format": "CSV", "after_hours": true, "hour": 2}',
    67.8,
    NOW() - INTERVAL '18 hours'
  ),
  (
    'bf000000-0000-0000-0000-000000000006',
    '11111111-1111-1111-1111-111111111111',
    'demo-user-002',
    'Zehra Yıldız',
    'sess-beta-003',
    'LOGIN',
    'suspicious',
    '95.173.190.200',
    NULL,
    NULL,
    '{"failed_attempts": 7, "locked": false, "country": "UA"}',
    72.0,
    NOW() - INTERVAL '4 hours'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. fraud_alerts — Tespit Edilen Suiistimal Uyarıları
INSERT INTO public.fraud_alerts (id, tenant_id, alert_code, title, description, severity, status, affected_user, affected_user_name, source_log_id, risk_score, evidence) VALUES
  (
    'fa000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'BULK_DOWNLOAD',
    'Hafta Sonu Toplu Veri İndirme Girişimi',
    'Mustafa Kara kullanıcısı, Cumartesi gecesi 23:00''da 1.847 müşteri kaydını (2.3 GB) sistematik olarak indirmiştir. Bu davranış normal çalışma saatleri ve veri erişim normlarıyla tam anlamıyla çelişmektedir. BDDK Siber Güvenlik Rehberi Madde 14 kapsamında acil soruşturma açılması önerilmektedir.',
    'critical',
    'open',
    'demo-user-001',
    'Mustafa Kara',
    'bf000000-0000-0000-0000-000000000001',
    91.5,
    '{"ip": "185.220.101.47", "file_count": 1847, "total_mb": 2340, "occurred_at_weekend": true}'
  ),
  (
    'fa000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'UNUSUAL_IP',
    'Sıra Dışı IP''den Giriş — Rusya Kaynaklı',
    'Zehra Yıldız kullanıcısı, alışılmış Türkiye lokasyonundan 2.840 km uzakta, Rusya IP adresi (91.108.4.188) üzerinden VPN kullanarak sisteme erişmiştir. Çoklu başarısız giriş denemeleri tespit edilmiştir.',
    'high',
    'investigating',
    'demo-user-002',
    'Zehra Yıldız',
    'bf000000-0000-0000-0000-000000000002',
    78.2,
    '{"ip": "91.108.4.188", "country": "RU", "vpn": true, "distance_km": 2840}'
  ),
  (
    'fa000000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'PRIVILEGE_ESCALATION',
    'Çok Faktörlü Kimlik Doğrulama Devre Dışı Bırakıldı',
    'Mustafa Kara kullanıcısı, toplu indirme eyleminden 1 saat sonra sistem genelindeki MFA zorunluluğunu devre dışı bırakmıştır. Bu iki eylem arasındaki korelasyon, koordineli bir iç tehdit senaryosuna işaret edebilir.',
    'critical',
    'open',
    'demo-user-001',
    'Mustafa Kara',
    'bf000000-0000-0000-0000-000000000003',
    92.0,
    '{"config_key": "mfa_required", "changed_to": false, "correlated_with": "fa000000-0000-0000-0000-000000000001"}'
  ),
  (
    'fa000000-0000-0000-0000-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'OFF_HOURS_ACCESS',
    'Gece 02:00 Toplu Bulgu Dışa Aktarımı',
    'Elif Şahin kullanıcısı gece 02:00''de 512 bulguyu CSV formatında dışa aktarmıştır. Mesai saatleri dışı veri erişimi iç politika ihlali oluşturmaktadır.',
    'medium',
    'open',
    'demo-user-004',
    'Elif Şahin',
    'bf000000-0000-0000-0000-000000000005',
    67.8,
    '{"export_count": 512, "format": "CSV", "hour": 2}'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Wave 47 Seed: Regulatory Radar & Horizon Scanner
-- BDDK, SPK, MASAK, FATF ve Uluslararası mevzuat bültenleri
-- ============================================================

INSERT INTO regulatory_bulletins (
  id, bulletin_code, title, summary, source_authority, category,
  impact_level, status, published_at, effective_date, comment_deadline,
  affected_sectors, tags
) VALUES
  (
    'ffff0001-bfff-0000-0000-000000000001',
    'BDDK-TEBL-2026-03',
    'Kripto Varlık Hizmet Sağlayıcılarına İlişkin Taslak Tebliğ',
    'Bankaların kripto varlık saklama, transfer ve ticaret hizmetlerine ilişkin lisanslama, sermaye yeterliliği ve müşteri doğrulama (KYC) yükümlülüklerini düzenleyen taslak tebliğ. Bankalara münhasır platform kurma yetkisi verilmektedir.',
    'BDDK', 'CONSULTATION',
    'CRITICAL', 'CONSULTATION',
    '2026-03-01', '2026-09-01', '2026-04-30',
    ARRAY['BANKACILIK','FINTECH'],
    ARRAY['KRİPTO','VARLIK','LISANS','KYC']
  ),
  (
    'ffff0001-bfff-0000-0000-000000000002',
    'BDDK-CIRC-2026-01',
    'Likidite Karşılama Oranı (LCR) Hesaplama Metodolojisi Güncellemesi',
    'LCR hesaplamasında kullanılan yüksek kaliteli likit varlık (HQLA) sınıflandırmasında yapılan değişiklikler. Dijital devlet tahvilleri ve CBDC rezervleri Seviye 1 HQLA olarak tanımlanmaktadır.',
    'BDDK', 'CIRCULAR',
    'HIGH', 'PUBLISHED',
    '2026-02-15', '2026-06-01', NULL,
    ARRAY['BANKACILIK'],
    ARRAY['LİKİDİTE','LCR','HQLA','CBDC']
  ),
  (
    'ffff0001-bfff-0000-0000-000000000003',
    'MASAK-GEN-2026-01',
    'Kripto Varlık İşlemlerinde Şüpheli İşlem Bildirim Standartları',
    'Kripto varlık aracı kuruluşları ve bankaların kripto işlem kaynaklı şüpheli işlemleri 24 saat içinde bildirme yükümlülükleri. Zincir analizi sonuçlarının rapora eklenmesi zorunlu kılınmaktadır.',
    'MASAK', 'REGULATION',
    'HIGH', 'ENACTED',
    '2025-12-01', '2026-01-01', NULL,
    ARRAY['BANKACILIK','FINTECH','KRIPTO_BORSALARI'],
    ARRAY['MASAK','ŞİB','KRİPTO','AML']
  ),
  (
    'ffff0001-bfff-0000-0000-000000000004',
    'FATF-REC-2026-R15',
    'FATF R-15 Kripto Varlık Güncel Rehberi',
    'FATF ''in kripto varlık hizmet sağlayıcıları (VASP) için yayımladığı güncellenmiş uygulama rehberi. Travel Rule minimum eşiğinin 0 EUR''ya indirilmesini ve KYC süreçlerinin FATF standartlarına entegrasyonunu öngörmektedir.',
    'FATF', 'GUIDANCE',
    'HIGH', 'PUBLISHED',
    '2026-01-10', '2026-07-01', NULL,
    ARRAY['BANKACILIK','FINTECH','KRIPTO_BORSALARI'],
    ARRAY['FATF','VASP','TRAVEL_RULE','AML']
  ),
  (
    'ffff0001-bfff-0000-0000-000000000005',
    'KVKK-GEN-2026-02',
    'Yapay Zeka Destekli Kredi Kararlarında Kişisel Veri İşleme İlkeleri',
    'AI/ML tabanlı kredi skorlama ve red kararlarında veri sahibine açık rıza alma, kararın izah edilebilirliği (explainability) ve otomatik karar almaya itiraz hakkı yükümlülüklerini düzenleyen genel kurul kararı.',
    'KVKK', 'REGULATION',
    'MEDIUM', 'CONSULTATION',
    '2026-02-20', '2026-08-01', '2026-05-15',
    ARRAY['BANKACILIK','SIGORTACILIK','FINTECH'],
    ARRAY['KVKK','YZ','KREDİ_SKORLAMA','AÇIK_RIVA']
  ),
  (
    'ffff0001-bfff-0000-0000-000000000006',
    'BDDK-REG-2026-SR',
    'Sürdürülebilir Finansman ve İklim Riski Açıklama Standartları',
    'Bankaların iklim riskini kredi portföyüne yansıtma yükümlülükleri ve çevresel stres testi metodolojisi. TCFD ve ISSB S2 standardıyla uyum zorunlu tutulmaktadır.',
    'BDDK', 'REGULATION',
    'MEDIUM', 'CONSULTATION',
    '2026-03-05', '2027-01-01', '2026-06-30',
    ARRAY['BANKACILIK'],
    ARRAY['ESG','İKLİM_RİSKİ','TCFD','ISSB','STRES_TESTİ']
  )
ON CONFLICT (bulletin_code) DO NOTHING;

-- Politika Etki Uyarıları
INSERT INTO policy_impact_alerts (
  id, bulletin_id, bulletin_code, internal_policy_ref, department,
  impact_description, required_action, action_deadline,
  priority, status, completion_pct, assigned_to
) VALUES
  (
    'ffff0001-ffa0-0000-0000-000000000001',
    'ffff0001-bfff-0000-0000-000000000001',
    'BDDK-TEBL-2026-03',
    'POL-KRD-001 — Kredi Politikası',
    'Kredi Risk Yönetim Birimi',
    'Kripto teminatlı kredi ürünleri için LTV (Loan-to-Value) limitleri ve teminat değerleme prosedürleri yeniden tanımlanmalıdır.',
    'Kripto teminat LTV limitlerini süreç dokümanına ekle, risk komitesi onayına sun.',
    '2026-04-15',
    'CRITICAL', 'IN_PROGRESS', 35,
    'Kredi Risk Direktörü'
  ),
  (
    'ffff0001-ffa0-0000-0000-000000000002',
    'ffff0001-bfff-0000-0000-000000000001',
    'BDDK-TEBL-2026-03',
    'POL-COMP-003 — AML/KYC Uyum Politikası',
    'MASAK ve Uyum Birimi',
    'Kripto varlık müşterilerine yönelik geliştirilmiş müşteri durum tespiti (EDD) prosedürleri oluşturulmalı ve mevcut KYC sistemine entegre edilmelidir.',
    'EDD iş akışı tasarla, CBS KYC modülüne entegre et.',
    '2026-04-30',
    'CRITICAL', 'OPEN', 10,
    'MASAK Uyum Direktörü'
  ),
  (
    'ffff0001-ffa0-0000-0000-000000000003',
    'ffff0001-bfff-0000-0000-000000000002',
    'BDDK-CIRC-2026-01',
    'POL-HAZ-001 — Hazine ve Likidite Yönetim Politikası',
    'Hazine ve ALM',
    'LCR hesaplama modelinde CBDC rezervlerinin Seviye 1 HQLA olarak sınıflandırılması için model güncellemesi gereklidir.',
    'ALM sisteminde LCR hesaplama parametrelerini güncelle, regülasyon çerçevesine uygunluğu doğrula.',
    '2026-05-01',
    'HIGH', 'OPEN', 0,
    'Hazine Risk Yöneticisi'
  ),
  (
    'ffff0001-ffa0-0000-0000-000000000004',
    'ffff0001-bfff-0000-0000-000000000003',
    'MASAK-GEN-2026-01',
    'POL-COMP-002 — Şüpheli İşlem Raporlama Politikası',
    'MASAK ve Uyum Birimi',
    'Kripto kaynaklı işlemlerin 24 saatlik bildirim süresi için otomatik tetik mekanizması ve zincir analizi raporlama entegrasyonu kurulmalıdır.',
    'İşlem izleme sistemine kripto uyarı kuralları ekle
ON CONFLICT DO NOTHING;
 zincir analizi API bağlantısını kur.',
    '2026-02-28',
    'HIGH', 'RESOLVED', 100,
    'MASAK Analiz Ekibi'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 49 SEED: Dynamic Risk Appetite & KRI Monitor
-- =============================================================================

INSERT INTO public.risk_appetite_limits (id, tenant_id, kri_code, kri_name, description, category, unit, target_value, warning_threshold, limit_threshold, direction, is_active, regulatory_ref) VALUES
  ('faf00001-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','NPL_RATIO','Takipteki Kredi Oranı (NPL)','Toplam kredi portföyü içindeki takipteki kredilerin oranı. BDDK 5411 md. 53 kapsamında izlenmektedir.','CREDIT','PERCENT',3.0,4.0,5.0,'LOWER_IS_BETTER',true,'BDDK 5411 md.53
ON CONFLICT DO NOTHING;
 Basel III'),
  ('faf00001-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','LCR','Likidite Karşılama Oranı (LCR)','30 günlük stres senaryosunda yüksek kaliteli likit varlıkların net nakit çıkışına oranı.','LIQUIDITY','PERCENT',120.0,110.0,100.0,'HIGHER_IS_BETTER',true,'BDDK LCR Yönetmeliği; Basel III LCR'),
  ('faf00001-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111','CAPITAL_RATIO','Sermaye Yeterlilik Oranı (SYO)','Risk ağırlıklı varlıklara göre özkaynak oranı. BDDK asgari %12 sınırı.','CREDIT','PERCENT',15.0,13.0,12.0,'HIGHER_IS_BETTER',true,'BDDK Sermaye Yeterliliği Yönetmeliği; Basel III'),
  ('faf00001-0000-0000-0000-000000000004','11111111-1111-1111-1111-111111111111','OP_LOSS_RATIO','Operasyonel Kayıp Oranı','Toplam gelir içindeki operasyonel kayıpların oranı.','OPERATIONAL','PERCENT',0.5,1.0,1.5,'LOWER_IS_BETTER',true,'Basel III Operasyonel Risk'),
  ('faf00001-0000-0000-0000-000000000005','11111111-1111-1111-1111-111111111111','CYBER_INCIDENT_COUNT','Siber Güvenlik Olay Sayısı','Son 30 günde tespit edilen kritik siber güvenlik olaylarının sayısı.','CYBER','COUNT',0.0,2.0,5.0,'LOWER_IS_BETTER',true,'BDDK Siber Güvenlik Rehberi 2023'),
  ('faf00001-0000-0000-0000-000000000006','11111111-1111-1111-1111-111111111111','KYC_COMPLETION','KYC Tamamlanma Oranı','Aktif müşteri portföyü içinde KYC belgesi tam olan müşterilerin oranı.','COMPLIANCE','PERCENT',98.0,95.0,90.0,'HIGHER_IS_BETTER',true,'MASAK AML Direktifi; FATF R.10')
ON CONFLICT (tenant_id, kri_code) DO NOTHING;

INSERT INTO public.kri_readings (id, tenant_id, appetite_id, kri_code, reading_value, status, note, measured_by, measured_at) VALUES
  -- NPL: Uyarı bölgesinde (4.2 > 4.0 eşiği)
  ('ff000001-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','faf00001-0000-0000-0000-000000000001','NPL_RATIO',4.2,'WARNING','Konut kredisi portföyündeki gecikmeli ödemeler artış trendinde.','RISK_SYSTEM',NOW() - INTERVAL '2 hours'),
  ('ff000001-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','faf00001-0000-0000-0000-000000000001','NPL_RATIO',3.8,'NORMAL',NULL,'RISK_SYSTEM',NOW() - INTERVAL '1 day'),
  ('ff000001-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111','faf00001-0000-0000-0000-000000000001','NPL_RATIO',3.5,'NORMAL',NULL,'RISK_SYSTEM',NOW() - INTERVAL '7 days'),
  -- LCR: Limit ihlali (98 < 100 eşiği)
  ('ff000002-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','faf00001-0000-0000-0000-000000000002','LCR',98.0,'BREACH','Döviz likiditesindeki sıkışma nedeniyle LCR limit altına düştü. Acil aksiyon gerekiyor.','TREASURY',NOW() - INTERVAL '30 minutes'),
  ('ff000002-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','faf00001-0000-0000-0000-000000000002','LCR',108.0,'WARNING',NULL,'RISK_SYSTEM',NOW() - INTERVAL '1 day'),
  ('ff000002-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111','faf00001-0000-0000-0000-000000000002','LCR',125.0,'NORMAL',NULL,'RISK_SYSTEM',NOW() - INTERVAL '7 days'),
  -- SYO: Normal bölge
  ('ff000003-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','faf00001-0000-0000-0000-000000000003','CAPITAL_RATIO',16.8,'NORMAL',NULL,'RISK_SYSTEM',NOW() - INTERVAL '1 hour'),
  -- Operasyonel Kayıp: Normal
  ('ff000004-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','faf00001-0000-0000-0000-000000000004','OP_LOSS_RATIO',0.3,'NORMAL',NULL,'RISK_SYSTEM',NOW() - INTERVAL '3 hours'),
  -- Siber Olay: Uyarı
  ('ff000005-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','faf00001-0000-0000-0000-000000000005','CYBER_INCIDENT_COUNT',3.0,'WARNING','3 kritik siber olay tespit edildi: API brute-force + 2 insider threat şüphesi.','SIEM',NOW() - INTERVAL '4 hours'),
  -- KYC: Normal
  ('ff000006-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','faf00001-0000-0000-0000-000000000006','KYC_COMPLETION',97.4,'NORMAL',NULL,'COMPLIANCE_SYSTEM',NOW() - INTERVAL '6 hours')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 51 SEED: CAS IDE & Script Scheduler
-- =============================================================================

-- audit_scripts — Gerçekçi Denetim Scriptleri
INSERT INTO public.audit_scripts (id, tenant_id, title, description, script_type, category, schedule_cron, is_active, is_scheduled, script_body, last_run_status, last_run_results, total_executions, error_count, avg_duration_ms, created_by) VALUES
  (
    'af000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Atıl Hesap Tarama — Gece 03:00',
    'Son 90 gün içinde hiç giriş yapılmamış aktif kullanıcı hesaplarını tespit eder. BDDK Siber Güvenlik Rehberi Madde 18 gereğince aylık çalıştırılması zorunludur.',
    'SQL',
    'DORMANT_ACCOUNTS',
    '0 3 * * *',
    true,
    true,
    E'-- SENTINEL CAS: Atıl Hesap Tespiti\n-- Kural: Son 90 gün içinde giriş yok = Atıl\nSELECT\n  u.id          AS kullanici_id,\n  u.username    AS kullanici_adi,\n  u.department  AS departman,\n  u.role        AS yetki_seviyesi,\n  u.last_login  AS son_giris,\n  CURRENT_DATE - u.last_login::date AS bekleme_gun\nFROM users u\nWHERE u.is_active = true\n  AND (u.last_login IS NULL OR u.last_login < NOW() - INTERVAL ''90 days'')\nORDER BY bekleme_gun DESC
ON CONFLICT DO NOTHING;
',
    'success',
    47,
    128,
    3,
    1840,
    'Sürekli Denetim Motoru'
  ),
  (
    'af000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Görevler Ayrılığı (SoD) İhlal Taraması',
    'Çelişkili yetkilere sahip kullanıcıları tespit eder: Hem ödeme onaylama hem de fatura oluşturma yetkisi olan kişiler Basel III operasyonel risk kurallarını ihlal eder.',
    'SQL',
    'SEGREGATION_OF_DUTIES',
    '0 6 * * 1',
    true,
    true,
    E'-- SENTINEL CAS: Görevler Ayrılığı İhlal Tespiti\n-- Kural: Çelişkili yetki matrisi (OR_MATRIX)\nSELECT\n  ur.user_id,\n  u.username,\n  STRING_AGG(ur.role_name, '', '') AS atanmis_roller\nFROM user_roles ur\nJOIN users u ON u.id = ur.user_id\nWHERE ur.role_name IN (''PAYMENT_APPROVER'', ''INVOICE_CREATOR'', ''GL_POSTER'')\nGROUP BY ur.user_id, u.username\nHAVING COUNT(DISTINCT ur.role_name) >= 2\nORDER BY COUNT(DISTINCT ur.role_name) DESC;',
    'success',
    12,
    89,
    1,
    2210,
    'Sürekli Denetim Motoru'
  ),
  (
    'af000000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'Yüksek Tutarlı İşlem Anomali Tespiti (AML)',
    'Tek bir iş günü içinde 50.000 TL üzeri birden fazla havale yapan hesapları MASAK uyum kuralları çerçevesinde işaretler.',
    'SQL',
    'FRAUD_DETECTION',
    '0 8 * * *',
    true,
    true,
    E'-- SENTINEL CAS: AML Yüksek Tutar Anomali\n-- Kural: Günlük 50.000 TL+ çoklu havale\nSELECT\n  t.account_id,\n  a.owner_name AS hesap_sahibi,\n  COUNT(*)     AS islem_adedi,\n  SUM(t.amount) AS toplam_tutar_tl,\n  MIN(t.amount) AS min_tutar,\n  MAX(t.amount) AS max_tutar\nFROM transactions t\nJOIN accounts a ON a.id = t.account_id\nWHERE t.transaction_date = CURRENT_DATE\n  AND t.amount > 50000\n  AND t.transaction_type = ''WIRE_TRANSFER''\nGROUP BY t.account_id, a.owner_name\nHAVING COUNT(*) >= 2\nORDER BY toplam_tutar_tl DESC;',
    'success',
    3,
    312,
    8,
    950,
    'Sürekli Denetim Motoru'
  ),
  (
    'af000000-0000-0000-0000-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'COSO İç Kontrol Etkinlik Puanı Hesaplama',
    'COSO 2013 çerçevesinin 5 bileşeni ve 17 prensibi için ağırlıklı etkinlik puanı hesaplar. Yönetim kurulu raporlamasında kullanılır.',
    'SQL',
    'COMPLIANCE',
    '0 7 1 * *',
    true,
    false,
    E'-- SENTINEL CAS: COSO Etkinlik Puanı\n-- Kaynak: COSO 2013 — 5 Bileşen, 17 Prensip\nSELECT\n  cc.component_name  AS coso_bileseni,\n  COUNT(c.id)        AS toplam_kontrol,\n  SUM(CASE WHEN c.status = ''effective'' THEN 1 ELSE 0 END) AS etkin_kontrol,\n  ROUND(\n    100.0 * SUM(CASE WHEN c.status = ''effective'' THEN 1 ELSE 0 END)\n    / NULLIF(COUNT(c.id), 0), 1\n  )                  AS etkinlik_yuzdesi\nFROM controls c\nJOIN coso_components cc ON cc.id = c.coso_component_id\nGROUP BY cc.component_name\nORDER BY etkinlik_yuzdesi ASC;',
    'success',
    null,
    24,
    0,
    3400,
    'COSO Değerlendirme Ekibi'
  ),
  (
    'af000000-0000-0000-0000-000000000005',
    '11111111-1111-1111-1111-111111111111',
    'IT Yama Uyum Kontrolü (Patch Compliance)',
    'Son 30 gün içinde güvenlik yaması uygulanmamış aktif sistemleri listeler. BDDK Siber Güvenlik Rehberi, uygulama süresi: 72 saat.',
    'SQL',
    'DATA_QUALITY',
    '0 9 * * 5',
    true,
    true,
    E'-- SENTINEL CAS: Güvenlik Yaması Uyum Kontrolü\nSELECT\n  s.hostname,\n  s.os_version,\n  s.environment,\n  s.last_patch_date,\n  CURRENT_DATE - s.last_patch_date::date AS gecen_gun,\n  s.criticality\nFROM it_systems s\nWHERE s.is_active = true\n  AND (\n    s.last_patch_date IS NULL\n    OR s.last_patch_date < NOW() - INTERVAL ''30 days''\n  )\nORDER BY s.criticality DESC, gecen_gun DESC;',
    'error',
    null,
    42,
    6,
    1230,
    'BT Denetim Ekibi'
  )
ON CONFLICT (id) DO NOTHING;

-- script_execution_logs — Son Çalıştırma Kayıtları
INSERT INTO public.script_execution_logs (id, tenant_id, script_id, status, triggered_by, started_at, completed_at, duration_ms, rows_returned, output_preview) VALUES
  ('ef000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'af000000-0000-0000-0000-000000000001', 'success', 'scheduler',   NOW() - INTERVAL '1 day' + INTERVAL '3 hours',    NOW() - INTERVAL '1 day' + INTERVAL '3 hours 2 minutes', 1840, 47, 'kullanici_adi: ahmet.sahin@banka.com, departman: BT, bekleme_gun: 127 ...'),
  ('ef000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'af000000-0000-0000-0000-000000000001', 'success', 'manual',      NOW() - INTERVAL '3 hours',                          NOW() - INTERVAL '3 hours' + INTERVAL '2 minutes',        1920, 49, 'kullanici_adi: mehmet.demir@banka.com, departman: Operasyon, bekleme_gun: 95 ...'),
  ('ef000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'af000000-0000-0000-0000-000000000002', 'success', 'scheduler',   NOW() - INTERVAL '6 days' + INTERVAL '6 hours',    NOW() - INTERVAL '6 days' + INTERVAL '6 hours 3 minutes', 2210, 12, 'user_id: usr-44, username: ali.koc, atanmis_roller: PAYMENT_APPROVER, INVOICE_CREATOR ...'),
  ('ef000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'af000000-0000-0000-0000-000000000003', 'success', 'scheduler',   NOW() - INTERVAL '8 hours',                          NOW() - INTERVAL '8 hours' + INTERVAL '1 minute',         950,  3,  'account_id: ACC-9912, hesap_sahibi: Zeynep Ltd., toplam_tutar_tl: 187500 ...'),
  ('ef000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'af000000-0000-0000-0000-000000000005', 'error',   'scheduler',   NOW() - INTERVAL '2 days' + INTERVAL '9 hours',    NULL,                                                      NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 50 SEED: Cognitive Interview Assistant
-- Bilişsel Denetim Mülakat Asistanı — Örnek Transkript & AI Analizi
-- =============================================================================

INSERT INTO public.interview_sessions (
  id, title, subject_name, subject_title, subject_department,
  interviewer_name, purpose, location, status,
  risk_topics, overall_sentiment, ai_risk_score, duration_seconds,
  scheduled_at, started_at, ended_at
) VALUES
  (
    'ff500000-0000-0000-0000-000000000001',
    'Hazine İşlemleri Mülakat #1 — Repo Limit Aşımı',
    'Barış Kaya',
    'Hazine Uzmanı',
    'Hazine',
    'Denetçi Leyla Şahin',
    'BDDK 2024/1 kapsamında repo işlemi limit aşımının nedenleri ve süreç ihlali araştırması.',
    'Genel Müdürlük — Kat 12 / Toplantı Odası A',
    'Tamamlandı',
    ARRAY['Repo İşlemleri', 'Limit Aşımı', 'BDDK Uyum', 'İç Kontrol'],
    'Stresli',
    7.8,
    1920,
    '2026-03-10T10:00:00+03:00',
    '2026-03-10T10:05:00+03:00',
    '2026-03-10T10:37:00+03:00'
  ),
  (
    'ff500000-0000-0000-0000-000000000002',
    'Operasyon Müdürü Görüşme — IBAN Doğrulama İhlali',
    'Cengiz Arslan',
    'Operasyon Müdürü',
    'Operasyon',
    'Denetçi Ali Koç',
    'Müşteri IBAN doğrulama bypass vakasının operasyonel ve sistem kaynaklarının analizi.',
    'Online — Güvenli Video Konferans',
    'Tamamlandı',
    ARRAY['IBAN Doğrulama', 'Operasyonel Risk', 'Sistem Kontrolü', 'İnsan Hatası'],
    'Savunmacı',
    6.2,
    2580,
    '2026-03-12T14:00:00+03:00',
    '2026-03-12T14:02:00+03:00',
    '2026-03-12T14:45:00+03:00'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.transcript_analysis (
  id, session_id, line_order, speaker, transcript,
  sentiment, confidence, ai_flag, ai_note, keywords, start_ms, end_ms
) VALUES
  -- Oturum 1: Repo Limit Aşımı (is500000...001)
  (
    'fa500000-0000-0000-0000-000000000001',
    'ff500000-0000-0000-0000-000000000001', 1,
    'Denetçi',
    '3 Mart tarihinde gerçekleştirilen repo işleminin onaylı limit üzerinde olduğu görülmektedir. Bunu fark ettiniz mi?',
    'Nötr', 0.95, NULL, NULL,
    ARRAY['repo', 'limit', 'onay'], 0, 12000
  ),
  (
    'fa500000-0000-0000-0000-000000000002',
    'ff500000-0000-0000-0000-000000000001', 2,
    'Muhatap',
    'Şey... o gün sistem... yani sistem bazen böyle hatalar verebiliyor. Ben doğrudan onay vermemiştim zaten.',
    'Kaçamak', 0.88,
    'Kaçamak Cevap',
    'Muhatap soruya doğrudan cevap vermek yerine sistemden bahsetti. Pasif sorumluluk reddi davranışı gözlemlendi.',
    ARRAY['sistem', 'hata', 'sorumluluk'], 12500, 27000
  ),
  (
    'fa500000-0000-0000-0000-000000000003',
    'ff500000-0000-0000-0000-000000000001', 3,
    'Denetçi',
    'Peki işlem onay loglarına göre sizin kullanıcı kimliğinizle onaylanmış. Bunu nasıl açıklarsınız?',
    'Nötr', 0.97, NULL, NULL,
    ARRAY['log', 'kimlik', 'onay'], 27500, 38000
  ),
  (
    'fa500000-0000-0000-0000-000000000004',
    'ff500000-0000-0000-0000-000000000001', 4,
    'Muhatap',
    'O gün... bilmiyorum, belki birileri benim şifremi kullandı. Zaten çok yoğun bir gündü, tam olarak hatırlamıyorum.',
    'Stresli', 0.91,
    'Yüksek Stres / Belirsiz Hafıza',
    'Kısa cümleler, tereddüt belirteçleri ("bilmiyorum", "belki") ve hafıza belirsizliği birlikte stres göstergesidir. Kimlik bilgilerinin paylaşıldığına dair beyan kritik eylem gerektirir.',
    ARRAY['şifre', 'hafıza', 'yoğunluk', 'başkası'], 38500, 58000
  ),
  (
    'fa500000-0000-0000-0000-000000000005',
    'ff500000-0000-0000-0000-000000000001', 5,
    'Denetçi',
    'Şifrenizi başkasıyla paylaştığınızı mı söylüyorsunuz? Bu güvenlik politikası ihlalidir ve ayrıca tutanağa geçmesi gerekiyor.',
    'Nötr', 0.99, NULL, NULL,
    ARRAY['güvenlik', 'politika', 'ihlal', 'tutanak'], 58500, 70000
  ),
  (
    'fa500000-0000-0000-0000-000000000006',
    'ff500000-0000-0000-0000-000000000001', 6,
    'Muhatap',
    'Hayır, hayır. Öyle bir şey demedim. Yanlış anladınız. Ben sadece... sistemi kastettim.',
    'Savunmacı', 0.87,
    'Savunmacı / Geri Adım',
    'Bir önceki beyanın hızlı reddi ve çelişkili açıklama. Söylem tutarsızlığı yüksek.',
    ARRAY['inkar', 'tutarsızlık', 'savunma'], 70500, 82000
  ),
  -- Oturum 2: IBAN Doğrulama (is500000...002)
  (
    'fa500000-0000-0000-0000-000000000007',
    'ff500000-0000-0000-0000-000000000002', 1,
    'Denetçi',
    'Operasyon biriminizde müşteri IBAN doğrulama adımının devre dışı bırakıldığına dair kayıt mevcut. Bu kararı kim aldı?',
    'Nötr', 0.96, NULL, NULL,
    ARRAY['IBAN', 'doğrulama', 'devre dışı', 'karar'], 0, 14000
  ),
  (
    'fa500000-0000-0000-0000-000000000008',
    'ff500000-0000-0000-0000-000000000002', 2,
    'Muhatap',
    'Bu bir sistem geliştirme sürecinin parçasıydı. BT departmanıyla koordineli yapıldı. Operasyon olarak biz sadece kullanıcıyız.',
    'Savunmacı', 0.83,
    'Sorumluluk Transferi',
    'Muhatap kararı BT birimine yönlendiriyor. Operasyonel kararların teknik birime atfedilmesi savunmacı bir örüntü oluşturuyor.',
    ARRAY['BT', 'koordinasyon', 'sorumluluk', 'transfer'], 14500, 31000
  ),
  (
    'fa500000-0000-0000-0000-000000000009',
    'ff500000-0000-0000-0000-000000000002', 3,
    'Denetçi',
    'BT onay belgesi veya değişiklik talebi (Change Request) var mı elimizde?',
    'Nötr', 0.98, NULL, NULL,
    ARRAY['CR', 'belge', 'onay', 'BT'], 31500, 40000
  ),
  (
    'fa500000-0000-0000-0000-000000000010',
    'ff500000-0000-0000-0000-000000000002', 4,
    'Muhatap',
    'Olması lazım. Yani olmalı. Ben şu an elimin altında değil ama... herhalde arşivdedir.',
    'Şüpheli', 0.79,
    'Belirsiz Yanıt / Belge Riski',
    'Belge mevcudiyeti konusunda kesin ifade yerine "olması lazım", "herhalde" gibi belirsiz ifadeler kullanıldı. Belge yönetimi riski işaretlendi.',
    ARRAY['belge', 'arşiv', 'belirsizlik'], 40500, 54000
  )
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- WAVE 48 SEED: BCP & Crisis Management — Veri Merkezi Kesintisi Senaryosu
-- =============================================================================

-- 1. BCP Scenarios
INSERT INTO public.bcp_scenarios
  (id, scenario_code, title, category, severity, rto_minutes, rpo_minutes, description, steps, owner, is_tested, last_test_date, test_result)
VALUES
  (
    'bcf00001-0000-0000-0000-000000000001',
    'BCP-IT-001',
    'Veri Merkezi Ana Güç Kesintisi — Tier 1 Sistemler',
    'IT', 'CRITICAL', 240, 60,
    'Birincil veri merkezi güç kaynağı tamamen kesildi. Jeneratör UPS desteği ile geçici çalışma sağlanacak, DR siteye devrilme yapılacak.',
    '[
      {"id":1,"title":"Kriz Yönetim Ekibini Topla","description":"CAE ve Teknoloji Direktörünü acil bilgilendir","owner":"BT Direktörü"},
      {"id":2,"title":"DR Site Hazırlığını Kontrol Et","description":"İkincil veri merkezinin hazırlık durumunu doğrula","owner":"Sistem Mimarı"},
      {"id":3,"title":"Kritik Sistemleri DR Sitede Ayağa Kaldır","description":"Core banking, SWIFT, ödeme sistemleri öncelikli","owner":"BT Operasyon"},
      {"id":4,"title":"İletişim Kesintisi Sona Eriyor mu Kontrol Et","description":"Ağ bağlantılarını ve WAN linklerini test et","owner":"Ağ Ekibi"},
      {"id":5,"title":"Kullanıcı Bilgilendirmesi Yap","description":"Tüm kullanıcılara ve müşterilere durum mesajı gönder","owner":"Kurumsal İletişim"},
      {"id":6,"title":"Sistem Bütünlüğünü Doğrula","description":"Veri kaybı ve tutarlılık kontrolü yap","owner":"Veri Tabanı Ekibi"},
      {"id":7,"title":"Post-Mortem Başlat","description":"Olay sonrası analiz için log toplanmasını başlat","owner":"Kalite & Risk"}
    ]'::jsonb,
    'Bilgi Teknolojileri Direktörü', true, '2025-11-15', 'PASSED'
  ),
  (
    'bcf00001-0000-0000-0000-000000000002',
    'BCP-CYBER-001',
    'Fidye Yazılımı Saldırısı — Core Banking Yalıtımı',
    'CYBER', 'CRITICAL', 480, 120,
    'Core banking veya SWIFT altyapısına fidye yazılımı saldırısı. Sistemleri yalıtarak veri sızıntısı önlenecek.',
    '[
      {"id":1,"title":"Ağ Segmentasyonu Uygula","description":"Etkilenen sistemleri VLAN düzeyinde izole et","owner":"Ağ Güvenliği"},
      {"id":2,"title":"CERT-TR ve SPK Bildirimi","description":"Yasal bildirim yükümlülüklerini yerine getir","owner":"Uyum Direktörü"},
      {"id":3,"title":"Temiz Backup Noktasını Tespit Et","description":"Saldırı öncesi son temiz yedekleme noktasını belirle","owner":"BT Operasyon"},
      {"id":4,"title":"Sistem Temizliği ve Restore","description":"Yedeği izole ortamda test ederek canlıya al","owner":"Güvenlik Ekibi"},
      {"id":5,"title":"Müşteri Varlıklarının Güvenliğini Doğrula","description":"Hesap bakiyeleri ve işlem bütünlüğünü kontrol et","owner":"İç Denetim"}
    ]'::jsonb,
    'Bilgi Güvenliği Direktörü (CISO)', false, NULL, NULL
  ),
  (
    'bcf00001-0000-0000-0000-000000000003',
    'BCP-NAT-001',
    'Deprem Sonrası Operasyon Sürekliliği',
    'NATURAL_DISASTER', 'HIGH', 480, 240,
    'Şiddetli deprem sonrası ofis binaları ve veri merkezlerinin kullanılması mümkün olmayabilir.',
    '[
      {"id":1,"title":"Personel Güvenliğini Kontrol Et","description":"Tüm personel ile iletişime geç ve durumlarını kaydet","owner":"İnsan Kaynakları"},
      {"id":2,"title":"Uzaktan Çalışma Aktivasyonu","description":"VPN ve uzak masaüstü erişimlerini etkinleştir","owner":"BT Direktörü"},
      {"id":3,"title":"Fiziksel Varlıkların Durumu","description":"Bina hasarını ve ekipman güvenliğini sat","owner":"İdari İşler"}
    ]'::jsonb,
    'CAE', true, '2025-09-10', 'PARTIAL'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. Crisis Events — Aktif senaryo: Veri Merkezi A Kesintisi
INSERT INTO public.crisis_events
  (id, scenario_id, event_code, title, description, severity, status,
   activated_at, rto_target_at, rpo_target_at, affected_systems, crisis_owner, escalated_to_cae)
VALUES
  (
    'ce000001-0000-0000-0000-000000000001',
    'bcf00001-0000-0000-0000-000000000001',
    'CRISIS-2026-03-07-VMA1',
    'Veri Merkezi A Kesintisi — Tier 1 Sistemler İçin Kurtarma Başladı',
    'Birincil veri merkezinde (İstanbul, Maslak) ana güç dağıtım panosu arızalandı. UPS devrede, jeneratörler çalışıyor. DR site devrilmesi başlatıldı. Core banking %80 kapasitede DR üzerinden çalışıyor.',
    'CRITICAL',
    'RECOVERING',
    NOW() - INTERVAL '2 hours 15 minutes',
    NOW() - INTERVAL '2 hours 15 minutes' + INTERVAL '4 hours',   -- RTO = 240 min
    NOW() - INTERVAL '2 hours 15 minutes' + INTERVAL '1 hour',    -- RPO = 60 min
    ARRAY['Core Banking (Fineksus)','SWIFT Gateway','İnternet Bankacılığı','ATM Ağı','Ödeme Sistemleri'],
    'Ahmet Yılmaz (BT Direktörü)',
    true
  ),
  (
    'ce000001-0000-0000-0000-000000000002',
    'bcf00001-0000-0000-0000-000000000002',
    'CRISIS-2026-03-07-CERT1',
    'CERT-TR Uyarısı — Şüpheli Fidye Yazılımı Aktivitesi',
    'CERT-TR, bankaya yönelik koordineli fidye yazılımı kampanyasında ön tespit bildirdi. SOC Ekibi anomali analizi yapıyor, sistem izolasyonu henüz uygulanmadı.',
    'HIGH',
    'ACTIVE',
    NOW() - INTERVAL '45 minutes',
    NOW() - INTERVAL '45 minutes' + INTERVAL '8 hours',
    NOW() - INTERVAL '45 minutes' + INTERVAL '2 hours',
    ARRAY['SIEM Sistemi','E-posta Sunucuları','Dosya Paylaşım Sunucuları'],
    'Fatma Demir (CISO)',
    false
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Recovery Logs — Veri Merkezi A kesintisi için adımlar
INSERT INTO public.recovery_logs
  (id, crisis_id, step_number, action_title, action_detail, status, assigned_to, started_at, completed_at, notes)
VALUES
  (
    'ff000001-0000-0000-0000-000000000001',
    'ce000001-0000-0000-0000-000000000001',
    1, 'Kriz Yönetim Ekibini Topla',
    'CAE ve Teknoloji Direktörünü acil bilgilendir',
    'COMPLETED', 'BT Direktörü',
    NOW() - INTERVAL '2 hours 15 minutes',
    NOW() - INTERVAL '2 hours 5 minutes',
    'CAE ve YK Başkanı bilgilendirildi. Kriz odası kuruldu.'
  ),
  (
    'ff000001-0000-0000-0000-000000000002',
    'ce000001-0000-0000-0000-000000000001',
    2, 'DR Site Hazırlığını Kontrol Et',
    'İkincil veri merkezinin hazırlık durumunu doğrula',
    'COMPLETED', 'Sistem Mimarı',
    NOW() - INTERVAL '2 hours 3 minutes',
    NOW() - INTERVAL '1 hour 50 minutes',
    'DR sitesi %95 hazır. Ağ bant genişliği yeterli.'
  ),
  (
    'ff000001-0000-0000-0000-000000000003',
    'ce000001-0000-0000-0000-000000000001',
    3, 'Core Banking DR Sitede Ayağa Kaldır',
    'Core banking, SWIFT, ödeme sistemleri öncelikli',
    'COMPLETED', 'BT Operasyon',
    NOW() - INTERVAL '1 hour 48 minutes',
    NOW() - INTERVAL '1 hour 10 minutes',
    'Fineksus core banking %80 kapasitede DR üzerinden aktif. SWIFT normal.'
  ),
  (
    'ff000001-0000-0000-0000-000000000004',
    'ce000001-0000-0000-0000-000000000001',
    4, 'İnternet Bankacılığı ve ATM Restorasyonu',
    'Müşteri kanallarını DR üzerinden devreye al',
    'IN_PROGRESS', 'Kanal Teknolojileri Ekibi',
    NOW() - INTERVAL '1 hour 5 minutes',
    NULL,
    'İnternet bankacılığı %60 hizmette. ATM ağının %40ı DR bağlantısında.'
  ),
  (
    'ff000001-0000-0000-0000-000000000005',
    'ce000001-0000-0000-0000-000000000001',
    5, 'Kullanıcı ve Müşteri Bilgilendirmesi',
    'Tüm kullanıcılara ve müşterilere durum mesajı gönder',
    'PENDING', 'Kurumsal İletişim',
    NULL, NULL, NULL
  ),
  (
    'ff000001-0000-0000-0000-000000000006',
    'ce000001-0000-0000-0000-000000000001',
    6, 'Sistem Bütünlüğü ve Veri Tutarlılığı',
    'Veri kaybı ve transaction tutarlılığı kontrolü',
    'PENDING', 'Veri Tabanı Ekibi',
    NULL, NULL, NULL
  ),
  (
    'ff000001-0000-0000-0000-000000000007',
    'ce000001-0000-0000-0000-000000000001',
    7, 'Post-Mortem Başlat',
    'Olay sonrası analiz ve BDDK bildirimi',
    'PENDING', 'CAE / İç Denetim',
    NULL, NULL, NULL
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Wave 52 Seed: Visual CCM Rule Builder
-- JSON tabanlı görsel kural örnekleri
-- ============================================================

-- Düğüm Kataloğu
INSERT INTO rule_nodes (
  id, node_type, node_subtype, label, description, icon,
  color_scheme, config_schema, output_type, is_terminal, display_order
) VALUES
  (
    'ffde0001-cafa-0000-0000-000000000001',
    'TRIGGER', 'TRANSACTION_EVENT',
    'İşlem Tetikleyicisi',
    'Yeni bir finansal işlem oluştuğunda veya güncellendiğinde tetiklenir.',
    'Zap',
    'purple',
    '{"fields": ["amount", "transaction_type", "timestamp", "user_id", "channel"]}',
    'EVENT', FALSE, 1
  ),
  (
    'ffde0001-cafa-0000-0000-000000000002',
    'CONDITION', 'AMOUNT_THRESHOLD',
    'Tutar Eşiği Koşulu',
    'İşlem tutarını belirli bir limitle karşılaştırır.',
    'TrendingUp',
    'blue',
    '{"operator": {"type": "enum", "values": [">",">=","<","<=","=="]}, "threshold": {"type": "number"}, "currency": {"type": "string"}}',
    'BOOLEAN', FALSE, 2
  ),
  (
    'ffde0001-cafa-0000-0000-000000000003',
    'CONDITION', 'TIME_WINDOW',
    'Zaman Penceresi Koşulu',
    'İşlemin gerçekleştiği saati veya gün/hafta periyodunu kontrol eder.',
    'Clock',
    'amber',
    '{"from_hour": {"type": "number", "min": 0, "max": 23}, "to_hour": {"type": "number", "min": 0, "max": 23}, "days_of_week": {"type": "array"}}',
    'BOOLEAN', FALSE, 3
  ),
  (
    'ffde0001-cafa-0000-0000-000000000004',
    'CONDITION', 'FREQUENCY_CHECK',
    'Frekans Analizi Koşulu',
    'Belirli bir zaman penceresi içindeki işlem sayısını veya toplamını kontrol eder (Structuring tespiti).',
    'Activity',
    'orange',
    '{"window_hours": {"type": "number"}, "max_count": {"type": "number"}, "max_total": {"type": "number"}}',
    'BOOLEAN', FALSE, 4
  ),
  (
    'ffde0001-cafa-0000-0000-000000000005',
    'AGGREGATOR', 'AND_GATE',
    'VE Kapısı (AND)',
    'Tüm bağlı koşulların doğru olması gerekir.',
    'Merge',
    'slate',
    '{}',
    'BOOLEAN', FALSE, 5
  ),
  (
    'ffde0001-cafa-0000-0000-000000000006',
    'AGGREGATOR', 'OR_GATE',
    'VEYA Kapısı (OR)',
    'Bağlı koşullardan en az birinin doğru olması yeterlidir.',
    'GitMerge',
    'slate',
    '{}',
    'BOOLEAN', FALSE, 6
  ),
  (
    'ffde0001-cafa-0000-0000-000000000007',
    'ACTION', 'GENERATE_ALERT',
    'Uyarı Oluştur',
    'CCM sisteminde yüksek öncelikli uyarı kaydı oluşturur ve ilgili birimleri bildirir.',
    'AlertTriangle',
    'red',
    '{"severity": {"type": "enum", "values": ["CRITICAL","HIGH","MEDIUM","LOW"]}, "message_template": {"type": "string"}, "notify_roles": {"type": "array"}}',
    'VOID', TRUE, 7
  ),
  (
    'ffde0001-cafa-0000-0000-000000000008',
    'ACTION', 'FLAG_FOR_REVIEW',
    'İnceleme Bayrağı Ekle',
    'Kaydı manuel inceleme kuyruğuna ekler.',
    'Flag',
    'amber',
    '{"reviewer_role": {"type": "string"}, "priority": {"type": "enum", "values": ["URGENT","HIGH","NORMAL"]}}',
    'VOID', TRUE, 8
  )
ON CONFLICT (id) DO NOTHING;

-- Görsel Kural 1: Gece Yarısından Sonra Büyük İşlem
INSERT INTO ccm_visual_rules (
  id, rule_code, name, description, category, severity, is_active,
  nodes_json, edges_json, compiled_logic, created_by, version
) VALUES
  (
    'fffe0001-ccff-0000-0000-000000000001',
    'VR-AML-001',
    'Gece Yarısı Sonrası Yüksek Tutarlı İşlem',
    'Saat 23:00-06:00 arasında 1.000.000 TL üzeri herhangi bir işlem MASAK bildirimi için otomatik alarm üretir.',
    'AML', 'CRITICAL', TRUE,
    '[
      {"id":"n1","type":"trigger","position":{"x":50,"y":200},"data":{"label":"İşlem Tetikleyicisi","subtype":"TRANSACTION_EVENT","icon":"Zap","color":"purple"}},
      {"id":"n2","type":"condition","position":{"x":280,"y":100},"data":{"label":"Tutar > 1.000.000 TL","subtype":"AMOUNT_THRESHOLD","config":{"operator":">","threshold":1000000,"currency":"TRY"},"icon":"TrendingUp","color":"blue"}},
      {"id":"n3","type":"condition","position":{"x":280,"y":300},"data":{"label":"Saat 23:00 - 06:00","subtype":"TIME_WINDOW","config":{"from_hour":23,"to_hour":6},"icon":"Clock","color":"amber"}},
      {"id":"n4","type":"aggregator","position":{"x":520,"y":200},"data":{"label":"VE Kapısı","subtype":"AND_GATE","icon":"Merge","color":"slate"}},
      {"id":"n5","type":"action","position":{"x":750,"y":200},"data":{"label":"KRİTİK Uyarı Oluştur","subtype":"GENERATE_ALERT","config":{"severity":"CRITICAL","message_template":"Gece saatlerinde yüksek tutarlı işlem tespit edildi.","notify_roles":["MASAK_OFFICER","RISK_DIRECTOR"]},"icon":"AlertTriangle","color":"red"}}
    ]',
    '[
      {"id":"e1","source":"n1","target":"n2"},
      {"id":"e2","source":"n1","target":"n3"},
      {"id":"e3","source":"n2","target":"n4"},
      {"id":"e4","source":"n3","target":"n4"},
      {"id":"e5","source":"n4","target":"n5"}
    ]',
    'amount > 1000000 AND hour(timestamp) >= 23 OR hour(timestamp) <= 6',
    'denetim.baskani@sentinelab.com.tr',
    1
  ),
  (
    'fffe0001-ccff-0000-0000-000000000002',
    'VR-STR-001',
    'Structuring Tespit Kuralı (Parçalı İşlem)',
    '24 saat içinde aynı kullanıcıdan 3 veya daha fazla işlem geliyorsa ve toplam tutar 50.000 TL eşiğini aşıyorsa yapılandırma (structuring) şüphesi oluştur.',
    'STRUCTURING', 'HIGH', TRUE,
    '[
      {"id":"n1","type":"trigger","position":{"x":50,"y":150},"data":{"label":"İşlem Tetikleyicisi","subtype":"TRANSACTION_EVENT","icon":"Zap","color":"purple"}},
      {"id":"n2","type":"condition","position":{"x":280,"y":150},"data":{"label":"24s İçinde ≥3 İşlem & Toplam > 50K","subtype":"FREQUENCY_CHECK","config":{"window_hours":24,"max_count":3,"max_total":50000},"icon":"Activity","color":"orange"}},
      {"id":"n3","type":"action","position":{"x":520,"y":150},"data":{"label":"MASAK Bayrağı + İnceleme","subtype":"FLAG_FOR_REVIEW","config":{"reviewer_role":"MASAK_OFFICER","priority":"URGENT"},"icon":"Flag","color":"amber"}}
    ]',
    '[
      {"id":"e1","source":"n1","target":"n2"},
      {"id":"e2","source":"n2","target":"n3"}
    ]',
    'tx_count_24h >= 3 AND tx_total_24h > 50000',
    'denetim.baskani@sentinelab.com.tr',
    1
  ),
  (
    'fffe0001-ccff-0000-0000-000000000003',
    'VR-BENF-001',
    'Benford Kanunu Sapma Uyarısı',
    'Fatura tutarlarının ilk rakam dağılımı chi-kare kritik değerini (%5 anlamlılık) aştığında otomatik anomali uyarısı üretir.',
    'BENFORD', 'HIGH', TRUE,
    '[
      {"id":"n1","type":"trigger","position":{"x":50,"y":150},"data":{"label":"Fatura Batch Tetikleyicisi","subtype":"TRANSACTION_EVENT","icon":"Zap","color":"purple"}},
      {"id":"n2","type":"condition","position":{"x":280,"y":150},"data":{"label":"χ² > 15.507 (DF=8)","subtype":"AMOUNT_THRESHOLD","config":{"operator":">","threshold":15.507},"icon":"TrendingUp","color":"blue"}},
      {"id":"n3","type":"action","position":{"x":520,"y":150},"data":{"label":"Yüksek Uyarı Oluştur","subtype":"GENERATE_ALERT","config":{"severity":"HIGH","message_template":"Fatura portföyünde Benford Kanunu sapması tespit edildi. Manuel inceleme gerekli.","notify_roles":["AUDIT_MANAGER"]},"icon":"AlertTriangle","color":"red"}}
    ]',
    '[
      {"id":"e1","source":"n1","target":"n2"},
      {"id":"e2","source":"n2","target":"n3"}
    ]',
    'chi_squared > 15.507',
    'denetim.baskani@sentinelab.com.tr',
    1
  )
ON CONFLICT (rule_code) DO NOTHING;

-- =============================================================================
-- WAVE 55 SEED: Root Cause & 5-Whys Analyzer
-- Kök Neden Analizi ve 5-Neden Ağacı — Örnek Veriler
-- =============================================================================

INSERT INTO public.root_cause_analyses (
  id, linked_entity_type, linked_entity_id, title, problem_statement,
  root_cause_summary, status, created_by_name
) VALUES
  (
    'fca55000-0000-0000-0000-000000000001',
    'finding',
    'f1000000-0000-0000-0000-000000000001',
    'Yetkisiz Erişim — Sunucu Odası Fiziksel Kontrol İhlali',
    'Sunucu odasına yetkisiz iki kişinin giriş yaptığı tespit edilmiş
ON CONFLICT DO NOTHING;
 kamera kayıtları ve biyometrik log çelişkisi bulunmaktadır.',
    'Kart okuyucu yazılımının güncel tutulmaması nedeniyle süresi dolmuş kartlar sisteme geçişe izin vermiştir.',
    'APPROVED',
    'Denetçi Ahmet Koç'
  ),
  (
    'fca55000-0000-0000-0000-000000000002',
    'finding',
    'f1000000-0000-0000-0000-000000000002',
    'FATF Öneri 16 — Şüpheli İşlem Bildirim Gecikmesi',
    'MASAK''a iletilmesi gereken şüpheli işlem bildirimleri 72 saat gecikmeyle yapılmış; yasal süre 24 saattir.',
    'Uyum ekibinin bildirim süreç otomasyonunu manuel takiple yönetmesi ve kritik bildirim eşiğini manuel aşamada atlayan bir tasarım hatası.',
    'COMPLETED',
    'Denetçi Leyla Şahin'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.five_whys_steps (
  id, analysis_id, step_number, question, answer,
  evidence, is_root_cause
) VALUES
  -- Analiz 1: Yetkisiz Erişim (rca55000...001) — 5 Neden
  (
    'fff55000-0000-0000-0000-000000000001',
    'fca55000-0000-0000-0000-000000000001', 1,
    'Neden yetkisiz kişiler sunucu odasına girebildi?',
    'Biyometrik kart okuyucu süresi dolmuş kartları reddedecek şekilde yapılandırılmamıştı.',
    'Biyometrik log kayıtları 15:43 ile 15:51 arası 2 geçiş gösteriyor
ON CONFLICT DO NOTHING;
 her iki kartın da son geçerlilik tarihi 2026-02-28.',
    false
  ),
  (
    'fff55000-0000-0000-0000-000000000002',
    'fca55000-0000-0000-0000-000000000001', 2,
    'Neden kart okuyucu süresi dolmuş kartı kabul etti?',
    'Kart okuyucu yazılımı 14 ay boyunca güncellenmemişti; geçerlilik doğrulama modülü bu versiyonda hatalıydı.',
    'IT varlık yönetim sistemi versiyonu: v2.1.4 (2024-12-01). Güncel versiyon: v3.0.2 (2026-01-20).',
    false
  ),
  (
    'fff55000-0000-0000-0000-000000000003',
    'fca55000-0000-0000-0000-000000000001', 3,
    'Neden 14 ay boyunca yazılım güncellenmedi?',
    'BT departmanı güncelleme için değişiklik talebi (Change Request) açmamıştı; periyodik bakım takvimi mevcut değildi.',
    'ITSM sistemi son 2 yıldaki CR kayıtları tarandı: kart okuyucu için hiç CR bulunamadı.',
    false
  ),
  (
    'fff55000-0000-0000-0000-000000000004',
    'fca55000-0000-0000-0000-000000000001', 4,
    'Neden periyodik bakım takvimi oluşturulmamıştı?',
    'Fiziksel güvenlik cihazları, IT varlık envanterinde "kritik altyapı" kategorisinde tanımlanmamıştı; bu nedenle bakım planlaması kapsamı dışında kalmıştı.',
    'IT varlık envanteri çıktısı incelendi; kart okuyucular "çevre birimi" olarak sınıflandırılmış.',
    false
  ),
  (
    'fff55000-0000-0000-0000-000000000005',
    'fca55000-0000-0000-0000-000000000001', 5,
    'Neden fiziksel güvenlik cihazları kritik varlık olarak sınıflandırılmamış?',
    'Bilgi güvenliği politikası son 4 yılda güncellenmemiş; ISO 27001:2022 revizyonu ve fiziksel güvenlik kontrollerinin kritiklik kriterleri mevcut politikaya yansıtılmamış.',
    'Bilgi Güvenliği Politikası son revizyon tarihi: 2022-11-15. ISO 27001:2022 yayım tarihi: 2022-10-25.',
    true
  ),
  -- Analiz 2: FATF Gecikmesi (rca55000...002) — 4 Neden
  (
    'fff55000-0000-0000-0000-000000000006',
    'fca55000-0000-0000-0000-000000000002', 1,
    'Neden bildirim 72 saat gecikti?',
    'Uyum ekibi süpheli işlemi manuel inceleme kuyruğunda 2 gün bekletmiş; otomatik eskalasyon mekanizması devrede değildi.',
    'CCM sistemi işlem log kaydı: alarm 2026-03-04 09:12, MASAK bildirimi 2026-03-07 09:44.',
    false
  ),
  (
    'fff55000-0000-0000-0000-000000000007',
    'fca55000-0000-0000-0000-000000000002', 2,
    'Neden otomatik eskalasyon mekanizması devrede değildi?',
    'CCM modülünün bildirim eşiği konfigürasyonu yanlış yapılandırılmıştı; eşik değeri çok yüksek tutulmuştu.',
    'CCM konfigürasyon dosyası: threshold=5000000 (5 Mn TL). İşlem tutarı: 1.2 Mn TL.',
    false
  ),
  (
    'fff55000-0000-0000-0000-000000000008',
    'fca55000-0000-0000-0000-000000000002', 3,
    'Neden eşik değeri bu kadar yüksek tutulmuştu?',
    'CCM sisteminin ilk kurulumunda MASAK eşiğini bilen uzman danışman çalışmıyordu; eşik değeri varsayılan olarak bırakılmıştı.',
    'Proje teslim belgesi incelendi; MASAK eşiği konfigürasyonu "ileride yapılacak" olarak not düşülmüş.',
    false
  ),
  (
    'fff55000-0000-0000-0000-000000000009',
    'fca55000-0000-0000-0000-000000000002', 4,
    'Neden "ileride yapılacak" maddesinin takibi yapılmadı?',
    'Proje kapanışında açık madde takibi için sorumlu atanmamış; uyum ekibi CCM konfigürasyonunun tamamlandığını varsaymış.',
    'Proje kapanış tutanağında açık madde sorumlu sütunu boş. Uyum ekibi iç yazışmaları incelendi.',
    true
  )
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- WAVE 53 SEED: Cyber Threat Intelligence & Dark Web Monitor
-- =============================================================================

INSERT INTO public.cyber_threat_feeds (id, tenant_id, feed_source, threat_type, title, description, severity, status, ioc_type, ioc_value, mitre_tactic, mitre_technique, total_vulnerabilities, affected_systems, confidence_score, threat_actor, detected_at) VALUES
  (
    'cff00001-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'CERT-TR',
    'RANSOMWARE',
    'LockBit 3.0 Fidye Yazılımı — Finansal Sektör Hedefli Kampanya',
    'CERT-TR, Türk bankacılık sektörünü hedef alan aktif LockBit 3.0 fidye yazılımı kampanyası tespit etti. Saldırı vektörü: RDP brute-force + spear-phishing. MITRE T1059 (Command Scripting Interpreter) tekniği kullanılmaktadır.',
    'CRITICAL',
    'ACTIVE',
    'IP',
    '185.220.101.47',
    'Execution',
    'T1059.001',
    12,
    ARRAY['core_banking_api','swift_interface','internal_vpn'],
    91.5,
    'LockBit Affiliate Group',
    NOW() - INTERVAL '3 hours'
  ),
  (
    'cff00001-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'OSINT',
    'PHISHING',
    'Sentinel Bank Kimlik Avı Domainleri (Typosquatting)',
    'Kurumun resmi alan adını taklit eden 3 adet typosquatting domain tespit edildi (sentinel-bank.com.tr, sentinelb4nk.com, sentínel.com). Bu domainler sahte giriş formu barındırmaktadır.',
    'HIGH',
    'INVESTIGATING',
    'DOMAIN',
    'sentinel-bank.com.tr',
    'Initial Access',
    'T1566.002',
    3,
    ARRAY['customer_portal','internet_banking'],
    78.0,
    'Unknown APT',
    NOW() - INTERVAL '6 hours'
  ),
  (
    'cff00001-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'INTERNAL_SIEM',
    'CREDENTIAL_THEFT',
    'Servis Hesabı Kimlik Bilgisi Hırsızlığı Şüphesi',
    'SIEM, bir servis hesabının olağandışı saatlerde (03:00–04:00) core banking sistemine erişim sağladığını tespit etti. Erişim deseni Mimikatz lateral movement ile örtüşmektedir.',
    'HIGH',
    'ACTIVE',
    'HASH',
    'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    'Credential Access',
    'T1003.001',
    5,
    ARRAY['core_banking','ldap_server'],
    82.0,
    NULL,
    NOW() - INTERVAL '2 hours'
  ),
  (
    'cff00001-0000-0000-0000-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'MITRE_ATT&CK',
    'SUPPLY_CHAIN',
    'Tedarik Zinciri Riski: 3. Parti Yazılım Otomatik Güncelleme Mekanizması',
    'Kullanılan muhasebe entegrasyon yazılımının sağlayıcısından bir güvenlik açığı bildirimi alındı. Otomatik güncelleme mekanizması üzerinden DDLL hijacking saldırısı mümkün.',
    'MEDIUM',
    'ACTIVE',
    NULL,
    NULL,
    'Defense Evasion',
    'T1574.002',
    8,
    ARRAY['erp_integration','accounting_api'],
    65.0,
    NULL,
    NOW() - INTERVAL '1 day'
  ),
  (
    'cff00001-0000-0000-0000-000000000005',
    '11111111-1111-1111-1111-111111111111',
    'CERT-TR',
    'DDOS',
    'DNS Amplifikasyon DDoS Saldırısı Uyarısı',
    'CERT-TR, Türk finans kurumlarını hedef alan DNS amplifikasyon tabanlı DDoS kampanyasına ilişkin IoC listesi yayımladı. Bant genişliği: 380 Gbps peak.',
    'HIGH',
    'CONTAINED',
    'IP',
    '91.108.4.0/24',
    'Impact',
    'T1498.002',
    0,
    ARRAY['internet_gateway','dns_servers','public_api'],
    88.0,
    'NoName057(16)',
    NOW() - INTERVAL '5 hours'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.darkweb_alerts (id, tenant_id, alert_code, title, description, category, severity, status, source_forum, threat_actor_alias, affected_data_types, estimated_records, evidence_snippet, confidence_score, feed_id, detected_at) VALUES
  (
    'dfa00001-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'DW-LEAK-001',
    'Müşteri Veritabanı Sızıntı İddiası — BreachForums',
    'BreachForums''ta bir tehdit aktörü, finansal kuruma ait 2.4 milyon müşteri kaydını sattığını iddia etti. Sızdırılan verilerin ad, TCKN, IBAN ve telefon numarası içerdiği öne sürüldü. MASAK bildirimi ve KVKK ihlal bildirimi değerlendirme sürecinde.',
    'DATA_LEAK',
    'CRITICAL',
    'ESCALATED',
    'BreachForums v3',
    'PhantomSeller_TR',
    ARRAY['full_name','tc_kimlik','iban','phone','email'],
    2400000,
    'Selling fresh Turkish banking customers DB - 2.4M records - IBAN + TCKN included. Price: $12,000 in BTC.',
    87.0,
    'cff00001-0000-0000-0000-000000000003',
    NOW() - INTERVAL '4 hours'
  ),
  (
    'dfa00001-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'DW-CRED-001',
    'Çalışan VPN Kimlik Bilgileri Satışı',
    '""Exploit.in" credential dump listesinde kurumun VPN ağ geçidine ait olduğu düşünülen 47 adet çalışan kullanıcı adı/parola çifti tespit edildi. Aktif erişim riski.',
    'CREDENTIAL_DUMP',
    'HIGH',
    'VALIDATED',
    'Exploit.in',
    'CredMaster_RU',
    ARRAY['vpn_credentials','email','username'],
    47,
    'sentinelbank[.]com[.]tr VPN credentials - 47 accounts - valid as of 2026-03-01',
    92.0,
    NULL,
    NOW() - INTERVAL '8 hours'
  ),
  (
    'dfa00001-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'DW-RANSOM-001',
    'Fidye Yazılımı Kurban Listesi İddiası',
    'LockBit 3.0 leak sitesinde kuruma ait logo ve alan adı görüntülendi. Ödeme yapılmadığı takdirde 72 saat içinde 28 GB verinin yayımlanacağı tehdidinde bulunuldu.',
    'RANSOMWARE_LISTING',
    'CRITICAL',
    'NEW',
    'LockBit 3.0 Leak Site',
    'LockBit Affiliate #447',
    ARRAY['financial_reports','board_minutes','customer_data'],
    NULL,
    'Sentinel Bank - 28GB - Deadline: 72 hours. Payment: 50 BTC.',
    75.0,
    'cff00001-0000-0000-0000-000000000001',
    NOW() - INTERVAL '1 hour'
  ),
  (
    'dfa00001-0000-0000-0000-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'DW-BRAND-001',
    'Telegram''da Sahte Müşteri Destek Kanalı',
    'Kurumun adını ve logosunu kullanan sahte bir Telegram kanalı tespit edildi. Kanal, müşterilerden "hesap doğrulama" bahanesiyle OTP ve şifre istiyor.',
    'BRAND_ABUSE',
    'HIGH',
    'NEW',
    'Telegram',
    'Unknown',
    ARRAY['otp','password','account_number'],
    NULL,
    't.me/sentinelbank_destek_tr — Sahte kanal, 1.240 üye',
    68.0,
    NULL,
    NOW() - INTERVAL '12 hours'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 54 SEED: Auto-Deck & Board Presentation Generator
-- =============================================================================

-- 1. presentation_decks — Kurul Sunumları
INSERT INTO public.presentation_decks (id, tenant_id, title, subtitle, deck_type, period, status, total_slides, theme, generated_by) VALUES
  (
    'fd000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    '2026 Q1 İç Denetim Faaliyet Raporu',
    'Yönetim Kurulu ve Denetim Komitesi Bilgilendirme Sunumu',
    'BOARD_REPORT',
    '2026 Q1',
    'ready',
    8,
    'sentinel',
    'Auto-Deck AI v4.0'
  ),
  (
    'fd000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'BDDK Denetim Hazırlık Sunumu — 2026',
    'BDDK Yerinde İnceleme Öncesi Yönetim Brifinci',
    'AUDIT_COMMITTEE',
    '2026',
    'draft',
    5,
    'executive',
    'Auto-Deck AI v4.0'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. slide_blocks — Q1 Sunumu Slaytları
INSERT INTO public.slide_blocks (id, tenant_id, deck_id, slide_order, slide_type, title, subtitle, body_content, kpi_data, speaker_notes) VALUES
  (
    'fb000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'fd000000-0000-0000-0000-000000000001',
    1,
    'COVER',
    '2026 Birinci Çeyrek İç Denetim Faaliyet Raporu',
    'Yönetim Kurulu Sunumu — 7 Mart 2026',
    'Teftiş Kurulu Başkanlığı tarafından GIAS 2024 standartları çerçevesinde hazırlanmıştır.',
    NULL,
    'Sunumu açarken denetim planına olan bağlılığı ve tamamlanan denetimlerin sayısını vurgulayın.'
  ),
  (
    'fb000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'fd000000-0000-0000-0000-000000000001',
    2,
    'EXECUTIVE_SUMMARY',
    'Yönetici Özeti',
    'Q1 2026 Temel Bulgular',
    'Bu çeyrekte 12 denetim görevi tamamlanmış, toplam 47 bulgu tespit edilmiştir. Kritik bulgular derhal Yönetim Kurulu''nun dikkatine sunulmuştur. Otonom iyileştirme kampanyası kapsamında 31 bulgu kapatılmıştır.',
    '[{"label":"Tamamlanan Denetim","value":"12","trend":"up"},{"label":"Toplam Bulgu","value":"47","trend":"down"},{"label":"Kapatılan Bulgu","value":"31","trend":"up"},{"label":"Genel Not","value":"B+","trend":"up"}]',
    'Genel not artışını (bir önceki çeyreğe göre B''den B+''ya) özellikle vurgulayın.'
  ),
  (
    'fb000000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'fd000000-0000-0000-0000-000000000001',
    3,
    'FINDINGS',
    'Kritik ve Yüksek Riskli Bulgular',
    'Acil Eylem Gerektiren Konular',
    'Bulgu 1 — Ayrıcalıklı Erişim Yönetimi (Kritik): Sistem yöneticisi hesapları periyodik incelemeye tabi tutulmamaktadır. Bulgu 2 — Değişim Yönetimi (Yüksek): Yazılım değişikliklerinin yalnızca %45''i onay sürecine tabi.',
    NULL,
    'Her bulgu için sorumlu birim ve kapatma tarihini belirtmeyi unutmayın.'
  ),
  (
    'fb000000-0000-0000-0000-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'fd000000-0000-0000-0000-000000000001',
    4,
    'KPI',
    'Denetim Karnesi — Q1 2026',
    'KERD-2026 Notlama Motoru Çıktıları',
    NULL,
    '[{"label":"Ortalama Denetim Notu","value":"B+ (82.4)","trend":"up"},{"label":"SLA Uyum Oranı","value":"%91","trend":"up"},{"label":"Kritik Bulgu Kapatma","value":"%68","trend":"up"},{"label":"Bütçe Kullanımı","value":"%74","trend":"neutral"}]',
    'Geçen yılın aynı dönemine kıyasla tüm göstergeler iyileşme eğiliminde.'
  ),
  (
    'fb000000-0000-0000-0000-000000000005',
    '11111111-1111-1111-1111-111111111111',
    'fd000000-0000-0000-0000-000000000001',
    5,
    'RECOMMENDATIONS',
    'Yönetim Kurulu Kararına Sunulan Öneriler',
    'GIAS 2024 Standardı Çerçevesinde',
    '1. Ayrıcalıklı hesap gözden geçirme sürecinin 90 gün içinde tamamlanması. 2. Değişim yönetimi onay oranının %95''e yükseltilmesi için GenelMüdürlük talimatı çıkarılması. 3. Suiistimal tespitinde yapay zeka destekli sürekli denetim altyapısının Q2 itibarıyla aktive edilmesi.',
    NULL,
    'Her öneri için sorumlu Genel Müdür Yardımcısını belirtin.'
  ),
  (
    'fb000000-0000-0000-0000-000000000006',
    '11111111-1111-1111-1111-111111111111',
    'fd000000-0000-0000-0000-000000000001',
    6,
    'CONTENT',
    'Q2 2026 Denetim Planı',
    'Önümüzdeki Dönem Öncelikli Alanlar',
    'Öncelik 1: Dijital Bankacılık ITGC denetimi. Öncelik 2: Bireysel Kredi Tahsis Süreci. Öncelik 3: KVKK Veri İşleme Uyum Denetimi. Öncelik 4: AML/MASAK Kontrol Etkinliği.',
    NULL,
    'Risk önceliklendirme matrisine göre hazırlanmıştır.'
  ),
  (
    'fb000000-0000-0000-0000-000000000007',
    '11111111-1111-1111-1111-111111111111',
    'fd000000-0000-0000-0000-000000000001',
    7,
    'CONTENT',
    'Bağımsızlık ve Tarafsızlık Beyanı',
    'GIAS 2024 Std. 2.1 — Bağımsızlık',
    'Teftiş Kurulu Başkanlığı, raporlama döneminde bağımsızlığını ve tarafsızlığını tam olarak korumuştur. Tüm denetçiler bağımsızlık beyanlarını imzalamıştır. Herhangi bir kısıtlama veya kapsam dışı bırakma sınırı bulunmamaktadır.',
    NULL,
    'Denetim komitesine direkt raporlama yapısının altını çizin.'
  ),
  (
    'fb000000-0000-0000-0000-000000000008',
    '11111111-1111-1111-1111-111111111111',
    'fd000000-0000-0000-0000-000000000001',
    8,
    'CLOSING',
    'Sorular ve Kapanış',
    'Teftiş Kurulu Başkanlığı',
    'Sunumun tamamı için teşekkür ederiz. Denetim Komitesi''nin soru ve görüşleri için hazırız. Bir sonraki brifing: Q2 2026 sonunda.',
    NULL,
    'Yönetim Kurulu kararlarını kayıt altına almayı unutmayın.'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Wave 56 Seed: ORM Loss Database & Fines Tracker
-- Basel II uyumlu operasyonel kayıp olayları ve cezalar
-- ============================================================

INSERT INTO operational_losses (
  id, event_code, event_date, discovery_date, event_type, risk_category,
  business_line, department, description,
  gross_loss, recovery_amount, insurance_recovery,
  status, provisioning_pct, root_cause, control_failure,
  bddk_reportable, reported_to_bddk, report_deadline
) VALUES
  (
    'ffff0001-ffff-0000-0000-000000000001',
    'ORM-2025-0041',
    '2025-10-15', '2025-10-18',
    'INTERNAL_FRAUD', 'OPERATIONAL',
    'RETAIL_BANKING', 'Şube Operasyonları',
    'İzmir Şubesi nakit kasasından yetkisiz para transferi. Güvenlik kamerası kaydı ve muhasebe mutabakatı ile tespit edilmiştir. İlgili personel hakkında cezai işlem başlatılmıştır.',
    850000.00, 620000.00, 0.00,
    'LITIGATED', 70,
    'Yetersiz denetim ve görev ayrımı ihlali',
    'Kasa muabere kontrollerinin aylık yerine günlük yapılmaması',
    TRUE, TRUE, '2025-11-15'
  ),
  (
    'ffff0001-ffff-0000-0000-000000000002',
    'ORM-2026-0003',
    '2026-01-07', '2026-01-08',
    'EXTERNAL_FRAUD', 'OPERATIONAL',
    'DIGITAL_BANKING', 'Dijital Bankacılık',
    'Sosyal mühendislik saldırısı sonucunda 34 müşteri hesabından yetkisiz EFT. Saldırganlar müşterilere banka çalışanı gibi telefon açarak hesap bilgilerini elde etmiştir.',
    1240000.00, 980000.00, 210000.00,
    'PROVISIONED', 50,
    'Telefon doğrulama sisteminin yetersizliği',
    'Çok faktörlü kimlik doğrulama zorunlu kılınmamış',
    TRUE, FALSE, '2026-02-07'
  ),
  (
    'ffff0001-ffff-0000-0000-000000000003',
    'ORM-2026-0007',
    '2026-01-22', '2026-01-23',
    'BUSINESS_DISRUPTION', 'OPERATIONAL',
    'CORPORATE_FINANCE', 'Sistem ve Teknoloji',
    'Core Banking sistemi güncelleme sırasında 6 saatlik hizmet kesintisi. Kurumsal müşterilere yapılması gereken 2.4 milyar TL tutarındaki ödeme işlemi gecikmiştir.',
    380000.00, 0.00, 380000.00,
    'CLOSED', 100,
    'Yazılım güncelleme prosedürü yetersizliği',
    'Test ortamında gözden kaçan kritik bağımlılık hatası',
    FALSE, FALSE, NULL
  ),
  (
    'ffff0001-ffff-0000-0000-000000000004',
    'ORM-2026-0011',
    '2026-02-03', '2026-02-05',
    'REGULATORY_NON_COMPLIANCE', 'OPERATIONAL',
    'ALL_LINES', 'Uyum Birimi',
    'BDDK ICAAP raporunun yasal süresinde sunulmaması. Raporlama gecikme gerekçesi otomatik sistem alarmının e-posta sistemine iletilmemesinden kaynaklanmaktadır.',
    500000.00, 0.00, 0.00,
    'CLOSED', 100,
    'Raporlama takvimi otomasyonunun başarısız olması',
    'İkincil (backup) bildirim mekanizmasının mevcut olmaması',
    TRUE, TRUE, '2026-02-20'
  ),
  (
    'ffff0001-ffff-0000-0000-000000000005',
    'ORM-2026-0019',
    '2026-02-28', '2026-03-01',
    'EXECUTION_DELIVERY', 'OPERATIONAL',
    'TREASURY', 'Hazine',
    'Repo işleminde hata tutarı yanlış girildi. İşlem miktarı 10M TL yerine 100M TL olarak konfirme edildi. Aynı gün düzeltme yapıldı ancak spread farkı zararı oluştu.',
    125000.00, 0.00, 0.00,
    'CLOSED', 100,
    'Veri giriş doğrulama kontrolünün yetersizliği',
    '4-Göz prensibinin yüksek tutarlı işlemlerde uygulanmaması',
    FALSE, FALSE, NULL
  ),
  (
    'ffff0001-ffff-0000-0000-000000000006',
    'ORM-2026-0024',
    '2026-03-05', '2026-03-06',
    'CLIENTS_PRODUCTS', 'OPERATIONAL',
    'WEALTH_MANAGEMENT', 'Özel Bankacılık',
    'Müşteriye uygunsuz finansal ürün satışı (mis-selling). Risk profili düşük olan emekli müşteriye yüksek volatiliteli yapılandırılmış ürün satılması.',
    320000.00, 0.00, 0.00,
    'UNDER_REVIEW', 30,
    'Uygunluk testi (suitability assessment) prosedür ihlali',
    'Satış temsilcisi eğitim ve denetim eksikliği',
    TRUE, FALSE, '2026-04-05'
  )
ON CONFLICT (event_code) DO NOTHING;

-- İdari Para Cezaları
INSERT INTO regulatory_fines (
  id, fine_code, related_loss_id, regulator, penalty_type,
  subject, legal_basis, fine_amount, currency,
  imposed_date, payment_deadline, paid_date, paid_amount,
  status, is_appealed
) VALUES
  (
    'ffff0001-fffe-0000-0000-000000000001',
    'FINE-BDDK-2026-001',
    'ffff0001-ffff-0000-0000-000000000004',
    'BDDK', 'ADMINISTRATIVE',
    'ICAAP Raporlama Gecikmesi İdari Para Cezası',
    '5411 Sayılı Bankacılık Kanunu Md. 68/3 — Düzenleyici Raporlama Yükümlülüğü',
    500000.00, 'TRY',
    '2026-02-20', '2026-03-20', '2026-03-15', 500000.00,
    'PAID', FALSE
  ),
  (
    'ffff0001-fffe-0000-0000-000000000002',
    'FINE-KVKK-2026-001',
    NULL,
    'KVKK', 'ADMINISTRATIVE',
    'Müşteri Kişisel Verisi İşleme İhlali Cezası — Açık Rıza Eksikliği',
    '6698 Sayılı KVKK Md. 18 — Kabahatler',
    250000.00, 'TRY',
    '2026-01-15', '2026-02-28', NULL, 0.00,
    'CONTESTED', TRUE
  ),
  (
    'ffff0001-fffe-0000-0000-000000000003',
    'FINE-MASAK-2025-003',
    'ffff0001-ffff-0000-0000-000000000001',
    'MASAK', 'ADMINISTRATIVE',
    'Şüpheli İşlem Bildirim Yükümlülüğü Gecikmesi',
    '5549 Sayılı MASAK Kanunu Md. 16 — İdari Para Cezaları',
    180000.00, 'TRY',
    '2025-12-01', '2026-01-01', '2025-12-28', 180000.00,
    'PAID', FALSE
  ),
  (
    'ffff0001-fffe-0000-0000-000000000004',
    'FINE-BDDK-2026-002',
    'ffff0001-ffff-0000-0000-000000000006',
    'BDDK', 'ADMINISTRATIVE',
    'Uygunsuz Ürün Satışı — MiFID II Benzeri Uygunluk Testi İhlali',
    'BDDK Finansal Tüketici Koruma Yönetmeliği Md. 12',
    420000.00, 'TRY',
    '2026-03-07', '2026-04-07', NULL, 0.00,
    'UNPAID', FALSE
  )
ON CONFLICT (fine_code) DO NOTHING;

-- =============================================================================
-- WAVE 55 SEED: Root Cause & 5-Whys Analyzer
-- =============================================================================
-- Örnek: "Yetkisiz Erişim Bulgusu" için 5-Neden derinlemesine analizi
-- =============================================================================

INSERT INTO public.root_cause_analyses
  (id, linked_entity_type, linked_entity_id, title, method, status,
   problem_statement, root_cause_summary, created_by_name)
VALUES
  (
    'fca00001-0000-0000-0000-000000000001',
    'finding',
    '00000000-0000-0000-0000-000000000001',   -- placeholder finding ID
    'Yetkisiz Sistem Erişimi — Core Banking Yönetici Paneli',
    'five_whys',
    'COMPLETED',
    'Bir junior back-office kullanıcısı, yetki sınırlarını aşarak Core Banking Yönetici Paneline erişebilmiş ve müşteri limitlerini değiştirmiştir. Olay, CyberArk log anomali alarmı ile tespit edilmiştir.',
    'IAM sisteminde role-based access control (RBAC) politikalarının 6 aylık erişim belgelendirme döngüsünde gözden geçirilmemesi
ON CONFLICT DO NOTHING;
 bu süreçten sorumlu Bilgi Güvenliği Koordinatörü pozisyonunun 3 aydır boş bırakılması.',
    'Zeynep Aydın (CAE · Kıdemli Denetçi)'
  ),
  (
    'fca00001-0000-0000-0000-000000000002',
    'crisis_event',
    'ce000001-0000-0000-0000-000000000001',
    'Veri Merkezi A Kesintisi — Altyapı Arıza Kök Nedeni',
    'five_whys',
    'IN_PROGRESS',
    'Birincil veri merkezinde UPS ünitesinin beklenmedik çöküşü ana güç kesintisine yol açmıştır. Olay periyodik UPS bakım kaydında gözden kaçan kapasite uyarısı ile ilişkilidir.',
    NULL,
    'Ahmet Yılmaz (BT Direktörü)'
  )
ON CONFLICT (id) DO NOTHING;

-- 5-Neden Adımları: Yetkisiz Erişim (rca00001...001)
INSERT INTO public.five_whys_steps
  (id, analysis_id, step_number, question, answer, evidence, is_root_cause)
VALUES
  (
    'fff00001-0000-0000-0000-000000000001',
    'fca00001-0000-0000-0000-000000000001',
    1,
    'Neden #1: Kullanıcı Core Banking Yönetici Paneline erişebildi?',
    'Kullanıcının profili "Back-Office Extended" rolüne atanmıştı ve bu rol, yapılandırma hatası nedeniyle Yönetici Paneli iznini içeriyordu.',
    'IAM Log #CBA-2026-0301-7742 — CyberArk Session: BO_USER_4412',
    false
  ),
  (
    'fff00001-0000-0000-0000-000000000002',
    'fca00001-0000-0000-0000-000000000001',
    2,
    'Neden #2: "Back-Office Extended" rolü neden yönetici iznini içeriyordu?',
    'Yaklaşık 18 ay önce bir proje teslim aciliyetinde geçici yetki verilmiş
ON CONFLICT DO NOTHING;
 teslim sonrası bu ekleme kaldırılmamıştır.',
    'JIRA Ticket: IAM-2024-0879 — "Geçici Yetki Genişletme" etiketi, kapatma tarihi boş.',
    false
  ),
  (
    'fff00001-0000-0000-0000-000000000003',
    'fca00001-0000-0000-0000-000000000001',
    3,
    'Neden #3: Geçici yetkiler neden zamanında geri alınmadı?',
    'IAM sisteminde geçici erişim bitişini otomatik olarak revokeeden bir mekanizma (expiry-date alanı) yapılandırılmamış.',
    'IAM Panel Screenshot: expiry_date = NULL — 1.247 aktif geçici yetki kaydından 834ünde expiry_date boş.',
    false
  ),
  (
    'fff00001-0000-0000-0000-000000000004',
    'fca00001-0000-0000-0000-000000000001',
    4,
    'Neden #4: IAM sistemi neden otomatik expiry özelliğiyle yapılandırılmadı?',
    'RBAC politikaları son 6 ayda periyodik erişim incelemesine (periodic access review) tabi tutulmamış; bu incelemeyi yönetecek Bilgi Güvenliği Koordinatörü pozisyonu 3 aydır boş.',
    'İK Kayıtları: BGYS-Koordinatör pozisyonu — 2025-11-30 istifa, yerine atama yapılmadı.',
    false
  ),
  (
    'fff00001-0000-0000-0000-000000000005',
    'fca00001-0000-0000-0000-000000000001',
    5,
    'Neden #5 (KÖK NEDEN): Bilgi Güvenliği Koordinatörü neden 3 aydır atanmadı?',
    'Bilgi Güvenliği bütçesi 2025 konsolidasyonunda %20 kısıntıya uğradı. Yönetim, kritik güvenlik rollerinin önceliklendirilmesi yerine kadroyu dondurdu. BGYS süreçleri otomasyon olmaksızın tek kişiye bağımlıydı.',
    'YK Bütçe Kararı No: 2025/BTC-041 — BT kadro dondurma kararı. BGYS proses haritası: tek sahip riski tespit edildi.',
    true
  ),
  -- 5-Neden Adımları: Veri Merkezi A (rca00001...002) — devam ediyor, 3 adım var
  (
    'fff00001-0000-0000-0000-000000000006',
    'fca00001-0000-0000-0000-000000000002',
    1,
    'Neden #1: UPS ünitesi beklenmedik biçimde çöktü?',
    'UPS batarya kapasitemsi tasarım kapasitesinin %43üne düşmüştü. Eşik aşım uyarısı operasyon ekibine iletilmemişti.',
    'UPS Monitoring Portal: battery_health=43% — Uyarı eşiği 60% olarak ayarlı ancak eskalasyon akışı kapalı.',
    false
  ),
  (
    'fff00001-0000-0000-0000-000000000007',
    'fca00001-0000-0000-0000-000000000002',
    2,
    'Neden #2: Batarya kapasite uyarısı operasyon ekibine neden iletilmedi?',
    'DCIM (Data Center Infrastructure Management) sistemindeki bildirim kuralı 2025 yazılım güncellemesinden sonra devre dışı kalmış.',
    'DCIM Update Log: v4.2 → v4.3 (2025-08-15) — Alert routing kural seti reset edildi.',
    false
  ),
  (
    'fff00001-0000-0000-0000-000000000008',
    'fca00001-0000-0000-0000-000000000002',
    3,
    'Neden #3: Yazılım güncellemesinden sonra kural seti neden kontrol edilmedi?',
    'Güncelleme sonrası test prosedürü sadece fonksiyonel testleri kapsıyordu; uyarı/bildirim altyapısı regresyon testine dahil edilmemişti.',
    'Change Management Ticket: CHG-2025-1104 — Test checklist: bildirim sistemi testi satırı "N/A" olarak işaretlenmiş.',
    false
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 58 SEED: PQC (Post-Quantum Cryptography) Radar
-- Kuantum Sonrası Şifreleme Radarı ve Kripto Envanteri — Örnek Veriler
-- =============================================================================

INSERT INTO public.cryptographic_assets (
  id, asset_name, system_owner, algorithm, key_size, usage_context,
  quantum_risk_level, estimated_break_year, target_pqc_algorithm, status, is_agile
) VALUES
  (
    'ffc58000-0000-0000-0000-000000000001',
    'Mobil Bankacılık API İstemci Anahtarları',
    'Dijital Kanallar BT',
    'RSA',
    2048,
    'B2C Mobil Uygulama Kimlik Doğrulama (mTLS)',
    'Yüksek',
    2029,
    'ML-KEM (Kyber-768)',
    'Geçiş Planlandı',
    false
  ),
  (
    'ffc58000-0000-0000-0000-000000000002',
    'SWIFT Mesajlaşma İmza Anahtarları',
    'Uluslararası Operasyonlar BT',
    'RSA',
    4096,
    'Uluslararası Fon Transferi İmzası (MAC)',
    'Orta',
    2034,
    'ML-DSA (Dilithium-3)',
    'Envanterde',
    true
  ),
  (
    'ffc58000-0000-0000-0000-000000000003',
    'Core Banking Veritabanı Şifreleme (TDE)',
    'Veritabanı Yönetimi',
    'AES-GCM',
    256,
    'Data-at-Rest Şifreleme (Müşteri Verileri)',
    'Güvenli (PQC)',
    NULL,
    'Gerekmiyor (AES-256 Kuantum Güvenli)',
    'Tamamlandı',
    true
  ),
  (
    'ffc58000-0000-0000-0000-000000000004',
    'VPN Gateway Master Secret Key',
    'Ağ Güvenliği',
    'IKEv2 / Diffie-Hellman',
    2048,
    'Anahtar Paylaşımı (Key Exchange)',
    'Kritik',
    2027,
    'Hybrid Kyber / X25519',
    'Geçiş Devam Ediyor',
    false
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.pqc_transition_plans (
  id, asset_id, phase, description, target_date, status, budget_estimate, assigned_to
) VALUES
  -- Mobil Bankacılık Planları (pqc58000...001)
  (
    'ffcf5800-0000-0000-0000-000000000001',
    'ffc58000-0000-0000-0000-000000000001',
    'Keşif',
    'Mobil uygulamadaki hardcoded RSA anahtarlarının tespit edilmesi ve envanterin çıkarılması işlemi.',
    '2025-10-15',
    'Tamamlandı',
    15000,
    'SecOps Ekibi'
  ),
  (
    'ffcf5800-0000-0000-0000-000000000002',
    'ffc58000-0000-0000-0000-000000000001',
    'Değerlendirme',
    'NIST onaylı ML-KEM (Kyber) algoritmasının mobil cihaz (iOS/Android) performans testleri ve batarya tüketim analizleri.',
    '2026-05-30',
    'Devam Ediyor',
    45000,
    'Mobil Mimari Ekibi'
  ),
  (
    'ffcf5800-0000-0000-0000-000000000003',
    'ffc58000-0000-0000-0000-000000000001',
    'Hibrit Test',
    'Test ortamında RSA-2048 ile ML-KEM''in hibrit modda (composite key) çalıştırılması ve API Gateway uyumluluğu.',
    '2026-11-15',
    'Planlandı',
    85000,
    'Mobil Geliştirme'
  ),
  
  -- VPN Gateway Planları (pqc58000...004)
  (
    'ffcf5800-0000-0000-0000-000000000004',
    'ffc58000-0000-0000-0000-000000000004',
    'Tam Geçiş',
    'Firewall/VPN vendor update: Yeni firmware ile IKEv2 protokolünde Hybrid Kyber geçişinin tüm veri merkezlerinde uygulanması.',
    '2025-12-01',
    'Gecikti',
    120000,
    'Ağ Güvenliği Müdürü'
  )
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- WAVE 57 SEED: AI & LLM Model Risk Management
-- =============================================================================

-- 1. ai_models_inventory — Yapay Zeka Modelleri Envanteri
INSERT INTO public.ai_models_inventory (id, tenant_id, model_name, model_type, use_case, vendor, risk_tier, status, business_owner, data_sources, last_review_at) VALUES
  (
    'aff00000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Kredi Karar Motoru v4.2',
    'XGBoost',
    'Bireysel Kredi Skorlama',
    'In-House',
    'critical',
    'active',
    'Bireysel Krediler Tahsis Birimi',
    '["KKB Verisi", "Müşteri Demografisi", "Harcama Alışkanlıkları"]',
    NOW() - INTERVAL '45 days'
  ),
  (
    'aff00000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Müşteri Asistanı Chatbot',
    'LLM',
    'Kullanıcı Destek ve Sıkça Sorulan Sorular',
    'OpenAI',
    'high',
    'active',
    'Müşteri Deneyimi Ekibi',
    '["SSS Veritabanı", "Chat Geçmişi"]',
    NOW() - INTERVAL '15 days'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. model_bias_tests — Model Test Sonuçları
INSERT INTO public.model_bias_tests (id, tenant_id, model_id, test_type, status, total_prompts, failed_prompts, findings, metrics) VALUES
  (
    'fbf00000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'aff00000-0000-0000-0000-000000000001',
    'BIAS',
    'fail',
    15000,
    3450,
    'Modelin 35 yaş altı kadın başvuru sahiplerine karşı istatistiksel olarak anlamlı bir ret ön yargısına (%23 sapma) sahip olduğu tespit edilmiştir. İlgili veri setindeki (demografik) dengesizlik kök neden olarak değerlendirilmektedir.',
    '{"accuracy": 0.88, "demographic_parity": 0.77, "equal_opportunity": 0.65}'
  ),
  (
    'fbf00000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'aff00000-0000-0000-0000-000000000002',
    'HALLUCINATION',
    'warning',
    5000,
    185,
    'Sistem, BDDK regülasyonlarına dair sorulan ters köşe senaryo testlerinde %3.7 oranında uydurma kaynak (halüsinasyon) üretmiştir. Hata oranı kabul edilebilir eşik olan %5''in altında olsa da yakından izlenmelidir.',
    '{"hallucination_rate": 0.037, "context_relevance": 0.94, "answer_faithfulness": 0.91}'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 58 SEED: PQC (Post-Quantum Cryptography) Radar
-- =============================================================================

-- 1. cryptographic_assets — Kriptografik Envanter
INSERT INTO public.cryptographic_assets (id, tenant_id, asset_name, algorithm, key_size, quantum_risk_level, usage_context, system_owner, status) VALUES
  (
    'ca000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Mobil Bankacılık API Anahtarları',
    'RSA',
    2048,
    'Kritik',
    'Data in Transit (TLS)',
    'Dijital Bankacılık Geliştirme',
    'Envanterde'
  ),
  (
    'ca000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Müşteri Veritabanı Şifreleme (TDE)',
    'AES-GCM',
    256,
    'Güvenli (PQC)',
    'Data at Rest',
    'Veritabanı Yönetimi',
    'Envanterde'
  ),
  (
    'ca000000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'Kurumsal VPN Bağlantıları',
    'ECC',
    256,
    'Yüksek',
    'Data in Transit',
    'Ağ Güvenliği',
    'Envanterde'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. pqc_transition_plans — Geçiş Planları
INSERT INTO public.pqc_transition_plans (id, tenant_id, asset_id, phase, target_date, budget_estimate, status, description) VALUES
  (
    'ffc00000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'ca000000-0000-0000-0000-000000000001',
    'Keşif',
    '2026-12-31',
    150000.00,
    'Planlandı',
    'RSA-2048 Shor algoritmasına karşı tamamen savunmasızdır. NIST onaylı Kyber algoritmasına geçiş için POC (Proof of Concept) Q3 2026''da başlayacaktır.'
  ),
  (
    'ffc00000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'ca000000-0000-0000-0000-000000000003',
    'Hibrit Test',
    '2027-06-30',
    80000.00,
    'Devam Ediyor',
    'Cisco AnyConnect Hybrid testleri devam ediyor. Mevcut donanım performansı izleniyor.'
  )
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- Wave 59 Seed: Greenwashing Detector & Sustainable Finance
-- Yeşil Tahviller ve Fon Kullanım Sapmaları (Greenwashing İhtimali)
-- ============================================================

INSERT INTO green_bonds (
  id, instrument_code, project_name, borrower_name, sector,
  amount_issued, currency, issue_date, maturity_date,
  interest_rate, esg_premium_bps, kpi_target, spo_provider, spo_status
) VALUES
  (
    '11110001-fffb-0000-0000-000000000001',
    'GB-2025-SUN-01',
    'Akdeniz Güneş Enerjisi Parkı Genişlemesi',
    'Akdeniz Enerji A.Ş.',
    'RENEWABLE_ENERGY',
    50000000.00, 'USD',
    '2025-06-15', '2030-06-15',
    4.50, 15,
    'Yıllık 120,000 ton CO2 azaltımı
ON CONFLICT DO NOTHING;
 250 MW ek kurulu güç.',
    'Sustainalytics', 'DEVIATION_DETECTED'
  ),
  (
    '11110001-fffb-0000-0000-000000000002',
    'GB-2026-TRN-01',
    'Marmara Elektrikli Filo Dönüşümü',
    'Marmara Lojistik A.Ş.',
    'CLEAN_TRANSPORT',
    25000000.00, 'EUR',
    '2026-01-10', '2031-01-10',
    3.75, 10,
    'Mevcut dizel filonun %40''ının elektrikli araçlarla değişimi.',
    'Vigeo Eiris', 'ALIGNMENT_CONFIRMED'
  ),
  (
    '11110001-fffb-0000-0000-000000000003',
    'GL-2026-BLD-01',
    'Yeşil Kampüs ve Enerji Verimliliği Kredisi',
    'Anadolu İnşaat A.Ş.',
    'GREEN_BUILDINGS',
    120000000.00, 'TRY',
    '2026-02-05', '2029-02-05',
    18.50, 50,
    'LEED Gold sertifikasyonu; bina enerji tüketiminde %35 düşüş.',
    'ISS ESG', 'PENDING'
  ),
  (
    '11110001-fffb-0000-0000-000000000004',
    'GB-2025-WAT-01',
    'İleri Biyolojik Atıksu Arıtma Tesisi',
    'Ege Su Yönetimi A.Ş.',
    'SUSTAINABLE_WATER',
    15000000.00, 'USD',
    '2025-11-20', '2032-11-20',
    4.10, 12,
    'Günlük 50,000 m3 su geri kazanımı.',
    'Sustainalytics', 'ALIGNMENT_CONFIRMED'
  )
ON CONFLICT (instrument_code) DO NOTHING;

-- ESG Denetimleri ve Greenwashing Bulguları
INSERT INTO esg_fund_audits (
  id, bond_id, bond_code, audit_date, auditor_name,
  total_fund, allocated_to_green, deviated_amount, deviation_reason,
  risk_level, kpi_status, carbon_footprint_ton, findings, requires_action, status
) VALUES
  (
    '22220001-effa-0000-0000-000000000001',
    '11110001-fffb-0000-0000-000000000001',
    'GB-2025-SUN-01',
    '2026-03-01', 'İç Denetim - Sürdürülebilirlik Odası',
    50000000.00, 38000000.00, 12000000.00,
    'Fonların 12M USD''lik kısmı ana şirketin konvansiyonel (fosil yakıtlı) enerji operasyonlarının işletme sermayesine kaydırılmıştır.',
    'CRITICAL', 'MISSED', 45000.00,
    'Kırmızı Bulgu: Tahvil ihraç sirkülerinde belirtilen Yeşil Tahvil Prensipleri (GBP) çerçevesine açık aykırılık (Greenwashing ihtimali yüksektir). İtibar riski ve regülatif ceza potansiyeli.',
    TRUE, 'ESCALATED'
  ),
  (
    '22220001-effa-0000-0000-000000000002',
    '11110001-fffb-0000-0000-000000000002',
    'GB-2026-TRN-01',
    '2026-03-05', 'Dış Bağımsız Denetçi',
    25000000.00, 25000000.00, 0.00,
    NULL,
    'LOW', 'ON_TRACK', 12500.00,
    'Eksiksiz Uyum: Fonların tamamı elektrikli filo alımında kullanılmıştır. Satın alma faturaları ve tescil belgeleri teyit edilmiştir.',
    FALSE, 'COMPLETED'
  ),
  (
    '22220001-effa-0000-0000-000000000003',
    '11110001-fffb-0000-0000-000000000003',
    'GL-2026-BLD-01',
    '2026-03-10', 'İç Denetim - Kurumsal Krediler',
    120000000.00, 110000000.00, 10000000.00,
    'Kampüs dışı genel pazarlama giderleri için fon kullanımı.',
    'MEDIUM', 'DELAYED', NULL,
    'Turuncu Bulgu: Fonun bir kısmı yeşil olmayan pazarlama faaliyetlerine harcanmış. LEED sertifika sürecinde gecikmeler mevcut ancak tahsisat çoğunlukla inşaatta.',
    TRUE, 'IN_PROGRESS'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 61 SEED: Risk Culture & Tone at the Top Pulse
-- =============================================================================

INSERT INTO public.culture_surveys (id, tenant_id, survey_code, title, description, target_audience, status, start_date, end_date, total_responses, participation_rate, overall_score) VALUES
  (
    'cf000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'CUL-2026-Q1-BRANCH',
    '2026 Q1 Şube Personeli Etik Algı Anketi',
    'Şube personelinin etik standartlara ve yönetim iklimine bakış açısını ölçümleyen periyodik nabız anketi.',
    'BRANCH_STAFF',
    'CLOSED',
    '2026-02-01',
    '2026-02-15',
    1250,
    85.4,
    68.0  -- Riskli Bölge (68/100)
  ),
  (
    'cf000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'CUL-2026-Q1-HQ',
    '2026 Q1 Genel Müdürlük Ton-at-the-Top Anketi',
    'Genel müdürlük çalışanlarının C-Level iletişime ve hesap verebilirliğe dair algı anketi.',
    'HQ_MANAGEMENT',
    'ACTIVE',
    '2026-03-01',
    '2026-03-15',
    420,
    62.5,
    78.4
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sentiment_scores (id, tenant_id, survey_id, department_name, category, score, sentiment_label, response_count, key_themes) VALUES
  (
    'ff000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'cf000000-0000-0000-0000-000000000001',
    'Şube Operasyonları',
    'ETHICS',
    52.5,
    'NEGATIVE',
    450,
    ARRAY['Baskı', 'Satış Hedefi', 'Mesai']
  ),
  (
    'ff000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'cf000000-0000-0000-0000-000000000001',
    'Kurumsal Bankacılık Şubeleri',
    'SPEAK_UP',
    45.0,
    'CRITICAL',
    200,
    ARRAY['Misilleme Korkusu', 'Sessizlik', 'Görmezden Gelme']
  ),
  (
    'ff000000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'cf000000-0000-0000-0000-000000000001',
    'Bireysel Pazarlama',
    'RISK_AWARENESS',
    82.0,
    'POSITIVE',
    600,
    ARRAY['Eğitimler', 'Farkındalık', 'Müşteri Odaklılık']
  ),
  (
    'ff000000-0000-0000-0000-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'cf000000-0000-0000-0000-000000000002',
    'Risk Yönetimi',
    'TONE_AT_THE_TOP',
    88.5,
    'POSITIVE',
    120,
    ARRAY['Açık İletişim', 'Destek', 'Liderlik']
  ),
  (
    'ff000000-0000-0000-0000-000000000005',
    '11111111-1111-1111-1111-111111111111',
    'cf000000-0000-0000-0000-000000000002',
    'Hazine',
    'ACCOUNTABILITY',
    65.0,
    'NEUTRAL',
    80,
    ARRAY['Sorumluluk Dağılımı', 'Rol Karmaşası']
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 60 SEED: Red Team Campaigns & BAS Attack Logs
-- =============================================================================

-- RED TEAM CAMPAIGNS
INSERT INTO public.red_team_campaigns
  (id, campaign_code, title, description, campaign_type, status, severity, target_systems, start_date, success_rate, lead_operator)
VALUES
  (
    'ffc00000-0000-0000-0000-000000000001',
    'RED-2026-PHISH-01',
    'SWIFT Altyapısı Phishing Simülasyonu',
    'Muhasebe ve operasyon ekiplerine yönelik hedefli (spear-phishing) simülasyonu. "Acil SWIFT Transfer İptali" konulu sahte e-postalar gönderilmiştir.',
    'PHISHING',
    'COMPLETED',
    'HIGH',
    ARRAY['Kurumsal E-posta', 'Oturum Yönetimi'],
    NOW() - INTERVAL '5 days',
    18.5,
    'Siber Savunma Merkezi (SOC)'
  ),
  (
    'ffc00000-0000-0000-0000-000000000002',
    'RED-2026-BAS-02',
    'İç Ağ Yanal Hareket (Lateral Movement) Simülasyonu',
    'DMZ bölgesinde ele geçirildiği varsayılan bir sunucu üzerinden iç ağdaki veritabanlarına erişim denemeleri.',
    'BAS',
    'ACTIVE',
    'CRITICAL',
    ARRAY['Core Banking (Fineksus)', 'Oracle DB Cluster', 'Active Directory'],
    NOW() - INTERVAL '4 hours',
    NULL,
    'Otomatik BAS Motoru'
  )
ON CONFLICT (id) DO NOTHING;

-- BAS ATTACK LOGS
INSERT INTO public.bas_attack_logs
  (id, campaign_id, attack_vector, target_asset, status, timestamp, mitre_tactic, mitre_technique, finding_details)
VALUES
  -- Phishing logs (Campaign 1)
  (
    'baf00000-0000-0000-0000-000000000001',
    'ffc00000-0000-0000-0000-000000000001',
    'Spearphishing Email Payload',
    'ahmet.yavuz@bank.com.tr',
    'SUCCESS',
    NOW() - INTERVAL '4 days',
    'TA0001 - Initial Access',
    'T1566.002 - Spearphishing Link',
    'Kullanıcı zararlı bağlantıya tıklamış ve sahte O365 portalına giriş bilgilerini girmiştir.'
  ),
  (
    'baf00000-0000-0000-0000-000000000002',
    'ffc00000-0000-0000-0000-000000000001',
    'Spearphishing Email Payload',
    'zeynep.kara@bank.com.tr',
    'BLOCKED',
    NOW() - INTERVAL '4 days' + INTERVAL '2 hours',
    'TA0001 - Initial Access',
    'T1566.002 - Spearphishing Link',
    'Kullanıcı bağlantıya tıkladı ancak kurumsal EDR çözümü bağlantıyı zararlı olarak işaretleyip engelledi.'
  ),
  -- BAS logs (Campaign 2)
  (
    'baf00000-0000-0000-0000-000000000003',
    'ffc00000-0000-0000-0000-000000000002',
    'Pass the Hash',
    '10.50.12.100 (Core App Server)',
    'DETECTED',
    NOW() - INTERVAL '3 hours',
    'TA0008 - Lateral Movement',
    'T1550.002 - Pass the Hash',
    'Kimlik bilgisi doğrulama alarmı tetiklendi. SIEM üzerinde kural eşleşmesi sağlandı ancak erişim engellenmedi (izleme modu).'
  ),
  (
    'baf00000-0000-0000-0000-000000000004',
    'ffc00000-0000-0000-0000-000000000002',
    'Remote Desktop Protocol',
    '10.50.10.55 (Domain Controller)',
    'BLOCKED',
    NOW() - INTERVAL '1 hour',
    'TA0008 - Lateral Movement',
    'T1021.001 - Remote Desktop Protocol',
    'Sunucular arası RDP erişimi Network Firewall tarafından DROP edildi.'
  )
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- Wave 63 Seed: Algo-Trading & Flash Crash Sentinel
-- HFT Logları ve Piyasa Manipülasyon (Spoofing) Alarmları
-- ============================================================

-- Örnek HFT Emir Logları (Spoofing simülasyonu için aynı saniyede çok sayıda Limit alım emri, sonra iptal)
INSERT INTO algo_trading_logs (
  trade_code, desk, instrument, order_type, side,
  price, volume, algo_strategy_id, execution_ms, is_canceled, timestamp
) VALUES
  ('TRD-USDTRY-20260401-001','FX_DESK','USD/TRY','LIMIT','BUY', 33.15000, 1500000, 'BOT-SPOOF-01', 2, TRUE, '2026-04-01 10:15:00.120+03'),
  ('TRD-USDTRY-20260401-002','FX_DESK','USD/TRY','LIMIT','BUY', 33.15100, 2000000, 'BOT-SPOOF-01', 1, TRUE, '2026-04-01 10:15:00.125+03'),
  ('TRD-USDTRY-20260401-003','FX_DESK','USD/TRY','LIMIT','BUY', 33.15200, 1800000, 'BOT-SPOOF-01', 3, TRUE, '2026-04-01 10:15:00.130+03'),
  ('TRD-USDTRY-20260401-004','FX_DESK','USD/TRY','LIMIT','BUY', 33.15300, 2500000, 'BOT-SPOOF-01', 2, TRUE, '2026-04-01 10:15:00.135+03'),
  ('TRD-USDTRY-20260401-005','FX_DESK','USD/TRY','MARKET','SELL',33.15400, 500000,  'BOT-SPOOF-01', 4, FALSE,'2026-04-01 10:15:00.150+03'), -- Fiyatı yukarı çekip satış
  
  -- Normal Arbitraj İşlemleri
  ('TRD-EURUSD-20260401-010','FX_DESK','EUR/USD','LIMIT','BUY',  1.08500, 100000,  'ARB-BOT-09',   12,FALSE,'2026-04-01 10:30:15.000+03'),
  ('TRD-EURUSD-20260401-011','FX_DESK','EUR/USD','LIMIT','SELL', 1.08520, 100000,  'ARB-BOT-09',   8, FALSE,'2026-04-01 10:30:15.800+03'),
  
  -- Flash Crash tetikleyici devasa piyasa satışı
  ('TRD-XAUUSD-20260401-020','COMMODITY_DESK','XAU/USD','MARKET','SELL', 2310.50, 150000000, 'MOMENTUM-BOT-X', 5, FALSE, '2026-04-01 14:00:00.000+03')
ON CONFLICT (trade_code) DO NOTHING;

-- Piyasa Manipülasyonu Alarmları
INSERT INTO market_manipulation_alerts (
  alert_code, detection_time, anomaly_type, instrument, severity,
  description, affected_volume, triggering_algo, status, investigator
) VALUES
  (
    'MAL-2026-001', '2026-04-01 10:15:05+03', 'SPOOFING', 'USD/TRY', 'CRITICAL',
    'Hazine Döviz Masası - 50 milisaniye içinde 4 adet büyük limit alım emri girilip iptal edildi (toplam 7.8M USD hacim). Ardından 33.154 seviyesinden piyasa satış emri (500K USD) gerçekleştirildi. Tipik Spoofing/Layering patterni.',
    7800000.00, 'BOT-SPOOF-01', 'INVESTIGATING', 'Gökhan Yılmaz (Piyasa Gözetim)'
  ),
  (
    'MAL-2026-002', '2026-04-01 14:00:01+03', 'FLASH_CRASH', 'XAU/USD', 'HIGH',
    'Olağandışı Hacim - Saniyeler içinde altın tahtasına 150M USD nominal değerinde piyasa satışı geldi. Derinlik boşaldığı için fiyat 12 dolar aşağı kaydı. Algoritma hatası şüphesi.',
    150000000.00, 'MOMENTUM-BOT-X', 'OPEN', NULL
  ),
  (
    'MAL-2026-003', '2026-04-01 09:30:00+03', 'QUOTE_STUFFING', 'EUR/TRY', 'MEDIUM',
    'Eşleştirme motorunu yavaşlatma girişimi. 1 saniye içinde 500 adet çok küçük lotlu al-sat emri bombardımanı.',
    250000.00, 'HFT-ARB-LATENCY', 'RESOLVED', 'Sistem Otokontrol'
  )
ON CONFLICT (alert_code) DO NOTHING;

-- =============================================================================
-- WAVE 65 SEED: Executive Remuneration & Clawback Tracker (Yönetişim)
-- =============================================================================

INSERT INTO public.executive_bonuses (id, tenant_id, executive_name, title, department, performance_year, base_salary, target_bonus, awarded_bonus, deferred_amount, vesting_date, risk_adjusted_rating, status) VALUES
  (
    'fef65000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Hakan Yılmaz',
    'Kurumsal Krediler Direktörü',
    'Kredi Tahsis',
    2025,
    3500000.00,
    1750000.00,
    1800000.00,
    600000.00,
    '2028-03-01',
    'C-',
    'İptal Edildi (Clawback)'
  ),
  (
    'fef65000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Banu Çelik',
    'Hazine Yönetimi Başkanı',
    'Hazine',
    2025,
    4200000.00,
    2100000.00,
    2600000.00,
    800000.00,
    '2028-03-01',
    'A+',
    'Tahakkuk Edildi'
  ),
  (
    'fef65000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'Cem Arslan',
    'Dijital Kanallar VP',
    'Dijital Bankacılık',
    2025,
    2800000.00,
    1000000.00,
    1100000.00,
    0.00,
    NULL,
    'B+',
    'Ödendi'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.clawback_events (id, tenant_id, bonus_id, trigger_event, clawback_amount, justification, board_resolution_ref, recovery_status) VALUES
  (
    'cfaf6500-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'fef65000-0000-0000-0000-000000000001',
    'Aşırı Riskli NPL (Takipteki Alacaklar) Portföy Artışı',
    600000.00,
    '2025 yılında tahsis edilen kurumsal kredi portföyünün %18 oranında batık (NPL) durumuna düşmesi sebebiyle, risk-getiri dengesinin kurumu zarara uğrattığı tespit edilmiş ve 600.000 TL ertelenmiş prime iptal (malus) uygulanmıştır.',
    'YK-2026/089',
    'Karara Bağlandı'
  )
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- WAVE 62 SEED: Geopolitical Risk & Sanctions Radar
-- =============================================================================

-- 1. sanction_lists — Ambargo ve Yaptırım Listeleri
INSERT INTO public.sanction_lists (id, tenant_id, entity_name, entity_type, country_code, list_source, sanction_type, risk_level, notes) VALUES
  (
    'ff000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Kuzey Yıldızı Lojistik A.Ş.',
    'COMPANY',
    'RU',
    'OFAC',
    'SDN',
    'critical',
    'OFAC Güncellemesi: Askeri teçhizat lojistiği sağladığı gerekçesiyle X Şirketine (Kuzey Yıldızı Lojistik) ambargo uygulanmıştır.'
  ),
  (
    'ff000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Saeed Energy Corp',
    'COMPANY',
    'IR',
    'UN',
    'SSI',
    'high',
    'BM Güvenlik Konseyi Kararı: Petrol ambargosunu delme eylemleri.'
  ),
  (
    'ff000000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'Alexey Volkov',
    'PERSON',
    'RU',
    'EU',
    'SDN',
    'critical',
    'AB Yaptırım Listesi: Finansal kurumlara yasadışı fon sağlama.'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. aml_alerts — Şüpheli İşlem Alarmları (AML)
INSERT INTO public.aml_alerts (id, tenant_id, alert_code, title, description, alert_type, severity, status, customer_id, customer_name, transaction_amount, origin_country, destination_country, total_transactions, risk_score) VALUES
  (
    'aff00000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'AML-SWIFT-001',
    'Şüpheli Fon Transferi (SWIFT) Alarmı',
    'Dubai merkezli bir aracı kurum üzerinden, yaptırım listesindeki Kuzey Yıldızı Lojistik A.Ş. ile bağlantılı olduğu düşünülen bir hesaba parça parça toplam 1.2M USD transfer girişimi.',
    'SWIFT_TRANSFER',
    'critical',
    'open',
    'CUST-88992',
    'Global Trading LLC',
    1250000.00,
    'AE',
    'RU',
    4,
    95.5
  ),
  (
    'aff00000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'AML-CASH-002',
    'Nakdi İşlem Bölünmesi (Smurfing)',
    'Aynı gün içinde 3 farklı şubeden MASAK bildirim sınırı olan 50.000 TL''nin hemen altında (49.500 TL) 5 adet nakit yatırma işlemi.',
    'CASH_DEPOSIT',
    'high',
    'investigating',
    'CUST-11223',
    'Mehmet Yılmaz',
    247500.00,
    'TR',
    'TR',
    5,
    82.0
  )
ON CONFLICT (id) DO NOTHING;

-- 3. geopolitical_events — Makro Rizikolar (Harita)
INSERT INTO public.geopolitical_events (id, tenant_id, title, description, region, country_code, coordinates, event_type, impact_level) VALUES
  (
    'fef00000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Süveyş Kanalı Geçiş Kısıtlaması',
    'Bölgedeki çatışmalar nedeniyle kargo gemilerine yönelik artan tehdit, tedarik zinciri finansmanında (Trade Finance) yüksek risk.',
    'Middle East',
    'EG',
    '{"lat": 30.0444, "lng": 31.2357}',
    'CONFLICT',
    'critical'
  ),
  (
    'fef00000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Doğu Avrupa Rejim Değişikliği Sinyali',
    'Bölgesel istikrarsızlık, yerel para birimlerinde volatilite ve sermaye çıkışları riski taşıyor.',
    'Eastern Europe',
    'UA',
    '{"lat": 50.4501, "lng": 30.5234}',
    'REGIME_CHANGE',
    'high'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 64 SEED: Data Privacy & PII Flow Mapper
-- =============================================================================

-- 1. PII DATA FLOWS
INSERT INTO public.pii_data_flows
  (id, system_source, system_destination, data_categories, transfer_method, is_encrypted, is_cross_border, legal_basis, risk_level)
VALUES
  (
    'fdf00000-0000-0000-0000-000000000001',
    'Yurtiçi Core Banking (Finexus)',
    'Global Analytics Cloud (Frankfurt)',
    ARRAY['Kimlik', 'Finansal', 'İletişim'],
    'REST_API_BATCH',
    false,    -- ŞİFRESİZ
    true,     -- YURTDIŞI
    'EXPLICIT_CONSENT',
    'CRITICAL'
  ),
  (
    'fdf00000-0000-0000-0000-000000000002',
    'CRM Sistemi (Salesforce)',
    'Çağrı Merkezi IVR Sunucusu',
    ARRAY['İletişim', 'Ses Kaydı'],
    'SECURE_SOAP',
    true,
    false,
    'LEGITIMATE_INTEREST',
    'LOW'
  ),
  (
    'fdf00000-0000-0000-0000-000000000003',
    'Mobil Uygulama Gateway',
    'AWS Frankfurt Reklam Ağı',
    ARRAY['Cihaz ID', 'Konum'],
    'KAFKA_STREAM',
    true,
    true,
    'EXPLICIT_CONSENT',
    'MEDIUM'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. CONSENT RECORDS
INSERT INTO public.consent_records
  (id, context, total_users, consented_users, revoked_users)
VALUES
  (
    'cff00000-0000-0000-0000-000000000001',
    'Pazarlama ve Üçüncü Taraf Veri Paylaşımı KVKK Onayı',
    1250000,
    980000,
    145000     -- %11 civarı revocation
  )
ON CONFLICT (id) DO NOTHING;

-- 3. PRIVACY BREACHES
INSERT INTO public.privacy_breaches
  (id, incident_title, description, affected_records, affected_data_types, severity, status, detected_at)
VALUES
  (
    'fbf00000-0000-0000-0000-000000000001',
    'Müşteri Kimlik Verisinin Bulut Sağlayıcıya Şifresiz Aktarımı',
    'Core Banking sisteminden Global Analytics Cloud paneline gece devirlerinde çalışan batch servislerin veriyi maskelemeden ve HTTPS pinning olmadan EU/Frankfurt bölgesine çıkardığı tespit edildi.',
    42500,
    ARRAY['TCKN', 'Ad-Soyad', 'Bakiye'],
    'CRITICAL',
    'INVESTIGATING',
    NOW() - INTERVAL '2 days'
  ),
  (
    'fbf00000-0000-0000-0000-000000000002',
    'Geliştirici Ortamında Canlı Veri Pozlaması',
    'UAT ortamına alınan veritabanı yedeğinde maskeleme algoritmalarının başarısız olduğu, dış kaynaklı geliştiricilerin maskesiz gerçek müşteri telefon numaralarına erişebildiği tespit edildi.',
    1200,
    ARRAY['Telefon'],
    'MEDIUM',
    'MITIGATED',
    NOW() - INTERVAL '15 days'
  )
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- Wave 66 Seed: Enterprise Digital Twin & Process Mining
-- Kredi Tahsis Süreci Dijital İkizi ve Gerçekleşen Vakalar
-- ============================================================

-- 1. Dijital İkiz (Örnek: Kredi Tahsis Süreci)
INSERT INTO digital_twin_models (
  id, process_code, name, department, owner,
  ideal_steps, ideal_duration_hours, is_active,
  nodes_json, edges_json
) VALUES
  (
    '33330001-dfff-0000-0000-000000000001',
    'PROC-CREDIT-001',
    'Kurumsal Kredi Tahsis Süreci (End-to-End)',
    'Kredi Tahsis',
    'Ayşe Yılmaz (Tahsis Direktörü)',
    5, 24.0, TRUE,
    '[
      {"id":"n1","type":"default","position":{"x":100,"y":100},"data":{"label":"1. Kredi Başvurusu Alınması","metadata":{"dept":"Şube","sla_hrs":2}}},
      {"id":"n2","type":"default","position":{"x":350,"y":100},"data":{"label":"2. KKB & İstihbarat Kontrolü","metadata":{"dept":"Risk Yönetimi","sla_hrs":4}}},
      {"id":"n3","type":"default","position":{"x":600,"y":100},"data":{"label":"3. Finansal Analiz & Rating","metadata":{"dept":"Tahsis","sla_hrs":8}}},
      {"id":"n4","type":"default","position":{"x":850,"y":100},"data":{"label":"4. Kredi Komitesi Onayı","metadata":{"dept":"Komite","sla_hrs":8}}},
      {"id":"n5","type":"default","position":{"x":1100,"y":100},"data":{"label":"5. Sisteme Giriş & Kullandırım","metadata":{"dept":"Operasyon","sla_hrs":2}}}
    ]',
    '[
      {"id":"e1","source":"n1","target":"n2","animated":true,"data":{"expected_time":"2h"}},
      {"id":"e2","source":"n2","target":"n3","animated":true,"data":{"expected_time":"4h"}},
      {"id":"e3","source":"n3","target":"n4","animated":true,"data":{"expected_time":"8h"}},
      {"id":"e4","source":"n4","target":"n5","animated":true,"data":{"expected_time":"8h"}}
    ]'
  )
ON CONFLICT (process_code) DO NOTHING;

-- 2. Process Mining Logları (Gerçekleşen Vakalar / Process Variants)
INSERT INTO process_mining_logs (
  model_id, case_id, start_time, end_time,
  actual_steps, actual_duration_hrs, compliance_status,
  bypass_details, bottleneck_node_id, risk_score, handled_by, is_audited
) VALUES
  (
    '33330001-dfff-0000-0000-000000000001',
    'CREDIT-APP-2026-99932',
    '2026-04-01 09:00:00+03', '2026-04-02 11:30:00+03',
    5, 26.5, 'MINOR_DEVIATION',
    NULL, 'n3', 15, 'Mehmet K.', FALSE
  ),
  (
    '33330001-dfff-0000-0000-000000000001',
    'CREDIT-APP-2026-99945',
    '2026-04-03 14:00:00+03', '2026-04-04 10:00:00+03',
    3, 20.0, 'BYPASS_DETECTED',
    'Sistem Loglarına Göre 2. Adım (KKB/İstihbarat) ve 3. Adım (Finansal Analiz) sistem üzerinden BİLEREK ATLANMIŞTIR. Kredi limit girişi manuel yapılmıştır.',
    NULL, 95, 'Ahmet Y.', TRUE
  ),
  (
    '33330001-dfff-0000-0000-000000000001',
    'CREDIT-APP-2026-99950',
    '2026-04-05 08:30:00+03', '2026-04-07 17:00:00+03',
    5, 56.5, 'BOTTLENECK',
    'Kredi Komitesi Onayı (Düğüm n4) adımında evrak eksikliği nedeniyle 40 saat bekleme yaşandı.',
    'n4', 40, 'Elif B.', FALSE
  ),
  (
    '33330001-dfff-0000-0000-000000000001',
    'CREDIT-APP-2026-99961',
    '2026-04-08 10:00:00+03', '2026-04-09 09:30:00+03',
    5, 23.5, 'COMPLIANT',
    NULL, NULL, 0, 'Caner T.', FALSE
  )
ON CONFLICT (case_id) DO NOTHING;

-- =============================================================================
-- WAVE 68 SEED: Zero-Knowledge Ethics Vault (ZKP Whistleblower)
-- =============================================================================

-- 1. zkp_encrypted_reports — Şifrelenmiş Etik İhbar Raporları
INSERT INTO public.zkp_encrypted_reports (id, tenant_id, tracking_code, category, severity, encrypted_payload, zk_proof_hash, status, decryption_attempts) VALUES
  (
    'fff00000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'ZKP-9982-FXA',
    'rüşvet_yolsuzluk',
    'critical',
    'U2FsdGVkX1+Vb8L1jJk/lJ+kO2rZ2y/3Z9A4...[ENCRYPTED_PAYLOAD_SIMULATION]...',
    '0x72a5b6c934d98a0f12c...',
    'reviewing',
    1
  ),
  (
    'fff00000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'ZKP-1144-KPL',
    'mobbing',
    'high',
    'U2FsdGVkX1+Vb8L1jJk/lJ+kO2rZ2y/3Z9A4...[ENCRYPTED_PAYLOAD_SIMULATION]...',
    '0x83b2a1c778f99b0c23d...',
    'submitted',
    0
  )
ON CONFLICT (tracking_code) DO NOTHING;

-- 2. vault_access_logs — Kasa Erişim Logları
INSERT INTO public.vault_access_logs (id, location_name, access_point, personnel_id, personnel_name, access_status, auth_method) VALUES
  (
    'faf00000-0000-0000-0000-000000000001',
    'Şube 342 - Sistem Odası',
    'Sunucu Kabin_A',
    'P-2311',
    'Etik Kurul Üyesi',
    'GRANTED',
    'BIOMETRIC'
  ),
  (
    'faf00000-0000-0000-0000-000000000002',
    'Genel Müdürlük - Kasa',
    'Turnike 2',
    'P-1001',
    'Sistem Yöneticisi',
    'DENIED',
    'RFID_CARD'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 67 SEED: Open Banking & API Security Auditor
-- =============================================================================

-- 1. PSD2 TOKENS
INSERT INTO public.psd2_tokens
  (id, tpp_name, client_id, scopes, status, issued_at, expires_at)
VALUES
  (
    'ffd00000-0000-0000-0000-000000000001',
    'Fintek X Ödeme Sistemleri',
    'client_fx_9921',
    ARRAY['accounts', 'payments'],
    'ACTIVE',
    NOW() - INTERVAL '30 days',
    NOW() + INTERVAL '60 days'
  ),
  (
    'ffd00000-0000-0000-0000-000000000002',
    'Açık Bankacılık Aggregator',
    'client_agg_0012',
    ARRAY['accounts'],
    'EXPIRED',
    NOW() - INTERVAL '100 days',
    NOW() - INTERVAL '10 days'
  ),
  (
    'ffd00000-0000-0000-0000-000000000003',
    'Kripto Borsası Z',
    'client_cry_443',
    ARRAY['payments'],
    'REVOKED',
    NOW() - INTERVAL '15 days',
    NOW() + INTERVAL '75 days'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. API BREACHES
INSERT INTO public.api_breaches
  (id, anomaly_type, description, source_ip, tpp_name, severity, status, detected_at)
VALUES
  (
    'bfc00000-0000-0000-0000-000000000001',
    'EXPIRED_TOKEN_USE',
    'Açık Bankacılık Aggregator TPPsi süresi dolmuş PSD2 yetki belirteci ile 15 defa ardışık müşteri bakiye (/accounts/balances) sorgulama girişiminde bulundu.',
    '193.10.22.45',
    'Açık Bankacılık Aggregator',
    'HIGH',
    'INVESTIGATING',
    NOW() - INTERVAL '2 hours'
  ),
  (
    'bfc00000-0000-0000-0000-000000000002',
    'RATE_LIMIT_EXCEEDED',
    'Fintek X Ödeme Sistemleri TPPsi tanımlı 500/dakika eşiğini aşarak 429 HTTP hatası aldı. Olası bir DDoS veya Retry-Storm hatası inceleniyor.',
    '212.156.44.11',
    'Fintek X Ödeme Sistemleri',
    'MEDIUM',
    'OPEN',
    NOW() - INTERVAL '15 minutes'
  )
ON CONFLICT (id) DO NOTHING;

-- 3. API GATEWAY LOGS
INSERT INTO public.api_gateway_logs
  (id, endpoint, method, consumer_app, ip_address, status_code, response_time_ms, is_rate_limited, timestamp)
VALUES
  (gen_random_uuid(), '/api/v1/accounts/balances', 'GET', 'Fintek X Ödeme Sistemleri', '212.156.44.11', 200, 145, false, NOW() - INTERVAL '5 minutes'),
  (gen_random_uuid(), '/api/v1/accounts/transactions', 'GET', 'Fintek X Ödeme Sistemleri', '212.156.44.11', 200, 210, false, NOW() - INTERVAL '4 minutes 30 seconds'),
  (gen_random_uuid(), '/api/v1/payments/initiate', 'POST', 'Fintek X Ödeme Sistemleri', '212.156.44.11', 429, 45, true, NOW() - INTERVAL '4 minutes'),
  (gen_random_uuid(), '/api/v1/payments/initiate', 'POST', 'Fintek X Ödeme Sistemleri', '212.156.44.11', 429, 42, true, NOW() - INTERVAL '3 minutes 50 seconds'),
  (gen_random_uuid(), '/api/v1/accounts/balances', 'GET', 'Açık Bankacılık Aggregator', '193.10.22.45', 401, 80, false, NOW() - INTERVAL '2 hours'),
  (gen_random_uuid(), '/api/v1/accounts/balances', 'GET', 'Açık Bankacılık Aggregator', '193.10.22.45', 401, 78, false, NOW() - INTERVAL '1 hour 59 minutes'),
  (gen_random_uuid(), '/api/v1/consents/status', 'GET', 'Kripto Borsası Z', '88.243.12.99', 403, 110, false, NOW() - INTERVAL '10 hours'),
  (gen_random_uuid(), '/api/v1/accounts/balances', 'GET', 'Fintek X Ödeme Sistemleri', '212.156.44.11', 502, 1850, false, NOW() - INTERVAL '1 minute')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- Wave 69 Seed: Basel IV RWA & Capital Adequacy Simulator
-- RWA Hesaplamaları ve Sermaye Yeterlilik Rasyosu (CAR) Özetleri
-- ============================================================

-- RWA Hesaplama Detayları (Basel Standardized Approach)
INSERT INTO rwa_calculations (
  calc_code, calculation_date, asset_class, exposure_amount, ccf_pct, risk_weight_pct,
  crm_applied, crm_details, analyst, is_approved
) VALUES
  (
    'RWA-2026-Q1-CORP-01', '2026-03-31', 'CORPORATE', 
    500000000.00, 100, 100, FALSE, NULL, 'Caner T. (Risk Analisti)', TRUE
  ),
  (
    'RWA-2026-Q1-CORP-02', '2026-03-31', 'CORPORATE', 
    250000000.00, 100, 75, TRUE, 'Hazine Bonosu Teminatı - %25 RWA İndirimi', 'Caner T. (Risk Analisti)', TRUE
  ),
  (
    'RWA-2026-Q1-RETAIL-01', '2026-03-31', 'RETAIL', 
    1200000000.00, 100, 75, FALSE, NULL, 'Elif B. (Bireysel Risk)', TRUE
  ),
  (
    'RWA-2026-Q1-MORTG-01', '2026-03-31', 'MORTGAGE', 
    800000000.00, 100, 35, TRUE, 'LTV < %80, Birinci Derece İpotekli', 'Elif B. (Bireysel Risk)', TRUE
  ),
  (
    'RWA-2026-Q1-SOV-01', '2026-03-31', 'SOVEREIGN', 
    3000000000.00, 100, 0, TRUE, 'T.C. Hazine Tahvilleri - %0 Risk Ağırlığı', 'Hazine Masası', TRUE
  ),
  (
    'RWA-2026-Q2-CORP-DRAFT', '2026-06-30', 'CORPORATE', 
    45000000.00, 50, 150, FALSE, 'Gelecek çeyrek, yüksek riskli teminatsız kredi tahmini (CCF %50)', 'Taslak Bot', FALSE
  )
ON CONFLICT (calc_code) DO NOTHING;

-- Sermaye Yeterlilik Rasyosu Raporları (CAR)
INSERT INTO capital_adequacy_ratios (
  report_period, report_date,
  cet1_capital, tier1_capital, tier2_capital,
  credit_rwa, market_rwa, operational_rwa,
  min_required_ratio, capital_buffer_pct, status
) VALUES
  (
    '2026-Q1', '2026-03-31',
    1850000000.00, 1850000000.00, 350000000.00,    -- Toplam Sermaye: 2.2 Milyar
    9000000000.00, 2500000000.00, 4000000000.00,   -- Toplam RWA: 15.5 Milyar -> Rasyo: %14.19
    12.00, 2.50, 'APPROVED'
  ),
  (
    '2025-Q4', '2025-12-31',
    1700000000.00, 1700000000.00, 300000000.00,    -- Toplam Sermaye: 2.0 Milyar
    8500000000.00, 2200000000.00, 3800000000.00,   -- Toplam RWA: 14.5 Milyar -> Rasyo: %13.79
    12.00, 2.50, 'APPROVED'
  )
ON CONFLICT (report_period) DO NOTHING;

-- =============================================================================
-- WAVE 70 SEED: Smart Contract & Digital Asset Ledger Audit
-- =============================================================================

INSERT INTO public.smart_contracts (id, tenant_id, contract_name, network, contract_address, solidity_version, description, audit_status, risk_score, deployment_date) VALUES
  (
    'ffc70000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Dijital Sukuk İhracı (Ijarah)',
    'Ethereum Subnet (Quorum)',
    '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    '0.8.20',
    'Bankanın islami finans kurallarına (Shariah-compliant) uygun olarak ihraç ettiği 50 Milyon USD değerindeki dijital sukuk sözleşmesi.',
    'Critical Risk',
    88.50,
    '2025-11-10'
  ),
  (
    'ffc70000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Müşteri Sadakat Puanı (SentinelLoyalty)',
    'Polygon (PoS)',
    '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
    '0.8.24',
    'Müşterilerin harcamalarından kazandıkları ve uçak bileti alımında kullanılabilen sadakat token sözleşmesi.',
    'Audited',
    12.00,
    '2026-01-15'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.token_issuances (id, tenant_id, contract_id, token_name, token_symbol, total_supply, issuance_date, regulatory_compliance) VALUES
  (
    'fff70000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'ffc70000-0000-0000-0000-000000000001',
    'Sentinel Digital Sukuk 2025',
    'SDS25',
    50000000.0000,
    '2025-11-15',
    'Pending Review'
  ),
  (
    'fff70000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'ffc70000-0000-0000-0000-000000000002',
    'Sentinel Reward Points',
    'SRP',
    1000000000.0000,
    '2026-01-20',
    'Compliant'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contract_vulnerabilities (id, tenant_id, contract_id, vulnerability_type, severity, description, code_snippet, line_number, remediation_plan, status) VALUES
  (
    'ffff7000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'ffc70000-0000-0000-0000-000000000001',
    'Reentrancy (Yeniden Giriş Açığı)',
    'Critical',
    'Sukuk itfa (redemption) fonksiyonunda dış çağrı öncesinde state güncellenmediği (Checks-Effects-Interactions pattern ihlali) tespit edildi. Kötü niyetli bir kontrat aynı bakiyeyi defalarca çekebilir.',
    'function redeemSukuk(uint256 amount) public {\n    require(balances[msg.sender] >= amount)
ON CONFLICT DO NOTHING;
\n    // VULNERABILITY: External call before state update\n    (bool success, ) = msg.sender.call{value: amount}("");\n    require(success);\n    balances[msg.sender] -= amount;\n}',
    142,
    'Fonksiyon içerisinde state güncellemesini (balances[msg.sender] -= amount) dış çağrıdan (msg.sender.call) ÖNCE yapın. Ek olarak OpenZeppelin ReentrancyGuard modifier''ını kullanın.',
    'Open'
  ),
  (
    'ffff7000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'ffc70000-0000-0000-0000-000000000001',
    'Unchecked Return Data',
    'Low',
    'Low-level çağrı yapıldıktan sonra dönen verinin boyutu kontrol edilmiyor. Bazı durumlarda beklenmeyen çalışmalara neden olabilir.',
    '(bool success, bytes memory data) = target.call(payload);\nrequire(success, "Call failed");',
    215,
    'Return data boş olsa bile asgari uzunluk doğrulaması gerçekleştirin veya yüksek seviyeli interface çağrılarını tercih edin.',
    'In Progress'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 75 SEED: Litigation & Penalty Prediction Engine
-- =============================================================================

INSERT INTO public.legal_cases (id, tenant_id, case_number, plaintiff, defendant, court, case_type, filing_date, claimed_amount, status) VALUES
  (
    'cafe7500-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    '2025/1142 E.',
    'ABC Teknoloji A.Ş.',
    'Sentinel Bank',
    'İstanbul 3. Asliye Ticaret Mahkemesi',
    'Ticari Sözleşme İhlali',
    '2025-08-14',
    12500000.00,
    'Açık'
  ),
  (
    'cafe7500-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    '2026/045 E.',
    'Ahmet Yılmaz',
    'Sentinel Bank',
    'Ankara 1. İş Mahkemesi',
    'İşe İade ve Tazminat',
    '2026-01-10',
    450000.00,
    'Karara Bağlandı'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.regulatory_investigations (id, tenant_id, regulator, subject, investigation_date, investigator_lead, status) VALUES
  (
    'fef75000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Rekabet Kurumu',
    'Mevduat Faiz Oranları Kartel Şüphesi',
    '2025-11-05',
    'Başmüfettiş O. K.',
    'Savunma Aşamasında'
  ),
  (
    'fef75000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'MASAK',
    'Uluslararası Ticaret Finansmanı Ön İnceleme',
    '2026-02-15',
    'Uzman Yrd. F. T.',
    'İncelemede'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.predicted_penalties (id, tenant_id, reference_type, reference_id, predicted_loss_prob, predicted_penalty_amount, ai_confidence, risk_factors, mitigation_strategy) VALUES
  (
    'fef75000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'INVESTIGATION',
    'fef75000-0000-0000-0000-000000000001',
    65.00,
    50000000.00,
    88.50,
    ARRAY['Sektörde benzer soruşturmalarda ceza uygulandı', 'İç yazışmalarda agresif fiyatlama beyanları bulundu', 'Pazar payının büyüklüğü nedeniyle katsayı artışı'],
    'Rekabet Kurumu uzlaşma ve aktif işbirliği (Leniency) mekanizmasından yararlanılarak cezada %25 indirim talep edilmesi.'
  ),
  (
    'fef75000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'CASE',
    'cafe7500-0000-0000-0000-000000000001',
    85.00,
    12500000.00,
    92.00,
    ARRAY['Sözleşmede yer alan açık fesih tazminat maddesi', 'Bankanın fesih ihtarnamesindeki şekil eksikliği'],
    'Davacının talep ettiği tutar üzerinden %100 karşılık (provision) ayrılması ve temyiz aşamasında uzlaşma (sulh) aranması.'
  )
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- WAVE 79 SEED: Zakat Ledger & Participation ESG Auditor
-- =============================================================================

INSERT INTO public.corporate_zakat_obligations (id, tenant_id, fiscal_year, calculation_method, eligible_assets, deductible_liabilities, net_zakat_base, zakat_rate, calculated_zakat, approved_by_shariah_board, status) VALUES
  (
    'faf79000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    2025,
    'Net Assets',
    1550000000.00,
    350000000.00,
    1200000000.00,
    2.50,
    30000000.00,
    true,
    'Paid'
  ),
  (
    'faf79000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    2026,
    'Net Invested Funds',
    1850000000.00,
    420000000.00,
    1430000000.00,
    2.577, -- Miladi yıla göre hesaplama (AAOIFI Standard)
    36851100.00,
    false,
    'Pending Approval'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.charity_disbursements (id, tenant_id, obligation_id, fund_type, beneficiary_name, disbursement_date, amount, transaction_ref, impact_category, status) VALUES
  (
    'cfaf7900-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'faf79000-0000-0000-0000-000000000001',
    'Zakat',
    'Kızılay Afet Fonu',
    '2026-01-15',
    15000000.00,
    'TRX-ZAKAT-2025-01',
    'Afet Yardımı',
    'Completed'
  ),
  (
    'cfaf7900-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'faf79000-0000-0000-0000-000000000001',
    'Zakat',
    'Darüşşafaka Eğitim Kurumları',
    '2026-01-20',
    15000000.00,
    'TRX-ZAKAT-2025-02',
    'Eğitim',
    'Completed'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.non_compliant_income (id, tenant_id, income_source, detection_date, amount, justification, purification_status, disbursement_id) VALUES
  (
    'fcf79000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Kurumsal Kredi Gecikme Cezası',
    '2026-02-10',
    450000.00,
    'X Firmasının taksit ertelemesi nedeniyle tahakkuk eden gecikme cezası iradı (Late Payment Penalty). Faiz hükmündedir.',
    'Pending',
    NULL
  ),
  (
    'fcf79000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Hata Kaynaklı Nostro Faiz Geliri',
    '2025-12-05',
    125000.00,
    'Yurtdışı muhabir banka hesabında hafta sonu kalan bakiye üzerinden tahakkuk edilen gayri-İslami getiri.',
    'Purified',
    NULL -- Gerçekte bir disbursement_id olmalı ama örnek sadeleştirmesi
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 83 SEED: Shadow Board & AI Strategy Simulator
-- =============================================================================

INSERT INTO public.simulated_strategies (id, tenant_id, strategy_name, description, simulation_date, capital_allocation, status) VALUES
  (
    'fff83000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Tarım Kredilerinde Büyüme (Q3-Q4)',
    'İklim krizi beklentileri doğrultusunda çiftçilere sağlanan uzun vadeli tarım kredilerinde agresif hacim artırma senaryosu.',
    '2026-03-05',
    350.00,
    'Completed'
  ),
  (
    'fff83000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Yurtdışı Şube Ağı Genişlemesi (MENA)',
    'Birleşik Arap Emirlikleri ve Suudi Arabistan bölgelerinde eş zamanlı fiziki şube ve dijital on-boarding açılımı.',
    '2026-03-06',
    1200.00,
    'Simulating'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.strategy_risk_scores (id, tenant_id, strategy_id, risk_category, projected_impact, impact_direction, confidence_score) VALUES
  (
    'fff83000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'fff83000-0000-0000-0000-000000000001',
    'NPL Riski (Takipteki Alacaklar)',
    12.50,
    'Negative',
    89.00
  ),
  (
    'fff83000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'fff83000-0000-0000-0000-000000000001',
    'Sektörel Kârlılık Oranı',
    4.20,
    'Positive',
    75.00
  ),
  (
    'fff83000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'fff83000-0000-0000-0000-000000000001',
    'Karbon Ayak İzi Uyumu (ESG)',
    -2.00,
    'Neutral',
    60.00
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.ai_board_responses (id, tenant_id, strategy_id, avatar_role, avatar_name, response, sentiment) VALUES
  (
    'afb83000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'fff83000-0000-0000-0000-000000000001',
    'Gölge Risk Komitesi',
    'Sentinel RiskEngine v4',
    'Kuraklık verilerindeki sapmalar incelendi. İklim krizinin gecikmeli etkisiyle hasat döngülerinin kırılma ihtimali yüksek. Model, bu bölgedeki NPL (Batık Kredi) riskinin mevcut tahminlerden %12 ila %15 daha fazla olabileceğini öngörüyor.',
    'Negative'
  ),
  (
    'afb83000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'fff83000-0000-0000-0000-000000000001',
    'Gölge Satış ve Büyüme Komitesi',
    'Sentinel SalesMatrix',
    'Ancak hükümetin açıkladığı uzun vadeli tarım subvansiyon teşvikleri (TKDK destekleri) temerrüt ihtimalini ciddi oranda hedge edecektir. Rakiplerden pazar payı çalmak için ideal bir zaman aralığındayız.',
    'Positive'
  ),
  (
    'afb83000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'fff83000-0000-0000-0000-000000000001',
    'Gölge Yönetim Kurulu Başkanı',
    'Sentinel ChairmanX',
    'Satış tarafının teşvik beklentisi mantıklı olsa da, risk motorunun NPL uyarısını göz ardı edemeyiz. Kararım: Krediler onaylansın, fakat %30''luk dilimi Sendikasyon poliçesi (Risk Sigortası) kapsamına alınarak execute edilsin.',
    'Cautious'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 71 SEED: BoD Evaluation & Skill Matrix
-- =============================================================================

-- 1. BOARD MEMBERS
INSERT INTO public.board_members
  (id, full_name, role_title, is_independent, status)
VALUES
  ('bfd00000-0000-0000-0000-000000000001', 'Ahmet Yılmaz', 'Yönetim Kurulu Başkanı', false, 'ACTIVE'),
  ('bfd00000-0000-0000-0000-000000000002', 'Ayşe Demir', 'Bağımsız YK Üyesi (Denetim Komitesi Başkanı)', true, 'ACTIVE'),
  ('bfd00000-0000-0000-0000-000000000003', 'Mehmet Öztürk', 'Yönetim Kurulu Üyesi (IT Odaklı)', false, 'ACTIVE'),
  ('bfd00000-0000-0000-0000-000000000004', 'Zeynep Kaya', 'Bağımsız YK Üyesi (Risk Komitesi)', true, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 2. SKILL EVALUATIONS
INSERT INTO public.skill_evaluations
  (id, member_id, skill_category, score, evaluator_note)
VALUES
  -- Ahmet Yılmaz (Başkan - Finans ve Strateji)
  (gen_random_uuid(), 'bfd00000-0000-0000-0000-000000000001', 'Finansal Yönetim', 9, 'Yüksek tecrübe.'),
  (gen_random_uuid(), 'bfd00000-0000-0000-0000-000000000001', 'Kurumsal Strateji', 10, 'Vizyoner.'),
  (gen_random_uuid(), 'bfd00000-0000-0000-0000-000000000001', 'Siber Güvenlik', 5, 'Orta düzey farkındalık.'),
  (gen_random_uuid(), 'bfd00000-0000-0000-0000-000000000001', 'ESG ve Sürdürülebilirlik', 7, 'Gelişen anlayış.'),
  (gen_random_uuid(), 'bfd00000-0000-0000-0000-000000000001', 'Mevzuat ve Uyum', 8, 'Güçlü.'),

  -- Ayşe Demir (Denetim - Mevzuat)
  (gen_random_uuid(), 'bfd00000-0000-0000-0000-000000000002', 'Finansal Yönetim', 8, 'Denetim altyapısı sağlam.'),
  (gen_random_uuid(), 'bfd00000-0000-0000-0000-000000000002', 'Kurumsal Strateji', 7, 'Odak'),
  (gen_random_uuid(), 'bfd00000-0000-0000-0000-000000000002', 'Siber Güvenlik', 6, 'İyileştirmeye açık.'),
  (gen_random_uuid(), 'bfd00000-0000-0000-0000-000000000002', 'ESG ve Sürdürülebilirlik', 8, ''),
  (gen_random_uuid(), 'bfd00000-0000-0000-0000-000000000002', 'Mevzuat ve Uyum', 10, 'Otorite statüsünde.'),

  -- Mehmet Öztürk (IT Odaklı)
  (gen_random_uuid(), 'bfd00000-0000-0000-0000-000000000003', 'Finansal Yönetim', 6, 'Geliştirilebilir.'),
  (gen_random_uuid(), 'bfd00000-0000-0000-0000-000000000003', 'Kurumsal Strateji', 8, 'Dijital strateji lideri.'),
  (gen_random_uuid(), 'bfd00000-0000-0000-0000-000000000003', 'Siber Güvenlik', 9, 'Siber Güvenlik Vizyon Skoru: 9/10'),
  (gen_random_uuid(), 'bfd00000-0000-0000-0000-000000000003', 'ESG ve Sürdürülebilirlik', 6, ''),
  (gen_random_uuid(), 'bfd00000-0000-0000-0000-000000000003', 'Mevzuat ve Uyum', 7, 'KVKK/GDPR uzmanlığı.'),

  -- Zeynep Kaya (Risk Komitesi - ESG Odaklı)
  (gen_random_uuid(), 'bfd00000-0000-0000-0000-000000000004', 'Finansal Yönetim', 8, ''),
  (gen_random_uuid(), 'bfd00000-0000-0000-0000-000000000004', 'Kurumsal Strateji', 8, ''),
  (gen_random_uuid(), 'bfd00000-0000-0000-0000-000000000004', 'Siber Güvenlik', 7, 'Modern risk mimarisi.'),
  (gen_random_uuid(), 'bfd00000-0000-0000-0000-000000000004', 'ESG ve Sürdürülebilirlik', 10, 'Yeşil Finans lideri.'),
  (gen_random_uuid(), 'bfd00000-0000-0000-0000-000000000004', 'Mevzuat ve Uyum', 9, 'Önleyici uyum kültürü.')
ON CONFLICT (id) DO NOTHING;

-- 3. BOARD EFFECTIVENESS SCORES
INSERT INTO public.board_effectiveness_scores
  (id, evaluation_period, category, average_score, findings)
VALUES
  (gen_random_uuid(), '2025-H2', 'Karar Alma Kalitesi ve Hızı', 8.4, 'Kriz anlarında hızlı aksiyon.'),
  (gen_random_uuid(), '2025-H2', 'Çeşitlilik (Diversity) ve Kapsayıcılık', 9.0, 'Mükemmel cinsiyet ve mesleki dağılım.'),
  (gen_random_uuid(), '2025-H2', 'Teknoloji ve Dijitalleşme Vizyonu', 7.2, 'BT komitelerinin YK sunumları sıklaştırılmalı.')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 74 SEED: Auditor Well-Being & Burnout Predictor
-- =============================================================================

INSERT INTO public.auditor_workload_logs (id, tenant_id, auditor_id, auditor_name, period, total_projects, available_hours, logged_hours, travel_days, complexity_factor) VALUES
  (
    'aff74000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'fff00000-0000-0000-0000-000000000001',
    'Ahmet Yılmaz (Kıdemli Müfettiş A)',
    '2026-Q1',
    4,
    480,  -- 3 ay x 160 saat
    672,  -- 40% Fazla Mesai (672 = 480 * 1.4)
    25,   -- Yoğun Seyahat
    1.4   -- Yüksek Zorluk
  ),
  (
    'aff74000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'fff00000-0000-0000-0000-000000000002',
    'Büşra Demir (Müfettiş)',
    '2026-Q1',
    2,
    480,
    490,  -- Normal sınırlarda
    5,
    1.0
  ),
  (
    'aff74000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'fff00000-0000-0000-0000-000000000003',
    'Can Öztürk (BT Müfettişi)',
    '2026-Q1',
    3,
    480,
    580,  -- %20 Fazla Mesai
    10,
    1.2
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.burnout_risk_scores (id, tenant_id, auditor_id, auditor_name, department, risk_score, overtime_percentage, risk_status, ai_recommendation) VALUES
  (
    'bff74000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'fff00000-0000-0000-0000-000000000001',
    'Ahmet Yılmaz (Kıdemli Müfettiş A)',
    'Şube Denetimleri',
    88.5,
    40.0,
    'CRITICAL',
    'Son 2 Aydır Fazla Mesai: %40. Seyahat gün sayısının yüksekliği (25 gün) mental yorgunluğu artırıyor. Proje atamalarının durdurulması ve minimum 1 hafta zorunlu izin önerilir.'
  ),
  (
    'bff74000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'fff00000-0000-0000-0000-000000000002',
    'Büşra Demir (Müfettiş)',
    'Genel Müdürlük Denetimleri',
    22.0,
    2.1,
    'NORMAL',
    'İş-yaşam dengesi sağlıklı aralıklarda. Mevcut proje temposu korunabilir.'
  ),
  (
    'bff74000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'fff00000-0000-0000-0000-000000000003',
    'Can Öztürk (BT Müfettişi)',
    'Bilgi Sistemleri Denetimi',
    65.0,
    20.8,
    'ELEVATED',
    'Aşırı mesai eğilimi başlamış durumda (%20 sınırı aşıldı). Proje sayısının önümüzdeki ay 3''ten 2''ye düşürülmesi tavsiye edilir.'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 72 SEED: Shadow IT & Shadow AI Hunter
-- =============================================================================

-- 1. shadow_it_assets — İzinsiz Uygulamalar
INSERT INTO public.shadow_it_assets (id, tenant_id, app_name, category, risk_score, risk_level, active_users_count, total_traffic_mb, status) VALUES
  (
    'ffa00000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'DeepL Translator',
    'Generative AI',
    85.50,
    'high',
    142,
    5840.50,
    'discovered'
  ),
  (
    'ffa00000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'WeTransfer',
    'Cloud Storage',
    95.00,
    'critical',
    28,
    145000.00,
    'blocked'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. unauthorized_ai_logs — İzinsiz Yapay Zeka Trafiği ve Sızıntı Alarmları
INSERT INTO public.unauthorized_ai_logs (id, tenant_id, asset_id, device_ip, user_email, ai_service_name, payload_size_bytes, alert_type, severity, action_taken, description) VALUES
  (
    'aff00000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'ffa00000-0000-0000-0000-000000000001',
    '10.55.12.88',
    'hakan.y@sentinel.bank',
    'DeepL (Web)',
    52428800, -- 50 MB
    'data_exfiltration_risk',
    'critical',
    'alerted',
    'Kurumsal Veri Sızıntısı Şüphesi: Kurum dışı IP adresine (DeepL API) tek seferde 50MB büyüklüğünde metin/dosya verisi gönderildi. Muhtemel sözleşme veya müşteri verisi çevirisi yapılıyor olabilir.'
  ),
  (
    'aff00000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    NULL,
    '10.33.5.101',
    'dev.team@sentinel.bank',
    'ChatGPT (OpenAI API)',
    1048576, -- 1MB
    'policy_violation',
    'high',
    'blocked_by_proxy',
    'İzinsiz Kod Gönderimi: Proxy üzerinden doğrudan OpenAI API endpointine kaynak kodu (Source Code) upload denemesi yapıldı ve Firewall tarafından bloklandı.'
  )
ON CONFLICT (id) DO NOTHING;



-- ============================================================
-- Wave 73 Seed: Reputational Risk & Sentiment Oracle
-- Sosyal Medya Dinleme Logları ve İtibar Krizi Alarmları
-- ============================================================

-- Duygu Analizi / Sosyal Medya Dinleme Logları
INSERT INTO social_sentiment_feeds (
  source_platform, author_handle, content_snippet,
  sentiment_type, sentiment_score, impact_reach, target_entity, is_flagged, published_at
) VALUES
  (
    'X', '@TechGuruTR', 
    'Sentinel Bank Mobil şubesi yine çöktü. 2 saattir işlem yapamıyorum. Yazıklar olsun! #sentinelbank #çöktü',
    'NEGATIVE', 15, 45000, 'Mobil Şube', TRUE, '2026-04-03 14:15:00+03'
  ),
  (
    'FORUM', 'EksiSozluk_User', 
    'Dün geceki hesaptan para çekilme olayları doğru galiba. Bankadan açıklama bekliyoruz ama ses yok. Paralar gitti mi?',
    'NEGATIVE', 20, 150000, 'Güvenlik / Veri Mahremiyeti', TRUE, '2026-04-03 15:30:00+03'
  ),
  (
    'LINKEDIN', 'Ahmet Yilmaz (CFO)', 
    'Sentinel Bank ile gerçekleştirdiğimiz kurumsal finansman anlaşması şirketimize büyük ivme kazandıracak. Teşekkürler.',
    'POSITIVE', 95, 12000, 'Kurumsal Krediler', FALSE, '2026-04-02 09:00:00+03'
  ),
  (
    'NEWS', 'Finans Gündem', 
    'BDDK, Sentinel Bank''ın son çeyrekteki yüksek kârlılığını işaret eden raporunu yayımladı.',
    'POSITIVE', 80, 500000, 'Kurumsal İtibar', FALSE, '2026-04-01 10:00:00+03'
  ),
  (
    'X', '@Troller101', 
    'Bankanın CEO''su mafya ile anlaşıyormuş yalan dolan her şey.',
    'TOXIC', 5, 200, 'CEO / Yönetim Kurulu', TRUE, '2026-04-04 01:00:00+03'
  )
ON CONFLICT DO NOTHING;

-- İtibar Krizi Alarmları (Sentiment Kahini Çıktıları)
INSERT INTO reputation_crisis_alerts (
  alert_title, severity, negative_ratio_pct, total_mentions,
  crisis_topic, action_plan, status, assigned_to, alert_date
) VALUES
  (
    'X Platformu Trend Alert: Mobil Bankacılık Çöküntüsü', 'HIGH',
    85.50, 4200, 'Mobil Şube Altyapı Sorunu',
    'Kurumsal İletişim departmanı X üzerinden resmi özür metni yayınlayacak. Operasyon birimi SLA raporu sunacak.',
    'PR_RESPONSE_REQUIRED', 'Zeynep K. (Kurumsal İletişim Md.)', '2026-04-03 16:00:00+03'
  ),
  (
    'Söylenti Tespiti: Veri İhlali İddiası', 'CRITICAL',
    92.00, 15000, 'Güvenlik / Veri Mahremiyeti',
    'Acil Durum Müdahale Ekibi toplandı. İddialar asılsız. Siber İstihbarat (CTI) raporu eşliğinde BDDK bilgilendirilecek.',
    'MONITORING', 'Caner T. (CISO)', '2026-04-03 18:30:00+03'
  )
ON CONFLICT DO NOTHING;

-- =============================================================================
-- WAVE 76 SEED: Apex Dashboard (God's Eye View)
-- =============================================================================

INSERT INTO public.apex_executive_summaries
  (id, snapshot_date, grc_health_score, trend_direction, active_critical_risks, open_incidents, compliance_ratio, executive_message)
VALUES
  (gen_random_uuid(), CURRENT_DATE - INTERVAL '12 days', 815, 'STABLE', 5, 2, 98.40, 'Stabil görünüm. Yaptırım haritası izleniyor.'),
  (gen_random_uuid(), CURRENT_DATE - INTERVAL '11 days', 820, 'UP', 4, 2, 98.50, 'Regülatif güncellemeler sisteme entegre edildi.'),
  (gen_random_uuid(), CURRENT_DATE - INTERVAL '10 days', 821, 'UP', 4, 1, 98.50, 'BT altyapı güçlendirmeleri olumlu yansıdı.'),
  (gen_random_uuid(), CURRENT_DATE - INTERVAL '9 days', 818, 'DOWN', 5, 3, 98.10, 'X Platformu söylentileri (False Positive) geçici dalgalanma yarattı.'),
  (gen_random_uuid(), CURRENT_DATE - INTERVAL '8 days', 825, 'UP', 4, 2, 98.60, 'Sosyal medya krizi bertaraf edildi. İtibar skorları yükselişte.'),
  (gen_random_uuid(), CURRENT_DATE - INTERVAL '7 days', 830, 'UP', 3, 2, 98.90, 'Yönetim Kurulu 1. Çeyrek toplantısı tamamlandı. Stratejik CTI bütçesi onaylandı.'),
  (gen_random_uuid(), CURRENT_DATE - INTERVAL '6 days', 835, 'UP', 2, 1, 99.20, 'Siber İstihbarat zafiyet yamaları globalde devrede.'),
  (gen_random_uuid(), CURRENT_DATE - INTERVAL '5 days', 836, 'UP', 2, 1, 99.20, 'Olağan operasyon akışı.'),
  (gen_random_uuid(), CURRENT_DATE - INTERVAL '4 days', 840, 'UP', 1, 0, 99.70, 'Neredeyse kusursuz operasyon. Greenwashing riskleri izleniyor.'),
  (gen_random_uuid(), CURRENT_DATE - INTERVAL '3 days', 841, 'UP', 1, 0, 99.70, 'Uyum departmanı PBC paketlerini kapattı.'),
  (gen_random_uuid(), CURRENT_DATE - INTERVAL '2 days', 839, 'DOWN', 2, 1, 99.50, 'API Gateway Limit (Rate) aşımı alarmları inceleniyor.'),
  (gen_random_uuid(), CURRENT_DATE - INTERVAL '1 day', 840, 'UP', 2, 1, 99.50, 'API anomalisine müdahale edildi. Engelleme (Block) aktif.'),
  (gen_random_uuid(), CURRENT_DATE, 842, 'STABLE', 1, 0, 99.80, 'Kurumsal GRC Sağlık Skoru: 842/1000 (Stabil, Ancak Jeopolitik Risk Yüksek)')
ON CONFLICT (tenant_id, snapshot_date) DO NOTHING;

-- ============================================================
-- Wave 77 Seed: IoT Vault & Cyber-Physical Auditor
-- Isı/Nem Sensörleri, Biyometrik Erişimler ve İhlal Alarmları
-- ============================================================

-- IoT Sensör Okumaları
INSERT INTO iot_sensors (
  sensor_uuid, location_name, sensor_type,
  temperature_c, humidity_pct, door_status, motion_detected, is_online, battery_pct
) VALUES
  ('SENS-IST-DC-01', 'Genel Müdürlük - Sistem Odası', 'TEMP_HUMIDITY', 21.5, 45, NULL, NULL, TRUE, 100),
  ('SENS-IST-DC-02', 'Şube 342 - Sistem Odası', 'TEMP_HUMIDITY', 34.2, 82, NULL, NULL, TRUE, 85),
  ('SENS-IST-DC-03', 'Şube 342 - Sistem Odası Kapı', 'DOOR_CONTACT', NULL, NULL, 'OPEN', TRUE, TRUE, 90),
  ('SENS-ANK-VLT-01', 'Ankara Şube - Kasa Dairesi', 'MOTION', NULL, NULL, 'CLOSED', FALSE, TRUE, 98),
  ('SENS-ANK-VLT-SMK', 'Ankara Şube - Kasa Dairesi', 'SMOKE', NULL, NULL, NULL, FALSE, TRUE, 100)
ON CONFLICT (sensor_uuid) DO NOTHING;

-- Biyometrik / Kartlı Geçiş Logları
INSERT INTO vault_access_logs (
  location_name, access_point, personnel_id, personnel_name,
  access_status, auth_method, access_time
) VALUES
  ('Genel Müdürlük - Sistem Odası', 'Turnike 1', 'P-1204', 'Ahmet Yılmaz (Sistem Yöneticisi)', 'GRANTED', 'BIOMETRIC', '2026-04-05 08:30:00+03'),
  ('Şube 342 - Sistem Odası', 'Güvenlik Kapısı', 'UNKNOWN', 'Bilinmeyen Şahıs', 'DENIED', 'RFID_CARD', '2026-04-05 09:12:00+03'),
  ('Ankara Şube - Kasa Dairesi', 'Kasa Girişi', 'P-4492', 'Ayşe Demir (Şube Müdürü)', 'GRANTED', 'BIOMETRIC', '2026-04-05 10:00:00+03')
ON CONFLICT DO NOTHING;

-- Fiziksel Güvenlik Alarmları (Cyber-Physical Breaches)
INSERT INTO physical_breaches (
  breach_code, location_name, severity, breach_type,
  description, trigger_sensor, status, event_time
) VALUES
  (
    'PHY-2026-001', 'Şube 342 - Sistem Odası', 'CRITICAL', 'ENVIRONMENTAL',
    'Şube 342 Sistem Odası Isı %80''i aştı. Sunucu donanımları erime tehlikesi altında. İklimlendirme (HVAC) sistem arızası.',
    'SENS-IST-DC-02', 'OPEN', '2026-04-05 09:15:00+03'
  ),
  (
    'PHY-2026-002', 'Şube 342 - Sistem Odası', 'HIGH', 'UNAUTHORIZED_ACCESS',
    'Zorlama Girişim - Tanımsız RFID kart master kapıda üst üste 3 kez okutuldu. Sistem odası kapı sensörü şu an (AÇIK) durumunda.',
    'SENS-IST-DC-03', 'INVESTIGATING', '2026-04-05 09:12:05+03'
  ),
  (
    'PHY-2026-003', 'Ankara Şube - Kasa Dairesi', 'LOW', 'SENSOR_OFFLINE',
    'Hareket sensörü 3 saattir veri göndermiyor. Pil değişimi veya ağ kontrolü gerekiyor.',
    'SENS-ANK-VLT-01', 'RESOLVED', '2026-04-04 14:00:00+03'
  )
ON CONFLICT (breach_code) DO NOTHING;

-- =============================================================================
-- WAVE 78 SEED: Deepfake & Synthetic Identity Shield
-- =============================================================================

-- 1. biometric_audits
INSERT INTO public.biometric_audits (id, tenant_id, channel, customer_id, session_id, liveliness_score, voice_match_score, face_match_score, overall_confidence, status) VALUES
  (
    'bff00000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Video_Call',
    'CUST-8812',
    'VC-2026-8812-A1',
    42.50,
    98.00,
    15.00,
    35.00,
    'failed'
  ),
  (
    'bff00000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Mobile_App',
    'CUST-9923',
    'MOB-2026-9923-B2',
    95.00,
    96.50,
    98.00,
    96.50,
    'passed'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. deepfake_alerts
INSERT INTO public.deepfake_alerts (id, tenant_id, audit_id, alert_type, deepfake_probability, detected_artifacts, severity, action_taken, description) VALUES
  (
    'dfa00000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'bff00000-0000-0000-0000-000000000001',
    'Face_Swap',
    98.50,
    '{"lip_sync_error": true, "unnatural_blink_rate": true, "audio_frequency_jump": 0.85}',
    'critical',
    'session_terminated',
    'Görüntülü Çağrı Merkezi - Müşteri (CEO) profiliyle yüksek tutarlı para transferi girişimi. Ses klonlaması oldukça başarılı (Voice Match %98) ancak görüntüde bariz face-swap (Yüz Değiştirme) anomalileri tespit edildi. İşlem otomatik durduruldu.'
  )
ON CONFLICT (id) DO NOTHING;

-- 3. kyc_synthetic_logs
INSERT INTO public.kyc_synthetic_logs (id, tenant_id, applicant_name, national_id, risk_factors, synthetic_risk_score, decision) VALUES
  (
    'ffc00000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Mehmet Yılmaz',
    '12345678901',
    '{"ghost_address": true, "reused_phone": true, "credit_history_jump": true}',
    88.00,
    'reject'
  ),
  (
    'ffc00000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Ayşe Demir',
    '98765432109',
    '{"device_velocity": false}',
    12.00,
    'approve'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 80 SEED: Insider Trading & Executive PAD Radar
-- =============================================================================

-- 1. restricted_trading_lists (Yasaklı Hisseler)
INSERT INTO public.restricted_trading_lists (id, tenant_id, ticker, company_name, restriction_reason, added_by) VALUES
  (
    'fff80000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'XYZ',
    'XYZ Teknoloji A.Ş.',
    'Menfi Kredi Kararı: Firmaya ait 50M TL kredi yenileme talebi reddedilmiştir. İçsel bilgi oluşmuştur.',
    'Kurumsal Krediler Komitesi'
  ),
  (
    'fff80000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'ABC',
    'ABC Enerji A.Ş.',
    'M&A Süreci: Bankamız M&A danışmanlığını yürütmektedir.',
    'Yatırım Bankacılığı Grubu'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. personal_account_dealings (Personel İşlem Bildirimleri)
INSERT INTO public.personal_account_dealings (id, tenant_id, employee_id, employee_name, department, ticker, company_name, transaction_type, quantity, price, total_value, trade_date, status) VALUES
  (
    'fad80000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'EMP-1045',
    'Ahmet Yılmaz',
    'Krediler Tahsis Direktörlüğü',
    'XYZ',
    'XYZ Teknoloji A.Ş.',
    'SELL',
    50000,
    145.50,
    7275000.00,
    now() - INTERVAL '2 days',
    'FLAGGED'
  ),
  (
    'fad80000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'EMP-2098',
    'Büşra Kaya',
    'Hazine Yönetimi',
    'THYAO',
    'Türk Hava Yolları',
    'BUY',
    1000,
    305.00,
    305000.00,
    now() - INTERVAL '5 days',
    'APPROVED'
  )
ON CONFLICT (id) DO NOTHING;

-- 3. insider_alerts (Çakışma / Uyarı Kayıtları)
INSERT INTO public.insider_alerts (id, tenant_id, pad_id, employee_name, ticker, alert_type, severity, description, status) VALUES
  (
    'ffa80000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'fad80000-0000-0000-0000-000000000001',
    'Ahmet Yılmaz',
    'XYZ',
    'EXECUTIVE_CONFLICT',
    'CRITICAL',
    'Krediler Direktörü Ahmet Y., kredi red kararı (Menfi) verilen XYZ Teknoloji A.Ş. hisselerini (Açıklanmamış İçsel Bilgi) agresif miktarda (50.000 lot) açığa satmıştır. İşlem Restricted Trading List ile %100 örtüşmektedir. SPK bildirim eşiği aşılmıştır.',
    'OPEN'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 81 SEED: Regulatory Lobbying AI
-- =============================================================================

-- 1. regulatory_drafts
INSERT INTO public.regulatory_drafts (id, tenant_id, regulator_name, draft_title, publication_date, deadline_date, status) VALUES
  (
    'fef00000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'BDDK',
    'Bilgi Sistemleri Tebliği Yönetmeliği (Taslak Değişiklik)',
    '2026-04-01',
    '2026-04-30',
    'OPEN'
  ),
  (
    'fef00000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'SPK',
    'Kurumsal Yönetim İlkeleri Revizyonu ve Sürdürülebilirlik Kriterleri (Taslak)',
    '2026-03-15',
    '2026-04-15',
    'OPEN'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. bank_feedback_reports
INSERT INTO public.bank_feedback_reports (id, tenant_id, draft_id, report_title, report_text, generated_by_ai, approval_status) VALUES
  (
    'fed00000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'fef00000-0000-0000-0000-000000000001',
    'Katılım Bankaları Birliği Adına Hazırlanan Otomatik İtiraz Görüşü',
    '<strong>İLGİ:</strong> BDDK Kurumumuza sunulan Bilgi Sistemleri Yönetmeliği 15. Madde Taslağı Hakkında Değerlendirme.<br/><br/><strong>AÇIKLAMA (LLM Sentez):</strong> Önerilen Cloud taslak değişiklikleri, Tier 1 hizmetlerin bulut tabanlı hibrit sisteme (Public Cloud) tam geçişini sınırlandırmaktadır. Bu durum maliyet analizlerimizi ve esneklik (Scalability) kapasitemizi %34 oranında kısıtlayacaktır. <u>Görüşümüz şudur ki
ON CONFLICT DO NOTHING;
</u> verinin kriptografik mülkiyeti bankada (On-Premise HSM) kalması kaydıyla, Public Cloud izninin Katılım Bankalarına özel esnetilmesini talep eder, bilgilerinize arz ederiz.',
    true,
    'DRAFT'
  ),
  (
    'fed00000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'fef00000-0000-0000-0000-000000000002',
    'Yönetim Kurulu Bağımsızlık Oranı (SPK Sürdürülebilirlik Katkısı)',
    NULL,
    true,
    'DRAFT'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 82 SEED: Immutable Evidence Vault
-- =============================================================================

-- 1. immutable_evidences
INSERT INTO public.immutable_evidences (id, tenant_id, evidence_name, category, uploader_email, file_size_bytes, file_mime_type, original_hash, ipfs_cid, blockchain_network, tx_hash, is_verified) VALUES
  (
    'efd00000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Şüpheli İşlem Dekontu (PDF)',
    'Fraud',
    'denetim@sentinel.bank',
    1245000,
    'application/pdf',
    '8f43b35064e43ab7eebd2e9fcf0e5138bc4f4f728dc9053cc2debe1ea32a514d',
    'QmYKJQwqJxwLg1gYfA9R7XZUo3K1zJ7bXZUo3K1zJ7b',
    'Ethereum_Quorum',
    '0xabc1234567890defabcdef1234567890defabcde1234567890defabcdef123',
    true
  ),
  (
    'efd00000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Çeyreklik Yönetim Kurulu Onaylı Denetim Raporu',
    'Audit_Report',
    'cae@sentinel.bank',
    4560000,
    'application/pdf',
    'f3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4',
    NULL,
    'Polygon',
    NULL,
    false
  )
ON CONFLICT (id) DO NOTHING;

-- 2. blockchain_tx_logs
INSERT INTO public.blockchain_tx_logs (id, tenant_id, evidence_id, action, tx_status, block_number, gas_used, executed_by) VALUES
  (
    'bff00000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'efd00000-0000-0000-0000-000000000001',
    'SEAL_EVIDENCE',
    'CONFIRMED',
    15500123,
    0.012,
    'Sentinel_SmartContract_Relayer'
  ),
  (
    'bff00000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'efd00000-0000-0000-0000-000000000002',
    'SEAL_EVIDENCE',
    'PENDING',
    NULL,
    NULL,
    'CAE_Wallet_0x11'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WAVE 85 SEED: Employee Stress & Fraud Correlation Engine
-- =============================================================================

-- 1. employee_financial_stress (Anonimleştirilmiş finansal stres indikatörleri)
INSERT INTO public.employee_financial_stress (id, tenant_id, anon_employee_id, department, job_title, salary_garnishment, credit_score_drop, lifestyle_mismatch, financial_stress_score) VALUES
  (
    'eff85000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'EMP-1042',
    'Hazine Yönetimi',
    'Kıdemli Fon Yöneticisi',
    true,      -- İcra var
    true,      -- Kredi skoru düştü
    false,
    85.50
  ),
  (
    'eff85000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'EMP-8831',
    'Bireysel Krediler',
    'Kredi Onay Yetkilisi',
    false,
    false,
    true,      -- Sosyal medya ihbarı (Maaş / Araç uyumsuzluğu)
    60.00
  )
ON CONFLICT (id) DO NOTHING;

-- 2. fraud_triangle_scores (Suiistimal Üçgeni)
INSERT INTO public.fraud_triangle_scores (id, tenant_id, anon_employee_id, pressure_score, opportunity_score, rationalization_score, total_fraud_risk) VALUES
  (
    'fff85000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'EMP-1042',
    85.50,     -- Yüksek Baskı (İcra)
    95.00,     -- Yüksek Fırsat (Hazine Yetkileri limit artışı)
    40.00,     -- Düşük/Orta Haklı Çıkarma
    82.50      -- Kritik Ağırlıklı Risk
  ),
  (
    'fff85000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'EMP-8831',
    30.00,
    75.00,     -- Kredi Onay Fırsatı
    60.00,     -- Kötü performans değerlendirmesi / İK zıtlaşması
    52.00
  )
ON CONFLICT (id) DO NOTHING;

-- 3. hr_correlation_alerts (Yapay Zeka Korelasyon Alarmları)
INSERT INTO public.hr_correlation_alerts (id, tenant_id, anon_employee_id, alert_severity, fraud_vector, description, status) VALUES
  (
    'fca85000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'EMP-1042',
    'CRITICAL',
    'FON_ZIMMET_RISKI_EMBEZZLEMENT',
    'Anonim Personel ID EMP-1042. Maaşında banka dışı 3. şahıs icra kesintisi (Finansal Baskı) başlamış bir personelin, aynı dönemde Hazine Fon Yönetim limitlerinin (Fırsat) arttığı tespit edildi. Çok Yüksek Suiistimal (Zimmet) ihtimali.',
    'OPEN'
  ),
  (
    'fca85000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'EMP-8831',
    'MEDIUM',
    'HAYALİ_KREDİ_RISKI_CORRUPTION',
    'Bireysel kredi tahsis onay yetkilisinin yaşam tarzı-gelir uyuşmazlığı ihbarı (Sosyal Ağ Tarama). İK performans notlarındaki kötüleşme "Haklı Çıkarma" bacağının büyümesine sebep oluyor.',
    'MONITORING'
  )
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- WAVE 84 SEED: The Hunter's Guild (Gamification System)
-- =============================================================================

-- 1. auditor_profiles (Migration uyumlu)
INSERT INTO public.auditor_profiles (user_id, title, department, cpe_credits, tenant_id) VALUES
  ('faf00000-0000-0000-0000-000000000001', 'Kıdemli Uyum Uzmanı', 'Regülasyon & Uyum', 12, '11111111-1111-1111-1111-111111111111'),
  ('faf00000-0000-0000-0000-000000000002', 'Baş Hukuk Müşaviri', 'Hukuk Müşavirliği', 15, '11111111-1111-1111-1111-111111111111'),
  ('faf00000-0000-0000-0000-000000000003', 'Kıdemli BT Denetçisi', 'Bilgi Sistemleri Denetimi', 9, '11111111-1111-1111-1111-111111111111'),
  ('faf00000-0000-0000-0000-000000000004', 'Kıdemli İç Denetçi', 'Kurumsal Denetim', 8, '11111111-1111-1111-1111-111111111111'),
  ('faf00000-0000-0000-0000-000000000005', 'Siber Savunma Mimarı', 'Siber İstihbarat (CTI)', 10, '11111111-1111-1111-1111-111111111111')
ON CONFLICT (user_id) DO NOTHING;


-- ============================================================
-- Wave 86 Seed: External Regulator Portal & Continuous Assurance
-- BDDK / TCMB Dış Denetçi Girişleri ve Paylaşılan Klasörler
-- ============================================================

-- Sürekli Güvence (Continuous Assurance) Raporu Skorları
INSERT INTO continuous_assurance_reports (
  report_code, title, category, assurance_score_pct,
  status, findings_count, is_published, generated_at
) VALUES
  ('CA-2026-Q1-CR', 'Kredi Riski (Basel IV Standardı) Güvence Skoru', 'CREDIT_RISK', 95.5, 'GREEN', 2, TRUE, '2026-04-06 09:00:00+03'),
  ('CA-2026-Q1-LQ', 'Likitide Rasyosu LCR/NSFR İzleme Raporu', 'LIQUIDITY', 88.0, 'AMBER', 5, TRUE, '2026-04-06 09:15:00+03'),
  ('CA-2026-Q1-OP', 'Operasyonel Kayıp & İhlal Yönetimi Kontrolü', 'OPERATIONAL_RISK', 98.2, 'GREEN', 0, TRUE, '2026-04-06 09:30:00+03'),
  ('CA-2026-Q1-IT', 'Bilgi Sistemleri Sızma Testi ve Zafiyet Analizi', 'IT_SECURITY', 72.4, 'RED', 14, TRUE, '2026-04-05 18:00:00+03')
ON CONFLICT (report_code) DO NOTHING;

-- Dış Denetçilerle Paylaşılan Dosyalar
INSERT INTO shared_dossiers (
  dossier_code, title, description, dossier_type,
  file_url, access_level, expires_at
) VALUES
  ('BDDK-DOS-2026-01', 'Q1 Kredi Risk Matrisi ve Maruziyet Tabloları', 'Büyük Ölçekli Kurumsal Kredi Limit Aşımları Raporu', 'AUDIT_EVIDENCE', 's3://sentinel-vault/bddk/q1-credit-risk.pdf', 'CONFIDENTIAL', '2026-06-30 23:59:59+03'),
  ('TCMB-DOS-2026-02', 'Likitide Acil Durum Eylem Planı (L-AEP)', '2026 Revize Likitide Krizi Simülasyon Senaryoları', 'POLICY_DOC', 's3://sentinel-vault/tcmb/laep-2026.pdf', 'STRICTLY_CONFIDENTIAL', NULL),
  ('KPMG-DOS-2026-03', 'Yönetim Kurulu Kararları (Q1/2026 Özeti)', 'Sermaye Artırımı ve Yeni Şube Açılış İzinleri', 'BOARD_MINUTES', 's3://sentinel-vault/kpmg/ykk-q1.pdf', 'STRICTLY_CONFIDENTIAL', '2026-12-31 23:59:59+03')
ON CONFLICT (dossier_code) DO NOTHING;

-- Murakıp / Denetçi Erişim ve İşlem Logları (Audit the Auditor)
INSERT INTO regulator_access_logs (
  regulator_name, regulator_agency, action_type, target_resource, ip_address, access_time, is_success
) VALUES
  ('Hasan B. (BDDK Murakıp)', 'BDDK', 'LOGIN', 'System Auth', '193.10.150.12', '2026-04-06 10:05:00+03', TRUE),
  ('Hasan B. (BDDK Murakıp)', 'BDDK', 'VIEW_DOSSIER', 'BDDK-DOS-2026-01 (Q1 Kredi Risk)', '193.10.150.12', '2026-04-06 10:08:24+03', TRUE),
  ('Hasan B. (BDDK Murakıp)', 'BDDK', 'DOWNLOAD_DOSSIER', 'BDDK-DOS-2026-01 (Q1 Kredi Risk)', '193.10.150.12', '2026-04-06 10:15:30+03', TRUE),
  ('Zeynep K. (KPMG Dış Denetim)', 'KPMG', 'LOGIN', 'System Auth', '212.156.90.8', '2026-04-06 11:20:00+03', TRUE),
  ('Zeynep K. (KPMG Dış Denetim)', 'KPMG', 'VIEW_DASHBOARD', 'Continuous Assurance Overview', '212.156.90.8', '2026-04-06 11:21:40+03', TRUE),
  ('Anonim (TCMB VPN)', 'TCMB', 'LOGIN', 'System Auth', '195.140.230.10', '2026-04-06 03:15:00+03', FALSE) -- Başarısız yetkisiz giriş denemesi
ON CONFLICT DO NOTHING;

-- (Mock user_profiles removed to establish Golden Thread with real users)
-- =============================================================================
-- SENTINEL V3.0 - SEED PART 5: EMPTY MODULES MOCK DATA
-- =============================================================================
-- Bu dosya bos kalan Survey, SOX, Academy, Gamification, AI Agents ve 
-- Action tablolarini doldurmak uzere hazirlanmistir.
-- =============================================================================

-- 1. SURVEYS & RESPONSES (Anketler)
INSERT INTO public.surveys (id, tenant_id, title, description, target_audience, form_schema) VALUES
  (
    '1a000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'İç Denetim Müşteri Memnuniyeti Anketi (2025Q4)',
    'Denetlenen birimlerin denetim sürecine dair geri bildirimleri.',
    'AUDITEE',
    '{"fields": [{"name":"iletisim", "type":"rating", "max":5}, {"name":"deger_katma", "type":"rating", "max":5}]}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.survey_responses (id, tenant_id, survey_id, answers, score) VALUES
  (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    '1a000000-0000-0000-0000-000000000001',
    '{"iletisim": 4, "deger_katma": 5}'::jsonb,
    4.5
  )
ON CONFLICT (id) DO NOTHING;


-- 2. SOX & RCSA (Risk ve Kontrol Özdeğerlendirme)
INSERT INTO public.sox_campaigns (id, tenant_id, title, period, status, total_controls, completed_count) VALUES
  (
    '2b000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'SOX ITGC & BP Kampanyası',
    '2026',
    'Active',
    120,
    45
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rcsa_campaigns (id, tenant_id, title, status, completion_rate, created_by) VALUES
  (
    '2c000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Bireysel Bankacılık RCSA 2026 Q1',
    'ACTIVE',
    60.00,
    'faf00000-0000-0000-0000-000000000001'
  )
ON CONFLICT (id) DO NOTHING;


-- 3. ACADEMY & TRAINING (Eğitimler)
INSERT INTO public.training_records (id, tenant_id, user_id, training_title, training_type, hours, cpe_credits) VALUES
  (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'faf00000-0000-0000-0000-000000000001',
    'Yapay Zeka Destekli Siber İstihbarat Eğitimi',
    'INTERNAL',
    12,
    15
  )
ON CONFLICT (id) DO NOTHING;


INSERT INTO public.investigations (id, tenant_id, case_number, title, status, severity, description) VALUES
  (
    '4d000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'INV-2026-001',
    'İçeriden Bilgi Sızdırma (Insider Trading) Şüphesi',
    'OPEN',
    'HIGH',
    'Şube 342 gişe görevlisinin VIP müşteri hesaplarını yetkisiz sorgulaması üzerine başlatılan soruşturma.'
  )
ON CONFLICT (id) DO NOTHING;

-- 5. AI AGENTS & LOGS
INSERT INTO public.ai_agents (id, name, codename, role, status, capabilities) VALUES
  (
    '5e000000-0000-0000-0000-000000000001',
    'Data Whisperer (Sentinel-Core)',
    'DW-CORE',
    'INVESTIGATOR',
    'IDLE',
    '{"bankacılık risk terminolojisi", "rpc analiz"}'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.agent_runs (id, agent_id, target_entity, status) VALUES
  (
    '6f000000-0000-0000-0000-000000000001',
    '5e000000-0000-0000-0000-000000000001',
    'SWIFT Anomalisi Derin Dalış',
    'SUCCESS'
  )
ON CONFLICT (id) DO NOTHING;

-- 6. ACTION WORKBENCH (Aksiyon İzleme / Uzatma Talepleri)
INSERT INTO public.action_requests (id, tenant_id, action_id, type, justification, status) VALUES
  (
    '7f000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'a8000000-0000-0000-0000-000000000001',
    'extension',
    'KVKK Veri Maskeleme Altyapısının Güncellenmesi icin ek sure ihtiyaci.',
    'pending'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SENTINEL V3.0 - GOLDEN THREAD MASTER SEED (Uçtan Uca Kesintisiz Senaryo)
-- =============================================================================

-- 1. Yıllık Denetim Planı
INSERT INTO public.audit_plans (id, tenant_id, title, period_start, period_end, status, created_by, approved_at, approved_by) VALUES
('ee000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '2026 Yıllık Denetim Planı (Golden Thread)', '2026-01-01', '2026-12-31', 'APPROVED', '00000000-0000-0000-0000-000000000001', '2026-01-15T10:00:00Z', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- 2. Audit Engagement (Görev: ENG-2026-001) - Atanan: CAE Dr. Hasan Aksoy
INSERT INTO public.audit_engagements (id, tenant_id, plan_id, entity_id, title, status, audit_type, start_date, end_date, assigned_auditor_id, risk_snapshot_score, estimated_hours, actual_hours) VALUES
('ee000000-0000-0000-0000-000000010001', '11111111-1111-1111-1111-111111111111', 'ee000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000013', 'ENG-2026-001 Kredi Tahsis Dosya İncelemesi', 'IN_PROGRESS', 'COMPREHENSIVE', '2026-03-01', '2026-04-15', '00000000-0000-0000-0000-000000000001', 85.5, 120, 45)
ON CONFLICT (id) DO NOTHING;

-- 3. Audit Findings (Bulgu) - ENG-2026-001'e ait
INSERT INTO public.audit_findings (id, engagement_id, title, severity, status, state, details, impact_score, likelihood_score, gias_category, financial_impact) VALUES
('ee000000-0000-0000-0000-000000030001', 'ee000000-0000-0000-0000-000000010001', 'Kredi Tahsis Sürecinde Limit Aşımı', 'CRITICAL', 'FINAL', 'FINAL', '{"condition": "Bireysel kredi tahsis onaylarında şube müdürü inisiyatifi ile regülatif (BDDK) limitlerin aşıldığı tespit edilmiştir.", "criteria": "BDDK Kredi Tahsis Sınırları Yönetmeliği", "cause": "Sistem üzerinde manuel override yetkisinin açık bırakılması", "consequence": "Regülatif ceza ve yasal riskler", "recommendation": "Sistem bloke kuralının devreye alınması"}'::jsonb, 5, 4, 'Compliance', 250000)
ON CONFLICT (id) DO NOTHING;

-- 4. Actions (Aksiyon) - Atanan Yetkili: Şube Müdürü Burak Yılmaz (...0011)
INSERT INTO public.actions (
  id, tenant_id, finding_id, finding_snapshot, title, description,
  original_due_date, current_due_date, status, priority
) VALUES (
  'ee000000-0000-0000-0000-000000040001',
  '11111111-1111-1111-1111-111111111111',
  'ee000000-0000-0000-0000-000000030001',
  '{"title":"Kredi Tahsis Sürecinde Limit Aşımı","severity":"CRITICAL","gias_category":"Compliance"}'::jsonb,
  'Limit Aşım Sisteminin Otomatik Bloke Edilmesi',
  'Tahsis sistemlerinde manuel inisiyatifin kaldırılarak BDDK kurallarının hard-code bloke olarak ayarlanması.',
  '2026-06-30', '2026-06-30', 'IN_PROGRESS', 'HIGH'
)
ON CONFLICT (id) DO NOTHING;

-- 5. EMPTY MODULE SEEDING (Bağlantılı Örnekler)
-- 5.1 SURVEYS (Anket - Auditee Burak Yılmaz İçin)
INSERT INTO public.surveys (id, tenant_id, title, description, target_audience, form_schema) VALUES
('ee000000-0000-0000-0000-000000050001', '11111111-1111-1111-1111-111111111111', 'İç Denetim Müşteri Memnuniyeti Anketi (ENG-2026-001)', 'Denetlenen birimlerin denetim sürecine dair geri bildirimleri.', 'AUDITEE', '{"fields": [{"name":"iletisim", "type":"rating", "max":5}, {"name":"deger_katma", "type":"rating", "max":5}]}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.survey_responses (id, tenant_id, survey_id, answers, score) VALUES
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'ee000000-0000-0000-0000-000000050001', '{"iletisim": 4, "deger_katma": 5}'::jsonb, 4.5)
ON CONFLICT (id) DO NOTHING;

-- 5.2 SOX & RCSA (Kredi Riski üzerine)
INSERT INTO public.sox_campaigns (id, tenant_id, title, period, status, total_controls, completed_count) VALUES
('ee000000-0000-0000-0000-000000060001', '11111111-1111-1111-1111-111111111111', 'Kredi Riski SOX & ITGC Kampanyası', '2026', 'Active', 120, 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rcsa_campaigns (id, tenant_id, title, status, completion_rate, created_by) VALUES
('ee000000-0000-0000-0000-000000070001', '11111111-1111-1111-1111-111111111111', 'Bireysel Bankacılık RCSA 2026', 'ACTIVE', 60.00, '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- 5.3 ACADEMY (Eğitim - Denetçi Dr. Hasan Aksoy)
INSERT INTO public.training_records (id, tenant_id, user_id, training_title, training_type, hours, cpe_credits) VALUES
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Yapay Zeka Destekli Kredi Riski Analizi', 'INTERNAL', 12, 15)
ON CONFLICT (id) DO NOTHING;

-- 5.4 INVESTIGATIONS (Ajan Senaryosu)
INSERT INTO public.investigations (id, tenant_id, case_number, title, status, severity, description) VALUES
('ee000000-0000-0000-0000-000000080001', '11111111-1111-1111-1111-111111111111', 'INV-2026-GT1', 'Kredi Limit Aşımında Şüpheli İşlem', 'OPEN', 'HIGH', 'Kadıköy şubesi tahsis yetkililerinin VIP limitlerini aştığı tespit edildi.')
ON CONFLICT (id) DO NOTHING;

-- 5.5 AI AGENTS
INSERT INTO public.ai_agents (id, name, codename, role, status, capabilities) VALUES
('ee000000-0000-0000-0000-000000090001', 'Credit Sentinel AI', 'CRED-AI', 'INVESTIGATOR', 'IDLE', '{"kredi risk analiz", "limit kontrol"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.agent_runs (id, agent_id, target_entity, status) VALUES
('ee000000-0000-0000-0000-000000100001', 'ee000000-0000-0000-0000-000000090001', 'Kredi Karar Motoru Derin Dalış', 'SUCCESS')
ON CONFLICT (id) DO NOTHING;

-- BİTTİ.

-- ==============================================================================
-- WAVE XX SEED: Gap Analysis Missing Tables
-- ==============================================================================

-- 1. stakeholders
INSERT INTO public.stakeholders (id, tenant_id, name, email, role, department) VALUES
  ('ea000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Ayşe Yılmaz', 'ayse@sentinelbank.com.tr', 'CFO', 'Finance'),
  ('ea000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Mehmet Demir', 'mehmet@sentinelbank.com.tr', 'CTO', 'IT'),
  ('ea000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Zeynep Kaya', 'zeynep@sentinelbank.com.tr', 'CRO', 'Risk')
ON CONFLICT DO NOTHING;


-- 2. data_sources
INSERT INTO public.data_sources (id, name, source_type, status, last_sync_at) VALUES
  ('eb000000-0000-0000-0000-000000000001', 'Core Banking Oracle', 'CORE_BANKING', 'ACTIVE', '2026-03-08T10:00:00Z'),
  ('eb000000-0000-0000-0000-000000000002', 'HRMS SAP', 'HR', 'ACTIVE', '2026-03-08T09:30:00Z')
ON CONFLICT DO NOTHING;

-- 3. automation_rules
INSERT INTO public.automation_rules (id, tenant_id, title, description, trigger_event, conditions, actions, is_active) VALUES
  ('ec000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'High Risk Finding Alert', 'Alert CAE on CRITICAL finding', 'FINDING_CREATED', '{"severity":"CRITICAL"}', '[{"type":"EMAIL","target":"cae@sentinelbank.com.tr"}]', true),
  ('ec000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Action Overdue Notification', 'Notify Action Owner', 'ACTION_OVERDUE', '{"status":"overdue"}', '[{"type":"IN_APP_NOTIFICATION"}]', true)
ON CONFLICT DO NOTHING;




-- 5. playbook_entries
INSERT INTO public.playbook_entries (id, tenant_id, title, content, tags, author_id) VALUES
  ('ee000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Incident Response Standard', 'Standard operating procedure for data breach', ARRAY['security', 'incident']::text[], '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;


