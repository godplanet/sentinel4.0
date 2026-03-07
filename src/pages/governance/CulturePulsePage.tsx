/**
 * Wave 61: Risk Culture & Tone at the Top Pulse Sayfası
 * Rota: /governance/culture-pulse
 */

import { PageHeader } from '@/shared/ui';
import { CultureHeatmap } from '@/widgets/CultureHeatmap';
import { HeartPulse } from 'lucide-react';

export default function CulturePulsePage() {
  return (
    <div className="min-h-screen bg-canvas w-full">
      <div className="w-full px-4 py-6 space-y-5">
        <div className="sticky top-0 z-20 bg-canvas/95 backdrop-blur-md border-b border-slate-200 -mx-4 px-4 pt-2 pb-4">
          <PageHeader
            title="Risk Kültürü & Tone at the Top (Pulse)"
            description="Personel etik algı anketleri, departman bazlı duygu haritaları ve şeffaflık metrikleri"
            icon={HeartPulse}
          />
        </div>

        <CultureHeatmap />
      </div>
    </div>
  );
}
