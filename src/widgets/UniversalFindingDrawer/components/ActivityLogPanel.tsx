import { fetchFindingHistory } from '@/entities/finding/api/history';
import type { FindingHistory } from '@/entities/finding/model/types';
import { cn } from '@/shared/utils/cn';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
 AlertCircle,
 Clock,
 FileText,
 GitBranch,
 Loader2,
 Paperclip,
 Shield,
 TrendingUp,
 User
} from 'lucide-react';
import React from 'react';

interface ActivityLogPanelProps {
 findingId: string | null;
}

const ACTION_LABELS: Record<string, string> = {
 STATE_CHANGE: 'Statü Değişti',
 CONTENT_EDIT: 'İçerik Düzenlendi',
 SEVERITY_CHANGE: 'Risk Skoru Değişti',
 ASSIGNMENT: 'Atama Yapıldı',
 ACTION_PLAN_ADDED: 'Aksiyon Planı Eklendi',
 COMMENT_ADDED: 'Gözden Geçirme Notu',
 AI_GENERATION: 'AI Tarafından Yaratıldı',
};

const getIconConfig = (type: string) => {
 switch (type) {
 case 'SEVERITY_CHANGE': return { icon: TrendingUp, color: 'amber' };
 case 'CONTENT_EDIT': return { icon: FileText, color: 'blue' };
 case 'STATE_CHANGE': return { icon: GitBranch, color: 'indigo' };
 case 'AI_GENERATION': return { icon: FileText, color: 'emerald' };
 case 'COMMENT_ADDED': return { icon: Shield, color: 'slate' };
 default: return { icon: Paperclip, color: 'slate' };
 }
};

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
 amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
 blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
 indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
 emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
 slate: { bg: 'bg-canvas', text: 'text-slate-600', border: 'border-slate-200' }
};

export const ActivityLogPanel: React.FC<ActivityLogPanelProps> = ({ findingId }) => {
 const { data: historyLogs, isLoading } = useQuery({
 queryKey: ['finding-history', findingId],
 queryFn: () => fetchFindingHistory(findingId!),
 enabled: !!findingId,
 staleTime: 60 * 1000,
 });

 const displayLogs = React.useMemo(() => {
 if (!historyLogs) return [];
 return (historyLogs || []).map((h: FindingHistory) => {
 const cfg = getIconConfig(h.change_type);
 return {
 id: h.id,
 timestamp: new Date(h.changed_at),
 action_type: h.change_type,
 actor: { name: h.changed_by || 'Bilinmiyor', role: h.changed_by_role || 'Sistem' },
 details: h.changed_fields || (h.change_description ? { Not: h.change_description } : null),
 icon: cfg.icon,
 color: cfg.color
 };
 });
 }, [historyLogs]);

 if (!findingId) {
 return (
 <div className="flex flex-col items-center justify-center h-full text-slate-400 p-5">
 <AlertCircle size={48} className="mb-4 opacity-20" />
 <p className="text-sm">Bulgu seçilmedi</p>
 </div>
 );
 }

 if (isLoading) {
 return (
 <div className="flex flex-col items-center justify-center p-12 space-y-4">
 <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
 <p className="text-sm text-slate-500 font-medium">Tarihçe yükleniyor...</p>
 </div>
 );
 }

 return (
 <div className="space-y-1 relative">
 {/* Timeline Line */}
 <div className="absolute left-[19px] top-8 bottom-0 w-[2px] bg-gradient-to-b from-slate-200 via-slate-100 to-transparent" />

 {(displayLogs || []).map((log, index) => {
 const colors = COLOR_MAP[log.color] || COLOR_MAP.slate;
 const Icon = log.icon;

 return (
 <div
 key={log.id}
 className="relative pl-12 pb-4 animate-in slide-in-from-left-2 fade-in duration-300"
 style={{ animationDelay: `${index * 50}ms` }}
 >
 {/* Icon */}
 <div
 className={cn(
 'absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm border-2 border-white z-10',
 colors.bg,
 colors.border
 )}
 >
 <Icon size={18} className={colors.text} />
 </div>

 {/* Content Card */}
 <div className="bg-surface rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4">
 {/* Header */}
 <div className="flex items-start justify-between mb-2">
 <div className="flex-1 min-w-0">
 <h4 className="text-sm font-bold text-slate-800">
 {ACTION_LABELS[log.action_type] || log.action_type}
 </h4>
 <div className="flex items-center gap-2 mt-1">
 <User size={12} className="text-slate-400" />
 <span className="text-xs text-slate-600 font-medium">
 {log.actor.name}
 </span>
 <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
 {log.actor.role}
 </span>
 </div>
 </div>

 {/* Timestamp */}
 <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0 ml-2">
 <Clock size={12} />
 <span>
 {formatDistanceToNow(log.timestamp, { addSuffix: true, locale: tr })}
 </span>
 </div>
 </div>

 {/* Details */}
 {log.details && (
 <div className="mt-3 p-2 bg-canvas rounded border border-slate-100">
 <dl className="space-y-1 text-xs">
 {Object.entries(log.details).map(([key, value]) => (
 <div key={key} className="flex items-start gap-2">
 <dt className="text-slate-500 font-medium capitalize min-w-[80px]">
 {key.replace(/_/g, ' ')}:
 </dt>
 <dd className="text-slate-700 font-semibold">
 {typeof value === 'object' ? JSON.stringify(value) : String(value)}
 </dd>
 </div>
 ))}
 </dl>
 </div>
 )}
 </div>
 </div>
 );
 })}

 {/* End Marker */}
 <div className="relative pl-12 pb-2">
 <div className="absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 border-2 border-white shadow-sm">
 <div className="w-2 h-2 bg-slate-400 rounded-full" />
 </div>
 <p className="text-xs text-slate-400 italic mt-3">Kayıt başlangıcı</p>
 </div>
 </div>
 );
};
