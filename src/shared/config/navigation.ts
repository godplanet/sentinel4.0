/**
 * Navigation Configuration – Sentinel GRC v3.0
 * "11+1 Enterprise Lifecycle" mimarisi
 *
 * HIYERARŞI:
 *   L1  → Ana Modül (sekme yok ise direkt link, varsa children ile grup)
 *   L2  → Alt sekme / sayfa linki
 *
 * KURAL: Projedeki hiçbir sayfa bu config'in dışında kalmamalıdır.
 * Eşleştirilemeyen sayfalar 11. maddenin "Sınıflandırılmamış" alt grubuna eklenir.
 *
 * isSentinelBrain: true  →  Bu özellik ile işaretlenen L1 öğe,
 *   Sidebar render döngüsünün DIŞINA çıkarılarak en alta ayrı bir
 *   "AI & CCM" bölümü olarak render edilir.
 */

import {
  LayoutDashboard,
  Target,
  Scale,
  CalendarRange,
  Briefcase,
  Flag,
  Archive,
  Award,
  ShieldAlert,
  Library,
  Settings,
  BrainCircuit,
  // L2 ikon imports
  Map,
  TrendingUp,
  Network,
  FlaskConical,
  Leaf,
  Building2,
  BookOpen,
  CheckSquare,
  FileSearch,
  Shield,
  ClipboardList,
  FileText,
  Calendar,
  Users,
  UserCheck,
  ClipboardCheck,
  Activity,
  Megaphone,
  Lock,
  AlertTriangle,
  Database,
  Sliders,
  GitMerge,
  Palette,
  Brain,
  Zap,
  BarChart3,
  PenLine,
  Rocket,
  Smartphone,
  GitBranch,
  Package,
  KanbanSquare,
  GraduationCap,
  Sparkles,
  Globe,
  MonitorDot,
  Swords,
  ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  path?: string;
  icon?: LucideIcon;
  children?: NavigationItem[];
  badge?: string;
  badgeColor?: string;
  /** Bu flag true ise öğe standart nav döngüsünden çıkarılır,
   *  Sidebar'ın en altında Cyberpunk/AI temasıyla ayrıca render edilir. */
  isSentinelBrain?: boolean;
}

export const navigationConfig: NavigationItem[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. YÖNETİM KOKPİTİ
  //    Üst yönetim için genel bakış, stratejik analiz ve ekosistem haritası.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'cockpit',
    label: 'YÖNETİM KOKPİTİ',
    icon: LayoutDashboard,
    children: [
      {
        id: 'executive-radar',
        label: 'Üst Yönetim Radarı',
        path: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        id: 'audit-leadership',
        label: 'Teftiş Liderliği Özeti',
        path: '/dashboard/strategic',
        icon: BarChart3,
      },
      {
        id: 'ecosystem-view',
        label: 'Ekosistem Haritası',
        path: '/dashboard/ecosystem',
        icon: Globe,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. STRATEJİ VE RİSK
  //    Denetim evreni, risk değerlendirme, ESG ve tedarikçi riski.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'strategy-risk',
    label: 'STRATEJİ VE RİSK',
    icon: Target,
    children: [
      {
        id: 'audit-universe',
        label: 'Denetim Evreni',
        path: '/strategy/audit-universe',
        icon: Map,
      },
      {
        id: 'strategic-goals',
        label: 'Stratejik Hedefler',
        path: '/strategy/objectives',
        icon: Target,
      },
      {
        id: 'risk-heatmap',
        label: 'Risk Isı Haritası',
        path: '/strategy/risk-heatmap',
        icon: TrendingUp,
      },
      {
        id: 'risk-simulator',
        label: 'Risk Simülatörü',
        path: '/strategy/risk-simulator',
        icon: FlaskConical,
        badge: 'YENİ',
        badgeColor: 'green',
      },
      {
        id: 'neural-map',
        label: 'Sinir Haritası',
        path: '/strategy/neural-map',
        icon: Network,
        badge: 'CANLI',
        badgeColor: 'emerald',
      },
      {
        id: 'esg',
        label: 'Çevresel ve Sosyal (ESG)',
        path: '/esg',
        icon: Leaf,
      },
      {
        id: 'tprm',
        label: 'Dış Tedarikçiler (TPRM)',
        path: '/tprm',
        icon: Building2,
      },
      {
        id: 'risk-lab',
        label: 'Risk Laboratuvarı',
        path: '/strategy/risk-lab',
        icon: FlaskConical,
      },
      {
        id: 'quant',
        label: 'Kantitatif Analiz',
        path: '/strategy/quant',
        icon: BarChart3,
        badge: 'BETA',
        badgeColor: 'blue',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. UYUM VE İÇ KONTROL
  //    Mevzuat, SOX/ICFR, birleşik güvence ve Şer'i kontrol.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'compliance-control',
    label: 'UYUM VE İÇ KONTROL',
    icon: Scale,
    children: [
      {
        id: 'sox',
        label: 'SOX ve Finansal Kontroller',
        path: '/sox',
        icon: Shield,
      },
      {
        id: 'unified-assurance',
        label: 'Birleşik Güvence',
        path: '/compliance',
        icon: ShieldCheck,
      },
      {
        id: 'gap-analysis',
        label: 'Gap Analizi',
        path: '/compliance/gap-analysis',
        icon: FileSearch,
      },
      {
        id: 'fatwa-gpt',
        label: 'Şer\'i Kontrol (Fatwa-GPT)',
        path: '/shariah/fatwa-gpt',
        icon: BookOpen,
        badge: 'BETA',
        badgeColor: 'blue',
      },
      {
        id: 'vendor-portal',
        label: 'Tedarikçi Portalı',
        path: '/vendor-portal',
        icon: Package,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. PLANLAMA VE KAYNAK
  //    Bimodal planlama, Delphi anketleri, yetenek ve kaynak yönetimi.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'planning-resource',
    label: 'PLANLAMA VE KAYNAK',
    icon: CalendarRange,
    children: [
      {
        id: 'annual-plan',
        label: 'Bimodal Planlama',
        path: '/strategy/annual-plan',
        icon: Calendar,
      },
      {
        id: 'delphi',
        label: 'Delphi Risk Anketleri',
        path: '/oracle',
        icon: Sparkles,
        badge: 'AI',
        badgeColor: 'purple',
      },
      {
        id: 'talent-os',
        label: 'Yetenek İşletim Sistemi',
        path: '/resources/talent-os',
        icon: UserCheck,
        badge: 'RPG',
        badgeColor: 'blue',
      },
      {
        id: 'resources',
        label: 'Kaynak Yönetimi',
        path: '/resources',
        icon: Users,
      },
      {
        id: 'talent-main',
        label: 'Talent OS (Kadro)',
        path: '/talent',
        icon: UserCheck,
      },
      {
        id: 'surveys',
        label: 'Değerlendirme Merkezi',
        path: '/surveys',
        icon: ClipboardCheck,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. DENETİM İCRASI
  //    Görev yönetimi, çalışma kağıtları, kanıt talepleri ve saha operasyonu.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'field-execution',
    label: 'DENETİM İCRASI',
    icon: Briefcase,
    children: [
      {
        id: 'new-engagement',
        label: 'Yeni Görev Oluştur',
        path: '/execution/start',
        icon: Rocket,
      },
      {
        id: 'my-engagements',
        label: 'Görevlerim',
        path: '/execution/my-engagements',
        icon: Briefcase,
      },
      {
        id: 'agile-tasks',
        label: 'Çevik Görevler',
        path: '/execution/agile',
        icon: KanbanSquare,
      },
      {
        id: 'workpapers',
        label: 'Akıllı Çalışma Kağıtları',
        path: '/execution/workpapers',
        icon: FileText,
      },
      {
        id: 'pbc-portal',
        label: 'Kanıt Talep Portalı (PBC)',
        path: '/execution/pbc',
        icon: FileSearch,
      },
      {
        id: 'field-agent',
        label: 'Saha Ajanı',
        path: '/execution/field-agent',
        icon: Smartphone,
        badge: 'MOBİL',
        badgeColor: 'purple',
      },
      {
        id: 'process-canvas',
        label: 'Süreç Haritası',
        path: '/process-canvas',
        icon: GitBranch,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. BULGU VE AKSİYON YÖNETİMİ
  //    Bulgu stüdyosu, aksiyon takibi, risk kabulleri ve müzakere.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'finding-action',
    label: 'BULGU VE AKSİYON',
    icon: Flag,
    children: [
      {
        id: 'finding-studio',
        label: 'Bulgu Stüdyosu',
        path: '/execution/findings',
        icon: AlertTriangle,
        badge: 'M5',
        badgeColor: 'red',
      },
      {
        id: 'action-tracking',
        label: 'Aksiyon Takibi',
        path: '/actions',
        icon: CheckSquare,
        badge: 'M7',
        badgeColor: 'amber',
      },
      {
        id: 'risk-acceptance',
        label: 'Risk Kabulleri (Buz Odası)',
        path: '/auditor-workbench',
        icon: Lock,
      },
      {
        id: 'governance-workbench',
        label: 'Yönetişim Çalışma Ortamı',
        path: '/governance-workbench',
        icon: Shield,
      },
      {
        id: 'ecosystem-impact',
        label: 'Ekosistem Etki Analizi',
        path: '/ecosystem-impact',
        icon: Globe,
      },
      {
        id: 'auditee-portal-link',
        label: 'Denetlenen Portalı',
        path: '/auditee-portal',
        icon: Building2,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. RAPORLAMA VE ARŞİV
  //    Iron Vault raporları, yönetici özetleri, kurul brifingleri.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'reporting-archive',
    label: 'RAPORLAMA VE ARŞİV',
    icon: Archive,
    children: [
      {
        id: 'report-library',
        label: 'Iron Vault Raporları',
        path: '/reporting/library',
        icon: Archive,
      },
      {
        id: 'executive-summaries',
        label: 'Yönetici Özetleri',
        path: '/reporting/executive',
        icon: LayoutDashboard,
      },
      {
        id: 'board-reporting',
        label: 'Kurul Raporlaması',
        path: '/governance/board',
        icon: Building2,
      },
      {
        id: 'zen-editor',
        label: 'Rapor Düzenleyici (Zen)',
        path: '/reporting/zen-editor',
        icon: PenLine,
      },
      {
        id: 'trends',
        label: 'Trend Analizi',
        path: '/reporting/trends',
        icon: TrendingUp,
      },
      {
        id: 'entity-scorecard',
        label: 'Birim Karnesi',
        path: '/reporting/entity-scorecard',
        icon: BarChart3,
      },
      {
        id: 'activity-reports',
        label: 'Faaliyet Raporları',
        path: '/reporting/activity-reports',
        icon: Activity,
      },
      {
        id: 'campaign-closure',
        label: 'Toplu Kapanış Kampanyaları',
        path: '/governance-workbench',
        icon: ClipboardList,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. REHBERLİK VE KALİTE
  //    Danışmanlık, QAIP, akademi ve denetim playbook'u.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'guidance-quality',
    label: 'REHBERLİK VE KALİTE',
    icon: Award,
    children: [
      {
        id: 'advisory',
        label: 'Danışmanlık Projeleri',
        path: '/advisory',
        icon: Brain,
      },
      {
        id: 'qaip',
        label: 'Kalite Güvence (QAIP)',
        path: '/qaip',
        icon: ShieldCheck,
      },
      {
        id: 'academy',
        label: 'Akademi & Sertifika',
        path: '/academy',
        icon: GraduationCap,
        badge: 'YENİ',
        badgeColor: 'blue',
      },
      {
        id: 'playbook',
        label: 'Denetim Playbook\'u',
        path: '/playbook',
        icon: BookOpen,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. GİZLİ SORUŞTURMA
  //    İhbar, adli bilişim ve soruşturma yönetimi. Kısıtlı erişim.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'secret-investigation',
    label: 'GİZLİ SORUŞTURMA',
    icon: ShieldAlert,
    children: [
      {
        id: 'investigation-hub',
        label: 'İhbar Masası',
        path: '/investigation',
        icon: ShieldAlert,
      },
      {
        id: 'triage-cockpit',
        label: 'Triyaj Kokpiti',
        path: '/triage-cockpit',
        icon: Swords,
      },
      {
        id: 'investigation-vault',
        label: 'Soruşturma Kasası',
        path: '/investigation',
        icon: Lock,
      },
      {
        id: 'whistleblower-channel',
        label: 'İhbar Kanalı',
        path: '/governance/voice',
        icon: Megaphone,
      },
      {
        id: 'secure-report',
        label: 'Güvenli İhbar Formu',
        path: '/secure-report',
        icon: FileSearch,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. KÜTÜPHANE
  //     Risk & Kontrol Matrisi, Denetim Programları, Prosedürler, Politika, Tüzük.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'library',
    label: 'KÜTÜPHANE',
    icon: Library,
    children: [
      {
        id: 'risk-control-matrix',
        label: 'Risk Kontrol Matrisi',
        path: '/strategy/risk-assessment',
        icon: Shield,
      },
      {
        id: 'audit-programs',
        label: 'Denetim Programları',
        path: '/library/audit-programs',
        icon: ClipboardList,
      },
      {
        id: 'procedures',
        label: 'Prosedürler',
        path: '/library/procedures',
        icon: FileSearch,
      },
      {
        id: 'program-library',
        label: 'Program Kütüphanesi',
        path: '/library/programs',
        icon: BookOpen,
      },
      {
        id: 'policy-library',
        label: 'Politika Kütüphanesi',
        path: '/governance/policies',
        icon: FileText,
      },
      {
        id: 'audit-charter',
        label: 'Denetim Tüzüğü',
        path: '/governance/charter',
        icon: FileText,
      },
      {
        id: 'regulations',
        label: 'Mevzuat Kütüphanesi',
        path: '/compliance/regulations',
        icon: BookOpen,
      },
      {
        id: 'governance-vault',
        label: 'Yönetişim Kasası',
        path: '/governance/vault',
        icon: Lock,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 11. SİSTEM VE AYARLAR
  //     Metodoloji, şablonlar, kullanıcı yönetimi ve sınıflandırılmamış sayfalar.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'system-settings',
    label: 'SİSTEM VE AYARLAR',
    icon: Settings,
    children: [
      {
        id: 'methodology',
        label: 'Parametreler ve Metodoloji',
        path: '/settings/methodology',
        icon: Sliders,
      },
      {
        id: 'workflow',
        label: 'İş Akışı & Yetki',
        path: '/settings/workflow',
        icon: GitMerge,
      },
      {
        id: 'templates',
        label: 'Şablon İnşacısı',
        path: '/settings/templates',
        icon: FileText,
      },
      {
        id: 'users',
        label: 'Kullanıcı Yönetimi',
        path: '/settings/users',
        icon: Users,
      },
      {
        id: 'risk-constitution',
        label: 'Risk Anayasası',
        path: '/settings/risk-constitution',
        icon: FileText,
      },
      {
        id: 'system-health',
        label: 'Sistem Sağlığı',
        path: '/settings/system-health',
        icon: Database,
        badge: 'DEV',
        badgeColor: 'red',
      },
      {
        id: 'appearance',
        label: 'Görünüm',
        path: '/settings/appearance',
        icon: Palette,
      },
      {
        id: 'integrations',
        label: 'Entegrasyonlar',
        path: '/settings/integrations',
        icon: MonitorDot,
      },
      // ── Sınıflandırılmamış (Öksüzler) ──────────────────────────────────
      {
        id: 'cognitive-engine',
        label: 'AI Motor Ayarları',
        path: '/settings/cognitive-engine',
        icon: Brain,
      },
      {
        id: 'custom-fields',
        label: 'Özel Alanlar',
        path: '/settings/custom-fields',
        icon: FileText,
      },
      {
        id: 'stakeholders',
        label: 'Paydaş Yönetimi',
        path: '/governance/stakeholders',
        icon: Users,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 12. SÜREKLİ DENETİM & AI  [isSentinelBrain: true]
  //     Sidebar'ın standart döngüsünden çıkarılır ve en alta Cyberpunk
  //     temasıyla özel bir bölüm olarak render edilir.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'sentinel-brain',
    label: 'SÜREKLİ DENETİM & AI',
    icon: BrainCircuit,
    isSentinelBrain: true,
    badge: 'AI',
    badgeColor: 'blue',
    children: [
      {
        id: 'ccm-predator',
        label: 'Canlı Tehdit Radarı (CCM)',
        path: '/ccm/predator',
        icon: Activity,
        badge: 'LIVE',
        badgeColor: 'green',
      },
      {
        id: 'ccm-data-monitor',
        label: 'CCM Veri Monitörü',
        path: '/ccm/data-monitor',
        icon: MonitorDot,
      },
      {
        id: 'anomaly-cockpit',
        label: 'Anomali Kokpiti',
        path: '/ccm/anomalies',
        icon: AlertTriangle,
      },
      {
        id: 'ai-agents',
        label: 'AI Asistanlar',
        path: '/ai-agents',
        icon: Brain,
        badge: 'AI',
        badgeColor: 'purple',
      },
      {
        id: 'chaos-lab',
        label: 'Gölge Defter (Kaos Lab)',
        path: '/chaos-lab',
        icon: FlaskConical,
        badge: 'YENİ',
        badgeColor: 'blue',
      },
      {
        id: 'automation',
        label: 'Otomasyon Motoru',
        path: '/automation',
        icon: Zap,
      },
      {
        id: 'watchtower',
        label: 'Gözetim Kulesi',
        path: '/monitoring/watchtower',
        icon: TrendingUp,
        badge: 'LIVE',
        badgeColor: 'emerald',
      },
      {
        id: 'credit-monitoring',
        label: 'Kredi İzleme',
        path: '/monitoring/credit',
        icon: BarChart3,
        badge: 'LIVE',
        badgeColor: 'emerald',
      },
      {
        id: 'market-monitoring',
        label: 'Piyasa İzleme',
        path: '/monitoring/market',
        icon: TrendingUp,
        badge: 'LIVE',
        badgeColor: 'emerald',
      },
    ],
  },
];

// ─── Yardımcı Fonksiyonlar ────────────────────────────────────────────────────

/** Tüm L2 path'lerini düz liste olarak döner. */
export function getAllNavigationPaths(): string[] {
  const paths: string[] = [];
  function extractPaths(items: NavigationItem[]) {
    for (const item of items) {
      if (item.path) paths.push(item.path);
      if (item.children) extractPaths(item.children);
    }
  }
  extractPaths(navigationConfig);
  return paths;
}

/** Verilen path ile eşleşen NavigationItem'ı döner. */
export function findNavigationItem(path: string): NavigationItem | null {
  function search(items: NavigationItem[]): NavigationItem | null {
    for (const item of items) {
      if (item.path === path) return item;
      if (item.children) {
        const found = search(item.children);
        if (found) return found;
      }
    }
    return null;
  }
  return search(navigationConfig);
}

/** Standart nav öğeleri (isSentinelBrain olmayanlar). */
export const standardNavItems = navigationConfig.filter((m) => !m.isSentinelBrain);

/** Sentinel Brain/AI öğesi (isSentinelBrain: true olan tekil blok). */
export const sentinelBrainItem = navigationConfig.find((m) => m.isSentinelBrain) ?? null;
