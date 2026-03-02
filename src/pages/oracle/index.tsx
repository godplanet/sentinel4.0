import { useEffect } from 'react';
import { CheckCircle, RotateCcw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDelphiStore } from '@/features/delphi-engine/store';
import { useDelphiRisks, useSaveDelphiConsensus } from '@/features/delphi-engine/api';
import { OracleBoard } from '@/features/delphi-engine/ui/OracleBoard';

export default function OraclePage() {
  const { data: risksData, isLoading } = useDelphiRisks();
  const saveConsensus = useSaveDelphiConsensus();
  const { isComplete, round, votes, risks, reset, setRisks } = useDelphiStore();

  useEffect(() => {
    if (risksData?.length != null) {
      setRisks(risksData);
    }
  }, [risksData, setRisks]);

  const handleSealConsensus = () => {
    const updates = risks
      .map((r) => {
        const v = votes[r.id];
        return v ? { riskId: r.id, vote: v } : null;
      })
      .filter((u): u is { riskId: string; vote: import('@/features/delphi-engine/types').Vote } => u != null);

    if (updates.length === 0) {
      toast.error('Kaydedilecek oy yok.');
      return;
    }

    saveConsensus.mutate(updates, {
      onSuccess: () => {
        toast.success('Risk konsensüsü mühürlendi', {
          style: { background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46' },
        });
      },
      onError: () => {
        toast.error('Konsensüs kaydedilemedi. Lütfen tekrar deneyin.');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="bg-canvas min-h-screen flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          Risk listesi yükleniyor…
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="bg-canvas min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={28} className="text-emerald-500" />
          </div>

          <h2 className="text-2xl font-light tracking-tight text-primary mb-2">
            Tur {round} Tamamlandı
          </h2>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            Tüm oylar alındı. Konsensüsü veritabanına kaydetmek için aşağıdaki düğmeyi kullanın.
          </p>

          <div className="bg-surface rounded-2xl border border-slate-100 shadow-sm p-6 mb-6 text-left space-y-4">
            <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
              Oy Özeti
            </p>
            {risks.map((risk) => {
              const v = votes[risk.id];
              if (!v) return null;
              return (
                <div key={risk.id} className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{risk.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{risk.category}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <ScorePill label="E" value={v.impact} />
                    <ScorePill label="O" value={v.likelihood} />
                    <ScorePill label="H" value={v.velocity} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <button
              onClick={handleSealConsensus}
              disabled={saveConsensus.isPending || Object.keys(votes).length === 0}
              className="inline-flex items-center gap-2 bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60 rounded-full px-6 py-3 transition-all"
            >
              {saveConsensus.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle size={16} />
              )}
              Konsensüsü Mühürle
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <RotateCcw size={13} />
              Yeni Tur Başlat
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-2">
            Delphi Oracle
          </p>
          <h2 className="text-lg font-light tracking-tight text-slate-600">
            Stratejik Risk Oylama Motoru
          </h2>
        </div>

        <OracleBoard />
      </div>
    </div>
  );
}

function ScorePill({ label, value }: { label: string; value: number }) {
  const colors: Record<number, string> = {
    1: 'bg-emerald-100 text-emerald-700',
    2: 'bg-teal-100 text-teal-700',
    3: 'bg-amber-100 text-amber-700',
    4: 'bg-orange-100 text-orange-700',
    5: 'bg-red-100 text-red-700',
  };
  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${colors[value] ?? 'bg-slate-100 text-slate-700'}`}>
      <span className="opacity-60">{label}</span>
      <span>{value}</span>
    </div>
  );
}
