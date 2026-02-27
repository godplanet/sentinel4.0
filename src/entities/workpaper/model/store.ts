import { create } from 'zustand';
import type {
  Workpaper,
  AuditStep,
  EvidenceItem,
  WorkpaperFinding,
  CreateWorkpaperInput,
  UpdateWorkpaperDataInput,
  UpdateWorkpaperStatusInput,
  CreateEvidenceInput,
} from './types';

interface WorkpaperStore {
  workpapers: Workpaper[];
  auditSteps: AuditStep[];
  evidence: EvidenceItem[];
  findings: WorkpaperFinding[];
  loading: boolean;
  error: string | null;
  isDrawerOpen: boolean;
  activeWorkpaperId: string | null;
  activeStepId: string | null;

  setWorkpapers: (workpapers: Workpaper[]) => void;
  setAuditSteps: (steps: AuditStep[]) => void;
  setEvidence: (evidence: EvidenceItem[]) => void;
  setFindings: (findings: WorkpaperFinding[]) => void;

  createWorkpaper: (input: CreateWorkpaperInput) => Workpaper;
  updateWorkpaperData: (input: UpdateWorkpaperDataInput) => void;
  updateWorkpaperStatus: (input: UpdateWorkpaperStatusInput) => void;
  deleteWorkpaper: (workpaperId: string) => void;
  initializeWorkpapersForEngagement: (
    engagementId: string,
    stepConfigs: Array<{ code: string; title: string; description: string; risk_weight: number }>,
    auditorId?: string,
  ) => { steps: AuditStep[]; workpapers: Workpaper[] };

  addEvidence: (input: CreateEvidenceInput) => EvidenceItem;

  getWorkpaperById: (workpaperId: string) => Workpaper | undefined;
  getWorkpapersByStep: (stepId: string) => Workpaper[];
  getEvidenceByWorkpaper: (workpaperId: string) => EvidenceItem[];
  getFindingsByWorkpaper: (workpaperId: string) => WorkpaperFinding[];
  getStepById: (stepId: string) => AuditStep | undefined;

  openDrawer: (workpaperId: string, stepId: string) => void;
  closeDrawer: () => void;
}

export const useWorkpaperStore = create<WorkpaperStore>((set, get) => ({
  workpapers: [],
  auditSteps: [],
  evidence: [],
  findings: [],
  loading: false,
  error: null,
  isDrawerOpen: false,
  activeWorkpaperId: null,
  activeStepId: null,

  setWorkpapers: (workpapers) => set({ workpapers }),

  setAuditSteps: (auditSteps) => set({ auditSteps }),

  setEvidence: (evidence) => set({ evidence }),

  setFindings: (findings) => set({ findings }),

  createWorkpaper: (input) => {
    const newWorkpaper: Workpaper = {
      id: crypto.randomUUID(),
      step_id: input.step_id,
      assigned_auditor_id: input.assigned_auditor_id,
      status: 'draft',
      data: {},
      version: 1,
      updated_at: new Date().toISOString(),
    };

    set((state) => ({
      workpapers: [...state.workpapers, newWorkpaper],
    }));

    return newWorkpaper;
  },

  updateWorkpaperData: (input) => {
    set((state) => ({
      workpapers: state.workpapers.map((wp) =>
        wp.id === input.workpaper_id
          ? {
              ...wp,
              data: { ...wp.data, ...input.data },
              version: wp.version + 1,
              updated_at: new Date().toISOString(),
            }
          : wp
      ),
    }));
  },

  updateWorkpaperStatus: (input) => {
    set((state) => ({
      workpapers: state.workpapers.map((wp) =>
        wp.id === input.workpaper_id
          ? {
              ...wp,
              status: input.status,
              updated_at: new Date().toISOString(),
            }
          : wp
      ),
    }));
  },

  deleteWorkpaper: (workpaperId) => {
    set((state) => ({
      workpapers: state.workpapers.filter((wp) => wp.id !== workpaperId),
      evidence: state.evidence.filter((ev) => ev.workpaper_id !== workpaperId),
      findings: state.findings.filter((f) => f.workpaper_id !== workpaperId),
    }));
  },

  initializeWorkpapersForEngagement: (engagementId, stepConfigs, auditorId) => {
    const now = new Date().toISOString();
    const newSteps: AuditStep[] = stepConfigs.map((cfg) => ({
      id: crypto.randomUUID(),
      engagement_id: engagementId,
      step_code: cfg.code,
      title: cfg.title,
      description: cfg.description,
      risk_weight: cfg.risk_weight,
      required_evidence_types: [],
      created_at: now,
    }));

    const newWorkpapers: Workpaper[] = newSteps.map((step) => ({
      id: crypto.randomUUID(),
      step_id: step.id,
      assigned_auditor_id: auditorId,
      status: 'draft' as const,
      data: {},
      version: 1,
      updated_at: now,
    }));

    set((state) => ({
      auditSteps: [...state.auditSteps, ...newSteps],
      workpapers: [...state.workpapers, ...newWorkpapers],
    }));

    return { steps: newSteps, workpapers: newWorkpapers };
  },

  addEvidence: (input) => {
    const newEvidence: EvidenceItem = {
      id: crypto.randomUUID(),
      workpaper_id: input.workpaper_id,
      storage_path: input.storage_path,
      file_name: input.file_name,
      file_size_bytes: input.file_size_bytes,
      sha256_hash: input.sha256_hash,
      uploaded_at: new Date().toISOString(),
    };

    set((state) => ({
      evidence: [...state.evidence, newEvidence],
    }));

    return newEvidence;
  },

  getWorkpaperById: (workpaperId) => {
    return get().workpapers.find((wp) => wp.id === workpaperId);
  },

  getWorkpapersByStep: (stepId) => {
    return get().workpapers.filter((wp) => wp.step_id === stepId);
  },

  getEvidenceByWorkpaper: (workpaperId) => {
    return get().evidence.filter((ev) => ev.workpaper_id === workpaperId);
  },

  getFindingsByWorkpaper: (workpaperId) => {
    return get().findings.filter((f) => f.workpaper_id === workpaperId);
  },

  getStepById: (stepId) => {
    return get().auditSteps.find((step) => step.id === stepId);
  },

  openDrawer: (workpaperId, stepId) => {
    set({
      isDrawerOpen: true,
      activeWorkpaperId: workpaperId,
      activeStepId: stepId,
    });
  },

  closeDrawer: () => {
    set({
      isDrawerOpen: false,
      activeWorkpaperId: null,
      activeStepId: null,
    });
  },
}));
