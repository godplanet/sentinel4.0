import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export const FindingForm = () => {
  const [severity, setSeverity] = useState('HIGH');
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'RCA' | 'ACTION'>('DETAILS');

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-bottom-4">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
           <AlertTriangle className="text-rose-500" size={18} />
           Yeni Bulgu Girişi
        </h3>
        <div className="flex bg-slate-200 p-0.5 rounded-lg">
           {['DETAILS', 'RCA', 'ACTION'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-md transition-all",
                  activeTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {tab === 'DETAILS' ? 'Detay' : tab === 'RCA' ? 'Kök Neden' : 'Aksiyon'}
              </button>
           ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'DETAILS' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Bulgu Başlığı</label>
              <input className="w-full mt-1 input-solid p-3 font-medium" placeholder="Örn: Kritik Yetkili Hesaplarda MFA Eksikliği" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Önem Derecesi</label>
                  <div className="flex gap-1 mt-1">
                    {['CRITICAL', 'HIGH', 'MEDIUM'].map(lvl => (
                      <button key={lvl} onClick={() => setSeverity(lvl)} className={cn("flex-1 py-2 text-[10px] font-bold rounded border", severity === lvl ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500")}>{lvl}</button>
                    ))}
                  </div>
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Yasal Dayanak</label>
                  <input className="w-full mt-1 input-solid p-2 text-sm" placeholder="BDDK Yön. Madde 12..." />
               </div>
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase">Mevcut Durum (Condition)</label>
               <textarea className="w-full mt-1 input-solid p-3 h-24 text-sm" placeholder="Yapılan incelemede..." />
            </div>
          </div>
        )}

        {activeTab === 'RCA' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 text-xs text-indigo-800">
               <strong>GIAS 2024 Kuralı:</strong> Kök neden analizi yapılmadan bulgu kapatılamaz.
            </div>
            <div className="space-y-3">
               {[1, 2, 3].map(i => (
                 <div key={i} className="flex gap-3 items-center">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">{i}</span>
                    <input className="flex-1 input-solid py-2 px-3 text-sm" placeholder={`Neden? (${i}. Seviye)`} />
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
         <button className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700">Kaydet</button>
      </div>
    </div>
  );
};
