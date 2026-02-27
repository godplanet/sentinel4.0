import { supabase } from '@/shared/api/supabase';
import { TenantFactory } from './factories/TenantFactory';
import { UserFactory } from './factories/UserFactory';
import { HierarchyFactory } from './factories/HierarchyFactory';
import { RiskFactory } from './factories/RiskFactory';
import { EngagementFactory } from './factories/EngagementFactory';
import { FindingFactory } from './factories/FindingFactory';
import { ActionFactory } from './factories/ActionFactory';
import { WorkpaperFactory } from './factories/WorkpaperFactory';
import {
  CCMFactory,
  GovernanceFactory,
  TimesheetFactory,
  QAIPFactory,
  PBCFactory
} from './factories/SpecializedFactory';

export class UniversalSeeder {
  private static SEED_FLAG_KEY = 'sentinel_data_seeded';
  private static tenantId: string;

  static async seed(): Promise<void> {
    console.log('🌱 Starting Universal Data Seeder...');

    try {
      // Check if already seeded
      if (this.isSeeded()) {
        console.log('✅ Data already seeded. Skipping.');
        return;
      }

      console.log('📊 Phase 1/5: Creating Foundation...');
      await this.seedFoundation();

      console.log('📊 Phase 2/5: Creating Strategy Layer...');
      await this.seedStrategy();

      console.log('📊 Phase 3/5: Creating Planning Layer...');
      await this.seedPlanning();

      console.log('📊 Phase 4/5: Creating Execution Layer...');
      await this.seedExecution();

      console.log('📊 Phase 5/5: Creating Specialized Modules...');
      await this.seedSpecialized();

      // Mark as seeded
      this.markAsSeeded();

      console.log('✅ Universal Data Seeder completed successfully!');
      console.log('📈 Generated:');
      console.log('   - 1 Tenant');
      console.log('   - 20 Users');
      console.log('   - 61 Entities (1 HQ + 10 Depts + 50 Branches)');
      console.log('   - 50 Risks');
      console.log('   - 50 Risk Assessments');
      console.log('   - 15 Engagements');
      console.log('   - 50 Findings');
      console.log('   - 30 Action Plans');
      console.log('   - 100 Workpapers');
      console.log('   - 200+ Timesheet Entries');
      console.log('   - 50 CCM Alerts');
      console.log('   - 5 Board Meetings');
      console.log('   - 15 Governance Documents');
      console.log('   - 15 QAIP KPIs');
      console.log('   - 10+ PBC Requests');

    } catch (error) {
      console.error('❌ Seeder failed:', error);
      throw error;
    }
  }

  private static async seedFoundation(): Promise<void> {
    // 1. Create Tenant
    const tenant = await TenantFactory.create();
    this.tenantId = tenant.id;
    console.log(`   ✓ Created tenant: ${tenant.name}`);

    // 2. Create Users (20 total)
    const users = await UserFactory.createBatch(this.tenantId, 20);
    console.log(`   ✓ Created ${users.length} users`);

    // 3. Create Hierarchy (1 HQ + 10 Depts + 50 Branches = 61 entities)
    const entities = await HierarchyFactory.createHierarchy(this.tenantId);
    console.log(`   ✓ Created ${entities.length} entities in ltree hierarchy`);

    // Store for later use
    (window as any).__seedData = { tenant, users, entities };
  }

  private static async seedStrategy(): Promise<void> {
    const { users, entities } = (window as any).__seedData;

    // 1. Create Risk Library (50 risks)
    const risks = await RiskFactory.createRiskLibrary(this.tenantId);
    console.log(`   ✓ Created ${risks.length} risk definitions`);

    // 2. Create Risk Assessments (50 assessments mapped to entities)
    const assessments = await RiskFactory.createRiskAssessments(this.tenantId, entities, risks);
    console.log(`   ✓ Created ${assessments.length} risk assessments`);

    (window as any).__seedData.risks = risks;
    (window as any).__seedData.assessments = assessments;
  }

  private static async seedPlanning(): Promise<void> {
    const { users, entities } = (window as any).__seedData;

    // 1. Create Annual Audit Plan (15 engagements)
    const engagements = await EngagementFactory.createAnnualPlan(this.tenantId, entities, users);
    console.log(`   ✓ Created ${engagements.length} audit engagements`);

    // 2. Assign Team Members
    await EngagementFactory.assignTeamMembers(engagements, users);
    console.log(`   ✓ Assigned team members to engagements`);

    (window as any).__seedData.engagements = engagements;
  }

  private static async seedExecution(): Promise<void> {
    const { engagements, users } = (window as any).__seedData;

    // 1. Create Findings (50 findings)
    const findings = await FindingFactory.createFindings(this.tenantId, engagements, users);
    console.log(`   ✓ Created ${findings.length} findings`);

    // 2. Create Finding Secrets (5-Whys)
    await FindingFactory.createFindingSecrets(findings);
    console.log(`   ✓ Created finding secrets (5-Whys)`);

    // 3. Create Finding Comments
    await FindingFactory.createFindingComments(findings, users);
    console.log(`   ✓ Created finding comments`);

    // 4. Create Action Plans (30 actions)
    const actionPlans = await ActionFactory.createActionPlans(this.tenantId, findings, users);
    console.log(`   ✓ Created ${actionPlans.length} action plans`);

    // 5. Create Action Steps
    await ActionFactory.createActionSteps(actionPlans);
    console.log(`   ✓ Created action steps`);

    // 6. Create Action Evidence
    await ActionFactory.createActionEvidence(actionPlans);
    console.log(`   ✓ Created action evidence`);

    // 7. Create Workpapers (100 workpapers)
    const workpapers = await WorkpaperFactory.createWorkpapers(this.tenantId, engagements, users);
    console.log(`   ✓ Created ${workpapers.length} workpapers`);

    // 8. Create Workpaper Evidence
    await WorkpaperFactory.createWorkpaperEvidence(workpapers);
    console.log(`   ✓ Created workpaper evidence`);

    (window as any).__seedData.findings = findings;
    (window as any).__seedData.actionPlans = actionPlans;
    (window as any).__seedData.workpapers = workpapers;
  }

  private static async seedSpecialized(): Promise<void> {
    const { entities, users, engagements } = (window as any).__seedData;

    // 1. CCM Predator Alerts
    const alerts = await CCMFactory.createPredatorAlerts(this.tenantId, entities);
    console.log(`   ✓ Created ${alerts.length} CCM predator alerts`);

    // 2. Board Meetings
    const meetings = await GovernanceFactory.createBoardMeetings(this.tenantId, users);
    console.log(`   ✓ Created ${meetings.length} board meetings`);

    // 3. Governance Documents
    const docs = await GovernanceFactory.createGovernanceDocs(this.tenantId);
    console.log(`   ✓ Created ${docs.length} governance documents`);

    // 4. Timesheets
    const timesheets = await TimesheetFactory.createTimesheets(this.tenantId, engagements, users);
    console.log(`   ✓ Created ${timesheets.length} timesheet entries`);

    // 5. QAIP KPIs
    const kpis = await QAIPFactory.createKPIs(this.tenantId);
    console.log(`   ✓ Created ${kpis.length} QAIP KPIs`);

    // 6. PBC Requests
    const pbcRequests = await PBCFactory.createPBCRequests(this.tenantId, engagements, users);
    console.log(`   ✓ Created ${pbcRequests.length} PBC requests`);

    // Clean up temporary data
    delete (window as any).__seedData;
  }

  private static isSeeded(): boolean {
    return localStorage.getItem(this.SEED_FLAG_KEY) === 'true';
  }

  private static markAsSeeded(): void {
    localStorage.setItem(this.SEED_FLAG_KEY, 'true');
  }

  static async reset(): Promise<void> {
    console.log('🔄 Resetting seed flag...');
    localStorage.removeItem(this.SEED_FLAG_KEY);
    console.log('✅ Seed flag reset. Reload the app to re-seed.');
  }

  static async checkDatabaseEmpty(): Promise<boolean> {
    const { count, error } = await supabase
      .from('audit_entities')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error checking database:', error);
      return false;
    }

    return count === 0;
  }
}

// Export for use in App.tsx
export default UniversalSeeder;
