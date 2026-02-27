import { useState, useEffect } from 'react';
import { X, Calculator, Info, CheckCircle } from 'lucide-react';
import type { SamplingConfig, SamplingMethod } from '@/entities/workpaper/model/types';

interface SamplingConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig?: SamplingConfig;
  onSave: (config: SamplingConfig) => void;
}

export const SamplingConfigModal = ({
  isOpen,
  onClose,
  currentConfig,
  onSave,
}: SamplingConfigModalProps) => {
  const [method, setMethod] = useState<SamplingMethod>(currentConfig?.method || 'JUDGMENTAL');
  const [populationSize, setPopulationSize] = useState<number>(
    currentConfig?.population_size || 0
  );
  const [sampleSize, setSampleSize] = useState<number>(currentConfig?.sample_size || 0);
  const [rationale, setRationale] = useState<string>(currentConfig?.rationale || '');

  useEffect(() => {
    if (currentConfig) {
      setMethod(currentConfig.method);
      setPopulationSize(currentConfig.population_size);
      setSampleSize(currentConfig.sample_size);
      setRationale(currentConfig.rationale);
    }
  }, [currentConfig]);

  const samplePercentage =
    populationSize > 0 ? ((sampleSize / populationSize) * 100).toFixed(2) : '0.00';

  const handleSave = () => {
    const config: SamplingConfig = {
      method,
      population_size: populationSize,
      sample_size: sampleSize,
      rationale,
    };
    onSave(config);
    onClose();
  };

  const isValid = populationSize >= 0 && sampleSize >= 0 && sampleSize <= populationSize && rationale.trim().length > 0;

  const samplingMethods = [
    {
      value: 'JUDGMENTAL' as SamplingMethod,
      label: 'Yargısal (Judgmental)',
      description: 'Denetçi tecrübesine dayalı, risk odaklı seçim',
    },
    {
      value: 'STATISTICAL' as SamplingMethod,
      label: 'İstatistiksel (Statistical)',
      description: 'Rastgele örnekleme, güven aralığı ile',
    },
    {
      value: 'CENSUS' as SamplingMethod,
      label: 'Tam Sayım (Census)',
      description: 'Tüm popülasyon test edilir',
    },
    {
      value: 'ANALYTICAL' as SamplingMethod,
      label: 'Analitik (Analytical)',
      description: 'Veri analitiği ve eşik değer testleri',
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Örneklem Metodolojisi
                </h2>
                <p className="text-xs text-gray-600">GIAS 14.1 - Sampling Documentation</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/50 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    GIAS 14.1 Gereksinimi
                  </p>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Örnekleme metodolojisi, popülasyon büyüklüğü, örnek boyutu ve seçim
                    gerekçesi dokümante edilmelidir.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Örnekleme Yöntemi
              </label>
              <div className="grid grid-cols-2 gap-3">
                {samplingMethods.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMethod(m.value)}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      method === m.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{m.label}</span>
                      {method === m.value && (
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{m.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Popülasyon Büyüklüğü
                </label>
                <input
                  type="number"
                  min="0"
                  value={populationSize}
                  onChange={(e) => setPopulationSize(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Örn: 1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Örnek Büyüklüğü
                </label>
                <input
                  type="number"
                  min="0"
                  max={populationSize}
                  value={sampleSize}
                  onChange={(e) => setSampleSize(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Örn: 50"
                />
              </div>
            </div>

            {populationSize > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Örnekleme Oranı:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-600">{samplePercentage}%</span>
                    <span className="text-xs text-slate-600">
                      ({sampleSize} / {populationSize})
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Metodoloji Gerekçesi *
              </label>
              <textarea
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Örnekleme yöntemini ve örnek büyüklüğünü neden seçtiğinizi açıklayın. Risk değerlendirmesi, kaynak kısıtları, popülasyon karakteristikleri gibi faktörleri belirtin..."
              />
              <p className="text-xs text-gray-500 mt-1">{rationale.length} karakter</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
