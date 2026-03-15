import { useConsentRecords, usePrivacyBreaches } from '@/features/data-privacy/api';
import { PageHeader } from '@/shared/ui/PageHeader';
import { DataFlowMap } from '@/widgets/DataFlowMap';
import { ShieldAlert, ShieldCheck, Users } from 'lucide-react';

export default function DataPrivacyPage() {
 const { data: consents = [] } = useConsentRecords();
 const { data: breaches = [] } = usePrivacyBreaches();

 // Aggregate Consent Metrics
 const totalCon = (consents || []).reduce((acc, curr) => acc + curr.total_users, 0);
 const totalRevoked = (consents || []).reduce((acc, curr) => acc + curr.revoked_users, 0);
 // Zero-Div safeguard
 const breachRatio = totalCon > 0 ? ((totalRevoked / totalCon) * 100).toFixed(1) : '0.0';

 return (
 <div className="space-y-4">
 <PageHeader
 title="KVKK & GDPR Veri Mahremiyeti"
 description="Kişisel veri akış (PII) haritası, ihlal yönetimi ve açık rıza onay istatistikleri."
 />

 {/* Primary KPI Row */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-center shadow-sm relative overflow-hidden">
 <Users className="text-indigo-500 mb-2" size={24} />
 <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Açık Rıza Verenler</p>
 <p className="text-2xl font-black text-slate-800 mt-1">
 {new Intl.NumberFormat('tr-TR').format(totalCon - totalRevoked)}
 </p>
 <div className="absolute right-0 bottom-0 p-4 opacity-10"><Users size={64}/></div>
 </div>
 <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-center shadow-sm">
 <ShieldAlert className="text-orange-500 mb-2" size={24} />
 <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">İptal / Çekilme Oranı</p>
 <p className="text-2xl font-black text-orange-600 mt-1">%{breachRatio}</p>
 </div>
 <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-center shadow-sm">
 <ShieldCheck className="text-red-500 mb-2" size={24} />
 <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Açık İhlal Dosyası</p>
 <p className="text-2xl font-black text-red-600 mt-1">{(breaches || []).filter(b => b.status === 'INVESTIGATING' || b.status === 'OPEN').length}</p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 
 {/* Left Col: Flow Map */}
 <div className="lg:col-span-2 space-y-4">
 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
 <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
 Veri Akış Haritası (Flow Mapper)
 </h2>
 <DataFlowMap />
 </div>
 </div>

 {/* Right Col: Breaches */}
 <div className="lg:col-span-1 space-y-4">
 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 h-full">
 <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 text-red-600">
 <ShieldAlert size={18} /> İhlal ve Olay Bildirimleri
 </h2>
 
 <div className="space-y-3">
 {breaches.length === 0 ? (
 <p className="text-xs text-slate-500 italic">Kayıtlı ihlal bulunmuyor.</p>
 ) : (breaches || []).map(b => (
 <div key={b.id} className="p-3 bg-red-50 border border-red-100 rounded-lg">
 <div className="flex justify-between items-start mb-1">
 <h4 className="text-xs font-bold text-red-700">{b.incident_title}</h4>
 <span className="text-[10px] uppercase font-bold text-red-500 border border-red-200 px-1 rounded bg-white">
 {b.status}
 </span>
 </div>
 <p className="text-[10px] text-red-600 leading-tight mb-2">{b.description}</p>
 <div className="flex justify-between items-center text-[10px] font-medium text-red-800/60 border-t border-red-200/50 pt-2">
 <span>Etkilenen: {new Intl.NumberFormat('tr-TR').format(b.affected_records)}</span>
 <span>{new Date(b.detected_at).toLocaleDateString('tr-TR')}</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 </div>
 </div>
 );
}
