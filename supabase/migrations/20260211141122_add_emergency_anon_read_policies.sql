/*
  # Emergency Anon Read Policies

  1. Security Changes
    - Add anon SELECT/INSERT/UPDATE/DELETE policies on tables that only had authenticated policies
    - Tables affected: rkm_processes, rkm_risks, evidence_chain

  2. Important Notes
    - These are DEV MODE policies for demo environment
    - In production, these would be replaced with proper auth-scoped policies
*/

-- rkm_processes: add anon CRUD
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rkm_processes' AND policyname = 'anon_rkm_processes_select') THEN
    CREATE POLICY "anon_rkm_processes_select" ON rkm_processes FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rkm_processes' AND policyname = 'anon_rkm_processes_insert') THEN
    CREATE POLICY "anon_rkm_processes_insert" ON rkm_processes FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rkm_processes' AND policyname = 'anon_rkm_processes_update') THEN
    CREATE POLICY "anon_rkm_processes_update" ON rkm_processes FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rkm_processes' AND policyname = 'anon_rkm_processes_delete') THEN
    CREATE POLICY "anon_rkm_processes_delete" ON rkm_processes FOR DELETE TO anon USING (true);
  END IF;
END $$;

-- rkm_risks: add anon CRUD
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rkm_risks' AND policyname = 'anon_rkm_risks_select') THEN
    CREATE POLICY "anon_rkm_risks_select" ON rkm_risks FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rkm_risks' AND policyname = 'anon_rkm_risks_insert') THEN
    CREATE POLICY "anon_rkm_risks_insert" ON rkm_risks FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rkm_risks' AND policyname = 'anon_rkm_risks_update') THEN
    CREATE POLICY "anon_rkm_risks_update" ON rkm_risks FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rkm_risks' AND policyname = 'anon_rkm_risks_delete') THEN
    CREATE POLICY "anon_rkm_risks_delete" ON rkm_risks FOR DELETE TO anon USING (true);
  END IF;
END $$;

-- evidence_chain: add anon CRUD
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'evidence_chain' AND policyname = 'anon_evidence_chain_select') THEN
    CREATE POLICY "anon_evidence_chain_select" ON evidence_chain FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'evidence_chain' AND policyname = 'anon_evidence_chain_insert') THEN
    CREATE POLICY "anon_evidence_chain_insert" ON evidence_chain FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'evidence_chain' AND policyname = 'anon_evidence_chain_update') THEN
    CREATE POLICY "anon_evidence_chain_update" ON evidence_chain FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'evidence_chain' AND policyname = 'anon_evidence_chain_delete') THEN
    CREATE POLICY "anon_evidence_chain_delete" ON evidence_chain FOR DELETE TO anon USING (true);
  END IF;
END $$;
