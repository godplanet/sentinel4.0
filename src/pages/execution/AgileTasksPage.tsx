import { fetchAgileEngagement, fetchAgileEngagements, updateEngagementStatus } from '@/features/audit-creation/api';
import { ENGAGEMENT_STATUS_LABELS } from '@/features/audit-creation/types';
import { BudgetTrackerCard } from '@/features/execution/ui/BudgetTrackerCard';
import { PageHeader } from '@/shared/ui';
import { SprintBoard } from '@/widgets/SprintBoard';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import {
 ArrowLeft,
 ArrowRight,
 Briefcase,
 Calendar,
 Kanban,
 LayoutGrid,
 PlayCircle,
 Plus,
 Target, Users,
 Zap,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const STATUS_COLORS: Record<string, string> = {
 PLANNED: 'bg-slate-100 text-slate-700 border-slate-300',
 ACTIVE: 'bg-blue-100 text-blue-700 border-blue-300',
 COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
};

type ViewMode = 'list' | 'kanban';

export default function AgileTasksPage() {
 const { id: engagementId } = useParams<{ id?: string }>();
 const navigate = useNavigate();
 const queryClient = useQueryClient();
 const [viewMode, setViewMode] = useState<ViewMode>(engagementId ? 'kanban' : 'list');

 const { data: engagements = [], isLoading: engagementsLoading } = useQuery({
 queryKey: ['agile-engagements'],
 queryFn: fetchAgileEngagements,
 });

 const { data: selectedEngagement, isLoading: engagementLoading } = useQuery({
 queryKey: ['agile-engagement', engagementId],
 queryFn: () => fetchAgileEngagement(engagementId!),
 enabled: !!engagementId,
 });

 const setEngagementActiveMutation = useMutation({
 mutationFn: (id: string) => updateEngagementStatus(id, 'ACTIVE'),
 onSuccess: (_data, id) => {
 queryClient.invalidateQueries({ queryKey: ['agile-engagement', id] });
 queryClient.invalidateQueries({ queryKey: ['agile-engagements'] });
 queryClient.invalidateQueries({ queryKey: ['sprints', id] });
 },
 });

 const handleStartEngagement = () => {
 if (selectedEngagement?.id && selectedEngagement.status === 'PLANNED') {
 setEngagementActiveMutation.mutate(selectedEngagement.id);
 }
 };

 const showKanban = viewMode === 'kanban' && engagementId;
 const showList = viewMode === 'list' || !engagementId;

 const handleSelectEngagement = (id: string) => {
 navigate(`/execution/agile/${id}`);
 setViewMode('kanban');
 };

 const handleBackToList = () => {
 navigate('/execution/agile');
 setViewMode('list');
 };

 const viewSwitcher = (
 <div className="flex items-center gap-2">
 <div className="flex rounded-lg border border-slate-200 bg-surface p-0.5 shadow-sm">
 <button
 type="button"
 onClick={() => {
 setViewMode('list');
 if (engagementId) navigate('/execution/agile');
 }}
 className={clsx(
 'flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold transition-all',
 showList ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-canvas'
 )}
 >
 <LayoutGrid size={14} />
 Liste
 </button>
 <button
 type="button"
 onClick={() => {
 setViewMode('kanban');
 if (engagementId) {
 // zaten kanban'dayız
 } else if (engagements.length > 0) {
 navigate(`/execution/agile/${engagements[0].id}`);
 }
 }}
 className={clsx(
 'flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold transition-all',
 showKanban ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-canvas'
 )}
 >
 <Kanban size={14} />
 Kanban
 </button>
 </div>
 <button
 onClick={() => navigate('/execution/new-engagement')}
 className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
 >
 <Plus size={16} /> Yeni Denetim
 </button>
 </div>
 );

 return (
 <div className="min-h-screen flex flex-col bg-canvas">
 <PageHeader
 title="Çevik Görevler"
 description={
 showKanban && selectedEngagement
 ? `${selectedEngagement.title} · ${selectedEngagement.total_sprints} Sprint`
 : 'Sprint tabanlı denetim görevlerinizi tek yerden yönetin'
 }
 icon={Zap}
 action={viewSwitcher}
 />

 {showList && (
 <div className="flex-1 p-4">
 {engagementsLoading ? (
 <div className="flex items-center justify-center h-48">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
 </div>
 ) : engagements.length === 0 ? (
 <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-surface">
 <Briefcase className="mx-auto text-slate-300 mb-4" size={48} />
 <p className="text-slate-600 font-medium mb-2">Henüz çevik denetim yok</p>
 <p className="text-slate-500 text-sm mb-4">Hizmet katalogundan yeni bir denetim oluşturun</p>
 <button
 onClick={() => navigate('/execution/new-engagement')}
 className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
 >
 <Plus size={14} /> Denetim Oluştur
 </button>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 {(engagements || []).map((eng, i) => (
 <motion.button
 key={eng.id}
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.05 }}
 onClick={() => handleSelectEngagement(eng.id)}
 className="text-left bg-surface rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden"
 >
 <div className="p-5">
 <div className="flex items-start justify-between mb-3">
 <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
 <Briefcase size={20} className="text-blue-600" />
 </div>
 <span
 className={clsx(
 'text-xs font-semibold px-2.5 py-1 rounded-lg border',
 STATUS_COLORS[eng.status]
 )}
 >
 {ENGAGEMENT_STATUS_LABELS[eng.status]}
 </span>
 </div>
 <h3 className="font-bold text-primary group-hover:text-blue-600 transition-colors mb-1">
 {eng.title}
 </h3>
 <p className="text-xs text-slate-500 line-clamp-2 mb-3">{eng.description}</p>
 <div className="flex items-center gap-4 text-xs text-slate-500">
 <span className="flex items-center gap-1">
 <Target size={12} /> {eng.total_sprints} Sprint
 </span>
 <span className="flex items-center gap-1">
 <Calendar size={12} /> {eng.start_date || '-'}
 </span>
 {Array.isArray(eng.team_members) && eng.team_members.length > 0 && (
 <span className="flex items-center gap-1">
 <Users size={12} /> {eng.team_members.length}
 </span>
 )}
 </div>
 </div>
 <div className="px-5 py-3 bg-canvas border-t border-slate-100 flex items-center justify-between">
 <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
 <Zap size={12} /> Sprint Panosu
 </span>
 <ArrowRight size={14} className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
 </div>
 </motion.button>
 ))}
 </div>
 )}
 </div>
 )}

 {showKanban && engagementId && (
 <>
 {engagementLoading ? (
 <div className="flex-1 flex items-center justify-center">
 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
 </div>
 ) : !selectedEngagement ? (
 <div className="flex-1 flex items-center justify-center p-4">
 <div className="text-center">
 <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
 <p className="text-slate-600 font-medium">Denetim bulunamadı</p>
 <button
 onClick={handleBackToList}
 className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
 >
 Listeye Dön
 </button>
 </div>
 </div>
 ) : (
 <div className="flex-1 flex gap-0 min-h-0">
 <div className="flex-1 overflow-auto p-4">
 <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
 <div className="flex items-center gap-3 flex-wrap">
 <button
 onClick={handleBackToList}
 className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 bg-surface border border-slate-200 rounded-lg hover:bg-canvas"
 >
 <ArrowLeft size={14} /> Tüm Görevler
 </button>
 <span
 className={clsx(
 'text-xs font-semibold px-2.5 py-1.5 rounded-lg border',
 STATUS_COLORS[selectedEngagement.status]
 )}
 >
 Denetim: {ENGAGEMENT_STATUS_LABELS[selectedEngagement.status]}
 </span>
 {selectedEngagement.status === 'PLANNED' && (
 <button
 type="button"
 onClick={handleStartEngagement}
 disabled={setEngagementActiveMutation.isPending}
 className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60"
 >
 <PlayCircle size={16} />
 {setEngagementActiveMutation.isPending ? 'Başlatılıyor...' : 'Denetimi Başlat'}
 </button>
 )}
 </div>
 <div className="flex items-center gap-4 text-sm text-slate-600">
 <span className="flex items-center gap-1.5">
 <Calendar size={14} className="text-slate-400" />
 {selectedEngagement.start_date} - {selectedEngagement.end_date}
 </span>
 <span className="flex items-center gap-1.5">
 <Target size={14} className="text-slate-400" />
 {selectedEngagement.total_sprints} Sprint
 </span>
 {Array.isArray(selectedEngagement.team_members) && selectedEngagement.team_members.length > 0 && (
 <span className="flex items-center gap-1.5">
 <Users size={14} className="text-slate-400" />
 {selectedEngagement.team_members.length} Denetçi
 </span>
 )}
 </div>
 </div>
 <SprintBoard engagementId={selectedEngagement.id} />
 </div>
 <div className="w-72 flex-shrink-0 border-l border-slate-200 bg-canvas overflow-y-auto p-4">
 <BudgetTrackerCard engagementId={selectedEngagement?.id} />
 </div>
 </div>
 )}
 </>
 )}

 {/* Kanban seçili, id yok, denetim var: hangi denetimin panosunu açacağını seç */}
 {viewMode === 'kanban' && !engagementId && engagements.length > 0 && (
 <div className="flex-1 p-4">
 <p className="text-sm text-slate-500 mb-4">Kanban için bir denetim seçin:</p>
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 {engagements.slice(0, 6).map((eng) => (
 <button
 key={eng.id}
 onClick={() => handleSelectEngagement(eng.id)}
 className="text-left bg-surface rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-md transition-all"
 >
 <h3 className="font-bold text-primary text-sm">{eng.title}</h3>
 <p className="text-xs text-slate-500 mt-1">
 {eng.total_sprints} Sprint · {ENGAGEMENT_STATUS_LABELS[eng.status]}
 </p>
 </button>
 ))}
 </div>
 </div>
 )}

 {/* Kanban seçili ama hiç denetim yok: boş durum */}
 {viewMode === 'kanban' && !engagementId && engagements.length === 0 && !engagementsLoading && (
 <div className="flex-1 p-4 flex items-center justify-center">
 <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-surface max-w-md">
 <Kanban className="mx-auto text-slate-300 mb-4" size={48} />
 <p className="text-slate-600 font-medium mb-2">Kanban için denetim gerekli</p>
 <p className="text-slate-500 text-sm mb-4">Önce en az bir çevik denetim oluşturun; ardından Kanban görünümünde sprint panosunu kullanabilirsiniz.</p>
 <div className="flex flex-wrap justify-center gap-2">
 <button
 type="button"
 onClick={() => { setViewMode('list'); }}
 className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
 >
 Liste görünümüne dön
 </button>
 <button
 onClick={() => navigate('/execution/new-engagement')}
 className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
 >
 <Plus size={14} /> Denetim Oluştur
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
