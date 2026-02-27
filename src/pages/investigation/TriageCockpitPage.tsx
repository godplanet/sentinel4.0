import { Shield } from 'lucide-react';
import { PageHeader } from '@/shared/ui/PageHeader';
import { TriageCockpit } from '@/widgets/TriageCockpit';

export default function TriageCockpitPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Triaj Kokpiti - Akilli Ihbar Yonetimi"
        description="AI tabanli guvenilirlik skorlama ile ihbarlari onceliklendirin ve yonlendirin."
        icon={Shield}
      />
      <TriageCockpit />
    </div>
  );
}
