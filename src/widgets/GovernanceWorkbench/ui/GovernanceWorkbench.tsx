import { BDDKWatchlist }      from '@/features/action-analytics/ui/BDDKWatchlist';
import { DualAgingChart }     from '@/features/action-analytics/ui/DualAgingChart';
import { AssuranceDecayGauge } from '@/features/action-analytics/ui/AssuranceDecayGauge';
import { VirtualActionGrid }  from './VirtualActionGrid';
import type { ActionAgingMetrics } from '@/entities/action/model/types';

interface Props {
  actions:         ActionAgingMetrics[];
  onSelectAction?: (a: ActionAgingMetrics) => void;
}

export function GovernanceWorkbench({ actions, onSelectAction }: Props) {
  return (
    <div className="space-y-5">
      <BDDKWatchlist actions={actions} onSelectAction={onSelectAction} />

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col" style={{ minHeight: 360 }}>
          <h3 className="font-serif text-base font-bold text-slate-900 mb-1">
            İkili Yaşlanma Analizi — Maskelenen Risk Göstergesi
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Uzatma onayları aracılığıyla gizlenen gecikmeler görsel olarak ifşa edildi
          </p>
          <div className="flex-1 min-h-0">
            <DualAgingChart actions={actions} />
          </div>
        </div>

        <div className="col-span-1 bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col" style={{ minHeight: 360 }}>
          <h3 className="font-serif text-base font-bold text-slate-900 mb-4">
            Güvence Bütünlüğü
          </h3>
          <div className="flex-1 min-h-0">
            <AssuranceDecayGauge actions={actions} />
          </div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl p-5">
        <h3 className="font-serif text-base font-bold text-slate-900 mb-1">
          Aksiyon Matris Tablosu — Yüksek Performanslı Sanal Izgara
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          TanStack Virtual ile binlerce satır gecikme olmadan işleniyor
        </p>
        <VirtualActionGrid actions={actions} />
      </div>
    </div>
  );
}
