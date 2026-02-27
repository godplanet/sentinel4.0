export interface RKMExcelRow {
  risk_code: string;
  risk_title: string;
  risk_description: string;
  risk_owner: string;
  risk_status: string;
  main_process: string;
  sub_process: string;
  process_step: string;
  process_type: string;
  risk_category: string;
  risk_subcategory: string;
  risk_event_description: string;
  risk_cause: string;
  risk_consequence: string;
  potential_loss_amount: number;
  inherent_impact: number;
  inherent_likelihood: number;
  inherent_volume: number;
  control_objective: string;
  control_description: string;
  control_type: string;
  control_nature: string;
  control_frequency: string;
  control_owner: string;
  control_department: string;
  control_design_rating: number;
  control_operating_rating: number;
  last_test_date: string;
  test_result: string;
  test_evidence_ref: string;
  residual_impact: number;
  residual_likelihood: number;
  bddk_reference: string;
  iso27001_reference: string;
  cobit_reference: string;
  masak_reference: string;
  sox_reference: string;
  gdpr_reference: string;
  risk_response_strategy: string;
  mitigation_plan: string;
  mitigation_owner: string;
  mitigation_deadline: string;
  mitigation_status: string;
  mitigation_cost: number;
  monitoring_frequency: string;
  escalation_threshold: string;
  last_review_date: string;
  next_review_date: string;
  reviewer_name: string;
  last_audit_date: string;
  audit_finding_ref: string;
  audit_rating: string;
  management_action_plan: string;
  action_due_date: string;
}

export function generateRKMTemplate(): string {
  const headers = [
    'risk_code',
    'risk_title',
    'risk_description',
    'risk_owner',
    'risk_status',
    'main_process',
    'sub_process',
    'process_step',
    'process_type',
    'risk_category',
    'risk_subcategory',
    'risk_event_description',
    'risk_cause',
    'risk_consequence',
    'potential_loss_amount',
    'inherent_impact',
    'inherent_likelihood',
    'inherent_volume',
    'control_objective',
    'control_description',
    'control_type',
    'control_nature',
    'control_frequency',
    'control_owner',
    'control_department',
    'control_design_rating',
    'control_operating_rating',
    'last_test_date',
    'test_result',
    'test_evidence_ref',
    'residual_impact',
    'residual_likelihood',
    'bddk_reference',
    'iso27001_reference',
    'cobit_reference',
    'masak_reference',
    'sox_reference',
    'gdpr_reference',
    'risk_response_strategy',
    'mitigation_plan',
    'mitigation_owner',
    'mitigation_deadline',
    'mitigation_status',
    'mitigation_cost',
    'monitoring_frequency',
    'escalation_threshold',
    'last_review_date',
    'next_review_date',
    'reviewer_name',
    'last_audit_date',
    'audit_finding_ref',
    'audit_rating',
    'management_action_plan',
    'action_due_date',
  ];

  const sampleRow = [
    'R-001',
    'Örnek Risk Başlığı',
    'Risk tanımı ve açıklaması',
    'Risk Sahibi Adı',
    'ACTIVE',
    'Ana Süreç',
    'Alt Süreç',
    'Süreç Adımı',
    'TEMEL',
    'Operasyonel',
    'Alt Kategori',
    'Risk olayı açıklaması',
    'Risk nedeni',
    'Risk sonucu',
    '1000000',
    '4',
    '3',
    '4',
    'Kontrol hedefi',
    'Kontrol açıklaması',
    'PREVENTIVE',
    'AUTOMATED',
    'MONTHLY',
    'Kontrol Sahibi',
    'Departman Adı',
    '4',
    '4',
    '2024-01-01',
    'EFFECTIVE',
    'EVD-001',
    '2',
    '2',
    'BDDK Madde X',
    'ISO 27001 A.X.X',
    'COBIT APO12.04',
    'MASAK Madde X',
    'SOX Section X',
    'GDPR Article X',
    'MITIGATE',
    'İyileştirme planı',
    'Aksiyon Sahibi',
    '2024-12-31',
    'IN_PROGRESS',
    '50000',
    'QUARTERLY',
    'Eşik değer',
    '2024-01-01',
    '2024-06-30',
    'Gözden Geçiren',
    '2024-01-15',
    'AUD-001',
    'SATISFACTORY',
    'Yönetim aksiyon planı',
    '2024-06-30',
  ];

  const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `RKM_Sablonu_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return 'Template downloaded successfully';
}

export function parseCSVFile(file: File): Promise<RKMExcelRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter((line) => line.trim());

        if (lines.length < 2) {
          reject(new Error('CSV dosyası boş veya geçersiz'));
          return;
        }

        const headers = lines[0].split(',').map((h) => h.trim());
        const rows: RKMExcelRow[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v) => v.trim());
          const row: any = {};

          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          rows.push(row as RKMExcelRow);
        }

        resolve(rows);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Dosya okuma hatası'));
    reader.readAsText(file);
  });
}

export function exportRKMToExcel(data: any[]): void {
  if (!data || data.length === 0) {
    alert('Dışa aktarılacak veri bulunamadı');
    return;
  }

  const headers = [
    'Risk Kodu',
    'Risk Başlığı',
    'Risk Açıklaması',
    'Risk Sahibi',
    'Durum',
    'Ana Süreç',
    'Alt Süreç',
    'Süreç Adımı',
    'Süreç Tipi',
    'Risk Kategorisi',
    'Risk Alt Kategorisi',
    'Risk Olay Açıklaması',
    'Risk Nedeni',
    'Risk Sonucu',
    'Potansiyel Kayıp Tutarı',
    'İçsel Etki',
    'İçsel Olasılık',
    'İçsel Hacim',
    'İçsel Skor',
    'İçsel Seviye',
    'Kontrol Hedefi',
    'Kontrol Açıklaması',
    'Kontrol Tipi',
    'Kontrol Yapısı',
    'Kontrol Sıklığı',
    'Kontrol Sahibi',
    'Kontrol Departmanı',
    'Kontrol Tasarım Puanı',
    'Kontrol Operasyon Puanı',
    'Kontrol Etkinliği',
    'Son Test Tarihi',
    'Test Sonucu',
    'Test Kanıt Ref.',
    'Artık Etki',
    'Artık Olasılık',
    'Artık Skor',
    'Artık Seviye',
    'BDDK Referansı',
    'ISO 27001 Referansı',
    'COBIT Referansı',
    'MASAK Referansı',
    'SOX Referansı',
    'GDPR Referansı',
    'Risk Müdahale Stratejisi',
    'İyileştirme Planı',
    'İyileştirme Sahibi',
    'İyileştirme Teslim Tarihi',
    'İyileştirme Durumu',
    'İyileştirme Maliyeti',
    'İzleme Sıklığı',
    'Eskalasyon Eşiği',
    'Son Gözden Geçirme Tarihi',
    'Sonraki Gözden Geçirme Tarihi',
    'Gözden Geçiren',
    'Son Denetim Tarihi',
    'Denetim Bulgu Ref.',
    'Denetim Puanı',
    'Yönetim Aksiyon Planı',
    'Aksiyon Teslim Tarihi',
  ];

  const rows = data.map((item) => [
    item.risk_code || '',
    item.risk_title || '',
    item.risk_description || '',
    item.risk_owner || '',
    item.risk_status || '',
    item.main_process || '',
    item.sub_process || '',
    item.process_step || '',
    item.process_type || '',
    item.risk_category || '',
    item.risk_subcategory || '',
    item.risk_event_description || '',
    item.risk_cause || '',
    item.risk_consequence || '',
    item.potential_loss_amount || '',
    item.inherent_impact || '',
    item.inherent_likelihood || '',
    item.inherent_volume || '',
    item.inherent_score || '',
    item.inherent_rating || '',
    item.control_objective || '',
    item.control_description || '',
    item.control_type || '',
    item.control_nature || '',
    item.control_frequency || '',
    item.control_owner || '',
    item.control_department || '',
    item.control_design_rating || '',
    item.control_operating_rating || '',
    item.control_effectiveness || '',
    item.last_test_date || '',
    item.test_result || '',
    item.test_evidence_ref || '',
    item.residual_impact || '',
    item.residual_likelihood || '',
    item.residual_score || '',
    item.residual_rating || '',
    item.bddk_reference || '',
    item.iso27001_reference || '',
    item.cobit_reference || '',
    item.masak_reference || '',
    item.sox_reference || '',
    item.gdpr_reference || '',
    item.risk_response_strategy || '',
    item.mitigation_plan || '',
    item.mitigation_owner || '',
    item.mitigation_deadline || '',
    item.mitigation_status || '',
    item.mitigation_cost || '',
    item.monitoring_frequency || '',
    item.escalation_threshold || '',
    item.last_review_date || '',
    item.next_review_date || '',
    item.reviewer_name || '',
    item.last_audit_date || '',
    item.audit_finding_ref || '',
    item.audit_rating || '',
    item.management_action_plan || '',
    item.action_due_date || '',
  ]);

  const csvContent = [
    headers.map((h) => `"${h}"`).join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `RKM_Export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
