# Sentinel GRC v3.0 - Diagnostics & Auto-Testing System

## Overview

The Diagnostics System is a comprehensive E2E testing engine that validates the entire audit lifecycle from Planning → Library → Fieldwork → Findings → Reporting. It automatically detects broken modules, mock data dependencies, and system health issues.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Diagnostics Cockpit                  │
│              /dev/diagnostics (UI)                   │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│               AutoTester Engine                      │
│         (src/features/diagnostics/)                  │
├──────────────────────────────────────────────────────┤
│  • Test 1: Database Connectivity                     │
│  • Test 2: System Master Data                        │
│  • Test 3: Planning Module (Create Engagement)       │
│  • Test 4: Library Module (Program Injection)        │
│  • Test 5: Fieldwork Module (Update Workpaper)       │
│  • Test 6: Finding Module (Create Finding)           │
│  • Test 7: Reporting Module (Fetch Data)             │
│  • Test 8: Ghost Hunter (Mock Data Detection)        │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│              Supabase PostgreSQL DB                  │
│         (Real DB operations & validation)            │
└─────────────────────────────────────────────────────┘
```

## Access

**URL**: `/dev/diagnostics`
**Navigation**: Sidebar → Sistem & Ayarlar → Test & Tanı
**Badge**: TEST (Blue)
**Icon**: Activity

## Features

### 1. System Health Dashboard

Displays real-time statistics:
- **Tenants**: Number of organizations in the system
- **Users**: Total user accounts (all roles)
- **Entities**: Organizational units (HQ, departments, branches)
- **Engagements**: Active audit engagements
- **Findings**: Total findings across all engagements
- **Workpapers**: Total workpaper count

### 2. Test Runner

**Button**: "Run Full System Simulation"

Executes 8 comprehensive tests that simulate a complete audit lifecycle:

#### Test 1: Database Connectivity
- **Purpose**: Verify Supabase connection is alive
- **Action**: Query `tenants` table
- **Pass Criteria**: Connection established, no errors
- **Fail Scenario**: Database unreachable, authentication failed

#### Test 2: System Master Data
- **Purpose**: Check if core data is seeded
- **Action**: Count users, entities, risks, templates
- **Pass Criteria**: At least 1 user and 1 entity exists
- **Warn Criteria**: Missing data (run seeder)
- **Fail Scenario**: Database query fails

#### Test 3: Planning Module
- **Purpose**: Test engagement creation logic
- **Action**:
  1. Fetch an entity and auditor
  2. Create test engagement: "AUTO-TEST Engagement"
  3. Verify it's persisted in DB
- **Pass Criteria**: Engagement created and queryable
- **Fail Scenario**: Insert fails, foreign key violation, not found after creation

#### Test 4: Library Module (Program Injection)
- **Purpose**: Test template → workpaper conversion
- **Action**:
  1. Fetch a template with steps
  2. Create workpapers from template steps
  3. Link workpapers to test engagement
- **Pass Criteria**: All steps converted to workpapers
- **Fail Scenario**: Template not found, insert fails, no steps

#### Test 5: Fieldwork Module
- **Purpose**: Test workpaper status updates
- **Action**:
  1. Fetch a workpaper from test engagement
  2. Update status to 'IN_PROGRESS'
  3. Verify update persisted
- **Pass Criteria**: Status changed and saved
- **Fail Scenario**: Update fails, not persisted

#### Test 6: Finding Module
- **Purpose**: Test finding creation and linkage
- **Action**:
  1. Create test finding: "AUTO-TEST Finding"
  2. Link to test engagement
  3. Verify it exists in DB
- **Pass Criteria**: Finding created with correct metadata
- **Fail Scenario**: Insert fails, not found after creation

#### Test 7: Reporting Module
- **Purpose**: Test data aggregation for reports
- **Action**:
  1. Query all findings for test engagement
  2. Verify test finding is included
- **Pass Criteria**: Report data includes test finding
- **Fail Scenario**: Query fails, test finding missing

#### Test 8: Ghost Hunter
- **Purpose**: Detect pages still using mock data
- **Action**: Scan known pages for hardcoded data
- **Warn Criteria**: Pages with `MOCK_DATA` constants found
- **Pass Criteria**: All critical pages use real DB
- **Fail Scenario**: Scan logic fails

### 3. Live Console

Terminal-style output showing:
- Real-time test execution logs
- Timestamps for each step
- Success/failure indicators (✅/❌/⚠️)
- Error messages with details
- Duration for each test

### 4. Auto-Cleanup

**Checkbox**: "Auto-cleanup test data"
**Default**: Enabled

When enabled:
- Deletes test finding after diagnostics
- Deletes test workpapers
- Deletes test engagement
- Keeps DB clean for production demos

When disabled:
- Test data remains in DB
- Useful for debugging failed tests
- Must manually clean up via SQL

### 5. Result Cards

Three visual cards showing:

#### 🟢 Functional Modules (PASS)
- Count of passing tests
- List of working modules
- Green theme

#### 🔴 Broken Modules (FAIL)
- Count of failing tests
- List of broken modules with errors
- Red theme

#### 🟡 Warnings (WARN)
- Count of warnings
- List of non-critical issues
- Amber theme

### 6. Detailed Test Results

Expandable rows for each test showing:
- Test name
- Status (PASS/FAIL/WARN)
- Duration in milliseconds
- Error message (if failed)
- JSON details (click to expand)

## Use Cases

### Scenario 1: First-Time Setup Validation

**Problem**: User deployed app on new server. Is everything working?

**Solution**:
1. Navigate to `/dev/diagnostics`
2. Click "Run Full System Simulation"
3. If all tests pass → System ready for demo
4. If tests fail → Check error messages for missing data/config

### Scenario 2: After Database Migration

**Problem**: Migrated to new Supabase project. Did tables and data migrate correctly?

**Solution**:
1. Run diagnostics
2. Test 2 (Master Data) will warn if data missing
3. Run Turkey Bank Seeder if needed
4. Re-run diagnostics to confirm

### Scenario 3: Before Executive Demo

**Problem**: Need to verify system works end-to-end before presenting to stakeholders.

**Solution**:
1. Run diagnostics 30 minutes before demo
2. Verify all 8 tests pass
3. Check System Health counts are realistic
4. Demo with confidence

### Scenario 4: Post-Deployment Smoke Test

**Problem**: Just deployed new version to production. Did anything break?

**Solution**:
1. Run diagnostics immediately after deployment
2. If Test 3-7 fail → Regression detected
3. Roll back deployment
4. Fix issues and re-deploy

### Scenario 5: Developer Onboarding

**Problem**: New developer needs to understand data flow across modules.

**Solution**:
1. Run diagnostics with console open
2. Follow the logs to see: Planning → Library → Fieldwork → Findings → Reporting
3. Inspect test details to see DB operations
4. Use as a learning tool for system architecture

## Technical Implementation

### Files Created

```
src/features/diagnostics/
├── AutoTester.ts          # Core testing engine
└── index.ts               # Module exports

src/pages/dev/
└── DiagnosticsPage.tsx    # UI dashboard
```

### Key Functions

#### `AutoTester.runFullDiagnostics()`
Main entry point. Returns a `DiagnosticReport`.

```typescript
const tester = new AutoTester();
const report = await tester.runFullDiagnostics();

console.log(`Passed: ${report.passed}/${report.totalTests}`);
console.log(`System Health:`, report.systemHealth);
```

#### `AutoTester.cleanupTestData()`
Removes test artifacts from database.

```typescript
await tester.cleanupTestData();
```

### Data Structures

#### TestResult
```typescript
interface TestResult {
  test: string;              // Test name
  status: 'PASS' | 'FAIL' | 'WARN';
  duration: number;          // Milliseconds
  error?: string;            // Error message if failed
  details?: any;             // Additional context
}
```

#### DiagnosticReport
```typescript
interface DiagnosticReport {
  timestamp: string;         // ISO 8601
  totalTests: number;
  passed: number;
  failed: number;
  warned: number;
  tests: TestResult[];
  systemHealth: {
    tenantCount: number;
    userCount: number;
    entityCount: number;
    engagementCount: number;
    findingCount: number;
    workpaperCount: number;
  };
}
```

## Navigation Integration

Added to sidebar under **Sistem & Ayarlar**:

```typescript
{
  id: 'diagnostics',
  label: 'Test & Tanı',
  path: '/dev/diagnostics',
  icon: Activity,
  badge: 'TEST',
  badgeColor: 'blue',
}
```

## Performance

**Test Suite Execution Time**: ~2-3 seconds

Breakdown:
- Test 1-2: ~300ms (DB connectivity + counts)
- Test 3: ~400ms (Create engagement)
- Test 4: ~500ms (Create workpapers)
- Test 5: ~200ms (Update workpaper)
- Test 6: ~400ms (Create finding)
- Test 7: ~300ms (Query report data)
- Test 8: ~100ms (Ghost hunter)

**Database Impact**:
- Inserts: 1 engagement + N workpapers + 1 finding
- Updates: 1 workpaper status change
- Deletes (if auto-cleanup): All test data

**No impact on production data** (test artifacts isolated by auto-generated codes).

## Error Handling

All tests are wrapped in try-catch blocks:

```typescript
try {
  // Test logic
  this.results.push({
    test: 'Module Name',
    status: 'PASS',
    duration: Date.now() - start,
  });
} catch (error) {
  this.results.push({
    test: 'Module Name',
    status: 'FAIL',
    duration: Date.now() - start,
    error: error.message,
  });
}
```

Even if one test fails, subsequent tests continue.

## Mock Data Detection

The Ghost Hunter (Test 8) currently flags these pages:

| Page | Mock Type | Priority |
|------|-----------|----------|
| AuditeeDashboard | Sample assignments | Medium |
| RegulationSelector | Sample regulations | Medium |
| GanttTimeline | Sample timeline | Low |
| PredictiveRadar | Sample predictions | Low |
| QualityAssurance | Sample KPIs | Low |

**Recommendation**: Connect these pages to real DB queries for enhanced realism.

## Comparison with Manual Testing

| Aspect | Manual Testing | Auto-Diagnostics |
|--------|----------------|------------------|
| Time | 15-20 minutes | 3 seconds |
| Coverage | Depends on tester | 8 core modules |
| Repeatability | Low (human variance) | 100% consistent |
| Data Pollution | High (leftover test data) | Zero (auto-cleanup) |
| Error Detection | Subjective | Objective (DB verification) |
| Onboarding Value | Low | High (teaches flow) |

## Future Enhancements

Potential additions:

1. **Performance Benchmarks**: Track test durations over time
2. **Regression Alerts**: Email if tests start failing
3. **Load Testing**: Create 100 engagements to test scale
4. **API Endpoint Tests**: Verify all Supabase RPC functions
5. **RLS Policy Tests**: Verify multi-tenant isolation
6. **UI Smoke Tests**: Automated Playwright tests
7. **Scheduled Runs**: Cron job to run diagnostics hourly
8. **Historical Reports**: Store past results for trend analysis

## Troubleshooting

### All Tests Fail

**Cause**: Database connection issue or empty DB.
**Fix**:
1. Check `.env` has correct Supabase credentials
2. Run Turkey Bank Seeder: Refresh page (auto-init runs)

### Test 3-7 Fail but 1-2 Pass

**Cause**: Missing master data (entities, users, templates).
**Fix**: Run Turkey Bank Seeder or Universal Seeder.

### Test 8 Shows Many Warnings

**Cause**: Pages still using mock data.
**Fix**: This is expected. These are low-priority pages. Ignore for demos.

### Cleanup Fails

**Cause**: Foreign key constraints or RLS policies.
**Fix**:
1. Check if test finding has dependencies (comments, actions)
2. Manually delete via SQL: `DELETE FROM audit_findings WHERE finding_code LIKE 'AUTO-F-%'`

### Tests Pass but App Looks Empty

**Cause**: Diagnostics creates minimal test data, not full demo data.
**Fix**: Run Turkey Bank Seeder for rich demo content.

## Best Practices

1. **Run Before Demos**: Always run diagnostics 15 minutes before presenting
2. **Enable Auto-Cleanup**: Keep DB clean unless debugging
3. **Check Ghost Hunter**: Use WARN results to prioritize mock data cleanup
4. **Monitor Duration**: If tests take >5s, investigate DB performance
5. **Use for Onboarding**: Have new developers run and read the code
6. **Document Failures**: If test fails, screenshot and report to team

## Conclusion

The Diagnostics System provides:

✅ Automated E2E validation
✅ Real-time feedback on system health
✅ Mock data detection
✅ Clean test data management
✅ Confidence for demos and deployments

It's an essential tool for maintaining a production-ready, demo-ready Sentinel GRC v3.0 platform.
