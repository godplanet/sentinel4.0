/*
  # Fix user_profiles table schema

  1. Changes
    - Expand role check constraint to support all roles
    - Add missing columns: department, phone
    - Make tenant_id nullable for demo data

  2. Security
    - No changes to RLS policies
*/

-- Drop existing constraint
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;

-- Add new constraint with all roles
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN ('admin', 'auditor', 'auditee', 'guest', 'executive', 'cae', 'gmy', 'vendor'));

-- Make tenant_id nullable
ALTER TABLE user_profiles ALTER COLUMN tenant_id DROP NOT NULL;

-- Add missing columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'department'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN department TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN phone TEXT;
  END IF;
END $$;
