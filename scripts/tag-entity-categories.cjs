// scripts/tag-entity-categories.cjs
// Tüm audit_entities kayıtlarına IT veya İdari etiketi atar
// node scripts/tag-entity-categories.cjs [--force]  (--force: mevcut etiketleri de yeniden yazar)

const SUPABASE_URL = 'https://dnycfawsmfvrandsgcpv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_725DYXIhBajO2XnJt_aV8A_ftPjOozo';
const TENANT_ID   = '11111111-1111-1111-1111-111111111111';
const FORCE       = process.argv.includes('--force');

function normalize(str) {
  return ' ' + str.toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c') + ' ';
}

const IT_KEYWORDS = [
  'siber', 'bilgi teknoloji', ' bt ', 'yazilim', 'donanim',
  'dijital bankac', 'veri yonet', 'veri merkez', 'data',
  'network', 'altyapi ve sistem', 'altyapi yonet',
  'core banking', 'swift', 'mobil', 'internet bankac',
  ' it ', 'teknoloji', 'server', 'veritabani',
  ' api ', 'entegrasyon', 'kartli odeme', 'odeme sistemleri',
  'yazilim gelistir', 'bt surec', 'bt yonetisim', 'bt operasyon',
  'kimlik ve erisim', 'bilgi guvenligi', 'is surekliligi',
  'felaket kurtarma', 'olay ve problem', 'bulut yonetim',
  'elektronik bankac', 'ag ve sistem', 'log yonetim',
];

function inferCategory(name, type) {
  if (type === 'IT_ASSET') return 'IT';
  const lower = normalize(name);
  return IT_KEYWORDS.some(kw => lower.includes(kw)) ? 'IT' : 'İdari';
}

async function fetchEntities() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/audit_entities?tenant_id=eq.${TENANT_ID}&select=id,name,type,metadata`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  return res.json();
}

async function patchEntity(id, mergedMetadata) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/audit_entities?id=eq.${id}`,
    {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ metadata: mergedMetadata }),
    }
  );
  return res.status;
}

async function main() {
  const entities = await fetchEntities();
  if (!Array.isArray(entities)) {
    console.error('Beklenmeyen yanıt:', entities);
    return;
  }
  console.log(`${entities.length} entity bulundu. ${FORCE ? '(--force: hepsi yeniden etiketlenecek)' : ''}`);

  const toUpdate = FORCE
    ? entities
    : entities.filter(e => !e.metadata?.entity_category);

  console.log(`${entities.length - toUpdate.length} zaten etiketli, ${toUpdate.length} tanesi işlenecek.\n`);

  let itCount = 0, idariCount = 0;
  for (const entity of toUpdate) {
    const cat = inferCategory(entity.name, entity.type);
    const merged = { ...(entity.metadata ?? {}), entity_category: cat };
    const status = await patchEntity(entity.id, merged);
    if (status === 204) {
      if (cat === 'IT') itCount++; else idariCount++;
      console.log(`  [${status}] ${cat.padEnd(5)} ← ${entity.name}`);
    } else {
      console.error(`  [HATA ${status}] ← ${entity.name}`);
    }
  }

  console.log(`\nTamamlandı: ${itCount} IT, ${idariCount} İdari etiketlendi.`);
}

main().catch(console.error);
