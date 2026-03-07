import { useState, useCallback } from 'react';
import { Workflow, Plus, Save, Loader2, Trash2, GripVertical, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useCanvasBlocks, useUpsertCanvasBlocks } from '@/entities/advisory';
import type { AdvisoryCanvasBlock } from '@/entities/advisory';

type BlockType = AdvisoryCanvasBlock['block_type'];

const BLOCK_COLORS: Record<BlockType, string> = {
  process:  'bg-blue-50 border-blue-200 text-blue-800',
  decision: 'bg-amber-50 border-amber-200 text-amber-800',
  note:     'bg-white border-slate-200 text-slate-700',
};

const BLOCK_LABELS: Record<BlockType, string> = {
  process:  'Süreç',
  decision: 'Karar',
  note:     'Not',
};

interface LocalBlock {
  id: string;
  block_type: BlockType;
  text_content: string;
  position_index: number;
}

export function AdvisoryCanvasTab({ engagementId }: { engagementId: string }) {
  const { data: remoteBlocks = [], isLoading } = useCanvasBlocks(engagementId);
  const upsert = useUpsertCanvasBlocks(engagementId);

  // Local draft layer — seeded from remote on load
  const [localBlocks, setLocalBlocks] = useState<LocalBlock[] | null>(null);
  const [dirty, setDirty] = useState(false);

  // Merge remote into local once on first load (if not yet dirty)
  const displayBlocks: LocalBlock[] = localBlocks ?? (remoteBlocks as LocalBlock[]);

  const ensureLocal = useCallback(() => {
    if (localBlocks === null) {
      setLocalBlocks(remoteBlocks as LocalBlock[]);
    }
  }, [localBlocks, remoteBlocks]);

  const addBlock = (type: BlockType) => {
    ensureLocal();
    const newBlock: LocalBlock = {
      id: crypto.randomUUID(),
      block_type: type,
      text_content: '',
      position_index: displayBlocks.length,
    };
    setLocalBlocks((prev) => [...(prev ?? displayBlocks), newBlock]);
    setDirty(true);
  };

  const updateBlock = (id: string, text: string) => {
    setLocalBlocks((prev) =>
      (prev ?? displayBlocks).map((b) => b.id === id ? { ...b, text_content: text } : b)
    );
    setDirty(true);
  };

  const removeBlock = (id: string) => {
    setLocalBlocks((prev) =>
      (prev ?? displayBlocks).filter((b) => b.id !== id).map((b, i) => ({ ...b, position_index: i }))
    );
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      await upsert.mutateAsync(
        displayBlocks.map((b, i) => ({
          id: b.id,
          block_type: b.block_type,
          text_content: b.text_content,
          position_index: i,
        }))
      );
      setDirty(false);
      toast.success('Çalışma alanı Supabase\'e kaydedildi.', { duration: 3000 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Kayıt sırasında hata';
      toast.error(msg);
    }
  };

  const handleReset = () => {
    setLocalBlocks(null);
    setDirty(false);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[200px]">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <Loader2 size={18} className="animate-spin text-blue-500" />
          Çalışma alanı blokları yükleniyor...
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Workflow size={16} className="text-blue-600" />
            Danışmanlık Çalışma Alanı
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Süreç haritalama ve gözlem notları — Denetim risklerine bağlanmaz
          </p>
        </div>

        <div className="flex items-center gap-2">
          {dirty && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-500 text-xs font-medium rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
            >
              <RefreshCw size={12} />
              Geri Al
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={upsert.isPending || !dirty}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {upsert.isPending
              ? <Loader2 size={12} className="animate-spin" />
              : <Save size={12} />
            }
            {dirty ? 'Kaydet' : 'Kaydedildi'}
          </button>
        </div>
      </div>

      {/* Block type controls */}
      <div className="flex gap-2">
        {(['process', 'decision', 'note'] as BlockType[]).map((type) => (
          <button
            key={type}
            onClick={() => addBlock(type)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors border',
              type === 'process'  && 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200',
              type === 'decision' && 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200',
              type === 'note'     && 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200',
            )}
          >
            <Plus size={12} />
            {BLOCK_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Canvas blocks */}
      <div className="space-y-3">
        {displayBlocks.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Workflow size={36} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">Çalışma alanına bloklar ekleyin</p>
            <p className="text-xs mt-1 text-slate-400">Yukarıdaki butonları kullanarak süreç adımları ekleyebilirsiniz</p>
          </div>
        ) : (
          displayBlocks.map((block, idx) => (
            <div
              key={block.id}
              className={clsx(
                'flex items-start gap-3 p-4 rounded-xl border-2 transition-all hover:shadow-sm',
                BLOCK_COLORS[block.block_type],
              )}
            >
              <div className="flex flex-col items-center gap-1 pt-1">
                <GripVertical size={14} className="opacity-30" />
                <span className="text-[9px] font-bold opacity-50">{idx + 1}</span>
              </div>

              <div className="flex-1">
                <span className={clsx(
                  'text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded',
                  block.block_type === 'process'  && 'bg-blue-200/60 text-blue-700',
                  block.block_type === 'decision' && 'bg-amber-200/60 text-amber-700',
                  block.block_type === 'note'     && 'bg-slate-200/60 text-slate-600',
                )}>
                  {BLOCK_LABELS[block.block_type]}
                </span>
                <textarea
                  value={block.text_content}
                  onChange={(e) => updateBlock(block.id, e.target.value)}
                  placeholder="Açıklama yazın..."
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

      {/* Advisory Services panel — bottom summary */}
      <AdvisoryServicesSummary engagementId={engagementId} />
    </div>
  );
}

// ─── Advisory Services Mini Summary ──────────────────────────────────────────

import { useAdvisoryServices, useUpdateAdvisoryServiceStatus } from '@/entities/advisory';
import type { AdvisoryService } from '@/entities/advisory';

const SERVICE_STATUS_LABELS: Record<AdvisoryService['status'], { label: string; color: string }> = {
  SCOPING:     { label: 'Kapsam Belirleme', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  APPROVED:    { label: 'Onaylandı',         color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  IN_PROGRESS: { label: 'Devam Ediyor',      color: 'bg-blue-100 text-blue-700 border-blue-200' },
  COMPLETED:   { label: 'Tamamlandı',        color: 'bg-green-100 text-green-700 border-green-200' },
  CANCELLED:   { label: 'İptal',             color: 'bg-red-100 text-red-600 border-red-200' },
};

function AdvisoryServicesSummary({ engagementId }: { engagementId: string }) {
  const { data: services = [] } = useAdvisoryServices(engagementId);
  const updateStatus = useUpdateAdvisoryServiceStatus();

  if ((services ?? []).length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-4">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-cyan-50">
        <h3 className="text-xs font-bold text-slate-700">Danışmanlık Hizmetleri</h3>
        <p className="text-[11px] text-slate-500">{(services ?? []).length} hizmet tanımlandı</p>
      </div>
      <div className="divide-y divide-slate-100">
        {(services ?? []).map((svc) => {
          const { label, color } = SERVICE_STATUS_LABELS[svc.status] ?? SERVICE_STATUS_LABELS.SCOPING;
          return (
            <div key={svc.id} className="px-5 py-3.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{svc.title}</p>
                {svc.regulatory_ref && (
                  <p className="text-[11px] text-slate-400 mt-0.5">{svc.regulatory_ref}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[11px] text-slate-500">{svc.estimated_hours}h</span>
                <select
                  value={svc.status}
                  onChange={(e) =>
                    updateStatus.mutate({ id: svc.id, status: e.target.value as AdvisoryService['status'] })
                  }
                  className={clsx(
                    'text-[10px] font-semibold px-2 py-1 rounded-lg border cursor-pointer focus:outline-none',
                    color,
                  )}
                >
                  {Object.entries(SERVICE_STATUS_LABELS).map(([key, { label: l }]) => (
                    <option key={key} value={key}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
