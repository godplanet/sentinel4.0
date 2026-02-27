# Module 8: Sentinel Probes - Continuous Monitoring & Automation

## Overview

Sentinel Probes is an automated continuous monitoring system that allows auditors to create "robots" that continuously check for anomalies, compliance violations, and risk indicators in real-time.

## Architecture

### Database Schema

#### `probes` Table
Stores the configuration of each monitoring probe:
- **id**: Unique identifier
- **title**: Probe name (e.g., "Haftasonu EFT Kontrolü")
- **description**: What the probe monitors
- **query_type**: SQL | API | WEBHOOK
- **query_payload**: The actual query or endpoint
- **schedule_cron**: When to run (cron expression)
- **risk_threshold**: Anomaly threshold (results > threshold = anomaly)
- **is_active**: Active/inactive status
- **last_run_at**: Last execution timestamp
- **last_result_status**: PASS | FAIL | ERROR | RUNNING

#### `probe_logs` Table
Stores execution history and results:
- **id**: Log entry identifier
- **probe_id**: Reference to probe
- **execution_time**: When executed
- **result_data**: JSON result from execution
- **is_anomaly**: Boolean flag for anomaly detection
- **anomaly_count**: Number of anomalies found
- **execution_duration_ms**: Performance metric
- **error_message**: If execution failed

### Entity Layer (`src/entities/probe/`)

**Types** (`model/types.ts`):
- `Probe`: Main probe configuration
- `ProbeLog`: Execution log entry
- `ProbeStats`: Aggregated statistics
- `ProbeWithStats`: Combined probe with statistics

**API** (`api/index.ts`):
- `fetchProbes()`: Get all probes
- `createProbe()`: Create new probe
- `updateProbe()`: Update probe configuration
- `deleteProbe()`: Remove probe
- `fetchProbeLogs()`: Get execution history
- `fetchProbeStats()`: Get aggregated statistics
- `simulateProbeExecution()`: Mock execution for testing

## Features

### 1. ProbeEditor Widget (`src/widgets/ProbeEditor/`)

**Dark-Themed Code Editor:**
- Monospace font for SQL/JSON queries
- Syntax highlighting via CSS (slate-900 background, green-400 text)
- Support for SQL queries, API endpoints, and webhooks

**Test Run Simulation:**
- "Test Çalıştır" button
- Generates mock execution results
- Shows JSON result preview
- Displays anomaly detection in real-time
- Performance metrics (execution time)

**Configuration Options:**
- Title and description
- Query type selection (SQL/API/WEBHOOK)
- Cron schedule configuration
- Risk threshold setting
- Active/inactive toggle

### 2. ContinuousMonitoringPage (`src/pages/monitoring/`)

**Dashboard Metrics:**
- Total probes count
- Active probes count
- Total anomalies detected
- Average anomaly rate

**Probe Cards with Pulse Animation:**
- **Green Pulse**: Active, no recent anomalies
- **Red Pulse**: Active, anomaly detected in last 24h
- **Grey**: Inactive probe
- Real-time status indicators

**Probe Statistics:**
- Total runs
- Anomaly runs
- Anomaly percentage rate
- Average execution time

**Actions:**
- Create new probe
- Edit existing probe
- Toggle active/inactive
- Manual execution ("Çalıştır")
- Delete probe
- View execution history

## Query Types

### 1. SQL Probes
Execute SQL queries against the database:
```sql
SELECT COUNT(*) as count
FROM transactions
WHERE created_at > NOW() - INTERVAL '1 day';
```

### 2. API Probes
Call external REST APIs:
```
https://api.example.com/check-compliance
```

### 3. Webhook Probes
Trigger webhook notifications:
```
https://webhook.site/your-unique-url
```

## Anomaly Detection Logic

```typescript
if (result_count > risk_threshold) {
  is_anomaly = true;
  // Create alert
  // Log to probe_logs
  // Update probe status
}
```

## Cron Schedule Examples

- `0 0 * * *` - Every day at midnight
- `0 */6 * * *` - Every 6 hours
- `0 9-17 * * 1-5` - Every hour 9am-5pm, Monday-Friday
- `*/15 * * * *` - Every 15 minutes

## RLS Security

All probes and logs are isolated by `tenant_id`:
- Users can only view/edit probes in their tenant
- Row Level Security enforced on all tables
- Multi-tenant isolation guaranteed

## Helper Functions

### `get_probe_anomaly_stats(probe_uuid, days_back)`
Returns aggregated statistics:
- Total runs
- Anomaly runs
- Anomaly rate (%)
- Average execution time
- Last anomaly timestamp

## Usage Flow

1. **Create Probe**: Navigate to `/monitoring/probes`
2. **Configure**: Set query, schedule, and threshold
3. **Test**: Use "Test Çalıştır" to simulate
4. **Activate**: Toggle active status
5. **Monitor**: Watch pulse animation for status
6. **Review Logs**: Check execution history

## UI Components

### Pulse Animation
```typescript
<motion.div
  animate={{
    scale: [1, 1.2, 1],
    opacity: [1, 0.8, 1],
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
/>
```

### Status Colors
- **Green** (#10b981): Normal operation
- **Red** (#ef4444): Anomaly detected
- **Grey** (#64748b): Inactive
- **Blue** (#3b82f6): Running/executing

## Future Enhancements

1. Real scheduling engine (cron executor)
2. Email/Slack notifications on anomalies
3. Probe templates library
4. Historical trend charts
5. Machine learning anomaly detection
6. Integration with finding creation
7. Probe dependencies and workflows

## Navigation

**Sidebar**: İzleme (Monitoring) → Sürekli Denetim (Probes)

**Route**: `/monitoring/probes`

**Icon**: ⚡ (Zap/Lightning bolt)

## Technical Stack

- **Frontend**: React + TypeScript + Framer Motion
- **Backend**: Supabase (PostgreSQL)
- **Scheduling**: Cron expressions
- **Real-time**: Supabase Realtime subscriptions
- **Security**: Row Level Security (RLS)

## Best Practices

1. **Start with High Threshold**: Avoid false positives
2. **Test Before Activating**: Always use "Test Çalıştır"
3. **Monitor Performance**: Check execution_duration_ms
4. **Regular Review**: Check logs weekly
5. **Descriptive Names**: Clear probe titles
6. **Document Queries**: Add descriptions
7. **Schedule Wisely**: Avoid peak hours for heavy queries

## Integration Points

- **Findings Module**: Auto-create findings from anomalies
- **Action Tracking**: Link probes to corrective actions
- **Reporting**: Include probe statistics in reports
- **Risk Universe**: Connect to risk entities
- **Audit Planning**: Use probe data for risk assessment
