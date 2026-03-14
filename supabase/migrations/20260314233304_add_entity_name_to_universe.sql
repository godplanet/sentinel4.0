-- Add backward compatible aliases to audit_universe view
DROP VIEW IF EXISTS audit_universe CASCADE;

CREATE OR REPLACE VIEW audit_universe AS
SELECT
  ae.id,
  ae.name,
  ae.name AS entity_name, -- Alias used by some legacy modules
  ae.path,
  ae.ltree_path,
  ae.type,
  ae.status,
  ae.tenant_id,
  ae.owner_id,
  ae.parent_id,
  ae.risk_score,          -- Expose raw risk_score column
  COALESCE(ae.risk_score, 0) AS inherent_risk,
  ae.metadata,
  ae.created_at,
  ae.updated_at
FROM audit_entities ae
WHERE ae.status IS DISTINCT FROM 'ARCHIVED'
ORDER BY ae.path;

COMMENT ON VIEW audit_universe IS 
'Enriched Audit Universe view with entity_name and risk_score aliases for backward compatibility.';
