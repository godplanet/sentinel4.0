import { ResourceAllocationView } from '@/features/resources/allocation/ResourceAllocationView';
import { CapacityPlanningView } from '@/features/resources/capacity/CapacityPlanningView';
import { ResourceMatcherView } from '@/features/resources/matcher/ResourceMatcherView';
import { ResourcePoolView } from '@/features/resources/pool/ResourcePoolView';
import { TalentRPGView } from '@/features/resources/rpg/TalentRPGView';
import { TalentMatrixView } from '@/features/resources/talent/TalentMatrixView';
import { TimesheetView } from '@/features/resources/timesheets/TimesheetView';
import { TalentDashboard } from '@/widgets/TalentDashboard';
import clsx from 'clsx';
import {
 Activity,
 BarChart3,
 CalendarCheck,
 ChevronDown,
 Clock,
 Download,
 Gamepad2,
 GraduationCap,
 LayoutGrid,
 Target,
 UserPlus,
 Users,
 Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type TabKey = 'overview' | 'pool' | 'matcher' | 'talent' | 'rpg' | 'allocation' | 'timesheets' | 'capacity';

interface TabConfig {
 key: TabKey;
 label: string;
 icon: React.ElementType;
 description: string;
 cta?: {
 label: string;
 icon: React.ElementType;
 onClick?: () => void;
 };
}

const RESOURCE_TABS: TabConfig[] = [
 {
 key: 'overview',
 label: 'Genel Bakış',
 icon: Activity,
 description: 'Ekip özeti, kapasite durumu ve yaklaşan görevler',
 },
 {
 key: 'pool',
 label: 'Kaynak Havuzu',
 icon: LayoutGrid,
 description: 'Denetçi profilleri, uygunluk ve yorgunluk analizi',
 cta: { label: 'Denetçi Ekle', icon: UserPlus },
 },
 {
 key: 'matcher',
 label: 'Akıllı Eşleştirme',
 icon: Target,
 description: 'AI destekli görev-denetçi uyum analizi',
 },
 {
 key: 'talent',
 label: 'Yetenek & CPE',
 icon: GraduationCap,
 description: 'Yetkinlik matrisi ve sürekli mesleki eğitim kayıtları',
 },
 {
 key: 'rpg',
 label: 'Ekip Analitiği',
 icon: Gamepad2,
 description: 'XP, performans, erozyon analizi ve ücret yönetimi',
 cta: { label: 'Kudos Gönder', icon: Zap },
 },
 {
 key: 'allocation',
 label: 'Kaynak Tahsisi',
 icon: CalendarCheck,
 description: 'Denetçi atama ve görev planlaması',
 },
 {
 key: 'timesheets',
 label: 'Çizelgeler',
 icon: Clock,
 description: 'Zaman kayıtları ve iş yükü takibi',
 },
 {
 key: 'capacity',
 label: 'Kapasite',
 icon: BarChart3,
 description: 'Ekip kapasitesi projeksiyonu ve planlama',
 cta: { label: 'Dışa Aktar', icon: Download },
 },
];

function ResourceHeader({ activeTab, onTabChange }: { activeTab: TabKey; onTabChange: (t: TabKey) => void }) {
 const tab = RESOURCE_TABS.find(t => t.key === activeTab);

 return (
 <div className="border-b border-slate-200 bg-surface">
 {/* Top row: Title + CTA */}
 <div className="px-4 pt-5 pb-0 flex items-start justify-between gap-4">
 <div className="flex items-center gap-3 min-w-0">
 {/* Icon badge */}
 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
 <Users className="w-5 h-5 text-white" />
 </div>
 <div className="min-w-0">
 <h1 className="text-lg font-bold text-slate-800 leading-tight">Yetenek Yönetimi</h1>
 {tab && (
 <p className="text-xs text-slate-500 truncate mt-0.5">{tab.description}</p>
 )}
 </div>
 </div>

 {/* CTA area */}
 <div className="flex items-center gap-2 flex-shrink-0">
 {tab?.cta && (
 <button
 onClick={tab.cta.onClick}
 className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
 >
 <tab.cta.icon className="w-4 h-4" />
 {tab.cta.label}
 </button>
 )}
 <button className="flex items-center gap-1.5 px-3 py-2 bg-canvas hover:bg-slate-100 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl shadow-sm transition-all">
 <Download className="w-4 h-4" />
 <span className="hidden sm:inline">Dışa Aktar</span>
 <ChevronDown className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>

 {/* Tab Row */}
 <div className="relative mt-3 overflow-x-auto no-scrollbar">
 <div className="flex gap-0.5 px-4 min-w-max">
 {RESOURCE_TABS.map((t) => {
 const Icon = t.icon;
 const isActive = activeTab === t.key;
 return (
 <button
 key={t.key}
 onClick={() => onTabChange(t.key)}
 className={clsx(
 'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-t-xl transition-all relative whitespace-nowrap',
 isActive
 ? 'text-blue-600 bg-blue-50 border border-slate-200 border-b-blue-50 -mb-px z-10'
 : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
 )}
 >
 <Icon className={clsx('w-4 h-4', isActive ? 'text-blue-500' : 'text-slate-400')} />
 {t.label}
 </button>
 );
 })}
 </div>
 {/* Right fade indicator */}
 <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-surface to-transparent pointer-events-none" />
 </div>
 </div>
 );
}

export default function ResourceManagementPage() {
 const [searchParams, setSearchParams] = useSearchParams();
 const tabFromUrl = (searchParams?.get?.('tab') ?? null) as TabKey | null;
 const [activeTab, setActiveTab] = useState<TabKey>(tabFromUrl || 'overview');
 const [openAddAuditor, setOpenAddAuditor] = useState(false);

 useEffect(() => {
 if (tabFromUrl && RESOURCE_TABS.some(t => t.key === tabFromUrl)) {
 setActiveTab(tabFromUrl);
 }
 }, [tabFromUrl]);

 const handleTabChange = (tabKey: TabKey) => {
 setActiveTab(tabKey);
 setSearchParams({ tab: tabKey });
 };

 // Wire "Denetçi Ekle" CTA onClick
 const poolTab = RESOURCE_TABS.find(t => t.key === 'pool');
 if (poolTab?.cta) poolTab.cta.onClick = () => { setActiveTab('pool'); setOpenAddAuditor(true); };

 const renderTabContent = () => {
 switch (activeTab) {
 case 'overview': return <TalentDashboard />;
 case 'pool': return <ResourcePoolView openAddModal={openAddAuditor} onAddModalClose={() => setOpenAddAuditor(false)} />;
 case 'matcher': return <ResourceMatcherView />;
 case 'talent': return <TalentMatrixView />;
 case 'rpg': return <TalentRPGView />;
 case 'allocation': return <ResourceAllocationView />;
 case 'timesheets': return <TimesheetView />;
 case 'capacity': return <CapacityPlanningView />;
 default: return <TalentDashboard />;
 }
 };

 return (
 <div className="h-screen flex flex-col bg-canvas overflow-hidden">
 <ResourceHeader activeTab={activeTab} onTabChange={handleTabChange} />

 {/* Main content: single uniform container, no double-padding */}
 <div className="flex-1 overflow-auto">
 <div className="w-full px-4 sm:px-4 lg:px-4 w-full px-4 py-4">
 {renderTabContent()}
 </div>
 </div>
 </div>
 );
}
