import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dnycfawsmfvrandsgcpv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_725DYXIhBajO2XnJt_aV8A_ftPjOozo';
const TENANT = '11111111-1111-1111-1111-111111111111';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const EXPECTED_PATHS = [
  'org.hq',
  'org.hq.kb_gmy', 'org.hq.tic_gmy', 'org.hq.bb_gmy', 'org.hq.hzn_gmy',
  'org.hq.kt_gmy', 'org.hq.rip_gmy', 'org.hq.op_gmy', 'org.hq.bt_gmy',
  'org.hq.fin_gmy', 'org.hq.ik_gmy',
  'org.hq.ic_denetim', 'org.hq.ic_kontrol', 'org.hq.risk_yonetimi',
  'org.hq.hukuk', 'org.hq.uyum', 'org.hq.strateji', 'org.hq.pazarlama',
  'org.hq.kb_gmy.kp', 'org.hq.kb_gmy.pf', 'org.hq.kb_gmy.tk',
  'org.hq.tic_gmy.tp', 'org.hq.tic_gmy.kobi', 'org.hq.tic_gmy.bolge',
  'org.hq.bb_gmy.buy', 'org.hq.bb_gmy.kos', 'org.hq.bb_gmy.db',
  'org.hq.hzn_gmy.hazine', 'org.hq.hzn_gmy.lk', 'org.hq.hzn_gmy.sukuk', 'org.hq.hzn_gmy.ub',
  'org.hq.kt_gmy.kkt', 'org.hq.kt_gmy.tkt', 'org.hq.kt_gmy.fa',
  'org.hq.rip_gmy.ki', 'org.hq.rip_gmy.pk', 'org.hq.rip_gmy.tahsilat',
  'org.hq.op_gmy.bo', 'org.hq.op_gmy.os', 'org.hq.op_gmy.dto',
  'org.hq.bt_gmy.yg', 'org.hq.bt_gmy.asy', 'org.hq.bt_gmy.sg', 'org.hq.bt_gmy.vy',
  'org.hq.fin_gmy.fr', 'org.hq.fin_gmy.bp', 'org.hq.fin_gmy.mk',
  'org.hq.ik_gmy.ia', 'org.hq.ik_gmy.pym', 'org.hq.ik_gmy.eg',
];

async function run() {
  // Fetch ALL org.hq entities
  const { data: all, error } = await supabase
    .from('audit_entities')
    .select('id, name, type, path, created_at')
    .eq('tenant_id', TENANT)
    .in('type', ['HEADQUARTERS', 'DEPARTMENT', 'UNIT'])
    .order('path')
    .order('created_at');

  if (error) { console.error(error.message); process.exit(1); }

  console.log(`\nToplam org.hq varlık: ${all.length}`);
  console.log(`Beklenen: ${EXPECTED_PATHS.length}\n`);

  // Find duplicates
  const byPath = {};
  for (const e of all) {
    if (!byPath[e.path]) byPath[e.path] = [];
    byPath[e.path].push(e);
  }

  const dups = Object.entries(byPath).filter(([, arr]) => arr.length > 1);
  if (dups.length === 0) {
    console.log('✅ Duplicate yok!');
  } else {
    console.log(`⚠️  ${dups.length} path'te duplicate var:\n`);
    for (const [path, arr] of dups) {
      console.log(`  ${path}: ${arr.length} kayıt`);
      for (const e of arr) console.log(`    ${e.id} | ${e.name} | ${e.created_at}`);
    }

    // Clean duplicates: keep newest (last created_at), delete older ones
    console.log('\nDuplicate temizleniyor (en yenisi korunuyor)...');
    let deleted = 0;
    for (const [path, arr] of dups) {
      // sort by created_at desc, keep first
      arr.sort((a, b) => b.created_at.localeCompare(a.created_at));
      const toDelete = arr.slice(1); // all but newest
      for (const e of toDelete) {
        const { error: delErr } = await supabase.from('audit_entities').delete().eq('id', e.id);
        if (delErr) {
          console.log(`  ⚠️  Silinemedi (${e.id} | ${path}): ${delErr.message}`);
          // Try updating path to make it unique so UI doesn't show both
          const tempPath = `${e.path}__dup_${e.id.slice(0, 8)}`;
          const { error: updErr } = await supabase.from('audit_entities').update({ path: tempPath, status: 'INACTIVE' }).eq('id', e.id);
          if (updErr) console.log(`    INACTIVE yapılamadı da: ${updErr.message}`);
          else console.log(`    INACTIVE + path değiştirildi: ${tempPath}`);
        } else {
          console.log(`  ✅ Silindi: ${e.id} | ${path}`);
          deleted++;
        }
      }
    }
    console.log(`\nTemizlendi: ${deleted}`);
  }

  // Check missing paths
  const pathSet = new Set(Object.keys(byPath));
  const missing = EXPECTED_PATHS.filter(p => !pathSet.has(p));
  if (missing.length > 0) {
    console.log(`\n⚠️  Eksik path'ler (${missing.length}):`);
    missing.forEach(p => console.log(`  ${p}`));
  } else {
    console.log('\n✅ Tüm beklenen path\'ler mevcut!');
  }

  // Check unexpected/old paths
  const unexpected = Object.keys(byPath).filter(p => !EXPECTED_PATHS.includes(p));
  if (unexpected.length > 0) {
    console.log(`\nℹ️  Beklenmeyen/eski org.hq path\'ler (${unexpected.length}):`);
    unexpected.forEach(p => {
      const items = byPath[p];
      items.forEach(e => console.log(`  ${p} | ${e.type} | ${e.name}`));
    });
  }

  // Type counts
  const { data: allTypes } = await supabase
    .from('audit_entities')
    .select('type')
    .eq('tenant_id', TENANT)
    .eq('status', 'ACTIVE');
  const counts = {};
  for (const e of allTypes || []) counts[e.type] = (counts[e.type] || 0) + 1;
  console.log('\nTüm aktif varlık tipleri:', JSON.stringify(counts, null, 2));
}

run().catch(err => { console.error(err); process.exit(1); });
