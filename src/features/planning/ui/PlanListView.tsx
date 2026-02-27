import { ShieldCheck, Leaf, TrendingUp, TrendingDown, Minus, FileText, Zap, ArrowRight } from 'lucide-react';
import type { DraftEngagement, RiskVelocity } from '@/entities/planning/model/types';
import { usePlanningStore } from '@/entities/planning/model/store';

const riskBadge = (score: number) => {
  if (score >= 75) return { label: 'Kritik', className: 'bg-red-50 text-red-700 border border-red-200' };
  if (score >= 50) return { label: 'Yüksek', className: 'bg-amber-50 text-amber-700 border border-amber-200' };
  return { label: 'Orta', className: 'bg-blue-50 text-blue-700 border border-blue-200' };
};

const velocityConfig: Record<RiskVelocity, { icon: typeof TrendingUp; label: string; color: string }> = {
  HIGH: { icon: TrendingUp, label: 'Hızlı', color: 'text-rose-600' },
  MEDIUM: { icon: Minus, label: 'Sabit', color: 'text-slate-500' },
  LOW: { icon: TrendingDown, label: 'Yavaş', color: 'text-emerald-600' },
};

interface RowProps {
  engagement: DraftEngagement;
  index: number;
  source: 'backlog' | 'sprint';
}

function ListRow({ engagement, index, source }: RowProps) {
  const pullToSprint = usePlanningStore((s) => s.pullToSprint);
  const risk = riskBadge(engagement.baseRisk);
  const vel = velocityConfig[engagement.velocity];
  const VelIcon = vel.icon;
  const isCCM = engagement.isCCMTriggered === true;

  return (
    <tr className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          {isCCM && <Zap size={13} className="text-red-500 shrink-0" />}
          <span className={`text-sm font-medium ${isCCM ? 'text-red-900' : 'text-slate-800'}`}>
            {engagement.universeNodeName}
          </span>
        </div>
        {engagement.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {engagement.requiredSkills.slice(0, 4).map((s) => (
              <span key={s} className="text-xs text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">
                {s}
              </span>
            ))}
          </div>
        )}
      </td>

      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <div className={`w-20 h-1.5 rounded-full bg-slate-200 overflow-hidden`}>
            <div
              className={`h-full rounded-full ${engagement.baseRisk >= 75 ? 'bg-red-500' : engagement.baseRisk >= 50 ? 'bg-amber-500' : 'bg-blue-500'}`}
              style={{ width: `${engagement.baseRisk}%` }}
            />
          </div>
          <span className="text-sm font-bold text-slate-700 tabular-nums">{engagement.baseRisk}</span>
        </div>
      </td>

      <td className="px-4 py-3.5">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${risk.className}`}>
          {risk.label}
        </span>
      </td>

      <td className="px-4 py-3.5">
        <div className={`flex items-center gap-1 text-xs font-medium ${vel.color}`}>
          <VelIcon size={12} />
          {vel.label}
        </div>
      </td>

      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          {engagement.shariah && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
              <ShieldCheck size={10} />
              Şer.
            </span>
          )}
          {engagement.esg && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
              <Leaf size={10} />
              ESG
            </span>
          )}
          {!engagement.shariah && !engagement.esg && (
            <span className="text-xs text-slate-300">—</span>
          )}
        </div>
      </td>

      <td className="px-4 py-3.5">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
          isCCM
            ? 'bg-red-50 text-red-700 border border-red-200'
            : source === 'sprint'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
        }`}>
          {isCCM ? 'CCM Trigger' : source === 'sprint' ? 'Q-Sprint' : 'Backlog'}
        </span>
      </td>

      <td className="px-4 py-3.5 text-right">
        {source === 'backlog' && (
          <button
            onClick={() => pullToSprint(engagement.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors duration-150"
          >
            Sprint
            <ArrowRight size={11} />
          </button>
        )}
      </td>
    </tr>
  );
}

export function PlanListView() {
  const backlog = usePlanningStore((s) => s.backlog);
  const qSprint = usePlanningStore((s) => s.qSprint);

  const allItems: { engagement: DraftEngagement; source: 'backlog' | 'sprint' }[] = [
    ...qSprint.map((e) => ({ engagement: e, source: 'sprint' as const })),
    ...backlog.map((e) => ({ engagement: e, source: 'backlog' as const })),
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center">
          <FileText size={14} className="text-slate-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">Core Assurance Programme</h3>
          <p className="text-xs text-slate-500">BDDK / GIAS 2024 — Geleneksel Denetim Listesi</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full px-2.5 py-1">
            {qSprint.length} Q-Sprint
          </span>
          <span className="text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1">
            {backlog.length} Backlog
          </span>
        </div>
      </div>

      {allItems.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-3 text-center">
          <FileText size={36} className="text-slate-200" />
          <p className="text-sm font-medium text-slate-400">Plan boş</p>
          <p className="text-xs text-slate-400 max-w-xs">
            Risk evreninden görevler ekleyin veya CCM trigger'ı simüle edin.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide bg-slate-50">
                  Görev Adı
                </th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide bg-slate-50">
                  Risk Skoru
                </th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide bg-slate-50">
                  Seviye
                </th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide bg-slate-50">
                  Velocity
                </th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide bg-slate-50">
                  Özel Kapsam
                </th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide bg-slate-50">
                  Havuz
                </th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide bg-slate-50 text-right">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allItems.map(({ engagement, source }, idx) => (
                <ListRow key={engagement.id} engagement={engagement} index={idx} source={source} />
              ))}
            </tbody>
          </table>

          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Toplam <span className="font-semibold text-slate-700">{allItems.length}</span> denetim görevi
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs text-slate-500">{allItems.filter((i) => i.engagement.baseRisk >= 75).length} Kritik</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs text-slate-500">{allItems.filter((i) => i.engagement.baseRisk >= 50 && i.engagement.baseRisk < 75).length} Yüksek</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs text-slate-500">{allItems.filter((i) => i.engagement.baseRisk < 50).length} Orta</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
