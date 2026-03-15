import { fetchCPERecords } from '@/entities/resources/api';
import { PageHeader } from '@/shared/ui';
import { SkillMatrix } from '@/widgets/SkillMatrix';
import clsx from 'clsx';
import { Award, GraduationCap, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

type TabKey = 'talent' | 'cpe';

const TABS = [
 { key: 'talent' as TabKey, label: 'Yetenek Matrisi', icon: Users },
 { key: 'cpe' as TabKey, label: 'Eğitim (CPE)', icon: GraduationCap },
];

interface CPERecord {
 id: string;
 user_id: string;
 activity_name: string;
 cpe_points: number;
 completion_date: string;
}

export default function ResourcesPage() {
 const [activeTab, setActiveTab] = useState<TabKey>('talent');
 const [cpeRecords, setCpeRecords] = useState<CPERecord[]>([]);
 const [loading, setLoading] = useState(false);

 useEffect(() => {
 if (activeTab === 'cpe') {
 loadCPERecords();
 }
 }, [activeTab]);

 const loadCPERecords = async () => {
 try {
 setLoading(true);
 const data = await fetchCPERecords();
 setCpeRecords(data);
 } catch (error) {
 console.error('Failed to load CPE records:', error);
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="h-screen flex flex-col bg-canvas">
 <PageHeader
 title="Kaynak Yönetimi"
 subtitle="Yetenek, Beceri ve Eğitim Yönetimi"
 icon={Users}
 />

 <div className="border-b border-slate-200 bg-surface px-6">
 <div className="flex gap-1">
 {TABS.map((tab) => (
 <button
 key={tab.key}
 onClick={() => setActiveTab(tab.key)}
 className={clsx(
 'flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all relative',
 activeTab === tab.key
 ? 'text-blue-600 border-b-2 border-blue-600'
 : 'text-slate-600 hover:text-primary hover:bg-canvas'
 )}
 >
 <tab.icon size={16} />
 {tab.label}
 </button>
 ))}
 </div>
 </div>

 <div className="flex-1 overflow-auto p-4">
 {activeTab === 'talent' && (
 <div className="bg-surface rounded-lg shadow-sm border border-slate-200 p-4">
 <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
 <Users size={20} className="text-blue-600" />
 Denetçi Yetenek Matrisi
 </h3>
 <p className="text-slate-600 mb-4">
 Ekip üyelerinin yetkinlik ve sertifika bilgileri.
 </p>
 <SkillMatrix />
 </div>
 )}

 {activeTab === 'cpe' && (
 <div className="bg-surface rounded-lg shadow-sm border border-slate-200 p-4">
 <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
 <GraduationCap size={20} className="text-green-600" />
 Sürekli Mesleki Eğitim (CPE)
 </h3>
 <p className="text-slate-600 mb-4">
 Denetçilerin katıldığı eğitimler ve kazanılan CPE puanları.
 </p>

 {loading ? (
 <div className="flex items-center justify-center py-12">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
 </div>
 ) : cpeRecords.length === 0 ? (
 <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
 <Award className="mx-auto text-slate-400 mb-4" size={48} />
 <p className="text-slate-600 font-medium">Henüz CPE kaydı yok</p>
 <p className="text-slate-500 text-sm mt-2">İlk eğitim kaydınızı ekleyin</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-slate-200">
 <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Eğitim Adı</th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">CPE Puanı</th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Tamamlanma</th>
 </tr>
 </thead>
 <tbody>
 {(cpeRecords || []).map((record) => (
 <tr key={record.id} className="border-b border-slate-100 hover:bg-canvas">
 <td className="py-3 px-4 text-sm text-primary">{record.activity_name}</td>
 <td className="py-3 px-4">
 <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
 <Award size={12} />
 {record.cpe_points}
 </span>
 </td>
 <td className="py-3 px-4 text-sm text-slate-600">
 {new Date(record.completion_date).toLocaleDateString()}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 );
}
