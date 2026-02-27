import { useState } from 'react';
import { 
  ShieldCheck, MessageSquare, Plus, CheckCircle, 
  Clock, User, Send, FileCheck, AlertCircle, Shield 
} from 'lucide-react';
import clsx from 'clsx';
import type { ReviewNote, FindingSignoff } from '@/entities/finding/model/types';

interface ReviewPanelProps {
  findingId: string | null;
  currentUserId?: string;
  isReviewer?: boolean; // Yönetici / Başdenetçi mi?
}

// MOCK VERİ: Bağlantılar yapılana kadar tasarımı görmek için
const MOCK_NOTES: ReviewNote[] = [
  {
    id: '1', finding_id: 'F-001', field_reference: 'Mali Etki (Risk)', 
    note_text: 'Olası ceza tutarını minimum 1 Milyon TL olarak revize edelim. BDDK rehberi öyle diyor.',
    reviewer_id: 'u-1', reviewer_name: 'Ahmet Yönetici', status: 'OPEN',
    created_at: '2026-02-13T10:00:00Z', updated_at: '2026-02-13T10:00:00Z'
  },
  {
    id: '2', finding_id: 'F-001', field_reference: 'Kök Neden', 
    note_text: 'Sadece personel hatası diyemeyiz, sistemin buna izin vermesi asıl nedendir. 5-Whys analizini tekrar yapın.',
    reviewer_id: 'u-1', reviewer_name: 'Ahmet Yönetici', status: 'CLEARED',
    resolution_text: 'Sistem altyapısı eksikliği olarak güncellendi.', resolved_at: '2026-02-13T14:00:00Z',
    created_at: '2026-02-12T15:00:00Z', updated_at: '2026-02-13T14:00:00Z'
  }
];

const MOCK_SIGNOFFS: FindingSignoff[] = [
  { id: 's1', finding_id: 'F-001', role: 'PREPARER', user_id: 'u-2', user_name: 'Can Denetçi', status: 'SIGNED', signed_at: '2026-02-13T15:00:00Z' },
  { id: 's2', finding_id: 'F-001', role: 'REVIEWER', user_id: 'u-1', user_name: 'Ahmet Yönetici', status: 'PENDING' }
];

type ReviewTab = 'notes' | 'signoff';

export function ReviewPanel({ findingId, currentUserId = 'u-2', isReviewer = false }: ReviewPanelProps) {
  const [activeTab, setActiveTab] = useState<ReviewTab>('notes');
  
  // Gözden Geçirme Notları State
  const [notes, setNotes] = useState<ReviewNote[]>(MOCK_NOTES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNoteField, setNewNoteField] = useState('');
  const [newNoteText, setNewNoteText] = useState('');

  // Onay (Sign-off) State
  const [signoffs, setSignoffs] = useState<FindingSignoff[]>(MOCK_SIGNOFFS);

  const openNotes = notes.filter(n => n.status === 'OPEN');
  const clearedNotes = notes.filter(n => n.status === 'CLEARED' || n.status === 'CLOSED');

  const preparerSignoff = signoffs.find(s => s.role === 'PREPARER');
  const reviewerSignoff = signoffs.find(s => s.role === 'REVIEWER');

  const handleAddNote = () => {
    if (newNoteField.trim() && newNoteText.trim()) {
      const newNote: ReviewNote = {
        id: Math.random().toString(), finding_id: findingId || '',
        field_reference: newNoteField, note_text: newNoteText,
        reviewer_id: currentUserId, reviewer_name: 'Test Yönetici',
        status: 'OPEN', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      };
      setNotes([newNote, ...notes]);
      setNewNoteField(''); setNewNoteText(''); setShowAddForm(false);
    }
  };

  const handleResolveNote = (noteId: string) => {
    setNotes(notes.map(n => n.id === noteId ? { ...n, status: 'CLEARED', resolved_at: new Date().toISOString() } : n));
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-300">
      
      {/* ALT SEKMELER */}
      <div className="flex items-center gap-2 bg-slate-200/50 p-1 rounded-lg shrink-0">
        <button onClick={() => setActiveTab('notes')} className={clsx("flex-1 py-1.5 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2", activeTab === 'notes' ? "bg-white text-orange-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
          <MessageSquare size={16} /> İnceleme Notları {openNotes.length > 0 && <span className="bg-orange-500 text-white text-[10px] px-1.5 rounded-full">{openNotes.length}</span>}
        </button>
        <button onClick={() => setActiveTab('signoff')} className={clsx("flex-1 py-1.5 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2", activeTab === 'signoff' ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
          <ShieldCheck size={16} /> Onay Katmanı (4-Eyes)
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 pr-2">
        
        {/* ======================================================================= */}
        {/* SEKME 1: GÖZDEN GEÇİRME NOTLARI (Eski ReviewNotesPanel)                 */}
        {/* ======================================================================= */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">Müfettişin düzeltmesi gereken kalite sorunları.</p>
              {isReviewer && (
                <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold hover:bg-orange-200 transition-colors">
                  <Plus size={14} /> Yeni Not
                </button>
              )}
            </div>

            {/* Yeni Not Ekleme Formu */}
            {showAddForm && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl shadow-sm animate-in slide-in-from-top-2">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">İlgili Alan (Opsiyonel)</label>
                    <input type="text" value={newNoteField} onChange={(e) => setNewNoteField(e.target.value)} placeholder="Örn: Kök Neden, Mali Etki..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">İnceleme Notu</label>
                    <textarea value={newNoteText} onChange={(e) => setNewNoteText(e.target.value)} placeholder="Düzeltme talebinizi yazın..." rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none" />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button onClick={handleAddNote} className="flex-1 flex items-center justify-center gap-2 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-bold text-sm shadow-sm">
                      <Send size={16} /> Notu Gönder
                    </button>
                    <button onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-bold text-sm">İptal</button>
                  </div>
                </div>
              </div>
            )}

            {/* Açık Notlar */}
            {openNotes.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2 tracking-wider">
                  <Clock size={14} /> Düzeltme Bekleyenler ({openNotes.length})
                </h4>
                {openNotes.map((note) => (
                  <div key={note.id} className="p-4 bg-white border-l-4 border-orange-500 rounded-r-xl shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-black text-orange-700 bg-orange-100 px-2 py-0.5 rounded uppercase tracking-wider">
                        {note.field_reference || 'Genel'}
                      </span>
                      {!isReviewer && (
                        <button onClick={() => handleResolveNote(note.id)} className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 px-2 py-1 rounded-md font-bold flex items-center gap-1 transition-colors">
                          <CheckCircle size={14} /> Çözüldü İşaretle
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-slate-800 font-medium mb-3">{note.note_text}</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <User size={12} /> {note.reviewer_name} • {new Date(note.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Çözülen Notlar */}
            {clearedNotes.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2 tracking-wider">
                  <CheckCircle size={14} /> Çözülenler ({clearedNotes.length})
                </h4>
                {clearedNotes.map((note) => (
                  <div key={note.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl opacity-75 grayscale-[50%]">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                        {note.field_reference || 'Genel'}
                      </span>
                      <CheckCircle size={16} className="text-emerald-500" />
                    </div>
                    <p className="text-sm text-slate-600 line-through mb-2">{note.note_text}</p>
                    {note.resolution_text && (
                      <div className="bg-emerald-50 p-2 rounded text-xs text-emerald-800 font-medium mb-2 border border-emerald-100">
                        <span className="font-black">Denetçi Yanıtı:</span> {note.resolution_text}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {notes.length === 0 && !showAddForm && (
              <div className="text-center py-16 text-slate-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Bu bulgu için inceleme notu bulunmuyor.</p>
              </div>
            )}
          </div>
        )}

        {/* ======================================================================= */}
        {/* SEKME 2: ONAY KATMANI (Eski SignOffPanel)                               */}
        {/* ======================================================================= */}
        {activeTab === 'signoff' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck className="text-blue-600 w-6 h-6 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-blue-900 mb-1">Four-Eyes (Dört Göz) Prensibi</h3>
                <p className="text-xs text-blue-800 leading-relaxed font-medium">Uluslararası iç denetim standartları gereği, hiçbir bulgu en az bir yönetici tarafından gözden geçirilip onaylanmadan kesinleşemez veya denetlenene iletilemez.</p>
              </div>
            </div>

            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              
              {/* Hazırlayan (Preparer) */}
              <div className={clsx("relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group", preparerSignoff?.status === 'SIGNED' ? "" : "opacity-70")}>
                <div className={clsx("flex items-center justify-center w-14 h-14 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2", preparerSignoff?.status === 'SIGNED' ? "bg-emerald-500" : "bg-slate-300")}>
                  {preparerSignoff?.status === 'SIGNED' ? <CheckCircle className="text-white w-6 h-6" /> : <User className="text-white w-6 h-6" />}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="font-black text-slate-800 text-sm mb-1">Hazırlayan (Preparer)</h4>
                  {preparerSignoff?.status === 'SIGNED' ? (
                    <>
                      <p className="text-xs font-bold text-slate-500 mb-2">{preparerSignoff.user_name}</p>
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-1 rounded uppercase">İMZALANDI • {new Date(preparerSignoff.signed_at!).toLocaleDateString()}</span>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-slate-500 mb-3">Bulgu taslağı hazırlık aşamasında.</p>
                      {!isReviewer && <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm flex items-center justify-center gap-1"><FileCheck size={14}/> İmzala ve İncelemeye Gönder</button>}
                    </>
                  )}
                </div>
              </div>

              {/* İnceleyen (Reviewer) */}
              <div className={clsx("relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mt-8", reviewerSignoff?.status === 'SIGNED' ? "" : "opacity-70")}>
                <div className={clsx("flex items-center justify-center w-14 h-14 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2", reviewerSignoff?.status === 'SIGNED' ? "bg-blue-600" : "bg-slate-300")}>
                  {reviewerSignoff?.status === 'SIGNED' ? <ShieldCheck className="text-white w-6 h-6" /> : <Shield className="text-white w-6 h-6" />}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="font-black text-slate-800 text-sm mb-1">Gözden Geçiren (Reviewer)</h4>
                  {reviewerSignoff?.status === 'SIGNED' ? (
                    <>
                      <p className="text-xs font-bold text-slate-500 mb-2">{reviewerSignoff.user_name}</p>
                      <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-1 rounded uppercase">ONAYLANDI • {new Date(reviewerSignoff.signed_at!).toLocaleDateString()}</span>
                    </>
                  ) : (
                    <>
                      {openNotes.length > 0 ? (
                        <div className="flex items-start gap-1 p-2 bg-red-50 rounded-lg border border-red-100 mb-2">
                          <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5"/>
                          <p className="text-[10px] font-bold text-red-700 leading-tight">Önce {openNotes.length} adet açık inceleme notunun çözülmesi gerekmektedir.</p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 mb-3">Onay bekleniyor.</p>
                      )}
                      
                      {isReviewer && preparerSignoff?.status === 'SIGNED' && openNotes.length === 0 && (
                        <button className="w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-sm flex items-center justify-center gap-1"><ShieldCheck size={14}/> Yönetici Onayını Ver</button>
                      )}
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}