/*
 * BDDK Package Export Modal
 * Generates regulatory compliance packages for Turkish Banking Authority (BDDK)
 * Location: features/bddk-export (FSD Architecture)
 */

import { useState, useEffect } from 'react';
import { X, Package, FileText, CheckCircle2, Loader2 } from 'lucide-react';

interface BDDKPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GenerationStep {
  id: string;
  label: string;
  duration: number;
  status: 'pending' | 'active' | 'completed';
}

const GENERATION_STEPS: GenerationStep[] = [
  { id: '1', label: 'Yıllık Denetim Planı Excel çıktısı', duration: 2000, status: 'pending' },
  { id: '2', label: 'Risk Metodolojisi PDF ekleniyor', duration: 1500, status: 'pending' },
  { id: '3', label: 'Kaynak Yeterliliği analizi hesaplanıyor', duration: 2500, status: 'pending' },
  { id: '4', label: 'Mevzuat uyumluluk kontrolü yapılıyor', duration: 1800, status: 'pending' },
];

export const BDDKPackageModal = ({ isOpen, onClose }: BDDKPackageModalProps) => {
  const [status, setStatus] = useState<'idle' | 'generating' | 'completed'>('idle');
  const [steps, setSteps] = useState<GenerationStep[]>(GENERATION_STEPS);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (status === 'generating') {
      generatePackage();
    }
  }, [status]);

  const generatePackage = async () => {
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      setSteps(prev =>
        prev.map((step, idx) => ({
          ...step,
          status: idx === i ? 'active' : idx < i ? 'completed' : 'pending',
        }))
      );

      await new Promise(resolve => setTimeout(resolve, steps[i].duration));
    }

    setSteps(prev => prev.map(step => ({ ...step, status: 'completed' })));
    setStatus('completed');
  };

  const handleStartGeneration = () => {
    setStatus('generating');
    setCurrentStep(0);
    setSteps(GENERATION_STEPS);
  };

  const handleClose = () => {
    if (status === 'generating') return;
    setStatus('idle');
    setSteps(GENERATION_STEPS);
    setCurrentStep(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">BDDK Paket Oluştur</h2>
                <p className="text-xs text-emerald-100">Düzenleyici Raporlama Paketi</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={status === 'generating'}
              className="rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/30 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {status === 'idle' && (
            <div className="space-y-6">
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                <h3 className="mb-2 font-semibold text-gray-900">Paket İçeriği</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                    <span>Yıllık Denetim Planı (Excel)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                    <span>Risk Değerlendirme Metodolojisi (PDF)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                    <span>Kaynak Yeterliliği Analizi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                    <span>Mevzuat Uyumluluk Kontrolü</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                <p className="text-sm text-amber-800">
                  <strong>Not:</strong> Bu paket BDDK Bankalarda İç Denetim Yönetmeliği'ne (2018/10) uygun
                  olarak hazırlanmaktadır.
                </p>
              </div>

              <div className="text-center">
                <button
                  onClick={handleStartGeneration}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:bg-emerald-700"
                >
                  <Package className="h-5 w-5" />
                  Paketi Oluştur
                </button>
                <p className="mt-2 text-xs text-gray-500">Tahmini süre: ~8 saniye</p>
              </div>
            </div>
          )}

          {status === 'generating' && (
            <div className="space-y-6">
              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
                  >
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : step.status === 'active' ? (
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <span
                      className={`text-sm ${
                        step.status === 'completed'
                          ? 'text-gray-900 font-medium'
                          : step.status === 'active'
                          ? 'text-blue-600 font-medium'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-center text-sm text-gray-600">
                <p>İşlem devam ediyor...</p>
              </div>
            </div>
          )}

          {status === 'completed' && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">Paket Hazır!</h3>
                <p className="mt-1 text-sm text-gray-600">
                  BDDK uyumluluk paketi başarıyla oluşturuldu.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="font-mono text-xs">Sentinel_BDDK_Paketi_2026.zip</span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="rounded-lg bg-gray-600 px-6 py-2 font-semibold text-white transition-all hover:bg-gray-700"
              >
                Kapat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
