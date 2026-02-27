/**
 * Workpaper Store
 */

import { create } from 'zustand';
import type {
  Workpaper,
  AuditStep,
  Evidence,
  WorkpaperFinding,
  UserPresence,
  TestResult,
  ActiveEngagement,
} from './types';

interface WorkpaperStore {
  workpapers: Workpaper[];
  activeWorkpaper: Workpaper | null;
  auditSteps: AuditStep[];
  evidence: Evidence[];
  findings: WorkpaperFinding[];
  presences: UserPresence[];
  activeEngagements: ActiveEngagement[];
  loading: boolean;
  error: string | null;

  setWorkpapers: (workpapers: Workpaper[]) => void;
  setActiveWorkpaper: (workpaper: Workpaper | null) => void;
  setAuditSteps: (steps: AuditStep[]) => void;
  setEvidence: (evidence: Evidence[]) => void;
  setFindings: (findings: WorkpaperFinding[]) => void;
  setPresences: (presences: UserPresence[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addActiveEngagement: (engagement: ActiveEngagement) => void;
  updateActiveEngagementStatus: (engagementId: string, status: ActiveEngagement['status']) => void;
  getActiveEngagementById: (id: string) => ActiveEngagement | undefined;

  updateWorkpaperData: (workpaperId: string, data: Partial<Workpaper['data']>) => void;
  updateTestResult: (workpaperId: string, testKey: string, result: TestResult) => void;
  updateWorkpaperStatus: (workpaperId: string, status: Workpaper['status']) => void;
  addComment: (workpaperId: string, comment: string) => void;
  addEvidence: (evidence: Evidence) => void;
  removeEvidence: (evidenceId: string) => void;
  updatePresence: (presence: UserPresence) => void;
  removePresence: (userId: string) => void;
}

export const useWorkpaperStore = create<WorkpaperStore>((set, get) => ({
  workpapers: [],
  activeWorkpaper: null,
  auditSteps: [],
  evidence: [],
  findings: [],
  presences: [],
  activeEngagements: [],
  loading: false,
  error: null,

  addActiveEngagement: (engagement) =>
    set((state) => ({
      activeEngagements: [...state.activeEngagements, engagement],
    })),

  updateActiveEngagementStatus: (engagementId, status) =>
    set((state) => ({
      activeEngagements: state.activeEngagements.map((e) =>
        e.id === engagementId ? { ...e, status } : e
      ),
    })),

  getActiveEngagementById: (id) =>
    get().activeEngagements.find((e) => e.id === id),

  setWorkpapers: (workpapers) => set({ workpapers }),
  setActiveWorkpaper: (workpaper) => set({ activeWorkpaper: workpaper }),
  setAuditSteps: (auditSteps) => set({ auditSteps }),
  setEvidence: (evidence) => set({ evidence }),
  setFindings: (findings) => set({ findings }),
  setPresences: (presences) => set({ presences }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  updateWorkpaperData: (workpaperId, data) => {
    set((state) => ({
      workpapers: state.workpapers.map((wp) =>
        wp.id === workpaperId
          ? {
              ...wp,
              data: { ...wp.data, ...data },
              version: wp.version + 1,
              updated_at: new Date().toISOString(),
            }
          : wp
      ),
      activeWorkpaper:
        state.activeWorkpaper?.id === workpaperId
          ? {
              ...state.activeWorkpaper,
              data: { ...state.activeWorkpaper.data, ...data },
              version: state.activeWorkpaper.version + 1,
              updated_at: new Date().toISOString(),
            }
          : state.activeWorkpaper,
    }));
  },

  updateTestResult: (workpaperId, testKey, result) => {
    set((state) => {
      const updateWorkpaper = (wp: Workpaper) => {
        if (wp.id !== workpaperId) return wp;
        const test_results = { ...(wp.data.test_results || {}), [testKey]: result };
        return {
          ...wp,
          data: { ...wp.data, test_results },
          version: wp.version + 1,
          updated_at: new Date().toISOString(),
        };
      };

      return {
        workpapers: state.workpapers.map(updateWorkpaper),
        activeWorkpaper: state.activeWorkpaper ? updateWorkpaper(state.activeWorkpaper) : null,
      };
    });
  },

  updateWorkpaperStatus: (workpaperId, status) => {
    set((state) => ({
      workpapers: state.workpapers.map((wp) =>
        wp.id === workpaperId
          ? { ...wp, status, updated_at: new Date().toISOString() }
          : wp
      ),
      activeWorkpaper:
        state.activeWorkpaper?.id === workpaperId
          ? { ...state.activeWorkpaper, status, updated_at: new Date().toISOString() }
          : state.activeWorkpaper,
    }));
  },

  addComment: (workpaperId, commentText) => {
    set((state) => {
      const newComment = {
        text: commentText,
        author_id: 'current-user-id',
        timestamp: new Date().toISOString(),
      };

      const updateWorkpaper = (wp: Workpaper) => {
        if (wp.id !== workpaperId) return wp;
        const comments = [...(wp.data.comments || []), newComment];
        return {
          ...wp,
          data: { ...wp.data, comments },
          version: wp.version + 1,
          updated_at: new Date().toISOString(),
        };
      };

      return {
        workpapers: state.workpapers.map(updateWorkpaper),
        activeWorkpaper: state.activeWorkpaper ? updateWorkpaper(state.activeWorkpaper) : null,
      };
    });
  },

  addEvidence: (evidence) => {
    set((state) => ({
      evidence: [...state.evidence, evidence],
    }));
  },

  removeEvidence: (evidenceId) => {
    set((state) => ({
      evidence: state.evidence.filter((e) => e.id !== evidenceId),
    }));
  },

  updatePresence: (presence) => {
    set((state) => {
      const existing = state.presences.find((p) => p.user_id === presence.user_id);
      if (existing) {
        return {
          presences: state.presences.map((p) =>
            p.user_id === presence.user_id ? presence : p
          ),
        };
      }
      return {
        presences: [...state.presences, presence],
      };
    });
  },

  removePresence: (userId) => {
    set((state) => ({
      presences: state.presences.filter((p) => p.user_id !== userId),
    }));
  },
}));
