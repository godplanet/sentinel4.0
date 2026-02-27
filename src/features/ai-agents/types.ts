export type AgentRole = 'INVESTIGATOR' | 'NEGOTIATOR' | 'CHAOS_MONKEY';
export type AgentStatus = 'IDLE' | 'BUSY' | 'ERROR';
export type RunOutcome = 'RUNNING' | 'SUCCESS' | 'FLAGGED' | 'ERROR';
export type ThoughtType = 'THINKING' | 'ACTION' | 'OBSERVATION' | 'CONCLUSION';

export interface AIAgent {
  id: string;
  name: string;
  codename: string;
  role: AgentRole;
  status: AgentStatus;
  capabilities: string[];
  avatar_color: string;
  created_at: string;
}

export interface AgentRun {
  id: string;
  agent_id: string;
  target_entity: string;
  status: RunOutcome;
  start_time: string;
  end_time: string | null;
  outcome: string;
}

export interface AgentThought {
  id: string;
  run_id: string;
  step_number: number;
  thought_type: ThoughtType;
  thought_process: string;
  action_taken: string;
  tool_output: Record<string, unknown>;
  created_at: string;
}

export interface ThoughtStep {
  type: ThoughtType;
  content: string;
  action?: string;
  toolOutput?: Record<string, unknown>;
  delay: number;
}

export const ROLE_LABELS: Record<AgentRole, string> = {
  INVESTIGATOR: 'Sorusturmaci',
  NEGOTIATOR: 'Muzakereci',
  CHAOS_MONKEY: 'Kaos Testi',
};

export const THOUGHT_COLORS: Record<ThoughtType, string> = {
  THINKING: 'text-cyan-400',
  ACTION: 'text-amber-400',
  OBSERVATION: 'text-emerald-400',
  CONCLUSION: 'text-rose-400',
};

export const THOUGHT_LABELS: Record<ThoughtType, string> = {
  THINKING: 'DUSUNCE',
  ACTION: 'EYLEM',
  OBSERVATION: 'GOZLEM',
  CONCLUSION: 'SONUC',
};

export const DEFAULT_TARGETS: Record<AgentRole, string[]> = {
  INVESTIGATOR: ['Fraud_Corp Ltd.', 'Hayalet Calisan GHOST_001', 'Supheli Vendor XYZ'],
  NEGOTIATOR: ['Bulgu #42 - Kontrol Zaafiyeti', 'Bulgu #18 - SoD Ihlali'],
  CHAOS_MONKEY: ['Kasa Erisim Modulu', 'Bulgu Onay Pipeline', 'RLS Politika Testi'],
};
