import { PageHeader } from '@/shared/ui/PageHeader';
import { ApexDashboard } from '@/widgets/ApexDashboard';

export default function GodsEyeViewPage() {
 return (
 <div className="space-y-4">
 <PageHeader
 title="Apex Komuta Merkezi"
 description="Sentinel GRC v3.0 God's Eye View – Entegre risk ağları, siber bulgular, KVKK açıklıkları ve denetim senaryolarının üst düzey konsolide yönetim kurulu özeti."
 />

 <div className="w-full">
 <ApexDashboard />
 </div>
 </div>
 );
}
