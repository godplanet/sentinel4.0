import { useState } from 'react';
import { Workflow, Plus, Save, Loader2, Trash2, GripVertical } from 'lucide-react';
import clsx from 'clsx';

interface CanvasBlock {
  id: string;
  type: 'process' | 'decision' | 'note';
  text: string;
}

const BLOCK_COLORS = {
  process: 'bg-blue-50 border-blue-200 text-blue-800',
  decision: 'bg-amber-50 border-amber-200 text-amber-800',
  note: 'bg-slate-50 border-slate-200 text-slate-700',
};

const BLOCK_LABELS = {
  process: 'Surec',
  decision: 'Karar',
  note: 'Not',
};

export function AdvisoryCanvasTab({ engagementId: _engagementId }: { engagementId: string }) {
  const [blocks, setBlocks] = useState<CanvasBlock[]>([
    { id: '1', type: 'process', text: 'Mevcut surec analizi yapilir' },
    { id: '2', type: 'decision', text: 'Etkinlik degerlendirmesi: Yeterli mi?' },
    { id: '3', type: 'note', text: 'Yonetimin gorusleri not alinir' },
  ]);
  const [saving, setSaving] = useState(false);

  const addBlock = (type: CanvasBlock['type']) => {
    setBlocks((prev) => [
      ...prev,
      { id: Date.now().toString(), type, text: '' },
    ]);
  };

  const updateBlock = (id: string, text: string) => {
    setBlocks((prev) => prev.map((b) => b.id === id ? { ...b, text } : b));
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Workflow size={16} className="text-blue-600" />
            Danismanlik Calisma Alani
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Surec haritalama ve gozlem notlari - Denetim risklerine baglanmaz
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          Kaydet
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => addBlock('process')}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-200 transition-colors border border-blue-200"
        >
          <Plus size={12} />
          Surec Adimi
        </button>
        <button
          onClick={() => addBlock('decision')}
          className="flex items-center gap-1.5 px-3 py-2 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg hover:bg-amber-200 transition-colors border border-amber-200"
        >
          <Plus size={12} />
          Karar Noktasi
        </button>
        <button
          onClick={() => addBlock('note')}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors border border-slate-200"
        >
          <Plus size={12} />
          Not
        </button>
      </div>

      <div className="space-y-3">
        {blocks.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Workflow size={36} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">Calisma alanina bloklar ekleyin</p>
          </div>
        ) : (
          blocks.map((block, idx) => (
            <div
              key={block.id}
              className={clsx(
                'flex items-start gap-3 p-4 rounded-xl border-2 transition-all hover:shadow-sm',
                BLOCK_COLORS[block.type],
              )}
            >
              <div className="flex flex-col items-center gap-1 pt-1">
                <GripVertical size={14} className="opacity-30" />
                <span className="text-[9px] font-bold opacity-50">{idx + 1}</span>
              </div>

              <div className="flex-1">
                <span className={clsx(
                  'text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded',
                  block.type === 'process' && 'bg-blue-200/60 text-blue-700',
                  block.type === 'decision' && 'bg-amber-200/60 text-amber-700',
                  block.type === 'note' && 'bg-slate-200/60 text-slate-600',
                )}>
                  {BLOCK_LABELS[block.type]}
                </span>
                <textarea
                  value={block.text}
                  onChange={(e) => updateBlock(block.id, e.target.value)}
                  placeholder="Aciklama yazin..."
                  rows={2}
                  className="w-full mt-2 px-3 py-2 bg-white/80 border border-inherit rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                />
              </div>

              <button
                onClick={() => removeBlock(block.id)}
                className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
