import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';
import type {
  Report,
  ReportBlock,
  ReportVersion,
  ReportTemplate,
  ReportComment,
  FindingPoolItem,
  CreateReportData,
  UpdateReportData,
  CreateBlockData,
  UpdateBlockData,
} from '../model/types';

const TENANT_ID = ACTIVE_TENANT_ID;

export const reportApi = {
  async getTemplates(): Promise<ReportTemplate[]> {
    const { data, error } = await supabase
      .from('report_templates')
      .select('*')
      .eq('is_active', true)
      .order('type');
    if (error) throw error;
    return data || [];
  },

  async getComments(reportId: string): Promise<ReportComment[]> {
    const { data, error } = await supabase
      .from('report_comments')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async addComment(comment: { report_id: string; text: string; type?: string }): Promise<ReportComment> {
    const { data, error } = await supabase
      .from('report_comments')
      .insert({ ...comment, type: comment.type || 'COMMENT' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async resolveComment(id: string): Promise<void> {
    const { error } = await supabase
      .from('report_comments')
      .update({ resolved: true })
      .eq('id', id);
    if (error) throw error;
  },

  async getFindings(): Promise<FindingPoolItem[]> {
    const { data, error } = await supabase
      .from('audit_findings')
      .select('id, finding_ref, title, severity, status, impact_description')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data || [];
  },

  async saveTiptapContent(id: string, content: any): Promise<void> {
    const { error } = await supabase
      .from('reports')
      .update({ tiptap_content: content, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async getReports(): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getReport(id: string): Promise<Report | null> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async createReport(reportData: CreateReportData): Promise<Report> {
    const { data, error } = await supabase
      .from('reports')
      .insert({
        tenant_id: TENANT_ID,
        ...reportData,
        theme_config: {
          mode: 'neon',
          accent: 'blue',
          layout: 'standard',
          ...reportData.theme_config,
        },
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateReport(id: string, updates: UpdateReportData): Promise<Report> {
    const { data, error } = await supabase
      .from('reports')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteReport(id: string): Promise<void> {
    const { error } = await supabase.from('reports').delete().eq('id', id);
    if (error) throw error;
  },

  async getBlocks(reportId: string): Promise<ReportBlock[]> {
    const { data, error } = await supabase
      .from('report_blocks')
      .select('*')
      .eq('report_id', reportId)
      .order('position_index', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createBlock(blockData: CreateBlockData): Promise<ReportBlock> {
    const { data, error } = await supabase
      .from('report_blocks')
      .insert({ tenant_id: TENANT_ID, ...blockData, depth_level: 0 })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateBlock(id: string, updates: UpdateBlockData): Promise<ReportBlock> {
    const { data, error } = await supabase
      .from('report_blocks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteBlock(id: string): Promise<void> {
    const { error } = await supabase.from('report_blocks').delete().eq('id', id);
    if (error) throw error;
  },

  async reorderBlocks(reportId: string, blockIds: string[]): Promise<void> {
    for (let i = 0; i < blockIds.length; i++) {
      await supabase
        .from('report_blocks')
        .update({ position_index: i })
        .eq('id', blockIds[i]);
    }
  },

  async publishReport(reportId: string): Promise<void> {
    const { error } = await supabase.rpc('freeze_report_blocks', { target_report_id: reportId });
    if (error) throw error;
  },

  async getVersions(reportId: string): Promise<ReportVersion[]> {
    const { data, error } = await supabase
      .from('report_versions')
      .select('*')
      .eq('report_id', reportId)
      .order('version_number', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createVersion(reportId: string, label?: string): Promise<ReportVersion> {
    const report = await reportApi.getReport(reportId);
    const blocks = await reportApi.getBlocks(reportId);
    if (!report) throw new Error('Report not found');

    const { data: latestVersion } = await supabase
      .from('report_versions')
      .select('version_number')
      .eq('report_id', reportId)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data, error } = await supabase
      .from('report_versions')
      .insert({
        tenant_id: TENANT_ID,
        report_id: reportId,
        version_number: (latestVersion?.version_number || 0) + 1,
        version_label: label,
        full_snapshot_json: { report, blocks },
        trigger_event: 'manual',
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
