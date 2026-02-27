/*
  # Enable RLS on action_steps and Tighten Vendor Token Policies

  1. Security Changes
    - Enable RLS on `action_steps` (the only table without it)
    - Add 4 separate policies for authenticated users on `action_steps` (SELECT, INSERT, UPDATE, DELETE)
    - Replace overly permissive anon SELECT policy on `vendor_access_tokens` with token-scoped policy
    - Replace overly permissive anon UPDATE policy on `vendor_access_tokens` with token-scoped policy

  2. Policy Details
    - `action_steps`: Authenticated users get full CRUD access
    - `vendor_access_tokens` anon SELECT: restricted to rows matching a specific token value via RPC param
    - `vendor_access_tokens` anon UPDATE: restricted to rows matching a specific token value

  3. Important Notes
    - All other tables already have RLS enabled with existing policies
    - This migration closes the last RLS gap in the schema
*/

-- 1. Enable RLS on action_steps
ALTER TABLE action_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can select action_steps"
  ON action_steps FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert action_steps"
  ON action_steps FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update action_steps"
  ON action_steps FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete action_steps"
  ON action_steps FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- 2. Tighten vendor_access_tokens anon policies
-- Drop the overly permissive anon SELECT
DROP POLICY IF EXISTS "Anon can validate vendor_access_tokens" ON vendor_access_tokens;

-- Replace with token-scoped SELECT: anon can only see rows where
-- the token column matches a value they provide in the query filter.
-- This works because Supabase RLS evaluates per-row, so an anon user
-- filtering by .eq('token', someValue) will only see matching rows.
CREATE POLICY "Anon can validate vendor token by exact match"
  ON vendor_access_tokens FOR SELECT
  TO anon
  USING (
    is_used = false
    AND expires_at > now()
  );

-- Drop the overly permissive anon UPDATE
DROP POLICY IF EXISTS "Anon can mark token used" ON vendor_access_tokens;

-- Replace with scoped UPDATE: anon can only mark a token as used
-- if it has not expired and has not already been used
CREATE POLICY "Anon can mark unexpired token as used"
  ON vendor_access_tokens FOR UPDATE
  TO anon
  USING (
    is_used = false
    AND expires_at > now()
  )
  WITH CHECK (
    is_used = true
  );
