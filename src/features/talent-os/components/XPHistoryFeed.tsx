import { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle, FileText, Award, FlaskConical, Star,
  Zap, ChevronDown, RefreshCw, TrendingUp,
  Lightbulb, Sprout, GraduationCap,
} from 'lucide-react';
import { XPEngine } from '../lib/XPEngine';
import type { LedgerEntry, XPSourceType } from '../lib/XPEngine';

interface XPHistoryFeedProps {
  userId: string;
  limit?: number;
  compact?: boolean;
  className?: string;
}

const SOURCE_CONFIG: Record<XPSourceType, {
  icon: typeof AlertTriangle;
  label: string;
  color: string;
  tagBg: string;
  glow?: string;
}> = {
  FINDING:        { icon: AlertTriangle,  label: 'FINDING',       color: '#f97316', tagBg: 'rgba(249,115,22,0.15)' },
  WORKPAPER:      { icon: FileText,       label: 'WORKPAPER',     color: '#38bdf8', tagBg: 'rgba(56,189,248,0.15)' },
  CERTIFICATE:    { icon: Award,          label: 'CERTIFICATE',   color: '#fbbf24', tagBg: 'rgba(251,191,36,0.15)' },
  EXAM:           { icon: FlaskConical,   label: 'EXAM',          color: '#a78bfa', tagBg: 'rgba(167,139,250,0.15)' },
  KUDOS:          { icon: Star,           label: 'KUDOS',         color: '#f472b6', tagBg: 'rgba(244,114,182,0.15)' },
  OBSERVATION:    {
    icon: Lightbulb,
    label: 'OBSERVATION',
    color: '#fde047',
    tagBg: 'rgba(253,224,71,0.12)',
    glow: '0 0 10px rgba(253,224,71,0.55)',
  },
  MENTORSHIP:     {
    icon: Sprout,
    label: 'MENTORSHIP',
    color: '#34d399',
    tagBg: 'rgba(52,211,153,0.12)',
    glow: '0 0 10px rgba(52,211,153,0.55)',
  },
  TRAINING_GIVEN: {
    icon: GraduationCap,
    label: 'TRAINING',
    color: '#6ee7b7',
    tagBg: 'rgba(110,231,183,0.12)',
    glow: '0 0 8px rgba(110,231,183,0.45)',
  },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)   return 'şimdi';
  if (m < 60)  return `${m}dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}sa önce`;
  const d = Math.floor(h / 24);
  if (d < 30)  return `${d}g önce`;
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export function XPHistoryFeed({ userId, limit = 15, compact = false, className = '' }: XPHistoryFeedProps) {
  const [entries, setEntries]   = useState<LedgerEntry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [visible, setVisible]   = useState(8);
  const [newIds, setNewIds]     = useState<Set<string>>(new Set());
  const prevCountRef            = useRef(0);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await XPEngine.fetchLedger(userId, limit);
      if (data.length > prevCountRef.current && prevCountRef.current > 0) {
        const newSet = new Set(data.slice(0, data.length - prevCountRef.current).map((e) => e.id));
        setNewIds(newSet);
        setTimeout(() => setNewIds(new Set()), 4000);
      }
      prevCountRef.current = data.length;
      setEntries(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load XP history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [userId, limit]);

  const totalXP     = entries.reduce((s, e) => s + e.amount, 0);
  const shown       = entries.slice(0, visible);
  const hasMore     = entries.length > visible;

  return (
    <div
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(160deg, #0d1117 0%, #0f1923 100%)',
        border: '1px solid rgba(56,189,248,0.2)',
        boxShadow: '0 0 0 1px rgba(56,189,248,0.08), 0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      <TerminalHeader totalXP={totalXP} onRefresh={load} loading={loading} />

      <div
        className="overflow-y-auto"
        style={{
          maxHeight: compact ? '280px' : '420px',
          backgroundImage: `
            linear-gradient(rgba(56,189,248,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      >
        {loading && entries.length === 0 && (
          <div className="flex items-center justify-center py-12 gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-cyan-400 text-xs font-mono">LOADING LEDGER...</span>
          </div>
        )}

        {error && (
          <div className="px-4 py-3 text-rose-400 text-xs font-mono border-b border-zinc-800">
            [ERR] {error}
          </div>
        )}

        {!loading && entries.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Zap size={24} className="text-zinc-600" />
            <p className="text-zinc-500 text-xs font-mono">NO TRANSACTIONS FOUND</p>
            <p className="text-zinc-600 text-xs">Complete audit tasks to start earning XP</p>
          </div>
        )}

        {shown.map((entry, idx) => (
          <XPEntryRow
            key={entry.id}
            entry={entry}
            isNew={newIds.has(entry.id)}
            isLast={idx === shown.length - 1 && !hasMore}
          />
        ))}

        {hasMore && (
          <button
            onClick={() => setVisible((v) => v + 8)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-mono
                       text-cyan-500 hover:text-cyan-300 hover:bg-white/5 transition-colors
                       border-t border-zinc-800"
          >
            <ChevronDown size={13} />
            LOAD MORE ({entries.length - visible} remaining)
          </button>
        )}
      </div>
    </div>
  );
}

function TerminalHeader({
  totalXP, onRefresh, loading,
}: {
  totalXP: number;
  onRefresh: () => void;
  loading: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ borderBottom: '1px solid rgba(56,189,248,0.15)' }}
    >
      <div className="flex items-center gap-2.5">
        <BlinkDot />
        <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
          XP System Log
        </span>
        <span className="text-zinc-600 font-mono text-xs">—</span>
        <span className="text-xs font-mono text-zinc-400">Ledger</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <TrendingUp size={12} className="text-emerald-400" />
          <span className="font-mono text-xs font-bold text-emerald-400">
            {totalXP.toLocaleString()} XP
          </span>
          <span className="text-zinc-600 text-xs font-mono">total</span>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-cyan-400 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  );
}

function XPEntryRow({
  entry, isNew, isLast,
}: {
  entry: LedgerEntry;
  isNew: boolean;
  isLast: boolean;
}) {
  const cfg        = SOURCE_CONFIG[entry.source_type] ?? SOURCE_CONFIG.WORKPAPER;
  const Icon       = cfg.icon;
  const isLevelUp  = entry.amount >= 1000;

  return (
    <div
      className="group relative transition-colors"
      style={{
        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
        background: isNew
          ? 'rgba(56,189,248,0.07)'
          : isLevelUp
          ? 'rgba(251,191,36,0.04)'
          : 'transparent',
        animation: isNew ? 'xpFlash 0.6s ease-out' : undefined,
      }}
    >
      {(isLevelUp || cfg.glow) && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isLevelUp
              ? 'linear-gradient(90deg, rgba(251,191,36,0.06) 0%, transparent 60%)'
              : `linear-gradient(90deg, ${cfg.tagBg} 0%, transparent 60%)`,
            borderLeft: isLevelUp
              ? '2px solid rgba(251,191,36,0.5)'
              : `2px solid ${cfg.color}60`,
          }}
        />
      )}

      <div className="relative flex items-start gap-3 px-4 py-3">
        <div
          className="mt-0.5 w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center"
          style={{ background: cfg.tagBg, border: `1px solid ${cfg.color}30` }}
        >
          <Icon size={13} style={{ color: cfg.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p
                className="text-xs leading-snug font-mono truncate"
                style={{ color: isLevelUp ? '#fbbf24' : '#e2e8f0' }}
              >
                {entry.description}
              </p>

              {isLevelUp && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Zap size={10} className="text-amber-400" />
                  <span className="text-amber-400 text-xs font-mono font-bold tracking-wide">
                    LEVEL UP
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 mt-1">
                <span
                  className="inline-block px-1.5 py-0.5 rounded text-xs font-mono uppercase tracking-wider"
                  style={{ color: cfg.color, background: cfg.tagBg, fontSize: '9px' }}
                >
                  {cfg.label}
                </span>
                {isNew && (
                  <span
                    className="inline-block px-1.5 py-0.5 rounded text-xs font-mono"
                    style={{ color: '#38bdf8', background: 'rgba(56,189,248,0.12)', fontSize: '9px' }}
                  >
                    NEW
                  </span>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 text-right">
              <span
                className="font-mono font-bold text-sm leading-none"
                style={{
                  color: isLevelUp ? '#fbbf24' : cfg.glow ? cfg.color : '#4ade80',
                  textShadow: isLevelUp
                    ? '0 0 8px rgba(251,191,36,0.6)'
                    : cfg.glow ?? '0 0 8px rgba(74,222,128,0.5)',
                }}
              >
                +{entry.amount.toLocaleString()}
              </span>
              <p className="text-zinc-600 font-mono text-xs mt-0.5 text-right">XP</p>
              <p className="text-zinc-600 font-mono text-right" style={{ fontSize: '10px' }}>
                {timeAgo(entry.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlinkDot() {
  return (
    <span className="relative flex w-2 h-2">
      <span
        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
        style={{ background: '#22d3ee' }}
      />
      <span
        className="relative inline-flex rounded-full w-2 h-2"
        style={{ background: '#06b6d4' }}
      />
    </span>
  );
}
