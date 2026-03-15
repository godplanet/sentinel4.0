import { ApprovalCenter } from '@/features/security/ui/ApprovalCenter';
import { PageHeader } from '@/shared/ui';
import { ShieldAlert } from 'lucide-react';

export default function ApprovalCenterPage() {
 return (
 <div className="min-h-screen bg-canvas">
 <PageHeader
 title="4 Göz (Maker-Checker) Onay Merkezi"
 description="Bekleyen kritik işlem taleplerini onaylayın veya reddedin. Maker-Checker prensibi gereği ikinci yetkili onayı zorunludur."
 icon={ShieldAlert}
 />
 <div className="px-4 sm:px-6 lg:px-6 pb-10">
 <ApprovalCenter />
 </div>
 </div>
 );
}
