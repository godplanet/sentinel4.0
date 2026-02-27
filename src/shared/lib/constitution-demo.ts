/**
 * CONSTITUTION USAGE DEMONSTRATION
 *
 * This file demonstrates best practices for using the Sentinel Constitution
 * in real-world scenarios. Use these patterns throughout the codebase.
 */

import SENTINEL_CONSTITUTION, { ConstitutionUtils, ValidationRules } from '@/shared/config';
import type { FindingSeverity, RiskZone, WorkpaperState } from '@/shared/config';

// ============================================================================
// EXAMPLE 1: Risk Calculation (Entities/Risk Module)
// ============================================================================

interface RiskEntity {
  id: string;
  name: string;
  impact: number;
  transaction_volume: number;
  control_effectiveness: number;
  delta_percentage?: number;
}

/**
 * Calculate risk score using constitutional formula
 * This enforces the hybrid risk methodology from Ek-3
 */
export function calculateEntityRiskScore(entity: RiskEntity): {
  score: number;
  zone: RiskZone;
  color: string;
  label: string;
} {
  // Use constitutional calculation
  let score = ConstitutionUtils.calculateRiskScore(
    entity.impact,
    entity.transaction_volume,
    entity.control_effectiveness
  );

  // Apply velocity multiplier if enabled
  if (SENTINEL_CONSTITUTION.RISK.VELOCITY.ENABLED && entity.delta_percentage) {
    const velocityMultiplier = 1 + entity.delta_percentage;
    const cappedMultiplier = Math.min(
      velocityMultiplier,
      SENTINEL_CONSTITUTION.RISK.VELOCITY.MAX_MULTIPLIER
    );
    score = Math.round(score * cappedMultiplier);
    score = Math.min(score, SENTINEL_CONSTITUTION.RISK.MAX_SCORE);
  }

  // Determine zone
  const zones = SENTINEL_CONSTITUTION.RISK.ZONES;
  let zone: RiskZone = 'GREEN';
  let zoneData = zones.GREEN;

  if (score >= zones.RED.min) {
    zone = 'RED';
    zoneData = zones.RED;
  } else if (score >= zones.ORANGE.min) {
    zone = 'ORANGE';
    zoneData = zones.ORANGE;
  } else if (score >= zones.YELLOW.min) {
    zone = 'YELLOW';
    zoneData = zones.YELLOW;
  }

  return {
    score,
    zone,
    color: zoneData.color,
    label: zoneData.label,
  };
}

// ============================================================================
// EXAMPLE 2: Audit Grading (Grading Engine Module)
// ============================================================================

interface Finding {
  id: string;
  severity: FindingSeverity;
  status: string;
}

interface AuditGrade {
  rawScore: number;
  finalScore: number;
  grade: string;
  label: string;
  isLimited: boolean;
  limitReason?: string;
  deductions: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

/**
 * Calculate audit grade using constitutional grading rules
 * Implements KERD 2026 hybrid deduction model with limiting rules
 */
export function calculateAuditGrade(findings: Finding[]): AuditGrade {
  const config = SENTINEL_CONSTITUTION.GRADING;

  // Count findings by severity
  const counts = {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
  };

  // Calculate deductions
  const deductions = {
    critical: counts.critical * config.DEDUCTION_RULES.CRITICAL,
    high: counts.high * config.DEDUCTION_RULES.HIGH,
    medium: counts.medium * config.DEDUCTION_RULES.MEDIUM,
    low: counts.low * config.DEDUCTION_RULES.LOW,
  };

  // Calculate raw score
  const rawScore = Math.max(
    0,
    config.BASE_SCORE -
      deductions.critical -
      deductions.high -
      deductions.medium -
      deductions.low
  );

  // Apply limiting rules
  const finalScore = ConstitutionUtils.applyLimitingRules(
    rawScore,
    counts.critical,
    counts.high
  );

  // Get grade letter and label
  const gradeLetter = ConstitutionUtils.getGradeLetter(finalScore);
  const gradeInfo = config.GRADE_SCALE[gradeLetter as keyof typeof config.GRADE_SCALE];

  // Determine if grade was limited
  const isLimited = finalScore < rawScore;
  let limitReason: string | undefined;
  if (isLimited) {
    if (counts.critical >= 1) {
      limitReason = `Grade limited to D (max 60) due to ${counts.critical} critical finding(s)`;
    } else if (counts.high >= 2) {
      limitReason = `Grade limited to C (max 70) due to ${counts.high} high findings`;
    }
  }

  return {
    rawScore,
    finalScore,
    grade: gradeLetter,
    label: gradeInfo.label,
    isLimited,
    limitReason,
    deductions,
  };
}

// ============================================================================
// EXAMPLE 3: Finding Validation (Finding Management Module)
// ============================================================================

interface FindingInput {
  title: string;
  severity: FindingSeverity;
  root_cause: string;
  recommendation: string;
  evidence_files: string[];
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate finding input using constitutional rules
 * Enforces GIAS 2024 compliance and execution requirements
 */
export function validateFinding(finding: FindingInput): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Title validation
  const titleRules = ValidationRules.finding.title;
  if (finding.title.length < titleRules.minLength) {
    errors.push(`Title must be at least ${titleRules.minLength} characters`);
  }
  if (finding.title.length > titleRules.maxLength) {
    errors.push(`Title must not exceed ${titleRules.maxLength} characters`);
  }

  // Root cause validation
  if (!ConstitutionUtils.isRootCauseValid(finding.root_cause)) {
    errors.push(
      `Root cause must be at least ${SENTINEL_CONSTITUTION.EXECUTION.MIN_ROOT_CAUSE_LENGTH} characters`
    );
  }

  // 5-Whys requirement
  if (SENTINEL_CONSTITUTION.EXECUTION.FIVE_WHYS_REQUIRED) {
    if (!finding.root_cause.includes('Why 1:') || !finding.root_cause.includes('Why 5:')) {
      warnings.push('Root cause should follow 5-Whys methodology');
    }
  }

  // Recommendation validation
  const recRules = ValidationRules.finding.recommendation;
  if (finding.recommendation.length < recRules.minLength) {
    errors.push(`Recommendation must be at least ${recRules.minLength} characters`);
  }

  // Evidence requirement
  if (!ConstitutionUtils.isEvidenceRequirementMet(finding.evidence_files.length)) {
    if (SENTINEL_CONSTITUTION.EXECUTION.EVIDENCE_REQUIRED) {
      errors.push(
        `At least ${SENTINEL_CONSTITUTION.EXECUTION.MIN_EVIDENCE_FILES} evidence file is required`
      );
    } else {
      warnings.push('Consider attaching supporting evidence');
    }
  }

  // Severity validation
  const validSeverities = SENTINEL_CONSTITUTION.FINDINGS.SEVERITY_LEVELS;
  if (!validSeverities.includes(finding.severity)) {
    errors.push(`Severity must be one of: ${validSeverities.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// EXAMPLE 4: Workpaper Lifecycle (Execution Module)
// ============================================================================

interface Workpaper {
  id: string;
  title: string;
  status: WorkpaperState;
  evidence_count: number;
  preparer_id: string;
  reviewer_id?: string;
}

interface WorkpaperTransition {
  canTransition: boolean;
  reason?: string;
  nextStates: WorkpaperState[];
}

/**
 * Check if workpaper can transition to next state
 * Enforces four-eyes principle and evidence requirements
 */
export function checkWorkpaperTransition(
  workpaper: Workpaper,
  targetState: WorkpaperState,
  currentUserId: string
): WorkpaperTransition {
  const states = SENTINEL_CONSTITUTION.EXECUTION.WORKPAPER_STATES;

  // Check if target state is valid
  if (!states.includes(targetState)) {
    return {
      canTransition: false,
      reason: `Invalid target state: ${targetState}`,
      nextStates: [],
    };
  }

  // Four-eyes principle for approval
  if (targetState === 'approved' && SENTINEL_CONSTITUTION.EXECUTION.FOUR_EYES_PRINCIPLE) {
    if (workpaper.preparer_id === currentUserId) {
      return {
        canTransition: false,
        reason: 'Four-eyes principle: Preparer cannot approve their own workpaper',
        nextStates: [],
      };
    }
  }

  // Evidence requirement check
  if (targetState === 'approved' || targetState === 'archived') {
    if (!ConstitutionUtils.isEvidenceRequirementMet(workpaper.evidence_count)) {
      return {
        canTransition: false,
        reason: 'At least one evidence file is required before approval',
        nextStates: [],
      };
    }
  }

  // Determine valid next states based on current state
  let nextStates: WorkpaperState[] = [];
  switch (workpaper.status) {
    case 'draft':
      nextStates = ['in-review'];
      break;
    case 'in-review':
      nextStates = ['draft', 'approved'];
      break;
    case 'approved':
      nextStates = ['archived'];
      break;
    case 'archived':
      nextStates = []; // Terminal state
      break;
  }

  return {
    canTransition: nextStates.includes(targetState),
    nextStates,
  };
}

// ============================================================================
// EXAMPLE 5: UI Styling (Design System)
// ============================================================================

interface ThemeConfig {
  primaryColor: string;
  glassBlur: string;
  environmentColor: string;
  aiGlowColor: string;
  animationDuration: number;
}

/**
 * Get theme configuration from constitution
 * Ensures consistent styling across the application
 */
export function getThemeConfig(environment: string = 'PRODUCTION'): ThemeConfig {
  const ui = SENTINEL_CONSTITUTION.UI;
  const ai = SENTINEL_CONSTITUTION.AI;

  return {
    primaryColor: ui.PRIMARY_COLOR,
    glassBlur: ui.GLASS_BLUR,
    environmentColor: ConstitutionUtils.getEnvironmentColor(environment),
    aiGlowColor: ai.DUAL_BRAIN.COMPUTE_AI.GLOW,
    animationDuration: ui.ANIMATION_DURATION,
  };
}

/**
 * Get glass morphism styles if enabled
 */
export function getGlassMorphismStyles(opacity: number = 0.85): React.CSSProperties | null {
  if (SENTINEL_CONSTITUTION.UI.THEME_MODE !== 'dual-physics') {
    return null;
  }

  return {
    backdropFilter: `blur(${SENTINEL_CONSTITUTION.UI.GLASS_BLUR})`,
    backgroundColor: `rgba(255, 255, 255, ${opacity})`,
    border: '1px solid rgba(255, 255, 255, 0.2)',
  };
}

// ============================================================================
// EXAMPLE 6: Performance Monitoring (System Performance)
// ============================================================================

interface PerformanceMetrics {
  loadTime: number;
  withinTarget: boolean;
  target: number;
  percentOfTarget: number;
}

/**
 * Monitor performance against constitutional SLAs
 */
export function checkPerformanceTarget(
  metricType: 'page' | 'api' | 'search',
  actualTime: number
): PerformanceMetrics {
  const perf = SENTINEL_CONSTITUTION.PERFORMANCE;

  let target: number;
  switch (metricType) {
    case 'page':
      target = perf.PAGE_LOAD_TARGET;
      break;
    case 'api':
      target = perf.API_RESPONSE_TARGET;
      break;
    case 'search':
      target = perf.SEARCH_RESPONSE_TARGET;
      break;
  }

  return {
    loadTime: actualTime,
    withinTarget: actualTime <= target,
    target,
    percentOfTarget: (actualTime / target) * 100,
  };
}

// ============================================================================
// EXAMPLE 7: Talent Management (Module 12)
// ============================================================================

interface Auditor {
  id: string;
  name: string;
  hours_this_week: number;
  skills: Array<{ name: string; level: string }>;
}

interface FatigueCheck {
  isFatigued: boolean;
  hoursWorked: number;
  maxHours: number;
  alertThreshold: number;
  recommendation: string;
}

/**
 * Check auditor fatigue using constitutional limits
 */
export function checkAuditorFatigue(auditor: Auditor): FatigueCheck {
  const fatigue = SENTINEL_CONSTITUTION.TALENT.FATIGUE_MONITORING;

  if (!fatigue.ENABLED) {
    return {
      isFatigued: false,
      hoursWorked: auditor.hours_this_week,
      maxHours: fatigue.MAX_HOURS_PER_WEEK,
      alertThreshold: fatigue.ALERT_THRESHOLD,
      recommendation: 'Fatigue monitoring is disabled',
    };
  }

  const isFatigued = auditor.hours_this_week >= fatigue.ALERT_THRESHOLD;
  const isOverLimit = auditor.hours_this_week >= fatigue.MAX_HOURS_PER_WEEK;

  let recommendation = 'Within normal working hours';
  if (isOverLimit) {
    recommendation = 'CRITICAL: Maximum weekly hours exceeded. Immediate rest required.';
  } else if (isFatigued) {
    recommendation = 'WARNING: Approaching maximum weekly hours. Consider reassignment.';
  }

  return {
    isFatigued: isFatigued || isOverLimit,
    hoursWorked: auditor.hours_this_week,
    maxHours: fatigue.MAX_HOURS_PER_WEEK,
    alertThreshold: fatigue.ALERT_THRESHOLD,
    recommendation,
  };
}

// ============================================================================
// USAGE IN REACT COMPONENTS
// ============================================================================

/**
 * Example: Risk Badge Component
 */
export function getRiskBadgeProps(riskScore: number) {
  const color = ConstitutionUtils.getRiskZoneColor(riskScore);
  const zones = SENTINEL_CONSTITUTION.RISK.ZONES;

  let label = 'Unknown';
  if (riskScore <= 4) label = zones.GREEN.label;
  else if (riskScore <= 9) label = zones.YELLOW.label;
  else if (riskScore <= 15) label = zones.ORANGE.label;
  else label = zones.RED.label;

  return {
    backgroundColor: color,
    label,
    score: riskScore,
  };
}

/**
 * Example: Grade Display Component
 */
export function getGradeDisplayProps(numericGrade: number) {
  const letter = ConstitutionUtils.getGradeLetter(numericGrade);
  const scale = SENTINEL_CONSTITUTION.GRADING.GRADE_SCALE;
  const gradeInfo = scale[letter as keyof typeof scale];

  return {
    letter,
    label: gradeInfo.label,
    score: numericGrade,
    color: numericGrade >= 90 ? '#10b981' : numericGrade >= 70 ? '#fbbf24' : '#ef4444',
  };
}

// ============================================================================
// EXPORT ALL UTILITIES
// ============================================================================

export const ConstitutionDemo = {
  calculateEntityRiskScore,
  calculateAuditGrade,
  validateFinding,
  checkWorkpaperTransition,
  getThemeConfig,
  getGlassMorphismStyles,
  checkPerformanceTarget,
  checkAuditorFatigue,
  getRiskBadgeProps,
  getGradeDisplayProps,
};
