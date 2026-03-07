-- Drop the old table that has an incompatible schema
DROP TABLE IF EXISTS pbc_requests CASCADE;

-- Create the new pbc_requests table matching the FSD Interface
CREATE TABLE pbc_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid REFERENCES audit_engagements(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  requested_from text NOT NULL,
  assigned_to text,
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'SUBMITTED', 'ACCEPTED', 'REJECTED')),
  priority text DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexing
CREATE INDEX idx_pbc_req_engagement ON pbc_requests(engagement_id);
CREATE INDEX idx_pbc_req_status ON pbc_requests(status);

-- RLS
ALTER TABLE pbc_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON pbc_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON pbc_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON pbc_requests FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete access for authenticated users" ON pbc_requests FOR DELETE TO authenticated USING (true);

-- Create pbc_evidence table for tracking uploaded files
CREATE TABLE pbc_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pbc_request_id uuid REFERENCES pbc_requests(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size_bytes bigint,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at timestamptz DEFAULT now()
);

-- Indexing
CREATE INDEX idx_pbc_evidence_request ON pbc_evidence(pbc_request_id);

-- RLS
ALTER TABLE pbc_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON pbc_evidence FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON pbc_evidence FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON pbc_evidence FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete access for authenticated users" ON pbc_evidence FOR DELETE TO authenticated USING (true);
