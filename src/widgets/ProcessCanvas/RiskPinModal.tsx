import { useState, useEffect } from 'react';
import { X, AlertTriangle, Search, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '@/shared/api/supabase';
import type { RiskMapping } from '@/features/process-canvas/types';

interface RiskDefinition {
  id: string;
  risk_name: string;
  risk_category: string | null;
  inherent_score: number | null;
}

interface RiskPinModalProps {
  nodeId: string;
  nodeLabel: string;
  onPin: (mapping: RiskMapping) => void;
  onClose: () => void;
}

const SEVERITY_OPTIONS: Array<{ value: RiskMapping['severity']; label: string; color: string }> = [
  { value: 'CRITICAL', label: 'Kritik', color: 'bg-red-500' },
  { value: 'HIGH', label: 'Yuksek', color: 'bg-amber-500' },
  { value: 'MEDIUM', label: 'Orta', color: 'bg-blue-500' },
  { value: 'LOW', label: 'Dusuk', color: 'bg-emerald-500' },
];

export function RiskPinModal({ nodeId, nodeLabel, onPin, onClose }: RiskPinModalProps) {
  const [risks, setRisks] = useState<RiskDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<RiskDefinition | null>(null);
  const [severity, setSeverity] = useState<RiskMapping['severity']>('MEDIUM');

  useEffect(() => {
    loadRisks();
  }, []);

  async function loadRisks() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('risk_definitions')
        .select('id, risk_name, risk_category, inherent_score')
        .order('inherent_score', { ascending: false });

      if (error) throw error;
      setRisks(data || []);
    } catch (err) {
      console.error('Failed to load risks:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = risks.filter((r) =>
    r.risk_name.toLowerCase().includes(search.toLowerCase()) ||
    (r.risk_category?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const handlePin = () => {
    if (!selectedRisk) return;
    onPin({
      nodeId,
      riskLabel: selectedRisk.risk_name,
      severity,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Risk Bagla
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Adim: <span className="font-bold">{nodeLabel}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-slate-100 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Risk ara..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-400 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-slate-400" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-8">Risk bulunamadi.</p>
          ) : (
            <div className="space-y-1.5">
              {filtered.map((risk) => (
                <button
                  key={risk.id}
                  onClick={() => setSelectedRisk(risk)}
                  className={clsx(
                    'w-full text-left px-3 py-2.5 rounded-lg border transition-all text-xs',
                    selectedRisk?.id === risk.id
                      ? 'bg-slate-100 border-slate-400 ring-1 ring-slate-300'
                      : 'border-transparent hover:bg-slate-50'
                  )}
                >
                  <span className="font-bold text-slate-700 block">{risk.risk_name}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    {risk.risk_category && (
                      <span className="text-[9px] text-slate-400">{risk.risk_category}</span>
                    )}
                    {risk.inherent_score != null && (
                      <span className="text-[9px] font-bold text-slate-500">
                        Skor: {risk.inherent_score}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedRisk && (
          <div className="px-5 py-3 border-t border-slate-200 shrink-0 space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1.5">Siddet Seviyesi</label>
              <div className="flex gap-2">
                {SEVERITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSeverity(opt.value)}
                    className={clsx(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
                      severity === opt.value
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                    )}
                  >
                    <span className={clsx('w-2 h-2 rounded-full', opt.color)} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handlePin}
              className="w-full px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Riski Bagla: {selectedRisk.risk_name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
