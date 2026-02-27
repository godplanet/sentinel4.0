import { useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Shield,
  ShieldCheck,
  Info,
  CheckCircle2,
  Link2,
  TrendingUp,
} from 'lucide-react';
import { useFindingStore } from '@/entities/finding/model/store';
import { supabase } from '@/shared/api/supabase';
import type { ComprehensiveFinding } from '@/entities/finding/model/types';
import type { FindingState, FindingSeverity } from '@/entities/finding/model/types';

const EXCLUDED_STATES: FindingState[] = ['DRAFT'];

interface FindingTableBlockProps {
  limit?: number;
  showStats?: boolean;
  engagementId?: string;
}

function SeverityBadge({ severity }: { severity: FindingSeverity }) {
  const config: Record<
    string,
    { label: string; classes: string; glowColor: string; icon: React.ElementType }
  > = {
    CRITICAL: {
      label: 'Critical',
      classes: 'bg-red-500/15 text-red-400 border-red-500/40',
      glowColor: 'shadow-[0_0_8px_rgba(239,68,68,0.3)]',
      icon: ShieldAlert,
    },
    HIGH: {
      label: 'High',
      classes: 'bg-orange-500/15 text-orange-400 border-orange-500/40',
      glowColor: 'shadow-[0_0_8px_rgba(249,115,22,0.3)]',
      icon: AlertTriangle,
    },
    MEDIUM: {
      label: 'Medium',
      classes: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
      glowColor: '',
      icon: Shield,
    },
    LOW: {
      label: 'Low',
      classes: 'bg-blue-500/15 text-blue-400 border-blue-500/40',
      glowColor: '',
      icon: ShieldCheck,
    },
    OBSERVATION: {
      label: 'Obs.',
      classes: 'bg-slate-500/15 text-slate-400 border-slate-500/40',
      glowColor: '',
      icon: Info,
    },
  };
  const c = config[severity] ?? config.MEDIUM;
  const Icon = c.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${c.classes} ${c.glowColor}`}
    >
      <Icon size={9} />
      {c.label}
    </span>
  );
}

function StateBadge({ state }: { state: FindingState }) {
  const map: Partial<Record<FindingState, { classes: string; label: string }>> = {
    NEGOTIATION: { classes: 'bg-blue-500/15 text-blue-300 border-blue-500/30', label: 'Negotiation' },
    IN_REVIEW: { classes: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', label: 'In Review' },
    PUBLISHED: { classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', label: 'Published' },
    FINAL: { classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', label: 'Final' },
    REMEDIATED: { classes: 'bg-teal-500/15 text-teal-300 border-teal-500/30', label: 'Remediated' },
    CLOSED: { classes: 'bg-slate-500/15 text-slate-400 border-slate-500/30', label: 'Closed' },
    DISPUTED: { classes: 'bg-red-500/15 text-red-400 border-red-500/30', label: 'Disputed' },
    DISPUTING: { classes: 'bg-red-500/15 text-red-400 border-red-500/30', label: 'Disputing' },
    FOLLOW_UP: { classes: 'bg-amber-500/15 text-amber-300 border-amber-500/30', label: 'Follow-Up' },
    PENDING_APPROVAL: { classes: 'bg-orange-500/15 text-orange-300 border-orange-500/30', label: 'Pending' },
    NEEDS_REVISION: { classes: 'bg-rose-500/15 text-rose-300 border-rose-500/30', label: 'Revision' },
  };
  const s = map[state] ?? { classes: 'bg-slate-500/15 text-slate-400 border-slate-500/30', label: state };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold border ${s.classes}`}>
      {s.label}
    </span>
  );
}

export function FindingTableBlock({
  limit = 50,
  showStats = true,
  engagementId,
}: FindingTableBlockProps) {
  const { findings, setFindings, isLoading, setLoading } = useFindingStore();

  useEffect(() => {
    if (findings.length > 0) return;
    const fetchFromSupabase = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('audit_findings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
        if (engagementId) {
          query = query.eq('engagement_id', engagementId);
        }
        const { data } = await query;
        if (data && data.length > 0) {
          const normalized = data.map((row: any) => ({
            ...row,
            action_plans: [],
            comments: [],
            history: [],
          }));
          setFindings(normalized as ComprehensiveFinding[]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFromSupabase();
  }, [engagementId]);

  const activeFindings = findings.filter((f) => !EXCLUDED_STATES.includes(f.state as FindingState));

  const criticalCount = activeFindings.filter((f) => f.severity === 'CRITICAL').length;
  const highCount = activeFindings.filter((f) => f.severity === 'HIGH').length;
  const mediumCount = activeFindings.filter((f) => f.severity === 'MEDIUM').length;
  const lowCount = activeFindings.filter(
    (f) => f.severity === 'LOW' || f.severity === 'OBSERVATION',
  ).length;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/80 p-10 flex items-center justify-center gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <span className="text-sm text-slate-400">Synthesizing findings from field data...</span>
      </div>
    );
  }

  if (activeFindings.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-8">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="relative flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-300">
              Golden Thread Fully Intact
            </p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              No active findings reported for this engagement. All test steps passed and the
              GIAS 2024 Golden Thread traceability chain is unbroken.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700/50 overflow-hidden bg-slate-900/90 backdrop-blur-sm">
      <div className="px-5 py-3.5 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center">
            <ShieldAlert size={13} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Findings Register</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {activeFindings.length} active findings — Live from Golden Thread
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp size={11} className="text-slate-500" />
          <span className="text-[10px] text-slate-500">
            {new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {showStats && (
        <div className="px-5 py-3 bg-slate-800/60 border-b border-slate-700/40 grid grid-cols-4 gap-3">
          {[
            { label: 'Critical', count: criticalCount, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', glow: 'shadow-[0_0_12px_rgba(239,68,68,0.2)]' },
            { label: 'High', count: highCount, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', glow: '' },
            { label: 'Medium', count: mediumCount, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', glow: '' },
            { label: 'Low / Obs.', count: lowCount, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', glow: '' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-lg border px-3 py-2 ${stat.bg} ${stat.glow}`}>
              <div className={`text-xl font-black ${stat.color} leading-none`}>{stat.count}</div>
              <div className="text-[10px] text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-700/60">
              <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Traceability Token
              </th>
              <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Finding Title
              </th>
              <th className="px-4 py-2.5 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Risk Level
              </th>
              <th className="px-4 py-2.5 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-2.5 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {activeFindings.map((finding) => (
              <tr
                key={finding.id}
                className="hover:bg-slate-800/40 transition-colors group"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Link2 size={9} className="text-slate-600 flex-shrink-0" />
                    <span className="font-mono text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors">
                      {finding.traceability_token || finding.finding_code || finding.id.slice(0, 8)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-200 max-w-xs truncate group-hover:text-white transition-colors">
                    {finding.title}
                  </div>
                  {finding.description && (
                    <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 max-w-xs">
                      {finding.description}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <SeverityBadge severity={finding.severity as FindingSeverity} />
                </td>
                <td className="px-4 py-3 text-center">
                  <StateBadge state={finding.state as FindingState} />
                </td>
                <td className="px-4 py-3 text-right text-[10px] text-slate-500">
                  {finding.created_at
                    ? new Date(finding.created_at).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: 'short',
                      })
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2 bg-slate-800/40 border-t border-slate-700/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-slate-500">Live — Golden Thread active</span>
        </div>
        <span className="text-[10px] text-slate-600">GIAS 2024 §4.3 Compliance</span>
      </div>
    </div>
  );
}
