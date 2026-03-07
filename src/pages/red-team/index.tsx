import { PageHeader } from '@/shared/ui/PageHeader';
import { BASDashboard } from '@/widgets/BASDashboard';
import { ShieldAlert, Crosshair, Terminal } from 'lucide-react';

export default function RedTeamPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Red Team & BAS Tracker"
        description="Sızma testleri, Oltalama (Phishing) simülasyonları ve Breach and Attack Simulation (BAS) operasyonları izleme kokpiti."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border text-center border-slate-200 rounded-xl p-4 flex flex-col justify-center shadow-sm">
           <Crosshair className="text-blue-500 mb-2 mx-auto" size={24} />
           <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Aktif Harekatlar</p>
           <p className="text-2xl font-black text-slate-800 mt-1">2</p>
        </div>
        <div className="bg-white border text-center border-slate-200 rounded-xl p-4 flex flex-col justify-center shadow-sm">
           <ShieldAlert className="text-red-500 mb-2 mx-auto" size={24} />
           <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Kritik Sömürü</p>
           <p className="text-2xl font-black text-red-600 mt-1">14</p>
        </div>
        <div className="bg-white border text-center border-slate-200 rounded-xl p-4 flex flex-col justify-center shadow-sm">
           <Terminal className="text-slate-700 mb-2 mx-auto" size={24} />
           <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">BAS Logları</p>
           <p className="text-2xl font-black text-slate-800 mt-1">1,204</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Crosshair size={18} className="text-blue-600" /> Operasyonel Harekatlar
        </h2>
        <BASDashboard />
      </div>
    </div>
  );
}
