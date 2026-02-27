# Sentinel Prime - AI Persona System

## Overview

**Sentinel Prime** is the AI-native cognitive assistant built into Sentinel v3.0. It is NOT a generic chatbot. It is a **skeptical senior auditor** that reads the live Risk Constitution and provides context-aware audit analysis.

## 🎯 Core Mission

When you ask: **"Why is this finding Critical?"**

Sentinel Prime responds:
> *"Because under Article 3.3 of the Constitution, a score >90 is Bordo/Critical, and this finding triggered the Shari'ah Veto due to Haram income detection. Per AAOIFI GSIFI-10, any Riba-based transaction automatically escalates to the Shari'ah Board within 24 hours."*

It **NEVER** makes up rules. It **ALWAYS** cites the active `methodology_configs` from the database.

---

## 🏗️ Architecture

### 1. **System Prompt Generator** (`system-prompt.ts`)

Generates the foundational instruction set for Sentinel Prime based on:

- **Active Risk Constitution** (dimension weights, veto rules, grading scale)
- **Audit Universe Statistics** (total entities, high-risk count, critical entities)
- **Recent Findings** (30-day summary, open actions, remediation time)
- **Current User Context** (role, department, permissions)

**Key Personality Traits:**
- Professional skepticism (challenges assumptions)
- Evidence-focused (demands documentary proof)
- Regulation-aware (GIAS 2024, AAOIFI GSIFI, BDDK)
- Constitutional compliance (follows methodology_configs strictly)

**Example Modes:**
- **Audit Mode** (default): Skeptical, evidence-focused
- **Advisory Mode**: Collaborative, planning-focused
- **Investigation Mode**: Forensic, pattern-recognition focused

### 2. **Context Injection Hook** (`useSentinelContext.ts`)

Implements **RAG Lite** (Retrieval Augmented Generation) by fetching:

```typescript
interface SystemContext {
  constitution?: RiskConstitution;     // Active methodology_configs
  universeStats?: UniverseStats;       // Entity risk distribution
  recentFindings?: RecentFindingsStats; // 30-day finding summary
  currentUser?: CurrentUser;           // User role and permissions
  timestamp: string;
}
```

**Data Sources:**
- `methodology_configs` (Risk Constitution)
- `audit_universe` (Entity hierarchy and risk scores)
- `audit_findings` (Finding statistics)
- `action_steps` (Open remediation actions)

**Loading Steps** (visible to user):
1. ✅ Reading Risk Constitution...
2. ✅ Analyzing Audit Universe...
3. ✅ Checking Recent Findings...

### 3. **Function Calling System** (`function-calling.ts`)

Enables **slash commands** for direct database queries:

| Command | Description | Example |
|---------|-------------|---------|
| `/analyze <finding_id>` | Deep-dive into a specific finding | `/analyze abc123` |
| `/constitution` | Display active Risk Constitution | `/constitution` |
| `/entity <name>` | Show entity risk profile | `/entity "Treasury Department"` |
| `/veto` | List active veto rules | `/veto` |
| `/activity` | Show recent audit engagements | `/activity` |
| `/help` | Display command reference | `/help` |

**Example: `/constitution` Output:**

```
📜 ACTIVE RISK CONSTITUTION

Methodology: KERD 2026 (K-Risk Engine)
Version: v3.0
Last Updated: 2026-02-08

RISK DIMENSION WEIGHTS:
- Impact: 35%
- Likelihood: 25%
- Control: 20%
- Volume: 15%
- Velocity: 5%

BASE SCORE: 100 (Deduction-based grading)

VETO RULES:
- Shari'ah Veto: Haram income → Auto CRITICAL
- Cyber Veto: CVSS ≥ 9.0 → Auto CRITICAL
- Regulatory Veto: BDDK Category 1 → Auto CRITICAL

KEY PRINCIPLES:
- If 1 CRITICAL finding exists → Max audit grade = 60 (D)
- Shari'ah violations → 24-hour Shari'ah Board escalation
- BDDK breaches → 48-hour regulator reporting
```

### 4. **Thinking Indicator** (`ThinkingIndicator.tsx`)

Visual feedback showing what context is being loaded:

```
🧠 Sentinel Prime Initializing...
  ✓ Reading Risk Constitution
  ✓ Analyzing Audit Universe
  ✓ Checking Recent Findings
  ✓ Context loaded. Ready to assist.
```

**UI States:**
- **Loading**: Animated brain icon with pulsing glow (blue)
- **Armed**: Shield icon with green dot (context loaded)
- **Error**: Red X with error message

---

## 🔧 Integration

### Chat Widget (`SentinelChat`)

The upgraded `SentinelChatPanel` now:

1. **Auto-loads context** on mount via `useSentinelContext()`
2. **Shows loading steps** via `ThinkingIndicator`
3. **Displays armed status** in header (green "ARMED" badge)
4. **Executes slash commands** before sending to AI
5. **Prepends constitutional context** to all queries

**Enhanced Header:**
```tsx
<div className="flex items-center gap-2.5">
  <Shield className="w-4 h-4 text-white" />
  <div>
    <div className="text-sm font-bold text-white">
      Sentinel Prime
      <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
        ARMED
      </span>
    </div>
    <div className="text-[10px] text-slate-400">
      Guardian of the Bank's Amanah
    </div>
  </div>
</div>
```

### Chat Engine (`useChatEngine.ts`)

Upgraded to:

```typescript
const { context: sentinelContext, isLoading: contextLoading } = useSentinelContext();

// If slash command, execute immediately
if (isSlashCommand(prompt)) {
  const result = await executeSlashCommand(prompt);
  updateLastMessage(result, true);
  return;
}

// Generate system prompt with constitutional context
const systemPrompt = generateSystemPrompt(sentinelContext, {
  persona: 'skeptical',
  mode: 'audit',
  language: 'en',
});

// Prepend context to user query
const contextPrefix = formatContextForAI(sentinelContext);
const fullPrompt = `${contextPrefix}\n\n${prompt}`;
```

---

## 📖 Usage Examples

### Example 1: Constitutional Inquiry

**User:** "What is our current risk appetite for Cyber threats?"

**Sentinel Prime:**
> Currently, Cyber Risk has a weight of 20% in the KERD 2026 Constitution. However, the **Cyber Veto** is ACTIVE for CVSS scores ≥ 9.0. This means any critical vulnerability (CVSS 9.0+) automatically classifies the finding as CRITICAL, regardless of calculated risk score.
>
> Under Article 5.2, the maximum audit grade for any engagement with 1 CRITICAL finding is 60 (Grade D).
>
> **Regulatory Context:**
> Per BDDK Regulation 12.4, any CVSS 9.0+ vulnerability must be reported to the regulator within 48 hours of discovery.

### Example 2: Finding Analysis

**User:** `/analyze abc123`

**Sentinel Prime:**
```
📊 FINDING ANALYSIS

Finding ID: abc123
Title: Insufficient segregation of duties in payment approval process
Severity: High (Score: 78/100)
Status: Open

Entity Context:
- Name: Treasury Department
- Path: bank.treasury.payments
- Entity Risk Score: 85/100

Root Cause:
The payment approval workflow allows a single user to both initiate and approve transactions up to $100,000.

Constitutional Context:
Under the active Risk Constitution, this finding was classified as High because:
- Impact Dimension Score: 80 (Material financial risk)
- Likelihood Score: 75 (Control gap confirmed during testing)
- Control Effectiveness: 45% (Weak control design)

⚠️ Note: If this finding is escalated to CRITICAL (score ≥90), the maximum audit grade will be capped at 60 (D) per Constitutional override rule.

Audit Recommendation:
The root cause analysis needs deeper investigation. Challenge the "Why" at each level:
1. Why is SoD missing? → System limitation
2. Why wasn't the system configured properly? → Lack of requirements
3. Why weren't requirements gathered? → [Needs investigation]
```

### Example 3: Veto Rule Check

**User:** `/veto`

**Sentinel Prime:**
```
🚫 ACTIVE VETO RULES (KERD 2026)

Veto rules are constitutional overrides that automatically escalate certain findings regardless of calculated scores.

{
  "shariah_veto": {
    "trigger": "haram_income_detected",
    "action": "auto_critical",
    "escalation": "shariah_board_24h"
  },
  "cyber_veto": {
    "trigger": "cvss_score >= 9.0",
    "action": "auto_critical",
    "escalation": "ciso_immediate"
  },
  "regulatory_veto": {
    "trigger": "bddk_category_1_breach",
    "action": "auto_critical",
    "escalation": "regulator_48h"
  }
}

Common Veto Triggers:
- Shari'ah Veto: Any Haram income detection
- Cyber Veto: CVSS score ≥ 9.0 (Critical vulnerabilities)
- Regulatory Veto: BDDK Category 1 violations
- Fraud Veto: Confirmed financial misconduct

When a veto is triggered:
1. Finding is auto-classified as CRITICAL
2. Maximum audit grade is capped at 60 (D)
3. Immediate escalation to relevant board/committee
4. 48-hour reporting requirement to regulators (if applicable)

Veto rules CANNOT be overridden by auditors. Only Chief Risk Officer can modify.
```

---

## 🎨 UI/UX Features

### 1. **Context Loading Animation**

When the chat opens, users see:

```
🧠 Sentinel Prime Initializing...
  🔄 Reading Risk Constitution...
  🔄 Analyzing Audit Universe...
  🔄 Checking Recent Findings...
```

Once complete:
```
✓ Context loaded. Ready to assist.
```

### 2. **Armed Status Indicator**

- **Green Badge**: "ARMED" - Constitution loaded, AI is context-aware
- **Animated Brain**: Loading context
- **Shield Icon**: Ready for constitutional queries

### 3. **Quick Prompts**

Pre-configured prompts for common queries:
- "Why is this finding Critical?"
- "What is our cyber risk appetite?"
- "/constitution"
- "/veto"
- "Summarize recent findings"
- "Show GIAS 2024 requirements"

### 4. **Thinking Indicator**

While processing, shows:
```
🧠 Sentinel Prime is analyzing...
```

---

## 🔐 Security & Data Safety

### Data Access:
- **Read-only**: Sentinel Prime can ONLY read data, never modify
- **RLS Enforced**: All database queries respect Row Level Security
- **User Context**: Responses filtered by user's role and permissions

### Constitutional Immutability:
- Only Chief Risk Officer can modify `methodology_configs`
- Sentinel Prime enforces the active constitution
- No AI-driven rule changes allowed

### Sensitive Data:
- Whistleblower content encrypted at rest
- PII redacted from AI context
- Audit trail for all AI queries

---

## 🚀 Future Enhancements

### Phase 2: Dual-Brain Architecture
- **GenAI (Blue Glow)**: Text generation ✅ (Current)
- **ComputeAI (Orange Glow)**: Python sandbox for calculations ⏳ (Pending)

**Planned Feature:**
When asked: "What's the risk score for this entity?"

Sentinel Prime will:
1. Write Python code: `risk = (impact * ln(volume)) * (1 - control)`
2. Execute in sandbox
3. Return calculated result with formula citation

### Phase 3: Proactive Monitoring
- Auto-detect constitutional violations
- Real-time alerts for veto triggers
- Weekly digest of risk trends

### Phase 4: Multi-Agent Orchestration
- Investigator Agent (forensic analysis)
- Negotiator Agent (finding diplomacy)
- Chaos Monkey (resilience testing)

---

## 📚 References

- **System Prompt**: `src/features/ai-agents/sentinel-prime/system-prompt.ts`
- **Context Hook**: `src/features/ai-agents/sentinel-prime/useSentinelContext.ts`
- **Function Calling**: `src/features/ai-agents/sentinel-prime/function-calling.ts`
- **Chat Widget**: `src/widgets/SentinelChat/index.tsx`
- **Chat Engine**: `src/widgets/SentinelChat/useChatEngine.ts`

---

## ✅ Success Criteria

Sentinel Prime is successfully implemented when:

1. ✅ User asks "Why is this finding Critical?" → AI cites Article 3.3 of Constitution
2. ✅ User types `/constitution` → Full risk methodology displayed
3. ✅ User types `/veto` → Active veto rules listed
4. ✅ Chat header shows "ARMED" badge when context loaded
5. ✅ Loading steps visible during initialization
6. ✅ AI never makes up risk scores or thresholds

---

**READY FOR PRODUCTION.** Sentinel Prime is now the Guardian of the Bank's Amanah.
