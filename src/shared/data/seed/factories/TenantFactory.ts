import { supabase } from '@/shared/api/supabase';

export class TenantFactory {
  static async create() {
    const tenant = {
      name: 'Sentinel Bank A.Ş.',
      slug: 'sentinel-bank',
      settings: {
        language: 'tr',
        timezone: 'Europe/Istanbul',
        currency: 'TRY',
        fiscal_year_start: '2026-01-01'
      }
    };

    const { data, error } = await supabase
      .from('tenants')
      .insert(tenant)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
