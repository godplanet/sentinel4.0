import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid3x3, X, Shield,
  Filter, Plus, Loader2
} from 'lucide-react';
import clsx from 'clsx';
import { PageHeader } from '@/shared/ui';
import { Risk360Card } from '@/widgets/Risk360Card';
import { HeatmapInsightPanel } from '@/features/ai-anomaly/ui/HeatmapInsightPanel';
import {
  useHeatmapData,
  useRiskDefinitions,
  useCreateAssessment,
  type AssessmentWithDetails,
} from '@/entities/risk/heatmap-api';
import type { CreateAssessmentInput } from '@/entities/risk/heatmap-types';
import { useAuditEntities } from '@/entities/universe';
import { StrategicHeatmap } from '@/widgets/StrategicHeatmap';

export default function RiskHeatmapPage() {
  const { data: assessments = [], isLoading } = useHeatmapData();
  const { data: riskDefs = [] } = useRiskDefinitions();
  const { data: entities = [] } = useAuditEntities();

  const [selectedCategory, setSelectedCategory] = useState('Tumu');
  const [showNewModal, setShowNewModal] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(assessments.map(a => a.risk_category));
    return ['Tumu', ...Array.from(cats).sort()];
  }, [assessments]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <PageHeader
        title="Risk Isi Haritasi"
        subtitle={`Stratejik Radar & 5x5 Matris - ${assessments.length} canli degerlendirme`}
        icon={Grid3x3}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-500" />
            <div className="flex bg-white border border-slate-200 p-0.5 rounded-lg shadow-sm flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={clsx(
                    'px-3 py-1.5 text-xs font-semibold rounded-md transition-all',
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} />
            Yeni Degerlendirme
          </button>
        </div>

        <StrategicHeatmap />
      </div>

      {showNewModal && (
        <NewAssessmentModal
          riskDefs={riskDefs}
          entities={entities}
          onClose={() => setShowNewModal(false)}
        />
      )}
    </div>
  );
}

function NewAssessmentModal({
  riskDefs,
  entities,
  onClose,
}: {
  riskDefs: { id: string; title: string; category: string }[];
  entities: { id: string; name: string; type: string }[];
  onClose: () => void;
}) {
  const createAssessment = useCreateAssessment();
  const [form, setForm] = useState<CreateAssessmentInput>({
    entity_id: '',
    risk_id: '',
    impact: 3,
    likelihood: 3,
    control_effectiveness: 0.5,
    justification: '',
  });

  const handleSubmit = async () => {
    if (!form.entity_id || !form.risk_id) return;
    await createAssessment.mutateAsync(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Yeni Risk Degerlendirmesi</h2>
              <p className="text-xs text-slate-500">Varliga risk atayarak heatmap'i guncelleyin</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Varlik</label>
            <select
              value={form.entity_id}
              onChange={e => setForm(f => ({ ...f, entity_id: e.target.value }))}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Varlik secin...</option>
              {entities.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.type})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Risk</label>
            <select
              value={form.risk_id}
              onChange={e => setForm(f => ({ ...f, risk_id: e.target.value }))}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Risk secin...</option>
              {riskDefs.map(r => (
                <option key={r.id} value={r.id}>{r.title} ({r.category})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Etki (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={form.impact}
                onChange={e => setForm(f => ({ ...f, impact: Math.min(5, Math.max(1, +e.target.value)) }))}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Olasilik (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={form.likelihood}
                onChange={e => setForm(f => ({ ...f, likelihood: Math.min(5, Math.max(1, +e.target.value)) }))}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Kontrol %</label>
              <input
                type="number"
                min={0}
                max={100}
                value={Math.round(form.control_effectiveness * 100)}
                onChange={e => setForm(f => ({ ...f, control_effectiveness: Math.min(1, Math.max(0, +e.target.value / 100)) }))}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Dogal Risk Skoru</span>
            <span className={clsx(
              'text-lg font-black',
              form.impact * form.likelihood >= 15 ? 'text-red-600' :
              form.impact * form.likelihood >= 10 ? 'text-orange-600' :
              form.impact * form.likelihood >= 5 ? 'text-yellow-600' : 'text-emerald-600'
            )}>
              {form.impact * form.likelihood}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Gerekce</label>
            <textarea
              value={form.justification ?? ''}
              onChange={e => setForm(f => ({ ...f, justification: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Bu risk degerlendirmesinin gerekceleri..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors">
            Iptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.entity_id || !form.risk_id || createAssessment.isPending}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {createAssessment.isPending && <Loader2 size={14} className="animate-spin" />}
            Kaydet
          </button>
        </div>
      </motion.div>
    </div>
  );
}
