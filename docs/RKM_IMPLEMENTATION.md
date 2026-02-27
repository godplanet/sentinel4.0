# RKM (Risk & Control Matrix) - Complete Implementation Guide

**VERSION:** 3.0
**DATE:** 2026-02-02
**STATUS:** ✅ FULLY OPERATIONAL

---

## 📋 Overview

The RKM system is a comprehensive Risk & Control Matrix implementation designed for Banking Audit compliance with 53+ data columns supporting multiple regulatory frameworks (BDDK, ISO 27001, COBIT 2019, MASAK).

---

## 🎯 Key Features

### 1. **Comprehensive Data Model (53+ Columns)**

The RKM database schema includes:

**GROUP A: Identity (Kimlik)**
- Risk Code, Title, Description, Owner, Status

**GROUP B: Process Detail (Süreç Detayı)**
- Main Process, Sub Process, Process Step, Process Type

**GROUP C: Risk Definition (Risk Tanımlama)**
- Category, Subcategory, Event Description, Cause, Consequence, Potential Loss

**GROUP D: Inherent Risk (İçsel Risk)**
- Impact (1-5), Likelihood (1-5), Volume (1-5)
- Auto-calculated: Score = Impact * ln(Volume + 1)
- Auto-calculated: Rating (KRİTİK/YÜKSEK/ORTA/DÜŞÜK)

**GROUP E: Control Framework (Kontrol Çerçevesi)**
- Objective, Description, Type, Nature, Frequency, Owner

**GROUP F: Control Effectiveness (Kontrol Etkinliği)**
- Design Rating (1-5), Operating Rating (1-5)
- Auto-calculated: Effectiveness = (Design + Operating) / 10

**GROUP G: Residual Risk (Artık Risk)**
- Impact, Likelihood
- Auto-calculated: Score = Impact * Likelihood * (1 - Control Effectiveness)
- Auto-calculated: Rating

**GROUP H: Compliance Mapping (Uyumluluk)**
- BDDK, ISO 27001, COBIT, MASAK, SOX, GDPR references

**GROUP I: Response & Mitigation (Müdahale)**
- Strategy, Plan, Owner, Deadline, Status, Cost

**GROUP J: Monitoring & Reporting (İzleme)**
- KRIs, Frequency, Thresholds, Review Dates

**GROUP K: Audit & Assurance (Denetim)**
- Audit Dates, Findings, Ratings, Action Plans

**GROUP L: Metadata**
- Tags, Custom Fields, Attachments, Version, Timestamps

---

## 🏗️ Architecture

### Database Tables

#### 1. `rkm_processes` - Process Hierarchy
- **ltree-based hierarchy** for 5-level organization
- Supports: Department > Division > Process > Sub-process > Activity
- Automatic parent-child relationship management

#### 2. `rkm_risks` - Main RKM Table
- 53+ columns covering all risk dimensions
- Auto-calculated fields for scoring and ratings
- Full-text search on risk titles and descriptions
- JSONB fields for flexible data storage

---

## 📱 User Interface

### 1. **RKM Library Page** (`/rkm-library`)

**Features:**
- 📋 List View: Table with essential columns
- 🎴 Card View: Visual card-based display
- 📊 Master Grid View: Excel-like 53+ column view
- 🔍 Advanced Search & Filtering
- 📈 Real-time Statistics Dashboard

**Actions:**
- ✅ Create new RKM via wizard (fully functional)
- ✅ Edit existing RKM (inline editing)
- ✅ Delete RKM (with confirmation)
- ✅ Export to Excel (CSV format)
- ✅ Navigate to Master Grid (53+ columns)

---

### 2. **RKM Master Grid Page** (`/rkm-master-grid`)

**Features:**
- 📊 Excel-like table with horizontal scrolling
- 📌 Frozen columns (Risk Code, Title)
- 🎨 Color-coded risk ratings
- 🔄 Sortable columns
- 📄 Pagination support
- 💾 Bulk operations
- ✅ **Excel export (fully functional)**
  - Exports all 53+ columns
  - CSV format with UTF-8 encoding
  - Turkish character support
  - Auto-download to user's computer

**Column Groups:**
- Identity & Status
- Process Information
- Inherent Risk Metrics
- Control Information
- Residual Risk Metrics
- Compliance Mappings
- Testing & Audit Data

---

### 3. **RKM Wizard Page** (`/rkm-wizard`)

**Two Creation Methods:**

#### Method 1: AI-Powered Creation
- 🤖 Natural language process description
- 🎯 Framework selection (BDDK, COBIT, ISO, MASAK)
- ✨ Auto-generation of risks and controls
- 📋 Suggested compliance mappings

#### Method 2: Excel Import
- 📂 Drag & drop file upload
- 📥 Template download
- 🔄 Automatic parsing and validation
- ✅ Bulk import with error handling

**Wizard Steps:**
1. Method Selection
2. Data Input (AI prompt or Excel upload)
3. Review & Validate
4. Complete & Save

---

## 🔧 Technical Implementation

### Frontend Architecture

```
src/
├── pages/
│   ├── rkm-library/          # Main library page
│   ├── rkm-master-grid/      # Excel-like grid view
│   └── rkm-wizard/           # Creation wizard
├── entities/
│   └── risk/                 # Risk entity logic
└── features/
    └── rkm-library/          # RKM-specific features
```

### Key Technologies
- **React** + **TypeScript** for type-safe UI
- **Supabase** for real-time database
- **PostgreSQL ltree** for hierarchical process organization
- **GENERATED ALWAYS AS** columns for auto-calculations
- **Row Level Security (RLS)** for multi-tenancy

---

## 🎨 Design Patterns

### Sidebar Color Synchronization
- Header background matches sidebar color
- Dynamic gradient generation
- Automatic theme adaptation

### Excel-Like Grid
- Frozen columns for better navigation
- Horizontal scrolling for 53+ columns
- Cell-level color coding for ratings
- Responsive row actions

### Wizard Pattern
- Step-by-step creation flow
- Progress indicator
- Validation at each step
- Back navigation support

---

## 📊 Risk Scoring Formulas

### Inherent Risk Score
```
Score = Impact * ln(Volume + 1)
```

**Rating Thresholds:**
- Score ≥ 15: **KRİTİK** (Critical)
- Score ≥ 10: **YÜKSEK** (High)
- Score ≥ 5: **ORTA** (Medium)
- Score < 5: **DÜŞÜK** (Low)

### Control Effectiveness
```
Effectiveness = (Design Rating + Operating Rating) / 10
```

### Residual Risk Score
```
Score = Impact * Likelihood * (1 - Control Effectiveness)
```

---

## 🔒 Security & Compliance

### Row Level Security (RLS)
- **Tenant Isolation**: All data filtered by `tenant_id`
- **User Authentication**: All queries require authenticated users
- **CRUD Policies**: Separate policies for SELECT, INSERT, UPDATE, DELETE

### Data Validation
- **CHECK Constraints** on numeric ratings (1-5)
- **ENUM Constraints** on status fields
- **NOT NULL** on critical fields
- **UNIQUE** constraints on risk codes

### Audit Trail
- **created_at / updated_at** timestamps
- **created_by / updated_by** user tracking
- **Version** column for change history

---

## 🚀 Usage Guide

### Creating a New RKM

#### Option 1: AI Creation (with Manual Editing)
1. Navigate to `/rkm-wizard`
2. Select "AI Asistan ile Oluştur"
3. Describe your process in natural language
4. Select applicable frameworks (BDDK, ISO, etc.)
5. Click "Analizi Başlat"
6. **AI generates suggestions**
7. **Review and manually edit each risk:**
   - Edit risk code, title, description
   - Adjust impact, likelihood, volume scores
   - Modify control information
   - Delete unwanted risks
8. **Final decision is always yours**
9. Save to database

#### Option 2: Excel Import (Fully Functional)
1. Navigate to `/rkm-wizard`
2. Select "Excel'den Yükle"
3. **Download CSV template** (optional)
   - Template includes all 53+ columns
   - Sample row with example data
   - UTF-8 encoded for Turkish characters
4. Fill template with your data
5. **Upload filled CSV file** (drag & drop or select)
6. System automatically parses the file
7. **Review and manually edit** parsed data
8. Save to database

**Important Notes:**
- All creation methods include a **manual review & edit step**
- You can modify AI suggestions before saving
- You can edit Excel-imported data before saving
- Final approval always requires human decision

### Viewing RKMs

#### List View
- Quick overview of essential fields
- Sortable columns
- Inline actions (Edit, Delete)

#### Card View
- Visual representation
- Risk rating badges
- Control effectiveness meter

#### Master Grid View
- Complete 53+ column view
- Excel-like navigation
- Bulk operations
- Export to Excel

---

## 📈 Statistics Dashboard

The RKM Library displays real-time statistics:

- **Toplam Risk**: Total number of risks
- **Kritik**: Critical-level risks (rating = KRİTİK)
- **Yüksek**: High-level risks (rating = YÜKSEK)
- **Orta**: Medium-level risks (rating = ORTA)

---

## 🔌 API Integration

### Supabase Client Usage

```typescript
// Fetch all risks
const { data, error } = await supabase
  .from('rkm_risks')
  .select('*')
  .order('created_at', { ascending: false });

// Fetch risks with process info
const { data, error } = await supabase
  .from('rkm_risks')
  .select(`
    *,
    process:rkm_processes(*)
  `);

// Create new risk
const { data, error } = await supabase
  .from('rkm_risks')
  .insert({
    risk_code: 'R-001',
    risk_title: 'Sample Risk',
    inherent_impact: 5,
    inherent_likelihood: 4,
    inherent_volume: 3,
    // ... other fields
  });
```

---

## 📦 Sample Data

The system includes sample data for demonstration:

- **5 Process Hierarchies**
  - Krediler Yönetimi (Loans Management)
  - Ticari Krediler (Commercial Loans)
  - Bireysel Krediler (Personal Loans)
  - Finansal Yönetim (Financial Management)
  - Bilgi Teknolojileri (IT)

- **3 Sample Risks**
  - R-001: Unauthorized credit approval
  - R-002: Collateral valuation error
  - R-003: Unauthorized access to customer data

---

## 🎯 Compliance Framework Mappings

### BDDK (Banking Regulation and Supervision Agency)
- Kredi Yönetmeliği references
- Risk assessment requirements
- Control effectiveness standards

### ISO 27001:2013
- Information security controls
- Access control requirements
- Security monitoring

### COBIT 2019
- IT governance framework
- Process control objectives
- Audit and assurance practices

### MASAK
- AML/CFT compliance
- Transaction monitoring
- Suspicious activity reporting

---

## ✅ Fully Functional Features

### Completed & Working
- ✅ **Excel Template Download** - CSV template with all 53+ columns
- ✅ **Excel Import** - Full CSV parsing with error handling
- ✅ **Excel Export** - Export Master Grid to CSV with Turkish support
- ✅ **AI-Powered Creation** - Generate risk suggestions from natural language
- ✅ **Manual Editing** - Review and edit all AI/Excel data before saving
- ✅ **Master Grid View** - Excel-like interface with 53+ columns
- ✅ **Process Hierarchy** - ltree-based hierarchical organization
- ✅ **Auto-Calculated Scoring** - Real-time inherent/residual risk calculation
- ✅ **Multi-Framework Compliance** - BDDK, ISO 27001, COBIT, MASAK mapping
- ✅ **Row Level Security** - Multi-tenant data isolation
- ✅ **Search & Filter** - Advanced filtering by category, rating, text
- ✅ **CRUD Operations** - Create, Read, Update, Delete all functional

### No Placeholder Buttons
All buttons in the application are **fully functional**:
- "Yeni RKM" → Opens wizard
- "Excel'e Aktar" → Downloads CSV file
- "Örnek RKM Şablonunu İndir" → Downloads template
- "Analizi Başlat" → Generates AI suggestions
- "Kaydet" → Saves to database
- "Düzenle" → Opens edit mode
- "Sil" → Deletes with confirmation

## 🛠️ Future Enhancements

### Planned Features
- [ ] Real-time AI risk scoring (backend integration)
- [ ] Automated control testing
- [ ] Risk heat map visualization
- [ ] Customizable dashboards
- [ ] Advanced reporting engine
- [ ] Workflow automation
- [ ] Integration with external systems
- [ ] XLSX support (currently CSV only)

---

## 📞 Support

For technical support or questions about RKM implementation:
- Review this documentation
- Check the Supabase migration files
- Examine the source code in `/src/pages/rkm-*`

---

**LAST UPDATED:** 2026-02-02
**DOCUMENT VERSION:** 1.0
**STATUS:** ✅ PRODUCTION READY
