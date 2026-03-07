-- =============================================================================
-- WAVE 37: Sentinel Office & Document Vault — Supplemental Migration
-- =============================================================================
-- Adds seed data for 3 C-Level banking Office documents:
-- 1. Kredi Riski Değerlendirme Tablosu — SPREADSHEET (v1 + v2)
-- 2. Yönetim Kurulu Sunumu — ESG & TCFD — DOCUMENT (v1)
-- 3. BDDK Saha Denetimi Anomali Özet — SPREADSHEET (v1)
-- No new tables needed (office_documents + office_versions already exist).
-- =============================================================================

INSERT INTO office_documents (id, tenant_id, title, doc_type, created_by_name, is_archived)
VALUES
  ('f0ffce00-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'Kredi Riski Değerlendirme Tablosu — Q1 2026', 'SPREADSHEET',
   'Dr. Aysun Kaya (Kredi Risk Direktörü)', false),
  ('f0ffce00-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'Yönetim Kurulu Sunumu — ESG & TCFD Uyum Raporu 2026', 'DOCUMENT',
   'Murat Demir (CFO)', false),
  ('f0ffce00-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   'BDDK Saha Denetimi — Anomali Bulguları Özet Tablosu', 'SPREADSHEET',
   'Hakan Yıldız (CAE)', false)
ON CONFLICT (id) DO NOTHING;

-- Version 1: Kredi Riski tablosu (initial 4 müşteri)
INSERT INTO office_versions
  (id, document_id, version_number, content_data, content_hash, change_summary, is_frozen, created_by_name)
VALUES
  ('f0ffce01-0000-0000-0000-000000000001', 'f0ffce00-0000-0000-0000-000000000001',
   1,
   '{"cells":{"A1":{"value":"Müşteri Adı","style":{"bold":true}},"B1":{"value":"Limit (TRY)","style":{"bold":true}},"C1":{"value":"Kullanım (%)","style":{"bold":true}},"D1":{"value":"NPL Kategorisi","style":{"bold":true}},"E1":{"value":"Teminat Değeri","style":{"bold":true}},"F1":{"value":"Risk Skoru","style":{"bold":true}},"A2":{"value":"Türkiye Petrol A.Ş."},"B2":{"value":125000000},"C2":{"value":0.87},"D2":{"value":"İzleme"},"E2":{"value":98000000},"F2":{"formula":"=B2*C2/E2"},"A3":{"value":"Mega İnşaat Holding"},"B3":{"value":75000000},"C3":{"value":0.94},"D3":{"value":"Yakın İzleme (Grup 2)"},"E3":{"value":45000000},"F3":{"formula":"=B3*C3/E3"},"A4":{"value":"YeşilNet Teknoloji"},"B4":{"value":12000000},"C4":{"value":0.42},"D4":{"value":"Normal"},"E4":{"value":18000000},"F4":{"formula":"=B4*C4/E4"},"A5":{"value":"Altın Tarım Koop."},"B5":{"value":8500000},"C5":{"value":0.71},"D5":{"value":"İzleme"},"E5":{"value":15000000},"F5":{"formula":"=B5*C5/E5"},"A6":{"value":"TOPLAM","style":{"bold":true}},"B6":{"formula":"=SUM(B2:B5)","style":{"bold":true}},"C6":{"formula":"=AVERAGE(C2:C5)","style":{"bold":true}},"F6":{"formula":"=AVERAGE(F2:F5)","style":{"bold":true}}},"metadata":{"rows":6,"cols":6}}',
   'a1b2c3d4e5f60001',
   'İlk kredi riski tablosu oluşturuldu — 4 müşteri', true,
   'Dr. Aysun Kaya (Kredi Risk Direktörü)'),

  -- Version 2: Kredi Riski tablosu (5. müşteri eklendi)
  ('f0ffce01-0000-0000-0000-000000000002', 'f0ffce00-0000-0000-0000-000000000001',
   2,
   '{"cells":{"A1":{"value":"Müşteri Adı","style":{"bold":true}},"B1":{"value":"Limit (TRY)","style":{"bold":true}},"C1":{"value":"Kullanım (%)","style":{"bold":true}},"D1":{"value":"NPL Kategorisi","style":{"bold":true}},"E1":{"value":"Teminat Değeri","style":{"bold":true}},"F1":{"value":"Risk Skoru","style":{"bold":true}},"A2":{"value":"Türkiye Petrol A.Ş."},"B2":{"value":125000000},"C2":{"value":0.87},"D2":{"value":"İzleme"},"E2":{"value":98000000},"F2":{"formula":"=B2*C2/E2"},"A3":{"value":"Mega İnşaat Holding"},"B3":{"value":75000000},"C3":{"value":0.94},"D3":{"value":"Yakın İzleme (Grup 2)"},"E3":{"value":45000000},"F3":{"formula":"=B3*C3/E3"},"A4":{"value":"YeşilNet Teknoloji"},"B4":{"value":12000000},"C4":{"value":0.42},"D4":{"value":"Normal"},"E4":{"value":18000000},"F4":{"formula":"=B4*C4/E4"},"A5":{"value":"Altın Tarım Koop."},"B5":{"value":8500000},"C5":{"value":0.71},"D5":{"value":"İzleme"},"E5":{"value":15000000},"F5":{"formula":"=B5*C5/E5"},"A6":{"value":"Denizcilik Taş. Ltd."},"B6":{"value":32000000},"C6":{"value":0.58},"D6":{"value":"Normal"},"E6":{"value":40000000},"F6":{"formula":"=B6*C6/E6"},"A7":{"value":"TOPLAM","style":{"bold":true}},"B7":{"formula":"=SUM(B2:B6)","style":{"bold":true}},"C7":{"formula":"=AVERAGE(C2:C6)","style":{"bold":true}},"F7":{"formula":"=AVERAGE(F2:F6)","style":{"bold":true}}},"metadata":{"rows":7,"cols":6}}',
   'b2c3d4e5f6a70002',
   '5. müşteri (Denizcilik) portföye eklendi, toplamlar güncellendi', true,
   'Dr. Aysun Kaya (Kredi Risk Direktörü)'),

  -- Version 1: YK Sunumu (TipTap JSON)
  ('f0ffce02-0000-0000-0000-000000000001', 'f0ffce00-0000-0000-0000-000000000002',
   1,
   '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"YK Sunumu — ESG & TCFD Uyum Raporu 2026"}]},{"type":"paragraph","content":[{"type":"text","text":"2026 ilk çeyrek ESG uyum durumu ve Planet Pulse verileri. Kapsam 1: 13.450 tCO2e (hedef aşımı %12). GAR: %28.4 (hedef: %35). Cinsiyet ücret uçurumu: %4.2 (hedef: <%5). KVKK cezası: 125.000 TRY."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Aksiyon Planı"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Araç filosu elektrifikasyon programı (2026-Q3)"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Yeşil proje finansmanı birimi kurulumu"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"KVKK uyum programı güçlendirmesi + CISO ihdası"}]}]}]}]}',
   'c3d4e5f6a7b80003',
   'YK Sunumu ilk taslak oluşturuldu', true,
   'Murat Demir (CFO)'),

  -- Version 1: BDDK Anomali tablosu
  ('f0ffce03-0000-0000-0000-000000000001', 'f0ffce00-0000-0000-0000-000000000003',
   1,
   '{"cells":{"A1":{"value":"Bulgu Kodu","style":{"bold":true}},"B1":{"value":"Açıklama","style":{"bold":true}},"C1":{"value":"Departman","style":{"bold":true}},"D1":{"value":"Önem","style":{"bold":true}},"E1":{"value":"Durum","style":{"bold":true}},"A2":{"value":"BDDK-CCM-001"},"B2":{"value":"147 SWIFT MT103 tek yetkili imzası"},"C2":{"value":"Muhasebe"},"D2":{"value":"Kritik"},"E2":{"value":"Açık"},"A3":{"value":"BDDK-IT-002"},"B3":{"value":"Core banking erişim yetkisi fazlalığı"},"C3":{"value":"BT"},"D3":{"value":"Yüksek"},"E3":{"value":"İnceleme"},"A4":{"value":"BDDK-FIN-003"},"B4":{"value":"Kapsam 1 emisyon hedef aşımı (%12)"},"C4":{"value":"Kurumsal Yönetim"},"D4":{"value":"Uyarı"},"E4":{"value":"Aksiyon Planında"},"A5":{"value":"BDDK-COM-004"},"B5":{"value":"GAR hedefi altında (%28.4 / %35)"},"C5":{"value":"Hazine"},"D5":{"value":"Uyarı"},"E5":{"value":"Aksiyon Planında"},"A6":{"value":"TOPLAM AÇIK","style":{"bold":true}},"E6":{"formula":"=COUNTIF(E2:E5,\"Açık\")","style":{"bold":true}}},"metadata":{"rows":6,"cols":5}}',
   'd4e5f6a7b8c90004',
   'BDDK saha denetimi anomali bulguları tablosu oluşturuldu', true,
   'Hakan Yıldız (CAE)')
ON CONFLICT (id) DO NOTHING;

-- Link current_version_id
UPDATE office_documents SET current_version_id = 'f0ffce01-0000-0000-0000-000000000002'
  WHERE id = 'f0ffce00-0000-0000-0000-000000000001';
UPDATE office_documents SET current_version_id = 'f0ffce02-0000-0000-0000-000000000001'
  WHERE id = 'f0ffce00-0000-0000-0000-000000000002';
UPDATE office_documents SET current_version_id = 'f0ffce03-0000-0000-0000-000000000001'
  WHERE id = 'f0ffce00-0000-0000-0000-000000000003';
