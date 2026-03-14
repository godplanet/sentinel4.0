import { AlertCircle, AlertTriangle, LayoutDashboard, PlaySquare } from 'lucide-react';
import React, { Suspense, useState } from 'react';

const componentModules = import.meta.glob('../../**/*.tsx');

const ORPHAN_COMPONENTS = [
  "pages/reporting/index.tsx",
  "pages/resources/index.tsx",
  "pages/execution/index.tsx",
  "pages/monitoring/index.tsx",
  "features/theme-switcher/ThemeSelector.tsx",
  "features/theme-switcher/SidebarColorPicker.tsx",
  "features/ai-audit/SentinelInsight.tsx",
  "features/reporting/ui/SignaturePanel.tsx",
  "features/report-editor/blocks/ExecutiveSummaryBlock.tsx",
  "features/report-editor/blocks/FindingTableBlock.tsx",
  "features/report-editor/ui/ZenReader.tsx",
  "features/report-editor/ui/FindingPool.tsx",
  "features/report-editor/ui/AICopilotPanel.tsx",
  "features/report-editor/ui/TemplatePicker.tsx",
  "features/report-editor/ui/AIWriterModal.tsx",
  "features/finding-workflow/ui/WorkflowProgressBar.tsx",
  "features/finding-workflow/ui/WorkflowActionButtons.tsx",
  "features/finding-hub/ui/FindingKanbanBoard.tsx",
  "features/finding-hub/ui/FindingList.tsx",
  "features/finding-hub/ui/FindingDetail.tsx",
  "features/finding-hub/ui/FindingForm.tsx",
  "features/auditee-portal/ui/FindingResponse.tsx",
  "features/auditee-portal/ui/MyAssignments.tsx",
  "features/auditee-portal/ui/AuditeeDashboard.tsx",
  "features/auditee-portal/ui/FindingRightSidebar.tsx",
  "features/sox/SkepticChallengeModal.tsx",
  "features/resources/ui/ConflictWarningCard.tsx",
  "features/ai-agents/sentinel-prime/ThinkingIndicator.tsx",
  "features/talent-os/components/XPHistoryFeed.tsx",
  "features/admin/risk-configuration/ui/RiskWeightSettings.tsx",
  "features/planning/ui/ResourceAssignmentModal.tsx",
  "features/planning/ui/Gantt/GanttTimeline.tsx",
  "features/planning/ui/IronGateModal.tsx",
  "features/planning/ui/AuditorAssignmentModal.tsx",
  "features/planning/ui/BulkPlanningModal.tsx",
  "features/planning/analytics/ui/DelayRiskTable.tsx",
  "features/planning/analytics/ui/PlanVsActualChart.tsx",
  "features/planning/analytics/ui/ComplianceScoreCard.tsx",
  "features/audit-execution/ExecutionLayout.tsx",
  "features/library/ProgramDeployModal.tsx",
  "features/library/ui/ImportModals.tsx",
  "features/library/ui/TemplateLoaderModal.tsx",
  "features/workpaper-editor/ui/SignOffPanel.tsx",
  "features/workpaper-editor/ui/WorkpaperEditor.tsx",
  "features/engagement-kanban/ui/KanbanBoard.tsx",
  "features/investigation/ui/EvidenceUploader.tsx",
  "features/risk-engine/RiskSimulator.tsx",
  "features/rkm-library/ui/RiskFormModal.tsx",
  "features/finding-studio/components/ViewSwitcher.tsx",
  "features/finding-studio/components/ActionPlanCard.tsx",
  "features/finding-studio/components/FindingSignOff.tsx",
  "features/probe-builder/ui/ProbeBuilderWizard.tsx",
  "features/esg/GreenSkepticModal.tsx",
  "features/supervision/components/SamplingConfigModal.tsx",
  "features/shariah/ComplianceCheckerModal.tsx",
  "features/ai-probe-gen/TextToRulePanel.tsx",
  "features/ai-anomaly/ui/AIAnomalyPanel.tsx",
  "features/universe/ui/HierarchyView.tsx",
  "features/universe/ui/UniverseListView.tsx",
  "features/universe/ui/UniverseTree.tsx",
  "features/universe/ui/IntegrationHubModal.tsx",
  "features/ai-forensic/SentinelInsightCard.tsx",
  "features/strategy/ui/RiskWeightSimulator.tsx",
  "shared/ui/DataSourceIndicator.tsx",
  "shared/ui/ActivityStream.tsx",
  "shared/ui/WorkflowStatusBar.tsx",
  "shared/ui/DebugBar.tsx",
  "shared/ui/LanguageSwitcher.tsx",
  "app/layout/AutoRepairOverlay.tsx",
  "app/providers/AuthProvider.tsx",
  "widgets/EsgDashboard/DataEntryView.tsx",
  "widgets/EsgDashboard/PlanetPulse.tsx",
  "widgets/tables/FindingDataGrid.tsx",
  "widgets/CCMDashboard/LiveFeed.tsx",
  "widgets/CCMDashboard/SourceCards.tsx",
  "widgets/UniverseTree/index.tsx",
  "widgets/UniverseTree/RiskNodeCard.tsx",
  "widgets/UniverseTree/GlassUniverseTree.tsx",
  "widgets/FindingRightSidebar/FindingRightSidebar.tsx",
  "widgets/AutomationStudio/RuleBuilder.tsx",
  "widgets/AutomationStudio/RuleList.tsx",
  "widgets/AutomationStudio/ExecutionLog.tsx",
  "widgets/AutomationStudio/SimulationSandbox.tsx",
  "widgets/SentinelOffice/OfficeOrchestrator.tsx",
  "widgets/ConstitutionEditor/LiveTestPanel.tsx",
  "widgets/ConstitutionEditor/JsonEditorModal.tsx",
  "widgets/ConstitutionEditor/DimensionsTab.tsx",
  "widgets/ConstitutionEditor/ColorScaleTab.tsx",
  "widgets/ConstitutionEditor/VetoTab.tsx",
  "widgets/ConstitutionEditor/MatrixTab.tsx",
  "widgets/ChaosLab/ChaosTestCard.tsx",
  "widgets/ChaosLab/FixItCard.tsx",
  "widgets/Dashboard/KPIGrid.tsx",
  "widgets/MethodologySimulator/index.tsx",
  "widgets/SoxDashboard/ManagerView.tsx",
  "widgets/SoxDashboard/PresidentDashboard.tsx",
  "widgets/WorkpaperEditor/index.tsx",
  "widgets/MissionControl/LiveTerminal.tsx",
  "widgets/MissionControl/AgentCard.tsx",
  "widgets/MissionControl/NegotiatorChat.tsx",
  "widgets/MissionControl/InvestigatorTerminal.tsx",
  "widgets/FindingWorkflow/FindingWorkflowProgress.tsx",
  "widgets/AnomalyCockpit/RuleAlertFeed.tsx",
  "widgets/AnomalyCockpit/BenfordChart.tsx",
  "widgets/ProcessCanvas/ProcessFlowEditor.tsx",
  "widgets/FindingStudio/FindingPaper.tsx",
  "widgets/FindingStudio/WorkflowStepper.tsx",
  "widgets/FindingStudio/FindingSidebar.tsx",
  "features/report-editor/utils/pdf-live-data.ts",
  "features/workpaper-editor/index.ts",
  "features/governance/api/cae-escalation-hooks.ts",
  "features/monitoring/api/sla-engine.ts"
];

const DynamicComponentPreview = ({ path }: { path: string }) => {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    const loaderPath = `/src/${path}`;
    const loader = componentModules[loaderPath] as () => Promise<any>;

    if (!loader) {
      if (isMounted) setError('Bileşen import edilemedi: ' + loaderPath);
      return;
    }

    setError(null);
    setComponent(null);

    loader()
      .then((module: any) => {
        if (!isMounted) return;
        const Comp = module.default || Object.values(module)[0];
        if (!Comp) throw new Error('Bir React bileşeni export edilmemiş.');
        setComponent(() => Comp);
      })
      .catch((err: any) => {
        if (isMounted) setError(err.message);
      });

    return () => {
      isMounted = false;
    };
  }, [path]);

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">
        <h3 className="font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Render Hatası
        </h3>
        <p className="mt-2 text-sm text-red-600">
          Bu bileşen tamamen yapılandırılmamış veya eksik proplar bekliyor.
          <br /><code>{error}</code>
        </p>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="p-12 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-slate-900 animate-spin" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm relative isolate bg-white">
        <div className="absolute top-0 right-0 px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-bl-lg z-50 opacity-50 hover:opacity-100 transition-opacity">
          PREVIEW MODE
        </div>
        <div className="p-4" style={{ minHeight: '300px' }}>
          <Suspense fallback={<div className="p-4 text-center">Yükleniyor...</div>}>
            <Component />
          </Suspense>
        </div>
      </div>
    </ErrorBoundary>
  );
};

// Simple error boundary to catch hook errors from incomplete components
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
 constructor(props: { children: React.ReactNode }) {
 super(props);
 this.state = { hasError: false, error: null };
 }

 static getDerivedStateFromError(error: Error) {
 return { hasError: true, error };
 }

 render() {
 if (this.state.hasError) {
 return (
 <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
 <h3 className="text-amber-800 font-bold flex items-center gap-2 mb-2">
 <AlertTriangle className="w-5 h-5" />
 Eksik Bağlam Hatası
 </h3>
 <p className="text-sm text-amber-700">Bu "öksüz" bileşen çalışmak için özel proplara (veya routing context'ine) ihtiyaç duyuyor olabilir. Bu yüzden şu an önizlenemiyor.</p>
 <pre className="mt-4 p-3 bg-white/50 rounded text-xs text-amber-900 overflow-auto">{this.state.error?.message}</pre>
 </div>
 );
 }
 return this.props.children;
 }
}

export default function OrphanInspectorPage() {
 const [selectedPath, setSelectedPath] = useState<string | null>(null);
 const [searchTerm, setSearchTerm] = useState('');

 const filteredPaths = (ORPHAN_COMPONENTS || []).filter(p => p.toLowerCase().includes(searchTerm.toLowerCase()));

 return (
 <div className="flex h-screen ">
 {/* Sidebar List */}
 <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 shadow-sm z-10">
 <div className="p-4 border-b border-slate-200 bg-slate-900 text-white">
 <div className="flex items-center gap-3">
 <div className="p-1.5 bg-rose-500 rounded-lg">
 <PlaySquare className="w-5 h-5 text-white" />
 </div>
 <div>
 <h1 className="font-bold tracking-wide">Öksüz Sayfalar</h1>
 <p className="text-[11px] text-slate-400 font-medium">{ORPHAN_COMPONENTS.length} Bileşen Bulundu</p>
 </div>
 </div>
 </div>
 
 <div className="p-3 border-b border-slate-100">
 <input 
 type="text" 
 placeholder="Ara..." 
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-lg text-sm px-3 py-2 outline-none focus:border-slate-400 transition-colors"
 />
 </div>

 <div className="flex-1 overflow-y-auto p-2 space-y-1">
 {(filteredPaths || []).map(path => (
 <button
 key={path}
 onClick={() => setSelectedPath(path)}
 className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
 selectedPath === path 
 ? 'bg-rose-50 border border-rose-100 text-rose-700' 
 : 'hover:bg-slate-50 text-slate-600 border border-transparent'
 }`}
 >
 <div className="truncate">{path.split('/').pop()}</div>
 <div className="text-[10px] text-slate-400 truncate opacity-80 mt-0.5">{path}</div>
 </button>
 ))}
 {filteredPaths.length === 0 && (
 <div className="p-4 text-center text-slate-500 text-sm">Sonuç bulunamadı.</div>
 )}
 </div>
 </div>

 {/* Main Preview Area */}
 <div className="flex-1 overflow-y-auto bg-slate-50 p-8 h-full">
 {!selectedPath ? (
 <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
 <LayoutDashboard className="w-16 h-16 opacity-30" />
 <p className="font-medium">Önizlemek için soldan bir bileşen seçin</p>
 </div>
 ) : (
 <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6">
 <div className="bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
 <div>
 <h2 className="text-xl font-bold text-slate-900">{selectedPath.split('/').pop()}</h2>
 <p className="text-sm text-slate-500 mt-1 font-mono">{selectedPath}</p>
 </div>
 <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded text-xs font-bold border border-amber-200">
 İZOLASYON MODU
 </div>
 </div>

 {/* PREVIEW CONTAINER */}
 <DynamicComponentPreview path={selectedPath} />
 </div>
 )}
 </div>
 </div>
 );
}
