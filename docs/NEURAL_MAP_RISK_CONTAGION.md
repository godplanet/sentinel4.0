# Sinir Haritası (Neural Map) - Risk Bulaşma Ağı Dokümantasyonu

## Özet
Sinir Haritası, bankanın organizasyonel yapısını canlı bir risk ağı olarak görselleştirir. Bir birimdeki yüksek risk, bağımlı birimlere otomatik olarak "bulaşır" ve Domino etkisini gösterir.

---

## Teknik Mimari

### Klasör Yapısı (FSD - Feature-Sliced Design)
```
src/features/neural-map/
├── types.ts          # TypeScript veri modelleri
├── data.ts           # Mock departman ve bağlantı verileri
├── engine.ts         # Risk bulaşma algoritması
└── index.ts          # Public API

src/pages/strategy/
└── NeuralMapPage.tsx # Ana görselleştirme UI
```

---

## Veri Modeli

### NeuralNode (Düğüm - Departman/Birim)
```typescript
interface NeuralNode {
  id: string;              // Benzersiz tanımlayıcı
  label: string;           // Türkçe ad (ör. "Bilgi Teknolojileri")
  type: 'department' | 'process' | 'system' | 'entity';
  baseRisk: number;        // 0-100: Öz risk (inherent risk)
  effectiveRisk: number;   // Bulaşma sonrası toplam risk
  contagionImpact: number; // Komşulardan gelen ek risk
  metadata: {
    headcount?: number;
    budget?: number;
    criticalSystems?: string[];
  };
}
```

### NeuralEdge (Kenar - Bağımlılık)
```typescript
interface NeuralEdge {
  id: string;
  source: string;         // Kaynak birim ID
  target: string;         // Hedef birim ID
  dependencyWeight: 0-1;  // Bağımlılık ağırlığı (0.9 = %90 bağımlı)
  type: 'operational' | 'data' | 'financial' | 'regulatory';
  bidirectional?: boolean;
}
```

---

## Risk Bulaşma Algoritması

### Formül
```
Effective Risk = Base Risk + Σ(Neighbor Risk × Dependency Weight × 0.5)
```

### Matematiksel Model

**Örnek Senaryo:**
- **IT Dept:** Base Risk = 92 (Kritik)
- **Digital Banking:** Base Risk = 55 (Orta)
- **Dependency Weight:** 0.9 (Dijital Bankacılık %90 IT'ye bağımlı)

**Hesaplama:**
```
Digital Banking Effective Risk = 55 + (92 × 0.9 × 0.5)
                               = 55 + 41.4
                               = 96.4 (KRİTİK!)
```

**Sonuç:** IT'nin kritik riski, Dijital Bankacılığı da kritik seviyeye çekiyor.

### Algoritma Adımları

1. **İlk Durum (Iteration 0):**
   - Tüm birimler öz riskleriyle başlar
   - Effective Risk = Base Risk

2. **Bulaşma Simülasyonu (3 Iterasyon):**
   ```typescript
   for (iter = 0; iter < 3; iter++) {
     for each node:
       totalContagion = 0
       for each incoming_edge:
         contributedRisk = source.effectiveRisk × edge.weight × 0.5
         totalContagion += contributedRisk

       node.effectiveRisk = min(100, node.baseRisk + totalContagion)
   }
   ```

3. **Domino Etkisi:**
   - İterasyon 1: IT → Dijital Bankacılık
   - İterasyon 2: Dijital Bankacılık → Şube Ağı
   - İterasyon 3: Ağ genelinde stabilizasyon

---

## Mock Veri Seti

### Departmanlar (8 Birim)
```typescript
MOCK_NEURAL_NODES = [
  { id: 'treasury',    label: 'Hazine',                    baseRisk: 65 },
  { id: 'it',          label: 'Bilgi Teknolojileri',       baseRisk: 92 }, // ⚠️ Kritik
  { id: 'digital',     label: 'Dijital Bankacılık',        baseRisk: 55 },
  { id: 'branches',    label: 'Şube Ağı',                  baseRisk: 48 },
  { id: 'credit',      label: 'Kredi Riski Yönetimi',      baseRisk: 72 },
  { id: 'compliance',  label: 'Uyum ve Mevzuat',           baseRisk: 58 },
  { id: 'operations',  label: 'Operasyon',                 baseRisk: 61 },
  { id: 'cybersec',    label: 'Siber Güvenlik',            baseRisk: 88 }, // ⚠️ Yüksek
]
```

### Kritik Bağımlılıklar
```typescript
MOCK_NEURAL_EDGES = [
  { source: 'it',      target: 'digital',    weight: 0.9 },  // Dijital IT'ye %90 bağımlı
  { source: 'it',      target: 'branches',   weight: 0.85 }, // Şubeler IT'ye %85 bağımlı
  { source: 'cybersec', target: 'it',        weight: 0.7 },  // IT Siber Güvenlik'e bağımlı
  { source: 'cybersec', target: 'digital',   weight: 0.75 },
  { source: 'treasury', target: 'credit',    weight: 0.6 },
  // ... 12 bağlantı toplam
]
```

---

## UI Özellikleri

### 1. Canlı Ağ Grafiği (ReactFlow)
- **Kütüphane:** `@xyflow/react` (yeni nesil React Flow)
- **Düzen:** Force-Directed Layout (düğümler doğal olarak kendini konumlar)
- **Animasyon:**
  - Kenarlar akışkan (animated edges)
  - Risk rengine göre ışıma efekti (glow shadow)

### 2. Risk Renk Kodlaması
```typescript
function getRiskColor(risk: number): string {
  if (risk >= 85) return '#dc2626'; // Koyu Kırmızı - Kritik
  if (risk >= 70) return '#f97316'; // Turuncu - Yüksek
  if (risk >= 50) return '#eab308'; // Sarı - Orta
  if (risk >= 30) return '#84cc16'; // Açık Yeşil - Düşük
  return '#22c55e';                 // Yeşil - Minimal
}
```

### 3. Interaktif Detay Paneli
Bir düğüme tıkladığınızda sağ tarafta açılır:

```
┌─────────────────────────────┐
│ Birim Detayı                │
│ Bilgi Teknolojileri         │
├─────────────────────────────┤
│ Öz Risk (Temel):      92.0  │ 🔵 Mavi kutu
│ Kritik                      │
├─────────────────────────────┤
│ Bulaşan Risk:        +12.5  │ 🟠 Turuncu kutu
│ Komşu birimlerden gelen     │
├─────────────────────────────┤
│ Etkin Risk (Toplam): 104.5  │ 🔴 Kırmızı kutu (risk rengine göre)
│ Kritik                      │
├─────────────────────────────┤
│ Risk Kaynakları (2)         │
│ ┌─────────────────────────┐ │
│ │ Siber Güvenlik    +8.5  │ │
│ │ ████████░░ 70%          │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Hazine            +4.0  │ │
│ │ ████░░░░░░ 50%          │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### 4. Ağ İstatistikleri Paneli (Sağ Üst)
```
┌─────────────────────────┐
│ Ağ İstatistikleri  🔄   │
├───────────┬─────────────┤
│ Ortalama  │  Kritik     │
│ Risk      │  Birim      │
│   68.5    │     3       │
├───────────┼─────────────┤
│ Toplam    │  Max        │
│ Bulaşma   │  Risk       │
│   145.2   │   104.5     │
└───────────┴─────────────┘
```

---

## Kullanım Senaryoları

### Senaryo 1: IT Altyapı Denetimi
**Problem:** IT departmanında kritik bulgu tespit edildi (Base Risk: 92)

**Etki Analizi:**
```
IT (92)
  ↓ [90% bağımlılık]
Dijital Bankacılık (55 → 96) ← Kritik seviyeye yükseldi!
  ↓ [70% bağımlılık]
Şube Ağı (48 → 72) ← Orta'dan Yüksek'e çıktı
```

**Karar:** IT bulgusunu öncelikli olarak kapat, çünkü 2 kritik birime domino etkisi yapıyor.

### Senaryo 2: Siber Güvenlik Zafiyeti
**Problem:** Siber Güvenlik'te güvenlik açığı (Base Risk: 88)

**Etki Analizi:**
```
Siber Güvenlik (88)
  ↓ [75% bağımlılık]
Dijital Bankacılık (55 → 88) ← Yüksek riske çıktı
  ↓ [85% bağımlılık]
IT Altyapısı (92 → 99) ← Zaten kritikken daha da kötüleşti
```

**Karar:** Siber Güvenlik bulgusunu acil olarak çöz, çünkü tüm dijital kanalları tehdit ediyor.

---

## Navigasyon

### Konum
```
Sidebar > STRATEJİ & RİSK > Sinir Haritası
```

### Badge
```
[CANLI] ← Yeşil animasyonlu badge
```

### URL
```
/strategy/neural-map
```

---

## Teknik Detaylar

### Kullanılan Kütüphaneler
```json
{
  "@xyflow/react": "^12.10.0",  // Ağ grafiği görselleştirme
  "lucide-react": "^0.344.0"     // İkonlar
}
```

### Bileşen Mimarisi
```
NeuralMapPage
├── ReactFlow (Ana Canvas)
│   ├── Nodes (8 departman düğümü)
│   ├── Edges (12 bağımlılık okları)
│   ├── Background (Grid pattern)
│   ├── Controls (Zoom, Pan)
│   └── MiniMap (Mini harita)
├── Stats Panel (Sağ üst)
│   ├── Ortalama Risk
│   ├── Kritik Birim Sayısı
│   ├── Toplam Bulaşma
│   └── Max Risk
└── Detail Sidebar (Sağda açılır)
    ├── Birim Adı
    ├── Öz Risk
    ├── Bulaşan Risk
    ├── Etkin Risk
    └── Risk Kaynakları Listesi
```

### Performans Optimizasyonu
- **Iterasyon Limiti:** 3 (Daha fazlası gereksiz, ağ 3. iterasyonda stabilize oluyor)
- **Memoization:** `useCallback` ile event handler'lar önbelleğe alınıyor
- **Lazy Calculation:** Simülasyon sadece butona basıldığında çalışıyor (auto-run ile ilk yüklemede)

---

## Gelecek Geliştirmeler

### Faz 2 Özellikleri
1. **Gerçek Veri Entegrasyonu:**
   - Supabase'den `audit_universe` tablosundan departmanları çek
   - `rkm_risks` tablosundan risk skorlarını çek
   - Gerçek zamanlı güncellemeler

2. **Zaman Yolculuğu:**
   - Geçmiş 12 aydaki risk evrimini göster
   - "Şubat 2025'teki ağ yapısı" slider'ı

3. **Simülasyon Modu:**
   - "IT riski 95'e çıkarsa ne olur?" what-if analizi
   - Kullanıcı manuel risk değeri değiştirebilir

4. **Export:**
   - PNG olarak grafik export
   - PowerPoint slide export (Yönetim sunumu için)
   - PDF rapor: "Risk Bulaşma Analizi Raporu"

### Faz 3 Özellikleri
1. **Makine Öğrenmesi:**
   - Geçmiş verilerden bağımlılık ağırlıklarını öğren
   - Anomali tespiti: "Bu bağlantı normalden 3x daha güçlü, incelenmeli"

2. **Multi-Layer Network:**
   - Katman 1: Departmanlar
   - Katman 2: İş Süreçleri
   - Katman 3: IT Sistemleri

3. **Oyunlaştırma:**
   - "Risk Bulaşmasını Durdur" oyunu
   - Kullanıcı bütçe ile riski düşürmeye çalışır

---

## Sonuç

Sinir Haritası, bankanın "sinir sistemini" görselleştirerek, tek bir noktadaki riskin tüm organizasyona nasıl yayıldığını gösterir. Bu, denetim önceliklerini belirlerken kritik bir araçtır.

**핵心 İlke:**
> "Bir departmanın riski, izole değildir. Bağımlılıklar üzerinden tüm ağa bulaşır."

**Kullanım Kılavuzu:**
1. Sayfayı aç → Ağ otomatik olarak simüle edilir
2. Kırmızı düğümlere dikkat et (Kritik risk)
3. Bir düğüme tıkla → Sağda detaylar açılır
4. "Risk Kaynakları" bölümünde hangi birimlerden risk geldiğini gör
5. Denetim planında, domino etkisi yapan kritik birimleri önceleklendir

**Demo Veri:**
- IT Dept (92) → Dijital Bankacılığa ağır etki yapıyor
- Siber Güvenlik (88) → Hem IT'ye hem Dijital'e etki yapıyor
- Toplam 8 departman, 12 bağlantı

**Canlı Badge:** Gelecekte gerçek zamanlı veri akışı için hazır.
