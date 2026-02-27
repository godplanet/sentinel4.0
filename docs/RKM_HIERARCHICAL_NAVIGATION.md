# RKM Hierarchical Navigation System

**VERSION:** 3.0
**DATE:** 2026-02-02
**STATUS:** ✅ FULLY OPERATIONAL

---

## 📋 Overview

The RKM system now features a hierarchical navigation structure that organizes 600+ risks into manageable categories and sub-processes. This prevents UI clutter and provides intuitive drill-down navigation.

---

## 🏗️ Architecture

### 3-Level Hierarchy

```
Level 1: Main Process Categories (8 categories)
    ↓
Level 2: Sub-Processes (15+ sub-processes)
    ↓
Level 3: Individual Risks (600+ risks)
```

### Database Structure

Uses PostgreSQL **ltree** for hierarchical paths:
- `katilim_fonu` (Level 1)
- `katilim_fonu.fon_toplama` (Level 2)
- `katilim_fonu.fon_dagitimi` (Level 2)

---

## 📊 Main Process Categories

### 1. **Katılım Fonu Süreçleri** (`PR-KF-00`)
Sub-processes:
- Fon Toplama
- Fon Dağıtımı

### 2. **Bireysel/Kurumsal Fon Kullandırım Süreçleri** (`PR-FK-00`)
Sub-processes:
- Bireysel Krediler
- Kurumsal Krediler
- Konut Kredileri

### 3. **Muhasebe Süreçleri** (`PR-MH-00`)
Sub-processes:
- Genel Muhasebe
- Maliyet Muhasebesi

### 4. **Banka ve Kredi Kartları Süreçleri** (`PR-BK-00`)
Sub-processes:
- Banka Kartı İşlemleri
- Kredi Kartı İşlemleri

### 5. **Finansal Raporlama Süreçleri** (`PR-FR-00`)
Sub-processes:
- Mali Tablolar
- Regülatör Raporlar

### 6. **Ödeme Sistemleri Süreçleri** (`PR-OS-00`)
Sub-processes:
- EFT/Havale
- FAST

### 7. **Hazine/Menkul Kıymetler ve Fon Yönetimi Süreçleri** (`PR-HZ-00`)
Sub-processes:
- Portföy Yönetimi
- Likidite Yönetimi

### 8. **Diğer Süreçler** (`PR-DG-00`)
Catch-all category for miscellaneous processes

---

## 🎯 User Flow

### Flow 1: Browse by Category

```
1. User visits /rkm-library
   → Sees 8 category cards with statistics

2. User clicks "Katılım Fonu Süreçleri"
   → Navigates to /rkm-process/{id}
   → State includes category details

3. Left sidebar shows process tree
   → Main category (expanded by default)
   → Sub-processes (clickable filters)

4. Main area shows risks table
   → Filtered by selected sub-process
   → Search functionality

5. User can:
   → Filter by sub-process (sidebar)
   → Search by risk code/title
   → View/Edit/Delete individual risks
   → Return to categories
```

### Flow 2: Direct RKM Creation

```
1. User clicks "Yeni RKM" button
   → Opens /rkm-wizard
   → AI or Excel method

2. After creation
   → Redirects to /rkm-library
   → New risk appears in appropriate category
```

---

## 🎨 UI Components

### 1. **RKM Library (Dashboard)**
**Location:** `/rkm-library`

**Features:**
- Category cards with gradient icons
- Real-time statistics per category
- Risk count badges
- Critical risk indicators (red badge)
- Hover animations

**Data Displayed:**
- Category name & description
- Total risk count
- Critical risk count
- High risk count

---

### 2. **Process Detail Page**
**Location:** `/rkm-process/:id`

**Layout:**
```
┌─────────────────────────────────────────┐
│  Left Sidebar (Process Tree)            │ Main Area (Risks Table)
│  ────────────────────────                │ ──────────────────────
│  ┌─────────────────────┐                │ Search: [____________]
│  │ Kategori Adı     ▼  │                │
│  │  □ Tüm Alt Süreçler │                │ ┌──────────────────┐
│  │  □ Alt Süreç 1      │                │ │ Risk Code | Title│
│  │  □ Alt Süreç 2      │                │ │ R-001 | ...      │
│  │  □ Alt Süreç 3      │                │ │ R-002 | ...      │
│  └─────────────────────┘                │ └──────────────────┘
└─────────────────────────────────────────┘
```

**Features:**
- **Left Sidebar:**
  - Expandable/collapsible tree
  - "Tüm Alt Süreçler" option (shows all)
  - Individual sub-process filters
  - Risk count per sub-process
  - Selected state highlighting

- **Main Area:**
  - Search bar (risk code/title)
  - Risks table with columns:
    - Risk Code
    - Risk Title
    - Sub Process
    - Inherent Risk (color-coded)
    - Residual Risk (color-coded)
    - Control Effectiveness (progress bar)
    - Actions (Edit/Delete)
  - Hover row highlighting
  - Action buttons on hover

---

## 🔧 Technical Implementation

### Database Queries

**Load Main Categories:**
```sql
SELECT * FROM rkm_processes
WHERE level = 1
ORDER BY process_code;
```

**Load Sub-Processes:**
```sql
SELECT * FROM rkm_processes
WHERE path <@ 'katilim_fonu'
  AND level = 2
ORDER BY path;
```

**Load Risks by Category:**
```sql
SELECT * FROM rkm_risks
WHERE main_process = 'Katılım Fonu Süreçleri'
ORDER BY risk_code;
```

**Filter by Sub-Process:**
```sql
SELECT * FROM rkm_risks
WHERE main_process = 'Katılım Fonu Süreçleri'
  AND sub_process = 'Fon Toplama'
ORDER BY risk_code;
```

---

## 📱 Responsive Design

### Desktop (>1024px)
- Full sidebar (320px width)
- Table with all columns visible
- Comfortable spacing

### Tablet (768-1024px)
- Collapsible sidebar
- Table horizontal scroll
- Reduced padding

### Mobile (<768px)
- Hidden sidebar (hamburger menu)
- Card view instead of table
- Stacked layout

---

## 🎯 Key Features

### 1. **Scalability**
- Handles 600+ risks without performance issues
- Lazy loading of sub-processes
- Efficient ltree queries

### 2. **Intuitive Navigation**
- Clear visual hierarchy
- Breadcrumb-like flow
- Easy back navigation

### 3. **Flexible Filtering**
- By category
- By sub-process
- By search query
- Combined filters

### 4. **Real-Time Statistics**
- Category-level aggregation
- Risk count badges
- Critical risk indicators

---

## 🔒 Security

### Row Level Security (RLS)
All queries filtered by `tenant_id`:
- Categories isolated per tenant
- Risks visible only to own tenant
- Process tree scoped to tenant

---

## 📊 Statistics Display

### Category Cards
```
┌─────────────────────────┐
│ [Icon] Category Name    │
│ Description             │
│                         │
│ Riskler: 45  Kritik: 3  │
│ Detayları Görüntüle  → │
└─────────────────────────┘
```

### Dashboard Summary
- **Toplam Risk:** Total across all categories
- **Süreç Kategorisi:** Number of main categories
- **Kritik Riskler:** Sum of critical risks

---

## 🚀 Usage Examples

### Example 1: Find Credit Card Risks
```
1. Go to /rkm-library
2. Click "Banka ve Kredi Kartları Süreçleri"
3. Sidebar shows: Banka Kartı | Kredi Kartı
4. Click "Kredi Kartı İşlemleri"
5. View filtered risks in table
```

### Example 2: Search Across Category
```
1. Open any category detail page
2. Type "limit" in search bar
3. See all risks with "limit" in code/title
4. Filter by sub-process if needed
```

### Example 3: View All Risks
```
1. Open category detail page
2. Click "Tüm Alt Süreçler" in sidebar
3. View all risks under that category
4. Use search to narrow down
```

---

## 🛠️ Future Enhancements

### Planned Features
- [ ] 3-level deep hierarchy (activity level)
- [ ] Drag & drop risk organization
- [ ] Bulk risk assignment to processes
- [ ] Process risk heatmap
- [ ] Export by category
- [ ] Custom category creation
- [ ] Process templates

---

## 📞 Support

For questions about hierarchical navigation:
- Review this documentation
- Check `/src/pages/rkm-library/index.tsx`
- Check `/src/pages/rkm-process/index.tsx`
- Examine ltree queries in migration files

---

**LAST UPDATED:** 2026-02-02
**DOCUMENT VERSION:** 1.0
**STATUS:** ✅ PRODUCTION READY
