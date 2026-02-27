/*
  # Sentinel Probes - Continuous Monitoring & Automation Module

  1. New Tables
    - `probes`
      - `id` (uuid, primary key)
      - `title` (text) - Probe name (e.g., 'Haftasonu EFT Kontrolü')
      - `query_type` (text) - Type: SQL, API, WEBHOOK
      - `query_payload` (text) - SQL query or API endpoint
      - `schedule_cron` (text) - Cron expression for scheduling
      - `risk_threshold` (integer) - Threshold for anomaly detection
      - `target_control_id` (uuid) - Link to library controls
      - `is_active` (boolean) - Active status
      - `last_run_at` (timestamptz) - Last execution timestamp
      - `last_result_status` (text) - PASS or FAIL
      - `created_by` (uuid) - Creator user
      - `tenant_id` (uuid) - Multi-tenant isolation
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `probe_logs`
      - `id` (uuid, primary key)
      - `probe_id` (uuid) - Reference to probe
      - `execution_time` (timestamptz) - When executed
      - `result_data` (jsonb) - Raw result data
      - `is_anomaly` (boolean) - Anomaly detected flag
      - `anomaly_count` (integer) - Number of anomalies found
      - `execution_duration_ms` (integer) - Execution time in milliseconds
      - `tenant_id` (uuid) - Multi-tenant isolation
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage probes
    - Add policies for viewing probe logs
*/

-- Create probes table
CREATE TABLE IF NOT EXISTS public.probes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    query_type TEXT NOT NULL CHECK (query_type IN ('SQL', 'API', 'WEBHOOK')),
    query_payload TEXT NOT NULL,
    schedule_cron TEXT,
    risk_threshold INTEGER DEFAULT 0,
    target_control_id UUID,
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMPTZ,
    last_result_status TEXT CHECK (last_result_status IN ('PASS', 'FAIL', 'ERROR', 'RUNNING')),
    created_by UUID,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create probe_logs table
CREATE TABLE IF NOT EXISTS public.probe_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    probe_id UUID NOT NULL REFERENCES public.probes(id) ON DELETE CASCADE,
    execution_time TIMESTAMPTZ DEFAULT NOW(),
    result_data JSONB,
    is_anomaly BOOLEAN DEFAULT false,
    anomaly_count INTEGER DEFAULT 0,
    execution_duration_ms INTEGER,
    error_message TEXT,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_probes_tenant_id ON public.probes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_probes_is_active ON public.probes(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_probes_last_run ON public.probes(last_run_at);
CREATE INDEX IF NOT EXISTS idx_probe_logs_probe_id ON public.probe_logs(probe_id);
CREATE INDEX IF NOT EXISTS idx_probe_logs_execution_time ON public.probe_logs(execution_time DESC);
CREATE INDEX IF NOT EXISTS idx_probe_logs_anomaly ON public.probe_logs(is_anomaly) WHERE is_anomaly = true;

-- Enable RLS
ALTER TABLE public.probes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.probe_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for probes
CREATE POLICY "Users can view probes in their tenant"
  ON public.probes FOR SELECT
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000000'::UUID);

CREATE POLICY "Users can create probes in their tenant"
  ON public.probes FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000000'::UUID);

CREATE POLICY "Users can update probes in their tenant"
  ON public.probes FOR UPDATE
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000000'::UUID)
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000000'::UUID);

CREATE POLICY "Users can delete probes in their tenant"
  ON public.probes FOR DELETE
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000000'::UUID);

-- RLS Policies for probe_logs
CREATE POLICY "Users can view probe logs in their tenant"
  ON public.probe_logs FOR SELECT
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000000'::UUID);

CREATE POLICY "Users can create probe logs in their tenant"
  ON public.probe_logs FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000000'::UUID);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_probe_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_probe_timestamp ON public.probes;
CREATE TRIGGER trigger_update_probe_timestamp
    BEFORE UPDATE ON public.probes
    FOR EACH ROW
    EXECUTE FUNCTION update_probe_updated_at();

-- Function to calculate anomaly statistics
CREATE OR REPLACE FUNCTION get_probe_anomaly_stats(probe_uuid UUID, days_back INTEGER DEFAULT 7)
RETURNS TABLE (
    total_runs BIGINT,
    anomaly_runs BIGINT,
    anomaly_rate NUMERIC,
    avg_execution_ms NUMERIC,
    last_anomaly_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_runs,
        COUNT(*) FILTER (WHERE is_anomaly = true)::BIGINT as anomaly_runs,
        ROUND((COUNT(*) FILTER (WHERE is_anomaly = true)::NUMERIC / NULLIF(COUNT(*), 0) * 100), 2) as anomaly_rate,
        ROUND(AVG(execution_duration_ms)::NUMERIC, 2) as avg_execution_ms,
        MAX(execution_time) FILTER (WHERE is_anomaly = true) as last_anomaly_at
    FROM public.probe_logs
    WHERE probe_id = probe_uuid
      AND execution_time >= NOW() - (days_back || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
