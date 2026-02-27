import { useState } from 'react';
import { PageHeader } from '@/shared/ui';
import { TPRMDashboard } from '@/widgets/TPRMDashboard';
import { TPRMVendorDetail } from '@/widgets/TPRMVendorDetail';
import { Building2, ShieldAlert, FileSearch, Users } from 'lucide-react';

export default function TPRMPage() {
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tedarikcier Risk Yonetimi (TPRM)"
        description="Ucuncu taraf risk degerlendirmesi ve tedarikcier izleme"
        icon={Building2}
      />

      {!selectedVendorId && (
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Vendor Risk Command Center</h2>
              <p className="text-slate-300 mb-4">
                Tum tedarikci risk profillerini, degerlendirme sonuclarini ve uyumluluk
                durumlarini tek panelden yonetin. BDDK dis hizmet bildirim gereksinimleri dahil.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                  <FileSearch className="w-4 h-4" />
                  <span>AI Degerlendirme</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                  <Users className="w-4 h-4" />
                  <span>Tier Bazli Yonetim</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Risk Skorlama</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedVendorId ? (
        <TPRMVendorDetail
          vendorId={selectedVendorId}
          onBack={() => setSelectedVendorId(null)}
        />
      ) : (
        <TPRMDashboard onVendorClick={setSelectedVendorId} />
      )}
    </div>
  );
}
