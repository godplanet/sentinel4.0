import type { KPICard } from '@/entities/dashboard/model/types';
import clsx from 'clsx';
import { AlertCircle, AlertTriangle, CheckCircle, Minus, TrendingDown, TrendingUp } from 'lucide-react';

interface KPITickerProps {
 kpis: KPICard[];
}

export const KPITicker = ({ kpis }: KPITickerProps) => {
 const getTrendIcon = (trend: KPICard['trend']) => {
 switch (trend) {
 case 'up':
 return TrendingUp;
 case 'down':
 return TrendingDown;
 case 'flat':
 return Minus;
 }
 };

 const getStatusConfig = (status: KPICard['status']) => {
 switch (status) {
 case 'success':
 return {
 icon: CheckCircle,
 bgColor: 'bg-emerald-500/10',
 textColor: 'text-emerald-600',
 borderColor: 'border-emerald-200',
 accentColor: 'bg-emerald-500',
 };
 case 'warning':
 return {
 icon: AlertTriangle,
 bgColor: 'bg-orange-500/10',
 textColor: 'text-orange-600',
 borderColor: 'border-orange-200',
 accentColor: 'bg-orange-500',
 };
 case 'danger':
 return {
 icon: AlertCircle,
 bgColor: 'bg-red-500/10',
 textColor: 'text-red-600',
 borderColor: 'border-red-200',
 accentColor: 'bg-red-500',
 };
 }
 };

 return (
 <div className="relative z-10">
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {(kpis || []).map((kpi) => {
 const TrendIcon = getTrendIcon(kpi.trend);
 const config = getStatusConfig(kpi.status);
 const StatusIcon = config.icon;

 return (
 <div
 key={kpi.id}
 className={clsx(
 'bg-surface rounded-xl border-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden',
 config.borderColor
 )}
 >
 <div className={clsx('h-1', config.accentColor)} />

 <div className="p-6">
 <div className="flex items-start justify-between mb-4">
 <div className="flex-1">
 <p className="text-sm font-semibold text-slate-600 leading-snug mb-2">{kpi.label}</p>
 <div className="flex items-baseline gap-2">
 <p className="text-4xl font-bold text-primary tracking-tight">{kpi.value}</p>
 <span className={clsx('inline-flex items-center gap-1 text-xs font-bold', config.textColor)}>
 <TrendIcon size={14} />
 </span>
 </div>
 </div>

 <div className={clsx('rounded-lg p-2', config.bgColor)}>
 <StatusIcon className={config.textColor} size={20} />
 </div>
 </div>

 <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
 <div
 className={clsx('h-full transition-all duration-1000', config.accentColor)}
 style={{ width: '75%' }}
 />
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
};
