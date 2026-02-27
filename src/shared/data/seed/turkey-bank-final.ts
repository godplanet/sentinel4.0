import { supabase } from '../../api/supabase';

const TENANT_ID = '11111111-1111-1111-1111-111111111111';

export const USERS = {
  CAE: 'a0000000-0000-0000-0000-000000000001',
  AUDITOR: 'a0000000-0000-0000-0000-000000000002',
  AUDITEE: 'a0000000-0000-0000-0000-000000000003',
  GMY: 'a0000000-0000-0000-0000-000000000004',
  VENDOR: 'a0000000-0000-0000-0000-000000000005',
};

const IDS = {
  PLAN: 'b0000000-0000-0000-0000-000000000001',
  ENTITY_HQ: 'c0000000-0000-0000-0000-000000000001',
  ENTITY_TREASURY: 'c0000000-0000-0000-0000-000000000002',
  ENTITY_KADIKOY: 'c0000000-0000-0000-0000-000000000003',
  ENTITY_UMRANIYE: 'c0000000-0000-0000-0000-000000000004',
  ENG_KADIKOY: 'e0000000-0000-0000-0000-000000000001',
  ENG_CYBER: 'e0000000-0000-0000-0000-000000000002',
  ENG_COMPLIANCE: 'e0000000-0000-0000-0000-000000000003',
  STEP1: '50000000-0000-0000-0000-000000000001',
  STEP2: '50000000-0000-0000-0000-000000000002',
  STEP3: '50000000-0000-0000-0000-000000000003',
  STEP4: '50000000-0000-0000-0000-000000000004',
  STEP5: '50000000-0000-0000-0000-000000000005',
  WP1: 'd1000000-0000-0000-0000-000000000001',
  WP2: 'd1000000-0000-0000-0000-000000000002',
  WP3: 'd1000000-0000-0000-0000-000000000003',
  FINDING1: 'f0000000-0000-0000-0000-000000000001',
  FINDING2: 'f0000000-0000-0000-0000-000000000002',
  FINDING3: 'f0000000-0000-0000-0000-000000000003',
  REPORT: 'd0000000-0000-0000-0000-000000000001',
};

async function safeDelete(tableName: string): Promise<void> {
  try {
    const { error } = await supabase.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (!error) console.log(`🟢 🧹 [WIPE] ${tableName} temizlendi.`);
  } catch (err) {
    // 404 hatalarını (olmayan tabloları) sessizce yut
  }
}

async function safeUpsert(tableName: string, data: any[], label: string): Promise<void> {
  const { error } = await supabase.from(tableName).upsert(data);
  if (error) {
    console.error(`❌ ❌ [SEED] ${label} YÜKLENEMEDİ:`, error.message);
    throw error;
  }
  console.log(`🟢 🌱 [SEED] ${label}: ${data.length} kayıt başarıyla eklendi`);
}

export async function nuclearWipe(): Promise<void> {
  console.log('🟢 ☢️ NUCLEAR WIPE: Derinlemesine temizlik başlıyor...');
  const tables = ['action_plans','audit_findings','workpapers','audit_steps','reports','audit_engagements','audit_plans','risk_library','program_templates','audit_entities','user_profiles','risk_history','finding_history'];
  for (const t of tables) await safeDelete(t);
  console.log('🟢 ✅ NUCLEAR WIPE TAMAMLANDI.');
}

export async function seedTurkeyBank(): Promise<void> {
  console.log('🟢 🏦 TURKEY BANK SEEDER: Sentinel Katılım Bankası İnşa Ediliyor...');

  await safeUpsert('user_profiles', [
    { id: USERS.CAE, tenant_id: TENANT_ID, email: 'hakan.yilmaz@sentinelbank.com.tr', full_name: 'Hakan Yılmaz', role: 'cae', title: 'Teftiş Kurulu Başkanı', department: 'İç Denetim' },
    { id: USERS.AUDITOR, tenant_id: TENANT_ID, email: 'ahmet.demir@sentinelbank.com.tr', full_name: 'Ahmet Demir', role: 'auditor', title: 'Kıdemli Müfettiş', department: 'İç Denetim' },
  ], 'Kullanıcılar');

  await safeUpsert('audit_entities', [
    { id: IDS.ENTITY_HQ, tenant_id: TENANT_ID, name: 'Genel Müdürlük', type: 'BANK', path: 'hq', risk_score: 85, metadata: { city: 'Istanbul' } },
    { id: IDS.ENTITY_TREASURY, tenant_id: TENANT_ID, name: 'Hazine ve Finansman', type: 'UNIT', path: 'hq.treasury', risk_score: 92, metadata: { portfolio_size_tl: 5200000000 } },
    { id: IDS.ENTITY_KADIKOY, tenant_id: TENANT_ID, name: 'Kadıköy Şubesi (101)', type: 'UNIT', path: 'hq.kadikoy', risk_score: 68, metadata: { branch_code: '101' } },
  ], 'Denetim Evreni');

  await safeUpsert('risk_library', [
    { risk_code: 'RISK-001', title: 'Murabaha İşlemlerinde Teverruk Riski', inherent_score: 89, residual_score: 65, control_effectiveness: 70, tenant_id: TENANT_ID },
    { risk_code: 'RISK-002', title: 'Siber Güvenlik ve Veri Sızıntısı', inherent_score: 95, residual_score: 60, control_effectiveness: 60, tenant_id: TENANT_ID },
  ], 'Risk Library');

  await safeUpsert('audit_plans', [
    { id: IDS.PLAN, tenant_id: TENANT_ID, title: 'Yıllık Denetim Planı 2026', period_start: '2026-01-01', period_end: '2026-12-31', status: 'APPROVED' },
  ], 'Planlar');

  await safeUpsert('audit_engagements', [
    { id: IDS.ENG_KADIKOY, tenant_id: TENANT_ID, plan_id: IDS.PLAN, entity_id: IDS.ENTITY_KADIKOY, title: 'Kadıköy Şube Operasyon Denetimi', status: 'IN_PROGRESS', audit_type: 'COMPREHENSIVE', start_date: '2026-02-01', end_date: '2026-03-15', risk_snapshot_score: 68 },
    { id: IDS.ENG_CYBER, tenant_id: TENANT_ID, plan_id: IDS.PLAN, entity_id: IDS.ENTITY_HQ, title: 'Kurumsal Siber Güvenlik Sızma Testi', status: 'PLANNED', audit_type: 'TARGETED', start_date: '2026-04-01', end_date: '2026-05-31', risk_snapshot_score: 95 },
  ], 'Denetim Görevleri');

  await safeUpsert('audit_findings', [
    { id: IDS.FINDING1, engagement_id: IDS.ENG_KADIKOY, title: 'Kasa Limiti Aşımı ve Sigorta Zafiyeti', severity: 'CRITICAL', status: 'DRAFT', state: 'IN_NEGOTIATION', financial_impact: 250000, impact_score: 5, likelihood_score: 4 },
  ], 'Bulgular');

  console.log('🟢 🎉 TURKEY BANK SEEDER COMPLETE!');
}

export async function forceReseed(): Promise<void> {
  console.log('🟢 🚀 FORCE RESEED: Başlatılıyor...');
  await nuclearWipe();
  await seedTurkeyBank();
  console.log('🟢 ✅ FORCE RESEED İŞLEMİ BİTTİ!');
}