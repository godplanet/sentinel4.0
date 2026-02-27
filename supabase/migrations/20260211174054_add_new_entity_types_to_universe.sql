/*
  # Expand Audit Universe Entity Types

  ## Summary
  Adds new entity types to support the "Living Ecosystem" upgrade:
  - BRANCH (Şube)
  - DEPARTMENT (Departman)
  - HEADQUARTERS (Genel Müdürlük)
  - SUBSIDIARY (İştirak)
  - VENDOR (Tedarikçi)
  - IT_ASSET (BT Varlığı)

  ## Changes
  1. Adds new values to entity_type ENUM
  2. No data migration needed - existing records remain unchanged

  ## Impact
  - Enables polymorphic entity model for audit universe
  - Supports integration with external systems (HR, CMDB, Procurement)
  - Enables dynamic risk scoring based on entity type
*/

-- Add new entity types to the enum
DO $$
BEGIN
  -- Add BRANCH if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'entity_type' AND e.enumlabel = 'BRANCH'
  ) THEN
    ALTER TYPE entity_type ADD VALUE 'BRANCH';
  END IF;

  -- Add DEPARTMENT if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'entity_type' AND e.enumlabel = 'DEPARTMENT'
  ) THEN
    ALTER TYPE entity_type ADD VALUE 'DEPARTMENT';
  END IF;

  -- Add HEADQUARTERS if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'entity_type' AND e.enumlabel = 'HEADQUARTERS'
  ) THEN
    ALTER TYPE entity_type ADD VALUE 'HEADQUARTERS';
  END IF;

  -- Add SUBSIDIARY if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'entity_type' AND e.enumlabel = 'SUBSIDIARY'
  ) THEN
    ALTER TYPE entity_type ADD VALUE 'SUBSIDIARY';
  END IF;

  -- Add VENDOR if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'entity_type' AND e.enumlabel = 'VENDOR'
  ) THEN
    ALTER TYPE entity_type ADD VALUE 'VENDOR';
  END IF;

  -- Add IT_ASSET if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'entity_type' AND e.enumlabel = 'IT_ASSET'
  ) THEN
    ALTER TYPE entity_type ADD VALUE 'IT_ASSET';
  END IF;
END $$;
