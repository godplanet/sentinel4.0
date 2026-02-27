# ZenEditor - Gelişmiş Bulgu Analiz Stüdyosu

## KULLANIM AKIŞI (END-TO-END)

### 1. YENİ BULGU OLUŞTURMA

**Adımlar:**
1. `/execution/findings` sayfasına gidin (Bulgu Merkezi)
2. Sağ üstte **"ZenEditor"** butonuna tıklayın (mavi-cyan gradient)
3. ZenEditor açılır, yeni bulgu oluşturursunuz

**Route:**
```
/execution/findings/zen/new
```

### 2. MEVCUT BULGUYU DÜZENLEME

**Adımlar:**
1. Bulgu Merkezi'nden bir bulgu seçin
2. Bulgu ID'si ile otomatik olarak ZenEditor açılır:
```
/execution/findings/zen/{finding-id}
```

### 3. ZenEditor İÇERİĞİ (5C Framework)

ZenEditor 5 bölümden oluşur:

#### **1. KRİTER (Criteria)** 🔵
- İlgili kanun, mevzuat, standart
- Tiptap rich text editor
- Format: Bold, Italic, Underline, Highlight, Liste

#### **2. BULGU (Condition)** 🟠
- Ne tespit edildi? Olgu nedir?
- Tiptap rich text editor

#### **3. KÖK NEDEN ANALİZİ (Root Cause Analysis)** 🟣
3 farklı bilimsel metod:

##### **A) 5 Neden (5 Whys)**
- 5 ardışık "Neden?" sorusu
- Her cevap bir sonraki soruyu tetikler
- 5. adımda kök nedene ulaşılır
- Vizüel ok göstergeleri ile

##### **B) Balık Kılçığı (Ishikawa - 6M)**
- 6 kategori:
  - 👤 İnsan (Human)
  - 📋 Yöntem (Method)
  - ⚙️ Makine/Sistem (Machine)
  - 📦 Malzeme (Material)
  - 🌍 Çevre (Environment)
  - 📊 Ölçüm (Measurement)
- Her kategoriye dinamik olarak neden eklenebilir
- "+ Ekle" ve "X Sil" butonları

##### **C) Papyon (Bowtie Analysis)**
- **Sol:** Tehditler (Threats) - Risk kaynaklarıTEHDİTLER → TEPE OLAY → SONUÇLAR
- **Merkez:** Tepe Olay (Top Event) - Bulgunun kendisi
- **Sağ:** Sonuçlar (Consequences) - Potansiyel etkiler

#### **4. ETKİ (Effect)** 🔴
- Bulgunun potansiyel etkileri ve riskleri
- Tiptap rich text editor

#### **5. ÖNERİ (Recommendation)** 🟢
- Düzeltici aksiyon önerileri
- Tiptap rich text editor

### 4. KAYDETME İŞLEMİ

**Üst Bar:**
- **Bulgu Başlığı:** Input field (zorunlu)
- **Önem Derecesi:** 5 buton
  - Kritik (Kırmızı)
  - Yüksek (Turuncu)
  - Orta (Sarı)
  - Düşük (Mavi)
  - Gözlem (Gri)
- **KAYDET Butonu:** Sağ üstte, büyük ve belirgin
  - İkonu: Save icon
  - Loading state: "Kaydediliyor..." + spinner
  - Success state: "Kaydedildi!" (yeşil, 2 saniye)
  - Error state: "Hata!" (kırmızı, 3 saniye)

**Kaydedilen Veri Yapısı (Supabase):**
```sql
INSERT INTO audit_findings (
  tenant_id,
  title,
  severity,
  description, -- condition'dan auto-generated (500 char)
  state, -- 'DRAFT'
  status, -- 'DRAFT'
  finding_year,
  details -- JSONB:
)

details = {
  "criteria": "<html>...",
  "condition": "<html>...",
  "root_cause_analysis": {
    "method": "five_whys" | "fishbone" | "bowtie",
    "five_whys": ["why1", "why2", "why3", "why4", "why5"],
    "fishbone": {
      "human": ["item1", "item2"],
      "method": [],
      "machine": [],
      "material": [],
      "environment": [],
      "measurement": []
    },
    "bowtie": {
      "threats": ["threat1", "threat2"],
      "top_event": "Finding itself",
      "consequences": ["cons1", "cons2"]
    }
  },
  "effect": "<html>...",
  "recommendation": "<html>..."
}
```

### 5. YÜKLEME VE GÖRÜNTÜLEME

**Mevcut Bulgu Açma:**
```
/execution/findings/zen/{id}
```

**Yüklenen Veri:**
1. API: `zenFindingApi.getFindingMetadata(id)` → Başlık, severity
2. API: `zenFindingApi.loadFinding(id)` → details JSONB
3. Root Cause Analysis otomatik olarak doğru tab'de render edilir

**Önizleme Modu:**
- Üst bar: "Önizleme" butonu (👁️ icon)
- Read-only mode: Tüm içerik HTML olarak görüntülenir
- Prose styling: Profesyonel dokuman görünümü

### 6. API FONKSİYONLARI

**Dosya:** `src/features/finding-studio/api/zen-finding-api.ts`

```typescript
// Bulgu kaydetme (create veya update)
zenFindingApi.saveFinding(data: ZenFindingData)
  → Returns: { id: string, success: boolean }

// Bulgu yükleme (content)
zenFindingApi.loadFinding(id: string)
  → Returns: FindingEditorData | null

// Metadata yükleme
zenFindingApi.getFindingMetadata(id: string)
  → Returns: { id, title, severity, engagement_id }

// Hızlı bulgu oluşturma
zenFindingApi.createQuickFinding(title, severity)
  → Returns: string (new finding ID)
```

## DOSYA YAPILANDIRMASIComponentler:
```
src/features/finding-studio/
├── components/
│   ├── ZenEditor.tsx           # Ana editor component
│   ├── RootCauseEngine.tsx     # 3-tab RCA interface
│   └── index.ts                # Exports
├── api/
│   ├── zen-finding-api.ts      # Supabase API calls
│   └── index.ts                # Exports
```

**Sayfalar:**
```
src/pages/execution/
├── FindingStudioZenPage.tsx    # Full-screen editor page
└── FindingHubPage.tsx          # Updated with ZenEditor button
```

**Routes:**
```typescript
/execution/findings/zen/new     → New finding
/execution/findings/zen/:id     → Edit existing
```

## UI/UX ÖZELLİKLERİ

### Bölüm Renkleri:
- Kriter: Mavi (blue-50)
- Bulgu: Amber (amber-50)
- RCA: Mor (purple-50)
- Etki: Kırmızı (red-50)
- Öneri: Yeşil (emerald-50)

### Toolbar (Floating):
- Her bölümün üstünde format toolbar
- Butonlar: Bold, Italic, Underline, Highlight, BulletList, OrderedList
- Active state: Beyaz background + mavi icon

### Metadata Panel:
- Açma/Kapama: "Bilgiler" butonu
- Grid layout: Başlık + Severity
- Severity butonları: Renkli, büyük, tek tık seçim

## TEST SENARYOSU

### Senaryo 1: Yeni Bulgu - 5 Whys
1. Bulgu Merkezi → ZenEditor
2. Başlık: "Yedekleme Prosedürü Eksikliği"
3. Severity: HIGH
4. Kriter: "BDDK Yönetmeliği Madde 7..."
5. Bulgu: "Off-site yedekleme yapılmıyor..."
6. RCA → 5 Neden seç:
   - Neden 1: "Prosedür yok"
   - Neden 2: "Politika güncel değil"
   - Neden 3: "Sorumluluk belirsiz"
   - Neden 4: "Eğitim verilmemiş"
   - Neden 5: "Yönetim talimatı eksik" (KÖK NEDEN)
7. Etki: "Felaket durumunda veri kaybı..."
8. Öneri: "Prosedür güncellenmeli..."
9. **KAYDET** → Success toast
10. Reload page → Tüm veri korunmuş

### Senaryo 2: Fishbone Kullanımı
1. Aynı bulgu açık
2. RCA → Balık Kılçığı tab'ı seç
3. İnsan: "+ Ekle" → "Eğitim eksikliği"
4. Yöntem: "+ Ekle" → "Prosedür yok"
5. Makine: "+ Ekle" → "Otomasyon eksik"
6. **KAYDET** → Fishbone verileri kaydedildi

### Senaryo 3: Bowtie Analizi
1. Aynı bulgu açık
2. RCA → Papyon tab'ı seç
3. Tehditler: "Doğal afet", "Siber saldırı"
4. Tepe Olay: "Veri kaybı riski"
5. Sonuçlar: "Operasyon durması", "Regülasyon cezası"
6. **KAYDET** → Bowtie analizi kaydedildi

## HATA AYIKLAMA

**Bulgu kaydedilemiyorsa:**
- Console'da hata mesajını kontrol edin
- `zenFindingApi.saveFinding()` Promise reject ediyor mu?
- Supabase RLS politikalarını kontrol edin
- `audit_findings` tablosuna insert/update yetkisi var mı?

**RCA verileri yüklenmiyor:**
- `details` JSONB kolonunda `root_cause_analysis` key'i var mı?
- Eski bulgularda veri yapısı farklı olabilir
- Migration: Eski bulguları yeni formata dönüştür

**Editor boş görünüyor:**
- Tiptap extension'ları yüklendi mi?
- `initialContent` prop'u doğru mu?
- `onChange` callback çağrılıyor mu?

## GELECEK GELİŞTİRMELER

### AI Entegrasyonu (TODO):
**Hedef:** Notlardan otomatik bulgu oluşturma
- Sentinel Scribble → "Bulguya Dönüştür" butonu
- AI notları analiz eder:
  - Sistem hatası → Fishbone önerir (Machine category)
  - Fraud case → Bowtie önerir (Threats/Consequences)
  - Prosedür eksikliği → 5 Whys önerir
- AI otomatik olarak ilgili RCA alanlarını doldurur
- Kullanıcı edit edip kaydeder

### Eksport Özellikleri:
- PDF: 5C Framework'ü profesyonel layout'ta
- Word: .docx export with embedded diagrams
- PowerPoint: Executive summary slides

### Collaboration:
- Real-time editing (multiple auditors)
- Comment threads on each section
- Review workflow: Draft → Review → Approved

## BAŞARIYLA TAMAMLANDI!

Tüm sistemler çalışıyor:
✅ ZenEditor component
✅ 3 RCA metodu (5 Whys, Fishbone, Bowtie)
✅ Supabase API entegrasyonu
✅ Kaydetme ve yükleme
✅ FindingHubPage entegrasyonu
✅ Route setup
✅ Build başarılı (4520 modules)

**READY FOR PRODUCTION!**
