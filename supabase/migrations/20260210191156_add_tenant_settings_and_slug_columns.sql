/*
  # Add settings and slug columns to tenants table

  1. Changes
    - Add `slug` column (TEXT, unique, for URL-friendly identifiers)
    - Add `settings` column (JSONB, for flexible tenant configuration)
    - Add index on slug for performance
  
  2. Security
    - Maintains existing RLS policies
    - No changes to access control
*/

-- Add slug column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'slug'
  ) THEN
    ALTER TABLE tenants ADD COLUMN slug TEXT;
  END IF;
END $$;

-- Add settings column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'settings'
  ) THEN
    ALTER TABLE tenants ADD COLUMN settings JSONB DEFAULT '{}'::JSONB;
  END IF;
END $$;

-- Add unique constraint on slug
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'tenants_slug_unique'
  ) THEN
    ALTER TABLE tenants ADD CONSTRAINT tenants_slug_unique UNIQUE (slug);
  END IF;
END $$;

-- Add index on slug for performance
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
