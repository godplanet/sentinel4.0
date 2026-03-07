const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '..', 'supabase', 'seed.sql');

const shariahData = `

-- =============================================================================
-- 17. WAVE 17: SHARIAH RULINGS (AAOIFI STANDARDS FATWA-GPT RAG MOTORU)
-- =============================================================================

INSERT INTO public.shariah_rulings (id, standard_no, standard_name, section, article_no, text, ruling, risk_level, keywords, "references") VALUES
('a0000000-0000-0000-0000-000000000001', '8', 'Murabaha', 'Geçerlilik Şartları', '2/1/3', 'Kurum, emtiayı (varlığı) müşteriye satmadan önce mülkiyetine almalı ve fiili veya hükmi zilyetliği ele geçirmelidir. Mülkiyetten önce satış, akdi batıl (geçersiz) kılar.', 'mandatory', 'critical', '{"mülkiyet", "zilyetlik", "emtia", "satış", "batıl", "geçersiz"}', '{"Hadis: ''Sahip olmadığın şeyi satma'' (Tirmizi 1232)"}'),
('a0000000-0000-0000-0000-000000000002', '8', 'Murabaha', 'Satın Alma Vaadi', '3/1', 'Müşterinin tek taraflı satın alma vaadi (va''d), çoğunluk görüşüne göre vaad vereni bağlar. Kurum, müşteri haklı sebep olmaksızın vaadinden dönerse fiili zararlarının tazminini talep edebilir.', 'permissible', 'medium', '{"vaad", "va''d", "bağlayıcı", "ihlal", "zarar", "tazminat"}', '{"İslam Fıkıh Akademisi Kararı 40-41"}'),
('a0000000-0000-0000-0000-000000000003', '8', 'Murabaha', 'Risk ve Sorumluluk', '4/2', 'Kurum, satın alma ile müşteriye teslimat arasındaki dönemde emtiaya ilişkin tüm riskleri üstlenir. Bu, tahribat, ayıp veya piyasa fiyat dalgalanmasını içerir.', 'mandatory', 'high', '{"risk", "sorumluluk", "tahribat", "ayıp", "fiyat dalgalanması"}', '{}'),
('a0000000-0000-0000-0000-000000000004', '8', 'Murabaha', 'Fiyat Bileşimi', '5/3/1', 'Satış fiyatı açıkça belirtilmelidir; maliyet fiyatı artı kar marjından oluşur. Gizli masraflar veya belirsiz maliyet unsurları, şeffaflık gereksinimini (garar) ihlal eder.', 'mandatory', 'high', '{"fiyat", "maliyet", "kar", "marj", "şeffaflık", "garar", "açıklama"}', '{}'),

('a0000000-0000-0000-0000-000000000005', '30', 'Teverruk', 'Organize Teverruk', '2/2', 'Organize Teverruk (Teverruk Munazzam), emtia asıl satıcıya geri dönerse veya kurum tüm zinciri düzenlerse CAİZ DEĞİLDİR. Bu, faiz yasağını dolanmak için bir hukuki hile (hile) teşkil eder.', 'prohibited', 'critical', '{"organize teverruk", "munazzam", "yasaklanmış", "hile", "faiz", "dolanma", "döngüsel"}', '{"İİT Fıkıh Akademisi Kararı 179 (19/5)"}'),
('a0000000-0000-0000-0000-000000000006', '30', 'Teverruk', 'Klasik Teverruk', '3/1', 'Klasik Teverruk şu şartlarda caizdir: (1) müşteri emtiayı bağımsız olarak tedarik eder, (2) gerçek zilyetliği ele geçirir ve (3) kurumsal düzenleme olmaksızın üçüncü tarafa satar. Kurum ikinci satışa dahil olmamalıdır.', 'permissible', 'low', '{"klasik", "bağımsız", "zilyetlik", "üçüncü taraf", "caiz"}', '{}'),

('a0000000-0000-0000-0000-000000000007', '17', 'Sukuk', 'Varlık Mülkiyeti', '2/1/1', 'Sukuk sahipleri, dayanak varlıkların GERÇEK ve ORANTILI mülkiyetine sahip olmalıdır. Gerçek risk paylaşımı olmaksızın hükmi veya nominal mülkiyet caiz değildir. Varlıklar şer''i uyumlu ve tanımlanabilir olmalıdır.', 'mandatory', 'critical', '{"sukuk", "mülkiyet", "gerçek", "orantılı", "hükmi", "risk paylaşımı", "varlıklar"}', '{"AAOIFI Şer''i Standart No. 17"}'),
('a0000000-0000-0000-0000-000000000008', '17', 'Sukuk', 'İtfa Koşulları', '4/3', 'İhraççı, vade sonunda anapara tutarını garanti edemez. Piyasa değeri veya net varlık değeri üzerinden satın alma taahhüdü (va''d) caizdir, ancak nominal değer üzerinden garantili geri alım, sukuku bir borç enstrümanına (Faiz) dönüştürür.', 'prohibited', 'critical', '{"itfa", "garanti", "anapara", "geri alım", "nominal değer", "borç", "faiz"}', '{}'),
('a0000000-0000-0000-0000-000000000009', '17', 'Sukuk', 'Kar Dağıtımı', '5/2', 'Kar dağıtımı, dayanak varlıkların fiili performansını yansıtmalıdır. Varlık performansına bağlı olmayan önceden belirlenmiş sabit getiriler, konvansiyonel faize (Riba al-Nesie) benzediği için yasaktır.', 'prohibited', 'critical', '{"kar", "dağıtım", "sabit", "getiri", "önceden belirlenmiş", "faiz", "riba"}', '{}'),

('a0000000-0000-0000-0000-000000000010', '9', 'İcara', 'Mülkiyet ve Bakım', '3/1/2', 'Kiraya veren (kurum), kiralanan varlığın mülkiyetini elinde tutmalı ve büyük bakım maliyetlerini üstlenmelidir. Mülkiyet unvanını korurken mülkiyet risklerini kiracıya devretmek caiz değildir.', 'mandatory', 'high', '{"icara", "kiraya veren", "mülkiyet", "bakım", "büyük onarımlar", "kiracı"}', '{}'),
('a0000000-0000-0000-0000-000000000011', '9', 'İcara', 'Kira Belirleme', '4/5', 'Kira tutarları sabit veya değişken (kıyaslamalı) olabilir, ancak faiz oranlarına (LIBOR, SOFR) bağlanamaz çünkü bu faiz riski yaratır. Varlık performansına dayalı alternatif kıyaslamalar kabul edilebilir.', 'prohibited', 'high', '{"kira", "sabit", "değişken", "kıyaslama", "libor", "faiz", "riba"}', '{}'),
('a0000000-0000-0000-0000-000000000012', '9', 'İcara', 'İcara Müntehiye Bi''t-Temlik', '6/1', 'Mülkiyet devri ile sonuçlanan kiralama (İcara Müntehiye Bi''t-Temlik), mülkiyet devrinin şu yollarla gerçekleşmesi halinde caizdir: (1) son ödeme sonrası hibe, (2) sembolik/piyasa değerinde satış veya (3) kademeli mülkiyet devri. Sıfır maliyetle otomatik devir hoş karşılanmaz.', 'permissible', 'low', '{"mülkiyete dönüşen kiralama", "müntehiye bi''t-temlik", "mülkiyet devri", "hibe", "satış"}', '{}'),

('a0000000-0000-0000-0000-000000000013', '13', 'Mudarebe', 'Kar Paylaşım Oranı', '2/1/4', 'Kar, fiili karın BİR YÜZDESI olarak paylaşılmalıdır, sabit bir tutar olarak değil. Yatırımcıya (Rabbü''l-Mal) sabit getiri garantisi veren herhangi bir şart, sözleşmeyi geçersiz kılar ve onu faize dönüştürür.', 'mandatory', 'critical', '{"mudarebe", "kar paylaşımı", "yüzde", "sabit getiri", "garanti", "faiz"}', '{}'),
('a0000000-0000-0000-0000-000000000014', '13', 'Mudarebe', 'Zarar Paylaşımı', '3/2', 'Mali zararlar, yöneticinin (Müdarib) ihmali veya sözleşme ihlalinden kaynaklanmadıkça, tamamen sermaye sağlayıcı (Rabbü''l-Mal) tarafından karşılanır. Müdarib sadece zamanını ve emeğini kaybeder.', 'mandatory', 'high', '{"zarar", "sermaye sağlayıcı", "rabbü''l-mal", "müdarib", "ihmal", "ihlal"}', '{}'),

('a0000000-0000-0000-0000-000000000015', '0', 'Genel Yasaklar', 'Riba (Faiz)', 'GEN-1', 'Ribanın (faiz) tüm şekilleri kesinlikle yasaktır; bunlar: (1) Riba al-Fadl (takasdaki fazlalık), (2) Riba al-Nesie (borç üzerindeki faiz) ve (3) gerçek risk paylaşımı olmaksızın anapara artı önceden belirlenmiş getiriyi garanti eden sözleşme şartlarıdır.', 'prohibited', 'critical', '{"riba", "faiz", "tefecilik", "yasak", "borç", "fazlalık"}', '{"Kuran 2:275", "Hadis Sahih Müslim 1598"}'),
('a0000000-0000-0000-0000-000000000016', '0', 'Genel Yasaklar', 'Garar (Aşırı Belirsizlik)', 'GEN-2', 'Aşırı belirsizlik içeren sözleşmeler (Garar Fahiş) batıldır. Bu şunları içerir: tanımsız fiyat, belirsiz teslimat, var olmayan malların satışı veya muğlak sözleşme şartları. Küçük belirsizlik (Garar Yesir) tolere edilir.', 'prohibited', 'high', '{"garar", "belirsizlik", "tanımsız", "muğlak", "batıl", "var olmayan"}', '{}'),
('a0000000-0000-0000-0000-000000000017', '0', 'Genel Yasaklar', 'Meysir (Kumar)', 'GEN-3', 'Kumara benzeyen spekülatif sözleşmeler (Meysir) yasaktır. Bu, kazancın dayanak ekonomik faaliyetten veya gerçek ticaretten ziyade tamamen şansa dayalı olduğu türevleri içerir.', 'prohibited', 'critical', '{"meysir", "kumar", "spekülasyon", "türevler", "şans"}', '{}')
ON CONFLICT DO NOTHING;
`;

fs.appendFileSync(seedPath, shariahData);
console.log("Appended AAOIFI data to seed.sql!");
