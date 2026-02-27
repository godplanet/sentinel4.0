# Sinir Haritası - Hızlı Başlangıç Kılavuzu

## 3 Adımda Kullanım

### Adım 1: Sayfayı Aç
```
Sidebar > STRATEJİ & RİSK > Sinir Haritası [CANLI]
```

### Adım 2: Ağı İncele
- **Kırmızı düğümler:** Kritik risk (≥85)
- **Turuncu düğümler:** Yüksek risk (70-84)
- **Sarı düğümler:** Orta risk (50-69)
- **Yeşil düğümler:** Düşük risk (<50)

### Adım 3: Detaylı Analiz
- Bir düğüme tıkla
- Sağ panelde:
  - **Öz Risk:** Birimin kendi riski
  - **Bulaşan Risk:** Diğer birimlerden gelen
  - **Etkin Risk:** Toplam risk
  - **Risk Kaynakları:** Hangi birimlerden geldiği

---

## Demo Senaryo

### IT Departmanı Analizi (Örnek)

**1. "Bilgi Teknolojileri" düğümüne tıkla**

**2. Sağ panelde göreceksiniz:**
```
┌─────────────────────────┐
│ Öz Risk:         92.0   │ ← Birimin temel riski (Kritik!)
│ Bulaşan Risk:   +12.5   │ ← Siber Güvenlik'ten gelen
│ Etkin Risk:     104.5   │ ← Toplam (tavana çarpmış!)
└─────────────────────────┘
```

**3. Risk Kaynakları:**
```
• Siber Güvenlik    +8.5   [70% bağımlılık]
• Hazine           +4.0   [50% bağımlılık]
```

**4. IT'nin Etkilediği Birimler (Grafikte ok takip edin):**
```
IT (92)
  ↓ Dijital Bankacılık   [90% bağımlılık] → Risk arttı!
  ↓ Şube Ağı            [85% bağımlılık] → Risk arttı!
  ↓ Operasyon           [80% bağımlılık] → Risk arttı!
```

---

## Kritik Bulgular (Demo Veri)

### 1️⃣ En Riskli Birim
```
Bilgi Teknolojileri
Etkin Risk: 104.5 (Kritik!)
Etki Alanı: 3 birim (Dijital, Şubeler, Operasyon)
```

### 2️⃣ En Büyük Risk Kaynağı
```
Siber Güvenlik
Öz Risk: 88 (Yüksek)
Bulaştırdığı Birim: IT + Dijital Bankacılık
```

### 3️⃣ En Savunmasız Birim
```
Dijital Bankacılık
Öz Risk: 55 (Orta)
Etkin Risk: 96 (Kritik!) ← IT'den gelen bulaşma
```

---

## Simülasyon Yenileme

**Sağ üst panelde "🔄" butonuna basın:**
- Algoritma yeniden çalışır
- Ağ istatistikleri güncellenir
- Renkler yenilenir

---

## Ağ İstatistikleri (Sağ Üst Panel)

```
Ortalama Risk:    68.5   ← Tüm ağın ortalaması
Kritik Birim:     3      ← Risk ≥85 olan birim sayısı
Toplam Bulaşma:   145.2  ← Tüm ağdaki ek risk toplamı
Max Risk:         104.5  ← En yüksek etkin risk
```

---

## İpuçları

### 🔍 Görselleştirme
- **Mouse Wheel:** Zoom in/out
- **Sürükle:** Grafiği kaydır
- **Mini Map (Sağ alt):** Ağa kuşbakışı bak

### 🎯 Analiz
- Kırmızı ok takip et → Kritik birimden hangi birimlere risk bulaşıyor
- Kalın oklar → Güçlü bağımlılık (dikkat!)
- İnce oklar → Zayıf bağımlılık

### 📊 Karar Desteği
1. Kritik birimleri öncelikle denetle
2. Domino etkisi yapan birimlere odaklan
3. Çok bağımlılığı olan birimlere erken müdahale et

---

## Örnek Denetim Planı

### Öncelik 1: IT Departmanı
- **Neden:** En yüksek etkin risk (104.5)
- **Etki:** 3 kritik birime domino etkisi
- **Aksiyon:** Acil sistem güvenliği denetimi

### Öncelik 2: Siber Güvenlik
- **Neden:** En büyük risk kaynağı (88)
- **Etki:** IT + Dijital'e bulaşma yapıyor
- **Aksiyon:** Güvenlik açığı analizi

### Öncelik 3: Dijital Bankacılık
- **Neden:** En savunmasız (55 → 96)
- **Etki:** IT'ye %90 bağımlı
- **Aksiyon:** Süreç bağımsızlığı kontrolü

---

## Sıkça Sorulan Sorular

**S: Neden bazı düğümler hareketli?**
A: Force-Directed layout kullanıyoruz. Düğümler kendilerini optimal pozisyona yerleştirir.

**S: "Bulaşan Risk" neye göre hesaplanıyor?**
A: Formül: `Komşu Risk × Bağımlılık Ağırlığı × 0.5`

**S: Neden bazı oklar animasyonlu?**
A: Kaynak birimin riski ≥70 ise ok animasyonlu ve renkli (tehlike göstergesi).

**S: Gerçek veri ile çalışıyor mu?**
A: Şu anda demo veri. Faz 2'de Supabase entegrasyonu gelecek.

**S: Bu analiz gerçek zamanlı mı?**
A: "CANLI" badge gelecek özellik için hazırlık. Şu an manuel simülasyon.

---

## Klavye Kısayolları

| Tuş | Aksiyon |
|-----|---------|
| **ESC** | Seçimi kaldır (sağ panel kapanır) |
| **+** | Zoom in |
| **-** | Zoom out |
| **F** | Fit to view (tüm ağı göster) |

---

## Sonraki Adımlar

1. ✅ Demo'yu incele
2. ✅ Kritik birimleri tespit et
3. ⏭️ Gerçek veri ile test et (Gelecek)
4. ⏭️ Zaman serisini incele (Gelecek)
5. ⏭️ Export'la ve sunumlarda kullan (Gelecek)

---

**Hazır!** Şimdi `/strategy/neural-map` adresine gidip canlı ağı görebilirsiniz. 🎯
