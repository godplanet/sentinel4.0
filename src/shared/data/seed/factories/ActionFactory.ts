import { supabase } from '@/shared/api/supabase';
import { ACTION_TITLES } from '../datasets/banking-terms';

type ActionStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';

export class ActionFactory {
  static async createActionPlans(tenantId: string, findings: any[], users: any[]): Promise<any[]> {
    const statuses: ActionStatus[] = [
      ...Array(15).fill('IN_PROGRESS'), // 50%
      ...Array(8).fill('OPEN'), // 25%
      ...Array(5).fill('COMPLETED'), // 15%
      ...Array(3).fill('OVERDUE') // 10%
    ];

    const actionPlans: any[] = [];
    const managers = users.filter((u: any) => u.role === 'manager' || u.role === 'admin');

    // Create 30 action plans
    for (let i = 0; i < 30; i++) {
      const finding = findings[i % findings.length];
      const status = statuses[i];
      const owner = managers[Math.floor(Math.random() * managers.length)];
      const actionTitle = ACTION_TITLES[i % ACTION_TITLES.length];

      const dueDate = new Date(2026, 2 + Math.floor(Math.random() * 6), 15);
      let completionDate = null;

      if (status === 'COMPLETED') {
        completionDate = new Date(dueDate);
        completionDate.setDate(completionDate.getDate() - Math.floor(Math.random() * 10));
      } else if (status === 'OVERDUE') {
        dueDate.setDate(dueDate.getDate() - Math.floor(Math.random() * 30) - 1);
      }

      actionPlans.push({
        tenant_id: tenantId,
        finding_id: finding.id,
        title: actionTitle,
        description: `${actionTitle} ile ilgili detaylı aksiyon planı.`,
        owner_id: owner?.id,
        status,
        priority: finding.severity === 'CRITICAL' || finding.severity === 'HIGH' ? 'HIGH' : 'MEDIUM',
        due_date: dueDate.toISOString().split('T')[0],
        completion_date: completionDate?.toISOString().split('T')[0],
        progress_percentage: {
          'OPEN': 0,
          'IN_PROGRESS': 25 + Math.floor(Math.random() * 50),
          'COMPLETED': 100,
          'OVERDUE': 40 + Math.floor(Math.random() * 30),
          'CANCELLED': 0
        }[status],
        estimated_cost: Math.random() > 0.5 ? 10000 + Math.floor(Math.random() * 100000) : null,
        metadata: {
          department: finding.category,
          requires_budget: Math.random() > 0.7,
          dependencies: []
        }
      });
    }

    const { data, error } = await supabase
      .from('action_plans')
      .insert(actionPlans)
      .select();

    if (error) {
      console.error('Error creating action plans:', error);
      throw error;
    }

    return data || [];
  }

  static async createActionSteps(actionPlans: any[]): Promise<void> {
    const steps: any[] = [];

    actionPlans.forEach(plan => {
      const stepCount = 3 + Math.floor(Math.random() * 3); // 3-5 steps

      for (let i = 0; i < stepCount; i++) {
        const isCompleted = plan.status === 'COMPLETED' || (plan.status === 'IN_PROGRESS' && Math.random() > 0.5);

        steps.push({
          action_id: plan.id,
          step_number: i + 1,
          description: [
            'İlk değerlendirme ve analiz',
            'Detaylı planlama ve kaynak tahsisi',
            'Uygulama ve test',
            'Dokümantasyon ve eğitim',
            'Son kontrol ve onay'
          ][i % 5],
          assigned_to: plan.owner_id,
          status: isCompleted ? 'COMPLETED' : (i === 0 ? 'IN_PROGRESS' : 'PENDING'),
          due_date: new Date(new Date(plan.due_date).getTime() - (stepCount - i) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      }
    });

    const { error } = await supabase
      .from('action_steps')
      .insert(steps);

    if (error) {
      console.error('Error creating action steps:', error);
    }
  }

  static async createActionEvidence(actionPlans: any[]): Promise<void> {
    const evidence: any[] = [];

    // Add evidence to completed and in-progress actions
    const eligibleActions = actionPlans.filter(
      (a: any) => a.status === 'COMPLETED' || a.status === 'IN_PROGRESS'
    );

    eligibleActions.forEach(action => {
      const evidenceCount = Math.random() > 0.5 ? 1 + Math.floor(Math.random() * 3) : 0;

      for (let i = 0; i < evidenceCount; i++) {
        evidence.push({
          action_id: action.id,
          file_name: `Evidence_${action.id}_${i + 1}.pdf`,
          file_url: `/storage/evidence/${action.id}/${i + 1}.pdf`,
          file_type: 'application/pdf',
          file_size: 50000 + Math.floor(Math.random() * 500000),
          description: ['Prosedür dökümanı', 'Test sonuçları', 'Eğitim kayıtları', 'Onay formu'][i % 4],
          uploaded_by: action.owner_id
        });
      }
    });

    if (evidence.length > 0) {
      const { error } = await supabase
        .from('action_evidence')
        .insert(evidence);

      if (error) {
        console.error('Error creating action evidence:', error);
      }
    }
  }
}
