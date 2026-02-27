import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useRiskLibraryStore } from '@/entities/risk';
import type { RiskCategory, CreateRiskInput } from '@/entities/risk/types';

interface RKMWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WizardFormData extends CreateRiskInput {
  response_strategy?: string;
  inherent_impact?: number;
  inherent_likelihood?: number;
  residual_impact?: number;
  residual_likelihood?: number;
}

const RISK_CATEGORIES: { value: RiskCategory; label: string }[] = [
  { value: 'STRATEGIC', label: 'Stratejik Risk' },
  { value: 'OPERATIONAL', label: 'Operasyonel Risk' },
  { value: 'FINANCIAL', label: 'Finansal Risk' },
  { value: 'COMPLIANCE', label: 'Uyum Riski' },
  { value: 'REPUTATIONAL', label: 'İtibar Riski' },
  { value: 'TECHNOLOGY', label: 'Teknoloji Riski' },
  { value: 'CREDIT', label: 'Kredi Riski' },
  { value: 'MARKET', label: 'Piyasa Riski' },
  { value: 'LIQUIDITY', label: 'Likidite Riski' },
  { value: 'OTHER', label: 'Diğer' },
];

const RESPONSE_STRATEGIES = [
  { value: 'AVOID', label: 'Kaçınma - Riski tamamen ortadan kaldır' },
  { value: 'MITIGATE', label: 'Azaltma - Risk etkisini minimize et' },
  { value: 'TRANSFER', label: 'Transfer - Riski üçüncü tarafa aktar' },
  { value: 'ACCEPT', label: 'Kabul - Riski olduğu gibi kabul et' },
];

const STEPS = [
  { id: 1, title: 'Risk Tanımlama', desc: 'Temel bilgiler' },
  { id: 2, title: 'İçsel Risk', desc: 'Kontrol öncesi değerlendirme' },
  { id: 3, title: 'Strateji', desc: 'Risk yanıt stratejisi' },
  { id: 4, title: 'Artık Risk', desc: 'Kontrol sonrası değerlendirme' },
  { id: 5, title: 'Özet', desc: 'İnceleme ve kayıt' },
];

export function RKMWizard({ isOpen, onClose }: RKMWizardProps) {
  const { addRisk } = useRiskLibraryStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>({
    risk_code: '',
    title: '',
    description: '',
    category: 'OPERATIONAL',
    impact_score: 50,
    likelihood_score: 50,
    control_effectiveness: 0.5,
    tags: [],
    response_strategy: 'MITIGATE',
    inherent_impact: 3,
    inherent_likelihood: 3,
    residual_impact: 2,
    residual_likelihood: 2,
  });

  if (!isOpen) return null;

  const calculateInherentScore = () => {
    const impact = formData.inherent_impact || 0;
    const likelihood = formData.inherent_likelihood || 0;
    return impact * likelihood * 20;
  };

  const calculateResidualScore = () => {
    const impact = formData.residual_impact || 0;
    const likelihood = formData.residual_likelihood || 0;
    return impact * likelihood * 20;
  };

  const getRiskZone = (score: number) => {
    if (score >= 15)
      return { label: 'KRİTİK', color: 'text-red-700 bg-red-100 border-red-300' };
    if (score >= 10)
      return { label: 'YÜKSEK', color: 'text-amber-700 bg-amber-100 border-amber-300' };
    if (score >= 5)
      return { label: 'ORTA', color: 'text-yellow-700 bg-yellow-100 border-yellow-300' };
    return { label: 'DÜŞÜK', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const inherentScore = calculateInherentScore();
    const residualScore = calculateResidualScore();
    const controlEffectiveness =
      inherentScore > 0 ? 1 - residualScore / inherentScore : 0;

    addRisk({
      ...formData,
      impact_score: (formData.inherent_impact || 0) * 20,
      likelihood_score: (formData.inherent_likelihood || 0) * 20,
      control_effectiveness: Math.max(0, Math.min(1, controlEffectiveness)),
    });

    onClose();
    setCurrentStep(1);
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.risk_code && formData.title && formData.category;
    }
    return true;
  };

  const inherentScore = calculateInherentScore();
  const residualScore = calculateResidualScore();
  const inherentZone = getRiskZone(inherentScore);
  const residualZone = getRiskZone(residualScore);
  const riskReduction =
    inherentScore > 0 ? ((inherentScore - residualScore) / inherentScore) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl glass-card max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div>
            <h2 className="text-2xl font-bold">AI Risk Sihirbazı</h2>
            <p className="text-sm text-blue-100 mt-1">
              Adım {currentStep} / {STEPS.length} - {STEPS[currentStep - 1].title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between mb-8">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      currentStep > step.id
                        ? 'bg-emerald-500 text-white'
                        : currentStep === step.id
                        ? 'bg-blue-600 text-white scale-110'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {currentStep > step.id ? <Check size={20} /> : step.id}
                  </div>
                  <div className="text-center mt-2">
                    <div
                      className={`text-xs font-semibold ${
                        currentStep >= step.id ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-xs text-slate-500">{step.desc}</div>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 mt-[-40px] transition-all ${
                      currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Risk Tanımlama</h3>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Risk Kodu *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.risk_code}
                    onChange={(e) =>
                      setFormData({ ...formData, risk_code: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Örn: CR-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Kategori *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as RiskCategory,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {RISK_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Risk Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Risk başlığını girin"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Risk açıklaması"
                />
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Özet ve Onay</h3>

              <div className="bg-slate-50 p-6 rounded-xl space-y-4">
                <div>
                  <div className="text-xs text-slate-600 mb-1">Risk Kodu</div>
                  <div className="font-bold text-slate-900">{formData.risk_code}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-600 mb-1">Risk Başlığı</div>
                  <div className="font-bold text-slate-900">{formData.title}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-600 mb-1">Kategori</div>
                  <div className="font-medium text-slate-900">
                    {RISK_CATEGORIES.find((c) => c.value === formData.category)?.label}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-6 rounded-xl border-2 ${inherentZone.color} text-center`}
                >
                  <div className="text-sm font-semibold mb-2">İçsel Risk</div>
                  <div className="text-4xl font-bold mb-1">{inherentScore}</div>
                  <div className="text-sm font-bold">{inherentZone.label}</div>
                </div>
                <div
                  className={`p-6 rounded-xl border-2 ${residualZone.color} text-center`}
                >
                  <div className="text-sm font-semibold mb-2">Artık Risk</div>
                  <div className="text-4xl font-bold mb-1">{residualScore}</div>
                  <div className="text-sm font-bold">{residualZone.label}</div>
                </div>
              </div>

              <div className="bg-emerald-50 border-2 border-emerald-300 p-6 rounded-xl text-center">
                <div className="text-sm font-semibold text-emerald-700 mb-2">
                  Risk Azaltma Oranı
                </div>
                <div className="text-4xl font-bold text-emerald-700">
                  {riskReduction.toFixed(1)}%
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 bg-slate-50 border-t border-slate-200">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
            Geri
          </button>
          <div className="text-sm text-slate-600">
            {currentStep} / {STEPS.length} adım tamamlandı
          </div>
          {currentStep < STEPS.length ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              İleri
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors"
            >
              <Check size={20} />
              Kaydet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
