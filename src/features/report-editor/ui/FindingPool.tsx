import { useState, useEffect } from 'react';
import { AlertTriangle, Search, GripVertical, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { reportApi } from '@/entities/report/api';
import type { FindingPoolItem } from '@/entities/report/model/types';

interface FindingPoolProps {
  onInsertFinding: (finding: FindingPoolItem) => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-green-100 text-green-700 border-green-200',
};

const SEVERITY_DOT: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-amber-500',
  low: 'bg-green-500',
};

export function FindingPool({ onInsertFinding }: FindingPoolProps) {
  const [findings, setFindings] = useState<FindingPoolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await reportApi.getFindings();
        setFindings(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = findings.filter(
    (f) =>
      f.title?.toLowerCase().includes(search.toLowerCase()) ||
      f.finding_ref?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={14} className="text-amber-600" />
          <span className="text-sm font-bold text-slate-800">Bulgu Havuzu</span>
          <span className="text-[10px] text-slate-400 ml-auto">{findings.length}</span>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Bulgu ara..."
            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2 space-y-1.5">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={18} className="animate-spin text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            {search ? 'Sonuc bulunamadi' : 'Bulgu yok'}
          </div>
        ) : (
          filtered.map((f) => (
            <div
              key={f.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/finding', JSON.stringify(f));
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onClick={() => onInsertFinding(f)}
              className={clsx(
                'flex items-start gap-2 p-2.5 rounded-lg border cursor-grab active:cursor-grabbing',
                'hover:shadow-sm hover:border-blue-300 transition-all group bg-white',
                SEVERITY_COLORS[f.severity] || 'border-slate-200'
              )}
            >
              <GripVertical size={12} className="text-slate-300 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={clsx('w-2 h-2 rounded-full flex-shrink-0', SEVERITY_DOT[f.severity] || 'bg-slate-400')} />
                  <span className="text-[10px] font-bold text-slate-500">{f.finding_ref}</span>
                </div>
                <p className="text-xs font-medium text-slate-800 line-clamp-2 leading-relaxed">{f.title}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-4 py-2.5 border-t border-slate-100 text-[10px] text-slate-400 text-center">
        Bulguyu tikla veya editore surukle
      </div>
    </div>
  );
}
