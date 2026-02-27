import { useState } from 'react';
import { RiskNode } from '@/features/risk-engine/types';
import { ShieldCheck, UploadCloud, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { FindingForm } from './FindingForm';

export const Workpaper = ({ control }: { control: RiskNode }) => {
  const [testResult, setTestResult] = useState<'PASS' | 'FAIL' | null>(null);

  if (control?.type !== 'CONTROL') {
    return <div className="h-full flex items-center justify-center text-slate-400">Lütfen soldan bir "Kontrol" seçin.</div>;
  }

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-2 uppercase tracking-wider">
          <ShieldCheck size={14} /> Kontrol Testi
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{control.name}</h2>
        <div className="text-sm text-slate-500 mt-1 font-mono">{control.path}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
           <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="font-bold text-slate-900 mb-4 uppercase text-xs">Test Sonucu</h3>
                 <div className="flex gap-3">
                    <button onClick={() => setTestResult('PASS')} className={cn("flex-1 py-4 border rounded-xl font-bold transition-all flex flex-col items-center gap-2", testResult === 'PASS' ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "hover:bg-slate-50")}>
                       <CheckCircle2 size={24} /> Kontrol Etkin
                    </button>
                    <button onClick={() => setTestResult('FAIL')} className={cn("flex-1 py-4 border rounded-xl font-bold transition-all flex flex-col items-center gap-2", testResult === 'FAIL' ? "bg-rose-50 border-rose-500 text-rose-700" : "hover:bg-slate-50")}>
                       <XCircle size={24} /> Bulgu Var
                    </button>
                 </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-dashed flex flex-col items-center justify-center text-slate-400 py-12 cursor-pointer hover:bg-slate-50 transition-colors">
                 <UploadCloud size={32} className="mb-2" />
                 <span className="text-sm font-medium">Kanıt Dosyası Yükle</span>
              </div>
           </div>

           <div className="h-full">
              {testResult === 'FAIL' ? (
                 <FindingForm />
              ) : (
                 <div className="h-full flex items-center justify-center text-slate-300 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                    Bulgu formu test başarısız olduğunda açılır.
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
