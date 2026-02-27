import { PageHeader } from '@/shared/ui';
import { PBCManager } from '@/features/pbc/PBCManager';
import { ClipboardList } from 'lucide-react';

export default function PBCPage() {
  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <PageHeader
        title="PBC Talep Yonetimi"
        subtitle="Provided-by-Client belge talepleri ve takibi"
        icon={ClipboardList}
      />
      <div className="flex-1 overflow-auto p-6">
        <PBCManager />
      </div>
    </div>
  );
}
