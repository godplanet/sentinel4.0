# 🏥 SYSTEM HEALTH & UNIVERSAL SEEDER - QUICK START

## 🎯 PROBLEM SOLVED

**Before:** Empty pages, broken navigation, no visibility into data state
**After:** Complete database health dashboard + One-click Factory Reset button

---

## 📍 WHERE TO FIND IT

**Navigation Path:**
```
Sidebar → SİSTEM & AYARLAR (Settings Icon)
  └─ Sistem Sağlığı [DEV Badge]
```

**Direct URL:**
```
/settings/system-health
```

---

## 🚀 HOW TO USE

### 1. Check Database Health

The System Health page shows a live dashboard with:

**Overall Health Status:**
- ✅ **Saglikli (Healthy):** All tables have data
- ⚠️ **Dikkat (Warning):** Some tables are empty
- 🔴 **Kritik (Critical):** Multiple critical tables are empty

**Table Stats Grid:**
Shows real-time row counts for:
- Denetim Evreni (Audit Universe)
- Risk Kütüphanesi (Risk Library)
- Denetçiler (Auditors/Talent)
- Denetimler (Engagements)
- Bulgular (Findings) ⚠️ CRITICAL
- Çalışma Kağıtları (Workpapers)
- Aksiyon Planları (Action Plans)

**Color Coding:**
- 🟢 Green = Data exists (healthy)
- 🟡 Yellow = Empty but non-critical (warning)
- 🔴 Red = Empty and critical (error)

---

### 2. Factory Reset (NUCLEAR OPTION)

**When to Use:**
- When Bulgu Merkezi is empty (0 findings)
- When test data is corrupted
- When you need a fresh demo environment
- When RLS policies block everything

**What It Does:**
1. **DELETES ALL DATA** from major tables (irreversible!)
2. Seeds 15+ audit findings
3. Seeds 5 auditors (including Sentinel Prime AI)
4. Seeds 3 audit engagements
5. Seeds audit universe hierarchy
6. Seeds risk library (5 risks)
7. Seeds workpapers with test steps

**How to Trigger:**
1. Click the **RED "FACTORY RESET"** button
2. Confirm in the modal: "Eminim, Sil ve Yukle"
3. Watch the progress panel (10-15 seconds)
4. Page auto-reloads when done

---

## 📊 WHAT GETS SEEDED

### Universe Hierarchy
```
Turkiye Bankasi A.S. (HQ)
  ├─ Merkez Subesi (Central Branch)
  └─ Kadikoy Subesi (Kadikoy Branch)
```

### Talent Profiles
- **Ahmet Aslan** - Senior Auditor (Credit Risk)
- **Zeynep Kaya** - IT Auditor (Cybersecurity)
- **Mehmet Yilmaz** - Compliance Auditor (AML/CFT)
- **Ayse Demir** - Audit Manager (Team Lead)
- **Sentinel Prime** - AI Audit Assistant

### Audit Engagements
1. **Kredi Surecligi Denetimi 2026** (Planning)
2. **Siber Guvenlik Denetimi** (Fieldwork) ← ACTIVE
3. **Kara Para Aklama Uyum Denetimi** (Reporting)

### Audit Findings (15 Total)
Examples:
- **Kasa Islemlerinde Cift Anahtar Kurali Ihlali** (CRITICAL)
- **Sifrelenmeyen Musteri Yedekleri** (HIGH)
- **Eksik KYC Dokumantasyonu** (CLOSED)

### Risk Library
- Kredi Risk Yönetimi Zafiyeti
- Siber Güvenlik Açıklari
- Kara Para Aklama Riski
- Operasyonel Süreklilik Riski
- Uyum ve Düzenleme Riski

---

## 🔧 TECHNICAL DETAILS

### Files Created

**1. Universal Seeder Class**
```
src/shared/lib/universal-seeder.ts
```

**Features:**
- Browser-based (uses Supabase client)
- Progress callback for real-time updates
- Sequential execution with error handling
- Table count inspection

**2. System Health Page**
```
src/pages/settings/SystemHealthPage.tsx
```

**Features:**
- Live table count monitoring
- Visual health indicators
- Progress tracking during seeding
- Confirmation modal for safety

---

## 🎓 TESTING WORKFLOW

**Step 1: Navigate to System Health**
```
Sidebar → SİSTEM & AYARLAR → Sistem Sağlığı
```

**Step 2: Check Current State**
- Look at the table stats
- If "Bulgular" shows 0 → RED status

**Step 3: Run Factory Reset**
- Click RED button
- Confirm
- Wait 15 seconds
- Page auto-reloads

**Step 4: Verify Data Loaded**
```
Sidebar → DENETİM OPERASYONU → Bulgu Merkezi
```
- Should now show 15 findings
- Click any row → Opens Finding Studio
- All tabs should work

---

## 🚨 IMPORTANT NOTES

### ⚠️ RLS POLICIES
The seeder works because we added **dev mode anon policies** in:
```
supabase/migrations/*_add_dev_mode_policies_findings_actions.sql
```

These allow anonymous access in dev environment. **MUST BE REMOVED IN PRODUCTION!**

### ⚠️ NAVIGATION LOCK
**CRITICAL RULE:** Never modify `Sidebar.tsx` logic directly.

**The Navigation Source of Truth:**
```
src/shared/config/navigation.ts
```

All new pages MUST be added here, following the 8-pillar structure.

### ⚠️ DATA PERSISTENCE
Factory Reset is **PERMANENT**. It deletes:
- All findings
- All engagements
- All workpapers
- All action plans
- All risk assessments

Use only for demo/dev environments!

---

## 🎯 SUCCESS CRITERIA

After Factory Reset, these should ALL work:

✅ **Bulgu Merkezi** shows 15 findings
✅ Click any finding → Opens Studio with 4 tabs
✅ Workpapers page shows 3 workpapers
✅ Resources → Talent shows 5 auditors
✅ Strategy → Audit Universe shows hierarchy
✅ Execution → Görevlerim shows 3 engagements

---

## 🐛 TROUBLESHOOTING

**Problem: "Still showing 0 findings after reset"**
- Open browser console (F12)
- Look for Supabase errors
- Check Network tab for failed requests
- Verify RLS policies are active

**Problem: "Reset button doesn't appear"**
- The button only shows when health status is WARNING or CRITICAL
- If all tables have data, it won't show (no need to reset)

**Problem: "Progress stuck at 'running'"**
- Check browser console for errors
- May indicate Supabase connection issue
- Refresh page and try again

---

## 📚 RELATED DOCUMENTATION

- `FINDING_STUDIO_PHASE4_QUICK_START.md` - Finding workflow
- `NAVIGATION_QUICK_REF.md` - Navigation structure
- `FINDING_HUB_QUICK_START.md` - Finding Hub usage
- `CONSTITUTION_QUICK_REF.md` - Risk methodology

---

## 🏁 FINAL CHECKLIST

Before reporting "empty system" issues:

- [ ] Opened `/settings/system-health`
- [ ] Checked table counts
- [ ] Ran Factory Reset if needed
- [ ] Verified "Bulgular" count > 0
- [ ] Tested Bulgu Merkezi page
- [ ] Clicked into a finding
- [ ] Confirmed all 4 tabs work

---

## 💡 PRO TIP

**Bookmark this URL for quick access:**
```
http://localhost:5173/settings/system-health
```

Use it anytime the system feels "empty" or broken!

---

**Built by:** Senior DevOps & Fullstack Lead
**Last Updated:** 2026-02-09
**Status:** ✅ Production Ready (Dev Mode)
