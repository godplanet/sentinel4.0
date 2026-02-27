import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Activity, AlertTriangle, CheckCircle2, BarChart3,
  Eye, Radar, RefreshCw, Loader2,
} from 'lucide-react';
import { Seismograph } from '@/widgets/Seismograph';
import { ProbeCards } from '@/widgets/ProbeCards';
import { ExceptionQueue } from '@/widgets/ExceptionQueue';
import { ProbeBuilderWizard, type WizardResult } from '@/features/probe-builder';
import { AIAnomalyPanel, type AISuggestion } from '@/features/ai-anomaly';
import { TextToRulePanel } from '@/features/ai-probe-gen';
import { ProbeEditor } from '@/widgets/ProbeEditor';
import {
  fetchProbes,
  fetchProbeStats,
  fetchAllProbeRuns,
  fetchProbeExceptions,
  createProbe,
  updateProbe,
  deleteProbe,
  updateExceptionStatus,
  simulateProbeExecution,
  buildSeismographData,
} from '@/entities/probe';
import type {
  Probe,
  ProbeWithStats,
  ProbeRun,
  ProbeException,
  SeismographPoint,
  ExceptionStatus,
} from '@/entities/probe';
import type { AIProbeConfig, AIForensicInsight } from '@/shared/api/sentinel-ai';

type ViewMode = 'dashboard' | 'probes' | 'exceptions';

export default function WatchtowerPage() {
  const [probes, setProbes] = useState<ProbeWithStats[]>([]);
  const [runs, setRuns] = useState<ProbeRun[]>([]);
  const [exceptions, setExceptions] = useState<ProbeException[]>([]);
  const [seismoData, setSeismoData] = useState<SeismographPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningIds, setRunningIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [showWizard, setShowWizard] = useState(false);
  const [editProbe, setEditProbe] = useState<Probe | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [probeData, runData, exceptionData] = await Promise.all([
        fetchProbes(),
        fetchAllProbeRuns(200),
        fetchProbeExceptions({ limit: 100 }),
      ]);

      const probesWithStats = await Promise.all(
        probeData.map(async (p) => {
          const stats = await fetchProbeStats(p.id);
          return { ...p, stats } as ProbeWithStats;
        })
      );

      setProbes(probesWithStats);
      setRuns(runData);
      setExceptions(exceptionData);
      setSeismoData(buildSeismographData(runData));
    } catch (err) {
      console.error('Failed to load watchtower data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  const handleRun = async (probe: ProbeWithStats) => {
    setRunningIds(prev => new Set(prev).add(probe.id));
    try {
      await simulateProbeExecution(probe);
      await loadAll();
    } catch { /* silent */ }
    finally {
      setRunningIds(prev => { const n = new Set(prev); n.delete(probe.id); return n; });
    }
  };

  const handleToggle = async (probe: ProbeWithStats) => {
    try {
      await updateProbe(probe.id, { is_active: !probe.is_active });
      await loadAll();
    } catch { /* silent */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu probe silinecek. Devam edilsin mi?')) return;
    try { await deleteProbe(id); await loadAll(); } catch { /* silent */ }
  };

  const handleSaveEditor = async (data: Partial<Probe>) => {
    try {
      if (editProbe) await updateProbe(editProbe.id, data);
      else await createProbe(data);
      setShowEditor(false);
      setEditProbe(null);
      await loadAll();
    } catch { /* silent */ }
  };

  const handleWizardSave = async (result: WizardResult) => {
    const queryPayload = `SELECT * FROM ${result.source.replace('-', '_')}\nWHERE ${
      result.conditions.map(c => `${c.field} ${c.operator} '${c.value}'`).join('\n  AND ')
    };`;

    try {
      await createProbe({
        title: result.title,
        description: result.description,
        query_type: 'SQL',
        query_payload: queryPayload,
        schedule_cron: result.schedule,
        risk_threshold: 3,
        is_active: true,
        category: result.category,
        severity: result.severity,
      });
      setShowWizard(false);
      await loadAll();
    } catch { /* silent */ }
  };

  const handleAICreateProbe = async (suggestion: AISuggestion) => {
    try {
      await createProbe({
        title: `[AI] ${suggestion.title}`,
        description: suggestion.description,
        query_type: 'SQL',
        query_payload: suggestion.suggestedQuery,
        schedule_cron: '0 */2 * * *',
        risk_threshold: 2,
        is_active: true,
        category: 'FRAUD',
        severity: suggestion.severity,
      });
      await loadAll();
    } catch { /* silent */ }
  };

  const handleTextToRuleCreate = async (config: AIProbeConfig) => {
    try {
      await createProbe({
        title: `[AI] ${config.title}`,
        description: config.description,
        query_type: 'SQL',
        query_payload: config.query_payload,
        schedule_cron: config.schedule_cron,
        risk_threshold: config.risk_threshold,
        is_active: true,
        category: config.category,
        severity: config.severity,
      });
      await loadAll();
    } catch { /* silent */ }
  };

  const handleExceptionStatus = async (id: string, status: ExceptionStatus, notes?: string) => {
    try {
      await updateExceptionStatus(id, status, notes);
      setExceptions(prev => prev.map(e =>
        e.id === id ? { ...e, status, notes: notes || e.notes } : e
      ));
    } catch { /* silent */ }
  };

  const handleCreateFinding = (_exc: ProbeException, insight: AIForensicInsight) => {
    alert(
      `Bulgu olusturma islemi baslatildi.\n\nRisk: ${insight.risk_label}\nAksiyon: ${insight.suggested_action_label}\nGuven: ${insight.confidence}%\n\nBu islem Modul 4 (Bulgular) ile entegre calisacaktir.`
    );
  };

  const totalProbes = probes.length;
  const activeProbes = probes.filter(p => p.is_active).length;
  const openExceptions = exceptions.filter(e => e.status === 'OPEN').length;
  const totalAnomalies = probes.reduce((s, p) => s + (p.stats?.anomaly_runs || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto text-blue-600 mb-3" size={32} />
          <p className="text-sm text-slate-500">Watchtower yukleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700">
            <Radar size={24} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sentinel Watchtower</h1>
            <p className="text-sm text-slate-500">Surekli Denetim Savunma Sistemi</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Yenile
          </button>

          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus size={16} />
            Probe Builder
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Toplam Probe', value: totalProbes, icon: Activity, color: 'blue', desc: `${activeProbes} aktif` },
          { label: 'Aktif Izleme', value: activeProbes, icon: CheckCircle2, color: 'emerald', desc: 'Calisiyor' },
          { label: 'Acik Istisna', value: openExceptions, icon: AlertTriangle, color: 'red', desc: 'Inceleme bekliyor' },
          { label: 'Toplam Anomali', value: totalAnomalies, icon: BarChart3, color: 'amber', desc: 'Son 7 gun' },
        ].map((kpi, i) => {
          const KIcon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                <div className={`p-1.5 bg-${kpi.color}-100 rounded-lg`}>
                  <KIcon size={16} className={`text-${kpi.color}-600`} />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 mb-0.5">{kpi.value}</p>
              <p className="text-[11px] text-slate-400">{kpi.desc}</p>
            </motion.div>
          );
        })}
      </div>

      <TextToRulePanel onCreateProbe={handleTextToRuleCreate} />

      <div className="flex bg-slate-100 rounded-xl p-1 gap-1 w-fit">
        {[
          { key: 'dashboard' as ViewMode, label: 'Genel Bakis', icon: Eye },
          { key: 'probes' as ViewMode, label: 'Aktif Problar', icon: Radar },
          { key: 'exceptions' as ViewMode, label: `Istisnalar (${openExceptions})`, icon: AlertTriangle },
        ].map(tab => {
          const TIcon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setViewMode(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${
                viewMode === tab.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <TIcon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {viewMode === 'dashboard' && (
        <div className="space-y-6">
          <Seismograph data={seismoData} loading={false} />

          <AIAnomalyPanel onCreateProbe={handleAICreateProbe} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Radar size={18} className="text-blue-600" />
                Aktif Problar
              </h3>
              <ProbeCards
                probes={probes.slice(0, 4)}
                runningIds={runningIds}
                onRun={handleRun}
                onToggle={handleToggle}
                onEdit={(p) => { setEditProbe(p); setShowEditor(true); }}
                onDelete={handleDelete}
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-600" />
                Son Istisnalar
              </h3>
              <ExceptionQueue
                exceptions={exceptions.slice(0, 10)}
                probes={probes}
                loading={false}
                onStatusChange={handleExceptionStatus}
                onCreateFinding={handleCreateFinding}
              />
            </div>
          </div>
        </div>
      )}

      {viewMode === 'probes' && (
        <ProbeCards
          probes={probes}
          runningIds={runningIds}
          onRun={handleRun}
          onToggle={handleToggle}
          onEdit={(p) => { setEditProbe(p); setShowEditor(true); }}
          onDelete={handleDelete}
        />
      )}

      {viewMode === 'exceptions' && (
        <ExceptionQueue
          exceptions={exceptions}
          probes={probes}
          loading={false}
          onStatusChange={handleExceptionStatus}
          onCreateFinding={handleCreateFinding}
        />
      )}

      <AnimatePresence>
        {showWizard && (
          <ProbeBuilderWizard
            onSave={handleWizardSave}
            onClose={() => setShowWizard(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditor && (
          <ProbeEditor
            probe={editProbe || undefined}
            onSave={handleSaveEditor}
            onClose={() => { setShowEditor(false); setEditProbe(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
