import { supabase } from '@/shared/api/supabase';

export interface VendorRow {
  name: string;
  risk_tier: string;
  criticality_score: number;
  status: string;
}

export interface AssessmentRow {
  status: string;
  risk_score: number | null;
  vendor_id: string;
}

export interface VendorEcosystemData {
  vendors: VendorRow[];
  assessments: AssessmentRow[];
}

export async function fetchVendorEcosystemData(): Promise<VendorEcosystemData> {
  const [vRes, aRes] = await Promise.all([
    supabase.from('tprm_vendors').select('name, risk_tier, criticality_score, status'),
    supabase.from('tprm_assessments').select('status, risk_score, vendor_id'),
  ]);

  return {
    vendors: (vRes.data || []) as VendorRow[],
    assessments: (aRes.data || []) as AssessmentRow[],
  };
}
