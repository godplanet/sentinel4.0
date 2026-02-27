export const GIAS_2024_CATEGORIES = {
  governance: {
    code: 'YÖN',
    name: 'Yönetim ve Strateji',
    subcategories: [
      'Yönetim Kurulu Etkinliği',
      'Stratejik Planlama',
      'Kurumsal Yönetim',
      'İç Kontrol Sistemleri'
    ]
  },
  credit: {
    code: 'KRD',
    name: 'Kredi Riski',
    subcategories: [
      'Kredi Politikaları',
      'Kredi Onay Süreci',
      'Teminat Yönetimi',
      'NPL Takip ve Tahsilat',
      'Kredi İzleme ve Raporlama'
    ]
  },
  operational: {
    code: 'OPR',
    name: 'Operasyonel Risk',
    subcategories: [
      'Süreç Yönetimi',
      'Operasyonel Kayıp Takibi',
      'İş Sürekliliği Yönetimi',
      'Dış Kaynak Yönetimi'
    ]
  },
  it: {
    code: 'BTG',
    name: 'Bilgi Teknolojileri',
    subcategories: [
      'Siber Güvenlik',
      'Erişim Yönetimi',
      'Veri Yedekleme',
      'Değişiklik Yönetimi',
      'BT Genel Kontroller'
    ]
  },
  compliance: {
    code: 'UYM',
    name: 'Uyum',
    subcategories: [
      'BDDK Düzenlemeleri',
      'AML/CFT (MASAK)',
      'KVKK Uyumu',
      'Tüketici Hakları',
      'Uluslararası Yaptırımlar'
    ]
  },
  financial: {
    code: 'FİN',
    name: 'Finansal Raporlama',
    subcategories: [
      'TFRS Uygulamaları',
      'Mali Tablolar',
      'Sermaye Yeterliliği',
      'Likidite Rasyoları'
    ]
  },
  market: {
    code: 'PYS',
    name: 'Piyasa Riski',
    subcategories: [
      'Faiz Riski',
      'Kur Riski',
      'VaR Hesaplamaları',
      'Hedge Muhasebesi'
    ]
  },
  treasury: {
    code: 'HZN',
    name: 'Hazine İşlemleri',
    subcategories: [
      'Döviz Pozisyonu',
      'Likidite Yönetimi',
      'Repo/Ters Repo',
      'Türev Araçlar'
    ]
  }
};

export function getRandomGIASCategory(): { code: string; name: string; subcategory: string } {
  const categories = Object.values(GIAS_2024_CATEGORIES);
  const category = categories[Math.floor(Math.random() * categories.length)];
  const subcategory = category.subcategories[Math.floor(Math.random() * category.subcategories.length)];
  return {
    code: category.code,
    name: category.name,
    subcategory
  };
}
