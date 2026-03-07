import { PageHeader } from '@/shared/ui/PageHeader';
import { DraftResponder } from '@/widgets/DraftResponder';

export default function RegulatoryLobbyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Regulatory Lobbying AI"
        description="Resmi kurumlardan (BDDK, KVKK) gelen karar taslaklarına karşı Yönetim Kurulu ve LLM entegrasyonuyla otomatik hukuki görüş yanıtları tasarlar."
      />

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <DraftResponder />
      </div>
    </div>
  );
}
