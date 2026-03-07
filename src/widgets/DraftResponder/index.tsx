import { useState } from 'react';
import { Bot, FileText, Scale, Clock, Send } from 'lucide-react';
import clsx from 'clsx';
import { useRegulatoryDrafts, useFeedbackReports } from '@/features/lobbying/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getStatusLabel(status: string) {
  switch (status) {
    case 'OPEN': return { label: 'Görüş Bekliyor', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    case 'RESPONDED': return { label: 'Yanıtlandı', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    case 'CLOSED': return { label: 'Süre Doldu', color: 'bg-slate-100 text-slate-500 border-slate-200' };
    default: return { label: status, color: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
}

// ---------------------------------------------------------------------------
// MAIN: Draft Responder Widget
// ---------------------------------------------------------------------------
export function DraftResponder() {
  const { data: drafts = [], isLoading: loadingDrafts } = useRegulatoryDrafts();
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);

  // Automatically select the first draft if none selected
  if (!selectedDraftId && drafts.length > 0) {
    setSelectedDraftId(drafts[0].id);
  }

  const { data: feedbackList = [], isLoading: loadingFeedbacks } = useFeedbackReports(selectedDraftId || undefined);
  const selectedDraft = drafts.find(d => d.id === selectedDraftId);
  const aiFeedback = feedbackList[0]; // Assuming highest priority / latest is first

  if (loadingDrafts || (selectedDraftId && loadingFeedbacks)) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[600px]">
      
      {/* 1. LEFT COL: List of Incoming Regulatory Drafts */}
      <div className="lg:col-span-4 flex flex-col gap-4 border-r border-slate-200 pr-6">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
           <Scale size={18} className="text-indigo-600" />
           Regülatif Taslak Gelen Kutusu
        </h3>
        
        <div className="space-y-3 overflow-y-auto pr-2 pb-4">
          {drafts.length === 0 ? (
             <div className="text-sm text-slate-500 italic p-4 border border-dashed rounded-lg bg-slate-50">
               İncelenecek yeni bir mevzuat taslağı bulunmuyor.
             </div>
          ) : drafts.map(draft => {
            const statusConfig = getStatusLabel(draft.status);
            const isSelected = selectedDraftId === draft.id;
            
            return (
              <button
                key={draft.id}
                onClick={() => setSelectedDraftId(draft.id)}
                className={clsx(
                  'w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden',
                  isSelected 
                    ? 'bg-indigo-50 border-indigo-300 shadow-sm' 
                    : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm'
                )}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                )}
                
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black uppercase text-indigo-900 tracking-wider">
                    {draft.regulator_name}
                  </span>
                  <span className={clsx('text-[9px] px-2 py-0.5 rounded-full border', statusConfig.color)}>
                    {statusConfig.label}
                  </span>
                </div>
                
                <h4 className={clsx('text-sm font-bold mb-3 leading-snug', isSelected ? 'text-indigo-950' : 'text-slate-800')}>
                  {draft.draft_title}
                </h4>
                
                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                   <span className="flex items-center gap-1.5"><FileText size={12}/> Yy: {draft.publication_date}</span>
                   <span className="flex items-center gap-1.5"><Clock size={12}/> Sn: {draft.deadline_date}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. RIGHT COL: AI Draft Editor */}
      <div className="lg:col-span-8 flex flex-col h-full">
        {!selectedDraft ? (
           <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
             <Scale size={48} className="mb-4 opacity-20" />
             <p>İncelemek için sol taraftan bir mevzuat taslağı seçin.</p>
           </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
               <div>
                 <div className="text-xs font-bold text-slate-500 uppercase mb-1">Yanıt Editörü</div>
                 <h2 className="text-base font-bold text-slate-800">{selectedDraft.draft_title}</h2>
               </div>
               
               <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                    <Bot size={16} className="text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-900">Sentinel LLM Devrede</span>
                 </div>
               </div>
            </div>

            {/* Editor Canvas */}
            <div className="flex-1 p-8 bg-[#fafafa] overflow-y-auto relative">
               
               <div className="max-w-3xl mx-auto bg-white border border-slate-200 shadow-sm p-10 min-h-[500px] text-justify">
                 {/* Sentinel Meta Tags */}
                 <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-end">
                    <div>
                      <h1 className="text-2xl font-serif font-bold text-slate-900 mb-1">KURUMSAL GÖRÜŞ BİLDİRİMİ</h1>
                      <div className="text-sm text-slate-500 font-serif">Konu: {selectedDraft.draft_title}</div>
                    </div>
                    <div className="text-right">
                       <div className="text-sm font-bold font-serif text-slate-800">{selectedDraft.regulator_name} Başkanlığı'na</div>
                       <div className="text-xs text-slate-500 mt-1">Tarih: {new Date().toLocaleDateString('tr-TR')}</div>
                    </div>
                 </div>

                 {/* Text Body */}
                 <div className="prose prose-sm prose-slate max-w-none font-serif leading-relaxed h-[400px]">
                    {/* CRITICAL: LLM Fallback (Data Layer'dan gelmiyorsa veya boşsa) */}
                    {aiFeedback?.report_text ? (
                       <div dangerouslySetInnerHTML={{ __html: aiFeedback.report_text.replace(/\n([^<])/g, '<br/>$1') }} />
                    ) : (
                       <p className="text-slate-400 italic text-center py-20 animate-pulse">
                         Yapay Zeka (LLM) tarafından ilgili taslak için savunma ve uyum görüşleri hazırlanıyor...
                       </p>
                    )}
                 </div>

                 {/* Signatures */}
                 <div className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center">
                    <div>
                       <div className="h-16"></div>
                       <div className="border-t border-slate-800 mx-8 pt-2 text-sm font-bold font-serif">Baş Hukuk Müşaviri (CLO)</div>
                    </div>
                    <div>
                       <div className="h-16"></div>
                       <div className="border-t border-slate-800 mx-8 pt-2 text-sm font-bold font-serif">Uyum / Risk Yönetim Komitesi</div>
                    </div>
                 </div>

               </div>
               
               {/* Controls Float Component */}
               <div className="fixed bottom-12 right-12 flex gap-3 shadow-2xl rounded-full p-2 bg-white/80 backdrop-blur-md border border-slate-200">
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold text-xs transition-colors">
                     <FileText size={16}/> Taslak Olarak Kaydet
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-xs transition-colors shadow-lg shadow-indigo-200 cursor-not-allowed opacity-80" disabled>
                     <Send size={16}/> {selectedDraft.regulator_name}'na Gönder
                  </button>
               </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
