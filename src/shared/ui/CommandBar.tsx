import { useEffect } from 'react';
import { useUIStore } from '@/shared/stores/ui-store';
import { Brain, Calculator, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CommandBar = () => {
  const { isCmdBarOpen, setCmdBarOpen, aiMode, setAIMode, aiQuery, setAIQuery } = useUIStore();

  // Klavye Kısayolu: Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdBarOpen(!isCmdBarOpen);
      }
      if (e.key === 'Escape') setCmdBarOpen(false);
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isCmdBarOpen, setCmdBarOpen]);

  // Simüle Edilmiş "Niyet Analizi" (Intent Detection)
  useEffect(() => {
    if (aiQuery.length > 2) {
      const lower = aiQuery.toLowerCase();
      // Matematiksel kelimeler -> Hesaplamalı Mod (Turuncu)
      if (lower.match(/hesapla|risk|oran|limit|faiz|[0-9]/)) {
        setAIMode('COMPUTATIONAL');
      } 
      // Sözel kelimeler -> Yaratıcı Mod (Mavi)
      else if (lower.match(/özetle|rapor|bul|analiz|nedir/)) {
        setAIMode('GENERATIVE');
      } else {
        setAIMode('IDLE');
      }
    } else {
      setAIMode('IDLE');
    }
  }, [aiQuery, setAIMode]);

  if (!isCmdBarOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" 
        onClick={() => setCmdBarOpen(false)}
      />

      {/* The Brain Interface */}
      <div className={cn(
        "relative w-full max-w-2xl transform transition-all duration-300 scale-100",
        "glass-panel rounded-2xl shadow-2xl border-0 ring-1",
        aiMode === 'GENERATIVE' ? "ring-indigo-500/50 shadow-indigo-500/20" : 
        aiMode === 'COMPUTATIONAL' ? "ring-amber-500/50 shadow-amber-500/20" : 
        "ring-white/20"
      )}>
        
        {/* Animated Glow Effect */}
        <div className={cn(
          "absolute -inset-1 rounded-2xl opacity-30 blur-xl transition-all duration-500",
          aiMode === 'GENERATIVE' && "bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-pulse-slow",
          aiMode === 'COMPUTATIONAL' && "bg-gradient-to-r from-amber-500 to-orange-500 opacity-40",
          aiMode === 'IDLE' && "bg-slate-400/10"
        )} />

        <div className="relative flex flex-col overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl">
          
          {/* Input Area */}
          <div className="flex items-center px-4 py-4 border-b border-slate-100/50">
            <div className="mr-4">
              {aiMode === 'GENERATIVE' ? (
                <Brain className="w-6 h-6 text-indigo-600 animate-pulse" />
              ) : aiMode === 'COMPUTATIONAL' ? (
                <Calculator className="w-6 h-6 text-amber-600 animate-pulse" />
              ) : (
                <Search className="w-6 h-6 text-slate-400" />
              )}
            </div>
            
            <input
              autoFocus
              className="flex-1 text-xl bg-transparent outline-none placeholder:text-slate-400 text-slate-800 font-medium"
              placeholder={aiMode === 'GENERATIVE' ? "Sentinel'e sorun..." : aiMode === 'COMPUTATIONAL' ? "Hesaplama yapın..." : "Sentinel AI..."}
              value={aiQuery}
              onChange={(e) => setAIQuery(e.target.value)}
            />
            
            <button onClick={() => setCmdBarOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Mode Indicator Footer */}
          <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-wider font-medium">
            <div className="flex items-center gap-2">
              <span className={cn(
                "w-2 h-2 rounded-full",
                aiMode === 'GENERATIVE' ? "bg-indigo-500" : 
                aiMode === 'COMPUTATIONAL' ? "bg-amber-500" : "bg-slate-300"
              )} />
              {aiMode} MODE ACTIVE
            </div>
            <div className="flex gap-2 font-sans normal-case">
              <span className="bg-white border px-1 rounded">↵ Enter</span> to execute
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};