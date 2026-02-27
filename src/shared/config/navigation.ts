/**
 * Navigation Configuration - GIAS 2024 Aligned Structure
 *
 * ARCHITECTURE:
 * - Type A: Direct L1 Link (no children) - Only Cockpit
 * - Type B: L1 Group with L2 Children - All other 7 pillars
 *
 * CRITICAL: All ~95 active pages MUST be mapped here or as tabs in parent pages.
 * No orphaned pages allowed.
 */

import {
  LayoutDashboard,
  Target,
  Briefcase,
  BrainCircuit,
  ShieldAlert,
  Scale,
  Users,
  Settings,
  Map,
  Sparkles,
  TrendingUp,
  ClipboardList,
  Rocket,
  FileText,
  Brain,
  FlaskConical,
  AlertTriangle,
  Lock,
  CheckSquare,
  Leaf,
  Building2,
  UserCheck,
  FileSearch,
  Plug,
  Shield,
  BookOpen,
  Network,
  Smartphone,
  Calendar,
  Activity,
  BarChart3,
  Megaphone,
  Palette,
  Zap,
  GitBranch,
  Database,
  Sliders,
  GitMerge,
  PenLine,
  ClipboardCheck,
  ShieldCheck,
  GraduationCap,
  KanbanSquare,
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
}

export const navigationConfig: NavigationItem[] = [
  // ═══════════════════════════════════════════════════════════════
  // TYPE A: DIRECT L1 LINK (No children)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'cockpit',
    label: 'KOKPİT',
    path: '/dashboard',
    icon: LayoutDashboard,
    // NO children - makes it a direct clickable L1
    // Dashboard page has 3 tabs: Genel Bakış, Stratejik Analiz, Ekosistem
  },

  // ═══════════════════════════════════════════════════════════════
  // TYPE B: L1 GROUPS WITH L2 CHILDREN
  // ═══════════════════════════════════════════════════════════════

  // PILLAR 1: STRATEGY & GOVERNANCE
  {
    id: 'strategy-governance',
    label: 'STRATEJİ & YÖNETİŞİM',
    icon: Target,
    children: [
      {
        id: 'audit-universe',
        label: 'Denetim Evreni',
        path: '/strategy/audit-universe',
        icon: Map,
      },
      {
        id: 'risk-heatmap',
        label: 'Stratejik Isı Haritası',
        path: '/strategy/risk-heatmap',
        icon: TrendingUp,
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
        id: 'risk-simulator',
        label: 'Risk Simülatörü',
        path: '/strategy/risk-simulator',
        icon: FlaskConical,
        badge: 'YENİ',
        badgeColor: 'green',
      },
      {
        id: 'objectives',
        label: 'Stratejik Hedefler',
        path: '/strategy/objectives',
        icon: Target,
      },
      {
        id: 'risk-assessment',
        label: 'Risk Değerlendirme (RKM)',
        path: '/strategy/risk-assessment',
        icon: Shield,
      },
      {
        id: 'governance-vault',
        label: 'Yönetişim Kasası',
        path: '/governance/vault',
        icon: Lock,
      },
      {
        id: 'board-reporting',
        label: 'Kurul Raporlaması',
        path: '/governance/board',
        icon: Building2,
      },
      {
        id: 'stakeholder-management',
        label: 'Paydaş Yönetimi',
        path: '/governance/stakeholders',
        icon: Users,
      },
      {
        id: 'governance-charter',
        label: 'Denetim Tüzüğü',
        path: '/governance/charter',
        icon: FileText,
      },
    ],
  },

  // PILLAR 2: PLANNING & RESOURCES
  {
    id: 'planning-resources',
    label: 'PLANLAMA & KAYNAK',
    icon: Calendar,
    children: [
      {
        id: 'annual-plan',
        label: 'Yıllık Plan',
        path: '/strategy/annual-plan',
        icon: Calendar,
      },
      {
        id: 'resources',
        label: 'Kaynak Yönetimi',
        path: '/resources',
        icon: Users,
        // Note: This page has tabs: Profiles, Talent, Timesheets, Capacity
      },
      {
        id: 'talent-os',
        label: 'Denetçi Profilleri',
        path: '/resources/talent-os',
        icon: UserCheck,
      },
      // NOT: "Risk Metodolojisi" buradan kaldırılıp Sistem Ayarlarına taşındı!
      {
        id: 'quant-analysis',
        label: 'Kantitatif Analiz',
        path: '/strategy/quant',
        icon: FlaskConical,
        badge: 'BETA',
        badgeColor: 'blue',
      },
    ],
  },

  // PILLAR 2b: TALENT & QUALITY
  {
    id: 'talent-quality',
    label: 'YETENEK & KALİTE',
    icon: GraduationCap,
    badge: 'YENİ',
    badgeColor: 'emerald',
    children: [
      {
        id: 'talent-os-main',
        label: 'Talent OS',
        path: '/talent',
        icon: UserCheck,
        badge: 'RPG',
        badgeColor: 'blue',
      },
      {
        id: 'assessment-center',
        label: 'Değerlendirme Merkezi',
        path: '/surveys',
        icon: ClipboardCheck,
      },
      {
        id: 'qaip-cockpit',
        label: 'QAIP / Kalite',
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

  // PILLAR 3: AUDIT OPERATIONS
  {
    id: 'audit-operations',
    label: 'DENETİM OPERASYONU',
    icon: Briefcase,
    children: [
      {
        id: 'my-engagements',
        label: 'Görevlerim',
        path: '/execution/my-engagements',
        icon: Briefcase,
      },
      // --- BULGU MERKEZİ (GÜNCELLENDİ) ---
      {
        id: 'findings-hub',
        label: 'Bulgu Merkezi',
        path: '/execution/findings', // <-- DOĞRU ROTA
        icon: AlertTriangle,
        badge: 'YENİ',
        badgeColor: 'red',
      },
      // -----------------------------------
      {
        id: 'workpapers',
        label: 'Çalışma Kağıtları',
        path: '/execution/workpapers',
        icon: FileText,
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
        id: 'actions',
        label: 'Aksiyon Takip',
        path: '/actions',
        icon: CheckSquare,
        badge: 'M7',
        badgeColor: 'amber',
      },
      {
        id: 'pbc-requests',
        label: 'PBC Talepleri',
        path: '/execution/pbc',
        icon: FileSearch,
      },
      {
        id: 'agile-engagements',
        label: 'Agile Denetimler',
        path: '/execution/agile',
        icon: Rocket,
      },
      {
        id: 'sprint-board',
        label: 'Çevik Pano (Sprint)',
        path: '/execution/sprint-board',
        icon: KanbanSquare,
        badge: 'YENİ',
        badgeColor: 'blue',
      },
      {
        id: 'audit-programs',
        label: 'Denetim Programları',
        path: '/library/audit-programs',
        icon: ClipboardList,
      },
      {
        id: 'procedures',
        label: 'Prosedür Kütüphanesi',
        path: '/library/procedures',
        icon: FileSearch,
      },
      {
        id: 'process-canvas',
        label: 'Süreç Haritası',
        path: '/process-canvas',
        icon: GitBranch,
      },
    ],
  },

  // PILLAR 4: SENTINEL BRAIN (AI)
  {
    id: 'sentinel-brain',
    label: 'SENTINEL BRAIN',
    icon: BrainCircuit,
    badge: 'AI',
    badgeColor: 'blue',
    children: [
      {
        id: 'predator',
        label: 'Predator / CCM',
        path: '/ccm/predator',
        icon: Activity,
        badge: 'LIVE',
        badgeColor: 'green',
      },
      {
        id: 'ai-agents',
        label: 'Ajan Kontrol Merkezi',
        path: '/ai-agents',
        icon: Brain,
      },
      {
        id: 'anomaly-cockpit',
        label: 'Anomali Kokpiti',
        path: '/ccm/anomalies',
        icon: AlertTriangle,
      },
      {
        id: 'oracle',
        label: 'The Oracle',
        path: '/oracle',
        icon: Sparkles,
      },
      {
        id: 'chaos-lab',
        label: 'Kaos Laboratuvarı',
        path: '/chaos-lab',
        icon: FlaskConical,
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
      },
      {
        id: 'credit-monitoring',
        label: 'Kredi İzleme',
        path: '/monitoring/credit',
        icon: TrendingUp,
        badge: 'LIVE',
        badgeColor: 'emerald',
      },
      {
        id: 'market-monitoring',
        label: 'Piyasa İzleme',
        path: '/monitoring/market',
        icon: BarChart3,
        badge: 'LIVE',
        badgeColor: 'emerald',
      },
      {
        id: 'risk-laboratory',
        label: 'Risk Laboratuvarı',
        path: '/strategy/risk-lab',
        icon: FlaskConical,
      },
    ],
  },

  // PILLAR 5: COMPLIANCE & ADVISORY
  {
    id: 'compliance-advisory',
    label: 'UYUM & DANIŞMANLIK',
    icon: Scale,
    children: [
      {
        id: 'fatwa-gpt',
        label: 'Fatwa-GPT',
        path: '/shariah/fatwa-gpt',
        icon: BookOpen,
        badge: 'BETA',
        badgeColor: 'blue',
      },
      {
        id: 'compliance-mapper',
        label: 'Uyum Haritası',
        path: '/compliance',
        icon: CheckSquare,
      },
      {
        id: 'gap-analysis',
        label: 'Gap Analizi',
        path: '/compliance/gap-analysis',
        icon: FileSearch,
      },
      {
        id: 'regulations',
        label: 'Regülasyon Kütüphanesi',
        path: '/compliance/regulations',
        icon: FileText,
      },
      {
        id: 'advisory',
        label: 'Danışmanlık Hub',
        path: '/advisory',
        icon: Brain,
      },
      {
        id: 'sox',
        label: 'SOX / ICFR',
        path: '/sox',
        icon: Shield,
      },
      {
        id: 'tprm',
        label: 'Tedarikçi Riski (TPRM)',
        path: '/tprm',
        icon: Building2,
      },
      {
        id: 'vendor-portal',
        label: 'Tedarikçi Portalı',
        path: '/vendor-portal',
        icon: Building2,
      },
      {
        id: 'esg',
        label: 'ESG & Sürdürülebilirlik',
        path: '/esg',
        icon: Leaf,
      },
      {
        id: 'policy-library',
        label: 'Politika Kütüphanesi',
        path: '/governance/policies',
        icon: FileText,
      },
    ],
  },

  // PILLAR 6: REPORTING & QUALITY
  {
    id: 'reporting-quality',
    label: 'RAPORLAMA & KALİTE',
    icon: FileText,
    children: [
      {
        id: 'report-library',
        label: 'Rapor Kütüphanesi',
        path: '/reporting/library',
        icon: FileText,
      },
      {
        id: 'zen-editor',
        label: 'Zen Editör',
        path: '/reporting/zen-editor',
        icon: PenLine,
      },
      {
        id: 'entity-scorecard',
        label: 'Birim Karnesi',
        path: '/reporting/entity-scorecard',
        icon: BarChart3,
      },
      {
        id: 'trends',
        label: 'Trend Analizi',
        path: '/reporting/trends',
        icon: TrendingUp,
      },
      {
        id: 'executive-dashboard',
        label: 'Yönetici Özeti',
        path: '/reporting/executive',
        icon: LayoutDashboard,
      },
      {
        id: 'activity-reports',
        label: 'Faaliyet Raporları',
        path: '/reporting/activity-reports',
        icon: Activity,
      },
    ],
  },

  // PILLAR 7: INVESTIGATION & ETHICS
  {
    id: 'investigation',
    label: 'SORUŞTURMA & ETİK',
    icon: ShieldAlert,
    children: [
      {
        id: 'investigation-hub',
        label: 'İhbar Kokpiti',
        path: '/investigation',
        icon: ShieldAlert,
      },
      {
        id: 'triage',
        label: 'Triyaj Kokpiti',
        path: '/triage-cockpit',
        icon: AlertTriangle,
      },
      {
        id: 'secure-report',
        label: 'Güvenli İhbar Formu',
        path: '/secure-report',
        icon: Lock,
      },
      {
        id: 'whistleblower',
        label: 'İhbar Kanalı',
        path: '/governance/voice',
        icon: Megaphone,
      },
    ],
  },

  // PILLAR 8: SYSTEM & SETTINGS
  {
    id: 'system-settings',
    label: 'SİSTEM & AYARLAR',
    icon: Settings,
    children: [
      {
        id: 'system-health',
        label: 'Sistem Sağlığı',
        path: '/settings/system-health',
        icon: Database,
        badge: 'DEV',
        badgeColor: 'red',
      },
      {
        id: 'diagnostics',
        label: 'Test & Tanı',
        path: '/dev/diagnostics',
        icon: Activity,
        badge: 'TEST',
        badgeColor: 'blue',
      },
      {
        id: 'risk-constitution',
        label: 'Risk Anayasası',
        path: '/settings/risk-constitution',
        icon: FileText,
      },
      // YENİ DÜZENLEME: Metodoloji ve Şablonlar mantıklı bir sıra ile eklendi
      {
        id: 'methodology',
        label: 'Metodoloji & Parametreler',
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
        label: 'Şablon Yöneticisi',
        path: '/settings/templates',
        icon: FileText,
      },
      {
        id: 'users',
        label: 'Kullanıcılar',
        path: '/settings/users',
        icon: Users,
      },
      {
        id: 'integrations',
        label: 'Entegrasyonlar',
        path: '/settings/integrations',
        icon: Plug,
      },
      {
        id: 'appearance',
        label: 'Görünüm',
        path: '/settings/appearance',
        icon: Palette,
      },
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
        id: 'dev-map',
        label: 'Geliştirici Haritası',
        path: '/dev-map',
        icon: Map,
        badge: 'DEV',
        badgeColor: 'purple',
      },
      {
        id: 'page-audit',
        label: 'Sayfa Denetim Aracı',
        path: '/dev/page-audit',
        icon: FileSearch,
        badge: 'DEV',
        badgeColor: 'red',
      },
      {
        id: 'page-inventory',
        label: 'Sayfa Envanteri',
        path: '/dev/inventory',
        icon: Database,
        badge: 'DEV',
        badgeColor: 'purple',
      },
    ],
  },
];

/**
 * PAGE COVERAGE AUDIT (95+ Pages Mapped)
 * ...
 */

export function getAllNavigationPaths(): string[] {
  const paths: string[] = [];

  function extractPaths(items: NavigationItem[]) {
    for (const item of items) {
      if (item.path) {
        paths.push(item.path);
      }
      if (item.children) {
        extractPaths(item.children);
      }
    }
  }

  extractPaths(navigationConfig);
  return paths;
}

export function findNavigationItem(path: string): NavigationItem | null {
  function search(items: NavigationItem[]): NavigationItem | null {
    for (const item of items) {
      if (item.path === path) {
        return item;
      }
      if (item.children) {
        const found = search(item.children);
        if (found) return found;
      }
    }
    return null;
  }

  return search(navigationConfig);
}