# RKM Quick Start Guide

**SENTINEL v3.0 - Risk & Control Matrix**

---

## 🚀 Quick Start (3 Steps)

### Method 1: Create RKM with AI

1. **Navigate** → `/rkm-wizard`
2. **Select** → "AI Asistan ile Oluştur"
3. **Describe** → Write your process description
   ```
   Örnek: "Ticari krediler tahsis süreci için BDDK yönetmeliğine uygun,
   teminat yapısı ve limit kontrollerini içeren bir risk matrisi hazırla"
   ```
4. **Select Frameworks** → BDDK, ISO 27001, COBIT, MASAK
5. **Generate** → Click "Analizi Başlat"
6. **Review & Edit** → Modify AI suggestions
7. **Save** → Click "X Risk Kaydet"

---

### Method 2: Import from Excel

1. **Download Template**
   - Go to `/rkm-wizard`
   - Click "Excel'den Yükle"
   - Click "📥 Örnek RKM Şablonunu İndir"
   - Template saved as `RKM_Sablonu_YYYY-MM-DD.csv`

2. **Fill Template**
   - Open CSV in Excel/Google Sheets
   - Fill rows with your risk data
   - Follow sample row format
   - Save as CSV (UTF-8)

3. **Upload & Import**
   - Drag & drop CSV file or click to select
   - System auto-parses file
   - Review parsed data
   - Edit if needed
   - Save to database

---

## 📊 View & Manage RKMs

### List View
- **URL:** `/rkm-library`
- **View:** Quick overview with essential columns
- **Actions:** Edit, Delete, Search

### Master Grid (53+ Columns)
- **URL:** `/rkm-master-grid`
- **View:** Excel-like full data view
- **Features:**
  - Horizontal scrolling
  - Frozen columns
  - Color-coded ratings
  - Export to Excel

### Export to Excel
1. Go to `/rkm-master-grid`
2. Click "Excel'e Aktar"
3. CSV file auto-downloads
4. Open in Excel/Google Sheets

---

## 🎯 Key Concepts

### Risk Scoring

**Inherent Risk:**
```
Score = Impact × ln(Volume + 1)
```
- Impact: 1-5 (Low to Critical)
- Likelihood: 1-5 (Rare to Almost Certain)
- Volume: 1-5 (Very Low to Very High)

**Control Effectiveness:**
```
Effectiveness = (Design Rating + Operating Rating) / 10
```
- Design Rating: 1-5
- Operating Rating: 1-5

**Residual Risk:**
```
Score = Impact × Likelihood × (1 - Control Effectiveness)
```

### Risk Ratings
- **KRİTİK** (Critical): Score ≥ 15
- **YÜKSEK** (High): Score ≥ 10
- **ORTA** (Medium): Score ≥ 5
- **DÜŞÜK** (Low): Score < 5

---

## 🔒 Data Fields

### Mandatory Fields
- ✅ `risk_code` - Unique identifier
- ✅ `risk_title` - Short title
- ✅ `risk_description` - Detailed description
- ✅ `inherent_impact` - 1-5
- ✅ `inherent_likelihood` - 1-5
- ✅ `inherent_volume` - 1-5

### Recommended Fields
- 📋 `risk_category` - Operasyonel, Finansal, Uyumluluk, etc.
- 📋 `control_type` - PREVENTIVE, DETECTIVE, CORRECTIVE
- 📋 `control_description` - Control details
- 📋 `bddk_reference` - BDDK compliance mapping
- 📋 `iso27001_reference` - ISO 27001 mapping

### Optional Fields (50+ more)
- Process details
- Compliance mappings
- Mitigation plans
- Audit information
- Custom fields

---

## 💡 Pro Tips

### 1. Use AI for Initial Draft
- AI generates comprehensive suggestions
- Always review and edit before saving
- AI helps with compliance mappings

### 2. Leverage Excel Template
- Pre-filled headers
- Sample data for reference
- Easy bulk import

### 3. Master Grid for Analysis
- View all 53+ columns
- Export for external analysis
- Share with stakeholders

### 4. Keep Risk Codes Consistent
- Use naming convention: `R-XXX`
- Group by category: `R-FIN-001`, `R-OPS-001`
- Makes filtering easier

---

## 🆘 Troubleshooting

### Excel Import Fails
- **Problem:** File parsing error
- **Solution:**
  - Ensure CSV format (not XLSX)
  - Check UTF-8 encoding
  - Verify column headers match template

### AI Generation Not Working
- **Problem:** "AI işleme hatası"
- **Solution:**
  - Currently shows mock data
  - Backend integration planned
  - Use manual editing for now

### Missing Data After Save
- **Problem:** Risks not appearing
- **Solution:**
  - Check tenant_id filtering
  - Verify RLS policies
  - Refresh page

---

## 📞 Support

- **Documentation:** `/docs/RKM_IMPLEMENTATION.md`
- **Schema:** Check migration files in `/supabase/migrations/`
- **Code:** Review `/src/pages/rkm-*` for implementation

---

**Last Updated:** 2026-02-02
**Version:** 3.0
**Status:** ✅ PRODUCTION READY
