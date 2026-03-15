import { fetchFindingHistory } from '@/entities/finding/api/history';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { History, Loader2, Sparkles, User } from 'lucide-react';

interface HistoryPanelProps {
 findingId: string | null;
}

export function HistoryPanel({ findingId }: HistoryPanelProps) {
 const { data: history = [], isLoading } = useQuery({
 queryKey: ['finding-history', findingId],
 queryFn: () => fetchFindingHistory(findingId!),
 enabled: !!findingId,
 });


 return (
 <div className="h-full flex flex-col animate-in fade-in duration-300">

 <div className="bg-canvas border border-slate-200 rounded-xl p-4 mb-4 shrink-0 flex items-center gap-3">
 <History className="text-slate-500 w-6 h-6" />
 <div>
 <h3 className="font-bold text-slate-800 text-sm">Denetim İzi (Audit Trail)</h3>
 <p className="text-xs text-slate-500">Bu bulgu üzerinde yapılan tüm işlemlerin yasal kayıtları.</p>
 </div>
 </div>

 <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-20">
 {isLoading ? (
 <div className="flex items-center justify-center py-16 text-slate-400">
 <Loader2 size={24} className="animate-spin mr-2" />
 <span className="text-sm">Yükleniyor...</span>
 </div>
 ) : history.length === 0 ? (
 <div className="text-center py-16 text-slate-400">
 <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
 <p className="text-sm font-medium">Bu bulgu için henüz denetim izi kaydı bulunmuyor.</p>
 </div>
 ) : (
 <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
 {(history || []).map((item) => (
 <div key={item.id} className="relative pl-8 group">
 <div className={clsx(
 "absolute left-0 top-1 w-5 h-5 rounded-full border-2 bg-surface flex items-center justify-center z-10 transition-colors",
 item.change_type === 'AI_GENERATION' ? "border-purple-500 group-hover:bg-purple-50" : "border-blue-500 group-hover:bg-blue-50"
 )}>
 <div className={clsx("w-2 h-2 rounded-full", item.change_type === 'AI_GENERATION' ? "bg-purple-500" : "bg-blue-500")} />
 </div>

 <div className="bg-surface border border-slate-200 rounded-lg p-3 shadow-sm group-hover:border-blue-300 transition-all">
 <div className="flex justify-between items-start mb-1">
 <span className={clsx("text-xs font-bold px-2 py-0.5 rounded",
 item.change_type === 'STATE_CHANGE' ? "bg-blue-100 text-blue-700" :
 item.change_type === 'AI_GENERATION' ? "bg-purple-100 text-purple-700" :
 "bg-slate-100 text-slate-700"
 )}>
 {item.change_type.replace('_', ' ')}
 </span>
 <span className="text-[10px] font-medium text-slate-400">
 {new Date(item.changed_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
 </span>
 </div>

 <p className="text-xs text-slate-700 font-medium mb-2 leading-relaxed">
 {item.change_description}
 </p>

 <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
 <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
 {item.changed_by_role === 'SYSTEM' ? <Sparkles size={12} /> : <User size={12} />}
 {item.changed_by}
 </div>
 <span className="text-[10px] text-slate-300">•</span>
 <span className="text-[10px] text-slate-400">{new Date(item.changed_at).toLocaleDateString('tr-TR')}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}

 {history.length > 0 && (
 <div className="mt-8 text-center">
 <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Kayıtların Sonu</span>
 </div>
 )}
 </div>
 </div>
 );
}
