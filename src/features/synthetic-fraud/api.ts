import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

const TENANT_ID = '11111111-1111-1111-1111-111111111111';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuditStatus = 'passed' | 'failed' | 'manual_review' | 'pending';
export type SeverityLevel = 'critical' | 'high' | 'medium';
export type ActionTaken = 'blocked' | 'flagged' | 'session_terminated';
export type KycDecision = 'approve' | 'reject' | 'review';

export interface BiometricAudit {
  id: string;
  tenant_id: string;
  channel: string;
  customer_id: string | null;
  session_id: string;
  liveliness_score: number;
  voice_match_score: number | null;
  face_match_score: number | null;
  overall_confidence: number;
  status: AuditStatus;
  analyzed_at: string;
}

export interface DeepfakeAlert {
  id: string;
  tenant_id: string;
  audit_id: string;
  alert_type: string;
  deepfake_probability: number;
  detected_artifacts: Record<string, boolean | number> | null;
  severity: SeverityLevel;
  action_taken: ActionTaken;
  description: string | null;
  created_at: string;
  
  // Joined relation:
  biometric_audits?: {
    channel: string;
    customer_id: string | null;
  };
}

export interface KycSyntheticLog {
  id: string;
  tenant_id: string;
  applicant_name: string;
  national_id: string | null;
  risk_factors: Record<string, boolean> | null;
  synthetic_risk_score: number;
  decision: KycDecision;
  created_at: string;
}

// ─── Biometric Audits ─────────────────────────────────────────────────────────

export function useBiometricAudits(status?: AuditStatus) {
  return useQuery({
    queryKey: ['biometric-audits', TENANT_ID, status],
    queryFn: async () => {
      let query = supabase
        .from('biometric_audits')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .order('analyzed_at', { ascending: false });

      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) {
        console.error('[Wave 78] Biyometrik loglar alınamadı:', error.message);
        return [] as BiometricAudit[];
      }
      
      // Müşteri talebi (Wave 78): Dizi kalkanı ZORUNLU
      return ((data as BiometricAudit[]) || []).map(row => row);
    },
    staleTime: 30_000,
  });
}

// ─── Deepfake Alerts ──────────────────────────────────────────────────────────

export function useDeepfakeAlerts() {
  return useQuery({
    queryKey: ['deepfake-alerts', TENANT_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deepfake_alerts')
        .select(`
          *,
          biometric_audits (
            channel,
            customer_id
          )
        `)
        .eq('tenant_id', TENANT_ID)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Wave 78] Deepfake uyarıları alınamadı:', error.message);
        return [] as DeepfakeAlert[];
      }
      
      // Dizi kalkanı
      return ((data as any[]) || []).map(row => row as DeepfakeAlert);
    },
    staleTime: 30_000,
  });
}

export function useUpdateAlertAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action_taken }: { id: string; action_taken: ActionTaken }) => {
      const { error } = await supabase
        .from('deepfake_alerts')
        .update({ action_taken })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deepfake-alerts'] }),
    onError: (err) => console.error('[Wave 78] Aksiyon güncellenemedi:', (err as Error)?.message),
  });
}

// ─── KYC Synthetic Identity ───────────────────────────────────────────────────

export function useKycSyntheticLogs() {
  return useQuery({
    queryKey: ['kyc-synthetic-logs', TENANT_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kyc_synthetic_logs')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Wave 78] Sentetik kimlik logları alınamadı:', error.message);
        return [] as KycSyntheticLog[];
      }

      // Dizi kalkanı ZORUNLU
      return ((data as KycSyntheticLog[]) || []).map(row => row);
    },
    staleTime: 45_000,
  });
}
