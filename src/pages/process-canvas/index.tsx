import { Workflow } from 'lucide-react';
import { PageHeader } from '@/shared/ui/PageHeader';
import { ProcessFlowEditor } from '@/features/process-canvas/ProcessFlowEditor';

export default function ProcessCanvasPage() {
  return (
    <div className="flex flex-col bg-canvas" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Başlık */}
      <div className="px-6 pt-5 pb-0 shrink-0">
        <PageHeader
          title="Süreç ve Risk Haritası"
          description="İnteraktif denetim evreni ve risk bulaşıcılık ağları modelleme kanvası."
          icon={Workflow}
        />
      </div>

      {/* Kanvas — geri kalan alanı tam kaplar */}
      <div className="flex-1 min-h-0 mx-6 mb-6 rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm">
        <ProcessFlowEditor />
      </div>
    </div>
  );
}
