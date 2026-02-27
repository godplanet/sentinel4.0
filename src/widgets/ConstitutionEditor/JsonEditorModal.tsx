import { useState } from 'react';
import { X, Check, AlertCircle, Code2 } from 'lucide-react';
import type { RiskConstitutionData } from '@/features/risk-constitution/types';

interface Props {
  constitution: RiskConstitutionData;
  onApply: (updates: Partial<Pick<RiskConstitutionData, 'dimensions' | 'impact_matrix' | 'veto_rules' | 'risk_ranges'>>) => void;
  onClose: () => void;
}

export function JsonEditorModal({ constitution, onApply, onClose }: Props) {
  const editable = {
    dimensions: constitution.dimensions,
    impact_matrix: constitution.impact_matrix,
    veto_rules: constitution.veto_rules,
    risk_ranges: constitution.risk_ranges,
  };

  const [raw, setRaw] = useState(JSON.stringify(editable, null, 2));
  const [parseError, setParseError] = useState<string | null>(null);

  const handleApply = () => {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.dimensions || !parsed.impact_matrix || !parsed.veto_rules || !parsed.risk_ranges) {
        setParseError('JSON must contain: dimensions, impact_matrix, veto_rules, risk_ranges');
        return;
      }
      setParseError(null);
      onApply(parsed);
      onClose();
    } catch (e) {
      setParseError((e as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-800">JSON Editor - Risk Anayasasi</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden p-4">
          <textarea
            value={raw}
            onChange={(e) => { setRaw(e.target.value); setParseError(null); }}
            className="w-full h-full min-h-[400px] font-mono text-sm bg-slate-900 text-green-400 p-4 rounded-xl border border-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            spellCheck={false}
          />
        </div>

        {parseError && (
          <div className="mx-4 mb-2 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{parseError}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Iptal
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Check className="w-4 h-4" />
            Uygula
          </button>
        </div>
      </div>
    </div>
  );
}
