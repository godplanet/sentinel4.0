# Sentinel Prime API Reference

## Quick Start

### 1. Import the Context Hook

```typescript
import { useSentinelContext } from '@/features/ai-agents/sentinel-prime';

function MyComponent() {
  const { context, isLoading, error, loadingSteps } = useSentinelContext({
    includeConstitution: true,
    includeUniverse: true,
    includeFindings: true,
  });

  if (isLoading) return <div>Loading constitutional context...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Constitution: {context?.constitution?.methodology_name}</h2>
      <p>Total Entities: {context?.universeStats?.totalEntities}</p>
      <p>Recent Findings: {context?.recentFindings?.total}</p>
    </div>
  );
}
```

### 2. Generate System Prompt

```typescript
import { generateSystemPrompt, type SystemContext } from '@/features/ai-agents/sentinel-prime';

const systemPrompt = generateSystemPrompt(context, {
  persona: 'skeptical',  // 'skeptical' | 'neutral' | 'advisory'
  mode: 'audit',         // 'audit' | 'advisory' | 'investigation'
  language: 'en',        // 'en' | 'tr'
});

// Use systemPrompt with your AI provider (OpenAI, Gemini, etc.)
```

### 3. Execute Slash Commands

```typescript
import { executeSlashCommand, isSlashCommand } from '@/features/ai-agents/sentinel-prime';

const userInput = '/constitution';

if (isSlashCommand(userInput)) {
  const result = await executeSlashCommand(userInput);
  console.log(result); // Formatted markdown response
}
```

### 4. Display Thinking Indicator

```typescript
import { ThinkingIndicator } from '@/features/ai-agents/sentinel-prime';

function ChatPanel() {
  const { loadingSteps, isLoading } = useSentinelContext();

  return (
    <div>
      <ThinkingIndicator steps={loadingSteps} isVisible={isLoading} />
      {/* Rest of your chat UI */}
    </div>
  );
}
```

---

## Available Commands

### `/analyze <finding_id>`

Fetch detailed analysis of a specific finding.

**Example:**
```
/analyze abc123
```

**Response Structure:**
- Finding details (title, severity, status)
- Entity context (name, path, risk score)
- Root cause analysis
- 5 Whys breakdown
- Constitutional context (dimension scores)
- AI recommendation

### `/constitution`

Display the current active Risk Constitution.

**Response Includes:**
- Methodology name and version
- Risk dimension weights
- Grading scale
- Veto rules
- Base score
- Risk formula

### `/entity <entity_name>`

Show risk profile for a specific entity.

**Example:**
```
/entity Treasury Department
```

**Response Structure:**
- Entity name and hierarchy path
- Entity type
- Risk score (0-100)
- Risk classification
- Risk velocity
- Strategic zone
- Inherent risks
- Last assessment date

### `/veto`

List all active veto rules and their triggers.

**Response Includes:**
- Shari'ah Veto
- Cyber Veto
- Regulatory Veto
- Fraud Veto
- Escalation procedures

### `/activity`

Show recent audit engagements.

**Response Structure:**
- List of 5 most recent engagements
- Engagement name
- Status
- Start and end dates

### `/help`

Display command reference and usage examples.

---

## Hook Options

### `useSentinelContext(options)`

**Options:**

```typescript
interface UseSentinelContextOptions {
  includeConstitution?: boolean;  // Default: true
  includeUniverse?: boolean;      // Default: true
  includeFindings?: boolean;      // Default: true
  autoRefresh?: boolean;          // Default: false
  refreshIntervalMs?: number;     // Default: 60000 (1 minute)
}
```

**Returns:**

```typescript
interface UseSentinelContextResult {
  context: SystemContext | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  loadingSteps: Array<{
    step: string;
    status: 'loading' | 'complete' | 'error';
  }>;
}
```

**Example with Auto-Refresh:**

```typescript
const { context } = useSentinelContext({
  autoRefresh: true,
  refreshIntervalMs: 30000, // Refresh every 30 seconds
});
```

---

## System Context Structure

```typescript
interface SystemContext {
  constitution?: RiskConstitution;
  universeStats?: UniverseStats;
  recentFindings?: RecentFindingsStats;
  currentUser?: CurrentUser;
  timestamp: string;
}

interface RiskConstitution {
  id: string;
  methodology_name: string;
  version: string;
  dimension_weights: Record<string, number>;
  grading_scale: GradingScale;
  veto_rules?: Record<string, any>;
  base_score: number;
  updated_at: string;
  is_active: boolean;
}

interface UniverseStats {
  totalEntities: number;
  highRiskCount: number;
  criticalRiskCount: number;
  highRiskPercentage: number;
  avgRiskScore: number;
  topRiskyEntities: Array<{
    name: string;
    path: string;
    risk_score: number;
  }>;
}

interface RecentFindingsStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  openActions: number;
  avgRemediationDays: number;
  pendingResponses: number;
}

interface CurrentUser {
  id: string;
  email: string;
  role: string;
  department?: string;
  name?: string;
}
```

---

## Creating Custom Slash Commands

### Step 1: Define the Handler

```typescript
// src/features/ai-agents/sentinel-prime/function-calling.ts

async function myCustomCommand(args: string[]): Promise<string> {
  const param = args[0];

  // Your custom logic here
  const { data, error } = await supabase
    .from('my_table')
    .select('*')
    .eq('id', param);

  if (error) throw error;

  return `Result: ${JSON.stringify(data, null, 2)}`;
}
```

### Step 2: Register the Command

```typescript
export const SENTINEL_ACTIONS: Record<string, SentinelAction> = {
  // ... existing commands
  mycommand: {
    command: '/mycommand',
    description: 'My custom command description',
    handler: myCustomCommand,
  },
};
```

### Step 3: Use It

```
User: /mycommand abc123
Sentinel: Result: { ... }
```

---

## Prompt Configuration

### Persona Modes

**Skeptical** (Default for Audit Mode):
- Professional skepticism
- Challenges assumptions
- Demands evidence
- Questions root cause depth

**Neutral** (For General Queries):
- Balanced tone
- Informative responses
- No bias toward approval/rejection

**Advisory** (For Planning):
- Collaborative tone
- Suggests best practices
- Proactive risk identification
- Less confrontational

### Operation Modes

**Audit Mode** (Default):
```typescript
generateSystemPrompt(context, {
  persona: 'skeptical',
  mode: 'audit',
  language: 'en',
});
```

**Advisory Mode**:
```typescript
generateAdvisoryPrompt(context);
```

**Investigation Mode**:
```typescript
generateInvestigationPrompt(context);
```

---

## Utility Functions

### `formatContextForAI(context: SystemContext): string`

Formats the system context into a compact string for AI consumption.

**Example Output:**
```
[CONSTITUTION: KERD 2026 v3.0] [UNIVERSE: 142 entities, 8 critical] [FINDINGS: 23 (30d), 2 critical] [USER: Senior Auditor]
```

### `generateUserContextHints(userRole: string): string`

Generates role-specific context hints.

**Example:**
```typescript
generateUserContextHints('Chief Auditor');
// Returns: "You have full system access. I can discuss strategic risk insights."
```

---

## Error Handling

### Context Loading Errors

```typescript
const { context, error } = useSentinelContext();

if (error) {
  console.error('Failed to load Sentinel context:', error);
  // Fallback to basic AI mode without constitutional context
}
```

### Slash Command Errors

```typescript
try {
  const result = await executeSlashCommand('/invalid');
  console.log(result);
} catch (err) {
  console.error('Command execution failed:', err);
}
```

---

## Performance Considerations

### Context Loading Time

Typical loading time: **200-500ms**

Steps breakdown:
- Read Constitution: ~50ms
- Analyze Universe: ~100-200ms (depends on entity count)
- Check Findings: ~50-150ms

### Caching Strategy

The `useSentinelContext` hook does NOT cache by default. To implement caching:

```typescript
// Option 1: Manual refresh control
const { context, refresh } = useSentinelContext({
  autoRefresh: false,
});

// Refresh only when needed
useEffect(() => {
  if (someCondition) {
    refresh();
  }
}, [someCondition]);

// Option 2: Auto-refresh with longer interval
const { context } = useSentinelContext({
  autoRefresh: true,
  refreshIntervalMs: 300000, // 5 minutes
});
```

---

## Testing

### Mock System Context

```typescript
import type { SystemContext } from '@/features/ai-agents/sentinel-prime';

const mockContext: SystemContext = {
  constitution: {
    id: 'test-123',
    methodology_name: 'KERD 2026 Test',
    version: 'v1.0',
    dimension_weights: {
      impact: 35,
      likelihood: 25,
      control: 20,
    },
    grading_scale: {
      A: { min: 90, max: 100, color: 'green' },
      B: { min: 80, max: 89, color: 'blue' },
      C: { min: 70, max: 79, color: 'yellow' },
      D: { min: 60, max: 69, color: 'orange' },
      F: { min: 0, max: 59, color: 'red' },
    },
    base_score: 100,
    updated_at: new Date().toISOString(),
    is_active: true,
  },
  universeStats: {
    totalEntities: 100,
    highRiskCount: 15,
    criticalRiskCount: 3,
    highRiskPercentage: 15,
    avgRiskScore: 65.5,
    topRiskyEntities: [],
  },
  recentFindings: {
    total: 45,
    critical: 2,
    high: 12,
    medium: 25,
    low: 6,
    openActions: 18,
    avgRemediationDays: 22,
    pendingResponses: 5,
  },
  timestamp: new Date().toISOString(),
};
```

### Test Slash Commands

```typescript
import { executeSlashCommand } from '@/features/ai-agents/sentinel-prime';

describe('Slash Commands', () => {
  it('should display help', async () => {
    const result = await executeSlashCommand('/help');
    expect(result).toContain('SENTINEL PRIME SLASH COMMANDS');
  });

  it('should show constitution', async () => {
    const result = await executeSlashCommand('/constitution');
    expect(result).toContain('ACTIVE RISK CONSTITUTION');
  });
});
```

---

## Integration Examples

### Custom Dashboard Widget

```typescript
import { useSentinelContext, formatContextForAI } from '@/features/ai-agents/sentinel-prime';

function RiskDashboard() {
  const { context, isLoading } = useSentinelContext();

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h2>{context?.constitution?.methodology_name}</h2>
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Total Entities"
          value={context?.universeStats?.totalEntities}
        />
        <StatCard
          title="Critical Risk"
          value={context?.universeStats?.criticalRiskCount}
          variant="danger"
        />
        <StatCard
          title="Open Actions"
          value={context?.recentFindings?.openActions}
          variant="warning"
        />
      </div>
    </div>
  );
}
```

### Finding Detail Page

```typescript
import { executeSlashCommand } from '@/features/ai-agents/sentinel-prime';

function FindingDetail({ findingId }: { findingId: string }) {
  const [analysis, setAnalysis] = useState<string>('');

  useEffect(() => {
    executeSlashCommand(`/analyze ${findingId}`).then(setAnalysis);
  }, [findingId]);

  return (
    <div>
      <h2>Finding Analysis</h2>
      <pre>{analysis}</pre>
    </div>
  );
}
```

---

## Troubleshooting

### Context Not Loading

**Problem:** `context` remains `null` after loading.

**Solutions:**
1. Check database connection (Supabase)
2. Verify RLS policies (user has SELECT permission)
3. Check browser console for errors
4. Verify `methodology_configs` table has active record

### Slash Commands Not Working

**Problem:** Commands return "Unknown command" error.

**Solutions:**
1. Ensure command starts with `/`
2. Check command name spelling
3. Verify command is registered in `SENTINEL_ACTIONS`
4. Check database permissions for command data source

### AI Not Citing Constitution

**Problem:** AI gives generic responses without constitutional context.

**Solutions:**
1. Verify `includeConstitution: true` in `useSentinelContext()`
2. Check that system prompt is being generated correctly
3. Ensure AI provider is receiving the system prompt
4. Verify `methodology_configs` table has data

---

## Best Practices

1. **Always Load Context**: Use `useSentinelContext()` in components that need constitutional awareness
2. **Handle Loading States**: Show loading indicators while context loads
3. **Error Boundaries**: Wrap Sentinel components in error boundaries
4. **Minimal Re-renders**: Use auto-refresh sparingly to avoid performance impact
5. **Type Safety**: Always use TypeScript interfaces for context objects
6. **Test with Mock Data**: Use mock contexts during development
7. **Security**: Never expose sensitive data in AI prompts
8. **Logging**: Log slash command usage for audit trail

---

## Next Steps

- Implement ComputeAI (Python sandbox) for risk calculations
- Add real-time context updates via Supabase Realtime
- Build custom slash commands for your domain
- Integrate with external AI providers (OpenAI, Anthropic)
- Add voice input/output for hands-free audit assistance

---

**For questions or issues, contact the Sentinel Prime development team.**
