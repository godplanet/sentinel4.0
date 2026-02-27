import { PageHeader } from '@/shared/ui';
import { LayoutTemplate } from 'lucide-react';
import { TemplateBuilder } from '@/features/admin/template-manager/ui/TemplateBuilder';

export default function TemplateManagerPage() {
  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <PageHeader
        title="Sablon Yoneticisi"
        subtitle="RKM, Bulgu ve Aksiyon sablonlarini yonet"
        icon={LayoutTemplate}
      />

      <div className="flex-1 overflow-auto p-6">
        <TemplateBuilder />
      </div>
    </div>
  );
}
