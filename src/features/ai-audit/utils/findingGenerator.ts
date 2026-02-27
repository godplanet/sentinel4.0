export interface GeneratedFinding {
  title: string;
  description: string;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  criteria_suggestion: string;
  severity: string;
}

export const generateDraftFromNotes = (notes: string): GeneratedFinding => {
  const lowerNotes = notes.toLowerCase();

  const keywords = {
    documentation: ['dokümantasyon', 'belge', 'evrak', 'eksik', 'kayıt', 'dosya'],
    fraud: ['hile', 'fraud', 'sahte', 'usulsüz', 'zimmet', 'çalma', 'şüpheli'],
    control: ['kontrol', 'approval', 'onay', 'yetki', 'segregation', 'separation'],
    compliance: ['uyumsuz', 'mevzuat', 'bddk', 'compliance', 'ihlal', 'regulation'],
    system: ['sistem', 'log', 'access', 'erişim', 'security', 'güvenlik'],
    operational: ['operasyonel', 'süreç', 'process', 'prosedür', 'iş akışı'],
  };

  let category = 'operational';
  let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';

  if (keywords.fraud.some((kw) => lowerNotes.includes(kw))) {
    category = 'fraud';
    riskLevel = 'Critical';
  } else if (keywords.compliance.some((kw) => lowerNotes.includes(kw))) {
    category = 'compliance';
    riskLevel = 'High';
  } else if (keywords.control.some((kw) => lowerNotes.includes(kw))) {
    category = 'control';
    riskLevel = 'High';
  } else if (keywords.system.some((kw) => lowerNotes.includes(kw))) {
    category = 'system';
    riskLevel = 'Medium';
  } else if (keywords.documentation.some((kw) => lowerNotes.includes(kw))) {
    category = 'documentation';
    riskLevel = 'Medium';
  }

  const templates = {
    fraud: {
      title: 'Kritik Kontrol Zafiyeti - Şüpheli İşlem Tespiti',
      description: `Denetim sırasında yapılan incelemelerde şüpheli işlem belirtileri tespit edilmiştir:\n\n${notes}\n\n**Tespit Edilen Durumlar:**\n- İşlem akışında anormal pattern'ler gözlemlenmiştir\n- Kontrol mekanizmaları yeterli düzeyde çalışmamaktadır\n- Acil aksiyon alınması gerekmektedir\n\n**Öneri:**\n- Detaylı forensic inceleme başlatılmalı\n- İlgili personel ile görüşme yapılmalı\n- Kontrol mekanizmaları güçlendirilmeli`,
      criteria: 'GIAS 18.3 - Critical Risk Controls, Basel III Operational Risk Framework',
      severity: 'CRITICAL',
    },
    compliance: {
      title: 'Mevzuat Uyumsuzluğu Tespiti',
      description: `Düzenleyici gereksinimlere uyum konusunda eksiklikler belirlenmiştir:\n\n${notes}\n\n**Uyumsuzluk Alanları:**\n- Mevzuat gerekliliklerine tam uyum sağlanamamıştır\n- Dokümantasyon ve raporlama eksiklikleri mevcuttur\n- Düzeltici aksiyonlar gereklidir\n\n**Öneri:**\n- Uyum programı güncellenmelidir\n- İlgili personele eğitim verilmelidir\n- Periyodik kontrol mekanizması kurulmalıdır`,
      criteria: 'BDDK Mevzuatı, GIAS 12.1 - Regulatory Compliance',
      severity: 'HIGH',
    },
    control: {
      title: 'İç Kontrol Zafiyeti',
      description: `İç kontrol sisteminde önemli eksiklikler tespit edilmiştir:\n\n${notes}\n\n**Kontrol Zafiyetleri:**\n- Görev ayrılığı prensibine uyum sağlanamamıştır\n- Onay mekanizmaları etkin değildir\n- Kontrol aktiviteleri dokümante edilmemiştir\n\n**Öneri:**\n- Yetki matrisi gözden geçirilmelidir\n- Otomatik kontroller devreye alınmalıdır\n- Kontrol aktiviteleri güçlendirilmelidir`,
      criteria: 'COSO Internal Control Framework, GIAS 16.2',
      severity: 'HIGH',
    },
    system: {
      title: 'Sistem Güvenliği ve Erişim Kontrolü Zafiyeti',
      description: `Bilgi sistemleri ve erişim kontrollerinde eksiklikler gözlemlenmiştir:\n\n${notes}\n\n**Sistem Zafiyetleri:**\n- Erişim yetkileri periyodik olarak gözden geçirilmemektedir\n- Log kayıtları yeterli düzeyde tutulmamaktadır\n- Sistem güvenlik ayarları güçlendirilmelidir\n\n**Öneri:**\n- Erişim hakları envanteri çıkarılmalıdır\n- Log monitoring sistemi kurulmalıdır\n- Güvenlik parametreleri revize edilmelidir`,
      criteria: 'ISO 27001, NIST Cybersecurity Framework, GIAS 19.1',
      severity: 'MEDIUM',
    },
    documentation: {
      title: 'Dokümantasyon Eksikliği',
      description: `Denetim sürecinde belge ve dokümantasyon eksiklikleri tespit edilmiştir:\n\n${notes}\n\n**Tespit Edilen Eksiklikler:**\n- Gerekli belgeler dosyada mevcut değildir\n- Prosedürler güncel ve tam değildir\n- Kayıt tutma sistemi yetersizdir\n\n**Öneri:**\n- Eksik belgeler temin edilmelidir\n- Dokümantasyon prosedürü oluşturulmalıdır\n- Periyodik kontrol mekanizması kurulmalıdır`,
      criteria: 'GIAS 15.1 - Documentation Standards, ISO 9001',
      severity: 'MEDIUM',
    },
    operational: {
      title: 'Operasyonel Risk Tespiti',
      description: `Operasyonel süreçlerde iyileştirme gerektiren alanlar belirlenmiştir:\n\n${notes}\n\n**Tespit Edilen Durumlar:**\n- Süreç etkinliği artırılmalıdır\n- İş akışı optimizasyonu gereklidir\n- Prosedürel iyileştirmeler yapılmalıdır\n\n**Öneri:**\n- Süreç haritalaması yapılmalıdır\n- Best practice uygulamaları araştırılmalıdır\n- Sürekli iyileştirme programı başlatılmalıdır`,
      criteria: 'GIAS 17.1 - Operational Excellence, Basel III',
      severity: 'MEDIUM',
    },
  };

  const template = templates[category as keyof typeof templates];

  return {
    title: template.title,
    description: template.description,
    risk_level: riskLevel,
    criteria_suggestion: template.criteria,
    severity: template.severity,
  };
};

export const analyzeSentiment = (notes: string): {
  tone: 'neutral' | 'concern' | 'urgent';
  confidence: number;
} => {
  const lowerNotes = notes.toLowerCase();

  const urgentKeywords = ['acil', 'kritik', 'hemen', 'urgent', 'critical', 'şüpheli'];
  const concernKeywords = ['dikkat', 'önemli', 'eksik', 'sorun', 'problem'];

  const urgentCount = urgentKeywords.filter((kw) => lowerNotes.includes(kw)).length;
  const concernCount = concernKeywords.filter((kw) => lowerNotes.includes(kw)).length;

  if (urgentCount >= 2) {
    return { tone: 'urgent', confidence: 0.9 };
  } else if (urgentCount >= 1 || concernCount >= 2) {
    return { tone: 'concern', confidence: 0.7 };
  }

  return { tone: 'neutral', confidence: 0.5 };
};
