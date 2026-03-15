import type { DashboardKPI } from '@/entities/dashboard/model/types';
import clsx from 'clsx';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';

interface KPIGridProps {
 kpis: DashboardKPI[];
}

export const KPIGrid = ({ kpis }: KPIGridProps) => {
 const getTrendIcon = (direction: DashboardKPI['trendDirection']) => {
 switch (direction) {
 case 'up':
 return <TrendingUp size={18} />;
 case 'down':
 return <TrendingDown size={18} />;
 case 'flat':
 return <Minus size={18} />;
 }
 };

 const getTrendColorClass = (color: DashboardKPI['trendColor']) => {
 switch (color) {
 case 'red':
 return 'text-red-600 bg-red-50';
 case 'green':
 return 'text-green-600 bg-green-50';
 case 'gray':
 return 'text-slate-600 bg-canvas';
 }
 };

 return (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {(kpis || []).map((kpi) => (
 <div
 key={kpi.id}
 className="bg-surface rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
 >
 <div className="flex items-start justify-between mb-4">
 <p className="text-sm font-medium text-slate-600 leading-snug">{kpi.label}</p>
 <span
 className={clsx(
 'inline-flex items-center justify-center p-1.5 rounded-lg transition-all',
 getTrendColorClass(kpi.trendColor)
 )}
 >
 {getTrendIcon(kpi.trendDirection)}
 </span>
 </div>

 <p className="text-4xl font-bold text-primary tracking-tight">{kpi.value}</p>
 </div>
 ))}
 </div>
 );
};
