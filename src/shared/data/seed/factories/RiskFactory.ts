import { supabase } from '@/shared/api/supabase';
import { RISK_CATEGORIES } from '../datasets/banking-terms';
import { getRandomGIASCategory } from '../datasets/gias-categories';

export class RiskFactory {
  static async createRiskLibrary(tenantId: string): Promise<any[]> {
    const riskTemplates = [
      { title: 'Kredi Temerrüt Riski', category: 'Kredi Riski', impact: 5, likelihood: 4 },
      { title: 'Likidite Yetersizliği', category: 'Likidite Riski', impact: 5, likelihood: 3 },
      { title: 'Siber Saldırı', category: 'BT Güvenliği', impact: 5, likelihood: 4 },
      { title: 'KYC/AML Eksikliği', category: 'Uyum Riski', impact: 4, likelihood: 3 },
      { title: 'Piyasa Volatilitesi', category: 'Piyasa Riski', impact: 4, likelihood: 4 },
      { title: 'Operasyonel Hata - Manuel Süreçler', category: 'Operasyonel Risk', impact: 3, likelihood: 4 },
      { title: 'Model Risk - Stres Testi', category: 'Kredi Riski', impact: 4, likelihood: 2 },
      { title: 'Veri Kaybı', category: 'BT Güvenliği', impact: 5, likelihood: 2 },
      { title: 'Teminat Değerleme Hataları', category: 'Kredi Riski', impact: 3, likelihood: 3 },
      { title: 'BDDK Ceza Riski', category: 'Uyum Riski', impact: 4, likelihood: 2 },
      { title: 'Personel Hata ve İhmal', category: 'Operasyonel Risk', impact: 3, likelihood: 4 },
      { title: 'Yetkilendirme İhlalleri', category: 'BT Güvenliği', impact: 4, likelihood: 3 },
      { title: 'Faiz Oranı Değişimi', category: 'Piyasa Riski', impact: 3, likelihood: 4 },
      { title: 'Döviz Kuru Şoku', category: 'Piyasa Riski', impact: 4, likelihood: 3 },
      { title: 'NPL Artışı', category: 'Kredi Riski', impact: 4, likelihood: 3 },
      { title: 'İş Sürekliliği Kesintisi', category: 'Operasyonel Risk', impact: 5, likelihood: 2 },
      { title: 'MASAK Bildirim Eksikliği', category: 'Uyum Riski', impact: 4, likelihood: 2 },
      { title: 'Sistem Kesintisi', category: 'BT Güvenliği', impact: 4, likelihood: 3 },
      { title: 'Dolandırıcılık - Müşteri', category: 'Operasyonel Risk', impact: 3, likelihood: 3 },
      { title: 'Dolandırıcılık - İç', category: 'Operasyonel Risk', impact: 4, likelihood: 2 },
      { title: 'Üçüncü Taraf Risk', category: 'Operasyonel Risk', impact: 3, likelihood: 3 },
      { title: 'KVKK İhlali', category: 'Uyum Riski', impact: 4, likelihood: 3 },
      { title: 'Sermaye Yeterliliği Düşüklüğü', category: 'Likidite Riski', impact: 5, likelihood: 2 },
      { title: 'Konsantrasyon Riski - Sektör', category: 'Kredi Riski', impact: 4, likelihood: 3 },
      { title: 'Konsantrasyon Riski - Coğrafi', category: 'Kredi Riski', impact: 3, likelihood: 3 },
      { title: 'Aktif Pasif Uyumsuzluğu', category: 'Likidite Riski', impact: 4, likelihood: 3 },
      { title: 'Repo Karşı Taraf Riski', category: 'Piyasa Riski', impact: 3, likelihood: 2 },
      { title: 'Türev Araç Değerleme Hatası', category: 'Piyasa Riski', impact: 4, likelihood: 2 },
      { title: 'Yönetim Kurulu Etkinlik Eksikliği', category: 'Operasyonel Risk', impact: 4, likelihood: 2 },
      { title: 'İç Denetim Kaynak Yetersizliği', category: 'Operasyonel Risk', impact: 3, likelihood: 3 },
      { title: 'Ürün Geliştirme Onay Süreci', category: 'Operasyonel Risk', impact: 3, likelihood: 3 },
      { title: 'Müşteri Şikayet Yönetimi', category: 'İtibar Riski', impact: 3, likelihood: 4 },
      { title: 'Medya ve Sosyal Medya Krizi', category: 'İtibar Riski', impact: 4, likelihood: 3 },
      { title: 'Yönetici Anahtar Adam Riski', category: 'Operasyonel Risk', impact: 3, likelihood: 2 },
      { title: 'Dış Kaynak Kontrolsüzlüğü', category: 'Operasyonel Risk', impact: 3, likelihood: 3 },
      { title: 'Fiziksel Güvenlik Eksikliği', category: 'Operasyonel Risk', impact: 2, likelihood: 3 },
      { title: 'Afet ve Felaket Riski', category: 'Operasyonel Risk', impact: 5, likelihood: 1 },
      { title: 'Tazminat Davaları', category: 'Yasal Risk', impact: 3, likelihood: 2 },
      { title: 'Vergisel Uyumsuzluk', category: 'Uyum Riski', impact: 3, likelihood: 2 },
      { title: 'Sözleşme İhlali', category: 'Yasal Risk', impact: 3, likelihood: 2 },
      { title: 'Fikri Mülkiyet İhlali', category: 'Yasal Risk', impact: 2, likelihood: 1 },
      { title: 'Uluslararası Yaptırım İhlali', category: 'Uyum Riski', impact: 5, likelihood: 1 },
      { title: 'Stratejik Karar Hataları', category: 'Operasyonel Risk', impact: 4, likelihood: 2 },
      { title: 'Teknoloji Yatırım Başarısızlığı', category: 'Operasyonel Risk', impact: 3, likelihood: 3 },
      { title: 'Regülasyon Değişikliği Uyumsuzluğu', category: 'Uyum Riski', impact: 4, likelihood: 3 },
      { title: 'Yeşil Tahvil İhraç Riski', category: 'Piyasa Riski', impact: 2, likelihood: 2 },
      { title: 'ESG Raporlama Eksikliği', category: 'İtibar Riski', impact: 3, likelihood: 3 },
      { title: 'İklim Riski - Fiziksel', category: 'Operasyonel Risk', impact: 3, likelihood: 2 },
      { title: 'İklim Riski - Geçiş', category: 'Kredi Riski', impact: 3, likelihood: 3 },
      { title: 'Açık Kaynak Yazılım Güvenliği', category: 'BT Güvenliği', impact: 3, likelihood: 3 }
    ];

    const risks = riskTemplates.map((risk, idx) => {
      const gias = getRandomGIASCategory();
      return {
        tenant_id: tenantId,
        code: `RISK-${String(idx + 1).padStart(3, '0')}`,
        title: risk.title,
        description: `${risk.title} için detaylı risk tanımı ve etki analizi.`,
        category: risk.category,
        subcategory: gias.subcategory,
        inherent_impact: risk.impact,
        inherent_likelihood: risk.likelihood,
        control_effectiveness: 60 + Math.floor(Math.random() * 30), // 60-90%
        metadata: {
          gias_code: gias.code,
          owner: 'Risk Yönetimi',
          review_frequency: 'Quarterly'
        }
      };
    });

    const { data, error } = await supabase
      .from('risk_library')
      .insert(risks)
      .select();

    if (error) {
      console.error('Error creating risk library:', error);
      throw error;
    }

    return data || [];
  }

  static async createRiskAssessments(tenantId: string, entities: any[], risks: any[]): Promise<any[]> {
    const assessments: any[] = [];

    // Distribute 50 risk assessments across entities
    const targetCount = 50;
    for (let i = 0; i < targetCount; i++) {
      const entity = entities[Math.floor(Math.random() * entities.length)];
      const risk = risks[Math.floor(Math.random() * risks.length)];

      // Weighted distribution for heatmap
      let impact: number, likelihood: number;
      const distribution = Math.random();

      if (distribution < 0.04) {
        // 4% Critical zone (5,5)
        impact = 5;
        likelihood = 5;
      } else if (distribution < 0.14) {
        // 10% High zone
        impact = Math.random() > 0.5 ? 5 : 4;
        likelihood = Math.random() > 0.5 ? 4 : 5;
      } else if (distribution < 0.54) {
        // 40% Medium zone
        impact = 3;
        likelihood = 3;
      } else {
        // Rest distributed
        impact = Math.floor(Math.random() * 3) + 2; // 2-4
        likelihood = Math.floor(Math.random() * 3) + 2; // 2-4
      }

      const controlEffectiveness = 50 + Math.floor(Math.random() * 40); // 50-90%

      assessments.push({
        tenant_id: tenantId,
        entity_id: entity.id,
        risk_id: risk.id,
        assessment_date: new Date(2026, 0, Math.floor(Math.random() * 30) + 1).toISOString(),
        impact,
        likelihood,
        control_effectiveness: controlEffectiveness,
        residual_score: impact * likelihood * (1 - controlEffectiveness / 100),
        notes: `${entity.name} için ${risk.title} değerlendirmesi.`,
        assessor_id: null,
        status: 'APPROVED'
      });
    }

    const { data, error } = await supabase
      .from('risk_assessments')
      .insert(assessments)
      .select();

    if (error) {
      console.error('Error creating risk assessments:', error);
      throw error;
    }

    return data || [];
  }
}
