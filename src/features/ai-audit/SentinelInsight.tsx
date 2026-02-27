import React, { useState } from 'react';
import { Sparkles, RefreshCw, Check } from 'lucide-react';

export const SentinelInsight = ({ contextText }: { contextText: string }) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);

  const analyze = () => {
    setLoading(true);
    setTimeout(() => {
      setInsight("Bu kontrol maddesi (Erişim Logları) için geçmiş denetimlerde en sık rastlanan bulgu 'Yetki Matrisi Güncelliği'dir. Yüklenen kanıt dosyasında 2 adet pasif kullanıcı tespit edilmiştir. (Güven Skoru: %92)");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="mt-4 p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl relative overflow-hidden group transition-all hover:shadow-md">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 transition-all group-hover:w-2" />

      {!insight ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-700">
            <Sparkles size={16} className={loading ? "animate-spin" : ""} />
            <span className="text-xs font-bold uppercase tracking-wider">Sentinel AI Analizi</span>
          </div>
          <button
            onClick={analyze}
            disabled={loading}
            className="px-3 py-1.5 bg-white text-indigo-600 text-xs font-bold rounded-lg shadow-sm border border-indigo-100 hover:bg-indigo-50 transition-all flex items-center gap-2"
          >
            {loading ? 'Analiz Ediliyor...' : 'Risk Analizi Yap'}
          </button>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 bg-indigo-100 rounded-full"><Check size={12} className="text-indigo-700"/></div>
            <span className="text-xs font-bold text-indigo-900">Potansiyel Risk Tespit Edildi</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed border-l-2 border-indigo-200 pl-3 font-medium">
            {insight}
          </p>
          <div className="mt-3 flex gap-2 border-t border-indigo-100 pt-2">
             <button className="text-[10px] text-indigo-600 font-bold hover:bg-indigo-50 px-2 py-1 rounded transition-colors">Bulguya Dönüştür</button>
             <button onClick={() => setInsight(null)} className="text-[10px] text-slate-400 hover:text-slate-600 px-2 py-1">Kapat</button>
          </div>
        </div>
      )}
    </div>
  );
};
