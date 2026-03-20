import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dnycfawsmfvrandsgcpv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_725DYXIhBajO2XnJt_aV8A_ftPjOozo';
const TENANT = '11111111-1111-1111-1111-111111111111';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Full new org structure
const NEW_ENTITIES = [
  // HQ
  { name: 'Genel Müdürlük',                            type: 'HEADQUARTERS', path: 'org.hq',                  risk_score: 60, velocity_multiplier: 1.0 },
  // GMYler
  { name: 'Kurumsal Bankacılık GMY',                    type: 'DEPARTMENT',   path: 'org.hq.kb_gmy',           risk_score: 65, velocity_multiplier: 1.1 },
  { name: 'Ticari & KOBİ Bankacılığı GMY',             type: 'DEPARTMENT',   path: 'org.hq.tic_gmy',          risk_score: 60, velocity_multiplier: 1.0 },
  { name: 'Bireysel Bankacılık GMY',                    type: 'DEPARTMENT',   path: 'org.hq.bb_gmy',           risk_score: 52, velocity_multiplier: 1.0 },
  { name: 'Hazine ve Uluslararası Bankacılık GMY',      type: 'DEPARTMENT',   path: 'org.hq.hzn_gmy',          risk_score: 75, velocity_multiplier: 1.2 },
  { name: 'Kredi Tahsis GMY',                           type: 'DEPARTMENT',   path: 'org.hq.kt_gmy',           risk_score: 70, velocity_multiplier: 1.1 },
  { name: 'Risk İzleme ve Problemli Krediler GMY',      type: 'DEPARTMENT',   path: 'org.hq.rip_gmy',          risk_score: 72, velocity_multiplier: 1.2 },
  { name: 'Operasyon GMY',                              type: 'DEPARTMENT',   path: 'org.hq.op_gmy',           risk_score: 58, velocity_multiplier: 1.0 },
  { name: 'Bilgi Teknolojileri GMY',                    type: 'DEPARTMENT',   path: 'org.hq.bt_gmy',           risk_score: 73, velocity_multiplier: 1.2 },
  { name: 'Finans ve Muhasebe GMY',                     type: 'DEPARTMENT',   path: 'org.hq.fin_gmy',          risk_score: 50, velocity_multiplier: 1.0 },
  { name: 'İnsan Kaynakları GMY',                       type: 'DEPARTMENT',   path: 'org.hq.ik_gmy',           risk_score: 40, velocity_multiplier: 0.9 },
  // Bağımsız birimler (doğrudan HQ'ya bağlı)
  { name: 'İç Denetim Başkanlığı (Teftiş Kurulu)',      type: 'UNIT',         path: 'org.hq.ic_denetim',       risk_score: 55, velocity_multiplier: 1.0 },
  { name: 'İç Kontrol Başkanlığı',                      type: 'UNIT',         path: 'org.hq.ic_kontrol',       risk_score: 50, velocity_multiplier: 1.0 },
  { name: 'Risk Yönetimi Başkanlığı',                   type: 'UNIT',         path: 'org.hq.risk_yonetimi',    risk_score: 60, velocity_multiplier: 1.0 },
  { name: 'Hukuk Müşavirliği',                          type: 'UNIT',         path: 'org.hq.hukuk',            risk_score: 45, velocity_multiplier: 0.9 },
  { name: 'Uyum ve MASAK Başkanlığı',                   type: 'UNIT',         path: 'org.hq.uyum',             risk_score: 58, velocity_multiplier: 1.0 },
  { name: 'Strateji ve Kurumsal Gelişim',               type: 'UNIT',         path: 'org.hq.strateji',         risk_score: 40, velocity_multiplier: 0.9 },
  { name: 'Pazarlama ve Kurumsal İletişim',             type: 'UNIT',         path: 'org.hq.pazarlama',        risk_score: 35, velocity_multiplier: 0.9 },
  // Alt birimler (sadece INSERT — mevcut entity yok bunlar için)
  { name: 'Kurumsal Pazarlama',                         type: 'UNIT',         path: 'org.hq.kb_gmy.kp',        risk_score: 60, velocity_multiplier: 1.0,  insertOnly: true },
  { name: 'Proje Finansmanı',                           type: 'UNIT',         path: 'org.hq.kb_gmy.pf',        risk_score: 65, velocity_multiplier: 1.1,  insertOnly: true },
  { name: 'Ticari Krediler',                            type: 'UNIT',         path: 'org.hq.kb_gmy.tk',        risk_score: 68, velocity_multiplier: 1.1,  insertOnly: true },
  { name: 'Ticari Pazarlama',                           type: 'UNIT',         path: 'org.hq.tic_gmy.tp',       risk_score: 55, velocity_multiplier: 1.0,  insertOnly: true },
  { name: 'KOBİ Bankacılığı',                          type: 'UNIT',         path: 'org.hq.tic_gmy.kobi',     risk_score: 60, velocity_multiplier: 1.0,  insertOnly: true },
  { name: 'Bölge Müdürlükleri',                         type: 'UNIT',         path: 'org.hq.tic_gmy.bolge',    risk_score: 55, velocity_multiplier: 1.0,  insertOnly: true },
  { name: 'Bireysel Ürün Yönetimi',                    type: 'UNIT',         path: 'org.hq.bb_gmy.buy',       risk_score: 50, velocity_multiplier: 1.0,  insertOnly: true },
  { name: 'Kartlı Ödeme Sistemleri',                    type: 'UNIT',         path: 'org.hq.bb_gmy.kos',       risk_score: 60, velocity_multiplier: 1.1,  insertOnly: true },
  { name: 'Dijital Bankacılık',                         type: 'UNIT',         path: 'org.hq.bb_gmy.db',        risk_score: 55, velocity_multiplier: 1.0,  insertOnly: true },
  { name: 'Hazine',                                     type: 'UNIT',         path: 'org.hq.hzn_gmy.hazine',   risk_score: 78, velocity_multiplier: 1.2,  insertOnly: true },
  { name: 'Likidite Yönetimi',                          type: 'UNIT',         path: 'org.hq.hzn_gmy.lk',       risk_score: 72, velocity_multiplier: 1.2,  insertOnly: true },
  { name: 'Sukuk İşlemleri',                            type: 'UNIT',         path: 'org.hq.hzn_gmy.sukuk',    risk_score: 70, velocity_multiplier: 1.1,  insertOnly: true },
  { name: 'Uluslararası Bankacılık',                    type: 'UNIT',         path: 'org.hq.hzn_gmy.ub',       risk_score: 68, velocity_multiplier: 1.1,  insertOnly: true },
  { name: 'Kurumsal Kredi Tahsis',                      type: 'UNIT',         path: 'org.hq.kt_gmy.kkt',       risk_score: 72, velocity_multiplier: 1.1,  insertOnly: true },
  { name: 'Ticari Kredi Tahsis',                        type: 'UNIT',         path: 'org.hq.kt_gmy.tkt',       risk_score: 68, velocity_multiplier: 1.0,  insertOnly: true },
  { name: 'Finansal Analiz',                            type: 'UNIT',         path: 'org.hq.kt_gmy.fa',        risk_score: 65, velocity_multiplier: 1.0,  insertOnly: true },
  { name: 'Kredi İzleme',                               type: 'UNIT',         path: 'org.hq.rip_gmy.ki',       risk_score: 70, velocity_multiplier: 1.1,  insertOnly: true },
  { name: 'Problemli Krediler',                         type: 'UNIT',         path: 'org.hq.rip_gmy.pk',       risk_score: 75, velocity_multiplier: 1.2,  insertOnly: true },
  { name: 'Tahsilat',                                   type: 'UNIT',         path: 'org.hq.rip_gmy.tahsilat', risk_score: 68, velocity_multiplier: 1.0,  insertOnly: true },
  { name: 'Bankacılık Operasyonları',                   type: 'UNIT',         path: 'org.hq.op_gmy.bo',        risk_score: 58, velocity_multiplier: 1.0,  insertOnly: true },
  { name: 'Ödeme Sistemleri',                           type: 'UNIT',         path: 'org.hq.op_gmy.os',        risk_score: 62, velocity_multiplier: 1.1,  insertOnly: true },
  { name: 'Dış Ticaret Operasyonları',                  type: 'UNIT',         path: 'org.hq.op_gmy.dto',       risk_score: 60, velocity_multiplier: 1.0,  insertOnly: true },
  { name: 'Yazılım Geliştirme',                         type: 'UNIT',         path: 'org.hq.bt_gmy.yg',        risk_score: 70, velocity_multiplier: 1.1,  insertOnly: true },
  { name: 'Altyapı ve Sistem Yönetimi',                 type: 'UNIT',         path: 'org.hq.bt_gmy.asy',       risk_score: 72, velocity_multiplier: 1.2,  insertOnly: true },
  { name: 'Siber Güvenlik',                             type: 'UNIT',         path: 'org.hq.bt_gmy.sg',        risk_score: 78, velocity_multiplier: 1.3,  insertOnly: true },
  { name: 'Veri Yönetimi',                              type: 'UNIT',         path: 'org.hq.bt_gmy.vy',        risk_score: 68, velocity_multiplier: 1.1,  insertOnly: true },
  { name: 'Finansal Raporlama',                         type: 'UNIT',         path: 'org.hq.fin_gmy.fr',       risk_score: 50, velocity_multiplier: 1.0,  insertOnly: true },
  { name: 'Bütçe ve Planlama',                          type: 'UNIT',         path: 'org.hq.fin_gmy.bp',       risk_score: 45, velocity_multiplier: 0.9,  insertOnly: true },
  { name: 'Mali Kontrol',                               type: 'UNIT',         path: 'org.hq.fin_gmy.mk',       risk_score: 52, velocity_multiplier: 1.0,  insertOnly: true },
  { name: 'İşe Alım',                                   type: 'UNIT',         path: 'org.hq.ik_gmy.ia',        risk_score: 38, velocity_multiplier: 0.9,  insertOnly: true },
  { name: 'Performans Yönetimi',                        type: 'UNIT',         path: 'org.hq.ik_gmy.pym',       risk_score: 40, velocity_multiplier: 0.9,  insertOnly: true },
  { name: 'Eğitim ve Gelişim',                          type: 'UNIT',         path: 'org.hq.ik_gmy.eg',        risk_score: 35, velocity_multiplier: 0.9,  insertOnly: true },
];

async function run() {
  console.log('=== Org Structure Migration (UPDATE + INSERT) ===\n');

  // 1. Get current HQ/DEPT/UNIT entities sorted by path
  console.log('1. Mevcut org varlıkları alınıyor...');
  const { data: existing, error: fetchErr } = await supabase
    .from('audit_entities')
    .select('id, name, type, path')
    .eq('tenant_id', TENANT)
    .in('type', ['HEADQUARTERS', 'DEPARTMENT', 'UNIT'])
    .order('path');
  if (fetchErr) { console.error('Fetch hatası:', fetchErr.message); process.exit(1); }
  console.log(`   Mevcut: ${existing.length} varlık`);

  // 2. Update existing entities in-place (map by index)
  const toUpdate = NEW_ENTITIES.filter(e => !e.insertOnly);
  console.log(`\n2. ${toUpdate.length} varlık güncelleniyor (UPDATE)...`);

  let updateOk = 0;
  for (let i = 0; i < Math.min(toUpdate.length, existing.length); i++) {
    const oldEntity = existing[i];
    const newDef = toUpdate[i];
    const { error } = await supabase
      .from('audit_entities')
      .update({
        name: newDef.name,
        type: newDef.type,
        path: newDef.path,
        risk_score: newDef.risk_score,
        velocity_multiplier: newDef.velocity_multiplier,
        status: 'ACTIVE',
      })
      .eq('id', oldEntity.id);
    if (error) {
      console.error(`   HATA (${oldEntity.name} → ${newDef.name}): ${error.message}`);
    } else {
      updateOk++;
    }
  }
  console.log(`   Güncellendi: ${updateOk}/${toUpdate.length}`);

  // 3. Insert toUpdate entries that had no existing entity to map to
  const unmapped = toUpdate.slice(existing.length);
  if (unmapped.length > 0) {
    console.log(`\n   ${unmapped.length} eşleşmeyen varlık INSERT ediliyor...`);
    const unmappedRows = unmapped.map(e => ({
      tenant_id: TENANT, name: e.name, type: e.type, path: e.path,
      risk_score: e.risk_score, velocity_multiplier: e.velocity_multiplier, status: 'ACTIVE', metadata: {},
    }));
    const { data: insExtra, error: insExErr } = await supabase.from('audit_entities').insert(unmappedRows).select('id');
    if (insExErr) console.error('   INSERT hatası:', insExErr.message);
    else console.log(`   Eklendi: ${insExtra?.length}`);
  }

  // 4. Insert new sub-unit entities (insertOnly)
  const toInsert = NEW_ENTITIES.filter(e => e.insertOnly);
  console.log(`\n3. ${toInsert.length} yeni alt birim ekleniyor (INSERT)...`);

  // Check which paths already exist
  const { data: existingPaths } = await supabase
    .from('audit_entities')
    .select('path')
    .eq('tenant_id', TENANT);
  const existingPathSet = new Set((existingPaths || []).map(e => e.path));

  const rows = toInsert
    .filter(e => !existingPathSet.has(e.path))
    .map(e => ({
      tenant_id: TENANT,
      name: e.name,
      type: e.type,
      path: e.path,
      risk_score: e.risk_score,
      velocity_multiplier: e.velocity_multiplier,
      status: 'ACTIVE',
      metadata: {},
    }));

  if (rows.length > 0) {
    const { data: inserted, error: insErr } = await supabase.from('audit_entities').insert(rows).select('id');
    if (insErr) { console.error('INSERT hatası:', insErr.message); }
    else console.log(`   Eklendi: ${inserted?.length} yeni alt birim`);
  } else {
    console.log('   Tüm alt birimler zaten mevcut.');
  }

  // 5. Update BRANCH paths to org.sube.*
  console.log('\n4. Şube path\'leri güncelleniyor...');
  const { data: branches } = await supabase
    .from('audit_entities')
    .select('id, name')
    .eq('tenant_id', TENANT)
    .eq('type', 'BRANCH')
    .order('name');

  let branchOk = 0;
  for (let i = 0; i < (branches || []).length; i++) {
    const newPath = `org.sube.br${String(i + 1).padStart(3, '0')}`;
    if (!existingPathSet.has(newPath) || branches[i].path !== newPath) {
      const { error } = await supabase.from('audit_entities').update({ path: newPath }).eq('id', branches[i].id);
      if (!error) branchOk++;
    }
  }
  console.log(`   Güncellendi: ${branchOk} şube`);

  // 6. Final check
  const { data: final } = await supabase
    .from('audit_entities')
    .select('type')
    .eq('tenant_id', TENANT)
    .eq('status', 'ACTIVE');

  const counts = {};
  for (const e of final || []) counts[e.type] = (counts[e.type] || 0) + 1;
  console.log('\n✅ Migration tamamlandı!');
  console.log('Son durum:', JSON.stringify(counts, null, 2));
}

run().catch(err => { console.error('Hata:', err); process.exit(1); });
