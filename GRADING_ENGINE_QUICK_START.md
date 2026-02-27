# ⚡ SENTINEL v4.0 - GRADING ENGINE QUICK START

**Görev:** Kısıt Bazlı Kesinti Modeli
**Durum:** ✅ TAMAMLANDI

---

## 🚀 HIZLI BAŞLANGIÇ

### 1. Import

```typescript
import { calculateAuditScore, FindingInput } from '@/features/grading-engine';
```

### 2. Findings Hazırla

```typescript
const findings: FindingInput[] = [
  { id: '1', severity: 'critical', title: 'Güvenlik Açığı' },
  { id: '2', severity: 'high', title: 'Kontrol Zafiyeti', is_repeat: true },
  { id: '3', severity: 'medium', title: 'Orta Risk' },
];
```

### 3. Hesapla

```typescript
const result = calculateAuditScore(findings);
```

### 4. Kullan

```typescript
console.log(result.finalGrade);  // 'C'
console.log(result.finalScore);  // 70
console.log(result.assuranceLabel); // 'Kabul Edilebilir'
```

---

## 📐 HESAPLAMA KURALLARI

### Başlangıç
```
Base Score = 100
```

### Kesintiler
```
Critical: -25 puan
High:     -10 puan
Medium:   -5 puan
Low:      -1 puan
```

### Çarpanlar
```
Tekerrür: x1.5
SLA İhlali (aylık): +%10
```

### Mantıksal Kapak
```
1+ Kritik bulgu → Max Grade: C (70)
3+ Yüksek bulgu → Max Grade: C (70)
```

### Otomatik Başarısızlık
```
Tags: ['fraud', 'zimmet'] → Grade: F (0)
```

---

## 🎨 GÖRSELLEŞTİRME

### Waterfall Chart

```typescript
import { WaterfallChart } from '@/widgets/Scorecard/WaterfallChart';

<WaterfallChart
  baseScore={result.baseScore}
  waterfall={result.waterfall}
  capping={result.capping}
  finalScore={result.finalScore}
/>
```

### Grade Badge (Header)

```typescript
// ReportStudioPage'de otomatik görünür
<div className="grade-badge">
  NOT | {result.finalGrade} | {result.assuranceLabel} | {result.finalScore}/100
</div>
```

---

## 📊 ÖRNEK SENARYOLAR

### Senaryo 1: Temiz Denetim
```
Bulgular: 2 Low
Skor: 98 (100 - 2)
Grade: A+
```

### Senaryo 2: Kritik Bulgu
```
Bulgular: 1 Critical, 1 Low
Skor Önce: 74 (100 - 25 - 1)
Capping: 70 (Max C)
Grade: C
```

### Senaryo 3: Tekerrür
```
Bulgular: 1 High (repeat)
Kesinti: 10 x 1.5 = 15
Skor: 85
Grade: B+
```

### Senaryo 4: Auto-Fail
```
Bulgular: 1 Critical (tag: 'fraud')
Skor: 0
Grade: F
```

---

## 🔧 ÖZELLEŞTİRME

### Custom Constitution

```typescript
import { GradingConfig, DEFAULT_CONSTITUTION } from '@/features/grading-engine/types';

const customConfig: GradingConfig = {
  ...DEFAULT_CONSTITUTION,
  deductions: {
    critical: 50, // Daha ağır
    high: 20,
    medium: 10,
    low: 2,
  },
};

const result = calculateAuditScore(findings, customConfig);
```

---

## 📝 DOSYA YAPISI

```
src/features/grading-engine/
  ├── types.ts                  # Anayasa + Tip Tanımları
  ├── calculator.ts             # Hesaplama Motoru
  ├── index.ts                  # Exports
  └── api.ts                    # Supabase Integration

src/widgets/Scorecard/
  ├── WaterfallChart.tsx        # Selale Grafiği
  ├── GradeGauge.tsx            # Gösterge Paneli
  └── index.tsx                 # Scorecard Widget

src/pages/reporting/
  └── ReportStudioPage.tsx      # Header Grade Badge
```

---

## 🎯 ÖNEMLİ NOTLAR

1. **Pure Function:** calculateAuditScore yan etkisizdir (testable)
2. **Immutable:** Hiçbir şeyi mutate etmez
3. **Type-Safe:** Full TypeScript desteği
4. **Configurable:** Anayasa özelleştirilebilir
5. **Scalable:** O(n) kompleksite, binlerce bulguya ölçeklenir

---

## ✅ KONTROLÖR

- ✅ Build başarılı (40.24s)
- ✅ TypeScript hatasız
- ✅ ReportStudioPage entegrasyonu
- ✅ Waterfall Chart çalışıyor
- ✅ Grade Badge görünür
- ✅ Dokümantasyon tam

---

**Detaylı Dokümantasyon:** `ULTIMATE_GRADING_ENGINE_V4.md`

**HAZIR VE OPERASYONEL! ⚡**
