import type { SmartVariable } from './types';

export const SMART_VARIABLES: SmartVariable[] = [
  {
    key: 'audit_name',
    label: 'Denetim Adi',
    category: 'audit',
    resolve: () => 'Kredi Surecleri Denetimi 2026',
  },
  {
    key: 'audit_period',
    label: 'Denetim Donemi',
    category: 'audit',
    resolve: () => '01.01.2026 - 31.03.2026',
  },
  {
    key: 'audit_scope',
    label: 'Denetim Kapsamı',
    category: 'audit',
    resolve: () => 'Bireysel ve Ticari Kredi Surecleri',
  },
  {
    key: 'lead_auditor',
    label: 'Sorumlu Denetci',
    category: 'team',
    resolve: () => 'Mehmet Yilmaz, CIA',
  },
  {
    key: 'team_members',
    label: 'Denetim Ekibi',
    category: 'team',
    resolve: () => 'Ayse Demir, Fatma Kaya, Ali Celik',
  },
  {
    key: 'audit_manager',
    label: 'Denetim Yoneticisi',
    category: 'team',
    resolve: () => 'Hasan Ozturk, CISA',
  },
  {
    key: 'high_risk_count',
    label: 'Yuksek Risk Sayisi',
    category: 'finding',
    resolve: () => '3',
  },
  {
    key: 'medium_risk_count',
    label: 'Orta Risk Sayisi',
    category: 'finding',
    resolve: () => '7',
  },
  {
    key: 'low_risk_count',
    label: 'Dusuk Risk Sayisi',
    category: 'finding',
    resolve: () => '4',
  },
  {
    key: 'total_findings',
    label: 'Toplam Bulgu',
    category: 'finding',
    resolve: () => '14',
  },
  {
    key: 'critical_findings',
    label: 'Kritik Bulgular',
    category: 'finding',
    resolve: () => '1',
  },
  {
    key: 'overall_risk_score',
    label: 'Genel Risk Skoru',
    category: 'risk',
    resolve: () => '72/100',
  },
  {
    key: 'risk_rating',
    label: 'Risk Derecesi',
    category: 'risk',
    resolve: () => 'Orta-Yuksek',
  },
  {
    key: 'control_effectiveness',
    label: 'Kontrol Etkinligi',
    category: 'risk',
    resolve: () => '%68',
  },
  {
    key: 'report_date',
    label: 'Rapor Tarihi',
    category: 'date',
    resolve: () => new Date().toLocaleDateString('tr-TR'),
  },
  {
    key: 'fieldwork_start',
    label: 'Saha Calismasi Baslangic',
    category: 'date',
    resolve: () => '15.01.2026',
  },
  {
    key: 'fieldwork_end',
    label: 'Saha Calismasi Bitis',
    category: 'date',
    resolve: () => '28.02.2026',
  },
  {
    key: 'draft_date',
    label: 'Taslak Rapor Tarihi',
    category: 'date',
    resolve: () => '10.03.2026',
  },
];

export const VARIABLE_CATEGORIES = [
  { key: 'audit', label: 'Denetim', color: 'blue' },
  { key: 'finding', label: 'Bulgular', color: 'red' },
  { key: 'risk', label: 'Risk', color: 'amber' },
  { key: 'date', label: 'Tarihler', color: 'emerald' },
  { key: 'team', label: 'Ekip', color: 'slate' },
] as const;

export function resolveVariablesInText(text: string): string {
  let resolved = text;
  for (const variable of SMART_VARIABLES) {
    const pattern = `[${variable.label}]`;
    if (resolved.includes(pattern)) {
      resolved = resolved.replaceAll(pattern, variable.resolve());
    }
  }
  return resolved;
}
