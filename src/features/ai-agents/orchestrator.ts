import type { AgentRole, RunOutcome, ThoughtStep } from './types';
import { getThoughtChain } from './thought-chains';
import { getEnhancedThoughtChain } from './thought-chains-enhanced';
import {
  createAgentRun,
  updateAgentStatus,
  insertAgentThought,
  finalizeAgentRun,
} from './api';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class AgentOrchestrator {
  private aborted = false;
  private useEnhancedMode = true;

  setEnhancedMode(enabled: boolean): void {
    this.useEnhancedMode = enabled;
  }

  async dispatchAgent(
    agentId: string,
    role: AgentRole,
    target: string,
    onStep: (step: ThoughtStep, stepNumber: number) => void,
    onComplete: (outcome: RunOutcome) => void,
  ): Promise<string> {
    this.aborted = false;

    const runId = await createAgentRun(agentId, target);
    await updateAgentStatus(agentId, 'BUSY');

    const chain = this.useEnhancedMode
      ? await getEnhancedThoughtChain(role, target)
      : getThoughtChain(role, target);

    this.simulateThinking(runId, agentId, chain, onStep, onComplete).catch(
      async () => {
        await updateAgentStatus(agentId, 'ERROR').catch(() => {});
        onComplete('ERROR');
      },
    );

    return runId;
  }

  abort(): void {
    this.aborted = true;
  }

  private async simulateThinking(
    runId: string,
    agentId: string,
    chain: ThoughtStep[],
    onStep: (step: ThoughtStep, stepNumber: number) => void,
    onComplete: (outcome: RunOutcome) => void,
  ): Promise<void> {
    for (let i = 0; i < chain.length; i++) {
      if (this.aborted) break;

      await sleep(chain[i].delay);

      if (this.aborted) break;

      await insertAgentThought(runId, i + 1, chain[i]);
      onStep(chain[i], i + 1);
    }

    const lastStep = chain[chain.length - 1];
    const outcome: RunOutcome =
      this.aborted
        ? 'ERROR'
        : lastStep.content.includes('RISK')
          ? 'FLAGGED'
          : 'SUCCESS';

    const summary = this.aborted
      ? 'Gorev iptal edildi'
      : lastStep.content;

    await finalizeAgentRun(runId, outcome, summary);
    await updateAgentStatus(agentId, 'IDLE');
    onComplete(outcome);
  }
}
