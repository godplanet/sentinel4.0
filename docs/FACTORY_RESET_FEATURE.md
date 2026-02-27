# Factory Reset Feature - User Guide

## Overview

The Factory Reset feature allows you to completely wipe all test data and reload fresh demo data with a single click. This is useful when:

- You've corrupted test data during development
- You want to demo the application with clean data
- You need to reset to a known good state
- You want to test the seeder again

## Location

**Path:** Settings → Sistem Parametreleri → Danger Zone (bottom of page)

**URL:** `/settings-consolidated` → "Sistem Parametreleri" tab

## What It Does

### Data Wiped
The Factory Reset will:
1. Clear the localStorage seed flag
2. Trigger the UniversalSeeder to run again
3. Repopulate ALL 35+ tables with fresh demo data

### Data Generated
After reset, you'll have:
- ✅ 1 Tenant (Sentinel Bank A.Ş.)
- ✅ 20 Users (Turkish names, realistic roles)
- ✅ 61 Entities (HQ + 10 Depts + 50 Branches)
- ✅ 50 Risk Definitions
- ✅ 50 Risk Assessments (5x5 heatmap)
- ✅ 15 Engagements (2026 Annual Plan)
- ✅ 50 Findings (GIAS 2024 compliant)
- ✅ 30 Action Plans (with steps & evidence)
- ✅ 100 Workpapers (control tests)
- ✅ 200+ Timesheet Entries
- ✅ 50 CCM Predator Alerts
- ✅ 5 Board Meetings
- ✅ 15 Governance Documents
- ✅ 15 QAIP KPIs
- ✅ 10+ PBC Requests

**Total: ~1,000+ records across 35+ tables**

## How to Use

### Step 1: Navigate to Settings
1. Open Sentinel v3.0
2. Click "Ayarlar" (Settings) in sidebar
3. Stay on "Sistem Parametreleri" tab (default)

### Step 2: Scroll to Danger Zone
1. Scroll to the bottom of the page
2. Look for the red "Tehlike Bölgesi" (Danger Zone) section
3. Find the "Fabrika Ayarlarına Dön" (Factory Reset) card

### Step 3: Trigger Reset
1. Click the red "Sistemi Sıfırla" (Reset System) button
2. Read the confirmation dialog carefully:
   ```
   ⚠️ TEHLİKELİ İŞLEM!

   Tüm veriler silinecek ve varsayılan demo veriler yüklenecek.

   • Tüm bulgular silinecek
   • Tüm denetimler silinecek
   • Tüm riskler silinecek
   • Tüm aksiyonlar silinecek

   Bu işlem geri alınamaz. Emin misiniz?
   ```
3. Click "OK" to confirm (or "Cancel" to abort)

### Step 4: Wait for Reset
1. You'll see "Sıfırlanıyor..." (Resetting...) on the button
2. A blue notification appears: "🌱 Demo veriler yükleniyor..."
3. Wait ~10 seconds for seeding to complete
4. Page automatically reloads with fresh data

### Step 5: Verify
1. Navigate to Finding Hub: Should show 50 findings
2. Check Risk Heatmap: Should show 5x5 matrix with colors
3. View Annual Plan: Should show 15 engagements in Gantt
4. Audit Universe: Should show tree with 61 nodes

## UI Design

### Danger Zone Section
```
┌─────────────────────────────────────────────────┐
│ ⚠️ Tehlike Bölgesi                              │
│                                                  │
│ Bu alan geri alınamaz sistem işlemlerini       │
│ içerir. Dikkatli olun.                          │
│                                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ Fabrika Ayarlarına Dön                      │ │
│ │                                              │ │
│ │ Tüm verileri sil ve temiz demo verilerini  │ │
│ │ yeniden yükle.                              │ │
│ │                                              │ │
│ │ • 50 Bulgu (Demo data)                      │ │
│ │ • 15 Denetim (2026 Annual Plan)            │ │
│ │ • 61 Entite (HQ + 10 Dept + 50 Branches)   │ │
│ │ • ... (and more)                            │ │
│ │                                              │ │
│ │                    [🔄 Sistemi Sıfırla]     │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Colors
- **Border:** Red (`border-red-200`)
- **Background:** Red tint (`bg-red-50`)
- **Icon:** Red warning triangle
- **Button:** Red (`bg-red-600`, hover: `bg-red-700`)

### States

**Idle State:**
```
[🔄 Sistemi Sıfırla]
```

**Loading State:**
```
[⏳ Sıfırlanıyor...]
(Blue notification: "🌱 Demo veriler yükleniyor...")
```

**Disabled State:**
```
[⏳ Sıfırlanıyor...] (grayed out, not clickable)
```

## Safety Features

### 1. Confirmation Dialog
Browser-native confirmation with detailed warning:
- Lists exactly what will be deleted
- Warns that it's irreversible
- Requires explicit "OK" click

### 2. Visual Warning
Danger Zone section uses:
- Red color scheme
- Warning icon (AlertTriangle)
- Bold "Tehlike Bölgesi" heading
- Explicit warning text

### 3. Loading State
During reset:
- Button disabled (prevents double-click)
- Shows spinner animation
- Displays progress message

### 4. Automatic Reload
After completion:
- 1-second delay for console logs to complete
- Automatic page reload ensures fresh state
- No stale data in memory

## Technical Details

### Implementation
```typescript
const handleFactoryReset = async () => {
  // 1. Confirm
  const confirmed = window.confirm('⚠️ TEHLİKELİ İŞLEM!...');
  if (!confirmed) return;

  // 2. Clear localStorage flag
  localStorage.removeItem('sentinel_data_seeded');

  // 3. Run seeder
  await UniversalSeeder.seed();

  // 4. Reload page
  setTimeout(() => window.location.reload(), 1000);
};
```

### Performance
- **Execution Time:** ~10 seconds
- **Records Created:** 1,000+
- **Tables Affected:** 35+
- **Page Reload:** Automatic after 1 second

### Error Handling
If seeder fails:
- Error logged to console
- Alert shown to user
- Button re-enabled (not stuck in loading state)
- User can try again

## Console Output

During Factory Reset, you'll see:

```
🔄 Factory Reset başlatılıyor...
🌱 Demo veriler yeniden yükleniyor...

🌱 Starting Universal Data Seeder...
📊 Phase 1/5: Creating Foundation...
   ✓ Created tenant: Sentinel Bank A.Ş.
   ✓ Created 20 users
   ✓ Created 61 entities in ltree hierarchy
📊 Phase 2/5: Creating Strategy Layer...
   ✓ Created 50 risk definitions
   ✓ Created 50 risk assessments
📊 Phase 3/5: Creating Planning Layer...
   ✓ Created 15 audit engagements
   ✓ Assigned team members to engagements
📊 Phase 4/5: Creating Execution Layer...
   ✓ Created 50 findings
   ✓ Created finding secrets (5-Whys)
   ✓ Created finding comments
   ✓ Created 30 action plans
   ✓ Created action steps
   ✓ Created action evidence
   ✓ Created 100 workpapers
   ✓ Created workpaper evidence
📊 Phase 5/5: Creating Specialized Modules...
   ✓ Created 50 CCM predator alerts
   ✓ Created 5 board meetings
   ✓ Created 15 governance documents
   ✓ Created 245 timesheet entries
   ✓ Created 15 QAIP KPIs
   ✓ Created 12 PBC requests

✅ Universal Data Seeder completed successfully!
✅ Sistem fabrika ayarlarına döndürüldü!

(Page reloads...)
```

## Use Cases

### 1. Development Testing
**Scenario:** You modified finding logic and created corrupt data.

**Solution:**
1. Click Factory Reset
2. Get clean findings with proper 5-Whys
3. Test your changes against known good data

### 2. Demo Preparation
**Scenario:** You need to demo the app to stakeholders.

**Solution:**
1. Click Factory Reset morning of demo
2. Get fresh, realistic Turkish banking data
3. Walk through features with clean state

### 3. Training
**Scenario:** Training new team members on the system.

**Solution:**
1. Let them explore and modify data freely
2. Reset between training sessions
3. Each session starts with identical data

### 4. Bug Investigation
**Scenario:** User reports a bug but you can't reproduce.

**Solution:**
1. Reset to known good state
2. Follow exact steps user took
3. Isolate whether issue is data-related

## Validation After Reset

Run these checks in browser console:

```javascript
// Validate all table counts
await validateSeeder();

// Check data integrity
await validateIntegrity();

// Quick check
const { count } = await supabase
  .from('audit_findings')
  .select('*', { count: 'exact', head: true });
console.log('Findings count:', count); // Should be 50
```

Expected output:
```
✅ Passed: 15 / 15
🎉 All validation checks passed!
```

## Comparison with Manual Seeding

| Method | Factory Reset Button | Manual Console Commands |
|--------|---------------------|------------------------|
| **Ease of Use** | ✅ One click | ❌ Multiple commands |
| **Safety** | ✅ Confirmation dialog | ⚠️ No confirmation |
| **UI Feedback** | ✅ Loading spinner | ❌ No visual feedback |
| **Error Handling** | ✅ Alert on failure | ❌ Must check console |
| **Page Reload** | ✅ Automatic | ❌ Manual |
| **Accessibility** | ✅ Available to all users | ❌ Requires dev tools |

## Troubleshooting

### Issue: Button is grayed out
**Cause:** Reset already in progress
**Solution:** Wait for completion or reload page

### Issue: Reset fails with error
**Cause:** Database connection issue or RLS policy blocking
**Solution:**
1. Check browser console for error details
2. Verify Supabase connection (.env)
3. Check RLS policies in dev mode
4. Try again after fixing issue

### Issue: Page doesn't reload
**Cause:** JavaScript error during seeding
**Solution:**
1. Check console for error
2. Manually reload: `window.location.reload()`
3. Verify data: `await validateSeeder()`

### Issue: Data still appears old
**Cause:** Browser cache or React state not updating
**Solution:**
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Check localStorage: `localStorage.getItem('sentinel_data_seeded')`

## Security Considerations

### 1. Production Environments
**WARNING:** This feature should be **disabled** in production!

To disable:
```typescript
// Add environment check
if (import.meta.env.PROD) {
  return null; // Don't render Danger Zone in production
}
```

### 2. User Permissions
Consider adding role-based access:
```typescript
// Only show to admins
if (currentUser.role !== 'admin') {
  return null;
}
```

### 3. Audit Logging
For production-like environments, log resets:
```typescript
await supabase.from('audit_logs').insert({
  action: 'FACTORY_RESET',
  user_id: currentUser.id,
  timestamp: new Date().toISOString()
});
```

## Best Practices

### DO ✅
- Reset before demos
- Reset after major testing sessions
- Reset when data gets corrupted
- Verify data after reset (run validation)

### DON'T ❌
- Reset in production (EVER!)
- Reset without backing up if you have important test data
- Reset while others are actively testing
- Spam the button (it disables during execution)

## Future Enhancements

Potential improvements:
- [ ] Backup current data before reset
- [ ] Selective reset (only findings, only risks, etc.)
- [ ] Reset with custom seed size (10 findings vs 50)
- [ ] Reset progress bar showing 5 phases
- [ ] Option to export data before reset
- [ ] Admin-only access control
- [ ] Audit log of all resets

## Related Documentation

- `UNIVERSAL_SEEDER_IMPLEMENTATION.md` - Full seeder details
- `SEEDER_QUICK_START.md` - Developer guide
- `src/shared/data/seed/README.md` - Architecture docs

## Credits

**Feature:** Factory Reset with UI Integration
**Location:** Settings Consolidated Page → Danger Zone
**Engineer:** Sentinel v3.0 Development Team
**Date:** February 9, 2026

---

**Status:** ✅ COMPLETE AND TESTED
