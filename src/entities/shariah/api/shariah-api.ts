import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type { AAOIFIStandard } from '@/features/shariah/data/aaoifi_standards';

// ============================================================================
// TYPES
// ============================================================================
export interface FatwaLog {
  id: string;
  user_id: string;
  query: string;
  ruling: string;
  risk_level: string;
  tenant_id: string;
  created_at: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Veritabanından tüm AAOIFI Şeri Standartlarını çeker.
 */
async function fetchAAOIFIStandards(): Promise<AAOIFIStandard[]> {
  const { data, error } = await supabase
    .from('shariah_rulings')
    .select('*')
    .order('standard_no', { ascending: true });

  if (error) {
    console.error('Şeri Standartlar çekilirken hata oluştu:', error);
    throw new Error(error.message);
  }

  // Güvenli dönüş (Defensive programming - beyaz ekran koruması)
  return (data || []) as AAOIFIStandard[];
}

/**
 * Kullanıcının sorduğu soruyu ve GPT'nin verdiği fetvayı loglar.
 */
async function logFatwaQuery(logData: {
  query: string;
  ruling: string;
  risk_level: string;
}): Promise<FatwaLog> {
  // Test ortamı ve normal akış için fallback logic
  const localUser = localStorage.getItem('sentinel_user');
  let actorId = '00000000-0000-0000-0000-000000000000'; // Fallback
  let tenantId = '11111111-1111-1111-1111-111111111111'; // Fallback tenant
  
  if (localUser) {
    try {
      const parsedUser = JSON.parse(localUser);
      actorId = parsedUser.id || actorId;
      tenantId = parsedUser.tenant_id || tenantId;
    } catch (e) {
      console.warn('Local user parse hatası:', e);
    }
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    actorId = user?.id || actorId;
  }

  const { data, error } = await supabase
    .from('fatwa_logs')
    .insert([{
      user_id: actorId,
      tenant_id: tenantId,
      query: logData.query,
      ruling: logData.ruling,
      risk_level: logData.risk_level
    }])
    .select()
    .single();

  if (error) {
    console.error('Fetva kaydı (log) alınırken hata oluştu:', error);
    throw new Error(error.message);
  }

  return data as FatwaLog;
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

export function useAAOIFIStandards() {
  return useQuery({
    queryKey: ['shariah_rulings'],
    queryFn: fetchAAOIFIStandards,
    staleTime: 1000 * 60 * 60, // 1 Saat cache (kurallar sık değişmez)
    retry: 2,
  });
}

export function useLogFatwaQuery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logFatwaQuery,
    onSuccess: () => {
      // Başarılı loglamada mevcut kuralları invalidate etmeye gerek yok
      // Belki log geçmişi çekiliyor olsaydı onu ederdik.
      queryClient.invalidateQueries({ queryKey: ['fatwa_logs'] });
    },
  });
}
