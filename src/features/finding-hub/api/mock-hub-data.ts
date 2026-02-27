export const HUB_DEMO_FINDINGS = [
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
