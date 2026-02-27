import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { FileText, Clock, Users, CheckCircle2, Zap, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AuditSprint, AuditTask, TaskStatus } from '@/features/audit-creation/types';
import { fetchSprints, fetchTasksBySprint, updateTaskStatus, markTaskXPAwarded, awardXPToAuditor, closeSprint } from '@/features/audit-creation/api';
import { calculateFileHealth } from '@/features/qaip/HealthEngine';
import { FileHealthCard } from '@/widgets/FileHealthCard';
import { SprintSelector } from './SprintSelector';
import { KanbanColumn } from './KanbanColumn';

interface SprintBoardProps {
  engagementId: string;
}

const COLUMNS: { id: TaskStatus; title: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string }[] = [
  { id: 'TODO',          title: 'Birikim',          icon: FileText,    color: 'bg-slate-100 border-slate-300' },
  { id: 'IN_PROGRESS',   title: 'İşlemde',           icon: Clock,       color: 'bg-blue-50 border-blue-300' },
  { id: 'CLIENT_REVIEW', title: 'İnceleme (QAIP)',   icon: Users,       color: 'bg-amber-50 border-amber-300' },
  { id: 'DONE',          title: 'Tamamlandı',        icon: CheckCircle2,color: 'bg-emerald-50 border-emerald-300' },
];

const XP_PER_STORY_POINT = 50;

export function SprintBoard({ engagementId }: SprintBoardProps) {
  const [sprints, setSprints] = useState<AuditSprint[]>([]);
  const [activeSprint, setActiveSprint] = useState<AuditSprint | null>(null);
  const [tasks, setTasks] = useState<AuditTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [xpToast, setXpToast] = useState<{ name: string; xp: number } | null>(null);
  const [closing, setClosing] = useState(false);
  const toastTimeout = useRef<ReturnType<typeof setTimeout>>();

  const health = useMemo(() => calculateFileHealth(tasks), [tasks]);

  useEffect(() => {
    loadSprints();
  }, [engagementId]);

  useEffect(() => {
    if (activeSprint) loadTasks(activeSprint.id);
  }, [activeSprint?.id]);

  const loadSprints = async () => {
    try {
      setLoading(true);
      const data = await fetchSprints(engagementId);
      setSprints(data);
      const active = data.find((s) => s.status === 'ACTIVE') || data[0] || null;
      setActiveSprint(active);
    } catch (err) {
      console.error('Failed to load sprints:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async (sprintId: string) => {
    try {
      const data = await fetchTasksBySprint(sprintId);
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  const showXpToast = (name: string, xp: number) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setXpToast({ name, xp });
    toastTimeout.current = setTimeout(() => setXpToast(null), 3000);
  };

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const newStatus = destination.droppableId as TaskStatus;
    const task = tasks.find((t) => t.id === draggableId);
    if (!task || task.status === newStatus) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t))
    );

    try {
      await updateTaskStatus(draggableId, newStatus);

      if (newStatus === 'DONE' && !task.xp_awarded && task.assigned_to) {
        const xpAmount = task.story_points * XP_PER_STORY_POINT;
        await Promise.all([
          markTaskXPAwarded(draggableId),
          awardXPToAuditor(task.assigned_to, xpAmount),
        ]);

        setTasks((prev) =>
          prev.map((t) => (t.id === draggableId ? { ...t, xp_awarded: true } : t))
        );
        showXpToast(task.assigned_name || 'Denetci', xpAmount);
      }
    } catch (err) {
      console.error('Failed to update task:', err);
      if (activeSprint) loadTasks(activeSprint.id);
    }
  }, [tasks, activeSprint]);

  const handleCloseSprint = async () => {
    if (!activeSprint || !health.passesGate) return;
    setClosing(true);
    try {
      await closeSprint(activeSprint.id);
      setSprints((prev) =>
        prev.map((s) => (s.id === activeSprint.id ? { ...s, status: 'COMPLETED' as const } : s))
      );
      setActiveSprint((prev) => prev ? { ...prev, status: 'COMPLETED' as const } : prev);
    } catch (err) {
      console.error('Failed to close sprint:', err);
    } finally {
      setClosing(false);
    }
  };

  const getTasksByStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  const totalPoints = tasks.reduce((s, t) => s + t.story_points, 0);
  const donePoints = tasks.filter((t) => t.status === 'DONE').reduce((s, t) => s + t.story_points, 0);
  const velocity = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SprintSelector sprints={sprints} activeSprint={activeSprint} onSelect={setActiveSprint} />
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-500">
            <span className="font-bold text-slate-900">{donePoints}</span>/{totalPoints} SP
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${velocity}%` }} />
            </div>
            <span className="text-xs font-bold text-slate-700">{velocity}%</span>
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
              disabled={!health.passesGate || closing}
              className={
                health.passesGate
                  ? 'flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60'
                  : 'flex items-center gap-2 px-5 py-2.5 bg-slate-300 text-slate-500 text-sm font-semibold rounded-lg cursor-not-allowed'
              }
              title={health.passesGate ? 'Sprint\'i kapat' : `Kalite Skoru Yetersiz: ${health.score}. En az 85 olmali.`}
            >
              {health.passesGate ? (
                <CheckCircle2 size={16} />
              ) : (
                <Lock size={16} />
              )}
              {closing ? 'Kapatiliyor...' : 'Sprint\'i Kapat'}
            </button>
          </div>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 24rem)' }}>
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              columnId={col.id}
              title={col.title}
              icon={col.icon}
              color={col.color}
              tasks={getTasksByStatus(col.id)}
            />
          ))}
        </div>
      </DragDropContext>

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
