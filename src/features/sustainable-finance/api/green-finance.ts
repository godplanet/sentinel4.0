/**
 * Greenwashing Detector & Sustainable Finance — Veri Katmanı
 * features/sustainable-finance/api/green-finance.ts  (Wave 59)
 *
 * Çökme Kalkanları:
 *   (bonds || []).map(...)      → boş dizi kalkanı
 *   (total_fund || 1)           → sıfıra bölünme koruması
 *   42P01 → graceful boş dizi/null
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import toast from 'react-hot-toast';

// ─── Tipler ──────────────────────────────────────────────────────────────────

export interface GreenBond {
  id: string;
  instrument_code: string;
  project_name: string;
  borrower_name: string;
  sector: 'RENEWABLE_ENERGY' | 'CLEAN_TRANSPORT' | 'GREEN_BUILDINGS' | 'SUSTAINABLE_WATER' | 'CIRCULAR_ECONOMY' | 'POLLUTION_PREVENTION';
  amount_issued: number;
  currency: string;
  issue_date: string;
  maturity_date: string;
  interest_rate: number;
  esg_premium_bps: number;
  kpi_target: string | null;
  spo_provider: string | null;
  spo_status: 'PENDING' | 'ALIGNMENT_CONFIRMED' | 'DEVIATION_DETECTED' | 'WITHDRAWN';
}

export interface EsgFundAudit {
  id: string;
  bond_id: string;
  bond_code: string;
  audit_date: string;
  auditor_name: string;
  total_fund: number;
  allocated_to_green: number;
  deviated_amount: number;
  deviation_reason: string | null;
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  kpi_status: 'ON_TRACK' | 'DELAYED' | 'MISSED' | 'DATA_UNAVAILABLE';
  carbon_footprint_ton: number | null;
  findings: string;
  requires_action: boolean;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ESCALATED';
}

export interface GreenFinanceKPI {
  totalIssued: number;
  totalBonds: number;
  avgPremiumBps: number;
  totalDeviated: number;
  criticalAudits: number;
}

// ─── Yardımcı Fonksiyonlar ────────────────────────────────────────────────────

export function formatTRY(amount: number | null | undefined): string {
  return (amount || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });
}

export function formatUSD(amount: number | null | undefined): string {
  return (amount || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

// ─── Hook: useGreenBonds ──────────────────────────────────────────────────────

export function useGreenBonds(filters?: { sector?: string; spoStatus?: string }) {
  return useQuery<GreenBond[]>({
    queryKey: ['green-bonds', filters],
    queryFn: async () => {
      let q = supabase
        .from('green_bonds')
        .select('*')
        .order('issue_date', { ascending: false });

      if (filters?.sector) q = q.eq('sector', filters.sector);
      if (filters?.spoStatus) q = q.eq('spo_status', filters.spoStatus);

      const { data, error } = await q;
      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }

      // (bonds || []).map kalkanı ve tip güvenliği
      return (data || []).map((b: any) => ({
        ...b,
        amount_issued: Number(b.amount_issued || 0),
        interest_rate: Number(b.interest_rate || 0),
        esg_premium_bps: Number(b.esg_premium_bps || 0),
      })) as GreenBond[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Hook: useFundAudits ──────────────────────────────────────────────────────

export function useFundAudits(bondId?: string | null) {
  return useQuery<EsgFundAudit[]>({
    queryKey: ['esg-audits', bondId],
    queryFn: async () => {
      let q = supabase
        .from('esg_fund_audits')
        .select('*')
        .order('audit_date', { ascending: false });

      if (bondId) q = q.eq('bond_id', bondId);

      const { data, error } = await q;
      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }

      return (data || []).map((a: any) => ({
        ...a,
        total_fund: Number(a.total_fund || 0),
        allocated_to_green: Number(a.allocated_to_green || 0),
        deviated_amount: Number(a.deviated_amount || 0),
        carbon_footprint_ton: a.carbon_footprint_ton ? Number(a.carbon_footprint_ton) : null,
      })) as EsgFundAudit[];
    },
    staleTime: 1000 * 60 * 2,
  });
}

// ─── Hook: useGreenFinanceKPI ─────────────────────────────────────────────────

export function useGreenFinanceKPI() {
  return useQuery<GreenFinanceKPI>({
    queryKey: ['green-finance-kpi'],
    queryFn: async () => {
      const [bondRes, auditRes] = await Promise.all([
        supabase.from('green_bonds').select('amount_issued, esg_premium_bps'),
        supabase.from('esg_fund_audits').select('deviated_amount, risk_level'),
      ]);

      if (bondRes.error?.code === '42P01' || auditRes.error?.code === '42P01') {
        return { totalIssued: 0, totalBonds: 0, avgPremiumBps: 0, totalDeviated: 0, criticalAudits: 0 };
      }

      const bonds = bondRes.data || [];
      const audits = auditRes.data || [];

      const totalIssued = bonds.reduce((s, b: any) => s + Number(b.amount_issued || 0), 0);
      const totalPremium = bonds.reduce((s, b: any) => s + Number(b.esg_premium_bps || 0), 0);
      const avgPremiumBps = Math.round(totalPremium / (bonds.length || 1)); // Sıfıra bölünme koruması

      const totalDeviated = audits.reduce((s, a: any) => s + Number(a.deviated_amount || 0), 0);
      const criticalAudits = audits.filter((a: any) => a.risk_level === 'CRITICAL' || a.risk_level === 'HIGH').length;

      return {
        totalIssued,
        totalBonds: bonds.length,
        avgPremiumBps,
        totalDeviated,
        criticalAudits,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Hook: useUpdateAuditStatus ───────────────────────────────────────────────

export function useUpdateAuditStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, requires_action }: { id: string; status: EsgFundAudit['status'], requires_action?: boolean }) => {
      const payload: any = { status, updated_at: new Date().toISOString() };
      if (requires_action !== undefined) {
        payload.requires_action = requires_action;
      }
      const { error } = await supabase
        .from('esg_fund_audits')
        .update(payload)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['esg-audits'] });
      void qc.invalidateQueries({ queryKey: ['green-finance-kpi'] });
      toast.success('Denetim durumu güncellendi.');
    },
    onError: (err: Error) => toast.error(`Güncelleme başarısız: ${err.message}`),
  });
}
