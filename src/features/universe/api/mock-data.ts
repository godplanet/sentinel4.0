import { AuditEntity } from '../types';

export const MOCK_UNIVERSE_DATA: AuditEntity[] = [
  {
    id: '1',
    code: 'GM-IT-001',
    name: 'Bilgi Teknolojileri Yönetimi',
    category: 'IT',
    manager: 'Ahmet Yılmaz (CTO)',
    last_audit: '15.03.2025',
    audit_score: 3.85,
    audit_grade: 'A',
    total_score: 85,
    description: 'Tüm BT altyapı, yazılım ve güvenlik süreçleri.'
  },
  {
    id: '2',
    code: 'GM-TR-042',
    name: 'Hazine Operasyonları',
    category: 'Business',
    manager: 'Ayşe Demir (EVP)',
    last_audit: '20.02.2025',
    audit_score: 2.40,
    audit_grade: 'C',
    total_score: 65,
    description: 'FX, Türev ve Para Piyasası operasyonları.'
  },
  {
    id: '3',
    code: 'BR-34-KAD',
    name: 'Kadıköy Kurumsal Şube',
    category: 'Business',
    manager: 'Mehmet Öz (Şube Md.)',
    last_audit: '10.01.2025',
    audit_score: 1.90,
    audit_grade: 'D',
    total_score: 55,
    description: 'Kurumsal ve Ticari krediler segmenti.'
  },
  {
    id: '4',
    code: 'GM-HR-001',
    name: 'İnsan Kaynakları & Yetenek',
    category: 'Support',
    manager: 'Selin Kaya (CHRO)',
    last_audit: '05.11.2024',
    audit_score: 3.20,
    audit_grade: 'B',
    total_score: 42,
    description: 'İşe alım, bordro ve performans yönetimi.'
  }
];
