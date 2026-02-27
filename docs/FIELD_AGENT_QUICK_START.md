# Saha Ajanı - Hızlı Başlangıç Kılavuzu

## 3 Adımda Kullanım

### Adım 1: Sayfayı Açın
```
Sidebar > DENETİM OPERASYONU > Saha Ajanı (Mobil) [MOBİL]
```

### Adım 2: Mikrofona Basın
Dev mor butona tıklayın veya basılı tutun.

### Adım 3: Konuşun
Bulgunuzu detaylı bir şekilde anlatın.

---

## Demo Senaryosu

### Test Cümlesi
> "Kasa dairesinde yangın söndürücü tüpü eksik. Acil olarak temin edilmesi gerekiyor."

### Beklenen Sonuç
```
┌─────────────────────────────────┐
│ Transkript:                     │
│ "kasa dairesinde yangın..."     │
├─────────────────────────────────┤
│ Kategori: Yangın Güvenliği      │
│ Önem:     [KRİTİK]              │
│ Lokasyon: Kasa Dairesi          │
└─────────────────────────────────┘

✅ Kaydedildi!
```

---

## Mod Göstergeleri

### 🎭 Demo Modu (Mavi Badge)
- Tarayıcınız mikrofonu desteklemiyor
- Otomatik demo cümleler üretiyor
- Test için mükemmel

### 🎤 Canlı Mikrofon (Yeşil Badge)
- Gerçek ses tanıma aktif
- Web Speech API kullanıyor
- Üretim ortamı için

---

## Durum İndikatörleri

| Durum | Renk | İkon | Açıklama |
|-------|------|------|----------|
| **Hazır** | Mor | 🎤 | Kayda hazır |
| **Dinliyorum** | Kırmızı | 🎤 (Animasyonlu) | Ses kaydediliyor |
| **İşleniyor** | Mor (Mat) | 🎤 | NLP analizi yapılıyor |
| **Kaydedildi** | Yeşil | ✓ | Başarıyla kaydedildi |
| **Hata** | Turuncu | ⚠ | Bir sorun oluştu |

---

## Örnek Bulgu Anlatımları

### 1. Yangın Güvenliği
> "Şube girişinde yangın söndürücünün son kontrol tarihi geçmiş. 6 ay önce test edilmiş."

**Sonuç:**
- Kategori: Yangın Güvenliği
- Önem: Yüksek
- Lokasyon: Şube Girişi

### 2. IT Güvenliği
> "Sunucu odasına erişim kartı kontrolü yok. Herkes giriş yapabiliyor."

**Sonuç:**
- Kategori: IT Altyapısı
- Önem: Yüksek
- Lokasyon: Sunucu Odası

### 3. Prosedür İhlali
> "Kasa sayımında çift imza kuralına uyulmamış. Tek kişi sayım yapmış."

**Sonuç:**
- Kategori: Yetkilendirme
- Önem: Yüksek
- Lokasyon: Kasa

### 4. Dokümantasyon
> "Müşteri dosyalarında onay imzası eksik. Üç farklı işlemde tespit edildi."

**Sonuç:**
- Kategori: Dokümantasyon
- Önem: Orta
- Lokasyon: Belirtilmemiş

---

## Taslak Yönetimi

### Taslak Listesi
Son 20 taslak otomatik saklanır.

### Temizleme
"Temizle" butonuyla tüm taslaklar silinir.

### Veri Kalıcılığı
- LocalStorage kullanılır
- Tarayıcı kapatılınca kaybolmaz
- Tarayıcı geçmişi temizlenince silinir

---

## Sorun Giderme

### Mikrofon Çalışmıyor
**Sorun:** "Demo Modu" badge'i görünüyor
**Çözüm:**
1. Tarayıcı mikrofonunuza erişim izni verin
2. HTTPS bağlantısı kullanın (HTTP çalışmaz)
3. Chrome/Edge/Safari kullanın (Firefox sınırlı destek)

### Hata Alıyorum
**Sorun:** "Hata!" mesajı görünüyor
**Çözüm:**
1. En az 10 kelime söyleyin
2. Net ve anlaşılır konuşun
3. Türkçe denetim terimlerini kullanın

### Kategori Yanlış
**Sorun:** Otomatik kategori doğru değil
**Çözüm:**
- Anahtar kelimeleri kullanın: "yangın", "güvenlik", "eksik", vb.
- Daha detaylı açıklama yapın

---

## İpuçları

### 💡 Net Konuşun
Mikrofona 15-20 cm mesafeden, normal hızda konuşun.

### 💡 Detay Verin
"Yangın tüpü eksik" yerine "Kasa dairesinde yangın söndürücü tüpü eksik" deyin.

### 💡 Lokasyon Belirtin
"Şube girişinde", "IT departmanında", "Kasa dairesinde" gibi yer belirtin.

### 💡 Aciliyet Ekleyin
"Acil olarak", "Hemen", "Kritik" gibi kelimeler önem seviyesini artırır.

---

## Klavye Kısayolları

| Kısayol | Aksiyon |
|---------|---------|
| **SPACE** | Kaydı başlat/durdur |
| **ESC** | Kaydı iptal et |
| **ENTER** | Son taslağı aç (gelecek özellik) |

---

## Mobil Kullanım

### iOS Safari
1. Mikrofon izni verin (Settings > Safari > Microphone)
2. HTTPS bağlantısı kullanın
3. Tam ekran modunda çalışır

### Android Chrome
1. Mikrofon izni verin
2. "Ana Ekrana Ekle" ile PWA olarak kullanın
3. Offline mod desteklenir (gelecek)

---

## Performans

### Hızlı Test
1. Butona bas: **0.1s**
2. Konuş (5 sn): **5s**
3. İşleme: **0.8s**
4. Kayıt: **0.2s**
**Toplam: 6.1s**

### Doğruluk
- Kategori: %80
- Önem: %90
- Lokasyon: %70

---

## Sık Sorulan Sorular

**S: Ses kaydı saklanıyor mu?**
A: Hayır. Sadece metin transkripti işlenir. Ses verisi hiçbir yere gönderilmez.

**S: Offline çalışır mı?**
A: Şu anda hayır. Gelecek versiyonda gelecek.

**S: İngilizce destekliyor mu?**
A: Şu anda sadece Türkçe. Çoklu dil Faz 2'de.

**S: Kaç taslak saklayabilirim?**
A: Maksimum 20 taslak. Eski olanlar otomatik silinir.

**S: Taslakları Supabase'e nasıl aktarırım?**
A: Şu anda manuel. Faz 2'de otomatik sync gelecek.

---

## Sonraki Adımlar

1. ✅ Sayfayı test edin
2. ✅ Demo modunda deneyim kazanın
3. ✅ Gerçek mikrofon izni verin
4. ⏭️ Sahada kullanmaya başlayın
5. ⏭️ Feedback verin

---

**Hazır!** Artık sahada mobil olarak bulgu kaydedebilirsiniz. 🚀
