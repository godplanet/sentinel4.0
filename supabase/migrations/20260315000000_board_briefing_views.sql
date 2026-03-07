CREATE OR REPLACE VIEW view_executive_dashboard AS
SELECT 
  e.title AS engagement_title,
  f.id AS finding_id,
  f.title AS finding_title,
  f.severity AS finding_severity,
  EXTRACT(YEAR FROM f.created_at)::integer AS finding_year,
  COALESCE(TO_CHAR(f.created_at, 'YYYY-MM-DD'), '') AS agreement_date,
  COALESCE(f.details->>'department', 'Genel Müdürlük') AS auditee_department,
  
  a.id AS action_id,
  a.title AS action_title,
  a.description AS action_description,
  TO_CHAR(a.current_due_date, 'YYYY-MM-DD') AS action_target_date,
  TO_CHAR(a.original_due_date, 'YYYY-MM-DD') AS original_due_date,
  
  COALESCE(GREATEST(0, (a.current_due_date - a.original_due_date) / 30), 0)::integer AS extension_count,
  
  a.status AS action_status,
  COALESCE(a.assignee_unit_name, 'Bilinmiyor') AS responsible_person,
  
  GREATEST(0, EXTRACT(DAY FROM NOW() - f.created_at))::integer AS finding_age_days,
  
  CASE 
    WHEN a.status IN ('CLOSED', 'WAIVED') THEN 0
    ELSE GREATEST(0, EXTRACT(DAY FROM NOW() - a.current_due_date))::integer 
  END AS days_overdue,
  
  COALESCE(f.details->>'regulatory_status', 'BDDK Uyumlu') AS regulatory_status,
  
  CASE 
    WHEN a.status IN ('CLOSED', 'WAIVED') THEN 'GREEN'
    WHEN a.current_due_date < NOW() THEN 'RED'
    WHEN a.current_due_date < NOW() + INTERVAL '15 days' THEN 'ORANGE'
    ELSE 'YELLOW'
  END AS alert_level

FROM audit_findings f
JOIN audit_engagements e ON e.id = f.engagement_id
LEFT JOIN actions a ON a.finding_id = f.id;

CREATE OR REPLACE VIEW view_bddk_compliance_summary AS
SELECT 
  COUNT(f.id)::integer AS total_findings,
  COUNT(f.id) FILTER (WHERE f.status = 'REMEDIATED' OR a.status = 'CLOSED')::integer AS closed_findings,
  COUNT(f.id) FILTER (WHERE a.current_due_date < NOW() AND a.status NOT IN ('CLOSED', 'WAIVED'))::integer AS overdue_findings,
  COUNT(f.id) FILTER (WHERE f.severity = 'CRITICAL')::integer AS critical_findings,
  COUNT(f.id) FILTER (WHERE a.current_due_date < NOW() - INTERVAL '1 year' AND a.status NOT IN ('CLOSED', 'WAIVED'))::integer AS overdue_1year_plus,
  COALESCE(AVG(EXTRACT(DAY FROM a.closed_at - f.created_at)) FILTER (WHERE a.status = 'CLOSED'), 0)::integer AS avg_resolution_days,
  COALESCE(SUM(GREATEST(0, (a.current_due_date - a.original_due_date) / 30)), 0)::integer AS total_extensions
FROM audit_findings f
LEFT JOIN actions a ON a.finding_id = f.id;
