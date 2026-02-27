import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Shield } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface QAIPChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  finding: any;
}

// QAIP Quality Gates (Based on IIA Standards)
const QUALITY_CHECKS = [
  {
    id: 'evidence',
    label: 'Kanıtlar eklendi ve yeterli',
    description: 'En az 1 kanıt dosyası veya referans eklenmelidir',
    validator: (finding: any) => finding.evidence_files && finding.evidence_files.length > 0
  },
  {
    id: 'criteria',
    label: 'Kriter alanı dolduruldu',
    description: 'Hangi standart/mevzuata göre tespit yapıldı?',
    validator: (finding: any) => finding.criteria && finding.criteria.length > 20
  },
  {
    id: 'root_cause',
    label: 'Kök neden detaylı yazıldı',
    description: 'Sadece "insan hatası" yeterli değil, derin analiz gerekli',
    validator: (finding: any) => finding.cause && finding.cause.length > 50
  },
  {
    id: 'impact',
    label: 'Etki/Sonuç açıklandı',
    description: 'Risk ve potansiyel etkileri belirtilmeli',
    validator: (finding: any) => finding.consequence && finding.consequence.length > 30
  },
  {
    id: 'action',
    label: 'Düzeltici aksiyon önerildi',
    description: 'Çözüm önerisi netleştirilmeli',
    validator: (finding: any) => finding.corrective_action && finding.corrective_action.length > 30
  },
  {
    id: 'risk_score',
    label: 'Risk skoru doğrulandı',
    description: 'Impact ve Likelihood değerlerinin uygunluğu onaylandı',
    validator: (finding: any) => finding.impact >= 1 && finding.likelihood >= 1
  }
];

export const QAIPChecklistModal: React.FC<QAIPChecklistModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  finding
}) => {
  const [manualChecks, setManualChecks] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  // Auto-validation results
  const autoResults = QUALITY_CHECKS.map(check => ({
    ...check,
    passed: check.validator(finding)
  }));

  const allPassed = autoResults.every(r => r.passed);
  const passedCount = autoResults.filter(r => r.passed).length;

  const handleSubmit = () => {
    if (!allPassed) {
      alert('Lütfen tüm kalite kontrol maddelerini sağlayın.');
      return;
    }
    onSubmit();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[201] p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[80vh] flex flex-col pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-white rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Shield size={20} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Kalite Kontrol Listesi</h2>
                <p className="text-xs text-slate-500 mt-0.5">QAIP Quality Gate - IIA Standards</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600">
                İlerleme: {passedCount}/{QUALITY_CHECKS.length}
              </span>
              <span className={cn(
                "text-xs font-bold px-2 py-1 rounded",
                allPassed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              )}>
                {allPassed ? 'Hazır' : 'Eksikler Var'}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-500 rounded-full",
                  allPassed ? "bg-emerald-500" : "bg-indigo-500"
                )}
                style={{ width: `${(passedCount / QUALITY_CHECKS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {autoResults.map((check) => (
              <div
                key={check.id}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all duration-200",
                  check.passed
                    ? "bg-emerald-50/50 border-emerald-200"
                    : "bg-amber-50/50 border-amber-200"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox Icon */}
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all",
                    check.passed
                      ? "bg-emerald-500 text-white"
                      : "bg-white border-2 border-slate-300"
                  )}>
                    {check.passed && <CheckCircle2 size={16} />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={cn(
                        "text-sm font-bold",
                        check.passed ? "text-emerald-900" : "text-slate-700"
                      )}>
                        {check.label}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {check.description}
                    </p>
                    {!check.passed && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 font-medium">
                        <AlertTriangle size={12} />
                        <span>Bu madde sağlanmalı</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-white rounded-lg transition-colors border border-slate-200"
            >
              İptal
            </button>
            <button
              onClick={handleSubmit}
              disabled={!allPassed}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg shadow-lg transition-all active:scale-95",
                allPassed
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed"
              )}
            >
              <CheckCircle2 size={16} />
              İncelemeye Gönder
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
