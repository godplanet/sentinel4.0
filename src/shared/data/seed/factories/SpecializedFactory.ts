import { supabase } from '@/shared/api/supabase';

export class CCMFactory {
  static async createPredatorAlerts(tenantId: string, entities: any[]): Promise<any[]> {
    const alertTypes = [
      'Benford Analizi Anomalisi',
      'Limit Aşım Tespit',
      'Şüpheli İşlem Paterni',
      'Yetkisiz Erişim Denemesi',
      'Veri Girişi Anomalisi',
      'Tekrarlayan İşlem Paterni',
      'Zaman Bazlı Anomali',
      'Tutarsız Veri Girişi'
    ];

    const severities = ['HIGH', 'MEDIUM', 'LOW'];
    const alerts: any[] = [];

    for (let i = 0; i < 50; i++) {
      const entity = entities[Math.floor(Math.random() * entities.length)];
      const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];

      const daysAgo = Math.floor(Math.random() * 60);
      const alertDate = new Date();
      alertDate.setDate(alertDate.getDate() - daysAgo);

      alerts.push({
        tenant_id: tenantId,
        entity_id: entity.id,
        alert_type: alertType,
        severity,
        title: `${alertType} - ${entity.name}`,
        description: `Otomatik izleme sistemi tarafından tespit edilmiştir.`,
        detected_at: alertDate.toISOString(),
        status: Math.random() > 0.3 ? 'REVIEWED' : 'OPEN',
        confidence_score: 0.6 + Math.random() * 0.4,
        metadata: {
          rule_id: `RULE-${Math.floor(Math.random() * 100)}`,
          threshold_exceeded: Math.random() > 0.5,
          affected_records: Math.floor(Math.random() * 1000)
        }
      });
    }

    const { data, error } = await supabase
      .from('ccm_alerts')
      .insert(alerts)
      .select();

    if (error) {
      console.error('Error creating CCM alerts:', error);
      throw error;
    }

    return data || [];
  }
}

export class GovernanceFactory {
  static async createBoardMeetings(tenantId: string, users: any[]): Promise<any[]> {
    const meetings: any[] = [];
    const managers = users.filter((u: any) => u.role === 'manager' || u.role === 'admin');

    for (let i = 0; i < 5; i++) {
      const meetingDate = new Date(2026, i * 2, 15);

      meetings.push({
        tenant_id: tenantId,
        title: `Denetim Komitesi Toplantısı ${i + 1}/2026`,
        meeting_date: meetingDate.toISOString().split('T')[0],
        location: 'Genel Müdürlük Toplantı Salonu',
        status: i < 2 ? 'COMPLETED' : 'SCHEDULED',
        agenda: [
          'Dönemsel denetim sonuçlarının sunumu',
          'Bulgu ve aksiyon planı güncellemeleri',
          'Risk değerlendirmesi',
          'Yıllık denetim planı onayı'
        ],
        minutes: i < 2 ? 'Toplantı tutanakları kaydedilmiştir.' : null,
        attendees: managers.slice(0, 3 + Math.floor(Math.random() * 3)).map((u: any) => u.id),
        metadata: {
          quarter: Math.floor(i / 3) + 1,
          action_items_count: 2 + Math.floor(Math.random() * 5)
        }
      });
    }

    const { data, error } = await supabase
      .from('board_meetings')
      .insert(meetings)
      .select();

    if (error) {
      console.error('Error creating board meetings:', error);
      throw error;
    }

    return data || [];
  }

  static async createGovernanceDocs(tenantId: string): Promise<any[]> {
    const docs = [
      { title: 'İç Denetim Yönergesi', type: 'Charter', category: 'Governance' },
      { title: 'Risk Yönetim Politikası', type: 'Policy', category: 'Risk Management' },
      { title: 'BDDK Denetim Raporu 2025', type: 'Report', category: 'Compliance' },
      { title: 'Bağımsızlık Beyanı Prosedürü', type: 'Procedure', category: 'Ethics' },
      { title: 'Yönetim Kurulu Sunumu Q1-2026', type: 'Presentation', category: 'Board Reporting' },
      { title: 'Denetim Komitesi Yönetmeliği', type: 'Charter', category: 'Governance' },
      { title: 'KYC/AML Politikası', type: 'Policy', category: 'Compliance' },
      { title: 'BT Güvenlik Politikası', type: 'Policy', category: 'IT Security' },
      { title: 'Ücret Politikası', type: 'Policy', category: 'HR' },
      { title: 'İş Sürekliliği Planı', type: 'Plan', category: 'Operations' },
      { title: 'Etik Kurallar Rehberi', type: 'Guide', category: 'Ethics' },
      { title: 'Veri Koruma ve KVKK Politikası', type: 'Policy', category: 'Compliance' },
      { title: 'Tedarikçi Değerlendirme Prosedürü', type: 'Procedure', category: 'Operations' },
      { title: 'Çıkar Çatışması Politikası', type: 'Policy', category: 'Ethics' },
      { title: 'Kurumsal Risk İştahı Beyanı', type: 'Statement', category: 'Risk Management' }
    ];

    const docRecords = docs.map(doc => ({
      tenant_id: tenantId,
      title: doc.title,
      document_type: doc.type,
      category: doc.category,
      version: '1.' + Math.floor(Math.random() * 5),
      status: 'APPROVED',
      approval_date: new Date(2025, Math.floor(Math.random() * 12), 1).toISOString().split('T')[0],
      next_review_date: new Date(2026, Math.floor(Math.random() * 12), 1).toISOString().split('T')[0],
      file_path: `/governance/${doc.title.replace(/\s+/g, '_')}.pdf`,
      metadata: {
        approver: 'Yönetim Kurulu',
        review_frequency: 'Annual'
      }
    }));

    const { data, error } = await supabase
      .from('governance_docs')
      .insert(docRecords)
      .select();

    if (error) {
      console.error('Error creating governance docs:', error);
      throw error;
    }

    return data || [];
  }
}

export class TimesheetFactory {
  static async createTimesheets(tenantId: string, engagements: any[], users: any[]): Promise<any[]> {
    const timesheets: any[] = [];
    const auditors = users.filter((u: any) => u.role === 'auditor' || u.role === 'manager');

    // Generate timesheets for the past 2 months
    const startDate = new Date('2024-12-01');
    const endDate = new Date('2026-02-09');

    auditors.forEach(auditor => {
      // Each auditor logs 10-15 days per month
      const workDays = 20 + Math.floor(Math.random() * 20);

      for (let i = 0; i < workDays; i++) {
        const randomDays = Math.floor(Math.random() * ((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        const workDate = new Date(startDate.getTime() + randomDays * 24 * 60 * 60 * 1000);

        const engagement = engagements[Math.floor(Math.random() * engagements.length)];
        const hours = 4 + Math.floor(Math.random() * 5); // 4-8 hours

        timesheets.push({
          tenant_id: tenantId,
          user_id: auditor.id,
          engagement_id: engagement.id,
          work_date: workDate.toISOString().split('T')[0],
          hours,
          activity_type: ['Fieldwork', 'Planning', 'Reporting', 'Review'][Math.floor(Math.random() * 4)],
          description: `${engagement.title} - Saha çalışması`,
          billable: true,
          status: 'APPROVED'
        });
      }
    });

    const { data, error } = await supabase
      .from('timesheets')
      .insert(timesheets)
      .select();

    if (error) {
      console.error('Error creating timesheets:', error);
      throw error;
    }

    return data || [];
  }
}

export class QAIPFactory {
  static async createKPIs(tenantId: string): Promise<any[]> {
    const kpis = [
      { name: 'Plan Uyum Oranı (%)', target: 95, actual: 92, unit: '%' },
      { name: 'Bulgu Kapatma Süresi (Gün)', target: 90, actual: 105, unit: 'days' },
      { name: 'Bütçe Kullanım Oranı (%)', target: 100, actual: 98, unit: '%' },
      { name: 'Müşteri Memnuniyeti', target: 4.5, actual: 4.2, unit: 'score' },
      { name: 'Kritik Bulgu Sayısı', target: 0, actual: 3, unit: 'count' },
      { name: 'Denetçi Eğitim Saati', target: 40, actual: 38, unit: 'hours' },
      { name: 'Denetim Rapor Süresi (Gün)', target: 30, actual: 28, unit: 'days' },
      { name: 'Tekrarlayan Bulgu Oranı (%)', target: 5, actual: 8, unit: '%' },
      { name: 'Dış QA Puanı', target: 4.0, actual: 4.3, unit: 'score' },
      { name: 'Yönetim Kurulu Sunumu', target: 4, actual: 4, unit: 'count' },
      { name: 'Aksiyon Tamamlama Oranı (%)', target: 90, actual: 85, unit: '%' },
      { name: 'Risk Assessment Güncelliği (%)', target: 100, actual: 95, unit: '%' },
      { name: 'Workpaper Kalite Skoru', target: 4.0, actual: 4.1, unit: 'score' },
      { name: 'Çalışan Devir Oranı (%)', target: 10, actual: 12, unit: '%' },
      { name: 'Sertifikalı Denetçi Oranı (%)', target: 80, actual: 75, unit: '%' }
    ];

    const kpiRecords = kpis.map((kpi, idx) => ({
      tenant_id: tenantId,
      code: `KPI-${String(idx + 1).padStart(3, '0')}`,
      name: kpi.name,
      category: idx < 5 ? 'Performance' : idx < 10 ? 'Quality' : 'Resources',
      measurement_unit: kpi.unit,
      target_value: kpi.target,
      actual_value: kpi.actual,
      measurement_period: '2026-Q1',
      status: kpi.actual >= kpi.target ? 'ON_TRACK' : 'AT_RISK',
      metadata: {
        trend: Math.random() > 0.5 ? 'IMPROVING' : 'DECLINING',
        last_updated: new Date().toISOString()
      }
    }));

    const { data, error } = await supabase
      .from('qaip_kpis')
      .insert(kpiRecords)
      .select();

    if (error) {
      console.error('Error creating KPIs:', error);
      throw error;
    }

    return data || [];
  }
}

export class PBCFactory {
  static async createPBCRequests(tenantId: string, engagements: any[], users: any[]): Promise<any[]> {
    const requests: any[] = [];

    engagements.slice(0, 10).forEach(engagement => {
      const requestCount = 1 + Math.floor(Math.random() * 3);

      for (let i = 0; i < requestCount; i++) {
        const requester = users.find((u: any) => u.role === 'auditor');
        const dueDate = new Date(engagement.planned_end_date);
        dueDate.setDate(dueDate.getDate() - 10);

        requests.push({
          tenant_id: tenantId,
          engagement_id: engagement.id,
          title: [
            'Kredi Dosyaları Listesi',
            'KYC Formları',
            'Yedekleme Log Kayıtları',
            'Erişim Hakları Raporu',
            'Mali Tablolar'
          ][i % 5],
          description: 'İlgili dökümanların temin edilmesi gerekmektedir.',
          requested_by: requester?.id,
          due_date: dueDate.toISOString().split('T')[0],
          status: ['PENDING', 'SUBMITTED', 'APPROVED'][Math.floor(Math.random() * 3)],
          priority: ['HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 3)]
        });
      }
    });

    const { data, error } = await supabase
      .from('pbc_requests')
      .insert(requests)
      .select();

    if (error) {
      console.error('Error creating PBC requests:', error);
      throw error;
    }

    return data || [];
  }
}
