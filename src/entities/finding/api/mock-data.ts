// src/entities/finding/api/mock-data.ts

export const SAFE_MOCK_FINDINGS = [
    {
      id: 'mock-1',
      code: 'AUD-2026-001',
      title: 'Kasa İşlemlerinde Çift Anahtar Kuralı İhlali',
      severity: 'HIGH',
      main_status: 'ACIK',
      financial_impact: 250000,
      gias_category: 'Operasyonel Risk',
      assignment: { portal_status: 'PENDING' }
    },
    {
      id: 'mock-2',
      code: 'AUD-2026-002',
      title: 'Bilgi Güvenliği - Şifre Politikası Zafiyeti',
      severity: 'CRITICAL',
      main_status: 'ACIK',
      financial_impact: 0,
      gias_category: 'BT Güvenliği',
      assignment: { portal_status: 'DISAGREED' }
    }
  ];
  
  export const MOCK_USERS = [
    { id: 'u1', name: 'Ahmet Yılmaz (IT Manager)' },
    { id: 'u2', name: 'Ayşe Demir (Ops Lead)' },
    { id: 'u3', name: 'Mehmet Öz (CISO)' },
  ];
  
  export const MOCK_MESSAGES = [
    { id: 'm1', sender: 'auditor' as const, content: 'Bulgu detayındaki 3. madde kritik önem taşıyor. Aksiyon planında buna öncelik verilmeli.', timestamp: new Date(Date.now() - 86400000) },
    { id: 'm2', sender: 'auditee' as const, content: 'Anlaşıldı, kaynak planlamasını buna göre revize ediyoruz.', timestamp: new Date(Date.now() - 82000000) },
    { id: 'm3', sender: 'system' as const, content: 'Ahmet Yılmaz vade tarihini 15.05.2026 olarak güncelledi.', timestamp: new Date(Date.now() - 3600000) },
  ];
  
  export const CATEGORIES = [
    'Bilgi Teknolojileri (IT)',
    'Kredi Riski',
    'Operasyonel Risk',
    'Uyum ve Mevzuat',
    'İnsan Kaynakları',
    'Finansal Raporlama'
  ];
  
  export const DEPARTMENTS = [
    'Genel Müdürlük',
    'Yazılım Geliştirme',
    'Sistem ve Ağ Yönetimi',
    'Krediler Tahsis',
    'Şube Operasyonları'
  ];
  
  export const RISK_TYPES = [
    { id: 'credit', label: 'Kredi Riski', icon: '💳' },
    { id: 'market', label: 'Piyasa Riski', icon: '📊' },
    { id: 'operational', label: 'Operasyonel Risk', icon: '⚙️' },
    { id: 'liquidity', label: 'Likidite Riski', icon: '💧' },
    { id: 'compliance', label: 'Uyum Riski', icon: '⚖️' },
    { id: 'strategic', label: 'Stratejik Risk', icon: '🎯' },
    { id: 'reputation', label: 'İtibar Riski', icon: '🛡️' }
  ];
  
  export const PROCESSES = [
    { id: 'lending', label: 'Kredi Süreçleri', subprocesses: ['Bireysel Kredi', 'Ticari Kredi', 'Kredi Tahsis'] },
    { id: 'treasury', label: 'Hazine İşlemleri', subprocesses: ['FX İşlemleri', 'Türev Ürünler', 'Likidite Yönetimi'] },
    { id: 'operations', label: 'Operasyon', subprocesses: ['Ödeme Sistemleri', 'Mutabakat', 'Hesap İşlemleri'] },
    { id: 'it', label: 'Bilgi Teknolojileri', subprocesses: ['Yazılım Geliştirme', 'Siber Güvenlik', 'IT Operasyon'] },
    { id: 'compliance', label: 'Uyum', subprocesses: ['AML/CFT', 'KYC', 'Mevzuat Takibi'] }
  ];
  
  export const CONTROLS = [
    { id: 'C001', title: '4-Göz Prensibi (Maker-Checker)', category: 'Preventive' },
    { id: 'C002', title: 'Sistem Otomasyon Kontrolleri', category: 'Detective' },
    { id: 'C003', title: 'Günlük Log İzleme', category: 'Detective' },
    { id: 'C004', title: 'Erişim Yetkilendirme Matrisi', category: 'Preventive' },
    { id: 'C005', title: 'Üst Limit Onayı', category: 'Preventive' }
  ];
  
  export const MOCK_SUGGESTIONS = [
    { id: 'FIND-042', type: 'Finding', title: 'Yetkilendirme Matrisi Eksikliği' },
    { id: 'POL-018', type: 'Policy', title: 'Bilgi Güvenliği Politikası' },
    { id: 'ACT-125', type: 'Action', title: 'Firewall Kuralları Revizyonu' }
  ];