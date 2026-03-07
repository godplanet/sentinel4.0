/**
 * AAOIFI Şer'i Standartlar Bilgi Tabanı
 *
 * Bu veri seti, İslami finans hükümleri için otorite kaynaktır.
 * HALÜSINASYON YOK: Yapay Zeka SADECE bu metinleri kaynak gösterebilir.
 *
 * Yapı, AAOIFI'nin resmi standartlarını yansıtır:
 * - Murabaha (Maliyet + Kar Finansmanı)
 * - Teverruk (Nakitlaştırma)
 * - Sukuk (İslami Tahviller)
 * - İcara (Kiralama)
 * - Mudarebe (Kar Paylaşımı)
 */

export interface AAOIFIStandard {
  id: string;
  standard_name: string;
  standard_no: number;
  article_no: string;
  section: string;
  text: string;
  ruling: 'mandatory' | 'recommended' | 'permissible' | 'discouraged' | 'prohibited';
  risk_level: 'critical' | 'high' | 'medium' | 'low';
  keywords: string[];
  references?: string[];
}
