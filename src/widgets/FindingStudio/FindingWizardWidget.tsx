import React, { useState } from 'react';
import { cn } from '@/shared/utils/cn';
import { DraftPhase } from './phases/Phase1Widget';
import { QAPhase } from './phases/Phase2Widget';
import { Phase3Negotiation } from './phases/Phase3Widget';
import { Phase4Approval } from './phases/Phase4Widget';
import { Phase5Followup } from './phases/Phase5Widget';
import { ChevronRight, LayoutTemplate, ShieldCheck, SearchCode, Stamp, Target } from 'lucide-react';

interface FindingWizardWidgetProps {
  finding: any;
  onUpdate: (field: string, value: any) => void;
  onAdvanceWorkflow?: () => void;
}

const WIZARD_PHASES = [
  { id: '1', label: '1. Taslak', icon: LayoutTemplate },
  { id: '2', label: '2. Kalite', icon: ShieldCheck },
  { id: '3', label: '3. Mutabakat', icon: SearchCode },
  { id: '4', label: '4. Onay', icon: Stamp },
  { id: '5', label: '5. Aksiyon', icon: Target }
];

export const FindingWizardWidget: React.FC<FindingWizardWidgetProps> = ({ finding, onUpdate, onAdvanceWorkflow }) => {
  const [activePhase, setActivePhase] = useState<string>('1');

  // Let's deduce the current active phase from status or let user navigate freely
  // For the sake of the E2E simulation step, mapping `id` to the string '1' - '5'.
  
  return (
    <div className="h-full flex flex-col bg-slate-50 border-r border-slate-200 w-full shadow-[-10px_0_30px_rgba(0,0,0,0.02)] z-10 overflow-hidden">
      
      {/* Wizard Header (Apple Glass Tab Container) */}
      <div className="p-4 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-20">
        <div className="flex bg-slate-100/70 p-1.5 rounded-xl border border-slate-200/50 shadow-inner overflow-x-auto no-scrollbar">
          {WIZARD_PHASES.map((phase) => {
            const isActive = activePhase === phase.id;
            return (
              <button
                key={phase.id}
                onClick={() => setActivePhase(phase.id as any)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all duration-300",
                  isActive 
                    ? "bg-white text-indigo-700 shadow-[0_2px_8px_rgba(79,70,229,0.1)] ring-1 ring-slate-200/50" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                )}
              >
                <phase.icon size={16} className={cn(isActive ? "text-indigo-600" : "text-slate-400")} />
                {phase.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Phase Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-slate-50">
        <div className="max-w-5xl mx-auto relative min-h-full">
          {activePhase === '1' && (
            <div className="animate-in slide-in-from-left-4 fade-in duration-300">
              <DraftPhase finding={finding} onUpdate={onUpdate} />
              <button
                onClick={() => setActivePhase('2')}
                className="w-full mt-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(79,70,229,0.3)] transition-all active:scale-95 group"
              >
                Kalite Kontrolüne Geç (Faz 2)
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {activePhase === '2' && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
              <QAPhase finding={finding} onUpdate={onUpdate} />
              <button
                onClick={() => {
                  onUpdate('status', 'review');
                  if (onAdvanceWorkflow) onAdvanceWorkflow();
                  setActivePhase('3');
                }}
                disabled={finding?.qa_checklist?.length !== 5}
                className={cn(
                  "w-full mt-4 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md group border",
                  finding?.qa_checklist?.length === 5
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-[0_4px_20px_rgba(16,185,129,0.3)] active:scale-95"
                    : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                )}
              >
                Gözden Geçirmeye İlet (Faz 3)
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100 group-hover:w-4 w-0" />
              </button>
            </div>
          )}

          {activePhase === '3' && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
              <Phase3Negotiation finding={finding} onUpdate={onUpdate} />
              <button
                onClick={() => setActivePhase('4')}
                className="w-full mt-4 py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 group"
              >
                Onay Aşamasına Geç (Faz 4)
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {activePhase === '4' && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
              <Phase4Approval finding={finding} onUpdate={onUpdate} />
              <button
                onClick={() => setActivePhase('5')}
                className="w-full mt-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 group"
              >
                Aksiyon Takibine Geç (Faz 5)
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {activePhase === '5' && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
              <Phase5Followup finding={finding} onUpdate={onUpdate} />
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
