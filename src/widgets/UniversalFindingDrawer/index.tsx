import { useState } from 'react';
import {
  X, MessageSquare, History, Network, ShieldCheck,
  Sparkles, SlidersHorizontal, Activity // GÖREV 3: Activity icon
} from 'lucide-react';
import clsx from 'clsx';

// ALT BİLEŞENLERİN İMPORTLARI
import { ChatPanel } from './components/ChatPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { RCAPanel } from './components/RCAPanel';
import { ReviewPanel } from './components/ReviewPanel';
import { AIPanel } from './components/AIPanel';
import { ActivityLogPanel } from './components/ActivityLogPanel'; // GÖREV 3

// TİPLER
export type DrawerTab = 'chat' | 'ai' | 'rca' | 'review' | 'history' | 'activity' | null; // GÖREV 3: activity eklendi

interface UniversalFindingDrawerProps {
  findingId: string | null;
  isOpen?: boolean;
  defaultTab?: DrawerTab;
  onClose?: () => void;

  currentViewMode?: 'zen' | 'studio' | 'glass';
  onViewModeChange?: (mode: 'zen' | 'studio' | 'glass') => void;

  onApplyAIDraft?: (draft: any) => void;
  onApplyRCA?: (html: string, rawData: any) => void;
  onApplyContent?: (section: string, content: string) => void;
}

export function UniversalFindingDrawer({
  findingId,
  isOpen,
  defaultTab = 'ai',
  onClose,
  currentViewMode,
  onViewModeChange,
  onApplyAIDraft,
  onApplyRCA,
  onApplyContent
}: UniversalFindingDrawerProps) {

  const [activeTab, setActiveTab] = useState<DrawerTab>(defaultTab);

  if (isOpen === false) return null;

  return (
      <div className={clsx(
        "flex flex-col h-full border-l",
        currentViewMode === 'glass'
            ? "bg-slate-900/95 backdrop-blur-xl border-white/20"
            : "bg-white border-slate-200"
      )}>
        
        {/* HEADER */}
        <div className={clsx(
            "h-16 px-4 border-b flex items-center justify-between shrink-0 rounded-tl-2xl z-10",
            currentViewMode === 'glass' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
        )}>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <TabButton 
                  active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} 
                  icon={<Sparkles size={16} className={activeTab === 'ai' ? "text-purple-600" : ""} />} 
                  label="Sentinel AI" 
                  isGlass={currentViewMode === 'glass'}
                />
                <TabButton 
                  active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} 
                  icon={<MessageSquare size={16} className={activeTab === 'chat' ? "text-blue-600" : ""} />} 
                  label="Müzakere" 
                  isGlass={currentViewMode === 'glass'}
                />
                <TabButton 
                  active={activeTab === 'rca'} onClick={() => setActiveTab('rca')} 
                  icon={<Network size={16} className={activeTab === 'rca' ? "text-emerald-600" : ""} />} 
                  label="Kök Neden" 
                  isGlass={currentViewMode === 'glass'}
                />
                <TabButton 
                  active={activeTab === 'review'} onClick={() => setActiveTab('review')} 
                  icon={<ShieldCheck size={16} className={activeTab === 'review' ? "text-orange-600" : ""} />} 
                  label="Gözetim" 
                  isGlass={currentViewMode === 'glass'}
                />
                <TabButton
                  active={activeTab === 'history'} onClick={() => setActiveTab('history')}
                  icon={<History size={16} className={activeTab === 'history' ? "text-slate-600" : ""} />}
                  label="Tarihçe"
                  isGlass={currentViewMode === 'glass'}
                />
                <TabButton
                  active={activeTab === 'activity'} onClick={() => setActiveTab('activity')}
                  icon={<Activity size={16} className={activeTab === 'activity' ? "text-teal-600" : ""} />}
                  label="Denetim İzi"
                  isGlass={currentViewMode === 'glass'}
                />
            </div>
            
            <button onClick={onClose} className={clsx("p-2 rounded-full transition-colors ml-2 shrink-0", currentViewMode === 'glass' ? "text-white/60 hover:text-white hover:bg-white/10" : "text-slate-400 hover:text-red-500 hover:bg-red-50")}>
                <X size={20} />
            </button>
        </div>

        {/* OPSİYONEL: GÖRÜNÜM DEĞİŞTİRİCİ (VIEW SWITCHER) */}
        {onViewModeChange && currentViewMode && (
          <div className={clsx("px-6 py-2 flex items-center justify-between border-b", currentViewMode === 'glass' ? "bg-white/5 border-white/10" : "bg-blue-50/50 border-blue-100")}>
             <span className={clsx("text-xs font-bold flex items-center gap-1", currentViewMode === 'glass' ? "text-blue-300" : "text-blue-800")}>
               <SlidersHorizontal size={14} /> Okuma Modu Değiştir
             </span>
             <div className="flex gap-2">
                <button onClick={() => onViewModeChange('zen')} className={clsx("text-xs font-bold px-2 py-1 rounded", currentViewMode === 'zen' ? "bg-blue-600 text-white" : "text-blue-600 hover:bg-blue-100 bg-white")}>Zen</button>
                <button onClick={() => onViewModeChange('glass')} className={clsx("text-xs font-bold px-2 py-1 rounded", currentViewMode === 'glass' ? "bg-blue-500 text-white" : "text-blue-600 hover:bg-blue-100 bg-white")}>Glass</button>
             </div>
          </div>
        )}

        {/* İÇERİK ALANI */}
        <div className={clsx(
            "flex-1 overflow-y-auto custom-scrollbar relative",
            currentViewMode === 'glass' ? "bg-transparent text-slate-200" : "bg-white text-slate-800"
        )}>
            <div className="p-6 h-full">
              
              {/* 1. SENTINEL AI PANELİ */}
              {activeTab === 'ai' && (
                <AIPanel 
                  findingId={findingId} 
                  onApplyDraft={(draft) => {
                    console.log('AI Draft Applied:', draft);
                    if (onApplyAIDraft) onApplyAIDraft(draft);
                  }} 
                />
              )}

              {/* 2. MÜZAKERE PANELİ */}
              {activeTab === 'chat' && (
                <ChatPanel findingId={findingId} />
              )}

              {/* 3. KÖK NEDEN PANELİ */}
              {activeTab === 'rca' && (
                <RCAPanel
                  findingId={findingId}
                  onApplyAnalysis={(html, raw) => {
                    console.log('RCA Applied:', raw);
                    // GÖREV 2: Kök Neden Analizini Editörün "Neden" Sekmesine Aktar
                    if (onApplyContent) {
                      onApplyContent('cause', html);
                    }
                    if (onApplyRCA) onApplyRCA(html, raw);
                  }} 
                />
              )}

              {/* 4. GÖZETİM VE ONAY PANELİ */}
              {activeTab === 'review' && (
                <ReviewPanel 
                  findingId={findingId} 
                  isReviewer={true} // Gerçek uygulamada user role'den gelecek
                />
              )}

              {/* 5. TARİHÇE PANELİ */}
              {activeTab === 'history' && (
                <HistoryPanel findingId={findingId} />
              )}

              {/* 6. GÖREV 3: DENETİM İZİ (ACTIVITY LOG) */}
              {activeTab === 'activity' && (
                <ActivityLogPanel findingId={findingId} />
              )}

            </div>
        </div>

      </div>
  );
}

// YARDIMCI BİLEŞEN: SEKME BUTONU
function TabButton({ active, onClick, icon, label, isGlass }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; isGlass: boolean }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0",
        active 
          ? isGlass 
            ? "bg-white/15 text-white shadow-sm ring-1 ring-white/20" 
            : "bg-white text-slate-800 shadow-sm ring-1 ring-slate-200" 
          : isGlass
            ? "text-white/60 hover:text-white hover:bg-white/5"
            : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}