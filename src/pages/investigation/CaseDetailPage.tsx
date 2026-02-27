import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Shield, ArrowLeft, Loader2, Snowflake,
  Lock, Network, Briefcase, KeyRound, Mic,
} from 'lucide-react';
import clsx from 'clsx';
import { PageHeader } from '@/shared/ui/PageHeader';
import { fetchCaseDetail } from '@/features/investigation/case-api';
import type { InvestigationCase, DigitalEvidence, EntityRelationship } from '@/features/investigation/types';
import { CASE_STATUS_LABELS } from '@/features/investigation/types';
import { FreezeConsole } from '@/widgets/investigation/FreezeConsole';
import { EvidenceVault } from '@/widgets/investigation/EvidenceVault';
import { LinkAnalysis } from '@/widgets/investigation/LinkAnalysis';
import { VaultAccessPanel } from '@/widgets/investigation/VaultAccessPanel';
import { InterrogationRoom } from '@/widgets/investigation/InterrogationRoom';

type Tab = 'freeze' | 'evidence' | 'graph' | 'vault' | 'interrogation';

const TABS: Array<{ id: Tab; label: string; icon: typeof Snowflake }> = [
  { id: 'freeze', label: 'Dijital Dondurma', icon: Snowflake },
  { id: 'evidence', label: 'Kanit Kasasi', icon: Lock },
  { id: 'vault', label: 'Adli Kasa', icon: KeyRound },
  { id: 'interrogation', label: 'Gorusme Odasi', icon: Mic },
  { id: 'graph', label: 'Sherlock Grafigi', icon: Network },
];

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700',
  FROZEN: 'bg-cyan-100 text-cyan-700',
  CLOSED: 'bg-slate-100 text-slate-600',
};

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<InvestigationCase | null>(null);
  const [evidence, setEvidence] = useState<DigitalEvidence[]>([]);
  const [relationships, setRelationships] = useState<EntityRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('freeze');

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchCaseDetail(id);
      setCaseData(data.caseData);
      setEvidence(data.evidence);
      setRelationships(data.relationships);
    } catch (err) {
      console.error('Failed to load case:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="text-center py-24 text-sm text-slate-400">
        Inceleme dosyasi bulunamadi.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={caseData.title}
        description={`Sorumlu: ${caseData.lead_investigator}`}
        icon={Shield}
        action={
          <div className="flex items-center gap-3">
            <span className={clsx(
              'text-[10px] font-bold px-2.5 py-1 rounded-full',
              STATUS_COLORS[caseData.status],
            )}>
              {CASE_STATUS_LABELS[caseData.status as keyof typeof CASE_STATUS_LABELS]}
            </span>
            <Link
              to="/investigation"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft size={12} />
              Listeye Don
            </Link>
          </div>
        }
      />

      <div className="flex items-center gap-1 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-1 justify-center',
                tab === t.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50',
              )}
            >
              <Icon size={13} />
              <span className="hidden sm:inline">{t.label}</span>
              {t.id === 'evidence' && evidence.length > 0 && (
                <span className="text-[9px] ml-0.5 px-1.5 py-0.5 rounded-full bg-white/20">{evidence.length}</span>
              )}
              {t.id === 'graph' && relationships.length > 0 && (
                <span className="text-[9px] ml-0.5 px-1.5 py-0.5 rounded-full bg-white/20">{relationships.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {tab === 'freeze' && (
        <FreezeConsole caseData={caseData} onComplete={loadData} />
      )}

      {tab === 'evidence' && (
        <EvidenceVault evidence={evidence} />
      )}

      {tab === 'vault' && (
        <VaultAccessPanel caseId={caseData.id} onUnlocked={loadData} />
      )}

      {tab === 'interrogation' && (
        <InterrogationRoom
          caseId={caseData.id}
          suspectName="Ahmet B."
          evidence={evidence}
        />
      )}

      {tab === 'graph' && (
        <div className="bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Sherlock Link Analizi</span>
            <span className="text-[10px] text-slate-400">- {relationships.length} iliski tespit edildi</span>
          </div>
          <LinkAnalysis relationships={relationships} />
        </div>
      )}
    </div>
  );
}
