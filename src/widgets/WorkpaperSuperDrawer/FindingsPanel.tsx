import { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  ShieldAlert,
  Shield,
  ShieldCheck,
  Activity,
  ExternalLink,
  Rocket,
  Loader2,
  GitBranch,
  ArrowRight,
  Link2,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import type { WorkpaperFindingRow } from '@/entities/workpaper/model/detail-types';
import { useFindingStore } from '@/entities/finding/model/store';
import type { DraftFinding } from '@/entities/finding/model/types';

interface FindingsPanelProps {
  findings: WorkpaperFindingRow[];
  loading: boolean;
  workpaperId: string;
  controlId?: string;
  failedSteps?: any[];
  onAddFinding: () => void;
}

function getRiskStyle(severity: string) {
  switch (severity) {
    case 'CRITICAL':
      return { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: ShieldAlert };
    case 'HIGH':
      return { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertTriangle };
    case 'MEDIUM':
      return { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: Shield };
    default:
      return { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: ShieldCheck };
  }
}

function DraftFindingCard({
  draft,
  onPromote,
  promoting,
}: {
  draft: DraftFinding;
  onPromote: (id: string) => void;
  promoting: boolean;
}) {
  const navigate = useNavigate();
  const isPromoted = draft.status === 'PROMOTED';

  return (
    <div
      className={`
        relative rounded-xl border overflow-hidden transition-all duration-300
        ${isPromoted
          ? 'border-emerald-500/30 bg-emerald-950/20'
          : 'border-amber-500/30 bg-amber-950/15 hover:border-amber-400/50'}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-slate-900/40 pointer-events-none" />

      <div className="relative p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`
              flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
              ${isPromoted ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-amber-500/20 border border-amber-500/40'}
            `}>
              <Sparkles size={13} className={isPromoted ? 'text-emerald-400' : 'text-amber-400'} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-100 leading-tight truncate">
                {draft.testStepTitle}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Link2 size={9} className="text-slate-500 flex-shrink-0" />
                <span className="text-[10px] text-slate-500 font-mono">{draft.traceabilityToken}</span>
              </div>
            </div>
          </div>
          <div className={`
            flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border
            ${isPromoted
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'}
          `}>
            {isPromoted ? 'Aktarıldı' : 'Taslak'}
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 pl-9">
          {draft.initialObservation}
        </p>

        <div className="pl-9">
          {isPromoted && draft.promotedFindingId ? (
            <button
              onClick={() => navigate(`/execution/findings/${draft.promotedFindingId}`)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 hover:border-emerald-400/50 transition-all group"
            >
              <ExternalLink size={12} className="group-hover:translate-x-0.5 transition-transform" />
              Stüdyoda Görüntüle
              <ArrowRight size={11} className="ml-auto opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>
          ) : (
            <button
              onClick={() => onPromote(draft.id)}
              disabled={promoting}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-[0_0_14px_rgba(59,130,246,0.25)] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {promoting ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Aktarılıyor...
                </>
              ) : (
                <>
                  <Rocket size={12} />
                  Stüdyoya Aktar
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function FindingsPanel({
  findings,
  loading,
  workpaperId,
  onAddFinding,
}: FindingsPanelProps) {
  const navigate = useNavigate();
  const { draftFindings, promoteDraftToStudio } = useFindingStore();
  const [promotingIds, setPromotingIds] = useState<Set<string>>(new Set());

  const workpaperDrafts = draftFindings.filter((d) => d.workpaperId === workpaperId);
  const pendingDrafts = workpaperDrafts.filter((d) => d.status === 'DRAFT');
  const promotedDrafts = workpaperDrafts.filter((d) => d.status === 'PROMOTED');

  const handlePromote = async (draftId: string) => {
    setPromotingIds((prev) => new Set(prev).add(draftId));
    try {
      const result = await promoteDraftToStudio(draftId);
      if (result) {
        toast.success(
          (t) => (
            <div className="flex flex-col gap-1">
              <span className="font-bold text-slate-100">Bulgu Stüdyoya Aktarıldı</span>
              <span className="text-xs text-slate-400">Müzakere için denetlene bildirim gönderildi.</span>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate(`/execution/findings/${result.findingId}`);
                }}
                className="mt-1 text-xs text-blue-400 underline hover:text-blue-300 text-left"
              >
                Stüdyoya git →
              </button>
            </div>
          ) as any,
          {
            duration: 5000,
            style: { background: '#0f172a', border: '1px solid #334155', padding: '14px 16px' },
          },
        );
      }
    } catch {
      toast.error('Aktarım başarısız', {
        style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' },
      });
    } finally {
      setPromotingIds((prev) => {
        const next = new Set(prev);
        next.delete(draftId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      {workpaperDrafts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <GitBranch size={11} className="text-amber-400" />
              </div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Taslak Bulgular
              </h3>
              {pendingDrafts.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/35 text-[10px] font-bold text-amber-400">
                  {pendingDrafts.length} bekliyor
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500">GIAS 2024 — Altın Zincir</span>
          </div>

          <div className="space-y-2">
            {workpaperDrafts.map((draft) => (
              <DraftFindingCard
                key={draft.id}
                draft={draft}
                onPromote={handlePromote}
                promoting={promotingIds.has(draft.id)}
              />
            ))}
          </div>

          {promotedDrafts.length > 0 && (
            <p className="text-[10px] text-slate-600 text-center">
              {promotedDrafts.length} bulgu stüdyoya aktarıldı
            </p>
          )}

          <div className="border-t border-slate-200 pt-2" />
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Bulgu Listesi ({findings.length})</h3>
        <button
          onClick={onAddFinding}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 flex items-center gap-2 transition-all shadow-sm active:scale-95"
        >
          <Plus size={16} /> Yeni Bulgu Ekle
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Yükleniyor...</span>
        </div>
      ) : findings.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-slate-400">
            <AlertTriangle size={24} />
          </div>
          <p className="text-sm text-slate-500 font-medium">Henüz kayıtlı bulgu yok.</p>
          <p className="text-xs text-slate-400 mt-1">
            Eksiklik tespit ettiyseniz yukarıdaki butondan ekleyin.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {findings.map((finding) => {
            const style = getRiskStyle(finding.severity);
            const Icon = style.icon;
            return (
              <div
                key={finding.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className={`p-2 rounded-lg ${style.bg} ${style.color}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{finding.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.bg} ${style.color} border-current opacity-80`}
                        >
                          {finding.severity}
                        </span>
                        {(finding as any).status && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Activity size={10} /> {(finding as any).status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => navigate(`/execution/findings/${finding.id}`)}
                      className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg transition-colors"
                      title="Stüdyoda Aç"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
                {finding.description && (
                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 pl-[50px]">
                    {finding.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
