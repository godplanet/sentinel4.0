export const RISK_CATEGORIES = [
  'Kredi Riski',
  'Operasyonel Risk',
  'BT Güvenliği',
  'Uyum Riski',
  'Piyasa Riski',
  'Likidite Riski',
  'Yasal Risk',
  'İtibar Riski'
];

export const DEPARTMENTS = [
  { code: 'KRY', name: 'Kredi Risk Yönetimi', description: 'Kredi portföy analizi ve risk takibi' },
  { code: 'OPR', name: 'Operasyonel Risk', description: 'Operasyonel kayıp ve süreç riskleri' },
  { code: 'BTG', name: 'BT Güvenliği', description: 'Siber güvenlik ve altyapı kontrolleri' },
  { code: 'UYM', name: 'Uyum ve Denetim', description: 'BDDK/MASAK uyum süreçleri' },
  { code: 'FNP', name: 'Finans Planlama', description: 'Bütçe ve mali tablolar' },
  { code: 'YKS', name: 'Yönetim Kurulu Sekreterligi', description: 'Kurumsal yönetim ve strateji' },
  { code: 'MVL', name: 'Model Validasyon', description: 'ICAAP ve stress test modelleri' },
  { code: 'TZK', name: 'Teminat ve Zarar Kontrolü', description: 'Teminat değerleme ve NPL yönetimi' },
  { code: 'HKL', name: 'Hazine ve Kur Likidite', description: 'Döviz pozisyonu ve likidite yönetimi' },
  { code: 'IBN', name: 'İç Kontrol ve Bağımsız Risk', description: '3 savunma hattı koordinasyonu' }
];

export const BRANCH_CITIES = [
  'Ankara Merkez', 'Istanbul Anadolu', 'Istanbul Avrupa', 'Izmir Konak', 'Bursa Osmangazi',
  'Antalya Muratpaşa', 'Adana Seyhan', 'Konya Selçuklu', 'Gaziantep Şahinbey', 'Kayseri Melikgazi',
  'Eskişehir Odunpazarı', 'Mersin Akdeniz', 'Diyarbakır Bağlar', 'Samsun İlkadım', 'Denizli Pamukkale',
  'Trabzon Ortahisar', 'Malatya Battalgazi', 'Kahramanmaraş Dulkadiroğlu', 'Erzurum Yakutiye', 'Şanlıurfa Eyyübiye',
  'Balıkesir Karesi', 'Kocaeli Izmit', 'Tekirdağ Süleymanpaşa', 'Manisa Yunusemre', 'Aydın Efeler',
  'Sakarya Adapazarı', 'Hatay Antakya', 'Van Tuşba', 'Kütahya Merkez', 'Çorum Merkez',
  'Zonguldak Merkez', 'Ordu Altınordu', 'Afyonkarahisar Merkez', 'Isparta Merkez', 'Uşak Merkez',
  'Elazığ Merkez', 'Tokat Merkez', 'Çanakkale Merkez', 'Edirne Merkez', 'Kırklareli Merkez',
  'Giresun Merkez', 'Rize Merkez', 'Amasya Merkez', 'Kastamonu Merkez', 'Bolu Merkez',
  'Yalova Merkez', 'Bilecik Merkez', 'Karabük Merkez', 'Niğde Merkez', 'Aksaray Merkez'
];

export const FINDING_TEMPLATES = [
  {
    title: 'Stres Testi Metodoloji Eksiklikleri',
    category: 'Model Validasyon',
    description: 'BDDK stres testi rehberinde belirtilen senaryo çeşitliliği sağlanmamıştır.',
    severity: 'HIGH' as const
  },
  {
    title: 'MFA (Çok Faktörlü Kimlik Doğrulama) Kullanılmıyor',
    category: 'BT Güvenliği',
    description: 'Kritik sistemlere erişimde MFA zorunluluğu uygulanmamaktadır.',
    severity: 'CRITICAL' as const
  },
  {
    title: 'Teminat Değerleme Süreci Güncel Değil',
    category: 'Kredi Riski',
    description: 'Teminat değerleme raporları yılda bir yerine 2 yılda bir güncellenmektedir.',
    severity: 'MEDIUM' as const
  },
  {
    title: 'BDDK Uyum Eksiklikleri - Aktif Oran Hesabı',
    category: 'Uyum Riski',
    description: 'Aktif oran hesaplamalarında bazı varlık grupları yanlış sınıflandırılmıştır.',
    severity: 'HIGH' as const
  },
  {
    title: 'Yedekleme (Backup) Test Sonuçları Dokümante Edilmiyor',
    category: 'BT Güvenliği',
    description: 'Aylık backup testleri yapılıyor ancak sonuçlar kayıt altına alınmamaktadır.',
    severity: 'MEDIUM' as const
  },
  {
    title: 'KYC Güncellemeleri Süresinde Yapılmıyor',
    category: 'Uyum Riski',
    description: 'Kurumsal müşterilerin KYC bilgileri 24 ay yerine 30-36 ayda güncellenmektedir.',
    severity: 'HIGH' as const
  },
  {
    title: 'Likidite Kapsama Oranı (LCO) Hesaplama Hataları',
    category: 'Likidite Riski',
    description: 'LCO hesaplamalarında bazı likit varlıklar yanlış katsayılarla çarpılmıştır.',
    severity: 'CRITICAL' as const
  },
  {
    title: 'Kredi Onay Limitlerinde Yetkilendirme Matrisi Aşılıyor',
    category: 'Kredi Riski',
    description: 'Bazı krediler yetkili onay limitleri aşılarak onaylanmıştır.',
    severity: 'HIGH' as const
  },
  {
    title: 'MASAK Bildirim Sürelerinde Gecikmeler',
    category: 'Uyum Riski',
    description: 'Şüpheli işlem bildirimlerinde 10 günlük süre bazı durumlarda aşılmıştır.',
    severity: 'CRITICAL' as const
  },
  {
    title: 'Muhasebe Mutabakat Süreçlerinde Manuel İşlemler',
    category: 'Operasyonel Risk',
    description: 'Gün sonu mutabakat süreçleri otomasyona alınmamıştır.',
    severity: 'MEDIUM' as const
  }
];

export const CONTROL_NAMES = [
  'Kredi Onay Süreci',
  'Muhasebe Mutabakat Kontrolü',
  'Yedekleme Testi',
  'Erişim Yönetimi Gözden Geçirmesi',
  'KYC Güncelleme Süreci',
  'Teminat Değerleme Onayı',
  'Limit İzleme Kontrolü',
  'Operasyonel Kayıp Raporlaması',
  'Model Performans İzleme',
  'Uyum Raporlama Kontrolü'
];

export const ACTION_TITLES = [
  'MFA sisteminin kritik sistemlere entegrasyonu',
  'Teminat değerleme sürecinin yıllık periyoda çekilmesi',
  'KYC güncelleme süreçlerinin otomasyonu',
  'Yedekleme test sonuçları için kayıt sistemi oluşturulması',
  'Kredi onay limitlerinde sistem kontrol noktası eklenmesi',
  'MASAK bildirim süreç takip otomasyonu geliştirilmesi',
  'Stres testi metodolojisinin BDDK rehberine uyumlu güncellenmesi',
  'Muhasebe mutabakat sürecinin RPA ile otomasyonu',
  'Aktif oran hesaplama modelinin revize edilmesi',
  'LCO hesaplama formüllerinin düzeltilmesi'
];

export const ENGAGEMENT_TYPES = [
  'Yıllık Risk Bazlı Denetim',
  'BDDK Özel Denetimi',
  'Siber Güvenlik Değerlendirmesi',
  'SOX 404 Kontrol Testi',
  'ICAAP Model Validasyonu',
  'Teminat Yönetimi İncelemesi',
  'KYC/AML Uyum Denetimi',
  'Kredi Portföy İncelemesi',
  'BT Genel Kontroller Denetimi',
  'Operasyonel Risk Self Assessment'
];

export const WORKPAPER_TEMPLATES = [
  { ref: 'WP-01', name: 'Kredi Dosyası Örnekleme Testi' },
  { ref: 'WP-02', name: 'Teminat Değerleme Kontrolü' },
  { ref: 'WP-03', name: 'Erişim Hakları Gözden Geçirmesi' },
  { ref: 'WP-04', name: 'KYC Formu Tamlık Kontrolü' },
  { ref: 'WP-05', name: 'Yedekleme Restore Testi' },
  { ref: 'WP-06', name: 'Limit Aşım Analizi' },
  { ref: 'WP-07', name: 'Stres Testi Senaryo Değerlendirmesi' },
  { ref: 'WP-08', name: 'Muhasebe Günlük Kapatma Kontrolü' },
  { ref: 'WP-09', name: 'MASAK Bildirim Zamanlaması' },
  { ref: 'WP-10', name: 'LCO Formül Doğrulama' }
];
