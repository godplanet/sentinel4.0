/*
  # Transactional Outbox Pattern for Event-Driven Architecture

  ## Overview
  Implements the constitutional requirement for event-driven architecture.
  Critical state changes (e.g., Finding Closed, Risk Score Spike, Grade Change)
  are published as events to enable:
  - AI proactive monitoring
  - Cross-module notifications (Risk Engine, QAIP)
  - Audit trail of business events

  ## Key Features
  1. **Transactional Safety**: Events published in same transaction as data change
  2. **Guaranteed Delivery**: Events stored durably before external notification
  3. **Event Replay**: Can reprocess events for analytics or debugging
  4. **AI Integration**: Sentinel Prime monitors outbox for proactive alerts

  ## Changes
  1. New Tables
     - `event_outbox`: Stores all business events for processing

  2. Event Types
     - FINDING_CREATED, FINDING_UPDATED, FINDING_CLOSED
     - GRADE_CHANGED, GRADE_DEGRADED
     - RISK_SCORE_SPIKE
     - ENGAGEMENT_STARTED, ENGAGEMENT_COMPLETED
     - RKM_SNAPSHOT_CREATED

  3. Triggers
     - Auto-publish events when critical state changes occur

  4. Helper Functions
     - `publish_event()`: Generic event publishing function
     - `get_unprocessed_events()`: Retrieves events for AI/worker processing
*/

-- =====================================================
-- 1. CREATE EVENT_OUTBOX TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS event_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processed_by text,
  retry_count integer DEFAULT 0,
  error_message text,

  CONSTRAINT valid_event_type CHECK (event_type IN (
    'FINDING_CREATED',
    'FINDING_UPDATED',
    'FINDING_CLOSED',
    'FINDING_REMEDIATED',
    'GRADE_CHANGED',
    'GRADE_DEGRADED',
    'RISK_SCORE_SPIKE',
    'ENGAGEMENT_STARTED',
    'ENGAGEMENT_COMPLETED',
    'RKM_SNAPSHOT_CREATED',
    'EVIDENCE_UPLOADED',
    'WORKPAPER_FINALIZED',
    'CRITICAL_ISSUE_DETECTED'
  )),
  CONSTRAINT valid_aggregate_type CHECK (aggregate_type IN (
    'audit_finding',
    'audit_engagement',
    'rkm_risk',
    'workpaper',
    'evidence',
    'engagement_scope'
  ))
);

-- Indexes for performance
CREATE INDEX idx_event_outbox_tenant ON event_outbox(tenant_id);
CREATE INDEX idx_event_outbox_event_type ON event_outbox(event_type);
CREATE INDEX idx_event_outbox_aggregate ON event_outbox(aggregate_type, aggregate_id);
CREATE INDEX idx_event_outbox_processed ON event_outbox(processed_at) WHERE processed_at IS NULL;
CREATE INDEX idx_event_outbox_created_at ON event_outbox(created_at);
CREATE INDEX idx_event_outbox_payload ON event_outbox USING gin (payload);

-- =====================================================
-- 2. HELPER FUNCTION: PUBLISH EVENT
-- =====================================================

CREATE OR REPLACE FUNCTION publish_event(
  p_tenant_id uuid,
  p_event_type text,
  p_aggregate_type text,
  p_aggregate_id uuid,
  p_payload jsonb DEFAULT '{}'::jsonb,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid AS $$
DECLARE
  v_event_id uuid;
BEGIN
  INSERT INTO event_outbox (
    tenant_id,
    event_type,
    aggregate_type,
    aggregate_id,
    payload,
    metadata
  ) VALUES (
    p_tenant_id,
    p_event_type,
    p_aggregate_type,
    p_aggregate_id,
    p_payload,
    p_metadata
  )
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. HELPER FUNCTION: GET UNPROCESSED EVENTS
-- =====================================================

CREATE OR REPLACE FUNCTION get_unprocessed_events(
  p_limit integer DEFAULT 100,
  p_event_types text[] DEFAULT NULL
)
RETURNS TABLE (
  event_id uuid,
  tenant_id uuid,
  event_type text,
  aggregate_type text,
  aggregate_id uuid,
  payload jsonb,
  metadata jsonb,
  created_at timestamptz,
  retry_count integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    eo.id AS event_id,
    eo.tenant_id,
    eo.event_type,
    eo.aggregate_type,
    eo.aggregate_id,
    eo.payload,
    eo.metadata,
    eo.created_at,
    eo.retry_count
  FROM event_outbox eo
  WHERE eo.processed_at IS NULL
    AND (p_event_types IS NULL OR eo.event_type = ANY(p_event_types))
    AND eo.retry_count < 5
  ORDER BY eo.created_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. HELPER FUNCTION: MARK EVENT PROCESSED
-- =====================================================

CREATE OR REPLACE FUNCTION mark_event_processed(
  p_event_id uuid,
  p_processor_name text
)
RETURNS void AS $$
BEGIN
  UPDATE event_outbox
  SET 
    processed_at = now(),
    processed_by = p_processor_name
  WHERE id = p_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. AUTO-PUBLISH EVENTS: FINDINGS
-- =====================================================

CREATE OR REPLACE FUNCTION publish_finding_events()
RETURNS TRIGGER AS $$
DECLARE
  v_event_type text;
  v_tenant_id uuid;
BEGIN
  -- Get tenant_id from engagement
  SELECT ae.tenant_id INTO v_tenant_id
  FROM audit_engagements ae
  WHERE ae.id = COALESCE(NEW.engagement_id, OLD.engagement_id);

  -- Determine event type
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'FINDING_CREATED';
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'REMEDIATED' AND OLD.status != 'REMEDIATED' THEN
      v_event_type := 'FINDING_REMEDIATED';
    ELSIF NEW.status = 'FINAL' AND OLD.status != 'FINAL' THEN
      v_event_type := 'FINDING_CLOSED';
    ELSE
      v_event_type := 'FINDING_UPDATED';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    v_event_type := 'FINDING_UPDATED';
  END IF;

  -- Publish event
  PERFORM publish_event(
    v_tenant_id,
    v_event_type,
    'audit_finding',
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'finding_id', COALESCE(NEW.id, OLD.id),
      'engagement_id', COALESCE(NEW.engagement_id, OLD.engagement_id),
      'severity', COALESCE(NEW.severity, OLD.severity),
      'status', COALESCE(NEW.status, OLD.status),
      'title', COALESCE(NEW.title, OLD.title)
    ),
    jsonb_build_object(
      'trigger_operation', TG_OP,
      'triggered_at', now()
    )
  );

  -- Alert if CRITICAL severity
  IF COALESCE(NEW.severity, OLD.severity) = 'CRITICAL' THEN
    PERFORM publish_event(
      v_tenant_id,
      'CRITICAL_ISSUE_DETECTED',
      'audit_finding',
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'finding_id', COALESCE(NEW.id, OLD.id),
        'engagement_id', COALESCE(NEW.engagement_id, OLD.engagement_id),
        'severity', 'CRITICAL',
        'title', COALESCE(NEW.title, OLD.title),
        'alert_message', 'CRITICAL finding detected - immediate attention required'
      )
    );
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_publish_finding_events ON audit_findings;
CREATE TRIGGER trg_publish_finding_events
AFTER INSERT OR UPDATE OR DELETE ON audit_findings
FOR EACH ROW
EXECUTE FUNCTION publish_finding_events();

-- =====================================================
-- 6. AUTO-PUBLISH EVENTS: ENGAGEMENTS
-- =====================================================

CREATE OR REPLACE FUNCTION publish_engagement_events()
RETURNS TRIGGER AS $$
DECLARE
  v_event_type text;
  v_grade_degraded boolean := false;
BEGIN
  -- Determine event type
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'IN_PROGRESS' THEN
      v_event_type := 'ENGAGEMENT_STARTED';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN
      v_event_type := 'ENGAGEMENT_COMPLETED';
    ELSIF NEW.calculated_grade IS DISTINCT FROM OLD.calculated_grade THEN
      v_event_type := 'GRADE_CHANGED';
      -- Check if grade degraded
      IF NEW.calculated_grade < OLD.calculated_grade THEN
        v_grade_degraded := true;
      END IF;
    END IF;
  END IF;

  -- Publish event if applicable
  IF v_event_type IS NOT NULL THEN
    PERFORM publish_event(
      NEW.tenant_id,
      v_event_type,
      'audit_engagement',
      NEW.id,
      jsonb_build_object(
        'engagement_id', NEW.id,
        'title', NEW.title,
        'status', NEW.status,
        'calculated_grade', NEW.calculated_grade,
        'letter_grade', NEW.letter_grade,
        'grade_limited_by', NEW.grade_limited_by,
        'previous_grade', OLD.calculated_grade
      )
    );

    -- Additional alert if grade degraded
    IF v_grade_degraded THEN
      PERFORM publish_event(
        NEW.tenant_id,
        'GRADE_DEGRADED',
        'audit_engagement',
        NEW.id,
        jsonb_build_object(
          'engagement_id', NEW.id,
          'title', NEW.title,
          'old_grade', OLD.calculated_grade,
          'new_grade', NEW.calculated_grade,
          'degradation', OLD.calculated_grade - NEW.calculated_grade,
          'alert_message', 'Audit grade has decreased - review required'
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_publish_engagement_events ON audit_engagements;
CREATE TRIGGER trg_publish_engagement_events
AFTER INSERT OR UPDATE ON audit_engagements
FOR EACH ROW
EXECUTE FUNCTION publish_engagement_events();

-- =====================================================
-- 7. AUTO-PUBLISH EVENTS: RKM SNAPSHOTS
-- =====================================================

CREATE OR REPLACE FUNCTION publish_snapshot_events()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM publish_event(
    NEW.tenant_id,
    'RKM_SNAPSHOT_CREATED',
    'engagement_scope',
    NEW.id,
    jsonb_build_object(
      'snapshot_id', NEW.id,
      'engagement_id', NEW.engagement_id,
      'rkm_risk_id', NEW.rkm_risk_id,
      'frozen_at', NEW.frozen_at
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_publish_snapshot_events ON engagement_scopes;
CREATE TRIGGER trg_publish_snapshot_events
AFTER INSERT ON engagement_scopes
FOR EACH ROW
EXECUTE FUNCTION publish_snapshot_events();

-- =====================================================
-- 8. ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE event_outbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events in tenant"
  ON event_outbox FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert events"
  ON event_outbox FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can update events"
  ON event_outbox FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- 9. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE event_outbox IS
  'Transactional outbox for event-driven architecture. Stores business events for AI monitoring and cross-module notifications.';

COMMENT ON COLUMN event_outbox.event_type IS
  'Type of business event (e.g., FINDING_CLOSED, GRADE_DEGRADED, RISK_SCORE_SPIKE)';

COMMENT ON COLUMN event_outbox.payload IS
  'Event data in JSONB format containing all relevant information for event consumers';

COMMENT ON COLUMN event_outbox.processed_at IS
  'Timestamp when event was processed by AI or worker. NULL means pending processing.';

COMMENT ON FUNCTION publish_event IS
  'Generic function to publish business events to the outbox. Used by triggers and application code.';

COMMENT ON FUNCTION get_unprocessed_events IS
  'Retrieves unprocessed events for AI Sentinel Prime monitoring or background workers.';
