-- migration: 20260215_add_bddk_and_observation.sql

-- 1. Enum Güncellemesi (PostgreSQL'de enum'a değer eklemek)
-- ALTER TYPE "FindingSeverity" ADD VALUE IF NOT EXISTS 'OBSERVATION';

-- 2. Finding Tablosuna Yeni Kolonlar
ALTER TABLE "audit_findings" 
ADD COLUMN IF NOT EXISTS "audit_framework" VARCHAR(20) DEFAULT 'STANDARD',
ADD COLUMN IF NOT EXISTS "bddk_deficiency_type" VARCHAR(5);

-- 3. Sistem Tanımları Tablosuna BDDK Mapping Verisi (Seed)
-- Bu tablo frontend'e "Hangi seçim kaç puana denk gelir?" bilgisini sağlar.
CREATE TABLE IF NOT EXISTS "risk_definitions_bddk" (
    "code" VARCHAR(5) PRIMARY KEY,
    "name" VARCHAR(100),
    "description" TEXT,
    "mapped_severity" TEXT,
    "impact_value" INT,
    "likelihood_value" INT
);

INSERT INTO "risk_definitions_bddk" ("code", "name", "description", "mapped_severity", "impact_value", "likelihood_value") VALUES
('OK', 'Önemli Kontrol Eksikliği', 'Süreç hedeflerini doğrudan tehdit eden kritik aksaklık.', 'CRITICAL', 5, 5), -- Score: 25
('KD', 'Kayda Değer Kontrol Eksikliği', 'Giderilmezse önemli zarara yol açabilecek eksiklik.', 'HIGH', 4, 4),    -- Score: 16
('KZ', 'Kontrol Zayıflığı', 'Süreç etkinliğini azaltan ancak kritik olmayan eksiklik.', 'MEDIUM', 3, 3);      -- Score: 9