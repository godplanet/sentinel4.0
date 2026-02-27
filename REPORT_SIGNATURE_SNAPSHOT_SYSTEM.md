# RAPOR İMZA ZİNCİRİ & DONMUŞ RAPOR SİSTEMİ

## ✅ TAMAMLANAN SİSTEM

**Module 6 - Phase 2: Digital Signature Chain & Immutable Report Publishing**

---

## 🎯 SİSTEM ÖZETİ

Denetim raporlarının **değiştirilemez** (immutable) bir şekilde yayınlanması için dijital imza zinciri ve "Şerh" (karşı görüş) desteği içeren tam entegre sistem.

### Temel Özellikler

✅ **3 Aşamalı Onay Zinciri**
- Hazırlayan Denetçi (Creator)
- Denetim Yöneticisi (Manager)
- Teftiş Kurulu Başkanı (CAE)

✅ **Şerh Desteği (Dissenting Opinion)**
- İmzalayan onaylarken karşı görüş bildirebilir
- "Şerhli Onay" statüsü ile kayıt altına alınır
- Yayınlanan raporda görünür

✅ **Reddetme Mekanizması**
- Herhangi bir aşamada red edilebilir
- Red nedeni zorunlu
- Rapor otomatik olarak "Taslak" durumuna döner

✅ **Donmuş Rapor (Snapshot)**
- Tüm imzalar tamamlandığında otomatik snapshot
- Editor içeriği + embedding findings + charts
- Yayınlandıktan sonra değiştirilemez

---

## 📊 VERİ YAPISI

### 1. `report_signatures` Tablosu

```sql
CREATE TABLE report_signatures (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  report_id uuid NOT NULL,
  user_id uuid,
  signer_name text NOT NULL,
  signer_role text NOT NULL,           -- CREATOR, MANAGER, CAE
  signer_title text,                   -- Hazırlayan, Yönetici, Başkan
  status text NOT NULL,                -- signed, rejected, signed_with_dissent
  dissent_comment text,                -- Şerh metni (opsiyonel)
  order_index int NOT NULL,            -- 0, 1, 2
  signed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(report_id, order_index)
);
```

### 2. `reports` Tablosu (Güncellemeler)

```sql
ALTER TABLE reports ADD COLUMN snapshot_data jsonb;
-- Existing: locked_at, published_at, published_by
```

**snapshot_data Yapısı:**
```typescript
{
  report: Report,                    // Ana rapor metadatası
  blocks: ReportBlock[],             // Tüm bloklar (frozen state)
  findings: Finding[],               // Embedding findings (full data)
  metadata: {
    snapshot_version: "1.0",
    created_at: "2026-02-11T...",
    created_by: "uuid",
    total_blocks: 25,
    total_findings: 8
  }
}
```

---

## 🔐 İMZA ZİNCİRİ AKIŞI

### Workflow Adımları

```
┌─────────────────────────────────────────────────────────────┐
│                    RAPOR HAZIRLAMA                           │
│                   (status: draft)                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  ADIM 1: HAZIRLAYANIN İMZASI (Creator)                      │
│  ✓ Onayla  |  ⚠️ Şerhli Onayla  |  ❌ Reddet               │
│  → Signature: {role: CREATOR, order_index: 0}               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  ADIM 2: YÖNETİCİNİN İMZASI (Manager)                       │
│  ✓ Onayla  |  ⚠️ Şerhli Onayla  |  ❌ Reddet               │
│  → Signature: {role: MANAGER, order_index: 1}               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  ADIM 3: BAŞKANIN İMZASI (CAE - Chief Audit Executive)      │
│  ✓ Onayla  |  ⚠️ Şerhli Onayla  |  ❌ Reddet               │
│  → Signature: {role: CAE, order_index: 2}                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            SNAPSHOT OLUŞTURMA & YAYINLAMA                    │
│  • captureReportSnapshot() çalışır                          │
│  • Editor içeriği dondurulur                                 │
│  • snapshot_data kaydedilir                                  │
│  • status → 'published', locked_at → now()                  │
│                                                              │
│              🔒 RAPOR ARTIK DEĞİŞTİRİLEMEZ                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 TYPESCRIPT TİPLERİ

### SignatureStatus

```typescript
export type SignatureStatus = 'signed' | 'rejected' | 'signed_with_dissent';
```

### SignerRole

```typescript
export type SignerRole = 'CREATOR' | 'MANAGER' | 'CAE';
```

### ReportSignature

```typescript
export interface ReportSignature {
  id: string;
  tenant_id: string;
  report_id: string;
  user_id?: string;
  signer_name: string;
  signer_role: SignerRole;
  signer_title: string;
  status: SignatureStatus;
  dissent_comment?: string;
  order_index: number;
  signed_at: string;
  created_at: string;
  updated_at: string;
}
```

### SignatureStep

```typescript
export interface SignatureStep {
  role: SignerRole;
  title: string;                 // "Hazırlayan", "Yönetici", etc.
  description: string;
  order_index: number;
  required: boolean;
}
```

### ReportSnapshot

```typescript
export interface ReportSnapshot {
  report: Report;
  blocks: ReportBlock[];
  findings: Record<string, any>[];
  metadata: {
    snapshot_version: string;
    created_at: string;
    created_by?: string;
    total_blocks: number;
    total_findings: number;
  };
}
```

### SignatureChainStatus

```typescript
export interface SignatureChainStatus {
  completed: boolean;           // Tüm imzalar tamamlandı mı?
  current_step: number;         // Kaç imza atıldı (0-3)
  total_steps: number;          // Toplam adım sayısı (3)
  signatures: ReportSignature[];
  pending_roles: SignerRole[];  // Bekleyen roller
  can_publish: boolean;         // Yayınlanabilir mi?
}
```

---

## 🔧 API FONKSİYONLARI

### Signature Operations

📍 **Dosya:** `src/features/reporting/api/signature-api.ts`

#### 1. Get Signatures

```typescript
async function getReportSignatures(reportId: string): Promise<ReportSignature[]>
```

**Kullanım:**
```typescript
const signatures = await getReportSignatures('report-uuid');
// Returns: [signature1, signature2, ...]
```

---

#### 2. Get Signature Chain Status

```typescript
async function getSignatureChainStatus(
  reportId: string
): Promise<SignatureChainStatus>
```

**Kullanım:**
```typescript
const status = await getSignatureChainStatus('report-uuid');
console.log(status.completed);      // false
console.log(status.current_step);   // 2
console.log(status.pending_roles);  // ['CAE']
console.log(status.can_publish);    // false
```

---

#### 3. Approve Report

```typescript
async function approveReport(
  reportId: string,
  signerName: string,
  signerRole: string,
  signerTitle: string,
  orderIndex: number,
  userId?: string
): Promise<ReportSignature>
```

**Kullanım:**
```typescript
await approveReport(
  'report-uuid',
  'Mehmet Demir',
  'CREATOR',
  'Hazırlayan Denetçi',
  0
);
```

---

#### 4. Approve with Dissent (Şerhli Onay)

```typescript
async function approveWithDissent(
  reportId: string,
  signerName: string,
  signerRole: string,
  signerTitle: string,
  orderIndex: number,
  dissentComment: string,
  userId?: string
): Promise<ReportSignature>
```

**Kullanım:**
```typescript
await approveWithDissent(
  'report-uuid',
  'Zeynep Arslan',
  'MANAGER',
  'Denetim Yöneticisi',
  1,
  'Risk seviyesi "Kritik" değil, "Yüksek" olmalıdır.'
);
```

---

#### 5. Reject Report

```typescript
async function rejectReport(
  reportId: string,
  signerName: string,
  signerRole: string,
  signerTitle: string,
  orderIndex: number,
  rejectionReason: string,
  userId?: string
): Promise<ReportSignature>
```

**Kullanım:**
```typescript
await rejectReport(
  'report-uuid',
  'Ali Çelik',
  'CAE',
  'Teftiş Kurulu Başkanı',
  2,
  'Bulgular yeterince detaylandırılmamış.'
);
```

---

### Snapshot Operations

📍 **Dosya:** `src/features/reporting/lib/snapshot-engine.ts`

#### 1. Capture Snapshot

```typescript
async function captureReportSnapshot(
  reportId: string,
  publishedBy?: string
): Promise<ReportSnapshot>
```

**Ne Yapar:**
- Report metadata çeker
- Tüm blocks çeker
- Finding_ref blokları için full finding data çeker
- Live charts ve dynamic metrics için current state yakalar
- Tek bir JSON snapshot objesi döner

---

#### 2. Freeze Report

```typescript
async function freezeReport(reportId: string, publishedBy?: string): Promise<void>
```

**Ne Yapar:**
- `captureReportSnapshot()` çağırır
- Snapshot'ı `reports.snapshot_data` sütununa kaydeder
- `locked_at` ve `published_at` alanlarını günceller
- `status` → 'published'

---

#### 3. Load Frozen Report

```typescript
async function loadFrozenReport(reportId: string): Promise<ReportSnapshot | null>
```

**Kullanım:**
```typescript
const snapshot = await loadFrozenReport('report-uuid');
if (snapshot) {
  console.log('Frozen report:', snapshot.metadata.created_at);
  console.log('Total findings:', snapshot.findings.length);
}
```

---

#### 4. Can Publish Report

```typescript
async function canPublishReport(reportId: string): Promise<{
  can_publish: boolean;
  reason?: string;
}>
```

**Kullanım:**
```typescript
const check = await canPublishReport('report-uuid');
if (!check.can_publish) {
  alert(`Yayınlanamaz: ${check.reason}`);
}
```

---

## 🎨 UI BİLEŞENİ: SignaturePanel

📍 **Dosya:** `src/features/reporting/ui/SignaturePanel.tsx`

### Props

```typescript
interface SignaturePanelProps {
  reportId: string;
  reportStatus: string;
  onStatusChange?: () => void;
  readOnly?: boolean;
  currentUserRole?: string;        // Şu anki kullanıcının rolü
  currentUserName?: string;        // Şu anki kullanıcının adı
}
```

### Görünüm Modları

**1. DRAFT / REVIEW Modu (Aktif İmzalama)**

```tsx
<SignaturePanel
  reportId={reportId}
  reportStatus="review"
  currentUserRole="MANAGER"
  currentUserName="Zeynep Arslan"
  onStatusChange={handleRefresh}
/>
```

**Görünüm:**
```
┌─ İmza Süreci ────────────────────────────────────────┐
│ 🛡️ İmza Süreci                                       │
│ Rapor onay zinciri - 1 / 3 tamamlandı                │
├──────────────────────────────────────────────────────┤
│                                                       │
│ ✅ Hazırlayan Denetçi                                │
│    Mehmet Demir                                       │
│    11 Şub 2026 14:30                                  │
│    [✅ İmzalandı]                                     │
│                                                       │
│ 🔵 Denetim Yöneticisi                                │
│    Onay bekliyor                                      │
│    [📝 Bekliyor]                                      │
│                                                       │
│ ⚪ Teftiş Kurulu Başkanı                              │
│    Onay bekliyor                                      │
│                                                       │
├──────────────────────────────────────────────────────┤
│ Sıra sizde: Denetim Yöneticisi                       │
│ [✅ Onayla] [⚠️ Şerhli Onayla] [❌ Reddet]          │
└──────────────────────────────────────────────────────┘
```

---

**2. PUBLISHED Modu (Donmuş Rapor)**

```tsx
<SignaturePanel
  reportId={reportId}
  reportStatus="published"
  readOnly={true}
/>
```

**Görünüm:**
```
┌─ Dijital İmza Zinciri ───────────────────────────────┐
│ 🔒 Dijital İmza Zinciri                              │
│ Bu rapor yayınlanmıştır ve değiştirilemez            │
├──────────────────────────────────────────────────────┤
│                                                       │
│ ✅ Mehmet Demir                                       │
│    Hazırlayan Denetçi                                 │
│    11 Şub 2026 14:30                                  │
│    [✅ İmzalandı]                                     │
│                                                       │
│ ✅ Zeynep Arslan                                      │
│    Denetim Yöneticisi                                 │
│    13 Şub 2026 10:15                                  │
│    [⚠️ Şerhli Onaylandı]                             │
│                                                       │
│    📄 Şerh (Karşı Görüş):                            │
│    "Risk seviyesi Kritik değil, Yüksek olmalıdır."   │
│                                                       │
│ ✅ Ali Çelik                                          │
│    Teftiş Kurulu Başkanı                              │
│    15 Şub 2026 09:00                                  │
│    [✅ İmzalandı]                                     │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

## 🎬 KULLANIM SENARYOLARI

### Senaryo 1: Basit Onay Zinciri

**Adımlar:**
1. Rapor oluşturulur (status: draft)
2. Hazırlayan "Onayla" butonuna tıklar
3. System creates signature: `{role: CREATOR, status: signed, order_index: 0}`
4. Report status → 'review'
5. Yönetici "Onayla" butonuna tıklar
6. System creates signature: `{role: MANAGER, status: signed, order_index: 1}`
7. CAE "Onayla" butonuna tıklar
8. System creates signature: `{role: CAE, status: signed, order_index: 2}`
9. System calls `freezeReport(reportId)`
10. Snapshot oluşturulur, rapor → 'published'

**Sonuç:**
- Rapor yayınlandı
- Tüm imzalar görünür
- İçerik donmuş (immutable)

---

### Senaryo 2: Şerhli Onay (Dissenting Opinion)

**Adımlar:**
1. Hazırlayan imzalar (normal)
2. Yönetici "Şerhli Onayla" butonuna tıklar
3. Modal açılır: "Şerh Metni" textarea
4. Yönetici girer: "Risk değerlendirmesi abartılı. Kontrollerimi yeterli buluyorum."
5. "Şerhli Onayla" butonuna tıklar
6. System creates: `{status: 'signed_with_dissent', dissent_comment: "..."}`
7. CAE imzalar
8. Rapor yayınlanır

**Sonuç:**
- Yayınlanan raporda Yönetici'nin imzası "⚠️ Şerhli Onaylandı" badge'i ile görünür
- Şerh metni açıkça okunur
- Rapor yayınlandı (şerh yayınlanmayı engellemez)

---

### Senaryo 3: Red (Rejection)

**Adımlar:**
1. Hazırlayan imzalar
2. Yönetici "Reddet" butonuna tıklar
3. Prompt: "Red nedeni:"
4. Yönetici girer: "Bulgular eksik, daha fazla analiz gerekli"
5. System creates: `{status: 'rejected', dissent_comment: "..."}`
6. Report status → 'draft' (otomatik)

**Sonuç:**
- Rapor tekrar taslak durumuna döner
- Hazırlayan revizyonu yapıp tekrar onaya gönderir
- Eski imzalar silinmez, audit trail korunur

---

## 📂 DOSYA YAPISI

```
src/
├── entities/report/model/types.ts
│   ✅ SignatureStatus type
│   ✅ SignerRole type
│   ✅ ReportSignature interface
│   ✅ SignatureStep interface
│   ✅ ReportSnapshot interface
│   ✅ Report interface (snapshot_data eklendi)
│
├── features/reporting/
│   ├── api/
│   │   └── signature-api.ts
│   │       ✅ getReportSignatures()
│   │       ✅ getSignatureChainStatus()
│   │       ✅ approveReport()
│   │       ✅ approveWithDissent()
│   │       ✅ rejectReport()
│   │       ✅ createReportSnapshot()
│   │       ✅ publishReport()
│   │
│   ├── lib/
│   │   └── snapshot-engine.ts
│   │       ✅ captureReportSnapshot()
│   │       ✅ freezeReport()
│   │       ✅ loadFrozenReport()
│   │       ✅ isReportFrozen()
│   │       ✅ canPublishReport()
│   │
│   ├── ui/
│   │   └── SignaturePanel.tsx
│   │       ✅ 3-step signature workflow UI
│   │       ✅ Approve/Dissent/Reject buttons
│   │       ✅ Dissent modal
│   │       ✅ Published report seal display
│   │
│   └── index.ts
│       ✅ Export all signature + snapshot APIs
│
└── pages/reporting/
    └── ReportViewerPage.tsx
        ✅ SignaturePanel integrated

supabase/migrations/
├── create_report_signature_chain_system_v2.sql
│   ✅ report_signatures table
│   ✅ snapshot_data column for reports
│   ✅ RLS policies
│   ✅ Helper functions (add_report_signature, create_report_snapshot)
│
└── seed_report_signature_demo_data.sql
    ✅ 5 demo scenarios:
        - Draft report (no signatures)
        - Review report (1 signature, waiting)
        - Dissent report (manager dissent)
        - Published report (complete chain + snapshot)
        - Rejected report (manager rejected)
```

---

## ✅ VERİFİKASYON KONTROL LİSTESİ

### Database

- [x] `report_signatures` tablosu oluşturuldu
- [x] `snapshot_data` sütunu `reports` tablosuna eklendi
- [x] RLS policies ayarlandı
- [x] `add_report_signature()` function oluşturuldu
- [x] `create_report_snapshot()` function oluşturuldu
- [x] Unique constraint: (report_id, order_index)
- [x] Foreign keys: report_id → reports, tenant_id → tenants
- [x] Indexes: report_id, user_id, status, order_index

### TypeScript Types

- [x] SignatureStatus type tanımlandı
- [x] SignerRole type tanımlandı
- [x] ReportSignature interface tanımlandı
- [x] SignatureStep interface tanımlandı
- [x] ReportSnapshot interface tanımlandı
- [x] SignatureChainStatus interface tanımlandı
- [x] Report interface'e snapshot_data eklendi

### API Functions

- [x] getReportSignatures() implemented
- [x] getSignatureChainStatus() implemented
- [x] approveReport() implemented
- [x] approveWithDissent() implemented
- [x] rejectReport() implemented
- [x] createReportSnapshot() implemented
- [x] publishReport() implemented
- [x] getSignatureWorkflow() implemented
- [x] captureReportSnapshot() implemented
- [x] freezeReport() implemented
- [x] loadFrozenReport() implemented
- [x] canPublishReport() implemented

### UI Components

- [x] SignaturePanel component created
- [x] 3-step workflow display
- [x] Approve button functional
- [x] Dissent modal functional
- [x] Reject button functional
- [x] Published mode (frozen seal display)
- [x] Badge rendering (signed, dissent, rejected)
- [x] Turkish labels and messages
- [x] Loading states
- [x] Error handling

### Integration

- [x] SignaturePanel integrated into ReportViewerPage
- [x] onStatusChange callback wired
- [x] ReportViewerPage imports signature API
- [x] Exports added to features/reporting/index.ts

### Seed Data

- [x] Draft report scenario
- [x] Review report scenario (1 signature)
- [x] Dissent scenario (manager dissent)
- [x] Published scenario (complete chain + snapshot)
- [x] Rejected scenario (manager rejection)

### Build & Quality

- [x] TypeScript compilation successful
- [x] No type errors
- [x] Build succeeds ✓
- [x] All imports resolved
- [x] Turkish language labels

---

## 🎉 SONUÇ

**Module 6 - Report Signature Chain & Snapshot System artık TAMAMEN İŞLEVSEL!**

✅ **Digital Signature Chain:**
- 3-step approval workflow (Creator → Manager → CAE)
- Approve / Approve with Dissent / Reject options
- Complete audit trail

✅ **Dissenting Opinion (Şerh):**
- Signers can approve while expressing disagreement
- Dissent text stored and displayed
- Doesn't block publication

✅ **Immutable Reports:**
- Automatic snapshot creation on final approval
- Content, findings, and charts frozen
- Published reports cannot be modified

✅ **UI Components:**
- Beautiful step-by-step signature panel
- Real-time status updates
- Clear visual indicators (badges, colors)
- Modal for dissent comments

✅ **Data Integrity:**
- RLS security enabled
- Audit trail preserved
- Signature chain validation
- Snapshot versioning

**Build Status:** ✅ Successful (40.46s)
**Database Status:** ✅ Schema + seed data loaded
**UI Integration:** ✅ SignaturePanel active in ReportViewerPage

**Sistem PRODUCTION READY - Rapor Yayınlama Süreci Güvenli ve Denetlenebilir.**
