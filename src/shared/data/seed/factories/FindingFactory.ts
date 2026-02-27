import { supabase } from '@/shared/api/supabase';
import { FINDING_TEMPLATES } from '../datasets/banking-terms';
import { getRandomGIASCategory } from '../datasets/gias-categories';

type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'OBSERVATION';
type FindingState = 'DRAFT' | 'IN_NEGOTIATION' | 'AGREED' | 'DISPUTED' | 'FINAL' | 'REMEDIATED';

export class FindingFactory {
  static async createFindings(tenantId: string, engagements: any[], users: any[]): Promise<any[]> {
    // Severity distribution
    const severities: FindingSeverity[] = [
      'CRITICAL', 'CRITICAL', 'CRITICAL', // 6%
      'HIGH', 'HIGH', 'HIGH', 'HIGH', 'HIGH', 'HIGH', 'HIGH', 'HIGH', // 16%
      ...Array(25).fill('MEDIUM'), // 50%
      ...Array(12).fill('LOW'), // 24%
      'OBSERVATION', 'OBSERVATION' // 4%
    ];

    // State distribution
    const states: FindingState[] = [
      ...Array(15).fill('DRAFT'), // 30%
      ...Array(12).fill('IN_NEGOTIATION'), // 24%
      ...Array(10).fill('AGREED'), // 20%
      ...Array(8).fill('FINAL'), // 16%
      ...Array(5).fill('REMEDIATED') // 10%
    ];

    const findings: any[] = [];
    const auditors = users.filter((u: any) => u.role === 'auditor' || u.role === 'manager');

    for (let i = 0; i < 50; i++) {
      const engagement = engagements[Math.floor(Math.random() * engagements.length)];
      const template = FINDING_TEMPLATES[i % FINDING_TEMPLATES.length];
      const severity = severities[i];
      const state = states[i];
      const gias = getRandomGIASCategory();
      const auditor = auditors[Math.floor(Math.random() * auditors.length)];

      const riskRating = ['Critical', 'High', 'Medium', 'Low'][
        ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].indexOf(severity) || 2
      ];

      // Generate 5-Whys
      const fiveWhys = [
        `Neden 1: ${template.title} tespit edildi`,
        'Neden 2: Kontrol prosedürleri eksik uygulanmış',
        'Neden 3: Personel eğitimi yetersiz',
        'Neden 4: Süreç dokümantasyonu güncel değil',
        'Kök Neden: Periyodik gözden geçirme mekanizması yok'
      ];

      findings.push({
        tenant_id: tenantId,
        engagement_id: engagement.id,
        code: `FND-2026-${String(i + 1).padStart(4, '0')}`,
        title: template.title,
        description: template.description,
        severity,
        state,
        category: gias.name,
        subcategory: gias.subcategory,
        auditor_id: auditor?.id,
        risk_rating: riskRating,
        impact_description: `Bu bulgu ${riskRating.toLowerCase()} seviyede etki yaratmaktadır.`,
        root_cause: fiveWhys[4],
        recommendation: `${template.title} için düzeltici faaliyetler başlatılmalıdır.`,
        management_response: state !== 'DRAFT' ? 'Bulgular kabul edilmiş ve aksiyon planı hazırlanmıştır.' : null,
        target_date: new Date(2026, 3 + Math.floor(Math.random() * 6), 15).toISOString().split('T')[0],
        metadata: {
          gias_code: gias.code,
          five_whys: fiveWhys,
          control_gap: true,
          repeat_finding: Math.random() > 0.85,
          estimated_impact_amount: severity === 'CRITICAL' || severity === 'HIGH'
            ? 100000 + Math.floor(Math.random() * 500000)
            : null
        }
      });
    }

    const { data, error } = await supabase
      .from('audit_findings')
      .insert(findings)
      .select();

    if (error) {
      console.error('Error creating findings:', error);
      throw error;
    }

    return data || [];
  }

  static async createFindingSecrets(findings: any[]): Promise<void> {
    const secrets = findings.map(finding => ({
      finding_id: finding.id,
      encrypted_notes: `Gizli notlar: ${finding.title}`,
      five_whys: finding.metadata?.five_whys || [],
      sensitive_data: {
        responsible_person: 'Gizli',
        internal_memo: 'Dahili değerlendirme notları'
      }
    }));

    const { error } = await supabase
      .from('finding_secrets')
      .insert(secrets);

    if (error) {
      console.error('Error creating finding secrets:', error);
    }
  }

  static async createFindingComments(findings: any[], users: any[]): Promise<void> {
    const comments: any[] = [];

    // Add 1-3 comments to each finding
    findings.forEach(finding => {
      const commentCount = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < commentCount; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const daysAgo = Math.floor(Math.random() * 30);
        const commentDate = new Date();
        commentDate.setDate(commentDate.getDate() - daysAgo);

        comments.push({
          finding_id: finding.id,
          user_id: user?.id,
          comment: [
            'Bulgu detayları netleştirilmeli.',
            'Yönetim yanıtı bekleniyor.',
            'Aksiyon planı kabul edildi.',
            'Ek dokümantasyon talep ediliyor.',
            'Test sonuçları gözden geçirildi.'
          ][i % 5],
          created_at: commentDate.toISOString()
        });
      }
    });

    const { error } = await supabase
      .from('finding_comments')
      .insert(comments);

    if (error) {
      console.error('Error creating finding comments:', error);
    }
  }
}
