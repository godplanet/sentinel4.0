/**
 * Wave 85: Employee Stress & Fraud Correlation Engine Sayfası
 * Rota: /governance/fraud-radar
 */

import { PageHeader } from '@/shared/ui';
import { StressCorrelation } from '@/widgets/StressCorrelation';
import { ShieldAlert } from 'lucide-react';

export default function FraudRadarPage() {
 return (
 <div className="min-h-screen bg-canvas w-full">
 <div className="w-full px-4 py-4 space-y-5">
 <div className="sticky top-0 z-20 bg-canvas/95 backdrop-blur-md border-b border-slate-200 -mx-4 px-4 pt-2 pb-4">
 <PageHeader
 title="Personel Finansal Stres & Fraud Korelasyon Radarı"
 description="IK Finansal stres göstergeleri (Baskı) ile Sistem Yetkilerini (Fırsat) çapraz analiz eden proaktif suiistimal algılama merkezi."
 icon={ShieldAlert}
 />
 </div>

 <StressCorrelation />
 </div>
 </div>
 );
}
