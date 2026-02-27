export type ReportStatus = 'draft' | 'review' | 'published' | 'archived';

export type ReportLayoutType = 'standard' | 'dashboard' | 'executive';

export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'finding_ref'
  | 'live_chart'
  | 'dynamic_metric'
  | 'signature'
  | 'table'
  | 'image'
  | 'divider';

export interface ThemeConfig {
  mode: 'neon' | 'glass' | 'minimal';
  accent: 'blue' | 'purple' | 'green' | 'orange';
  layout: 'standard' | 'compact' | 'spacious';
}

export interface Report {
  id: string;
  tenant_id: string;
  engagement_id?: string;
  template_id?: string;
  title: string;
  description: string;
  status: ReportStatus;
  theme_config: ThemeConfig;
  layout_type: ReportLayoutType;
  tiptap_content?: any;
  snapshot_data?: ReportSnapshot;
  created_by?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  published_by?: string;
  locked_by?: string;
  locked_at?: string;
}

export interface HeadingContent {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface ParagraphContent {
  text: string;
  format?: {
    bold?: boolean;
    italic?: boolean;
    align?: 'left' | 'center' | 'right' | 'justify';
  };
}

export interface FindingRefContent {
  finding_id: string;
  display_mode: 'card' | 'inline' | 'summary';
  show_details?: boolean;
}

export interface LiveChartContent {
  chart_type: 'risk_distribution' | 'finding_trends' | 'severity_breakdown' | 'timeline';
  data_source: 'findings' | 'risks' | 'engagements';
  filter?: Record<string, any>;
  config?: {
    width?: number;
    height?: number;
    colors?: string[];
  };
}

export interface DynamicMetricContent {
  metric_key: string;
  label: string;
  format: 'number' | 'percentage' | 'currency' | 'score';
  data_source: 'findings' | 'risks' | 'computed';
  fallback?: number;
}

export interface SignatureContent {
  signer_name: string;
  signer_title: string;
  signed_at?: string;
  signature_data?: string;
}

export type BlockContent =
  | HeadingContent
  | ParagraphContent
  | FindingRefContent
  | LiveChartContent
  | DynamicMetricContent
  | SignatureContent
  | Record<string, any>;

export interface ReportBlock {
  id: string;
  tenant_id: string;
  report_id: string;
  position_index: number;
  parent_block_id?: string;
  depth_level: number;
  block_type: BlockType;
  content: BlockContent;
  snapshot_data?: BlockContent;
  snapshot_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  locked_by?: string;
  locked_at?: string;
}

export interface ReportVersion {
  id: string;
  tenant_id: string;
  report_id: string;
  version_number: number;
  version_label?: string;
  full_snapshot_json: {
    report: Report;
    blocks: ReportBlock[];
  };
  created_by?: string;
  created_at: string;
  change_summary?: string;
  trigger_event?: 'manual' | 'auto_save' | 'publish' | 'review_submit';
}

export interface ReportTemplate {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  type: string;
  structure_json: TemplateBlock[];
  is_active: boolean;
  created_at: string;
}

export interface TemplateBlock {
  block_type: BlockType;
  content: Record<string, any>;
}

export interface ReportComment {
  id: string;
  report_id: string;
  block_id?: string;
  text: string;
  type: string;
  resolved: boolean;
  created_by?: string;
  created_at: string;
}

export interface FindingPoolItem {
  id: string;
  finding_ref: string;
  title: string;
  severity: string;
  status: string;
  impact_description: string;
}

export interface CreateReportData {
  engagement_id?: string;
  template_id?: string;
  title: string;
  description?: string;
  layout_type?: ReportLayoutType;
  theme_config?: Partial<ThemeConfig>;
}

export interface UpdateReportData {
  title?: string;
  description?: string;
  status?: ReportStatus;
  theme_config?: Partial<ThemeConfig>;
  layout_type?: ReportLayoutType;
}

export interface CreateBlockData {
  report_id: string;
  position_index: number;
  parent_block_id?: string;
  block_type: BlockType;
  content: BlockContent;
}

export interface UpdateBlockData {
  position_index?: number;
  content?: Partial<BlockContent>;
}

// ─── MODULE 6: Polymorphic Block Architecture ───────────────────────────────

export type M6ReportStatus = 'draft' | 'in_review' | 'cae_review' | 'published' | 'archived';

export interface ExecutiveSummaryFindingCounts {
  critical: number;
  high: number;
  medium: number;
  low: number;
  observation: number;
}

export interface ExecutiveSummarySections {
  auditOpinion: string;
  criticalRisks: string;
  strategicRecommendations: string;
  managementAction: string;
}

export type M6LayoutType = 'standard_audit' | 'investigation' | 'info_note';

export interface DynamicSection {
  id: string;
  title: string;
  content: string;
}

export interface ManagementResponse {
  providedBy: string;
  responseText: string;
  providedAt: string;
}

export interface ExecutiveSummary {
  score: number;
  grade: string;
  assuranceLevel: string;
  trend: number;
  previousGrade: string;
  findingCounts: ExecutiveSummaryFindingCounts;
  briefingNote: string;
  sections: ExecutiveSummarySections;
  managementResponse?: ManagementResponse;
  layoutType?: M6LayoutType;
  dynamicMetrics?: Record<string, string>;
  dynamicSections?: DynamicSection[];
}

export interface ReportWorkflow {
  reviewerId?: string;
  comments?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface ReportTheme {
  paperStyle: 'zen_paper' | 'pure_white';
  typography: 'merriweather_inter';
}

export type M6BlockType =
  | 'heading'
  | 'paragraph'
  | 'finding_ref'
  | 'live_chart'
  | 'dynamic_metric'
  | 'ai_summary'
  | 'financial_grid';

export interface BaseBlock {
  id: string;
  type: M6BlockType;
  orderIndex: number;
  snapshotData?: any | null;
}

export interface TextBlock extends BaseBlock {
  type: 'heading' | 'paragraph' | 'ai_summary';
  content: { html: string; level?: 1 | 2 | 3 };
}

export interface FindingRefBlock extends BaseBlock {
  type: 'finding_ref';
  content: {
    findingId: string;
    displayStyle: 'full_5c' | 'summary_card' | 'table_row';
    blindMode: boolean;
  };
}

export interface LiveChartBlock extends BaseBlock {
  type: 'live_chart';
  content: {
    chartType: 'risk_heatmap' | 'severity_distribution' | 'wif_trend';
    dataSourceFilter: Record<string, any>;
  };
}

export interface FinancialGridBlock extends BaseBlock {
  type: 'financial_grid';
  content: {
    columns: string[];
    rows: Record<string, string>[];
  };
}

export type M6ReportBlock = TextBlock | FindingRefBlock | LiveChartBlock | FinancialGridBlock;

export interface ReportSection {
  id: string;
  title: string;
  orderIndex: number;
  blocks: M6ReportBlock[];
}

export interface M6ReviewNote {
  id: string;
  blockId: string;
  selectedText: string;
  comment: string;
  status: 'open' | 'resolved';
  createdBy: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface M6Report {
  id: string;
  engagementId: string;
  title: string;
  status: M6ReportStatus;
  themeConfig: ReportTheme;
  sections: ReportSection[];
  executiveSummary: ExecutiveSummary;
  workflow: ReportWorkflow;
  reviewNotes?: M6ReviewNote[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  hashSeal?: string;
}

// ─── END MODULE 6 ────────────────────────────────────────────────────────────

export type SignatureStatus = 'signed' | 'rejected' | 'signed_with_dissent';

export type SignerRole = 'CREATOR' | 'MANAGER' | 'CAE';

export interface ReportSignature {
  id: string;
  tenant_id: string;
  report_id: string;
  user_id?: string;
  signer_name: string;
  signer_role: SignerRole;
  signer_title: string;
  status: SignatureStatus;
  dissent_comment?: string;
  order_index: number;
  signed_at: string;
  created_at: string;
  updated_at: string;
}

export interface SignatureStep {
  role: SignerRole;
  title: string;
  description: string;
  order_index: number;
  required: boolean;
}

export interface ReportSnapshot {
  report: Report;
  blocks: ReportBlock[];
  findings: Record<string, any>[];
  metadata: {
    snapshot_version: string;
    created_at: string;
    created_by?: string;
    total_blocks: number;
    total_findings: number;
  };
}

export interface CreateSignatureData {
  report_id: string;
  user_id?: string;
  signer_name: string;
  signer_role: SignerRole;
  signer_title: string;
  status: SignatureStatus;
  order_index: number;
  dissent_comment?: string;
}

export interface SignatureChainStatus {
  completed: boolean;
  current_step: number;
  total_steps: number;
  signatures: ReportSignature[];
  pending_roles: SignerRole[];
  can_publish: boolean;
}
