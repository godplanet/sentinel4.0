/**
 * Zakat Ledger & Participation ESG Auditor
 * Wave 79: Zekat Defteri ve Katılım ESG Denetçisi
 *
 * FSD: features/islamic-finance/api/zakat.ts
 * Savunmacı Programlama: (data || []).map ve strict numeric guards (?? 0)
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

// ─── Types ──────────────────────────────────────────────────────────────────

export type ZakatStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Disbursing' | 'Paid';
export type FundType = 'Zakat' | 'Sadaqah' | 'Purification (Arındırma)';
export type CharityStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed';
export type PurificationStatus = 'Pending' | 'In Review' | 'Purified' | 'Waived';

export interface CorporateZakatObligation {
  id: string;
  tenant_id: string;
  fiscal_year: number;
  calculation_method: string;
  eligible_assets: number | null;
  deductible_liabilities: number | null;
  net_zakat_base: number | null;
  zakat_rate: number | null;
  calculated_zakat: number | null;
  approved_by_shariah_board: boolean | null;
  status: ZakatStatus;
  created_at: string;
  updated_at: string;
}

export interface CharityDisbursement {
  id: string;
  tenant_id: string;
  obligation_id: string | null;
  fund_type: FundType;
  beneficiary_name: string;
  disbursement_date: string;
  amount: number | null;
  transaction_ref: string | null;
  impact_category: string | null;
  status: CharityStatus;
  created_at: string;
  updated_at: string;
}

export interface NonCompliantIncome {
  id: string;
  tenant_id: string;
  income_source: string;
  detection_date: string;
  amount: number | null;
  justification: string | null;
  purification_status: PurificationStatus;
  disbursement_id: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

const TENANT_ID     = '11111111-1111-1111-1111-111111111111';
const ZAKAT_KEY     = ['corporate-zakat', TENANT_ID] as const;
const DISBURSE_KEY  = ['charity-disbursements', TENANT_ID] as const;
const NCI_KEY       = ['non-compliant-income', TENANT_ID] as const;

// ─── API Hooks ────────────────────────────────────────────────────────────────

export function useZakatLedger() {
  return useQuery({
    queryKey: ZAKAT_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('corporate_zakat_obligations')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .order('fiscal_year', { ascending: false });

      if (error) {
        console.error('[Wave79] Failed to fetch corporate_zakat_obligations:', error);
        return [] as CorporateZakatObligation[];
      }
      
      return ((data as any[]) || []).map(z => ({
        ...z,
        eligible_assets:        z?.eligible_assets        ?? 0,
        deductible_liabilities: z?.deductible_liabilities ?? 0,
        net_zakat_base:         z?.net_zakat_base         ?? 0,
        zakat_rate:             z?.zakat_rate             ?? 2.5,
        calculated_zakat:       z?.calculated_zakat       ?? 0,
        approved_by_shariah_board: z?.approved_by_shariah_board ?? false,
      })) as CorporateZakatObligation[];
    },
    staleTime: 30_000,
  });
}

export function useDisbursements() {
  return useQuery({
    queryKey: DISBURSE_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('charity_disbursements')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .order('disbursement_date', { ascending: false });

      if (error) {
        console.error('[Wave79] Failed to fetch charity_disbursements:', error);
        return [] as CharityDisbursement[];
      }
      
      return ((data as any[]) || []).map(d => ({
        ...d,
        amount: d?.amount ?? 0,
      })) as CharityDisbursement[];
    },
    staleTime: 30_000,
  });
}

export function useNonCompliantIncome() {
  return useQuery({
    queryKey: NCI_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('non_compliant_income')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .order('detection_date', { ascending: false });

      if (error) {
        console.error('[Wave79] Failed to fetch non_compliant_income:', error);
        return [] as NonCompliantIncome[];
      }
      
      return ((data as any[]) || []).map(n => ({
        ...n,
        amount: n?.amount ?? 0,
      })) as NonCompliantIncome[];
    },
    staleTime: 30_000,
  });
}
