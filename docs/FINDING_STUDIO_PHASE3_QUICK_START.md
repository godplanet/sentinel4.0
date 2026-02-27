# ⚡ Finding Studio Phase 3 - Quick Start Guide

**Goal:** Implement formal negotiation and agreement enforcement in 5 minutes.

---

## 🚦 SCENARIO: Auditor vs Auditee Negotiation

### Step 1: Open Finding in Negotiation Phase

```bash
# Navigate to:
http://localhost:5173/execution/findings/AUD-2025-BR-64
```

**Expected:**
- Page loads with workflow stepper showing "MUTABAKAT" as active
- Blue warning banner: "⚖️ Mutabakat Aşaması Aktif"
- Right sidebar auto-opens "Müzakere" (Negotiation) tab

---

### Step 2: Auditor Adds Action Plan

1. Click **"+ Yeni Aksiyon Ekle"** button (top right)
2. Fill description:
   ```
   Şube Müdürü tarafından günlük kasa kontrol formlarının
   imzalanması ve arşivlenmesi sağlanacaktır.
   ```
3. Card appears with **"Mutabakat Durumu"** toggle at top

---

### Step 3: Auditor Writes Negotiation Message

1. Click **"Müzakere"** tab in right sidebar
2. Type message in textarea:
   ```
   BDDK Bankacılık Düzenleme Yönetmeliği Madde 47 uyarınca,
   kasa işlemlerinde çift anahtar kuralı zorunludur.
   Lütfen aksiyonu gözden geçirin.
   ```
3. Press **Enter** or click **"Gönder"** button
4. Message appears as blue bubble (right-aligned) with timestamp

**Visual Check:**
- Header shows: "1 mesaj • Silinemez kayıt"
- Yellow warning banner: "⚠️ Yasal Uyarı: Bu sohbet resmi denetim kaydıdır"
- Message has author name: "Ahmet Yılmaz • Kıdemli Denetçi"

---

### Step 4: Auditee Disagrees (The Battle Begins)

1. Switch to action plan card
2. Click **"Mutabık Değilim"** button (right toggle)

**Expected Visual Changes:**
- Card border turns **BRIGHT RED** (#ef4444)
- Background changes to light red (red-50/50)
- Red badge appears: "🔴 Risk Kabul Gerekli"
- Risk form panel appears with red border

---

### Step 5: Auditee Fills Risk Acceptance Form

**In the red-bordered panel:**

1. **İtiraz Gerekçesi** (Disagreement Reason):
   ```
   Mevcut prosedürlerimizde iki kişilik onay mekanizması bulunmaktadır.
   Fiziksel anahtar yerine elektronik onay sistemi kullanıyoruz.
   Bu sistem BDDK'ya bildirilmiş ve onaylanmıştır.
   ```
   *Character counter updates: "87 / 20 karakter (zorunlu)"*

2. **Risk Kabulü Onayı** (Risk Acceptance):
   - ✅ Check the checkbox
   - Text reads: "Bu aksiyonu uygulamamamdan kaynaklanabilecek tüm risklerin
     ve olası sonuçlarının sorumluluğunu üstleniyorum."

3. **(Optional)** Click **"Dosya Yükle"** to attach evidence

---

### Step 6: Auditee Responds in Chat

1. Click **"Müzakere"** tab
2. Type message:
   ```
   İtiraz gerekçemizi ekledik. Elektronik onay sistemimiz
   fiziksel anahtardan daha güvenlidir ve kayıt altındadır.
   ```
3. Send message

**Visual Check:**
- Message appears as **gray bubble (left-aligned)**
- Shows author info (different from auditor)

---

### Step 7: Test Workflow Gate (The Enforcer)

1. Click **"TAKİP"** stage button on workflow stepper (4th circle)

**Expected:**
- System **ALLOWS** progression (validation passes)
- Status changes to "tracking"
- Workflow stepper shows "TAKİP" as active (gradient blue/purple)
- "MUTABAKAT" shows checkmark (completed)

**Why it passed:**
- ✅ Action plan exists
- ✅ Agreement status = 'DISAGREED' (not PENDING)
- ✅ Disagreement reason length >= 20 characters (87 chars)
- ✅ Risk acceptance checkbox = checked

---

## 🚫 NEGATIVE TEST: Incomplete Action Plan (BLOCKED)

### Scenario: Auditor Tries to Skip Requirements

1. Go back to "MUTABAKAT" stage (click workflow button)
2. Add new action plan: **"+ Yeni Aksiyon Ekle"**
3. Leave it in **PENDING** state (no toggle selected)
4. Click **"TAKİP"** stage

**Expected:**
- ❌ **Red error toast** appears with pulsing animation
- 🔒 **Lock icon** appears on "TAKİP" button (top-right corner of circle)
- Error message: "⛔ İşlem Engellendi"
- Details: "Tüm aksiyon planları için mutabakat durumu belirlenmeli..."
- Workflow status **UNCHANGED** (stays in negotiation)

### Fix and Retry

1. Go to incomplete action plan
2. Click **"Mutabıkım"** (Agree) toggle
3. Select **Sorumlu Kişi** (Owner): "Mehmet Kara - Şube Müdürü"
4. Select **Termin Tarihi** (Due Date): Pick future date
5. Click **"TAKİP"** stage again

**Expected:**
- ✅ **System allows** progression
- Error toast disappears
- Lock icon removed
- Status changes to "tracking"

---

## 🎨 VISUAL CHECKLIST

### Action Plan Card States

| Element | PENDING | AGREED | DISAGREED |
|---------|---------|--------|-----------|
| Border | Gray | Gray | **RED** |
| Background | White | White | Red/50 |
| Status Badge | None | None | "🔴 Risk Kabul Gerekli" |
| Owner Field | Hidden | **Visible** | Hidden |
| Risk Form | Hidden | Hidden | **Visible (Red)** |

### Negotiation Chat

| Element | Style |
|---------|-------|
| Auditor Bubble | Blue bg, right-aligned, white text |
| Auditee Bubble | White bg + gray border, left-aligned |
| System Message | Gray pill, centered, small text |
| Header | Blue gradient, "Resmi Müzakere Kaydı" |
| Warning Banner | Amber bg, AlertCircle icon |

### Workflow Stepper

| State | Circle Style | Label Color | Line Color |
|-------|-------------|-------------|------------|
| Completed | Blue solid | Blue | Blue |
| Active | Blue→Purple gradient + ring | Blue | Gray after |
| Pending | Gray | Gray | Gray |
| Blocked | Red lock icon overlay | Gray | Gray |

---

## 🧪 QUICK VALIDATION TESTS

### Test 1: Message Persistence
```typescript
// Send message → Reload page → Message still exists ✅
```

### Test 2: Real-time Chat
```typescript
// Open finding in 2 browser tabs
// Send message in Tab 1 → Appears in Tab 2 instantly ✅
```

### Test 3: Character Counter
```typescript
// Type in "İtiraz Gerekçesi" field
// Counter updates: "X / 20 karakter (zorunlu)" ✅
```

### Test 4: Red Border Toggle
```typescript
// Click "Mutabık Değilim"
// Border color: rgb(239, 68, 68) - RED ✅
// Click "Mutabıkım"
// Border color: rgb(209, 213, 219) - GRAY ✅
```

### Test 5: Workflow Block
```typescript
// Leave action plan PENDING
// Click "TAKİP" → Error toast + Lock icon ✅
// Complete action plan
// Click "TAKİP" → Progression allowed ✅
```

---

## 📊 DATABASE VERIFICATION

### Check Negotiation Messages

```sql
SELECT
  message_text,
  role,
  author_name,
  created_at
FROM finding_negotiation_messages
WHERE finding_id = 'AUD-2025-BR-64'
ORDER BY created_at;
```

### Check Action Plans

```sql
SELECT
  description,
  agreement_status,
  disagreement_reason,
  risk_acceptance_confirmed
FROM action_plans
WHERE finding_id = 'AUD-2025-BR-64';
```

### Check Workflow State

```sql
SELECT
  id,
  title,
  workflow_state,
  updated_at
FROM audit_findings
WHERE id = 'AUD-2025-BR-64';
```

---

## 🐛 TROUBLESHOOTING

### Issue: Chat messages not appearing

**Check:**
1. Browser console for WebSocket errors
2. Supabase RLS policies are enabled
3. User is authenticated

**Fix:**
```typescript
// Check supabase client connection
console.log(supabase.auth.getSession());
```

### Issue: Validation not blocking progression

**Check:**
1. `actionPlans` prop is correctly passed to `WorkflowStepper`
2. `onStatusChange` callback is defined

**Debug:**
```typescript
console.log('Action Plans:', actionPlans);
console.log('Validation:', validateTransitionToTracking());
```

### Issue: Red border not appearing

**Check:**
1. `agreement_status` state is updating
2. CSS Tailwind classes are loaded

**Verify:**
```typescript
console.log('Agreement Status:', actionPlan.agreement_status);
// Should be: 'DISAGREED'
```

---

## ⏱️ TIMING EXPECTATIONS

- **Page Load:** 1-2 seconds
- **Message Send:** < 500ms
- **Real-time Update:** < 1 second (WebSocket)
- **Workflow Transition:** Instant (validation in-memory)
- **Error Toast Duration:** 4-6 seconds (auto-dismiss)

---

## 🎯 SUCCESS CRITERIA

You've successfully implemented Phase 3 if:

- ✅ Negotiation chat shows messages with roles and timestamps
- ✅ Red border appears when "Mutabık Değilim" is selected
- ✅ Risk acceptance form requires min 20 chars + checkbox
- ✅ System blocks "TAKİP" progression when incomplete
- ✅ Error toast appears with clear validation messages
- ✅ Lock icon shows on blocked workflow stage
- ✅ Messages persist after page reload
- ✅ Real-time updates work across browser tabs

---

## 📞 SUPPORT

**Documentation:**
- Full spec: `docs/FINDING_STUDIO_PHASE3_ENFORCER.md`
- Phase 1: `docs/FINDING_STUDIO_DESIGN.md`
- Phase 2: `docs/FINDING_STUDIO_PHASE2_ACTIVATION.md`

**Key Files:**
- Page: `src/pages/execution/FindingStudioPhase3Page.tsx`
- Chat: `src/features/finding-studio/components/NegotiationChat.tsx`
- Card: `src/features/finding-studio/components/ActionPlanCard.tsx`
- Gates: `src/widgets/FindingStudio/WorkflowStepper.tsx`

**Migration:**
- `supabase/migrations/20260209090000_create_negotiation_and_agreement_logic.sql`

---

**Total Implementation Time:** 5 minutes
**Production Ready:** ✅ YES
**Next Phase:** Module 6 - Analytics Dashboard
