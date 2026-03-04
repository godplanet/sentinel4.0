import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ShieldAlert,
  Clock,
  Flag,
  CheckCircle2,
  Loader2,
  FileWarning,
  Gavel,
} from 'lucide-react';
import {
  evaluateSLABreaches,
  fetchPendingCAEEscalationsWithActions,
  updateEscalationCAEDecision,
} from '@/features/monitoring/api/sla-engine';
import type { PendingEscalationWithAction, CAEDecision } from '@/features/monitoring/api/sla-engine';

export function CAEEscalationDesk() {
  const queryClient = useQueryClient();

  const { data: pendingEscalations = [], isLoading: loadingEscalations } = useQuery({
    queryKey: ['cae-pending-escalations'],
    queryFn: () => fetchPendingCAEEscalationsWithActions(),
  });

  const slaScanMutation = useMutation({
    mutationFn: () => evaluateSLABreaches(),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['cae-pending-escalations'] });
      toast.success(
        `SLA taraması tamamlandı. ${result.evaluated} aksiyon değerlendirildi, ${result.escalated} yeni eskalasyon CAE'ye iletildi.`
      );
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? 'SLA taraması çalıştırılamadı.');
    },
  });

  const caeDecisionMutation = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: CAEDecision }) =>
      updateEscalationCAEDecision(id, decision),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cae-pending-escalations'] });
      toast.success('CAE kararı kaydedildi.');
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? 'Karar kaydedilemedi.');
    },
  });

  const resolvingEscalationId =
    caeDecisionMutation.isPending && caeDecisionMutation.variables
      ? caeDecisionMutation.variables.id
      : null;

  return (
    <div className="space-y-6">
      {/* C-Level Karar Masası — Tetikleyici */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => slaScanMutation.mutate()}
          disabled={slaScanMutation.isPending}
          className="flex items-center gap-2 px-5 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-colors border border-amber-500/30"
          title="Açık aksiyonları SLA politikalarına göre tara; ihlal varsa CAE önüne eskalasyon aç"
        >
          {slaScanMutation.isPending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Clock size={18} />
          )}
          Günlük SLA Taramasını Tetikle
        </button>
      </div>

      {/* Kırmızı dosyalar / Karar masası paneli */}
      <section className="rounded-2xl border-2 border-slate-200 bg-surface shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-red-50/30 to-slate-50 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-100 border border-red-200 shadow-sm">
              <Gavel size={22} className="text-red-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary">CAE Karar Masası</h2>
              <p className="text-xs text-slate-500">
                Level 3 (CAE) SLA ihlalleri — Tolerans veya Denetim Komitesine arz
              </p>
            </div>
          </div>
          {pendingEscalations.length > 0 && (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-100 text-red-800 text-sm font-bold border border-red-200">
              <FileWarning size={16} />
              {pendingEscalations.length} bekleyen karar
            </span>
          )}
        </div>
        <div className="p-6">
          {loadingEscalations ? (
            <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
              <Loader2 size={24} className="animate-spin" />
              <span className="text-sm font-medium">Eskalasyonlar yükleniyor...</span>
            </div>
          ) : pendingEscalations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-200 mb-4">
                <ShieldAlert size={40} className="text-emerald-600" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Bekleyen SLA eskalasyonu yok</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Günlük SLA taramasını tetikleyerek yeni ihlalleri karar masanıza getirebilirsiniz.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {pendingEscalations.map((item: PendingEscalationWithAction) => (
                <li
                  key={item.id}
                  className="rounded-xl border-2 border-red-200 bg-red-50/50 p-5 flex flex-col lg:flex-row lg:items-center gap-4 shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">
                      Aksiyon · Level 3 (CAE)
                    </p>
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {item.action?.title ?? `Aksiyon #${item.action_id.slice(0, 8)}`}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-600">
                      {item.action?.current_due_date && (
                        <span>Son tarih: {new Date(item.action.current_due_date).toLocaleDateString('tr-TR')}</span>
                      )}
                      {item.action?.priority && <span>Öncelik: {item.action.priority}</span>}
                      <span>Tetiklenme: {new Date(item.triggered_at).toLocaleString('tr-TR')}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
                    <button
                      type="button"
                      onClick={() => caeDecisionMutation.mutate({ id: item.id, decision: 'TOLERATED' })}
                      disabled={caeDecisionMutation.isPending}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold shadow-md transition-colors"
                    >
                      {resolvingEscalationId === item.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                      Mazereti Kabul Et (Tolerans Tanı / Ek Süre Ver)
                    </button>
                    <button
                      type="button"
                      onClick={() => caeDecisionMutation.mutate({ id: item.id, decision: 'COMMITTEE_FLAGGED' })}
                      disabled={caeDecisionMutation.isPending}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-bold shadow-md transition-colors"
                    >
                      <Flag size={16} />
                      Denetim Komitesine Raporla (Flag for YK)
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
