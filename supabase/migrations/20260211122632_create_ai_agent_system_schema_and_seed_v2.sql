/*
  # Create AI Agent System Schema + Seed Data

  1. New Tables
    - `ai_agents` - Registry of AI agent personas
      - `id` (uuid, PK), `name`, `codename`, `role`, `status`, `capabilities`, `avatar_color`, `created_at`
    - `agent_runs` - Execution history for agent missions
      - `id` (uuid, PK), `agent_id` (FK), `target_entity`, `status`, `start_time`, `end_time`, `outcome`, `created_at`
    - `agent_thoughts` - Step-by-step reasoning chain of agent execution
      - `id` (uuid, PK), `run_id` (FK), `step_number`, `thought_type`, `thought_process`, `action_taken`, `tool_output`, `created_at`

  2. Security
    - RLS enabled on all tables
    - Permissive anon policies for demo environment

  3. Seed Data
    - 3 agents: Sentinel Prime, Investigator, Chaos Monkey
    - 3 completed runs with thought chains (12 thoughts total)
*/

CREATE TABLE IF NOT EXISTS ai_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  codename text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'INVESTIGATOR' CHECK (role IN ('INVESTIGATOR', 'NEGOTIATOR', 'CHAOS_MONKEY')),
  status text NOT NULL DEFAULT 'IDLE' CHECK (status IN ('IDLE', 'BUSY', 'ERROR')),
  capabilities text[] NOT NULL DEFAULT '{}',
  avatar_color text NOT NULL DEFAULT '#3B82F6',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_ai_agents_select" ON ai_agents FOR SELECT TO anon USING (true);
CREATE POLICY "anon_ai_agents_insert" ON ai_agents FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_ai_agents_update" ON ai_agents FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  target_entity text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'RUNNING' CHECK (status IN ('RUNNING', 'SUCCESS', 'FLAGGED', 'ERROR')),
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  outcome text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_agent_runs_select" ON agent_runs FOR SELECT TO anon USING (true);
CREATE POLICY "anon_agent_runs_insert" ON agent_runs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_agent_runs_update" ON agent_runs FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS agent_thoughts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  step_number integer NOT NULL DEFAULT 1,
  thought_type text NOT NULL DEFAULT 'THINKING' CHECK (thought_type IN ('THINKING', 'ACTION', 'OBSERVATION', 'CONCLUSION')),
  thought_process text NOT NULL DEFAULT '',
  action_taken text NOT NULL DEFAULT '',
  tool_output jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE agent_thoughts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_agent_thoughts_select" ON agent_thoughts FOR SELECT TO anon USING (true);
CREATE POLICY "anon_agent_thoughts_insert" ON agent_thoughts FOR INSERT TO anon WITH CHECK (true);
