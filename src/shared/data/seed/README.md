# Universal Data Seeder

## Overview

The Universal Data Seeder automatically populates the ENTIRE Sentinel v3.0 application with realistic, interconnected Turkish banking data across 99+ pages.

## Architecture

```
src/shared/data/seed/
├── datasets/               # Turkish banking terminology
│   ├── turkish-names.ts   # 60 Turkish names + email generator
│   ├── banking-terms.ts   # Departments, risks, controls, branches
│   └── gias-categories.ts # GIAS 2024 compliance categories
├── factories/             # Data generators
│   ├── TenantFactory.ts
│   ├── UserFactory.ts
│   ├── HierarchyFactory.ts
│   ├── RiskFactory.ts
│   ├── EngagementFactory.ts
│   ├── FindingFactory.ts
│   ├── ActionFactory.ts
│   ├── WorkpaperFactory.ts
│   └── SpecializedFactory.ts (CCM, Governance, Timesheets, QAIP, PBC)
├── seeder.ts              # Main orchestrator
└── index.ts               # Exports
```

## Execution Flow (5 Phases)

### Phase 1: Foundation (3 entities)
- 1 Tenant: `Sentinel Bank A.Ş.`
- 20 Users: 3 Admins, 5 Managers, 10 Auditors, 2 Guest Experts
- 61 Entities: 1 HQ → 10 Departments → 50 Branches (ltree hierarchy)

### Phase 2: Strategy Layer
- 50 Risk Definitions (Kredi, Operasyonel, BT, Uyum, Piyasa risks)
- 50 Risk Assessments (5x5 heatmap distribution)

### Phase 3: Planning Layer
- 15 Audit Engagements (2026 Annual Plan)
  - Status: 40% FIELDWORK, 30% PLANNING, 20% REPORTING, 10% CLOSED
- Team member assignments (2-3 auditors per engagement)

### Phase 4: Execution Layer
- 50 Findings
  - Severity: 6% CRITICAL, 16% HIGH, 50% MEDIUM, 24% LOW, 4% OBSERVATION
  - State: 30% DRAFT, 24% IN_NEGOTIATION, 20% AGREED, 16% FINAL, 10% REMEDIATED
- Finding Secrets (5-Whys RCA)
- Finding Comments (1-3 per finding)
- 30 Action Plans (50% IN_PROGRESS, 25% OPEN, 15% COMPLETED, 10% OVERDUE)
- Action Steps (3-5 steps per action)
- Action Evidence (for completed/in-progress actions)
- 100 Workpapers (Control test results)
- Workpaper Evidence (1-4 files per workpaper)

### Phase 5: Specialized Modules
- 50 CCM Predator Alerts (Benford, Limit Aşım, Şüpheli İşlem)
- 5 Board Meetings (2026 schedule)
- 15 Governance Documents (Charter, Policies, Reports)
- 200+ Timesheet Entries (Dec 2024 - Feb 2026)
- 15 QAIP KPIs (Performance, Quality, Resources)
- 10+ PBC Requests

## Data Generation Summary

| Category | Count | Details |
|----------|-------|---------|
| **Tenants** | 1 | Sentinel Bank A.Ş. |
| **Users** | 20 | 3 Admins, 5 Managers, 10 Auditors, 2 Guests |
| **Entities** | 61 | HQ + 10 Depts + 50 Branches (ltree) |
| **Risks** | 50 | Library definitions |
| **Risk Assessments** | 50 | Mapped to entities (5x5 heatmap) |
| **Engagements** | 15 | 2026 Annual Plan |
| **Findings** | 50 | GIAS 2024 compliant |
| **Actions** | 30 | Linked to findings |
| **Workpapers** | 100 | Control tests |
| **Timesheets** | 200+ | Dec 2024 - Feb 2026 |
| **CCM Alerts** | 50 | Predator anomaly detection |
| **Board Meetings** | 5 | 2026 schedule |
| **Governance Docs** | 15 | Policies, charters, reports |
| **QAIP KPIs** | 15 | Performance metrics |
| **PBC Requests** | 10+ | Document requests |

**TOTAL RECORDS: ~1,000+ across 35+ tables**

## Auto-Injection Mechanism

The seeder runs **ONCE** on app startup if the database is empty:

```typescript
// App.tsx
useEffect(() => {
  async function initializeData() {
    const isEmpty = await UniversalSeeder.checkDatabaseEmpty();
    if (isEmpty) {
      await UniversalSeeder.seed();
    }
  }
  initializeData();
}, []);
```

- Checks `audit_entities` table
- If empty, runs seeder (takes ~10 seconds)
- Sets localStorage flag to prevent re-runs
- Shows loading screen with spinner during seeding

## Turkish Banking Terminology

All data uses authentic Turkish banking terms:

**Departments:**
- Kredi Risk Yönetimi
- Operasyonel Risk
- BT Güvenliği
- Uyum ve Denetim
- Finans Planlama

**Finding Templates:**
- "Stres Testi Metodoloji Eksiklikleri"
- "MFA (Çok Faktörlü Kimlik Doğrulama) Kullanılmıyor"
- "Teminat Değerleme Süreci Güncel Değil"
- "BDDK Uyum Eksiklikleri - Aktif Oran Hesabı"

**Branch Cities:** 50 major Turkish cities (Ankara, Istanbul, Izmir, etc.)

**Names:** 60 authentic Turkish first names + 40 surnames

## Relational Integrity

Strict foreign key chain enforcement:

```
Tenant
  ├─> Users
  ├─> Entities (Hierarchy)
  │     └─> Risk Assessments
  └─> Engagements
        ├─> Findings
        │     ├─> Actions
        │     │     ├─> Steps
        │     │     └─> Evidence
        │     ├─> Secrets (5-Whys)
        │     └─> Comments
        ├─> Workpapers
        │     └─> Evidence
        ├─> Timesheets
        └─> PBC Requests
```

Every child record references a valid parent ID.

## Reset Seeder

To re-seed the database:

```typescript
import { UniversalSeeder } from '@/shared/data/seed';

// In browser console or dev tools:
await UniversalSeeder.reset();
// Then reload the page
```

This clears the localStorage flag and allows re-seeding on next load.

## Performance

- **Execution Time:** < 10 seconds
- **Batch Inserts:** Uses Supabase batch API (max 1000 records/call)
- **Optimization:** Creates indexes before seeding (migrations)
- **RLS:** Temporarily disabled during seed, re-enabled after

## Pages Populated (99+)

**Dashboard (5 pages)**
- Main Dashboard (KPIs, aggregations)
- Ecosystem View
- Strategic Analysis
- Executive Dashboard
- Trend Analysis

**Strategy (5 pages)**
- Audit Universe (61 entities in tree)
- Objectives
- Neural Map (entity relationships)
- Risk Heatmap (5x5 matrix)
- Risk Simulation

**Planning (3 pages)**
- Strategic Planning
- Annual Plan (Gantt chart with 15 engagements)
- Resource Management

**Execution (10 pages)**
- Execution Dashboard
- Finding Hub (50 findings in Kanban/List)
- Agile Engagements
- Sprint Board
- Workpapers (100 items)
- Field Agent
- New Engagement Wizard

**Specialized Modules (30+ pages)**
- CCM Predator (50 alerts)
- Governance (5 meetings, 15 docs)
- QAIP (15 KPIs)
- Action Workbench (30 actions)
- Board Reporting
- Compliance (Framework mapping)
- Risk Laboratory
- And 20+ more...

## Data Quality

**Realistic Distributions:**
- Risk heatmap follows 5x5 matrix with Critical zone (5,5) having 4% of risks
- Finding severity matches real audit scenarios (50% Medium, 6% Critical)
- Engagement statuses reflect active annual plan (40% Fieldwork)
- Action completion rates realistic (50% In Progress, 15% Completed)

**Turkish Authenticity:**
- All names from actual Turkish name pool
- Banking terms from BDDK, MASAK, COBIT frameworks
- Compliance aligned with GIAS 2024 categories
- Branch cities from real Turkish geography

**Date Logic:**
- Created dates < Updated dates
- Start dates < End dates
- Timesheet entries: Dec 2024 - Feb 2026 (realistic work history)
- Board meetings: 2026 schedule (bi-monthly)

## Validation Checklist

After seeding, verify:

- [ ] Dashboard shows aggregated KPIs (not zeros)
- [ ] Risk Heatmap has colored cells (5x5 matrix)
- [ ] Finding Hub Kanban has cards in all 5 columns
- [ ] Annual Plan Gantt shows 15 engagements
- [ ] Action Workbench shows 30 actions with status distribution
- [ ] Audit Universe tree has 61 nodes (expandable)
- [ ] Board Reporting shows 5 meetings
- [ ] Timesheets show entries for multiple users
- [ ] Entity Scorecard shows department grades
- [ ] CCM Predator shows 50 alerts

## Troubleshooting

**Seeder doesn't run:**
- Check browser console for errors
- Verify Supabase connection (check .env)
- Check localStorage flag: `localStorage.getItem('sentinel_data_seeded')`

**Missing data on pages:**
- Check if page queries correct table
- Verify RLS policies allow read access
- Check console for API errors

**Want to re-seed:**
```javascript
localStorage.removeItem('sentinel_data_seeded');
location.reload();
```

## Future Enhancements

Potential additions:
- [ ] Seed data for Shariah compliance module (Fatwa queries)
- [ ] ESG sustainability metrics
- [ ] SOX controls and test results
- [ ] TPRM vendor assessments
- [ ] Investigation cases
- [ ] Survey responses
- [ ] Advisory projects

## Credits

- **Architect:** Sentinel v3.0 Chief Architect
- **Engineer:** Universal Seeder Implementation
- **Methodology:** GIAS 2024 + BDDK Banking Standards
- **Language:** Turkish (TR) - Banking Domain
