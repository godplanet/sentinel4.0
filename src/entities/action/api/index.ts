import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';

const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';
import type {
  Action,
  ActionWithDetails,
  ActionEvidence,
  ActionRequest,
  ActionLog,
  ActionAging,
  CreateActionInput,
  UpdateActionInput,
  RequestType,
} from '../model/types';

export const actionApi = {
  async getAll(): Promise<ActionWithDetails[]> {
    const { data, error } = await supabase
      .from('actions')
      .select(`
        *,
        evidence:action_evidence(*),
        requests:action_requests(*),
        logs:action_logs(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as ActionWithDetails[];
  },

  async getById(id: string): Promise<ActionWithDetails | null> {
    const { data, error } = await supabase
      .from('actions')
      .select(`
        *,
        evidence:action_evidence(*),
        requests:action_requests(*),
        logs:action_logs(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as ActionWithDetails | null;
  },

  async getByFinding(findingId: string): Promise<ActionWithDetails[]> {
    const { data, error } = await supabase
      .from('actions')
      .select(`
        *,
        evidence:action_evidence(*),
        requests:action_requests(*)
      `)
      .eq('finding_id', findingId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as ActionWithDetails[];
  },

  async getByStatus(status: string): Promise<ActionWithDetails[]> {
    const { data, error } = await supabase
      .from('actions')
      .select(`
        *,
        evidence:action_evidence(*),
        requests:action_requests(*)
      `)
      .eq('status', status)
      .order('current_due_date', { ascending: true });

    if (error) throw error;
    return (data || []) as ActionWithDetails[];
  },

  async getMyActions(): Promise<ActionWithDetails[]> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id ?? DEV_USER_ID;

    const { data, error } = await supabase
      .from('actions')
      .select(`
        *,
        evidence:action_evidence(*),
        requests:action_requests(*)
      `)
      .eq('assignee_user_id', userId)
      .order('current_due_date', { ascending: true });

    if (error) throw error;
    return (data || []) as ActionWithDetails[];
  },

  async create(input: CreateActionInput): Promise<Action> {
    const { data, error } = await supabase.rpc('create_action_from_finding', {
      p_finding_id: input.finding_id,
      p_assignee_user_id: input.assignee_user_id,
      p_due_date: input.original_due_date,
      p_title: input.title,
      p_assignee_unit_name: input.assignee_unit_name,
    });

    if (error) throw error;

    if (data) {
      const action = await this.getById(data);
      if (!action) throw new Error('Failed to retrieve created action');
      return action;
    }

    throw new Error('Failed to create action');
  },

  async update(id: string, updates: UpdateActionInput): Promise<Action> {
    const { data, error } = await supabase
      .from('actions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Action;
  },

  async close(id: string): Promise<Action> {
    const { data, error } = await supabase
      .from('actions')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Action;
  },

  async reject(id: string, reason: string): Promise<Action> {
    const { data, error } = await supabase
      .from('actions')
      .update({
        status: 'auditor_rejected',
        description: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Action;
  },

  async autoFix(id: string): Promise<Action> {
    const action = await this.getById(id);
    if (!action) throw new Error('Action not found');

    if (!action.auto_fix_config?.enabled) {
      throw new Error('Auto-fix not enabled for this action');
    }

    await evidenceApi.create({
      action_id: id,
      file_name: 'auto-fix-result.json',
      storage_path: '/system/auto-fix/' + id,
      file_hash: 'AUTO_FIX_' + Date.now(),
      description: 'Automatically fixed by system',
    });

    return await this.close(id);
  },
};

export const evidenceApi = {
  async getByAction(actionId: string): Promise<ActionEvidence[]> {
    const { data, error } = await supabase
      .from('action_evidence')
      .select('*')
      .eq('action_id', actionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as ActionEvidence[];
  },

  async create(evidence: Partial<ActionEvidence>): Promise<ActionEvidence> {
    const { data, error } = await supabase
      .from('action_evidence')
      .insert({
        ...evidence,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as ActionEvidence;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('action_evidence')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const requestApi = {
  async getByAction(actionId: string): Promise<ActionRequest[]> {
    const { data, error } = await supabase
      .from('action_requests')
      .select('*')
      .eq('action_id', actionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as ActionRequest[];
  },

  async getPending(): Promise<ActionRequest[]> {
    const { data, error } = await supabase
      .from('action_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as ActionRequest[];
  },

  async create(request: {
    action_id: string;
    type: RequestType;
    justification: string;
    requested_date?: string;
    impact_analysis?: string;
  }): Promise<ActionRequest> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id ?? DEV_USER_ID;

    const { data, error } = await supabase
      .from('action_requests')
      .insert({
        ...request,
        requested_by: userId,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as ActionRequest;
  },

  async approve(id: string, comments?: string): Promise<ActionRequest> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id ?? DEV_USER_ID;

    const request = await this.getById(id);
    if (!request) throw new Error('Request not found');

    const { data, error } = await supabase
      .from('action_requests')
      .update({
        status: 'approved',
        reviewer_id: userId,
        reviewer_comments: comments,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (request.type === 'extension' && request.requested_date) {
      await actionApi.update(request.action_id, {
        current_due_date: request.requested_date,
      });
    } else if (request.type === 'risk_acceptance') {
      await actionApi.update(request.action_id, {
        status: 'risk_accepted',
      });
    }

    return data as ActionRequest;
  },

  async reject(id: string, comments: string): Promise<ActionRequest> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id ?? DEV_USER_ID;

    const { data, error } = await supabase
      .from('action_requests')
      .update({
        status: 'rejected',
        reviewer_id: userId,
        reviewer_comments: comments,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ActionRequest;
  },

  async getById(id: string): Promise<ActionRequest | null> {
    const { data, error } = await supabase
      .from('action_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as ActionRequest | null;
  },
};

export const agingApi = {
  async getAll(): Promise<ActionAging[]> {
    const { data, error } = await supabase
      .from('view_action_aging')
      .select('*')
      .order('operational_overdue_days', { ascending: false });

    if (error) throw error;
    return (data || []) as ActionAging[];
  },

  async getOverdue(): Promise<ActionAging[]> {
    const { data, error } = await supabase
      .from('view_action_aging')
      .select('*')
      .eq('is_operationally_overdue', true)
      .order('operational_overdue_days', { ascending: false });

    if (error) throw error;
    return (data || []) as ActionAging[];
  },

  async getPerformanceDelayed(): Promise<ActionAging[]> {
    const { data, error } = await supabase
      .from('view_action_aging')
      .select('*')
      .eq('is_performance_delayed', true)
      .order('performance_delay_days', { ascending: false });

    if (error) throw error;
    return (data || []) as ActionAging[];
  },
};

export const logApi = {
  async getByAction(actionId: string): Promise<ActionLog[]> {
    const { data, error } = await supabase
      .from('action_logs')
      .select('*')
      .eq('action_id', actionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as ActionLog[];
  },
};
