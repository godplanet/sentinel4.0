import { supabase } from '@/shared/api/supabase';

interface ValidationResult {
  table: string;
  expected: number;
  actual: number;
  status: 'PASS' | 'FAIL';
  message?: string;
}

export class SeederValidator {
  static async validate(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    console.log('🔍 Starting Seeder Validation...\n');

    // Define expected counts
    const expectations = [
      { table: 'tenants', expected: 1, description: 'Tenant' },
      { table: 'user_profiles', expected: 20, description: 'Users' },
      { table: 'audit_entities', expected: 61, description: 'Entities (HQ + Depts + Branches)' },
      { table: 'risk_library', expected: 50, description: 'Risk Definitions' },
      { table: 'risk_assessments', expected: 50, description: 'Risk Assessments' },
      { table: 'audit_engagements', expected: 15, description: 'Engagements' },
      { table: 'audit_findings', expected: 50, description: 'Findings' },
      { table: 'finding_secrets', expected: 50, description: 'Finding Secrets (5-Whys)' },
      { table: 'action_plans', expected: 30, description: 'Action Plans' },
      { table: 'workpapers', expected: 100, description: 'Workpapers' },
      { table: 'ccm_alerts', expected: 50, description: 'CCM Alerts' },
      { table: 'board_meetings', expected: 5, description: 'Board Meetings' },
      { table: 'governance_docs', expected: 15, description: 'Governance Documents' },
      { table: 'timesheets', expected: 200, description: 'Timesheet Entries', operator: '>=' },
      { table: 'qaip_kpis', expected: 15, description: 'QAIP KPIs' },
      { table: 'pbc_requests', expected: 10, description: 'PBC Requests', operator: '>=' },
    ];

    for (const expectation of expectations) {
      const result = await this.validateTable(
        expectation.table,
        expectation.expected,
        expectation.description,
        expectation.operator || '='
      );
      results.push(result);
    }

    // Print summary
    console.log('\n📊 Validation Summary:');
    console.log('━'.repeat(80));

    results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      const status = result.status === 'PASS' ? 'PASS' : 'FAIL';
      console.log(`${icon} ${result.table.padEnd(25)} | Expected: ${String(result.expected).padStart(4)} | Actual: ${String(result.actual).padStart(4)} | ${status}`);
      if (result.message) {
        console.log(`   ℹ️  ${result.message}`);
      }
    });

    const passCount = results.filter(r => r.status === 'PASS').length;
    const failCount = results.filter(r => r.status === 'FAIL').length;

    console.log('━'.repeat(80));
    console.log(`\n✅ Passed: ${passCount} / ${results.length}`);
    console.log(`❌ Failed: ${failCount} / ${results.length}`);

    if (failCount === 0) {
      console.log('\n🎉 All validation checks passed! Seeder executed correctly.\n');
    } else {
      console.log('\n⚠️  Some validation checks failed. Review the results above.\n');
    }

    return results;
  }

  private static async validateTable(
    table: string,
    expected: number,
    description: string,
    operator: '=' | '>=' | '<=' = '='
  ): Promise<ValidationResult> {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        return {
          table,
          expected,
          actual: 0,
          status: 'FAIL',
          message: `Database error: ${error.message}`
        };
      }

      const actual = count || 0;
      let status: 'PASS' | 'FAIL' = 'FAIL';

      if (operator === '=') {
        status = actual === expected ? 'PASS' : 'FAIL';
      } else if (operator === '>=') {
        status = actual >= expected ? 'PASS' : 'FAIL';
      } else if (operator === '<=') {
        status = actual <= expected ? 'PASS' : 'FAIL';
      }

      return {
        table,
        expected,
        actual,
        status,
        message: status === 'FAIL' ? `${description} count mismatch` : undefined
      };
    } catch (error) {
      return {
        table,
        expected,
        actual: 0,
        status: 'FAIL',
        message: `Validation error: ${error}`
      };
    }
  }

  static async validateDataIntegrity(): Promise<void> {
    console.log('\n🔍 Validating Data Integrity...\n');

    // 1. Check orphaned findings (findings without valid engagement)
    const { data: orphanedFindings } = await supabase
      .from('audit_findings')
      .select('id, code, engagement_id')
      .is('engagement_id', null);

    if (orphanedFindings && orphanedFindings.length > 0) {
      console.log(`❌ Found ${orphanedFindings.length} orphaned findings (no engagement)`);
    } else {
      console.log('✅ No orphaned findings');
    }

    // 2. Check orphaned actions (actions without valid finding)
    const { data: orphanedActions } = await supabase
      .from('action_plans')
      .select('id, title, finding_id')
      .is('finding_id', null);

    if (orphanedActions && orphanedActions.length > 0) {
      console.log(`❌ Found ${orphanedActions.length} orphaned actions (no finding)`);
    } else {
      console.log('✅ No orphaned actions');
    }

    // 3. Check ltree paths are valid
    const { data: entities } = await supabase
      .from('audit_entities')
      .select('id, path, parent_path');

    let invalidPaths = 0;
    if (entities) {
      entities.forEach(entity => {
        if (!entity.path || entity.path.trim() === '') {
          invalidPaths++;
        }
      });
    }

    if (invalidPaths > 0) {
      console.log(`❌ Found ${invalidPaths} entities with invalid ltree paths`);
    } else {
      console.log('✅ All entity ltree paths are valid');
    }

    // 4. Check date logic (created_at < updated_at)
    const { data: findings } = await supabase
      .from('audit_findings')
      .select('id, created_at, updated_at');

    let invalidDates = 0;
    if (findings) {
      findings.forEach(finding => {
        if (new Date(finding.created_at) > new Date(finding.updated_at)) {
          invalidDates++;
        }
      });
    }

    if (invalidDates > 0) {
      console.log(`❌ Found ${invalidDates} findings with invalid dates (created > updated)`);
    } else {
      console.log('✅ All finding dates are logically valid');
    }

    console.log('\n✅ Data integrity validation complete.\n');
  }

  static async quickCheck(): Promise<boolean> {
    const { count } = await supabase
      .from('audit_findings')
      .select('*', { count: 'exact', head: true });

    return (count || 0) >= 50;
  }
}

// Export for console use
if (typeof window !== 'undefined') {
  (window as any).validateSeeder = () => SeederValidator.validate();
  (window as any).validateIntegrity = () => SeederValidator.validateDataIntegrity();
}

export default SeederValidator;
