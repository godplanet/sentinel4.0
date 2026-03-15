/**
 * Wave 49: Risk İştahı & KRI İzleme Sayfası
 * Rota: /risk/appetite
 */

import { PageHeader } from '@/shared/ui';
import { KRIGaugeBoard } from '@/widgets/RiskAppetiteBoard';
import { Activity } from 'lucide-react';

export default function RiskAppetitePage() {
 return (
 <div className="min-h-screen bg-canvas w-full">
 <div className="w-full px-4 py-4 space-y-5">
 <div className="sticky top-0 z-20 bg-canvas/95 backdrop-blur-md border-b border-slate-200 -mx-4 px-4 pt-2 pb-4">
 <PageHeader
 title="Risk İştahı & KRI İzleme Paneli"
 description="Dinamik risk eşikleri, KRI okumaları ve limit ihlalleri — BDDK / Basel III / GIAS 2024 uyumlu"
 icon={Activity}
 />
 </div>

 <KRIGaugeBoard />
 </div>
 </div>
 );
}
