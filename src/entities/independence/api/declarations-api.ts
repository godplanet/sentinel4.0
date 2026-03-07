import { supabase } from '@/shared/api/supabase';

export interface IndependenceDeclaration {
  id: string;
  engagement_id: string;
  auditor_id: string;
  status: 'pending' | 'signed' | 'conflicted';
  signed_at: string | null;
  ip_address: string | null;
  declaration_text: string | null;
  created_at: string;
  updated_at: string;
}

export const fetchEngagementGateStatus = async (engagementId: string, auditorId: string) => {
  const { data, error } = await supabase
    .from('independence_declarations')
    .select('status')
    .eq('engagement_id', engagementId)
    .eq('auditor_id', auditorId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return {
    gate_status: data?.status === 'signed' ? 'SIGNED' : (data?.status === 'pending' ? 'PENDING' : 'MISSING')
  };
};

export const declarationsApi = {
  async getDeclaration(engagementId: string, auditorId: string): Promise<IndependenceDeclaration | null> {
    const { data, error } = await supabase
      .from('independence_declarations')
      .select('*')
      .eq('engagement_id', engagementId)
      .eq('auditor_id', auditorId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('getDeclaration error', error);
      throw error;
    }
    
    return data;
  },

  async signDeclaration(engagementId: string, auditorId: string, declarationText: string, ipAddress: string): Promise<IndependenceDeclaration> {
    const { data, error } = await supabase
      .from('independence_declarations')
      .upsert({
        engagement_id: engagementId,
        auditor_id: auditorId,
        status: 'signed',
        signed_at: new Date().toISOString(),
        ip_address: ipAddress,
        declaration_text: declarationText,
      }, {
        onConflict: 'engagement_id,auditor_id'
      })
      .select()
      .single();

    if (error) {
       throw error;
    }

    return data;
  }
};
