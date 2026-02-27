/**
 * AAOIFI Şer'i Standartlar Bilgi Tabanı
 *
 * Bu veri seti, İslami finans hükümleri için otorite kaynaktır.
 * HALÜSINASYON YOK: Yapay Zeka SADECE bu metinleri kaynak gösterebilir.
 *
 * Yapı, AAOIFI'nin resmi standartlarını yansıtır:
 * - Murabaha (Maliyet + Kar Finansmanı)
 * - Teverruk (Nakitlaştırma)
 * - Sukuk (İslami Tahviller)
 * - İcara (Kiralama)
 * - Mudarebe (Kar Paylaşımı)
 */

export interface AAOIFIStandard {
  id: string;
  standard_name: string;
  standard_no: number;
  article_no: string;
  section: string;
  text: string;
  ruling: 'mandatory' | 'recommended' | 'permissible' | 'discouraged' | 'prohibited';
  risk_level: 'critical' | 'high' | 'medium' | 'low';
  keywords: string[];
  references?: string[];
}

export const aaoifiStandards: AAOIFIStandard[] = [
  // MURABAHA (Standard No. 8)
  {
    id: 'aaoifi-8-2-1-3',
    standard_name: 'Murabaha',
    standard_no: 8,
    article_no: '2/1/3',
    section: 'Geçerlilik Şartları',
    text: 'Kurum, emtiayı (varlığı) müşteriye satmadan önce mülkiyetine almalı ve fiili veya hükmi zilyetliği ele geçirmelidir. Mülkiyetten önce satış, akdi batıl (geçersiz) kılar.',
    ruling: 'mandatory',
    risk_level: 'critical',
    keywords: ['mülkiyet', 'zilyetlik', 'emtia', 'satış', 'batıl', 'geçersiz'],
    references: ['Hadis: "Sahip olmadığın şeyi satma" (Tirmizi 1232)']
  },
  {
    id: 'aaoifi-8-3-1',
    standard_name: 'Murabaha',
    standard_no: 8,
    article_no: '3/1',
    section: 'Satın Alma Vaadi',
    text: 'Müşterinin tek taraflı satın alma vaadi (va\'d), çoğunluk görüşüne göre vaad vereni bağlar. Kurum, müşteri haklı sebep olmaksızın vaadinden dönerse fiili zararlarının tazminini talep edebilir.',
    ruling: 'permissible',
    risk_level: 'medium',
    keywords: ['vaad', 'va\'d', 'bağlayıcı', 'ihlal', 'zarar', 'tazminat'],
    references: ['İslam Fıkıh Akademisi Kararı 40-41']
  },
  {
    id: 'aaoifi-8-4-2',
    standard_name: 'Murabaha',
    standard_no: 8,
    article_no: '4/2',
    section: 'Risk ve Sorumluluk',
    text: 'Kurum, satın alma ile müşteriye teslimat arasındaki dönemde emtiaya ilişkin tüm riskleri üstlenir. Bu, tahribat, ayıp veya piyasa fiyat dalgalanmasını içerir.',
    ruling: 'mandatory',
    risk_level: 'high',
    keywords: ['risk', 'sorumluluk', 'tahribat', 'ayıp', 'fiyat dalgalanması'],
  },
  {
    id: 'aaoifi-8-5-3-1',
    standard_name: 'Murabaha',
    standard_no: 8,
    article_no: '5/3/1',
    section: 'Fiyat Bileşimi',
    text: 'Satış fiyatı açıkça belirtilmelidir; maliyet fiyatı artı kar marjından oluşur. Gizli masraflar veya belirsiz maliyet unsurları, şeffaflık gereksinimini (garar) ihlal eder.',
    ruling: 'mandatory',
    risk_level: 'high',
    keywords: ['fiyat', 'maliyet', 'kar', 'marj', 'şeffaflık', 'garar', 'açıklama'],
  },

  // TEVERRUK (Standart No. 30)
  {
    id: 'aaoifi-30-2-2',
    standard_name: 'Teverruk',
    standard_no: 30,
    article_no: '2/2',
    section: 'Organize Teverruk',
    text: 'Organize Teverruk (Teverruk Munazzam), emtia asıl satıcıya geri dönerse veya kurum tüm zinciri düzenlerse CAİZ DEĞİLDİR. Bu, faiz yasağını dolanmak için bir hukuki hile (hile) teşkil eder.',
    ruling: 'prohibited',
    risk_level: 'critical',
    keywords: ['organize teverruk', 'munazzam', 'yasaklanmış', 'hile', 'faiz', 'dolanma', 'döngüsel'],
    references: ['İİT Fıkıh Akademisi Kararı 179 (19/5)']
  },
  {
    id: 'aaoifi-30-3-1',
    standard_name: 'Teverruk',
    standard_no: 30,
    article_no: '3/1',
    section: 'Klasik Teverruk',
    text: 'Klasik Teverruk şu şartlarda caizdir: (1) müşteri emtiayı bağımsız olarak tedarik eder, (2) gerçek zilyetliği ele geçirir ve (3) kurumsal düzenleme olmaksızın üçüncü tarafa satar. Kurum ikinci satışa dahil olmamalıdır.',
    ruling: 'permissible',
    risk_level: 'low',
    keywords: ['klasik', 'bağımsız', 'zilyetlik', 'üçüncü taraf', 'caiz'],
  },

  // SUKUK (Standart No. 17)
  {
    id: 'aaoifi-17-2-1-1',
    standard_name: 'Sukuk',
    standard_no: 17,
    article_no: '2/1/1',
    section: 'Varlık Mülkiyeti',
    text: 'Sukuk sahipleri, dayanak varlıkların GERÇEK ve ORANTILI mülkiyetine sahip olmalıdır. Gerçek risk paylaşımı olmaksızın hükmi veya nominal mülkiyet caiz değildir. Varlıklar şer\'i uyumlu ve tanımlanabilir olmalıdır.',
    ruling: 'mandatory',
    risk_level: 'critical',
    keywords: ['sukuk', 'mülkiyet', 'gerçek', 'orantılı', 'hükmi', 'risk paylaşımı', 'varlıklar'],
    references: ['AAOIFI Şer\'i Standart No. 17']
  },
  {
    id: 'aaoifi-17-4-3',
    standard_name: 'Sukuk',
    standard_no: 17,
    article_no: '4/3',
    section: 'İtfa Koşulları',
    text: 'İhraççı, vade sonunda anapara tutarını garanti edemez. Piyasa değeri veya net varlık değeri üzerinden satın alma taahhüdü (va\'d) caizdir, ancak nominal değer üzerinden garantili geri alım, sukuku bir borç enstrümanına (Faiz) dönüştürür.',
    ruling: 'prohibited',
    risk_level: 'critical',
    keywords: ['itfa', 'garanti', 'anapara', 'geri alım', 'nominal değer', 'borç', 'faiz'],
  },
  {
    id: 'aaoifi-17-5-2',
    standard_name: 'Sukuk',
    standard_no: 17,
    article_no: '5/2',
    section: 'Kar Dağıtımı',
    text: 'Kar dağıtımı, dayanak varlıkların fiili performansını yansıtmalıdır. Varlık performansına bağlı olmayan önceden belirlenmiş sabit getiriler, konvansiyonel faize (Riba al-Nesie) benzediği için yasaktır.',
    ruling: 'prohibited',
    risk_level: 'critical',
    keywords: ['kar', 'dağıtım', 'sabit', 'getiri', 'önceden belirlenmiş', 'faiz', 'riba'],
  },

  // İCARA (Standart No. 9)
  {
    id: 'aaoifi-9-3-1-2',
    standard_name: 'İcara',
    standard_no: 9,
    article_no: '3/1/2',
    section: 'Mülkiyet ve Bakım',
    text: 'Kiraya veren (kurum), kiralanan varlığın mülkiyetini elinde tutmalı ve büyük bakım maliyetlerini üstlenmelidir. Mülkiyet unvanını korurken mülkiyet risklerini kiracıya devretmek caiz değildir.',
    ruling: 'mandatory',
    risk_level: 'high',
    keywords: ['icara', 'kiraya veren', 'mülkiyet', 'bakım', 'büyük onarımlar', 'kiracı'],
  },
  {
    id: 'aaoifi-9-4-5',
    standard_name: 'İcara',
    standard_no: 9,
    article_no: '4/5',
    section: 'Kira Belirleme',
    text: 'Kira tutarları sabit veya değişken (kıyaslamalı) olabilir, ancak faiz oranlarına (LIBOR, SOFR) bağlanamaz çünkü bu faiz riski yaratır. Varlık performansına dayalı alternatif kıyaslamalar kabul edilebilir.',
    ruling: 'prohibited',
    risk_level: 'high',
    keywords: ['kira', 'sabit', 'değişken', 'kıyaslama', 'libor', 'faiz', 'riba'],
  },
  {
    id: 'aaoifi-9-6-1',
    standard_name: 'İcara',
    standard_no: 9,
    article_no: '6/1',
    section: 'İcara Müntehiye Bi\'t-Temlik',
    text: 'Mülkiyet devri ile sonuçlanan kiralama (İcara Müntehiye Bi\'t-Temlik), mülkiyet devrinin şu yollarla gerçekleşmesi halinde caizdir: (1) son ödeme sonrası hibe, (2) sembolik/piyasa değerinde satış veya (3) kademeli mülkiyet devri. Sıfır maliyetle otomatik devir hoş karşılanmaz.',
    ruling: 'permissible',
    risk_level: 'low',
    keywords: ['mülkiyete dönüşen kiralama', 'müntehiye bi\'t-temlik', 'mülkiyet devri', 'hibe', 'satış'],
  },

  // MUDAREBE (Standart No. 13)
  {
    id: 'aaoifi-13-2-1-4',
    standard_name: 'Mudarebe',
    standard_no: 13,
    article_no: '2/1/4',
    section: 'Kar Paylaşım Oranı',
    text: 'Kar, fiili karın BİR YÜZDESI olarak paylaşılmalıdır, sabit bir tutar olarak değil. Yatırımcıya (Rabbü\'l-Mal) sabit getiri garantisi veren herhangi bir şart, sözleşmeyi geçersiz kılar ve onu faize dönüştürür.',
    ruling: 'mandatory',
    risk_level: 'critical',
    keywords: ['mudarebe', 'kar paylaşımı', 'yüzde', 'sabit getiri', 'garanti', 'faiz'],
  },
  {
    id: 'aaoifi-13-3-2',
    standard_name: 'Mudarebe',
    standard_no: 13,
    article_no: '3/2',
    section: 'Zarar Paylaşımı',
    text: 'Mali zararlar, yöneticinin (Müdarib) ihmali veya sözleşme ihlalinden kaynaklanmadıkça, tamamen sermaye sağlayıcı (Rabbü\'l-Mal) tarafından karşılanır. Müdarib sadece zamanını ve emeğini kaybeder.',
    ruling: 'mandatory',
    risk_level: 'high',
    keywords: ['zarar', 'sermaye sağlayıcı', 'rabbü\'l-mal', 'müdarib', 'ihmal', 'ihlal'],
  },

  // GENEL YASAKLAR
  {
    id: 'aaoifi-gen-1',
    standard_name: 'Genel Yasaklar',
    standard_no: 0,
    article_no: 'GEN-1',
    section: 'Riba (Faiz)',
    text: 'Ribanın (faiz) tüm şekilleri kesinlikle yasaktır; bunlar: (1) Riba al-Fadl (takasdaki fazlalık), (2) Riba al-Nesie (borç üzerindeki faiz) ve (3) gerçek risk paylaşımı olmaksızın anapara artı önceden belirlenmiş getiriyi garanti eden sözleşme şartlarıdır.',
    ruling: 'prohibited',
    risk_level: 'critical',
    keywords: ['riba', 'faiz', 'tefecilik', 'yasak', 'borç', 'fazlalık'],
    references: ['Kuran 2:275', 'Hadis Sahih Müslim 1598']
  },
  {
    id: 'aaoifi-gen-2',
    standard_name: 'Genel Yasaklar',
    standard_no: 0,
    article_no: 'GEN-2',
    section: 'Garar (Aşırı Belirsizlik)',
    text: 'Aşırı belirsizlik içeren sözleşmeler (Garar Fahiş) batıldır. Bu şunları içerir: tanımsız fiyat, belirsiz teslimat, var olmayan malların satışı veya muğlak sözleşme şartları. Küçük belirsizlik (Garar Yesir) tolere edilir.',
    ruling: 'prohibited',
    risk_level: 'high',
    keywords: ['garar', 'belirsizlik', 'tanımsız', 'muğlak', 'batıl', 'var olmayan'],
  },
  {
    id: 'aaoifi-gen-3',
    standard_name: 'Genel Yasaklar',
    standard_no: 0,
    article_no: 'GEN-3',
    section: 'Meysir (Kumar)',
    text: 'Kumara benzeyen spekülatif sözleşmeler (Meysir) yasaktır. Bu, kazancın dayanak ekonomik faaliyetten veya gerçek ticaretten ziyade tamamen şansa dayalı olduğu türevleri içerir.',
    ruling: 'prohibited',
    risk_level: 'critical',
    keywords: ['meysir', 'kumar', 'spekülasyon', 'türevler', 'şans'],
  },
];

export function searchByKeywords(query: string): AAOIFIStandard[] {
  const queryLower = query.toLowerCase();
  const queryTokens = queryLower.split(/\s+/).filter(t => t.length > 2);

  const scored = aaoifiStandards.map(standard => {
    let score = 0;
    const allText = `${standard.text} ${standard.keywords.join(' ')}`.toLowerCase();

    queryTokens.forEach(token => {
      if (standard.keywords.some(kw => kw.includes(token))) {
        score += 10;
      }
      if (allText.includes(token)) {
        score += 5;
      }
      if (standard.standard_name.toLowerCase().includes(token)) {
        score += 15;
      }
    });

    return { standard, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.standard);
}

export function getStandardById(id: string): AAOIFIStandard | undefined {
  return aaoifiStandards.find(s => s.id === id);
}

export function getStandardsByRiskLevel(level: 'critical' | 'high' | 'medium' | 'low'): AAOIFIStandard[] {
  return aaoifiStandards.filter(s => s.risk_level === level);
}

export function getStandardsByRuling(ruling: AAOIFIStandard['ruling']): AAOIFIStandard[] {
  return aaoifiStandards.filter(s => s.ruling === ruling);
}
