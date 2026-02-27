import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const tr = {
  translation: {
    sidebar: {
      groups: {
        cockpit: 'KOKPİT',
        strategy: 'STRATEJİ & PLANLAMA',
        execution: 'DENETİM İCRASI',
        monitoring: 'İZLEME & RAPORLAMA',
        management: 'YÖNETİM',
        config: 'YAPILANDIRMA'
      },
      items: {
        managementSummary: 'Yönetim Özeti',
        riskHeatmap: 'Risk Isı Haritası',
        strategicManagement: 'Stratejik Yönetim',
        rkmMasterLibrary: 'RKM Master Kütüphane',
        rkmLibrary: 'RKM Kütüphanesi',
        auditUniverse: 'Denetim Evreni',
        riskNetwork: 'Risk Ağı (Network)',
        annualPlanGantt: 'Yıllık Plan (Makro+Gantt)',
        annualPlanLegacy: 'Yıllık Plan (Legacy)',
        resourceManagement: 'Kaynak Yönetimi',
        auditTasks: 'Denetim Görevleri',
        workpapers: 'Çalışma Kağıtları',
        findingManagement: 'Bulgu Yönetimi',
        findingHubLegacy: 'Bulgu Hub (Legacy)',
        auditeePortal: 'Denetlenen Portalı',
        evidenceManagement: 'Kanıt Yönetimi',
        planCompliance: 'Plan Uyum Analizi',
        actionTracking: 'Aksiyon Takip',
        reportCenter: 'Rapor Merkezi',
        qualityAssurance: 'Kalite Güvence (QAIP)',
        settings: 'Ayarlar',
        systemDefinitions: 'Sistem Tanımları',
        riskMethodology: 'Risk Metodolojisi',
        riskLaboratory: 'Risk Laboratuvarı',
        customFields: 'Özel Alanlar',
        templateManager: 'Şablon Yöneticisi'
      },
      user: {
        chiefAuditor: 'Baş Denetçi',
        generalDirectorate: 'Genel Müdürlük'
      }
    },
    header: {
      notifications: 'Bildirimler',
      profile: 'Profil',
      logout: 'Çıkış Yap'
    },
    planning: {
      title: 'Denetim Planlaması',
      description: 'Stratejik Planlama ve Görev Çizelgeleme',
      aiPlanningAssistant: 'AI Planlama Asistanı',
      totalAudits: 'Toplam Denetim',
      completed: 'Tamamlandı',
      inProgress: 'Devam Ediyor',
      ganttTimeline: 'Gantt Zaman Çizelgesi',
      newAudit: 'Yeni Denetim',
      ganttView: 'Gantt Görünümü',
      analyticsView: 'Analitik Görünümü',
      missionControl: 'Görev Merkezi',
      timeline: 'Zaman Çizelgesi',
      planComplianceAnalysis: 'Plan Uyum Analizi',
      realtimeMetrics: 'Gerçek zamanlı plan performans metrikleri ve sapma analizi',
      totalPlannedHours: 'Toplam Planlanan Saat',
      totalActualHours: 'Toplam Gerçekleşen Saat',
      onTimeEngagements: 'Zamanında Denetimler',
      delayedEngagements: 'Gecikmeli Denetimler'
    },
    strategy: {
      title: 'Stratejik Yönetim',
      description: 'Kurumsal hedefler, denetim stratejisi ve risk ağırlıklandırma',
      corporateGoals: 'Kurumsal Hedefler',
      auditObjectives: 'Denetim Hedefleri',
      riskWeighting: 'Risk Ağırlıklandırma',
      alignmentMap: 'Hizalama Haritası',
      addGoal: 'Hedef Ekle',
      addObjective: 'Hedef Ekle',
      aiAdvisor: 'AI Danışman'
    },
    universe: {
      title: 'Denetim Evreni',
      description: 'Hiyerarşik risk haritası ve denetlenebilir birimler',
      treeView: 'Ağaç Görünümü',
      listView: 'Liste Görünümü',
      addEntity: 'Birim Ekle',
      totalEntities: 'Toplam Birim',
      highRisk: 'Yüksek Risk',
      dueForAudit: 'Denetim Zamanı'
    },
    execution: {
      title: 'Denetim İcrası',
      description: 'Saha çalışması, bulgu yönetimi ve çalışma kağıtları',
      fieldwork: 'Saha Çalışması',
      findings: 'Bulgular',
      workpapers: 'Çalışma Kağıtları',
      evidence: 'Kanıtlar',
      status: 'Durum',
      priority: 'Öncelik',
      assignedTo: 'Atanan',
      dueDate: 'Bitiş Tarihi'
    },
    findings: {
      title: 'Bulgu Yönetimi',
      description: 'Denetim bulguları, kök neden analizi ve aksiyon planları',
      newFinding: 'Yeni Bulgu',
      severity: 'Önem Derecesi',
      status: 'Durum',
      rootCause: 'Kök Neden',
      actionPlan: 'Aksiyon Planı',
      evidence: 'Kanıt',
      critical: 'Kritik',
      high: 'Yüksek',
      medium: 'Orta',
      low: 'Düşük',
      draft: 'Taslak',
      underReview: 'İnceleme Altında',
      approved: 'Onaylandı',
      closed: 'Kapatıldı'
    },
    reports: {
      title: 'Rapor Merkezi',
      description: 'Denetim raporları, analizler ve yönetim sunumları',
      newReport: 'Yeni Rapor',
      draftReports: 'Taslak Raporlar',
      published: 'Yayınlandı',
      export: 'Dışa Aktar',
      preview: 'Önizleme',
      edit: 'Düzenle',
      publish: 'Yayınla'
    },
    actions: {
      title: 'Aksiyon Takip',
      description: 'Yönetim aksiyonları ve iyileştirme planları',
      newAction: 'Yeni Aksiyon',
      overdue: 'Gecikmiş',
      dueThisWeek: 'Bu Hafta',
      completed: 'Tamamlandı',
      assignee: 'Sorumlu',
      targetDate: 'Hedef Tarih',
      progress: 'İlerleme'
    },
    risk: {
      inherent: 'Doğal Risk',
      residual: 'Artık Risk',
      impact: 'Etki',
      volume: 'İşlem Hacmi',
      score: 'Risk Skoru',
      control: 'Kontrol',
      effectiveness: 'Etkinlik',
      high: 'Yüksek',
      medium: 'Orta',
      low: 'Düşük'
    },
    common: {
      save: 'Kaydet',
      cancel: 'İptal',
      delete: 'Sil',
      edit: 'Düzenle',
      add: 'Ekle',
      addNew: 'Yeni Ekle',
      search: 'Ara',
      filter: 'Filtrele',
      export: 'Dışa Aktar',
      import: 'İçe Aktar',
      loading: 'Yükleniyor...',
      noData: 'Veri bulunamadı',
      welcome: "Sentinel'e Hoş Geldiniz",
      status: 'Durum',
      period: 'Dönem',
      version: 'v',
      environment: 'Ortam'
    },
    status: {
      draft: 'Taslak',
      approved: 'Onaylandı',
      locked: 'Kilitli',
      planned: 'Planlandı',
      inProgress: 'Devam Ediyor',
      completed: 'Tamamlandı',
      cancelled: 'İptal Edildi'
    }
  }
};

const en = {
  translation: {
    sidebar: {
      groups: {
        cockpit: 'COCKPIT',
        strategy: 'STRATEGY & PLANNING',
        execution: 'AUDIT EXECUTION',
        monitoring: 'MONITORING & REPORTING',
        management: 'MANAGEMENT',
        config: 'CONFIGURATION'
      },
      items: {
        managementSummary: 'Management Summary',
        riskHeatmap: 'Risk Heatmap',
        strategicManagement: 'Strategic Management',
        rkmMasterLibrary: 'RKM Master Library',
        rkmLibrary: 'RKM Library',
        auditUniverse: 'Audit Universe',
        riskNetwork: 'Risk Network',
        annualPlanGantt: 'Annual Plan (Macro+Gantt)',
        annualPlanLegacy: 'Annual Plan (Legacy)',
        resourceManagement: 'Resource Management',
        auditTasks: 'Audit Tasks',
        workpapers: 'Workpapers',
        findingManagement: 'Finding Management',
        findingHubLegacy: 'Finding Hub (Legacy)',
        auditeePortal: 'Auditee Portal',
        evidenceManagement: 'Evidence Management',
        planCompliance: 'Plan Compliance Analysis',
        actionTracking: 'Action Tracking',
        reportCenter: 'Report Center',
        qualityAssurance: 'Quality Assurance (QAIP)',
        settings: 'Settings',
        systemDefinitions: 'System Definitions',
        riskMethodology: 'Risk Methodology',
        riskLaboratory: 'Risk Laboratory',
        customFields: 'Custom Fields',
        templateManager: 'Template Manager'
      },
      user: {
        chiefAuditor: 'Chief Auditor',
        generalDirectorate: 'General Directorate'
      }
    },
    header: {
      notifications: 'Notifications',
      profile: 'Profile',
      logout: 'Logout'
    },
    planning: {
      title: 'Audit Planning',
      description: 'Strategic Planning and Scheduling',
      aiPlanningAssistant: 'AI Planning Assistant',
      totalAudits: 'Total Audits',
      completed: 'Completed',
      inProgress: 'In Progress',
      ganttTimeline: 'Gantt Timeline',
      newAudit: 'New Audit',
      ganttView: 'Gantt View',
      analyticsView: 'Analytics View',
      missionControl: 'Mission Control',
      timeline: 'Timeline',
      planComplianceAnalysis: 'Plan Compliance Analysis',
      realtimeMetrics: 'Real-time audit plan performance metrics and variance analysis',
      totalPlannedHours: 'Total Planned Hours',
      totalActualHours: 'Total Actual Hours',
      onTimeEngagements: 'On-Time Engagements',
      delayedEngagements: 'Delayed Engagements'
    },
    strategy: {
      title: 'Strategic Management',
      description: 'Corporate goals, audit strategy and risk weighting',
      corporateGoals: 'Corporate Goals',
      auditObjectives: 'Audit Objectives',
      riskWeighting: 'Risk Weighting',
      alignmentMap: 'Alignment Map',
      addGoal: 'Add Goal',
      addObjective: 'Add Objective',
      aiAdvisor: 'AI Advisor'
    },
    universe: {
      title: 'Audit Universe',
      description: 'Hierarchical risk map and auditable entities',
      treeView: 'Tree View',
      listView: 'List View',
      addEntity: 'Add Entity',
      totalEntities: 'Total Entities',
      highRisk: 'High Risk',
      dueForAudit: 'Due for Audit'
    },
    execution: {
      title: 'Audit Execution',
      description: 'Fieldwork, finding management and workpapers',
      fieldwork: 'Fieldwork',
      findings: 'Findings',
      workpapers: 'Workpapers',
      evidence: 'Evidence',
      status: 'Status',
      priority: 'Priority',
      assignedTo: 'Assigned To',
      dueDate: 'Due Date'
    },
    findings: {
      title: 'Finding Management',
      description: 'Audit findings, root cause analysis and action plans',
      newFinding: 'New Finding',
      severity: 'Severity',
      status: 'Status',
      rootCause: 'Root Cause',
      actionPlan: 'Action Plan',
      evidence: 'Evidence',
      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      draft: 'Draft',
      underReview: 'Under Review',
      approved: 'Approved',
      closed: 'Closed'
    },
    reports: {
      title: 'Report Center',
      description: 'Audit reports, analytics and management presentations',
      newReport: 'New Report',
      draftReports: 'Draft Reports',
      published: 'Published',
      export: 'Export',
      preview: 'Preview',
      edit: 'Edit',
      publish: 'Publish'
    },
    actions: {
      title: 'Action Tracking',
      description: 'Management actions and improvement plans',
      newAction: 'New Action',
      overdue: 'Overdue',
      dueThisWeek: 'Due This Week',
      completed: 'Completed',
      assignee: 'Assignee',
      targetDate: 'Target Date',
      progress: 'Progress'
    },
    risk: {
      inherent: 'Inherent Risk',
      residual: 'Residual Risk',
      impact: 'Impact',
      volume: 'Volume',
      score: 'Risk Score',
      control: 'Control',
      effectiveness: 'Effectiveness',
      high: 'High',
      medium: 'Medium',
      low: 'Low'
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      addNew: 'Add New',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
      loading: 'Loading...',
      noData: 'No data found',
      welcome: 'Welcome to Sentinel',
      status: 'Status',
      period: 'Period',
      version: 'v',
      environment: 'Environment'
    },
    status: {
      draft: 'Draft',
      approved: 'Approved',
      locked: 'Locked',
      planned: 'Planned',
      inProgress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { tr, en },
    lng: 'tr',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
