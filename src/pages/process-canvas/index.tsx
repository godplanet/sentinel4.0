import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Workflow, Plus, Loader2, Trash2, Clock, AlertTriangle,
  ChevronRight, ArrowLeft,
} from 'lucide-react';
import type { Node, Edge } from '@xyflow/react';
import clsx from 'clsx';
import { PageHeader } from '@/shared/ui/PageHeader';
import {
  fetchProcessMaps, fetchProcessMap, createProcessMap,
  saveProcessMap, deleteProcessMap,
} from '@/features/process-canvas/api';
import type { ProcessMap, RiskMapping } from '@/features/process-canvas/types';
import { ProcessFlowEditor } from '@/widgets/ProcessCanvas/ProcessFlowEditor';

const RISK_DOT_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-amber-500',
  MEDIUM: 'bg-blue-500',
  LOW: 'bg-emerald-500',
};

export default function ProcessCanvasPage() {
  const [maps, setMaps] = useState<ProcessMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ProcessMap | null>(null);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProcessMaps();
      setMaps(data);
    } catch (err) {
      console.error('Failed to load process maps:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = useCallback(async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const created = await createProcessMap(newTitle.trim());
      setMaps((p) => [created, ...p]);
      setNewTitle('');
      setSelected(created);
    } catch (err) {
      console.error('Failed to create:', err);
    } finally {
      setCreating(false);
    }
  }, [newTitle]);

  const handleSelect = useCallback(async (id: string) => {
    try {
      const data = await fetchProcessMap(id);
      setSelected(data);
    } catch (err) {
      console.error('Failed to load process map:', err);
    }
  }, []);

  const handleSave = useCallback(async (nodes: Node[], edges: Edge[], riskMappings?: RiskMapping[]) => {
    if (!selected) return;
    setSaving(true);
    try {
      await saveProcessMap(selected.id, nodes, edges, riskMappings);
      await load();
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  }, [selected, load]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Bu surec haritasini silmek istediginize emin misiniz?')) return;
    try {
      await deleteProcessMap(id);
      setMaps((p) => p.filter((m) => m.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  }, [selected]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (selected) {
    return (
      <div className="space-y-5">
        <PageHeader
          title={selected.title}
          description="Surec adimlari ve risk eslestirmeleri"
          icon={Workflow}
          action={
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft size={12} />
              Listeye Don
            </button>
          }
        />

        <RiskLegend risks={selected.risk_mappings || []} />

        <ProcessFlowEditor
          processMap={selected}
          onSave={handleSave}
          saving={saving}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Surec Haritasi Tuval"
        description="Is sureclerini gorsel olarak modelleyin ve riskleri eslestirin"
        icon={Workflow}
      />

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
            placeholder="Yeni surec haritasi adi..."
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400 transition-colors"
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newTitle.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {creating ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
            Olustur
          </button>
        </div>
      </div>

      {maps.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Workflow size={36} className="mx-auto text-slate-300" />
          <p className="text-sm text-slate-500">Henuz surec haritasi eklenmemis.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {maps.map((m) => (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                onClick={() => handleSelect(m.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Workflow size={14} className="text-slate-500" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">{m.title}</span>
                      <span className="text-[9px] text-slate-400">
                        {m.nodes_json.length} adim, {m.edges_json.length} baglanti
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }}
                    className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {m.risk_mappings && m.risk_mappings.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {m.risk_mappings.map((r, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-full"
                      >
                        <span className={clsx('w-1.5 h-1.5 rounded-full', RISK_DOT_COLORS[r.severity])} />
                        <span className="text-[8px] text-slate-500 font-medium">{r.riskLabel}</span>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-[9px] text-slate-400">
                    <Clock size={8} />
                    {new Date(m.updated_at).toLocaleDateString('tr-TR')}
                  </span>
                  <ChevronRight size={12} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function RiskLegend({ risks }: { risks: RiskMapping[] }) {
  if (!risks.length) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={12} className="text-amber-500" />
        <span className="text-[10px] font-bold text-slate-600">Eslestirilen Riskler</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {risks.map((r, i) => (
          <span
            key={i}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg"
          >
            <span className={clsx('w-2 h-2 rounded-full', RISK_DOT_COLORS[r.severity])} />
            <span className="text-[10px] text-slate-600 font-medium">
              Adim {r.nodeId}: {r.riskLabel}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
