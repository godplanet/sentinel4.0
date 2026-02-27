import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, History, X, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { PageHeader } from '@/shared/ui/PageHeader';
import {
  AgentCard,
  LiveTerminal,
  InvestigatorTerminal,
  NegotiatorChat,
} from '@/widgets/MissionControl';
import type { TerminalLine } from '@/widgets/MissionControl';
import { AgentOrchestrator } from '@/features/ai-agents/orchestrator';
import { fetchAgents, fetchAgentRuns, fetchRunThoughts } from '@/features/ai-agents/api';
import type { AIAgent, AgentRun, ThoughtStep, RunOutcome } from '@/features/ai-agents/types';
import { DEFAULT_TARGETS } from '@/features/ai-agents/types';

type ViewMode = 'fleet' | 'investigator' | 'negotiator' | 'terminal';

function nowStamp(): string {
  return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function MissionControlPage() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [target, setTarget] = useState('');
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('fleet');
  const orchestratorRef = useRef(new AgentOrchestrator());

  const loadAgents = useCallback(async () => {
    try {
      const data = await fetchAgents();
      setAgents(data);
    } catch (err) {
      console.error('Failed to load agents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const handleSelectAgent = (agent: AIAgent) => {
    if (isRunning) return;
    const isSame = selectedAgent?.id === agent.id;
    setSelectedAgent(isSame ? null : agent);
    setTarget('');
    setShowHistory(false);
    if (isSame) {
      setViewMode('fleet');
    }
  };

  const handleOpenPersona = () => {
    if (!selectedAgent) return;
    if (selectedAgent.role === 'INVESTIGATOR') {
      setViewMode('investigator');
    } else if (selectedAgent.role === 'NEGOTIATOR') {
      setViewMode('negotiator');
    }
  };

  const handleDeploy = async () => {
    if (!selectedAgent || !target.trim() || isRunning) return;
    setIsRunning(true);
    setLines([]);
    setShowHistory(false);
    setViewMode('terminal');

    try {
      await orchestratorRef.current.dispatchAgent(
        selectedAgent.id,
        selectedAgent.role,
        target.trim(),
        (step: ThoughtStep, stepNumber: number) => {
          setLines((prev) => [...prev, { step, stepNumber, timestamp: nowStamp() }]);
        },
        (outcome: RunOutcome) => {
          setIsRunning(false);
          setAgents((prev) =>
            prev.map((a) =>
              a.id === selectedAgent.id ? { ...a, status: 'IDLE' as const } : a,
            ),
          );
          if (outcome === 'FLAGGED') {
            setLines((prev) => [
              ...prev,
              {
                step: { type: 'CONCLUSION' as const, content: '>>> GOREV TAMAMLANDI: BAYRAKLI (FLAGGED) <<<', delay: 0 },
                stepNumber: prev.length + 1,
                timestamp: nowStamp(),
              },
            ]);
          }
        },
      );

      setAgents((prev) =>
        prev.map((a) =>
          a.id === selectedAgent.id ? { ...a, status: 'BUSY' as const } : a,
        ),
      );
    } catch {
      setIsRunning(false);
    }
  };

  const handleLoadHistory = async (agentId: string) => {
    try {
      const data = await fetchAgentRuns(agentId);
      setRuns(data);
      setShowHistory(true);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleViewRun = async (run: AgentRun) => {
    try {
      const thoughts = await fetchRunThoughts(run.id);
      setLines(
        thoughts.map((t) => ({
          step: {
            type: t.thought_type,
            content: t.thought_process,
            action: t.action_taken || undefined,
            toolOutput: t.tool_output,
            delay: 0,
          } as ThoughtStep,
          stepNumber: t.step_number,
          timestamp: new Date(t.created_at).toLocaleTimeString('tr-TR', {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
          }),
        })),
      );
      setShowHistory(false);
      setViewMode('terminal');
    } catch (err) {
      console.error('Failed to load run:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ajan Komuta Merkezi"
        description="Sentinel Probes 2.0 -- Otonom Denetim Orkestrasyonu (ReAct Paradigmasi)"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            selected={selectedAgent?.id === agent.id}
            onSelect={() => handleSelectAgent(agent)}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedAgent && !isRunning && viewMode === 'fleet' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Rocket size={16} className="text-slate-500" />
                <span className="text-sm font-bold text-slate-900">
                  {selectedAgent.name} - Gorev Ata
                </span>

                {(selectedAgent.role === 'INVESTIGATOR' || selectedAgent.role === 'NEGOTIATOR') && (
                  <button
                    onClick={handleOpenPersona}
                    className="ml-2 text-[10px] font-bold px-2 py-1 rounded-md bg-slate-900 text-white hover:bg-slate-700 transition-colors"
                  >
                    {selectedAgent.role === 'INVESTIGATOR' ? 'OSINT Tarayici' : 'ChatOps Muzakere'}
                  </button>
                )}

                <button
                  onClick={() => handleLoadHistory(selectedAgent.id)}
                  className="ml-auto flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <History size={12} />
                  Gecmis
                </button>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDeploy()}
                    placeholder="Hedef varlik girin..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                  {!target && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <ChevronDown size={14} className="text-slate-400" />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleDeploy}
                  disabled={!target.trim()}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Baslat
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {(DEFAULT_TARGETS[selectedAgent.role] || []).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTarget(t)}
                    className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-900">Gorev Gecmisi</span>
                <button onClick={() => setShowHistory(false)}>
                  <X size={16} className="text-slate-400 hover:text-slate-600" />
                </button>
              </div>
              {runs.length === 0 ? (
                <p className="text-xs text-slate-500">Henuz gorev gecmisi yok</p>
              ) : (
                <div className="space-y-1.5">
                  {runs.map((run) => (
                    <button
                      key={run.id}
                      onClick={() => handleViewRun(run)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 text-left transition-colors"
                    >
                      <span className={clsx(
                        'text-[10px] font-bold px-1.5 py-0.5 rounded',
                        run.status === 'FLAGGED' ? 'bg-red-100 text-red-700' :
                        run.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-slate-100 text-slate-600',
                      )}>
                        {run.status}
                      </span>
                      <span className="text-xs text-slate-700 flex-1 truncate">{run.target_entity}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(run.start_time).toLocaleString('tr-TR')}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {viewMode === 'investigator' && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setViewMode('fleet')}
              className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
            >
              Komuta Merkezine Don
            </button>
            <span className="text-xs text-slate-400">Sherlock -- OSINT & Cikar Catismasi Modu</span>
          </div>
          <InvestigatorTerminal />
        </div>
      )}

      {viewMode === 'negotiator' && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setViewMode('fleet')}
              className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
            >
              Komuta Merkezine Don
            </button>
            <span className="text-xs text-slate-400">Hermes -- ChatOps Muzakere Modu</span>
          </div>
          <NegotiatorChat />
        </div>
      )}

      {(viewMode === 'fleet' || viewMode === 'terminal') && (
        <LiveTerminal
          lines={lines}
          isRunning={isRunning}
          agentName={selectedAgent?.name}
        />
      )}
    </div>
  );
}
