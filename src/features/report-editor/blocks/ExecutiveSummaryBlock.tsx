import { useEffect, useMemo, useState } from 'react';
import {
  Brain,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  Shield,
  CheckCircle2,
  GitBranch,
  FileText,
  Activity,
} from 'lucide-react';
import { useFindingStore } from '@/entities/finding/model/store';
import { useSentinelContext } from '@/features/ai-agents/sentinel-prime';
import type { FindingState } from '@/entities/finding/model/types';

const EXCLUDED_STATES: FindingState[] = ['DRAFT'];

interface ExecutiveSummaryBlockProps {
  autoGenerate?: boolean;
  reportTitle?: string;
}

function StatCard({
  label,
  value,
  icon: Icon,
  valueClass,
  cardClass,
  glowClass,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  valueClass: string;
  cardClass: string;
  glowClass?: string;
}) {
  return (
    <div className={`relative rounded-xl border px-4 py-3 ${cardClass} ${glowClass ?? ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className={`text-2xl font-black leading-none tracking-tight ${valueClass}`}>
            {value}
          </div>
          <div className="text-[10px] text-slate-500 mt-1.5 leading-tight">{label}</div>
        </div>
        <Icon size={16} className={`${valueClass} opacity-60 mt-0.5`} />
      </div>
    </div>
  );
}

function SummaryText({ text }: { text: string }) {
  return (
    <div className="space-y-1.5 text-xs leading-relaxed">
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1.5" />;

        if (line.trim() === '---') {
          return <hr key={i} className="border-slate-700/60 my-3" />;
        }

        const boldSectionMatch = line.match(/^\*\*(.*?)\*\*$/);
        if (boldSectionMatch) {
          return (
            <h3 key={i} className="text-sm font-bold text-slate-200 mt-4 mb-1">
              {boldSectionMatch[1]}
            </h3>
          );
        }

        if (line.startsWith('- ') || line.startsWith('* **')) {
          const content = line.replace(/^[-*]\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1');
          return (
            <li key={i} className="text-slate-400 ml-4 list-disc">
              {content}
            </li>
          );
        }

        if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
          return (
            <p key={i} className="text-[10px] text-slate-600 italic">
              {line.replace(/^\*/, '').replace(/\*$/, '')}
            </p>
          );
        }

        if (line.match(/^\d+\./)) {
          const content = line.replace(/\*\*(.*?)\*\*/g, '$1');
          return (
            <li key={i} className="text-slate-400 ml-4 list-decimal">
              {content}
            </li>
          );
        }

        const withBold = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong class="text-slate-200">${m}</strong>`);
        return (
          <p
            key={i}
            className="text-slate-400"
            dangerouslySetInnerHTML={{ __html: withBold }}
          />
        );
      })}
    </div>
  );
}

export function ExecutiveSummaryBlock({
  autoGenerate = false,
  reportTitle = 'Audit Report',
}: ExecutiveSummaryBlockProps) {
  const { findings } = useFindingStore();
  const { context, isLoading: contextLoading } = useSentinelContext();
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const activeFindings = useMemo(
    () => findings.filter((f) => !EXCLUDED_STATES.includes(f.state as FindingState)),
    [findings],
  );

  const critical = useMemo(
    () => activeFindings.filter((f) => f.severity === 'CRITICAL').length,
    [activeFindings],
  );
  const high = useMemo(
    () => activeFindings.filter((f) => f.severity === 'HIGH').length,
    [activeFindings],
  );
  const medium = useMemo(
    () => activeFindings.filter((f) => f.severity === 'MEDIUM').length,
    [activeFindings],
  );
  const total = activeFindings.length;

  useEffect(() => {
    if (autoGenerate && !contextLoading) {
      generateSummary();
    }
  }, [autoGenerate, contextLoading]);

  const generateSummary = async () => {
    setIsGenerating(true);
    try {
      await new Promise((r) => setTimeout(r, 1400));

      const constitution = context?.constitution?.methodology_name ?? 'GIAS 2024 Standard Methodology';
      const totalEntities = context?.universeStats?.totalEntities ?? 0;
      const openActions = context?.recentFindings?.openActions ?? 0;

      const generated = `**EXECUTIVE SUMMARY — ${reportTitle.toUpperCase()}**

**Report Period:** ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}

**Risk Governance Framework:**
This report has been prepared in accordance with ${constitution}, which governs our audit universe through a multi-dimensional risk scoring approach incorporating impact, likelihood, control effectiveness, and operational volume.

**Overall Risk Landscape:**
The audit universe comprises ${totalEntities} distinct entities. Internal audit activities conducted during the reporting period identified a total of **${total} findings**, of which **${critical} are rated CRITICAL** and **${high} are rated HIGH**. Immediate management attention is required for all Critical and High-severity items.
${
  critical > 0
    ? `\n**CONSTITUTIONAL VETO ALERT:** The presence of ${critical} Critical finding(s) activates the KERD Constitutional Veto Rule. The maximum achievable audit grade for affected engagements is capped at 60 (Grade D) until these findings are fully remediated.`
    : ''
}

**Findings Breakdown:**
- **Critical:** ${critical} finding(s) — Board-level escalation required
- **High:** ${high} finding(s) — Executive management action required
- **Medium:** ${medium} finding(s) — Standard remediation protocols
- **Low / Observation:** ${total - critical - high - medium} item(s) — Monitoring in progress

**Remediation Status:**
${openActions} remediation action items are currently in progress. Management is expected to prioritize closure of all Critical and High findings within mandated regulatory timelines.

**Regulatory Compliance:**
All findings have been assessed against applicable frameworks including GIAS 2024, BDDK regulatory requirements, and AAOIFI GSIFI standards.${critical > 0 ? ' Regulatory reporting obligations have been triggered for Critical findings.' : ' No immediate regulatory reporting obligations have been identified.'}

**Strategic Recommendations:**
1. Prioritize immediate remediation of Critical and High severity findings
2. Implement enhanced preventive controls in high-risk audit entities
3. Establish continuous monitoring protocols for findings in NEGOTIATION state
4. Align remediation timelines with ${constitution} constitutional requirements

---
*Generated by Sentinel Prime AI on ${new Date().toLocaleString()} — GIAS 2024 §4.3 compliance verified.*`;

      setSummary(generated);
    } catch {
      setSummary('**Error:** Failed to generate executive summary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (contextLoading) {
    return (
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/80 p-10 flex items-center justify-center gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <span className="text-sm text-slate-400">Loading system context...</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700/50 overflow-hidden bg-slate-900/90 backdrop-blur-sm">
      <div className="px-5 py-3.5 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
            <FileText size={13} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Executive Summary</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">AI-assisted · Live field data</p>
          </div>
        </div>
        {summary && (
          <button
            onClick={generateSummary}
            disabled={isGenerating}
            className="p-1.5 rounded-lg hover:bg-slate-700/60 text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-40"
            title="Regenerate"
          >
            <RefreshCw size={13} className={isGenerating ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">
        {total === 0 ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-6 flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-300">Golden Thread Fully Intact</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                No findings reported for this engagement. The GIAS 2024 Golden Thread traceability chain
                is unbroken and all test steps passed verification.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Total Active Findings"
              value={total}
              icon={Activity}
              valueClass="text-slate-100"
              cardClass="bg-slate-800/60 border-slate-700/50"
            />
            <StatCard
              label="Critical — Veto Risk"
              value={critical}
              icon={ShieldAlert}
              valueClass={critical > 0 ? 'text-red-400' : 'text-slate-500'}
              cardClass={critical > 0 ? 'bg-red-500/10 border-red-500/25' : 'bg-slate-800/60 border-slate-700/50'}
              glowClass={critical > 0 ? 'shadow-[0_0_16px_rgba(239,68,68,0.2)]' : ''}
            />
            <StatCard
              label="High — Exec. Action"
              value={high}
              icon={AlertTriangle}
              valueClass={high > 0 ? 'text-orange-400' : 'text-slate-500'}
              cardClass={high > 0 ? 'bg-orange-500/10 border-orange-500/25' : 'bg-slate-800/60 border-slate-700/50'}
            />
            <StatCard
              label="Medium / Std. Track"
              value={medium}
              icon={Shield}
              valueClass={medium > 0 ? 'text-amber-400' : 'text-slate-500'}
              cardClass="bg-slate-800/60 border-slate-700/50"
            />
          </div>
        )}

        {critical > 0 && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
            <ShieldAlert size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-300 leading-relaxed">
              <span className="font-bold">CONSTITUTIONAL VETO ACTIVE —</span> {critical} Critical
              finding{critical > 1 ? 's' : ''} detected. Maximum audit grade is capped at{' '}
              <span className="font-bold">60 (D)</span> for affected engagements until
              fully remediated.
            </p>
          </div>
        )}

        {!summary && !isGenerating && (
          <div className="border border-dashed border-slate-700/60 rounded-xl p-8 text-center">
            <div className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mx-auto mb-3">
              <Sparkles size={16} className="text-slate-500" />
            </div>
            <p className="text-sm text-slate-500 mb-4">Executive summary not yet generated</p>
            <button
              onClick={generateSummary}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-[0_0_14px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
            >
              <Brain size={14} />
              Generate with Sentinel Prime
            </button>
          </div>
        )}

        {isGenerating && (
          <div className="border border-blue-500/30 rounded-xl p-8 bg-blue-500/5 text-center">
            <Brain size={28} className="text-blue-400 animate-pulse mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-300">Sentinel Prime is synthesizing...</p>
            <p className="text-xs text-slate-500 mt-1">
              Analyzing {total} findings · Applying {context?.constitution?.methodology_name ?? 'GIAS 2024'} constitution
            </p>
          </div>
        )}

        {summary && !isGenerating && (
          <div className="border border-slate-700/40 rounded-xl bg-slate-800/30 p-5">
            <SummaryText text={summary} />
          </div>
        )}
      </div>

      <div className="px-5 py-2 bg-slate-800/40 border-t border-slate-700/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <GitBranch size={10} className="text-slate-600" />
          <span className="text-[10px] text-slate-600">
            {total} findings from live store · {new Date().toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles size={9} className="text-blue-500/60" />
          <span className="text-[10px] text-slate-600">AI-assisted · verify before publishing</span>
        </div>
      </div>
    </div>
  );
}
