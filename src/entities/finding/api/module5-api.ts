import { supabase } from '@/shared/api/supabase';
import type {
  Finding,
  ComprehensiveFinding,
  FindingSecret,
  ActionPlan,
  FindingComment,
  FindingHistory,
} from '../model/types';

export const comprehensiveFindingApi = {
  async getAll(): Promise<ComprehensiveFinding[]> {
    const { data, error } = await supabase
      .from('audit_findings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase getAll error:', error);
      throw error;
    }

    console.log('Fetched findings:', data?.length || 0);
    return (data || []) as ComprehensiveFinding[];
  },

  async getById(id: string): Promise<ComprehensiveFinding | null> {
    const { data, error } = await supabase
      .from('audit_findings')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Supabase getById error:', error);
      throw error;
    }

    console.log('Fetched finding by ID:', id, data ? 'FOUND' : 'NOT FOUND');
    return data ? (data as ComprehensiveFinding) : null;
  },

  async getByEngagement(engagementId: string): Promise<ComprehensiveFinding[]> {
    const { data, error } = await supabase
      .from('audit_findings')
      .select(`
        *,
        secrets:finding_secrets(*),
        action_plans(*),
        comments:finding_comments(*),
        history:finding_history(*)
      `)
      .eq('engagement_id', engagementId)
      .order('created_at', { ascending: false});

    if (error) throw error;
    return (data || []) as ComprehensiveFinding[];
  },

  async getByState(state: string): Promise<ComprehensiveFinding[]> {
    const { data, error } = await supabase
      .from('audit_findings')
      .select(`
        *,
        secrets:finding_secrets(*),
        action_plans(*),
        comments:finding_comments(*)
      `)
      .eq('state', state)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as ComprehensiveFinding[];
  },

  async create(finding: Partial<Finding>): Promise<Finding> {
    const { data, error } = await supabase
      .from('audit_findings')
      .insert({
        ...finding,
        state: finding.state || 'DRAFT',
        created_at: new Date().toISOString(),
      })
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

  async changeState(findingId: string, newState: string, userId: string, description?: string): Promise<void> {
    const { error } = await supabase.rpc('change_finding_state', {
      p_finding_id: findingId,
      p_new_state: newState,
      p_changed_by: userId,
      p_change_description: description,
    });

    if (error) throw error;
  },

  async publishToAuditee(findingId: string, auditeeId: string): Promise<Finding> {
    const { data, error } = await supabase
      .from('audit_findings')
      .update({
        state: 'PUBLISHED',
        assigned_auditee_id: auditeeId,
        published_at: new Date().toISOString(),
        negotiation_started_at: new Date().toISOString(),
      })
      .eq('id', findingId)
      .select()
      .single();

    if (error) throw error;
    return data as Finding;
  },
};

export const findingSecretsApi = {
  async getByFinding(findingId: string): Promise<FindingSecret | null> {
    const { data, error } = await supabase
      .from('finding_secrets')
      .select('*')
      .eq('finding_id', findingId)
      .maybeSingle();

    if (error) throw error;
    return data as FindingSecret | null;
  },

  async upsert(secret: Partial<FindingSecret>): Promise<FindingSecret> {
    const { data, error } = await supabase
      .from('finding_secrets')
      .upsert(secret, { onConflict: 'finding_id' })
      .select()
      .single();

    if (error) throw error;
    return data as FindingSecret;
  },

  async update(findingId: string, updates: Partial<FindingSecret>): Promise<FindingSecret> {
    const { data, error } = await supabase
      .from('finding_secrets')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('finding_id', findingId)
      .select()
      .single();

    if (error) throw error;
    return data as FindingSecret;
  },
};

export const actionPlanApi = {
  async getByFinding(findingId: string): Promise<ActionPlan[]> {
    const { data, error } = await supabase
      .from('action_plans')
      .select('*')
      .eq('finding_id', findingId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as ActionPlan[];
  },

  async getById(id: string): Promise<ActionPlan | null> {
    const { data, error } = await supabase
      .from('action_plans')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as ActionPlan | null;
  },

  async create(actionPlan: Partial<ActionPlan>): Promise<ActionPlan> {
    const { data, error } = await supabase
      .from('action_plans')
      .insert({
        ...actionPlan,
        status: actionPlan.status || 'DRAFT',
        progress_percentage: actionPlan.progress_percentage || 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as ActionPlan;
  },

  async update(id: string, updates: Partial<ActionPlan>): Promise<ActionPlan> {
    const { data, error } = await supabase
      .from('action_plans')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ActionPlan;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('action_plans')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async approveByAuditee(id: string, response: string): Promise<ActionPlan> {
    const { data, error } = await supabase
      .from('action_plans')
      .update({
        auditee_agreed: true,
        auditee_agreed_at: new Date().toISOString(),
        auditee_response: response,
        status: 'APPROVED',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ActionPlan;
  },
};

export const findingCommentsApi = {
  async getByFinding(findingId: string): Promise<FindingComment[]> {
    const { data, error } = await supabase
      .from('finding_comments')
      .select('*')
      .eq('finding_id', findingId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as FindingComment[];
  },

  async create(comment: Partial<FindingComment>): Promise<FindingComment> {
    const { data, error } = await supabase
      .from('finding_comments')
      .insert({
        ...comment,
        created_at: new Date().toISOString(),
        is_deleted: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data as FindingComment;
  },

  async update(id: string, updates: Partial<FindingComment>): Promise<FindingComment> {
    const { data, error } = await supabase
      .from('finding_comments')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as FindingComment;
  },

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('finding_comments')
      .update({ is_deleted: true })
      .eq('id', id);

    if (error) throw error;
  },
};

export const findingHistoryApi = {
  async getByFinding(findingId: string): Promise<FindingHistory[]> {
    const { data, error } = await supabase
      .from('finding_history')
      .select('*')
      .eq('finding_id', findingId)
      .order('changed_at', { ascending: false });

    if (error) throw error;
    return (data || []) as FindingHistory[];
  },
};

export const auditeePortalApi = {
  async getMyAssignedFindings(): Promise<ComprehensiveFinding[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('audit_findings')
      .select(`
        *,
        action_plans(*),
        comments:finding_comments(*)
      `)
      .eq('assigned_auditee_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as ComprehensiveFinding[];
  },

  async submitResponse(
    findingId: string,
    actionPlan: Partial<ActionPlan>,
    comment?: string
  ): Promise<{ actionPlan: ActionPlan; comment?: FindingComment }> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const createdActionPlan = await actionPlanApi.create({
      ...actionPlan,
      finding_id: findingId,
      created_by: userData.user.id,
    });

    let createdComment: FindingComment | undefined;
    if (comment) {
      createdComment = await findingCommentsApi.create({
        finding_id: findingId,
        comment_text: comment,
        comment_type: 'DISCUSSION',
        author_id: userData.user.id,
        author_role: 'AUDITEE',
      });
    }

    await comprehensiveFindingApi.update(findingId, {
      state: 'NEGOTIATION',
    });

    return {
      actionPlan: createdActionPlan,
      comment: createdComment,
    };
  },
};
