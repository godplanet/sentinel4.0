import { create } from 'zustand';
import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';
import type {
  Finding,
  ComprehensiveFinding,
  ActionPlan,
  FindingComment,
  FindingHistory,
  FindingSecret,
  Assignment,
  ActionStep,
  FindingWithAssignment,
  DraftFinding,
} from './types';

interface FindingStore {
  findings: ComprehensiveFinding[];
  selectedFinding: ComprehensiveFinding | null;
  isLoading: boolean;
  draftFindings: DraftFinding[];

  // Draft Finding (Golden Thread Traceability)
  draftFindingFromWorkpaper: (
    workpaperId: string,
    testStepTitle: string,
    initialObservation: string,
  ) => DraftFinding;
  promoteDraftFinding: (draftId: string) => void;
  promoteDraftToStudio: (draftId: string) => Promise<{ findingId: string } | null>;

  // CRUD Operations
  setFindings: (findings: ComprehensiveFinding[]) => void;
  addFinding: (finding: Finding) => void;
  updateFinding: (id: string, updates: Partial<Finding>) => void;
  deleteFinding: (id: string) => void;
  selectFinding: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  updateFindingScore: (id: string, newScore: number, newSeverity: string) => void;

  // State Machine
  changeState: (id: string, newState: string) => void;

  // Action Plans
  addActionPlan: (findingId: string, actionPlan: ActionPlan) => void;
  updateActionPlan: (findingId: string, actionPlanId: string, updates: Partial<ActionPlan>) => void;
  deleteActionPlan: (findingId: string, actionPlanId: string) => void;

  // Comments
  addComment: (findingId: string, comment: FindingComment) => void;
  updateComment: (findingId: string, commentId: string, updates: Partial<FindingComment>) => void;
  deleteComment: (findingId: string, commentId: string) => void;

  // Secrets (RCA)
  updateSecrets: (findingId: string, secrets: Partial<FindingSecret>) => void;

  // History
  addHistory: (findingId: string, history: FindingHistory) => void;

  // Legacy support
  legacyFindings: FindingWithAssignment[];
  setLegacyFindings: (findings: FindingWithAssignment[]) => void;
}

export const useFindingStore = create<FindingStore>((set, get) => ({
  findings: [],
  selectedFinding: null,
  isLoading: false,
  draftFindings: [],
  legacyFindings: [],

  draftFindingFromWorkpaper: (workpaperId, testStepTitle, initialObservation) => {
    const id = crypto.randomUUID();
    const traceabilityToken = `GT-${workpaperId.slice(0, 8).toUpperCase()}-${id.slice(0, 6).toUpperCase()}`;
    const draft: DraftFinding = {
      id,
      workpaperId,
      testStepId: `step-${crypto.randomUUID().slice(0, 8)}`,
      testStepTitle,
      initialObservation,
      traceabilityToken,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ draftFindings: [...state.draftFindings, draft] }));
    return draft;
  },

  promoteDraftFinding: (draftId) => {
    set((state) => ({
      draftFindings: state.draftFindings.map((d) =>
        d.id === draftId ? { ...d, status: 'PROMOTED' } : d,
      ),
    }));
  },

  promoteDraftToStudio: async (draftId) => {
    const draft = get().draftFindings.find((d) => d.id === draftId);
    if (!draft || draft.status === 'PROMOTED') return null;

    const now = new Date().toISOString();
    const findingId = crypto.randomUUID();
    const findingCode = `BLG-${draft.traceabilityToken.slice(-6)}`;

    const { data: workpaperRow } = await supabase
      .from('workpapers')
      .select('engagement_id')
      .eq('id', draft.workpaperId)
      .maybeSingle();

    const engagementId = workpaperRow?.engagement_id || draft.workpaperId;

    const newFinding: ComprehensiveFinding = {
      id: findingId,
      tenant_id: ACTIVE_TENANT_ID,
      engagement_id: engagementId,
      workpaper_id: draft.workpaperId,
      code: findingCode,
      finding_code: findingCode,
      title: draft.testStepTitle,
      description: draft.initialObservation,
      severity: 'MEDIUM',
      state: 'NEGOTIATION',
      traceability_token: draft.traceabilityToken,
      created_at: now,
      updated_at: now,
      action_plans: [],
      comments: [],
      history: [],
    };

    await supabase.from('audit_findings').insert({
      id: findingId,
      tenant_id: ACTIVE_TENANT_ID,
      engagement_id: engagementId,
      workpaper_id: draft.workpaperId,
      finding_code: findingCode,
      title: draft.testStepTitle,
      description: draft.initialObservation,
      severity: 'MEDIUM',
      state: 'NEGOTIATION',
      traceability_token: draft.traceabilityToken,
      created_at: now,
      updated_at: now,
    });

    set((state) => ({
      findings: [...state.findings, newFinding],
      draftFindings: state.draftFindings.map((d) =>
        d.id === draftId
          ? { ...d, status: 'PROMOTED', promotedFindingId: findingId }
          : d,
      ),
    }));

    return { findingId };
  },

  setFindings: (findings) => set({ findings }),

  addFinding: (finding) =>
    set((state) => ({
      findings: [
        ...state.findings,
        {
          ...finding,
          action_plans: [],
          comments: [],
          history: [],
        },
      ],
    })),

  updateFinding: (id, updates) =>
    set((state) => ({
      findings: state.findings.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
      selectedFinding:
        state.selectedFinding?.id === id
          ? { ...state.selectedFinding, ...updates }
          : state.selectedFinding,
    })),

  deleteFinding: (id) =>
    set((state) => ({
      findings: state.findings.filter((f) => f.id !== id),
      selectedFinding:
        state.selectedFinding?.id === id ? null : state.selectedFinding,
    })),

  selectFinding: (id) =>
    set((state) => ({
      selectedFinding: id
        ? state.findings.find((f) => f.id === id) || null
        : null,
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  updateFindingScore: (id, newScore, newSeverity) =>
    set((state) => ({
      findings: state.findings.map((f) =>
        f.id === id ? { ...f, impact_score: newScore, severity: newSeverity as any } : f
      ),
      selectedFinding:
        state.selectedFinding?.id === id
          ? { ...state.selectedFinding, impact_score: newScore, severity: newSeverity as any }
          : state.selectedFinding,
    })),

  changeState: (id, newState) =>
    set((state) => ({
      findings: state.findings.map((f) =>
        f.id === id ? { ...f, state: newState as any } : f
      ),
    })),

  addActionPlan: (findingId, actionPlan) =>
    set((state) => ({
      findings: state.findings.map((f) =>
        f.id === findingId
          ? { ...f, action_plans: [...(f.action_plans || []), actionPlan] }
          : f
      ),
    })),

  updateActionPlan: (findingId, actionPlanId, updates) =>
    set((state) => ({
      findings: state.findings.map((f) =>
        f.id === findingId
          ? {
              ...f,
              action_plans: (f.action_plans || []).map((ap) =>
                ap.id === actionPlanId ? { ...ap, ...updates } : ap
              ),
            }
          : f
      ),
    })),

  deleteActionPlan: (findingId, actionPlanId) =>
    set((state) => ({
      findings: state.findings.map((f) =>
        f.id === findingId
          ? {
              ...f,
              action_plans: (f.action_plans || []).filter((ap) => ap.id !== actionPlanId),
            }
          : f
      ),
    })),

  addComment: (findingId, comment) =>
    set((state) => ({
      findings: state.findings.map((f) =>
        f.id === findingId
          ? { ...f, comments: [...(f.comments || []), comment] }
          : f
      ),
    })),

  updateComment: (findingId, commentId, updates) =>
    set((state) => ({
      findings: state.findings.map((f) =>
        f.id === findingId
          ? {
              ...f,
              comments: (f.comments || []).map((c) =>
                c.id === commentId ? { ...c, ...updates } : c
              ),
            }
          : f
      ),
    })),

  deleteComment: (findingId, commentId) =>
    set((state) => ({
      findings: state.findings.map((f) =>
        f.id === findingId
          ? {
              ...f,
              comments: (f.comments || []).map((c) =>
                c.id === commentId ? { ...c, is_deleted: true } : c
              ),
            }
          : f
      ),
    })),

  updateSecrets: (findingId, secrets) =>
    set((state) => ({
      findings: state.findings.map((f) =>
        f.id === findingId
          ? { ...f, secrets: { ...f.secrets, ...secrets } as FindingSecret }
          : f
      ),
    })),

  addHistory: (findingId, history) =>
    set((state) => ({
      findings: state.findings.map((f) =>
        f.id === findingId
          ? { ...f, history: [...(f.history || []), history] }
          : f
      ),
    })),

  // Legacy support
  setLegacyFindings: (findings) => set({ legacyFindings: findings }),
}));
