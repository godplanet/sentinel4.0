/*
  # Modules 11, 12, 13: Incident Reporting, Policy Management, and Risk Quantification

  1. New Tables
    - `incidents` (Sentinel Voice - Whistleblowing)
      - `id` (uuid, primary key)
      - `title` (text) - Incident title
      - `description` (text) - Detailed description
      - `category` (text) - Fraud, HR, IT, Ethics
      - `reporter_id` (uuid) - NULL if anonymous
      - `is_anonymous` (boolean) - Anonymous reporting flag
      - `status` (text) - NEW, INVESTIGATING, CLOSED
      - `tenant_id` (uuid) - Multi-tenant isolation
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `policies` (Policy Guardian - Policy Management)
      - `id` (uuid, primary key)
      - `title` (text) - Policy title
      - `content_url` (text) - PDF or document link
      - `version` (text) - Version number
      - `is_active` (boolean) - Active status
      - `tenant_id` (uuid) - Multi-tenant isolation
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `policy_attestations` (Policy Acknowledgements)
      - `id` (uuid, primary key)
      - `policy_id` (uuid) - Reference to policy
      - `user_id` (uuid) - Reference to user
      - `attested_at` (timestamptz) - Acknowledgement timestamp
      - `tenant_id` (uuid) - Multi-tenant isolation

    - `quant_scenarios` (Risk Quantification Scenarios)
      - `id` (uuid, primary key)
      - `title` (text) - Scenario title
      - `min_loss` (decimal) - Minimum loss amount
      - `likely_loss` (decimal) - Most likely loss
      - `max_loss` (decimal) - Maximum loss
      - `probability` (integer) - Probability percentage
      - `simulated_var_95` (decimal) - Value at Risk (95%)
      - `tenant_id` (uuid) - Multi-tenant isolation
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Special public access for incident reporting (anonymous)

  3. Seed Data
    - Sample incidents
    - Sample policies
    - Sample risk scenarios
    - Sample audit data
*/

-- Create incidents table (Sentinel Voice)
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT CHECK (category IN ('Dolandırıcılık', 'Etik', 'IT', 'İK', 'Fraud', 'HR', 'Ethics')),
    reporter_id UUID,
    is_anonymous BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'INVESTIGATING', 'CLOSED', 'RESOLVED')),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create policies table (Policy Guardian)
CREATE TABLE IF NOT EXISTS public.policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content_url TEXT,
    version TEXT,
    is_active BOOLEAN DEFAULT true,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create policy attestations table
CREATE TABLE IF NOT EXISTS public.policy_attestations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    attested_at TIMESTAMPTZ DEFAULT NOW(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::UUID
);

-- Create quant scenarios table (Risk Quant)
CREATE TABLE IF NOT EXISTS public.quant_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    min_loss DECIMAL(15,2),
    likely_loss DECIMAL(15,2),
    max_loss DECIMAL(15,2),
    probability INTEGER CHECK (probability >= 0 AND probability <= 100),
    simulated_var_95 DECIMAL(15,2),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_category ON public.incidents(category);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON public.incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_tenant_id ON public.incidents(tenant_id);

CREATE INDEX IF NOT EXISTS idx_policies_active ON public.policies(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_policies_tenant_id ON public.policies(tenant_id);

CREATE INDEX IF NOT EXISTS idx_policy_attestations_policy_id ON public.policy_attestations(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_attestations_user_id ON public.policy_attestations(user_id);

CREATE INDEX IF NOT EXISTS idx_quant_scenarios_tenant_id ON public.quant_scenarios(tenant_id);

-- Enable RLS
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_attestations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quant_scenarios ENABLE ROW LEVEL SECURITY;

-- RLS Policies for incidents (allow anonymous reporting)
CREATE POLICY "Anyone can create incidents"
  ON public.incidents FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view incidents in their tenant"
  ON public.incidents FOR SELECT
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000000'::UUID);

CREATE POLICY "Authenticated users can update incidents in their tenant"
  ON public.incidents FOR UPDATE
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000000'::UUID)
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000000'::UUID);

CREATE POLICY "Authenticated users can delete incidents in their tenant"
  ON public.incidents FOR DELETE
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000000'::UUID);

-- RLS Policies for policies
CREATE POLICY "Authenticated users can view policies in their tenant"
  ON public.policies FOR SELECT
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000000'::UUID);

CREATE POLICY "Authenticated users can manage policies in their tenant"
  ON public.policies FOR ALL
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000000'::UUID)
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000000'::UUID);

-- RLS Policies for policy attestations
CREATE POLICY "Users can view their own attestations"
  ON public.policy_attestations FOR SELECT
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000000'::UUID);

CREATE POLICY "Users can create attestations"
  ON public.policy_attestations FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000000'::UUID);

-- RLS Policies for quant scenarios
CREATE POLICY "Authenticated users can view quant scenarios in their tenant"
  ON public.quant_scenarios FOR SELECT
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000000'::UUID);

CREATE POLICY "Authenticated users can manage quant scenarios in their tenant"
  ON public.quant_scenarios FOR ALL
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000000'::UUID)
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000000'::UUID);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_incident_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_policy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_incident_timestamp ON public.incidents;
CREATE TRIGGER trigger_update_incident_timestamp
    BEFORE UPDATE ON public.incidents
    FOR EACH ROW
    EXECUTE FUNCTION update_incident_updated_at();

DROP TRIGGER IF EXISTS trigger_update_policy_timestamp ON public.policies;
CREATE TRIGGER trigger_update_policy_timestamp
    BEFORE UPDATE ON public.policies
    FOR EACH ROW
    EXECUTE FUNCTION update_policy_updated_at();

-- Demo verileri (incidents, policies, quant_scenarios) seed.sql dosyasina tasindi.
