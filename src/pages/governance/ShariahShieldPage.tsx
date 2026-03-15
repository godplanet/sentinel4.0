/**
 * Wave 90: Shariah-AI Algorithmic Filter Sayfası
 * Rota: /governance/shariah-shield
 */

import { PageHeader } from '@/shared/ui';
import { AlgorithmicShield } from '@/widgets/AlgorithmicShield';
import { ShieldCheck } from 'lucide-react';

export default function ShariahShieldPage() {
 return (
 <div className="min-h-screen bg-canvas w-full">
 <div className="w-full px-4 py-4 space-y-5">
 <div className="sticky top-0 z-20 bg-canvas/95 backdrop-blur-md border-b border-slate-200 -mx-4 px-4 pt-2 pb-4">
 <PageHeader
 title="Yapay Zeka Şeri Uyum Filtresi (AAOIFI Shield)"
 description="Algoritmik fon işlemleri (Robo-Advisor) ve HFT bot kararlarının İslami Finans kural setlerine (Haram gelir, Faiz rasyosu vd.) göre otonom olarak reddedildiği inceleme duvarı."
 icon={ShieldCheck}
 />
 </div>

 <AlgorithmicShield />
 </div>
 </div>
 );
}
