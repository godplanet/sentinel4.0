import { PageHeader } from '@/shared/ui';
import { StrategyDashboard } from '@/features/strategy/ui/StrategyDashboard';

export default function ObjectivesPage() {
  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Stratejik Hedefler"
        description="Kurumsal hedefler ve denetim departmanı stratejisinin uyumlandırılması"
        badge="MODÜL 2: STRATEJİ & RİSK"
      />
      <StrategyDashboard />
    </div>
  );
}
