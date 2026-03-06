// entities/task/types.ts
// Sentinel Task Command — Tip Tanımları

export type TaskStatus = 'pending' | 'completed' | 'cancelled';
export type LinkedEntityType = 'finding' | 'workpaper' | 'engagement' | 'action';

export interface TaskList {
  id: string;
  tenant_id: string;
  owner_id: string | null;
  name: string;
  icon: string;
  color: string;
  is_smart: boolean;
  smart_filter: Record<string, unknown>;
  sort_order: number;
  created_at: string;
}

export interface SentinelTask {
  id: string;
  tenant_id: string;
  owner_id: string | null;
  list_id: string | null;
  title: string;
  notes: string | null;
  status: TaskStatus;
  is_important: boolean;
  is_my_day: boolean;
  due_date: string | null;
  reminder_at: string | null;
  linked_entity_type: LinkedEntityType | null;
  linked_entity_id: string | null;
  linked_entity_label: string | null;
  sort_order: number;
  parent_task_id: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  list_id?: string | null;
  owner_id?: string | null;
  notes?: string;
  is_important?: boolean;
  is_my_day?: boolean;
  due_date?: string | null;
  linked_entity_type?: LinkedEntityType | null;
  linked_entity_id?: string | null;
  linked_entity_label?: string | null;
}

export interface UpdateTaskInput extends Partial<Omit<SentinelTask, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>> {
  id: string;
}

// Akıllı liste filtreleri
export type SmartListKey = 'my-day' | 'important' | 'planned' | 'all';

export const SMART_LIST_IDS: Record<SmartListKey, string> = {
  'my-day':    'aaaaaaaa-0000-0000-0000-000000000001',
  'important': 'aaaaaaaa-0000-0000-0000-000000000002',
  'planned':   'aaaaaaaa-0000-0000-0000-000000000003',
  'all':       'aaaaaaaa-0000-0000-0000-000000000004',
};
