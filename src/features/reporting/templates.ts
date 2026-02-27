import {
  Plus,
  AlertTriangle,
  Building2,
  Scale,
  BarChart2,
  type LucideIcon,
} from 'lucide-react';
import type { ReportSection } from '@/entities/report';

export interface ReportTemplateV2 {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  estimatedPages: string;
  tags: string[];
  reportType: string;
  defaultSections: Omit<ReportSection, 'blocks'>[];
}

export const REPORT_TEMPLATES_V2: ReportTemplateV2[] = [
  {
    id: 'blank',
    title: 'Boş Rapor',
    description: 'Sıfırdan başlayın, istediğiniz gibi özelleştirin',
    icon: Plus,
    estimatedPages: 'Sınırsız',
    tags: [],
    reportType: 'blank',
    defaultSections: [],
  },
  {
    id: 'investigation',
    title: 'Soruşturma Raporu Şablonu',
    description:
      'Personel davalarına sonuçlanabilecek standart yapı. Zimmet, usulsüzlük ve kötü niyet olayları için.',
    icon: AlertTriangle,
    estimatedPages: '3-5',
    tags: ['Zimmet Olayları', 'Kötü Niyet'],
    reportType: 'investigation',
    defaultSections: [
      { id: 'inv-1', title: 'Yönetici Özeti', orderIndex: 0 },
      { id: 'inv-2', title: 'Olayın Özeti', orderIndex: 1 },
      { id: 'inv-3', title: 'İfade Tutanakları ve Kanıtlar', orderIndex: 2 },
      { id: 'inv-4', title: 'Hukuki Durum', orderIndex: 3 },
      { id: 'inv-5', title: 'Sonuç', orderIndex: 4 },
    ],
  },
  {
    id: 'branch_audit',
    title: 'Şube Denetim Raporu Şablonu',
    description:
      'Operasyonel şube denetimleri için kapsamlı rapor formatı. Kasa, kredi ve idari işlemleri kapsar.',
    icon: Building2,
    estimatedPages: '8-12',
    tags: ['Kasa Denetimi', 'Süreç Uyumu'],
    reportType: 'branch_audit',
    defaultSections: [
      { id: 'br-1', title: 'Yönetici Özeti', orderIndex: 0 },
      { id: 'br-2', title: 'Gişe ve Operasyon', orderIndex: 1 },
      { id: 'br-3', title: 'Kredi ve Tahsis', orderIndex: 2 },
      { id: 'br-4', title: 'İdari İşler', orderIndex: 3 },
    ],
  },
  {
    id: 'compliance',
    title: 'Uyum Raporu Şablonu',
    description:
      'BDDK, MASAK, KVKK gibi mevzuat uyum değerlendirmesi. Yaptırım riski analizi dahildir.',
    icon: Scale,
    estimatedPages: '8-15',
    tags: ['BDDK Denetim Hazırlığı', 'Uyum İhlali'],
    reportType: 'compliance',
    defaultSections: [
      { id: 'co-1', title: 'Yönetici Özeti', orderIndex: 0 },
      { id: 'co-2', title: 'Mevzuat Uyum Analizi', orderIndex: 1 },
      { id: 'co-3', title: 'Risk Değerlendirmesi', orderIndex: 2 },
      { id: 'co-4', title: 'Yaptırım Riski', orderIndex: 3 },
    ],
  },
  {
    id: 'executive',
    title: 'Genel Müdür Sunumu Şablonu',
    description:
      'Yönetim kurulu ve genel müdürlük için özet sunum formatı. Aylık ve çeyreklik periyotlar için idealdir.',
    icon: BarChart2,
    estimatedPages: '2-4',
    tags: ['Aylık Yönetim Sunumu', 'Çeyreklik Risk Raporu'],
    reportType: 'executive',
    defaultSections: [
      { id: 'ex-1', title: 'Genel Bakış', orderIndex: 0 },
      { id: 'ex-2', title: 'Kilit Metrikler', orderIndex: 1 },
      { id: 'ex-3', title: 'Öncelikli Riskler', orderIndex: 2 },
    ],
  },
];

// ─── Legacy exports (for backward compat) ─────────────────────────────────────

export interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  category: 'branch' | 'investigation' | 'compliance' | 'sox' | 'general';
  content: string;
}

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'branch-audit',
    title: 'Şube Denetim Raporu',
    description: 'BDDK uyumlu şube denetim rapor şablonu',
    category: 'branch',
    content: '',
  },
  {
    id: 'investigation',
    title: 'Soruşturma Raporu',
    description: 'İhbar ve olay soruşturma rapor şablonu',
    category: 'investigation',
    content: '',
  },
  {
    id: 'compliance',
    title: 'Uyum Değerlendirme Raporu',
    description: 'Mevzuat ve regülasyon uyum raporu',
    category: 'compliance',
    content: '',
  },
];

export function getTemplateById(id: string): ReportTemplate | undefined {
  return REPORT_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): ReportTemplate[] {
  return REPORT_TEMPLATES.filter((t) => t.category === category);
}

export function applyTemplate(templateId: string): string {
  const template = getTemplateById(templateId);
  return template?.content || '';
}
