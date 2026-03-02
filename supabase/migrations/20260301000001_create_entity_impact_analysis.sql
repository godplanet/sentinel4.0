/*
  # Kaskad Yıkım Kalkanı — Entity Etki Analizi RPC

  Bir audit_entities kaydı silinmeden önce kademeli etki sayılarını döndürür:
  - Descendant (alt düğüm) sayısı
  - Bağlı rkm_risks sayısı
  - Açık audit_findings sayısı

  ltree operatörü "@>" ile tüm alt düğümler tek sorguda bulunur.
*/

CREATE OR REPLACE FUNCTION get_entity_impact_analysis(p_entity_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_path         ltree;
  v_descendants  int;
  v_rkm_count    int;
  v_findings     int;
BEGIN
  SELECT path INTO v_path FROM audit_entities WHERE id = p_entity_id;
  IF v_path IS NULL THEN
    RETURN jsonb_build_object('error', 'Entity not found');
  END IF;

  -- Alt düğüm sayısı (kendisi hariç)
  SELECT COUNT(*) INTO v_descendants
  FROM audit_entities
  WHERE path <@ v_path AND id <> p_entity_id;

  -- Bu entity veya altındaki entity id'lerine bağlı rkm_risks sayısı
  SELECT COUNT(*) INTO v_rkm_count
  FROM rkm_risks rr
  JOIN rkm_processes rp ON rp.id = rr.process_id
  JOIN audit_entities ae ON ae.path <@ v_path
  WHERE rp.entity_id = ae.id
     OR rr.process_id IN (
          SELECT id FROM rkm_processes
          WHERE entity_id IN (SELECT id FROM audit_entities WHERE path <@ v_path)
        );

  -- Açık audit_findings sayısı (bu entity veya descendant'larındaki engagement'lara bağlı)
  SELECT COUNT(*) INTO v_findings
  FROM audit_findings af
  JOIN audit_engagements ae_eng ON ae_eng.id = af.engagement_id
  JOIN audit_entities ae ON ae.id = ae_eng.entity_id
  WHERE ae.path <@ v_path
    AND af.status NOT IN ('CLOSED', 'REMEDIATED', 'ARCHIVED');

  RETURN jsonb_build_object(
    'entity_id',        p_entity_id,
    'entity_path',      v_path::text,
    'descendant_count', v_descendants,
    'rkm_risk_count',   v_rkm_count,
    'open_finding_count', v_findings
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_entity_impact_analysis(uuid) TO anon, authenticated;
