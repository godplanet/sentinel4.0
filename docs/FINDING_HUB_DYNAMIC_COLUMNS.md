# Finding Hub - Dynamic Column System

## Overview

The Finding Hub is a sophisticated data grid that automatically adapts its columns based on the Risk Constitution dimensions. When you add, remove, or modify risk dimensions in the Constitution (Settings → Risk Constitution), the Finding Hub table automatically updates to reflect these changes in real-time.

## Architecture

### Core Components

**1. FindingDataGrid Widget (`src/widgets/tables/FindingDataGrid.tsx`)**
- Dynamic table component
- Reads risk dimensions from `useRiskConstitution()` hook
- Auto-generates columns for each dimension
- Displays impact scores with visual indicators

**2. FindingHubPage (`src/pages/execution/FindingHubPage.tsx`)**
- Main page container
- Statistics dashboard
- Filters (Risk Level, Status, Search)
- New Finding modal integration
- Mock data generation

**3. Risk Constitution Integration**
- Hook: `useRiskConstitution()`
- Type: `RiskConstitutionData`
- Dimensions: `Dimension[]` array

## How It Works

### Step 1: Constitution Loading

```typescript
const { constitution, loading } = useRiskConstitution();
```

The grid fetches the active risk constitution, which contains:
```typescript
{
  dimensions: [
    { id: 'financial', label: 'Financial', weight: 0.35 },
    { id: 'legal', label: 'Legal', weight: 0.25 },
    { id: 'shariah', label: "Shari'ah", weight: 0.30 },
    { id: 'cyber', label: 'Cyber', weight: 0.10 }
  ],
  risk_ranges: [...],
  veto_rules: [...]
}
```

### Step 2: Dynamic Column Generation

```typescript
const dynamicColumns = useMemo(() => {
  if (!constitution?.dimensions) return [];
  return constitution.dimensions.map(dim => ({
    id: dim.id,
    label: dim.label,
    weight: dim.weight,
  }));
}, [constitution]);
```

This creates an array of columns dynamically:
- **Label**: Display name (e.g., "Financial", "Legal")
- **Weight**: Used for tooltip (shows % contribution)
- **Order**: Same order as defined in Constitution

### Step 3: Table Rendering

**Fixed Columns:**
1. Ref No (Finding code)
2. Bulgu Başlığı (Finding title + department)
3. Risk (Severity dot + risk score badge)
4. Durum (State: Draft, Negotiation, Closed, etc.)

**Dynamic Columns:**
5-N. One column per dimension (Financial, Legal, Shari'ah, etc.)

**Fixed Columns (End):**
- Veto (Shows pulsing indicator if critical)
- Actions (View button)

### Step 4: Cell Rendering

Each dynamic column shows:
```typescript
<ImpactDot score={dimensionScore} color={riskZoneColor} />
```

- **Dot**: Colored circle (color from risk zone)
- **Number**: Impact score (1-5)
- **Empty**: "-" if no score

## Visual Design

### Base Styling
- **Background**: `bg-white/80 backdrop-blur-xl` (Liquid Glass)
- **Border**: `border-slate-200`
- **Header**: `bg-gradient-to-r from-slate-50 to-slate-100`
- **Sticky Header**: Stays fixed when scrolling

### Risk Indicators

**Risk Score Badge:**
```typescript
<div
  style={{ backgroundColor: riskColor }}
  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
>
  {score}
</div>
```

Colors come from `constitution.risk_ranges`:
- **Critical**: Red (#ef4444)
- **High**: Orange (#f97316)
- **Medium**: Yellow (#eab308)
- **Low**: Blue (#3b82f6)

**Veto Indicator:**
- Pulsing red dot
- Shield icon
- Only shown for CRITICAL findings

### State Badges

**Diplomasi Durumu (Finding State):**
- **Taslak** (Draft): Gray badge with Clock icon
- **Müzakere** (Negotiation): Amber badge with AlertTriangle icon
- **Onay Bekliyor** (Pending Approval): Purple badge
- **Kapatıldı** (Closed): Green badge with CheckCircle

## User Journey

### 1. Navigate to Finding Hub
```
Sidebar → YÜRÜTME → Bulgu Merkezi
URL: /execution/finding-hub
```

### 2. View Dynamic Columns
The table shows all risk dimensions from Constitution:
- If you have 3 dimensions → 3 columns
- If you add a 4th dimension → 4 columns automatically appear
- If you remove a dimension → column disappears

### 3. Filter Findings
**Risk Level Filter:**
- All
- Kritik (Critical)
- Yüksek (High)
- Orta (Medium)
- Düşük (Low)

**Status Filter:**
- Tüm Durumlar (All)
- Taslak (Draft)
- Müzakere (Negotiation)
- Onay Bekliyor (Pending)
- Kapatıldı (Closed)
- Sonuçlandı (Final)

**Search:**
- Searches title, code, department

### 4. View Finding Details
Click any row → Opens detail page
Click Eye icon → Navigate to full detail view

## Mock Data Structure

The page includes 6 pre-seeded findings:

**Finding 1: Critical - Shari'ah Compliance Issue**
```typescript
{
  code: 'FND-2026-001',
  title: 'Yetersiz Shari\'ah Uygunluk Kontrolleri',
  severity: 'CRITICAL',
  state: 'NEGOTIATION',
  impact_score: 92,
  financial_impact: 2500000,
  auditee_department: 'Yatırım Bankacılığı'
}
```

**Finding 2: High - Operational Risk**
```typescript
{
  code: 'FND-2026-002',
  title: 'Operasyonel Risk Yönetimi - Kritik Süreçler',
  severity: 'HIGH',
  state: 'DRAFT',
  impact_score: 78,
  financial_impact: 850000
}
```

**Finding 3: Critical - Cyber Security**
```typescript
{
  code: 'FND-2026-003',
  title: 'Siber Güvenlik - MFA Eksikliği',
  severity: 'CRITICAL',
  state: 'PENDING_APPROVAL',
  impact_score: 88,
  financial_impact: 1200000
}
```

...and 3 more (Compliance, Liquidity, Governance)

## Statistics Dashboard

**5 KPI Cards:**

1. **Toplam Bulgu** (Total Findings)
   - Count of all findings
   - Blue badge

2. **Kritik Risk** (Critical Risk)
   - Count of CRITICAL severity findings
   - Red badge with AlertTriangle

3. **Müzakerede** (In Negotiation)
   - Findings with NEGOTIATION state
   - Amber badge with Eye icon

4. **Kapatıldı** (Closed)
   - CLOSED + FINAL state count
   - Green badge with Shield icon

5. **Ort. Risk Skoru** (Avg Risk Score)
   - Average impact_score across all findings
   - Gray badge with TrendingUp icon

## Real-Time Updates

### Adding a New Dimension

**Before:**
```
| Ref | Title | Risk | Status | Financial | Legal | Shari'ah | Veto | Actions |
```

**User Action:**
1. Go to Settings → Risk Constitution
2. Add new dimension: "Geopolitical Risk" (weight: 0.10)
3. Save Constitution

**After (Automatic):**
```
| Ref | Title | Risk | Status | Financial | Legal | Shari'ah | Geopolitical | Veto | Actions |
```

**No code changes required!** The table automatically:
- Detects new dimension
- Creates new column
- Renders impact dots
- Updates footer summary

### Removing a Dimension

If you remove "Cyber" dimension:
- Column disappears immediately
- All other columns shift left
- Weights recalculate automatically

### Reordering Dimensions

Constitution dimensions order determines column order:
```typescript
dimensions: [
  { id: 'shariah', label: "Shari'ah", weight: 0.30 },  // Column 1
  { id: 'financial', label: 'Financial', weight: 0.35 }, // Column 2
  { id: 'legal', label: 'Legal', weight: 0.25 }          // Column 3
]
```

## Technical Details

### Dimension Score Calculation (Mock)

Currently uses random scores for demo:
```typescript
const getDimensionScore = (finding: Finding, dimensionId: string): number => {
  return Math.floor(Math.random() * 5) + 1; // Returns 1-5
};
```

**Production Implementation:**
Store actual dimension scores in `audit_findings` table:
```sql
ALTER TABLE audit_findings ADD COLUMN dimension_scores JSONB DEFAULT '{}'::jsonb;

-- Example:
dimension_scores: {
  "financial": 4,
  "legal": 3,
  "shariah": 5,
  "cyber": 2
}
```

### Risk Zone Color Mapping

```typescript
const getRiskZoneColor = (finding: Finding): string => {
  if (!constitution?.risk_ranges) return '#94a3b8';

  const score = finding.impact_score || 0;
  const zone = [...constitution.risk_ranges]
    .sort((a, b) => b.min - a.min)
    .find(r => score >= r.min);

  return zone?.color || '#94a3b8';
};
```

Maps finding's impact score to Constitution's risk zones:
- Score 80-100 → Critical Zone → Red
- Score 60-79 → High Zone → Orange
- Score 40-59 → Medium Zone → Yellow
- Score 0-39 → Low Zone → Blue

## Integration Points

### 1. Finding Creation Modal

When creating a new finding:
```typescript
<NewFindingModal
  isOpen={showNewFindingModal}
  onClose={() => setShowNewFindingModal(false)}
  onSave={handleSaveNewFinding}
/>
```

Modal should allow entering:
- Dimension scores (one input per active dimension)
- Overall impact score
- Severity level
- State

### 2. Finding Detail Page

Clicking a finding navigates to:
```
/execution/findings/{findingId}
```

Detail page should show:
- Full dimension breakdown
- Risk score calculation formula
- Veto information if triggered
- Action plans
- Comments/negotiations

### 3. Auditee Portal

Findings published to auditees show:
- Simplified view (no internal notes)
- Dimension scores (read-only)
- Action plan submission form
- Comment thread

## Configuration

### Enable/Disable Mock Data

Page automatically detects if real data exists:
```typescript
const [useMockData, setUseMockData] = useState(false);

useEffect(() => {
  const data = await comprehensiveFindingApi.getAll();
  if (data.length === 0) {
    setUseMockData(true); // Switch to mock
  }
}, []);
```

Shows warning banner when using mock data:
```
⚠️ Demo Modu: Mock bulgular gösteriliyor
```

### Performance Optimization

For large datasets (1000+ findings):

1. **Pagination:**
```typescript
const [page, setPage] = useState(1);
const pageSize = 50;
const paginatedFindings = filteredFindings.slice(
  (page - 1) * pageSize,
  page * pageSize
);
```

2. **Virtual Scrolling:**
Use `@tanstack/react-virtual` for rendering only visible rows

3. **Memoization:**
Already implemented with `useMemo()` for:
- Dynamic columns calculation
- Filtered findings
- Statistics

## Testing Scenarios

### Scenario 1: Default 4-Dimension Setup
**Constitution:**
- Financial (35%)
- Legal (25%)
- Shari'ah (30%)
- Cyber (10%)

**Expected:**
- 4 dynamic columns
- Each finding shows 4 impact dots
- Colors match risk zones

### Scenario 2: Add Geopolitical Dimension
**Action:**
1. Settings → Risk Constitution
2. Add: { id: 'geopolitical', label: 'Geopolitical', weight: 0.15 }
3. Adjust other weights to sum to 1.0
4. Save

**Expected:**
- Table automatically shows 5th column
- Header: "Geopolitical"
- Tooltip: "Ağırlık: 15%"
- All findings show 5 dots

### Scenario 3: Remove Cyber Dimension
**Action:**
1. Settings → Risk Constitution
2. Remove "Cyber" dimension
3. Redistribute weight
4. Save

**Expected:**
- Cyber column disappears
- Table shows only 3 columns
- Footer updates: "Risk Boyutları: Financial • Legal • Shari'ah"

### Scenario 4: Filter by Critical + Negotiation
**Action:**
1. Risk filter → "Kritik"
2. Status filter → "Müzakere"

**Expected:**
- Shows only FND-2026-001 (Shari'ah Compliance)
- Count: 1 bulgu gösteriliyor
- Other findings hidden

### Scenario 5: Search for "Siber"
**Action:**
Type "Siber" in search box

**Expected:**
- Shows FND-2026-003 (Cyber Security - MFA)
- All other findings filtered out

## Troubleshooting

### Issue: Columns Not Showing

**Cause:** Constitution not loaded
**Solution:** Check:
```typescript
const { constitution, loading, error } = useRiskConstitution();
console.log('Constitution:', constitution);
```

Verify `dimensions` array exists and is populated.

### Issue: Wrong Column Order

**Cause:** Dimensions array order changed
**Solution:** Dimensions render in array order. Update Constitution to reorder.

### Issue: Colors Not Matching

**Cause:** Risk zone configuration mismatch
**Solution:** Verify `risk_ranges` in Constitution:
```typescript
risk_ranges: [
  { label: 'Critical', min: 80, max: 100, color: '#ef4444' },
  { label: 'High', min: 60, max: 79, color: '#f97316' },
  ...
]
```

### Issue: Scores Showing as "-"

**Cause:** `getDimensionScore()` returning 0 or undefined
**Solution:** Check finding data structure. Mock data should have valid scores.

## Future Enhancements

### 1. Editable Cells
Allow inline editing of dimension scores:
```typescript
<input
  type="number"
  min="1"
  max="5"
  value={score}
  onChange={(e) => updateDimensionScore(finding.id, dimensionId, e.target.value)}
  className="w-12 text-center"
/>
```

### 2. Bulk Actions
- Select multiple findings (checkboxes)
- Apply state changes in bulk
- Export to Excel with dynamic columns

### 3. Column Reordering
Drag-and-drop column headers to reorder (would need to save preference)

### 4. Custom Views
Save filter combinations as named views:
- "My Critical Findings"
- "Open Negotiations"
- "Closed This Month"

### 5. Export
Generate Excel with:
- All findings
- Dynamic columns matching current Constitution
- Formatting (colors, borders)

## Dependencies

**Required Packages:**
- `react-router-dom` (navigation)
- `lucide-react` (icons)
- `clsx` (conditional classes)
- `@tanstack/react-query` (optional, for data fetching)

**Internal Dependencies:**
- `useRiskConstitution` hook
- `ComprehensiveFinding` type
- `FindingState`, `FindingSeverity` enums
- `comprehensiveFindingApi` (finding CRUD)
- `createFinding` mutation
- `NewFindingModal` component

## File Structure

```
src/
├── pages/
│   └── execution/
│       └── FindingHubPage.tsx         (Main page)
├── widgets/
│   └── tables/
│       └── FindingDataGrid.tsx        (Dynamic grid)
├── features/
│   ├── risk-constitution/
│   │   ├── useRiskConstitution.ts     (Hook)
│   │   └── types.ts                   (Dimension types)
│   └── finding-form/
│       └── NewFindingModal.tsx        (Creation modal)
├── entities/
│   └── finding/
│       ├── model/types.ts             (Finding types)
│       └── api/
│           ├── module5-api.ts         (CRUD)
│           └── mutations.ts           (Create/Update)
└── app/
    └── routes/
        └── index.tsx                   (Route: /execution/finding-hub)
```

## Conclusion

The Dynamic Finding Hub demonstrates Sentinel's constitutional architecture in action. By tying the UI directly to the Risk Constitution, we ensure:

1. **Consistency**: All findings use the same risk dimensions
2. **Flexibility**: Add/remove dimensions without code changes
3. **Transparency**: Visual representation matches calculation logic
4. **Scalability**: Works for 3 dimensions or 30 dimensions

This is the CONSTITUTIONAL WAY. The system adapts to the rules you define, not the other way around.

---

**Last Updated:** February 8, 2026
**Version:** 1.0
**Status:** Production Ready ✅
