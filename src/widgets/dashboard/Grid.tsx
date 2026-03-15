import type { ExecutiveDashboardRow } from '@/entities/report/api/executive-dashboard';
import {
 calculateActionAging,
 calculateActionStatusCounts,
 calculateActionsByDepartment,
 calculateActionsByExtension,
 calculateActionsBySeverity,
 calculateActionsByYear,
 calculateFindingAging,
 calculateRegulatoryStatus
} from '@/entities/report/api/executive-dashboard';
import { useState } from 'react';
import {
 Area,
 AreaChart,
 Bar,
 BarChart,
 CartesianGrid,
 Cell,
 Legend,
 Pie,
 PieChart,
 ResponsiveContainer,
 Scatter,
 ScatterChart,
 Tooltip,
 XAxis, YAxis
} from 'recharts';

interface DashboardGridProps {
 data: ExecutiveDashboardRow[];
}

type TabType = 'action' | 'finding';

export default function DashboardGrid({ data }: DashboardGridProps) {
 const [activeTab, setActiveTab] = useState<TabType>('action');

 return (
 <div className="flex-1 bg-canvas p-8 overflow-y-auto">
 <div className="w-full px-4 sm:px-6 lg:px-8">
 <div className="mb-6">
 <h1 className="text-3xl font-bold text-primary mb-2">
 Yönetim Kokpiti
 </h1>
 <p className="text-gray-600">
 BDDK BS Yönetmeliği Madde 32 Uyumlu Raporlama
 </p>
 </div>

 <div className="flex gap-2 mb-6 border-b border-gray-200">
 <TabButton
 active={activeTab === 'action'}
 onClick={() => setActiveTab('action')}
 >
 Aksiyon Analizi
 </TabButton>
 <TabButton
 active={activeTab === 'finding'}
 onClick={() => setActiveTab('finding')}
 >
 Bulgu Takip
 </TabButton>
 </div>

 {activeTab === 'action' && <ActionAnalysisTab data={data} />}
 {activeTab === 'finding' && <FindingTrackingTab data={data} />}
 </div>
 </div>
 );
}

function TabButton({
 active,
 onClick,
 children
}: {
 active: boolean;
 onClick: () => void;
 children: React.ReactNode;
}) {
 return (
 <button
 onClick={onClick}
 className={`px-6 py-3 font-semibold text-sm transition-colors relative ${
 active
 ? 'text-pink-600 border-b-2 border-pink-600'
 : 'text-gray-600 hover:text-primary'
 }`}
 >
 {children}
 </button>
 );
}

function ActionAnalysisTab({ data }: { data: ExecutiveDashboardRow[] }) {
 const statusCounts = calculateActionStatusCounts(data);
 const actionsByYear = calculateActionsByYear(data);
 const actionsBySeverity = calculateActionsBySeverity(data);
 const actionsByDept = calculateActionsByDepartment(data);
 const actionsByExtension = calculateActionsByExtension(data);
 const regulatoryStatus = calculateRegulatoryStatus(data);

 const totalActions = (statusCounts || []).reduce((sum, item) => sum + item.count, 0);

 const statusWithOpenOverdue = (regulatoryStatus || []).reduce((acc, item) => {
 if (!acc[item.severity]) {
 acc[item.severity] = {
 severity: item.severity,
 vadesi_gelmemis: 0,
 vadesi_asilan: 0,
 vadesi_1yil_plus: 0
 };
 }
 if (item.status.includes('Gelmeyen')) {
 acc[item.severity].vadesi_gelmemis += item.count;
 } else if (item.status.includes('1 Yıldan Fazla')) {
 acc[item.severity].vadesi_1yil_plus += item.count;
 } else {
 acc[item.severity].vadesi_asilan += item.count;
 }
 return acc;
 }, {} as Record<string, any>);

 const regulatoryChartData = Object.values(statusWithOpenOverdue);

 const complianceData = [
 { name: 'Uyumlu', value: (data || []).filter(d => d.alert_level === 'GREEN').length },
 { name: 'Uyarı', value: (data || []).filter(d => d.alert_level === 'YELLOW').length },
 { name: 'Risk', value: (data || []).filter(d => d.alert_level === 'ORANGE').length },
 { name: 'Kritik', value: (data || []).filter(d => d.alert_level === 'RED').length }
 ];

 return (
 <div className="space-y-6">
 <div className="grid grid-cols-3 gap-6">
 <ChartCard title="Aksiyon Durumu">
 <div className="relative">
 <ResponsiveContainer width="100%" height={250}>
 <PieChart>
 <Pie
 data={statusCounts}
 dataKey="count"
 nameKey="status"
 cx="50%"
 cy="50%"
 innerRadius={60}
 outerRadius={90}
 paddingAngle={2}
 >
 {(statusCounts || []).map((entry, index) => (
 <Cell key={`cell-${index}`} fill={getPinkShade(index)} />
 ))}
 </Pie>
 <Tooltip />
 </PieChart>
 </ResponsiveContainer>
 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
 <div className="text-center" style={{ marginTop: '-15px' }}>
 <div className="text-4xl font-bold" style={{ color: '#ec4899' }}>{totalActions}</div>
 <div className="text-sm text-gray-600">Toplam</div>
 </div>
 </div>
 </div>
 </ChartCard>

 <ChartCard title="Yıllara Göre Açık Aksiyonlar">
 <ResponsiveContainer width="100%" height={280}>
 <BarChart data={actionsByYear}>
 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
 <XAxis dataKey="year" />
 <YAxis />
 <Tooltip />
 <Bar dataKey="count" fill="#ec4899" radius={[8, 8, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </ChartCard>

 <ChartCard title="Risk Seviyesine Göre Aksiyonlar">
 <ResponsiveContainer width="100%" height={280}>
 <BarChart data={actionsBySeverity}>
 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
 <XAxis dataKey="severity" />
 <YAxis />
 <Tooltip />
 <Bar dataKey="count" radius={[8, 8, 0, 0]}>
 {(actionsBySeverity || []).map((entry, index) => (
 <Cell key={`cell-${index}`} fill={getSeverityColor(entry.severity)} />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </ChartCard>
 </div>

 <div className="grid grid-cols-2 gap-6">
 <ChartCard title="BDDK Madde 32: Aksiyon Statüsü (Kritik Analiz)">
 <ResponsiveContainer width="100%" height={300}>
 <BarChart data={regulatoryChartData} layout="vertical">
 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
 <XAxis type="number" />
 <YAxis dataKey="severity" type="category" width={80} />
 <Tooltip />
 <Legend />
 <Bar dataKey="vadesi_gelmemis" stackId="a" fill="#3b82f6" name="Vadesi Gelmeyen" radius={[0, 4, 4, 0]} />
 <Bar dataKey="vadesi_asilan" stackId="a" fill="#f97316" name="Vadesi Aşılan" radius={[0, 4, 4, 0]} />
 <Bar dataKey="vadesi_1yil_plus" stackId="a" fill="#ef4444" name="Vadesi 1+ Yıl Aşılan" radius={[0, 4, 4, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </ChartCard>

 <ChartCard title="Birime Göre Aksiyon Yükü (Top 8)">
 <ResponsiveContainer width="100%" height={300}>
 <BarChart data={actionsByDept} layout="horizontal">
 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
 <XAxis type="number" />
 <YAxis dataKey="department" type="category" width={120} />
 <Tooltip />
 <Bar dataKey="count" fill="#ec4899" radius={[0, 8, 8, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </ChartCard>
 </div>

 <div className="grid grid-cols-2 gap-6">
 <ChartCard title="Aksiyon Erteleme Dağılımı">
 <ResponsiveContainer width="100%" height={280}>
 <BarChart data={actionsByExtension}>
 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
 <XAxis
 dataKey="extension_count"
 tickFormatter={(val) => val === 4 ? '4+' : val.toString()}
 />
 <YAxis />
 <Tooltip />
 <Bar dataKey="count" fill="#ec4899" radius={[8, 8, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </ChartCard>

 <ChartCard title="Genel Uyumluluk Durumu">
 <ResponsiveContainer width="100%" height={280}>
 <PieChart>
 <Pie
 data={complianceData}
 dataKey="value"
 nameKey="name"
 cx="50%"
 cy="50%"
 innerRadius={60}
 outerRadius={100}
 paddingAngle={3}
 >
 {(complianceData || []).map((entry, index) => (
 <Cell key={`cell-${index}`} fill={getAlertColor(entry.name)} />
 ))}
 </Pie>
 <Tooltip />
 <Legend />
 </PieChart>
 </ResponsiveContainer>
 </ChartCard>
 </div>
 </div>
 );
}

function FindingTrackingTab({ data }: { data: ExecutiveDashboardRow[] }) {
 const findingAging = calculateFindingAging(data);
 const actionAging = calculateActionAging(data);

 const scatterData = data
 .filter(d => d.action_status)
 .map(d => ({
 age: d.finding_age_days,
 overdue: d.days_overdue,
 severity: d.finding_severity
 }));

 return (
 <div className="space-y-6">
 <div className="grid grid-cols-2 gap-6">
 <ChartCard title="Bulgu Yaşlandırma (Mutabakat Tarihinden İtibaren)">
 <ResponsiveContainer width="100%" height={300}>
 <AreaChart data={findingAging}>
 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
 <XAxis dataKey="bucket" />
 <YAxis />
 <Tooltip />
 <Area
 type="monotone"
 dataKey="count"
 stroke="#ec4899"
 fill="#ec4899"
 fillOpacity={0.6}
 />
 </AreaChart>
 </ResponsiveContainer>
 <div className="mt-4 text-sm text-gray-600">
 <p className="font-semibold">Bulgu Yaşı:</p>
 <p>Mutabakat tarihinden bugüne kadar geçen süre</p>
 </div>
 </ChartCard>

 <ChartCard title="Aksiyon Gecikme Analizi (Gerçek Yaşlandırma)">
 <ResponsiveContainer width="100%" height={300}>
 <AreaChart data={actionAging}>
 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
 <XAxis dataKey="bucket" />
 <YAxis />
 <Tooltip />
 <Area
 type="monotone"
 dataKey="count"
 stroke="#f97316"
 fill="#f97316"
 fillOpacity={0.6}
 />
 </AreaChart>
 </ResponsiveContainer>
 <div className="mt-4 text-sm text-gray-600">
 <p className="font-semibold">Çifte Yaşlandırma:</p>
 <p>Orijinal hedef tarihten itibaren gecikme süresi</p>
 </div>
 </ChartCard>
 </div>

 <ChartCard title="Risk Seviyesi vs. Bulgu Yaşı (Scatter Plot)">
 <ResponsiveContainer width="100%" height={400}>
 <ScatterChart>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis
 type="number"
 dataKey="age"
 name="Bulgu Yaşı (gün)"
 label={{ value: 'Bulgu Yaşı (gün)', position: 'insideBottom', offset: -5 }}
 />
 <YAxis
 type="number"
 dataKey="overdue"
 name="Gecikme (gün)"
 label={{ value: 'Gecikme (gün)', angle: -90, position: 'insideLeft' }}
 />
 <Tooltip cursor={{ strokeDasharray: '3 3' }} />
 <Legend />
 <Scatter
 name="CRITICAL"
 data={(scatterData || []).filter(d => d.severity === 'CRITICAL')}
 fill="#ef4444"
 />
 <Scatter
 name="HIGH"
 data={(scatterData || []).filter(d => d.severity === 'HIGH')}
 fill="#f97316"
 />
 <Scatter
 name="MEDIUM"
 data={(scatterData || []).filter(d => d.severity === 'MEDIUM')}
 fill="#eab308"
 />
 <Scatter
 name="LOW"
 data={(scatterData || []).filter(d => d.severity === 'LOW')}
 fill="#22c55e"
 />
 </ScatterChart>
 </ResponsiveContainer>
 </ChartCard>
 </div>
 );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
 return (
 <div className="bg-surface rounded-xl shadow-sm border border-gray-200 p-6">
 <h3 className="text-lg font-semibold text-primary mb-4">{title}</h3>
 {children}
 </div>
 );
}

function getPinkShade(index: number): string {
 const shades = ['#ec4899', '#f472b6', '#f9a8d4', '#fbcfe8', '#fce7f3'];
 return shades[index % shades.length];
}

function getSeverityColor(severity: string): string {
 const colors: Record<string, string> = {
 'CRITICAL': '#ef4444',
 'HIGH': '#f97316',
 'MEDIUM': '#eab308',
 'LOW': '#22c55e'
 };
 return colors[severity] || '#6b7280';
}

function getAlertColor(name: string): string {
 const colors: Record<string, string> = {
 'Uyumlu': '#22c55e',
 'Uyarı': '#eab308',
 'Risk': '#f97316',
 'Kritik': '#ef4444'
 };
 return colors[name] || '#6b7280';
}
