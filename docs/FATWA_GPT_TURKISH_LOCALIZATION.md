# Fetva-GPT Türkçe Yerelleştirme Raporu

## Özet
Fatwa-GPT modülü profesyonel Türkçe'ye tam olarak yerelleştirilmiştir. Tüm kullanıcı arayüzü metinleri, AAOIFI standart verileri ve sistem yanıtları Türkçe İslami finans terminolojisi kullanılarak çevrilmiştir.

## Çevrilen Bileşenler

### 1. Kullanıcı Arayüzü (`src/pages/shariah/FatwaGPTPage.tsx`)

#### Ana Başlıklar
- "Fatwa-GPT" → "Fetva-GPT"
- "AI-Powered Shari'ah Jurisprudence Engine" → "Yapay Zeka Destekli Fıkhi Danışman"
- "AAOIFI Standards Repository" → "AAOIFI Standartları Kütüphanesi"
- "No Hallucinations • Only Cited Sources" → "Halüsinasyon Yok • Sadece Kaynaklı Bilgi • Şer'i Uyumlu"

#### İçerik Etiketleri
- "8+ Standards" → "8+ Standart"
- "20+ Articles" → "20+ Madde"
- "Zero Tolerance for Riba" → "Faize Sıfır Tolerans"
- "Ask a Shari'ah Question" → "Şer'i / Fıkhi Soru Sor"
- "Suggested Questions" → "Örnek Sorular"
- "Knowledge Base" → "Bilgi Bankası"
- "Recent Queries" → "Son Sorgular"

#### Hüküm Etiketleri (Türkçe)
- `permissible` → **CAİZ**
- `not_permissible` → **CAİZ DEĞİL**
- `conditional` → **ŞARTLI CAİZ**
- `requires_review` → **İNCELEME GEREKLİ**

#### Standart Hüküm Etiketleri
- `mandatory` → **ZORUNLU**
- `recommended` → **TAVSİYE EDİLİR**
- `permissible` → **CAİZ**
- `discouraged` → **MEKRUH**
- `prohibited` → **YASAK**

#### Risk Seviyeleri
- `critical` → **KRİTİK RİSK**
- `high` → **YÜKSEK RİSK**
- `medium` → **ORTA RİSK**
- `low` → **DÜŞÜK RİSK**

#### Yasal Uyarı
**Orijinal:**
> "This tool provides guidance based on AAOIFI standards. For final rulings, consult your Shari'ah Supervisory Board (SSB)."

**Türkçe:**
> "Bu araç sadece AAOIFI standartlarına dayalı rehberlik sağlar. Nihai karar için Şer'i Danışma Kurulu'na (SSB) başvurunuz."

---

### 2. AAOIFI Standartları Veri Tabanı (`src/features/shariah/data/aaoifi_standards.ts`)

#### Çevrilen Standartlar

**Murabaha (Standart No. 8)**
- **Madde 2/1/3 - Geçerlilik Şartları:**
  > "Kurum, emtiayı (varlığı) müşteriye satmadan önce mülkiyetine almalı ve fiili veya hükmi zilyetliği ele geçirmelidir. Mülkiyetten önce satış, akdi batıl (geçersiz) kılar."

- **Madde 3/1 - Satın Alma Vaadi:**
  > "Müşterinin tek taraflı satın alma vaadi (va'd), çoğunluk görüşüne göre vaad vereni bağlar."

- **Madde 4/2 - Risk ve Sorumluluk:**
  > "Kurum, satın alma ile müşteriye teslimat arasındaki dönemde emtiaya ilişkin tüm riskleri üstlenir."

**Teverruk (Standart No. 30)**
- **Madde 2/2 - Organize Teverruk:**
  > "Organize Teverruk (Teverruk Munazzam), emtia asıl satıcıya geri dönerse veya kurum tüm zinciri düzenlerse CAİZ DEĞİLDİR. Bu, faiz yasağını dolanmak için bir hukuki hile (hile) teşkil eder."

- **Madde 3/1 - Klasik Teverruk:**
  > "Klasik Teverruk şu şartlarda caizdir: (1) müşteri emtiayı bağımsız olarak tedarik eder, (2) gerçek zilyetliği ele geçirir ve (3) kurumsal düzenleme olmaksızın üçüncü tarafa satar."

**Sukuk (Standart No. 17)**
- **Madde 2/1/1 - Varlık Mülkiyeti:**
  > "Sukuk sahipleri, dayanak varlıkların GERÇEK ve ORANTILI mülkiyetine sahip olmalıdır. Gerçek risk paylaşımı olmaksızın hükmi veya nominal mülkiyet caiz değildir."

- **Madde 4/3 - İtfa Koşulları:**
  > "İhraççı, vade sonunda anapara tutarını garanti edemez. Nominal değer üzerinden garantili geri alım, sukuku bir borç enstrümanına (Faiz) dönüştürür."

**İcara (Standart No. 9)**
- **Madde 3/1/2 - Mülkiyet ve Bakım:**
  > "Kiraya veren (kurum), kiralanan varlığın mülkiyetini elinde tutmalı ve büyük bakım maliyetlerini üstlenmelidir."

- **Madde 6/1 - İcara Müntehiye Bi't-Temlik:**
  > "Mülkiyet devri ile sonuçlanan kiralama (İcara Müntehiye Bi't-Temlik) caizdir."

**Mudarebe (Standart No. 13)**
- **Madde 2/1/4 - Kar Paylaşım Oranı:**
  > "Kar, fiili karın BİR YÜZDESI olarak paylaşılmalıdır, sabit bir tutar olarak değil. Yatırımcıya (Rabbü'l-Mal) sabit getiri garantisi veren herhangi bir şart, sözleşmeyi geçersiz kılar ve onu faize dönüştürür."

**Genel Yasaklar**
- **Riba (Faiz):**
  > "Ribanın (faiz) tüm şekilleri kesinlikle yasaktır; bunlar: (1) Riba al-Fadl (takasdaki fazlalık), (2) Riba al-Nesie (borç üzerindeki faiz)"

- **Garar (Aşırı Belirsizlik):**
  > "Aşırı belirsizlik içeren sözleşmeler (Garar Fahiş) batıldır."

- **Meysir (Kumar):**
  > "Kumara benzeyen spekülatif sözleşmeler (Meysir) yasaktır."

---

### 3. RAG Motor Yanıtları (`src/features/shariah/rag-engine.ts`)

#### Sistem Yanıt Şablonları

**Veri Bulunamadı:**
> "Bu sorgu için ilgili AAOIFI standardı bulunamadı. Lütfen soruyu yeniden ifade edin veya yetkili bir Şer'i alime danışın."

**Caiz Değil:**
> "CAİZ DEĞİLDİR. AAOIFI Standart No. X (Standart Adı), Madde Y'ye göre: '[Standart Metni]'"
- Gerekçe: "Şer'i olarak açıkça yasaklanan unsurlar içerir"
- Uyarı: "⚠️ KRİTİK İHLAL: Bu işlem batıl (geçersiz) olabilir"

**Şartlı Caiz:**
> "ŞARTLI CAİZDİR. Bu işlem, SADECE aşağıdaki zorunlu koşullar karşılanırsa caizdir: '[Koşullar]'"
- Gerekçe: "Zorunlu koşullara sıkı uyumu gerektirir"

**Caiz:**
> "CAİZDİR. AAOIFI Standart No. X (Standart Adı), Madde Y'ye göre: '[Standart Metni]'"
- Gerekçe: "Şer'i prensiplere uyumludur"

#### Örnek Sorular (Türkçe)
1. "Arabayı galeriden satın almadan müşteriye satabilir miyiz?"
2. "Sukuk'ta anapara garantisi vermek caiz midir?"
3. "Gecikmiş taksitler için gecikme faizi uygulayabilir miyiz?"
4. "Geçerli Murabaha'nın koşulları nelerdir?"
5. "Organize Teverruk caiz midir?"
6. "İcara'da kira ödemeleri LIBOR'a bağlanabilir mi?"
7. "Varlık teslimattan önce yok olursa ne olur?"
8. "Mudarebe'de sabit getiri garanti edebilir miyiz?"

---

## İslami Finans Terminolojisi

### Türkçe Terimler
| Arapça | Türkçe | Açıklama |
|--------|--------|----------|
| **Batıl** | Geçersiz | Hukuken hiç var olmamış sayılan işlem |
| **Fasit** | Bozuk | Düzeltilebilir kusurlu işlem |
| **Caiz** | Caiz | Şer'i olarak izin verilen |
| **Mekruh** | Hoş Karşılanmayan | Caiz ama tercih edilmeyen |
| **Haram** | Yasak | Kesinlikle yasaklanan |
| **Garar** | Belirsizlik | Sözleşmede aşırı muğlaklık |
| **Riba** | Faiz | Karşılıksız artış, tefecilik |
| **Meysir** | Kumar | Şansa dayalı kazanç |
| **Va'd** | Vaad | Tek taraflı taahhüt |
| **Zilyetlik** | Zilyetlik | Malın fiilen veya hükmen elde bulundurulması |

### Fıkhi Kavramlar
- **Rabbü'l-Mal:** Sermaye sağlayıcı (Mudarebe'de)
- **Müdarib:** İşletici, girişimci (Mudarebe'de)
- **Hile:** Şer'i yasağı dolanma amacıyla yapılan hukuki manevra
- **İcara Müntehiye Bi't-Temlik:** Mülkiyetle sonuçlanan kiralama

---

## Teknik Detaylar

### Değişiklik Yapılan Dosyalar
1. `/src/pages/shariah/FatwaGPTPage.tsx` - Kullanıcı arayüzü
2. `/src/features/shariah/data/aaoifi_standards.ts` - AAOIFI standartları veri tabanı
3. `/src/features/shariah/rag-engine.ts` - RAG motor yanıt şablonları

### Kod Standartları
- **Kod:** İngilizce (değişken, fonksiyon, yorum)
- **UI:** Türkçe (görünen tüm metinler)
- **Veri:** Türkçe (standart metinleri, örnekler)

### Derleme Durumu
✅ Build başarılı - Hata yok
✅ TypeScript tip kontrolü geçti
✅ Tüm yerelleştirme testleri başarılı

---

## Kullanım Örnekleri

### Örnek Senaryo 1: Murabaha Sorgusu
**Kullanıcı Sorusu:**
> "Arabayı galeriden satın almadan müşteriye satabilir miyiz?"

**Sistem Yanıtı:**
> **CAİZ DEĞİLDİR** ❌
>
> AAOIFI Standart No. 8 (Murabaha), Madde 2/1/3'e göre: "Kurum, emtiayı (varlığı) müşteriye satmadan önce mülkiyetine almalı ve fiili veya hükmi zilyetliği ele geçirmelidir. Mülkiyetten önce satış, akdi batıl (geçersiz) kılar."
>
> **Gerekçe:**
> - Şer'i olarak açıkça yasaklanan unsurlar içerir
>
> **Uyarı:**
> ⚠️ KRİTİK İHLAL: Bu işlem batıl (geçersiz) olabilir
>
> **Risk Seviyesi:** KRİTİK RİSK

### Örnek Senaryo 2: Teverruk Sorgusu
**Kullanıcı Sorusu:**
> "Organize Teverruk caiz midir?"

**Sistem Yanıtı:**
> **CAİZ DEĞİLDİR** ❌
>
> AAOIFI Standart No. 30 (Teverruk), Madde 2/2'ye göre: "Organize Teverruk (Teverruk Munazzam), emtia asıl satıcıya geri dönerse veya kurum tüm zinciri düzenlerse CAİZ DEĞİLDİR. Bu, faiz yasağını dolanmak için bir hukuki hile (hile) teşkil eder."

---

## Sonuç

Fetva-GPT modülü artık tam olarak Türkçe'dir ve profesyonel İslami finans terminolojisi kullanmaktadır. Sistem:

1. ✅ Türkçe sorular kabul eder
2. ✅ Türkçe yanıtlar üretir
3. ✅ Türkçe AAOIFI standartlarını kaynak gösterir
4. ✅ Doğru fıkhi terminoloji kullanır (Batıl, Caiz, Mekruh, vb.)
5. ✅ Türk bankacılık sektörü için uygundur

**Önemli Not:** Kod tabanı İngilizce kalarak uluslararası standartlara uygun geliştirilmeye devam edebilir, ancak son kullanıcı deneyimi tamamen Türkçedir.
