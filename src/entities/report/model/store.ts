import { create } from 'zustand';
import toast from 'react-hot-toast';
import type { Report, ReportBlock, ReportTemplate, ReportComment, M6Report, M6ReportBlock, M6ReportStatus, M6ReviewNote, ReportSection, ExecutiveSummary } from './types';
import { reportApi } from '../api';
import {
  fetchReportData,
  updateReportMetaDb,
  upsertBlockDb,
  updateBlockOrdersDb,
  deleteBlockDb,
  publishReportApi,
  createSectionDb,
} from '../api/report-api';
import { generateSHA256Hash } from '@/shared/lib/crypto';

interface ReportState {
  reports: Report[];
  currentReport: Report | null;
  blocks: ReportBlock[];
  templates: ReportTemplate[];
  comments: ReportComment[];
  loading: boolean;
  error: string | null;

  fetchReports: () => Promise<void>;
  fetchReport: (id: string) => Promise<void>;
  fetchBlocks: (reportId: string) => Promise<void>;
  fetchTemplates: () => Promise<void>;
  fetchComments: (reportId: string) => Promise<void>;
  addComment: (data: { report_id: string; text: string; type?: string }) => Promise<void>;
  resolveComment: (id: string) => Promise<void>;
  createReport: (data: any) => Promise<Report>;
  updateReport: (id: string, data: any) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  addBlock: (data: any) => Promise<ReportBlock>;
  updateBlock: (id: string, data: any) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  reorderBlocks: (blockIds: string[]) => Promise<void>;
  publishReport: (id: string) => Promise<void>;
  reset: () => void;
}

export const useReportStore = create<ReportState>((set, get) => ({
  reports: [],
  currentReport: null,
  blocks: [],
  templates: [],
  comments: [],
  loading: false,
  error: null,

  fetchReports: async () => {
    set({ loading: true, error: null });
    try {
      const reports = await reportApi.getReports();
      set({ reports, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchReport: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const report = await reportApi.getReport(id);
      set({ currentReport: report, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchBlocks: async (reportId: string) => {
    set({ loading: true, error: null });
    try {
      const blocks = await reportApi.getBlocks(reportId);
      set({ blocks, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchTemplates: async () => {
    try {
      const templates = await reportApi.getTemplates();
      set({ templates });
    } catch {
      set({ templates: [] });
    }
  },

  fetchComments: async (reportId: string) => {
    try {
      const comments = await reportApi.getComments(reportId);
      set({ comments });
    } catch {
      set({ comments: [] });
    }
  },

  addComment: async (data) => {
    try {
      const comment = await reportApi.addComment(data);
      set((state) => ({ comments: [...state.comments, comment] }));
    } catch {
      /* silent */
    }
  },

  resolveComment: async (id: string) => {
    try {
      await reportApi.resolveComment(id);
      set((state) => ({
        comments: state.comments.map((c) => (c.id === id ? { ...c, resolved: true } : c)),
      }));
    } catch {
      /* silent */
    }
  },

  createReport: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const report = await reportApi.createReport(data);
      set((state) => ({ reports: [report, ...state.reports], loading: false }));
      return report;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateReport: async (id: string, data: any) => {
    set({ loading: true, error: null });
    try {
      const updated = await reportApi.updateReport(id, data);
      set((state) => ({
        reports: state.reports.map((r) => (r.id === id ? updated : r)),
        currentReport: state.currentReport?.id === id ? updated : state.currentReport,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteReport: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await reportApi.deleteReport(id);
      set((state) => ({
        reports: state.reports.filter((r) => r.id !== id),
        currentReport: state.currentReport?.id === id ? null : state.currentReport,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addBlock: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const block = await reportApi.createBlock(data);
      set((state) => ({
        blocks: [...state.blocks, block].sort((a, b) => a.position_index - b.position_index),
        loading: false,
      }));
      return block;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateBlock: async (id: string, data: any) => {
    set({ loading: true, error: null });
    try {
      const updated = await reportApi.updateBlock(id, data);
      set((state) => ({
        blocks: state.blocks.map((b) => (b.id === id ? updated : b)),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteBlock: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await reportApi.deleteBlock(id);
      set((state) => ({
        blocks: state.blocks.filter((b) => b.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  reorderBlocks: async (blockIds: string[]) => {
    const { blocks, currentReport } = get();
    if (!currentReport) return;

    const optimisticBlocks = blockIds
      .map((id, index) => {
        const block = blocks.find((b) => b.id === id);
        return block ? { ...block, position_index: index } : null;
      })
      .filter(Boolean) as ReportBlock[];

    set({ blocks: optimisticBlocks });

    try {
      await reportApi.reorderBlocks(currentReport.id, blockIds);
    } catch (error: any) {
      set({ blocks, error: error.message });
    }
  },

  publishReport: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await reportApi.publishReport(id);
      const updated = await reportApi.getReport(id);
      set((state) => ({
        reports: state.reports.map((r) => (r.id === id && updated ? updated : r)),
        currentReport: state.currentReport?.id === id ? updated : state.currentReport,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  reset: () => {
    set({
      reports: [],
      currentReport: null,
      blocks: [],
      templates: [],
      comments: [],
      loading: false,
      error: null,
    });
  },
}));

// ─── MODULE 6: Active Report Store (Polymorphic Block Architecture) ──────────

interface ActiveReportState {
  activeReport: M6Report | null;
  isLoading: boolean;
  error: string | null;
  smartVariables: Record<string, string | number>;
  loadReport: (reportId: string) => Promise<void>;
  setActiveReport: (report: M6Report | null) => void;
  updateReportMeta: (data: Partial<M6Report>) => void;
  updateExecutiveSummary: (data: Partial<ExecutiveSummary>) => void;
  changeReportStatus: (status: M6ReportStatus) => void;
  updateSmartVariable: (id: string, value: string | number) => void;
  addReviewNote: (note: Omit<M6ReviewNote, 'id' | 'createdAt' | 'status'>) => void;
  resolveReviewNote: (noteId: string) => void;
  addSection: (title: string) => Promise<string | null>;
  addBlock: (sectionId: string, block: M6ReportBlock) => void;
  updateBlock: (sectionId: string, blockId: string, updates: Partial<M6ReportBlock>) => void;
  removeBlock: (sectionId: string, blockId: string) => void;
  reorderBlocks: (sectionId: string, startIndex: number, endIndex: number) => void;
  publishReport: () => Promise<void>;
}

const reindexBlocks = (blocks: M6ReportBlock[]): M6ReportBlock[] =>
  blocks.map((b, i) => ({ ...b, orderIndex: i }));

const mapSection = (
  sections: ReportSection[],
  sectionId: string,
  fn: (blocks: M6ReportBlock[]) => M6ReportBlock[],
): ReportSection[] =>
  sections.map((s) => (s.id === sectionId ? { ...s, blocks: fn(s.blocks) } : s));

function isIronVaultError(message: string): boolean {
  return message.includes('HUKUKİ İHLAL') || message.includes('Iron Vault');
}

export const useActiveReportStore = create<ActiveReportState>((set, get) => ({
  activeReport: null,
  isLoading: false,
  error: null,

  smartVariables: {
    npl_ratio: '%3.42',
    critical_findings_count: 3,
    total_risk_exposure: '₺45.2M',
  },

  loadReport: async (reportId: string) => {
    set({ isLoading: true, error: null });
    try {
      const report = await fetchReportData(reportId);
      set({ activeReport: report, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err?.message ?? 'Rapor yüklenemedi.' });
      toast.error('Rapor yüklenirken bir hata oluştu.');
    }
  },

  setActiveReport: (report) => set({ activeReport: report }),

  updateExecutiveSummary: (data) => {
    const { activeReport } = get();
    if (!activeReport) return;
    const prev = { ...activeReport };
    const optimistic: M6Report = {
      ...activeReport,
      executiveSummary: { ...activeReport.executiveSummary, ...data },
      updatedAt: new Date().toISOString(),
    };
    set({ activeReport: optimistic });
    updateReportMetaDb(activeReport.id, {
      executive_summary: optimistic.executiveSummary,
    }).catch((err: any) => {
      set({ activeReport: prev });
      toast.error(isIronVaultError(err?.message ?? '') ? err.message : 'Yönetici özeti kaydedilemedi.');
    });
  },

  changeReportStatus: (status) => {
    const { activeReport } = get();
    if (!activeReport) return;
    const prev = { ...activeReport };
    const now = new Date().toISOString();
    const optimistic: M6Report = {
      ...activeReport,
      status,
      updatedAt: now,
      publishedAt: status === 'published' ? now : activeReport.publishedAt,
    };
    set({ activeReport: optimistic });
    updateReportMetaDb(activeReport.id, { status }).catch((err: any) => {
      set({ activeReport: prev });
      toast.error(isIronVaultError(err?.message ?? '') ? err.message : 'Durum güncellenemedi.');
    });
  },

  updateReportMeta: (data) => {
    const { activeReport } = get();
    if (!activeReport) return;
    const prev = { ...activeReport };
    const optimistic: M6Report = {
      ...activeReport,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    set({ activeReport: optimistic });
    updateReportMetaDb(activeReport.id, data as Record<string, any>).catch((err: any) => {
      set({ activeReport: prev });
      toast.error(isIronVaultError(err?.message ?? '') ? err.message : 'Meta bilgisi kaydedilemedi.');
    });
  },

  updateSmartVariable: (id, value) =>
    set((state) => ({
      smartVariables: { ...state.smartVariables, [id]: value },
    })),

  addReviewNote: (note) =>
    set((state) => {
      if (!state.activeReport) return state;
      const newNote: M6ReviewNote = {
        ...note,
        id: `rnote-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        status: 'open',
        createdAt: new Date().toISOString(),
      };
      return {
        activeReport: {
          ...state.activeReport,
          reviewNotes: [...(state.activeReport.reviewNotes ?? []), newNote],
          updatedAt: new Date().toISOString(),
        },
      };
    }),

  resolveReviewNote: (noteId) =>
    set((state) => {
      if (!state.activeReport) return state;
      return {
        activeReport: {
          ...state.activeReport,
          reviewNotes: (state.activeReport.reviewNotes ?? []).map((n) =>
            n.id === noteId
              ? { ...n, status: 'resolved' as const, resolvedAt: new Date().toISOString() }
              : n,
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    }),

  addSection: async (title) => {
    const { activeReport } = get();
    if (!activeReport) return null;
    try {
      const orderIndex = activeReport.sections.length;
      const created = await createSectionDb(activeReport.id, title, orderIndex);
      const newSection: ReportSection = { id: created.id, title: created.title, orderIndex: created.orderIndex, blocks: [] };
      set({
        activeReport: {
          ...activeReport,
          sections: [...activeReport.sections, newSection],
          updatedAt: new Date().toISOString(),
        },
      });
      return created.id;
    } catch (err: any) {
      toast.error(isIronVaultError(err?.message ?? '') ? err.message : 'Bölüm oluşturulamadı.');
      return null;
    }
  },

  addBlock: (sectionId, block) => {
    const { activeReport } = get();
    if (!activeReport) return;
    set({
      activeReport: {
        ...activeReport,
        sections: mapSection(activeReport.sections, sectionId, (blocks) =>
          reindexBlocks([...blocks, block]),
        ),
      },
    });
    upsertBlockDb(sectionId, block).catch((err: any) => {
      if (isIronVaultError(err?.message ?? '')) {
        toast.error(err.message);
      }
    });
  },

  updateBlock: (sectionId, blockId, updates) => {
    const { activeReport } = get();
    if (!activeReport) return;
    const prev = activeReport;
    const optimistic: M6Report = {
      ...activeReport,
      sections: mapSection(activeReport.sections, sectionId, (blocks) =>
        blocks.map((b) => (b.id === blockId ? ({ ...b, ...updates } as M6ReportBlock) : b)),
      ),
    };
    set({ activeReport: optimistic });
    const updatedBlock = optimistic.sections
      .find((s) => s.id === sectionId)
      ?.blocks.find((b) => b.id === blockId);
    if (updatedBlock) {
      upsertBlockDb(sectionId, updatedBlock).catch((err: any) => {
        set({ activeReport: prev });
        toast.error(isIronVaultError(err?.message ?? '') ? err.message : 'Blok güncellenemedi.');
      });
    }
  },

  removeBlock: (sectionId, blockId) => {
    const { activeReport } = get();
    if (!activeReport) return;
    const prev = activeReport;
    set({
      activeReport: {
        ...activeReport,
        sections: mapSection(activeReport.sections, sectionId, (blocks) =>
          reindexBlocks(blocks.filter((b) => b.id !== blockId)),
        ),
      },
    });
    deleteBlockDb(blockId).catch((err: any) => {
      set({ activeReport: prev });
      toast.error(isIronVaultError(err?.message ?? '') ? err.message : 'Blok silinemedi.');
    });
  },

  reorderBlocks: (sectionId, startIndex, endIndex) => {
    const { activeReport } = get();
    if (!activeReport) return;
    const prev = activeReport;
    const optimistic: M6Report = {
      ...activeReport,
      sections: mapSection(activeReport.sections, sectionId, (blocks) => {
        const result = [...blocks];
        const [moved] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, moved);
        return reindexBlocks(result);
      }),
    };
    set({ activeReport: optimistic });
    const reindexed = optimistic.sections
      .find((s) => s.id === sectionId)
      ?.blocks.map((b) => ({ id: b.id, order_index: b.orderIndex })) ?? [];
    updateBlockOrdersDb(reindexed).catch((err: any) => {
      set({ activeReport: prev });
      toast.error(isIronVaultError(err?.message ?? '') ? err.message : 'Sıralama kaydedilemedi.');
    });
  },

  publishReport: async () => {
    const { activeReport } = get();
    if (!activeReport) return;
    const prev = activeReport;
    const now = new Date().toISOString();
    const blocksSnapshotMap: Record<string, any> = {};
    for (const section of activeReport.sections) {
      for (const block of section.blocks) {
        blocksSnapshotMap[block.id] = block.content;
      }
    }
    const hashSeal = await generateSHA256Hash(
      JSON.stringify({ id: activeReport.id, sections: activeReport.sections, publishedAt: now }),
    );
    const optimistic: M6Report = {
      ...activeReport,
      status: 'published',
      publishedAt: now,
      updatedAt: now,
      hashSeal,
    };
    set({ activeReport: optimistic });
    try {
      await publishReportApi(activeReport.id, hashSeal, blocksSnapshotMap);
    } catch (err: any) {
      set({ activeReport: prev });
      toast.error(
        isIronVaultError(err?.message ?? '')
          ? err.message
          : 'Rapor yayınlanamadı. Lütfen tekrar deneyin.',
      );
    }
  },
}));
