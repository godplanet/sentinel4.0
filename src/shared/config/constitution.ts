/**
 * SENTINEL v3.0 - PROJECT CONSTITUTION
 *
 * This file contains immutable business rules, domain constants, and system behavior
 * derived from the official blueprint documents:
 * - Ek-1: Design System Blueprint
 * - Ek-2: Cognitive Architecture & AI Persona
 * - Ek-3: Domain Blueprint (Professional Memory & Risk Logic)
 * - Ek-4: Technical Architecture & Navigation Report
 *
 * CRITICAL: These constants define the "DNA" of Sentinel.
 * Changes require Chief Architect approval.
 */

export const SENTINEL_CONSTITUTION = {
  /**
   * EK-1: DESIGN SYSTEM CONSTANTS
   * Functional Glass UI with dual-physics rendering
   */
  UI: {
    THEME_MODE: 'dual-physics' as const, // 'high-fidelity' (Glass) or 'solid-state' (VDI)
    PRIMARY_COLOR: '#0057B7', // Sentinel Blue
    GLASS_BLUR: '20px',
    GLASS_OPACITY: 0.85,
    INPUT_MODE: 'solid', // Inputs are always solid (not glass)
    ANIMATION_DURATION: 200, // milliseconds
    SIDEBAR_WIDTH: 280, // pixels
    ENVIRONMENT_COLORS: {
      PRODUCTION: '#1e3a8a', // Navy Blue
      TEST: '#059669', // Emerald Green
      DEVELOPMENT: '#dc2626', // Red
      UAT: '#f59e0b', // Amber
    },
  },

  /**
   * EK-2: AI COGNITIVE ARCHITECTURE
   * Sentinel Prime - The Skeptical Senior Auditor
   */
  AI: {
    PERSONA: 'Sentinel Prime',
    PERSONALITY: 'skeptical-senior-auditor',
    DUAL_BRAIN: {
      GEN_AI: {
        COLOR: 'blue',
        PURPOSE: 'text-generation-summary',
        GLOW: '#3b82f6',
      },
      COMPUTE_AI: {
        COLOR: 'orange',
        PURPOSE: 'mathematical-computation',
        GLOW: '#f97316',
      },
    },
    RULES: {
      NEVER_CALCULATE_MENTALLY: true, // AI must write SQL/Python for calculations
      ALWAYS_SHOW_REASONING: true, // Show thought chains
      CHALLENGE_MODE: 'enabled', // Question assumptions
    },
  },

  /**
   * EK-3: RISK MATHEMATICS (KERD 2026 Constitution)
   * Hybrid Risk Scoring with Velocity Multiplier
   */
  RISK: {
    SCORING_METHOD: 'hybrid' as const, // Inherent * (1 - Control_Effectiveness)
    FORMULA: 'Impact * ln(1 + Volume) * (1 - Control_Effectiveness)',
    MAX_SCORE: 25,
    MIN_SCORE: 1,
    ZONES: {
      GREEN: { min: 1, max: 4, label: 'Düşük', color: '#10b981' },
      YELLOW: { min: 5, max: 9, label: 'Orta', color: '#fbbf24' },
      ORANGE: { min: 10, max: 15, label: 'Yüksek', color: '#f97316' },
      RED: { min: 16, max: 25, label: 'Kritik', color: '#ef4444' },
    },
    VELOCITY: {
      ENABLED: true,
      FORMULA: 'Current_Score * (1 + Delta_Percentage)',
      MAX_MULTIPLIER: 2.0,
    },
    INHERENT_WEIGHTS: {
      IMPACT: 0.4,
      LIKELIHOOD: 0.3,
      VELOCITY: 0.3,
    },
    RESIDUAL_CALCULATION: 'Inherent * (1 - Control_Effectiveness)',
  },

  /**
   * EK-3: GRADING ENGINE (KERD 2026)
   * Hybrid Base-100 Deduction Model with Limiting Rules
   */
  GRADING: {
    METHOD: 'hybrid-deduction' as const,
    BASE_SCORE: 100,
    GRADE_SCALE: {
      A: { min: 90, max: 100, label: 'Mükemmel' },
      B: { min: 80, max: 89, label: 'İyi' },
      C: { min: 70, max: 79, label: 'Yeterli' },
      D: { min: 60, max: 69, label: 'Geliştirilmeli' },
      F: { min: 0, max: 59, label: 'Yetersiz' },
    },
    DEDUCTION_RULES: {
      CRITICAL: 15, // per critical finding
      HIGH: 10,
      MEDIUM: 5,
      LOW: 2,
    },
    LIMITING_RULES: {
      ONE_CRITICAL_MAX_GRADE: 'D', // If 1+ Critical exists, max grade is D (60)
      TWO_HIGH_MAX_GRADE: 'C', // If 2+ High exist, max grade is C (70)
      CASCADING_EFFECT: true, // Lower grades cascade upward
    },
    WATERFALL_LOGIC: true, // Show grade progression visually
  },

  /**
   * MODULE 4: EXECUTION RULES
   * Fieldwork and Evidence Management
   */
  EXECUTION: {
    EVIDENCE_REQUIRED: true, // Cannot close finding without evidence
    MIN_EVIDENCE_FILES: 1,
    FOUR_EYES_PRINCIPLE: true, // Required for Vault access and sign-off
    MIN_ROOT_CAUSE_LENGTH: 50, // Characters for 5-Whys
    FIVE_WHYS_REQUIRED: true, // Root cause analysis mandatory for findings
    WORKPAPER_STATES: ['draft', 'in-review', 'approved', 'archived'] as const,
    FINDING_LIFECYCLE: [
      'draft',
      'under-review',
      'management-response',
      'negotiation',
      'agreed',
      'action-plan',
      'implementation',
      'verification',
      'closed',
    ] as const,
    SAMPLING: {
      MIN_POPULATION: 30,
      CONFIDENCE_LEVEL: 0.95, // 95%
      ACCEPTABLE_ERROR: 0.05, // 5%
    },
  },

  /**
   * MODULE 5: FINDING MANAGEMENT (GIAS 2024 Schema)
   * Structured finding attributes
   */
  FINDINGS: {
    REQUIRED_FIELDS: [
      'title',
      'severity',
      'entity_id',
      'root_cause',
      'recommendation',
    ] as const,
    SEVERITY_LEVELS: ['critical', 'high', 'medium', 'low'] as const,
    STATUS_WORKFLOW: [
      'draft',
      'under_review',
      'awaiting_management_response',
      'negotiation',
      'agreed',
      'closed',
    ] as const,
    GIAS_2024_COMPLIANCE: true, // Use GIAS 2024 taxonomy
    NEGOTIATION: {
      ENABLED: true,
      MAX_ROUNDS: 5,
      SENTIMENT_ANALYSIS: true, // Track negotiation sentiment
    },
  },

  /**
   * MODULE 8: SENTINEL PROBES (Watchtower)
   * Continuous Monitoring Rules
   */
  WATCHTOWER: {
    PROBE_TYPES: ['sql', 'api', 'file', 'integration'] as const,
    EXECUTION_MODES: ['real-time', 'scheduled', 'on-demand'] as const,
    ALERT_THRESHOLDS: {
      CRITICAL: 'immediate',
      HIGH: '5-minutes',
      MEDIUM: '1-hour',
      LOW: 'daily-digest',
    },
    AUTO_TRIAGE: true, // Automatic severity classification
    MAX_RETRIES: 3,
  },

  /**
   * MODULE 9: COMPLIANCE MAPPER
   * Regulatory framework mapping
   */
  COMPLIANCE: {
    FRAMEWORKS: [
      'BDDK',
      'GIAS_2024',
      'ISO_27001',
      'SOX_404',
      'BASEL_III',
      'GDPR',
      'PCI_DSS',
    ] as const,
    GAP_ANALYSIS: {
      ENABLED: true,
      TRAFFIC_LIGHT: true, // Red/Yellow/Green status
    },
    BDDK_EXPORT: {
      ENABLED: true,
      FORMAT: 'zip-package',
    },
  },

  /**
   * MODULE 11: INVESTIGATION (Whistleblower)
   * Forensic investigation rules
   */
  INVESTIGATION: {
    ANONYMITY_REQUIRED: true,
    VAULT_ENCRYPTION: 'AES-256',
    FREEZE_PROTOCOL: true, // Immutable evidence chain
    CONTRADICTION_ENGINE: true, // Cross-reference statements
    TRIAGE_LEVELS: ['low', 'medium', 'high', 'urgent'] as const,
    CASE_STATES: [
      'intake',
      'triage',
      'investigation',
      'resolution',
      'closed',
    ] as const,
  },

  /**
   * MODULE 12: TALENT OS
   * Resource and capacity management
   */
  TALENT: {
    SKILL_MATRIX: {
      LEVELS: ['novice', 'intermediate', 'advanced', 'expert'] as const,
      CERTIFICATION_TRACKING: true,
    },
    FATIGUE_MONITORING: {
      ENABLED: true,
      MAX_HOURS_PER_WEEK: 45,
      ALERT_THRESHOLD: 40, // hours
    },
    BEST_FIT_ALGORITHM: 'skill-match-plus-availability',
    CAPACITY_PLANNING: {
      UTILIZATION_TARGET: 0.85, // 85%
      BUFFER_PERCENTAGE: 0.15, // 15% for unplanned work
    },
  },

  /**
   * EK-4: MODULE ARCHITECTURE
   * 12-Module Navigation Structure
   */
  MODULES: {
    COCKPIT: 'KOKPİT',
    STRATEGY_RISK: 'STRATEJİ & RİSK',
    GOVERNANCE: 'YÖNETİŞİM & ETİK',
    EXECUTION: 'YÜRÜTME (İCRA)',
    RESOURCES: 'KAYNAK YÖNETİMİ',
    ADVISORY: 'DANIŞMANLIK',
    MONITORING: 'SÜREKLI İZLEME',
    COMPLIANCE: 'UYUM',
    ECOSYSTEM: 'EKOSİSTEM',
    LIBRARY: 'BİLGİ BANKASI',
    REPORTING: 'RAPORLAMA',
    SETTINGS: 'AYARLAR',
  } as const,

  /**
   * SYSTEM BEHAVIOR
   * Global operational rules
   */
  SYSTEM: {
    MULTI_TENANCY: true,
    RLS_REQUIRED: true, // Row-Level Security mandatory
    AUDIT_TRAIL: true, // All changes logged
    LTREE_HIERARCHY: true, // Use PostgreSQL ltree for universe
    IMMUTABLE_LOGS: true, // Use pgcrypto for tamper-proof logs
    TEMPORAL_TABLES: true, // Track history with tstzrange
    SOFT_DELETE: true, // Never hard delete records
    SNAPSHOT_VERSIONING: true, // RKM snapshots per engagement
  },

  /**
   * DATA GOVERNANCE
   * Security and privacy rules
   */
  DATA: {
    ENCRYPTION_AT_REST: true,
    ENCRYPTION_IN_TRANSIT: true,
    PII_MASKING: true, // Mask sensitive data in logs
    RETENTION_POLICY: {
      ACTIVE_ENGAGEMENTS: 'indefinite',
      CLOSED_ENGAGEMENTS: '7-years', // Regulatory requirement
      AUDIT_LOGS: '10-years',
      FINDINGS: 'indefinite',
    },
    GDPR_COMPLIANCE: true,
    RIGHT_TO_BE_FORGOTTEN: false, // Not applicable for audit records
  },

  /**
   * PERFORMANCE THRESHOLDS
   * System performance SLAs
   */
  PERFORMANCE: {
    PAGE_LOAD_TARGET: 2000, // milliseconds
    API_RESPONSE_TARGET: 500, // milliseconds
    SEARCH_RESPONSE_TARGET: 1000, // milliseconds
    MAX_CONCURRENT_USERS: 500,
    CACHE_TTL: 300, // seconds (5 minutes)
  },

  /**
   * VERSIONING & METADATA
   */
  META: {
    VERSION: '3.0.0',
    CODENAME: 'Sentinel Prime',
    BUILD_DATE: '2026-02-08',
    CONSTITUTIONAL_LOCK: true, // Prevents unauthorized changes
    LAST_UPDATED_BY: 'Chief Architect',
  },
} as const;

/**
 * TYPE EXPORTS
 * Make constitution types available throughout the app
 */
export type RiskZone = keyof typeof SENTINEL_CONSTITUTION.RISK.ZONES;
export type GradeScale = keyof typeof SENTINEL_CONSTITUTION.GRADING.GRADE_SCALE;
export type FindingSeverity = typeof SENTINEL_CONSTITUTION.FINDINGS.SEVERITY_LEVELS[number];
export type FindingStatus = typeof SENTINEL_CONSTITUTION.FINDINGS.STATUS_WORKFLOW[number];
export type WorkpaperState = typeof SENTINEL_CONSTITUTION.EXECUTION.WORKPAPER_STATES[number];
export type ProbeType = typeof SENTINEL_CONSTITUTION.WATCHTOWER.PROBE_TYPES[number];
export type ModuleName = keyof typeof SENTINEL_CONSTITUTION.MODULES;

/**
 * UTILITY FUNCTIONS
 * Helper functions for working with constitution values
 */
export const ConstitutionUtils = {
  /**
   * Get risk zone color based on score
   */
  getRiskZoneColor: (score: number): string => {
    if (score <= 4) return SENTINEL_CONSTITUTION.RISK.ZONES.GREEN.color;
    if (score <= 9) return SENTINEL_CONSTITUTION.RISK.ZONES.YELLOW.color;
    if (score <= 15) return SENTINEL_CONSTITUTION.RISK.ZONES.ORANGE.color;
    return SENTINEL_CONSTITUTION.RISK.ZONES.RED.color;
  },

  /**
   * Get grade letter from numeric score
   */
  getGradeLetter: (score: number): string => {
    const scale = SENTINEL_CONSTITUTION.GRADING.GRADE_SCALE;
    if (score >= scale.A.min) return 'A';
    if (score >= scale.B.min) return 'B';
    if (score >= scale.C.min) return 'C';
    if (score >= scale.D.min) return 'D';
    return 'F';
  },

  /**
   * Apply limiting rules to grade
   */
  applyLimitingRules: (
    calculatedScore: number,
    criticalCount: number,
    highCount: number
  ): number => {
    const rules = SENTINEL_CONSTITUTION.GRADING.LIMITING_RULES;
    let maxScore = calculatedScore;

    if (criticalCount >= 1) {
      maxScore = Math.min(maxScore, 60); // Max D
    } else if (highCount >= 2) {
      maxScore = Math.min(maxScore, 70); // Max C
    }

    return maxScore;
  },

  /**
   * Calculate risk score using hybrid formula
   */
  calculateRiskScore: (
    impact: number,
    volume: number,
    controlEffectiveness: number
  ): number => {
    const inherent = impact * Math.log(1 + volume);
    const residual = inherent * (1 - controlEffectiveness);
    return Math.min(Math.max(Math.round(residual), 1), 25);
  },

  /**
   * Check if evidence requirement is met
   */
  isEvidenceRequirementMet: (evidenceCount: number): boolean => {
    return evidenceCount >= SENTINEL_CONSTITUTION.EXECUTION.MIN_EVIDENCE_FILES;
  },

  /**
   * Validate root cause length
   */
  isRootCauseValid: (rootCause: string): boolean => {
    return rootCause.length >= SENTINEL_CONSTITUTION.EXECUTION.MIN_ROOT_CAUSE_LENGTH;
  },

  /**
   * Get environment color
   */
  getEnvironmentColor: (env: string): string => {
    const colors = SENTINEL_CONSTITUTION.UI.ENVIRONMENT_COLORS;
    return colors[env.toUpperCase() as keyof typeof colors] || colors.DEVELOPMENT;
  },
};

/**
 * VALIDATION SCHEMAS
 * Business rule validation
 */
export const ValidationRules = {
  finding: {
    title: { minLength: 10, maxLength: 200 },
    root_cause: { minLength: SENTINEL_CONSTITUTION.EXECUTION.MIN_ROOT_CAUSE_LENGTH },
    recommendation: { minLength: 20 },
    severity: { enum: SENTINEL_CONSTITUTION.FINDINGS.SEVERITY_LEVELS },
  },

  workpaper: {
    title: { minLength: 5, maxLength: 150 },
    objective: { minLength: 20 },
    scope: { minLength: 10 },
    status: { enum: SENTINEL_CONSTITUTION.EXECUTION.WORKPAPER_STATES },
  },

  risk: {
    score: { min: 1, max: 25 },
    impact: { min: 1, max: 5 },
    likelihood: { min: 1, max: 5 },
    control_effectiveness: { min: 0, max: 1 },
  },
};

export default SENTINEL_CONSTITUTION;

// KERD-2026: Bütünleşik Denetim Derecelendirme ve Varlık Güvence Esasları
export type Grade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
export type VelocityType = 'Düşük Hız (Aylar)' | 'Normal Hız (Haftalar)' | 'Yüksek Hız (Günler)' | 'Kritik Hız (Saatler)';

export const KERD_CONSTITUTION = {
  SCORING: {
    BASE_SCORE: 100.0,
    DEDUCTIONS: {
      BORDO: 25.0,
      KIZIL: 10.0,
      TURUNCU: 3.0,
      SARI: 0.5,
    },
    BONUS: {
      GOZLEM_MAX: 5.0,
      GOZLEM_MULTIPLIER: 1.0,
    },
  },
  CAPPING: {
    CRITICAL_THRESHOLD: 1,
    CRITICAL_CAP_SCORE: 59.99, // Max D
    HIGH_VOLUME_THRESHOLD: 3,
    HIGH_VOLUME_CAP_SCORE: 69.99, // Max C
    SHARIAH_VETO_SCORE: 0.0, // F - Batıl
  },
  VELOCITY_MULTIPLIERS: {
    'Düşük Hız (Aylar)': 0.0,
    'Normal Hız (Haftalar)': 0.15,
    'Yüksek Hız (Günler)': 0.35,
    'Kritik Hız (Saatler)': 0.60,
  }
} as const;

export const TAXONOMY_COLORS = {
  BORDO: 'bg-fuchsia-950 text-white border-fuchsia-900', // Şer'i ve Kritik Veto
  KIZIL: 'bg-red-600 text-white border-red-700',
  TURUNCU: 'bg-orange-500 text-white border-orange-600',
  SARI: 'bg-yellow-400 text-slate-900 border-yellow-500',
  GUVENCE_YOK: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200',
  TAM_GUVENCE: 'bg-blue-100 text-blue-800 border-blue-200',
  YUKSEK_GUVENCE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  MAKUL_GUVENCE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  SINIRLI_GUVENCE: 'bg-orange-100 text-orange-800 border-orange-200',
  GELISIM_GEREKIR: 'bg-red-100 text-red-800 border-red-200',
};

export const GRADING_THRESHOLDS = [
  { min: 95, grade: 'A+', opinion: 'Tam Güvence', frequency: '48 Ay', color: TAXONOMY_COLORS.TAM_GUVENCE },
  { min: 85, grade: 'A', opinion: 'Yüksek Güvence', frequency: '36 Ay', color: TAXONOMY_COLORS.YUKSEK_GUVENCE },
  { min: 70, grade: 'B', opinion: 'Makul Güvence', frequency: '24 Ay', color: TAXONOMY_COLORS.MAKUL_GUVENCE },
  { min: 60, grade: 'C', opinion: 'Sınırlı Güvence', frequency: '18 Ay', color: TAXONOMY_COLORS.SINIRLI_GUVENCE },
  { min: 50, grade: 'D', opinion: 'Zayıf / Gelişim Gerekir', frequency: '12 Ay', color: TAXONOMY_COLORS.GELISIM_GEREKIR },
  { min: 0, grade: 'F', opinion: 'Güvence Yok', frequency: 'Sürekli İzleme', color: TAXONOMY_COLORS.GUVENCE_YOK }
];