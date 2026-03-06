/**
 * SENTINEL GRC v3.0 — Task Command Widget
 * ========================================
 * MS To Do klonu: 3-sütun layout (Liste Sidebar | Görev Listesi | Detay Drawer)
 *
 * Tasarım Felsefesi:
 *   - %100 LIGHT MODE — kesinlikle dark mode yok
 *   - Apple Glassmorphism: bg-white/70 + backdrop-blur-xl + border-white/80
 *   - Zen & Enterprise Clean: slate-50 zemin, slate-800 metin, ferah boşluklar
 *   - Smooth transitions: framer-motion, sayfa yenilemesi yok
 */

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Star, Calendar, List, Plus, Search, CheckCircle2, Circle,
  StarOff, ChevronRight, X, Trash2, AlignLeft, Bell, Loader2,
  RefreshCw, Link2, FileText, Tag, AlertCircle, Check, SunMedium
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useTaskLists, useTasks, useTaskMutation } from '@/entities/task/api/task-api';
import type { SentinelTask, TaskList, CreateTaskInput } from '@/entities/task/types';
import { SMART_LIST_IDS } from '@/entities/task/types';

// ─── Yardımcı: tarih formatı ──────────────────────────────────────────────────

function formatDate(date: string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  const today = new Date();
  const diff = Math.floor((d.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return 'Bugün';
  if (diff === 1) return 'Yarın';
  if (diff === -1) return 'Dün';
  if (diff < -1) return `${Math.abs(diff)} gün gecikti`;
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

function isOverdue(date: string | null | undefined): boolean {
  if (!date) return false;
  return new Date(date) < new Date(new Date().toDateString());
}

// ─── Liste Simgesi ────────────────────────────────────────────────────────────

const SMART_ICONS: Record<string, React.ElementType> = {
  'Günüm': Sun,
  'Önemli': Star,
  'Planlı': Calendar,
  'Tüm Görevler': List,
};

// ─── Sidebar: Liste Navigasyonu ───────────────────────────────────────────────

interface SidebarProps {
  lists: TaskList[];
  activeListId: string | null;
  onSelect: (id: string) => void;
}

function Sidebar({ lists, activeListId, onSelect }: SidebarProps) {
  const smartLists = (lists || []).filter((l) => l?.is_smart);
  const customLists = (lists || []).filter((l) => !l?.is_smart);

  return (
    <aside
      className="w-64 flex-shrink-0 flex flex-col h-full"
      style={{
        background: 'rgba(248,250,252,0.8)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(226,232,240,0.8)',
      }}
    >
      {/* Başlık */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-base font-black text-slate-800 tracking-tight">Task Command</h1>
        <p className="text-xs text-slate-400 mt-0.5">Sentinel GRC v3.0</p>
      </div>

      {/* Arama */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 border border-slate-200/60 shadow-sm">
          <Search size={13} className="text-slate-400" />
          <span className="text-sm text-slate-400">Ara...</span>
        </div>
      </div>

      {/* Akıllı Listeler */}
      <div className="px-3">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-2 mb-1">
          Akıllı Listeler
        </p>
        {(smartLists || []).map((list) => {
          const Icon = SMART_ICONS[list?.name ?? ''] ?? List;
          const isActive = activeListId === list?.id;
          return (
            <button
              key={list?.id}
              onClick={() => onSelect(list?.id ?? '')}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all mb-0.5',
                isActive
                  ? 'bg-white shadow-sm border border-slate-200/60 text-slate-800'
                  : 'text-slate-600 hover:bg-white/60'
              )}
            >
              <Icon
                size={16}
                style={{ color: list?.color ?? '#6366f1' }}
              />
              <span className="text-sm font-medium flex-1">{list?.name ?? '—'}</span>
            </button>
          );
        })}
      </div>

      {/* Özel Listeler */}
      {customLists.length > 0 && (
        <div className="px-3 mt-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-2 mb-1">
            Listelerim
          </p>
          {(customLists || []).map((list) => {
            const isActive = activeListId === list?.id;
            return (
              <button
                key={list?.id}
                onClick={() => onSelect(list?.id ?? '')}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all mb-0.5',
                  isActive
                    ? 'bg-white shadow-sm border border-slate-200/60 text-slate-800'
                    : 'text-slate-600 hover:bg-white/60'
                )}
              >
                <span className="text-base leading-none">{list?.icon ?? '📋'}</span>
                <span className="text-sm font-medium flex-1">{list?.name ?? '—'}</span>
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
}

// ─── Magic Input ──────────────────────────────────────────────────────────────

interface MagicInputProps {
  listId: string | null;
  onSubmit: (input: CreateTaskInput) => void;
  isLoading: boolean;
}

function MagicInput({ listId, onSubmit, isLoading }: MagicInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = value?.trim() ?? '';
    if (!trimmed || isLoading) return;

    const isMyDay = [SMART_LIST_IDS['my-day']].includes(listId ?? '');
    const isImportant = [SMART_LIST_IDS['important']].includes(listId ?? '');

    onSubmit({
      title: trimmed,
      list_id: listId,
      is_my_day: isMyDay,
      is_important: isImportant,
    });
    setValue('');
    inputRef.current?.focus();
  }, [value, listId, isLoading, onSubmit]);

  return (
    <div
      className="mx-4 mb-4 flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all"
      style={{
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        border: '1.5px solid rgba(226,232,240,0.8)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}
    >
      <button
        onClick={handleSubmit}
        disabled={isLoading || !value.trim()}
        className={clsx(
          'w-7 h-7 rounded-lg flex items-center justify-center transition-all flex-shrink-0',
          value.trim()
            ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-200'
            : 'bg-slate-100 text-slate-400'
        )}
      >
        {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={14} />}
      </button>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Görev ekle..."
        className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none leading-relaxed"
      />
    </div>
  );
}

// ─── Görev Satırı ─────────────────────────────────────────────────────────────

interface TaskRowProps {
  task: SentinelTask;
  isSelected: boolean;
  onSelect: (task: SentinelTask) => void;
  onToggleComplete: (task: SentinelTask) => void;
  onToggleImportant: (task: SentinelTask) => void;
}

function TaskRow({ task, isSelected, onSelect, onToggleComplete, onToggleImportant }: TaskRowProps) {
  const isCompleted = task?.status === 'completed';
  const overdue = isOverdue(task?.due_date) && !isCompleted;
  const hasLink = !!(task?.linked_entity_type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className={clsx(
        'group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all',
        isSelected
          ? 'bg-indigo-50/80 border border-indigo-100'
          : 'hover:bg-white/80 hover:border hover:border-slate-100',
        isCompleted && 'opacity-60'
      )}
      onClick={() => onSelect(task)}
    >
      {/* Toggle Complete */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleComplete(task); }}
        className="flex-shrink-0 text-slate-300 hover:text-indigo-500 transition-colors"
        aria-label="Tamamlandı işaretle"
      >
        {isCompleted
          ? <CheckCircle2 size={20} className="text-indigo-400" />
          : <Circle size={20} />
        }
      </button>

      {/* Başlık */}
      <div className="flex-1 min-w-0">
        <p className={clsx(
          'text-sm text-slate-800 leading-snug truncate',
          isCompleted && 'line-through text-slate-400'
        )}>
          {task?.title ?? '—'}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {task?.due_date && (
            <span className={clsx(
              'text-xs flex items-center gap-1',
              overdue ? 'text-red-500 font-medium' : 'text-slate-400'
            )}>
              <Calendar size={10} />
              {formatDate(task?.due_date)}
            </span>
          )}
          {hasLink && (
            <span className="text-[10px] text-indigo-500 flex items-center gap-1 font-medium bg-indigo-50 px-1.5 py-0.5 rounded-full">
              <Link2 size={8} />
              {task?.linked_entity_label ?? task?.linked_entity_type}
            </span>
          )}
        </div>
      </div>

      {/* Önemli yıldız */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleImportant(task); }}
        className={clsx(
          'flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity',
          task?.is_important && 'opacity-100'
        )}
        aria-label="Önemli işaretle"
      >
        {task?.is_important
          ? <Star size={16} className="text-amber-400 fill-amber-400" />
          : <StarOff size={16} className="text-slate-300" />
        }
      </button>
    </motion.div>
  );
}

// ─── Detay Drawer ─────────────────────────────────────────────────────────────

interface TaskDetailDrawerProps {
  task: SentinelTask | null;
  onClose: () => void;
  onUpdate: (input: { id: string } & Partial<SentinelTask>) => void;
  onDelete: (id: string) => void;
  onToggleImportant: (task: SentinelTask) => void;
  onToggleMyDay: (task: SentinelTask) => void;
}

function TaskDetailDrawer({
  task,
  onClose,
  onUpdate,
  onDelete,
  onToggleImportant,
  onToggleMyDay,
}: TaskDetailDrawerProps) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(task?.notes ?? '');
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(task?.title ?? '');

  if (!task) return null;

  const handleSaveTitle = () => {
    if (title?.trim() && title?.trim() !== task?.title) {
      onUpdate({ id: task.id, title: title.trim() });
    }
    setEditingTitle(false);
  };

  const handleSaveNotes = () => {
    onUpdate({ id: task.id, notes: notes ?? null });
    setEditingNotes(false);
  };

  return (
    <motion.aside
      key={task?.id}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="w-80 flex-shrink-0 h-full flex flex-col"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(24px)',
        borderLeft: '1px solid rgba(226,232,240,0.7)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          {/* Görev Başlığı */}
          {editingTitle ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
              className="flex-1 text-base font-bold text-slate-800 outline-none bg-slate-50 rounded-lg px-2 py-1 leading-snug"
            />
          ) : (
            <h2
              onClick={() => { setTitle(task?.title ?? ''); setEditingTitle(true); }}
              className={clsx(
                'flex-1 text-base font-bold text-slate-800 leading-snug cursor-text',
                task?.status === 'completed' && 'line-through text-slate-400'
              )}
            >
              {task?.title ?? '—'}
            </h2>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* İçerik */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

        {/* Günüm / Önemli */}
        <div className="space-y-1">
          <button
            onClick={() => onToggleMyDay(task)}
            className={clsx(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
              task?.is_my_day
                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                : 'text-slate-500 hover:bg-slate-50'
            )}
          >
            <SunMedium size={15} className={task?.is_my_day ? 'text-amber-500' : 'text-slate-400'} />
            {task?.is_my_day ? 'Günüm\'e eklendi' : 'Günüm\'e ekle'}
          </button>
          <button
            onClick={() => onToggleImportant(task)}
            className={clsx(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
              task?.is_important
                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                : 'text-slate-500 hover:bg-slate-50'
            )}
          >
            <Star
              size={15}
              className={task?.is_important ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}
            />
            {task?.is_important ? 'Önemli işaretlendi' : 'Önemli olarak işaretle'}
          </button>
        </div>

        {/* Bitiş Tarihi */}
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ background: 'rgba(248,250,252,0.8)', border: '1px solid rgba(226,232,240,0.6)' }}
        >
          <Calendar size={15} className="text-slate-400" />
          <div className="flex-1">
            <p className="text-xs text-slate-500 font-medium">Bitiş Tarihi</p>
            <p className={clsx(
              'text-sm mt-0.5',
              isOverdue(task?.due_date) && task?.status !== 'completed' ? 'text-red-500 font-medium' : 'text-slate-700'
            )}>
              {formatDate(task?.due_date) || 'Tarih yok'}
            </p>
          </div>
          <input
            type="date"
            value={task?.due_date ?? ''}
            onChange={(e) => onUpdate({ id: task.id, due_date: e.target.value || null })}
            className="text-xs text-slate-500 outline-none bg-transparent cursor-pointer"
            style={{ width: 0, opacity: 0, position: 'absolute' }}
            id={`due-${task.id}`}
          />
          <label htmlFor={`due-${task.id}`} className="cursor-pointer text-slate-400 hover:text-indigo-500">
            <ChevronRight size={14} />
          </label>
        </div>

        {/* Hatırlatıcı */}
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"
          style={{ border: '1px solid rgba(226,232,240,0.6)' }}
        >
          <Bell size={15} className="text-slate-400" />
          <div className="flex-1">
            <p className="text-xs text-slate-500 font-medium">Hatırlatıcı</p>
            <p className="text-sm text-slate-400 mt-0.5">
              {task?.reminder_at
                ? new Date(task.reminder_at).toLocaleString('tr-TR')
                : 'Ekle'}
            </p>
          </div>
        </div>

        {/* Not Alanı */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: 'rgba(248,250,252,0.8)',
            border: '1px solid rgba(226,232,240,0.6)',
          }}
        >
          <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2">
            <AlignLeft size={13} className="text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Not</span>
          </div>
          {editingNotes ? (
            <div className="p-3">
              <textarea
                autoFocus
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Not ekleyin..."
                rows={4}
                className="w-full text-sm text-slate-700 outline-none bg-transparent resize-none leading-relaxed placeholder-slate-300"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => { setNotes(task?.notes ?? ''); setEditingNotes(false); }}
                  className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded"
                >
                  İptal
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="text-xs text-white bg-indigo-500 hover:bg-indigo-600 px-3 py-1 rounded-lg flex items-center gap-1"
                >
                  <Check size={11} />
                  Kaydet
                </button>
              </div>
            </div>
          ) : (
            <div
              className="px-3 py-3 cursor-text min-h-[60px]"
              onClick={() => { setNotes(task?.notes ?? ''); setEditingNotes(true); }}
            >
              <p className="text-sm text-slate-600 leading-relaxed">
                {task?.notes ?? <span className="text-slate-300">Not eklemek için tıklayın...</span>}
              </p>
            </div>
          )}
        </div>

        {/* Bağlantılı Entity */}
        {task?.linked_entity_type && (
          <div
            className="px-3 py-3 rounded-xl"
            style={{
              background: 'rgba(238,242,255,0.6)',
              border: '1px solid rgba(199,210,254,0.6)',
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Link2 size={13} className="text-indigo-500" />
              <span className="text-xs text-indigo-600 font-bold uppercase tracking-wide">
                Bağlantılı {task.linked_entity_type}
              </span>
            </div>
            <p className="text-sm text-indigo-700 font-medium">
              {task?.linked_entity_label ?? task?.linked_entity_id ?? '—'}
            </p>
          </div>
        )}
      </div>

      {/* Footer: Sil */}
      <div
        className="px-5 py-4 border-t border-slate-100 flex items-center justify-between"
      >
        <span className="text-[11px] text-slate-400">
          {task?.created_at
            ? `Oluşturuldu: ${new Date(task.created_at).toLocaleDateString('tr-TR')}`
            : ''}
        </span>
        <button
          onClick={() => {
            if (confirm(`"${task?.title}" görevini silmek istiyor musunuz?`)) {
              onDelete(task.id);
            }
          }}
          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors"
        >
          <Trash2 size={12} />
          Sil
        </button>
      </div>
    </motion.aside>
  );
}

// ─── Ana Widget ───────────────────────────────────────────────────────────────

export function TaskCommandWidget() {
  const [activeListId, setActiveListId] = useState<string | null>(SMART_LIST_IDS['my-day']);
  const [selectedTask, setSelectedTask] = useState<SentinelTask | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: lists = [], isLoading: listsLoading } = useTaskLists();
  const { data: tasks = [], isLoading: tasksLoading, isError, error, refetch } = useTasks(activeListId);
  const mutations = useTaskMutation(activeListId);

  const activeList = (lists || []).find((l) => l?.id === activeListId);

  // Görev filtrele (arama)
  const filteredTasks = (tasks || []).filter((t) => {
    if (!searchQuery?.trim()) return true;
    return (t?.title ?? '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const pendingTasks = filteredTasks.filter((t) => t?.status !== 'completed');
  const completedTasks = filteredTasks.filter((t) => t?.status === 'completed');

  const handleListSelect = (id: string) => {
    setActiveListId(id);
    setSelectedTask(null);
  };

  const handleCreate = useCallback((input: CreateTaskInput) => {
    mutations.create.mutate(input, {
      onSuccess: () => {
        toast.success('Görev eklendi', {
          style: { borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
          duration: 2000,
          icon: '✓',
        });
      },
    });
  }, [mutations.create]);

  const handleUpdate = useCallback((input: { id: string } & Partial<SentinelTask>) => {
    mutations.update.mutate(input as Parameters<typeof mutations.update.mutate>[0]);
    if (selectedTask?.id === input.id) {
      setSelectedTask((prev) => prev ? { ...prev, ...input } : null);
    }
  }, [mutations.update, selectedTask]);

  const handleDelete = useCallback((id: string) => {
    mutations.remove.mutate(id, {
      onSuccess: () => {
        if (selectedTask?.id === id) setSelectedTask(null);
      },
    });
  }, [mutations.remove, selectedTask]);

  return (
    <div
      className="flex h-full rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(248,250,252,0.6)',
        border: '1px solid rgba(226,232,240,0.7)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
        minHeight: '600px',
      }}
    >
      {/* ─── Sidebar ─────────────────────────────────────────────────────── */}
      {listsLoading ? (
        <div className="w-64 flex items-center justify-center border-r border-slate-100">
          <Loader2 size={22} className="animate-spin text-slate-300" />
        </div>
      ) : (
        <Sidebar lists={lists} activeListId={activeListId} onSelect={handleListSelect} />
      )}

      {/* ─── Orta: Görev Listesi ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 bg-white/40">
        {/* Liste Başlığı */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{activeList?.icon ?? '📋'}</span>
            <h2
              className="text-xl font-black text-slate-800"
              style={{ color: activeList?.color ?? '#1e293b' }}
            >
              {activeList?.name ?? 'Görevler'}
            </h2>
            {tasksLoading && <Loader2 size={16} className="animate-spin text-slate-300" />}
          </div>
          <p className="text-sm text-slate-400 mt-1">
            {pendingTasks.length} görev bekliyor
          </p>
        </div>

        {/* Magic Input */}
        <MagicInput
          listId={activeListId}
          onSubmit={handleCreate}
          isLoading={mutations.create.isPending}
        />

        {/* Error State */}
        {isError && (
          <div className="mx-4 mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-600 flex-1">
              {error instanceof Error ? error.message : 'Görevler yüklenemedi'}
            </p>
            <button onClick={() => refetch()} className="text-red-400 hover:text-red-600">
              <RefreshCw size={13} />
            </button>
          </div>
        )}

        {/* Görev Listesi */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-0.5">
          <AnimatePresence initial={false}>
            {(pendingTasks || []).map((task) => (
              <TaskRow
                key={task?.id}
                task={task}
                isSelected={selectedTask?.id === task?.id}
                onSelect={setSelectedTask}
                onToggleComplete={(t) => mutations.toggleComplete.mutate(t)}
                onToggleImportant={(t) => mutations.toggleImportant.mutate(t)}
              />
            ))}
          </AnimatePresence>

          {/* Tamamlananlar */}
          {completedTasks.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest px-4 mb-2">
                Tamamlananlar ({completedTasks.length})
              </p>
              <AnimatePresence initial={false}>
                {(completedTasks || []).map((task) => (
                  <TaskRow
                    key={task?.id}
                    task={task}
                    isSelected={selectedTask?.id === task?.id}
                    onSelect={setSelectedTask}
                    onToggleComplete={(t) => mutations.toggleComplete.mutate(t)}
                    onToggleImportant={(t) => mutations.toggleImportant.mutate(t)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Boş State */}
          {!tasksLoading && filteredTasks.length === 0 && !isError && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle2 size={40} className="text-slate-200 mb-3" />
              <p className="text-sm font-medium text-slate-400">Görev yok</p>
              <p className="text-xs text-slate-300 mt-1">Yukarıdan yeni görev ekleyin</p>
            </div>
          )}
        </div>
      </main>

      {/* ─── Detay Drawer ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailDrawer
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onToggleImportant={(t) => mutations.toggleImportant.mutate(t)}
            onToggleMyDay={(t) => mutations.toggleMyDay.mutate(t)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
