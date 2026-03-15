-- ============================================================
-- Update Org Structure: New Bank Organizational Chart
-- Replaces seeded HQ/Dept/Unit entities with real structure
-- Moves branches to org.sube.* paths
-- ============================================================

BEGIN;

-- 1. Remove old org structure entities (HEADQUARTERS, DEPARTMENT, UNIT)
DELETE FROM audit_entities
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
  AND type IN ('HEADQUARTERS', 'DEPARTMENT', 'UNIT');

-- 2. Move existing BRANCH entities to org.sube.* paths
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) AS rn
  FROM audit_entities
  WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
    AND type = 'BRANCH'
)
UPDATE audit_entities ae
SET path = 'org.sube.br' || LPAD(n.rn::text, 3, '0')
FROM numbered n
WHERE ae.id = n.id;

-- 3. Insert new organizational structure
INSERT INTO audit_entities (id, tenant_id, name, type, path, risk_score, velocity_multiplier, status, metadata, created_at, updated_at)
VALUES

-- === GENEL MÜDÜRLÜK (Root) ===
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Genel Müdürlük', 'HEADQUARTERS', 'org.hq', 60, 1.0, 'ACTIVE', '{}', now(), now()),

-- === GENEL MÜDÜR YARDIMCILIKLARI (GMY) ===
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Kurumsal Bankacılık GMY', 'DEPARTMENT', 'org.hq.kb_gmy', 65, 1.1, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Ticari & KOBİ Bankacılığı GMY', 'DEPARTMENT', 'org.hq.tic_gmy', 60, 1.0, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Bireysel Bankacılık GMY', 'DEPARTMENT', 'org.hq.bb_gmy', 52, 1.0, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Hazine ve Uluslararası Bankacılık GMY', 'DEPARTMENT', 'org.hq.hzn_gmy', 75, 1.2, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Kredi Tahsis GMY', 'DEPARTMENT', 'org.hq.kt_gmy', 70, 1.1, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Risk İzleme ve Problemli Krediler GMY', 'DEPARTMENT', 'org.hq.rip_gmy', 72, 1.2, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Operasyon GMY', 'DEPARTMENT', 'org.hq.op_gmy', 58, 1.0, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Bilgi Teknolojileri GMY', 'DEPARTMENT', 'org.hq.bt_gmy', 73, 1.2, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Finans ve Muhasebe GMY', 'DEPARTMENT', 'org.hq.fin_gmy', 50, 1.0, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'İnsan Kaynakları GMY', 'DEPARTMENT', 'org.hq.ik_gmy', 40, 0.9, 'ACTIVE', '{}', now(), now()),

-- === BAĞIMSIZ BAŞKANLIKLAR & BİRİMLER (Doğrudan HQ''ya bağlı) ===
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'İç Denetim Başkanlığı (Teftiş Kurulu)', 'UNIT', 'org.hq.ic_denetim', 55, 1.0, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'İç Kontrol Başkanlığı', 'UNIT', 'org.hq.ic_kontrol', 50, 1.0, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Risk Yönetimi Başkanlığı', 'UNIT', 'org.hq.risk_yonetimi', 60, 1.0, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Hukuk Müşavirliği', 'UNIT', 'org.hq.hukuk', 45, 0.9, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Uyum ve MASAK Başkanlığı', 'UNIT', 'org.hq.uyum', 58, 1.0, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Strateji ve Kurumsal Gelişim', 'UNIT', 'org.hq.strateji', 40, 0.9, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Pazarlama ve Kurumsal İletişim', 'UNIT', 'org.hq.pazarlama', 35, 0.9, 'ACTIVE', '{}', now(), now()),

-- === KURUMSAL BANKACILIK GMY - Alt Birimler ===
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Kurumsal Pazarlama', 'UNIT', 'org.hq.kb_gmy.kp', 60, 1.0, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Proje Finansmanı', 'UNIT', 'org.hq.kb_gmy.pf', 65, 1.1, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Ticari Krediler', 'UNIT', 'org.hq.kb_gmy.tk', 68, 1.1, 'ACTIVE', '{}', now(), now()),

-- === TİCARİ & KOBİ BANKACILIK GMY - Alt Birimler ===
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Ticari Pazarlama', 'UNIT', 'org.hq.tic_gmy.tp', 55, 1.0, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'KOBİ Bankacılığı', 'UNIT', 'org.hq.tic_gmy.kobi', 60, 1.0, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Bölge Müdürlükleri', 'UNIT', 'org.hq.tic_gmy.bolge', 55, 1.0, 'ACTIVE', '{}', now(), now()),

-- === BİREYSEL BANKACILIK GMY - Alt Birimler ===
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Bireysel Ürün Yönetimi', 'UNIT', 'org.hq.bb_gmy.buy', 50, 1.0, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Kartlı Ödeme Sistemleri', 'UNIT', 'org.hq.bb_gmy.kos', 60, 1.1, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Dijital Bankacılık', 'UNIT', 'org.hq.bb_gmy.db', 55, 1.0, 'ACTIVE', '{}', now(), now()),

-- === HAZİNE VE ULUSLARARASI BANKACILIK GMY - Alt Birimler ===
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Hazine', 'UNIT', 'org.hq.hzn_gmy.hazine', 78, 1.2, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Likidite Yönetimi', 'UNIT', 'org.hq.hzn_gmy.lk', 72, 1.2, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Sukuk İşlemleri', 'UNIT', 'org.hq.hzn_gmy.sukuk', 70, 1.1, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Uluslararası Bankacılık', 'UNIT', 'org.hq.hzn_gmy.ub', 68, 1.1, 'ACTIVE', '{}', now(), now()),

-- === KREDİ TAHSİS GMY - Alt Birimler ===
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Kurumsal Kredi Tahsis', 'UNIT', 'org.hq.kt_gmy.kkt', 72, 1.1, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Ticari Kredi Tahsis', 'UNIT', 'org.hq.kt_gmy.tkt', 68, 1.0, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Finansal Analiz', 'UNIT', 'org.hq.kt_gmy.fa', 65, 1.0, 'ACTIVE', '{}', now(), now()),

-- === RİSK İZLEME VE PROBLEMLİ KREDİLER GMY - Alt Birimler ===
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Kredi İzleme', 'UNIT', 'org.hq.rip_gmy.ki', 70, 1.1, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Problemli Krediler', 'UNIT', 'org.hq.rip_gmy.pk', 75, 1.2, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Tahsilat', 'UNIT', 'org.hq.rip_gmy.tahsilat', 68, 1.0, 'ACTIVE', '{}', now(), now()),

-- === OPERASYON GMY - Alt Birimler ===
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Bankacılık Operasyonları', 'UNIT', 'org.hq.op_gmy.bo', 58, 1.0, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Ödeme Sistemleri', 'UNIT', 'org.hq.op_gmy.os', 62, 1.1, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Dış Ticaret Operasyonları', 'UNIT', 'org.hq.op_gmy.dto', 60, 1.0, 'ACTIVE', '{}', now(), now()),

-- === BİLGİ TEKNOLOJİLERİ GMY - Alt Birimler ===
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Yazılım Geliştirme', 'UNIT', 'org.hq.bt_gmy.yg', 70, 1.1, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Altyapı ve Sistem Yönetimi', 'UNIT', 'org.hq.bt_gmy.asy', 72, 1.2, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Siber Güvenlik', 'UNIT', 'org.hq.bt_gmy.sg', 78, 1.3, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Veri Yönetimi', 'UNIT', 'org.hq.bt_gmy.vy', 68, 1.1, 'ACTIVE', '{}', now(), now()),

-- === FİNANS VE MUHASEBE GMY - Alt Birimler ===
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Finansal Raporlama', 'UNIT', 'org.hq.fin_gmy.fr', 50, 1.0, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Bütçe ve Planlama', 'UNIT', 'org.hq.fin_gmy.bp', 45, 0.9, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Mali Kontrol', 'UNIT', 'org.hq.fin_gmy.mk', 52, 1.0, 'ACTIVE', '{}', now(), now()),

-- === İNSAN KAYNAKLARI GMY - Alt Birimler ===
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'İşe Alım', 'UNIT', 'org.hq.ik_gmy.ia', 38, 0.9, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Performans Yönetimi', 'UNIT', 'org.hq.ik_gmy.pym', 40, 0.9, 'ACTIVE', '{}', now(), now()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
 'Eğitim ve Gelişim', 'UNIT', 'org.hq.ik_gmy.eg', 35, 0.9, 'ACTIVE', '{}', now(), now());

COMMIT;
