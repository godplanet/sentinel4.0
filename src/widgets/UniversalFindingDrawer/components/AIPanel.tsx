import { useState } from 'react';
import { 
  Sparkles, FileText, CheckCircle2, AlertCircle, 
  MessageSquare, Loader2, Check, History, Bot, 
  BrainCircuit, ArrowRight, Copy
} from 'lucide-react';
import clsx from 'clsx';

// Sizin sisteminizdeki mevcut AI motorları
import { generateDraftFromNotes, type GeneratedFinding } from '@/features/ai-audit/utils/findingGenerator';

interface AIPanelProps {
  findingId: string | null;
  // AI tarafından üretilen bulguyu ana forma (ZenEditor'e) aktarmak için callback
  onApplyDraft?: (draft: GeneratedFinding) => void; 
}

type SubTab = 'notes' | 'analysis';

export function AIPanel({ findingId, onApplyDraft }: AIPanelProps) {
  const [activeTab, setActiveTab] = useState<SubTab>('notes');
  
  // Notlar State
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<GeneratedFinding | null>(null);

  // SİZİN ORİJİNAL KODUNUZ: AI Dönüştürme İşlemi
  const handleGenerateFinding = async () => {
    if (!notes.trim()) return;
    setIsGenerating(true);
    
    // Gerçekçi bir AI bekleme süresi simülasyonu
    setTimeout(() => {
      const draft = generateDraftFromNotes(notes);
      setGeneratedDraft(draft);
      setIsGenerating(false);
    }, 1500);
  };

  const handleApplyToForm = () => {
    if (generatedDraft && onApplyDraft) {
      onApplyDraft(generatedDraft);
      setGeneratedDraft(null); // Aktardıktan sonra önizlemeyi temizle
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-300">
      
      {/* ALT SEKMELER (Notlar vs Analiz) */}
      <div className="flex items-center gap-2 bg-slate-200/50 p-1 rounded-lg shrink-0">
        <button 
          onClick={() => setActiveTab('notes')}
          className={clsx("flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2", activeTab === 'notes' ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
        >
          <FileText size={14} /> Notlar & Üretim
        </button>
        <button 
          onClick={() => setActiveTab('analysis')}
          className={clsx("flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2", activeTab === 'analysis' ? "bg-white text-purple-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
        >
          <Sparkles size={14} /> Akıllı Analiz
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 pr-2">
        
        {/* ======================================================================= */}
        {/* SEKME 1: MÜFETTİŞ NOTLARI VE AI İLE BULGU ÜRETİMİ (Eski NotlarTab)      */}
        {/* ======================================================================= */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            
            {/* AI Prompt Alanı */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BrainCircuit className="text-blue-600" size={16} /> Müfettiş Notları
                </h3>
                <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">AI Destekli</span>
              </div>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                Saha notlarınızı serbestçe yazın. Sentinel AI, bu notları analiz ederek 5C formatında (Kriter, Tespit, Neden, Etki, Öneri) profesyonel bir bulgu taslağına dönüştürecektir.
              </p>
              
              <div className="relative">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Örn: Şubeye gittim, Ahmet beyle görüştüm. Kasada çift anahtar kullanılmıyor. Bu durum BDDK madde 7'ye aykırı olabilir..."
                  className="w-full h-40 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-sm shadow-inner placeholder:text-slate-300 transition-all"
                />
                <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 font-medium">
                  {notes.length} karakter
                </div>
              </div>
              
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={handleGenerateFinding}
                  disabled={!notes.trim() || isGenerating}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-95"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-yellow-300" />}
                  {isGenerating ? 'Analiz Ediliyor...' : 'Bulguya Dönüştür'}
                </button>
              </div>
            </div>

            {/* AI ÜRETİM SONUCU (ÖNİZLEME) */}
            {generatedDraft && (
              <div className="bg-white rounded-xl border border-indigo-100 shadow-lg overflow-hidden animate-in slide-in-from-top-4 ring-1 ring-indigo-50">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-3 border-b border-indigo-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="text-indigo-600 w-5 h-5" />
                    <h4 className="text-sm font-black text-indigo-900">AI Taslağı Hazır</h4>
                  </div>
                  <span className={clsx(
                    "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
                    generatedDraft.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 
                    generatedDraft.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'
                  )}>
                    {generatedDraft.severity}
                  </span>
                </div>
                
                <div className="p-4 space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Başlık</span>
                    <p className="text-sm font-bold text-slate-800">{generatedDraft.title}</p>
                  </div>
                  
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Tespit & Detay</span>
                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap leading-relaxed">
                      {generatedDraft.description}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Önerilen Kriter</span>
                    <p className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded inline-block">
                      {generatedDraft.criteria_suggestion}
                    </p>
                  </div>

                  <button 
                    onClick={handleApplyToForm} 
                    className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ArrowRight size={16} /> Editöre Aktar
                  </button>
                </div>
              </div>
            )}

            {/* ORİJİNAL KOD: Önceki Notlar */}
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Geçmiş Notlar</h3>
              <div className="space-y-3">
                <div className="bg-yellow-50/50 border-l-4 border-yellow-400 p-4 rounded-r-lg hover:bg-yellow-50 transition-colors group cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] font-bold text-yellow-800/70">15.12.2025 - 14:30</span>
                    <button className="text-xs font-bold text-yellow-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <Copy size={12} /> Kopyala
                    </button>
                  </div>
                  <p className="text-xs text-yellow-900/80 leading-relaxed font-medium">
                    CCTV kayıtlarında personel tek başına kasaya erişim sağlamıştır. İşlem personeli Ahmet Yılmaz. Yönetici tatilde.
                  </p>
                </div>
                <div className="bg-yellow-50/50 border-l-4 border-yellow-400 p-4 rounded-r-lg hover:bg-yellow-50 transition-colors group cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] font-bold text-yellow-800/70">14.12.2025 - 10:15</span>
                    <button className="text-xs font-bold text-yellow-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <Copy size={12} /> Kopyala
                    </button>
                  </div>
                  <p className="text-xs text-yellow-900/80 leading-relaxed font-medium">
                    Benzer durum 2024 yılında da gözlenmişti. İyileştirme yapılmamış.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* SEKME 2: AKILLI ANALİZ VE KALİTE KONTROL (Eski AITab)                   */}
        {/* ======================================================================= */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            
            {/* ORİJİNAL KOD: Benzerlik Analizi */}
            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl p-6 border border-purple-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Sparkles className="w-24 h-24 text-purple-600" />
              </div>
              
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-purple-100">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-purple-900">Benzerlik Analizi</h3>
                  <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Sentinel Brain</p>
                </div>
              </div>
              
              <div className="text-center mb-6 relative z-10">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-fuchsia-600 mb-2 drop-shadow-sm">%85</div>
                <p className="text-xs font-medium text-purple-800 leading-relaxed max-w-[200px] mx-auto">
                  Son 3 yıl içinde 5 farklı şubede tespit edilen benzer bulgularla eşleşti.
                </p>
              </div>
              
              <div className="flex gap-2 relative z-10">
                <button className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs font-bold shadow-sm">
                  Kök Nedeni Eşleştir
                </button>
                <button className="flex-1 px-3 py-2 bg-white text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-xs font-bold">
                  Geçmiş Öneriler
                </button>
              </div>
            </div>

            {/* ORİJİNAL KOD: Tekrar Eden Bulgular Listesi */}
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Tespit Edilen Benzerlikler</h3>
              <div className="space-y-2">
                {[
                  { id: 1, title: 'Kasa İşlemlerinde Çift Onay Eksikliği', branch: 'Kadıköy Şubesi', date: '14 Ocak 2025', match: '%92' },
                  { id: 2, title: 'Vezne Şifre Paylaşımı Tespiti', branch: 'Beşiktaş Şubesi', date: '14 Kasım 2024', match: '%78' },
                ].map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-purple-300 transition-colors cursor-pointer group shadow-sm">
                    <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-purple-100 transition-colors">
                      <History className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-slate-800 truncate pr-2">{item.title}</p>
                        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">{item.match}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-medium text-slate-500">{item.branch}</span>
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className="text-[10px] font-medium text-slate-500">{item.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ORİJİNAL KOD: Kalite Kontrol Uyarısı */}
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl shadow-sm flex gap-3">
              <div className="bg-orange-100 p-2 rounded-full h-fit">
                 <AlertCircle className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h4 className="text-xs font-black text-orange-900 mb-1 uppercase">Kalite Kontrol Uyarısı</h4>
                <p className="text-xs text-orange-800 leading-relaxed font-medium">
                  Bulgu metni içinde mükerrer ifade tespit edildi. "Dual-control" kelimesi 3 kez tekrarlanmış. Ayrıca Risk/Etki bölümü, kurumun risk iştahı seviyesine göre zayıf kalmış.
                </p>
                <button className="mt-2 text-[10px] font-bold text-orange-700 underline hover:text-orange-900">
                  Otomatik Düzelt
                </button>
              </div>
            </div>

            {/* Sentinel AI'a Sor */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200 text-center">
              <h4 className="text-sm font-bold text-blue-900 mb-1">Daha Fazla Analiz?</h4>
              <p className="text-xs text-blue-700 mb-3 px-4">
                Bu bulgu hakkında Sentinel Prime'dan ek öneriler, mevzuat eşleştirmesi veya risk skorlaması isteyin.
              </p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-bold shadow-sm">
                AI'a Detaylı Sor
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}