/*
  # Core Risk Management & Audit Universe Refactor

  1. Schema Changes
    - Extend `entity_type` enum with BRANCH, DEPARTMENT, HEADQUARTERS
    - Add `parent_id` and `status` columns to `audit_entities`
    - Create `risk_definitions` table (risk library with category, impact, likelihood)
    - Create `risk_assessments` table (Cryo-Chamber: immutable heatmap data)

  2. New Tables
    - `risk_definitions`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid)
      - `title` (varchar 200) - e.g. "Kredi Teminat Eksikligi"
      - `category` (varchar 100) - e.g. "Credit Risk", "IT Risk"
      - `description` (text)
      - `base_impact` (int 1-5)
      - `base_likelihood` (int 1-5)
      - `created_at`, `updated_at` (timestamptz)

    - `risk_assessments`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid)
      - `entity_id` (uuid FK -> audit_entities)
      - `risk_id` (uuid FK -> risk_definitions)
      - `impact` (int 1-5)
      - `likelihood` (int 1-5)
      - `inherent_risk_score` (int, generated as impact * likelihood)
      - `control_effectiveness` (numeric 0-1)
      - `residual_score` (numeric, generated)
      - `justification` (text)
      - `assessed_by` (uuid)
      - `assessed_at` (timestamptz)
      - `version_hash` (varchar 64, SHA-256)

  3. Seed Data
    - 12 audit entities (Turkish bank structure with branches/departments)
    - 8 risk definitions (IT, Operational, Credit, Compliance, Market, Third-Party, Fraud, KVKK)
    - 20+ risk assessments populating a realistic 5x5 heatmap

  4. Security
    - RLS enabled on both new tables
    - Dev-mode permissive policies for anon/authenticated access
*/

-- 1. Extend entity_type enum
ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'BRANCH';
ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'DEPARTMENT';
ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'HEADQUARTERS';
