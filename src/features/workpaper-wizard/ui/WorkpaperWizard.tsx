/**
 * Çalışma Kağıdı Oluşturma Wizard'ı
 *
 * Manuel çalışma kağıdı oluşturma sihirbazı.
 * AI önerilerini gösterir, müfettiş son halini verir.
 */

import { useState } from 'react';
import {
  X,
  FileText,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Target,
  Layers,
  FileSearch,
} from 'lucide-react';
import type { AuditStep } from '@/entities/execution';

interface WorkpaperWizardProps {
  isOpen: boolean;
  onClose: () => void;
  auditSteps: AuditStep[];
  onCreateWorkpaper: (stepId: string, data: any) => Promise<void>;
}

type WizardStep = 'select-step' | 'ai-suggestions' | 'manual-edit' | 'review';

interface WorkpaperDraft {
  stepId: string;
  type: string;
  objective: string;
  scope: string;
  testCases: string[];
}

const AI_SUGGESTIONS = {
  'IT-GEN-001': {
    objective: 'Sistem erişim kontrollerinin etkinliğini değerlendirmek ve ayrıcalıklı kullanıcı sayısının kabul edilebilir seviyelerde olduğunu doğrulamak.',
    scope: 'Tüm aktif kullanıcı hesapları, admin hesapları ve ayrıcalıklı erişim yetkileri.',
    testCases: [
      'Admin kullanıcı sayısının toplam kullanıcıların %5\'ini aşmadığını doğrula',
      'Ayrıcalıklı erişim yetkilerinin iş gereksinimleri ile uyumlu olduğunu test et',
      'Kullanıcı hesaplarının aktif/pasif durumlarını incele',
      'Segregation of duties (SoD) matrisini gözden geçir',
    ],
  },
  'IT-GEN-002': {
    objective: 'Şifre politikası kontrollerinin kurumsal standartlara uygun olarak yapılandırıldığını ve etkin çalıştığını doğrulamak.',
    scope: 'Tüm sistemler için tanımlı şifre politikaları ve ilgili kontroller.',
    testCases: [
      'Minimum şifre uzunluğunun 12 karakter olduğunu doğrula',
      'Şifre karmaşıklığı gereksinimlerinin aktif olduğunu test et',
      'Şifre geçerlilik süresinin 90 günü aşmadığını kontrol et',
      'Hesap kilitleme mekanizmasının (5 başarısız deneme sonrası) çalıştığını doğrula',
    ],
  },
};

export function WorkpaperWizard({ isOpen, onClose, auditSteps, onCreateWorkpaper }: WorkpaperWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('select-step');
  const [selectedStep, setSelectedStep] = useState<AuditStep | null>(null);
  const [draft, setDraft] = useState<WorkpaperDraft>({
    stepId: '',
    type: 'test_of_design',
    objective: '',
    scope: '',
    testCases: [],
  });
  const [isCreating, setIsCreating] = useState(false);
  const [useAISuggestion, setUseAISuggestion] = useState(true);

  if (!isOpen) return null;

  const handleSelectStep = (step: AuditStep) => {
    setSelectedStep(step);
    setDraft((prev) => ({ ...prev, stepId: step.id }));
    setCurrentStep('ai-suggestions');

    // Load AI suggestions if available
    const suggestion = AI_SUGGESTIONS[step.step_code as keyof typeof AI_SUGGESTIONS];
    if (suggestion && useAISuggestion) {
      setDraft((prev) => ({
        ...prev,
        objective: suggestion.objective,
        scope: suggestion.scope,
        testCases: suggestion.testCases,
      }));
    }
  };

  const handleRejectAI = () => {
    setDraft((prev) => ({
      ...prev,
      objective: '',
      scope: '',
      testCases: [],
    }));
    setCurrentStep('manual-edit');
  };

  const handleAcceptAI = () => {
    setCurrentStep('manual-edit');
  };

  const handleCreateWorkpaper = async () => {
    try {
      setIsCreating(true);
      await onCreateWorkpaper(draft.stepId, {
        type: draft.type,
        objective: draft.objective,
        scope: draft.scope,
        test_results: draft.testCases.reduce((acc, _, idx) => {
          acc[`test_${idx + 1}`] = 'na';
          return acc;
        }, {} as Record<string, string>),
        conclusion: '',
        comments: [],
      });
      onClose();
      // Reset wizard
      setCurrentStep('select-step');
      setSelectedStep(null);
      setDraft({
        stepId: '',
        type: 'test_of_design',
        objective: '',
        scope: '',
        testCases: [],
      });
    } catch (error) {
      console.error('Failed to create workpaper:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'select-step', label: 'Adım Seç' },
      { id: 'ai-suggestions', label: 'AI Önerisi' },
      { id: 'manual-edit', label: 'Düzenle' },
      { id: 'review', label: 'Gözden Geçir' },
    ];

    const currentIndex = steps.findIndex((s) => s.id === currentStep);

    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center gap-2 ${idx <= currentIndex ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                idx < currentIndex
                  ? 'bg-green-500 text-white'
                  : idx === currentIndex
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {idx < currentIndex ? <CheckCircle2 size={16} /> : idx + 1}
              </div>
              <span className="text-sm font-medium text-slate-700">{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <ChevronRight className="mx-2 text-slate-400" size={16} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <FileText className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Yeni Çalışma Kağıdı Oluştur</h2>
              <p className="text-sm text-slate-600">AI destekli çalışma kağıdı oluşturma sihirbazı</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-slate-600" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="p-6 border-b border-slate-200">
          {renderStepIndicator()}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Select Audit Step */}
          {currentStep === 'select-step' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="text-blue-600" size={20} />
                <h3 className="text-lg font-bold text-slate-900">Denetim Adımı Seçin</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {auditSteps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => handleSelectStep(step)}
                    className="p-4 bg-white rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:shadow-md transition-all text-left group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-500 mb-1">{step.step_code}</p>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {step.title}
                        </p>
                        {step.description && (
                          <p className="text-xs text-slate-600 mt-2">{step.description}</p>
                        )}
                      </div>
                      <ChevronRight className="text-slate-400 group-hover:text-blue-600 transition-colors" size={20} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: AI Suggestions */}
          {currentStep === 'ai-suggestions' && selectedStep && (
            <div className="space-y-6">
              <div className="glass-card p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Sentinel AI Önerisi</h3>
                    <p className="text-sm text-slate-600">
                      AI asistanınız bu denetim adımı için aşağıdaki çalışma kağıdını önerdi. İnceleyip düzenleyebilir veya sıfırdan başlayabilirsiniz.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <Target size={14} />
                      Amaç
                    </label>
                    <div className="p-4 bg-white rounded-lg border border-blue-200">
                      <p className="text-sm text-slate-700">{draft.objective}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Kapsam</label>
                    <div className="p-4 bg-white rounded-lg border border-blue-200">
                      <p className="text-sm text-slate-700">{draft.scope}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Önerilen Test Adımları</label>
                    <div className="space-y-2">
                      {draft.testCases.map((testCase, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-lg border border-blue-200 flex items-start gap-2">
                          <CheckCircle2 className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                          <p className="text-sm text-slate-700">{testCase}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRejectAI}
                  className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  Önerileri Reddet (Sıfırdan Başla)
                </button>
                <button
                  onClick={handleAcceptAI}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  Önerileri Kabul Et ve Düzenle
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Manual Edit */}
          {currentStep === 'manual-edit' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileSearch className="text-blue-600" size={20} />
                <h3 className="text-lg font-bold text-slate-900">Çalışma Kağıdını Düzenleyin</h3>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Tür</label>
                <select
                  value={draft.type}
                  onChange={(e) => setDraft({ ...draft, type: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 focus:border-blue-500 focus:outline-none bg-white"
                >
                  <option value="test_of_design">Test of Design</option>
                  <option value="test_of_operating_effectiveness">Test of Operating Effectiveness</option>
                  <option value="walkthrough">Walkthrough</option>
                  <option value="custom">Özel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Amaç</label>
                <textarea
                  value={draft.objective}
                  onChange={(e) => setDraft({ ...draft, objective: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 focus:border-blue-500 focus:outline-none bg-white"
                  placeholder="Denetim amacını açıklayın..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Kapsam</label>
                <textarea
                  value={draft.scope}
                  onChange={(e) => setDraft({ ...draft, scope: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 focus:border-blue-500 focus:outline-none bg-white"
                  placeholder="Denetim kapsamını belirtin..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setCurrentStep('ai-suggestions')}
                  className="px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  Geri
                </button>
                <button
                  onClick={handleCreateWorkpaper}
                  disabled={!draft.objective || !draft.scope || isCreating}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Oluşturuluyor...' : 'Çalışma Kağıdını Oluştur'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
