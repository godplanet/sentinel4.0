import type { MyTask } from '@/entities/dashboard/model/types';
import clsx from 'clsx';
import { AlertCircle, Calendar, CheckCircle2, Clock, Eye, FileCheck } from 'lucide-react';

interface TaskWorkbenchProps {
 tasks: MyTask[];
}

export const TaskWorkbench = ({ tasks }: TaskWorkbenchProps) => {
 const getTaskIcon = (type: MyTask['type']) => {
 switch (type) {
 case 'approval':
 return <CheckCircle2 size={20} className="text-blue-600" />;
 case 'meeting':
 return <Calendar size={20} className="text-teal-600" />;
 case 'review':
 return <Eye size={20} className="text-orange-600" />;
 }
 };

 const getTypeLabel = (type: MyTask['type']) => {
 switch (type) {
 case 'approval':
 return 'Onay';
 case 'meeting':
 return 'Toplantı';
 case 'review':
 return 'İnceleme';
 }
 };

 const getTypeBgColor = (type: MyTask['type']) => {
 switch (type) {
 case 'approval':
 return 'bg-blue-50 text-blue-700 border-blue-200';
 case 'meeting':
 return 'bg-teal-50 text-teal-700 border-teal-200';
 case 'review':
 return 'bg-orange-50 text-orange-700 border-orange-200';
 }
 };

 const getStatusConfig = (status: MyTask['status']) => {
 switch (status) {
 case 'in-progress':
 return {
 badge: 'Devam Ediyor',
 color: 'bg-blue-100 text-blue-700 border-blue-300',
 };
 case 'pending':
 return {
 badge: 'Beklemede',
 color: 'bg-slate-100 text-slate-700 border-slate-300',
 };
 }
 };

 return (
 <div className="bg-surface rounded-xl border-2 border-slate-200 shadow-lg">
 <div className="border-b-2 border-slate-200 p-6 bg-gradient-to-r from-slate-50 to-white">
 <div className="flex items-center justify-between">
 <div>
 <h3 className="text-2xl font-bold text-primary mb-1">Günün Ajandası & Bekleyen İşler</h3>
 <div className="flex items-center gap-4 text-sm text-slate-600">
 <span className="flex items-center gap-1.5">
 <AlertCircle size={16} className="text-red-500" />
 <strong>{(tasks || []).filter((t) => t.priority === 'high').length}</strong> yüksek öncelik
 </span>
 <span className="flex items-center gap-1.5">
 <Clock size={16} className="text-blue-500" />
 <strong>{(tasks || []).filter((t) => t.status === 'in-progress').length}</strong> devam ediyor
 </span>
 </div>
 </div>
 <FileCheck className="text-slate-300" size={32} />
 </div>
 </div>

 <div className="p-6 space-y-3">
 {(tasks || []).map((task) => {
 const statusConfig = getStatusConfig(task.status);
 return (
 <div
 key={task.id}
 className={clsx(
 'group flex items-start gap-4 p-5 rounded-xl border-2 transition-all cursor-pointer',
 task.status === 'in-progress'
 ? 'border-blue-200 bg-blue-50/50 hover:border-blue-300 hover:shadow-md'
 : 'border-slate-200 bg-surface hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md'
 )}
 >
 <div className="shrink-0 mt-0.5">{getTaskIcon(task.type)}</div>

 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-2 flex-wrap">
 <span className={clsx('text-xs font-bold px-2.5 py-1 rounded-md border', getTypeBgColor(task.type))}>
 {getTypeLabel(task.type)}
 </span>
 <span className={clsx('text-xs font-bold px-2.5 py-1 rounded-md border', statusConfig.color)}>
 {statusConfig.badge}
 </span>
 {task.priority === 'high' && (
 <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-300 animate-pulse">
 <AlertCircle size={12} />
 ACİL
 </span>
 )}
 </div>

 <p className="text-base font-bold text-primary mb-2 group-hover:text-blue-600 transition-colors leading-snug">
 {task.title}
 </p>

 <div className="flex items-center gap-2 text-xs text-slate-500">
 <Clock size={14} />
 <span className="font-medium">Termin: {task.deadline}</span>
 </div>
 </div>

 <div className="shrink-0">
 <input
 type="checkbox"
 checked={task.status === 'in-progress'}
 readOnly
 className="w-6 h-6 rounded-md border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
 />
 </div>
 </div>
 );
 })}
 </div>

 <div className="border-t-2 border-slate-200 p-5 bg-canvas">
 <button className="w-full text-center text-sm font-bold text-blue-600 hover:text-white bg-surface hover:bg-blue-600 py-3 rounded-lg transition-all border-2 border-blue-600 shadow-sm hover:shadow-md">
 Tüm Görevleri Görüntüle →
 </button>
 </div>
 </div>
 );
};
