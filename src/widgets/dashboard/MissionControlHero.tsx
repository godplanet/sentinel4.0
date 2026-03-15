import type { AIBrief, WelcomeSummary } from '@/entities/dashboard/model/types';
import { useUIStore } from '@/shared/stores/ui-store';
import clsx from 'clsx';
import { Activity, AlertCircle, AlertTriangle, Brain, Calendar, CheckCircle } from 'lucide-react';

interface MissionControlHeroProps {
 welcome: WelcomeSummary;
 aiBrief: AIBrief;
}

export const MissionControlHero = ({ welcome, aiBrief }: MissionControlHeroProps) => {
 const { sidebarColor } = useUIStore();

 const getSentimentConfig = (sentiment: AIBrief['sentiment']) => {
 switch (sentiment) {
 case 'critical':
 return {
 gradient: 'from-red-50 to-orange-50',
 border: 'border-red-200',
 icon: AlertCircle,
 iconColor: 'text-red-600',
 iconBg: 'bg-red-100',
 badgeColor: 'bg-red-100 text-red-700 border-red-300',
 textColor: 'text-red-900',
 subTextColor: 'text-red-700',
 };
 case 'warning':
 return {
 gradient: 'from-amber-50 to-orange-50',
 border: 'border-amber-200',
 icon: AlertTriangle,
 iconColor: 'text-amber-600',
 iconBg: 'bg-amber-100',
 badgeColor: 'bg-amber-100 text-amber-700 border-amber-300',
 textColor: 'text-amber-900',
 subTextColor: 'text-amber-700',
 };
 case 'positive':
 return {
 gradient: 'from-emerald-50 to-teal-50',
 border: 'border-emerald-200',
 icon: CheckCircle,
 iconColor: 'text-emerald-600',
 iconBg: 'bg-emerald-100',
 badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-300',
 textColor: 'text-emerald-900',
 subTextColor: 'text-emerald-700',
 };
 }
 };

 const config = getSentimentConfig(aiBrief.sentiment);
 const SentimentIcon = config.icon;

 const currentDate = new Date().toLocaleDateString('tr-TR', {
 weekday: 'long',
 year: 'numeric',
 month: 'long',
 day: 'numeric',
 });

 return (
 <div className="space-y-4">
 <div
 className="relative overflow-hidden rounded-2xl px-8 py-6 shadow-lg"
 style={{
 background: `linear-gradient(135deg, ${sidebarColor} 0%, ${adjustColor(sidebarColor, -15)} 100%)`,
 }}
 >
 <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

 <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-2">
 <Calendar className="text-white/50" size={14} />
 <p className="text-white/50 text-xs font-medium capitalize">{currentDate}</p>
 </div>

 <p className="text-white/60 text-xs font-medium mb-1">{welcome.welcomeMessage}</p>
 <h1 className="text-2xl font-bold text-white tracking-tight">
 {welcome.userName}
 </h1>
 <p className="text-white/70 text-sm mt-0.5">{welcome.role}</p>
 </div>

 <div className="flex items-center gap-3 bg-surface/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3">
 <Activity className="text-emerald-400" size={22} />
 <div>
 <p className="text-[10px] text-white/60 font-medium mb-0.5">Sistem Sagligi</p>
 <div className="flex items-center gap-2">
 <p className="text-2xl font-bold text-white">{welcome.systemHealth}%</p>
 <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
 </div>
 </div>
 </div>
 </div>
 </div>

 <div
 className={clsx(
 'bg-gradient-to-br border-2 rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md',
 config.gradient,
 config.border,
 )}
 >
 <div className="flex items-start gap-4">
 <div className="shrink-0">
 <div className={clsx('p-3 rounded-xl', config.iconBg)}>
 <Brain className={config.iconColor} size={24} />
 </div>
 </div>

 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-2 flex-wrap">
 <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 bg-surface/80 px-2 py-1 rounded-md border border-slate-200">
 {aiBrief.context}
 </span>
 <span className={clsx('flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md border', config.badgeColor)}>
 <SentimentIcon size={12} />
 {aiBrief.sentiment === 'critical' ? 'KRITIK' : aiBrief.sentiment === 'warning' ? 'UYARI' : 'OLUMLU'}
 </span>
 </div>

 <h3 className={clsx('text-base font-bold mb-1.5 leading-snug', config.textColor)}>
 {aiBrief.headline}
 </h3>

 <p className={clsx('text-sm leading-relaxed', config.subTextColor)}>
 {aiBrief.summary}
 </p>
 </div>
 </div>
 </div>
 </div>
 );
};

function adjustColor(color: string, amount: number): string {
 const usePound = color[0] === '#';
 const col = usePound ? color.slice(1) : color;
 const num = parseInt(col, 16);
 const r = Math.max(0, Math.min(255, (num >> 16) + amount));
 const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
 const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
 return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
}
