# Sentinel Constitution - Quick Reference Card

## Import Statement

```typescript
import { SENTINEL_CONSTITUTION, ConstitutionUtils } from '@/shared/config';
```

## Common Use Cases

### 1. Risk Scoring

```typescript
// Calculate risk score using constitutional formula
const score = ConstitutionUtils.calculateRiskScore(
  impact,              // 1-5
  transactionVolume,   // numeric
  controlEffectiveness // 0-1
);

// Get risk zone color
const color = ConstitutionUtils.getRiskZoneColor(score);
```

### 2. Audit Grading

```typescript
// Apply limiting rules
const finalGrade = ConstitutionUtils.applyLimitingRules(
  calculatedScore,
  criticalFindingCount,
  highFindingCount
);

// Get grade letter
const letter = ConstitutionUtils.getGradeLetter(finalGrade);
```

### 3. Evidence Validation

```typescript
// Check evidence requirement
const canClose = ConstitutionUtils.isEvidenceRequirementMet(evidenceCount);

// Get minimum required
const minFiles = SENTINEL_CONSTITUTION.EXECUTION.MIN_EVIDENCE_FILES; // 1
```

### 4. Root Cause Validation

```typescript
// Validate root cause length
const isValid = ConstitutionUtils.isRootCauseValid(rootCauseText);

// Get minimum length
const minLength = SENTINEL_CONSTITUTION.EXECUTION.MIN_ROOT_CAUSE_LENGTH; // 50
```

### 5. Four-Eyes Principle

```typescript
// Check if current user can approve
const canApprove = SENTINEL_CONSTITUTION.EXECUTION.FOUR_EYES_PRINCIPLE
  && preparerId !== currentUserId;
```

### 6. UI Styling

```typescript
// Get glass morphism blur
const blur = SENTINEL_CONSTITUTION.UI.GLASS_BLUR; // '20px'

// Get environment color
const envColor = ConstitutionUtils.getEnvironmentColor('PRODUCTION');

// Get AI glow colors
const genAIGlow = SENTINEL_CONSTITUTION.AI.DUAL_BRAIN.GEN_AI.GLOW; // blue
const computeGlow = SENTINEL_CONSTITUTION.AI.DUAL_BRAIN.COMPUTE_AI.GLOW; // orange
```

### 7. Finding Severity

```typescript
// Valid severity levels
const severities = SENTINEL_CONSTITUTION.FINDINGS.SEVERITY_LEVELS;
// ['critical', 'high', 'medium', 'low']

// Type-safe severity
import type { FindingSeverity } from '@/shared/config';
const severity: FindingSeverity = 'critical';
```

### 8. Workpaper States

```typescript
// Valid workpaper states
const states = SENTINEL_CONSTITUTION.EXECUTION.WORKPAPER_STATES;
// ['draft', 'in-review', 'approved', 'archived']

// Type-safe state
import type { WorkpaperState } from '@/shared/config';
const state: WorkpaperState = 'in-review';
```

## Pre-Built UI Components

```typescript
import {
  GlassCard,
  RiskBadge,
  EvidenceIndicator,
  AIBadge,
  FourEyesIndicator,
  GradeWaterfall,
  EnvironmentBanner,
} from '@/shared/ui';

// Glass card with neon glow
<GlassCard neonGlow="blue">
  <AIBadge type="gen" />
</GlassCard>

// Risk badge
<RiskBadge score={18} showLabel />

// Evidence indicator
<EvidenceIndicator evidenceCount={2} />

// Grade waterfall
<GradeWaterfall
  rawScore={85}
  finalScore={60}
  criticalCount={1}
  highCount={0}
/>
```

## Constants Quick Access

```typescript
// Risk zones
SENTINEL_CONSTITUTION.RISK.ZONES.GREEN   // 1-4
SENTINEL_CONSTITUTION.RISK.ZONES.YELLOW  // 5-9
SENTINEL_CONSTITUTION.RISK.ZONES.ORANGE  // 10-15
SENTINEL_CONSTITUTION.RISK.ZONES.RED     // 16-25

// Grade scale
SENTINEL_CONSTITUTION.GRADING.GRADE_SCALE.A  // 90-100
SENTINEL_CONSTITUTION.GRADING.GRADE_SCALE.B  // 80-89
SENTINEL_CONSTITUTION.GRADING.GRADE_SCALE.C  // 70-79
SENTINEL_CONSTITUTION.GRADING.GRADE_SCALE.D  // 60-69
SENTINEL_CONSTITUTION.GRADING.GRADE_SCALE.F  // 0-59

// Deduction rules
SENTINEL_CONSTITUTION.GRADING.DEDUCTION_RULES.CRITICAL  // 15 points
SENTINEL_CONSTITUTION.GRADING.DEDUCTION_RULES.HIGH      // 10 points
SENTINEL_CONSTITUTION.GRADING.DEDUCTION_RULES.MEDIUM    // 5 points
SENTINEL_CONSTITUTION.GRADING.DEDUCTION_RULES.LOW       // 2 points

// Execution rules
SENTINEL_CONSTITUTION.EXECUTION.EVIDENCE_REQUIRED        // true
SENTINEL_CONSTITUTION.EXECUTION.FOUR_EYES_PRINCIPLE      // true
SENTINEL_CONSTITUTION.EXECUTION.FIVE_WHYS_REQUIRED       // true
SENTINEL_CONSTITUTION.EXECUTION.MIN_ROOT_CAUSE_LENGTH    // 50
SENTINEL_CONSTITUTION.EXECUTION.MIN_EVIDENCE_FILES       // 1

// UI constants
SENTINEL_CONSTITUTION.UI.THEME_MODE           // 'dual-physics'
SENTINEL_CONSTITUTION.UI.PRIMARY_COLOR        // '#0057B7'
SENTINEL_CONSTITUTION.UI.GLASS_BLUR           // '20px'
SENTINEL_CONSTITUTION.UI.ANIMATION_DURATION   // 200ms
```

## Validation Schemas

```typescript
import { ValidationRules } from '@/shared/config';

// Finding validation
ValidationRules.finding.title.minLength           // 10
ValidationRules.finding.title.maxLength           // 200
ValidationRules.finding.root_cause.minLength      // 50
ValidationRules.finding.recommendation.minLength  // 20

// Risk validation
ValidationRules.risk.score.min                    // 1
ValidationRules.risk.score.max                    // 25
ValidationRules.risk.impact.min                   // 1
ValidationRules.risk.impact.max                   // 5
```

## Type Exports

```typescript
import type {
  RiskZone,           // 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED'
  GradeScale,         // 'A' | 'B' | 'C' | 'D' | 'F'
  FindingSeverity,    // 'critical' | 'high' | 'medium' | 'low'
  FindingStatus,      // Union of all finding states
  WorkpaperState,     // 'draft' | 'in-review' | 'approved' | 'archived'
  ProbeType,          // 'sql' | 'api' | 'file' | 'integration'
  ModuleName,         // Union of all module keys
} from '@/shared/config';
```

## Live Demo

Visit `/demo/constitution` to see all components and rules in action.

## Remember

- ✅ ALWAYS use Constitution constants instead of hardcoding values
- ✅ ALWAYS use ConstitutionUtils for calculations
- ✅ ALWAYS use type imports for type safety
- ❌ NEVER modify the Constitution object (it's immutable)
- ❌ NEVER create duplicate constants
- ❌ NEVER hardcode business rules
