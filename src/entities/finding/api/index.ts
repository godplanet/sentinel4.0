import { supabase } from '@/shared/api/supabase';
import type { Finding, Assignment, ActionStep, FindingWithAssignment } from '../model/types';

export * from './crud';

export const findingApi = {
  async getAll(): Promise<FindingWithAssignment[]> {
    const { data, error } = await supabase
      .from('audit_findings')
      .select(`
        *,
        assignment:assignments(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as FindingWithAssignment[];
  },

  async getById(id: string): Promise<FindingWithAssignment | null> {
    const { data, error } = await supabase
      .from('audit_findings')
      .select(`
        *,
        assignment:assignments(*),
        action_steps:assignments(action_steps(*))
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as FindingWithAssignment | null;
  },

  async getByAudit(auditId: string): Promise<FindingWithAssignment[]> {
    const { data, error } = await supabase
      .from('audit_findings')
      .select(`
        *,
        assignment:assignments(*)
      `)
      .eq('audit_id', auditId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as FindingWithAssignment[];
  },

  async create(finding: Partial<Finding>): Promise<Finding> {
    const { data, error } = await supabase
      .from('audit_findings')
      .insert(finding)
      .select()
      .single();

    if (error) throw error;
    return data as Finding;
  },

  async update(id: string, updates: Partial<Finding>): Promise<Finding> {
    const { data, error } = await supabase
      .from('audit_findings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Finding;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('audit_findings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const assignmentApi = {
  async create(assignment: Partial<Assignment>): Promise<Assignment> {
    const { data, error } = await supabase
      .from('assignments')
      .insert(assignment)
      .select()
      .single();

    if (error) throw error;
    return data as Assignment;
  },

  async update(id: string, updates: Partial<Assignment>): Promise<Assignment> {
    const { data, error } = await supabase
      .from('assignments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Assignment;
  },

  async getMyAssignments(): Promise<Assignment[]> {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Assignment[];
  },
};

export const actionStepApi = {
  async create(step: Partial<ActionStep>): Promise<ActionStep> {
    const { data, error } = await supabase
      .from('action_steps')
      .insert(step)
      .select()
      .single();

    if (error) throw error;
    return data as ActionStep;
  },

  async update(id: string, updates: Partial<ActionStep>): Promise<ActionStep> {
    const { data, error } = await supabase
      .from('action_steps')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ActionStep;
  },

  async getByAssignment(assignmentId: string): Promise<ActionStep[]> {
    const { data, error } = await supabase
      .from('action_steps')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return (data || []) as ActionStep[];
  },
};
