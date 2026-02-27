/**
 * Sampling Wizard Widget
 *
 * GIAS Standard 14.1 compliant statistical sampling calculator
 * Allows auditors to scientifically determine sample sizes
 */

import { useState, useEffect } from 'react';
import {
  Calculator,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Info,
  Sparkles,
  Save,
} from 'lucide-react';
import {
  calculateSampleSize,
  generateRandomSample,
  validateSamplingConfig,
  type RiskLevel,
  type ConfidenceLevel,
  type SamplingInput,
  type SamplingResult,
} from '@/features/sampling/lib/calculator';

interface SamplingWizardProps {
  workpaperId?: string | null;
  onSave?: (config: SamplingInput & { result: SamplingResult }) => void;
}

export function SamplingWizard({ workpaperId, onSave }: SamplingWizardProps) {
  const [populationSize, setPopulationSize] = useState<number>(0);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('medium');
  const [confidenceLevel, setConfidenceLevel] = useState<ConfidenceLevel>(95);
  const [expectedErrorRate, setExpectedErrorRate] = useState<number>(0);
  const [result, setResult] = useState<SamplingResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSampleIndices, setShowSampleIndices] = useState(false);
  const [sampleIndices, setSampleIndices] = useState<number[]>([]);

  useEffect(() => {
    if (populationSize > 0) {
      const input: SamplingInput = {
        populationSize,
        riskLevel,
        confidenceLevel,
        expectedErrorRate: expectedErrorRate || undefined,
      };

      const validationErrors = validateSamplingConfig(input);
      setErrors(validationErrors);

      if (validationErrors.length === 0) {
        const calculatedResult = calculateSampleSize(input);
        setResult(calculatedResult);
      } else {
        setResult(null);
      }
    } else {
      setResult(null);
      setErrors([]);
    }
  }, [populationSize, riskLevel, confidenceLevel, expectedErrorRate]);

  const handleGenerateSample = () => {
    if (result) {
      const indices = generateRandomSample(populationSize, result.recommendedSampleSize);
      setSampleIndices(indices);
      setShowSampleIndices(true);
    }
  };

  const handleSave = async () => {
    if (!result) return;

    setIsSaving(true);
    try {
      const config = {
        populationSize,
        riskLevel,
        confidenceLevel,
        expectedErrorRate: expectedErrorRate || undefined,
        result,
      };

      if (onSave) {
        await onSave(config);
      }

      alert('Örneklem metodolojisi başarıyla kaydedildi!');
    } catch (error) {
      console.error('Failed to save sampling config:', error);
      alert('Kaydetme sırasında bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Calculator className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Örneklem Hesaplayıcı</h2>
            <p className="text-sm text-slate-600">GIAS Standard 14.1 - İstatistiksel Örnekleme</p>
          </div>
        </div>

        {/* Input Section */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="text-blue-600 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Attribute Sampling Metodolojisi</p>
              <p className="text-xs text-blue-700 mt-1">
                Risk seviyesi ve güven aralığına göre bilimsel örneklem büyüklüğü hesaplanır.
              </p>
            </div>
          </div>

          {/* Population Size */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Evren Büyüklüğü (N)
            </label>
            <input
              type="number"
              min="0"
              value={populationSize || ''}
              onChange={(e) => setPopulationSize(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 focus:border-blue-500 focus:outline-none bg-white text-lg font-semibold"
              placeholder="Örn: 1000"
            />
            <p className="text-xs text-slate-500 mt-1">Test edilecek toplam birim sayısı</p>
          </div>

          {/* Risk Level */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Risk Seviyesi</label>
            <div className="grid grid-cols-3 gap-3">
              {(['low', 'medium', 'high'] as RiskLevel[]).map((level) => {
                const isActive = riskLevel === level;
                const config = {
                  low: {
                    label: 'Düşük Risk',
                    color: 'green',
                    bgActive: 'bg-green-100 border-green-500',
                    bgInactive: 'bg-white border-slate-300 hover:border-green-400',
                    textActive: 'text-green-900',
                    textInactive: 'text-slate-600',
                  },
                  medium: {
                    label: 'Orta Risk',
                    color: 'yellow',
                    bgActive: 'bg-yellow-100 border-yellow-500',
                    bgInactive: 'bg-white border-slate-300 hover:border-yellow-400',
                    textActive: 'text-yellow-900',
                    textInactive: 'text-slate-600',
                  },
                  high: {
                    label: 'Yüksek Risk',
                    color: 'red',
                    bgActive: 'bg-red-100 border-red-500',
                    bgInactive: 'bg-white border-slate-300 hover:border-red-400',
                    textActive: 'text-red-900',
                    textInactive: 'text-slate-600',
                  },
                };

                const style = config[level];

                return (
                  <button
                    key={level}
                    onClick={() => setRiskLevel(level)}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      isActive ? style.bgActive : style.bgInactive
                    }`}
                  >
                    <p className={`text-sm font-bold ${isActive ? style.textActive : style.textInactive}`}>
                      {style.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Confidence Level */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Güven Aralığı</label>
            <select
              value={confidenceLevel}
              onChange={(e) => setConfidenceLevel(Number(e.target.value) as ConfidenceLevel)}
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 focus:border-blue-500 focus:outline-none bg-white text-sm font-medium"
            >
              <option value={90}>%90 Güven Aralığı</option>
              <option value={95}>%95 Güven Aralığı (Standart)</option>
              <option value={99}>%99 Güven Aralığı (Yüksek Kesinlik)</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">Daha yüksek güven = Daha büyük örneklem</p>
          </div>

          {/* Expected Error Rate (Optional) */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Beklenen Hata Oranı (%) - İsteğe Bağlı
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={expectedErrorRate || ''}
              onChange={(e) => setExpectedErrorRate(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 focus:border-blue-500 focus:outline-none bg-white"
              placeholder="0"
            />
            <p className="text-xs text-slate-500 mt-1">
              Geçmiş deneyimlere göre beklenen hata oranı (örneklem büyüklüğünü artırır)
            </p>
          </div>
        </div>

        {/* Validation Errors */}
        {errors.length > 0 && (
          <div className="glass-card p-4 border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-600 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm font-bold text-red-900 mb-2">Lütfen eksikleri tamamlayın:</p>
                <ul className="space-y-1">
                  {errors.map((error, idx) => (
                    <li key={idx} className="text-xs text-red-700">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Result Section */}
        {result && (
          <>
            <div className="glass-card p-8 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
              <div className="flex items-center gap-4 mb-6">
                <Sparkles className="text-yellow-300" size={32} />
                <div>
                  <p className="text-sm font-medium opacity-90">Önerilen Örneklem Büyüklüğü</p>
                  <p className="text-5xl font-bold mt-2">
                    {result.recommendedSampleSize.toLocaleString('tr-TR')}
                  </p>
                  {result.isFullScope && (
                    <p className="text-sm mt-2 bg-yellow-500/20 inline-block px-3 py-1 rounded-lg border border-yellow-300/30">
                      Tam Kapsam Testi Gerekli
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs opacity-75">Kapsam Oranı</p>
                  <p className="text-lg font-bold">
                    {((result.recommendedSampleSize / populationSize) * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs opacity-75">Metodoloji</p>
                  <p className="text-sm font-medium">{result.methodology}</p>
                </div>
              </div>
            </div>

            {/* Justification */}
            <div className="glass-card p-6">
              <div className="flex items-start gap-3 mb-4">
                <TrendingUp className="text-blue-600 mt-0.5" size={20} />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Metodoloji Gerekçesi</h3>
                  <p className="text-xs text-slate-600 mt-1">GIAS Standard 14.1 Uyumluluğu</p>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                  {result.justification}
                </pre>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleGenerateSample}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg font-medium"
              >
                <Sparkles size={18} />
                <span>Rastgele Örneklem Oluştur</span>
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Metodolojiyi Kaydet</span>
                  </>
                )}
              </button>
            </div>

            {/* Sample Indices Display */}
            {showSampleIndices && sampleIndices.length > 0 && (
              <div className="glass-card p-6 border-purple-200">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle2 className="text-purple-600 mt-0.5" size={20} />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      Rastgele Seçilen Örneklem Numaraları
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Toplam {sampleIndices.length} adet örneklem birim numarası
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(sampleIndices.join(', '));
                      alert('Örneklem numaraları panoya kopyalandı!');
                    }}
                    className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-xs font-medium"
                  >
                    Kopyala
                  </button>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {sampleIndices.map((index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white border border-purple-300 rounded-lg text-sm font-medium text-purple-900"
                      >
                        #{index}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-3">
                  Bu numaralar evren içinden rastgele seçilmiştir. Test sırasında bu numaralara
                  karşılık gelen kayıtları inceleyin.
                </p>
              </div>
            )}
          </>
        )}

        {/* No Result Placeholder */}
        {!result && errors.length === 0 && populationSize === 0 && (
          <div className="glass-card p-12 text-center">
            <Calculator className="mx-auto mb-4 text-slate-400" size={48} />
            <h3 className="text-lg font-bold text-slate-700 mb-2">Hesaplamaya Başlayın</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Evren büyüklüğünü girin ve risk seviyesini seçin. Sistem otomatik olarak GIAS
              standardına uygun örneklem büyüklüğünü hesaplayacaktır.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
