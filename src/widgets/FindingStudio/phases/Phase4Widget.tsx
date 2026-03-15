import React from 'react';
import { ShieldCheck, CheckSquare, XSquare, FileSignature } from 'lucide-react';

interface Phase4Props {
  finding: any;
  onUpdate: (field: string, value: any) => void;
  isReadOnly?: boolean;
}

export const Phase4Approval: React.FC<Phase4Props> = ({
  finding,
  onUpdate,
  isReadOnly = false
}) => {
  return (
    <div className="bg-surface/60 backdrop-blur-xl border border-slate-200/50 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4 pb-6 border-b border-slate-200/50">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
          <FileSignature size={24} className="text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">İç Denetim Yönetimi Onayı</h2>
          <p className="text-sm text-slate-500">Bu bulgu yayınlanmadan önce yönetici veya CAE (Chief Audit Executive) onayı gerektirir.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-emerald-50/50 backdrop-blur-md border border-emerald-200/50 rounded-2xl flex flex-col items-center text-center">
          <ShieldCheck size={40} className="text-emerald-500 mb-4" />
          <h3 className="text-lg font-bold text-emerald-900 mb-2">Taslağı Onayla</h3>
          <p className="text-xs text-emerald-700/80 mb-4 flex-1">
            Bulgu standartlara uygun şekilde yazılmış olup, karşı tarafa iletilmesinde sakınca yoktur.
          </p>
          {!isReadOnly ? (
            <button 
              onClick={() => {
                onUpdate('status', 'published');
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex justify-center items-center gap-2 transition-all shadow-sm"
            >
              <CheckSquare size={16} /> Onayla ve Yayınla
            </button>
          ) : (
            <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Yalnızca Yöneticiler</span>
          )}
        </div>

        <div className="p-4 bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-2xl flex flex-col items-center text-center">
          <XSquare size={40} className="text-amber-500 mb-4" />
          <h3 className="text-lg font-bold text-amber-900 mb-2">Revizyona Gönder</h3>
          <p className="text-xs text-amber-700/80 mb-4 flex-1">
            Bulgu metninde veya kanıtlarda eksiklikler tespit edildi. İlgili denetçiye düzeltme için iade et.
          </p>
          {!isReadOnly ? (
            <button 
              onClick={() => {
                const reason = prompt("Revizyon gerekçesini yazınız:");
                if (reason) {
                  onUpdate('status', 'draft');
                  onUpdate('rejection_reason', reason);
                }
              }}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm flex justify-center items-center gap-2 transition-all shadow-sm"
            >
              <XSquare size={16} /> Revizyon İste
            </button>
          ) : (
            <span className="px-4 py-1.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Yalnızca Yöneticiler</span>
          )}
        </div>
      </div>
    </div>
  );
};
