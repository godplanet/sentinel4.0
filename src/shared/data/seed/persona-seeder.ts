import { supabase } from '@/shared/api/supabase';
import { PERSONAS } from '@/entities/user/model/persona-store';

/**
 * PERSONA-SPECIFIC DATA SEEDER
 *
 * Creates targeted demo data for each of the 5 personas:
 * 1. CAE (Admin) - Full system access
 * 2. Auditor - Execution & findings
 * 3. Executive (GMY) - High-level dashboards
 * 4. Auditee (Branch Manager) - Action plans assigned to them
 * 5. Supplier (Vendor) - TPRM questionnaires
 */

export class PersonaSeeder {
  private static SEED_FLAG_KEY = 'sentinel_persona_seeded';
  private static tenantId = '11111111-1111-1111-1111-111111111111';

  static async seedAll(): Promise<void> {
    console.log('🎭 Starting Persona-Specific Data Seeder...');

    try {
      if (this.isSeeded()) {
        console.log('✅ Persona data already seeded. Skipping.');
        return;
      }

      // Seed data for each persona
      await this.seedCAE();
      await this.seedAuditor();
      await this.seedExecutive();
      await this.seedAuditee();
      await this.seedSupplier();

      this.markAsSeeded();
      console.log('✅ Persona Data Seeder completed successfully!');

    } catch (error) {
      console.error('❌ Persona Seeder failed:', error);
      throw error;
    }
  }

  private static async seedCAE(): Promise<void> {
    console.log('👔 Seeding CAE (Admin) data...');

    // CAE sees everything - no specific seeding needed
    // They see all findings, all reports, all data

    console.log('   ✓ CAE has full access to all data');
  }

  private static async seedAuditor(): Promise<void> {
    console.log('🔍 Seeding Auditor data...');

    // Auditors need engagements and findings assigned to them
    const { data: engagements, error: engError } = await supabase
      .from('audit_engagements')
      .select('id')
      .limit(5);

    if (!engError && engagements) {
      console.log(`   ✓ Auditor has access to ${engagements.length} engagements`);
    }
  }

  private static async seedExecutive(): Promise<void> {
    console.log('📊 Seeding Executive (GMY) data...');

    // Executives need high-level KPIs and board reports
    // Create risk velocity stats
    const { error: velocityError } = await supabase
      .from('risk_velocity_snapshots')
      .upsert([
        {
          tenant_id: this.tenantId,
          entity_id: '11111111-1111-1111-1111-111111111111',
          risk_id: '11111111-1111-1111-1111-111111111111',
          snapshot_date: new Date().toISOString(),
          current_score: 85,
          previous_score: 75,
          velocity: 10,
          acceleration: 5,
          created_at: new Date().toISOString(),
        }
      ], { onConflict: 'id' });

    if (!velocityError) {
      console.log('   ✓ Created Risk Velocity snapshots for GMY dashboard');
    }

    // Create board meeting data
    const { error: boardError } = await supabase
      .from('governance_board_meetings')
      .upsert([
        {
          tenant_id: this.tenantId,
          meeting_date: new Date().toISOString(),
          meeting_type: 'quarterly',
          status: 'scheduled',
          agenda: 'Q1 2026 Audit Results Review',
          created_at: new Date().toISOString(),
        }
      ], { onConflict: 'id' });

    if (!boardError) {
      console.log('   ✓ Created Board Meeting data for GMY');
    }
  }

  private static async seedAuditee(): Promise<void> {
    console.log('🏢 Seeding Auditee (Branch Manager) data...');

    const auditeeEmail = PERSONAS.AUDITEE.email;

    // CRITICAL: Create findings assigned to this auditee
    const { data: findings, error: findingError } = await supabase
      .from('audit_findings')
      .select('id')
      .limit(5);

    if (!findingError && findings) {
      // Create action plans explicitly assigned to mehmet@branch
      for (const finding of findings) {
        const { error: actionError } = await supabase
          .from('action_plans')
          .insert({
            tenant_id: this.tenantId,
            finding_id: finding.id,
            action_owner: auditeeEmail, // FORCE ASSIGN
            action_title: `Corrective Action for Finding ${finding.id.substring(0, 8)}`,
            action_description: 'Implement control improvements and document evidence',
            target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'in_progress',
            priority: 'high',
            created_by: auditeeEmail,
            created_at: new Date().toISOString(),
          });

        if (!actionError) {
          console.log(`   ✓ Assigned action plan for finding ${finding.id.substring(0, 8)} to ${auditeeEmail}`);
        }
      }
    }

    console.log(`   ✓ Created ${findings?.length || 0} action plans for ${auditeeEmail}`);
  }

  private static async seedSupplier(): Promise<void> {
    console.log('🏭 Seeding Supplier (Vendor) data...');

    const supplierEmail = PERSONAS.SUPPLIER.email;

    // Create TPRM vendor record
    const { data: vendor, error: vendorError } = await supabase
      .from('tprm_vendors')
      .upsert([
        {
          tenant_id: this.tenantId,
          vendor_name: 'Vendor Co.',
          vendor_type: 'technology',
          risk_tier: 'medium',
          status: 'active',
          contact_email: supplierEmail,
          created_at: new Date().toISOString(),
        }
      ], { onConflict: 'contact_email' })
      .select()
      .single();

    if (!vendorError && vendor) {
      console.log('   ✓ Created TPRM Vendor record');

      // Create assessment assigned to this vendor
      const { error: assessmentError } = await supabase
        .from('tprm_assessments')
        .insert({
          tenant_id: this.tenantId,
          vendor_id: vendor.id,
          assessment_type: 'initial',
          status: 'in_progress',
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          assigned_to: supplierEmail,
          created_at: new Date().toISOString(),
        });

      if (!assessmentError) {
        console.log(`   ✓ Assigned TPRM questionnaire to ${supplierEmail}`);
      }
    }
  }

  private static isSeeded(): boolean {
    return localStorage.getItem(this.SEED_FLAG_KEY) === 'true';
  }

  private static markAsSeeded(): void {
    localStorage.setItem(this.SEED_FLAG_KEY, 'true');
  }

  static async reset(): Promise<void> {
    console.log('🔄 Resetting persona seed flag...');
    localStorage.removeItem(this.SEED_FLAG_KEY);
    console.log('✅ Persona seed flag reset. Reload to re-seed.');
  }
}

export default PersonaSeeder;
