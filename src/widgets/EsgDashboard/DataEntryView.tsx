import { useState, useCallback } from 'react';
import {
  useEsgMetrics, useEnrichedDataPoints, useSubmitEsgDataPoint,
  type EsgMetricDefinition, type EnrichedDataPoint,
} from '@/entities/esg';
import { computeSHA256 } from '@/entities/sox';
import { evaluateGreenSkeptic, GreenSkepticModal, ValidationBadge } from '@/features/esg';
import type { GreenSkepticResult } from '@/entities/esg';
import {
  Leaf, Send, Loader2, Lock, AlertTriangle, FileText, Plus, X,
} from 'lucide-react';
import clsx from 'clsx';

const PERIOD = '2026-Q1';

export const DataEntryView = () => {
  const { data: metrics, isLoading } = useEsgMetrics();
  const { data: enriched } = useEnrichedDataPoints(PERIOD);
  const submitMutation = useSubmitEsgDataPoint();

  const [selectedMetric, setSelectedMetric] = useState<EsgMetricDefinition | null>(null);
  const [value, setValue] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [department, setDepartment] = useState('');
  const [skepticResult, setSkepticResult] = useState<GreenSkepticResult | null>(null);
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pillarFilter, setPillarFilter] = useState<'all' | 'E' | 'S' | 'G'>('all');

  const existingMap = new Map<string, EnrichedDataPoint>();
  for (const dp of enriched || []) existingMap.set(dp.metric_id, dp);

  const filteredMetrics = (metrics || []).filter((m) =>
    pillarFilter === 'all' || m.pillar === pillarFilter
  );

  const openForm = (metric: EsgMetricDefinition) => {
    const existing = existingMap.get(metric.id);
    setSelectedMetric(metric);
    setValue('');
    setEvidenceUrl('');
    setEvidenceDesc('');
    setSubmitterName('');
    setDepartment('');
    setSkepticResult(null);
    setJustification('');
  };

  const closeForm = () => {
    setSelectedMetric(null);
    setSkepticResult(null);
  };

  const handleSubmit = useCallback(async (override = false) => {
    if (!selectedMetric || !value.trim() || !submitterName.trim()) return;
    const numVal = parseFloat(value);
    if (isNaN(numVal)) return;

    const existing = existingMap.get(selectedMetric.id);

    if (!override) {
      const result = evaluateGreenSkeptic({
        metric: selectedMetric,
        value: numVal,
        previousValue: existing?.value ?? null,
        evidenceUrl: evidenceUrl || null,
        evidenceDescription: evidenceDesc || null,
      });
      if (result.triggered) {
        setSkepticResult(result);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const snapshot: Record<string, unknown> = {
        code: selectedMetric.code,
        name: selectedMetric.name,
        value: numVal,
        unit: selectedMetric.unit,
        period: PERIOD,
        submitter: submitterName,
        department,
        evidence: evidenceUrl || null,
      };
      if (skepticResult) {
        snapshot.ai_override = true;
        snapshot.ai_justification = justification;
      }

      const hash = await computeSHA256(snapshot);

      await submitMutation.mutateAsync({
        metric_id: selectedMetric.id,
        period: PERIOD,
        value: numVal,
        previous_value: existing?.value ?? null,
        evidence_url: evidenceUrl || null,
        evidence_description: evidenceDesc || null,
        submitted_by: submitterName,
        department: department || null,
        ai_validation_status: skepticResult ? 'Override' : 'Pending',
        ai_notes: skepticResult
          ? `${skepticResult.message}\n\n[OVERRIDE GEREKCE]: ${justification}`
          : null,
        ai_confidence: skepticResult ? skepticResult.confidence : null,
        snapshot_json: snapshot,
        record_hash: hash,
        is_frozen: !skepticResult,
        signed_at: skepticResult ? null : new Date().toISOString(),
      });

      closeForm();
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedMetric, value, submitterName, department, evidenceUrl, evidenceDesc, skepticResult, justification, existingMap, submitMutation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-emerald-800 text-white p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Leaf size={20} />
            <div>
              <h3 className="font-bold text-sm">ESG Veri Girisi</h3>
              <span className="text-xs text-emerald-300">Donem: {PERIOD} | Green Skeptic Aktif</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-black">{enriched?.length || 0}/{(metrics || []).length}</div>
            <div className="text-[10px] text-emerald-300">Kayitli Metrik</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {(['all', 'E', 'S', 'G'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPillarFilter(p)}
            className={clsx(
              'px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors',
              pillarFilter === p
                ? p === 'E' ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : p === 'S' ? 'bg-cyan-50 border-cyan-300 text-cyan-700'
                  : p === 'G' ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-slate-800 border-slate-800 text-white'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300',
            )}
          >
            {p === 'all' ? 'Tumu' : p === 'E' ? 'Cevre' : p === 'S' ? 'Sosyal' : 'Yonetisim'}
          </button>
        ))}
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Kod</th>
              <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Metrik</th>
              <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Birim</th>
              <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Hedef</th>
              <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Mevcut Deger</th>
              <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Durum</th>
              <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Islem</th>
            </tr>
          </thead>
          <tbody>
            {filteredMetrics.map((metric) => {
              const existing = existingMap.get(metric.id);
              return (
                <tr key={metric.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-3 py-2.5">
                    <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded',
                      metric.pillar === 'E' ? 'bg-emerald-50 text-emerald-700' :
                      metric.pillar === 'S' ? 'bg-cyan-50 text-cyan-700' :
                      'bg-amber-50 text-amber-700',
                    )}>{metric.code}</span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-600 max-w-xs truncate">{metric.name}</td>
                  <td className="px-3 py-2.5 text-[10px] text-slate-500">{metric.unit}</td>
                  <td className="px-3 py-2.5 text-[10px] text-slate-500">
                    {metric.target_value != null
                      ? `${metric.target_direction === 'below' ? '<' : '>'} ${metric.target_value}`
                      : '-'}
                  </td>
                  <td className="px-3 py-2.5 text-xs font-bold text-slate-700">
                    {existing ? `${existing.value} ${metric.unit}` : <span className="text-slate-300">-</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    {existing ? (
                      <ValidationBadge status={existing.ai_validation_status} confidence={existing.ai_confidence} />
                    ) : (
                      <span className="text-[10px] text-slate-300">Girilmemis</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => openForm(metric)}
                      className="text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded transition-colors flex items-center gap-1"
                    >
                      <Plus size={10} /> {existing ? 'Guncelle' : 'Gir'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedMetric && !skepticResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeForm} />
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={18} />
                <div>
                  <h3 className="font-bold text-sm">{selectedMetric.code}: {selectedMetric.name}</h3>
                  <p className="text-[10px] text-emerald-300">Green Skeptic dogrulama aktif</p>
                </div>
              </div>
              <button onClick={closeForm} className="text-white/70 hover:text-white"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Deger ({selectedMetric.unit})</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={`${selectedMetric.unit} cinsinden`}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Departman</label>
                  <input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Ornek: Surdurulebilirlik"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Gonderen Adi</label>
                <input
                  value={submitterName}
                  onChange={(e) => setSubmitterName(e.target.value)}
                  placeholder="Ad Soyad"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Kanit URL'si</label>
                <input
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://docs.internal/..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Kanit Aciklamasi</label>
                <textarea
                  value={evidenceDesc}
                  onChange={(e) => setEvidenceDesc(e.target.value)}
                  rows={2}
                  placeholder="Verinin kaynagini ve dogrulama yontemini aciklayiniz..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                />
              </div>

              {!evidenceUrl && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-[10px] text-amber-700">
                    Kanit belgesi eklenmemistir. Green Skeptic kanitsiz beyanlari isaretleyecektir.
                  </span>
                </div>
              )}

              <div className="bg-slate-50 rounded-lg p-3 text-[10px] text-slate-500 flex items-center gap-2">
                <Lock size={12} className="text-slate-400" />
                Veri SHA-256 ile hash'lenecek ve Cryo-Chamber'a kaydedilecektir.
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-slate-100 bg-slate-50/50">
              <button onClick={closeForm} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
                Vazgec
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting || !value.trim() || !submitterName.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-emerald-700 text-white hover:bg-emerald-600 transition-colors disabled:opacity-40"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Kaydet ve Dogrula
              </button>
            </div>
          </div>
        </div>
      )}

      {skepticResult && (
        <GreenSkepticModal
          result={skepticResult}
          justification={justification}
          onJustificationChange={setJustification}
          onOverride={() => handleSubmit(true)}
          onCancel={() => setSkepticResult(null)}
        />
      )}
    </div>
  );
};
