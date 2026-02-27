import { PageHeader } from '@/shared/ui';
import { QuantDashboard } from '@/widgets/QuantDashboard';
import { Calculator } from 'lucide-react';

export default function QuantPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Kantitatif Risk Analizi"
        description="Monte Carlo Simulasyonu ve Finansal Risk Modelleme"
        icon={Calculator}
      />
      <QuantDashboard />
    </div>
  );
}
