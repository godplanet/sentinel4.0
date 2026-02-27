import { Radar } from 'lucide-react';
import { EsgCard } from './ecosystem/EsgCard';
import { VendorCard } from './ecosystem/VendorCard';
import { TalentCard } from './ecosystem/TalentCard';
import { AuditeeCard } from './ecosystem/AuditeeCard';

export function EcosystemView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl px-6 py-4 shadow-lg">
        <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
          <Radar size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Ekosistem & Gozetim Paneli</h2>
          <p className="text-xs text-white/60">Takim, tedarikci, surdurulebilirlik ve saha durumu tek bakista</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EsgCard />
        <VendorCard />
        <TalentCard />
        <AuditeeCard />
      </div>
    </div>
  );
}
