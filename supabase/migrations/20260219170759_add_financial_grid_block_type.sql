/*
  # Add financial_grid to m6_report_blocks block_type constraint

  ## Problem
  The `block_type` column on `m6_report_blocks` has a CHECK constraint that does not
  include `financial_grid`. When the front-end palette attempts to upsert a
  `financial_grid` block the database raises a constraint violation, which causes
  the optimistic store update to be rolled back and the block disappears from the UI.

  ## Changes
  1. Drop the existing CHECK constraint on `block_type`.
  2. Re-add it with `financial_grid` included in the allowed values list.

  No data loss — only the constraint definition changes.
*/

ALTER TABLE m6_report_blocks
  DROP CONSTRAINT IF EXISTS m6_report_blocks_block_type_check;

ALTER TABLE m6_report_blocks
  ADD CONSTRAINT m6_report_blocks_block_type_check
  CHECK (block_type IN (
    'heading',
    'paragraph',
    'finding_ref',
    'live_chart',
    'dynamic_metric',
    'ai_summary',
    'financial_grid'
  ));
