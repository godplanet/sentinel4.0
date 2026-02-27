# Universal Seeder - Quick Start Guide

## For Developers

### 1. First Time Setup
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser to http://localhost:5173
```

On first load, you'll see:
```
Demo verileri yükleniyor...
(Demo data loading...)
```

Wait ~10 seconds. The seeder will automatically populate the database.

### 2. Verify Seeding

Open browser console and run:
```javascript
await validateSeeder();
```

Expected output:
```
✅ tenants                  | Expected:    1 | Actual:    1 | PASS
✅ user_profiles            | Expected:   20 | Actual:   20 | PASS
✅ audit_entities           | Expected:   61 | Actual:   61 | PASS
... (15 total checks)

✅ Passed: 15 / 15
🎉 All validation checks passed!
```

### 3. Test Key Pages

Navigate to these pages to verify data:

**Dashboard:**
- URL: `/`
- Should show: KPIs with real numbers (Total: 50, Critical: 3, etc.)

**Finding Hub:**
- URL: `/execution/finding-hub`
- Should show: 50 findings in Kanban board (5 columns)

**Risk Heatmap:**
- URL: `/risk-heatmap`
- Should show: 5x5 matrix with colored cells

**Audit Universe:**
- URL: `/strategy/audit-universe`
- Should show: Tree with 61 nodes (1 HQ + 10 Depts + 50 Branches)

**Annual Plan:**
- URL: `/planning`
- Should show: Gantt chart with 15 engagements

### 4. Re-seed Database

If you need to reset and re-seed:

```javascript
// In browser console
await UniversalSeeder.reset();
location.reload();
```

### 5. Check Data Integrity

```javascript
// In browser console
await validateIntegrity();
```

Expected output:
```
🔍 Validating Data Integrity...

✅ No orphaned findings
✅ No orphaned actions
✅ All entity ltree paths are valid
✅ All finding dates are logically valid

✅ Data integrity validation complete.
```

### 6. Inspect Seeded Data

Using Supabase:
```javascript
import { supabase } from '@/shared/api/supabase';

// Get all findings
const { data: findings } = await supabase
  .from('audit_findings')
  .select('*');
console.log(findings);

// Get all users
const { data: users } = await supabase
  .from('user_profiles')
  .select('*');
console.log(users);

// Get entity hierarchy
const { data: entities } = await supabase
  .from('audit_entities')
  .select('*')
  .order('path');
console.log(entities);
```

### 7. Common Issues

**Issue: Seeder doesn't run**
- Check localStorage: `localStorage.getItem('sentinel_data_seeded')`
- If it's `'true'`, reset it: `localStorage.removeItem('sentinel_data_seeded')`
- Reload page

**Issue: Missing data on pages**
- Check browser console for API errors
- Verify Supabase connection (check `.env`)
- Run validation: `await validateSeeder()`

**Issue: RLS policy errors**
- Check if dev mode policies are enabled
- Review Supabase table policies in Dashboard

### 8. Development Workflow

When developing new features:

1. **Don't worry about seed data** - It's automatic
2. **Use live data** - Query Supabase tables directly
3. **Test with real scenarios** - 50 findings, 15 engagements already exist
4. **Validate relationships** - All foreign keys are valid

### 9. Adding New Data Types

To add new entity types to the seeder:

1. Create factory in `src/shared/data/seed/factories/`
2. Add to seeder in `src/shared/data/seed/seeder.ts`
3. Update README with new counts
4. Add validation check in `validate.ts`

Example:
```typescript
// 1. Create SurveyFactory.ts
export class SurveyFactory {
  static async createSurveys(tenantId: string, users: any[]): Promise<any[]> {
    // Implementation
  }
}

// 2. Add to seeder.ts
import { SurveyFactory } from './factories/SurveyFactory';

private static async seedSpecialized(): Promise<void> {
  // ... existing code ...

  const surveys = await SurveyFactory.createSurveys(this.tenantId, users);
  console.log(`   ✓ Created ${surveys.length} surveys`);
}

// 3. Add validation
{ table: 'surveys', expected: 20, description: 'Surveys' }
```

### 10. Performance Tips

The seeder is optimized for speed:
- Uses batch inserts (1000 records max per call)
- Minimizes database round-trips
- Stores temporary data in memory during seeding
- Cleans up after completion

If seeding is slow:
- Check network connection to Supabase
- Verify no RLS policies blocking inserts
- Check browser console for errors

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `await validateSeeder()` | Validate all table counts |
| `await validateIntegrity()` | Check data integrity |
| `await UniversalSeeder.reset()` | Reset seed flag |
| `localStorage.removeItem('sentinel_data_seeded')` | Force re-seed |
| `await UniversalSeeder.checkDatabaseEmpty()` | Check if DB is empty |

---

## File Locations

| What | Where |
|------|-------|
| Main seeder | `src/shared/data/seed/seeder.ts` |
| Factories | `src/shared/data/seed/factories/` |
| Datasets | `src/shared/data/seed/datasets/` |
| Validation | `src/shared/data/seed/validate.ts` |
| Auto-injection | `src/App.tsx` |
| Documentation | `src/shared/data/seed/README.md` |

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Run validation tools
3. Review Supabase logs
4. Check `.env` configuration
5. Verify database migrations are applied

For questions, refer to:
- `UNIVERSAL_SEEDER_IMPLEMENTATION.md` (full implementation details)
- `src/shared/data/seed/README.md` (architecture documentation)

---

**Happy Coding! 🚀**
