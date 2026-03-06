/**
 * SENTINEL GRC v3.0 — Task Command: Supabase API + TanStack Query Hooks
 * ======================================================================
 * FSD Katmanı: entities/task/api/task-api.ts
 *
 * Hooks:
 *   useTaskLists     → task_lists tablosu
 *   useTasks         → sentinel_tasks (akıllı filtre destekli)
 *   useTaskMutation  → create / update / delete / toggle
 *
 * AŞIRI SAVUNMACI PROGRAMLAMA: Tüm veri erişimlerinde ?. ve ?? zorunlu.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import toast from 'react-hot-toast';
import type {
  SentinelTask,
  TaskList,
  CreateTaskInput,
  UpdateTaskInput,
} from '../types';
import { SMART_LIST_IDS } from '../types';

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const TASK_KEYS = {
  lists:   ['task-lists'] as const,
  tasks:   (listId: string | null) => ['sentinel-tasks', listId ?? 'all'] as const,
  task:    (id: string) => ['sentinel-task', id] as const,
};

// ─── Task Lists ───────────────────────────────────────────────────────────────

export async function fetchTaskLists(): Promise<TaskList[]> {
  const { data, error } = await supabase
    .from('task_lists')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[SENTINEL][TaskCmd] task_lists sorgusu hatası:', error);
    throw error;
  }
  return (data ?? []) as TaskList[];
}

export function useTaskLists() {
  return useQuery({
    queryKey: TASK_KEYS.lists,
    queryFn: fetchTaskLists,
    staleTime: 120_000,
  });
}

// ─── Tasks: Akıllı Filtre ─────────────────────────────────────────────────────

export async function fetchTasks(listId: string | null): Promise<SentinelTask[]> {
  let query = supabase
    .from('sentinel_tasks')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  // Akıllı liste filtreleri
  if (listId === SMART_LIST_IDS['my-day']) {
    query = query.eq('is_my_day', true);
  } else if (listId === SMART_LIST_IDS['important']) {
    query = query.eq('is_important', true);
  } else if (listId === SMART_LIST_IDS['planned']) {
    query = query.not('due_date', 'is', null);
  } else if (listId === SMART_LIST_IDS['all'] || !listId) {
    // Tüm görevler — filtre yok
  } else {
    // Özel liste
    query = query.eq('list_id', listId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[SENTINEL][TaskCmd] sentinel_tasks sorgusu hatası:', error);
    throw error;
  }
  return (data ?? []) as SentinelTask[];
}

export function useTasks(listId: string | null) {
  return useQuery({
    queryKey: TASK_KEYS.tasks(listId),
    queryFn: () => fetchTasks(listId),
    staleTime: 15_000,
  });
}

// ─── Task CRUD Mutations ──────────────────────────────────────────────────────

// CREATE
export async function createTask(input: CreateTaskInput): Promise<SentinelTask> {
  const payload = {
    title:                input.title?.trim() ?? '',
    list_id:              input?.list_id ?? null,
    owner_id:             input?.owner_id ?? null,
    notes:                input?.notes ?? null,
    is_important:         input?.is_important ?? false,
    is_my_day:            input?.is_my_day ?? false,
    due_date:             input?.due_date ?? null,
    linked_entity_type:   input?.linked_entity_type ?? null,
    linked_entity_id:     input?.linked_entity_id ?? null,
    linked_entity_label:  input?.linked_entity_label ?? null,
    status:               'pending',
    sort_order:           Date.now(),  // basit sıralama
    tenant_id:            '11111111-1111-1111-1111-111111111111',
  };

  const { data, error } = await supabase
    .from('sentinel_tasks')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[SENTINEL][TaskCmd] Görev oluşturulamadı:', error);
    throw error;
  }
  return data as SentinelTask;
}

// UPDATE
export async function updateTask(input: UpdateTaskInput): Promise<SentinelTask> {
  const { id, ...rest } = input;
  const { data, error } = await supabase
    .from('sentinel_tasks')
    .update({ ...rest })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[SENTINEL][TaskCmd] Görev güncellenemedi:', error);
    throw error;
  }
  return data as SentinelTask;
}

// DELETE
export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('sentinel_tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[SENTINEL][TaskCmd] Görev silinemedi:', error);
    throw error;
  }
}

// TOGGLE COMPLETE
export async function toggleTaskComplete(task: SentinelTask): Promise<SentinelTask> {
  const newStatus = task?.status === 'completed' ? 'pending' : 'completed';
  return updateTask({ id: task.id, status: newStatus });
}

// TOGGLE IMPORTANT
export async function toggleTaskImportant(task: SentinelTask): Promise<SentinelTask> {
  return updateTask({ id: task.id, is_important: !(task?.is_important ?? false) });
}

// TOGGLE MY DAY
export async function toggleMyDay(task: SentinelTask): Promise<SentinelTask> {
  return updateTask({ id: task.id, is_my_day: !(task?.is_my_day ?? false) });
}

// ─── React Query Mutation Hooks ───────────────────────────────────────────────

export function useTaskMutation(activeListId: string | null) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['sentinel-tasks'] });
  };

  const create = useMutation({
    mutationFn: createTask,
    onSuccess: () => { invalidate(); },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      console.error('[SENTINEL][TaskCmd] create mutation error:', err);
      toast.error(`Görev oluşturulamadı: ${msg}`, {
        style: { borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
      });
    },
  });

  const update = useMutation({
    mutationFn: updateTask,
    onSuccess: () => { invalidate(); },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      toast.error(`Görev güncellenemedi: ${msg}`, {
        style: { borderRadius: '12px' },
      });
    },
  });

  const remove = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      invalidate();
      toast.success('Görev silindi', {
        style: { borderRadius: '12px' },
        duration: 2000,
      });
    },
    onError: (err) => {
      toast.error(`Görev silinemedi: ${err instanceof Error ? err.message : 'Hata'}`);
    },
  });

  const toggleComplete = useMutation({
    mutationFn: toggleTaskComplete,
    onMutate: async (task) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: TASK_KEYS.tasks(activeListId) });
      const prev = queryClient.getQueryData<SentinelTask[]>(TASK_KEYS.tasks(activeListId));
      queryClient.setQueryData<SentinelTask[]>(TASK_KEYS.tasks(activeListId), (old) =>
        (old ?? []).map((t) =>
          t?.id === task?.id
            ? { ...t, status: t?.status === 'completed' ? 'pending' : 'completed' }
            : t
        )
      );
      return { prev };
    },
    onError: (_err, _task, context) => {
      queryClient.setQueryData(TASK_KEYS.tasks(activeListId), context?.prev);
      toast.error('Görev durumu değiştirilemedi');
    },
    onSettled: () => { invalidate(); },
  });

  const toggleImportant = useMutation({
    mutationFn: toggleTaskImportant,
    onSuccess: () => { invalidate(); },
    onError: () => { toast.error('Yıldız işaretlenemedi'); },
  });

  const toggleMyDayMutation = useMutation({
    mutationFn: toggleMyDay,
    onSuccess: () => { invalidate(); },
    onError: () => { toast.error('\"Günüm\" değiştirilemedi'); },
  });

  return {
    create,
    update,
    remove,
    toggleComplete,
    toggleImportant,
    toggleMyDay: toggleMyDayMutation,
  };
}
