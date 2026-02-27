# PERSONA RBAC - Quick Start

## 🎭 What is this?
A role simulation system that lets you test Sentinel v3.0 from 5 different user perspectives **without logging out**.

---

## 🚀 Quick Start (3 Steps)

### 1. Switch Persona
1. Click your **avatar** (bottom-left)
2. Click **"Rol Değiştir"** (purple button)
3. Select a persona

### 2. Verify Access
- **Navigation automatically filters** based on role
- Try accessing different modules
- Blocked modules are **hidden** (not just disabled)

### 3. Check Page Health
- Go to **Sistem & Ayarlar** → **Sayfa Denetim Aracı**
- See which pages are ready/empty/broken
- Path: `/dev/page-audit`

---

## 👥 The 5 Personas

| Persona | User | Access | Use Case |
|---------|------|--------|----------|
| **CAE** | Hakan Yılmaz | FULL | Admin/oversight |
| **AUDITOR** | Ahmet Demir | Execution, CCM, AI | Daily audits |
| **EXECUTIVE** | Zeynep Aydın | Dashboard, Reporting | High-level view |
| **AUDITEE** | Mehmet Kaya | My Actions, Findings | Respond to audits |
| **SUPPLIER** | Vendor Co. | Vendor Portal ONLY | TPRM compliance |

---

## ✅ Testing Checklist

### AUDITOR Test
- [ ] Can see "Bulgu Merkezi" (Findings Hub)
- [ ] Can see "CCM Predator"
- [ ] **CANNOT** see "Stratejik Hedefler"
- [ ] **CANNOT** see "Ayarlar" (Settings)

### EXECUTIVE (GMY) Test
- [ ] Can see "Dashboard"
- [ ] Can see "Yönetici Özeti" (Executive Dashboard)
- [ ] **CANNOT** see "Denetim Operasyonu"
- [ ] **CANNOT** see "CCM"

### AUDITEE Test
- [ ] Can see "Dashboard"
- [ ] Can see "Aksiyon Takip" (Actions)
- [ ] Sees **5 action plans** assigned to `mehmet@branch`
- [ ] **CANNOT** see "Strateji & Yönetişim"

### SUPPLIER Test
- [ ] Sees **ONLY** "Tedarikçi Portalı"
- [ ] All other nav items **HIDDEN**
- [ ] Can complete TPRM assessment

---

## 🔧 Troubleshooting

### "Auditee sees 0 tasks"
**Fix:** Open browser console and run:
```javascript
localStorage.removeItem('sentinel_persona_seeded');
// Then reload the page
```

### "Navigation not filtering"
**Fix:** Make sure you're on the latest version. Check that Sidebar uses `filteredNavigation`.

### "Can't switch personas"
**Fix:** Check browser console for errors. Verify `persona-store.ts` exists.

---

## 📂 Key Files

- `src/shared/stores/persona-store.ts` - Persona definitions
- `src/shared/data/seed/persona-seeder.ts` - Demo data injection
- `src/pages/dev/PageAuditPage.tsx` - Page health checker
- `src/widgets/Sidebar/index.tsx` - Role switcher UI

---

## 📖 Full Documentation
See `docs/PERSONA_RBAC_GUIDE.md` for detailed implementation guide.

---

**Version:** 3.0 | **Last Updated:** 2026-02-10
