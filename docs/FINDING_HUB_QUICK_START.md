# Finding Hub - Quick Start Guide

## 🎯 What Is This?

The Finding Hub is a **Constitution-Aware** data grid that automatically adapts to your Risk Constitution. When you change your risk dimensions in Settings, the Finding Hub table updates instantly to show columns for each dimension.

## 🚀 How to Use

### 1. Open the Finding Hub

**Navigation:**
```
Sidebar → YÜRÜTME → Bulgu Merkezi
```

**Direct URL:**
```
http://localhost:5173/execution/finding-hub
```

You'll see a table with:
- **Fixed Columns**: Ref No, Title, Risk Badge, Status
- **Dynamic Columns**: One for each Risk Dimension (Financial, Legal, Shari'ah, Cyber, etc.)
- **Veto Column**: Shows critical risk indicators
- **Actions**: View/Edit buttons

### 2. View Statistics

Top of page shows 5 KPI cards:
- **Toplam Bulgu**: Total findings count
- **Kritik Risk**: Critical severity findings
- **Müzakerede**: Findings in negotiation
- **Kapatıldı**: Closed findings
- **Ort. Risk Skoru**: Average risk score

### 3. Filter Findings

**Risk Level Filter:**
- Kritik (Critical)
- Yüksek (High)
- Orta (Medium)
- Düşük (Low)

**Status Filter:**
- Taslak (Draft)
- Müzakere (Negotiation)
- Onay Bekliyor (Pending Approval)
- Kapatıldı (Closed)

**Search Box:**
Type to search by title, code, or department name.

**Clear Filters:**
Click "Temizle" button to reset all filters.

### 4. View Finding Details

**Option 1:** Click anywhere on a row → No action (placeholder for future sidebar)

**Option 2:** Hover over row → Eye icon appears → Click to open detail page

### 5. Create New Finding

**Button:** "Yeni Bulgu Ekle" (top right)

**Modal Opens:**
1. Enter finding details
2. Select severity
3. Add dimension scores (one per risk dimension)
4. Save

Finding appears in table immediately.

## 🧪 Testing the Dynamic Columns

### Test 1: View Default Columns

**Current Constitution (Default):**
- Financial (35%)
- Legal (25%)
- Shari'ah (30%)
- Cyber (10%)

**Table Shows:**
```
| Ref | Title | Risk | Status | Financial | Legal | Shari'ah | Cyber | Veto | Actions |
```

4 dynamic columns (one per dimension).

### Test 2: Add a New Dimension

**Steps:**
1. Navigate to: `Settings → Risk Constitution`
2. Click "Add Dimension"
3. Enter:
   - **ID**: `geopolitical`
   - **Label**: `Geopolitical Risk`
   - **Weight**: `0.15`
4. Adjust other weights so total = 1.0
5. Click "Save"
6. Go back to Finding Hub

**Result:**
```
| Ref | Title | Risk | Status | Financial | Legal | Shari'ah | Cyber | Geopolitical | Veto | Actions |
```

5th column appears automatically! No code changes needed.

### Test 3: Remove a Dimension

**Steps:**
1. Settings → Risk Constitution
2. Remove "Cyber" dimension
3. Redistribute weights
4. Save
5. Return to Finding Hub

**Result:**
```
| Ref | Title | Risk | Status | Financial | Legal | Shari'ah | Veto | Actions |
```

Cyber column disappears. Table shrinks to 3 dynamic columns.

### Test 4: Reorder Dimensions

**Steps:**
1. Settings → Risk Constitution
2. Drag dimensions to reorder:
   - Shari'ah (first)
   - Financial (second)
   - Legal (third)
3. Save
4. Return to Finding Hub

**Result:**
Column order changes to match new Constitution order.

## 📊 Understanding the Table

### Column 1: Ref No
```
FND-2026-001
```
Finding reference code (gray badge, monospace font)

### Column 2: Title
```
Yetersiz Shari'ah Uygunluk Kontrolleri
─────────────────────────────────────
Yatırım Bankacılığı
```
- Top: Finding title (bold)
- Bottom: Department (gray, small)

### Column 3: Risk
```
🔴 92
```
- Dot: Severity indicator (red/orange/yellow/blue)
- Number: Risk score in colored badge

### Column 4: Status
```
⚠️ Müzakere
```
Icon + state badge:
- 🕒 Taslak (gray)
- 👁️ Yayınlandı (blue)
- ⚠️ Müzakere (amber)
- ✅ Kapatıldı (green)

### Columns 5-N: Risk Dimensions
```
Financial  Legal  Shari'ah
    🔴4      🔴3      🔴5
```
Each cell shows:
- Colored dot (matches risk zone)
- Impact score (1-5)
- "-" if no score

### Column N+1: Veto
```
🛡️
```
Shows if finding has a veto:
- Red pulsing dot
- Shield icon
- Only for CRITICAL findings

### Column N+2: Actions
```
👁️
```
Hover to reveal:
- Eye icon → View details

## 📈 Sample Findings (Pre-Loaded)

The page includes 6 demo findings:

### Finding 1: Critical Shari'ah Issue
```
Code: FND-2026-001
Title: Yetersiz Shari'ah Uygunluk Kontrolleri
Severity: CRITICAL (92)
State: NEGOTIATION
Department: Yatırım Bankacılığı
Financial Impact: ₺2.5M
```

### Finding 2: High Operational Risk
```
Code: FND-2026-002
Title: Operasyonel Risk Yönetimi - Kritik Süreçler
Severity: HIGH (78)
State: DRAFT
Department: Operasyon Yönetimi
Financial Impact: ₺850K
```

### Finding 3: Critical Cyber Security
```
Code: FND-2026-003
Title: Siber Güvenlik - MFA Eksikliği
Severity: CRITICAL (88)
State: PENDING_APPROVAL
Department: Bilgi Teknolojileri
Financial Impact: ₺1.2M
```

### Finding 4: High Compliance Issue
```
Code: FND-2026-004
Title: Uyum - KYC Prosedürlerinde Eksiklik
Severity: HIGH (72)
State: NEGOTIATION
Department: Uyum ve Denetim
Financial Impact: ₺650K
```

### Finding 5: Medium Liquidity Risk
```
Code: FND-2026-005
Title: Likidite Yönetimi - Yetersiz Stres Testi
Severity: MEDIUM (58)
State: CLOSED
Department: Finans Planlama
Financial Impact: ₺320K
```

### Finding 6: Low Governance Issue
```
Code: FND-2026-006
Title: Kurumsal Yönetişim - Risk Raporlaması Gecikmeli
Severity: LOW (42)
State: FINAL
Department: Yönetim Kurulu Sekreteryası
Financial Impact: ₺0
```

## 🎨 Visual Indicators

### Risk Score Colors

**Critical Zone (80-100):** Red `#ef4444`
```
🔴 92
```

**High Zone (60-79):** Orange `#f97316`
```
🟠 72
```

**Medium Zone (40-59):** Yellow `#eab308`
```
🟡 58
```

**Low Zone (0-39):** Blue `#3b82f6`
```
🔵 42
```

### State Colors

| State | Color | Icon |
|-------|-------|------|
| Taslak | Gray | 🕒 |
| Yayınlandı | Blue | 👁️ |
| Müzakere | Amber | ⚠️ |
| Onay Bekliyor | Purple | 🕒 |
| Takip | Blue | 👁️ |
| Kapatıldı | Green | ✅ |
| Sonuçlandı | Dark Green | ✅ |

### Veto Indicator

Only shown for CRITICAL findings:
```
🛡️ (with pulsing red dot)
```

Indicates a constitutional veto has been triggered.

## 🔍 Advanced Filtering

### Combine Filters

**Example 1:** Critical findings in negotiation
```
Risk Level: Kritik
Status: Müzakere
→ Shows: FND-2026-001
```

**Example 2:** Cyber-related findings
```
Search: "Siber"
→ Shows: FND-2026-003
```

**Example 3:** Closed findings with high risk
```
Risk Level: Yüksek
Status: Kapatıldı
→ Shows: No results (all closed findings are Medium/Low)
```

### Clear All Filters

Click "Temizle" button to reset:
- Risk Level → ALL
- Status → ALL
- Search → ""

## 💡 Pro Tips

### Tip 1: Quick Risk Assessment
Look at the Risk column badges:
- **Lots of red badges?** High-risk portfolio
- **Mostly blue/yellow?** Lower risk profile
- **Mixed?** Balanced risk distribution

### Tip 2: Dimension Analysis
Compare dimension columns:
- All high Financial scores? → Financial controls weak
- Low Legal scores but high Shari'ah? → Legal team performing well
- Cyber column all red? → Cybersecurity needs attention

### Tip 3: State Management
Use state badges to track workflow:
- **Taslak** → Still being drafted by auditors
- **Müzakere** → Under discussion with auditee
- **Onay Bekliyor** → Waiting for management approval
- **Kapatıldı** → Remediation complete

### Tip 4: Filter by Department
Use search to focus on specific units:
```
Search: "Yatırım"
→ Shows all Investment Banking findings
```

### Tip 5: Veto Tracking
Findings with veto indicators need immediate escalation:
```
🛡️ = Constitutional override = Executive attention required
```

## 🚨 Demo Mode Warning

If you see this banner:
```
⚠️ Demo Modu: Mock bulgular gösteriliyor
```

**Meaning:** No real findings in database, using sample data.

**To Exit Demo Mode:**
1. Create a real finding via "Yeni Bulgu Ekle"
2. Refresh the page
3. Real data replaces mock data

## 🛠️ Troubleshooting

### Problem: No columns showing

**Cause:** Risk Constitution not configured
**Solution:**
1. Go to Settings → Risk Constitution
2. Verify dimensions exist
3. Save Constitution
4. Refresh Finding Hub

### Problem: Wrong number of columns

**Cause:** Constitution cache issue
**Solution:**
1. Hard refresh page (Ctrl+Shift+R)
2. Check Constitution dimensions count
3. Should match column count

### Problem: Scores showing as "-"

**Cause:** Findings have no dimension scores
**Solution:**
- Demo mode: Scores are randomized (1-5)
- Real mode: Edit finding to add scores

### Problem: Colors don't match risk level

**Cause:** Risk zone configuration mismatch
**Solution:**
1. Settings → Risk Constitution
2. Check Risk Ranges (min/max/color)
3. Verify score falls in correct range

## 🎓 Training Scenario

**Objective:** Add a new risk dimension and see it appear in the table.

**Steps:**

1. **Baseline:** Note current columns
   ```
   Financial | Legal | Shari'ah | Cyber
   ```

2. **Add Dimension:**
   - Go to Settings → Risk Constitution
   - Click "+ Add Dimension"
   - Enter:
     - ID: `operational`
     - Label: `Operational Risk`
     - Weight: `0.12`
   - Adjust weights:
     - Financial: 0.30 (was 0.35)
     - Legal: 0.23 (was 0.25)
     - Shari'ah: 0.28 (was 0.30)
     - Cyber: 0.07 (was 0.10)
     - Operational: 0.12 (new)
   - Total: 1.00 ✓
   - Save

3. **Verify:**
   - Return to Finding Hub
   - New column appears:
   ```
   Financial | Legal | Shari'ah | Cyber | Operational
   ```

4. **Test Removal:**
   - Remove "Cyber" dimension
   - Return to Finding Hub
   - Cyber column disappears:
   ```
   Financial | Legal | Shari'ah | Operational
   ```

**Result:** Dynamic columns working! ✅

## 📞 Support

**For Help:**
- Read full docs: `/docs/FINDING_HUB_DYNAMIC_COLUMNS.md`
- Check Risk Constitution settings
- Verify build succeeded: `npm run build`

**Common Issues:**
- Constitution not loading → Check Supabase connection
- Columns not updating → Hard refresh browser
- Scores missing → Check finding data structure

---

**Quick Access:**
- **URL:** `/execution/finding-hub`
- **Sidebar:** YÜRÜTME → Bulgu Merkezi
- **Settings:** Settings → Risk Constitution
- **Docs:** `/docs/FINDING_HUB_DYNAMIC_COLUMNS.md`

**Key Concept:** The table is CONSTITUTIONAL. It reads the rules from the Risk Constitution and adapts automatically. Change the Constitution, change the table. No code modifications required.

---

**Last Updated:** February 8, 2026
**Version:** 1.0
