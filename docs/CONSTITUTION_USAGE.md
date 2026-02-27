# Sentinel Constitution - Usage Guide

## Overview

The `SENTINEL_CONSTITUTION` is the single source of truth for all business rules, domain constants, and system behavior in Sentinel v3.0. It consolidates rules from all blueprint documents into one immutable configuration.

## Location

```typescript
import SENTINEL_CONSTITUTION, {
  ConstitutionUtils,
  ValidationRules
} from '@/shared/config/constitution';
```

## Core Sections

### 1. UI Design System (Ek-1)

```typescript
// Get environment color for sidebar
const envColor = ConstitutionUtils.getEnvironmentColor(process.env.NODE_ENV);

// Check theme mode
if (SENTINEL_CONSTITUTION.UI.THEME_MODE === 'dual-physics') {
  // Apply glass morphism
  style = { backdropFilter: `blur(${SENTINEL_CONSTITUTION.UI.GLASS_BLUR})` };
}

// Animation duration
const duration = SENTINEL_CONSTITUTION.UI.ANIMATION_DURATION; // 200ms
```

### 2. Risk Mathematics (Ek-3)

```typescript
// Calculate hybrid risk score
const riskScore = ConstitutionUtils.calculateRiskScore(
  impact,      // 1-5
  volume,      // transaction count
  controlEffectiveness // 0-1
);

// Get risk zone color
const zoneColor = ConstitutionUtils.getRiskZoneColor(riskScore);

// Check risk zones
const isHighRisk = riskScore >= SENTINEL_CONSTITUTION.RISK.ZONES.RED.min;
```

### 3. Grading Engine (Ek-3)

```typescript
// Apply limiting rules
const finalGrade = ConstitutionUtils.applyLimitingRules(
  calculatedScore,
  criticalFindingCount,
  highFindingCount
);

// Get grade letter
const gradeLetter = ConstitutionUtils.getGradeLetter(finalGrade);

// Access grade scale
const gradeInfo = SENTINEL_CONSTITUTION.GRADING.GRADE_SCALE.A;
// { min: 90, max: 100, label: 'Mükemmel' }
```

### 4. Execution Rules (Module 4)

```typescript
// Validate evidence requirement
const canClose = ConstitutionUtils.isEvidenceRequirementMet(evidenceFiles.length);

// Validate root cause
const isValid = ConstitutionUtils.isRootCauseValid(rootCauseText);

// Check if 5-Whys required
if (SENTINEL_CONSTITUTION.EXECUTION.FIVE_WHYS_REQUIRED) {
  // Show 5-Whys form
}

// Workpaper lifecycle
const states = SENTINEL_CONSTITUTION.EXECUTION.WORKPAPER_STATES;
// ['draft', 'in-review', 'approved', 'archived']
```

### 5. Finding Management (Module 5)

```typescript
// Required fields validation
const requiredFields = SENTINEL_CONSTITUTION.FINDINGS.REQUIRED_FIELDS;

// Severity levels
const severities = SENTINEL_CONSTITUTION.FINDINGS.SEVERITY_LEVELS;
// ['critical', 'high', 'medium', 'low']

// Check negotiation settings
if (SENTINEL_CONSTITUTION.FINDINGS.NEGOTIATION.ENABLED) {
  const maxRounds = SENTINEL_CONSTITUTION.FINDINGS.NEGOTIATION.MAX_ROUNDS;
}
```

### 6. AI Behavior (Ek-2)

```typescript
// AI persona configuration
const persona = SENTINEL_CONSTITUTION.AI.PERSONA; // "Sentinel Prime"

// Dual-brain system
const genAI = SENTINEL_CONSTITUTION.AI.DUAL_BRAIN.GEN_AI;
const computeAI = SENTINEL_CONSTITUTION.AI.DUAL_BRAIN.COMPUTE_AI;

// Show compute AI with orange glow
<div style={{ boxShadow: `0 0 20px ${computeAI.GLOW}` }}>
  {/* Mathematical computation result */}
</div>
```

### 7. Watchtower Probes (Module 8)

```typescript
// Probe types
const probeTypes = SENTINEL_CONSTITUTION.WATCHTOWER.PROBE_TYPES;
// ['sql', 'api', 'file', 'integration']

// Alert thresholds
const criticalAlert = SENTINEL_CONSTITUTION.WATCHTOWER.ALERT_THRESHOLDS.CRITICAL;
// 'immediate'
```

### 8. Compliance Frameworks (Module 9)

```typescript
// Available frameworks
const frameworks = SENTINEL_CONSTITUTION.COMPLIANCE.FRAMEWORKS;
// ['BDDK', 'GIAS_2024', 'ISO_27001', 'SOX_404', ...]

// Check if BDDK export enabled
if (SENTINEL_CONSTITUTION.COMPLIANCE.BDDK_EXPORT.ENABLED) {
  // Show export button
}
```

### 9. Investigation Rules (Module 11)

```typescript
// Encryption standard
const encryption = SENTINEL_CONSTITUTION.INVESTIGATION.VAULT_ENCRYPTION;
// 'AES-256'

// Check if freeze protocol enabled
if (SENTINEL_CONSTITUTION.INVESTIGATION.FREEZE_PROTOCOL) {
  // Enable immutable evidence chain
}

// Triage levels
const triageLevels = SENTINEL_CONSTITUTION.INVESTIGATION.TRIAGE_LEVELS;
// ['low', 'medium', 'high', 'urgent']
```

### 10. Talent Management (Module 12)

```typescript
// Skill levels
const skillLevels = SENTINEL_CONSTITUTION.TALENT.SKILL_MATRIX.LEVELS;
// ['novice', 'intermediate', 'advanced', 'expert']

// Fatigue monitoring
const maxHours = SENTINEL_CONSTITUTION.TALENT.FATIGUE_MONITORING.MAX_HOURS_PER_WEEK;
const alertThreshold = SENTINEL_CONSTITUTION.TALENT.FATIGUE_MONITORING.ALERT_THRESHOLD;

// Capacity planning
const targetUtilization = SENTINEL_CONSTITUTION.TALENT.CAPACITY_PLANNING.UTILIZATION_TARGET;
// 0.85 (85%)
```

## Validation Rules

```typescript
import { ValidationRules } from '@/shared/config/constitution';

// Validate finding fields
const titleValid = findingTitle.length >= ValidationRules.finding.title.minLength;
const rootCauseValid = rootCause.length >= ValidationRules.finding.root_cause.minLength;

// Validate risk score
const riskValid =
  riskScore >= ValidationRules.risk.score.min &&
  riskScore <= ValidationRules.risk.score.max;
```

## Type Safety

```typescript
import type {
  RiskZone,
  GradeScale,
  FindingSeverity,
  FindingStatus,
  WorkpaperState
} from '@/shared/config/constitution';

// Use strict types
const severity: FindingSeverity = 'critical';
const status: FindingStatus = 'under_review';
const zone: RiskZone = 'RED';
```

## Best Practices

### ✅ DO:

1. **Always reference the constitution** for business rules:
   ```typescript
   const minLength = SENTINEL_CONSTITUTION.EXECUTION.MIN_ROOT_CAUSE_LENGTH;
   ```

2. **Use utility functions** instead of reimplementing logic:
   ```typescript
   const color = ConstitutionUtils.getRiskZoneColor(score);
   ```

3. **Import types** for type safety:
   ```typescript
   import type { FindingSeverity } from '@/shared/config/constitution';
   ```

4. **Validate against schemas**:
   ```typescript
   if (title.length < ValidationRules.finding.title.minLength) {
     // Show error
   }
   ```

### ❌ DON'T:

1. **Never hardcode values** that exist in the constitution:
   ```typescript
   // ❌ Bad
   const maxScore = 25;

   // ✅ Good
   const maxScore = SENTINEL_CONSTITUTION.RISK.MAX_SCORE;
   ```

2. **Don't create duplicate constants**:
   ```typescript
   // ❌ Bad
   const SEVERITY_LEVELS = ['critical', 'high', 'medium', 'low'];

   // ✅ Good
   import { SENTINEL_CONSTITUTION } from '@/shared/config/constitution';
   const levels = SENTINEL_CONSTITUTION.FINDINGS.SEVERITY_LEVELS;
   ```

3. **Don't modify the constitution object**:
   ```typescript
   // ❌ Bad - Constitution is immutable (as const)
   SENTINEL_CONSTITUTION.RISK.MAX_SCORE = 30; // TypeScript error!
   ```

## Module Integration Examples

### Risk Engine

```typescript
import SENTINEL_CONSTITUTION, { ConstitutionUtils } from '@/shared/config/constitution';

export function calculateEntityRisk(entity: Entity): RiskScore {
  const config = SENTINEL_CONSTITUTION.RISK;

  // Use constitution formula
  const score = ConstitutionUtils.calculateRiskScore(
    entity.impact,
    entity.transaction_volume,
    entity.control_effectiveness
  );

  // Apply velocity if enabled
  if (config.VELOCITY.ENABLED) {
    const velocityScore = score * (1 + entity.delta_percentage);
    return Math.min(velocityScore, config.MAX_SCORE);
  }

  return score;
}
```

### Finding Form Validation

```typescript
import { ValidationRules, ConstitutionUtils } from '@/shared/config/constitution';

export function validateFinding(finding: FindingInput): ValidationResult {
  const errors: string[] = [];

  // Title validation
  if (finding.title.length < ValidationRules.finding.title.minLength) {
    errors.push(`Title must be at least ${ValidationRules.finding.title.minLength} characters`);
  }

  // Root cause validation
  if (!ConstitutionUtils.isRootCauseValid(finding.root_cause)) {
    errors.push('Root cause description is too short');
  }

  // Evidence validation
  if (!ConstitutionUtils.isEvidenceRequirementMet(finding.evidence_count)) {
    errors.push('At least one evidence file is required');
  }

  return { valid: errors.length === 0, errors };
}
```

### Grading Dashboard

```typescript
import SENTINEL_CONSTITUTION, { ConstitutionUtils } from '@/shared/config/constitution';

export function calculateAuditGrade(findings: Finding[]): GradeResult {
  const config = SENTINEL_CONSTITUTION.GRADING;

  // Count findings by severity
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const highCount = findings.filter(f => f.severity === 'high').length;

  // Calculate base deductions
  let score = config.BASE_SCORE;
  score -= criticalCount * config.DEDUCTION_RULES.CRITICAL;
  score -= highCount * config.DEDUCTION_RULES.HIGH;

  // Apply limiting rules
  const finalScore = ConstitutionUtils.applyLimitingRules(score, criticalCount, highCount);
  const gradeLetter = ConstitutionUtils.getGradeLetter(finalScore);

  return { score: finalScore, grade: gradeLetter };
}
```

## System Metadata

```typescript
// Version information
console.log(`Sentinel ${SENTINEL_CONSTITUTION.META.VERSION}`);
console.log(`Codename: ${SENTINEL_CONSTITUTION.META.CODENAME}`);
console.log(`Build: ${SENTINEL_CONSTITUTION.META.BUILD_DATE}`);

// Check constitutional lock
if (SENTINEL_CONSTITUTION.META.CONSTITUTIONAL_LOCK) {
  console.log('Constitution is locked - requires Chief Architect approval for changes');
}
```

## Environment Configuration

```typescript
// Get sidebar color based on environment
const env = process.env.VITE_APP_ENV || 'DEVELOPMENT';
const sidebarColor = SENTINEL_CONSTITUTION.UI.ENVIRONMENT_COLORS[env];

// Render with environment-specific styling
<Sidebar style={{ backgroundColor: sidebarColor }} />
```

## Performance Thresholds

```typescript
// Monitor performance against SLAs
const loadTime = performance.now();
const target = SENTINEL_CONSTITUTION.PERFORMANCE.PAGE_LOAD_TARGET;

if (loadTime > target) {
  console.warn(`Page load exceeded target: ${loadTime}ms > ${target}ms`);
}
```

## Summary

The constitution provides:
- ✅ Single source of truth for business rules
- ✅ Type-safe constants and enums
- ✅ Utility functions for common calculations
- ✅ Validation schemas for data integrity
- ✅ Clear documentation of system behavior
- ✅ Immutability through TypeScript `as const`

**Remember:** The constitution is the "DNA" of Sentinel. All business logic should reference it, and changes require architectural approval.
