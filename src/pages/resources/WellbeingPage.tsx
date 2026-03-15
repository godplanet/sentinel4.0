/**
 * Wave 74: Auditor Well-Being & Burnout Predictor Sayfası
 * Rota: /resources/well-being
 */

import { PageHeader } from '@/shared/ui';
import { BurnoutRadar } from '@/widgets/BurnoutRadar';
import { HeartPulse } from 'lucide-react';

export default function WellbeingPage() {
 return (
 <div className="min-h-screen bg-canvas w-full">
 <div className="w-full px-4 py-4 space-y-5">
 <div className="sticky top-0 z-20 bg-canvas/95 backdrop-blur-md border-b border-slate-200 -mx-4 px-4 pt-2 pb-4">
 <PageHeader
 title="Müfettiş Sağlığı & Tükenmişlik Radarı"
 description="İş yükü, fazla mesai ve mental stres bazlı AI destekli proaktif koruma haritası"
 icon={HeartPulse}
 />
 </div>

 <BurnoutRadar />
 </div>
 </div>
 );
}
