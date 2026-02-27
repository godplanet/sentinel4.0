# PERSONA-BASED RBAC SYSTEM - Quick Start Guide

## Overview
Sentinel v3.0 now includes a **Multi-Persona RBAC** system that allows you to simulate 5 different user roles without logging out. This is designed for:
- **QA Testing**: Verify each role's access permissions
- **Demo Presentations**: Switch between personas during demos
- **UAT**: Allow stakeholders to experience the system from their perspective

---

## The 5 Personas

### 1. CAE (Chief Audit Executive) - Admin
- **User:** Hakan Yılmaz (`hakan@sentinel`)
- **Access:** FULL (All modules)
- **Use Case:** System administration, full oversight
- **Badge:** Purple Shield icon

### 2. AUDITOR (Senior Auditor)
- **User:** Ahmet Demir (`ahmet@sentinel`)
- **Access:** Execution, Findings, Reporting, CCM, AI Tools
- **Blocked:** Strategy, Governance, Settings, Resources, QAIP
- **Use Case:** Day-to-day audit execution
- **Badge:** Blue UserCog icon

### 3. EXECUTIVE (GMY - Genel Müdür Yardımcısı)
- **User:** Zeynep Aydın (`zeynep@bank`)
- **Access:** Dashboard, Reporting, Risk Heatmap, Board Reports
- **Blocked:** Execution, Settings, QAIP, Investigation, CCM
- **Use Case:** Executive overview and board reporting
- **Badge:** Amber Eye icon

### 4. AUDITEE (Branch Manager)
- **User:** Mehmet Kaya (`mehmet@branch`)
- **Access:** Dashboard, My Actions, Findings (view only), Investigation
- **Blocked:** Strategy, Governance, Settings, Resources, QAIP, CCM, Reporting
- **Use Case:** Respond to findings, upload evidence, track action plans
- **Badge:** Green Building icon
- **Data:** 5 action plans explicitly assigned to `mehmet@branch`

### 5. SUPPLIER (Vendor Representative)
- **User:** Vendor Co. (`vendor@x`)
- **Access:** ONLY Vendor Portal
- **Blocked:** Everything else
- **Use Case:** Complete TPRM questionnaires, upload compliance documents
- **Badge:** Orange Package icon
- **Data:** 1 TPRM assessment assigned to this vendor

---

## How to Switch Personas

### Step 1: Open User Menu
1. Click your **user avatar** in the bottom-left corner of the sidebar
2. The profile menu will open

### Step 2: Select "Rol Değiştir" (Switch Role)
3. Click **"Rol Değiştir"** (purple button with UserCog icon)
4. A persona selection menu will appear

### Step 3: Choose Persona
5. Select any of the 5 personas
6. The system will:
   - Update your user context
   - Filter navigation based on permissions
   - Redirect you to `/dashboard`

### Step 4: Verify Access
7. Navigate through the sidebar to verify access restrictions
8. Try accessing blocked modules (you'll see they're hidden)

---

## Demo Data (Auto-Seeded)

The system automatically seeds persona-specific data on first load:

### For CAE (Admin)
- Full access to all 50 findings, 15 engagements, 100 workpapers

### For AUDITOR
- Access to 5 engagements with findings and workpapers

### For EXECUTIVE (GMY)
- Risk Velocity snapshots for dashboard KPIs
- Upcoming board meeting scheduled for Q1 2026

### For AUDITEE (Branch Manager)
- **5 Action Plans** explicitly assigned to `mehmet@branch`
- These will appear in the "My Actions" page
- Each action plan is linked to a finding and requires evidence upload

### For SUPPLIER (Vendor)
- 1 TPRM vendor record for "Vendor Co."
- 1 active TPRM assessment (due in 14 days)
- Access token pre-generated for `/vendor-portal`

---

## Page Audit Tool

To verify which pages are empty/broken:

1. Navigate to **Sistem & Ayarlar** → **Sayfa Denetim Aracı**
   - Path: `/dev/page-audit`
   - Badge: **DEV** (red)

2. The tool will show:
   - ✅ **HAZIR** (Ready) - Fully functional pages
   - ⚠️ **BOŞ** (Empty) - Known placeholder pages
   - ❌ **BOZUK** (Broken) - Non-functional pages

3. Use filters to view:
   - All pages
   - Ready pages only
   - Empty pages only
   - Broken pages only

4. Actions available:
   - **Eye icon** - Visit page in same tab
   - **External link** - Open page in new tab

---

## Access Control Logic

### How Permissions Work

The persona store (`src/shared/stores/persona-store.ts`) defines:
- `allowedPaths`: Array of path prefixes the persona can access
- `hiddenPaths`: Array of path prefixes to block

### Example: Executive (GMY)
```typescript
allowedPaths: [
  '/dashboard',
  '/reporting',
  '/strategy/risk-heatmap',
  '/strategy/neural-map',
  '/governance/board',
],
hiddenPaths: [
  '/execution',
  '/settings',
  '/qaip',
  '/investigation',
  '/ccm',
],
```

### CAE Exception
CAE has `allowedPaths: ['*']` which grants full access to everything.

---

## Testing Checklist

Use this checklist to verify each persona:

### CAE (Admin)
- [ ] Can access all 8 navigation pillars
- [ ] Can see Settings → System Health
- [ ] Can see Resources → Talent OS
- [ ] Can see QAIP → KPI Dashboard

### AUDITOR
- [ ] Can access Execution → Findings
- [ ] Can access CCM → Predator
- [ ] **Cannot** access Strategy → Objectives
- [ ] **Cannot** access Settings
- [ ] **Cannot** access Resources

### EXECUTIVE (GMY)
- [ ] Can access Dashboard → Stratejik Analiz
- [ ] Can access Reporting → Executive Dashboard
- [ ] Can access Governance → Board Reporting
- [ ] **Cannot** access Execution → Findings
- [ ] **Cannot** access CCM → Predator
- [ ] **Cannot** access Settings

### AUDITEE (Branch Manager)
- [ ] Can access Dashboard
- [ ] Can access Execution → Actions
- [ ] Sees 5 action plans assigned to `mehmet@branch`
- [ ] **Cannot** access Strategy
- [ ] **Cannot** access Governance
- [ ] **Cannot** access Reporting → Builder

### SUPPLIER (Vendor)
- [ ] Can **ONLY** access Vendor Portal
- [ ] All other navigation items are hidden
- [ ] Sees 1 TPRM assessment pending completion

---

## Developer Notes

### File Structure
```
src/
├── shared/
│   ├── stores/
│   │   └── persona-store.ts          # Persona definitions & access control
│   └── data/
│       └── seed/
│           └── persona-seeder.ts      # Persona-specific data injection
├── pages/
│   └── dev/
│       └── PageAuditPage.tsx          # Dead page detector
└── widgets/
    └── Sidebar/
        └── index.tsx                   # Role switcher UI
```

### Key Functions

#### Check if path is allowed
```typescript
import { usePersonaStore } from '@/shared/stores/persona-store';

const { isPathAllowed } = usePersonaStore();
const canAccess = isPathAllowed('/strategy/objectives');
```

#### Get current persona config
```typescript
const { getCurrentPersonaConfig } = usePersonaStore();
const config = getCurrentPersonaConfig();
console.log(config.name, config.title, config.allowedPaths);
```

#### Switch persona programmatically
```typescript
const { setPersona } = usePersonaStore();
setPersona('EXECUTIVE');
```

---

## Troubleshooting

### Issue: Auditee sees 0 action plans
**Solution:** Run the persona seeder manually:
```typescript
import { PersonaSeeder } from '@/shared/data/seed/persona-seeder';
await PersonaSeeder.reset();
await PersonaSeeder.seedAll();
```

### Issue: Navigation items not filtering
**Solution:** Check that the Sidebar is using `filteredNavigation` instead of `navigationConfig`:
```typescript
// Correct:
{filteredNavigation.map((module) => { ... })}

// Wrong:
{navigationConfig.map((module) => { ... })}
```

### Issue: Vendor Portal not accessible
**Solution:** Ensure the SUPPLIER persona is active and navigate directly to `/vendor-portal`

---

## Future Enhancements

- [ ] Add "Quick Switch" floating button for rapid persona testing
- [ ] Add persona activity logs (who did what when)
- [ ] Add custom persona creation UI
- [ ] Add fine-grained permissions (row-level, not just path-level)
- [ ] Add "Persona Tour" - guided walkthrough for each role

---

**Last Updated:** 2026-02-10
**Author:** Sentinel Engineering Team
**Version:** v3.0 - Persona RBAC System
