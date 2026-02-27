import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Loader2, Snowflake, FolderOpen, FolderLock,
  ChevronRight, AlertTriangle, Clock,
} from 'lucide-react';
import clsx from 'clsx';
import { PageHeader } from '@/shared/ui/PageHeader';
import { fetchCases } from '@/features/investigation/case-api';
import type { InvestigationCase } from '@/features/investigation/types';
import { CASE_STATUS_LABELS } from '@/features/investigation/types';

const STATUS_ICONS: Record<string, typeof FolderOpen> = {
  OPEN: FolderOpen,
  FROZEN: FolderLock,
  CLOSED: FolderLock,
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700 border-blue-200',
  FROZEN: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
};

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700',
  HIGH: 'bg-amber-100 text-amber-700',
  MEDIUM: 'bg-blue-100 text-blue-600',
  LOW: 'bg-slate-100 text-slate-500',
};

export default function InvestigationHubPage() {
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCases();
        setCases(data);
      } catch (err) {
        console.error('Failed to load cases:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inceleme Merkezi"
        description="Aktif inceleme dosyalari, dijital dondurma ve Sherlock analiz araclari"
        icon={Shield}
        action={
          <Link
            to="/triage-cockpit"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <AlertTriangle size={12} />
            Triaj Kokpiti
          </Link>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-slate-400" />
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-16">
          <Snowflake size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-400">Henuz acik inceleme dosyasi yok.</p>
          <p className="text-xs text-slate-400 mt-1">Triaj Kokpitinden bir ihbari incelemeye alin.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => {
            const StatusIcon = STATUS_ICONS[c.status] || FolderOpen;
            return (
              <Link
                key={c.id}
                to={`/investigation/${c.id}`}
                className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all group"
              >
                <div className={clsx(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border',
                  STATUS_COLORS[c.status],
                )}>
                  <StatusIcon size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
                    {c.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-slate-500">{c.lead_investigator}</span>
                    <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded', PRIORITY_COLORS[c.priority])}>
                      {c.priority}
                    </span>
                    <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded border', STATUS_COLORS[c.status])}>
                      {CASE_STATUS_LABELS[c.status as keyof typeof CASE_STATUS_LABELS]}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Clock size={10} />
                    {new Date(c.created_at).toLocaleDateString('tr-TR')}
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
