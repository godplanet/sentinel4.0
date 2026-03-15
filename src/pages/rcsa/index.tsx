import { RCSACampaignManager } from '@/features/rcsa/ui/RCSACampaignManager';
import { PageHeader } from '@/shared/ui';
import { ShieldAlert } from 'lucide-react';

export default function RCSAPage() {
 return (
 <div className="h-screen flex flex-col bg-canvas">
 <PageHeader
 title="RCSA Kampanya Yönetimi"
 subtitle="İş birimlerinden Risk & Control Self-Assessment verisini dalga bazlı toplayın."
 icon={ShieldAlert}
 />
 <div className="flex-1 overflow-auto p-4">
 <RCSACampaignManager />
 </div>
 </div>
 );
}

