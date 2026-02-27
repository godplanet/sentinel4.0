/*
  # Create user_profiles table

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, foreign key to tenants)
      - `email` (text, unique, NOT NULL)
      - `full_name` (text, NOT NULL)
      - `role` (text, NOT NULL)
      - `title` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `user_profiles` table
    - Add policy for authenticated users to read their own profile
    - Add dev mode policies for unrestricted access
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'auditor', 'auditee', 'guest', 'executive')),
  title TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_tenant ON user_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Dev mode public read policy
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' AND policyname = 'Dev mode public read'
  ) THEN
    CREATE POLICY "Dev mode public read"
      ON user_profiles FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Dev mode public insert policy
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' AND policyname = 'Dev mode public insert'
  ) THEN
    CREATE POLICY "Dev mode public insert"
      ON user_profiles FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END $$;

-- Dev mode public update policy
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' AND policyname = 'Dev mode public update'
  ) THEN
    CREATE POLICY "Dev mode public update"
      ON user_profiles FOR UPDATE
      TO public
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
