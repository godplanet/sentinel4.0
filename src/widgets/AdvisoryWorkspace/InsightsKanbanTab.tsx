import { useState } from 'react';
import {
  Lightbulb, Plus, Loader2, X,
  Eye, MessageSquare, CheckCircle2, FileText,
} from 'lucide-react';
import clsx from 'clsx';
import {
  useAdvisoryInsights, useCreateAdvisoryInsight, useUpdateAdvisoryInsight,
} from '@/entities/advisory';
import type { AdvisoryInsight } from '@/entities/advisory';

const COLUMNS: { status: AdvisoryInsight['status']; label: string; color: string; icon: React.ElementType }[] = [
  { status: 'DRAFT', label: 'Taslak', color: 'border-t-slate-400', icon: FileText },
  { status: 'SHARED', label: 'Paylasilan', color: 'border-t-blue-500', icon: Eye },
  { status: 'ACCEPTED', label: 'Kabul Edilen', color: 'border-t-emerald-500', icon: CheckCircle2 },
  { status: 'NOTED', label: 'Not Alinan', color: 'border-t-amber-500', icon: MessageSquare },
];

const IMPACT_CONFIG = {
  STRATEGIC: { label: 'Stratejik', color: 'bg-blue-100 text-blue-700' },
  OPERATIONAL: { label: 'Operasyonel', color: 'bg-cyan-100 text-cyan-700' },
  FINANCIAL: { label: 'Finansal', color: 'bg-emerald-100 text-emerald-700' },
};

export function InsightsKanbanTab({ engagementId }: { engagementId: string }) {
  const { data: insights, isLoading } = useAdvisoryInsights(engagementId);
  const createInsight = useCreateAdvisoryInsight();
  const updateInsight = useUpdateAdvisoryInsight();
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState('');
  const [observation, setObservation] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [impactLevel, setImpactLevel] = useState<AdvisoryInsight['impact_level']>('OPERATIONAL');

  const handleCreate = async () => {
    if (!title.trim()) return;
    await createInsight.mutateAsync({
      engagement_id: engagementId,
      title,
      observation,
      recommendation,
      impact_level: impactLevel,
    });
    setTitle('');
    setObservation('');
    setRecommendation('');
    setImpactLevel('OPERATIONAL');
    setShowForm(false);
  };

  const handleStatusChange = async (insightId: string, newStatus: AdvisoryInsight['status']) => {
    await updateInsight.mutateAsync({ id: insightId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Lightbulb size={16} className="text-blue-600" />
            Gozlem & Tavsiyeler Panosu
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bulgu degil, gozlem ve tavsiye - Danismanlik dili kullanilir
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={14} />
          Yeni Gozlem
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 min-h-[400px]">
        {COLUMNS.map((col) => {
          const Icon = col.icon;
          const colInsights = (insights || []).filter((i) => i.status === col.status);
          return (
            <div
              key={col.status}
              className={clsx(
                'bg-white border border-slate-200 rounded-xl border-t-4 flex flex-col',
                col.color,
              )}
            >
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Icon size={13} />
                  {col.label}
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {colInsights.length}
                </span>
              </div>

              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {colInsights.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    onStatusChange={handleStatusChange}
                    columns={COLUMNS}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-800">Yeni Gozlem Ekle</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-slate-100">
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Baslik</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Gozlem basligi..."
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Gozlem</label>
                <textarea
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="Gozlemledigimiz husus su sekildedir..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tavsiye</label>
                <textarea
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  placeholder="Degerlendirilmesini onerdigimiz..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Etki Seviyesi</label>
                <div className="flex gap-2">
                  {(Object.entries(IMPACT_CONFIG) as [AdvisoryInsight['impact_level'], { label: string; color: string }][]).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => setImpactLevel(key)}
                      className={clsx(
                        'flex-1 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all',
                        impactLevel === key
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300',
                      )}
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Iptal
              </button>
              <button
                onClick={handleCreate}
                disabled={!title.trim() || createInsight.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {createInsight.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InsightCard({ insight, onStatusChange, columns }: {
  insight: AdvisoryInsight;
  onStatusChange: (id: string, status: AdvisoryInsight['status']) => void;
  columns: typeof COLUMNS;
}) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const impact = IMPACT_CONFIG[insight.impact_level];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-all relative">
      <div className="flex items-center gap-1.5 mb-2">
        <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded', impact.color)}>
          {impact.label}
        </span>
      </div>
      <h4 className="text-xs font-bold text-slate-800 mb-1">{insight.title}</h4>
      {insight.observation && (
        <p className="text-[10px] text-slate-500 line-clamp-2 mb-2">{insight.observation}</p>
      )}

      <button
        onClick={() => setShowMoveMenu(!showMoveMenu)}
        className="text-[10px] text-blue-600 font-bold hover:text-blue-700"
      >
        Tasi...
      </button>

      {showMoveMenu && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-10 py-1 min-w-[120px]">
          {columns
            .filter((c) => c.status !== insight.status)
            .map((c) => (
              <button
                key={c.status}
                onClick={() => {
                  onStatusChange(insight.id, c.status);
                  setShowMoveMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {c.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
