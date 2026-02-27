import { supabase } from '@/shared/api/supabase';
import type { AIAgent, AgentRun, AgentThought, AgentStatus, RunOutcome, ThoughtStep } from './types';

export async function fetchAgents(): Promise<AIAgent[]> {
  const { data, error } = await supabase
    .from('ai_agents')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchAgentRuns(agentId: string): Promise<AgentRun[]> {
  const { data, error } = await supabase
    .from('agent_runs')
    .select('*')
    .eq('agent_id', agentId)
    .order('start_time', { ascending: false })
    .limit(10);
  if (error) throw error;
  return data || [];
}

export async function fetchRunThoughts(runId: string): Promise<AgentThought[]> {
  const { data, error } = await supabase
    .from('agent_thoughts')
    .select('*')
    .eq('run_id', runId)
    .order('step_number', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createAgentRun(agentId: string, target: string): Promise<string> {
  const { data, error } = await supabase
    .from('agent_runs')
    .insert({
      agent_id: agentId,
      target_entity: target,
      status: 'RUNNING',
      start_time: new Date().toISOString(),
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateAgentStatus(agentId: string, status: AgentStatus): Promise<void> {
  const { error } = await supabase
    .from('ai_agents')
    .update({ status })
    .eq('id', agentId);
  if (error) throw error;
}

export async function insertAgentThought(runId: string, stepNumber: number, step: ThoughtStep): Promise<void> {
  const { error } = await supabase
    .from('agent_thoughts')
    .insert({
      run_id: runId,
      step_number: stepNumber,
      thought_type: step.type,
      thought_process: step.content,
      action_taken: step.action || '',
      tool_output: step.toolOutput || {},
    });
  if (error) throw error;
}

export async function finalizeAgentRun(runId: string, outcome: RunOutcome, summary: string): Promise<void> {
  const { error } = await supabase
    .from('agent_runs')
    .update({
      status: outcome,
      end_time: new Date().toISOString(),
      outcome: summary,
    })
    .eq('id', runId);
  if (error) throw error;
}
