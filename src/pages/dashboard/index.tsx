import { PulseCheckModal, usePulseCheck } from '@/features/talent-os/components/PulseCheckModal';
import { supabase } from '@/shared/api/supabase';
import { PageHeader } from '@/shared/ui/PageHeader';
import { EcosystemView } from '@/widgets/dashboard/EcosystemView';
import { KPITicker } from '@/widgets/dashboard/KPITicker';
import { LivePulse } from '@/widgets/dashboard/LivePulse';
import { MissionControlHero } from '@/widgets/dashboard/MissionControlHero';
import { RiskHeatMap } from '@/widgets/dashboard/RiskHeatMap';
import { StrategicAnalyticsView } from '@/widgets/dashboard/StrategicAnalyticsView';
import { TaskWorkbench } from '@/widgets/dashboard/TaskWorkbench';
import { TeamPulseWidget } from '@/widgets/dashboard/TeamPulseWidget';
import { PredictiveRadar } from '@/widgets/PredictiveRadar';
import { SystemHealthWidget } from '@/widgets/SystemHealth';
import clsx from 'clsx';
import { AnimatePresence } from 'framer-motion';
import { LayoutDashboard, PieChart, Radar, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

// FSD Kuralı: Veri çekme mantığı entities katmanından import edilir
import { buildKPICards, useDashboardStats } from '@/entities/dashboard/api/useDashboardStats';
import { useDashboardLiveData } from '@/entities/finding/useDashboardLiveData';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

type TabKey = 'mission-control' | 'strategic-analysis' | 'ecosystem';

const TABS = [
 { key: 'mission-control' as TabKey, label: 'Genel Bakış', icon: LayoutDashboard },
 { key: 'strategic-analysis' as TabKey, label: 'Stratejik Analiz', icon: PieChart },
 { key: 'ecosystem' as TabKey, label: 'Ekosistem & Gözetim', icon: Radar },
];

export default function DashboardPage() {
 const [activeTab, setActiveTab] = useState<TabKey>('mission-control');
 const [userId, setUserId] = useState<string>(DEMO_USER_ID);

 const { data: stats } = useDashboardStats();
 const { data: liveData } = useDashboardLiveData();
 const kpiCards = buildKPICards(stats);
 const { show, dismiss } = usePulseCheck(userId);

 useEffect(() => {
 supabase.auth.getUser().then(({ data }) => {
 if (data?.user?.id) setUserId(data.user.id);
 });
 }, []);

 const welcome = liveData?.welcome ?? { userName: 'Kullanıcı', role: 'Denetçi', welcomeMessage: 'Hoş geldiniz.', systemHealth: 0, lastLogin: '-' };
 const aiBrief = liveData?.aiBrief ?? { headline: 'Veriler yükleniyor...', summary: '', context: 'Sentinel Brain', sentiment: 'positive' as const };
 const tasks = liveData?.tasks ?? [];
 const activities = liveData?.activities ?? [];

 return (
 <>
 <div className="space-y-4">
 <PageHeader
 title="Yönetim Özeti"
 description="Sentinel GRC v3.0 - AI-Native Banking Audit Platform"
 icon={LayoutDashboard}
 action={
 <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm">
 <Sparkles size={16} />
 AI Asistanı
 </button>
 }
 />

 <div className="border-b border-slate-200 bg-surface rounded-xl shadow-sm">
 <div className="flex gap-1 px-4">
 {TABS.map((tab) => (
 <button
 key={tab.key}
 onClick={() => setActiveTab(tab.key)}
 className={clsx(
 'flex items-center gap-2 px-4 py-2 font-medium text-sm transition-all relative',
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

 {activeTab === 'mission-control' && (
 <div className="space-y-4">
 <MissionControlHero welcome={welcome} aiBrief={aiBrief} />

 <KPITicker kpis={kpiCards} />

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 <div className="lg:col-span-2">
 <TaskWorkbench tasks={tasks} />
 </div>

 <div className="space-y-4">
 <SystemHealthWidget />
 <LivePulse activities={activities} />
 <TeamPulseWidget />
 </div>
 </div>

 <PredictiveRadar />

 <RiskHeatMap />
 </div>
 )}

 {activeTab === 'strategic-analysis' && <StrategicAnalyticsView />}

 {activeTab === 'ecosystem' && <EcosystemView />}
 </div>

 {/* Pulse Check Modal */}
 <AnimatePresence>
 {show && (
 <PulseCheckModal key="pulse-modal" userId={userId} onClose={dismiss} />
 )}
 </AnimatePresence>
 </>
 );
}