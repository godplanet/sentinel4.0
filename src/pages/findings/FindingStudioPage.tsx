import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Loader2,
  Sparkles,
  History,
  MessageSquare,
  FileText,
  Settings,
  Scale,
  Search,
  GitPullRequestArrow,
  Zap,
  Target,
  Sun,
  BookOpen,
  ScrollText,
  Paperclip,
  Trash2,
  FileText as FileIcon,
  Printer,    // YENİ: Yazıcı İkonu
  Download    // YENİ: İndirme İkonu (Opsiyonel)
} from 'lucide-react';

// --- Utils & Hooks ---
import { cn } from '@/shared/utils/cn';
import { useFindingStudio } from '@/features/finding-studio/hooks/useFindingStudio';
import { useUIStore } from '@/shared/stores/ui-store';

// --- Shared UI ---
import { RichTextEditor } from '@/shared/ui/RichTextEditor';
import { FileUploader } from '@/shared/ui/FileUploader';

// --- WIDGETS ---
import { FindingFormWidget } from '@/features/finding-studio/components/FindingFormWidget';
import { ZenEditor } from '@/features/finding-studio/components/ZenEditor';
import { ZenReaderWidget } from '@/features/finding-studio/components/ZenReaderWidget';
import { NegotiationBoardWidget } from '@/features/finding-studio/components/NegotiationBoardWidget';
import { UniversalFindingDrawer } from '@/widgets/UniversalFindingDrawer';

// ============================================================================
// DYNAMIC COLOR MAP
// ============================================================================
const BRAND_COLORS: Record<string, { bg: string, text: string, border: string, ring: string, light: string }> = {
  blue: { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-600', ring: 'ring-blue-200', light: 'bg-blue-50' },
  indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-600', ring: 'ring-indigo-200', light: 'bg-indigo-50' },
  rose: { bg: 'bg-rose-600', text: 'text-rose-600', border: 'border-rose-600', ring: 'ring-rose-200', light: 'bg-rose-50' },
  emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-600', ring: 'ring-emerald-200', light: 'bg-emerald-50' },
  slate: { bg: 'bg-slate-800', text: 'text-slate-800', border: 'border-slate-800', ring: 'ring-slate-200', light: 'bg-slate-100' },
  violet: { bg: 'bg-violet-600', text: 'text-violet-600', border: 'border-violet-600', ring: 'ring-violet-200', light: 'bg-violet-50' },
  amber: { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-600', ring: 'ring-amber-200', light: 'bg-amber-50' },
};

const EDITOR_TABS = [
  { id: 'criteria', label: '1. KRİTER', icon: Scale, placeholder: 'Standardı veya mevzuatı giriniz...' },
  { id: 'condition', label: '2. TESPİT', icon: Search, placeholder: 'Mevcut durumu detaylandırın...' },
  { id: 'cause', label: '3. KÖK NEDEN', icon: GitPullRequestArrow, placeholder: 'Bu durum neden oluştu?' },
  { id: 'consequence', label: '4. ETKİ', icon: Zap, placeholder: 'Risk ve etkileri nelerdir?' },
  { id: 'corrective_action', label: '5. ÖNERİ', icon: Target, placeholder: 'Çözüm önerisi nedir?' },
];

export const FindingStudioPage: React.FC = () => {
  // 1. Data & Logic
  const { finding, mode, setMode, isVetoed, isLoading, isSaving, saveFinding, updateField } = useFindingStudio();

  // 2. UI State
  const { isSidebarOpen, sidebarColor } = useUIStore();
  const navigate = useNavigate();
  
  // Local States
  const [activeTab, setActiveTab] = useState('criteria');
  const [warmth, setWarmth] = useState(10);
  const [zenLayout, setZenLayout] = useState<'flow' | 'book'>('book');
  const [isWarmthOpen, setIsWarmthOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'chat' | 'history' | 'files'>('chat');
  
  // Evidence State
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  
  // Theme
  const theme = BRAND_COLORS[sidebarColor] || BRAND_COLORS.indigo;

  // Background Styles
  const pageStyle = useMemo(() => {
    return {};
  }, []);

  const toggleDrawer = (tab: any) => {
    if (isDrawerOpen && drawerTab === tab) setIsDrawerOpen(false);
    else { setDrawerTab(tab); setIsDrawerOpen(true); }
  };

  const handleEvidenceUpload = (files: File[]) => {
    setEvidenceFiles(prev => [...prev, ...files]);
  };

  if (isLoading || !finding) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className={cn("animate-spin mb-4", theme.text)} size={40} />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Stüdyo Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "flex flex-col h-[calc(100vh-1rem)] w-full overflow-hidden transition-colors duration-500 ease-in-out",
        mode === 'zen' ? "bg-slate-50" : "bg-slate-50 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white via-slate-50 to-slate-100"
      )}
    >

      {/* ================= HEADER ================= */}
      <header className={cn(
        "shrink-0 h-16 flex items-center justify-between px-6 z-30 transition-all",
        mode === 'zen' 
          ? "bg-transparent border-b border-transparent" 
          : "bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm"
      )}>
        
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full text-slate-400 hover:bg-black/5 hover:text-slate-700 transition-colors">
            <ArrowLeft size={20} />
          </button>
          
          <div className="h-6 w-px bg-slate-300/50" />

          <div>
            <div className="flex items-center gap-2">
              <span className={cn("font-mono text-[10px] font-bold uppercase tracking-widest", theme.text)}>
                #{finding.id === 'new' ? 'DRAFT' : finding.id}
              </span>
              {isVetoed && (
                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-600 text-[9px] font-bold border border-rose-200 animate-pulse">
                  KRİTİK
                </span>
              )}
            </div>
            <h1 className="text-sm font-semibold text-slate-800 truncate max-w-md">
              {finding.title || 'İsimsiz Taslak'}
            </h1>
          </div>
        </div>

        {/* CENTER: Mode Switcher */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex bg-slate-100/50 p-1 rounded-lg border border-slate-200/50 backdrop-blur-sm shadow-inner">
          {(['edit', 'zen', 'negotiation'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "px-4 py-1.5 text-xs font-semibold rounded-md capitalize transition-all flex items-center gap-2",
                mode === m 
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-black/5" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              )}
            >
              {m === 'edit' && <Settings size={14} />}
              {m === 'zen' && <BookOpen size={14} />}
              {m === 'negotiation' && <CheckCircle2 size={14} />}
              {m}
            </button>
          ))}
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-3">
          
          {/* Zen Controls */}
          {mode === 'zen' && (
            <div className="flex items-center gap-1 bg-white/80 p-1 rounded-full border border-slate-200 backdrop-blur-sm shadow-sm">
              
              <button 
                onClick={() => setZenLayout('flow')} 
                className={cn(
                  "p-2 rounded-full transition-colors", 
                  zenLayout === 'flow' ? "bg-slate-100 text-indigo-600" : "text-slate-400 hover:text-slate-600"
                )}
                title="Akış Görünümü"
              >
                <ScrollText size={16} />
              </button>
              
              <button 
                onClick={() => setZenLayout('book')} 
                className={cn(
                  "p-2 rounded-full transition-colors", 
                  zenLayout === 'book' ? "bg-slate-100 text-indigo-600" : "text-slate-400 hover:text-slate-600"
                )}
                title="Kitap Görünümü"
              >
                <BookOpen size={16} />
              </button>

              <div className="w-px h-4 bg-slate-200 mx-1" />

              <div className="relative">
                <button 
                  onClick={() => setIsWarmthOpen(!isWarmthOpen)}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isWarmthOpen ? "text-amber-600 bg-amber-50" : "text-slate-400 hover:text-amber-500"
                  )}
                  title="Sıcaklık Ayarı"
                >
                  <Sun size={18} />
                </button>
                
                {isWarmthOpen && (
                  <div className="absolute top-full right-0 mt-3 p-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 w-64 z-50 animate-in slide-in-from-top-2 fade-in duration-200 ring-1 ring-black/5">
                    <div className="flex items-center gap-3">
                      <Sun size={14} className="text-amber-500" />
                      <input 
                        type="range" min="0" max="50" 
                        value={warmth} onChange={(e) => setWarmth(parseInt(e.target.value))}
                        className="flex-1 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Edit Actions */}
          {mode === 'edit' && (
            <button
              onClick={saveFinding}
              disabled={isSaving}
              className={cn(
                "flex items-center gap-2 px-5 py-2 text-white text-sm font-medium rounded-lg shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-70",
                theme.bg,
                "hover:brightness-110"
              )}
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          )}

          {/* Negotiation Actions */}
          {mode === 'negotiation' && (
            <button className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-lg shadow-emerald-200 transition-all active:scale-95">
              <CheckCircle2 size={16} /> Onayla
            </button>
          )}
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* --- MOD A: EDIT (GLASS COCKPIT) --- */}
        {mode === 'edit' && (
          <main className="flex-1 flex gap-6 p-6 h-full overflow-hidden">
            
            {/* LEFT: Tabbed Editor */}
            <div className="flex-1 bg-white/60 backdrop-blur-lg rounded-2xl border border-white/40 shadow-sm flex flex-col overflow-hidden relative group">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-slate-200/30 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-100/30 transition-colors duration-1000" />
              
              {/* Tabs */}
              <div className="flex items-center px-4 pt-3 border-b border-slate-200/50 gap-2 overflow-x-auto no-scrollbar z-10">
                {EDITOR_TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const hasContent = finding[tab.id] && finding[tab.id].length > 10;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wide rounded-t-lg transition-all min-w-max border-b-2",
                        isActive 
                          ? cn("bg-white/80 text-slate-800 shadow-sm", `border-${sidebarColor}-600`) 
                          : "text-slate-500 border-transparent hover:bg-white/40 hover:text-slate-700"
                      )}
                      style={isActive ? { borderColor: `var(--color-${sidebarColor}-600)` } : {}}
                    >
                      <tab.icon size={14} className={cn(isActive ? theme.text : "text-slate-400")} />
                      {tab.label}
                      {hasContent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1" />}
                    </button>
                  );
                })}
              </div>

              {/* Editor Canvas */}
              <div className="flex-1 overflow-y-auto p-8 bg-white/40 z-10 custom-scrollbar">
                 <div className="max-w-4xl mx-auto min-h-full space-y-8">
                    
                    {/* 1. Rich Text Editor Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 min-h-[400px]">
                      {EDITOR_TABS.map((tab) => (
                        <div key={tab.id} className={cn(activeTab === tab.id ? "block" : "hidden", "animate-in fade-in slide-in-from-bottom-2 duration-300")}>
                          <div className="mb-4 flex items-center gap-2 text-slate-400 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <tab.icon size={14} />
                            <span>{tab.placeholder}</span>
                          </div>
                          
                          <RichTextEditor
                            value={finding[tab.id] || ''}
                            onChange={(val) => updateField(tab.id, val)}
                            placeholder="Buraya yazmaya başlayın..."
                            className="prose-lg min-h-[300px] outline-none"
                          />
                        </div>
                      ))}
                    </div>

                    {/* 2. Evidence Uploader Card */}
                    <div className="bg-slate-50/50 rounded-xl border border-slate-200 border-dashed p-6">
                       <div className="flex items-center gap-2 mb-4 text-slate-500 font-bold text-xs uppercase tracking-wide">
                         <Paperclip size={16} /> Kanıt Dokümanları & Ekler
                       </div>
                       
                       <FileUploader 
                         onUpload={handleEvidenceUpload}
                         compact
                         label="Kanıt dosyalarını buraya sürükleyin veya seçin"
                         accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }}
                         maxSize={10 * 1024 * 1024}
                       />
                       
                       {evidenceFiles.length > 0 && (
                         <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                            {evidenceFiles.map((file, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded text-xs shadow-sm animate-in fade-in slide-in-from-top-1">
                                <div className="flex items-center gap-2 truncate">
                                  <div className={cn("p-1.5 rounded text-white", theme.bg)}>
                                    <FileIcon size={14} />
                                  </div>
                                  <div className="flex flex-col truncate">
                                    <span className="truncate font-medium text-slate-700">{file.name}</span>
                                    <span className="text-[9px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</span>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => setEvidenceFiles(prev => prev.filter((_, i) => i !== idx))} 
                                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
                                >
                                  <Trash2 size={14}/>
                                </button>
                              </div>
                            ))}
                         </div>
                       )}
                    </div>
                    
                 </div>
              </div>
            </div>

            {/* RIGHT: Control Center */}
            <div className="w-[340px] shrink-0 flex flex-col gap-6 h-full overflow-hidden">
              <div className="flex-1 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm overflow-hidden flex flex-col">
                {/* GÖREV 4: Conditional Rendering - Review Mode vs Edit Mode */}
                {finding?.status === 'review' ? (
                  // REVIEW MODE - Gözden Geçirme Paneli
                  <div className="w-full bg-slate-50 flex flex-col h-full">
                    <div className="p-6 border-b border-slate-200 bg-amber-50">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={18} className="text-amber-600" />
                        <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide">
                          Gözden Geçirme
                        </h3>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        Bu bulgu şu anda onay bekliyor. İçeriği inceleyip onaylayabilir veya reddedebilirsiniz.
                      </p>
                    </div>

                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                      {/* Approve Button */}
                      <button
                        onClick={() => {
                          updateField('status', 'approved');
                          saveFinding();
                        }}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                      >
                        <CheckCircle2 size={16} /> Onayla
                      </button>

                      {/* Return for Revision Button */}
                      <button
                        onClick={() => {
                          updateField('status', 'draft');
                          saveFinding();
                        }}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                      >
                        <ArrowLeft size={16} /> Revizyona İade
                      </button>

                      {/* Reject Button */}
                      <button
                        onClick={() => {
                          const reason = prompt('Red gerekçenizi giriniz:');
                          if (reason) {
                            updateField('rejection_reason', reason);
                            updateField('status', 'rejected');
                            saveFinding();
                          }
                        }}
                        className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                      >
                        <X size={16} /> Reddet
                      </button>
                    </div>

                    <div className="p-4 border-t border-slate-200 bg-white">
                      <p className="text-xs text-slate-500 italic">
                        <strong>Not:</strong> Onay işlemi geri alınamaz. Lütfen tüm alanları dikkatlice inceleyin.
                      </p>
                    </div>
                  </div>
                ) : (
                  <FindingFormWidget
                    finding={finding}
                    onUpdate={updateField}
                    onAdvanceWorkflow={() => {
                      // GÖREV 1: Workflow advanced after QAIP check
                      saveFinding();
                    }}
                  />
                )}
              </div>
            </div>
          </main>
        )}

        {/* --- MOD B: ZEN (READER) --- */}
        {mode === 'zen' && (
          <main className="flex-1 overflow-y-auto relative h-full">
             <div className="max-w-full h-full p-8 flex justify-center">
                <ZenReaderWidget 
                  data={finding} 
                  layout={zenLayout} 
                  warmth={warmth} 
                />
             </div>
          </main>
        )}

        {/* --- MOD C: NEGOTIATION --- */}
        {mode === 'negotiation' && (
           <main className="flex-1 flex gap-6 p-6 h-full overflow-hidden bg-slate-50/50">
             <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-y-auto p-8">
                <ZenReaderWidget data={finding} layout="flow" warmth={0} />
             </div>
             
             <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <NegotiationBoardWidget id={finding.id} />
             </div>
           </main>
        )}

        {/* --- UNIVERSAL RIGHT RAIL (Drawer Triggers & Tools) --- */}
        <div className="w-16 border-l border-white/20 bg-white/40 backdrop-blur-md z-20 flex flex-col items-center py-4 gap-4 shrink-0 shadow-[-4px_0_15px_rgba(0,0,0,0.01)]">
          
          {/* 1. Chat (Drawer Trigger) */}
          <button 
            onClick={() => toggleDrawer('chat')}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              drawerTab === 'chat' && isDrawerOpen ? `${theme.bg} text-white shadow-lg` : "text-slate-400 hover:bg-white/60"
            )}
            title="Mesajlar / Yorumlar"
          >
            <MessageSquare size={20} />
          </button>

          <div className="w-8 h-px bg-slate-200/50" />

          {/* 2. Print */}
          <button 
            onClick={() => window.print()}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all text-slate-400 hover:text-slate-700 hover:bg-white/60"
            title="Yazdır"
          >
            <Printer size={20} />
          </button>

          {/* 3. Export PDF */}
          <button 
            onClick={() => console.log('Export PDF')}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all text-rose-500/80 hover:text-rose-600 hover:bg-white/60"
            title="PDF'e Aktar"
          >
            <FileText size={20} />
          </button>

           {/* 4. Export Word */}
           <button 
            onClick={() => console.log('Export Word')}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all text-blue-600/80 hover:text-blue-700 hover:bg-white/60"
            title="Word'e Aktar"
          >
            <FileIcon size={20} /> 
          </button>

        </div>

      </div>

      <UniversalFindingDrawer
        findingId={finding?.id || null}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        defaultTab={drawerTab}
        currentViewMode="zen"
        onApplyContent={(section, content) => {
          // GÖREV 2: Drawer'dan gelen içeriği editöre aktar
          updateField(section, content);
        }}
      />

    </div>
  );
};

export default FindingStudioPage;