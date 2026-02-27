import type { ThoughtStep, AgentRole } from './types';

function getInvestigatorChain(target: string): ThoughtStep[] {
  return [
    {
      type: 'THINKING', delay: 800,
      content: `Hedef varlik alindi: "${target}". OSINT taramasi baslatiliyor. Ilk adim: Ticaret Sicil Gazetesi ve OpenCorporates kontrolu.`,
    },
    {
      type: 'ACTION', delay: 1200,
      content: 'OpenCorporates API\'ye sorgu gonderiliyor... Vergi kimlik numarasi: ARASTIRILIYOR',
      action: 'QUERY_OPENCORPORATES',
      toolOutput: { api: 'OpenCorporates', status: 'QUERYING', endpoint: '/companies/search' },
    },
    {
      type: 'OBSERVATION', delay: 1500,
      content: 'Sirket kaydi bulundu. Kurulus tarihi: 2025-11-01. Yeni kurulus. Risk bayragi: YENI_SIRKET.',
      toolOutput: { matched: true, registration_date: '2025-11-01', flag: 'NEW_ENTITY', risk_delta: '+15' },
    },
    {
      type: 'THINKING', delay: 1000,
      content: 'Yeni kurulus riski yuksek. MASAK supheli islem listesiyle capraz kontrol yapiliyor...',
    },
    {
      type: 'ACTION', delay: 1300,
      content: `Ic yaptirim veritabaninda SQL sorgusu calistiriliyor... SELECT * FROM sanctions_list WHERE entity_name ILIKE '%${target}%'`,
      action: 'QUERY_SANCTIONS_DB',
      toolOutput: { query: 'sanctions_list', filter: target },
    },
    {
      type: 'OBSERVATION', delay: 1200,
      content: 'Dogrudan eslesme yok, ancak kayitli adres bilinen paravan sirket kalibiyla uyusuyor. Adres benzerlik skoru: 0.87',
      toolOutput: { direct_match: false, address_similarity: 0.87, pattern: 'SHELL_COMPANY' },
    },
    {
      type: 'THINKING', delay: 900,
      content: 'Finansal oruntuler Benford Yasasi ile analiz ediliyor. Fatura dagilimi istatistiksel teste tabi tutuluyor...',
    },
    {
      type: 'ACTION', delay: 1800,
      content: 'Fatura dagilimi uzerinde istatistiksel analiz yurutuluyor... Chi-kare testi uygulaniyor.',
      action: 'RUN_BENFORD_ANALYSIS',
      toolOutput: { method: 'chi_squared', sample_size: 30, processing: true },
    },
    {
      type: 'OBSERVATION', delay: 1400,
      content: 'Ki-kare degeri 187.42, kritik esigi asiyor (kritik: 15.51). Ilk basamak 9 orani %37.5 (beklenen: %4.6). ANOMALI DOGRULANDI.',
      toolOutput: { chi_squared: 187.42, critical_threshold: 15.51, digit_9_pct: 37.5, anomaly: true },
    },
    {
      type: 'CONCLUSION', delay: 600,
      content: 'YUKSEK RISK. Sorusturma Kasasina sevk onerilir. Bulgu taslagi olusturuluyor. Onerilen aksiyon: ESCALATE_TO_VAULT.',
      toolOutput: { risk_level: 'HIGH', recommended_action: 'ESCALATE_TO_VAULT', confidence: 0.94 },
    },
  ];
}

function getNegotiatorChain(target: string): ThoughtStep[] {
  return [
    {
      type: 'THINKING', delay: 800,
      content: `Bulgu muzakere talebi alindi: "${target}". Denetlenen birim yaniti yukleniyor...`,
    },
    {
      type: 'ACTION', delay: 1200,
      content: 'Denetlenen birimin karsi argumani COSO Cercevesi uzerinden analiz ediliyor...',
      action: 'ANALYZE_COUNTER_ARGUMENT',
      toolOutput: { framework: 'COSO', analysis_type: 'counter_argument' },
    },
    {
      type: 'OBSERVATION', delay: 1400,
      content: 'Arguman operasyonel risk icin gecerli ancak kontrol acigini ele almiyor. COSO IC-05 ihlali devam ediyor.',
      toolOutput: { valid_for: 'operational_risk', addresses_gap: false, coso_ref: 'IC-05' },
    },
    {
      type: 'THINKING', delay: 1000,
      content: 'Optimum muzakere pozisyonu hesaplaniyor. Emsal veritabani taraniyor...',
    },
    {
      type: 'ACTION', delay: 1500,
      content: 'Benzer vakalar icin bulgu emsal veritabani sorgulanıyor...',
      action: 'QUERY_PRECEDENT_DB',
      toolOutput: { query: 'finding_precedents', category: 'control_gap', min_severity: 'HIGH' },
    },
    {
      type: 'OBSERVATION', delay: 1300,
      content: '3 benzer bulgu bulundu. Sonuc: 2\'si dusurulmus siddetle kabul edildi, 1\'i ust yonetime sevk edildi.',
      toolOutput: { precedents_found: 3, accepted_reduced: 2, escalated: 1, avg_resolution_days: 14 },
    },
    {
      type: 'THINKING', delay: 900,
      content: 'Kanit bazli siddet gerekcesiyle karsi teklif formule ediliyor. Risk tolerans analizi tamamlaniyor...',
    },
    {
      type: 'CONCLUSION', delay: 600,
      content: 'YUKSEK siddeti korumak onerilir. Degistirilmis oneri zaman cizelgesi (60 gun -> 90 gun) ile muzakere yapilabilir. Guven: %87.',
      toolOutput: { recommendation: 'MAINTAIN_HIGH', timeline: '60d->90d', confidence: 0.87 },
    },
  ];
}

function getChaosMonkeyChain(target: string): ThoughtStep[] {
  return [
    {
      type: 'THINKING', delay: 800,
      content: `Kaos testi baslatiliyor. Hedef: "${target}". Ilk test: eszamanli onay yaris kosulu simulasyonu...`,
    },
    {
      type: 'ACTION', delay: 1500,
      content: 'Eszamanli onay yaris kosulu simule ediliyor... 5 paralel onay istegi gonderiliyor.',
      action: 'SIMULATE_RACE_CONDITION',
      toolOutput: { concurrent_requests: 5, target_table: 'vault_access_requests' },
    },
    {
      type: 'OBSERVATION', delay: 1200,
      content: 'Pipeline eszamanli onaylari dogru sekilde isliyor. Yaris kosulu tespit edilmedi. Sonuc: BASARILI.',
      toolOutput: { race_condition: false, result: 'PASS', latency_p99: '120ms' },
    },
    {
      type: 'THINKING', delay: 900,
      content: 'Yetkisiz rol ile onay edge case testi yapiliyor. RLS politika dayanakliligi kontrol ediliyor...',
    },
    {
      type: 'ACTION', delay: 1300,
      content: 'DENETCI rolu ile onay enjeksiyonu deneniyor (olmasi gereken: YONETICI). RLS bypass testi...',
      action: 'TEST_UNAUTHORIZED_APPROVAL',
      toolOutput: { attempted_role: 'AUDITOR', required_role: 'MANAGER' },
    },
    {
      type: 'OBSERVATION', delay: 1400,
      content: 'RLS politikasi dogru sekilde reddetti. Erisim reddedildi - beklenen sonuc.',
      toolOutput: { rls_blocked: true, policy: 'vault_access_update', result: 'PASS' },
    },
    {
      type: 'THINKING', delay: 800,
      content: 'Yuk altinda veri butunlugu test ediliyor. Stres testi baslatiliyor...',
    },
    {
      type: 'ACTION', delay: 2000,
      content: '100 eszamanli bulgu gonderimi simule ediliyor...',
      action: 'STRESS_TEST_FINDINGS',
      toolOutput: { batch_size: 100, concurrent: true, target: 'audit_findings' },
    },
    {
      type: 'OBSERVATION', delay: 1200,
      content: 'Tum bulgular benzersiz ID ile olusturuldu. Ciftleme tespit edilmedi. Ort. yanit: 45ms.',
      toolOutput: { total_inserted: 100, duplicates: 0, avg_response_ms: 45, max_response_ms: 120 },
    },
    {
      type: 'CONCLUSION', delay: 600,
      content: 'Sistem dayanikliligi dogrulandi. Tum kaos testleri BASARILI. Toplam: 3 test, 3 basarili, 0 basarisiz.',
      toolOutput: { total_tests: 3, passed: 3, failed: 0, system_resilience: 'VERIFIED' },
    },
  ];
}

export function getThoughtChain(role: AgentRole, target: string): ThoughtStep[] {
  switch (role) {
    case 'INVESTIGATOR': return getInvestigatorChain(target);
    case 'NEGOTIATOR': return getNegotiatorChain(target);
    case 'CHAOS_MONKEY': return getChaosMonkeyChain(target);
  }
}
