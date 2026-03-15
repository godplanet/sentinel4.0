import React, { useState } from 'react';
import { cn } from '@/shared/utils/cn';
import { ChevronRight, ChevronLeft, Save, Shield, Crosshair, Target, AlertCircle, Library, Activity, Info, FileText } from 'lucide-react';
import { RichTextEditor } from '@/shared/ui/RichTextEditor';
import { RootCauseEngine } from '@/features/finding-studio/components/RootCauseEngine';
import { RegulationSelectorModal } from '@/features/finding-studio/components/RegulationSelectorModal';

interface Props {
  finding: any;
  updateField: (field: string, value: any) => void;
  saveFinding: () => void;
}

const STEPS = [
  { id: 'criteria', label: 'Standart / Kriter', icon: Shield, desc: 'Hangi standart veya mevzuat ihlâl edildi?' },
  { id: 'condition', label: 'Mevcut Durum', icon: Crosshair, desc: 'Sahada tam olarak ne tespit ettiniz?' },
  { id: 'cause', label: 'Kök Neden', icon: AlertCircle, desc: 'Bu aykırılık neden ortaya çıktı?' },
  { id: 'consequence', label: 'Olası Etki / Risk', icon: Target, desc: 'Bu durumun yaratacağı riskler nelerdir? Olasılık ve etkiyi puanlayın.' },
  { id: 'corrective_action', label: 'Aksiyon Önerisi', icon: Target, desc: 'Sorunun çözümü için ne tavsiye edersiniz?' }
];

const SEVERITY_COLORS = {
  'CRITICAL': 'text-rose-600 bg-rose-50 border-rose-200 ring-rose-100',
  'HIGH': 'text-orange-600 bg-orange-50 border-orange-200 ring-orange-100',
  'MEDIUM': 'text-amber-600 bg-amber-50 border-amber-200 ring-amber-100',
  'LOW': 'text-emerald-600 bg-emerald-50 border-emerald-200 ring-emerald-100',
  'OBSERVATION': 'text-slate-600 bg-slate-100 border-slate-200 ring-slate-100'
};

export const FindingWizardWidget: React.FC<Props> = ({ finding, updateField, saveFinding }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRegulationModalOpen, setIsRegulationModalOpen] = useState(false);

  const step = STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(s => s + 1);
  };
  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  const impact = finding.impact || 1;
  const likelihood = finding.likelihood || 1;
  const riskScore = impact * likelihood;
  const currentSeverity = finding.severity || (riskScore >= 20 ? 'CRITICAL' : riskScore >= 12 ? 'HIGH' : riskScore >= 6 ? 'MEDIUM' : 'LOW');
  const riskColorClass = SEVERITY_COLORS[currentSeverity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS['LOW'];
  const severityLabel = riskScore >= 20 ? 'KRİTİK (VETO)' : riskScore >= 12 ? 'YÜKSEK' : riskScore >= 6 ? 'ORTA' : 'DÜŞÜK';

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Wizard Header / Progress */}
      <div className="shrink-0 p-5 border-b border-slate-200 bg-white shadow-sm z-10">
        <h2 className="text-2xl font-black text-slate-800 mb-2">Bulgu Asistanı</h2>
        <p className="text-slate-500 mb-4 max-w-2xl">Rehberli adımları takip ederek eksiksiz ve güçlü bir denetim bulgusu oluşturun. Her adım bulgunuzun kalitesini artıracaktır.</p>
        
        <div className="flex items-center gap-2">
          {STEPS.map((s, idx) => {
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-2 flex-1 relative">
                  <button 
                    onClick={() => setCurrentStep(idx)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ring-4 cursor-pointer hover:scale-110",
                      isActive ? "bg-indigo-600 text-white ring-indigo-100" : 
                      isCompleted ? "bg-emerald-500 text-white ring-emerald-50" : "bg-slate-100 text-slate-400 ring-transparent"
                    )}
                  >
                    {idx + 1}
                  </button>
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider text-center", isActive ? "text-indigo-600" : isCompleted ? "text-emerald-600" : "text-slate-400")}>
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={cn("h-1 flex-1 rounded-full transition-all", isCompleted ? "bg-emerald-500" : "bg-slate-200")} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 p-5 overflow-y-auto flex flex-col items-center bg-slate-50/50">
        <div className="w-full max-w-5xl flex gap-8">
          {/* MAIN EDITOR FORM */}
          <div className="flex-1 bg-white rounded-2xl shadow-xl border border-slate-100 p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner">
                  <step.icon size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">{step.label}</h3>
                  <p className="text-slate-500 text-sm mt-1">{step.desc}</p>
                </div>
              </div>
              
              {step.id === 'criteria' && (
                <button
                  onClick={() => setIsRegulationModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-xl font-bold text-xs transition-colors"
                >
                  <Library size={16} /> Kütüphaneden Ekle
                </button>
              )}
            </div>
            <div className="w-full">
 {step.id === 'cause' ? (
 <RootCauseEngine
 data={{
 method: 'five_whys',
 five_whys: finding.cause ? finding.cause.split('\n') : ['', '', '', '', '']
 } as any}
 onChange={(data) => updateField('cause', data.five_whys?.join('\n') || '')}
 />
 ) : (
 <div className="flex flex-col gap-2">
 {step.id === 'criteria' && (
 <div className="flex justify-end mb-2">
 <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
 <FileText size={14} /> Kütüphaneden Kriter Ekle
 </button>
 </div>
 )}
 <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
 <RichTextEditor
 value={finding[step.id] || ''}
 onChange={(val) => updateField(step.id, val)}
 placeholder={`${step.label} için detaylı açıklamayı buraya yazınız...`}
 minHeight="250px"
 />
 </div>
 </div>
 )}
 </div>
 </div>

          {/* RIGHT SIDEBAR (For Risk Engine in Consequence Step) */}
          {step.id === 'consequence' && (
            <div className="w-80 shrink-0 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-2 mb-6">
                <Activity size={18} className="text-slate-400" />
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Risk Motoru
                </h3>
              </div>

              <div className="flex justify-center mb-4 relative">
                <div 
                  className={cn(
                    "w-32 h-32 rounded-full border-[6px] flex flex-col items-center justify-center transition-all duration-500",
                    riskColorClass,
                    riskScore >= 20 ? "animate-pulse shadow-[0_0_20px_rgba(225,29,72,0.4)]" : "shadow-sm"
                  )}
                >
                  <span className="text-3xl font-black tracking-tighter transition-all text-center">
                    {riskScore}
                  </span>
                  <span className="text-[10px] font-bold uppercase mt-1 tracking-wider opacity-80 text-center px-2">
                    {severityLabel}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Impact Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-slate-600">
                    <span>Etki (Impact)</span>
                    <span className="text-indigo-600 font-bold">{impact}</span>
                  </div>
                  <input 
                    type="range" min="1" max="5" step="1"
                    value={impact}
                    onChange={(e) => updateField('impact', parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer transition-colors accent-indigo-600 bg-slate-200"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
                    <span>Önemsiz</span>
                    <span>Felaket</span>
                  </div>
                </div>

                {/* Likelihood Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-slate-600">
                    <span>Olasılık (Likelihood)</span>
                    <span className="text-indigo-600 font-bold">{likelihood}</span>
                  </div>
                  <input 
                    type="range" min="1" max="5" step="1"
                    value={likelihood}
                    onChange={(e) => updateField('likelihood', parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
                    <span>Nadir</span>
                    <span>Kesin</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Controls */}
      <div className="shrink-0 p-6 bg-white border-t border-slate-200 flex justify-between items-center z-10">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent flex items-center gap-2 transition-all"
        >
          <ChevronLeft size={18} /> Önceki Adım
        </button>
        
        {currentStep === STEPS.length - 1 ? (
          <button
            onClick={saveFinding}
            className="px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 flex items-center gap-2 transition-all active:scale-95"
          >
            <Save size={18} /> Kaydet ve Tamamla
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-300 flex items-center gap-2 transition-all active:scale-95"
          >
            Sonraki Adım <ChevronRight size={18} />
          </button>
        )}
      </div>

      <RegulationSelectorModal
        isOpen={isRegulationModalOpen}
        onClose={() => setIsRegulationModalOpen(false)}
        onSelect={(regulation) => {
          const content = `<p><strong>Kriter:</strong> ${regulation.title}</p><p>${regulation.criteria_text}</p>`;
          const currentVal = finding.criteria || '';
          updateField('criteria', currentVal ? currentVal + '<br/>' + content : content);
          setIsRegulationModalOpen(false);
        }}
        findingId={finding.id}
      />
    </div>
  );
};
