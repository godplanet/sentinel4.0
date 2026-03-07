/**
 * Wave 28: AI Persona & Dual Brain — Supabase Data Layer
 *
 * TanStack React Query hooks wrapping the `ai_agents`, `agent_runs`,
 * `agent_thoughts`, `ai_chat_sessions`, `ai_chat_messages` tables.
 *
 * Defensive programming: all returns default to `[]` / `null` via `??` and `?.`.
 * Division-by-zero protection: use `(value || 1)` in computations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface AIPersona {
  id: string;
  name: string;
  codename: string;
  role: 'INVESTIGATOR' | 'NEGOTIATOR' | 'CHAOS_MONKEY';
  status: 'IDLE' | 'BUSY' | 'ERROR';
  capabilities: string[];
  avatar_color: string;
  created_at: string;
}

export interface PersonaRun {
  id: string;
  agent_id: string;
  target_entity: string;
  status: 'RUNNING' | 'SUCCESS' | 'FLAGGED' | 'ERROR';
  start_time: string;
  end_time: string | null;
  outcome: string | null;
  created_at: string;
}

export interface PersonaThought {
  id: string;
  run_id: string;
  step_number: number;
  thought_type: 'THINKING' | 'ACTION' | 'OBSERVATION' | 'CONCLUSION';
  thought_process: string;
  action_taken: string;
  tool_output: Record<string, unknown>;
  created_at: string;
}

export interface ChatSession {
  session_id: string;
  title: string | null;
  persona_codename: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ---------------------------------------------------------------------------
// HOOK: List all AI Personas (from ai_agents table)
// ---------------------------------------------------------------------------
export function useAiPersonas() {
  return useQuery({
    queryKey: ['ai-personas'],
    queryFn: async (): Promise<AIPersona[]> => {
      const { data, error } = await supabase
        .from('ai_agents')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) {
        console.warn('useAiPersonas: query failed, returning []', error.message);
        return [];
      }
      return (data ?? []) as AIPersona[];
    },
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// HOOK: A single Persona by codename
// ---------------------------------------------------------------------------
export function useAiPersonaByCodename(codename: string | null) {
  return useQuery({
    queryKey: ['ai-persona', codename],
    enabled: !!codename,
    queryFn: async (): Promise<AIPersona | null> => {
      if (!codename) return null;
      const { data, error } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('codename', codename)
        .maybeSingle();
      if (error) {
        console.warn('useAiPersonaByCodename: query failed', error.message);
        return null;
      }
      return (data ?? null) as AIPersona | null;
    },
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// HOOK: Run history for a persona
// ---------------------------------------------------------------------------
export function usePersonaRunHistory(agentId: string | null) {
  return useQuery({
    queryKey: ['persona-runs', agentId],
    enabled: !!agentId,
    queryFn: async (): Promise<PersonaRun[]> => {
      if (!agentId) return [];
      const { data, error } = await supabase
        .from('agent_runs')
        .select('*')
        .eq('agent_id', agentId)
        .order('start_time', { ascending: false })
        .limit(20);
      if (error) {
        console.warn('usePersonaRunHistory: query failed, returning []', error.message);
        return [];
      }
      return (data ?? []) as PersonaRun[];
    },
    staleTime: 30_000,
  });
}

// ---------------------------------------------------------------------------
// HOOK: Thoughts for a specific run
// ---------------------------------------------------------------------------
export function useRunThoughts(runId: string | null) {
  return useQuery({
    queryKey: ['run-thoughts', runId],
    enabled: !!runId,
    queryFn: async (): Promise<PersonaThought[]> => {
      if (!runId) return [];
      const { data, error } = await supabase
        .from('agent_thoughts')
        .select('*')
        .eq('run_id', runId)
        .order('step_number', { ascending: true });
      if (error) {
        console.warn('useRunThoughts: query failed, returning []', error.message);
        return [];
      }
      return (data ?? []) as PersonaThought[];
    },
    staleTime: 10_000,
  });
}

// ---------------------------------------------------------------------------
// HOOK: Chat messages for a session (anon-accessible for dev)
// ---------------------------------------------------------------------------
export function useChatMessages(sessionId: string | null) {
  return useQuery({
    queryKey: ['chat-messages', sessionId],
    enabled: !!sessionId,
    refetchInterval: 5_000, // poll for new messages every 5s
    queryFn: async (): Promise<ChatMessage[]> => {
      if (!sessionId) return [];
      const { data, error } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      if (error) {
        console.warn('useChatMessages: query failed, returning []', error.message);
        return [];
      }
      return (data ?? []) as ChatMessage[];
    },
  });
}

// ---------------------------------------------------------------------------
// MUTATION: Post a new chat message
// ---------------------------------------------------------------------------
export function usePostChatMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      role: 'user' | 'assistant';
      content: string;
      metadata?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase
        .from('ai_chat_messages')
        .insert({
          session_id: payload.session_id,
          role: payload.role,
          content: payload.content,
          metadata: payload.metadata ?? {},
        })
        .select()
        .single();
      if (error) throw error;
      return data as ChatMessage;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['chat-messages', data.session_id] });
    },
  });
}

// ---------------------------------------------------------------------------
// MUTATION: Create a new chat session
// ---------------------------------------------------------------------------
export function useCreateChatSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title?: string;
      persona_codename?: string;
    }) => {
      const { data, error } = await supabase
        .from('ai_chat_sessions')
        .insert({
          title: payload.title ?? 'Yeni Oturum',
          persona_codename: payload.persona_codename ?? 'SENTINEL_PRIME',
        })
        .select()
        .single();
      if (error) throw error;
      return data as ChatSession;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });
}

// ---------------------------------------------------------------------------
// MUTATION: Dispatch a new agent run
// ---------------------------------------------------------------------------
export function useDispatchAgentRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { agent_id: string; target_entity: string }) => {
      const { data, error } = await supabase
        .from('agent_runs')
        .insert({
          agent_id: payload.agent_id,
          target_entity: payload.target_entity,
          status: 'RUNNING',
          start_time: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data as PersonaRun;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['persona-runs', data.agent_id] });
    },
  });
}
