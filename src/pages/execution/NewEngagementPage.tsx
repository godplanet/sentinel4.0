import { Rocket } from 'lucide-react';
import { PageHeader } from '@/shared/ui';
import { EngagementWizard } from '@/features/audit-creation/EngagementWizard';

export default function NewEngagementPage() {
  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <PageHeader
        title="Yeni Denetim Olustur"
        description="Hizmet katalogundan denetim urunu secin, sprint plani ve ekip olusturun"
        icon={Rocket}
      />
      <div className="flex-1 overflow-auto p-6">
        <EngagementWizard />
      </div>
    </div>
  );
}
