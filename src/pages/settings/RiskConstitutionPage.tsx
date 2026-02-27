import { useState, useCallback } from 'react';
import { BookOpen, Save, Code2, Loader2, AlertCircle, Scale, Grid3X3, ShieldAlert, Palette } from 'lucide-react';
import { useRiskConstitution } from '@/features/risk-constitution/useRiskConstitution';
import { DimensionsTab, MatrixTab, VetoTab, ColorScaleTab, LiveTestPanel, JsonEditorModal } from '@/widgets/ConstitutionEditor';
import { PageHeader } from '@/shared/ui/PageHeader';
import type { Dimension, ImpactLevel, VetoRule, RiskRange, ScoreInput, RiskConstitutionData } from '@/features/risk-constitution/types';

type TabId = 'dimensions' | 'matrix' | 'veto' | 'colors';

const TABS: { id: TabId; label: string; icon: typeof Scale }[] = [
  { id: 'dimensions', label: 'Boyutlar & Agirlik', icon: Scale },
  { id: 'matrix', label: 'Etki Matrisi', icon: Grid3X3 },
  { id: 'veto', label: 'Veto Kurallari', icon: ShieldAlert },
  { id: 'colors', label: 'Renk Skalasi', icon: Palette },
];

export default function RiskConstitutionPage() {
  const { constitution, loading, error, save } = useRiskConstitution();

  const [activeTab, setActiveTab] = useState<TabId>('dimensions');
  const [saving, setSaving] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [draftDimensions, setDraftDimensions] = useState<Dimension[]>([]);
  const [draftMatrix, setDraftMatrix] = useState<ImpactLevel[]>([]);
  const [draftVetoRules, setDraftVetoRules] = useState<VetoRule[]>([]);
  const [draftRanges, setDraftRanges] = useState<RiskRange[]>([]);
  const [initialized, setInitialized] = useState(false);

  const [testInputs, setTestInputs] = useState<ScoreInput>({
    dimensionScores: {},
    likelihood: 3,
    controlEffectiveness: 2,
    context: { shariah_sensitivity: 1, cvss: 0, asset_criticality: 'normal' },
  });

  if (constitution && !initialized) {
    setDraftDimensions(constitution.dimensions);
    setDraftMatrix(constitution.impact_matrix);
    setDraftVetoRules(constitution.veto_rules);
    setDraftRanges(constitution.risk_ranges);

    const scores: Record<string, number> = {};
    constitution.dimensions.forEach(d => { scores[d.id] = 3; });
    setTestInputs(prev => ({ ...prev, dimensionScores: scores }));
    setInitialized(true);
  }

  const handleDimensionsChange = useCallback((dims: Dimension[]) => {
    setDraftDimensions(dims);
    setDirty(true);
  }, []);

  const handleMatrixChange = useCallback((matrix: ImpactLevel[]) => {
    setDraftMatrix(matrix);
    setDirty(true);
  }, []);

  const handleVetoChange = useCallback((rules: VetoRule[]) => {
    setDraftVetoRules(rules);
    setDirty(true);
  }, []);

  const handleRangesChange = useCallback((ranges: RiskRange[]) => {
    setDraftRanges(ranges);
    setDirty(true);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const ok = await save({
      dimensions: draftDimensions,
      impact_matrix: draftMatrix,
      veto_rules: draftVetoRules,
      risk_ranges: draftRanges,
    });
    if (ok) setDirty(false);
    setSaving(false);
  };

  const handleJsonApply = (updates: Partial<Pick<RiskConstitutionData, 'dimensions' | 'impact_matrix' | 'veto_rules' | 'risk_ranges'>>) => {
    if (updates.dimensions) setDraftDimensions(updates.dimensions);
    if (updates.impact_matrix) setDraftMatrix(updates.impact_matrix);
    if (updates.veto_rules) setDraftVetoRules(updates.veto_rules);
    if (updates.risk_ranges) setDraftRanges(updates.risk_ranges);
    setDirty(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !constitution) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm text-red-600">{error || 'Anayasa verisi bulunamadi'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        icon={BookOpen}
        title="Risk Anayasasi v3.0"
        description="Tum risk matematik ve siniflandirma kurallarini tek noktadan yonetin"
        action={
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
              {constitution.version}
            </span>
            <button
              onClick={() => setShowJson(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Code2 className="w-4 h-4" />
              JSON
            </button>
          </div>
        }
      />

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-6 bg-white border border-slate-200 rounded-xl p-1">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg flex-1 transition-all ${
                      isActive
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-sm">
              {activeTab === 'dimensions' && (
                <DimensionsTab dimensions={draftDimensions} onChange={handleDimensionsChange} />
              )}
              {activeTab === 'matrix' && (
                <MatrixTab dimensions={draftDimensions} matrix={draftMatrix} onChange={handleMatrixChange} />
              )}
              {activeTab === 'veto' && (
                <VetoTab rules={draftVetoRules} onChange={handleVetoChange} />
              )}
              {activeTab === 'colors' && (
                <ColorScaleTab ranges={draftRanges} onChange={handleRangesChange} />
              )}
            </div>

            {dirty && (
              <div className="mt-4 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-3">
                <span className="text-sm text-amber-700 font-medium">Kaydedilmemis degisiklikler var</span>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-900 disabled:opacity-50 transition-colors"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Kaydet
                </button>
              </div>
            )}
          </div>

          <div className="w-72 flex-shrink-0">
            <div className="sticky top-6 bg-white/70 backdrop-blur-xl border border-slate-200 rounded-2xl p-5 shadow-sm">
              <LiveTestPanel
                dimensions={draftDimensions}
                vetoRules={draftVetoRules}
                ranges={draftRanges}
                testInputs={testInputs}
                onInputsChange={setTestInputs}
              />
            </div>
          </div>
        </div>
      </div>

      {showJson && (
        <JsonEditorModal
          constitution={{ ...constitution, dimensions: draftDimensions, impact_matrix: draftMatrix, veto_rules: draftVetoRules, risk_ranges: draftRanges }}
          onApply={handleJsonApply}
          onClose={() => setShowJson(false)}
        />
      )}
    </div>
  );
}
