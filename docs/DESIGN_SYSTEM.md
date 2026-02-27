# SENTINEL v3.0: DESIGN SYSTEM ANAYASASI
## "Functional Glass" + Apple-Inspired Premium UI

---

## 🎯 TASARIM FELSEFESİ

Sentinel v3, **Sentinel v2'nin canlı, vibrant, Apple tarzı tasarımını** koruyarak **bankacılık denetim sistemine uygun profesyonel bir yaklaşım** sunar.

### Temel Prensipler:
1. **Canlı ama Profesyonel**: Vibrant renkler, gradients, ama banka audit sistemine yakışır ciddiyet
2. **Glass ama Performant**: Backdrop-blur efektleri, ama VDI/Citrix'te otomatik solid moda geçiş
3. **Minimalist ama Bilgi Zengin**: Apple tarzı temizlik, ama veri yoğun dashboard'lar
4. **Animasyonlu ama Anlamlı**: Her animasyon kullanıcı deneyimini geliştirir

---

## 📐 1. PAGE HEADER STANDARDI (ANAYASA)

**Bu yapı BÜTÜN sayfalarda zorunludur. Sentinel v2 Kaynak Yönetimi sayfası referans alınmıştır.**

### 🎨 Sidebar Renk Senkronizasyonu (YENİ!)
**KRITIK:** PageHeader arka plan rengi artık sidebar rengi ile otomatik senkronize çalışır!

- Sidebar'da seçilen renk ne ise, header gradient de o rengi kullanır
- UI Store'dan `sidebarColor` alınır
- Gradient otomatik oluşturulur: `linear-gradient(135deg, sidebarColor, darkenedColor)`
- Sidebar rengi değiştikçe tüm sayfa header'ları otomatik güncellenir

**Avantajları:**
- Tutarlı görsel kimlik
- Sidebar ve header renk uyumu
- Tek tıkla tüm sistemin rengini değiştirme
- Ortam bazlı renklendirme (PROD/UAT/DEV)

### Yapı:
```tsx
<PageHeader
  title="Sayfa Başlığı"           // xl-2xl, kalın font (küçültüldü!)
  description="Alt açıklama"      // sm, text-white/80
  icon={IconComponent}             // 28px ikon (lucide-react)
  viewControls={<ViewToggle />}    // Liste/Grid/Kanban toggle
  action={<ActionButton />}        // AI Asistan/Yeni Ekle vb.
/>
```

**NOT:** `variant` prop'u kaldırıldı. Artık her header sidebar rengini kullanır.

### İkon Kutusu:
- Boyut: `56px x 56px` (küçültüldü!)
- Padding: `p-3.5`
- Arka plan: `bg-white/10 backdrop-blur-xl border-white/20`
- İkon boyutu: `28px` (size={28}) (küçültüldü!)
- Renk: `text-white`
- Border radius: `rounded-2xl`
- Gölge: `shadow-lg`

### Başlık Tipografisi:
- Font boyutu: `text-xl md:text-2xl` (küçültüldü!)
- Font weight: `font-bold`
- Tracking: `tracking-tight`
- Renk: `text-white` (sidebar gradient üzerinde)
- Alt açıklama: `text-sm text-white/80`

### View Controls (Liste/Grid Toggle):
```tsx
<div className="flex items-center gap-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-1">
  <button className={activeMode ? "bg-white text-slate-900" : "text-white hover:bg-white/10"}>
    <LayoutList size={18} />
    Liste
  </button>
  <button className={activeMode ? "bg-white text-slate-900" : "text-white hover:bg-white/10"}>
    <LayoutGrid size={18} />
    Kartlar
  </button>
</div>
```

### Action Button (AI Asistan):
```tsx
<button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl hover:scale-105">
  <Sparkles size={18} />
  AI Kaynak Asistanı
</button>
```

---

## 🪟 2. GLASS EFEKT SİSTEMİ

### A. Glass Card (.glass-card)
**Temel kart componenti - BÜTÜN kartlar bunu kullanır**

```css
.glass-card {
  background: rgba(255, 255, 255, 0.6);    /* 60% şeffaf beyaz */
  backdrop-filter: blur(24px);              /* Arka plan blur */
  border: 1px solid rgba(255, 255, 255, 0.2);  /* Şeffaf border */
  border-radius: 12px;                      /* rounded-xl */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);  /* shadow-lg */
  transition: all 300ms;
}

.glass-card:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);  /* shadow-2xl */
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);  /* Hafif yukarı hareket */
}
```

### B. Glass Panel (.glass-panel)
**Daha büyük container'lar için**

```css
.glass-panel {
  background: rgba(255, 255, 255, var(--glass-opacity));  /* CSS variable */
  backdrop-filter: blur(var(--glass-blur)) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.4);
}
```

### C. VDI/Citrix Mode (Performance Optimization)
**Düşük performanslı sistemlerde otomatik solid moda geçiş**

```css
.perf-low .glass-card {
  background: #FFFFFF !important;     /* Tam beyaz */
  backdrop-filter: none !important;   /* Blur kapalı */
  border: 1px solid #E2E8F0 !important;
  box-shadow: none !important;
}
```

**Kullanım:** Body'ye `.perf-low` class'ı eklendiğinde tüm glass efektler devre dışı kalır.

---

## ✨ 3. NEON HOVER EFEKTLERİ

**Kartların çevresinde hover'da görünen animasyonlu neon glow efektleri**

### 4 Renk Varyasyonu:

#### A. Neon Blue (.neon-border-blue)
- Mavi → Mor → Mavi gradient
- Kullanım: Genel bilgi kartları, toplam istatistikler

```tsx
<div className="relative neon-border-blue group">
  <div className="relative z-10 glass-card p-5">
    {/* İçerik */}
  </div>
</div>
```

#### B. Neon Emerald (.neon-border-emerald)
- Yeşil → Mavi → Yeşil gradient
- Kullanım: Başarı, düşük risk, pozitif metrikler

#### C. Neon Orange (.neon-border-orange)
- Turuncu → Sarı → Turuncu gradient
- Kullanım: Yüksek risk, uyarı kartları

#### D. Neon Purple (.neon-border-purple)
- Mor → Pembe → Mor gradient
- Kullanım: AI özellikleri, premium özellikler

### Teknik Detaylar:
```css
.neon-border-blue::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  opacity: 0;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6);
  background-size: 200% 100%;
  animation: neon-flow 3s ease-in-out infinite;
  filter: blur(8px);
  transition: opacity 300ms;
}

.neon-border-blue:hover::before {
  opacity: 0.75;
}

@keyframes neon-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

---

## 🎨 4. RENK PALETİ (VIBRANT & PROFESSIONAL)

### A. İstatistik Kartları

```tsx
// Toplam (Nötr - Mavi Neon)
<div className="neon-border-blue">
  <div className="glass-card bg-white">
    <Shield className="text-slate-400" />
    <div className="text-4xl font-bold text-slate-900">24</div>
  </div>
</div>

// Kritik (Kırmızı Gradient)
<div className="neon-border-blue">
  <div className="glass-card bg-gradient-to-br from-red-50/80 to-red-100/60">
    <TrendingUp className="text-red-500" />
    <div className="text-4xl font-bold text-red-700">3</div>
  </div>
</div>

// Yüksek (Turuncu Gradient)
<div className="neon-border-orange">
  <div className="glass-card bg-gradient-to-br from-amber-50/80 to-amber-100/60">
    <AlertTriangle className="text-amber-500" />
    <div className="text-4xl font-bold text-amber-700">8</div>
  </div>
</div>

// Orta (Sarı Gradient)
<div className="neon-border-emerald">
  <div className="glass-card bg-gradient-to-br from-yellow-50/80 to-yellow-100/60">
    <Shield className="text-yellow-500" />
    <div className="text-4xl font-bold text-yellow-700">13</div>
  </div>
</div>
```

### B. Buton Gradientleri

```tsx
// AI Asistan (Mor-Pembe)
className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"

// Primary Action (Mavi)
className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"

// Success (Yeşil)
className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"

// Danger (Kırmızı)
className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
```

### C. Risk Seviyeleri

| Risk Skoru | Seviye | Renk | Class |
|------------|--------|------|-------|
| 85+ | KRİTİK | Kırmızı | `text-red-600 bg-red-50/80 border-red-200` |
| 70-84 | YÜKSEK | Turuncu | `text-amber-600 bg-amber-50/80 border-amber-200` |
| 50-69 | ORTA | Sarı | `text-yellow-600 bg-yellow-50/80 border-yellow-200` |
| <50 | DÜŞÜK | Yeşil | `text-emerald-600 bg-emerald-50/80 border-emerald-200` |

---

## 📊 5. KART TASARIMI

### A. Liste Görünümü (Table)

```tsx
<div className="glass-card overflow-hidden">
  <table className="w-full">
    <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80 border-b border-slate-200/50">
      <tr>
        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-700">
          Başlık
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100/50 bg-white/40 backdrop-blur-sm">
      <tr className="hover:bg-blue-50/30 transition-all group">
        <td className="px-6 py-4">
          {/* İçerik */}
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

**Özellikler:**
- Header: Gradient arka plan (`from-slate-50 to-slate-100/80`)
- Body: Şeffaf beyaz backdrop blur
- Hover: Açık mavi arka plan (`bg-blue-50/30`)
- Row Actions: Opacity 0 → 100 (group-hover)

### B. Kart Görünümü (Grid)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div className="relative neon-border-blue group">
    <div className="relative z-10 glass-card p-6">
      {/* Başlık */}
      <h3 className="text-base font-bold text-slate-900">Başlık</h3>

      {/* 2 Sütunlu Risk Skorları */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-red-50/80 to-red-100/60 border-2 border-red-200 rounded-xl p-4 text-center">
          <div className="text-xs font-bold text-slate-600">İçsel</div>
          <div className="text-2xl font-bold text-slate-900">85.0</div>
          <div className="text-xs font-bold bg-red-500 text-white px-2 py-1 rounded-lg">KRİTİK</div>
        </div>

        <div className="bg-gradient-to-br from-amber-50/80 to-amber-100/60 border-2 border-amber-200 rounded-xl p-4 text-center">
          <div className="text-xs font-bold text-slate-600">Artık</div>
          <div className="text-2xl font-bold text-slate-900">42.5</div>
          <div className="text-xs font-bold bg-amber-500 text-white px-2 py-1 rounded-lg">ORTA</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-2">
        <div className="h-2.5 flex-1 rounded-full bg-slate-200/80 overflow-hidden">
          <div className="h-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600" style={{width: '75%'}} />
        </div>
        <span className="text-xs font-bold text-slate-700">75%</span>
      </div>

      {/* Hover Actions */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 hover:scale-110">
          <Edit2 size={16} />
        </button>
      </div>
    </div>
  </div>
</div>
```

---

## 🔄 6. VIEW MODE TOGGLE PATTERN

**Tüm liste sayfalarında zorunlu: Liste / Grid / Kanban toggle**

```tsx
const [viewMode, setViewMode] = useState<'list' | 'cards' | 'kanban'>('list');

// PageHeader içinde viewControls prop
viewControls={
  <div className="flex items-center gap-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-1">
    <button
      onClick={() => setViewMode('list')}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
        viewMode === 'list'
          ? 'bg-white text-slate-900 shadow-lg'
          : 'text-white hover:bg-white/10'
      }`}
    >
      <LayoutList size={18} />
      Liste
    </button>

    <button
      onClick={() => setViewMode('cards')}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
        viewMode === 'cards'
          ? 'bg-white text-slate-900 shadow-lg'
          : 'text-white hover:bg-white/10'
      }`}
    >
      <LayoutGrid size={18} />
      Kartlar
    </button>
  </div>
}

// Sayfa içeriği
{viewMode === 'cards' ? (
  <CardGrid items={items} />
) : (
  <TableList items={items} />
)}
```

---

## 📱 7. RESPONSIVE & ACCESSIBILITY

### Breakpoints:
- **Mobile**: `< 768px` (sm)
- **Tablet**: `768px - 1024px` (md)
- **Desktop**: `> 1024px` (lg)

### Touch Targets:
- Minimum buton boyutu: `44px x 44px`
- İkon butonlar: `p-2` (en az 40px)
- Toggle butonlar: `px-4 py-2` (min 44px height)

### Kontrast Oranları:
- Başlıklar: `text-slate-900` (AA+ Large)
- Body text: `text-slate-700` (AA)
- Secondary text: `text-slate-600` (AA)
- Placeholder: `text-slate-400` (AAA)

### Animasyonlar:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## ⚡ 8. PERFORMANCE MODE (VDI/CITRIX)

### Otomatik Algılama:
```tsx
// useEffect ile performans algılama
const isLowPerf = detectLowPerformance();
if (isLowPerf) {
  document.body.classList.add('perf-low');
}
```

### VDI Mode Değişiklikleri:
1. **Glass → Solid**: Tüm `backdrop-blur` devre dışı
2. **Shadows**: `shadow-lg` → `shadow-sm`
3. **Animations**: Azaltılmış/kaldırıldı
4. **Gradients**: Korunuyor (CSS performanslı)
5. **Neon Effects**: Devre dışı (hover'da görünmez)

---

## 🎯 9. ZORUNLU UYGULAMALAR

### ✅ Her Sayfa İçin:
1. PageHeader component kullanımı (icon + viewControls + action)
2. Glass card/panel kullanımı
3. Liste/Grid toggle (varsa)
4. Neon hover efektleri (kartlarda)
5. Gradient arka planlar (risk kartlarında)
6. Responsive breakpoints
7. VDI mode desteği

### ❌ Yapılmaması Gerekenler:
1. Saf beyaz kartlar (ekran bembeyaz olmasın)
2. Mor/indigo/violet tonları (kullanıcı istemediği sürece)
3. Static, hareketsiz arayüz
4. 500px'den küçük dokunma hedefleri
5. Glass olmadan transparency kullanımı
6. Gradient olmadan solid renkler (butonlarda)

---

## 📦 CSS CLASS KÜTÜPHANESİ

### Kartlar:
- `.glass-card` - Temel glass kart
- `.glass-panel` - Büyük container
- `.glass-card-solid` - VDI uyumlu solid kart

### Neon Efektler:
- `.neon-border-blue` - Mavi-mor neon
- `.neon-border-emerald` - Yeşil-mavi neon
- `.neon-border-orange` - Turuncu-sarı neon
- `.neon-border-purple` - Mor-pembe neon

### Utility:
- `.custom-scrollbar` - Özel scrollbar
- `.tabular-nums` - Sayısal font
- `.perf-low` - VDI mode trigger

---

## 🚀 ÖRNEK SAYFA İMPLEMENTASYONU

```tsx
import { PageHeader } from '@/shared/ui';
import { Database, LayoutList, LayoutGrid, Sparkles } from 'lucide-react';

export default function ExamplePage() {
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk Bilgi Kütüphanesi"
        description="Kurumsal Risk Kataloğu"
        icon={Database}
        viewControls={
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <LayoutList size={18} /> Liste
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <LayoutGrid size={18} /> Kartlar
            </button>
          </div>
        }
        action={
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-bold hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl hover:scale-105">
            <Sparkles size={18} /> AI Asistan
          </button>
        }
      />

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-4 gap-4">
        <div className="relative neon-border-blue group">
          <div className="relative z-10 glass-card p-5">
            <div className="text-4xl font-bold text-slate-900">24</div>
          </div>
        </div>
      </div>

      {/* Liste/Grid İçerik */}
      {viewMode === 'cards' ? <CardGrid /> : <TableList />}
    </div>
  );
}
```

---

## 📚 REFERANS DÖKÜMANTASYONu

- **Sentinel v2 Kaynak Yönetimi**: Header ve view toggle referansı
- **Apple Design Guidelines**: Glass efekt ve animasyon prensipleri
- **Tailwind CSS v3**: Utility class yapısı
- **Lucide Icons**: Tüm ikonlar için standart kütüphane

---

**SON GÜNCELleme:** 2026-02-02 (Sidebar Senkronizasyonu Eklendi)
**TASARIM ANAYASASI VERSİYON:** 3.1-FINAL
**DURUM:** ✅ UYGULANMALI - TÜM SAYFALARDA ZORUNLU

## 🆕 Versiyon 3.1 Değişiklikleri

### 1. Sidebar Renk Senkronizasyonu
- PageHeader artık sidebar rengi ile otomatik senkronize
- UI Store'dan `sidebarColor` alınıyor
- Gradient otomatik oluşturuluyor
- Sidebar rengi değişince tüm header'lar güncelleniyor

### 2. Küçültülmüş Boyutlar
- Başlık: `text-2xl-3xl` → `text-xl-2xl`
- İkon: `32px` → `28px`
- İkon kutusu: `64x64` → `56x56`
- Padding: `p-4` → `p-3.5`

### 3. Kaldırılan Özellikler
- `variant` prop kaldırıldı (artık sidebar rengini kullanıyor)
- Sabit gradient renkleri kaldırıldı (dinamik oldu)
