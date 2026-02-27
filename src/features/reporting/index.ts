export { ExecSummaryGenerator } from './ExecSummaryGenerator';
export {
  fetchEngagementReportData,
  fetchActiveEngagements,
  fetchEngagementFindings,
  generateFindingsTableHTML,
  generateStatisticsSummaryHTML,
} from './integration';
export type {
  EngagementDetails,
  FindingData,
  ReportStatistics,
  EngagementReportData,
} from './integration';

export { SignaturePanel } from './ui/SignaturePanel';

export {
  getReportSignatures,
  getSignatureChainStatus,
  addSignature,
  approveReport,
  approveWithDissent,
  rejectReport,
  createReportSnapshot,
  getReportSnapshot,
  publishReport,
  getSignatureWorkflow,
  getNextSignatureStep,
} from './api/signature-api';

export {
  captureReportSnapshot,
  freezeReport,
  loadFrozenReport,
  isReportFrozen,
  canPublishReport,
} from './lib/snapshot-engine';
