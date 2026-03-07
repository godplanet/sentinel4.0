-- ============================================================================
-- WAVE 28: AI Persona & Dual Brain — Persona Seed Data
-- ============================================================================
-- Seeds 5 AI Persona definitions into the existing `ai_agents` table:
-- 1. Sentinel Prime   — Baş Denetim Koordinatörü (INVESTIGATOR)
-- 2. Şerî Danışman    — İslami Finans Uzmanı (INVESTIGATOR)
-- 3. Siber Güvenlik   — BT Güvenlik Uzmanı (INVESTIGATOR)
-- 4. Sherlock         — OSINT & Çıkar Çatışması Dedektifi (INVESTIGATOR) [existing]
-- 5. Hermes           — ChatOps Müzakere (NEGOTIATOR) [existing]
-- Already-existing agents use ON CONFLICT DO NOTHING.
-- ============================================================================

-- AI PERSONA DEFINITIONS
INSERT INTO public.ai_agents (id, name, codename, role, status, capabilities, avatar_color) VALUES
  (
    'a0100000-0000-0000-0000-000000000001',
    'Sentinel Prime',
    'SENTINEL_PRIME',
    'INVESTIGATOR',
    'IDLE',
    ARRAY[
      'Denetim Evreni Analizi',
      'Risk Önceliklendirme (Risk-Based Auditing)',
      'Çapraz-Denetim Korelasyonu',
      'CAE Karar Destek Özeti',
      'BDDK/SPK Mevzuat Uyum Kontrolü',
      'Dual-Brain Orkestrasyon (BLUE + ORANGE)'
    ],
    '#7C3AED'
  ),
  (
    'a0100000-0000-0000-0000-000000000002',
    'Şerî Danışman',
    'SHARIAH_ADVISOR',
    'INVESTIGATOR',
    'IDLE',
    ARRAY[
      'AAOIFI Standart Analizi',
      'Murabaha/Mudaraba Yapı Kontrolü',
      'Teverruk Uyum Değerlendirmesi',
      'Sukuk İhraç Süreç Denetimi',
      'Danışma Kurulu Raporlama',
      'İslami Finans Greenwashing Tespiti'
    ],
    '#059669'
  ),
  (
    'a0100000-0000-0000-0000-000000000003',
    'Siber Güvenlik Uzmanı',
    'CYBER_SENTINEL',
    'INVESTIGATOR',
    'IDLE',
    ARRAY[
      'Ayrıcalıklı Erişim Analizi (PAM)',
      'SWIFT Maker-Checker İhlal Tespiti',
      'BT Genel Kontroller Değerlendirmesi',
      'Penetrasyon Testi Bulgularını Yorumlama',
      'KVKK/GDPR Veri İşleme Uyumu',
      'SOC Log Anomali Analizi'
    ],
    '#DC2626'
  ),
  (
    'a0100000-0000-0000-0000-000000000004',
    'Risk Aktüeri',
    'RISK_ACTUARY',
    'INVESTIGATOR',
    'IDLE',
    ARRAY[
      'Monte Carlo Risk Simülasyonu',
      'VaR / CVaR Hesaplama',
      'Benford Kanunu Anomali Testi',
      'KRI Dashboard Yorumlama',
      'DELPHI Konsensüs Analizi',
      'Senaryo Stres Testi (RCP 2.6 / RCP 4.5)'
    ],
    '#D97706'
  ),
  (
    'a0100000-0000-0000-0000-000000000005',
    'Bulgu Müzakereci',
    'FINDING_NEGOTIATOR',
    'NEGOTIATOR',
    'IDLE',
    ARRAY[
      'CAE ile Yönetim Arasında Arabuluculuk',
      'Aksiyon Planı Müzakeresi',
      'SMART Hedef Belirleme Desteği',
      'Yönetim Yanıt Taslağı',
      'Bulgu Kapatma Takibi',
      'Etki/Olasılık Yeniden Değerlendirme'
    ],
    '#0EA5E9'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- DEMO AGENT RUNS: Sentinel Prime örnek görev geçmişi (2 run)
-- ============================================================================
INSERT INTO public.agent_runs
  (id, agent_id, target_entity, status, start_time, end_time, outcome)
VALUES
  (
    'b0100000-0000-0000-0000-000000000001',
    'a0100000-0000-0000-0000-000000000001',
    'Katılım Fonu Mudaraba Akdi 2026-Q1',
    'SUCCESS',
    (NOW() - INTERVAL '2 hours'),
    (NOW() - INTERVAL '1 hour 45 minutes'),
    'Katılım fonu mudaraba akdinde 3 adet düşük öncelikli kontrol açığı tespit edildi. Kâr dağıtım metodolojisi AAOIFI FAS 3 ile uyumlu. Aksiyon planı hazırlandı.'
  ),
  (
    'b0100000-0000-0000-0000-000000000002',
    'a0100000-0000-0000-0000-000000000001',
    'SWIFT MT103 Maker-Checker Kontrol Matrisi',
    'FLAGGED',
    (NOW() - INTERVAL '1 day 3 hours'),
    (NOW() - INTERVAL '1 day 2 hours 50 minutes'),
    'KRİTİK: 147 SWIFT MT103 mesajında tek yetkili ile gönderim tespit edildi. BDDK Ödeme Sistemleri Rehberi Madde 14 ihlali. CAE acil onayı gerekiyor.'
  )
ON CONFLICT (id) DO NOTHING;

-- Demo Thoughts (Sentinel Prime için)
INSERT INTO public.agent_thoughts
  (id, run_id, step_number, thought_type, thought_process, action_taken, tool_output)
VALUES
  -- Run 1
  (
    'c0100000-0000-0000-0000-000000000001',
    'b0100000-0000-0000-0000-000000000001',
    1, 'THINKING',
    'Mudaraba akdi kriterlerini AAOIFI FAS 3 ve BDDK Katılım Bankacılığı Yönetmeliği çerçevesinde değerlendireceğim.',
    '', '{}'
  ),
  (
    'c0100000-0000-0000-0000-000000000002',
    'b0100000-0000-0000-0000-000000000001',
    2, 'ACTION',
    'Kâr payı dağıtım akışını ve sermaye koruma kriterlerini sorguluyorum.',
    'supabase_query(table="audit_findings", filter="engagement_id=mudaraba_2026q1")',
    '{"found_findings": 3, "severity_max": "MEDIUM"}'
  ),
  (
    'c0100000-0000-0000-0000-000000000003',
    'b0100000-0000-0000-0000-000000000001',
    3, 'CONCLUSION',
    '3 orta öncelikli bulgu tespit edildi. Kâr dağıtım metodolojisi AAOIFI standartlarıyla uyumlu. Aksiyon planı Hazine ve Ürün Geliştirme ekipleriyle koordine edilmeli.',
    '', '{"risk_level": "MEDIUM", "action_required": true}'
  ),
  -- Run 2 (FLAGGED)
  (
    'c0100000-0000-0000-0000-000000000004',
    'b0100000-0000-0000-0000-000000000002',
    1, 'THINKING',
    'SWIFT işlemlerinde maker-checker (dört göz) kontrollerini inceliyorum. BDDK rehberi zorunlu çift onay şartı koyuyor.',
    '', '{}'
  ),
  (
    'c0100000-0000-0000-0000-000000000005',
    'b0100000-0000-0000-0000-000000000002',
    2, 'ACTION',
    '01.01.2026-31.03.2026 tarih aralığında MT103/MT202 işlemlerini tarayarak tek yetkili ile gerçekleştirilen işlemleri filtreliyorum.',
    'supabase_query(table="ccm_transactions", filter="type=SWIFT AND single_approver=true")',
    '{"total_swift": 1842, "single_approver": 147, "violation_rate": "7.98%"}'
  ),
  (
    'c0100000-0000-0000-0000-000000000006',
    'b0100000-0000-0000-0000-000000000002',
    3, 'CONCLUSION',
    'KRİTİK BULGU: %7.98 ihlal oranı kabul edilemez düzeyde. BDDK Ödeme Sistemleri Rehberi Madde 14 açık ihlali. Acil aksiyon planı ve CAE onayı gerekiyor.',
    '', '{"severity": "CRITICAL", "escalate_to_cae": true, "regulatory_violation": "BDDK_PSR_Art14"}'
  )
ON CONFLICT (id) DO NOTHING;
