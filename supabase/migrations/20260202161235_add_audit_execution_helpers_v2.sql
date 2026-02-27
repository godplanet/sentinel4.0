/*
  # Audit Execution Helper Functions & Sample Data

  1. JSONB Helper Functions
    - `update_workpaper_test_result` - Updates a single test result in workpaper JSONB data
    - `update_workpaper_field` - Updates any field in workpaper JSONB data
    - `merge_workpaper_data` - Merges new data into existing workpaper JSONB

  2. Sample Data
    - Sample audit steps for banking audit (KYC, AML, Credit Risk procedures)
    - Demonstrates the flexible JSONB structure

  3. Performance
    - Optimized JSONB operations using jsonb_set
*/

-- =============================================
-- JSONB HELPER FUNCTIONS
-- =============================================

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS update_workpaper_test_result(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS update_workpaper_field(UUID, TEXT[], JSONB);
DROP FUNCTION IF EXISTS merge_workpaper_data(UUID, JSONB);
DROP FUNCTION IF EXISTS get_workpaper_completion(UUID);
DROP FUNCTION IF EXISTS jsonb_object_keys_count(JSONB);

-- Function: Update a single test result in workpaper data
CREATE FUNCTION update_workpaper_test_result(
  p_workpaper_id UUID,
  p_test_key TEXT,
  p_result TEXT
)
RETURNS void AS $$
BEGIN
  UPDATE public.workpapers
  SET
    data = jsonb_set(
      COALESCE(data, '{}'::jsonb),
      ARRAY['test_results', p_test_key],
      to_jsonb(p_result),
      true
    ),
    version = version + 1,
    updated_at = now()
  WHERE id = p_workpaper_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Update any field in workpaper data
CREATE FUNCTION update_workpaper_field(
  p_workpaper_id UUID,
  p_field_path TEXT[],
  p_value JSONB
)
RETURNS void AS $$
BEGIN
  UPDATE public.workpapers
  SET
    data = jsonb_set(
      COALESCE(data, '{}'::jsonb),
      p_field_path,
      p_value,
      true
    ),
    version = version + 1,
    updated_at = now()
  WHERE id = p_workpaper_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Merge new data into existing workpaper JSONB
CREATE FUNCTION merge_workpaper_data(
  p_workpaper_id UUID,
  p_new_data JSONB
)
RETURNS void AS $$
BEGIN
  UPDATE public.workpapers
  SET
    data = COALESCE(data, '{}'::jsonb) || p_new_data,
    version = version + 1,
    updated_at = now()
  WHERE id = p_workpaper_id;
END;
$$ LANGUAGE plpgsql;

-- Helper function to count JSONB object keys
CREATE FUNCTION jsonb_object_keys_count(p_jsonb JSONB)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM jsonb_object_keys(p_jsonb));
END;
$$ LANGUAGE plpgsql;

-- Function: Get workpaper completion percentage
CREATE FUNCTION get_workpaper_completion(p_workpaper_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_tests INTEGER;
  completed_tests INTEGER;
BEGIN
  SELECT
    COALESCE(jsonb_object_keys_count(data->'test_results'), 0),
    COALESCE(
      (SELECT COUNT(*)
       FROM jsonb_each_text(data->'test_results')
       WHERE value IN ('pass', 'fail')),
      0
    )
  INTO total_tests, completed_tests
  FROM public.workpapers
  WHERE id = p_workpaper_id;

  IF total_tests = 0 THEN
    RETURN 0;
  END IF;

  RETURN (completed_tests * 100 / total_tests);
END;
$$ LANGUAGE plpgsql;

-- =============================================

-- Denetim adimi (audit_steps) ornekleri seed.sql dosyasina tasindi.
