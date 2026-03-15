import type { TaskUpdatePayload } from '@/features/audit-creation/api';
import {
 awardXPToAuditor,
 closeSprint,
 createTask,
 deleteTask,
 fetchSprints,
 fetchTasksBySprint,
 markTaskXPAwarded,
 updateTask,
 updateTaskStatus,
} from '@/features/audit-creation/api';
import type { AuditSprint, AuditTask, TaskPriority, TaskStatus } from '@/features/audit-creation/types';
import { PRIORITY_LABELS } from '@/features/audit-creation/types';
import { calculateFileHealth } from '@/features/qaip/HealthEngine';
import { FileHealthCard } from '@/widgets/FileHealthCard';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Clock, FileText, Lock, Plus, Users, X, Zap } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { SprintSelector } from './SprintSelector';

interface SprintBoardProps {
 engagementId: string;
}

const COLUMNS: {
 id: TaskStatus;
 title: string;
 icon: React.ComponentType<{ size?: number; className?: string }>;
 color: string;
}[] = [
 { id: 'TODO', title: 'Birikim', icon: FileText, color: 'bg-slate-100 border-slate-300' },
 { id: 'IN_PROGRESS', title: 'İşlemde', icon: Clock, color: 'bg-blue-50 border-blue-300' },
 { id: 'CLIENT_REVIEW', title: 'İnceleme (QAIP)', icon: Users, color: 'bg-amber-50 border-amber-300' },
 { id: 'DONE', title: 'Tamamlandı', icon: CheckCircle2, color: 'bg-emerald-50 border-emerald-300' },
];

const XP_PER_STORY_POINT = 50;

type DragMutationVars = {
 draggableId: string;
 newStatus: TaskStatus;
 task: AuditTask;
 sprintId: string;
};

export function SprintBoard({ engagementId }: SprintBoardProps) {
 const queryClient = useQueryClient();

 const [activeSprintId, setActiveSprintId] = useState<string | null>(null);
 const [xpToast, setXpToast] = useState<{ name: string; xp: number } | null>(null);
 const [addTaskOpen, setAddTaskOpen] = useState(false);
 const [newTaskTitle, setNewTaskTitle] = useState('');
 const [newTaskDescription, setNewTaskDescription] = useState('');
 const [newTaskStoryPoints, setNewTaskStoryPoints] = useState(1);
 const [editingTask, setEditingTask] = useState<AuditTask | null>(null);
 const [editTitle, setEditTitle] = useState('');
 const [editDescription, setEditDescription] = useState('');
 const [editStoryPoints, setEditStoryPoints] = useState(1);
 const [editPriority, setEditPriority] = useState<TaskPriority>('MEDIUM');
 const [deleteConfirmTask, setDeleteConfirmTask] = useState<AuditTask | null>(null);
 const toastTimeout = useRef<ReturnType<typeof setTimeout>>();

 // ── Sprints Sorgusu ─────────────────────────────────────────────────────────
 const { data: sprints = [], isLoading: sprintsLoading } = useQuery<AuditSprint[]>({
 queryKey: ['sprints', engagementId],
 queryFn: () => fetchSprints(engagementId),
 });

 // Sprints yüklendiğinde ilk aktif sprint'i seç
 useEffect(() => {
 if (sprints.length > 0 && !activeSprintId) {
 const active = sprints.find((s) => s.status === 'ACTIVE') ?? sprints[0];
 setActiveSprintId(active.id);
 }
 }, [sprints, activeSprintId]);

 const activeSprint = sprints.find((s) => s.id === activeSprintId) ?? null;

 // ── Görevler Sorgusu ─────────────────────────────────────────────────────────
 const { data: tasks = [] } = useQuery<AuditTask[]>({
 queryKey: ['sprint-tasks', activeSprintId],
 queryFn: () => fetchTasksBySprint(activeSprintId!),
 enabled: !!activeSprintId,
 });

 const health = useMemo(() => calculateFileHealth(tasks), [tasks]);

 // ── XP Toast ─────────────────────────────────────────────────────────────────
 const showXpToast = (name: string, xp: number) => {
 if (toastTimeout.current) clearTimeout(toastTimeout.current);
 setXpToast({ name, xp });
 toastTimeout.current = setTimeout(() => setXpToast(null), 3000);
 };

 // ── Drag Mutation (Optimistic Update) ────────────────────────────────────────
 const dragMutation = useMutation<
 void,
 Error,
 DragMutationVars,
 { previousTasks: AuditTask[] }
 >({
 mutationFn: async ({ draggableId, newStatus, task }) => {
 await updateTaskStatus(draggableId, newStatus);
 if (newStatus === 'DONE' && !task.xp_awarded && task.assigned_to) {
 const xpAmount = task.story_points * XP_PER_STORY_POINT;
 await Promise.all([
 markTaskXPAwarded(draggableId),
 awardXPToAuditor(task.assigned_to, xpAmount),
 ]);
 }
 },
 onMutate: async ({ draggableId, newStatus, sprintId }) => {
 // Çakışan refetch'leri iptal et
 await queryClient.cancelQueries({ queryKey: ['sprint-tasks', sprintId] });
 // Mevcut cache'i kaydet (rollback için)
 const previousTasks =
 queryClient.getQueryData<AuditTask[]>(['sprint-tasks', sprintId]) ?? [];
 // Optimistik güncelleme — arayüz anında değişir
 queryClient.setQueryData<AuditTask[]>(['sprint-tasks', sprintId], (old = []) =>
 (old || []).map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t))
 );
 return { previousTasks };
 },
 onSuccess: (_data, { draggableId, newStatus, task, sprintId }) => {
 if (newStatus === 'DONE' && !task.xp_awarded && task.assigned_to) {
 const xpAmount = task.story_points * XP_PER_STORY_POINT;
 // xp_awarded bayrağını cache'e yaz
 queryClient.setQueryData<AuditTask[]>(['sprint-tasks', sprintId], (old = []) =>
 (old || []).map((t) => (t.id === draggableId ? { ...t, xp_awarded: true } : t))
 );
 showXpToast(task.assigned_name || 'Denetci', xpAmount);
 }
 },
 onError: (_err, { sprintId }, context) => {
 // Hata olursa cache'i eski haline döndür
 if (context?.previousTasks) {
 queryClient.setQueryData(['sprint-tasks', sprintId], context.previousTasks);
 }
 },
 });

 // ── Sprint Kapatma Mutation ───────────────────────────────────────────────────
 const closeSprintMutation = useMutation({
 mutationFn: () => closeSprint(activeSprint!.id),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['sprints', engagementId] });
 },
 });

 // ── Yeni Görev Ekleme ─────────────────────────────────────────────────────────
 const createTaskMutation = useMutation({
 mutationFn: (vars: { title: string; description?: string; story_points?: number }) =>
 createTask({
 sprint_id: activeSprintId!,
 engagement_id: engagementId,
 title: vars.title,
 description: vars.description || undefined,
 story_points: vars.story_points ?? 1,
 }),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['sprint-tasks', activeSprintId] });
 setAddTaskOpen(false);
 setNewTaskTitle('');
 setNewTaskDescription('');
 setNewTaskStoryPoints(1);
 },
 });

 // ── Görev Düzenleme ───────────────────────────────────────────────────────────
 const updateTaskMutation = useMutation({
 mutationFn: ({ taskId, payload }: { taskId: string; payload: TaskUpdatePayload }) =>
 updateTask(taskId, payload),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['sprint-tasks', activeSprintId] });
 setEditingTask(null);
 },
 });

 const openEditModal = (task: AuditTask) => {
 setEditingTask(task);
 setEditTitle(task.title);
 setEditDescription(task.description || '');
 setEditStoryPoints(task.story_points);
 setEditPriority(task.priority);
 };

 const handleSaveEdit = () => {
 if (!editingTask) return;
 updateTaskMutation.mutate({
 taskId: editingTask.id,
 payload: {
 title: editTitle.trim(),
 description: editDescription.trim() || '',
 story_points: editStoryPoints,
 priority: editPriority,
 },
 });
 };

 // ── Görev Silme ───────────────────────────────────────────────────────────────
 const deleteTaskMutation = useMutation({
 mutationFn: (taskId: string) => deleteTask(taskId),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['sprint-tasks', activeSprintId] });
 setDeleteConfirmTask(null);
 },
 });

 const handleConfirmDelete = () => {
 if (deleteConfirmTask) {
 deleteTaskMutation.mutate(deleteConfirmTask.id);
 }
 };

 const handleAddTask = () => {
 const title = newTaskTitle.trim();
 if (!title || !activeSprintId) return;
 createTaskMutation.mutate({
 title,
 description: newTaskDescription.trim() || undefined,
 story_points: newTaskStoryPoints,
 });
 };

 // ── Kanban Sürükle-Bırak ─────────────────────────────────────────────────────
 const handleDragEnd = useCallback(
 (result: DropResult) => {
 const { destination, draggableId } = result;
 if (!destination || !activeSprintId) return;

 const newStatus = destination.droppableId as TaskStatus;
 const task = tasks.find((t) => t.id === draggableId);
 if (!task || task.status === newStatus) return;

 dragMutation.mutate({ draggableId, newStatus, task, sprintId: activeSprintId });
 },
 [tasks, activeSprintId, dragMutation]
 );

 const handleCloseSprint = () => {
 if (!activeSprint || !health.passesGate) return;
 closeSprintMutation.mutate();
 };

 const getTasksByStatus = (status: TaskStatus) => (tasks || []).filter((t) => t.status === status);

 const totalPoints = (tasks || []).reduce((s, t) => s + t.story_points, 0);
 const donePoints = tasks
 .filter((t) => t.status === 'DONE')
 .reduce((s, t) => s + t.story_points, 0);
 const velocity = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

 if (sprintsLoading) {
 return (
 <div className="flex items-center justify-center h-64">
 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
 </div>
 );
 }

 return (
 <div>
 <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
 <SprintSelector
 sprints={sprints}
 activeSprint={activeSprint}
 onSelect={(s) => setActiveSprintId(s.id)}
 />
 <div className="flex items-center gap-3">
 {activeSprint && activeSprint.status !== 'COMPLETED' && (
 <button
 type="button"
 onClick={() => setAddTaskOpen(true)}
 className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
 >
 <Plus size={16} /> Yeni Görev
 </button>
 )}
 <div className="flex items-center gap-4 text-sm">
 <span className="text-slate-500">
 <span className="font-bold text-primary">{donePoints}</span>/{totalPoints} SP
 </span>
 <div className="flex items-center gap-1.5">
 <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
 <div
 className="h-full bg-emerald-500 rounded-full transition-all"
 style={{ width: `${velocity}%` }}
 />
 </div>
 <span className="text-xs font-bold text-slate-700">{velocity}%</span>
 </div>
 </div>
 </div>
 </div>

 {activeSprint && (
 <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
 <div className="flex items-center justify-between">
 <div>
 <h3 className="text-sm font-bold text-blue-900">{activeSprint.title}</h3>
 <p className="text-xs text-blue-700 mt-0.5">{activeSprint.goal}</p>
 </div>
 <div className="text-xs text-blue-600">
 {activeSprint.start_date} - {activeSprint.end_date}
 </div>
 </div>
 </div>
 )}

 <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 mb-4">
 <FileHealthCard tasks={tasks} />

 {activeSprint && activeSprint.status !== 'COMPLETED' && (
 <div className="flex items-end">
 <button
 onClick={handleCloseSprint}
 disabled={!health.passesGate || closeSprintMutation.isPending}
 className={
 health.passesGate
 ? 'flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60'
 : 'flex items-center gap-2 px-5 py-2.5 bg-slate-300 text-slate-500 text-sm font-semibold rounded-lg cursor-not-allowed'
 }
 title={
 health.passesGate
 ? "Sprint'i kapat"
 : `Kalite Skoru Yetersiz: ${health.score}. En az 85 olmali.`
 }
 >
 {health.passesGate ? <CheckCircle2 size={16} /> : <Lock size={16} />}
 {closeSprintMutation.isPending ? 'Kapatiliyor...' : "Sprint'i Kapat"}
 </button>
 </div>
 )}
 </div>

 <DragDropContext onDragEnd={handleDragEnd}>
 <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 24rem)' }}>
 {(COLUMNS || []).map((col) => (
 <KanbanColumn
 key={col.id}
 columnId={col.id}
 title={col.title}
 icon={col.icon}
 color={col.color}
 tasks={getTasksByStatus(col.id)}
 onEditTask={openEditModal}
 onDeleteTask={(task) => setDeleteConfirmTask(task)}
 />
 ))}
 </div>
 </DragDropContext>

 {/* Yeni Görev Modal */}
 <AnimatePresence>
 {addTaskOpen && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
 onClick={() => setAddTaskOpen(false)}
 >
 <motion.div
 initial={{ scale: 0.95, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.95, opacity: 0 }}
 onClick={(e) => e.stopPropagation()}
 className="bg-surface rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-4"
 >
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-bold text-primary">Yeni Görev</h3>
 <button
 type="button"
 onClick={() => setAddTaskOpen(false)}
 className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
 >
 <X size={18} />
 </button>
 </div>
 <div className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1.5">Başlık *</label>
 <input
 type="text"
 value={newTaskTitle}
 onChange={(e) => setNewTaskTitle(e.target.value)}
 placeholder="Görev başlığı"
 className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1.5">Açıklama (isteğe bağlı)</label>
 <textarea
 value={newTaskDescription}
 onChange={(e) => setNewTaskDescription(e.target.value)}
 placeholder="Detay veya kabul kriterleri"
 rows={2}
 className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1.5">Story Point</label>
 <input
 type="number"
 min={1}
 max={21}
 value={newTaskStoryPoints}
 onChange={(e) => setNewTaskStoryPoints(Number(e.target.value) || 1)}
 className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-sm"
 />
 </div>
 </div>
 <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-200">
 <button
 type="button"
 onClick={() => setAddTaskOpen(false)}
 className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
 >
 İptal
 </button>
 <button
 type="button"
 onClick={handleAddTask}
 disabled={!newTaskTitle.trim() || createTaskMutation.isPending}
 className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
 >
 {createTaskMutation.isPending ? 'Ekleniyor...' : 'Görev Ekle'}
 </button>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Görev Düzenleme Modal */}
 <AnimatePresence>
 {editingTask && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
 onClick={() => setEditingTask(null)}
 >
 <motion.div
 initial={{ scale: 0.95, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.95, opacity: 0 }}
 onClick={(e) => e.stopPropagation()}
 className="bg-surface rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-4"
 >
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-bold text-primary">Görevi Düzenle</h3>
 <button
 type="button"
 onClick={() => setEditingTask(null)}
 className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
 >
 <X size={18} />
 </button>
 </div>
 <div className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1.5">Başlık *</label>
 <input
 type="text"
 value={editTitle}
 onChange={(e) => setEditTitle(e.target.value)}
 placeholder="Görev başlığı"
 className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1.5">Açıklama</label>
 <textarea
 value={editDescription}
 onChange={(e) => setEditDescription(e.target.value)}
 placeholder="Detay veya kabul kriterleri"
 rows={2}
 className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
 />
 </div>
 <div className="flex gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1.5">Story Point</label>
 <input
 type="number"
 min={1}
 max={21}
 value={editStoryPoints}
 onChange={(e) => setEditStoryPoints(Number(e.target.value) || 1)}
 className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-sm"
 />
 </div>
 <div className="flex-1">
 <label className="block text-xs font-bold text-slate-700 mb-1.5">Öncelik</label>
 <select
 value={editPriority}
 onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
 className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
 >
 {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((p) => (
 <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
 ))}
 </select>
 </div>
 </div>
 </div>
 <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-200">
 <button
 type="button"
 onClick={() => setEditingTask(null)}
 className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
 >
 İptal
 </button>
 <button
 type="button"
 onClick={handleSaveEdit}
 disabled={!editTitle.trim() || updateTaskMutation.isPending}
 className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
 >
 {updateTaskMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
 </button>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Görev Silme Onayı */}
 <AnimatePresence>
 {deleteConfirmTask && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
 onClick={() => setDeleteConfirmTask(null)}
 >
 <motion.div
 initial={{ scale: 0.95, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.95, opacity: 0 }}
 onClick={(e) => e.stopPropagation()}
 className="bg-surface rounded-xl shadow-xl border border-slate-200 w-full max-w-sm p-4"
 >
 <h3 className="text-lg font-bold text-primary mb-2">Görevi Sil</h3>
 <p className="text-sm text-slate-600 mb-4">
 <span className="font-medium text-primary">&quot;{deleteConfirmTask.title}&quot;</span> kalıcı olarak silinecek. Bu işlem geri alınamaz.
 </p>
 <div className="flex justify-end gap-2">
 <button
 type="button"
 onClick={() => setDeleteConfirmTask(null)}
 className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
 >
 İptal
 </button>
 <button
 type="button"
 onClick={handleConfirmDelete}
 disabled={deleteTaskMutation.isPending}
 className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50"
 >
 {deleteTaskMutation.isPending ? 'Siliniyor...' : 'Sil'}
 </button>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>

 <AnimatePresence>
 {xpToast && (
 <motion.div
 initial={{ opacity: 0, y: 50, scale: 0.9 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 20, scale: 0.9 }}
 className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 bg-amber-500 text-white rounded-xl shadow-2xl"
 >
 <Zap size={20} className="text-amber-200" />
 <div>
 <p className="text-sm font-bold">+{xpToast.xp} XP Kazanildi!</p>
 <p className="text-xs text-amber-100">{xpToast.name} gorevini tamamladi</p>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
