import { create } from 'zustand';
import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';
import type {
  Action,
  ActionEvidence,
  ActionRequest,
  ActionAgingMetrics,
  ActionWithDetails,
  MasterActionCampaign,
  CreateActionInput,
  UpdateActionInput,
  CreateEvidenceInput,
  CreateRequestInput,
  ActionStatus,
  ActionRequestStatus,
} from './types';

// =============================================================================
// State Shape
// =============================================================================

interface ActionState {
  // ── Data ──────────────────────────────────────────────────────────────────
  actions:   ActionWithDetails[];
  aging:     ActionAgingMetrics[];
  campaigns: MasterActionCampaign[];

  /** Currently selected action for drawer/detail views */
  selected:  ActionWithDetails | null;

  // ── Loading flags ─────────────────────────────────────────────────────────
  loading:          boolean;
  loadingAging:     boolean;
  loadingCampaigns: boolean;
  saving:           boolean;

  // ── Error ─────────────────────────────────────────────────────────────────
  error: string | null;

  // ── Read operations ───────────────────────────────────────────────────────
  fetchAll:          () => Promise<void>;
  fetchById:         (id: string) => Promise<void>;
  fetchAging:        () => Promise<void>;
  fetchCampaigns:    () => Promise<void>;
  fetchByFinding:    (findingId: string) => Promise<ActionWithDetails[]>;
  selectAction:      (action: ActionWithDetails | null) => void;

  // ── Write operations (with optimistic updates) ────────────────────────────
  createAction:      (input: CreateActionInput) => Promise<Action>;
  updateStatus:      (id: string, status: ActionStatus) => Promise<void>;
  updateAction:      (id: string, updates: UpdateActionInput) => Promise<void>;
  closeAction:       (id: string) => Promise<void>;
  escalateAction:    (id: string) => Promise<void>;

  // ── Evidence operations ───────────────────────────────────────────────────
  addEvidence:       (input: CreateEvidenceInput) => Promise<ActionEvidence>;
  deleteEvidence:    (evidenceId: string, actionId: string) => Promise<void>;

  // ── Request operations ────────────────────────────────────────────────────
  createRequest:     (input: CreateRequestInput) => Promise<ActionRequest>;
  reviewRequest:     (
    requestId: string,
    actionId:  string,
    decision:  ActionRequestStatus,
    newDueDate?: string,
  ) => Promise<void>;

  // ── Utilities ─────────────────────────────────────────────────────────────
  clearError:        () => void;
  getBDDKBreaches:   () => ActionAgingMetrics[];
  getTier4Actions:   () => ActionAgingMetrics[];
}

// =============================================================================
// Store Implementation
// =============================================================================

export const useActionStore = create<ActionState>()((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────────────────
  actions:          [],
  aging:            [],
  campaigns:        [],
  selected:         null,
  loading:          false,
  loadingAging:     false,
  loadingCampaigns: false,
  saving:           false,
  error:            null,

  // ── selectAction ──────────────────────────────────────────────────────────
  selectAction: (action) => set({ selected: action }),

  // ── clearError ────────────────────────────────────────────────────────────
  clearError: () => set({ error: null }),

  // ── fetchAll ──────────────────────────────────────────────────────────────
  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('actions')
        .select(`
          *,
          evidence:action_evidence(*),
          requests:action_requests(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ actions: (data ?? []) as ActionWithDetails[] });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  // ── fetchById ─────────────────────────────────────────────────────────────
  fetchById: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('actions')
        .select(`
          *,
          evidence:action_evidence(*),
          requests:action_requests(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        const enriched = data as ActionWithDetails;
        set({ selected: enriched });

        // Merge into actions list (upsert by id)
        set((state) => ({
          actions: state.actions.some((a) => a.id === id)
            ? state.actions.map((a) => (a.id === id ? enriched : a))
            : [enriched, ...state.actions],
        }));
      }
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  // ── fetchAging ────────────────────────────────────────────────────────────
  fetchAging: async () => {
    set({ loadingAging: true, error: null });
    try {
      const { data, error } = await supabase
        .from('view_action_aging_metrics')
        .select('*')
        .order('performance_delay_days', { ascending: false });

      if (error) throw error;
      set({ aging: (data ?? []) as ActionAgingMetrics[] });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loadingAging: false });
    }
  },

  // ── fetchCampaigns ────────────────────────────────────────────────────────
  fetchCampaigns: async () => {
    set({ loadingCampaigns: true });
    try {
      const { data, error } = await supabase
        .from('master_action_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ campaigns: (data ?? []) as MasterActionCampaign[] });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loadingCampaigns: false });
    }
  },

  // ── fetchByFinding ────────────────────────────────────────────────────────
  fetchByFinding: async (findingId) => {
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
    return (data ?? []) as ActionWithDetails[];
  },

  // ── createAction ──────────────────────────────────────────────────────────
  createAction: async (input) => {
    set({ saving: true, error: null });
    try {
      const payload = {
        tenant_id:         ACTIVE_TENANT_ID,
        finding_id:        input.finding_id,
        finding_snapshot:  input.finding_snapshot,
        original_due_date: input.original_due_date,
        current_due_date:  input.current_due_date,
        assignee_unit_id:  input.assignee_unit_id  ?? null,
        assignee_user_id:  input.assignee_user_id  ?? null,
        auditor_owner_id:  input.auditor_owner_id  ?? null,
        campaign_id:       input.campaign_id       ?? null,
        regulatory_tags:   input.regulatory_tags   ?? [],
        escalation_level:  input.escalation_level  ?? 0,
        status:            'pending' as ActionStatus,
        updated_at:        new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('actions')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      const created = data as Action;

      // Optimistic prepend to actions list
      set((state) => ({
        actions: [{ ...created, evidence: [], requests: [] }, ...state.actions],
      }));

      return created;
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    } finally {
      set({ saving: false });
    }
  },

  // ── updateStatus — optimistic update with rollback ────────────────────────
  updateStatus: async (id, status) => {
    const prev = get().actions;

    // Optimistic update
    set((state) => ({
      actions: state.actions.map((a) =>
        a.id === id
          ? { ...a, status, updated_at: new Date().toISOString(), ...(status === 'closed' ? { closed_at: new Date().toISOString() } : {}) }
          : a,
      ),
      selected: state.selected?.id === id
        ? { ...state.selected, status }
        : state.selected,
    }));

    try {
      const updatePayload: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (status === 'closed') {
        updatePayload.closed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('actions')
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      // Rollback on failure
      set({ actions: prev, error: (err as Error).message });
      throw err;
    }
  },

  // ── updateAction ──────────────────────────────────────────────────────────
  updateAction: async (id, updates) => {
    const prev = get().actions;

    // Optimistic update
    set((state) => ({
      actions: state.actions.map((a) =>
        a.id === id ? { ...a, ...updates, updated_at: new Date().toISOString() } : a,
      ),
      selected: state.selected?.id === id
        ? { ...state.selected, ...updates }
        : state.selected,
    }));

    try {
      const { error } = await supabase
        .from('actions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      set({ actions: prev, error: (err as Error).message });
      throw err;
    }
  },

  // ── closeAction ───────────────────────────────────────────────────────────
  closeAction: async (id) => {
    await get().updateStatus(id, 'closed');
  },

  // ── escalateAction — increments escalation_level up to max 3 ─────────────
  escalateAction: async (id) => {
    const action = get().actions.find((a) => a.id === id);
    if (!action) return;

    const next = Math.min(3, (action.escalation_level ?? 0) + 1) as 0 | 1 | 2 | 3;
    await get().updateAction(id, { escalation_level: next });
  },

  // ── addEvidence ───────────────────────────────────────────────────────────
  addEvidence: async (input) => {
    set({ saving: true, error: null });
    try {
      const { data, error } = await supabase
        .from('action_evidence')
        .insert({
          action_id:           input.action_id,
          storage_path:        input.storage_path,
          file_hash:           input.file_hash,
          ai_confidence_score: input.ai_confidence_score ?? null,
          uploaded_by:         input.uploaded_by ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      const evidence = data as ActionEvidence;

      // Merge into the relevant action in the local list
      set((state) => ({
        actions: state.actions.map((a) =>
          a.id === input.action_id
            ? { ...a, evidence: [...(a.evidence ?? []), evidence] }
            : a,
        ),
        selected: state.selected?.id === input.action_id
          ? { ...state.selected, evidence: [...(state.selected.evidence ?? []), evidence] }
          : state.selected,
      }));

      return evidence;
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    } finally {
      set({ saving: false });
    }
  },

  // ── deleteEvidence ────────────────────────────────────────────────────────
  deleteEvidence: async (evidenceId, actionId) => {
    const prev = get().actions;
    set((state) => ({
      actions: state.actions.map((a) =>
        a.id === actionId
          ? { ...a, evidence: (a.evidence ?? []).filter((e) => e.id !== evidenceId) }
          : a,
      ),
    }));

    try {
      const { error } = await supabase
        .from('action_evidence')
        .delete()
        .eq('id', evidenceId);

      if (error) throw error;
    } catch (err) {
      set({ actions: prev, error: (err as Error).message });
      throw err;
    }
  },

  // ── createRequest ─────────────────────────────────────────────────────────
  createRequest: async (input) => {
    set({ saving: true, error: null });
    try {
      const { data, error } = await supabase
        .from('action_requests')
        .insert({
          action_id:       input.action_id,
          type:            input.type,
          justification:   input.justification,
          requested_date:  input.requested_date  ?? null,
          expiration_date: input.expiration_date ?? null,
          status:          'pending',
        })
        .select()
        .single();

      if (error) throw error;

      const request = data as ActionRequest;

      // Merge into the relevant action
      set((state) => ({
        actions: state.actions.map((a) =>
          a.id === input.action_id
            ? { ...a, requests: [...(a.requests ?? []), request] }
            : a,
        ),
        selected: state.selected?.id === input.action_id
          ? { ...state.selected, requests: [...(state.selected.requests ?? []), request] }
          : state.selected,
      }));

      return request;
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    } finally {
      set({ saving: false });
    }
  },

  // ── reviewRequest ─────────────────────────────────────────────────────────
  reviewRequest: async (requestId, actionId, decision, newDueDate) => {
    set({ saving: true, error: null });
    const prev = get().actions;
    try {
      // Update the request status
      const { error: reqError } = await supabase
        .from('action_requests')
        .update({ status: decision })
        .eq('id', requestId);

      if (reqError) throw reqError;

      // If approved extension: update the action's current_due_date
      if (decision === 'approved' && newDueDate) {
        const { error: actError } = await supabase
          .from('actions')
          .update({ current_due_date: newDueDate, updated_at: new Date().toISOString() })
          .eq('id', actionId);

        if (actError) throw actError;
      }

      // If approved risk_acceptance: transition action status
      const action = get().actions.find((a) => a.id === actionId);
      const request = action?.requests?.find((r) => r.id === requestId);
      if (decision === 'approved' && request?.type === 'risk_acceptance') {
        const { error: statusError } = await supabase
          .from('actions')
          .update({ status: 'risk_accepted', updated_at: new Date().toISOString() })
          .eq('id', actionId);

        if (statusError) throw statusError;
      }

      // Optimistic merge
      set((state) => ({
        actions: state.actions.map((a) => {
          if (a.id !== actionId) return a;
          return {
            ...a,
            ...(decision === 'approved' && newDueDate ? { current_due_date: newDueDate } : {}),
            ...(decision === 'approved' && request?.type === 'risk_acceptance' ? { status: 'risk_accepted' as ActionStatus } : {}),
            requests: (a.requests ?? []).map((r) =>
              r.id === requestId ? { ...r, status: decision } : r,
            ),
          };
        }),
      }));
    } catch (err) {
      set({ actions: prev, error: (err as Error).message });
      throw err;
    } finally {
      set({ saving: false });
    }
  },

  // ── Selectors ─────────────────────────────────────────────────────────────

  getBDDKBreaches: () =>
    get().aging.filter((a) => a.is_bddk_breach),

  getTier4Actions: () =>
    get().aging.filter((a) => a.aging_tier === 'TIER_4_BDDK_RED_ZONE'),
}));
