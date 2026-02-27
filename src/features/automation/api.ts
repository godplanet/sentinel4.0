import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

export interface AutomationRule {
  id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  trigger_event: string;
  conditions: Record<string, unknown>;
  actions: Array<Record<string, unknown>>;
  is_active: boolean;
  priority: number;
  last_triggered_at: string | null;
  execution_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AutomationLog {
  id: string;
  tenant_id: string;
  rule_id: string | null;
  rule_title: string | null;
  trigger_event: string | null;
  trigger_context: Record<string, unknown> | null;
  conditions_evaluated: Record<string, unknown> | null;
  actions_executed: Array<Record<string, unknown>> | null;
  action_result: string | null;
  status: 'Success' | 'Failed' | 'Skipped' | 'Simulated';
  duration_ms: number;
  is_simulation: boolean;
  executed_at: string;
}

export const TRIGGER_EVENTS = [
  { value: 'FINDING_CREATED', label: 'Yeni Bulgu Olusturuldu', icon: 'alert-triangle' },
  { value: 'RISK_CHANGED', label: 'Risk Skoru Degisti', icon: 'trending-up' },
  { value: 'DUE_DATE_PASSED', label: 'Vade Tarihi Gecti', icon: 'clock' },
  { value: 'AUDIT_STARTED', label: 'Denetim Baslatildi', icon: 'play' },
  { value: 'ASSESSMENT_COMPLETED', label: 'Degerlendirme Tamamlandi', icon: 'check-circle' },
  { value: 'STATUS_CHANGED', label: 'Durum Degisti', icon: 'refresh-cw' },
  { value: 'WORKPAPER_SIGNED', label: 'Calisma Kagidi Onaylandi', icon: 'file-check' },
  { value: 'ACTION_OVERDUE', label: 'Aksiyon Gecikmesi', icon: 'alert-circle' },
  { value: 'VENDOR_REVIEW_DUE', label: 'Tedarikcier Degerlendirme Vadesi', icon: 'building-2' },
] as const;

export const ACTION_TYPES = [
  { value: 'SEND_NOTIFICATION', label: 'Bildirim Gonder', icon: 'bell' },
  { value: 'SEND_EMAIL', label: 'E-posta Gonder', icon: 'mail' },
  { value: 'CREATE_TASK', label: 'Gorev Olustur', icon: 'plus-circle' },
  { value: 'UPDATE_STATUS', label: 'Durum Guncelle', icon: 'edit' },
  { value: 'ASSIGN_REVIEWER', label: 'Gozden Geciren Ata', icon: 'user-plus' },
] as const;

export const CONDITION_FIELDS: Record<string, Array<{ field: string; label: string; type: 'text' | 'number' | 'select'; options?: string[] }>> = {
  FINDING_CREATED: [
    { field: 'risk_level', label: 'Risk Seviyesi', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'] },
    { field: 'department', label: 'Departman', type: 'text' },
    { field: 'category', label: 'Kategori', type: 'text' },
  ],
  RISK_CHANGED: [
    { field: 'change_percent', label: 'Degisim Yuzdesi', type: 'number' },
    { field: 'direction', label: 'Yon', type: 'select', options: ['increase', 'decrease'] },
  ],
  DUE_DATE_PASSED: [
    { field: 'days_overdue', label: 'Gecikme Gunu', type: 'number' },
  ],
  AUDIT_STARTED: [
    { field: 'category', label: 'Denetim Kategorisi', type: 'text' },
  ],
  ASSESSMENT_COMPLETED: [
    { field: 'min_score', label: 'Minimum Skor', type: 'number' },
  ],
  STATUS_CHANGED: [
    { field: 'new_status', label: 'Yeni Durum', type: 'text' },
    { field: 'entity_type', label: 'Varlik Tipi', type: 'select', options: ['finding', 'action', 'workpaper', 'audit'] },
  ],
  WORKPAPER_SIGNED: [
    { field: 'all_approvals_complete', label: 'Tum Onaylar Tamam', type: 'select', options: ['true', 'false'] },
  ],
  ACTION_OVERDUE: [
    { field: 'days_overdue', label: 'Gecikme Gunu', type: 'number' },
    { field: 'priority', label: 'Oncelik', type: 'select', options: ['urgent', 'high', 'medium', 'low'] },
  ],
  VENDOR_REVIEW_DUE: [
    { field: 'days_before_due', label: 'Vadeye Kalan Gun', type: 'number' },
  ],
};

export function useAutomationRules() {
  return useQuery({
    queryKey: ['automation-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .order('priority', { ascending: true });
      if (error) throw error;
      return (data || []) as AutomationRule[];
    },
  });
}

export function useAutomationLogs(ruleId?: string) {
  return useQuery({
    queryKey: ['automation-logs', ruleId],
    queryFn: async () => {
      let query = supabase
        .from('automation_logs')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(50);
      if (ruleId) query = query.eq('rule_id', ruleId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as AutomationLog[];
    },
  });
}

export function useToggleRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('automation_rules')
        .update({ is_active: input.is_active, updated_at: new Date().toISOString() })
        .eq('id', input.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automation-rules'] });
    },
  });
}

export function useCreateRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<AutomationRule, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'last_triggered_at' | 'execution_count'>) => {
      const { data, error } = await supabase
        .from('automation_rules')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automation-rules'] });
    },
  });
}

export function useDeleteRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automation-rules'] });
    },
  });
}

export function useCreateLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<AutomationLog, 'id' | 'tenant_id' | 'executed_at'>) => {
      const { data, error } = await supabase
        .from('automation_logs')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automation-logs'] });
    },
  });
}
