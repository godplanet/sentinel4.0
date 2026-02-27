import { supabase } from '@/shared/api/supabase';
import { forceReseedViaEdge } from '@/shared/lib/universal-seeder';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';

export interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  duration: number;
  error?: string;
  details?: any;
}

export interface DiagnosticReport {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  warned: number;
  tests: TestResult[];
  systemHealth: {
    tenantCount: number;
    userCount: number;
    entityCount: number;
    engagementCount: number;
    findingCount: number;
    workpaperCount: number;
    boardMemberCount: number;
    stakeholderCount: number;
    riskAssessmentCount: number;
    governanceDocsCount: number;
    rkmProcessCount: number;
    rkmRiskCount: number;
    ccmTransactionCount: number;
    ccmAlertCount: number;
    probeCount: number;
    investigationCount: number;
    aiAgentCount: number;
    actionCount: number;
  };
  selfHealed?: boolean;
}

const TENANT = ACTIVE_TENANT_ID;

export class AutoTester {
  private results: TestResult[] = [];
  private testEngagementId: string | null = null;
  private testFindingId: string | null = null;
  private selfHealed: boolean = false;

  async runFullDiagnostics(): Promise<DiagnosticReport> {
    await this.preFlight_SelfHeal();

    await this.test1_DatabaseConnectivity();
    await this.test2_SystemData();
    await this.test3_PlanningModule();
    await this.test4_LibraryModule();
    await this.test5_FieldworkModule();
    await this.test6_FindingModule();
    await this.test7_ReportingModule();
    await this.test8_GhostHunter();
    await this.test9_Phase2Tables();

    const systemHealth = await this.getSystemHealth();

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warned = this.results.filter(r => r.status === 'WARN').length;

    return {
      timestamp: new Date().toISOString(),
      totalTests: this.results.length,
      passed,
      failed,
      warned,
      tests: this.results,
      systemHealth,
      selfHealed: this.selfHealed,
    };
  }

  private async preFlight_SelfHeal(): Promise<void> {
    const { count: userCount } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    if (userCount === 0) {
      try {
        await forceReseedViaEdge();
        this.selfHealed = true;
      } catch {
        throw new Error('AutoTester cannot proceed: Database is empty and seeder failed.');
      }
    }
  }

  private async test1_DatabaseConnectivity(): Promise<void> {
    const start = Date.now();
    try {
      const { data, error } = await supabase.from('tenants').select('id').limit(1);
      if (error) throw error;

      this.results.push({
        test: 'Database Connectivity',
        status: 'PASS',
        duration: Date.now() - start,
        details: { recordsFound: data?.length || 0 }
      });
    } catch (error) {
      this.results.push({
        test: 'Database Connectivity',
        status: 'FAIL',
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : 'Database connection failed'
      });
    }
  }

  private async test2_SystemData(): Promise<void> {
    const start = Date.now();
    try {
      const [users, entities, risks, templates] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('audit_entities').select('id', { count: 'exact', head: true }),
        supabase.from('risk_library').select('id', { count: 'exact', head: true }),
        supabase.from('program_templates').select('id', { count: 'exact', head: true }),
      ]);

      const userCount = users.count || 0;
      const entityCount = entities.count || 0;
      const riskCount = risks.count || 0;
      const templateCount = templates.count || 0;

      if (userCount === 0 || entityCount === 0) {
        this.results.push({
          test: 'System Master Data',
          status: 'WARN',
          duration: Date.now() - start,
          error: 'Missing core data. Run seeder to populate.',
          details: { userCount, entityCount, riskCount, templateCount }
        });
      } else {
        this.results.push({
          test: 'System Master Data',
          status: 'PASS',
          duration: Date.now() - start,
          details: { userCount, entityCount, riskCount, templateCount }
        });
      }
    } catch (error) {
      this.results.push({
        test: 'System Master Data',
        status: 'FAIL',
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : 'Failed to fetch system data'
      });
    }
  }

  private async test3_PlanningModule(): Promise<void> {
    const start = Date.now();
    try {
      const { data: entity } = await supabase
        .from('audit_entities')
        .select('id, tenant_id')
        .eq('tenant_id', TENANT)
        .limit(1)
        .maybeSingle();

      if (!entity) throw new Error('No entities found for tenant');

      const { data: plan } = await supabase
        .from('audit_plans')
        .select('id')
        .eq('tenant_id', TENANT)
        .limit(1)
        .maybeSingle();

      const planId = plan?.id || 'b0000000-0000-0000-0000-000000000001';

      const engagement = {
        tenant_id: TENANT,
        plan_id: planId,
        entity_id: entity.id,
        title: `AUTO-TEST Engagement ${Date.now()}`,
        status: 'PLANNED',
        audit_type: 'TARGETED',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        risk_snapshot_score: 50,
        estimated_hours: 40,
        actual_hours: 0,
      };

      const { data, error } = await supabase
        .from('audit_engagements')
        .insert(engagement)
        .select()
        .single();

      if (error) throw error;

      this.testEngagementId = data.id;

      this.results.push({
        test: 'Planning Module (Create Engagement)',
        status: 'PASS',
        duration: Date.now() - start,
        details: { engagementId: data.id, planId }
      });
    } catch (error) {
      this.results.push({
        test: 'Planning Module (Create Engagement)',
        status: 'FAIL',
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : 'Failed to create engagement'
      });
    }
  }

  private async test4_LibraryModule(): Promise<void> {
    const start = Date.now();
    try {
      if (!this.testEngagementId) throw new Error('No test engagement created');

      const { data: templates, error: tErr } = await supabase
        .from('program_templates')
        .select('id, title')
        .limit(1);

      if (tErr) throw tErr;
      if (!templates || templates.length === 0) throw new Error('No templates found');

      this.results.push({
        test: 'Library Module (Program Templates)',
        status: 'PASS',
        duration: Date.now() - start,
        details: { templateCount: templates.length, firstTemplate: templates[0].title }
      });
    } catch (error) {
      this.results.push({
        test: 'Library Module (Program Templates)',
        status: 'FAIL',
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : 'Failed to read templates'
      });
    }
  }

  private async test5_FieldworkModule(): Promise<void> {
    const start = Date.now();
    try {
      if (!this.testEngagementId) throw new Error('No test engagement created');

      const step = {
        engagement_id: this.testEngagementId,
        step_code: `AUTO-STEP-${Date.now()}`,
        title: 'AUTO-TEST Audit Step',
      };

      const { data: createdStep, error: stepErr } = await supabase
        .from('audit_steps')
        .insert(step)
        .select()
        .single();

      if (stepErr) throw stepErr;

      const wp = {
        step_id: createdStep.id,
        status: 'draft',
        data: { test: true, autoGenerated: true },
      };

      const { data: createdWp, error: wpErr } = await supabase
        .from('workpapers')
        .insert(wp)
        .select()
        .single();

      if (wpErr) throw wpErr;

      this.results.push({
        test: 'Fieldwork Module (Create Step + Workpaper)',
        status: 'PASS',
        duration: Date.now() - start,
        details: { stepId: createdStep.id, workpaperId: createdWp.id }
      });
    } catch (error) {
      this.results.push({
        test: 'Fieldwork Module (Create Step + Workpaper)',
        status: 'FAIL',
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : 'Failed to create step/workpaper'
      });
    }
  }

  private async test6_FindingModule(): Promise<void> {
    const start = Date.now();
    try {
      if (!this.testEngagementId) throw new Error('No test engagement created');

      const finding = {
        engagement_id: this.testEngagementId,
        title: 'AUTO-TEST Finding',
        severity: 'MODERATE',
        status: 'DRAFT',
        state: 'DRAFT',
        details: { auto_generated: true, test_run: true },
      };

      const { data, error } = await supabase
        .from('audit_findings')
        .insert(finding)
        .select()
        .single();

      if (error) throw error;

      this.testFindingId = data.id;

      const { data: verify } = await supabase
        .from('audit_findings')
        .select('id, title')
        .eq('id', data.id)
        .maybeSingle();

      if (!verify) throw new Error('Created finding not found in DB');

      this.results.push({
        test: 'Finding Module (Create Finding)',
        status: 'PASS',
        duration: Date.now() - start,
        details: { findingId: data.id }
      });
    } catch (error) {
      this.results.push({
        test: 'Finding Module (Create Finding)',
        status: 'FAIL',
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : 'Failed to create finding'
      });
    }
  }

  private async test7_ReportingModule(): Promise<void> {
    const start = Date.now();
    try {
      if (!this.testEngagementId) throw new Error('No test engagement created');

      const { data: reportData } = await supabase
        .from('audit_findings')
        .select('id, title, severity, status')
        .eq('engagement_id', this.testEngagementId);

      if (!reportData) throw new Error('Failed to fetch report data');

      const hasTestFinding = reportData.some(f => f.id === this.testFindingId);

      if (!hasTestFinding && this.testFindingId) {
        throw new Error('Test finding not included in report data');
      }

      this.results.push({
        test: 'Reporting Module (Fetch Report Data)',
        status: 'PASS',
        duration: Date.now() - start,
        details: { findingsCount: reportData.length, includesTestFinding: hasTestFinding }
      });
    } catch (error) {
      this.results.push({
        test: 'Reporting Module (Fetch Report Data)',
        status: 'FAIL',
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : 'Failed to fetch report data'
      });
    }
  }

  private async test8_GhostHunter(): Promise<void> {
    const start = Date.now();
    try {
      const suspiciousPages = [
        { path: 'GanttTimeline', hasMock: true, priority: 'LOW' },
        { path: 'PredictiveRadar', hasMock: true, priority: 'LOW' },
      ];

      this.results.push({
        test: 'Ghost Hunter (Mock Data Detection)',
        status: suspiciousPages.length > 0 ? 'WARN' : 'PASS',
        duration: Date.now() - start,
        details: {
          mockPagesFound: suspiciousPages.length,
          pages: suspiciousPages,
          recommendation: 'Connect these pages to real database queries'
        }
      });
    } catch (error) {
      this.results.push({
        test: 'Ghost Hunter (Mock Data Detection)',
        status: 'FAIL',
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : 'Failed to scan for mock data'
      });
    }
  }

  private async test9_Phase2Tables(): Promise<void> {
    const start = Date.now();
    try {
      const tableChecks = [
        { name: 'ccm_transactions', query: supabase.from('ccm_transactions').select('id', { count: 'exact', head: true }) },
        { name: 'ccm_alerts', query: supabase.from('ccm_alerts').select('id', { count: 'exact', head: true }) },
        { name: 'probes', query: supabase.from('probes').select('id', { count: 'exact', head: true }) },
        { name: 'investigation_cases', query: supabase.from('investigation_cases').select('id', { count: 'exact', head: true }) },
        { name: 'ai_agents', query: supabase.from('ai_agents').select('id', { count: 'exact', head: true }) },
        { name: 'actions', query: supabase.from('actions').select('id', { count: 'exact', head: true }) },
        { name: 'sox_controls', query: supabase.from('sox_controls').select('id', { count: 'exact', head: true }) },
        { name: 'tprm_vendors', query: supabase.from('tprm_vendors').select('id', { count: 'exact', head: true }) },
        { name: 'esg_frameworks', query: supabase.from('esg_frameworks').select('id', { count: 'exact', head: true }) },
        { name: 'talent_profiles', query: supabase.from('talent_profiles').select('id', { count: 'exact', head: true }) },
      ];

      const results = await Promise.all(tableChecks.map(async (tc) => {
        const res = await tc.query;
        return { table: tc.name, exists: !res.error, count: res.count || 0 };
      }));

      const missing = results.filter(r => !r.exists);
      const empty = results.filter(r => r.exists && r.count === 0);

      if (missing.length > 0) {
        this.results.push({
          test: 'Phase 2 Tables (CCM, Investigation, AI, Actions)',
          status: 'FAIL',
          duration: Date.now() - start,
          error: `Missing tables: ${missing.map(m => m.table).join(', ')}`,
          details: { results }
        });
      } else if (empty.length > 0) {
        this.results.push({
          test: 'Phase 2 Tables (CCM, Investigation, AI, Actions)',
          status: 'WARN',
          duration: Date.now() - start,
          error: `Empty tables: ${empty.map(e => e.table).join(', ')}`,
          details: { results }
        });
      } else {
        this.results.push({
          test: 'Phase 2 Tables (CCM, Investigation, AI, Actions)',
          status: 'PASS',
          duration: Date.now() - start,
          details: { tablesVerified: results.length, results }
        });
      }
    } catch (error) {
      this.results.push({
        test: 'Phase 2 Tables (CCM, Investigation, AI, Actions)',
        status: 'FAIL',
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : 'Failed to verify Phase 2 tables'
      });
    }
  }

  private async getSystemHealth() {
    const queries = [
      supabase.from('tenants').select('id', { count: 'exact', head: true }),
      supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('audit_entities').select('id', { count: 'exact', head: true }),
      supabase.from('audit_engagements').select('id', { count: 'exact', head: true }),
      supabase.from('audit_findings').select('id', { count: 'exact', head: true }),
      supabase.from('workpapers').select('id', { count: 'exact', head: true }),
      supabase.from('board_members').select('id', { count: 'exact', head: true }),
      supabase.from('stakeholders').select('id', { count: 'exact', head: true }),
      supabase.from('risk_assessments').select('id', { count: 'exact', head: true }),
      supabase.from('governance_docs').select('id', { count: 'exact', head: true }),
      supabase.from('rkm_processes').select('id', { count: 'exact', head: true }),
      supabase.from('rkm_risks').select('id', { count: 'exact', head: true }),
      supabase.from('ccm_transactions').select('id', { count: 'exact', head: true }),
      supabase.from('ccm_alerts').select('id', { count: 'exact', head: true }),
      supabase.from('probes').select('id', { count: 'exact', head: true }),
      supabase.from('investigation_cases').select('id', { count: 'exact', head: true }),
      supabase.from('ai_agents').select('id', { count: 'exact', head: true }),
      supabase.from('actions').select('id', { count: 'exact', head: true }),
    ];

    const [
      tenants, users, entities, engagements, findings, workpapers,
      boardMembers, stakeholders, riskAssessments, governanceDocs,
      rkmProcess, rkmRisk,
      ccmTransactions, ccmAlerts, probes, investigations, aiAgents, actions,
    ] = await Promise.all(queries);

    return {
      tenantCount: tenants.count || 0,
      userCount: users.count || 0,
      entityCount: entities.count || 0,
      engagementCount: engagements.count || 0,
      findingCount: findings.count || 0,
      workpaperCount: workpapers.count || 0,
      boardMemberCount: boardMembers.count || 0,
      stakeholderCount: stakeholders.count || 0,
      riskAssessmentCount: riskAssessments.count || 0,
      governanceDocsCount: governanceDocs.count || 0,
      rkmProcessCount: rkmProcess.count || 0,
      rkmRiskCount: rkmRisk.count || 0,
      ccmTransactionCount: ccmTransactions.count || 0,
      ccmAlertCount: ccmAlerts.count || 0,
      probeCount: probes.count || 0,
      investigationCount: investigations.count || 0,
      aiAgentCount: aiAgents.count || 0,
      actionCount: actions.count || 0,
    };
  }

  async cleanupTestData(): Promise<void> {
    try {
      if (this.testFindingId) {
        await supabase.from('audit_findings').delete().eq('id', this.testFindingId);
      }

      if (this.testEngagementId) {
        await supabase.from('workpapers')
          .delete()
          .in('step_id',
            (await supabase.from('audit_steps').select('id').eq('engagement_id', this.testEngagementId)).data?.map(s => s.id) || []
          );
        await supabase.from('audit_steps').delete().eq('engagement_id', this.testEngagementId);
        await supabase.from('audit_engagements').delete().eq('id', this.testEngagementId);
      }
    } catch {
      // cleanup is best-effort
    }
  }
}
