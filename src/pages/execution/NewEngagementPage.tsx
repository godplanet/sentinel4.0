import { EngagementWizard } from '@/features/audit-creation/EngagementWizard';
import { PageHeader } from '@/shared/ui';
import { Rocket } from 'lucide-react';

export default function NewEngagementPage() {
 return (
 <div className="h-screen flex flex-col bg-canvas">
 <PageHeader
 title="Yeni Denetim Olustur"
 description="Hizmet katalogundan denetim urunu secin, sprint plani ve ekip olusturun"
 icon={Rocket}
 />
 <div className="flex-1 overflow-auto p-4">
 <EngagementWizard />
 </div>
 </div>
 );
}
