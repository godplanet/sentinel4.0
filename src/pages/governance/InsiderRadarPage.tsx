/**
 * Wave 80: Insider Trading & Executive PAD Radar Sayfası
 * Rota: /governance/insider-radar
 */

import { PageHeader } from '@/shared/ui';
import { PADMonitor } from '@/widgets/PADMonitor';
import { ShieldAlert } from 'lucide-react';

export default function InsiderRadarPage() {
  return (
    <div className="min-h-screen bg-canvas w-full">
      <div className="w-full px-4 py-6 space-y-5">
        <div className="sticky top-0 z-20 bg-canvas/95 backdrop-blur-md border-b border-slate-200 -mx-4 px-4 pt-2 pb-4">
          <PageHeader
            title="İçeriden Öğrenenlerin Ticareti & PAD Radar"
            description="Personel hisse senedi işlemlerini, çıkar çatışmalarını ve kısıtlı listedeki varlık hareketlerini izleme merkezi"
            icon={ShieldAlert}
          />
        </div>

        <PADMonitor />
      </div>
    </div>
  );
}
