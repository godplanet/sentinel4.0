import { supabase } from '@/shared/api/supabase';
import { ENGAGEMENT_TYPES } from '../datasets/banking-terms';

type EngagementStatus = 'PLANNING' | 'FIELDWORK' | 'REPORTING' | 'CLOSED';

export class EngagementFactory {
  static async createAnnualPlan(tenantId: string, entities: any[], users: any[]): Promise<any[]> {
    const statuses: EngagementStatus[] = [
      'FIELDWORK', 'FIELDWORK', 'FIELDWORK', 'FIELDWORK', 'FIELDWORK', 'FIELDWORK', // 40%
      'PLANNING', 'PLANNING', 'PLANNING', 'PLANNING', // 27%
      'REPORTING', 'REPORTING', 'REPORTING', // 20%
      'CLOSED', 'CLOSED' // 13%
    ];

    const engagements: any[] = [];

    for (let i = 0; i < 15; i++) {
      const entity = entities[Math.floor(Math.random() * entities.length)];
      const engType = ENGAGEMENT_TYPES[i % ENGAGEMENT_TYPES.length];
      const status = statuses[i];
      const auditors = users.filter((u: any) => u.role === 'auditor' || u.role === 'manager');
      const leadAuditor = auditors[Math.floor(Math.random() * auditors.length)];

      // Calculate dates based on status
      const startMonth = i % 12;
      const startDate = new Date(2026, startMonth, 1);
      const plannedEndDate = new Date(2026, startMonth + 2, 0); // 2 months duration

      let actualStartDate = null;
      let actualEndDate = null;

      if (status === 'FIELDWORK' || status === 'REPORTING' || status === 'CLOSED') {
        actualStartDate = startDate;
      }

      if (status === 'CLOSED') {
        actualEndDate = plannedEndDate;
      }

      engagements.push({
        tenant_id: tenantId,
        code: `ENG-2026-${String(i + 1).padStart(3, '0')}`,
        title: `${engType} - ${entity.name}`,
        entity_id: entity.id,
        engagement_type: engType,
        status,
        planned_start_date: startDate.toISOString().split('T')[0],
        planned_end_date: plannedEndDate.toISOString().split('T')[0],
        actual_start_date: actualStartDate?.toISOString().split('T')[0],
        actual_end_date: actualEndDate?.toISOString().split('T')[0],
        lead_auditor_id: leadAuditor?.id,
        budget_hours: 200 + Math.floor(Math.random() * 300),
        objectives: [
          `${entity.name} kontrollerinin etkinliğini değerlendirmek`,
          'Risk bazlı örnekleme yapmak',
          'Mevzuat uyumunu test etmek'
        ],
        scope_description: `${engType} kapsamında ${entity.name} incelenmesi.`,
        metadata: {
          year: 2026,
          quarter: Math.floor(startMonth / 3) + 1,
          risk_rating: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
          last_audit_year: 2024
        }
      });
    }

    const { data, error } = await supabase
      .from('audit_engagements')
      .insert(engagements)
      .select();

    if (error) {
      console.error('Error creating engagements:', error);
      throw error;
    }

    return data || [];
  }

  static async assignTeamMembers(engagements: any[], users: any[]): Promise<void> {
    const auditors = users.filter((u: any) => u.role === 'auditor' || u.role === 'manager');

    const assignments: any[] = [];

    engagements.forEach(engagement => {
      // Assign 2-3 auditors per engagement
      const teamSize = 2 + Math.floor(Math.random() * 2);
      const shuffled = [...auditors].sort(() => Math.random() - 0.5);
      const team = shuffled.slice(0, teamSize);

      team.forEach((auditor, idx) => {
        assignments.push({
          engagement_id: engagement.id,
          user_id: auditor.id,
          role: idx === 0 ? 'Lead Auditor' : 'Team Member',
          allocated_hours: 50 + Math.floor(Math.random() * 100)
        });
      });
    });

    const { error } = await supabase
      .from('engagement_team_members')
      .insert(assignments);

    if (error) {
      console.error('Error assigning team members:', error);
    }
  }
}
