import { PageHeader } from '@/shared/ui';
import { ComplianceDashboard } from '@/widgets/ComplianceDashboard';
import { Shield, Scale, FileCheck, Globe } from 'lucide-react';

export default function CompliancePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Uyum Haritasi (CrossComply)"
        description="Regulasyonlar, cerceveler ve kontrol eslemelerini yonetin"
        icon={Shield}
      />

      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Compliance Command Center</h2>
            <p className="text-teal-100 mb-4">
              BDDK, KVKK, ISO 27001 ve COBIT cercevelerini tek panelde izleyin.
              Gap analizleri yapin, kontrolleri esleyin ve uyum durumunu anlik takip edin.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                <FileCheck className="w-4 h-4" />
                <span>Gap Analizi</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                <Globe className="w-4 h-4" />
                <span>Coklu Cerceve</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                <Shield className="w-4 h-4" />
                <span>AI Esleme</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ComplianceDashboard />
    </div>
  );
}
