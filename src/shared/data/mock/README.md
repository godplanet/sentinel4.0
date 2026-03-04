# SIFIR MOCK VERİ POLİTİKASI

Bu projede **sahte veri (mock) dosyaları** .cursorrules ve FSD gereği kullanılmamaktadır. Tüm veri çekme işlemleri **Supabase** üzerinden `@tanstack/react-query` (useQuery / useMutation) ile yapılır.

## Kaldırılan mock dosyaları (Büyük Temizlik)

Aşağıdaki dosyalar projeden **tamamen silindi**; ilgili ekranlar Supabase tablolarına bağlandı:

| Kaldırılan dosya | Bağlanan kaynak |
|------------------|-----------------|
| `entities/strategy/api/mock-data.ts` | `strategic_bank_goals`, `strategic_audit_objectives` (StrategyDashboard useQuery + goals.ts) |
| `features/universe/api/mock-data.ts` | `audit_entities` (useAuditUniverseLive / universe-live-api) |
| `features/finding-hub/api/mock-hub-data.ts` | `audit_findings` (getAllFindings / useQuery) |
| `widgets/ResurrectionWatch/api/mock-data.ts` | `actions` (status=risk_accepted, fetchRiskAcceptances) |
| `entities/finding/api/mock-data.ts` | Kullanılmıyordu; silindi |

## Kurallar

- **Mock data dosyası oluşturma:** Yeni `mock-data.ts` veya `dummy` dosyaları eklenmez.
- **Veri çekme:** Bileşenlerde `useEffect` + `useState` ile veri çekmek yasaktır; `useQuery` / `useMutation` kullanılır.
- **Boş / yükleme durumu:** Veri yoksa veya yüklenirken Loading (Loader2/Skeleton) ve Empty State ("Kayıt bulunamadı") UI gösterilir.

## Diğer mock kullanımları (dokümante)

Başka özelliklerde hâlâ inline mock veya demo veri kullanılıyorsa, bu README'de listelenir ve Supabase/API ile değiştirilmesi hedeflenir.
