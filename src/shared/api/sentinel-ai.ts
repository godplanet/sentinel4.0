import type { ProbeCategory, ProbeSeverity } from '@/entities/probe/model/types';

export interface AIProbeConfig {
  title: string;
  description: string;
  category: ProbeCategory;
  severity: ProbeSeverity;
  source: string;
  query_payload: string;
  schedule_cron: string;
  risk_threshold: number;
  reasoning: string;
}

export interface AIForensicInsight {
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  risk_label: string;
  reasoning: string;
  red_flags: string[];
  suggested_action: 'CREATE_FINDING' | 'ESCALATE' | 'MONITOR' | 'DISMISS';
  suggested_action_label: string;
  confidence: number;
  regulatory_refs: string[];
  next_steps: string[];
}

interface RulePattern {
  keywords: string[];
  config: Omit<AIProbeConfig, 'reasoning'>;
  reasoning: string;
}

const RULE_PATTERNS: RulePattern[] = [
  {
    keywords: ['cift', 'mükerrer', 'duplicate', 'tekrar', 'çift'],
    config: {
      title: 'Mukerrer Odeme Tespiti',
      description: 'Ayni fatura numarasina veya tutara sahip tekrar eden odemeleri tespit eder. Zaman penceresi icinde benzer islemleri tarar.',
      category: 'FRAUD',
      severity: 'HIGH',
      source: 'sap_gl',
      query_payload: `SELECT t1.id, t1.invoice_id, t1.amount, t1.vendor_id, t1.posting_date
FROM transactions t1
INNER JOIN transactions t2
  ON t1.invoice_id = t2.invoice_id
  AND t1.amount = t2.amount
  AND t1.id != t2.id
  AND t1.posting_date BETWEEN t2.posting_date - interval '24h'
    AND t2.posting_date + interval '24h'
WHERE t1.posting_date > now() - interval '30 days'
ORDER BY t1.posting_date DESC;`,
      schedule_cron: '0 */4 * * *',
      risk_threshold: 1,
    },
    reasoning: 'Mukerrer odeme tespiti icin ayni fatura numarasi + ayni tutar + 24 saat penceresi kombinasyonunu kullaniyorum. Bu, en yaygin odeme sahtekarligi desenlerinden biridir. BDDK yonetmeligi geregi her bankanin bu kontrolu calistirmasi zorunludur.',
  },
  {
    keywords: ['haftasonu', 'weekend', 'mesai', 'tatil', 'gece', 'saat'],
    config: {
      title: 'Mesai Disi Islem Izleyici',
      description: 'Haftasonu, resmi tatil ve mesai saatleri disinda gerceklestirilen yuksek tutarli islemleri tespit eder.',
      category: 'FRAUD',
      severity: 'HIGH',
      source: 'core_banking',
      query_payload: `SELECT id, account_id, amount, channel, created_at,
  EXTRACT(DOW FROM created_at) as day_of_week,
  EXTRACT(HOUR FROM created_at) as hour_of_day
FROM transactions
WHERE (
  EXTRACT(DOW FROM created_at) IN (0, 6)
  OR EXTRACT(HOUR FROM created_at) NOT BETWEEN 8 AND 18
)
AND amount > 100000
AND created_at > now() - interval '7 days'
ORDER BY amount DESC;`,
      schedule_cron: '0 8 * * 1-5',
      risk_threshold: 3,
    },
    reasoning: 'Mesai disi islemler fraud gostergelerinin basinda gelir. Ozellikle yuksek tutarli islemlerin normal calisma saatleri disinda yapilmasi, yetkisiz erisim veya ic dolandiricilik isaretleridir. MASAK rehberine gore bu bir "supheli islem gostergesi"dir.',
  },
  {
    keywords: ['bolunmus', 'split', 'smurfing', 'parcala', 'esik', 'limit'],
    config: {
      title: 'Yapilandirma (Smurfing) Tespiti',
      description: 'Raporlama esiginin hemen altinda kalan ardisik islemleri tespit eder. Kara para aklama gostergesi.',
      category: 'FRAUD',
      severity: 'HIGH',
      source: 'swift',
      query_payload: `SELECT account_id,
  COUNT(*) as tx_count,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount,
  MIN(created_at) as first_tx,
  MAX(created_at) as last_tx
FROM transactions
WHERE amount BETWEEN 8500 AND 10000
  AND created_at > now() - interval '48h'
GROUP BY account_id
HAVING COUNT(*) >= 3
ORDER BY total_amount DESC;`,
      schedule_cron: '0 */2 * * *',
      risk_threshold: 1,
    },
    reasoning: 'Yapilandirma (structuring/smurfing) analizi. Bildirim esiginin (10.000 TL) hemen altindaki islemler, kasten bolunerek raporlama yükümlülügünden kacinma amaci tasiyabilir. MASAK Supheli Islem Bildirimi Genel Tebligi Madde 4/b bunu acikca belirtir.',
  },
  {
    keywords: ['dormant', 'pasif', 'uyuyan', 'inaktif', 'hareketsiz'],
    config: {
      title: 'Hareketsiz Hesap Aktivasyon Alarmi',
      description: '6 aydan uzun suredir islem gormeyen hesaplardaki ani aktiviteleri izler.',
      category: 'FRAUD',
      severity: 'MEDIUM',
      source: 'core_banking',
      query_payload: `SELECT a.id, a.account_number, a.last_activity_date,
  t.amount, t.channel, t.ip_address, t.created_at as reactivation_date,
  (now() - a.last_activity_date) as dormancy_period
FROM accounts a
JOIN transactions t ON a.id = t.account_id
WHERE a.last_activity_date < now() - interval '180 days'
  AND t.created_at > now() - interval '48h'
ORDER BY t.amount DESC;`,
      schedule_cron: '0 6 * * *',
      risk_threshold: 2,
    },
    reasoning: 'Uzun sure hareketsiz kalan hesaplarin aniden aktive edilmesi, hesap devralma (account takeover) veya para aklama amacli kullanima isaret edebilir. Ozellikle farkli IP adresleri veya cihazlardan erisim durumunda risk artar.',
  },
  {
    keywords: ['yetki', 'onay', 'approval', 'segregation', 'görev', 'ayriligi'],
    config: {
      title: 'Gorev Ayriligi Ihlal Taramasi',
      description: 'Ayni kullanicinin hem olusturup hem onayladigi islemleri tespit eder.',
      category: 'COMPLIANCE',
      severity: 'HIGH',
      source: 'sap_gl',
      query_payload: `SELECT t.id, t.document_number, t.amount,
  t.created_by, t.approved_by,
  t.created_at, t.approved_at
FROM transactions t
WHERE t.created_by = t.approved_by
  AND t.amount > 50000
  AND t.created_at > now() - interval '30 days'
ORDER BY t.amount DESC;`,
      schedule_cron: '0 8 * * 1-5',
      risk_threshold: 1,
    },
    reasoning: 'Gorev ayriligi (Segregation of Duties - SoD) ic kontrol sisteminin temel tasidir. Ayni kisinin hem islem olusturup hem onaylamasi, COSO cercevesinde ciddi bir kontrol zafiyetidir. BDDK ic Sistemler Yonetmeligi Madde 11 bunu acikca yasaklar.',
  },
  {
    keywords: ['round', 'yuvarlak', 'tam', 'sayi', 'exact'],
    config: {
      title: 'Yuvarlak Tutar Anomali Tespiti',
      description: 'Normal is akisinda beklenmeyecek yuvarlak tutarli islemleri tespit eder.',
      category: 'FRAUD',
      severity: 'MEDIUM',
      source: 'sap_gl',
      query_payload: `SELECT id, amount, vendor_id, description, created_at
FROM transactions
WHERE amount > 10000
  AND amount = ROUND(amount, -3)
  AND created_at > now() - interval '30 days'
GROUP BY id, amount, vendor_id, description, created_at
ORDER BY amount DESC
LIMIT 100;`,
      schedule_cron: '0 0 * * *',
      risk_threshold: 5,
    },
    reasoning: 'Yuvarlak tutarli islemler (10.000, 50.000, 100.000 gibi) gercek ticari islemlerden ziyade hayali faturalandirma veya zimmet gostergesi olabilir. Benford Kanunu analizleriyle birlikte degerlendirilmeli.',
  },
  {
    keywords: ['vendor', 'tedarik', 'supplier', 'sahte', 'shell', 'posta', 'kutusu'],
    config: {
      title: 'Sahte Tedarikci Taramasi',
      description: 'Eksik bilgiye sahip veya supheli paternler gosteren tedarikci kayitlarini tespit eder.',
      category: 'FRAUD',
      severity: 'HIGH',
      source: 'sap_gl',
      query_payload: `SELECT v.id, v.name, v.tax_id, v.bank_account,
  v.address, v.phone,
  COUNT(t.id) as tx_count,
  SUM(t.amount) as total_amount
FROM vendors v
LEFT JOIN transactions t ON v.id = t.vendor_id
WHERE (
  v.phone IS NULL
  OR v.address IS NULL
  OR v.bank_account IN (
    SELECT bank_account FROM vendors
    GROUP BY bank_account HAVING COUNT(*) > 1
  )
)
AND v.created_at > now() - interval '90 days'
GROUP BY v.id, v.name, v.tax_id, v.bank_account, v.address, v.phone
HAVING SUM(t.amount) > 50000
ORDER BY total_amount DESC;`,
      schedule_cron: '0 0 * * 1',
      risk_threshold: 1,
    },
    reasoning: 'Sahte tedarikci (shell company) tespiti, kurumsal dolandiricilikta en kritik kontrollerden biridir. Eksik iletisim bilgisi, posta kutusu adresi veya baska bir tedarikciye ait banka hesabi kullanimi onemli red flag\'lerdir.',
  },
  {
    keywords: ['kvkk', 'gdpr', 'veri', 'erisim', 'data', 'privacy', 'gizlilik'],
    config: {
      title: 'Hassas Veri Erisim Denetimi',
      description: 'Yuksek gizlilik seviyeli verilere yapilan erisimleri izler ve anomalileri raporlar.',
      category: 'COMPLIANCE',
      severity: 'MEDIUM',
      source: 'core_banking',
      query_payload: `SELECT user_id, resource_type, resource_id,
  action, ip_address, user_agent,
  created_at
FROM access_logs
WHERE data_classification IN ('SENSITIVE', 'HIGHLY_SENSITIVE')
  AND created_at > now() - interval '24h'
  AND (
    action = 'EXPORT'
    OR action = 'BULK_READ'
    OR EXTRACT(HOUR FROM created_at) NOT BETWEEN 8 AND 18
  )
ORDER BY created_at DESC;`,
      schedule_cron: '0 0 * * *',
      risk_threshold: 5,
    },
    reasoning: 'KVKK Madde 12 geregi veri sorumlusu, kisisel verilere yetkisiz erisimi tespit etmekle yukumludur. Toplu veri cekme (bulk export), hassas veri erisimi ve mesai disi erisimler ozellikle izlenmelidir.',
  },
];

const FALLBACK_CONFIG: AIProbeConfig = {
  title: 'Ozel Islem Izleyici',
  description: 'Kullanici tarafindan tanimlanan kosullara gore islem akisini izler.',
  category: 'OPS',
  severity: 'MEDIUM',
  source: 'core_banking',
  query_payload: `SELECT *
FROM transactions
WHERE created_at > now() - interval '24h'
ORDER BY amount DESC
LIMIT 100;`,
  schedule_cron: '0 */4 * * *',
  risk_threshold: 5,
  reasoning: 'Girdiginiz tanimi tam olarak eslestirebilecek bir hazir sablona sahip degilim, ancak genel bir islem izleme kurali olusturdum. Wizard icerisinde kosullari detaylandirabilirsiniz.',
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ğ]/g, 'g')
    .replace(/[ü]/g, 'u')
    .replace(/[ş]/g, 's')
    .replace(/[ı]/g, 'i')
    .replace(/[ö]/g, 'o')
    .replace(/[ç]/g, 'c')
    .replace(/[â]/g, 'a')
    .replace(/[î]/g, 'i')
    .replace(/[û]/g, 'u');
}

export async function generateProbeFromText(userInput: string): Promise<AIProbeConfig> {
  await new Promise(r => setTimeout(r, 1800 + Math.random() * 1200));

  const normalized = normalizeText(userInput);

  let bestMatch: RulePattern | null = null;
  let bestScore = 0;

  for (const pattern of RULE_PATTERNS) {
    let score = 0;
    for (const kw of pattern.keywords) {
      if (normalized.includes(kw)) score += 2;
    }
    const words = normalized.split(/\s+/);
    for (const word of words) {
      for (const kw of pattern.keywords) {
        if (word.length > 3 && kw.includes(word)) score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = pattern;
    }
  }

  if (bestMatch && bestScore >= 2) {
    return {
      ...bestMatch.config,
      reasoning: bestMatch.reasoning,
    };
  }

  return { ...FALLBACK_CONFIG };
}

export async function analyzeException(
  exceptionData: Record<string, any>,
  probeTitle?: string,
  probeCategory?: string,
): Promise<AIForensicInsight> {
  await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000));

  const amount = Number(exceptionData.amount) || 0;
  const description = String(exceptionData.description || '').toLowerCase();
  const accountId = String(exceptionData.account_id || '');

  const redFlags: string[] = [];
  let riskLevel: AIForensicInsight['risk_level'] = 'MEDIUM';
  let riskLabel = 'Orta Seviye Risk';
  let reasoning = '';
  let suggestedAction: AIForensicInsight['suggested_action'] = 'MONITOR';
  let suggestedActionLabel = 'Izlemeye Devam Et';
  let confidence = 72;
  const regulatoryRefs: string[] = [];
  const nextSteps: string[] = [];

  if (amount > 500000) {
    redFlags.push(`Yuksek islem tutari: ${amount.toLocaleString('tr-TR')} TL - normal is akisi ortalamasinin cok uzerinde`);
    riskLevel = 'HIGH';
    confidence += 10;
  }
  if (amount > 0 && amount < 10500 && amount > 8500) {
    redFlags.push('Tutar, MASAK bildirim esiginin (10.000 TL) hemen altinda - yapilandirma (smurfing) gostergesi');
    riskLevel = 'CRITICAL';
    confidence += 15;
    regulatoryRefs.push('MASAK Supheli Islem Bildirimi Genel Tebligi Madde 4/b');
  }

  if (description.includes('yetkisiz') || description.includes('unauthorized')) {
    redFlags.push('Yetkisiz erisim girisimi tespit edildi - gorev ayriligi ihlali olasılıgı');
    riskLevel = 'CRITICAL';
    confidence += 12;
    regulatoryRefs.push('BDDK Ic Sistemler Yonetmeligi Madde 11');
  }
  if (description.includes('supheli') || description.includes('suspicious')) {
    redFlags.push('Islem, supheli desene uyuyor - detayli inceleme gerektirir');
    confidence += 8;
  }
  if (description.includes('politika') || description.includes('ihlal')) {
    redFlags.push('Kurumsal politika ihlali tespit edildi');
    regulatoryRefs.push('Banka Ic Politikalar Cercevesi');
  }
  if (description.includes('esik') || description.includes('threshold')) {
    redFlags.push('Tanimli esik degeri asildi - otomatik alarm tetiklendi');
    confidence += 5;
  }

  if (probeCategory === 'FRAUD' || probeCategory === 'COMPLIANCE') {
    confidence += 5;
  }

  if (redFlags.length === 0) {
    redFlags.push('Islem verisi, tanimlanan risk parametrelerini asmis durumda');
    redFlags.push('Islem zamanlama veya tutar bakimindan normal is akisi deseninden sapma gosteriyor');
  }

  switch (riskLevel) {
    case 'CRITICAL':
      riskLabel = 'Kritik Risk';
      reasoning = `Sentinel Prime Analizi: Bu istisna KRITIK seviyede risk icermektedir. ${redFlags.length} adet red flag tespit ettim. ` +
        `Islem tutari (${amount.toLocaleString('tr-TR')} TL) ve diger gostergeler birlikte degerlendirildiginde, ` +
        `bu durumun bulgu olarak raporlanmasi ve ilgili birim yoneticisine eskale edilmesi gerektigini degerlendiriyorum. ` +
        `${probeTitle ? `"${probeTitle}" probe'unun tetiklenmesi bu risk degerendirmesini desteklemektedir.` : ''}`;
      suggestedAction = 'CREATE_FINDING';
      suggestedActionLabel = 'Bulgu Olustur (Modul 4)';
      nextSteps.push(
        'Islemin detayli forensik incelemesini baslatin',
        'Ilgili hesap hareketlerinin son 90 gunluk dokumunu alin',
        'Gorev ayriligi matrisini kontrol edin',
        'Uyumluluk birimine bildirim gonderin',
      );
      break;
    case 'HIGH':
      riskLabel = 'Yuksek Risk';
      reasoning = `Sentinel Prime Analizi: Bu istisna yuksek risk seviyesinde degerlendirilmektedir. ` +
        `${redFlags.length} adet kuskulandigim nokta var. Islem deseni, bilinen fraud senaryo sablonlarindan biriyle uyusmaktadir. ` +
        `Henuz kesin bir bulgu olarak nitelendirmiyorum, ancak eskalasyon oneriyorum. ` +
        `Ek veri toplama ve capraz kontrol yapilmasi gerekiyor.`;
      suggestedAction = 'ESCALATE';
      suggestedActionLabel = 'Eskale Et';
      nextSteps.push(
        'Ilisikili islemleri capraz kontrol edin',
        'Musteri risk profilini yeniden degerlendirin',
        'Son 30 gunluk islem gecmisini inceleyin',
      );
      break;
    case 'MEDIUM':
      riskLabel = 'Orta Seviye Risk';
      reasoning = `Sentinel Prime Analizi: Bu istisna orta seviye risk tasiyor. ` +
        `Bazi anormal gostergeler mevcut, ancak tek basina kesin bir sonuca varmak icin yeterli degil. ` +
        `Izlemeye devam edilmesini ve ek veri noktalarinin toplanmasini oneriyorum. ` +
        `Eger ayni hesaptan benzer desenler tekrarlarsa, risk seviyesini yukseltecegim.`;
      suggestedAction = 'MONITOR';
      suggestedActionLabel = 'Izlemeye Devam Et';
      nextSteps.push(
        'Bu hesabi yakin izleme listesine ekleyin',
        'Tekrar eden desen olup olmadigini kontrol edin',
        'Ilgili probe\'un esik degerlerini gozden gecirin',
      );
      break;
    default:
      riskLabel = 'Dusuk Risk';
      reasoning = `Sentinel Prime Analizi: Bu istisna dusuk risk seviyesinde gorulmektedir. ` +
        `Is akisi sapmasi mevcut olmakla birlikte, mevcut veriler ciddi bir fraud veya uyumsuzluk gostergesi sunmuyor. ` +
        `Yanlis alarm (false positive) olma ihtimali yuksek.`;
      suggestedAction = 'DISMISS';
      suggestedActionLabel = 'Yanlis Alarm Olarak Isaretle';
      nextSteps.push(
        'Probe esik degerlerini gozden gecirin',
        'False positive oranini azaltmak icin kural ince ayar yapin',
      );
  }

  if (regulatoryRefs.length === 0) {
    regulatoryRefs.push('BDDK Bankacilik Kanunu Madde 93');
    regulatoryRefs.push('COSO Ic Kontrol Cercevesi - Izleme Aktiviteleri');
  }

  confidence = Math.min(confidence, 98);

  return {
    risk_level: riskLevel,
    risk_label: riskLabel,
    reasoning,
    red_flags: redFlags,
    suggested_action: suggestedAction,
    suggested_action_label: suggestedActionLabel,
    confidence,
    regulatory_refs: regulatoryRefs,
    next_steps: nextSteps,
  };
}
