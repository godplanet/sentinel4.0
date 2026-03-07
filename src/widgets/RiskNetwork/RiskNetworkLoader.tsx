import { Loader2, AlertTriangle } from 'lucide-react';
import { RiskNetwork } from './index';
import { useRiskNetwork } from '@/features/risk-graph/api';

/**
 * Wave 43: Quantum Risk Graph — Data Loader
 *
 * Replaces raw supabase + Math.random() edges with useRiskNetwork()
 * TanStack React Query hook backed by risk_network_view (DDL: Wave 43).
 *
 * Zero design changes — only the data source is swapped (Cerrahi Müdahale).
 */
export function RiskNetworkLoader() {
  const { data: graphData, isLoading, error, refetch } = useRiskNetwork(150);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-surface rounded-xl border border-slate-200">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-slate-600">Risk ağı yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !graphData) {
    return (
      <div className="flex items-center justify-center h-full bg-surface rounded-xl border border-slate-200">
        <div className="flex flex-col items-center gap-3 text-center max-w-md p-8">
          <AlertTriangle className="w-12 h-12 text-amber-500" />
          <h3 className="text-lg font-bold text-primary">Veri Yüklenemedi</h3>
          <p className="text-sm text-slate-600">
            {error instanceof Error ? error.message : 'Risk ağı verisi yüklenirken bir hata oluştu.'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  if ((graphData?.nodes ?? []).length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-surface rounded-xl border border-slate-200">
        <div className="flex flex-col items-center gap-3 text-center max-w-md p-8">
          <AlertTriangle className="w-12 h-12 text-slate-400" />
          <h3 className="text-lg font-bold text-primary">Veri Bulunamadı</h3>
          <p className="text-sm text-slate-600">
            Risk ağını görüntülemek için önce risk tanımları eklemeniz gerekiyor.
          </p>
        </div>
      </div>
    );
  }

  return <RiskNetwork graphData={graphData} />;
}
