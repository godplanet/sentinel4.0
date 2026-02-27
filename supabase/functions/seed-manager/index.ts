import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TENANT_ID = "11111111-1111-1111-1111-111111111111";

const IDS = {
  PLAN: "b0000000-0000-0000-0000-000000000001",
  ENTITY_HQ: "c0000000-0000-0000-0000-000000000001",
  ENTITY_TREASURY: "c0000000-0000-0000-0000-000000000002",
  ENTITY_KADIKOY: "c0000000-0000-0000-0000-000000000003",
  ENTITY_UMRANIYE: "c0000000-0000-0000-0000-000000000004",
  ENG_KADIKOY: "e0000000-0000-0000-0000-000000000001",
  ENG_CYBER: "e0000000-0000-0000-0000-000000000002",
  ENG_COMPLIANCE: "e0000000-0000-0000-0000-000000000003",
  STEP1: "50000000-0000-0000-0000-000000000001",
  STEP2: "50000000-0000-0000-0000-000000000002",
  STEP3: "50000000-0000-0000-0000-000000000003",
  STEP4: "50000000-0000-0000-0000-000000000004",
  STEP5: "50000000-0000-0000-0000-000000000005",
  WP1: "d1000000-0000-0000-0000-000000000001",
  WP2: "d1000000-0000-0000-0000-000000000002",
  WP3: "d1000000-0000-0000-0000-000000000003",
  FINDING1: "f0000000-0000-0000-0000-000000000001",
  FINDING2: "f0000000-0000-0000-0000-000000000002",
  FINDING3: "f0000000-0000-0000-0000-000000000003",
  REPORT: "d0000000-0000-0000-0000-000000000001",
  USER_CAE: "a0000000-0000-0000-0000-000000000001",
  USER_AUDITOR: "a0000000-0000-0000-0000-000000000002",
  USER_AUDITEE: "a0000000-0000-0000-0000-000000000003",
  USER_GMY: "a0000000-0000-0000-0000-000000000004",
  USER_VENDOR: "a0000000-0000-0000-0000-000000000005",
  SIM_RUN: "s0000000-0000-0000-0000-000000000001",
  RKM_PROC1: "p0000000-0000-0000-0000-000000000001",
  RKM_PROC2: "p0000000-0000-0000-0000-000000000002",
  RKM_PROC3: "p0000000-0000-0000-0000-000000000003",
  RKM_PROC4: "p0000000-0000-0000-0000-000000000004",
};

function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );
}

async function getCounts() {
  const sb = getServiceClient();
  const tables = [
    "user_profiles",
    "audit_entities",
    "risk_library",
    "audit_plans",
    "audit_engagements",
    "audit_steps",
    "workpapers",
    "audit_findings",
    "action_plans",
    "reports",
    "program_templates",
    "review_notes",
    "tenants",
    "compliance_regulations",
    "board_members",
    "stakeholders",
    "risk_assessments",
    "governance_docs",
    "risk_simulation_runs",
    "risk_simulation_results",
    "rkm_processes",
    "rkm_risks",
    "rkm_templates",
  ];

  const counts: Record<string, number> = {};
  for (const t of tables) {
    const { count, error } = await sb
      .from(t)
      .select("*", { count: "exact", head: true });
    counts[t] = error ? -1 : (count ?? 0);
  }
  return counts;
}

async function nuclearWipe() {
  const sb = getServiceClient();
  const log: string[] = [];

  const deleteOrder = [
    "risk_simulation_results",
    "risk_simulation_runs",
    "rkm_risks",
    "rkm_processes",
    "rkm_templates",
    "risk_assessments",
    "governance_docs",
    "board_members",
    "stakeholders",
    "compliance_regulations",
    "action_plans",
    "workpaper_findings",
    "finding_history",
    "audit_findings",
    "workpapers",
    "audit_steps",
    "review_notes",
    "reports",
    "audit_engagements",
    "audit_plans",
    "risk_library",
    "program_templates",
    "audit_entities",
    "user_profiles",
    "tenants",
  ];

  for (const t of deleteOrder) {
    const { error } = await sb
      .from(t)
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) log.push(`${t}: ${error.message}`);
    else log.push(`${t}: cleared`);
  }

  return log;
}

async function seedAll() {
  const sb = getServiceClient();
  const log: string[] = [];

  const ins = async (table: string, data: Record<string, unknown>[]) => {
    const { error } = await sb.from(table).insert(data);
    if (error) {
      log.push(`FAIL ${table}: ${error.message}`);
      return false;
    }
    log.push(`OK ${table}: ${data.length} rows`);
    return true;
  };

  await ins("tenants", [
    {
      id: TENANT_ID,
      name: "Sentinel Katilim Bankasi A.S.",
      type: "PARTICIPATION_BANK",
      environment: "PROD",
      slug: "sentinel-bank",
      settings: {
        currency: "TRY",
        locale: "tr-TR",
        fiscal_year_start: "01-01",
        bddk_regulated: true,
        masak_regulated: true,
        interest_free: true,
      },
    },
  ]);

  await ins("user_profiles", [
    { id: IDS.USER_CAE, tenant_id: TENANT_ID, email: "hakan.yilmaz@sentinelbank.com.tr", full_name: "Hakan Yilmaz", role: "cae", title: "Bas Mufettis", department: "Ic Denetim", phone: "+90 212 555 0101" },
    { id: IDS.USER_AUDITOR, tenant_id: TENANT_ID, email: "ahmet.demir@sentinelbank.com.tr", full_name: "Ahmet Demir", role: "auditor", title: "Kidemli Mufettis", department: "Ic Denetim", phone: "+90 212 555 0102" },
    { id: IDS.USER_AUDITEE, tenant_id: TENANT_ID, email: "mehmet.kaya@sentinelbank.com.tr", full_name: "Mehmet Kaya", role: "auditee", title: "Sube Muduru", department: "Kadikoy Subesi", phone: "+90 216 555 0201" },
    { id: IDS.USER_GMY, tenant_id: TENANT_ID, email: "zeynep.arslan@sentinelbank.com.tr", full_name: "Zeynep Arslan", role: "executive", title: "Hazineden Sorumlu GMY", department: "Hazine", phone: "+90 212 555 0103" },
    { id: IDS.USER_VENDOR, tenant_id: TENANT_ID, email: "ali.celik@external.com", full_name: "Ali Celik", role: "guest", title: "IT Guvenlik Danismani", department: "Dis Danisman", phone: "+90 532 555 0301" },
  ]);

  await ins("board_members", [
    {
      tenant_id: TENANT_ID,
      full_name: "Prof. Dr. Mustafa Eren Yildiz",
      title: "Yonetim Kurulu Baskani",
      role: "CHAIRMAN",
      email: "m.yildiz@sentinelbank.com.tr",
      phone: "+90 212 555 0001",
      appointment_date: "2022-04-15T00:00:00Z",
      term_end_date: "2025-04-15T00:00:00Z",
      is_independent: false,
      committees: ["Denetim Komitesi", "Kredi Komitesi"],
      bio: "30 yil katilim bankaciligi deneyimi. Istanbul Universitesi Finans Bolumu ogretim uyesi.",
      metadata: { education: "PhD Finans, Istanbul Universitesi", certifications: ["SMMM", "CIA"] },
    },
    {
      tenant_id: TENANT_ID,
      full_name: "Ayse Nur Ozturk",
      title: "Bagimsiz Yonetim Kurulu Uyesi",
      role: "INDEPENDENT_MEMBER",
      email: "a.ozturk@sentinelbank.com.tr",
      phone: "+90 212 555 0002",
      appointment_date: "2023-01-10T00:00:00Z",
      term_end_date: "2026-01-10T00:00:00Z",
      is_independent: true,
      committees: ["Denetim Komitesi", "Risk Komitesi"],
      bio: "BDDK eski daire baskani. Risk yonetimi ve uyum alanlari uzmani.",
      metadata: { education: "MBA, Bogazici Universitesi", certifications: ["FRM", "CIA"] },
    },
    {
      tenant_id: TENANT_ID,
      full_name: "Ibrahim Halil Sahin",
      title: "Genel Mudurlukten Sorumlu YK Uyesi",
      role: "EXECUTIVE_MEMBER",
      email: "i.sahin@sentinelbank.com.tr",
      phone: "+90 212 555 0003",
      appointment_date: "2021-07-01T00:00:00Z",
      term_end_date: "2024-07-01T00:00:00Z",
      is_independent: false,
      committees: ["Kredi Komitesi"],
      bio: "15 yil katilim bankaciligi operasyonlari deneyimi.",
      metadata: { education: "Iktisat, METU", certifications: ["CFA"] },
    },
  ]);

  await ins("stakeholders", [
    {
      tenant_id: TENANT_ID,
      name: "BDDK - Bankacilik Duzenleme ve Denetleme Kurumu",
      type: "REGULATOR",
      organization: "BDDK",
      contact_person: "Denetim Birimi",
      email: "denetim@bddk.org.tr",
      phone: "+90 312 455 6500",
      influence_level: "CRITICAL",
      engagement_frequency: "QUARTERLY",
      last_engagement_date: "2026-01-15T00:00:00Z",
      next_engagement_date: "2026-04-15T00:00:00Z",
      relationship_owner_id: IDS.USER_CAE,
      interests: "Bankacilik mevzuatina uyum, sermaye yeterliligi, likidite",
      concerns: "Katilim bankaciligi prensiplerine uyum, muderi havuz yonetimi",
      expectations: "Duzzenli raporlama, denetim bulgularinin zamaninda kapatilmasi",
      communication_channels: ["Resmi yazi", "Portal", "Denetim ziyaretleri"],
      metadata: { regulatory_body: true, reporting_frequency: "quarterly" },
    },
    {
      tenant_id: TENANT_ID,
      name: "TCMB - Turkiye Cumhuriyet Merkez Bankasi",
      type: "REGULATOR",
      organization: "TCMB",
      contact_person: "Finansal Istikrar Birimi",
      email: "finstab@tcmb.gov.tr",
      phone: "+90 312 507 5000",
      influence_level: "HIGH",
      engagement_frequency: "MONTHLY",
      last_engagement_date: "2026-02-01T00:00:00Z",
      next_engagement_date: "2026-03-01T00:00:00Z",
      relationship_owner_id: IDS.USER_GMY,
      interests: "Para politikasi aktarimi, rezerv gereksinimleri",
      concerns: "Likidite riski, kur riski",
      expectations: "Aylik raporlama, zorunlu karsilik uyumu",
      communication_channels: ["EDDS", "Elektronik raporlama"],
      metadata: { regulatory_body: true, reporting_frequency: "monthly" },
    },
    {
      tenant_id: TENANT_ID,
      name: "MASAK - Mali Suc Arastirma Kurulu",
      type: "REGULATOR",
      organization: "MASAK",
      contact_person: "Uyum Birimi",
      email: "masak@masak.gov.tr",
      phone: "+90 312 415 2600",
      influence_level: "HIGH",
      engagement_frequency: "ANNUALLY",
      last_engagement_date: "2025-12-01T00:00:00Z",
      next_engagement_date: "2026-12-01T00:00:00Z",
      relationship_owner_id: IDS.USER_CAE,
      interests: "Kara para aklama ve terör finansmani",
      concerns: "Musteri kimlik dogrulamasi, supheli islem bildirimleri",
      expectations: "STR raporlama, musteri risk profilleme",
      communication_channels: ["MASAK portal", "Resmi yazi"],
      metadata: { regulatory_body: true, reporting_frequency: "annually" },
    },
    {
      tenant_id: TENANT_ID,
      name: "Ic Denetim Komitesi",
      type: "INTERNAL",
      organization: "Sentinel Katilim Bankasi",
      contact_person: "Ayse Nur Ozturk",
      email: "denetim.komitesi@sentinelbank.com.tr",
      influence_level: "CRITICAL",
      engagement_frequency: "MONTHLY",
      last_engagement_date: "2026-02-10T00:00:00Z",
      next_engagement_date: "2026-03-10T00:00:00Z",
      relationship_owner_id: IDS.USER_CAE,
      interests: "Ic kontrol etkinligi, risk yonetimi, uyum",
      expectations: "Aylik faaliyet raporlari, kritik bulgularin ivedi bildirimi",
      communication_channels: ["YK toplantilari", "Yazili raporlar"],
      metadata: { internal: true },
    },
  ]);

  await ins("compliance_regulations", [
    {
      tenant_id: TENANT_ID,
      code: "BDDK-2023-1",
      title: "Bankalarin Ic Sistemleri Hakkinda Yonetmelik",
      category: "INTERNAL_AUDIT",
      article: "Madde 32-45",
      description: "Ic denetim fonksiyonunun bagimsizligi, raporlama yapisi ve faaliyet standartlari",
      severity: "CRITICAL",
      framework: "BDDK",
      is_active: true,
      metadata: { publication_date: "2023-07-01", effective_date: "2023-10-01", penalty_range: "Idari para cezasi" },
    },
    {
      tenant_id: TENANT_ID,
      code: "BDDK-2022-6",
      title: "Katilim Bankalarinda Mudarebe ve Musareke Islemleri",
      category: "ISLAMIC_FINANCE",
      article: "Madde 1-28",
      description: "Katilim bankaciligi urunlerinin fikhi esaslara uygunlugu ve havuz yonetimi kurallari",
      severity: "HIGH",
      framework: "BDDK",
      is_active: true,
      metadata: { publication_date: "2022-03-15", effective_date: "2022-06-15" },
    },
    {
      tenant_id: TENANT_ID,
      code: "MASAK-2021-14",
      title: "Supheli Islem Bildirimi Rehberi",
      category: "AML_CFT",
      article: "Madde 3, 7, 11",
      description: "Kara para aklama ve terör finansmani ile mucadelede bildirim yukumlulugu",
      severity: "CRITICAL",
      framework: "MASAK",
      is_active: true,
      metadata: { publication_date: "2021-09-01", effective_date: "2021-12-01", penalty_range: "Adli para cezasi" },
    },
    {
      tenant_id: TENANT_ID,
      code: "KVKK-2018-1",
      title: "Kisisel Verilerin Korunmasi Kanunu Uyumlulugu",
      category: "DATA_PRIVACY",
      article: "Madde 4, 5, 12",
      description: "Musteri kisisel verilerinin islenmesi, saklanmasi ve silinmesine iliskin yukumlulukler",
      severity: "HIGH",
      framework: "KVKK",
      is_active: true,
      metadata: { publication_date: "2018-04-07", effective_date: "2018-10-07" },
    },
    {
      tenant_id: TENANT_ID,
      code: "TCMB-2024-1",
      title: "Zorunlu Karsilik Tebligleri",
      category: "MONETARY_POLICY",
      article: "Madde 2, 5",
      description: "Mevduat ve katilim fonu hesaplari icin tesis edilmesi gereken zorunlu karsilik oranlari",
      severity: "HIGH",
      framework: "TCMB",
      is_active: true,
      metadata: { publication_date: "2024-01-15", effective_date: "2024-02-01" },
    },
    {
      tenant_id: TENANT_ID,
      code: "ISO27001-2022",
      title: "Bilgi Guvenligi Yonetim Sistemi",
      category: "INFORMATION_SECURITY",
      article: "Bolum 6.1, 8.2",
      description: "Bilgi varliklarinin korunmasi, siber risk yonetimi ve olay yonetimi gereksinimleri",
      severity: "MEDIUM",
      framework: "ISO27001",
      is_active: true,
      metadata: { certification_body: "TSE", last_audit: "2025-11-20" },
    },
  ]);

  await ins("governance_docs", [
    {
      tenant_id: TENANT_ID,
      doc_type: "CHARTER",
      title: "Ic Denetim Birimi Serti",
      version: "3.1",
      status: "ACTIVE",
      owner_id: IDS.USER_CAE,
      approved_by: IDS.USER_CAE,
      approval_date: "2025-12-15T00:00:00Z",
      effective_date: "2026-01-01T00:00:00Z",
      review_frequency_months: 12,
      next_review_date: "2026-12-31T00:00:00Z",
      tags: ["ic-denetim", "sert", "bddk"],
      content_html: "<h2>1. Amac ve Kapsam</h2><p>Bu sert, Ic Denetim Biriminin (IDB) amacini, yetkisini ve sorumlulugunu tanimlar.</p><h2>2. Misyon</h2><p>Bankanin hedeflerine ulasmasi icin risk, kontrol ve yonetim surecleri hakkinda bagimsiz ve objektif guvence ile danismanlik hizmetleri sunmak.</p>",
      metadata: { gias_aligned: true, ippf_version: "2024" },
    },
    {
      tenant_id: TENANT_ID,
      doc_type: "POLICY",
      title: "Ic Denetim Politikasi",
      version: "2.5",
      status: "ACTIVE",
      owner_id: IDS.USER_CAE,
      approved_by: IDS.USER_CAE,
      approval_date: "2025-11-01T00:00:00Z",
      effective_date: "2026-01-01T00:00:00Z",
      review_frequency_months: 12,
      next_review_date: "2026-12-31T00:00:00Z",
      tags: ["ic-denetim", "politika", "metodoloji"],
      content_html: "<h2>1. Bagimsizlik ve Tarafsizlik</h2><p>Ic denetciler, gorevlerini yerine getirirken tam bagimsizliklarini korumali ve herhangi bir cikar catismasindan kacinalidirlar.</p><h2>2. Denetim Planlama</h2><p>Yillik denetim plani, risk bazli bir yaklasimla hazirlanir ve Denetim Komitesi onayina sunulur.</p>",
      metadata: { ippf_standard: "1200" },
    },
    {
      tenant_id: TENANT_ID,
      doc_type: "PROCEDURE",
      title: "Denetim Bulgularinin Yonetimi Proseduru",
      version: "1.8",
      status: "ACTIVE",
      owner_id: IDS.USER_AUDITOR,
      approved_by: IDS.USER_CAE,
      approval_date: "2025-10-15T00:00:00Z",
      effective_date: "2025-11-01T00:00:00Z",
      review_frequency_months: 6,
      next_review_date: "2026-05-01T00:00:00Z",
      tags: ["bulgu", "aksiyon", "takip"],
      content_html: "<h2>1. Bulgu Siniflandirma</h2><p>Bulgular kritiklik seviyesine gore 5 kategoride siniflandirilir: Kritik, Yuksek, Orta, Dusuk, Bilgi.</p><h2>2. Yanit Suresi</h2><p>Kritik bulgular icin maksimum 30 gun, yuksek bulgular icin 60 gun aksiyon plani sunulur.</p>",
      metadata: { gias_aligned: true },
    },
  ]);

  await ins("risk_assessments", [
    {
      tenant_id: TENANT_ID,
      entity_id: IDS.ENTITY_KADIKOY,
      risk_category: "Operasyonel",
      risk_title: "Kasa Yonetimi ve Fiziksel Guvenlik Riski",
      inherent_likelihood: 4,
      inherent_impact: 5,
      residual_likelihood: 3,
      residual_impact: 4,
      control_effectiveness: 65,
      risk_owner: "Mehmet Kaya",
      assessment_date: "2026-01-15T00:00:00Z",
      review_date: "2026-07-15T00:00:00Z",
      status: "ACTIVE",
      notes: "Kasa limitinin asildigi tespiti nedeniyle residual risk yuksek kalmaktadir. Zirhli arac transfer sikligi artisinin tamamlanmasi beklenmektedir.",
      metadata: { last_audit_finding: IDS.FINDING1 },
    },
    {
      tenant_id: TENANT_ID,
      entity_id: IDS.ENTITY_KADIKOY,
      risk_category: "Uyum",
      risk_title: "KYC/AML Uyumluluk Riski",
      inherent_likelihood: 3,
      inherent_impact: 5,
      residual_likelihood: 3,
      residual_impact: 4,
      control_effectiveness: 55,
      risk_owner: "Mehmet Kaya",
      assessment_date: "2026-01-15T00:00:00Z",
      review_date: "2026-04-15T00:00:00Z",
      status: "ACTIVE",
      notes: "120 musteri dosyasinda eksik KYC belgesi tespit edilmistir. Toplu tarama projesi devam etmektedir.",
      metadata: { masak_reference: "MASAK-2021-14" },
    },
    {
      tenant_id: TENANT_ID,
      entity_id: IDS.ENTITY_TREASURY,
      risk_category: "Piyasa",
      risk_title: "Kar Payi Orani Duyarliligi Riski",
      inherent_likelihood: 4,
      inherent_impact: 4,
      residual_likelihood: 2,
      residual_impact: 4,
      control_effectiveness: 80,
      risk_owner: "Zeynep Arslan",
      assessment_date: "2026-02-01T00:00:00Z",
      review_date: "2026-08-01T00:00:00Z",
      status: "ACTIVE",
      notes: "Katilim bankaciligi prensipleri cercevesinde piyasa dalgalanmalarinin mudarebe havuz getirisine etkisi izlenmektedir.",
      metadata: { bddk_reference: "BDDK-2022-6" },
    },
    {
      tenant_id: TENANT_ID,
      entity_id: IDS.ENTITY_HQ,
      risk_category: "Teknoloji",
      risk_title: "Siber Guvenlik ve Veri Sizintisi Riski",
      inherent_likelihood: 4,
      inherent_impact: 5,
      residual_likelihood: 2,
      residual_impact: 5,
      control_effectiveness: 72,
      risk_owner: "Ali Celik",
      assessment_date: "2026-02-05T00:00:00Z",
      review_date: "2026-08-05T00:00:00Z",
      status: "ACTIVE",
      notes: "SOC 2 Type II sertifikasyonu sureci devam etmektedir. Penetrasyon testi sonuclari incelenmektedir.",
      metadata: { iso27001_reference: "ISO27001-2022" },
    },
  ]);

  const simRunId = IDS.SIM_RUN;
  await ins("risk_simulation_runs", [
    {
      id: simRunId,
      tenant_id: TENANT_ID,
      name: "Q1 2026 Senaryo Analizi — Faiz Shock Etkisi",
      constitution_snapshot: {
        version: "3.0",
        dimensions: ["impact", "likelihood", "volume", "control_effectiveness"],
        formula: "Score = (Impact * ln(Volume)) * (1 - ControlEffectiveness)",
        veto_rules: [{ condition: "severity == CRITICAL", max_grade: 60 }],
      },
      status: "COMPLETED",
      total_entities: 4,
      entities_changed: 3,
      avg_score_change: 8.5,
      created_by: IDS.USER_CAE,
      completed_at: "2026-02-10T14:30:00Z",
      metadata: { scenario: "interest_shock_100bps", confidence_level: 0.95 },
    },
  ]);

  await ins("risk_simulation_results", [
    {
      simulation_run_id: simRunId,
      entity_id: IDS.ENTITY_HQ,
      entity_name: "Genel Mudurluk",
      risk_score_old: 85,
      risk_score_new: 92,
      risk_zone_old: "HIGH",
      risk_zone_new: "CRITICAL",
      delta: 7,
      zone_changed: true,
    },
    {
      simulation_run_id: simRunId,
      entity_id: IDS.ENTITY_TREASURY,
      entity_name: "Hazine ve Finansman",
      risk_score_old: 92,
      risk_score_new: 96,
      risk_zone_old: "CRITICAL",
      risk_zone_new: "CRITICAL",
      delta: 4,
      zone_changed: false,
    },
    {
      simulation_run_id: simRunId,
      entity_id: IDS.ENTITY_KADIKOY,
      entity_name: "Kadikoy Subesi (101)",
      risk_score_old: 68,
      risk_score_new: 78,
      risk_zone_old: "MEDIUM",
      risk_zone_new: "HIGH",
      delta: 10,
      zone_changed: true,
    },
    {
      simulation_run_id: simRunId,
      entity_id: IDS.ENTITY_UMRANIYE,
      entity_name: "Umraniye Subesi (102)",
      risk_score_old: 62,
      risk_score_new: 74,
      risk_zone_old: "MEDIUM",
      risk_zone_new: "HIGH",
      delta: 12,
      zone_changed: true,
    },
  ]);

  await ins("rkm_processes", [
    {
      id: IDS.RKM_PROC1,
      tenant_id: TENANT_ID,
      path: "katilim_bankaciligi",
      level: 1,
      process_code: "KB-00",
      process_name: "Katilim Bankaciligi Ana Surecleri",
      process_name_en: "Participation Banking Core Processes",
      process_type: "CORE",
      description: "Faiz icermeyen bankacillik urunleri ve hizmetleri",
      owner_department: "Genel Mudurluk",
      process_owner_role: "Genel Mudur",
      is_active: true,
    },
    {
      id: IDS.RKM_PROC2,
      tenant_id: TENANT_ID,
      path: "katilim_bankaciligi.murabaha",
      level: 2,
      process_code: "KB-01",
      process_name: "Murabaha Finansman Sureci",
      process_name_en: "Murabaha Financing Process",
      process_type: "CORE",
      description: "Maliyet arti kar payi yontemiyle yapilan alim-satim finansmani",
      owner_department: "Kurumsal Kredi",
      process_owner_role: "Kredi Muduru",
      is_active: true,
    },
    {
      id: IDS.RKM_PROC3,
      tenant_id: TENANT_ID,
      path: "katilim_bankaciligi.mudarebe",
      level: 2,
      process_code: "KB-02",
      process_name: "Mudarebe Havuz Yonetimi",
      process_name_en: "Mudaraba Pool Management",
      process_type: "CORE",
      description: "Katilma hesaplari kar-zarar paylasim havuzu yonetimi",
      owner_department: "Hazine",
      process_owner_role: "Hazine Muduru",
      is_active: true,
    },
    {
      id: IDS.RKM_PROC4,
      tenant_id: TENANT_ID,
      path: "ic_denetim",
      level: 1,
      process_code: "ID-00",
      process_name: "Ic Denetim Surecleri",
      process_name_en: "Internal Audit Processes",
      process_type: "SUPPORT",
      description: "Denetim planlama, fieldwork, raporlama ve takip surecleri",
      owner_department: "Ic Denetim",
      process_owner_role: "Bas Mufettis",
      is_active: true,
    },
  ]);

  await ins("rkm_risks", [
    {
      tenant_id: TENANT_ID,
      process_id: IDS.RKM_PROC2,
      risk_code: "RKM-MURA-001",
      risk_title: "Murabaha Teverruk Riski",
      risk_description: "Teverruk uygulamalarinin fikhi kurallara aykiriliginin tespiti",
      risk_owner: "Zeynep Arslan",
      risk_status: "ACTIVE",
      main_process: "Murabaha Finansman",
      sub_process: "Urun Yapilandirma",
      risk_category: "Uyum",
      risk_subcategory: "Fikhi Uyum",
      risk_cause: "Standart sozlesme sablonlarinin fikhi denetimden gececinmesi",
      risk_consequence: "Mudari kaybetme, BDDK ceza, itibar hasari",
      potential_loss_amount: 5000000,
      inherent_impact: 5,
      inherent_likelihood: 3,
      inherent_volume: 850,
      inherent_score: 75,
      inherent_rating: "HIGH",
      control_description: "Danisma Kurulu onay sureci, periyodik fikhi denetim",
      control_type: "PREVENTIVE",
      control_effectiveness: 70,
      residual_impact: 4,
      residual_likelihood: 2,
      residual_score: 45,
      residual_rating: "MEDIUM",
      bddk_reference: "BDDK-2022-6",
      monitoring_frequency: "QUARTERLY",
      last_review_date: "2026-01-15",
      next_review_date: "2026-04-15",
    },
    {
      tenant_id: TENANT_ID,
      process_id: IDS.RKM_PROC3,
      risk_code: "RKM-MUD-001",
      risk_title: "Mudarebe Havuz Kar Hesaplama Hatasi",
      risk_description: "Katilim hesaplari kar dagitim hesaplamalarinda hata riski",
      risk_owner: "Zeynep Arslan",
      risk_status: "ACTIVE",
      main_process: "Mudarebe Havuz Yonetimi",
      sub_process: "Kar Dagitimi",
      risk_category: "Operasyonel",
      risk_subcategory: "Islem Hatasi",
      risk_cause: "Manuel hesaplama sureci, yetersiz otomasyon",
      risk_consequence: "Musteri sikayet, finansal kayip, itibar hasari",
      potential_loss_amount: 2500000,
      inherent_impact: 4,
      inherent_likelihood: 3,
      inherent_volume: 12500,
      inherent_score: 60,
      inherent_rating: "HIGH",
      control_description: "Otomatik hesaplama sistemi, gunluk mutabakat kontrolu",
      control_type: "DETECTIVE",
      control_effectiveness: 75,
      residual_impact: 3,
      residual_likelihood: 2,
      residual_score: 30,
      residual_rating: "MEDIUM",
      monitoring_frequency: "DAILY",
      last_review_date: "2026-02-01",
      next_review_date: "2026-05-01",
    },
    {
      tenant_id: TENANT_ID,
      process_id: IDS.RKM_PROC4,
      risk_code: "RKM-ID-001",
      risk_title: "Denetim Bagimsizligi Riski",
      risk_description: "Ic denetcilerin denetledikleri birimle cikar catismasi yasamasi",
      risk_owner: "Hakan Yilmaz",
      risk_status: "ACTIVE",
      main_process: "Ic Denetim Surecleri",
      sub_process: "Gorev Atama",
      risk_category: "Uyum",
      risk_subcategory: "Etik",
      risk_cause: "Denetci rotasyonunun yetersizligi, onceki gorev bilgisi",
      risk_consequence: "BDDK ihlali, guvence kalite dusukluugu",
      inherent_impact: 4,
      inherent_likelihood: 2,
      inherent_volume: 50,
      inherent_score: 40,
      inherent_rating: "MEDIUM",
      control_description: "Bagimsizlik beyannamesi, denetci rotasyon politikasi",
      control_type: "PREVENTIVE",
      control_effectiveness: 85,
      residual_impact: 3,
      residual_likelihood: 1,
      residual_score: 15,
      residual_rating: "LOW",
      bddk_reference: "BDDK-2023-1",
      monitoring_frequency: "ANNUALLY",
      last_review_date: "2026-01-01",
      next_review_date: "2027-01-01",
    },
  ]);

  await ins("rkm_templates", [
    {
      tenant_id: TENANT_ID,
      module_type: "RISK_ASSESSMENT",
      name: "Katilim Bankaciligi Risk Degerlendirme Sablonu",
      description: "BDDK mevzuatina uyumlu, faiz icermeyen bankacillik riskleri icin standart degerlendirme sablon",
      schema_definition: [
        { field: "risk_category", label: "Risk Kategorisi", type: "select", options: ["Uyum", "Operasyonel", "Piyasa", "Kredi", "Likidite", "Teknoloji", "Itibar"] },
        { field: "fikhi_uyum", label: "Fikhi Uyum Gerekli mi?", type: "boolean" },
        { field: "bddk_reference", label: "BDDK Mevzuat Referansi", type: "text" },
        { field: "inherent_score", label: "Brut Risk Puani (1-5)", type: "number", min: 1, max: 5 },
      ],
      is_active: true,
    },
    {
      tenant_id: TENANT_ID,
      module_type: "AUDIT_PROGRAM",
      name: "Murabaha Denetim Program Sablonu",
      description: "Murabaha finansman islemlerinin fikhi uyumluluk ve operasyonel denetimi icin program sablonu",
      schema_definition: [
        { step: 1, code: "MURA-01", title: "Sozlesme Fikhi Inceleme", objective: "Murabaha sozlesmelerinin AAOIFI standartlarina uygunlugunu dogrula" },
        { step: 2, code: "MURA-02", title: "Maliyet ve Kar Marji Kontrolu", objective: "Alim bedelinin ve uzerine eklenen karın kayıt altına alinmasini kontrol et" },
        { step: 3, code: "MURA-03", title: "Teslim ve Mulkiyet Belgesi", objective: "Urunun gercek mulkiyetle teslim edildigini dogrula" },
      ],
      is_active: true,
    },
  ]);

  await ins("audit_entities", [
    { id: IDS.ENTITY_HQ, tenant_id: TENANT_ID, name: "Genel Mudurluk", type: "BANK", path: "hq", risk_score: 85, metadata: { city: "Istanbul", employee_count: 450 } },
    { id: IDS.ENTITY_TREASURY, tenant_id: TENANT_ID, name: "Hazine ve Finansman", type: "UNIT", path: "hq.treasury", risk_score: 92, metadata: { portfolio_size_tl: 5200000000 } },
    { id: IDS.ENTITY_KADIKOY, tenant_id: TENANT_ID, name: "Kadikoy Subesi (101)", type: "UNIT", path: "hq.kadikoy", risk_score: 68, metadata: { branch_code: "101", customer_count: 4200 } },
    { id: IDS.ENTITY_UMRANIYE, tenant_id: TENANT_ID, name: "Umraniye Subesi (102)", type: "UNIT", path: "hq.umraniye", risk_score: 62, metadata: { branch_code: "102", customer_count: 3800 } },
  ]);

  await ins("risk_library", [
    { risk_code: "RISK-001", title: "Murabaha Islemlerinde Teverruk Riski", inherent_score: 89, residual_score: 65, control_effectiveness: 70, tenant_id: TENANT_ID, static_fields: { category: "compliance" } },
    { risk_code: "RISK-002", title: "Katilma Hesaplari Havuz Yonetimi", inherent_score: 92, residual_score: 72, control_effectiveness: 65, tenant_id: TENANT_ID, static_fields: { category: "operational" } },
    { risk_code: "RISK-003", title: "Sube Kasa ve Kiymet Guvenligi", inherent_score: 68, residual_score: 48, control_effectiveness: 75, tenant_id: TENANT_ID, static_fields: { category: "operational" } },
    { risk_code: "RISK-004", title: "Siber Guvenlik ve Veri Sizintisi", inherent_score: 95, residual_score: 60, control_effectiveness: 60, tenant_id: TENANT_ID, static_fields: { category: "technology" } },
    { risk_code: "RISK-005", title: "KYC/AML Uyumluluk Riski", inherent_score: 78, residual_score: 40, control_effectiveness: 80, tenant_id: TENANT_ID, static_fields: { category: "compliance" } },
  ]);

  await ins("audit_plans", [
    { id: IDS.PLAN, tenant_id: TENANT_ID, title: "Yillik Denetim Plani 2026", period_start: "2026-01-01", period_end: "2026-12-31", status: "APPROVED" },
  ]);

  await ins("audit_engagements", [
    { id: IDS.ENG_KADIKOY, tenant_id: TENANT_ID, plan_id: IDS.PLAN, entity_id: IDS.ENTITY_KADIKOY, title: "Kadikoy Sube Denetimi 2026-Q1", status: "IN_PROGRESS", audit_type: "COMPREHENSIVE", start_date: "2026-02-01", end_date: "2026-03-15", risk_snapshot_score: 68, estimated_hours: 80, actual_hours: 32 },
    { id: IDS.ENG_CYBER, tenant_id: TENANT_ID, plan_id: IDS.PLAN, entity_id: IDS.ENTITY_HQ, title: "Siber Guvenlik Hedefli Denetimi", status: "PLANNED", audit_type: "TARGETED", start_date: "2026-04-01", end_date: "2026-05-31", risk_snapshot_score: 95, estimated_hours: 120, actual_hours: 0 },
    { id: IDS.ENG_COMPLIANCE, tenant_id: TENANT_ID, plan_id: IDS.PLAN, entity_id: IDS.ENTITY_TREASURY, title: "Hazine Takip Denetimi", status: "COMPLETED", audit_type: "FOLLOW_UP", start_date: "2026-01-10", end_date: "2026-02-10", risk_snapshot_score: 92, estimated_hours: 60, actual_hours: 58 },
  ]);

  await ins("audit_steps", [
    { id: IDS.STEP1, engagement_id: IDS.ENG_KADIKOY, step_code: "KD-01", title: "Kasa Sayimi ve Limit Kontrolu", description: "Gun sonu kasa bakiyesi sayimi" },
    { id: IDS.STEP2, engagement_id: IDS.ENG_KADIKOY, step_code: "KD-02", title: "Musteri Hesap Acilis Proseduru", description: "KYC/AML dokumanlarinin kontrolu" },
    { id: IDS.STEP3, engagement_id: IDS.ENG_KADIKOY, step_code: "KD-03", title: "Kredi Dosyasi Incelemesi", description: "Kredi tahsis ve teminat dosyalarinin kontrolu" },
    { id: IDS.STEP4, engagement_id: IDS.ENG_COMPLIANCE, step_code: "HZ-01", title: "Murabaha Islem Kontrolu", description: "Murabaha islemlerinin fikhi uyumlulugunun kontrolu" },
    { id: IDS.STEP5, engagement_id: IDS.ENG_COMPLIANCE, step_code: "HZ-02", title: "Havuz Hesabi Denetimi", description: "Katilma hesaplari kar dagitim hesaplamasi" },
  ]);

  await ins("workpapers", [
    { id: IDS.WP1, step_id: IDS.STEP1, status: "finalized", data: { objective: "Kasa limiti BDDK uygunlugu", conclusion: "Kasa limiti 3 gun asilmis", test_result: "FAIL", sample_size: 15, exceptions: 3 } },
    { id: IDS.WP2, step_id: IDS.STEP2, status: "draft", data: { objective: "KYC/AML prosedur kontrolu", test_result: "PENDING", sample_size: 25 } },
    { id: IDS.WP3, step_id: IDS.STEP4, status: "finalized", data: { objective: "Murabaha fikhi uyumluluk", conclusion: "Islemler uyumlu", test_result: "PASS", sample_size: 10, exceptions: 0 } },
  ]);

  await ins("audit_findings", [
    { id: IDS.FINDING1, engagement_id: IDS.ENG_KADIKOY, title: "Kasa Limiti Asimi ve Sigorta Zafiyeti", severity: "CRITICAL", status: "DRAFT", state: "IN_NEGOTIATION", financial_impact: 250000, impact_score: 5, likelihood_score: 4, gias_category: "Operasyonel Yonetim", auditee_department: "Kadikoy Subesi", details: { detection: "Kasa bakiyesi 3 gun BDDK limitini asmistir", root_cause: "Zirhli arac transfer sikligi yetersiz", recommendation: "Transfer sikligini haftada 3 gune cikarin" } },
    { id: IDS.FINDING2, engagement_id: IDS.ENG_KADIKOY, title: "Eksik KYC Dokumantasyonu", severity: "HIGH", status: "DRAFT", state: "DRAFT", financial_impact: 100000, impact_score: 4, likelihood_score: 3, gias_category: "Uyum ve Yasal", auditee_department: "Kadikoy Subesi", details: { detection: "120 musteri dosyasinda kimlik fotokopisi eksik", root_cause: "Dijital gecis sirasinda eski dosyalar atlanmis", recommendation: "Toplu tarama yapilmali" } },
    { id: IDS.FINDING3, engagement_id: IDS.ENG_COMPLIANCE, title: "Murabaha Kar Marji Hesaplama Hatasi", severity: "MEDIUM", status: "REMEDIATED", state: "REMEDIATED", financial_impact: 50000, impact_score: 3, likelihood_score: 2, gias_category: "Mali Islemler", auditee_department: "Hazine", details: { detection: "Kar marji hesaplamasinda yuvarlama farki", root_cause: "Hesaplama yazilimi eski formul kullaniyor", recommendation: "Yazilim guncellenmeli" } },
  ]);

  await ins("action_plans", [
    { tenant_id: TENANT_ID, finding_id: IDS.FINDING1, title: "Zirhli Arac Transfer Sikligi Artirimi", description: "Transfer sikligi haftada 3 gune cikarilacak", responsible_person: "Mehmet Kaya", responsible_department: "Kadikoy Subesi", target_date: "2026-03-31", status: "IN_PROGRESS", priority: "HIGH", progress_percentage: 25 },
    { tenant_id: TENANT_ID, finding_id: IDS.FINDING2, title: "KYC Dosya Tarama Projesi", description: "Tum musteri dosyalari taranarak eksik belgeler tamamlanacak", responsible_person: "Mehmet Kaya", responsible_department: "Kadikoy Subesi", target_date: "2026-04-15", status: "DRAFT", priority: "HIGH", progress_percentage: 0 },
    { tenant_id: TENANT_ID, finding_id: IDS.FINDING3, title: "Murabaha Hesaplama Yazilimi Guncelleme", description: "Kar marji formulleri guncellenecek", responsible_person: "Zeynep Arslan", responsible_department: "Hazine", target_date: "2026-02-28", status: "COMPLETED", priority: "MEDIUM", progress_percentage: 100, completion_date: "2026-02-20" },
  ]);

  await ins("reports", [
    { id: IDS.REPORT, tenant_id: TENANT_ID, engagement_id: IDS.ENG_COMPLIANCE, title: "Hazine Uyum Denetimi Raporu", description: "Final rapor", status: "published", layout_type: "standard" },
  ]);

  await ins("program_templates", [
    { tenant_id: TENANT_ID, title: "Sube Operasyonel Denetim Programi", description: "Kapsamli sube denetim programi", category: "operational", estimated_hours: 80, step_count: 12, version: "2026.1" },
    { tenant_id: TENANT_ID, title: "Siber Guvenlik Denetim Programi", description: "BT ve siber guvenlik denetim programi", category: "operational", estimated_hours: 120, step_count: 18, version: "2026.1" },
  ]);

  await ins("review_notes", [
    { tenant_id: TENANT_ID, workpaper_id: IDS.WP1, field_key: "conclusion", note_text: "Kasa limiti asimi ciddi. Sigorta kapsamini da kontrol etmek gerek.", author_id: IDS.USER_CAE, status: "OPEN" },
    { tenant_id: TENANT_ID, workpaper_id: IDS.WP1, field_key: "sample_size", note_text: "15 orneklem yeterli mi? 30 gune cikaralim.", author_id: IDS.USER_AUDITOR, status: "OPEN" },
    { tenant_id: TENANT_ID, workpaper_id: IDS.WP2, field_key: "objective", note_text: "KYC kontrol kapsamina MASAK bildirimlerini de ekleyelim.", author_id: IDS.USER_CAE, status: "OPEN" },
    { tenant_id: TENANT_ID, workpaper_id: IDS.WP3, field_key: "conclusion", note_text: "Murabaha islemler uyumlu ancak dokumantasyon zayif. Bunu da vurgulayalim.", author_id: IDS.USER_AUDITOR, status: "RESOLVED", resolved_at: "2026-02-15T14:30:00Z", resolved_by: IDS.USER_CAE },
    { tenant_id: TENANT_ID, workpaper_id: IDS.WP3, field_key: "test_result", note_text: "On kontrol sonuclari ile uyumlu.", author_id: IDS.USER_CAE, status: "RESOLVED", resolved_at: "2026-02-15T15:00:00Z", resolved_by: IDS.USER_CAE },
  ]);

  return log;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/seed-manager\/?/, "");

    if (req.method === "GET" && (path === "counts" || path === "")) {
      const counts = await getCounts();
      return new Response(JSON.stringify({ ok: true, counts }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST" && path === "reseed") {
      const wipeLog = await nuclearWipe();
      const seedLog = await seedAll();
      const counts = await getCounts();
      return new Response(
        JSON.stringify({ ok: true, wipeLog, seedLog, counts }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "POST" && path === "wipe") {
      const wipeLog = await nuclearWipe();
      const counts = await getCounts();
      return new Response(
        JSON.stringify({ ok: true, wipeLog, counts }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown route", path }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
