# Sentinel GRC v3.0 — Uçtan Uca Test Adımları

Seed verisi yüklendikten ve uygulama çalıştıktan sonra aşağıdaki adımlarla sistemi test edebilirsiniz.

---

## Ön Hazırlık

1. **Veritabanı sıfırlama ve seed (ilk kurulum veya tam sıfırlama)**
   ```bash
   npx supabase db reset --linked --yes
   ```
   Bağlı (linked) Supabase projesinde tüm migration'lar uygulanır ve `supabase/seed.sql` çalıştırılır (tenant, kullanıcılar, audit_entities, risk_constitution_v3, vb.). `--yes` onay istemeden çalıştırır.

2. **Uygulamayı başlat**
   ```bash
   npm run dev
   ```
   Tarayıcıda `http://localhost:5173` açılır.

3. **Giriş yap**
   - E-posta: `cae@sentinelbank.com.tr` (veya `auditor@sentinelbank.com.tr`)
   - Şifre: `123456`

---

## Test Senaryoları

### 1. Birim Karnesi (Entity Scorecard)

**Amaç:** Anayasa verisi ve denetim evreni ile Birim Karnesi sayfasının açıldığını doğrula.

| Adım | Aksiyon | Beklenen |
|------|--------|----------|
| 1.1 | Sol menüden **Raporlama ve Arşiv** > **Birim Karnesi** tıkla. | Sayfa açılır, "Birim karnesi yükleniyor..." kısa süre görünüp kaybolur. |
| 1.2 | Açılan sayfada birim seçicisini (dropdown) kontrol et. | Seed’deki denetim evreni birimleri listelenir (örn. Sentinel Katılım Bankası A.Ş., Risk Yönetimi Müdürlüğü, Bilgi Teknolojileri Grup Başkanlığı, vb.). |
| 1.3 | Farklı bir birim seç. | Final skor, bulgu özeti (Kritik/Yüksek/Orta/Düşük), Grading Waterfall ve Not Cetveli güncellenir. |
| 1.4 | Hiç bulgu olmayan bir birim seç. | Skor 100’e yakın, bulgu sayıları 0 görünür. |

**Veri kaynağı:** `audit_entities` + `audit_findings` (engagement üzerinden entity) + `risk_constitution_v3` (seed’de eklendi).

---

### 2. Risk Anayasası (Ayarlar)

**Amaç:** Risk Anayasası sayfasının seed’deki anayasa verisi ile açıldığını doğrula.

| Adım | Aksiyon | Beklenen |
|------|--------|----------|
| 2.1 | Sol menüden **Ayarlar** > **Risk Anayasası** (veya `/settings/risk-constitution`) aç. | Sayfa yüklenir, Not Aralıkları (A–E) ve Veto Kuralları bölümleri görünür. |
| 2.2 | Not aralıklarını (risk_ranges) kontrol et. | A: 80–100, B: 60–79, C: 40–59, D: 20–39, E: 0–19 ve renkler görünür. |
| 2.3 | (İsteğe bağlı) Bir aralık rengini veya etiketini değiştirip kaydet. | Değişiklik `risk_constitution_v3` tablosuna yazılır; Birim Karnesi’nde aynı anayasa kullanıldığı için değişiklik orada da yansır. |

---

### 3. Master Action Campaigns (Otonom İyileştirme)

**Amaç:** Kampanya listesinin veritabanından geldiğini doğrula.

| Adım | Aksiyon | Beklenen |
|------|--------|----------|
| 3.1 | İlgili sayfaya git (Aksiyon İş Tezgahı veya Campaign Manager widget’ının olduğu sayfa). | Seed’deki `master_action_campaigns` kayıtları listelenir (varsa). |
| 3.2 | Kampanya yoksa | "0 program" veya boş liste; çökme olmaz. |

---

### 4. Mevzuat İyileştirme Dosyası (Remediation Dossier)

**Amaç:** Kapatılmış aksiyon + kanıt varsa dosyanın açıldığını doğrula.

| Adım | Aksiyon | Beklenen |
|------|--------|----------|
| 4.1 | Remediation Dossier sayfasına git. | Seed’de `status=closed` aksiyon ve `action_evidence` kaydı varsa dosya içeriği (Finding, Execution & Aging, Evidence, Sign-Off) görünür. |
| 4.2 | Hiç kapatılmış aksiyon/kanıt yoksa | "Dosya bulunamadı" mesajı; çökme olmaz. |

---

### 5. Denetim Evreni ve Planlama

**Amaç:** Seed’deki birim ve plan verilerinin listelendiğini doğrula.

| Adım | Aksiyon | Beklenen |
|------|--------|----------|
| 5.1 | **Strateji** > **Denetim Evreni** (veya Audit Universe) aç. | Seed’deki audit_entities (ltree path ile) ağaç veya liste halinde görünür. |
| 5.2 | **Planlama** > **Yıllık Plan** veya **Gantt** aç. | Seed’deki audit_plans / audit_engagements görünür. |

---

## Hızlı Kontrol Listesi (Seed Sonrası)

- [ ] Giriş: `cae@sentinelbank.com.tr` / `123456`
- [ ] Birim Karnesi açılıyor, birim listesi dolu
- [ ] Risk Anayasası açılıyor, not aralıkları A–E görünüyor
- [ ] Denetim Evreni’nde birimler listeleniyor
- [ ] Campaign Manager ve Remediation Dossier hata vermeden açılıyor (veri yoksa boş/uyarı mesajı)

---

## Sorun Giderme

| Belirti | Olası neden | Çözüm |
|--------|-------------|--------|
| Birim Karnesi sürekli yükleniyor | `risk_constitution_v3` tablosu veya seed verisi yok | `npx supabase db reset` çalıştır; migration `20260301180000_create_risk_constitution_v3.sql` ve seed’deki `risk_constitution_v3` INSERT’inin uygulandığını kontrol et. |
| Birim listesi boş | `audit_entities` seed’i yüklenmemiş veya tenant uyumsuz | Seed’deki `audit_entities` INSERT’lerinin ve `ACTIVE_TENANT_ID` (`11111111-1111-1111-1111-111111111111`) ile uyumunu kontrol et. |
| Anayasa sayfası boş / hata | `risk_constitution_v3` RLS veya veri yok | RLS politikalarının anon/authenticated için SELECT/UPDATE izin verdiğini ve seed’in tek aktif satır eklediğini kontrol et. |

---

*Son güncelleme: Risk Constitution v3 migration ve seed eklendi; Birim Karnesi fallback tek kaynak (default-constitution.ts) ile hizalandı.*
