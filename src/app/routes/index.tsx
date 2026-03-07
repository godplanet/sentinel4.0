import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { usePersonaStore } from '@/entities/user/model/persona-store';

import DashboardPage from '@/pages/dashboard';
import StrategicAnalysisPage from '@/pages/dashboard/StrategicAnalysisPage';
import EcosystemPage from '@/pages/dashboard/EcosystemPage';
import GodsEyeViewPage from '@/pages/apex/GodsEyeViewPage';
import StrategyPage from '@/pages/strategy';
import StrategicPlanningPage from '@/pages/planning/StrategicPlanningPage';
import RkmLibraryPage from '@/pages/rkm-library';
import ActionWorkbenchPage from '@/pages/action-workbench';
import ActionPortalPage from '@/pages/action-workbench/AuditeePortalPage';
import AuditorWorkbenchPage from '@/pages/action-workbench/AuditorWorkbenchPage';
import GovernanceWorkbenchPage from '@/pages/action-workbench/GovernanceWorkbenchPage';
import Module7HubPage from '@/pages/action-workbench/Module7HubPage';
import EcosystemImpactPage from '@/pages/action-workbench/EcosystemImpactPage';
import { RemediationDossier } from '@/features/regulatory-export/ui/RemediationDossier';
import ExecutionConsolidatedPage from '@/pages/execution-consolidated';
import ExecutionDetailPage from '@/pages/execution/ExecutionPage';
import CognitiveInterviewPage from '@/pages/execution/CognitiveInterviewPage';
import RootCausePage from '@/pages/findings/RootCausePage';
import ExecutiveDashboardPage from '@/pages/reporting/ExecutiveDashboardPage';
import ResourceManagementPage from '@/pages/resources/ResourceManagementPage';
import WellbeingPage from '@/pages/resources/WellbeingPage';
import GovernancePage from '@/pages/governance';
import PolicyPage from '@/pages/governance/PolicyPage';
import BoardResolutionPage from '@/pages/governance/BoardResolutionPage';
import GovernanceVaultPage from '@/pages/governance-vault';
import QAIPPage from '@/pages/qaip';
import SurveysPage from '@/pages/surveys';
import WatchtowerPage from '@/pages/monitoring/WatchtowerPage';
import CreditMonitoringPage from '@/pages/monitoring/CreditMonitoringPage';
import MarketMonitoringPage from '@/pages/monitoring/MarketMonitoringPage';
import PqcRadarPage from '@/pages/monitoring/PqcRadarPage';
import CyberThreatPage from '@/pages/cyber-threats';
import SettingsConsolidatedPage from '@/pages/settings-consolidated';
import FindingCenterPage from '@/pages/findings/FindingCenterPage';
import RemunerationPage from '@/pages/governance/RemunerationPage';
import LitigationPage from '@/pages/governance/LitigationPage';
import FindingStudioPage from '@/pages/findings/FindingStudioPage';
import { FindingDetailPage as AuditorFindingDetailPage } from '@/pages/auditor/FindingDetailPage';
import { AuditeePortalPage } from '@/pages/auditee-portal/AuditeePortalPage';
import SmartContractPage from '@/pages/execution/SmartContractPage';
import ZakatLedgerPage from '@/pages/execution/ZakatLedgerPage';

import LoginPage from '@/pages/auth/LoginPage';
import NotFoundPage from '@/pages/error/NotFoundPage';
import AccessDeniedPage from '@/pages/error/AccessDeniedPage';
import MethodologyPage from '@/pages/settings/MethodologyPage';
import UserManagementPage from '@/pages/settings/UserManagementPage';
import IntegrationsPage from '@/pages/settings/IntegrationsPage';
import AppearancePage from '@/pages/settings/AppearancePage';
import CognitiveEnginePage from '@/pages/settings/CognitiveEnginePage';
import CustomFieldsPage from '@/pages/settings/CustomFieldsPage';
import RiskConstitutionPage from '@/pages/settings/RiskConstitutionPage';
import SystemHealthPage from '@/pages/settings/SystemHealthPage';
import WorkflowSettingsPage from '@/pages/settings/WorkflowSettingsPage';
import ObjectivesPage from '@/pages/strategy/ObjectivesPage';
import WorkpapersPage from '@/pages/execution/WorkpapersPage';
import ReportLibraryPage from '@/pages/reporting/ReportLibraryPage';
import ReportEditorPage from '@/pages/reporting/ReportEditorPage';
import BoardBriefingPage from '@/pages/reporting/BoardBriefingPage';
import TrendAnalysisPage from '@/pages/reporting/TrendAnalysisPage';
import EntityScorecardPage from '@/pages/reporting/EntityScorecardPage';
import BoardReportingPage from '@/pages/governance/BoardReportingPage';
import EscalationDeskPage from '@/pages/governance/EscalationDeskPage';
import StakeholderManagementPage from '@/pages/governance/StakeholderManagementPage';
import WhistleblowerPage from '@/pages/governance/WhistleblowerPage';
import CulturePulsePage from '@/pages/governance/CulturePulsePage';
import BoardEvaluationPage from '@/pages/governance/BoardEvaluationPage';
import InsiderRadarPage from '@/pages/governance/InsiderRadarPage';
import OraclePage from '@/pages/oracle';

import QuantPage from '@/pages/quant';
import NegotiationPage from '@/pages/negotiation';
import RiskHeatmapPage from '@/pages/risk-heatmap';
import RiskLaboratoryPage from '@/pages/risk-laboratory';
import RiskAppetitePage from '@/pages/risk-appetite';
import AuditStartPage from '@/pages/audit-start';
import TemplateManagerPage from '@/pages/admin/TemplateManagerPage';
import PBCPage from '@/pages/pbc';
import BCPCrisisPage from '@/pages/bcp';
import RedTeamPage from '@/pages/red-team';
import DataPrivacyPage from '@/pages/data-privacy';
import OpenBankingApiPage from '@/pages/open-banking';
import CompliancePage from '@/pages/compliance';
import RegulationsPage from '@/pages/compliance/RegulationsPage';
import GapAnalysisPage from '@/pages/compliance/GapAnalysisPage';
import RegulatoryLobbyPage from '@/pages/compliance/RegulatoryLobbyPage';
import TPRMPage from '@/pages/tprm';
import AutomationPage from '@/pages/automation';
import SoxPage from '@/pages/sox';
import EsgPage from '@/pages/esg';
import NewEngagementPage from '@/pages/execution/NewEngagementPage';
import SprintBoardPage from '@/pages/execution/SprintBoardPage';
import { AgileEngagementsPage } from '@/pages/execution/AgileEngagementsPage';
import AgileTasksPage from '@/pages/execution/AgileTasksPage';
import DataMonitorPage from '@/pages/ccm/DataMonitorPage';
import AnomalyDashboard from '@/pages/ccm/AnomalyDashboard';
import PredatorCockpit from '@/pages/ccm/PredatorCockpit';
import MissionControlPage from '@/pages/ai-agents/MissionControl';
import ChaosLabPage from '@/pages/chaos-lab';
import SecureReportPage from '@/pages/investigation/SecureReportPage';
import TriageCockpitPage from '@/pages/investigation/TriageCockpitPage';
import InvestigationHubPage from '@/pages/investigation/InvestigationHubPage';
import CaseDetailPage from '@/pages/investigation/CaseDetailPage';
import VendorPortalPage from '@/pages/vendor-portal';
import ProcessCanvasPage from '@/pages/process-canvas';
import { AuditeeLayout } from '@/app/layout/AuditeeLayout';
import { AuditeeDashboardPage } from '@/pages/auditee-portal/AuditeeDashboardPage';
import AdvisoryHubPage from '@/pages/advisory/AdvisoryHubPage';
import AdvisoryWorkspacePage from '@/pages/advisory/AdvisoryWorkspacePage';
import AuditProgramsPage from '@/pages/library/AuditProgramsPage';
import RiskLibraryPage from '@/pages/library/RiskLibraryPage';
import ProceduresPage from '@/pages/library/ProceduresPage';
import ProgramLibraryPage from '@/pages/library/ProgramLibraryPage';
import ProgramBuilderPage from '@/pages/library/ProgramBuilderPage';
import AuditUniversePage from '@/pages/strategy/AuditUniversePage';
import RiskSimulationPage from '@/pages/strategy/RiskSimulationPage';
import NeuralMapPage from '@/pages/strategy/NeuralMapPage';
import FieldAgentPage from '@/pages/execution/FieldAgentPage';
import FatwaGPTPage from '@/pages/shariah/FatwaGPTPage';
import AcademyPage from '@/pages/academy';
import PlaybookPage from '@/pages/playbook';
import ActivityReportsPage from '@/pages/reporting/ActivityReportsPage';
import RCSAPage from '@/pages/rcsa';
import ApprovalCenterPage from '@/pages/security/ApprovalCenterPage';
import TaskCommandPage from '@/pages/tasks/TaskCommandPage';
import OrphanInspectorPage from '@/pages/settings/OrphanInspectorPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true' || localStorage.getItem('sentinel_token');
  const location = useLocation();
  const { isPathAllowed, currentPersona } = usePersonaStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 🛡️ SERT GEÇİT (HARD-GATE): Rol Bazlı URL İzolasyonu
  if (!isPathAllowed(location.pathname)) {
    console.warn(`[SIFIR GÜVEN İHLALİ]: ${currentPersona} yetkisi ${location.pathname} dizinine erişmeye çalıştı ve engellendi.`);
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/403" element={<AccessDeniedPage />} />
      <Route path="/404" element={<NotFoundPage />} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/dashboard/strategic" element={<ProtectedRoute><StrategicAnalysisPage /></ProtectedRoute>} />
      <Route path="/dashboard/ecosystem" element={<ProtectedRoute><EcosystemPage /></ProtectedRoute>} />
      <Route path="/apex" element={<ProtectedRoute><GodsEyeViewPage /></ProtectedRoute>} />

      <Route path="/strategy/objectives" element={<ProtectedRoute><ObjectivesPage /></ProtectedRoute>} />
      <Route path="/strategy/universe" element={<ProtectedRoute><StrategyPage /></ProtectedRoute>} />
      <Route path="/strategy/universe-module2" element={<Navigate to="/strategy/audit-universe" replace />} />
      <Route path="/strategy/audit-universe" element={<ProtectedRoute><AuditUniversePage /></ProtectedRoute>} />
      <Route path="/strategy/risk-assessment" element={<ProtectedRoute><RkmLibraryPage /></ProtectedRoute>} />
      <Route path="/strategy/annual-plan" element={<ProtectedRoute><StrategicPlanningPage /></ProtectedRoute>} />
      <Route path="/strategy/risk-heatmap" element={<ProtectedRoute><RiskHeatmapPage /></ProtectedRoute>} />
      <Route path="/strategy/risk-lab" element={<ProtectedRoute><RiskLaboratoryPage /></ProtectedRoute>} />
      <Route path="/strategy/risk-simulator" element={<ProtectedRoute><RiskSimulationPage /></ProtectedRoute>} />
      <Route path="/strategy/neural-map" element={<ProtectedRoute><NeuralMapPage /></ProtectedRoute>} />
      <Route path="/risk/appetite" element={<ProtectedRoute><RiskAppetitePage /></ProtectedRoute>} />

      <Route path="/governance/board" element={<ProtectedRoute><BoardReportingPage /></ProtectedRoute>} />
      <Route path="/governance/escalation-desk" element={<ProtectedRoute><EscalationDeskPage /></ProtectedRoute>} />
      <Route path="/governance/stakeholders" element={<ProtectedRoute><StakeholderManagementPage /></ProtectedRoute>} />
      <Route path="/governance/voice" element={<ProtectedRoute><WhistleblowerPage /></ProtectedRoute>} />
      <Route path="/governance/policies" element={<ProtectedRoute><PolicyPage /></ProtectedRoute>} />
      <Route path="/governance/culture-pulse" element={<ProtectedRoute><CulturePulsePage /></ProtectedRoute>} />
      <Route path="/governance/board-evaluation" element={<ProtectedRoute><BoardEvaluationPage /></ProtectedRoute>} />
      <Route path="/governance/insider-radar" element={<ProtectedRoute><InsiderRadarPage /></ProtectedRoute>} />
      <Route path="/governance/vault" element={<ProtectedRoute><GovernanceVaultPage /></ProtectedRoute>} />
      <Route path="/governance/charter" element={<ProtectedRoute><GovernancePage /></ProtectedRoute>} />

      <Route path="/execution/my-engagements" element={<ProtectedRoute><ExecutionConsolidatedPage /></ProtectedRoute>} />
      <Route path="/execution/my-engagements/:id" element={<ProtectedRoute><ExecutionDetailPage /></ProtectedRoute>} />
      <Route path="/execution/workpapers" element={<ProtectedRoute><WorkpapersPage /></ProtectedRoute>} />
      <Route path="/execution/investigations" element={<Navigate to="/403" replace />} />
      <Route path="/execution/findings" element={<ProtectedRoute><FindingCenterPage /></ProtectedRoute>} />
      <Route path="/execution/finding-hub" element={<Navigate to="/execution/findings" replace />} />
      <Route path="/execution/findings/new" element={<ProtectedRoute><FindingStudioPage /></ProtectedRoute>} />
      <Route path="/execution/findings/zen/new" element={<ProtectedRoute><FindingStudioPage /></ProtectedRoute>} />
      <Route path="/execution/findings/:id" element={<ProtectedRoute><FindingStudioPage /></ProtectedRoute>} />
      <Route path="/execution/findings/zen/:id" element={<ProtectedRoute><FindingStudioPage /></ProtectedRoute>} />
      <Route path="/execution/findings/:id/studio" element={<ProtectedRoute><FindingStudioPage /></ProtectedRoute>} />
      <Route path="/execution/findings/:id/legacy" element={<ProtectedRoute><AuditorFindingDetailPage /></ProtectedRoute>} />
      <Route path="/execution/actions" element={<ProtectedRoute><ActionWorkbenchPage /></ProtectedRoute>} />
      <Route path="/execution/pbc" element={<ProtectedRoute><PBCPage /></ProtectedRoute>} />
      <Route path="/bcp" element={<ProtectedRoute><BCPCrisisPage /></ProtectedRoute>} />
      <Route path="/red-team" element={<ProtectedRoute><RedTeamPage /></ProtectedRoute>} />
      <Route path="/data-privacy" element={<ProtectedRoute><DataPrivacyPage /></ProtectedRoute>} />
      <Route path="/open-banking" element={<ProtectedRoute><OpenBankingApiPage /></ProtectedRoute>} />

      <Route path="/execution/start" element={<ProtectedRoute><AuditStartPage /></ProtectedRoute>} />
      <Route path="/execution/agile" element={<ProtectedRoute><AgileEngagementsPage /></ProtectedRoute>} />
      <Route path="/execution/agile/:id" element={<ProtectedRoute><AgileTasksPage /></ProtectedRoute>} />
      <Route path="/execution/new-engagement" element={<ProtectedRoute><NewEngagementPage /></ProtectedRoute>} />
      <Route path="/execution/sprint-board" element={<ProtectedRoute><AgileEngagementsPage /></ProtectedRoute>} />
      <Route path="/execution/sprint-board/:id" element={<ProtectedRoute><SprintBoardPage /></ProtectedRoute>} />
      <Route path="/execution/field-agent" element={<ProtectedRoute><FieldAgentPage /></ProtectedRoute>} />

      <Route path="/surveys" element={<ProtectedRoute><SurveysPage /></ProtectedRoute>} />

      <Route path="/resources" element={<ProtectedRoute><ResourceManagementPage /></ProtectedRoute>} />
      <Route path="/resources/well-being" element={<ProtectedRoute><WellbeingPage /></ProtectedRoute>} />

      <Route path="/monitoring/watchtower" element={<ProtectedRoute><WatchtowerPage /></ProtectedRoute>} />
      <Route path="/monitoring/probes" element={<ProtectedRoute><WatchtowerPage /></ProtectedRoute>} />
      <Route path="/monitoring/continuous" element={<ProtectedRoute><WatchtowerPage /></ProtectedRoute>} />
      <Route path="/monitoring/ccm" element={<ProtectedRoute><DataMonitorPage /></ProtectedRoute>} />
      <Route path="/monitoring/anomaly" element={<ProtectedRoute><AnomalyDashboard /></ProtectedRoute>} />
      <Route path="/monitoring/credit" element={<ProtectedRoute><CreditMonitoringPage /></ProtectedRoute>} />
      <Route path="/monitoring/market" element={<ProtectedRoute><MarketMonitoringPage /></ProtectedRoute>} />
      <Route path="/monitoring/cyber-threats" element={<ProtectedRoute><CyberThreatPage /></ProtectedRoute>} />
      <Route path="/monitoring/pqc-radar" element={<ProtectedRoute><PqcRadarPage /></ProtectedRoute>} />

      <Route path="/rcsa" element={<ProtectedRoute><RCSAPage /></ProtectedRoute>} />

      <Route path="/reporting/library" element={<ProtectedRoute><ReportLibraryPage /></ProtectedRoute>} />
      <Route path="/reporting/zen-editor" element={<ProtectedRoute><ReportEditorPage /></ProtectedRoute>} />
      <Route path="/reporting/zen-editor/:id" element={<ProtectedRoute><ReportEditorPage /></ProtectedRoute>} />
      <Route path="/reporting/executive-dashboard/:id" element={<ProtectedRoute><BoardBriefingPage /></ProtectedRoute>} />

      <Route path="/reports/new" element={<Navigate to="/reporting/zen-editor" replace />} />
      <Route path="/reports/:id" element={<Navigate to="/reporting/library" replace />} />
      <Route path="/reporting/editor/new" element={<Navigate to="/reporting/zen-editor" replace />} />
      <Route path="/reporting/editor/:id" element={<Navigate to="/reporting/zen-editor" replace />} />
      <Route path="/reporting/edit/:id" element={<Navigate to="/reporting/zen-editor" replace />} />
      <Route path="/reporting/view/:id" element={<Navigate to="/reporting/zen-editor" replace />} />
      <Route path="/reporting/executive-dashboard" element={<ProtectedRoute><ExecutiveDashboardPage /></ProtectedRoute>} />
      <Route path="/reporting/trends" element={<ProtectedRoute><TrendAnalysisPage /></ProtectedRoute>} />
      <Route path="/reporting/entity-scorecard" element={<ProtectedRoute><EntityScorecardPage /></ProtectedRoute>} />
      <Route path="/reporting/activity-reports" element={<ProtectedRoute><ActivityReportsPage /></ProtectedRoute>} />

      <Route path="/qaip" element={<ProtectedRoute><QAIPPage /></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><TaskCommandPage /></ProtectedRoute>} />
      <Route path="/security/approvals" element={<ProtectedRoute><ApprovalCenterPage /></ProtectedRoute>} />

      <Route path="/settings" element={<ProtectedRoute><SettingsConsolidatedPage /></ProtectedRoute>} />
      <Route path="/settings/system-health" element={<ProtectedRoute><SystemHealthPage /></ProtectedRoute>} />
      <Route path="/settings/users" element={<ProtectedRoute><UserManagementPage /></ProtectedRoute>} />
      <Route path="/settings/appearance" element={<ProtectedRoute><AppearancePage /></ProtectedRoute>} />
      <Route path="/settings/methodology" element={<ProtectedRoute><MethodologyPage /></ProtectedRoute>} />
      <Route path="/settings/workflow" element={<ProtectedRoute><WorkflowSettingsPage /></ProtectedRoute>} />
      <Route path="/settings/cognitive-engine" element={<ProtectedRoute><CognitiveEnginePage /></ProtectedRoute>} />
      <Route path="/settings/integrations" element={<ProtectedRoute><IntegrationsPage /></ProtectedRoute>} />
      <Route path="/settings/custom-fields" element={<ProtectedRoute><CustomFieldsPage /></ProtectedRoute>} />
      <Route path="/settings/templates" element={<ProtectedRoute><TemplateManagerPage /></ProtectedRoute>} />
      <Route path="/settings/risk-constitution" element={<ProtectedRoute><RiskConstitutionPage /></ProtectedRoute>} />
      <Route path="/settings/orphan-inspector" element={<ProtectedRoute><OrphanInspectorPage /></ProtectedRoute>} />

      <Route path="/strategy/quant" element={<ProtectedRoute><QuantPage /></ProtectedRoute>} />

      <Route path="/portal/:findingId" element={<ProtectedRoute><NegotiationPage /></ProtectedRoute>} />

      <Route path="/compliance" element={<ProtectedRoute><CompliancePage /></ProtectedRoute>} />
      <Route path="/compliance/regulations" element={<ProtectedRoute><RegulationsPage /></ProtectedRoute>} />
      <Route path="/compliance/gap-analysis" element={<ProtectedRoute><GapAnalysisPage /></ProtectedRoute>} />
      <Route path="/compliance/lobbying" element={<ProtectedRoute><RegulatoryLobbyPage /></ProtectedRoute>} />
      <Route path="/shariah/fatwa-gpt" element={<ProtectedRoute><FatwaGPTPage /></ProtectedRoute>} />
      <Route path="/academy" element={<ProtectedRoute><AcademyPage /></ProtectedRoute>} />
      <Route path="/playbook" element={<ProtectedRoute><PlaybookPage /></ProtectedRoute>} />

      <Route path="/tprm" element={<ProtectedRoute><TPRMPage /></ProtectedRoute>} />
      <Route path="/automation" element={<ProtectedRoute><AutomationPage /></ProtectedRoute>} />
      <Route path="/sox" element={<ProtectedRoute><SoxPage /></ProtectedRoute>} />
      <Route path="/esg" element={<ProtectedRoute><EsgPage /></ProtectedRoute>} />

      <Route path="/oracle" element={<ProtectedRoute><OraclePage /></ProtectedRoute>} />
      <Route path="/ai-agents" element={<ProtectedRoute><MissionControlPage /></ProtectedRoute>} />
      <Route path="/chaos-lab" element={<ProtectedRoute><ChaosLabPage /></ProtectedRoute>} />

      <Route path="/ccm" element={<Navigate to="/ccm/predator" replace />} />
      <Route path="/ccm/predator" element={<ProtectedRoute><PredatorCockpit /></ProtectedRoute>} />
      <Route path="/ccm/anomalies" element={<ProtectedRoute><AnomalyDashboard /></ProtectedRoute>} />
      <Route path="/ccm/data-monitor" element={<ProtectedRoute><DataMonitorPage /></ProtectedRoute>} />

      <Route path="/secure-report" element={<SecureReportPage />} />
      <Route path="/triage-cockpit" element={<ProtectedRoute><TriageCockpitPage /></ProtectedRoute>} />
      <Route path="/investigation" element={<ProtectedRoute><InvestigationHubPage /></ProtectedRoute>} />
      <Route path="/investigation/:id" element={<ProtectedRoute><CaseDetailPage /></ProtectedRoute>} />

      <Route path="/auditee-portal" element={<AuditeePortalPage />} />
      <Route path="/auditee-portal/finding/:id" element={<AuditeePortalPage />} />
      <Route path="/action-portal" element={<ActionPortalPage />} />
      <Route path="/auditor-workbench" element={<ProtectedRoute><AuditorWorkbenchPage /></ProtectedRoute>} />
      <Route path="/governance-workbench" element={<ProtectedRoute><GovernanceWorkbenchPage /></ProtectedRoute>} />
      <Route path="/actions" element={<ProtectedRoute><Module7HubPage /></ProtectedRoute>} />
      <Route path="/ecosystem-impact" element={<ProtectedRoute><EcosystemImpactPage /></ProtectedRoute>} />
      <Route path="/dossier-demo" element={<ProtectedRoute><RemediationDossier /></ProtectedRoute>} />

      <Route path="/auditee" element={<AuditeeLayout />}>
        <Route index element={<AuditeeDashboardPage />} />
        <Route path="upload" element={<AuditeeDashboardPage />} />
        <Route path="extensions" element={<AuditeeDashboardPage />} />
        <Route path="findings/:id" element={<FindingStudioPage />} />
      </Route>

      <Route path="/advisory" element={<ProtectedRoute><AdvisoryHubPage /></ProtectedRoute>} />
      <Route path="/advisory/:id" element={<ProtectedRoute><AdvisoryWorkspacePage /></ProtectedRoute>} />

      <Route path="/library/audit-programs" element={<ProtectedRoute><AuditProgramsPage /></ProtectedRoute>} />
      <Route path="/library/risk-library" element={<ProtectedRoute><RiskLibraryPage /></ProtectedRoute>} />
      <Route path="/library/procedures" element={<ProtectedRoute><ProceduresPage /></ProtectedRoute>} />
      <Route path="/library/programs" element={<ProtectedRoute><ProgramLibraryPage /></ProtectedRoute>} />
      <Route path="/library/builder/:id" element={<ProtectedRoute><ProgramBuilderPage /></ProtectedRoute>} />

      <Route path="/vendor-portal" element={<VendorPortalPage />} />
      <Route path="/vendor-portal/:token" element={<VendorPortalPage />} />
      <Route path="/process-canvas" element={<ProtectedRoute><ProcessCanvasPage /></ProtectedRoute>} />

      <Route path="/governance/board-resolution" element={<ProtectedRoute><BoardResolutionPage /></ProtectedRoute>} />
      <Route path="/governance/remuneration" element={<ProtectedRoute><RemunerationPage /></ProtectedRoute>} />
      <Route path="/governance/litigation" element={<ProtectedRoute><LitigationPage /></ProtectedRoute>} />

      <Route path="/execution/cognitive-interview" element={<ProtectedRoute><CognitiveInterviewPage /></ProtectedRoute>} />
      <Route path="/execution/root-cause" element={<ProtectedRoute><RootCausePage /></ProtectedRoute>} />
      <Route path="/execution/smart-contracts" element={<ProtectedRoute><SmartContractPage /></ProtectedRoute>} />
      <Route path="/execution/zakat-ledger" element={<ProtectedRoute><ZakatLedgerPage /></ProtectedRoute>} />

      <Route path="/governance" element={<Navigate to="/governance/charter" replace />} />
      <Route path="/strategy" element={<Navigate to="/strategy/objectives" replace />} />
      <Route path="/execution" element={<Navigate to="/execution/my-engagements" replace />} />
      <Route path="/reporting" element={<Navigate to="/reporting/executive-dashboard" replace />} />
      <Route path="/talent" element={<Navigate to="/resources?tab=rpg" replace />} />
      <Route path="/resources/talent-os" element={<Navigate to="/resources?tab=pool" replace />} />
      <Route path="/resources/profiles" element={<Navigate to="/resources?tab=overview" replace />} />
      <Route path="/resources/talent" element={<Navigate to="/resources?tab=talent" replace />} />
      <Route path="/resources/timesheets" element={<Navigate to="/resources?tab=timesheets" replace />} />
      <Route path="/resources/capacity" element={<Navigate to="/resources?tab=capacity" replace />} />
      <Route path="/findings" element={<Navigate to="/execution/findings" replace />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};