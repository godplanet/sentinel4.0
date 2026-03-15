import { PageHeader } from '@/shared/ui/PageHeader';
import { APIGatewayRadar } from '@/widgets/APIGatewayRadar';

export default function OpenBankingApiPage() {
 return (
 <div className="space-y-4">
 <PageHeader
 title="Open Banking & API Security Auditor"
 description="PSD2 uyumlu açık bankacılık servislerinde API Gateway trafik izleme, erişim belirteçleri (Token) ve ihlal radar modülü."
 />

 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
 <APIGatewayRadar />
 </div>
 </div>
 );
}
