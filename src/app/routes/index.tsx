import { usePersonaStore } from '@/entities/user/model/persona-store';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';

import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Redirect helper: properly resolves :id param at runtime
const FindingRedirect = () => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/execution/findings/${id}`} replace />;
};



const RemediationDossier = lazy(() => import('@/features/regulatory-export/ui/RemediationDossier').then(module => ({ default: module.RemediationDossier })));
const ActionWorkbenchPage = lazy(() => import('@/pages/action-workbench'));
const ActionPortalPage = lazy(() => import('@/pages/action-workbench/AuditeePortalPage'));
const AuditorWorkbenchPage = lazy(() => import('@/pages/action-workbench/AuditorWorkbenchPage'));
const EcosystemImpactPage = lazy(() => import('@/pages/action-workbench/EcosystemImpactPage'));
const GovernanceWorkbenchPage = lazy(() => import('@/pages/action-workbench/GovernanceWorkbenchPage'));
const Module7HubPage = lazy(() => import('@/pages/action-workbench/Module7HubPage'));
const GodsEyeViewPage = lazy(() => import('@/pages/apex/GodsEyeViewPage'));
const AuditeePortalPage = lazy(() => import('@/pages/auditee-portal/AuditeePortalPage').then(module => ({ default: module.AuditeePortalPage })));
const AuditorFindingDetailPage = lazy(() => import('@/pages/auditor/FindingDetailPage').then(module => ({ default: module.FindingDetailPage })));
const CyberThreatPage = lazy(() => import('@/pages/cyber-threats'));
const DashboardPage = lazy(() => import('@/pages/dashboard'));
const EcosystemPage = lazy(() => import('@/pages/dashboard/EcosystemPage'));
const StrategicAnalysisPage = lazy(() => import('@/pages/dashboard/StrategicAnalysisPage'));
const ExecutionConsolidatedPage = lazy(() => import('@/pages/execution-consolidated'));
const CognitiveInterviewPage = lazy(() => import('@/pages/execution/CognitiveInterviewPage'));
const ExecutionDetailPage = lazy(() => import('@/pages/execution/ExecutionPage'));
const MyTaskDetailPage = lazy(() => import('@/pages/execution/MyTaskDetailPage'));
const SmartContractPage = lazy(() => import('@/pages/execution/SmartContractPage'));
const ZakatLedgerPage = lazy(() => import('@/pages/execution/ZakatLedgerPage'));
const FindingCenterPage = lazy(() => import('@/pages/findings/FindingCenterPage'));
const FindingStudioPage = lazy(() => import('@/pages/findings/FindingStudioPage'));
const RootCausePage = lazy(() => import('@/pages/findings/RootCausePage'));
const GovernancePage = lazy(() => import('@/pages/governance'));
const GovernanceVaultPage = lazy(() => import('@/pages/governance-vault'));
const BoardResolutionPage = lazy(() => import('@/pages/governance/BoardResolutionPage'));
const LitigationPage = lazy(() => import('@/pages/governance/LitigationPage'));
const PolicyPage = lazy(() => import('@/pages/governance/PolicyPage'));
const RemunerationPage = lazy(() => import('@/pages/governance/RemunerationPage'));
const CreditMonitoringPage = lazy(() => import('@/pages/monitoring/CreditMonitoringPage'));
const MarketMonitoringPage = lazy(() => import('@/pages/monitoring/MarketMonitoringPage'));
const PqcRadarPage = lazy(() => import('@/pages/monitoring/PqcRadarPage'));
const WatchtowerPage = lazy(() => import('@/pages/monitoring/WatchtowerPage'));
const StrategicPlanningPage = lazy(() => import('@/pages/planning/StrategicPlanningPage'));
const QAIPPage = lazy(() => import('@/pages/qaip'));
const ExecutiveDashboardPage = lazy(() => import('@/pages/reporting/ExecutiveDashboardPage'));
const ResourceManagementPage = lazy(() => import('@/pages/resources/ResourceManagementPage'));
const WellbeingPage = lazy(() => import('@/pages/resources/WellbeingPage'));
const RkmLibraryPage = lazy(() => import('@/pages/rkm-library'));
const SettingsConsolidatedPage = lazy(() => import('@/pages/settings-consolidated'));
const StrategyPage = lazy(() => import('@/pages/strategy'));
const ShadowBoardPage = lazy(() => import('@/pages/strategy/ShadowBoardPage'));
const SurveysPage = lazy(() => import('@/pages/surveys'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const AccessDeniedPage = lazy(() => import('@/pages/error/AccessDeniedPage'));
const NotFoundPage = lazy(() => import('@/pages/error/NotFoundPage'));
const WorkpapersPage = lazy(() => import('@/pages/execution/WorkpapersPage'));
const ReportBuilderPage = lazy(() => import('@/pages/execution/ReportBuilderPage'));
const BoardEvaluationPage = lazy(() => import('@/pages/governance/BoardEvaluationPage'));
const BoardReportingPage = lazy(() => import('@/pages/governance/BoardReportingPage'));
const CulturePulsePage = lazy(() => import('@/pages/governance/CulturePulsePage'));
const EscalationDeskPage = lazy(() => import('@/pages/governance/EscalationDeskPage'));
const FraudRadarPage = lazy(() => import('@/pages/governance/FraudRadarPage'));
const InsiderRadarPage = lazy(() => import('@/pages/governance/InsiderRadarPage'));
const ShariahShieldPage = lazy(() => import('@/pages/governance/ShariahShieldPage'));
const StakeholderManagementPage = lazy(() => import('@/pages/governance/StakeholderManagementPage'));
const WhistleblowerPage = lazy(() => import('@/pages/governance/WhistleblowerPage'));
const OraclePage = lazy(() => import('@/pages/oracle'));
const BoardBriefingPage = lazy(() => import('@/pages/reporting/BoardBriefingPage'));
const EntityScorecardPage = lazy(() => import('@/pages/reporting/EntityScorecardPage'));
const ReportEditorPage = lazy(() => import('@/pages/reporting/ReportEditorPage'));
const ReportLibraryPage = lazy(() => import('@/pages/reporting/ReportLibraryPage'));
const TrendAnalysisPage = lazy(() => import('@/pages/reporting/TrendAnalysisPage'));
const AppearancePage = lazy(() => import('@/pages/settings/AppearancePage'));
const CognitiveEnginePage = lazy(() => import('@/pages/settings/CognitiveEnginePage'));
const CustomFieldsPage = lazy(() => import('@/pages/settings/CustomFieldsPage'));
const IntegrationsPage = lazy(() => import('@/pages/settings/IntegrationsPage'));
const MethodologyPage = lazy(() => import('@/pages/settings/MethodologyPage'));
const RiskConstitutionPage = lazy(() => import('@/pages/settings/RiskConstitutionPage'));
const SystemHealthPage = lazy(() => import('@/pages/settings/SystemHealthPage'));
const UserManagementPage = lazy(() => import('@/pages/settings/UserManagementPage'));
const WorkflowSettingsPage = lazy(() => import('@/pages/settings/WorkflowSettingsPage'));
const ObjectivesPage = lazy(() => import('@/pages/strategy/ObjectivesPage'));
const AuditeeLayout = lazy(() => import('@/app/layout/AuditeeLayout').then(module => ({ default: module.AuditeeLayout })));
const AcademyPage = lazy(() => import('@/pages/academy'));
const GamificationPage = lazy(() => import('@/pages/academy/GamificationPage'));
const TemplateManagerPage = lazy(() => import('@/pages/admin/TemplateManagerPage'));
const AdvisoryHubPage = lazy(() => import('@/pages/advisory/AdvisoryHubPage'));
const AdvisoryWorkspacePage = lazy(() => import('@/pages/advisory/AdvisoryWorkspacePage'));
const MissionControlPage = lazy(() => import('@/pages/ai-agents/MissionControl'));
const AuditStartPage = lazy(() => import('@/pages/audit-start'));
const AuditeeDashboardPage = lazy(() => import('@/pages/auditee-portal/AuditeeDashboardPage').then(module => ({ default: module.AuditeeDashboardPage })));
const AutomationPage = lazy(() => import('@/pages/automation'));
const BCPCrisisPage = lazy(() => import('@/pages/bcp'));
const AnomalyDashboard = lazy(() => import('@/pages/ccm/AnomalyDashboard'));
const DataMonitorPage = lazy(() => import('@/pages/ccm/DataMonitorPage'));
const PredatorCockpit = lazy(() => import('@/pages/ccm/PredatorCockpit'));
const ChaosLabPage = lazy(() => import('@/pages/chaos-lab'));
const CompliancePage = lazy(() => import('@/pages/compliance'));
const GapAnalysisPage = lazy(() => import('@/pages/compliance/GapAnalysisPage'));
const RegulationsPage = lazy(() => import('@/pages/compliance/RegulationsPage'));
const RegulatoryLobbyPage = lazy(() => import('@/pages/compliance/RegulatoryLobbyPage'));
const DataPrivacyPage = lazy(() => import('@/pages/data-privacy'));
const EsgPage = lazy(() => import('@/pages/esg'));
const AgileEngagementsPage = lazy(() => import('@/pages/execution/AgileEngagementsPage').then(module => ({ default: module.AgileEngagementsPage })));
const AgileTasksPage = lazy(() => import('@/pages/execution/AgileTasksPage'));
const FieldAgentPage = lazy(() => import('@/pages/execution/FieldAgentPage'));
const NewEngagementPage = lazy(() => import('@/pages/execution/NewEngagementPage'));
const SprintBoardPage = lazy(() => import('@/pages/execution/SprintBoardPage'));
const CaseDetailPage = lazy(() => import('@/pages/investigation/CaseDetailPage'));
const InvestigationHubPage = lazy(() => import('@/pages/investigation/InvestigationHubPage'));
const SecureReportPage = lazy(() => import('@/pages/investigation/SecureReportPage'));
const TriageCockpitPage = lazy(() => import('@/pages/investigation/TriageCockpitPage'));
const AuditProgramsPage = lazy(() => import('@/pages/library/AuditProgramsPage'));
const ProceduresPage = lazy(() => import('@/pages/library/ProceduresPage'));
const ProgramBuilderPage = lazy(() => import('@/pages/library/ProgramBuilderPage'));
const ProgramLibraryPage = lazy(() => import('@/pages/library/ProgramLibraryPage'));
const RiskLibraryPage = lazy(() => import('@/pages/library/RiskLibraryPage'));
const NegotiationPage = lazy(() => import('@/pages/negotiation'));
const OpenBankingApiPage = lazy(() => import('@/pages/open-banking'));
const PBCPage = lazy(() => import('@/pages/pbc'));
const PlaybookPage = lazy(() => import('@/pages/playbook'));
const ProcessCanvasPage = lazy(() => import('@/pages/process-canvas'));
const QuantPage = lazy(() => import('@/pages/quant'));
const RCSAPage = lazy(() => import('@/pages/rcsa'));
const RedTeamPage = lazy(() => import('@/pages/red-team'));
const ActivityReportsPage = lazy(() => import('@/pages/reporting/ActivityReportsPage'));
const RiskAppetitePage = lazy(() => import('@/pages/risk-appetite'));
const RiskHeatmapPage = lazy(() => import('@/pages/risk-heatmap'));
const RiskLaboratoryPage = lazy(() => import('@/pages/risk-laboratory'));
const ApprovalCenterPage = lazy(() => import('@/pages/security/ApprovalCenterPage'));
const OrphanInspectorPage = lazy(() => import('@/pages/settings/OrphanInspectorPage'));
const FatwaGPTPage = lazy(() => import('@/pages/shariah/FatwaGPTPage'));
const SoxPage = lazy(() => import('@/pages/sox'));
const AuditUniversePage = lazy(() => import('@/pages/strategy/AuditUniversePage'));
const NeuralMapPage = lazy(() => import('@/pages/strategy/NeuralMapPage'));
const RiskSimulationPage = lazy(() => import('@/pages/strategy/RiskSimulationPage'));
const TaskCommandPage = lazy(() => import('@/pages/tasks/TaskCommandPage'));
const TPRMPage = lazy(() => import('@/pages/tprm'));
const VendorPortalPage = lazy(() => import('@/pages/vendor-portal'));


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
 return <Navigate to={`/403?blocked=${encodeURIComponent(location.pathname)}&role=${currentPersona}`} replace />;
 }

 return <>{children}</>;
};

export const AppRoutes = () => {
 return (
 <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
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
 <Route path="/strategy/shadow-board" element={<ProtectedRoute><ShadowBoardPage /></ProtectedRoute>} />
 <Route path="/risk/appetite" element={<ProtectedRoute><RiskAppetitePage /></ProtectedRoute>} />

 <Route path="/governance/board" element={<ProtectedRoute><BoardReportingPage /></ProtectedRoute>} />
 <Route path="/governance/escalation-desk" element={<ProtectedRoute><EscalationDeskPage /></ProtectedRoute>} />
 <Route path="/governance/stakeholders" element={<ProtectedRoute><StakeholderManagementPage /></ProtectedRoute>} />
 <Route path="/governance/voice" element={<ProtectedRoute><WhistleblowerPage /></ProtectedRoute>} />
 <Route path="/governance/policies" element={<ProtectedRoute><PolicyPage /></ProtectedRoute>} />
 <Route path="/governance/culture-pulse" element={<ProtectedRoute><CulturePulsePage /></ProtectedRoute>} />
 <Route path="/governance/board-evaluation" element={<ProtectedRoute><BoardEvaluationPage /></ProtectedRoute>} />
 <Route path="/governance/insider-radar" element={<ProtectedRoute><InsiderRadarPage /></ProtectedRoute>} />
 <Route path="/governance/fraud-radar" element={<ProtectedRoute><FraudRadarPage /></ProtectedRoute>} />
 <Route path="/governance/shariah-shield" element={<ProtectedRoute><ShariahShieldPage /></ProtectedRoute>} />
 <Route path="/governance/vault" element={<ProtectedRoute><GovernanceVaultPage /></ProtectedRoute>} />
 <Route path="/governance/charter" element={<ProtectedRoute><GovernancePage /></ProtectedRoute>} />

 <Route path="/execution/my-engagements" element={<ProtectedRoute><ExecutionConsolidatedPage /></ProtectedRoute>} />
 <Route path="/execution/my-engagements/:id" element={<ProtectedRoute><MyTaskDetailPage /></ProtectedRoute>} />
 <Route path="/execution/workpapers" element={<ProtectedRoute><WorkpapersPage /></ProtectedRoute>} />
 <Route path="/execution/report-builder" element={<ProtectedRoute><ReportBuilderPage /></ProtectedRoute>} />
 <Route path="/execution/investigations" element={<Navigate to="/403" replace />} />
 <Route path="/execution/findings" element={<ProtectedRoute><FindingCenterPage /></ProtectedRoute>} />
 <Route path="/execution/finding-hub" element={<Navigate to="/execution/findings" replace />} />
 {/* Bulgular (Finding Studio & Universal Routing) */}
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
 <Route path="/academy/gamification" element={<ProtectedRoute><GamificationPage /></ProtectedRoute>} />
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

 <Route path="/auditee-portal" element={<ProtectedRoute><AuditeePortalPage /></ProtectedRoute>} />
 <Route path="/auditee-portal/finding/:id" element={<ProtectedRoute><AuditeePortalPage /></ProtectedRoute>} />
 <Route path="/action-portal" element={<ProtectedRoute><ActionPortalPage /></ProtectedRoute>} />
 <Route path="/auditor-workbench" element={<ProtectedRoute><AuditorWorkbenchPage /></ProtectedRoute>} />
 <Route path="/governance-workbench" element={<ProtectedRoute><GovernanceWorkbenchPage /></ProtectedRoute>} />
 <Route path="/actions" element={<ProtectedRoute><Module7HubPage /></ProtectedRoute>} />
 <Route path="/ecosystem-impact" element={<ProtectedRoute><EcosystemImpactPage /></ProtectedRoute>} />
 <Route path="/dossier-demo" element={<ProtectedRoute><RemediationDossier /></ProtectedRoute>} />

 <Route path="/auditee" element={<ProtectedRoute><AuditeeLayout /></ProtectedRoute>}>
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
 <Route path="/findings/new" element={<Navigate to="/execution/findings/new" replace />} />
 <Route path="/findings/:id" element={<FindingRedirect />} />

 <Route path="*" element={<NotFoundPage />} />
 </Routes>
    </Suspense>
 );
};