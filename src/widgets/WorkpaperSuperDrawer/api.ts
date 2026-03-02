import { supabase } from '@/shared/api/supabase';

export interface LibraryCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
}

export interface LibraryRisk {
  id: string;
  category_id: string;
  risk_title: string;
  control_title: string;
  standard_test_steps: string[];
  risk_level: string;
  framework_ref: string;
}

export interface ProcedureLibraryData {
  categories: LibraryCategory[];
  risks: LibraryRisk[];
}

export async function fetchProcedureLibrary(): Promise<ProcedureLibraryData> {
  const [catRes, riskRes] = await Promise.all([
    supabase.from('rkm_library_categories').select('*').order('sort_order'),
    supabase.from('rkm_library_risks').select('*').order('sort_order'),
  ]);

  return {
    categories: (catRes.data || []) as LibraryCategory[],
    risks: (riskRes.data || []) as LibraryRisk[],
  };
}
