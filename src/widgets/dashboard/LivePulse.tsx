import type { SystemActivity } from '@/entities/dashboard/model/types';
import clsx from 'clsx';
import { Activity, AlertCircle, BarChart3, Calendar, FileText, Plus, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LivePulseProps {
 activities: SystemActivity[];
}

export const LivePulse = ({ activities }: LivePulseProps) => {
 const getActivityIcon = (type: SystemActivity['type']) => {
 switch (type) {
 case 'finding':
 return <AlertCircle size={16} className="text-red-500" />;
 case 'report':
 return <FileText size={16} className="text-blue-500" />;
 case 'plan':
 return <Calendar size={16} className="text-teal-500" />;
 }
 };

 const getActivityBgColor = (type: SystemActivity['type']) => {
 switch (type) {
 case 'finding':
 return 'bg-red-50 border-red-200';
 case 'report':
 return 'bg-blue-50 border-blue-200';
 case 'plan':
 return 'bg-teal-50 border-teal-200';
 }
 };

 const quickActions = [
 {
 id: 'new-audit',
 label: 'Yeni Denetim',
 icon: Plus,
 path: '/execution',
 gradient: 'from-blue-600 to-cyan-600',
 },
 {
 id: 'create-report',
 label: 'Rapor Olustur',
 icon: BarChart3,
 path: '/reporting',
 gradient: 'from-slate-700 to-slate-900',
 },
 {
 id: 'risk-library',
 label: 'Risk Kutuphanesi',
 icon: Shield,
 path: '/strategy/risk-assessment',
 gradient: 'from-emerald-600 to-teal-700',
 },
 {
 id: 'team-management',
 label: 'Ekip Yonetimi',
 icon: Users,
 path: '/resources',
 gradient: 'from-amber-600 to-orange-700',
 },
 ];

 return (
 <div className="space-y-4">
 <div className="bg-surface rounded-xl border-2 border-slate-200 shadow-lg">
 <div className="border-b-2 border-slate-200 p-6 bg-gradient-to-r from-slate-50 to-white">
 <div className="flex items-center justify-between">
 <div>
 <h3 className="text-2xl font-bold text-primary mb-1">Canlı Sistem Akışı</h3>
 <p className="text-sm text-slate-600">Ekip aktiviteleri</p>
 </div>
 <div className="relative">
 <Activity className="text-emerald-500" size={32} />
 <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
 </div>
 </div>
 </div>

 <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
 {activities.slice(0, 8).map((activity, index) => (
 <div key={activity.id} className="relative">
 {index < activities.length - 1 && (
 <div className="absolute left-7 top-14 bottom-0 w-px bg-slate-200" />
 )}

 <div className="flex items-start gap-3">
 <div className={clsx('shrink-0 rounded-lg p-2 z-10 border', getActivityBgColor(activity.type))}>
 {getActivityIcon(activity.type)}
 </div>

 <div className="flex-1 min-w-0 pb-3">
 <div className="flex items-center gap-2 mb-1">
 <span className="font-bold text-sm text-primary">{activity.userName}</span>
 <span className="text-xs text-slate-400">{activity.timestamp}</span>
 </div>

 <p className="text-sm text-slate-600 leading-snug">
 {activity.action}{' '}
 <span className="font-semibold text-primary">"{activity.target}"</span>
 </p>
 </div>
 </div>
 </div>
 ))}
 </div>

 <div className="border-t-2 border-slate-200 p-4 bg-canvas">
 <button className="w-full text-center text-sm font-bold text-slate-600 hover:text-primary hover:bg-surface py-2.5 rounded-lg transition-all border-2 border-transparent hover:border-slate-300">
 Tüm Aktiviteleri Görüntüle →
 </button>
 </div>
 </div>

 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
 {(quickActions || []).map((action) => {
 const Icon = action.icon;
 return (
 <Link
 key={action.id}
 to={action.path}
 className={clsx(
 'group relative overflow-hidden rounded-xl p-6 text-center transition-all hover:-translate-y-1 hover:shadow-xl',
 `bg-gradient-to-br ${action.gradient}`
 )}
 >
 <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />

 <div className="relative flex flex-col items-center gap-3">
 <div className="bg-surface/20 backdrop-blur-sm rounded-lg p-3 group-hover:scale-110 transition-transform">
 <Icon className="text-white" size={28} />
 </div>
 <span className="text-sm font-bold text-white">{action.label}</span>
 </div>
 </Link>
 );
 })}
 </div>
 </div>
 );
};
