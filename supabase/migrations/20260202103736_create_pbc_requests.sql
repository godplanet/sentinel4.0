/*
  # PBC (Provided By Client) Requests Management

  **OVERVIEW:**
  Creates table for managing document requests from audited units throughout
  their lifecycle, from initial request through approval.

  ## New Table

  ### `pbc_requests` - Document Request Tracking
    - `id` (uuid, primary key)
    - `engagement_id` (uuid, foreign key) - Links to audit_engagements
    - `subject` (text) - Request title
    - `description` (text) - Detailed request description
    - `responsible_unit` (text) - Unit responsible for providing documents
    - `due_date` (date) - Deadline for submission
    - `status` (text) - Bekliyor | İnceleniyor | Tamamlandı | İade/Eksik
    - `uploaded_at` (timestamptz) - When document was uploaded
    - `reviewed_at` (timestamptz) - When auditor reviewed
    - `notes` (text) - Additional comments
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Security
    - Row Level Security enabled
    - Authenticated users can perform all operations

  ## Status Workflow
    1. Bekliyor (Pending) - Initial state
    2. İnceleniyor (Under Review) - Document uploaded, being reviewed
    3. Tamamlandı (Completed) - Approved
    4. İade/Eksik (Rejected/Incomplete) - Needs revision
*/

CREATE TABLE IF NOT EXISTS pbc_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid REFERENCES audit_engagements(id) ON DELETE CASCADE,
  subject text NOT NULL,
  description text DEFAULT '',
  responsible_unit text DEFAULT '',
  due_date date,
  status text DEFAULT 'Bekliyor',
  uploaded_at timestamptz,
  reviewed_at timestamptz,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for engagement queries
CREATE INDEX IF NOT EXISTS idx_pbc_requests_engagement ON pbc_requests(engagement_id);
CREATE INDEX IF NOT EXISTS idx_pbc_requests_status ON pbc_requests(status);
CREATE INDEX IF NOT EXISTS idx_pbc_requests_due_date ON pbc_requests(due_date);

-- Enable Row Level Security
ALTER TABLE pbc_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view PBC requests"
  ON pbc_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create PBC requests"
  ON pbc_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update PBC requests"
  ON pbc_requests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete PBC requests"
  ON pbc_requests FOR DELETE
  TO authenticated
  USING (true);