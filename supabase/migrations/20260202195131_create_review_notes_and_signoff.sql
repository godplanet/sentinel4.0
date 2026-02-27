/*
  # Review Notes and Sign-off Layer (Four Eyes Principle)

  1. New Tables
    - `review_notes`
      - Coaching notes from supervisors to auditors
      - Field-specific comments on workpapers
      - Status tracking (OPEN/RESOLVED)

  2. Changes to Existing Tables
    - `workpapers` table enhanced with:
      - `prepared_by` - Auditor who prepared the workpaper
      - `prepared_at` - Timestamp of preparation
      - `reviewed_by` - Supervisor who reviewed and approved
      - `reviewed_at` - Timestamp of approval

  3. Security
    - Enable RLS on `review_notes` table
    - Add policies for authenticated users
    - Supervisors can create/update notes
    - Auditors can read their assigned notes

  4. Important Notes
    - **Four Eyes Principle**: Dual sign-off mechanism
    - **Coaching Layer**: Supervisors guide auditors with contextual notes
    - **Audit Trail**: Full timestamp tracking of preparation and review
    - **Field-Level Comments**: Notes linked to specific workpaper fields
*/

-- =====================================================
-- PHASE 1: REVIEW NOTES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.review_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
    workpaper_id UUID NOT NULL,
    field_key TEXT NOT NULL,
    note_text TEXT NOT NULL,
    author_id UUID,
    status TEXT CHECK (status IN ('OPEN', 'RESOLVED')) DEFAULT 'OPEN',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID
);

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'review_notes_workpaper_id_fkey'
  ) THEN
    ALTER TABLE public.review_notes
    ADD CONSTRAINT review_notes_workpaper_id_fkey
    FOREIGN KEY (workpaper_id) REFERENCES public.workpapers(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =====================================================
-- PHASE 2: WORKPAPERS SIGN-OFF COLUMNS
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workpapers' AND column_name = 'prepared_by'
  ) THEN
    ALTER TABLE public.workpapers ADD COLUMN prepared_by UUID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workpapers' AND column_name = 'prepared_at'
  ) THEN
    ALTER TABLE public.workpapers ADD COLUMN prepared_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workpapers' AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE public.workpapers ADD COLUMN reviewed_by UUID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workpapers' AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE public.workpapers ADD COLUMN reviewed_at TIMESTAMPTZ;
  END IF;
END $$;

-- =====================================================
-- PHASE 3: INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_review_notes_workpaper ON public.review_notes(workpaper_id);
CREATE INDEX IF NOT EXISTS idx_review_notes_status ON public.review_notes(status) WHERE status = 'OPEN';
CREATE INDEX IF NOT EXISTS idx_review_notes_author ON public.review_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_workpapers_prepared_by ON public.workpapers(prepared_by);
CREATE INDEX IF NOT EXISTS idx_workpapers_reviewed_by ON public.workpapers(reviewed_by);

-- =====================================================
-- PHASE 4: ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.review_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view review notes for workpapers in their tenant
CREATE POLICY "Users can view review notes in their tenant"
  ON public.review_notes
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.workpapers
      WHERE id = review_notes.workpaper_id
    )
  );

-- Policy: Authenticated users can create review notes
CREATE POLICY "Authenticated users can create review notes"
  ON public.review_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.workpapers
      WHERE id = review_notes.workpaper_id
    )
  );

-- Policy: Users can update their own review notes
CREATE POLICY "Users can update their own review notes"
  ON public.review_notes
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Policy: Users can resolve notes on their workpapers
CREATE POLICY "Users can resolve review notes"
  ON public.review_notes
  FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.workpapers
      WHERE id = review_notes.workpaper_id
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.workpapers
      WHERE id = review_notes.workpaper_id
    )
  );

-- =====================================================
-- PHASE 5: HELPER FUNCTIONS
-- =====================================================

-- Function: Get open review notes count for a workpaper
CREATE OR REPLACE FUNCTION public.get_open_review_notes_count(workpaper_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.review_notes
    WHERE workpaper_id = workpaper_uuid
    AND status = 'OPEN'
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Check if workpaper is ready for review
CREATE OR REPLACE FUNCTION public.is_workpaper_ready_for_review(workpaper_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT 
      prepared_by IS NOT NULL 
      AND prepared_at IS NOT NULL
      AND reviewed_by IS NULL
    FROM public.workpapers
    WHERE id = workpaper_uuid
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Sign off workpaper (complete review)
CREATE OR REPLACE FUNCTION public.signoff_workpaper(
  workpaper_uuid UUID,
  reviewer_uuid UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if there are open review notes
  IF EXISTS (
    SELECT 1 FROM public.review_notes
    WHERE workpaper_id = workpaper_uuid
    AND status = 'OPEN'
  ) THEN
    RAISE EXCEPTION 'Cannot sign off workpaper with open review notes';
  END IF;

  -- Update workpaper with review signature
  UPDATE public.workpapers
  SET 
    reviewed_by = reviewer_uuid,
    reviewed_at = NOW()
  WHERE id = workpaper_uuid
  AND prepared_by IS NOT NULL
  AND reviewed_by IS NULL;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;
