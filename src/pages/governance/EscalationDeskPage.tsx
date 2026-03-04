import { PageHeader } from '@/shared/ui';
import { Gavel } from 'lucide-react';
import { CAEEscalationDesk } from '@/features/governance/ui/CAEEscalationDesk';

export default function EscalationDeskPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="CAE Eskalasyon ve Karar Masası"
        description="Geciken kritik bulgu aksiyonlarının yönetimi ve komiteye arzı"
        icon={Gavel}
      />
      <CAEEscalationDesk />
    </div>
  );
}
