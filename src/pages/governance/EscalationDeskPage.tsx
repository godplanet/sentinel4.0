import { CAEEscalationDesk } from '@/features/governance/ui/CAEEscalationDesk';
import { PageHeader } from '@/shared/ui';
import { Gavel } from 'lucide-react';

export default function EscalationDeskPage() {
 return (
 <div className="space-y-4">
 <PageHeader
 title="CAE Eskalasyon ve Karar Masası"
 description="Geciken kritik bulgu aksiyonlarının yönetimi ve komiteye arzı"
 icon={Gavel}
 />
 <CAEEscalationDesk />
 </div>
 );
}
