import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dnycfawsmfvrandsgcpv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_725DYXIhBajO2XnJt_aV8A_ftPjOozo';
const ORG_TENANT  = '11111111-1111-1111-1111-111111111111'; // audit_entities
const RISK_TENANT = '00000000-0000-0000-0000-000000000001'; // risk tables

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Risk definitions to seed ─────────────────────────────────────────────────
const RISK_DEFS = [
  { title: 'Operasyonel Risk',             category: 'Operasyonel',   base_impact: 3, base_likelihood: 4 },
  { title: 'Kredi Riski',                  category: 'Kredi',         base_impact: 4, base_likelihood: 3 },
  { title: 'Piyasa Riski',                 category: 'Piyasa',        base_impact: 4, base_likelihood: 3 },
  { title: 'Likidite Riski',               category: 'Likidite',      base_impact: 5, base_likelihood: 2 },
  { title: 'Uyum ve Regülasyon Riski',     category: 'Uyum',          base_impact: 3, base_likelihood: 3 },
  { title: 'BT ve Siber Güvenlik Riski',   category: 'BT',            base_impact: 4, base_likelihood: 4 },
  { title: 'İtibar Riski',                 category: 'İtibar',        base_impact: 3, base_likelihood: 2 },
  { title: 'Stratejik Risk',               category: 'Stratejik',     base_impact: 4, base_likelihood: 2 },
];

// Entity type → best-fit risk category (for seeding)
const TYPE_TO_RISK_CAT = {
  HEADQUARTERS: 'Stratejik',
  DEPARTMENT:   'Operasyonel',
  UNIT:         'Operasyonel',
  BRANCH:       'Kredi',
  SUBSIDIARY:   'Piyasa',
  VENDOR:       'Uyum',
  GROUP:        'Operasyonel',
  PROCESS:      'Operasyonel',
  IT_ASSET:     'BT',
};

// Path keyword → risk category override
const PATH_RISK_MAP = [
  { key: 'bt_gmy',   cat: 'BT' },
  { key: 'sg',       cat: 'BT' },
  { key: 'asy',      cat: 'BT' },
  { key: 'yg',       cat: 'BT' },
  { key: 'vy',       cat: 'BT' },
  { key: 'hzn',      cat: 'Piyasa' },
  { key: 'likidite', cat: 'Likidite' },
  { key: 'sukuk',    cat: 'Piyasa' },
  { key: 'kt_gmy',   cat: 'Kredi' },
  { key: 'rip_gmy',  cat: 'Kredi' },
  { key: 'ki',       cat: 'Kredi' },
  { key: 'pk',       cat: 'Kredi' },
  { key: 'uyum',     cat: 'Uyum' },
  { key: 'hukuk',    cat: 'Uyum' },
  { key: 'ic_kontrol', cat: 'Uyum' },
  { key: 'strateji', cat: 'Stratejik' },
  { key: 'sube',     cat: 'Kredi' },
];

// risk_score (0-100) → impact/likelihood
function scoreToImpactLikelihood(score) {
  const clamped = Math.max(0, Math.min(100, score));
  const impact     = Math.max(1, Math.min(5, Math.ceil(clamped / 20)));
  const likelihood = Math.max(1, Math.min(5, Math.round(clamped / 22)));
  return { impact, likelihood };
}

// control_effectiveness based on entity type (0-1)
function typeToControl(type) {
  const map = {
    HEADQUARTERS: 0.55, DEPARTMENT: 0.45, UNIT: 0.40,
    BRANCH: 0.50, SUBSIDIARY: 0.35, VENDOR: 0.30,
    GROUP: 0.45, PROCESS: 0.40, IT_ASSET: 0.35,
  };
  return map[type] ?? 0.40;
}

async function run() {
  console.log('=== Risk Data Seed ===\n');

  // 1. Create risk definitions
  console.log('1. Risk tanımları oluşturuluyor...');
  const { data: existingDefs } = await supabase
    .from('risk_definitions').select('title').eq('tenant_id', RISK_TENANT);
  const existingTitles = new Set((existingDefs || []).map(d => d.title));

  const defsToInsert = RISK_DEFS
    .filter(d => !existingTitles.has(d.title))
    .map(d => ({ ...d, tenant_id: RISK_TENANT }));

  let defMap = new Map();
  if (defsToInsert.length > 0) {
    const { data: inserted, error } = await supabase
      .from('risk_definitions').insert(defsToInsert).select('id, category');
    if (error) { console.error('Risk def insert hatası:', error.message); process.exit(1); }
    inserted.forEach(d => defMap.set(d.category, d.id));
    console.log(`   Oluşturuldu: ${inserted.length} risk tanımı`);
  }

  // Also fetch existing ones
  const { data: allDefs } = await supabase
    .from('risk_definitions').select('id, category').eq('tenant_id', RISK_TENANT);
  (allDefs || []).forEach(d => { if (!defMap.has(d.category)) defMap.set(d.category, d.id); });
  console.log(`   Toplam risk tanımı: ${defMap.size}`);

  // 2. Fetch all entities
  console.log('\n2. Varlıklar alınıyor...');
  const { data: entities, error: entErr } = await supabase
    .from('audit_entities')
    .select('id, name, type, path, risk_score')
    .eq('tenant_id', ORG_TENANT)
    .eq('status', 'ACTIVE')
    .order('path');
  if (entErr) { console.error('Entities hatası:', entErr.message); process.exit(1); }
  console.log(`   ${entities.length} aktif varlık bulundu`);

  // 3. Check which already have assessments
  const { data: existingAsmts } = await supabase
    .from('risk_assessments').select('entity_id').eq('tenant_id', RISK_TENANT);
  const assessedSet = new Set((existingAsmts || []).map(a => a.entity_id));
  const toAssess = entities.filter(e => !assessedSet.has(e.id));
  console.log(`   Değerlendirme bekleyen: ${toAssess.length}`);

  if (toAssess.length === 0) {
    console.log('\n✅ Tüm varlıkların değerlendirmesi zaten mevcut.');
    return;
  }

  // 4. Create assessments
  console.log('\n3. Risk değerlendirmeleri oluşturuluyor...');

  const rows = toAssess.map(entity => {
    // Determine risk category
    const pathLower = (entity.path || '').toLowerCase();
    let category = TYPE_TO_RISK_CAT[entity.type] || 'Operasyonel';
    for (const { key, cat } of PATH_RISK_MAP) {
      if (pathLower.includes(key)) { category = cat; break; }
    }
    // Fallback to Operasyonel if category not in defMap
    const riskId = defMap.get(category) || defMap.get('Operasyonel') || [...defMap.values()][0];

    const score = entity.risk_score ?? 50;
    const { impact, likelihood } = scoreToImpactLikelihood(score);
    const control = typeToControl(entity.type);

    return {
      tenant_id: RISK_TENANT,
      entity_id: entity.id,
      risk_id: riskId,
      impact,
      likelihood,
      control_effectiveness: control,
      justification: `${entity.name} için risk skoru ${score} baz alınarak değerlendirilmiştir.`,
    };
  });

  // Insert in batches of 50
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { data, error } = await supabase.from('risk_assessments').insert(batch).select('id');
    if (error) {
      console.error(`   Batch ${i}-${i+50} hatası: ${error.message}`);
    } else {
      inserted += data.length;
      process.stdout.write(`\r   İlerleme: ${inserted}/${rows.length}`);
    }
  }

  console.log(`\n\n✅ Tamamlandı! ${inserted} risk değerlendirmesi oluşturuldu.`);

  // Final summary
  const { data: final } = await supabase
    .from('risk_assessments').select('impact, likelihood, inherent_risk_score')
    .eq('tenant_id', RISK_TENANT);
  const scores = (final || []).map(a => a.inherent_risk_score);
  const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
  const dist = { kritik: 0, yuksek: 0, orta: 0, dusuk: 0 };
  scores.forEach(s => {
    if (s >= 15) dist.kritik++;
    else if (s >= 10) dist.yuksek++;
    else if (s >= 5) dist.orta++;
    else dist.dusuk++;
  });
  console.log(`\nOrt. doğal risk: ${avg.toFixed(1)} | Dağılım:`, JSON.stringify(dist));
}

run().catch(err => { console.error(err); process.exit(1); });
