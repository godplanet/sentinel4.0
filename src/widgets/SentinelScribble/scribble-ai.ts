export interface ExtractedFinding {
  title: string;
  description: string;
  root_cause: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  gias_category: string;
  recommendation: string;
}

export interface ExtractedEvidenceRequest {
  title: string;
  description: string;
  requested_from: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ExtractedRisk {
  title: string;
  description: string;
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ScribbleExtractionResult {
  findings: ExtractedFinding[];
  evidence_requests: ExtractedEvidenceRequest[];
  risks: ExtractedRisk[];
  summary: string;
}

interface ExtractionPattern {
  keywords: string[];
  type: 'finding' | 'evidence' | 'risk';
  generate: (text: string, matchedKeywords: string[]) => ExtractedFinding | ExtractedEvidenceRequest | ExtractedRisk;
}

function normalize(text: string): string {
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

function extractPersonName(text: string): string | null {
  const patterns = [
    /(\b[A-ZÇĞİÖŞÜ][a-zçğıöşü]+)\s+(?:bey|hanım|müdür)/i,
    /(\b[A-ZÇĞİÖŞÜ][a-zçğıöşü]+)\s+(?:söyledi|belirtti|ifade|bildirdi|beyan)/i,
    /(\b[A-ZÇĞİÖŞÜ][a-zçğıöşü]+)\s+ile\s+(?:görüşme|toplantı|mülakat)/i,
  ];
  for (const p of patterns) {
    const match = text.match(p);
    if (match) return match[1];
  }
  return null;
}

function extractDepartment(text: string): string {
  const normalized = normalize(text);
  const deptMap: Record<string, string> = {
    'it': 'IT Departmani',
    'bilgi teknoloji': 'Bilgi Teknolojileri',
    'insan kaynak': 'Insan Kaynaklari',
    'muhasebe': 'Muhasebe Birimi',
    'finans': 'Finans Departmani',
    'operasyon': 'Operasyon Birimi',
    'uyum': 'Uyum Birimi',
    'risk': 'Risk Yonetimi',
    'hazine': 'Hazine',
    'kredi': 'Kredi Departmani',
    'sube': 'Sube Mudurlugu',
    'guvenlk': 'Bilgi Guvenligi',
    'iç denetim': 'Ic Denetim',
  };
  for (const [key, dept] of Object.entries(deptMap)) {
    if (normalized.includes(key)) return dept;
  }
  return 'Ilgili Birim';
}

const PATTERNS: ExtractionPattern[] = [
  {
    keywords: ['backup', 'yedek', 'yedekleme', 'restore', 'geri yukleme'],
    type: 'finding',
    generate: (text, _kw) => ({
      title: 'Yedekleme Sureclerinde Zafiyet',
      description: `Denetlenen personel${extractPersonName(text) ? ` (${extractPersonName(text)} Bey/Hanim)` : ''} ile yapilan gorusmede yedeklerin duzgun alinmadigi/test edilmedigi beyan edilmistir. ${text.slice(0, 200)}`,
      root_cause: 'Prosedur Eksikligi',
      severity: 'HIGH' as const,
      gias_category: 'Teknolojik Risk',
      recommendation: 'Yedekleme politikasi guncellenmeli, otomatik yedekleme sistemleri kurulmali ve duzenli restore testleri yapilmalidir.',
    }),
  },
  {
    keywords: ['erisim', 'yetki', 'sifre', 'parola', 'password', 'access', 'login', 'kimlik'],
    type: 'finding',
    generate: (text) => ({
      title: 'Erisim Kontrol Zafiyeti',
      description: `Yapilan incelemede erisim kontrollerinde eksiklikler tespit edilmistir. ${text.slice(0, 200)}`,
      root_cause: 'Yetki Matrisi Eksikligi',
      severity: 'HIGH' as const,
      gias_category: 'BT Guvenligi',
      recommendation: 'Erisim yetki matrisi olusturulmali, periyodik yetki gozden gecirmeleri yapilmali ve minimum yetki prensibi uygulanmalidir.',
    }),
  },
  {
    keywords: ['gonderi', 'onay', 'imza', 'cift', 'maker', 'checker', 'segregation'],
    type: 'finding',
    generate: (text) => ({
      title: 'Gorev Ayriligi / Cift Onay Ihlali',
      description: `Denetim surecinde gorev ayriligi prensibine uymayan islemler tespit edilmistir. ${text.slice(0, 200)}`,
      root_cause: 'Ic Kontrol Yetersizligi',
      severity: 'CRITICAL' as const,
      gias_category: 'Ic Kontrol',
      recommendation: 'Maker-Checker kontrolu zorunlu hale getirilmeli, SoD matrisi olusturulup sistem uzerinde uygulanmalidir.',
    }),
  },
  {
    keywords: ['log', 'kayit', 'izleme', 'monitoring', 'audit trail', 'iz'],
    type: 'finding',
    generate: (text) => ({
      title: 'Loglama ve Iz Kaydi Yetersizligi',
      description: `Sistem loglarinin yeterli duzeyde tutulmadigı ve izleme mekanizmalarinin eksik oldugu tespit edilmistir. ${text.slice(0, 200)}`,
      root_cause: 'Teknik Altyapi Eksikligi',
      severity: 'MEDIUM' as const,
      gias_category: 'BT Guvenligi',
      recommendation: 'Merkezi loglama sistemi kurulmali, log saklama politikasi belirlenmeli ve SIEM entegrasyonu saglanmalidir.',
    }),
  },
  {
    keywords: ['politika', 'prosedur', 'yonerge', 'talimat', 'dokuman', 'guncel'],
    type: 'finding',
    generate: (text) => ({
      title: 'Politika/Prosedur Guncellik Eksikligi',
      description: `Mevcut politika ve prosedürlerin guncel olmadiği veya eksik oldugu degerlendirilmistir. ${text.slice(0, 200)}`,
      root_cause: 'Yonetim Gozetimi Eksikligi',
      severity: 'MEDIUM' as const,
      gias_category: 'Yonetisim',
      recommendation: 'Politika ve prosedurler yillik gozden gecirme takvimine alinmali, versiyon kontrolu yapilmali ve ilgili personele dagitilmalidir.',
    }),
  },
  {
    keywords: ['kvkk', 'kisisel', 'veri', 'gdpr', 'gizlilik', 'mahremiyet'],
    type: 'finding',
    generate: (text) => ({
      title: 'Kisisel Veri Koruma Uyumsuzlugu',
      description: `KVKK gerekliliklerine uyum konusunda eksiklikler tespit edilmistir. ${text.slice(0, 200)}`,
      root_cause: 'Uyum Sureci Eksikligi',
      severity: 'HIGH' as const,
      gias_category: 'Uyum Riski',
      recommendation: 'Veri envanterleri guncellenmeli, KVKK uyum projesi baslatilmali ve calisanlara farkindalik egitimleri verilmelidir.',
    }),
  },
  {
    keywords: ['belge', 'evrak', 'rapor', 'kanit', 'dokumantasyon', 'kaynak'],
    type: 'evidence',
    generate: (text) => ({
      title: 'Belge/Kanit Talebi',
      description: `Denetim kapsaminda asagidaki belgelerin temin edilmesi gerekmektedir: ${text.slice(0, 200)}`,
      requested_from: extractDepartment(text),
      priority: 'MEDIUM' as const,
    }),
  },
  {
    keywords: ['iste', 'talep', 'gerekli', 'lazim', 'sunulmali', 'gondermeli'],
    type: 'evidence',
    generate: (text) => ({
      title: 'Ek Bilgi/Belge Talebi',
      description: `Denetim calismasi icin su belgeler talep edilmektedir: ${text.slice(0, 200)}`,
      requested_from: extractDepartment(text),
      priority: 'HIGH' as const,
    }),
  },
  {
    keywords: ['risk', 'tehdit', 'zafiyet', 'acik', 'savunmasiz', 'guvenlik'],
    type: 'risk',
    generate: (text) => ({
      title: 'Potansiyel Risk Alani Tespit Edildi',
      description: `Inceleme sirasinda potansiyel bir risk alani belirlenmistir. ${text.slice(0, 200)}`,
      risk_level: 'HIGH' as const,
    }),
  },
  {
    keywords: ['uyumsuz', 'ihlal', 'mevzuat', 'bddk', 'masak', 'spk', 'regulator'],
    type: 'risk',
    generate: (text) => ({
      title: 'Regulatorik Uyum Riski',
      description: `Mevzuat gerekliliklerine uyum konusunda potansiyel risk alani tespit edilmistir. ${text.slice(0, 200)}`,
      risk_level: 'CRITICAL' as const,
    }),
  },
];

export async function extractFromScribble(rawText: string): Promise<ScribbleExtractionResult> {
  await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));

  const normalized = normalize(rawText);
  const findings: ExtractedFinding[] = [];
  const evidence_requests: ExtractedEvidenceRequest[] = [];
  const risks: ExtractedRisk[] = [];

  const matchedTypes = new Set<string>();

  for (const pattern of PATTERNS) {
    let matchScore = 0;
    const matchedKw: string[] = [];

    for (const kw of pattern.keywords) {
      if (normalized.includes(kw)) {
        matchScore += 2;
        matchedKw.push(kw);
      }
    }

    if (matchScore >= 2 && !matchedTypes.has(pattern.keywords[0])) {
      matchedTypes.add(pattern.keywords[0]);
      const result = pattern.generate(rawText, matchedKw);

      if (pattern.type === 'finding') {
        findings.push(result as ExtractedFinding);
      } else if (pattern.type === 'evidence') {
        evidence_requests.push(result as ExtractedEvidenceRequest);
      } else {
        risks.push(result as ExtractedRisk);
      }
    }
  }

  if (findings.length === 0 && evidence_requests.length === 0 && risks.length === 0) {
    const person = extractPersonName(rawText);
    const dept = extractDepartment(rawText);

    findings.push({
      title: 'Saha Calismasi Notu - Inceleme Gerektiren Husus',
      description: `Saha calismasi sirasinda alinan notlar: ${rawText.slice(0, 300)}${person ? `\n\nIlgili Kisi: ${person}` : ''}`,
      root_cause: 'Inceleme Surecinde',
      severity: 'MEDIUM',
      gias_category: 'Operasyonel Risk',
      recommendation: 'Konu detayli olarak incelenmeli ve gerekli durumlarda resmi bulgu haline getirilmelidir.',
    });

    evidence_requests.push({
      title: 'Saha Notu ile Ilgili Belge Talebi',
      description: `Alinan notlar cercevesinde ilgili belgelerin toplanmasi gerekmektedir.`,
      requested_from: dept,
      priority: 'MEDIUM',
    });
  }

  const totalItems = findings.length + evidence_requests.length + risks.length;
  const summary = `Sentinel Prime Analizi: Notlarinizda ${findings.length} bulgu, ${risks.length} risk gostergesi ve ${evidence_requests.length} belge talebi tespit ettim. Toplam ${totalItems} adet yapilandirilmis cikti olusturuldu.`;

  return { findings, evidence_requests, risks, summary };
}
