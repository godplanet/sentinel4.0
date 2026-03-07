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
   '{"condition":"Teverruk API logları incelendiğinde, 147 işlemde dijital vekaletnamenin emtia alım-satım işleminden sonra zaman damgası aldığı tespit edilmiştir (ortalama 12 dakika gecikme).","criteria":"AAOIFI Şeri Standardı No. 30 — Teverruk İşlemlerinde Kronolojik Sıra Zorunluluğu; Danışma Komitesi 2025/07 sayılı kararı","cause":"API gateway''de kuyruk (queue) mekanizmasının bulut sağlayıcı kaynaklı gecikmesi ve zaman senkronizasyonu eksikliği.","consequence":"Şeri uyumsuzluk riski — işlemlerin fıkhi geçerliliği tartışmaya açıktır. Gelir tanınmasının (revenue recognition) raporlama dışı bırakılması gerekebilir.","recommendation":"1) API gateway''e NTP tabanlı atomik zaman senkronizasyonu ekleyin. 2) İşlem sıralamasını garanti eden idempotent kuyruk mekanizmasına geçin. 3) Danışma Komitesi ile geriye dönük fetva değerlendirmesi yapın."}'::jsonb,
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
   'Yetkilerin kaldırılması operasyonel bir risk yaratabilir; geçiş planı ile birlikte hareket edilmesini talep ediyoruz.',
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
   '00000000-0000-0000-0000-000000000003','Murat Şen','Baş Müfettiş','Gözden geçirildi; şiddet derecesi CRITICAL olarak onaylandı.'),
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
WHERE NOT EXISTS (SELECT 1 FROM risk_configuration WHERE is_active = true);

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
WHERE NOT EXISTS (SELECT 1 FROM public.risk_constitution_v3 WHERE tenant_id = '11111111-1111-1111-1111-111111111111'::uuid AND is_active = true);

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
      "description": "Şer''i ihlal tespit edildiğinde CAE onayı zorunludur; Danışma Komitesi bilgilendirilir"
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
    'Yeşil Sukuk ihracı ve sürdürülebilir finansman araçları aracılığıyla katılım bankacılığı portföyünü çeşitlendirip büyütmek; yeşil sukuk hacmini 2026 sonuna kadar %25 artırmak. BDDK Sürdürülebilir Finans Tebliği kapsamında raporlama yükümlülükleri yerine getirilecektir.',
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
    'Yeşil Sukuk ihraç süreçlerinin BDDK Sürdürülebilir Finans Tebliği ve IIFM standartlarına uygunluğunun denetlenmesi; çevre etkisi raporlamasının doğruluğunun ve şer''i uyumunun teyit edilmesi.',
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
    'Yeşil Sukuk hedefi doğrudan uyum denetimini gerektirir; şer''i uyum ve BDDK tebliği kontrolü kritik öneme sahiptir.'
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
    'Kök neden analizi (RCA) tamamlandı; "Ayrıcalıklı Erişim Yönetimi" kontrol kategorisine sınıflandırıldı.',
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
    'Elif Hanım, yetki matrisi ve 90 günlük tüm ayrıcalıklı erişim logları ekte sunulmaktadır. Ayrıca söz konusu servis hesabının yetki yükseltme işleminin yazılım güncellemesi sonrası otomatik gerçekleştiğini belirtmek isteriz; kasıt söz konusu değildir.',
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
    'Kredi komitesi yetki limitleri 3 yıldır güncellenmemiş; artan kredi hacimleri ile yetki sınırları çakışmaktadır. Bu durum müzahir imza eksiklikleri yaratmakta ve denetim bulgularına yol açmaktadır.',
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
    'Bu danışmanlık kapsamı; mevcut STR akışının haritalanması, otomasyon fırsatlarının belirlenmesi ve taslak süreç önerisinin sunulmasıyla sınırlıdır. Uygulama ve yazılım geliştirme kapsam dışındadır. Tüm nihai karar sorumluluğu Uyum Birimi Müdürüne aittir.',
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
    'Mevcut iş akışında şüpheli işlem tespitinden MASAK bildirim formunun tamamlanmasına kadar ortalama 8,4 iş günü geçmektedir. MASAK Yönetmeliği Md. 5 uyarınca sınır 10 gündür; operasyonel yoğunluk dönemlerinde bu süre aşılma riski taşımaktadır.',
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
    'Mobil ve internet bankacılığı kanallarında müşteri sayısını ve işlem hacmini 2026 sonuna kadar %40 artırmak; BDDK Dijital Bankacılık rehberine tam uyum.',
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
    '{"condition":"Hazine işlemlerinde SWIFT MT103/MT202 mesajlarının bir kısmında tek yetkili ile gönderim yapıldığı; BDDK Ödeme Sistemleri rehberinde zorunlu maker-checker kuralı ihlal edilmiştir.","criteria":"BDDK Ödeme ve Menkul Kıymet Mutabakat Sistemleri; SWIFT CSP Kontrol Listesi","cause":"Acil işlem taleplerinde bypass prosedürü kötüye kullanılmış.","consequence":"Operasyonel risk, dolandırıcılık ve regülatör yaptırım riski.","recommendation":"Tüm SWIFT çıkışlarında zorunlu çift onay; bypass için CAE onayı ve loglama."}'::jsonb,
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
  original_due_date, current_due_date, status, priority, created_by
) VALUES
  (
    'a8000000-0000-0000-0000-000000000001'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'f8000000-0000-0000-0000-000000000001'::uuid,
    '{"title":"SWIFT Mesajlarında Çift Onay (Maker-Checker) İhlali","severity":"CRITICAL","gias_category":"Operasyonel Risk"}'::jsonb,
    'SWIFT Maker-Checker zorunluluğunun sistemde etkinleştirilmesi',
    'Tüm SWIFT çıkış mesajları için ikinci onay (checker) rolü tanımlanacak; bypass sadece CAE onayı ile ve loglanacak.',
    (CURRENT_DATE - 45), (CURRENT_DATE - 20), 'OVERDUE', 'CRITICAL',
    '00000000-0000-0000-0000-000000000003'::uuid
  ),
  (
    'a8000000-0000-0000-0000-000000000002'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'f8000000-0000-0000-0000-000000000002'::uuid,
    '{"title":"Kredi Teminat Girişlerinde Gecikme","severity":"HIGH","gias_category":"Kredi Riski"}'::jsonb,
    'Teminat güncelleme SLA ve otomasyon projesi',
    '15 iş günü SLA tanımı; haftalık eksik teminat raporu ve Kredi Yönetim Sistemi entegrasyonu.',
    (CURRENT_DATE - 60), (CURRENT_DATE - 15), 'OVERDUE', 'HIGH',
    '00000000-0000-0000-0000-000000000004'::uuid
  )
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- G5. ESKALASYON KAYITLARI (CAE kararı: COMMITTEE_FLAGGED — YK'ya raporlanmış)
-- -----------------------------------------------------------------------------
INSERT INTO public.sla_escalation_logs (id, tenant_id, action_id, escalation_level, cae_decision, justification, triggered_at) VALUES
  ('e8000000-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'a8000000-0000-0000-0000-000000000001'::uuid, 3, 'COMMITTEE_FLAGGED', 'Kritik SWIFT kontrolü gecikmesi; Denetim Komitesi ve Yönetim Kuruluna bilgilendirme yapıldı. Takip raporu bir sonraki YK toplantısında sunulacak.', (CURRENT_TIMESTAMP - INTERVAL '10 days')),
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
    'Sızma testi ve ayrıcalıklı erişim denetimi taslak raporu; CAE incelemesi bekleniyor.',
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
  ('d8000000-0000-0000-0000-000000000008'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '42d72f07-e813-4cff-8218-4a64f7a3baab'::uuid, 'Eski Suistimal Raporu (İptal)', 'Hata ve eksiklik nedeniyle geçersiz kılındı; zeyilname yayımlandı.', 'REVOKED_AMENDED', '{"mode": "neon", "accent": "blue", "layout": "standard"}'::jsonb, 'standard', NULL, (CURRENT_TIMESTAMP - INTERVAL '90 days'), NULL, NULL, NULL, 'İnceleme/Soruşturma', NULL),
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
  original_due_date, current_due_date, status, priority, created_by
) VALUES
  (
    'a8000000-0000-0000-0000-000000000003'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'f8000000-0000-0000-0000-000000000003'::uuid,
    '{"title":"Legacy Sistem Sunucu Versiyonu","severity":"MEDIUM","gias_category":"Teknolojik Risk"}'::jsonb,
    'Sunucu yükseltme maliyeti nedeniyle risk kabulü',
    'Yönetim Kurulu kararı ile sistemin 2 yıl sonra tamamen yenilenmesi planlandığından, mevcut sunucu riski kabul edilmiştir.',
    (CURRENT_DATE - 30), (CURRENT_DATE - 30), 'WAIVED', 'MEDIUM',
    '00000000-0000-0000-0000-000000000003'::uuid
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
('a0000000-0000-0000-0000-000000000004', '8', 'Murabaha', 'Fiyat Bileşimi', '5/3/1', 'Satış fiyatı açıkça belirtilmelidir; maliyet fiyatı artı kar marjından oluşur. Gizli masraflar veya belirsiz maliyet unsurları, şeffaflık gereksinimini (garar) ihlal eder.', 'mandatory', 'high', '{"fiyat", "maliyet", "kar", "marj", "şeffaflık", "garar", "açıklama"}', '{}'),

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
    'Core Banking sisteminde bir açık tespit ettim. API katmanında object-level yetkilendirme kontrolü eksik; herhangi bir hesap numarasıyla müşteri bakiyelerine erişilebiliyor. CVE benzeri kritik bir güvenlik açığı.',
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
