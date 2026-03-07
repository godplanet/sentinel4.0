/**
 * ORM Loss Database & Fines Tracker — Veri Katmanı
 * features/orm-losses/api.ts  (Wave 56)
 *
 * Çökme Kalkanları:
 *   (loss_amount || 0)     → NaN/null guard
 *   (total_events || 1)    → sıfıra bölünme koruması
 *   (losses || []).map(...)
 *   42P01 → graceful boş dizi
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import toast from 'react-hot-toast';

// ─── Tipler ──────────────────────────────────────────────────────────────────

export type LossEventType =
  | 'INTERNAL_FRAUD' | 'EXTERNAL_FRAUD' | 'EMPLOYMENT_PRACTICES'
  | 'CLIENTS_PRODUCTS' | 'DAMAGE_TO_ASSETS' | 'BUSINESS_DISRUPTION'
  | 'EXECUTION_DELIVERY' | 'REGULATORY_NON_COMPLIANCE';

export type LossStatus = 'OPEN' | 'UNDER_REVIEW' | 'PROVISIONED' | 'CLOSED' | 'LITIGATED';
export type FineStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'CONTESTED' | 'WAIVED';

export interface OperationalLoss {
  id: string;
  event_code: string;
  event_date: string;
  discovery_date: string | null;
  event_type: LossEventType;
  risk_category: string;
  business_line: string;
  department: string;
  description: string;
  gross_loss: number;
  recovery_amount: number;
  insurance_recovery: number;
  net_loss: number;    // GENERATED kolonu
  status: LossStatus;
  provisioning_pct: number;
  root_cause: string | null;
  control_failure: string | null;
  corrective_action: string | null;
  responsible_dept: string | null;
  bddk_reportable: boolean;
  reported_to_bddk: boolean;
  report_deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegulatoryFine {
  id: string;
  fine_code: string;
  related_loss_id: string | null;
  regulator: string;
  penalty_type: string;
  subject: string;
  legal_basis: string | null;
  fine_amount: number;
  currency: string;
  imposed_date: string;
  payment_deadline: string | null;
  paid_date: string | null;
  paid_amount: number | null;
  status: FineStatus;
  is_appealed: boolean;
  appeal_status: string | null;
  notes: string | null;
  created_at: string;
}

export interface OrmKPI {
  totalLosses: number;
  totalGrossLoss: number;
  totalNetLoss: number;
  totalRecovery: number;
  avgLossPerEvent: number;
  openCount: number;
  bddkPendingCount: number;
  unpaidFines: number;
  unpaidFinesTotal: number;
}

// ─── Hook: useOperationalLosses ───────────────────────────────────────────────

export function useOperationalLosses(filters?: {
  eventType?: LossEventType;
  status?: LossStatus;
  bddkOnly?: boolean;
}) {
  return useQuery<OperationalLoss[]>({
    queryKey: ['operational-losses', filters],
    queryFn: async () => {
      let q = supabase
        .from('operational_losses')
        .select('*')
        .order('event_date', { ascending: false });

      if (filters?.eventType) q = q.eq('event_type', filters.eventType);
      if (filters?.status)    q = q.eq('status', filters.status);
      if (filters?.bddkOnly)  q = q.eq('bddk_reportable', true);

      const { data, error } = await q;
      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }
      // (losses || []).map kalkanı + sayısal alan koruması
      return (data || []).map((r: any): OperationalLoss => ({
        ...r,
        gross_loss:          Number(r.gross_loss ?? 0),
        recovery_amount:     Number(r.recovery_amount ?? 0),
        insurance_recovery:  Number(r.insurance_recovery ?? 0),
        net_loss:            Number(r.net_loss ?? 0),
        provisioning_pct:    Number(r.provisioning_pct ?? 0),
      }));
    },
    staleTime: 1000 * 60 * 2,
  });
}

// ─── Hook: useRegulatoryFines ─────────────────────────────────────────────────

export function useRegulatoryFines(status?: FineStatus) {
  return useQuery<RegulatoryFine[]>({
    queryKey: ['regulatory-fines', status],
    queryFn: async () => {
      let q = supabase
        .from('regulatory_fines')
        .select('*')
        .order('imposed_date', { ascending: false });

      if (status) q = q.eq('status', status);

      const { data, error } = await q;
      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }
      return (data || []).map((r: any): RegulatoryFine => ({
        ...r,
        fine_amount: Number(r.fine_amount ?? 0),
        paid_amount: Number(r.paid_amount ?? 0),
      }));
    },
    staleTime: 1000 * 60 * 2,
  });
}

// ─── Hook: useOrmKPI ──────────────────────────────────────────────────────────

export function useOrmKPI() {
  return useQuery<OrmKPI>({
    queryKey: ['orm-kpi'],
    queryFn: async () => {
      const [lossRes, fineRes] = await Promise.all([
        supabase.from('operational_losses').select('gross_loss, net_loss, recovery_amount, status, bddk_reportable, reported_to_bddk'),
        supabase.from('regulatory_fines').select('fine_amount, status'),
      ]);

      if (lossRes.error?.code === '42P01' || fineRes.error?.code === '42P01') {
        return { totalLosses: 0, totalGrossLoss: 0, totalNetLoss: 0, totalRecovery: 0, avgLossPerEvent: 0, openCount: 0, bddkPendingCount: 0, unpaidFines: 0, unpaidFinesTotal: 0 };
      }
      if (lossRes.error) throw lossRes.error;
      if (fineRes.error) throw fineRes.error;

      const losses = lossRes.data || [];
      const fines  = fineRes.data || [];

      const totalLosses    = losses.length;
      // (loss_amount || 0) kalkanı her reduce adımında
      const totalGrossLoss = losses.reduce((s, r: any) => s + (Number(r?.gross_loss) || 0), 0);
      const totalNetLoss   = losses.reduce((s, r: any) => s + (Number(r?.net_loss) || 0), 0);
      const totalRecovery  = losses.reduce((s, r: any) => s + (Number(r?.recovery_amount) || 0), 0);
      // Sıfıra bölünme: (total_events || 1)
      const avgLossPerEvent = Math.round(totalGrossLoss / (totalLosses || 1));
      const openCount       = losses.filter((r: any) => r?.status !== 'CLOSED').length;
      const bddkPendingCount = losses.filter((r: any) => r?.bddk_reportable && !r?.reported_to_bddk).length;

      const unpaidFines      = fines.filter((f: any) => f?.status === 'UNPAID' || f?.status === 'PARTIAL').length;
      const unpaidFinesTotal = fines
        .filter((f: any) => f?.status === 'UNPAID' || f?.status === 'PARTIAL')
        .reduce((s, f: any) => s + (Number(f?.fine_amount) || 0), 0);

      return { totalLosses, totalGrossLoss, totalNetLoss, totalRecovery, avgLossPerEvent, openCount, bddkPendingCount, unpaidFines, unpaidFinesTotal };
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Hook: useUpdateLossStatus ────────────────────────────────────────────────

export function useUpdateLossStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LossStatus }) => {
      const { error } = await supabase
        .from('operational_losses')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['operational-losses'] });
      void qc.invalidateQueries({ queryKey: ['orm-kpi'] });
      toast.success('Kayıp olayı durumu güncellendi.');
    },
    onError: (err: Error) => toast.error(`Güncelleme başarısız: ${err.message}`),
  });
}

// ─── Hook: useMarkFinePaid ───────────────────────────────────────────────────

export function useMarkFinePaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, paid_amount }: { id: string; paid_amount: number }) => {
      const { error } = await supabase
        .from('regulatory_fines')
        .update({
          status: 'PAID',
          paid_amount,
          paid_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['regulatory-fines'] });
      void qc.invalidateQueries({ queryKey: ['orm-kpi'] });
      toast.success('Ceza ödemesi kaydedildi.');
    },
    onError: (err: Error) => toast.error(`Kayıt başarısız: ${err.message}`),
  });
}

// ─── Yardımcı: Para Formatlama ─────────────────────────────────────────────────

export function formatTRY(amount: number | null | undefined): string {
  // (amount || 0) koruması
  return (amount || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });
}
