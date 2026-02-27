/**
 * Sentinel Prime Function Calling System
 *
 * Enables the AI to perform read actions via "Slash Commands":
 * - /analyze <finding_id> - Fetches finding details and critiques root cause
 * - /constitution - Summarizes current risk weights
 * - /entity <entity_name> - Shows entity risk profile
 * - /veto - Lists active veto rules
 */

import { supabase } from '@/shared/api/supabase';
import type { SentinelAction } from './types';

/**
 * Analyzes a specific finding and returns detailed context
 */
async function analyzeFinding(args: string[]): Promise<string> {
  const findingId = args[0];

  if (!findingId) {
    return '❌ Usage: /analyze <finding_id>';
  }

  try {
    const { data: finding, error } = await supabase
      .from('audit_findings')
      .select(
        `
        *,
        audit_universe!inner(entity_name, path, risk_score)
      `
      )
      .eq('id', findingId)
      .maybeSingle();

    if (error) throw error;

    if (!finding) {
      return `❌ Finding ${findingId} not found.`;
    }

    const entity = finding.audit_universe;

    return `📊 FINDING ANALYSIS

**Finding ID:** ${finding.id}
**Title:** ${finding.finding_title}
**Severity:** ${finding.severity} (Score: ${finding.risk_score}/100)
**Status:** ${finding.status}

**Entity Context:**
- Name: ${entity.entity_name}
- Path: ${entity.path}
- Entity Risk Score: ${entity.risk_score}/100

**Root Cause:**
${finding.root_cause || 'Not documented'}

**5 Whys Analysis:**
${finding.five_whys ? JSON.stringify(finding.five_whys, null, 2) : 'Not performed'}

**Impact:**
${finding.impact_description || 'Not documented'}

**Management Response:**
${finding.management_response || 'Pending'}

**Constitutional Context:**
Under the active Risk Constitution, this finding was classified as ${finding.severity} because:
- Impact Dimension Score: ${finding.impact_score || 'Unknown'}
- Likelihood Score: ${finding.likelihood_score || 'Unknown'}
- Control Effectiveness: ${finding.control_effectiveness || 'Unknown'}%

${finding.severity === 'Critical' ? '⚠️ CRITICAL VETO ACTIVE: This finding triggers constitutional override rules.' : ''}

**Audit Recommendation:**
${finding.ai_recommendation || 'The root cause analysis needs deeper investigation. Challenge the "Why" at each level.'}`;
  } catch (err) {
    return `❌ Error analyzing finding: ${err instanceof Error ? err.message : 'Unknown error'}`;
  }
}

/**
 * Summarizes the current risk constitution
 */
async function showConstitution(args: string[]): Promise<string> {
  try {
    const { data: constitution, error } = await supabase
      .from('methodology_configs')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;

    if (!constitution) {
      return '❌ No active Risk Constitution found. System is operating without governance rules.';
    }

    const weights = constitution.dimension_weights as Record<string, number>;
    const vetoRules = constitution.veto_rules as Record<string, any>;

    return `📜 ACTIVE RISK CONSTITUTION

**Methodology:** ${constitution.methodology_name}
**Version:** ${constitution.version}
**Last Updated:** ${new Date(constitution.updated_at).toLocaleString()}

**RISK DIMENSION WEIGHTS:**
${Object.entries(weights)
  .map(([dim, weight]) => `- ${dim}: ${weight}%`)
  .join('\n')}

**BASE SCORE:** ${constitution.base_score} (Deduction-based grading)

**GRADING SCALE:**
${JSON.stringify(constitution.grading_scale, null, 2)}

**VETO RULES (Critical Overrides):**
${JSON.stringify(vetoRules, null, 2)}

**KEY PRINCIPLES:**
- If 1 CRITICAL finding exists → Maximum audit grade is 60 (D)
- Shari'ah violations (Haram income) trigger immediate escalation to Shari'ah Board
- CVSS 9.0+ cyber vulnerabilities trigger Cyber Veto
- BDDK regulatory breaches require 48-hour reporting

**RISK FORMULA:**
\`\`\`
Risk Score = (Impact × ln(Volume)) × (1 - Control_Effectiveness)
Inherent Risk = Impact × ln(Volume)
Residual Risk = Inherent Risk × (1 - Control_Effectiveness)
\`\`\`

This Constitution is immutable during an audit engagement. Only the Chief Risk Officer can authorize changes.`;
  } catch (err) {
    return `❌ Error loading constitution: ${err instanceof Error ? err.message : 'Unknown error'}`;
  }
}

/**
 * Shows entity risk profile
 */
async function showEntity(args: string[]): Promise<string> {
  const entityName = args.join(' ');

  if (!entityName) {
    return '❌ Usage: /entity <entity_name>';
  }

  try {
    const { data: entities, error } = await supabase
      .from('audit_universe')
      .select('*')
      .ilike('entity_name', `%${entityName}%`)
      .limit(5);

    if (error) throw error;

    if (!entities || entities.length === 0) {
      return `❌ No entities found matching "${entityName}"`;
    }

    if (entities.length === 1) {
      const entity = entities[0];
      return `🏛️ ENTITY RISK PROFILE

**Name:** ${entity.entity_name}
**Hierarchy:** ${entity.path}
**Entity Type:** ${entity.entity_type}
**Risk Score:** ${entity.risk_score}/100

**Risk Classification:**
${entity.risk_score >= 90 ? '🔴 CRITICAL RISK' : entity.risk_score >= 70 ? '🟠 HIGH RISK' : entity.risk_score >= 40 ? '🟡 MEDIUM RISK' : '🟢 LOW RISK'}

**Risk Velocity:**
${entity.risk_velocity ? `Direction: ${entity.risk_velocity} | Speed: ${entity.velocity_multiplier}x` : 'Not tracked'}

**Strategic Zone:**
${entity.strategic_zone || 'Not classified'}

**Key Inherent Risks:**
${entity.inherent_risks ? JSON.stringify(entity.inherent_risks, null, 2) : 'Not documented'}

**Last Risk Assessment:** ${entity.last_risk_assessment ? new Date(entity.last_risk_assessment).toLocaleDateString() : 'Never'}`;
    } else {
      return `🔍 Multiple entities found matching "${entityName}":

${entities
  .map(
    (e, i) =>
      `${i + 1}. ${e.entity_name} (${e.path}) - Risk Score: ${e.risk_score}/100`
  )
  .join('\n')}

Use the exact entity name to get detailed profile.`;
    }
  } catch (err) {
    return `❌ Error fetching entity: ${err instanceof Error ? err.message : 'Unknown error'}`;
  }
}

/**
 * Lists active veto rules
 */
async function showVetoRules(): Promise<string> {
  try {
    const { data: constitution, error } = await supabase
      .from('methodology_configs')
      .select('veto_rules, methodology_name')
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;

    if (!constitution) {
      return '❌ No active constitution found.';
    }

    const vetoRules = constitution.veto_rules as Record<string, any>;

    return `🚫 ACTIVE VETO RULES (${constitution.methodology_name})

Veto rules are constitutional overrides that automatically escalate certain findings regardless of calculated scores.

${JSON.stringify(vetoRules, null, 2)}

**Common Veto Triggers:**
- **Shari'ah Veto:** Any Haram income detection
- **Cyber Veto:** CVSS score ≥ 9.0 (Critical vulnerabilities)
- **Regulatory Veto:** BDDK Category 1 violations
- **Fraud Veto:** Confirmed financial misconduct

When a veto is triggered:
1. Finding is auto-classified as CRITICAL
2. Maximum audit grade is capped at 60 (D)
3. Immediate escalation to relevant board/committee
4. 48-hour reporting requirement to regulators (if applicable)

Veto rules CANNOT be overridden by auditors. Only Chief Risk Officer can modify.`;
  } catch (err) {
    return `❌ Error loading veto rules: ${err instanceof Error ? err.message : 'Unknown error'}`;
  }
}

/**
 * Shows recent audit activity
 */
async function showActivity(): Promise<string> {
  try {
    const { data: engagements, error } = await supabase
      .from('audit_engagements')
      .select('engagement_name, status, start_date, end_date')
      .order('start_date', { ascending: false })
      .limit(5);

    if (error) throw error;

    if (!engagements || engagements.length === 0) {
      return '📊 No recent audit engagements found.';
    }

    return `📊 RECENT AUDIT ACTIVITY

${engagements
  .map(
    (e, i) =>
      `${i + 1}. **${e.engagement_name}**
   Status: ${e.status}
   Period: ${e.start_date} → ${e.end_date || 'Ongoing'}`
  )
  .join('\n\n')}`;
  } catch (err) {
    return `❌ Error fetching activity: ${err instanceof Error ? err.message : 'Unknown error'}`;
  }
}

/**
 * Shows help for available commands
 */
function showHelp(): string {
  return `🤖 SENTINEL PRIME SLASH COMMANDS

**/analyze <finding_id>**
Fetch detailed analysis of a specific finding, including root cause critique and constitutional context.

**/constitution**
Display the current active Risk Constitution (dimension weights, veto rules, grading scale).

**/entity <entity_name>**
Show risk profile for a specific entity in the audit universe.

**/veto**
List all active veto rules and their triggers.

**/activity**
Show recent audit engagements and their status.

**/help**
Display this help message.

**Example Usage:**
\`\`\`
User: /analyze abc123
User: /entity "Treasury Department"
User: /constitution
\`\`\`

**Pro Tips:**
- Commands are case-insensitive
- Multi-word arguments should be in quotes
- Commands can be combined with natural language questions

**Ask me anything about risk methodology, audit standards, or specific findings!**`;
}

/**
 * Registry of all available Sentinel actions
 */
export const SENTINEL_ACTIONS: Record<string, SentinelAction> = {
  analyze: {
    command: '/analyze',
    description: 'Analyze a specific finding with detailed context',
    handler: analyzeFinding,
  },
  constitution: {
    command: '/constitution',
    description: 'Display active Risk Constitution',
    handler: async () => showConstitution([]),
  },
  entity: {
    command: '/entity',
    description: 'Show entity risk profile',
    handler: showEntity,
  },
  veto: {
    command: '/veto',
    description: 'List active veto rules',
    handler: async () => showVetoRules(),
  },
  activity: {
    command: '/activity',
    description: 'Show recent audit activity',
    handler: async () => showActivity(),
  },
  help: {
    command: '/help',
    description: 'Show available commands',
    handler: async () => showHelp(),
  },
};

/**
 * Parses user input to detect and execute slash commands
 */
export async function executeSlashCommand(input: string): Promise<string | null> {
  const trimmed = input.trim();

  if (!trimmed.startsWith('/')) {
    return null;
  }

  const parts = trimmed.slice(1).split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  const action = SENTINEL_ACTIONS[command];

  if (!action) {
    return `❌ Unknown command: /${command}\n\nType /help to see available commands.`;
  }

  try {
    return await action.handler(args);
  } catch (err) {
    return `❌ Error executing /${command}: ${err instanceof Error ? err.message : 'Unknown error'}`;
  }
}

/**
 * Checks if input contains a slash command
 */
export function isSlashCommand(input: string): boolean {
  return input.trim().startsWith('/');
}
