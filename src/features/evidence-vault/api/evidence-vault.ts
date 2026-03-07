import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

const TENANT_ID = '11111111-1111-1111-1111-111111111111';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BlockchainTxLog {
  id: string;
  tenant_id: string;
  evidence_id: string;
  action: string;
  tx_status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  block_number: number | null;
  gas_used: number | null;
  executed_by: string;
  occurred_at: string;
}

export interface ImmutableEvidence {
  id: string;
  tenant_id: string;
  evidence_name: string;
  category: string;
  uploader_email: string;
  file_size_bytes: number;
  file_mime_type: string;
  original_hash: string;
  ipfs_cid: string | null;
  blockchain_network: string;
  tx_hash: string | null;
  is_verified: boolean;
  sealed_at: string;
  created_at: string;
  
  // Joined tx logs
  blockchain_tx_logs?: BlockchainTxLog[];
}

// ─── API Hooks ────────────────────────────────────────────────────────────────

export function useEvidences() {
  return useQuery({
    queryKey: ['immutable-evidences', TENANT_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('immutable_evidences')
        .select(`
          *,
          blockchain_tx_logs (*)
        `)
        .eq('tenant_id', TENANT_ID)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Wave 82] Adli kanıtlar alınamadı:', error.message);
        return [] as ImmutableEvidence[];
      }
      
      // Wave 82: Boş dizi kalkanı KESİNLİKLE uygulandı
      return ((data as any[]) || []).map(row => row as ImmutableEvidence);
    },
    staleTime: 30_000,
  });
}

export function useVerifyHash() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_verified }: { id: string; is_verified: boolean }) => {
      // 1. Durumu güncelle
      const { error: updErr } = await supabase
        .from('immutable_evidences')
        .update({ is_verified })
        .eq('id', id);
        
      if (updErr) throw updErr;

      // 2. Blockchain Tx Log kaydı at (Simüle)
      const { error: logErr } = await supabase
        .from('blockchain_tx_logs')
        .insert({
          tenant_id: TENANT_ID,
          evidence_id: id,
          action: 'VERIFY_HASH',
          tx_status: 'CONFIRMED',
          block_number: 15500999,
          executed_by: 'Auditor_Session_Val'
        });

      if (logErr) throw logErr;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['immutable-evidences'] }),
    onError: (err) => console.error('[Wave 82] Hash doğrulama başarısız:', (err as Error)?.message),
  });
}
