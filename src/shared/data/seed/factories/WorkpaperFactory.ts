import { supabase } from '@/shared/api/supabase';
import { WORKPAPER_TEMPLATES, CONTROL_NAMES } from '../datasets/banking-terms';

type WorkpaperStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
type TestResult = 'PASS' | 'FAIL' | 'NOT_APPLICABLE';

export class WorkpaperFactory {
  static async createWorkpapers(tenantId: string, engagements: any[], users: any[]): Promise<any[]> {
    const workpapers: any[] = [];
    const statuses: WorkpaperStatus[] = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED'];
    const testResults: TestResult[] = ['PASS', 'FAIL', 'NOT_APPLICABLE'];

    // Create 100 workpapers across engagements
    for (let i = 0; i < 100; i++) {
      const engagement = engagements[Math.floor(Math.random() * engagements.length)];
      const template = WORKPAPER_TEMPLATES[i % WORKPAPER_TEMPLATES.length];
      const preparer = users[Math.floor(Math.random() * users.length)];
      const reviewer = users[Math.floor(Math.random() * users.length)];

      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const testResult = testResults[Math.floor(Math.random() * testResults.length)];
      const controlName = CONTROL_NAMES[Math.floor(Math.random() * CONTROL_NAMES.length)];

      const sampleSize = 10 + Math.floor(Math.random() * 40);
      const exceptionCount = testResult === 'FAIL' ? 1 + Math.floor(Math.random() * 5) : 0;

      workpapers.push({
        tenant_id: tenantId,
        engagement_id: engagement.id,
        reference: `${template.ref}-${engagement.code}`,
        title: template.name,
        description: `${controlName} için ${template.name}`,
        preparer_id: preparer?.id,
        reviewer_id: status !== 'DRAFT' ? reviewer?.id : null,
        status,
        control_tested: controlName,
        test_objective: `${controlName} kontrolünün etkinliğini test etmek`,
        test_procedure: `Örnekleme yöntemi ile ${sampleSize} adet test yapılmıştır.`,
        sample_size: sampleSize,
        exception_count: exceptionCount,
        test_result: testResult,
        conclusion: testResult === 'PASS'
          ? 'Kontrol etkin çalışmaktadır.'
          : testResult === 'FAIL'
            ? `${exceptionCount} adet istisna tespit edilmiştir. Kontrol etkin değildir.`
            : 'Test uygulanamaz.',
        metadata: {
          hours_spent: 2 + Math.floor(Math.random() * 8),
          sampling_method: ['Random', 'Systematic', 'Judgmental'][Math.floor(Math.random() * 3)],
          risk_level: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
        }
      });
    }

    const { data, error } = await supabase
      .from('workpapers')
      .insert(workpapers)
      .select();

    if (error) {
      console.error('Error creating workpapers:', error);
      throw error;
    }

    return data || [];
  }

  static async createWorkpaperEvidence(workpapers: any[]): Promise<void> {
    const evidence: any[] = [];

    workpapers.forEach(wp => {
      const evidenceCount = 1 + Math.floor(Math.random() * 4);

      for (let i = 0; i < evidenceCount; i++) {
        evidence.push({
          workpaper_id: wp.id,
          file_name: `${wp.reference}_Evidence_${i + 1}.xlsx`,
          file_path: `/workpapers/${wp.id}/evidence_${i + 1}.xlsx`,
          file_type: 'application/vnd.ms-excel',
          file_size: 25000 + Math.floor(Math.random() * 200000),
          description: ['Test sonuçları', 'Kontrol matrisi', 'Örneklem listesi', 'İstisna detayları'][i % 4],
          uploaded_by: wp.preparer_id,
          uploaded_at: new Date().toISOString()
        });
      }
    });

    const { error } = await supabase
      .from('workpaper_evidence')
      .insert(evidence);

    if (error) {
      console.error('Error creating workpaper evidence:', error);
    }
  }
}
