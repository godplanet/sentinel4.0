import { StrategyDashboard } from '@/features/strategy/ui/StrategyDashboard';
import { PageHeader } from '@/shared/ui';

export default function ObjectivesPage() {
 return (
 <div className="p-5 space-y-4">
 <PageHeader
 title="Stratejik Hedefler"
 description="Kurumsal hedefler ve denetim departmanı stratejisinin uyumlandırılması"
 badge="MODÜL 2: STRATEJİ & RİSK"
 />
 <StrategyDashboard />
 </div>
 );
}
