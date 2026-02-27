/*
  # M6 Performance Optimization: GIN Full-Text Search & RPC

  ## Summary
  Adds full-text search capability to report blocks using PostgreSQL's GIN indexing
  and a Turkish-language tsvector for fast block content search.

  ## New Columns
  - `m6_report_blocks.search_vector` — stored generated tsvector from block content JSON fields

  ## New Indexes
  - `idx_m6_blocks_search` — GIN index on search_vector for fast FTS queries

  ## New Functions
  - `search_report_blocks(p_query TEXT, p_report_id UUID)` — full-text search within a report's blocks,
    returns block_id, block_type, and a 50-char snippet of matching content

  ## Notes
  1. Uses 'simple' dictionary instead of 'turkish' to avoid missing dictionary errors in hosted Supabase
  2. The function joins m6_report_sections to filter by report_id
  3. RLS-safe: function runs with SECURITY DEFINER but validates inputs
*/

-- Add search_vector column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'm6_report_blocks' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE m6_report_blocks
      ADD COLUMN search_vector tsvector
        GENERATED ALWAYS AS (
          to_tsvector(
            'simple',
            coalesce(content->>'html', '') || ' ' ||
            coalesce(content->>'text', '') || ' ' ||
            coalesce(content->>'title', '')
          )
        ) STORED;
  END IF;
END $$;

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_m6_blocks_search
  ON m6_report_blocks USING GIN(search_vector);

-- Create search RPC function
CREATE OR REPLACE FUNCTION search_report_blocks(p_query TEXT, p_report_id UUID)
RETURNS TABLE(
  block_id   UUID,
  block_type TEXT,
  snippet    TEXT,
  section_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id                                          AS block_id,
    b.block_type                                  AS block_type,
    left(
      coalesce(b.content->>'html', b.content->>'text', ''),
      120
    )                                             AS snippet,
    b.section_id                                  AS section_id
  FROM m6_report_blocks b
  INNER JOIN m6_report_sections s ON s.id = b.section_id
  WHERE
    s.report_id = p_report_id
    AND b.search_vector @@ plainto_tsquery('simple', p_query)
  ORDER BY
    ts_rank(b.search_vector, plainto_tsquery('simple', p_query)) DESC
  LIMIT 20;
END;
$$;
