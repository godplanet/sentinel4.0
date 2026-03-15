import { TemplateBuilder } from '@/features/admin/template-manager/ui/TemplateBuilder';
import { PageHeader } from '@/shared/ui';
import { LayoutTemplate } from 'lucide-react';

export default function TemplateManagerPage() {
 return (
 <div className="h-screen flex flex-col bg-canvas">
 <PageHeader
 title="Sablon Yoneticisi"
 subtitle="RKM, Bulgu ve Aksiyon sablonlarini yonet"
 icon={LayoutTemplate}
 />

 <div className="flex-1 overflow-auto p-4">
 <TemplateBuilder />
 </div>
 </div>
 );
}
